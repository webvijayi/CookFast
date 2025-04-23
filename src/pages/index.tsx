/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, Fragment, useEffect, useCallback, useRef } from 'react';
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
import { DocumentTabs } from '@/components/ui/document-tabs';
import DocumentTypeSection from '@/components/DocumentTypeSection';

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
const SHARE_TEXT = "🍳🚀 CookFast - Free AI-Powered Project Documentation Generator. Transform your ideas into detailed docs in seconds!"; // Base text
const SHARE_TITLE = "🍳🚀 CookFast: AI Doc Generator - Free & Open Source"; // Used for email subject/web share title
const SHARE_TEXT_ENCODED = encodeURIComponent(SHARE_TEXT);
const APP_URL_ENCODED = encodeURIComponent(APP_URL);
const TWITTER_HANDLE = "webvijayi"; // Optional: Your Twitter handle

// Site URLs for OpenGraph
const SITE_URL = "https://cook-fast.webvijayi.com";
const OG_IMAGE_URL = `${SITE_URL}/api/og`;
const OG_FALLBACK_URL = `${SITE_URL}/cookfast%20og.png`; // Use existing image as fallback

// --- SVG Icons ---
const SpinnerIcon = ({ className = "h-4 w-4 text-white" }: { className?: string }) => ( <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const GenerateIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm10 7H5v6h10V9z" clipRule="evenodd" /></svg> );
const JsonIcon = ({ className = "h-5 w-5" }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg> );
// --- End SVG Icons ---

// Social Media Icon Props interface
// interface SocialIconProps {
//   className?: string;
// }

// Social Share Icons - Component Definitions
// const ShareIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
//     <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
//   </svg>
// );

// const XIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
//     <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
//   </svg>
// );

// const FacebookIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
//     <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
//   </svg>
// );

// const WhatsAppIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
//     <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
//   </svg>
// );

// const TelegramIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
//     <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
//   </svg>
// );

// const EmailIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
//     <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
//   </svg>
// );

// const LinkIcon = ({ className = "h-5 w-5" }: SocialIconProps) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
//   </svg>
// );

// --- Section Components ---

// ResultsPanel component to display generated documentation
const ResultsPanel = ({
  documentSections,
  onDownload,
  onCopy,
  onDownloadJSON,
  onReset,
  onRetry,
  theme,
  debugInfo,
  workPhase,
  isGenerating
}: {
  documentSections: DocumentSection[] | undefined,
  onDownload: () => void,
  onCopy: () => void,
  onDownloadJSON: (debugInfo: any) => void,
  onReset: () => void,
  onRetry: () => void,
  theme?: string,
  debugInfo?: any,
  workPhase: WorkPhase,
  isGenerating: boolean
}) => {
  const { theme: componentTheme } = useTheme();
  const [showShareArrow, setShowShareArrow] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  
  // Use documentSections directly from props
  const hasGeneratedDocs = Array.isArray(documentSections) && documentSections.length > 0;

  // Log received documents for debugging
  useEffect(() => {
    if (hasGeneratedDocs) {
      console.log('ResultsPanel received documents:', documentSections.map(d => ({ title: d.title, contentLength: d.content?.length })))
    } else {
      console.log('ResultsPanel received no documents or empty array.');
    }
  }, [documentSections, hasGeneratedDocs]);

  // Show arrow pointing to sharing section after successful generation
  useEffect(() => {
    if (hasGeneratedDocs && workPhase === 'complete') {
      // Delay showing the arrow to ensure it appears after content is rendered
      const timer = setTimeout(() => {
        setShowShareArrow(true);
      }, 1500);
      
      // Arrow remains visible after showing
      return () => {
        clearTimeout(timer);
        // Removed hideTimer timeout
      };
    }
  }, [hasGeneratedDocs, workPhase]);

  const handleCopyLink = () => {
    const shareUrl = "https://cook-fast.webvijayi.com/";
    navigator.clipboard.writeText(shareUrl);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'telegram' | 'email') => {
    const shareUrl = "https://cook-fast.webvijayi.com/";
    const shareText = "🍳🚀 CookFast - Free AI-Powered Project Documentation Generator. Transform your ideas into detailed docs in seconds!";
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
  };

  const canRetry = workPhase === 'error' || workPhase === 'complete'; // Determine if retry is possible

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">
          {workPhase === 'error' ? 'Generation Failed' : 'Generated Documentation'}
        </h2>
        <p className="text-muted-foreground">
          {workPhase === 'error'
            ? 'An error occurred during generation. You can try again.'
            : 'Your documentation has been successfully generated!'}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-4 justify-center flex-wrap">
          {hasGeneratedDocs && (
            <>
               <Button variant="outline" onClick={onDownload} disabled={!hasGeneratedDocs}>
                  Download Markdown
               </Button>
               <Button variant="outline" onClick={onCopy} disabled={!hasGeneratedDocs}>
                  Copy to Clipboard
               </Button>
               <Button variant="outline" onClick={() => onDownloadJSON(debugInfo)} disabled={!hasGeneratedDocs}>
                  Download as JSON
               </Button>
            </>
          )}
          {canRetry && (
             <Button variant="secondary" onClick={onRetry} disabled={isGenerating}>
               Retry Generation
             </Button>
           )}
          {workPhase === 'error' && !hasGeneratedDocs && (
             <div className="text-center p-8 border rounded-lg border-destructive bg-destructive/10">
               <p className="text-destructive">
                 <AlertTriangleIcon className="inline h-5 w-5 mr-1" />
                 Documentation generation failed. Please check the logs or try again.
               </p>
             </div>
          )}
          <Button 
            variant="default" 
            onClick={onReset}
            className="relative animate-pulse"
          >
            {hasGeneratedDocs ? "Generate New Documentation" : "Try Again"}
          </Button>
        </div>

        {/* Display Token Usage */}
        {debugInfo?.tokensUsed && (
          <div className="text-center text-xs text-muted-foreground mt-4">
            Tokens Used: Input: {debugInfo.tokensUsed.input} | Output: {debugInfo.tokensUsed.output} | Total: {debugInfo.tokensUsed.total} 
            (Provider: {debugInfo.provider} | Model: {debugInfo.model})
          </div>
        )}

        {hasGeneratedDocs ? (
          <div className="w-full max-w-none">
            <DocumentTabs
              sections={documentSections.map((doc) => ({
                title: doc.title,
                content: (
                  <Card className="mt-1">
                    <CardContent className="p-4 md:p-6">
                      <ClientOnly>
                        <MarkdownRenderer content={doc.content || 'No content generated for this document.'} isDarkMode={componentTheme === 'dark'} />
                      </ClientOnly>
                    </CardContent>
                  </Card>
                ),
              }))}
            />
            
            {/* Social Share Section with Animation */}
            <div className="relative mt-12">
              {/* Animated arrow pointing to sharing section */}
              {showShareArrow && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
                  {/* Updated text styling for better visibility */}
                  <div className="font-bold text-indigo-600 dark:text-primary text-sm mb-1">
                    Share with your network!
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-primary" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
              
              {/* Social Sharing Section */}
              <div className="p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-center flex justify-center items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share CookFast
                </h3>
                <p className="text-muted-foreground text-center mb-6">
                  Found CookFast helpful? Share it with your network! 🚀
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    variant="outline"
                    className="bg-background hover:bg-muted flex items-center"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                    </svg>
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-background hover:bg-muted flex items-center"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-background hover:bg-muted flex items-center"
                    size="sm"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-background hover:bg-muted flex items-center"
                    size="sm"
                    onClick={() => handleShare('telegram')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                    Telegram
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-background hover:bg-muted flex items-center"
                    size="sm"
                    onClick={() => handleShare('email')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M12 12.713l-11.985-9.713h23.971l-11.986 9.713zm-5.425-1.822l-6.575-5.329v12.501l6.575-7.172zm10.85 0l6.575 7.172v-12.501l-6.575 5.329zm-1.557 1.261l-3.868 3.135-3.868-3.135-8.11 8.848h23.956l-8.11-8.848z" />
                    </svg>
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-background hover:bg-muted flex items-center"
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </Button>
                </div>
                {showCopyNotification && (
                  <p className="text-sm text-green-600 mt-2 text-center">Link copied to clipboard!</p>
                )}
                
                {/* Support Links */}
                <div className="mt-6 pt-4 border-t border-indigo-100 dark:border-indigo-900/50 flex justify-center gap-4">
                  <a 
                    href="https://buymeacoffee.com/lokeshmotwani" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 01-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 00-1.322-.238c-.826 0-1.491.284-2.26.613z" />
                    </svg>
                    Buy me a coffee
                  </a>
                  <a 
                    href="https://github.com/webvijayi/CookFast" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Star on GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card>
             <CardHeader>
               <CardTitle className="text-amber-700 dark:text-amber-400">Generation Result</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="text-center p-4 border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-300">
                  <AlertTriangleIcon className="inline h-5 w-5 mr-1" />
                  No documentation content was successfully generated or parsed. Please check logs or try again.
                </div>
             </CardContent>
           </Card>
        )}
        
        {/* Generation logs display */}
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
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState('');

  // Add AbortController and useRef for ongoing fetch request
  const abortControllerRef = useRef<AbortController | null>(null);

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
    setIsValidating(true); setKeyValidationStatus('idle'); setKeyValidationError(null); setError(null); setResults(null); // Clear other messages
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
      setIsValidating(false);
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

  // Updated event handler for generation success
  useEffect(() => {
    const handleGenerationSuccess = (e: Event) => {
      setIsGenerating(false);
      setGenerationProgress(100); // Mark as complete
      setWorkPhase('complete');
      console.log('Received generation:success event');

      try {
        const customEvent = e as CustomEvent;
        if (!customEvent.detail) {
          console.error('Generation success event received but no detail data was provided');
          addDebugLog('Error: Missing Generation Success Data');
          setDocumentSections([]); 
          setGeneratedMarkdown(''); // Ensure generatedMarkdown is cleared
          return;
        }
        
        // Destructure expected fields: documents and debug
        const { documents, debug } = customEvent.detail; 

        // Validate the received documents array
        if (!Array.isArray(documents) || documents.length === 0) {
          console.warn('Generation success event received but no valid documents array was provided. Detail:', customEvent.detail);
          addDebugLog('Warning: Invalid/Empty Documents Array Received', { detail: customEvent.detail });
          setGeneratedMarkdown(''); // Ensure generatedMarkdown is cleared
          
          // Check if there's an error message to display
          if (customEvent.detail.error) {
            setError(customEvent.detail.error);
            setWorkPhase('error');
          } else {
            // Create a fallback document with error information
            const fallbackDocument = {
              title: "Generation Failed - No Documents Generated",
              content: `# No Documents Generated\n\nThe AI provider completed successfully but didn't return any valid documents. This could be due to:\n\n- Rate limiting\n- Token limits exceeded\n- Content filtering triggered\n- API connectivity issues\n\nPlease try again with different parameters or a different AI provider.`
            };
            setDocumentSections([fallbackDocument]);
            setGeneratedMarkdown(fallbackDocument.content); // Set fallback markdown content
            setActivePanel('results');
            setWorkPhase('complete'); // Still mark as complete, but with a warning message
          }
        } else {
           const validatedDocuments = documents.map((doc: any) => ({ 
              title: doc.title || "Untitled Document",
              content: doc.content || ""
           }));
           console.log(`Setting ${validatedDocuments.length} document sections from API response.`);
           setDocumentSections(validatedDocuments);
           
           // Create a single markdown string from all document sections for download/copy
           const combinedMarkdown = validatedDocuments
              .map(doc => `# ${doc.title}\n\n${doc.content}`)
              .join('\n\n---\n\n');
           // Add detailed logging for combinedMarkdown creation
           console.log(`[handleGenerationSuccess] Created combinedMarkdown. Length: ${combinedMarkdown.length}. Expected documents: ${validatedDocuments.length}. Included titles: ${validatedDocuments.map(d => d.title).join(', ')}`);
           addDebugLog('Combined Markdown Created', { length: combinedMarkdown.length, expectedDocs: validatedDocuments.length, titles: validatedDocuments.map(d => d.title) });
           
           console.log(`Generated combined markdown content (${combinedMarkdown.length} chars)`);
           setGeneratedMarkdown(combinedMarkdown);
           
           setActivePanel('results');
        }
        
        // Check and handle debug info correctly
        if (debug) {
          setActualProviderUsed(debug.provider);
          setActualModelUsed(debug.model);
          setDebugInfo(debug);
          addDebugLog('Generation Complete', debug);
        }

      } catch (error: any) {
         console.error('Error processing generation:success event:', error);
         addDebugLog('Error: Processing Success Event Failed', { error: error.message });
         setWorkPhase('error');
         setDocumentSections([]);
         setGeneratedMarkdown(''); // Ensure generatedMarkdown is cleared on error
      }
    };

    // Custom event listener
    const eventName = 'cookfast:generationSuccess'; // Example custom event name
    document.addEventListener(eventName, handleGenerationSuccess);
    
    // Status check listener (if still used)
    const handleStatusUpdate = (e: Event) => {
      // ... existing status update logic ...
    };
    window.addEventListener('generation:status', handleStatusUpdate); 

    return () => {
      document.removeEventListener(eventName, handleGenerationSuccess);
      window.removeEventListener('generation:status', handleStatusUpdate);
    };
  // Ensure all dependencies used inside useEffect are listed, including state setters if necessary
  }, [addDebugLog, setActualProviderUsed, setActualModelUsed, setDebugInfo]); 

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
  
  // --- Reset and Retry ---
  const handleReset = () => {
    // Ensure any ongoing generation is stopped
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setGeneratedMarkdown('');
    setDocumentSections([]); // Clear previous sections
    setResults(null);
    setWorkPhase('preparing');
    setActivePanel('intro');
    setError(null);
    setIsGenerating(false); // Ensure generating state is reset
    setGenerationProgress(0);
    setElapsedTimeSeconds(0);
    // Reset other relevant states if needed
    addDebugLog('Reset Form', { timestamp: new Date().toISOString() });
  };

  // --- Trigger Generation (Placeholder - Actual call likely in GeneratorSection) ---
  // This function needs to be implemented/updated in GeneratorSection
  // It should accept the AbortController signal
  const triggerGeneration = async (signal: AbortSignal) => {
     // Example: Replace with actual API call from GeneratorSection
     console.log("Triggering generation with details:", projectDetails, selectedDocs, selectedProvider);
     setIsGenerating(true);
     setWorkPhase('generating');
     setGenerationStartTime(Date.now());
     addDebugLog('Generation Triggered (Placeholder)', { projectDetails, selectedDocs, provider: selectedProvider });

     // Simulate generation process
     await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate delay

     // Simulate success/error based on signal
     if (signal.aborted) {
       console.log("Generation aborted by signal.");
       setError("Generation cancelled by user.");
       setWorkPhase('error');
       addDebugLog('Generation Aborted (Placeholder)');
       setIsGenerating(false);
       return; // Exit early if aborted
     }

     // Simulate receiving data (replace with actual API response handling)
     const mockSections = [
       { title: "Mock Section 1", content: "This is mock content." },
       { title: "Mock Section 2", content: "More mock content." }
     ];
     const mockMarkdown = mockSections.map(s => `# ${s.title}\\n${s.content}`).join('\\n\\n');

     // Dispatch success event (as the existing useEffect handles this)
     document.dispatchEvent(new CustomEvent('cookfast:generationSuccess', {
       detail: {
         content: mockMarkdown,
         sections: mockSections,
         debug: { provider: selectedProvider, model: 'mock-model' }
       }
     }));

     setIsGenerating(false); // Should be set false in handleGenerationSuccess ideally
  };


  // --- Stop Generation Handler ---
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addDebugLog('Stop Generation Requested');
      setWorkPhase('error'); // Or 'preparing' depending on desired state after stop
      setIsGenerating(false);
      setError('Generation stopped by user.');
      // Reset progress, timers etc. if needed
      setGenerationProgress(0);
      setElapsedTimeSeconds(0);
      setGenerationStartTime(null);
    }
  };


  // --- Retry Generation Handler ---
  const handleRetry = () => {
    addDebugLog('Retry Generation Triggered');
    // Reset generation-specific state before retrying
    setGeneratedMarkdown('');
    setDocumentSections([]);
    setError(null);
    setWorkPhase('preparing'); // Go back to preparing phase briefly
    setIsGenerating(false); // Ensure this is false before starting again
    setGenerationProgress(0);
    setElapsedTimeSeconds(0);
    setGenerationStartTime(null);
    setActivePanel('docs'); // Or wherever generation is triggered from, likely 'docs' or the generator section itself

    // Re-trigger generation (needs the actual trigger function)
    // This assumes the generation logic is accessible here or can be triggered
    // For now, using the placeholder:
    const controller = new AbortController();
    abortControllerRef.current = controller;
    triggerGeneration(controller.signal).catch(err => {
       if (err.name !== 'AbortError') {
          console.error("Retry Generation Error:", err);
          setError(err.message || "An error occurred during retry.");
          setWorkPhase('error');
          setIsGenerating(false);
          addDebugLog('Retry Generation Error', { error: err.message });
       } else {
          addDebugLog('Retry Generation Aborted');
       }
    });
  };

  // Handle document download
  const handleDownload = () => {
    console.log('[handleDownload] Triggered'); // Log start
    addDebugLog('Download Markdown: Start');

    // Log the content length being used for download
    console.log(`[handleDownload] Checking generatedMarkdown content length: ${generatedMarkdown?.length || 0}`);
    addDebugLog('Download Markdown: Content Check', { length: generatedMarkdown?.length || 0 });


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
        {/* Updated SEO Description */}
        <meta name="description" content="🍳🚀 CookFast is a free AI tool that writes essential product documents (like Requirements Docs & Application Flows) from your idea, helping you start coding faster. Generate docs for Web Apps, Mobile Apps & more!" />
        {/* Updated SEO Keywords */}
        <meta name="keywords" content="AI project documentation generator, ai product documents for coding,vibe coding requirements document, ai application flow generator, ai project planning tool, free ai developer documentation tool, ai web app docs generator,ai mobile app docs generator, product technical documentation generator,CookFast" />
        <meta name="author" content="Web Vijayi" />
        <meta name="theme-color" content="#FB7A09" />
        <link rel="preconnect" href={SITE_URL} />
        
        {/* OpenGraph Meta Tags */}
        <meta property="og:title" content="🍳🚀 CookFast | AI-Powered Documentation Generator - Free & Open Source" />
        <meta property="og:description" content="🔥 Transform project ideas into detailed documentation in seconds! Free, open-source tool supporting multiple AI providers. Cook up your project faster! 📝✨" />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="🍳🚀 CookFast - AI-Powered Documentation Generator" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@webvijayi" />
        <meta name="twitter:creator" content="@webvijayi" />
        <meta name="twitter:title" content="🍳🚀 CookFast | AI-Powered Documentation Generator - Free & Open Source" />
        <meta name="twitter:description" content="🔥 Transform project ideas into detailed documentation in seconds! Free, open-source tool supporting multiple AI providers." />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <meta name="twitter:image:alt" content="🍳🚀 CookFast - AI-Powered Documentation Generator" />
        
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
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": "Requirements Document",
                  "applicationCategory": "ProjectDocumentation",
                  "description": "A comprehensive outline of project specifications, user stories, and functional requirements that clearly defines what the project needs to accomplish."
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": "Frontend Guidelines",
                  "applicationCategory": "ProjectDocumentation",
                  "description": "Design standards, component structure, and UI/UX best practices to ensure consistency and maintainability across the frontend."
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": "Backend Architecture",
                  "applicationCategory": "ProjectDocumentation",
                  "description": "Detailed architecture overview of APIs, services, data models, and system design to guide backend implementation."
                }
              },
              {
                "@type": "ListItem",
                "position": 4,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": "Application Flow",
                  "applicationCategory": "ProjectDocumentation",
                  "description": "Sequence diagrams and flowcharts showing the interaction between components, services, and user journeys throughout the application."
                }
              },
              {
                "@type": "ListItem",
                "position": 5,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": "Tech Stack Overview",
                  "applicationCategory": "ProjectDocumentation",
                  "description": "Comprehensive documentation of technologies, frameworks, libraries, and tools with justifications for their selection."
                }
              },
              {
                "@type": "ListItem",
                "position": 6,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": "System Prompts",
                  "applicationCategory": "ProjectDocumentation",
                  "description": "AI system prompts for interactive components, chatbots, or generative features within the application."
                }
              },
              {
                "@type": "ListItem",
                "position": 7,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": "File Structure",
                  "applicationCategory": "ProjectDocumentation",
                  "description": "Recommended project folder organization with rationale for the architecture to ensure maintainability and scalability."
                }
              },
              {
                "@type": "ListItem",
                "position": 8,
                "item": {
                  "@type": "SoftwareApplication",
                  "name": "PRD Documentation",
                  "applicationCategory": "ProjectDocumentation",
                  "description": "Comprehensive Product Requirements Documents with detailed user journeys, market analysis, and product strategy.",
                  "offers": {
                    "@type": "Offer",
                    "availability": "https://schema.org/ComingSoon"
                  }
                }
              }
            ]
          }`}
        </script>
      </Head>

      {/* Main Content */}
      <AnimatedHero />
      <DocumentTypeSection />
      <FeaturesGrid />
      <HowItWorksSection />
      
      {/* Show Generator or Results */}
      {activePanel === 'results' ? (
        <ResultsPanel
          documentSections={documentSections}
          onDownload={handleDownload}
          onCopy={handleCopy}
          onDownloadJSON={downloadJSON}
          onReset={handleReset}
          onRetry={handleRetry}
          theme={theme}
          debugInfo={debugInfo}
          workPhase={workPhase}
          isGenerating={isGenerating}
        />
      ) : activePanel === 'intro' || activePanel === 'details' || activePanel === 'docs' ? (
          <>
            {isGenerating && (
              <div className="text-center my-4">
                 <Button variant="destructive" onClick={handleStopGeneration}>
                   Stop Generation
                 </Button>
              </div>
            )}
            <GeneratorSection />
          </>
      ) : null}
      
      <FaqSection />

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed bottom-4 left-4 bg-secondary text-secondary-foreground p-2 rounded-full shadow-lg z-50 text-xs">
          Copied to clipboard!
        </div>
      )}
    </Fragment>
  );
}
