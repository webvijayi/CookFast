'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  
  // API Key validation states
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  
  // Add Refs for AbortController and Polling Interval
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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
    // --- Reset Section ---
    setGeneratedDocs(null); // Clear previous results
    setError(null); // Clear previous errors
    setIsLoading(true);
    setGenerationStage('Preparing to generate documents');
    addDebugLog('Form Submit: Start', { provider, numDocs: Object.values(selectedDocs).filter(Boolean).length });

    // --- Abort Previous (if any) ---
    handleStopGeneration(); // Stop any previous ongoing process

    // --- Setup Abort Controller for Initial Request ---
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // --- Update State ---
    setProjectDetails(projectDetails);
    setSelectedDocs(selectedDocs);
    setProvider(provider);
    setApiKey(apiKey);
    
    // --- Sanitize Data ---
    const sanitizedProjectDetails = {
      ...projectDetails,
      projectName: projectDetails.projectName.trim() || 'Untitled Project', // Add default
      projectGoal: projectDetails.projectGoal.trim(),
      projectType: projectDetails.projectType || 'Web Application',
      features: projectDetails.features || '',
      techStack: projectDetails.techStack || ''
    };
    
    const selectedDocKeys = Object.entries(selectedDocs)
      .filter(([, value]) => value)
      .map(([key]) => key);

    if (selectedDocKeys.length === 0) {
        setError('Please select at least one document type to generate.');
        setIsLoading(false);
        setGenerationStage('Error');
        addDebugLog('Form Submit: Error', { reason: 'No documents selected' });
        return;
    }

    addDebugLog('Form Submit: Data Prepared', { details: sanitizedProjectDetails, docs: selectedDocKeys });

    // --- API Call (Initial Background Request) ---
    try {
      setGenerationStage('Initiating generation task...');
      addDebugLog('Form Submit: Sending initial request', { endpoint: '/api/generate-docs' });

      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectDetails: sanitizedProjectDetails,
          selectedDocs: selectedDocKeys,
          provider,
          apiKey,
        }),
        signal: controller.signal, // Pass the abort signal
      });

      addDebugLog('Form Submit: Initial response received', { status: response.status });

      // Clear the abort controller ref as the initial request is done
      abortControllerRef.current = null;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addDebugLog('Form Submit: Initial response parsed', { data });

      if (data.requestId) {
        setGenerationStage('Generation task started. Waiting for results...');
        startPollingForResults(data.requestId);
      } else {
        // Handle potential immediate success (though unlikely for background)
        if (data.content || data.sections) {
      handleSuccessfulResponse(data);
        } else {
            throw new Error(data.error || 'Invalid response from server after initiating task.');
        }
      }
    } catch (error: any) {
      // Handle AbortError specifically
      if (error.name === 'AbortError') {
        console.log('Initial fetch aborted.');
        setError('Generation initiation cancelled.');
        setGenerationStage('Stopped');
        addDebugLog('Form Submit: Initial Fetch Aborted');
      } else {
        console.error('Error during initial generation request:', error);
        setError(`Failed to start generation: ${error.message}`);
        setGenerationStage('Error');
        addDebugLog('Form Submit: Initial Fetch Error', { error: error.message });
      }
      setIsLoading(false);
      // Ensure polling is stopped if an error occurred before polling started
      handleStopGeneration();
    }
  };
  
  // --- Polling Logic ---
  const startPollingForResults = (requestId: string) => {
    addDebugLog('Polling: Start', { requestId });
    setGenerationStage('Task running, checking for updates...');

    // Clear any existing interval before starting a new one
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Initial check after a short delay
    setTimeout(() => checkForResults(requestId), 3000);

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      checkForResults(requestId);
    }, 10000); // Poll every 10 seconds
  };

  const checkForResults = async (requestId: string) => {
    addDebugLog('Polling: Check Status', { requestId });
    setGenerationStage('Checking generation status...'); // Update stage during check

    try {
      const response = await fetch(`/api/check-status?requestId=${requestId}`);
      addDebugLog('Polling: Response Received', { requestId, status: response.status });

      if (!response.ok) {
         // Handle non-200 responses gracefully, maybe retry or log
         console.warn(`Polling check failed with status: ${response.status}`);
         setGenerationStage('Status check failed, will retry...');
         addDebugLog('Polling: Check Status Failed', { requestId, status: response.status });
         // Don't throw an error yet, allow polling to continue unless it's a fatal error like 404
         if (response.status === 404) {
            throw new Error('Generation task not found.');
         }
         return; // Continue polling on transient errors
      }

      const data = await response.json();
      addDebugLog('Polling: Data Parsed', { requestId, data });

      if (data.status === 'completed') {
        handleStopGeneration(); // Stop polling on completion
        handleSuccessfulResponse(data.result);
      } else if (data.status === 'failed') {
        handleStopGeneration(); // Stop polling on failure
        throw new Error(data.error || 'Generation task failed.');
      } else if (data.status === 'processing') {
        // Update progress if available
        const progress = data.progress || 'Task is processing';
        setGenerationStage(`Processing... (${progress})`);
        addDebugLog('Polling: Still Processing', { requestId, progress });
      } else {
         // Handle unexpected status
         console.warn('Unexpected status received:', data.status);
         setGenerationStage(`Unexpected status: ${data.status}`);
         addDebugLog('Polling: Unexpected Status', { requestId, status: data.status });
      }
    } catch (error: any) {
      console.error('Error during polling:', error);
      setError(`Error checking status: ${error.message}`);
      setGenerationStage('Error checking status');
      addDebugLog('Polling: Error', { requestId, error: error.message });
      handleStopGeneration(); // Stop polling on error
            setIsLoading(false);
    }
  };

  // --- Stop Polling/Generation --- //
  const handleStopGeneration = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
          addDebugLog('Stop Action: Aborted initial request');
      }
      if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          addDebugLog('Stop Action: Cleared polling interval');
      }
      // Reset state only if currently loading/generating
      if (isLoading) {
         setIsLoading(false);
         setGenerationStage('Stopped by user');
         addDebugLog('Stop Action: Resetting state');
         // Optionally set an error message
         // setError('Generation stopped by user.');
      }
  };

  const handleSuccessfulResponse = (data: any) => {
    addDebugLog('Response Handler: Success', { data });
    if (!data) {
      // Still throw error if the entire data object is missing
      setError('Empty response received from API');
      setGenerationStage('Error: Received empty response');
      setIsLoading(false);
      addDebugLog('Response Handler: Error - Empty data object');
      return; // Exit early
    }
    
    // Validate that we have *some* content data, less strictly
    // Check if content is a non-empty string OR if sections is a non-empty array
    const hasSomeContent = (data.content && typeof data.content === 'string' && data.content.trim().length > 0) || 
                         (Array.isArray(data.sections) && data.sections.length > 0);

    
    if (!hasSomeContent) {
      addDebugLog('API response validation failed (Relaxed Check)', { 
        contentPresent: !!data.content,
        contentType: typeof data.content,
        contentLength: data.content?.length || 0,
        sectionsPresent: Array.isArray(data.sections),
        sectionsCount: data.sections?.length || 0
      });
      
      // Updated error message for clarity
      setError('Generated content was empty or missing. Please try regenerating, perhaps with different settings.');
      setGenerationStage('Error: Generated content appears empty');
      setIsLoading(false);
      return; // Exit early
    }
    
    // Ensure sections is always an array, even if empty or missing initially
    const sections = Array.isArray(data.sections) ? data.sections : [];
    // Ensure content is a string, default to empty if missing or wrong type
    const content = (data.content && typeof data.content === 'string') ? data.content : '';

    // Prepare the data structure expected by the rest of the app
    const structuredData = {
       ...data, // Keep original debug info etc.
       content: content, // Use sanitized content
       sections: sections // Use sanitized sections
    };

    // Store the structured generated docs
    setGeneratedDocs(structuredData);
    setGenerationStage('Generation complete!');
    setIsLoading(false);
    
    // Dispatch the generation success event with the structured data
    const successEvent = new CustomEvent('cookfast:generationSuccess', {
      detail: structuredData // Pass the cleaned-up data
    });
    
    // Add debug log for the event dispatch
    addDebugLog('Dispatching generationSuccess event (Relaxed Validation)', {
      sectionsCount: structuredData.sections?.length || 0,
      contentLength: structuredData.content?.length || 0,
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

  // --- JSX Rendering --- //
  return (
    <section id="generator" className="py-16 md:py-24 bg-muted/40 dark:bg-muted/10">
      <div className="container max-w-6xl mx-auto px-4">
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
            <CardTitle className="text-3xl font-bold text-center">Generate Your Project Docs</CardTitle>
            <CardDescription className="text-center mt-2">
              Fill in your project details, select documents, choose your AI, and let CookFast handle the rest!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            {/* Use EnhancedForm for inputs */}
            <EnhancedForm 
                onSubmit={handleFormSubmit} // Pass the submit handler
                isLoading={isLoading} // Pass loading state
              keyValidationStatus={keyValidationStatus}
              keyValidationError={keyValidationError}
              validateKey={validateKey}
              isValidatingKey={isValidatingKey}
            />

            {/* Loading and Status Indicator */}
            {isLoading && (
              <div className="mt-6 text-center p-4 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-center mb-2">
                  <SpinnerIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  <p className="font-semibold text-blue-700 dark:text-blue-300">Generating Documents...</p>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">{generationStage || 'Please wait...'}</p>
                {/* Add Stop Button Here */}
                <div className="mt-4">
                   <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleStopGeneration}
                      disabled={!isLoading} // Disable if not loading
                   >
                      Stop Generation
                   </Button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && !isLoading && ( // Only show error if not loading
              <div className="mt-6 text-center p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
                <p className="font-semibold text-red-700 dark:text-red-300">Error</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

          </CardContent>
          
          {/* Debug Panel Toggle - Moved outside CardContent */}
          <CardFooter className="p-4 bg-muted/30 dark:bg-muted/5 border-t justify-center">
             <Button variant="ghost" size="sm" onClick={() => setShowDebugLogs(!showDebugLogs)}>
                {showDebugLogs ? 'Hide' : 'Show'} Debug Logs
             </Button>
          </CardFooter>

          {/* Debug Panel */} 
          {showDebugLogs && (
            <div className="bg-gray-800 text-white p-4 max-h-60 overflow-y-auto text-xs font-mono">
              <h4 className="font-bold mb-2">Debug Logs</h4>
              {debugLogs.length > 0 ? (
                debugLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap mb-1">
                    <span className="text-gray-400">[{log.timestamp}]</span> {log.event}: {JSON.stringify(log.details, null, 2)}
                  </div>
                ))
              ) : (
                <p>No logs yet.</p>
              )}
            </div>
          )}
        </Card>

        {/* Social Sharing Section */}
        <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold mb-4">Like CookFast? Share it!</h3>
            <div className="flex justify-center gap-3">
                {/* Twitter/X */}
                <Button variant="outline" size="icon" onClick={() => handleShare('x')} aria-label="Share on X">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg>
                </Button>
                {/* Facebook */}
                <Button variant="outline" size="icon" onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
                    <FacebookIcon className="h-5 w-5" />
                </Button>
                {/* WhatsApp */}
                <Button variant="outline" size="icon" onClick={() => handleShare('whatsapp')} aria-label="Share on WhatsApp">
                    <WhatsAppIcon className="h-5 w-5" />
                </Button>
                {/* Telegram */}
                <Button variant="outline" size="icon" onClick={() => handleShare('telegram')} aria-label="Share on Telegram">
                    <TelegramIcon className="h-5 w-5" />
                </Button>
                 {/* LinkedIn */}
                <Button variant="outline" size="icon" onClick={() => {/* Add LinkedIn share handler */}} aria-label="Share on LinkedIn">
                   <LinkedInIcon className="h-5 w-5" />
                </Button>
                {/* Email */}
                <Button variant="outline" size="icon" onClick={() => handleShare('email')} aria-label="Share via Email">
                    <EmailIcon className="h-5 w-5" />
                </Button>
                {/* Copy Link */}
                <Button variant="outline" size="icon" onClick={() => handleShare('link')} aria-label="Copy Link">
                    <LinkIcon className="h-5 w-5" />
                </Button>
            </div>
          {/* Copy Notification */}
          {showCopyNotification && (
                <p className="text-sm text-green-600 mt-2">Link copied to clipboard!</p>
          )}
        </div>
      </div>
    </section>
  );
}
