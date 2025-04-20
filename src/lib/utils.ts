import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add these scroll utilities
export function scrollIntoView(element: HTMLElement, container?: HTMLElement, options: ScrollIntoViewOptions = { behavior: 'smooth' }) {
  if (!element) return;
  
  if (container) {
    // If container is provided, scroll within that container
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate if element is outside the visible area of the container
    const isAbove = elementRect.top < containerRect.top;
    const isBelow = elementRect.bottom > containerRect.bottom;
    
    if (isAbove) {
      container.scrollBy({ 
        top: elementRect.top - containerRect.top, 
        behavior: options.behavior || 'smooth' 
      });
    } else if (isBelow) {
      container.scrollBy({ 
        top: elementRect.bottom - containerRect.bottom, 
        behavior: options.behavior || 'smooth' 
      });
    }
  } else {
    // Default browser scrollIntoView if no container specified
    element.scrollIntoView(options);
  }
}

// Add utility function to handle scrollable tabs
export function getScrollableTabsProps(scrollableRef: React.RefObject<HTMLElement>) {
  return {
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!scrollableRef.current) return;
      
      // Handle left/right arrow keys for horizontal navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const direction = e.key === 'ArrowLeft' ? -1 : 1;
        scrollableRef.current.scrollBy({
          left: direction * 100,
          behavior: 'smooth'
        });
      }
    },
    // Add appropriate ARIA attributes for accessibility
    role: "tablist",
    "aria-orientation": "horizontal",
  };
}
