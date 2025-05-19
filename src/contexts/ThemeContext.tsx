'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themePreference: 'system',
  toggleTheme: () => {},
  setThemePreference: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  // Get system preference safely (works on server and client)
  const getSystemTheme = useCallback((): Theme => {
    // Default to light theme during SSR or if window is not available
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      console.error('Error detecting system theme:', e);
      return 'light';
    }
  }, []);

  // Apply theme to document and update state
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const isDark = newTheme === 'dark';
    
    // Update class on html element
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
    }
    
    setTheme(newTheme);
  }, []);
  
  // Get the current theme based on preference
  const getCurrentTheme = useCallback((pref: ThemePreference): Theme => {
    return pref === 'system' ? getSystemTheme() : pref;
  }, [getSystemTheme]);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Get stored preference from localStorage
    const getStoredPreference = (): ThemePreference => {
      try {
        if (typeof localStorage === 'undefined') return 'system';
        const stored = localStorage.getItem('themePreference');
        return (stored === 'light' || stored === 'dark' || stored === 'system') 
          ? stored 
          : 'system';
      } catch (e) {
        console.error('Error reading theme preference from localStorage:', e);
        return 'system';
      }
    };
    
    const preference = getStoredPreference();
    setThemePreferenceState(preference);
    
    // Apply initial theme
    const currentTheme = getCurrentTheme(preference);
    applyTheme(currentTheme);
    
    // Set up system preference listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (themePreference === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        applyTheme(newTheme);
      }
    };
    
    // Add event listener for system theme changes
    const supportsAddListener = typeof mediaQuery.addEventListener === 'function';
    const supportsAddListenerLegacy = typeof mediaQuery.addListener === 'function';
    
    if (supportsAddListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (supportsAddListenerLegacy) {
      mediaQuery.addListener(handleSystemThemeChange);
    }
    
    // Initial check in case the system theme changed while the app was closed
    if (preference === 'system') {
      handleSystemThemeChange(mediaQuery);
    }
    
    // Cleanup function
    return () => {
      if (supportsAddListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange as EventListener);
      } else if (supportsAddListenerLegacy) {
        mediaQuery.removeListener(handleSystemThemeChange as () => void);
      }
    };
  }, [applyTheme, getCurrentTheme, themePreference]);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    try {
      // Save preference to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('themePreference', preference);
      }
      
      // Update state
      setThemePreferenceState(preference);
      
      // Immediately apply the new theme
      const newTheme = preference === 'system' ? getSystemTheme() : preference;
      applyTheme(newTheme);
      
      // Update document for better browser/device integration
      if (typeof document !== 'undefined') {
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]') || 
          document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0f172a' : '#ffffff');
        
        if (!document.head.contains(metaThemeColor)) {
          document.head.appendChild(metaThemeColor);
        }
        
        // Update color-scheme CSS property
        document.documentElement.style.colorScheme = newTheme === 'dark' ? 'dark' : 'light';
      }
    } catch (e) {
      console.error('Error setting theme preference:', e);
    }
  }, [applyTheme, getSystemTheme]);

  const toggleTheme = useCallback(() => {
    setThemePreference(theme === 'light' ? 'dark' : 'light');
  }, [theme, setThemePreference]);

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themePreference,
      toggleTheme, 
      setThemePreference 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
