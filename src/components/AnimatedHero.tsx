'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";

// Animated hero section with sensible document-project type combinations
export default function AnimatedHero() {
  // Project types with emojis for the animation
  const projectTypes = [
    { 
      id: 'web-app',
      name: 'Web Applications', 
      emoji: '🌐', 
      color: 'text-blue-600' 
    },
    { 
      id: 'website',
      name: 'Websites', 
      emoji: '🖥️', 
      color: 'text-purple-600' 
    },
    { 
      id: 'mobile',
      name: 'Mobile Apps', 
      emoji: '📱', 
      color: 'text-green-600' 
    },
    { 
      id: 'api',
      name: 'API Services', 
      emoji: '🔌', 
      color: 'text-amber-600' 
    },
    { 
      id: 'library',
      name: 'Libraries & Packages', 
      emoji: '📦', 
      color: 'text-indigo-600' 
    },
    { 
      id: 'desktop',
      name: 'Desktop Applications', 
      emoji: '💻', 
      color: 'text-rose-600' 
    },
  ];

  // Document types with project type compatibility
  const documentTypes = [
    { 
      name: 'Requirements Documents', 
      emoji: '📝', 
      color: 'text-blue-500',
      compatibleWith: ['web-app', 'website', 'mobile', 'api', 'library', 'desktop'] // All
    },
    { 
      name: 'Frontend Guidelines', 
      emoji: '🎨', 
      color: 'text-purple-500',
      compatibleWith: ['web-app', 'website', 'mobile', 'desktop'] // UI-focused projects
    },
    { 
      name: 'Backend Architecture', 
      emoji: '⚙️', 
      color: 'text-green-500',
      compatibleWith: ['web-app', 'api', 'library', 'desktop'] // Backend-focused projects
    },
    { 
      name: 'Application Flow', 
      emoji: '🔄', 
      color: 'text-amber-500',
      compatibleWith: ['web-app', 'mobile', 'desktop'] // Full applications
    },
    { 
      name: 'Tech Stack Overview', 
      emoji: '💻', 
      color: 'text-indigo-500',
      compatibleWith: ['web-app', 'website', 'mobile', 'api', 'library', 'desktop'] // All
    },
    { 
      name: 'API Documentation', 
      emoji: '🤖', 
      color: 'text-rose-500',
      compatibleWith: ['web-app', 'api', 'library'] // API-related projects
    },
    { 
      name: 'File Structure', 
      emoji: '📁', 
      color: 'text-teal-500',
      compatibleWith: ['web-app', 'website', 'mobile', 'api', 'library', 'desktop'] // All
    },
    { 
      name: 'User Interface Design', 
      emoji: '🎯', 
      color: 'text-pink-500',
      compatibleWith: ['web-app', 'website', 'mobile', 'desktop'] // UI-focused projects  
    },
    { 
      name: 'Deployment Guide', 
      emoji: '🚀', 
      color: 'text-orange-500',
      compatibleWith: ['web-app', 'website', 'api', 'desktop'] // Deployable projects
    },
  ];

  // Create valid combinations based on compatibility
  const combinations: Array<{
    projectId: string;
    projectName: string;
    projectEmoji: string;
    projectColor: string;
    docName: string;
    docEmoji: string;
    docColor: string;
  }> = [];
  
  projectTypes.forEach(project => {
    const compatibleDocs = documentTypes.filter(doc => 
      doc.compatibleWith.includes(project.id)
    );
    
    compatibleDocs.forEach(doc => {
      combinations.push({
        projectId: project.id,
        projectName: project.name,
        projectEmoji: project.emoji,
        projectColor: project.color,
        docName: doc.name,
        docEmoji: doc.emoji,
        docColor: doc.color
      });
    });
  });

  // State variables for animation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [animationClass, setAnimationClass] = useState('fade-in-up');
  const [particles, setParticles] = useState<Array<{
    top: number;
    left: number;
    width: number;
    height: number;
    duration: number;
    delay: number;
  }>>([]);

  // Animation effect to cycle through combinations
  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out animation
      setAnimationClass('fade-out-down');
      setIsVisible(false);
      
      setTimeout(() => {
        // Change to next valid combination
        setCurrentIndex((prevIndex) => (prevIndex + 1) % combinations.length);
        
        // Prepare for fade in animation
        setAnimationClass('fade-in-up');
        setIsVisible(true);
      }, 500);
    }, 2500); // Slightly faster animation for better flow

    return () => clearInterval(interval);
  }, [combinations.length]);

  // Generate particles on client-side only
  useEffect(() => {
    const newParticles = Array(20).fill(null).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // Get current combination
  const currentCombination = combinations[currentIndex];

  return (
    <div className="relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/15 to-purple-500/10 rounded-3xl filter blur-3xl opacity-80 dark:from-indigo-900/30 dark:to-purple-900/20 -z-10"></div>
      
      <div className="text-center py-20 sm:py-28 px-4 relative overflow-hidden">
        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, i) => (
            <div 
              key={i}
              className="absolute rounded-full opacity-40 bg-gradient-to-r from-indigo-400 to-purple-500"
              style={{
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                animation: `floating ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <div className="flex justify-center items-center mb-4">
            <span className="text-7xl bounce">🍳</span>
            <span className="text-7xl ml-2 wiggle">🚀</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            CookFast
          </h1>
          
          <div className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto text-gray-700 dark:text-gray-300 flex flex-col justify-center items-center">
            <span className="mb-4">Quickly generate comprehensive AI-powered project planning documents</span>
            
            {/* Animated document-project combinations with improved mobile styling */}
            <div className="w-full flex items-center justify-center h-auto min-h-[100px] sm:min-h-[50px] min-w-[280px] px-1 relative my-3">
              <div 
                className={`flex items-center justify-center w-full ${
                  isVisible ? 'block' : 'hidden'
                } ${animationClass}`}
                aria-hidden={!isVisible}
              >
                {/* Responsive layout - stacks on mobile with improved spacing */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 text-center">
                  {/* Document type - always show full name with larger font */}
                  <div className={`flex items-center justify-center font-semibold text-xl sm:text-xl ${currentCombination.docColor}`}>
                    <span className="mr-2 text-2xl">{currentCombination.docEmoji}</span>
                    <span>{currentCombination.docName}</span>
                  </div>
                  
                  {/* For word - now in italics */}
                  <div className="text-gray-500 dark:text-gray-400 text-lg sm:text-lg font-normal my-1 italic">
                    for
                  </div>
                  
                  {/* Project type - with larger font */}
                  <div className={`flex items-center justify-center font-semibold text-xl sm:text-xl ${currentCombination.projectColor}`}>
                    <span className="mr-2 text-2xl">{currentCombination.projectEmoji}</span>
                    <span>{currentCombination.projectName}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <span className="w-full text-center block mt-2">in minutes!</span>
          </div>
          
          <div className="mt-10 flex flex-wrap gap-4 sm:gap-6 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium tracking-wide px-8 py-6 sm:py-5 rounded-full shadow-lg hover:shadow-indigo-500/25 transform hover:scale-105 transition-all text-lg"
              asChild
            >
              <a href="#generate">Get Started</a>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-medium tracking-wide px-8 py-6 sm:py-5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transform hover:scale-105 transition-all flex items-center text-lg"
              asChild
            >
              <a 
                href="https://github.com/webvijayi/cookfast" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                </svg>
                Star on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 