import { useState } from 'react';
import Head from 'next/head';

// Define types for form data and document selection
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

// Define the AI providers
type AIProvider = 'gemini' | 'openai' | 'anthropic';

// --- GitHub Repo Link ---
const GITHUB_REPO_URL = "https://github.com/webvijayi/CookFast";
const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`; // Link for contributions


// --- SVG Icons ---
const GitHubIcon = () => (
  // Removed width/height attributes, added h-4 w-4 classes
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="inline-block ml-1 h-4 w-4" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
  </svg>
);
const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> );
const SpinnerIcon = () => ( <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const GenerateIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm10 7H5v6h10V9z" clipRule="evenodd" /></svg> );
// --- End SVG Icons ---


export default function CookFastHome() {
  // Debug logging state
  const [debugLogs, setDebugLogs] = useState<Array<{timestamp: string, event: string, details: any}>>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  <Head>
    <title>CookFast | AI Documentation Generator</title>
    <meta name="description" content="CookFast uses AI to auto-generate project documentation, templates, and guides. Supports OpenAI, Anthropic, and Gemini." />
    <meta name="keywords" content="AI, documentation, templates, project generator, CookFast" />
    <meta name="author" content="Web Vijayi" />
    <meta property="og:title" content="CookFast | AI Documentation Generator" />
    <meta property="og:description" content="Generate project docs, templates, and guides with AI. Supports multiple AI providers." />
    <meta property="og:image" content="https://cook-fast.netlify.app/og-image.png" />
    <meta property="og:url" content="https://cook-fast.netlify.app/" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@webvijayi" />
    <meta name="twitter:creator" content="@webvijayi" />
    <script type="application/ld+json">
      {`{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CookFast",
        "url": "https://cook-fast.netlify.app/",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://cook-fast.netlify.app/?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }`}
    </script>
  </Head>

  // --- State Variables ---
  
  // Function to add debug logs with timestamp
  const addDebugLog = (event: string, details: any = {}) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prevLogs => [...prevLogs, { timestamp, event, details }]);
  };
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({ projectName: '', projectType: 'Web Application', projectGoal: '', features: '', techStack: '' });
  const [selectedDocs, setSelectedDocs] = useState<DocumentSelection>({ requirements: true, frontendGuidelines: true, backendStructure: true, appFlow: true, techStackDoc: true, systemPrompts: true, fileStructure: true });
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For main generation
  const [results, setResults] = useState<string | null>(null); // Success message
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string | null>(null); // State for generated content
  const [error, setError] = useState<string | null>(null); // For main generation errors
  const [debugInfo, setDebugInfo] = useState<string | null>(null); // State for debug info
  const [showDebug, setShowDebug] = useState(false); // State to toggle debug visibility
  // Theme toggle is now handled by ThemeContext

  // Theme toggle is now handled by ThemeContext


  // --- Handlers ---
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setProjectDetails(prev => ({ ...prev, [e.target.name]: e.target.value })); addDebugLog('Project Details Changed', { [e.target.name]: e.target.value }); };
  const handleDocSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedDocs(prev => ({ ...prev, [e.target.name]: e.target.checked })); addDebugLog('Document Selection Changed', { [e.target.name]: e.target.checked }); };
  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProvider = e.target.value as AIProvider;
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

    if (!userApiKey.trim()) {
      setError('API key is required.');
      addDebugLog('Generation Failed', { reason: 'API key not provided' });
      return;
    }

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
      let statusUpdateInterval = setInterval(() => {
        // Rotate through status messages to show progress
        setGenerationStage(prevStage => {
          const stages = [
            `Processing project details with ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}`,
            `Creating documentation structure`,
            `Generating comprehensive documentation`,
            `Finalizing ${Object.entries(selectedDocs).filter(([_, value]) => value).length} document sections`,
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

  const formatLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/ Doc$/, ' Document').trim();
  // --- End Handlers ---


  return (
    // Removed conditional 'dark' class here; it should rely on the class on <html>
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-300 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-gray-200`}>

      {/* Theme toggle is now handled by the ThemeToggle component in _app.tsx */}

      {/* Header */}
      <header className="pt-8 pb-6 text-center app-header">
         {/* Emojis as separate element before H1 for reliable rendering */}
         <div className="text-5xl mb-2 flex justify-center items-center"> {/* Container for alignment */}
           <span className="mr-3">🍳🚀</span> {/* Emojis */}
           <h1 className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 text-transparent bg-clip-text inline"> {/* Apply font-bold and gradient here */}
             CookFast
           </h1>
         </div>
         <p className="text-xl text-gray-600 dark:text-gray-400">AI-Powered Project Planning Documents</p>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-xl dark:shadow-slate-700/30 rounded-lg p-6 md:p-8 border border-gray-200 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-10"> {/* Increased spacing */}

             {/* Step 1: AI Provider & API Key */}
            <section className="p-5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/60 shadow-inner">
              <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-gray-200 flex items-center">
                <span className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3">1</span>
                Configure AI Provider
              </h2>
              <div className="space-y-5">
                <fieldset>
                   <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Provider:</legend>
                   <div className="flex flex-wrap gap-x-6 gap-y-3">
                       {/* Corrected: Added commas and type assertion */}
                      {(['gemini', 'openai', 'anthropic'] as AIProvider[]).map((provider) => (
                          <div key={provider} className="flex items-center">
                             <input id={`provider-${provider}`} name="provider" type="radio" value={provider} checked={selectedProvider === provider} onChange={handleProviderChange} className="focus:ring-indigo-500 dark:focus:ring-indigo-400 h-4 w-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700"/>
                             <label htmlFor={`provider-${provider}`} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{provider}</label>
                          </div>
                      ))}
                   </div>
                   <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                     Using: Google <code>gemini-2.5-pro-exp-03-25</code> (Experimental), OpenAI <code>gpt-4o</code>, Anthropic <code>claude-3-7-sonnet-20250219</code> (models subject to change).
                   </p>
                </fieldset>

                <div>
                    <label htmlFor="userApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your {selectedProvider.toUpperCase()} API Key <span className="text-red-500">*</span></label>
                    <div className="flex items-stretch"> {/* Changed to items-stretch */}
                       <input
                         type="password" id="userApiKey" name="userApiKey" value={userApiKey} onChange={handleApiKeyChange} required
                         className={`flex-grow block w-full p-2.5 border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-sm rounded-l-md ${ // Conditional border colors
                           keyValidationStatus === 'valid' ? 'border-green-500 dark:border-green-600' :
                           keyValidationStatus === 'invalid' ? 'border-red-500 dark:border-red-600' :
                           'border-gray-300 dark:border-slate-600'
                         }`}
                         placeholder={`Paste your ${selectedProvider.toUpperCase()} key`}
                       />
                       <button
                          type="button" onClick={handleValidateKey} disabled={isValidatingKey || !userApiKey.trim()}
                          title="Check API Key"
                           className={`inline-flex items-center justify-center px-4 border border-l-0 rounded-r-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors duration-150 ease-in-out ${ // Dynamic styling for button
                            isValidatingKey ? 'bg-gray-500 text-white cursor-wait border-gray-500' :
                            keyValidationStatus === 'valid' ? 'bg-green-600 text-white border-green-600' :
                            keyValidationStatus === 'invalid' ? 'bg-red-600 text-white border-red-600' :
                            'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 focus:ring-indigo-500'
                          }`}
                       >
                         {isValidatingKey ? <SpinnerIcon /> : keyValidationStatus === 'valid' ? <CheckIcon /> : 'Test'}
                       </button>
                    </div>
                     {keyValidationStatus === 'valid' && <p className="mt-1.5 text-xs font-medium text-green-600 dark:text-green-400">Key validation successful!</p>}
                     {keyValidationStatus === 'invalid' && keyValidationError && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{keyValidationError}</p>}

                     <p className="mt-3 text-xs text-gray-500 dark:text-slate-400 leading-relaxed"> {/* Disclaimer */}
                        {/* Corrected: Escaped apostrophe */}
                        <strong className="font-semibold">Note:</strong> CookFast by <a href="https://webvijayi.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Web Vijayi</a> is open-source. We <strong className="text-red-600 dark:text-red-400">never store</strong> your API keys. They&apos;re used solely for this generation request. Verify the code anytime on <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">GitHub</a>.
                     </p>
                </div>
              </div>
            </section>

            {/* Step 2: Project Details */}
            <section>
               <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-gray-200 flex items-center">
                 <span className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3">2</span>
                 Describe Project
               </h2>
               <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-6"> {/* Increased gap */}
                 <div className="sm:col-span-3">
                    <label htmlFor="projectName" className="block text-sm font-medium mb-1">Project Name <span className="text-red-500">*</span></label>
                    <input type="text" id="projectName" name="projectName" value={projectDetails.projectName} onChange={handleDetailChange} required className="block w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-sm"/>
                 </div>
                 <div className="sm:col-span-3">
                     <label htmlFor="projectType" className="block text-sm font-medium mb-1">Project Type</label>
                     <select id="projectType" name="projectType" value={projectDetails.projectType} onChange={handleDetailChange} className="block w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-sm">
                        <option>Web Application</option><option>Website</option><option>Mobile App</option><option>API Service</option><option>Library/Package</option><option>Desktop Application</option><option>Other</option>
                     </select>
                 </div>
                 <div className="sm:col-span-6">
                    <label htmlFor="projectGoal" className="block text-sm font-medium mb-1">Main Goal/Purpose</label>
                    <textarea id="projectGoal" name="projectGoal" rows={2} value={projectDetails.projectGoal} onChange={handleDetailChange} className="block w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-sm resize-y min-h-[4rem]" placeholder="What's the main objective?"></textarea>
                 </div>
                 <div className="sm:col-span-6">
                    <label htmlFor="features" className="block text-sm font-medium mb-1">Key Features (Optional)</label>
                    <textarea id="features" name="features" rows={3} value={projectDetails.features} onChange={handleDetailChange} className="block w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-sm resize-y min-h-[5rem]" placeholder="List features like: User login, search, payments..."></textarea>
                 </div>
                 <div className="sm:col-span-6">
                    <label htmlFor="techStack" className="block text-sm font-medium mb-1">Known Tech Stack (Optional)</label>
                    <input type="text" id="techStack" name="techStack" value={projectDetails.techStack} onChange={handleDetailChange} className="block w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-sm" placeholder="e.g., Next.js, Python, Postgres, Docker"/>
                 </div>
              </div>
            </section>

            {/* Step 3: Document Selection */}
            <section>
              <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-gray-200 flex items-center">
                 <span className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3">3</span>
                 Select Documents
               </h2>
              <fieldset>
                 <legend className="sr-only">Choose documents to generate</legend>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4"> {/* Increased gaps */}
                   {Object.keys(selectedDocs).map((key) => (
                     <div key={key} className="relative flex items-start bg-gray-50 dark:bg-slate-800/60 p-3 rounded-md border border-gray-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                       <div className="flex items-center h-5">
                         <input id={key} name={key} type="checkbox" checked={selectedDocs[key as keyof DocumentSelection]} onChange={handleDocSelectionChange} className="focus:ring-indigo-500 dark:focus:ring-indigo-400 h-4 w-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-slate-500 rounded bg-white dark:bg-slate-700"/>
                       </div>
                       <div className="ml-3 text-sm">
                         <label htmlFor={key} className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">{formatLabel(key)}</label>
                       </div>
                     </div>
                   ))}
                 </div>
              </fieldset>
            </section>

            {/* Step 4: Generate! (Submission Button) */}
            <div className="pt-6 text-center">
              <button
                type="submit"
                disabled={isLoading || !projectDetails.projectName || !userApiKey /*|| keyValidationStatus !== 'valid'*/} // Optionally enforce valid key
                className={`inline-flex items-center justify-center py-3 px-10 border border-transparent shadow-md text-base font-semibold rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-all duration-150 ease-in-out ${ 
                   isLoading || !projectDetails.projectName || !userApiKey /*|| keyValidationStatus !== 'valid'*/
                    ? 'bg-gray-400 dark:bg-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:via-indigo-600 dark:hover:to-purple-600 transform hover:scale-105'
                 }`}
              >
                 {isLoading ? <>
                    <SpinnerIcon /> 
                    <span className="ml-1">{generationStage || 'Generating...'}</span>
                  </> : <><GenerateIcon /> Cook Up Docs!</>}
              </button>
            </div>
          </form>



          {/* Results/Error Display Area */}
          <div className="mt-8 space-y-4">
             {results && (
              <div className="p-5 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700/50 rounded-lg shadow text-green-800 dark:text-green-200">
                <h3 className="font-semibold text-lg mb-2">Generation Successful!</h3>
                <p className="text-sm mb-4">{results}</p>
                {/* Display generated markdown content */}
                {generatedMarkdown && (
                  <pre className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words overflow-auto max-h-96">
                    <code>{generatedMarkdown}</code>
                  </pre>
                )}
              </div>
            )}
            {error && (
              <div className="p-5 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700/50 rounded-lg shadow text-red-800 dark:text-red-200">
                <h3 className="font-semibold text-lg mb-2">Error Occurred:</h3>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
          
          {/* Debug Button & Panel */}
          <div className="mt-6">
            <div className="flex justify-center mb-4">
              <button 
                onClick={() => setShowDebugPanel(!showDebugPanel)} 
                className="text-xs px-4 py-2 rounded-md bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {showDebugPanel ? 'Hide Debug Panel' : 'Show Debug Panel'}
              </button>
            </div>
            
            {/* Debug Info Area */}
            {showDebug && debugInfo && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-inner">
                <h4 
                  className="font-semibold text-sm mb-2 cursor-pointer text-gray-700 dark:text-gray-300" 
                  onClick={() => document.getElementById('debug-content')?.classList.toggle('hidden')}
                >
                  Debug Information (Click to toggle)
                </h4>
                <pre id="debug-content" className="mt-2 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words overflow-auto max-h-60 hidden">
                  <code>{debugInfo}</code>
                </pre>
              </div>
            )}
            
            {/* Debug Logs Panel */}
            {showDebugPanel && (
              <div className="mt-4 mx-auto p-4 bg-gray-100 dark:bg-slate-800 rounded-lg shadow text-left overflow-hidden text-xs">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Debug Logs</h3>
                  <button 
                    onClick={() => setDebugLogs([])} 
                    className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800/30"
                  >
                    Clear Logs
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {debugLogs.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">No logs yet. Actions will be recorded here.</p>
                  ) : (
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="py-2 pr-2 w-1/4">Timestamp</th>
                          <th className="py-2 pr-2 w-1/4">Event</th>
                          <th className="py-2 w-1/2">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debugLogs.map((log, idx) => (
                          <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-2 pr-2 font-mono text-gray-600 dark:text-gray-400">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2 pr-2 font-medium">
                              {log.event}
                            </td>
                            <td className="py-2 break-all">
                              {typeof log.details === 'object' 
                                ? JSON.stringify(log.details, null, 2)
                                : String(log.details)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 mt-12 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400">
         <p className="mb-2">
            An Opensource Tool by <a href="https://webvijayi.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Web Vijayi</a>
         </p>
         {/* Updated Footer Links */}
         <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 text-xs mt-4">
             {/* Star on GitHub */}
             <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center font-medium px-3 py-1 rounded-md bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600">
                <GitHubIcon /> <span className="ml-1.5">Star on GitHub</span>
             </a>
             {/* Buy Me A Coffee */}
             <a href="https://buymeacoffee.com/lokeshmotwani" target="_blank" rel="noopener noreferrer" title="Support the project!">
                <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" className="h-8 w-auto" /> {/* Adjusted height */}
             </a>
             {/* Contribute/Issue */}
             <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Report Issue / Contribute
             </a>

         </div>
         

      </footer>
    </div>
  );
}
