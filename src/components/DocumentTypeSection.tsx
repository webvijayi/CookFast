'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from 'framer-motion';

// Document types with detailed descriptions
const documentTypes = [
  {
    id: 'requirements',
    name: 'Requirements Document',
    icon: '📝',
    description: 'A comprehensive outline of project specifications, user stories, and functional requirements that clearly defines what the project needs to accomplish.',
    benefits: ['Clarifies project scope', 'Defines success criteria', 'Prevents scope creep', 'Aligns stakeholders'],
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'frontendGuidelines',
    name: 'Frontend Guidelines',
    icon: '🎨',
    description: 'Design standards, component structure, and UI/UX best practices to ensure consistency and maintainability across the frontend.',
    benefits: ['Consistent UI patterns', 'Developer onboarding guide', 'Component reusability', 'Design system foundation'],
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'backendStructure',
    name: 'Backend Architecture',
    icon: '⚙️',
    description: 'Detailed architecture overview of APIs, services, data models, and system design to guide backend implementation.',
    benefits: ['Scalable architecture', 'Clear API contracts', 'Data flow mapping', 'Security considerations'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'appFlow',
    name: 'Application Flow',
    icon: '🔄',
    description: 'Sequence diagrams and flowcharts showing the interaction between components, services, and user journeys throughout the application.',
    benefits: ['Visual process mapping', 'Sequence clarification', 'Edge case identification', 'Developer alignment'],
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'techStackDoc',
    name: 'Tech Stack Overview',
    icon: '💻',
    description: 'Comprehensive documentation of technologies, frameworks, libraries, and tools with justifications for their selection.',
    benefits: ['Technology rationale', 'Version compatibility', 'Integration guidance', 'Learning resources'],
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'systemPrompts',
    name: 'System Prompts',
    icon: '🤖',
    description: 'AI system prompts for interactive components, chatbots, or generative features within the application.',
    benefits: ['AI response consistency', 'Prompt engineering', 'Context management', 'Edge case handling'],
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'fileStructure',
    name: 'File Structure',
    icon: '📁',
    description: 'Recommended project folder organization with rationale for the architecture to ensure maintainability and scalability.',
    benefits: ['Organized codebase', 'Module boundaries', 'Import patterns', 'Separation of concerns'],
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'prdDocs',
    name: 'PRD Documentation',
    icon: '🔍',
    description: 'Comprehensive Product Requirements Documents with detailed user journeys, market analysis, and product strategy.',
    benefits: ['Product vision alignment', 'Feature prioritization', 'Market fit validation', 'UX research insights'],
    color: 'from-violet-500 to-purple-500',
    comingSoon: true
  }
];

// Project types with emojis and examples
const projectTypes = [
  { 
    id: 'web-app',
    name: 'Web Applications', 
    emoji: '🌐', 
    color: 'text-blue-600',
    examples: ['SaaS platforms', 'Admin dashboards', 'Web-based tools']
  },
  { 
    id: 'website',
    name: 'Websites', 
    emoji: '🖥️', 
    color: 'text-purple-600',
    examples: ['Corporate sites', 'Blogs', 'Landing pages']
  },
  { 
    id: 'mobile',
    name: 'Mobile Apps', 
    emoji: '📱', 
    color: 'text-green-600',
    examples: ['iOS applications', 'Android applications', 'Cross-platform apps']
  },
  { 
    id: 'api',
    name: 'API Services', 
    emoji: '🔌', 
    color: 'text-amber-600',
    examples: ['REST APIs', 'GraphQL services', 'Microservices']
  },
  { 
    id: 'library',
    name: 'Libraries & Packages', 
    emoji: '📦', 
    color: 'text-indigo-600',
    examples: ['UI component libraries', 'Utility packages', 'SDKs']
  },
  { 
    id: 'desktop',
    name: 'Desktop Applications', 
    emoji: '💻', 
    color: 'text-rose-600',
    examples: ['Electron apps', 'Native applications', 'Cross-platform desktop tools']
  },
];

// Compatibility matrix between document types and project types
const compatibilityMatrix = {
  'requirements': ['web-app', 'website', 'mobile', 'api', 'library', 'desktop'],
  'frontendGuidelines': ['web-app', 'website', 'mobile', 'desktop'],
  'backendStructure': ['web-app', 'api', 'library', 'desktop'],
  'appFlow': ['web-app', 'mobile', 'api', 'desktop'],
  'techStackDoc': ['web-app', 'website', 'mobile', 'api', 'library', 'desktop'],
  'systemPrompts': ['web-app', 'mobile', 'api'],
  'fileStructure': ['web-app', 'website', 'mobile', 'api', 'library', 'desktop'],
  'prdDocs': ['web-app', 'website', 'mobile', 'api', 'desktop']
};

const DocumentTypeSection = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [activeDocId, setActiveDocId] = useState(documentTypes[0].id);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Calculate which project types are compatible with the selected document type
  const compatibleProjects = compatibilityMatrix[activeDocId as keyof typeof compatibilityMatrix] || [];

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Get the currently active document
  const activeDocument = documentTypes.find(doc => doc.id === activeDocId);

  return (
    <div 
      ref={sectionRef}
      id="document-types" 
      className="mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-7xl"
    >
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Document Types & Project Coverage
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300"
        >
          CookFast generates comprehensive documentation for various project types, helping you get started faster
        </motion.p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="documents">Document Types</TabsTrigger>
          <TabsTrigger value="projects">Project Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="mt-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Document types sidebar */}
            <div className="md:col-span-4 lg:col-span-3">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 rounded-xl p-4 h-fit sticky top-24"
              >
                <h3 className="font-semibold mb-3 text-lg">Document Types</h3>
                <div className="space-y-2">
                  {documentTypes.map((doc) => (
                    <motion.div
                      key={doc.id}
                      variants={itemVariants}
                      onClick={() => setActiveDocId(doc.id)}
                      className={`
                        flex items-center p-2 rounded-lg cursor-pointer transition-colors
                        ${activeDocId === doc.id 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <span className="text-xl mr-2">{doc.icon}</span>
                      <span className="flex-1">{doc.name}</span>
                      {doc.comingSoon && (
                        <Badge variant="outline" className="ml-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                          Soon
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            {/* Document details */}
            <div className="md:col-span-8 lg:col-span-9">
              {activeDocument && (
                <motion.div
                  key={activeDocId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{activeDocument.icon}</span>
                    <h3 className="text-2xl font-semibold">{activeDocument.name}</h3>
                    {activeDocument.comingSoon && (
                      <Badge className="ml-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {activeDocument.description}
                  </p>
                  
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-3">Key Benefits</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeDocument.benefits.map((benefit, index) => (
                        <div 
                          key={index}
                          className="flex items-center bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg"
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeDocument.color} mr-3`}></div>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Compatible Project Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {projectTypes
                        .filter(project => compatibleProjects.includes(project.id))
                        .map(project => (
                          <div 
                            key={project.id}
                            className="bg-gray-50 dark:bg-gray-800/60 px-3 py-1 rounded-full flex items-center"
                          >
                            <span className="mr-1">{project.emoji}</span>
                            <span>{project.name}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="mt-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projectTypes.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <span className={`text-3xl mr-3 ${project.color}`}>{project.emoji}</span>
                      <h3 className="text-xl font-semibold">{project.name}</h3>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Examples</h4>
                      <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                        {project.examples.map((example, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mr-2"></span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Supported Documents</h4>
                      <div className="flex flex-wrap gap-2">
                        {documentTypes
                          .filter(doc => {
                            const compatibility = compatibilityMatrix[doc.id as keyof typeof compatibilityMatrix] || [];
                            return compatibility.includes(project.id);
                          })
                          .map(doc => (
                            <Badge 
                              key={doc.id} 
                              variant="outline" 
                              className={`
                                ${doc.comingSoon ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30' : 
                                 'bg-gray-50 dark:bg-gray-800/60'}
                              `}
                            >
                              <span className="mr-1">{doc.icon}</span>
                              {doc.name.split(' ')[0]}
                              {doc.comingSoon && ' (Soon)'}
                            </Badge>
                          ))
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-8 text-center"
      >
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          More Document Types Coming Soon
        </h3>
        <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          We're continuously expanding our documentation offerings with new specialized types and enhanced integrations.
          Stay tuned for PRD documentation, API specifications, and more!
        </p>
      </motion.div>
    </div>
  );
};

export default DocumentTypeSection; 