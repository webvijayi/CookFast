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

  // Handle form submission
  const handleSubmit = async () => {
    // Reset generatedDocs when starting a new generation
    setGeneratedDocs(null);
    
    // Additional validation before proceeding
    if (!projectDetails.projectName?.trim() || !projectDetails.projectGoal?.trim()) {
      setGenerationStage('Error: Missing required fields');
      return;
    }
    
    // Validate at least one document type is selected
    const hasSelectedDoc = Object.values(selectedDocs).some(Boolean);
    if (!hasSelectedDoc) {
      setGenerationStage('Error: No document types selected');
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
        
        // If we get here, we should have completed results
        setGenerationStage('Documents generated! Processing results...');
        
        // Get token usage data if available
        const tokensUsed = data.tokensUsed || data.result?.debug?.tokensUsed || {
          input: 0,
          output: 0,
          total: 0
        };
        
        // Process the results
        if (data.result) {
          setGeneratedDocs(data.result);
          setIsLoading(false);
          return true;
        }
      }
      
      // Schedule another check if we didn't get results yet
      setTimeout(() => checkForResults(requestId), 5000);
      return false;
    } catch (error) {
      console.error('Error checking for results:', error);
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
    
    // Store the generated docs directly
    setGeneratedDocs(data);
    setGenerationStage('Generation complete!');
    setIsLoading(false);
  };

  return (
    <section id="generator" className="py-12 md:py-16">
      <div className="container max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-8">Generate Project Documentation</h2>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Fill in your project details below to generate comprehensive documentation
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <EnhancedForm 
              projectDetails={projectDetails}
              setProjectDetails={setProjectDetails}
              selectedDocs={selectedDocs}
              setSelectedDocs={setSelectedDocs}
              provider={provider}
              setProvider={setProvider}
              apiKey={apiKey}
              setApiKey={setApiKey}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
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
              <div className="mt-8 p-6 border rounded-lg">
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
                        Generated {generatedDocs.sections.length} document sections with {generatedDocs.content?.length.toLocaleString()} characters
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="flex items-center justify-center mb-4 text-red-500">
                      <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h3 className="font-medium text-lg">No Content Generated</h3>
                    </div>
                    <p>The AI provider did not return any content. This could be due to an error or limitations with the provider.</p>
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

        {/* Share section - simplified */}
        <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-center flex justify-center items-center">
            <ShareIcon className="mr-2 h-5 w-5" /> Share CookFast
          </h3>
          <p className="text-center mb-6">
            Found CookFast helpful? Share it with your network! 🌟
          </p>
        </div>
      </div>
    </section>
  );
}
