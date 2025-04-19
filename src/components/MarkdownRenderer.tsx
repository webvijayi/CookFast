// Timestamp: ${new Date().toISOString()} - Enhanced MarkdownRenderer component with better error handling, layout improvements, and added copy button functionality.
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  isDarkMode?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isDarkMode = false }) => {
  const markdownRef = useRef<HTMLDivElement>(null);
  const mermaidInitialized = useRef(false); // Track if Mermaid has been initialized
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [contentStatus, setContentStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    // Check content validity
    if (!content) {
      setContentStatus('error');
      setRenderError('No content provided. Please try regenerating the documentation.');
      return;
    }

    // Remove the length check, as it incorrectly flags valid sections as incomplete.
    // Completeness check should happen at a higher level based on the overall API response.
    // if (content.length < 2000) {
    //   setContentStatus('error');
    //   setRenderError('Content appears incomplete. The AI may have generated only an outline instead of full documentation. Please try regenerating with different settings.');
    // } else {
    //   setContentStatus('ready');
    //   setRenderError(null);
    // }
    setContentStatus('ready'); // Assume content is ready if provided
    setRenderError(null);

    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Import and initialize mermaid on the client side
    const initMermaid = async () => {
      try {
        // Dynamically import mermaid only on client side
        const mermaid = await import('mermaid');
        
        // Initialize mermaid only once
        if (!mermaidInitialized.current) {
          mermaid.default.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
            logLevel: 4, // Error level only to reduce console noise
            fontFamily: 'inherit', // Use the app's font
          });
          mermaidInitialized.current = true;
        }

        // Render any unprocessed mermaid diagrams
        if (markdownRef.current) {
          const mermaidElements = markdownRef.current.querySelectorAll<HTMLElement>('code.language-mermaid');
          const unprocessedElements = Array.from(mermaidElements).filter(el => el.getAttribute('data-processed') !== 'true');

          if (unprocessedElements.length > 0) {
            try {
              await mermaid.default.run({ nodes: unprocessedElements });
              console.log(`Successfully rendered ${unprocessedElements.length} Mermaid diagrams`);
            } catch (error) {
              console.error('Mermaid rendering error:', error);
              setRenderError(`Failed to render diagrams: ${error instanceof Error ? error.message : String(error)}`);
              unprocessedElements.forEach(el => {
                // Add error styling to failed diagrams
                el.innerHTML = `<div class="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
                  <p class="text-red-600 dark:text-red-400 font-medium">Diagram Error:</p>
                  <pre class="mt-2 text-xs overflow-auto">${error instanceof Error ? error.message : String(error)}</pre>
                  <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">Original code:</div>
                  <pre class="mt-1 text-xs overflow-auto">${el.textContent}</pre>
                </div>`;
                el.setAttribute('data-processed', 'true');
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize or render mermaid:", error);
        setRenderError(`Failed to load diagram renderer: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    // Run after a short delay to ensure DOM is ready
    const timerId = setTimeout(() => {
      initMermaid();
    }, 100);

    return () => clearTimeout(timerId);
  }, [content, isDarkMode]); // Rerun effect if content or theme changes

  // Handle copy button click
  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  };

  // Define components for ReactMarkdown with proper typing
  const components: Components = {
    // Custom paragraph renderer to prevent nesting block elements
    p: ({ node, children }) => {
      // Check if the paragraph contains block elements like div or pre
      // This is a simplified check; more complex checks might be needed
      const containsBlockElement = React.Children.toArray(children).some(
        (child: any) =>
          React.isValidElement(child) &&
          typeof child.type === 'string' &&
          ['div', 'pre'].includes(child.type.toLowerCase())
      );

      if (containsBlockElement) {
        // If it contains block elements, render children directly without <p>
        return <>{children}</>;
      }
      // Otherwise, render as a normal paragraph
      return <p>{children}</p>;
    },
    
    // Existing code component renderer (potentially adjusted)
    // @ts-ignore - Ignoring type check for code component as ReactMarkdown types are complex
    code({ node, inline, className, children, ...props }) {
      // Handle inline code
      if (inline) {
        return <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" {...props}>{children}</code>;
      }
      
      // Get language from className (language-*)
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      // Special handling for mermaid
      if (language === 'mermaid') {
        // Render mermaid code blocks simply, let useEffect handle rendering
        return <code className={className} {...props}>{children}</code>;
      }
      
      // Extract code content
      const codeString = String(children).replace(/\n$/, '');
      
      // Generate unique index for this code block
      const codeIndex = Math.floor(Math.random() * 10000);
      
      // Regular code blocks with language tag
      // Render the div/pre structure directly, will be handled by custom `p` renderer
      return (
        <div className="relative group my-4"> {/* Added margin */} 
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-1.5 rounded bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs flex items-center gap-1"
              onClick={() => handleCopyCode(codeString, codeIndex)}
            >
              {copiedIndex === codeIndex ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 6 9 17l-5-5"/></svg>
                  Copied
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy
                </span>
              )}
            </button>
          </div>
          {/* Use `pre` tag directly for the code block */}
          <pre className={`${language ? `language-${language}` : ''} overflow-auto rounded-md p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200`}>
            <code className={className} {...props}>{children}</code>
          </pre>
        </div>
      );
    },
    // Ensure `pre` tags are handled correctly, though the custom `code` renderer wraps in `div` and `pre`.
    // Adding a basic `pre` might not be necessary if `code` handles it fully.
    // pre: ({children}) => <pre className="overflow-auto rounded-md p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">{children}</pre>
  };

  return (
    <div className="w-full">
      {renderError && (
        <div className="mb-4 p-3 border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-300">
          <p className="text-sm">{renderError}</p>
        </div>
      )}
      
      {contentStatus === 'loading' && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      
      {contentStatus === 'error' && !content && (
        <div className="mb-4 p-6 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Documentation Error</h3>
          <p className="text-red-600 dark:text-red-400">
            No content was generated. Please try again with different settings or AI provider.
          </p>
        </div>
      )}
      
      {content && (
        <div 
          ref={markdownRef} 
          className="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert overflow-auto bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg"
          style={{ minHeight: '500px', maxHeight: 'calc(100vh - 200px)' }}
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer; 