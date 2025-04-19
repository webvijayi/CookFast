/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, Fragment, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedHero from '@/components/AnimatedHero';
import { FeaturesGrid } from '@/components/FeatureCard';
import EnhancedForm from '@/components/EnhancedForm';
import HowItWorksSection from '@/components/HowItWorksSection';
import FaqSection from '@/components/FaqSection';
import GeneratorSection from '@/components/GeneratorSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GenerationLogs from '@/components/GenerationLogs';
import { AlertTriangleIcon } from "@/components/icons/AlertTriangleIcon";

// Add a simple toast implementation since there's no toast component
// This is a very basic implementation that will be used only for this file
const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      const toastElement = document.createElement('div');
      toastElement.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50';
      toastElement.textContent = message;
      document.body.appendChild(toastElement);
      setTimeout(() => {
        toastElement.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => document.body.removeChild(toastElement), 300);
      }, 3000);
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      const toastElement = document.createElement('div');
      toastElement.className = 'fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50';
      toastElement.textContent = message;
      document.body.appendChild(toastElement);
      setTimeout(() => {
        toastElement.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => document.body.removeChild(toastElement), 300);
      }, 3000);
    }
  }
};

// Dynamically import the MarkdownRenderer to avoid SSR issues
const MarkdownRenderer = dynamic(() => import('../components/MarkdownRenderer'), {
  ssr: false,
  loading: () => <div className="p-4 border rounded">Loading markdown renderer...</div>
});

// Add a client-side only wrapper component
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return <div className="p-4 border rounded">Loading content...</div>;
  }
  
  return <>{children}</>;
};

// Type definitions for this file
interface ProjectDetails {
  projectName: string;
  projectType: string;
  projectGoal: string;
  features: string;
  techStack: string;
  hasBackend?: boolean;
  hasFrontend?: boolean;
  projectDescription?: string;
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

// Define application state types
type PanelState = 'intro' | 'details' | 'docs' | 'results';
type WorkPhase = 'preparing' | 'generating' | 'complete' | 'error';
type ModelProvider = 'gemini' | 'openai' | 'anthropic';

interface ModelConfig {
  provider: ModelProvider;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

interface DebugLog {
  timestamp: string;
  event: string;
  details: unknown;
}

interface ProjectJSON {
  project: ProjectDetails;
  documents: {
    [key: string]: {
      content: string;
      sections: DocumentSection[];
    };
  };
  metadata: {
    generatedWith: string;
    timestamp: string;
    provider?: string;
    model?: string;
  };
}

// Define the AI providers
type AIProvider = 'gemini' | 'openai' | 'anthropic';

// --- Constants ---
const APP_URL = "https://cook-fast.webvijayi.com/"; // Your app's URL
const SHARE_TEXT = "CookFast - AI-Powered Project Planning Documents"; // Base text
const SHARE_TITLE = "CookFast: AI Doc Generator"; // Used for email subject/web share title
const SHARE_TEXT_ENCODED = encodeURIComponent(SHARE_TEXT);
const APP_URL_ENCODED = encodeURIComponent(APP_URL);
const TWITTER_HANDLE = "webvijayi"; // Optional: Your Twitter handle

// --- SVG Icons ---
const SpinnerIcon = ({ className = "h-4 w-4 text-white" }: { className?: string }) => ( <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const GenerateIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm10 7H5v6h10V9z" clipRule="evenodd" /></svg> );
const JsonIcon = ({ className = "h-5 w-5" }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg> );
// --- End SVG Icons ---

// Social Media Icon Props interface
interface SocialIconProps {
  className?: string;
}

// Social Share Icons - Component Definitions
const ShareIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
  </svg>
);

const XIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
  </svg>
);

const FacebookIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const TelegramIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const EmailIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
  </svg>
);

const LinkIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

// --- Section Components ---

// Define a ResultsPanel component to display generated documentation
const ResultsPanel = ({ 
  documentSections, 
  generatedMarkdown, 
  onDownload,
  onCopy,
  onDownloadJSON,
  onReset,
  theme,
  debugInfo
}: { 
  documentSections: DocumentSection[] | undefined,
  generatedMarkdown: string | undefined,
  onDownload: () => void,
  onCopy: () => void,
  onDownloadJSON: (debugInfo: any) => void,
  onReset: () => void,
  theme?: string,
  debugInfo?: any
}) => {
  // Safety checks for missing data
  const hasDocumentSections = documentSections && Array.isArray(documentSections) && documentSections.length > 0;
  const hasGeneratedMarkdown = generatedMarkdown && generatedMarkdown.trim().length > 0;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Generated Documentation</h2>
        <p className="text-muted-foreground">Your documentation has been successfully generated!</p>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={onDownload} disabled={!hasGeneratedMarkdown && !hasDocumentSections}>
            Download Markdown
          </Button>
          <Button variant="outline" onClick={onCopy} disabled={!hasGeneratedMarkdown && !hasDocumentSections}>
            Copy to Clipboard
          </Button>
          <Button variant="outline" onClick={() => onDownloadJSON(debugInfo)} disabled={!hasGeneratedMarkdown && !hasDocumentSections}>
            Download as JSON
          </Button>
          <Button variant="default" onClick={onReset}>
            Generate New Documentation
          </Button>
        </div>
        
        {hasDocumentSections ? (
          <Tabs defaultValue={documentSections[0].title} className="w-full">
            <TabsList className="mb-6 w-full flex-wrap justify-start overflow-x-auto">
              {documentSections.map((section) => (
                <TabsTrigger key={section.title} value={section.title} className="px-4 py-2">
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {documentSections.map((section) => (
              <TabsContent key={section.title} value={section.title} className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ClientOnly>
                      <MarkdownRenderer content={section.content} isDarkMode={theme === 'dark'} />
                    </ClientOnly>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : hasGeneratedMarkdown ? (
          <Card>
            <CardHeader>
              <CardTitle>Complete Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOnly>
                <MarkdownRenderer content={generatedMarkdown} isDarkMode={theme === 'dark'} />
              </ClientOnly>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-amber-600 dark:text-amber-400">
              <AlertTriangleIcon className="inline h-5 w-5 mr-1" />
              No documentation sections found. Regenerate or try with different parameters.
            </p>
          </div>
        )}
        
        {/* Generation logs display - moved outside tabs for visibility */}
        <GenerationLogs />
      </div>
    </div>
  );
};

// --- Main Page Component --- //
export default function CookFastHome() {
  // UI State
  const [activePanel, setActivePanel] = useState<PanelState>('intro');
  const [workPhase, setWorkPhase] = useState<WorkPhase>('preparing');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [estimatedTimeSeconds, setEstimatedTimeSeconds] = useState<number>(0);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [elapsedTimeSeconds, setElapsedTimeSeconds] = useState<number>(0);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>('anthropic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [currentSections, setCurrentSections] = useState<DocumentSection[]>([]);
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: '',
    projectGoal: '',
    features: '',
    techStack: '',
    hasBackend: false,
    hasFrontend: false,
    projectType: 'other'
  });
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  
  // Add missing state variables
  const [selectedDocs, setSelectedDocs] = useState<DocumentSelection>({
    requirements: true,
    frontendGuidelines: false,
    backendStructure: false,
    appFlow: false,
    techStackDoc: false,
    systemPrompts: false,
    fileStructure: false
  });
  const [userApiKey, setUserApiKey] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState('');

  // Add state to store actual provider/model used from API response
  const [actualProviderUsed, setActualProviderUsed] = useState<string | undefined>(undefined);
  const [actualModelUsed, setActualModelUsed] = useState<string | undefined>(undefined);
  const [debugInfo, setDebugInfo] = useState<any | undefined>(undefined);

  // Get current theme from context
  const { theme } = useTheme();

  // --- Handlers ---
  const addDebugLog = (event: string, details: unknown = {}) => {
    const timestamp = new Date().toISOString();
    const log = { timestamp, event, details };
    
    setDebugLogs(prevLogs => [...prevLogs, log]);
    
    // Store in session storage
    if (typeof window !== 'undefined') {
      try {
        const existingLogs = JSON.parse(sessionStorage.getItem('cookfast_debug_logs') || '[]');
        const updatedLogs = [...existingLogs, log];
        sessionStorage.setItem('cookfast_debug_logs', JSON.stringify(updatedLogs));
        
        // Emit event for other components
        document.dispatchEvent(new CustomEvent('cookfast:newLog', {
          detail: { log }
        }));
      } catch (error) {
        console.error('Error storing logs in session storage:', error);
      }
    }
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setProjectDetails(prev => ({ ...prev, [e.target.name]: e.target.value })); addDebugLog('Project Details Changed', { [e.target.name]: e.target.value }); };
  const handleDocSelectionChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string, checked: boolean } }) => {
      const target = e.target as { name: string, checked: boolean }; // Type assertion
      setSelectedDocs(prev => ({ ...prev, [target.name]: target.checked }));
      addDebugLog('Document Selection Changed', { [target.name]: target.checked });
  };
  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
      const target = e.target as { value: string }; // Type assertion
      const newProvider = target.value as AIProvider;
    setSelectedProvider(newProvider);
    setKeyValidationStatus('idle'); setKeyValidationError(null); setUserApiKey(''); // Clear key on provider change
    addDebugLog('Provider Changed', { provider: newProvider });
  };
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setUserApiKey(newApiKey);
    setKeyValidationStatus('idle'); setKeyValidationError(null); // Reset validation if key changes
    addDebugLog('API Key Changed', { provider: selectedProvider, keyLength: newApiKey.length });
  };

  const handleValidateKey = async () => {
    if (!userApiKey.trim()) { setKeyValidationError("API key cannot be empty."); setKeyValidationStatus('invalid'); addDebugLog('Validation Failed', { reason: 'Empty API key' }); return; }
    setIsValidatingKey(true); setKeyValidationStatus('idle'); setKeyValidationError(null); setError(null); setResults(null); // Clear other messages
    addDebugLog('Validation Started', { provider: selectedProvider, keyLength: userApiKey.length });

    try {
      addDebugLog('Sending Validation Request', { provider: selectedProvider, endpoint: '/api/validate-key' });
      const response = await fetch('/api/validate-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: selectedProvider, apiKey: userApiKey }) });

      addDebugLog('Validation Response Received', { status: response.status });
      const data = await response.json();

      if (response.ok && data.valid) {
        setKeyValidationStatus('valid');
        setKeyValidationError('');
        addDebugLog('Validation Successful', { provider: selectedProvider });
      } else {
        setKeyValidationStatus('invalid');
        setKeyValidationError(data.error || "Validation failed per API response.");
        addDebugLog('Validation Failed', { error: data.error });
      }
    } catch (err) {
      setKeyValidationStatus('invalid');
      setKeyValidationError(err instanceof Error ? err.message : "Network error or issue during validation request.");
      addDebugLog('Validation Error', { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsValidatingKey(false);
    }
  };

  // Track elapsed time during document generation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (workPhase === 'generating' && generationStartTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - generationStartTime) / 1000);
        setElapsedTimeSeconds(elapsed);
      }, 1000);
    } else if (workPhase === 'complete' || workPhase === 'error') {
      setGenerationStartTime(null);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [workPhase, generationStartTime]);
  
    const emitStatusUpdate = (stage: string, details?: string | object) => {
    // Record the event in debug logs
    addDebugLog(`Status Update: ${stage}`, typeof details === 'string' ? { message: details } : details);
    
    // Calculate progress percentage based on stage
    let progress = 0;
    
    switch (stage) {
      case 'Validating API Key':
        progress = 5;
        break;
      case 'Preparing to generate documents':
        progress = 10;
        break;
      case 'Generating documents':
        progress = 20; // This will be incremented during generation
        break;
      case 'Processing response':
        progress = 90;
        break;
      case 'Generation complete!':
        progress = 100;
        break;
      default:
        // If we have details with a progress value, use that
        if (typeof details === 'object' && details && 'progress' in details && typeof details.progress === 'number') {
          progress = details.progress as number;
        }
    }
    
    setGenerationProgress(progress);
      
    // Dispatch a custom event for status updates
    const statusEvent = new CustomEvent('cookfast:generationStatus', { 
      detail: { 
        stage, 
        details: typeof details === 'string' ? { message: details } : details,
        estimatedTimeSeconds,
        elapsedTimeSeconds,
      } 
    });
    
    document.dispatchEvent(statusEvent);
  };

  // Event handlers and document processing
  useEffect(() => {
    const handleGenerationSuccess = (e: Event) => {
      try {
        const customEvent = e as CustomEvent;
        if (!customEvent.detail) {
          console.error('Generation success event received but no detail data was provided');
          setWorkPhase('error');
          addDebugLog('Error: Missing Generation Success Data');
          return;
        }
        
        const { content, sections, debug } = customEvent.detail;

        // Ensure we have at least content or sections
        if (!content && (!sections || !Array.isArray(sections) || sections.length === 0)) {
          console.error('Generation success event received but no content or sections were provided');
          setWorkPhase('error');
          addDebugLog('Error: Invalid Generation Success Data - No Content/Sections', { detail: customEvent.detail });
          // Optionally set generatedMarkdown to an error message or leave empty
          setGeneratedMarkdown('Error: Failed to generate valid documentation content.');
          setDocumentSections([]);
          return;
        }
        
        // Update state directly with the data from the API response
        // The API now provides the parsed sections, no need to re-parse here.
        setDocumentSections(sections || []); // Use API sections or empty array
        
        // Set the full markdown content. If content is missing but sections exist, reconstruct it.
        setGeneratedMarkdown(content || (sections || []).map((s: { title: string; content: string; }) => `# ${s.title}\n${s.content}`).join('\n\n'));
        
        // Update UI state
        setActivePanel('results');
        setWorkPhase('complete');
        
        // Store the actual provider/model used from the debug info
        if (debug) {
          setActualProviderUsed(debug.provider);
          setActualModelUsed(debug.model);
          setDebugInfo(debug);
        }
        
        addDebugLog('Generation Complete (UI Update)', { 
          contentLength: content?.length || 0,
          sectionsCount: sections?.length || 0,
          provider: debug?.provider,
          model: debug?.model // Log the model as well
        });
      } catch (error) {
        console.error('Error handling generation success event:', error);
        addDebugLog('Generation Success Handler Error', { 
          error: error instanceof Error ? error.message : String(error)
        });
        setWorkPhase('error');
        // Provide error feedback in the UI
        setGeneratedMarkdown('Error: An unexpected error occurred while processing the generated documentation.');
        setDocumentSections([]);
      }
    };
    
    document.addEventListener('cookfast:generationSuccess', handleGenerationSuccess);
    
    return () => {
      document.removeEventListener('cookfast:generationSuccess', handleGenerationSuccess);
    };
  }, []);

  // --- Utility Functions --- //
  const formatLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/ Doc$/, ' Document').trim();

  // Helper function to download content as a file
  const downloadContent = (content: string, filename: string) => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    try {
      const blob = new Blob([content], {type: 'text/markdown;charset=utf-8'}); // Ensure UTF-8 encoding
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none'; // Keep hidden
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up: Use setTimeout to allow download to initiate
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          addDebugLog('Download Cleanup Successful', { filename });
        } catch (cleanupError) {
           console.error('Error during download cleanup:', cleanupError);
           addDebugLog('Download Cleanup Error', { filename, error: String(cleanupError) });
        }
      }, 100); // 100ms delay 

    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to prepare download.');
      addDebugLog('Download Preparation Error', { filename, error: String(err) });
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
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  };
  
  // Function to convert markdown content to structured JSON
  const convertToJSON = (debugInfo: any): ProjectJSON => {
    // Create document structure based on sections
    const documentsObj: { [key: string]: { content: string, sections: DocumentSection[] } } = {};
    
    // Group sections by document type
    documentSections.forEach(section => {
      // Extract document type from section title
      const titleLower = section.title.toLowerCase();
      let docType = 'general';
      
      // Map section titles to document types
      if (titleLower.includes('requirement')) docType = 'requirements';
      else if (titleLower.includes('frontend')) docType = 'frontendGuidelines';
      else if (titleLower.includes('backend')) docType = 'backendStructure';
      else if (titleLower.includes('flow')) docType = 'appFlow';
      else if (titleLower.includes('tech stack')) docType = 'techStackDoc';
      else if (titleLower.includes('system prompt')) docType = 'systemPrompts';
      else if (titleLower.includes('file') && titleLower.includes('structure')) docType = 'fileStructure';
      
      // Initialize document type if it doesn't exist
      if (!documentsObj[docType]) {
        documentsObj[docType] = {
          content: '',
          sections: []
        };
      }
      
      // Add the section
      documentsObj[docType].sections.push(section);
      
      // Append to the full content
      if (documentsObj[docType].content) {
        documentsObj[docType].content += '\n\n';
      }
      documentsObj[docType].content += `# ${section.title}\n${section.content}`;
    });
    
    // Create the full JSON structure
    return {
      project: projectDetails,
      documents: documentsObj,
      metadata: {
        generatedWith: 'CookFast',
        timestamp: new Date().toISOString(),
        // Use passed debugInfo if available, otherwise fallback to state/defaults
        provider: debugInfo?.provider || actualProviderUsed || selectedProvider,
        model: debugInfo?.model || actualModelUsed || 'unknown' 
      }
    };
  };
  
  // Helper function to download JSON content
  const downloadJSON = (debugInfo: any) => {
    // Log the debug info being used for download
    console.log("Downloading JSON with debug info:", debugInfo);
    addDebugLog('JSON Download Triggered', { debugInfo });

    if (!generatedMarkdown && (!documentSections || documentSections.length === 0)) {
      toast.error('No documentation content available to download as JSON.');
      addDebugLog('JSON Download Aborted', { reason: 'No content' });
      return;
    }
    
    if (typeof window === 'undefined') return;
    
    try {
      const jsonData = convertToJSON(debugInfo); // Pass debugInfo here
      const jsonString = JSON.stringify(jsonData, null, 2);
      // Construct filename using provider from debugInfo or fallback
      const providerName = (jsonData.metadata.provider || 'ai').replace(/\s+/g, '-').toLowerCase();
      const baseFilename = (projectDetails.projectName?.trim() || providerName || 'documentation').replace(/\s+/g, '-').toLowerCase();
      const filename = `${baseFilename}-docs.json`;
      
      // Create a blob from the JSON string
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' }); // Ensure UTF-8
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          addDebugLog('JSON Download Cleanup Successful', { filename });
        } catch (cleanupError) {
           console.error('Error during JSON download cleanup:', cleanupError);
           addDebugLog('JSON Download Cleanup Error', { filename, error: String(cleanupError) });
        }
      }, 100); 
      
      addDebugLog('JSON Exported', { filename, byteSize: jsonString.length });
    } catch (err) {
      console.error('JSON export failed:', err);
      toast.error('Failed to prepare JSON download.');
      addDebugLog('JSON Download Error', { error: String(err) });
    }
  };
  
  // --- Sharing Handlers ---
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
        copyToClipboard(APP_URL); // Reuse existing copy function
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

  // Reset state to generate a new document
  const handleReset = () => {
    setGeneratedMarkdown('');
    setResults(null);
    setWorkPhase('preparing');
    setActivePanel('intro');
    setError(null);
    addDebugLog('Reset Form', { timestamp: new Date().toISOString() });
  };

  // Handle document download
  const handleDownload = () => {
    console.log('[handleDownload] Triggered'); // Log start
    addDebugLog('Download Markdown: Start');

    // Ensure generatedMarkdown has content and projectDetails are available for filename
    if (!generatedMarkdown || !generatedMarkdown.trim()) {
        console.error('[handleDownload] Error: No content available.');
        toast.error('No documentation content available to download.');
        addDebugLog('Download Markdown: Aborted', { reason: 'No content' });
        return;
    }
    console.log(`[handleDownload] Content length: ${generatedMarkdown.length}`);

    // Use a default project name if necessary for the filename
    const projectNameForFile = projectDetails?.projectName?.trim() || actualProviderUsed || 'documentation';
    console.log(`[handleDownload] Using project name for file: ${projectNameForFile}`);
    
    // Construct filename
    const baseFilename = projectNameForFile.replace(/\s+/g, '-').toLowerCase();
    const filename = `${baseFilename}.md`;
    console.log(`[handleDownload] Filename: ${filename}`);
    
    addDebugLog('Download Markdown: Initiated', { filename, length: generatedMarkdown.length });
    downloadContent(generatedMarkdown, filename); // Call the utility
    console.log('[handleDownload] downloadContent called'); // Log after calling utility
  };

  // Copy markdown to clipboard
  const handleCopy = () => {
    if (generatedMarkdown) {
      navigator.clipboard.writeText(generatedMarkdown)
        .then(() => {
          toast.success('Copied to clipboard!');
          addDebugLog('CopyToClipboard', { success: true, contentLength: generatedMarkdown.length });
          emitStatusUpdate('success', { message: 'Copied to clipboard!' });
        })
        .catch(err => {
          toast.error('Failed to copy to clipboard');
          addDebugLog('CopyToClipboard', { success: false, error: err.message });
          emitStatusUpdate('error', { message: 'Failed to copy to clipboard' });
        });
    }
  };

  return (
    <Fragment>
      <Head>
        <title>🍳🚀 CookFast | AI-Powered Project Documentation Generator - Free & Open Source</title>
        <meta name="description" content="🔥 Generate comprehensive project docs in seconds! CookFast is a free, open-source tool that transforms your project ideas into detailed documentation using AI. Supports OpenAI, Anthropic, and Gemini. Start cooking up your project faster! 📝✨" />
        <meta name="keywords" content="AI documentation generator, free documentation tool, project planning, technical documentation, OpenAI, Anthropic, Gemini, developer tool, markdown generator, project templates, open-source documentation, CookFast" />
        <meta name="author" content="Web Vijayi" />
        <meta property="og:title" content="🍳🚀 CookFast | AI-Powered Documentation Generator - Free & Open Source" />
        <meta property="og:description" content="🔥 Transform project ideas into detailed documentation in seconds! Free, open-source tool supporting multiple AI providers. Cook up your project faster! 📝✨" />
        <meta property="og:image" content="/cookfast%20og.png" />
        <meta property="og:url" content="https://cook-fast.webvijayi.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@webvijayi" />
        <meta name="twitter:creator" content="@webvijayi" />
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CookFast 🍳🚀",
            "description": "AI-powered documentation generator to instantly create comprehensive project plans, guidelines, and technical documentation.",
            "url": "https://cook-fast.webvijayi.com/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://cook-fast.webvijayi.com/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "keywords": "AI documentation, project planning, free tool, open-source"
          }`}
        </script>
      </Head>

      {/* Main Content */}
      <AnimatedHero />
      <FeaturesGrid />
      <HowItWorksSection />
      <FaqSection />
      
      {/* Show Generator or Results */}
      {activePanel === 'results' && (generatedMarkdown || (documentSections && documentSections.length > 0)) ? (
        <ResultsPanel 
          documentSections={documentSections}
          generatedMarkdown={generatedMarkdown}
          onDownload={handleDownload}
          onCopy={handleCopy}
          onDownloadJSON={downloadJSON}
          onReset={handleReset}
          theme={theme}
          debugInfo={debugInfo}
        />
      ) : (
        <GeneratorSection />
      )}

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed bottom-4 left-4 bg-secondary text-secondary-foreground p-2 rounded-full shadow-lg z-50 text-xs">
          Copied to clipboard!
        </div>
      )}
    </Fragment>
  );
}
