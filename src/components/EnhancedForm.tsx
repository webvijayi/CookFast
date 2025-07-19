"use client";

import React, { useState, useEffect } from 'react';
import { AVAILABLE_MODELS, getDefaultModel } from "@/lib/models";

// SVG Icons with better styling
const CheckIcon = () => (
  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const GenerateIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm10 7H5v6h10V9z" clipRule="evenodd" />
  </svg>
);

// Types for the form
type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'xai';

interface ProjectDetails {
  projectName: string;
  projectType: string;
  projectGoal: string;
  features: string;
  techStack: string;
}

interface DocumentSelection {
  requirements: boolean;
  frontendGuidelines: boolean;
  backendStructure: boolean;
  appFlow: boolean;
  techStackDoc: boolean;
  systemPrompts: boolean;
  fileStructure: boolean;
}

interface Props {
  onSubmit: (
    projectDetails: ProjectDetails,
    selectedDocs: DocumentSelection,
    provider: AIProvider,
    apiKey: string,
    modelId: string,
    runInBackground: boolean
  ) => Promise<void>;
  isLoading: boolean;
  generationStage?: string;
  keyValidationStatus?: 'idle' | 'valid' | 'invalid';
  keyValidationError?: string | null;
  validateKey: (apiKey: string, provider: AIProvider) => Promise<void>;
  isValidatingKey: boolean;
}

// Add this styling to the steps display to avoid text overlap
const StepIndicator = ({ 
  number, 
  label, 
  active, 
  completed 
}: { 
  number: number; 
  label: string; 
  active: boolean; 
  completed: boolean; 
}) => (
  <div className="flex flex-col items-center relative z-10 group">
    <div className={`
      flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold mb-2
      ${active 
        ? 'bg-primary text-primary-foreground' 
        : completed 
          ? 'bg-primary/80 text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      }
      transition-all duration-200
    `}>
      {number}
    </div>
    <div className="text-xs text-center font-medium whitespace-nowrap">
      {label}
    </div>
  </div>
);

export default function EnhancedForm({
  onSubmit,
  isLoading,
  generationStage,
  keyValidationStatus = 'idle',
  keyValidationError = null,
  validateKey,
  isValidatingKey,
}: Props) {
  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: '',
    projectType: 'Web Application',
    projectGoal: '',
    features: '',
    techStack: '',
  });
  const [selectedDocs, setSelectedDocs] = useState<DocumentSelection>({
    requirements: true,
    frontendGuidelines: true,
    backendStructure: true,
    appFlow: false,
    techStackDoc: false,
    systemPrompts: false,
    fileStructure: false,
  });
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('xai');
  const [selectedModel, setSelectedModel] = useState<string>(getDefaultModel('xai').id);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [animateStepChange, setAnimateStepChange] = useState(false);

  // Reset validation and model when provider changes
  useEffect(() => {
    setUserApiKey('');
    setSelectedModel(getDefaultModel(selectedProvider).id);
  }, [selectedProvider]);

  // Navigation functions
  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!validateProviderStep()) return;
    } else if (currentStep === 2) {
      if (!validateProjectStep()) return;
    }

    setAnimateStepChange(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setAnimateStepChange(false);
    }, 300);
  };

  const prevStep = () => {
    setAnimateStepChange(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
      setAnimateStepChange(false);
    }, 300);
  };

  // Validation functions
  const validateProviderStep = () => {
    if (!userApiKey.trim()) {
      setFormErrors({ apiKey: 'API key is required' });
      return false;
    }
    setFormErrors({});
    return true;
  };

  const validateProjectStep = () => {
    const errors: { [key: string]: string } = {};
    
    // Log current project details for debugging
    console.log('Validating project details:', projectDetails);
    
    // Validate required fields - be more explicit with checks
    if (!projectDetails.projectName || !projectDetails.projectName.trim()) {
      errors.projectName = 'Project name is required';
      console.error('Project name validation failed: empty or whitespace');
    }
    
    if (!projectDetails.projectGoal || !projectDetails.projectGoal.trim()) {
      errors.projectGoal = 'Project goal is required';
      console.error('Project goal validation failed: empty or whitespace');
    }
    // Features and techStack are optional
    
    // Log validation results
    if (Object.keys(errors).length > 0) {
      console.error('Project validation failed:', errors);
    } else {
      console.log('Project validation successful');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  // Handle document type selection with better logging
  const handleDocumentSelection = (key: keyof DocumentSelection) => {
    console.log(`Document selection changed: ${key}`, { 
      previous: selectedDocs[key], 
      new: !selectedDocs[key] 
    });
    
    const newSelectedDocs = {
      ...selectedDocs,
      [key]: !selectedDocs[key]
    };
    
    // Log the new state
    console.log('Updated document selection state:', newSelectedDocs);
    
    setSelectedDocs(newSelectedDocs);
    
    // Clear the form error for docs if at least one is selected
    if (Object.values(newSelectedDocs).some(Boolean) && formErrors.docs) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.docs;
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (currentStep === 1) {
      if (!validateProviderStep()) return;
      nextStep();
      return;
    }
    
    if (currentStep === 2) {
      if (!validateProjectStep()) return;
      nextStep();
      return;
    }
    
    if (currentStep === 3) {
      // Validate document selection
      let selectedCount = 0;
      for (const key in selectedDocs) {
        if (selectedDocs[key as keyof DocumentSelection]) {
          selectedCount++;
        }
      }
      
      if (selectedCount === 0) {
        setFormErrors({ ...formErrors, docs: 'Please select at least one document type' });
        return;
      }
      
      // Submit the form with all data
      // Always use background processing (true) regardless of UI state
      await onSubmit(
        projectDetails,
        selectedDocs,
        selectedProvider,
        userApiKey,
        selectedModel,
        true // Always true - background processing is always enabled
      );
    }
  };

  // Handle validation
  const handleValidateKey = async () => {
    if (!userApiKey.trim()) {
      setFormErrors({ apiKey: 'API key is required' });
      return;
    }
    
    setFormErrors({});
    await validateKey(userApiKey, selectedProvider);
  };

  // Format label with proper spacing
  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/ Doc$/, ' Document')
      .trim();
  };

  // Utility functions for styling
  const getInputClasses = (hasError: boolean) => `
    block w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-opacity-50 transition-all duration-200
    ${hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-800'
    }
    bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100
  `;

  // Render functions for each step
  const renderProviderStep = () => (
    <div className={`transition-opacity duration-300 ${animateStepChange ? 'opacity-0' : 'opacity-100'}`}>
      <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Select AI Provider
      </h2>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(['gemini', 'openai', 'anthropic', 'xai'] as AIProvider[]).map(provider => (
            <div 
              key={provider}
              className={`
                relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${selectedProvider === provider 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => setSelectedProvider(provider)}
            >
              {selectedProvider === provider && (
                <div className="absolute top-3 right-3 h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
              
              <div className="h-12 w-12 mx-auto mb-3">
                {provider === 'gemini' && (
                  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-full h-full">
                    <path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)"/>
                    <defs>
                      <radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)">
                        <stop offset=".067" stopColor="#9168C0"/>
                        <stop offset=".343" stopColor="#5684D1"/>
                        <stop offset=".672" stopColor="#1BA1E3"/>
                      </radialGradient>
                    </defs>
                  </svg>
                )}
                {provider === 'openai' && (
                  <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 509.639" className="w-full h-full">
                    <path fill="#fff" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.613-115.613 115.613H115.612C52.026 509.64 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
                    <path fillRule="nonzero" d="M412.037 221.764a90.834 90.834 0 004.648-28.67 90.79 90.79 0 00-12.443-45.87c-16.37-28.496-46.738-46.089-79.605-46.089-6.466 0-12.943.683-19.264 2.04a90.765 90.765 0 00-67.881-30.515h-.576c-.059.002-.149.002-.216.002-39.807 0-75.108 25.686-87.346 63.554-25.626 5.239-47.748 21.31-60.682 44.03a91.873 91.873 0 00-12.407 46.077 91.833 91.833 0 0023.694 61.553 90.802 90.802 0 00-4.649 28.67 90.804 90.804 0 0012.442 45.87c16.369 28.504 46.74 46.087 79.61 46.087a91.81 91.81 0 0019.253-2.04 90.783 90.783 0 0067.887 30.516h.576l.234-.001c39.829 0 75.119-25.686 87.357-63.588 25.626-5.242 47.748-21.312 60.682-44.033a91.718 91.718 0 0012.383-46.035 91.83 91.83 0 00-23.693-61.553l-.004-.005zM275.102 413.161h-.094a68.146 68.146 0 01-43.611-15.8 56.936 56.936 0 002.155-1.221l72.54-41.901a11.799 11.799 0 005.962-10.251V241.651l30.661 17.704c.326.163.55.479.596.84v84.693c-.042 37.653-30.554 68.198-68.21 68.273h.001zm-146.689-62.649a68.128 68.128 0 01-9.152-34.085c0-3.904.341-7.817 1.005-11.663.539.323 1.48.897 2.155 1.285l72.54 41.901a11.832 11.832 0 0011.918-.002l88.563-51.137v35.408a1.1 1.1 0 01-.438.94l-73.33 42.339a68.43 68.43 0 01-34.11 9.12 68.359 68.359 0 01-59.15-34.11l-.001.004zm-19.083-158.36a68.044 68.044 0 0135.538-29.934c0 .625-.036 1.731-.036 2.5v83.801l-.001.07a11.79 11.79 0 005.954 10.242l88.564 51.13-30.661 17.704a1.096 1.096 0 01-1.034.093l-73.337-42.375a68.36 68.36 0 01-34.095-59.143 68.412 68.412 0 019.112-34.085l-.004-.003zm251.907 58.621l-88.563-51.137 30.661-17.697a1.097 1.097 0 011.034-.094l73.337 42.339c21.109 12.195 34.132 34.746 34.132 59.132 0 28.604-17.849 54.199-44.686 64.078v-86.308c.004-.032.004-.065.004-.096 0-4.219-2.261-8.119-5.919-10.217zm30.518-45.93c-.539-.331-1.48-.898-2.155-1.286l-72.54-41.901a11.842 11.842 0 00-5.958-1.611c-2.092 0-4.15.558-5.957 1.611l-88.564 51.137v-35.408l-.001-.061a1.1 1.1 0 01.44-.88l73.33-42.303a68.301 68.301 0 0134.108-9.129c37.704 0 68.281 30.577 68.281 68.281a68.69 68.69 0 01-.984 11.545v.005zm-191.843 63.109l-30.668-17.704a1.09 1.09 0 01-.596-.84v-84.692c.016-37.685 30.593-68.236 68.281-68.236a68.332 68.332 0 0143.689 15.804 63.09 63.09 0 00-2.155 1.222l-72.54 41.9a11.794 11.794 0 00-5.961 10.248v.068l-.05 102.23zm16.655-35.91l39.445-22.782 39.444 22.767v45.55l-39.444 22.767-39.445-22.767v-45.535z"/>
                  </svg>
                )}
                {provider === 'anthropic' && (
                  <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 509.64" className="w-full h-full">
                    <path fill="#D77655" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
                    <path fill="#FCF2EE" fillRule="nonzero" d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"/>
                  </svg>
                )}
                {provider === 'xai' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.89 595.28" className="w-full h-full">
                    <g className="fill-black dark:fill-white">
                      <polygon points="557.09,211.99 565.4,538.36 631.96,538.36 640.28,93.18"/>
                      <polygon points="640.28,56.91 538.72,56.91 379.35,284.53 430.13,357.05"/>
                      <polygon points="201.61,538.36 303.17,538.36 353.96,465.84 303.17,393.31"/>
                      <polygon points="201.61,211.99 430.13,538.36 531.69,538.36 303.17,211.99"/>
                    </g>
                  </svg>
                )}
              </div>
              
              <h3 className="text-center font-medium capitalize text-lg">{provider}</h3>
            </div>
          ))}
        </div>
          
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-sm font-medium">
            Your {selectedProvider.toUpperCase()} API Key <span className="text-red-500">*</span>
          </label>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Get your API key from: {' '}
            {selectedProvider === 'openai' && (
              <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                OpenAI API
              </a>
            )}
            {selectedProvider === 'anthropic' && (
              <a href="https://www.anthropic.com/product" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Anthropic API
              </a>
            )}
            {selectedProvider === 'gemini' && (
              <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Google Gemini API
              </a>
            )}
            {selectedProvider === 'xai' && (
              <a href="https://x.ai/api" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                X.ai API
              </a>
            )}
          </div>
          <div className="flex flex-col sm:flex-row">
            <input
              type="password"
              id="apiKey"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              className={`
                ${getInputClasses(!!formErrors.apiKey)}
                sm:rounded-r-none
                rounded-r-md sm:rounded-b-none rounded-b-none
                ${keyValidationStatus === 'valid' ? 'border-green-500 dark:border-green-600' : ''}
                ${keyValidationStatus === 'invalid' ? 'border-red-500 dark:border-red-600' : ''}
              `}
              placeholder={`Paste your ${selectedProvider.toUpperCase()} key`}
              suppressHydrationWarning={true}
            />
            <button
              type="button"
              onClick={handleValidateKey}
              disabled={isValidatingKey || !userApiKey.trim()}
              className={`
                px-4 py-3 rounded-r-md flex items-center justify-center
                sm:rounded-l-none rounded-l-md rounded-t-none sm:rounded-t-md
                transition-colors duration-200 font-medium text-white
                ${isValidatingKey ? 'bg-gray-400 cursor-wait' :
                 keyValidationStatus === 'valid' ? 'bg-green-500 hover:bg-green-600' :
                 keyValidationStatus === 'invalid' ? 'bg-red-500 hover:bg-red-600' :
                 'bg-indigo-600 hover:bg-indigo-700'
                }
              `}
            >
              {isValidatingKey ? <SpinnerIcon /> : keyValidationStatus === 'valid' ? <CheckIcon /> : 'Test'}
            </button>
          </div>
          
          {formErrors.apiKey && (
            <p className="text-red-500 text-sm mt-1">{formErrors.apiKey}</p>
          )}
          
          {keyValidationStatus === 'valid' && (
            <p className="text-green-500 dark:text-green-400 text-sm mt-1">API key is valid!</p>
          )}
          
          {keyValidationStatus === 'invalid' && keyValidationError && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{keyValidationError}</p>
          )}
          
          <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
            <strong>Note:</strong> CookFast by <a href="https://webvijayi.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Web Vijayi</a> is 
            open-source. We <strong className="text-red-600 dark:text-red-400">never store</strong> your API keys. 
            They&apos;re used solely for generation requests. Verify the code on <a href="https://github.com/webvijayi/CookFast" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">GitHub</a>.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="model" className="block text-sm font-medium">
            Select Model
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={getInputClasses(false)}
          >
            {AVAILABLE_MODELS[selectedProvider].map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          
          {/* Show model details */}
          {(() => {
            const currentModel = AVAILABLE_MODELS[selectedProvider].find(m => m.id === selectedModel);
            return currentModel ? (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-md">
                <p className="font-medium mb-1">{currentModel.name}</p>
                <p>{currentModel.description}</p>
                <p className="mt-1">
                  Max Output: {currentModel.maxTokens.toLocaleString()} tokens • 
                  Context: {currentModel.contextWindow.toLocaleString()} tokens
                </p>
              </div>
            ) : null;
          })()}
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <div></div> {/* Spacer */}
        <button
          type="button"
          onClick={nextStep}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          suppressHydrationWarning={true}
        >
          Next
          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderProjectStep = () => (
    <div className={`transition-opacity duration-300 ${animateStepChange ? 'opacity-0' : 'opacity-100'}`}>
      <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Project Details
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="projectName" className="block text-sm font-medium">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="projectName"
              value={projectDetails.projectName}
              onChange={(e) => setProjectDetails({ ...projectDetails, projectName: e.target.value })}
              className={getInputClasses(!!formErrors.projectName)}
              placeholder="Enter project name"
            />
            {formErrors.projectName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.projectName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="projectType" className="block text-sm font-medium">
              Project Type
            </label>
            <select
              id="projectType"
              value={projectDetails.projectType}
              onChange={(e) => setProjectDetails({ ...projectDetails, projectType: e.target.value })}
              className={getInputClasses(false)}
            >
              <option value="Web Application">Web Application</option>
              <option value="Website">Website</option>
              <option value="Mobile App">Mobile App</option>
              <option value="API Service">API Service</option>
              <option value="Library/Package">Library/Package</option>
              <option value="Desktop Application">Desktop Application</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="projectGoal" className="block text-sm font-medium">
            Main Goal/Purpose <span className="text-red-500">*</span>
          </label>
          <textarea
            id="projectGoal"
            value={projectDetails.projectGoal}
            onChange={(e) => setProjectDetails({ ...projectDetails, projectGoal: e.target.value })}
            className={`${getInputClasses(!!formErrors.projectGoal)} min-h-[100px] resize-y`}
            placeholder="What&apos;s the main objective of your project?"
          />
          {formErrors.projectGoal && (
            <p className="text-red-500 text-sm mt-1">{formErrors.projectGoal}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="features" className="block text-sm font-medium">
            Key Features (Optional)
          </label>
          <textarea
            id="features"
            value={projectDetails.features}
            onChange={(e) => setProjectDetails({ ...projectDetails, features: e.target.value })}
            className={`${getInputClasses(false)} min-h-[100px] resize-y`}
            placeholder="List features like: User login, search, payments..."
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="techStack" className="block text-sm font-medium">
            Known Tech Stack (Optional)
          </label>
          <input
            type="text"
            id="techStack"
            value={projectDetails.techStack}
            onChange={(e) => setProjectDetails({ ...projectDetails, techStack: e.target.value })}
            className={getInputClasses(false)}
            placeholder="e.g., Next.js, Python, Postgres, Docker"
          />
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <button
          type="button"
          onClick={nextStep}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          Next
          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderDocumentStep = () => (
    <div className={`transition-opacity duration-300 ${animateStepChange ? 'opacity-0' : 'opacity-100'}`}>
      <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Select Document Types
      </h2>
      
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-300">
          Select the types of documentation you need for your project:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.keys(selectedDocs).map((key) => (
            <div 
              key={key} 
              className={`
                relative p-4 rounded-lg cursor-pointer transition-all duration-200
                ${selectedDocs[key as keyof DocumentSelection] 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => handleDocumentSelection(key as keyof DocumentSelection)}
            >
              <div className="flex items-start mb-1">
                <div className={`
                  h-5 w-5 rounded mr-3 flex-shrink-0 mt-0.5 flex items-center justify-center border
                  ${selectedDocs[key as keyof DocumentSelection]
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}>
                  {selectedDocs[key as keyof DocumentSelection] && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="block font-medium text-gray-900 dark:text-white">
                  {formatLabel(key)}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-8 leading-relaxed">
                {key === 'requirements' && 'Detailed feature requirements and project specifications'}
                {key === 'frontendGuidelines' && 'UI/UX design standards and implementation guides'}
                {key === 'backendStructure' && 'API, services, data models, and architecture design'}
                {key === 'appFlow' && 'Sequence diagrams showing interaction between components'}
                {key === 'techStackDoc' && 'Recommended technologies and their justifications'}
                {key === 'systemPrompts' && 'AI system prompts for interactive components if needed'}
                {key === 'fileStructure' && 'Recommended project folder organization and layout'}
              </p>
            </div>
          ))}
        </div>
        
        {formErrors.docs && (
          <p className="text-red-500 text-sm mt-2">{formErrors.docs}</p>
        )}
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`
            px-8 py-3 rounded-full font-medium text-white shadow-lg
            transition-all duration-300 flex items-center justify-center
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/25 transform hover:scale-105'
            }
          `}
        >
          {isLoading ? (
            <>
              <SpinnerIcon />
              <span className="ml-2">{generationStage || 'Generating...'}</span>
            </>
          ) : (
            <>
              <GenerateIcon />
              Cook Up Docs!
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto relative px-4 sm:px-0">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <StepIndicator
                key={`step-${step}`}
                number={step}
                label={step === 1 ? 'AI Provider' : step === 2 ? 'Project Details' : 'Documents'}
                active={currentStep === step}
                completed={currentStep > step}
              />
            ))}
          </div>
          <div className="relative mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Step content */}
      <div className="mt-12">
        {currentStep === 1 && renderProviderStep()}
        {currentStep === 2 && renderProjectStep()}
        {currentStep === 3 && renderDocumentStep()}
      </div>
    </form>
  );
} 