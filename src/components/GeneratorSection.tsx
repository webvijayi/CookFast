'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedForm from '@/components/EnhancedForm';

// Define SpinnerIcon component
const SpinnerIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Social Share Icons
const ShareIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
  </svg>
);

// Also known as XIcon (Twitter)
const TwitterIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
  </svg>
);

const FacebookIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const TelegramIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const EmailIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12.713l-11.985-9.713h23.971l-11.986 9.713zm-5.425-1.822l-6.575-5.329v12.501l6.575-7.172zm10.85 0l6.575 7.172v-12.501l-6.575 5.329zm-1.557 1.261l-3.868 3.135-3.868-3.135-8.11 8.848h23.956l-8.11-8.848z" />
  </svg>
);

const LinkIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const LinkedInIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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

interface DocumentSection {
  title: string;
  content: string;
}

interface DebugLog {
  timestamp: string;
  event: string;
  details: unknown;
}

// Constants for sharing
const APP_URL = "https://cook-fast.webvijayi.com/";
const SHARE_TEXT = "🍳🚀 CookFast | AI-Powered Project Documentation Generator - Free & Open Source";

// Add a new type for generated documentation
interface GeneratedDocumentation {
  message: string;
  content: string;
  sections: DocumentSection[];
  isBackgroundProcessing?: boolean;
  requestId?: string;
  debug?: {
    provider: string;
    model: string;
    timestamp: string;
    processingTimeMs: number;
    contentLength: number;
    tokensUsed: {
      input: number;
      output: number;
      total: number;
    };
  };
}

// Define a type that matches what might come from the API
interface APIDocumentSection {
  title: string;
  content: string | any;
}

export default function GeneratorSection() {
  // Form state
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: '',
    projectType: 'Web Application',
    projectGoal: '',
    features: '',
    techStack: ''
  });

  // Document selection state
  const [selectedDocs, setSelectedDocs] = useState<DocumentSelection>({
    requirements: true,
    frontendGuidelines: true,
    backendStructure: true,
    appFlow: true,
    techStackDoc: true,
    systemPrompts: false,
    fileStructure: true
  });

  // API settings
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState<string>('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocumentation | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  
  // API Key validation states
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  
  // Add debug logs
  const addDebugLog = (event: string, details: unknown = {}) => {
    const timestamp = new Date().toISOString();
    const newLog: DebugLog = {
      timestamp,
      event,
      details
    };
    
    setDebugLogs(prevLogs => [newLog, ...prevLogs]);
    console.log(`[DEBUG] ${event}:`, details);
  };

  // Handle social sharing
  const handleShare = (platform: 'x' | 'facebook' | 'whatsapp' | 'telegram' | 'email' | 'link') => {
    const shareUrl = APP_URL;
    const shareText = SHARE_TEXT;
    
    let shareLink = '';
    
    switch (platform) {
      case 'x':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(shareLink, '_blank');
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(shareLink, '_blank');
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        window.open(shareLink, '_blank');
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(shareLink, '_blank');
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        window.location.href = shareLink;
        break;
      case 'link':
        navigator.clipboard.writeText(shareUrl);
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 2000);
        break;
    }
    
    addDebugLog('Share clicked', { platform, shareUrl });
  };

  // Handle form submission
  const handleFormSubmit = async (
    projectDetails: ProjectDetails,
    selectedDocs: DocumentSelection,
    provider: AIProvider,
    apiKey: string
  ) => {
    // Reset generatedDocs when starting a new generation
    setGeneratedDocs(null);
    
    // Update state with provided values
    setProjectDetails(projectDetails);
    setSelectedDocs(selectedDocs);
    setProvider(provider);
    setApiKey(apiKey);
    
    // Set loading state and initial generation stage
    setIsLoading(true);
    setGenerationStage('Preparing to generate documents');
    
    // Ensure we're passing the full object with proper values
    const sanitizedProjectDetails = {
      ...projectDetails,
      projectName: projectDetails.projectName.trim(),
      projectGoal: projectDetails.projectGoal.trim(),
      projectType: projectDetails.projectType || 'Web Application',
      features: projectDetails.features || '',
      techStack: projectDetails.techStack || ''
    };
    
    // Generate a unique request ID for this generation
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Make the initial API call using the background function endpoint
      const response = await fetch('/api/generate-docs-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectDetails: sanitizedProjectDetails,
          selectedDocs: selectedDocs,
          provider,
          apiKey,
          requestId
        })
      });
      
      // Check for initial response status
      if (response.status === 202) {
        // This is the expected status for background functions
        setGenerationStage('Request accepted - Processing in background...');
        
        // Start polling for completion
        startPollingForResults(requestId);
        return;
      }
      
      // Handle other response statuses
      if (!response.ok) {
        let errorDetails = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.message || errorDetails;
        } catch (parseError) {
          console.error('Could not parse error response body', parseError);
        }
        throw new Error(errorDetails);
      }
      
      // If we got here, it means the function ran synchronously
      const data = await response.json();
      handleSuccessfulResponse(data);
      
    } catch (error) {
      console.error('Error generating documentation:', error);
      setGenerationStage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };
  
  // Start polling for background function results
  const startPollingForResults = (requestId: string) => {
    setGenerationStage('Your request is being processed in the background. This may take a few minutes.');
    
    // Create initial background processing state
    const backgroundState: GeneratedDocumentation = {
      message: 'Your request is being processed in the background.',
      content: '',
      sections: [],
      isBackgroundProcessing: true,
      requestId: requestId,
      debug: {
        provider: provider,
        model: 'Unknown',
        timestamp: new Date().toISOString(),
        contentLength: 0,
        processingTimeMs: 0,
        tokensUsed: {
          input: 0,
          output: 0,
          total: 0
        }
      }
    };
    
    setGeneratedDocs(backgroundState);
    
    // Check for results immediately
    setTimeout(() => checkForResults(requestId), 2000);
    setIsLoading(false);
  };
  
  // Check for completed results
  const checkForResults = async (requestId: string) => {
    // Add defensive check for requestId
    if (!requestId) {
      console.error('Cannot check for results: Missing requestId');
      return false;
    }

    try {
      // Update UI to show we're checking status
      setGenerationStage(prevStage => 
        prevStage.includes('checking') ? prevStage : `${prevStage} (checking for results...)`
      );
      
      // Make the API call to check status
      const response = await fetch(`/api/check-status?requestId=${requestId}`);
      
      // Check if we have a valid response
      if (response.ok) {
        const data = await response.json();
        
        // Check if generation is still in progress
        if (data.status === 'processing') {
          // Update the UI with the latest status message
          setGenerationStage(data.message || 'Still processing your request...');
          
          // Schedule another check in a few seconds
          setTimeout(() => checkForResults(requestId), 5000);
          return false;
        }
        
        // Check if the generation failed
        if (data.status === 'failed') {
          setGenerationStage(`Error: ${data.error || 'Generation failed'}`);
          setIsLoading(false);
          return false;
        }
        
        // Only show success message if we actually have result data
        if (data.result) {
          // Validate that there's actually content in the result
          const hasContent = data.result.content && 
                             typeof data.result.content === 'string' && 
                             data.result.content.trim().length > 50;
          
          const hasSections = Array.isArray(data.result.sections) && 
                              data.result.sections.length > 0 && 
                              data.result.sections.some((section: APIDocumentSection) => 
                                section.content && 
                                typeof section.content === 'string' && 
                                section.content.trim().length > 0
                              );
          
          // If no valid content was found, treat as an error
          if (!hasContent && !hasSections) {
            addDebugLog('Background process response validation failed', { 
              contentLength: data.result.content?.length || 0,
              sectionsCount: data.result.sections?.length || 0
            });
            
            setGenerationStage('Error: Generated content was empty or invalid. Please try again with different settings.');
            setIsLoading(false);
            return false;
          }
          
          setGenerationStage('Documents generated! Processing results...');
          
          // Get token usage data if available
          const tokensUsed = data.tokensUsed || data.result?.debug?.tokensUsed || {
            input: 0,
            output: 0,
            total: 0
          };
          
          // Process the results
          setGeneratedDocs(data.result);
          setIsLoading(false);
          
          // Dispatch the generation success event to trigger the display in parent component
          const successEvent = new CustomEvent('cookfast:generationSuccess', {
            detail: {
              content: data.result.content,
              sections: data.result.sections,
              debug: data.result.debug
            }
          });
          
          // Add debug log for the event dispatch
          addDebugLog('Dispatching generationSuccess event from background process', {
            sectionsCount: data.result.sections?.length || 0,
            contentLength: data.result.content?.length || 0,
            hasValidContent: hasContent,
            hasValidSections: hasSections
          });
          
          // Dispatch the event to notify the main component
          document.dispatchEvent(successEvent);
          
          return true;
        } else {
          // We got a 'completed' status but no result data
          setGenerationStage('Error: No content was generated. Please try again.');
          setIsLoading(false);
          return false;
        }
      } else {
        // Handle non-200 responses
        let errorMessage = 'API request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Request failed with status ${response.status}`;
        } catch (e) {
          // If we can't parse the response
          errorMessage = `Request failed with status ${response.status}`;
        }
        
        setGenerationStage(`Error: ${errorMessage}`);
        console.error('API error:', errorMessage);
        
        // Schedule another check in case it's a temporary issue
        setTimeout(() => checkForResults(requestId), 5000);
        return false;
      }
    } catch (error) {
      console.error('Error checking for results:', error);
      // Update UI with error message
      setGenerationStage(`Error checking for results: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Continue polling despite the error
      setTimeout(() => checkForResults(requestId), 5000);
      return false;
    }
  };
  
  // Handle successful API response
  const handleSuccessfulResponse = (data: any) => {
    if (!data) {
      throw new Error('Empty response received from API');
    }
    
    // Validate that we have actual content data
    const hasContent = data.content && typeof data.content === 'string' && data.content.trim().length > 50;
    const hasSections = Array.isArray(data.sections) && data.sections.length > 0 && 
      data.sections.some((section: APIDocumentSection) => 
        section.content && 
        typeof section.content === 'string' && 
        section.content.trim().length > 0
      );
    
    if (!hasContent && !hasSections) {
      addDebugLog('API response validation failed', { 
        contentLength: data.content?.length || 0,
        sectionsCount: data.sections?.length || 0
      });
      
      setGenerationStage('Error: Generated content was empty or invalid. Please try again with different settings.');
      setIsLoading(false);
      return;
    }
    
    // Store the generated docs directly
    setGeneratedDocs(data);
    setGenerationStage('Generation complete!');
    setIsLoading(false);
    
    // Dispatch the generation success event to trigger the display in parent component
    const successEvent = new CustomEvent('cookfast:generationSuccess', {
      detail: {
        content: data.content,
        sections: data.sections,
        debug: data.debug
      }
    });
    
    // Add debug log for the event dispatch
    addDebugLog('Dispatching generationSuccess event', {
      sectionsCount: data.sections?.length || 0,
      contentLength: data.content?.length || 0,
      hasValidContent: hasContent,
      hasValidSections: hasSections
    });
    
    // Dispatch the event to notify the main component
    document.dispatchEvent(successEvent);
  };
  
  // Validate API key with the selected provider
  const validateKey = async (apiKey: string, provider: AIProvider) => {
    setIsValidatingKey(true);
    setKeyValidationStatus('idle');
    setKeyValidationError(null);
    
    try {
      addDebugLog('Validating API key', { provider });
      
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          apiKey
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setKeyValidationStatus('valid');
        addDebugLog('API key validation successful', { provider });
      } else {
        setKeyValidationStatus('invalid');
        setKeyValidationError(data.error || 'Invalid API key for the selected provider');
        addDebugLog('API key validation failed', { provider, error: data.error });
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setKeyValidationStatus('invalid');
      setKeyValidationError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred during validation'
      );
      addDebugLog('API key validation error', { error });
    } finally {
      setIsValidatingKey(false);
    }
  };

  // Display status messages to the user during processing
  const renderStatusMessage = () => {
    if (isLoading) {
      return (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">{generationStage || 'Processing...'}</span>
          </div>
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            This may take a minute or two depending on the complexity of your project.
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="generator" className="py-12 md:py-16">
      <div className="container max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-8">Generate Project Documentation</h2>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 inline-block text-transparent bg-clip-text text-3xl font-bold">
              Generate Documentation
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground" suppressHydrationWarning={true}>
              Fill in your project details, select the document types you need, and let AI do the rest.
              <span className="block mt-1 text-xs text-gray-500">
                All processing happens securely in your browser and on our servers.
              </span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <EnhancedForm 
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              generationStage={generationStage}
              keyValidationStatus={keyValidationStatus}
              keyValidationError={keyValidationError}
              validateKey={validateKey}
              isValidatingKey={isValidatingKey}
            />

            {/* Generation Status Display */}
            {generationStage && (
              <div className="mt-6 p-4 border rounded-md bg-muted">
                <div className="flex items-center">
                  {isLoading && <SpinnerIcon className="mr-2 h-4 w-4" />}
                  <p className="text-sm font-medium">{generationStage}</p>
                </div>
              </div>
            )}

            {/* Debug Panel */}
            <div className="mt-2">
              <button 
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="text-xs text-muted-foreground hover:underline"
              >
                {showDebugPanel ? 'Hide Debug Info' : 'Show Debug Info'}
              </button>
              
              {showDebugPanel && (
                <div className="mt-2 p-3 border rounded text-xs bg-slate-50 dark:bg-slate-900 overflow-y-auto max-h-40">
                  {debugLogs.length > 0 ? (
                    debugLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="opacity-50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        {' '}<span className="font-mono">{log.event}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">No logs yet</div>
                  )}
                </div>
              )}
            </div>

            {/* Results Section */}
            {!isLoading && generatedDocs && (
              <div className="mt-8 p-6 border rounded-lg" suppressHydrationWarning={true}>
                {generatedDocs.content && generatedDocs.sections && generatedDocs.sections.length > 0 ? (
                  <div>
                    <div className="flex items-center mb-4 text-green-600 dark:text-green-400">
                      <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h3 className="font-medium text-lg text-green-700 dark:text-green-300">
                        Documentation Generated Successfully!
                      </h3>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Generated {generatedDocs.sections.length} document sections with {(generatedDocs.content?.length || 0).toLocaleString()} characters
                      </p>
                    </div>
                    
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start">
                        <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Your documentation is ready to view!</p>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            You should be automatically redirected to the results panel. If not, please check the tabs above or refresh the page.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="flex items-center justify-center mb-4 text-red-500">
                      <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h3 className="font-medium text-lg">API Request Failed</h3>
                    </div>
                    <p>The AI provider encountered an error processing your request. This could be due to rate limits, quota restrictions, or connectivity issues.</p>
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 text-left rounded w-full">
                      <p className="text-sm font-mono text-red-500">{generationStage}</p>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setGeneratedDocs(null);
                          setIsLoading(false);
                          setGenerationStage('');
                        }}
                        className="border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-800/50"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6 text-sm text-muted-foreground">
            <div>Need help? Check our <a href="#faq" className="underline">FAQ</a> section.</div>
            <div>Using AI responsibly ✨</div>
          </CardFooter>
        </Card>

        {/* Share section - with social buttons */}
        <div className="mt-12 p-6 bg-card rounded-xl shadow-sm border">
          <h3 className="text-xl font-semibold mb-4 text-center">
            <ShareIcon className="mr-2 h-5 w-5 inline-block" /> Share CookFast
          </h3>
          <p className="text-center text-muted-foreground mb-6">
            Found CookFast helpful? Share it with your network! 🌟
          </p>
          {/* Social sharing buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <Button 
              variant="outline" 
              className="bg-background hover:bg-muted flex items-center" 
              size="sm"
              onClick={() => handleShare('x')}
            >
              <TwitterIcon className="mr-2" /> Twitter
            </Button>
            <Button 
              variant="outline" 
              className="bg-background hover:bg-muted flex items-center" 
              size="sm"
              onClick={() => handleShare('facebook')}
            >
              <FacebookIcon className="mr-2" /> Facebook
            </Button>
            <Button 
              variant="outline" 
              className="bg-background hover:bg-muted flex items-center" 
              size="sm"
              onClick={() => handleShare('whatsapp')}
            >
              <WhatsAppIcon className="mr-2" /> WhatsApp
            </Button>
            <Button 
              variant="outline" 
              className="bg-background hover:bg-muted flex items-center" 
              size="sm"
              onClick={() => handleShare('telegram')}
            >
              <TelegramIcon className="mr-2" /> Telegram
            </Button>
            <Button 
              variant="outline" 
              className="bg-background hover:bg-muted flex items-center" 
              size="sm"
              onClick={() => handleShare('email')}
            >
              <EmailIcon className="mr-2" /> Email
            </Button>
            <Button 
              variant="outline" 
              className="bg-background hover:bg-muted flex items-center" 
              size="sm"
              onClick={() => handleShare('link')}
            >
              <LinkIcon className="mr-2" /> Copy Link
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              CookFast processes your project data via your chosen AI provider.
              Your data is not stored on our servers beyond the current session.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/webvijayi/cookfast" target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
                  Back to Top
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDebugLogs(!showDebugLogs)}
              >
                {showDebugLogs ? 'Hide Debug' : 'Show Debug'}
              </Button>
            </div>
          </div>

          {/* Debug Panel - Only shown when toggled */}
          {showDebugLogs && (
            <div className="mt-8 bg-card border rounded-lg shadow-lg p-4 overflow-auto max-h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Debug Logs</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowDebugLogs(false)}>
                  <span className="sr-only">Close</span>
                  &times;
                </Button>
              </div>
              <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded">{JSON.stringify(debugLogs, null, 2)}</pre>
            </div>
          )}

          {/* Copy Notification */}
          {showCopyNotification && (
            <div className="fixed bottom-4 left-4 bg-secondary text-secondary-foreground p-2 rounded-full shadow-lg z-50 text-xs">
              Copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
