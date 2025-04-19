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
        <div className="grid grid-cols-3 gap-4">
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
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="currentColor" d="M2 5.014a1 1 0 011.394-.248l8.637 5.786a2 2 0 01.874 1.65v8.772a1 1 0 01-1.582.81l-8.637-5.786a2 2 0 01-.874-1.65V5.014z" />
                    <path fill="currentColor" d="M22 5.014a1 1 0 00-1.394-.248l-8.637 5.786a2 2 0 00-.874 1.65v8.772a1 1 0 001.582.81l8.637-5.786a2 2 0 00.874-1.65V5.014z" />
                  </svg>
                )}
                {provider === 'openai' && (
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="currentColor" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5093-2.6067-1.4997z" />
                  </svg>
                )}
                {provider === 'anthropic' && (
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
          <div className="flex">
            <input
              type="password"
              id="apiKey"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              className={`
                ${getInputClasses(!!formErrors.apiKey)}
                rounded-r-none
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto relative">
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