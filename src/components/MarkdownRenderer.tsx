// Timestamp: 2025-04-21T06:00:00Z - Enhanced MarkdownRenderer component with better error handling, layout improvements, and added copy button functionality with Mermaid diagram support.
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
// Import types but not the actual module (will be dynamically imported)
import type { MermaidConfig } from 'mermaid';

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

  // Function to initialize and render Mermaid diagrams
  const initMermaid = async (): Promise<void> => {
    if (typeof window === 'undefined' || !markdownRef.current) return; // Skip on server or if no ref

    try {
      // Dynamically import mermaid only on client side
      const mermaid = await import('mermaid');
      
      // Initialize mermaid with theme based on dark mode
      mermaid.default.initialize({
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default',
        securityLevel: 'loose',
        logLevel: 3, // Warning level for better debugging
        fontFamily: 'inherit', // Use the app's font
        flowchart: {
          htmlLabels: true,
          curve: 'basis'
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35
        }
      } as MermaidConfig);
      
      mermaidInitialized.current = true;
      
      // Find all mermaid code blocks
      const mermaidElements = markdownRef.current.querySelectorAll<HTMLElement>('pre > code.language-mermaid');
      console.log(`Found ${mermaidElements.length} Mermaid diagram blocks to render`);
      
      // Process each mermaid diagram
      for (let i = 0; i < mermaidElements.length; i++) {
        const el = mermaidElements[i];
        try {
          // Create a container to render the diagram
          const container = document.createElement('div');
          container.className = 'mermaid-diagram my-4 bg-white dark:bg-gray-900 p-2 rounded-lg overflow-auto';
          container.id = `mermaid-diagram-${i}-${Date.now()}`;
          container.textContent = el.textContent || '';
          
          // Replace the code block with the container
          const preElement = el.parentElement;
          if (preElement?.parentElement) {
            preElement.parentElement.replaceChild(container, preElement);
            
            // Try to render the diagram with mermaid
            try {
              await mermaid.default.run({
                nodes: [container],
                suppressErrors: false
              });
              console.log(`Successfully rendered diagram ${i}`);
            } catch (renderError: unknown) {
              console.error(`Error rendering mermaid diagram ${i}:`, renderError);
              container.innerHTML = `<div class="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
                <p class="text-red-600 dark:text-red-400 font-medium">Diagram Error:</p>
                <pre class="mt-2 text-xs overflow-auto">${renderError instanceof Error ? renderError.message : String(renderError)}</pre>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">Original code:</div>
                <pre class="mt-1 text-xs overflow-auto">${el.textContent}</pre>
              </div>`;
            }
          }
        } catch (error: unknown) {
          console.error('Error processing mermaid diagram:', error);
        }
      }
    } catch (error: unknown) {
      console.error('Error loading mermaid library:', error);
      setRenderError(`Failed to load mermaid library: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  useEffect(() => {
    // Check content validity
    if (!content) {
      setContentStatus('error');
      setRenderError('No content provided. Please try regenerating the documentation.');
      return;
    }

    setContentStatus('ready'); // Assume content is ready if provided
    setRenderError(null);

    // Schedule mermaid initialization after component mounts/updates
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && markdownRef.current) {
        initMermaid();
      }
    }, 300); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [content, isDarkMode]); // Re-run when content or theme changes

  // Handle copy button click
  const handleCopyCode = (code: string, index: number): void => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      },
      (err: unknown) => {
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
        // Extract diagram type for better labeling
        const codeText = String(children);
        let diagramType = "Diagram";
        if (codeText.trim().startsWith('sequenceDiagram')) {
          diagramType = "Sequence Diagram";
        } else if (codeText.trim().startsWith('flowchart') || codeText.trim().startsWith('graph')) {
          diagramType = "Flowchart";
        } else if (codeText.trim().startsWith('classDiagram')) {
          diagramType = "Class Diagram";
        } else if (codeText.trim().startsWith('erDiagram')) {
          diagramType = "ER Diagram";
        }
        
        // Render mermaid code blocks within a labeled container for better user feedback
        return (
          <div className="relative my-4">
            <div className="absolute top-0 right-0 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-bl">
              {diagramType}
            </div>
            <pre className="overflow-auto rounded-md p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              <code className={className} {...props}>{children}</code>
            </pre>
          </div>
        );
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