/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, Fragment, useEffect } from 'react';
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

// --- Main Page Component --- //
export default function CookFastHome() {
  // State for current panel, to show wizard UI flow
  const [currentPanel, setCurrentPanel] = useState<PanelState>('intro');
  const [isWaitingForCompletion, setIsWaitingForCompletion] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [workPhase, setWorkPhase] = useState<WorkPhase>('preparing');
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

  // Get current theme from context
  const { theme } = useTheme();

  // --- Handlers ---
  const addDebugLog = (event: string, details: unknown = {}) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prevLogs => [...prevLogs, { timestamp, event, details }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addDebugLog('Generation Started', { projectDetails, selectedDocs, provider: selectedProvider });
    
    // Check if at least one document is selected
    const hasSelectedDoc = Object.values(selectedDocs).some(value => value);
    if (!hasSelectedDoc) {
      setError('Please select at least one document type to generate.');
      addDebugLog('Generation Failed', { reason: 'No documents selected' });
      return;
    }

    // Validate required fields
    if (!projectDetails.projectName || !projectDetails.projectGoal) {
      setError('Project Name and Project Goal are required fields.');
      addDebugLog('Generation Failed', { reason: 'Missing required fields', missingFields: { name: !projectDetails.projectName, goal: !projectDetails.projectGoal } });
      return;
    }

    // Validate API key
    if (!userApiKey.trim()) {
      setError('API key is required.');
      addDebugLog('Generation Failed', { reason: 'API key not provided' });
      return;
    }

    // Start generation process
    setIsLoading(true);
    setError('');
    setResults('');
    setGeneratedMarkdown('');
    
    // Set initial generation stage
    setGenerationStage('Preparing request');
    
    try {
      // Update status for better user feedback
      setGenerationStage('Constructing prompt');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UI update
      
      addDebugLog('Sending Generation Request', { provider: selectedProvider, endpoint: '/api/generate-docs' });
      
      setGenerationStage(`Sending request to ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} API`);
      await new Promise(resolve => setTimeout(resolve, 800)); // Small delay for UI update
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // Match the 10-minute timeout
      
      setGenerationStage(`Generating documents with ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}...`);
      
      // Function to update status during generation
      const statusUpdateInterval = setInterval(() => {
        // Rotate through status messages to show progress
        setGenerationStage(prevStage => {
          const stages = [
            `Processing project details with ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}`,
            `Creating documentation structure`,
            `Generating comprehensive documentation`,
            `Finalizing ${Object.entries(selectedDocs).filter(([, value]) => value).length} document sections`,
            `Applying markdown formatting`
          ];
          
          const currentIndex = stages.indexOf(prevStage);
          if (currentIndex === -1 || currentIndex === stages.length - 1) {
            return stages[0];
          } else {
            return stages[currentIndex + 1];
          }
        });
      }, 5000); // Update every 5 seconds
      
      const response = await fetch('/api/generate-docs', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ projectDetails, selectedDocs, provider: selectedProvider, apiKey: userApiKey }),
        signal: controller.signal
      });
      
      // Clear the status update interval
      clearInterval(statusUpdateInterval);
      clearTimeout(timeoutId);

      setGenerationStage('Processing response');
      addDebugLog('Generation Response Received', { status: response.status });
      const data = await response.json();

      if (response.ok) {
        setGenerationStage('Generation complete!');
        setResults(data.message);
        setGeneratedMarkdown(data.content);

        // Use server-parsed sections if available, otherwise parse client-side
        if (data.sections && data.sections.length > 0) {
          setDocumentSections(data.sections);
          addDebugLog('Using server-parsed sections', { count: data.sections.length });
        } else {
          // Fallback to client-side parsing if the API didn't return sections
          parseMarkdownSections(data.content);
          addDebugLog('Falling back to client-side parsing');
        }

        // Add generation time to the result message if available
        if (data.debug?.processingTimeMs) {
          const processingTimeSeconds = Math.round(data.debug.processingTimeMs / 1000);
          setResults(`${data.message} (Generated in ${processingTimeSeconds} seconds)`);
        }
        addDebugLog('Generation Successful', { messageLength: data.message.length, contentLength: data.content.length });
      } else {
        setGenerationStage('Generation failed');
        setError(data.error || 'Failed to generate documentation. Please try again.');
        addDebugLog('Generation Failed', { error: data.error, code: data.code });
      }
    } catch (error) {
      console.error('Error generating documentation:', error);
      setGenerationStage('Connection error');
      setError('Error connecting to generation service. Please try again.');
      addDebugLog('Generation Error', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Utility Functions --- // (Keep utilities)
  const formatLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/ Doc$/, ' Document').trim();

  // Parse markdown content into sections based on H1 headers
  const parseMarkdownSections = (markdown: string): void => {
    // Don't attempt to parse during SSR
    if (typeof window === 'undefined') return;
    
    if (!markdown) {
      setDocumentSections([]); // Clear sections if markdown is empty
      return;
    }
    
    const sections: Array<{title: string, content: string}> = [];
    const regex = /^# (.+)$/gm;
    let match;
    let lastIndex = 0;
    let lastTitle = '';
    
    // Find all matches
    while ((match = regex.exec(markdown)) !== null) {
      if (lastTitle) {
        const sectionContent = markdown.substring(lastIndex, match.index).trim();
        // Find the start of the content (skip the heading line itself)
        const contentStartIndex = sectionContent.indexOf('\n');
        const actualContent = contentStartIndex !== -1 ? sectionContent.substring(contentStartIndex + 1) : sectionContent; 
        sections.push({ title: lastTitle, content: actualContent.trim() });
      }
      lastTitle = match[1];
      lastIndex = match.index; // Store the index where the heading starts
    }
    
    if (lastTitle) {
      const sectionContent = markdown.substring(lastIndex).trim();
      // Find the start of the content (skip the heading line itself)
      const contentStartIndex = sectionContent.indexOf('\n');
      const actualContent = contentStartIndex !== -1 ? sectionContent.substring(contentStartIndex + 1) : sectionContent;
      sections.push({ title: lastTitle, content: actualContent.trim() });
    }
    
    if (sections.length === 0 && markdown.trim().length > 0) {
      sections.push({ title: 'Documentation', content: markdown });
    }
    
    setDocumentSections(sections); // Update state directly
  };
  
  // Helper function to download content as a file
  const downloadContent = (content: string, filename: string) => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    try {
      const blob = new Blob([content], {type: 'text/markdown'});
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Download failed:', err);
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
  const convertToJSON = (): ProjectJSON => {
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
        provider: selectedProvider,
        model: selectedProvider === 'gemini' ? 'gemini-2.5-pro-exp-03-25' : 
               selectedProvider === 'openai' ? 'gpt-4o' : 
               'claude-3-7-sonnet-20250219'
      }
    };
  };
  
  // Helper function to download JSON content
  const downloadJSON = () => {
    if (!generatedMarkdown || typeof window === 'undefined') return;
    
    try {
      const jsonData = convertToJSON();
      const jsonString = JSON.stringify(jsonData, null, 2);
      const filename = `${projectDetails.projectName.replace(/\s+/g, '-').toLowerCase() || 'project'}-docs.json`;
      
      // Create a blob from the JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });
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
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      addDebugLog('JSON Exported', { filename, byteSize: jsonString.length });
    } catch (err) {
      console.error('JSON export failed:', err);
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

  return (
    <Fragment>
      <Head>
        <title>CookFast | AI Documentation Generator</title>
        <meta name="description" content="CookFast uses AI to auto-generate project documentation, templates, and guides. Supports OpenAI, Anthropic, and Gemini." />
        <meta name="keywords" content="AI, documentation, templates, project generator, CookFast" />
        <meta name="author" content="Web Vijayi" />
        <meta property="og:title" content="CookFast | AI Documentation Generator" />
        <meta property="og:description" content="Generate project docs, templates, and guides with AI. Supports multiple AI providers." />
        <meta property="og:image" content="https://cook-fast.webvijayi.com/og-image.png" />
        <meta property="og:url" content="https://cook-fast.webvijayi.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@webvijayi" />
        <meta name="twitter:creator" content="@webvijayi" />
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CookFast",
            "url": "https://cook-fast.webvijayi.com/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://cook-fast.webvijayi.com/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }`}
        </script>
      </Head>

      {/* Main Content */}
      <AnimatedHero />
      <FeaturesGrid />
      <HowItWorksSection />
      <FaqSection />
      <GeneratorSection />

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed bottom-4 left-4 bg-secondary text-secondary-foreground p-2 rounded-full shadow-lg z-50 text-xs">
          Copied to clipboard!
        </div>
      )}
    </Fragment>
  );
}
