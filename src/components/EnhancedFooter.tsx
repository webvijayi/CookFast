'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

// Logo Component
const WebVijayiLogo = () => (
  <div className="flex items-center">
    <Image 
      src="/favicon-32x32.png" 
      alt="CookFast Logo" 
      width={40} 
      height={40} 
      className="h-10 w-10" 
    />
  </div>
);

// GitHub Icon
const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

// Social Media Icons
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
  </svg>
);

// Document Icons for Animation
const DocumentIcon = ({ className = "", rotate = 0 }: { className?: string, rotate?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={`h-6 w-6 ${className}`} 
    style={{ transform: `rotate(${rotate}deg)` }}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Custom link component with hover effect
const FooterLink = ({ 
  href, 
  children, 
  icon 
}: { 
  href: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode 
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
  >
    {icon && (
      <span className="mr-2 text-gray-400 group-hover:text-indigo-500 dark:text-gray-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
        {icon}
      </span>
    )}
    <span className="border-b border-transparent group-hover:border-indigo-500 dark:group-hover:border-indigo-400 transition-all duration-200">
      {children}
    </span>
  </a>
);

export default function EnhancedFooter() {
  // We need the theme context for dark mode, but don't need to use the variable directly
  useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative overflow-hidden pt-12 pb-8 border-t border-gray-200 dark:border-gray-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
        <DocumentIcon className="absolute text-indigo-200 dark:text-indigo-800 opacity-20 w-32 h-32 top-0 left-10" rotate={-15} />
        <DocumentIcon className="absolute text-purple-200 dark:text-purple-800 opacity-30 w-24 h-24 bottom-0 right-20" rotate={10} />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 dark:from-indigo-700 dark:to-purple-700 opacity-30 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 w-60 h-60 rounded-full bg-gradient-to-tl from-indigo-300 to-purple-300 dark:from-indigo-800 dark:to-purple-800 opacity-20 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <WebVijayiLogo />
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Web Vijayi</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Web Solutions</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              CookFast is an open-source tool for generating comprehensive project planning documents powered by AI. Generate requirements, architecture, and more instantly.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/webvijayi/CookFast" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </a>
              <a 
                href="https://twitter.com/webvijayi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </a>
            </div>
          </div>
          
          {/* Links Section */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <FooterLink href="https://github.com/webvijayi/CookFast" icon={<GitHubIcon />}>
                  GitHub Repository
                </FooterLink>
              </li>
              <li>
                <FooterLink href="https://github.com/webvijayi/CookFast/issues" icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }>
                  Report an Issue
                </FooterLink>
              </li>
              <li>
                <FooterLink href="https://github.com/webvijayi/CookFast/blob/main/README.md" icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }>
                  Documentation
                </FooterLink>
              </li>
            </ul>
          </div>
          
          {/* Support Section */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support Us</h3>
            <div className="mb-4">
              <a 
                href="https://buymeacoffee.com/lokeshmotwani" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-md bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-gray-800 font-medium transition-colors"
              >
                <Image 
                  src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" 
                  alt="Buy me a coffee" 
                  width={16}
                  height={16}
                  className="h-4 w-4 mr-2"
                />
                Buy me a coffee
              </a>
            </div>
            <ul className="space-y-2">
              <li>
                <FooterLink href="https://github.com/webvijayi/CookFast/stargazers" icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }>
                  Star on GitHub
                </FooterLink>
              </li>
              <li>
                <FooterLink href="https://github.com/webvijayi/CookFast/fork" icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                }>
                  Fork Repository
                </FooterLink>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {currentYear} <a 
                href="https://webvijayi.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity font-semibold"
              >
                Web Vijayi
              </a>. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4 text-sm text-gray-500 dark:text-gray-400 items-center">
              <a href="https://github.com/webvijayi/CookFast/blob/main/LICENSE" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">License</a>
              <span>•</span>
              <a href="https://webvijayi.com/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</a>
              <span>•</span>
              <a href="https://webvijayi.com/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</a>
              <span>•</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 