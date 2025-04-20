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

const XIcon = ({ className = "h-5 w-5" }) => (
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
    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
  </svg>
);

const LinkIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
const SHARE_TEXT = "CookFast - AI-Powered Project Planning Documents";
const SHARE_TITLE = "CookFast: AI Doc Generator";
const SHARE_TEXT_ENCODED = encodeURIComponent(SHARE_TEXT);
const APP_URL_ENCODED = encodeURIComponent(APP_URL);
const TWITTER_HANDLE = "webvijayi";

// Add a new type for generated documentation
interface GeneratedDocumentation {
  message: string;
  content: string;
  sections?: DocumentSection[];
  debug?: {
    provider: string;
    model: string;
    timestamp: string;
    contentLength: number;
    processingTimeMs: number;
    sectionsCount?: number;
  };
}

// The main generator section with the form interface
export default function GeneratorSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  // Add a state for storing generated documentation
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocumentation | null>(null);

  // Add debug log
  const addDebugLog = (event: string, details: unknown = {}) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prevLogs => [...prevLogs, { timestamp, event, details }]);
  };

  // Event listener for generation status updates
  useEffect(() => {
    const handleStatusUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { stage, details } = customEvent.detail;
      
      setGenerationStage(stage);
      if (details) {
        addDebugLog('Generation Status', { stage, ...details });
        
        // Check for specific error types and provide helpful messages
        if (stage.includes('Error') && details.error) {
          // Handle the error display
          console.error('Generation error:', details.error);
          
          // Check for missing required fields error
          if (details.error.includes('Missing required fields')) {
            setGenerationStage(`Error: Please fill out all required fields. ${details.error}`);
          } else if (details.error.includes('API Key')) {
            setGenerationStage(`Error: API Key issue. ${details.error}`);
          } else {
            setGenerationStage(`Error: ${details.error}`);
          }
        }
      }
    };
    
    const handleGenerationSuccess = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setGeneratedDocs(customEvent.detail);
        addDebugLog('Generation Success', { 
          contentLength: customEvent.detail.content?.length || 0,
          sectionsCount: customEvent.detail.sections?.length || 0
        });
      }
    };
    
    document.addEventListener('cookfast:generationStatus', handleStatusUpdate);
    document.addEventListener('cookfast:generationSuccess', handleGenerationSuccess);
    
    return () => {
      document.removeEventListener('cookfast:generationStatus', handleStatusUpdate);
      document.removeEventListener('cookfast:generationSuccess', handleGenerationSuccess);
    };
  }, []);

  // Handler for form submission
  const handleSubmit = async (
    projectDetails: ProjectDetails,
    selectedDocs: DocumentSelection,
    provider: AIProvider,
    apiKey: string
  ) => {
    console.log("GeneratorSection handleSubmit called", { 
      projectDetails,
      projectName: projectDetails.projectName,
      projectGoal: projectDetails.projectGoal,
      provider,
      selectedDocs
    });
    
    // Reset generatedDocs when starting a new generation
    setGeneratedDocs(null);
    
    // Additional validation before proceeding
    if (!projectDetails.projectName?.trim() || !projectDetails.projectGoal?.trim()) {
      console.error("Required fields missing in GeneratorSection:", {
        projectName: projectDetails.projectName, 
        projectGoal: projectDetails.projectGoal
      });
      
      setGenerationStage('Error: Missing required fields');
      addDebugLog('Validation Error', { 
        error: 'Missing required fields',
        missingFields: [
          !projectDetails.projectName?.trim() ? 'projectName' : null,
          !projectDetails.projectGoal?.trim() ? 'projectGoal' : null
        ].filter(Boolean)
      });
      return;
    }
    
    // Validate at least one document type is selected
    const hasSelectedDoc = Object.values(selectedDocs).some(Boolean);
    if (!hasSelectedDoc) {
      console.error("No document types selected");
      setGenerationStage('Error: No document types selected');
      addDebugLog('Validation Error', { 
        error: 'No document types selected',
        selectedDocs: selectedDocs
      });
      return;
    }
    
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
    
    // Log that we're submitting the form
    addDebugLog('Form Submitted', { 
      provider, 
      projectDetails: sanitizedProjectDetails,
      projectName: sanitizedProjectDetails.projectName,
      projectGoal: sanitizedProjectDetails.projectGoal,
      selectedDocs: selectedDocs
    });
    
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
          requestId // Include requestId to track this specific request
        })
      });
      
      // Check for initial response status
      if (response.status === 202) {
        // This is the expected status for background functions
        setGenerationStage('Request accepted - Processing in background (this may take a few minutes)...');
        addDebugLog('Background Processing Started', { requestId, status: response.status });
        
        // Start polling for completion
        await pollForCompletion(requestId);
        return;
      }
      
      // Handle other response statuses
      if (!response.ok) {
        let errorDetails = `HTTP error! Status: ${response.status}`;
        try {
          // Attempt to parse error details from the response body
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.message || errorDetails;
          if (errorData.details) {
             errorDetails += ` - ${errorData.details}`;
          }
          addDebugLog('API Error Response', { status: response.status, errorData });
        } catch (parseError) {
          // If parsing fails, use the original HTTP error
          console.error('Could not parse error response body', parseError);
          addDebugLog('API Error - Non-JSON Response', { status: response.status });
        }
        throw new Error(errorDetails);
      }
      
      // If we got here, it means the function ran synchronously (not as a background function)
      const data = await response.json();
      handleSuccessfulResponse(data);
      
    } catch (error) {
      console.error('Error generating documentation:', error);
      setGenerationStage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addDebugLog('Generation Error', { error: error instanceof Error ? error.message : String(error) });
      setIsLoading(false);
    }
  };
  
  // Handle successful API response
  const handleSuccessfulResponse = (data: any) => {
    // Safety checks and error handling
    if (!data) {
      throw new Error('Empty response received from API');
    }
    
    // Ensure we have at least content or sections 
    if (!data.content && (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0)) {
      console.warn('API response missing both content and sections', data);
      
      // Create an error message for the user
      setGenerationStage('Error: Generated content is incomplete. Try again with different parameters.');
      addDebugLog('Incomplete API Response', { 
        hasContent: Boolean(data.content),
        hasSections: Boolean(data.sections),
        responseKeys: Object.keys(data)
      });
      throw new Error('API response missing both content and sections');
    }
    
    // Store the generated docs directly
    setGeneratedDocs(data);
    
    // Make sure documentSections are available for rendering
    if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
      console.log('Received sections:', data.sections.length);
      addDebugLog('Documentation Sections', { 
        count: data.sections.length,
        titles: data.sections.map((s: DocumentSection) => s.title)
      });
    } else {
      // If no sections found, log a warning but do not create a fallback
      console.warn('No sections found in the API response.', data);
      addDebugLog('Warning: No Sections Received', { 
        hasContent: Boolean(data.content),
        responseKeys: Object.keys(data)
      });
      // Ensure sections is an empty array if not provided or invalid
      data.sections = []; 
    }
    
    // Dispatch custom event with the generated data
    const successEvent = new CustomEvent('cookfast:generationSuccess', {
      detail: data
    });
    document.dispatchEvent(successEvent);
    
    setGenerationStage('Generation complete!');
    setIsLoading(false);
  };
  
  // Poll for background function completion
  const pollForCompletion = async (requestId: string) => {
    try {
      // Since Netlify's background functions on the free plan don't have a true status endpoint,
      // we'll show a user-friendly message instead
      setGenerationStage(`Your request has been accepted and is processing in the background.`);
      
      // Call our check-status endpoint once to get any helpful information
      try {
        const statusResponse = await fetch(`/api/check-status?requestId=${requestId}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          // Update with more specific information if we have it
          setGenerationStage(statusData.message || 'Request is being processed in the background.');
        }
      } catch (statusError) {
        // Just log the error, but continue showing the background processing message
        console.error('Error checking initial status:', statusError);
        addDebugLog('Status Check Error', { error: statusError instanceof Error ? statusError.message : String(statusError) });
      }
      
      // Display background processing notice
      displayBackgroundProcessingNotice(requestId);
      setIsLoading(false); // Stop loading spinner
      
      return true;
    } catch (error) {
      console.error('Error during background processing setup:', error);
      setGenerationStage(`Error: ${error instanceof Error ? error.message : 'Unknown error during background processing'}`);
      addDebugLog('Background Processing Error', { requestId, error: error instanceof Error ? error.message : String(error) });
      setIsLoading(false);
      return false;
    }
  };

  // Display background processing notice to the user
  const displayBackgroundProcessingNotice = (requestId: string) => {
    // Create a user-friendly message for background processing
    const backgroundMessage = (
      <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-foreground">
        <h3 className="font-semibold mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Background Processing in Progress
        </h3>
        <p className="mb-2">
          Your document generation request has been accepted and is now processing in the background. 
          <span className="font-medium">This may take several minutes</span> to complete due to the 
          complexity of the AI generation process.
        </p>
        <p className="mb-2">
          <strong>Request ID:</strong> <span className="font-mono text-xs bg-background px-1 py-0.5 rounded">{requestId}</span>
        </p>
        <p className="mb-3">
          When the processing is complete, the results will be available on this page. You have two options:
        </p>
        <ol className="list-decimal pl-5 mb-2 space-y-1">
          <li>Leave this page open and check back later</li>
          <li>Refresh the page in a few minutes to see your results</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-2">
          Note: Because you're using the Netlify free plan, real-time progress updates are not available. 
          This is normal behavior for background functions on the free tier.
        </p>
      </div>
    );
    
    // Update UI to show the message - we store this differently to avoid type errors
    const backgroundProcessingInfo = {
      message: 'Background processing started',
      content: backgroundMessage, // Store the JSX content directly
      sections: [],
      debug: {
        provider: 'background',
        model: 'background-processing',
        timestamp: new Date().toISOString(),
        contentLength: 0,
        processingTimeMs: 0
      },
      isBackgroundProcessing: true, // Special flag for background processing
      requestId: requestId
    };
    
    // @ts-ignore - We're adding custom properties for background processing
    setGeneratedDocs(backgroundProcessingInfo);
    
    // Dispatch event to notify parent components
    const successEvent = new CustomEvent('cookfast:generationAccepted', {
      detail: {
        requestId,
        backgroundProcessing: true
      }
    });
    document.dispatchEvent(successEvent);
  };

  // Handler for API key validation
  const validateKey = async (apiKey: string, provider: AIProvider) => {
    setIsValidatingKey(true);
    setKeyValidationError(null);
    addDebugLog('Key Validation Started', { provider });
    
    try {
      // Make the API call to validate the key
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey })
      });
      
      const data = await response.json();
      
      setKeyValidationStatus(data.valid ? 'valid' : 'invalid');
      if (!data.valid) {
        setKeyValidationError(data.error || 'Invalid API key');
        addDebugLog('Key Validation Failed', { reason: data.error });
      } else {
        addDebugLog('Key Validation Success', { provider });
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setKeyValidationStatus('invalid');
      setKeyValidationError('Failed to validate API key');
      addDebugLog('Key Validation Error', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsValidatingKey(false);
    }
  };

  // Helper function to copy content to clipboard
  const copyToClipboard = (content: string) => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    navigator.clipboard.writeText(content).then(
      () => {
        // Show a temporary success message
        setShowCopyNotification(true);
        setTimeout(() => {
          setShowCopyNotification(false);
        }, 2000);
        addDebugLog('Copied to Clipboard', { content: content.substring(0, 50) + '...' });
      },
      (err) => {
        console.error('Failed to copy text: ', err);
        addDebugLog('Copy Failed', { error: err instanceof Error ? err.message : String(err) });
      }
    );
  };

  // Sharing handlers
  const handleShare = (platform: 'x' | 'facebook' | 'whatsapp' | 'telegram' | 'email' | 'link') => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    let url = '';
    const shareTitleEncoded = encodeURIComponent(SHARE_TITLE);
    const shareBodyEncoded = encodeURIComponent(`${SHARE_TEXT}\n\nCheck it out: ${APP_URL}`);
  
    switch (platform) {
      case 'x':
        url = `https://x.com/intent/tweet?text=${SHARE_TEXT_ENCODED}&url=${APP_URL_ENCODED}${TWITTER_HANDLE ? `&via=${TWITTER_HANDLE}` : ''}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${APP_URL_ENCODED}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${SHARE_TEXT_ENCODED}%20${APP_URL_ENCODED}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${APP_URL_ENCODED}&text=${SHARE_TEXT_ENCODED}`;
        break;
      case 'email':
        url = `mailto:?subject=${shareTitleEncoded}&body=${shareBodyEncoded}`;
        break;
      case 'link':
        copyToClipboard(APP_URL);
        // Optionally show a specific notification for link copying
        addDebugLog('Link Copied for Sharing', { url: APP_URL });
        return; // Don't open a new window for link copying
    }
  
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      addDebugLog('Shared via', { platform });
    } else {
      addDebugLog('Share Failed', { platform, reason: 'No URL generated' });
    }
  };

  // Handler for JSON download
  const handleDownloadJSON = () => {
    if (!generatedDocs) return;
    
    try {
      // Create a JSON blob
      const jsonData = JSON.stringify(generatedDocs, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedDocs.debug?.provider || 'ai'}-documentation-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addDebugLog('Downloaded JSON', { 
        filename: a.download,
        size: jsonData.length
      });
    } catch (error) {
      console.error('Error downloading JSON:', error);
      addDebugLog('JSON Download Error', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <section id="generate" className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">Generate Your Documentation 📑</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fill in your project details below and let AI create comprehensive documentation for you.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 pb-4">
              <CardTitle className="flex items-center">
                <span className="mr-2">✨</span> Project Documentation Generator
              </CardTitle>
              <CardDescription>
                Enter your project details and select the types of documentation you need.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <EnhancedForm 
                onSubmit={handleSubmit}
                isLoading={isLoading}
                generationStage={generationStage}
                keyValidationStatus={keyValidationStatus}
                keyValidationError={keyValidationError}
                validateKey={validateKey}
                isValidatingKey={isValidatingKey}
              />
              
              {/* Status display when loading */}
              {isLoading && (
                <div className="mt-8 p-4 border border-indigo-100 dark:border-indigo-900 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                  <div className="flex items-center mb-3">
                    <SpinnerIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                    <h3 className="font-medium text-indigo-700 dark:text-indigo-300">
                      {generationStage || 'Processing your request...'}
                    </h3>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    This may take a couple of minutes depending on the AI provider and document complexity.
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <button 
                      onClick={() => setShowDebugLogs(!showDebugLogs)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
                    >
                      {showDebugLogs ? 'Hide' : 'Show'} debug logs
                    </button>
                    
                    <span className="text-xs text-gray-500">
                      {debugLogs.length} log entries
                    </span>
                  </div>
                  
                  {/* Debug logs section */}
                  {showDebugLogs && (
                    <div className="mt-3 max-h-[300px] overflow-y-auto">
                      <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        {debugLogs.map((log, index) => (
                          <div key={index} className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <div className="text-gray-500 dark:text-gray-400">
                              {new Date(log.timestamp).toLocaleTimeString()} - {log.event}
                            </div>
                            <div className="mt-1 text-gray-700 dark:text-gray-300 break-all">
                              {JSON.stringify(log.details, null, 2)}
                            </div>
                          </div>
                        ))}
                        
                        {debugLogs.length === 0 && (
                          <div className="text-gray-500 dark:text-gray-400">No logs yet</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Success state with download options */}
              {!isLoading && generatedDocs && (
                <div className="mt-8 p-6 border border-green-200 dark:border-green-900 rounded-lg bg-green-50 dark:bg-green-900/30">
                  <div className="flex items-center mb-4">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="font-medium text-lg text-green-700 dark:text-green-300">
                      Documentation Generated Successfully!
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <Button 
                      onClick={handleDownloadJSON}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                    >
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download JSON
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => copyToClipboard(generatedDocs.content)}
                      className="border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/50 flex items-center"
                    >
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to Clipboard
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-sm text-green-600 dark:text-green-400">
                    <p>Generated using {generatedDocs.debug?.provider || 'AI'} in {((generatedDocs.debug?.processingTimeMs || 0) / 1000).toFixed(2)} seconds</p>
                    <p className="mt-1">Content length: {generatedDocs.content?.length.toLocaleString()} characters • {generatedDocs.sections?.length || 0} sections</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6 text-sm text-muted-foreground">
              <div>Need help? Check our <a href="#faq" className="underline">FAQ</a> section.</div>
              <div>Using AI responsibly ✨</div>
            </CardFooter>
          </Card>

          {/* Share section */}
          <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-center flex justify-center items-center">
              <ShareIcon className="mr-2 h-5 w-5" /> Share CookFast
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Found CookFast helpful? Share it with your network! 🌟
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                className="bg-background hover:bg-muted flex items-center" 
                size="sm"
                onClick={() => handleShare('x')}
              >
                <XIcon className="mr-2" /> Twitter
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