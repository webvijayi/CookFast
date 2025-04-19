'use client';

import React, { useState, useEffect } from 'react';

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
type AIProvider = 'gemini' | 'openai' | 'anthropic';

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
    apiKey: string
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
    appFlow: true,
    techStackDoc: true,
    systemPrompts: true,
    fileStructure: true,
  });
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [animateStepChange, setAnimateStepChange] = useState(false);

  // Reset validation when provider changes
  useEffect(() => {
    setUserApiKey('');
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

  // Check if any document is selected
  const hasSelectedDoc = Object.values(selectedDocs).some(value => value);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("EnhancedForm: handleSubmit called");
    
    // Log detailed form data for debugging
    console.log("Form submission data:", {
      provider: selectedProvider,
      projectDetails: projectDetails,
      projectName: projectDetails.projectName,
      projectGoal: projectDetails.projectGoal,
      hasApiKey: !!userApiKey.trim(),
      selectedDocsCount: Object.values(selectedDocs).filter(Boolean).length
    });
    
    if (!validateProviderStep() || !validateProjectStep()) {
      // Jump to the step with errors
      if (!validateProviderStep()) {
        console.error("Provider validation failed");
        setCurrentStep(1);
      } else if (!validateProjectStep()) {
        console.error("Project validation failed");
        setCurrentStep(2);
      }
      return;
    }

    if (!hasSelectedDoc) {
      console.error("No documents selected");
      setFormErrors({ docs: 'Please select at least one document type' });
      return;
    }

    console.log("EnhancedForm: Validation passed, calling onSubmit");
    try {
      // Verify data one more time before submitting
      if (!projectDetails.projectName?.trim() || !projectDetails.projectGoal?.trim()) {
        console.error("Final validation failed - required fields still missing");
        setFormErrors({
          ...((!projectDetails.projectName?.trim()) && { projectName: 'Project name is required' }),
          ...((!projectDetails.projectGoal?.trim()) && { projectGoal: 'Project goal is required' })
        });
        
        // Jump to the proper step
        setCurrentStep(2);
        return;
      }
      
      await onSubmit(projectDetails, selectedDocs, selectedProvider, userApiKey);
    } catch (error) {
      console.error("Error in form submission:", error);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(['gemini', 'openai', 'anthropic'] as AIProvider[]).map(provider => (
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
                  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" className="w-full h-full">
                    <path d="M474.123 209.81c11.525-34.577 7.569-72.423-10.838-103.904-27.696-48.168-83.433-72.94-137.794-61.414a127.14 127.14 0 00-95.475-42.49c-55.564 0-104.936 35.781-122.139 88.593-35.781 7.397-66.574 29.76-84.637 61.414-27.868 48.167-21.503 108.72 15.826 150.007-11.525 34.578-7.569 72.424 10.838 103.733 27.696 48.34 83.433 73.111 137.966 61.585 24.084 27.18 58.833 42.835 95.303 42.663 55.564 0 104.936-35.782 122.139-88.594 35.782-7.397 66.574-29.76 84.465-61.413 28.04-48.168 21.676-108.722-15.654-150.008v-.172zm-39.567-87.218c11.01 19.267 15.139 41.803 11.354 63.65-.688-.516-2.064-1.204-2.924-1.72l-101.152-58.49a16.965 16.965 0 00-16.687 0L206.621 194.5v-50.232l97.883-56.597c45.587-26.32 103.732-10.666 130.052 34.921zm-227.935 104.42l49.888-28.9 49.887 28.9v57.63l-49.887 28.9-49.888-28.9v-57.63zm23.223-191.81c22.364 0 43.867 7.742 61.07 22.02-.688.344-2.064 1.204-3.097 1.72L186.666 117.26c-5.161 2.925-8.258 8.43-8.258 14.45v136.934l-43.523-25.116V130.333c0-52.64 42.491-95.13 95.131-95.302l-.172.172zM52.14 168.697c11.182-19.268 28.557-34.062 49.544-41.803V247.14c0 6.02 3.097 11.354 8.258 14.45l118.354 68.295-43.695 25.288-97.711-56.425c-45.415-26.32-61.07-84.465-34.75-130.052zm26.665 220.71c-11.182-19.095-15.139-41.802-11.354-63.65.688.516 2.064 1.204 2.924 1.72l101.152 58.49a16.965 16.965 0 0016.687 0l118.354-68.467v50.232l-97.883 56.425c-45.587 26.148-103.732 10.665-130.052-34.75h.172zm204.54 87.39c-22.192 0-43.867-7.741-60.898-22.02a62.439 62.439 0 003.097-1.72l101.152-58.317c5.16-2.924 8.429-8.43 8.257-14.45V243.527l43.523 25.116v113.022c0 52.64-42.663 95.303-95.131 95.303v-.172zM461.22 343.303c-11.182 19.267-28.729 34.061-49.544 41.63V264.687c0-6.021-3.097-11.526-8.257-14.45L284.893 181.77l43.523-25.116 97.883 56.424c45.587 26.32 61.07 84.466 34.75 130.053l.172.172z" fillRule="nonzero"/>
                  </svg>
                )}
                {provider === 'anthropic' && (
                  <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 509.64" className="w-full h-full">
                    <path fill="#D77655" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
                    <path fill="#FCF2EE" fillRule="nonzero" d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"/>
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
      </div>
      
      <div className="mt-8 flex justify-between">
        <div></div> {/* Spacer */}
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
        Select Documents
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(selectedDocs).map((key) => (
            <div 
              key={key}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${selectedDocs[key as keyof DocumentSelection]
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-700'
                }
              `}
              onClick={() => {
                const newSelectedDocs = { ...selectedDocs };
                newSelectedDocs[key as keyof DocumentSelection] = !newSelectedDocs[key as keyof DocumentSelection];
                setSelectedDocs(newSelectedDocs);
              }}
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
          <p className="text-red-500 text-sm">{formErrors.docs}</p>
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