'use client';

import React, { useState } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
  delay?: number;
}

export default function FeatureCard({ 
  title, 
  description, 
  icon, 
  gradient = "from-blue-500 to-indigo-500",
  delay = 0 
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="card-shine relative overflow-hidden rounded-xl transition-all duration-300"
      style={{ 
        animationDelay: `${delay}ms`,
        transform: `translateY(${delay / 35}px)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        h-full p-6 bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700
        hover:shadow-xl transition-all duration-300 rounded-xl relative z-10
        ${isHovered ? 'translate-y-[-5px]' : ''}
      `}>
        {/* Animated gradient background on hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 rounded-xl -z-10
          ${isHovered ? 'opacity-10 dark:opacity-20' : ''}
        `}></div>
        
        {/* Icon with gradient background */}
        <div className={`
          w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white
          bg-gradient-to-br ${gradient}
        `}>
          {icon}
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
      </div>
    </div>
  );
}

// For convenience, we also export a features grid component
export function FeaturesGrid() {
  const features = [
    {
      title: "Multiple AI Providers",
      description: "Choose between Google Gemini, OpenAI, and Anthropic AI models for your documentation generation.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      gradient: "from-blue-500 to-violet-500"
    },
    {
      title: "Flexible Document Types",
      description: "Generate requirements, guidelines, structures, flows, and more based on your specific project needs.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Markdown & JSON Export",
      description: "Download your generated documentation as Markdown or as structured JSON for AI IDE integration.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Mermaid Diagrams",
      description: "Automatically generate sequence and flow diagrams to visualize your project architecture.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      gradient: "from-pink-500 to-rose-500"
    },
    {
      title: "Secure Key Handling",
      description: "Your API keys are never stored and are used solely for the generation request.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      title: "Dark Mode Support",
      description: "Enjoy a comfortable experience with both light and dark themes supported.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-500"
    },
  ];

  return (
    <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animated-gradient">
          Packed with Powerful Features
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          Everything you need to quickly generate comprehensive documentation for your projects
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            gradient={feature.gradient}
            delay={index * 100}
          />
        ))}
      </div>
    </div>
  );
} 