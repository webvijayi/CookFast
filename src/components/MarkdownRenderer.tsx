// Timestamp: 2025-04-21T06:00:00Z - Enhanced MarkdownRenderer component with better error handling, layout improvements, and added copy button functionality with Mermaid diagram support.
// Timestamp: 2025-05-10T14:30:00Z - Fixed Mermaid rendering issues in production environment with enhanced error handling.
// Timestamp: 2025-05-10T16:30:00Z - Simplified Mermaid sanitization and fixed React hydration errors.
// Timestamp: 2025-05-11T10:00:00Z - Refined hydration error fix and enhanced Mermaid sanitization logic.
// Timestamp: 2025-04-24T03:15:00Z - Integrated @mermaid-js/parser for pre-rendering syntax validation.
// Timestamp: 2025-04-24T03:22:00Z - Corrected Mermaid error message display.
// Timestamp: 2025-04-24T03:25:00Z - Re-applied Mermaid error message display fix.
// Timestamp: 2025-04-24T03:32:00Z - Final attempt to apply parser integration and error display fix via write_to_file.
// Timestamp: 2025-04-24T03:42:00Z - Added targeted regex fixes for common Mermaid errors.
// Timestamp: 2025-04-24T03:52:00Z - Re-applied targeted regex fixes via write_to_file.
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { parse } from '@mermaid-js/parser'; // Correct import based on docs

interface MarkdownRendererProps {
  content: string;
  isDarkMode?: boolean;
}

// Enhanced Helper to sanitize Mermaid node labels/IDs
const sanitizeMermaidText = (text: string): string => {
  // Escape internal quotes first
  const escapedQuotes = text.replace(/"/g, '#quot;'); // Use #quot; as Mermaid suggests for internal quotes
  // Wrap in quotes if it contains spaces or common problematic characters
  // Extended the list of problematic characters
  if (/[\s()\[\]{}<>"'`;:!@#$%^&*=|?]/.test(escapedQuotes)) {
    return `"${escapedQuotes}"`;
  }
  // Return the simple text if no problematic characters found after escaping internal quotes
  return escapedQuotes;
};

// Helper to specifically sanitize node labels (text within brackets/parentheses)
const sanitizeMermaidLabel = (label: string): string => {
  // Remove potential shape indicators from start/end if any
  let innerLabel = label.trim();
  const shapeRegex = /^[\(\[\{>](.*)[\)\]\}<]$/; // Match brackets/parens/etc.
  const match = innerLabel.match(shapeRegex);
  
  let prefix = '';
  let suffix = '';
  
  if (match && match[1]) {
      innerLabel = match[1].trim(); // Extract content inside brackets
      prefix = label.charAt(0); // Keep the opening bracket
      suffix = label.charAt(label.length - 1); // Keep the closing bracket
  } else {
      // If no brackets matched, treat the whole string as the label content
      // and assume default rectangle shape (no prefix/suffix needed).
  }
  
  // Sanitize the inner content
  const sanitizedInnerLabel = sanitizeMermaidText(innerLabel); 

  // Reconstruct with original brackets if they existed
  if (prefix && suffix) {
     // Ensure the sanitized label isn't just empty quotes ""
     if (sanitizedInnerLabel === '""') return `${prefix}${suffix}`; // Return empty shape like []
     return `${prefix}${sanitizedInnerLabel}${suffix}`;
  } else {
      // If there were no brackets, return the sanitized text directly 
      // (suitable for node IDs or labels without explicit shapes)
      return sanitizedInnerLabel;
  }
};

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
      
      // Initialize mermaid with theme based on dark mode and enhanced error handling
      mermaid.default.initialize({
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default',
        securityLevel: 'loose', // Consider 'strict' if possible, but 'loose' is often needed
        logLevel: 3, // Warning level for better debugging
        fontFamily: 'inherit', // Use the app's font
        flowchart: {
          htmlLabels: true, // Allow HTML in labels (might require more careful sanitization)
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
          messageMargin: 35,
          messageAlign: 'center' // Adjust message alignment if needed
        },
        // Add error handling options
        suppressErrors: true, // Suppress auto-alert of errors
        errorHandler: (error: string, errorDetails?: any) => {
          // Log detailed errors during development/debugging
          console.error("Mermaid rendering error:", error, errorDetails);
          // Potentially update state to show error inline later
        }
      });
      
      mermaidInitialized.current = true;
      
      // Find all mermaid code blocks
      const mermaidElements = markdownRef.current.querySelectorAll<HTMLElement>('pre > code.language-mermaid');
      console.log(`[Mermaid] Found ${mermaidElements.length} Mermaid diagram blocks to render`);
      
      // Process each mermaid diagram
      for (let i = 0; i < mermaidElements.length; i++) {
        const el = mermaidElements[i];
        let diagramText = el.textContent || '';
        
        try {
          // **Simplified Mermaid Sanitization:**
          // 1. Normalize line breaks
          diagramText = diagramText.replace(/\r\n|\r/g, '\n');
          // 2. Trim leading/trailing whitespace from the whole block and individual lines
          diagramText = diagramText.split('\n').map(line => line.trim()).join('\n').trim();
          // 3. Remove potential ```mermaid fences if accidentally included
          diagramText = diagramText.replace(/^```mermaid\s*/, '').replace(/\s*```$/, '').trim();
          // 4. Remove empty lines
          diagramText = diagramText.replace(/\n{2,}/g, '\n'); 

          // 4.5 Replace 'flowchart' with 'graph' alias to fix "Unknown diagram type" error
          diagramText = diagramText.replace(/^flowchart/gm, 'graph');

          // **Targeted Fixes for Common AI Errors (v6)**
          // 5. Quote labels containing parentheses within brackets/other shapes
          diagramText = diagramText.replace(/(\[|\(|\{)([^"\]\)\}]*\([^)"\]\}]*\)[^"\]\)\}]*)(\]|\)|\})/g, (match, open, content, close) => {
              const escapedContent = content.replace(/"/g, '#quot;');
              return `${open}"${escapedContent}"${close}`;
          });
          // 6. Quote participant/actor labels containing colons
           diagramText = diagramText.replace(/^(participant|actor)\s+([a-zA-Z0-9_.-]+)\s*\(([^)]+:[^)]+)\)/gm, '$1 $2("$3")');
          // 7. Replace semicolon immediately after node definition with newline (Fixes 'got PS' after ']')
          diagramText = diagramText.replace(/([\)\]\}<>]);/g, '$1\n');
          // 8. Remove comments (Fixes 'got NODE_STRING' after ';')
          diagramText = diagramText.replace(/^\s*\/\/.*$/gm, ''); 
          // 9. Ensure space after edge label closing pipe |
          diagramText = diagramText.replace(/(\|)(\S)/g, '$1 $2'); 

          console.log(`[Mermaid] Attempting to validate and render diagram ${i} (Targeted Fixes Applied):\n${diagramText}`); 

          // Determine diagram type for the parser
          let diagramType = diagramText.match(/^(graph|flowchart|sequenceDiagram|stateDiagram|classDiagram|gantt|pie|erDiagram|journey|requirementDiagram)/)?.[0];
          if (diagramType === 'graph') diagramType = 'flowchart'; // Alias
          
          // Create a container (do this outside try/catch for error display)
          const container = document.createElement('div');
          container.setAttribute('data-mermaid-container', 'true'); 
          container.className = 'mermaid mermaid-diagram my-4 bg-white dark:bg-gray-900 p-2 rounded-lg overflow-auto'; 
          container.id = `mermaid-diagram-${i}-${Date.now()}`;
          // Set text content initially for error display if parsing fails
          container.textContent = diagramText; 

          const preElement = el.parentElement;
          if (preElement?.parentElement) {
             // Replace the <pre> element early so error messages can be displayed in the container
            preElement.parentElement.replaceChild(container, preElement);

            try {
              // **Step 1: Validate Syntax with Parser**
              if (diagramType) {
                parse(diagramType as any, diagramText); // Use 'as any' for pragmatic type matching
                console.log(`[Mermaid] Parser validation passed for diagram ${i}`);
              } else {
                console.warn(`[Mermaid] Could not determine diagram type for diagram ${i}. Skipping parser validation.`);
              }

              // **Step 2: Attempt Rendering if Syntax is Valid (or validation skipped)**
              try {
                  // Ensure the container has the diagram text just before rendering
                  container.textContent = diagramText; 
                  await mermaid.default.run({ nodes: [container] }); 
                  console.log(`[Mermaid] Successfully rendered diagram ${i} using mermaid.run`);
              } catch (renderError: unknown) {
                  // Handle errors during mermaid.run (rendering phase)
                  // Try accessing properties seen in the console log structure { str: ..., message: ... }
                  const errorMessage = (renderError as any)?.str || (renderError instanceof Error ? renderError.message : String(renderError));
                  console.error(`[Mermaid] Error rendering diagram ${i} with mermaid.run:`, renderError); 
                  console.dir(renderError); // Log the full error object structure
                  container.innerHTML = `<div class="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
                    <p class="text-red-600 dark:text-red-400 font-medium">Mermaid Diagram Rendering Failed:</p>
                    <pre class="mt-2 text-xs overflow-auto whitespace-pre-wrap border border-red-200 dark:border-red-700 p-2 rounded bg-red-50 dark:bg-red-900/50">${errorMessage}</pre>
                    <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">Attempted Code (Cleaned):</div>
                    <pre class="mt-1 text-xs overflow-auto whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">${diagramText}</pre>
                  </div>`;
              }
            } catch (syntaxError: unknown) {
                 // Handle syntax errors caught by the parser
                 const errorMessage = syntaxError instanceof Error ? syntaxError.message : String(syntaxError);
                 console.error(`[Mermaid] Parser syntax validation failed for diagram ${i}:`, syntaxError);
                 container.innerHTML = `<div class="p-4 border border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 rounded-md">
                   <p class="text-orange-600 dark:text-orange-400 font-medium">Invalid Mermaid Syntax Detected by Parser:</p>
                   <pre class="mt-2 text-xs overflow-auto whitespace-pre-wrap border border-orange-200 dark:border-orange-700 p-2 rounded bg-orange-50 dark:bg-orange-900/50">${errorMessage}</pre>
                   <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">Problematic Code (Cleaned):</div>
                   <pre class="mt-1 text-xs overflow-auto whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">${diagramText}</pre>
                 </div>`;
            }
          } else {
             console.warn(`[Mermaid] Could not find parent element for pre tag of diagram ${i}`);
          }
        } catch (processingError: unknown) {
          const errorMessage = processingError instanceof Error ? processingError.message : String(processingError);
          console.error(`[Mermaid] Error processing diagram ${i} text:`, errorMessage);
          // Optionally display an error message in the original element's place
          const errorDiv = document.createElement('div');
          errorDiv.className = 'p-4 border border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 rounded-md text-orange-700 dark:text-orange-300 text-sm';
          errorDiv.textContent = `Error preparing diagram code: ${errorMessage}`;
          el.parentElement?.parentElement?.replaceChild(errorDiv, el.parentElement);
        }
      }
    } catch (error: unknown) {
      console.error('[Mermaid] Error loading or initializing mermaid library:', error);
      setRenderError(`Failed to load Mermaid library: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  useEffect(() => {
    if (!content) {
      setContentStatus('error');
      setRenderError('No content provided. Please try regenerating the documentation.');
      return;
    }

    setContentStatus('ready');
    setRenderError(null);

    // Schedule mermaid initialization after component mounts/updates
    // Added a check to prevent re-initialization if already done
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && markdownRef.current /* && !mermaidInitialized.current */) { // Consider if re-init needed on content change
        initMermaid();
      }
    }, 300); // Delay ensures DOM elements are available

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, isDarkMode]); // Rerun if content or theme changes

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

  const components: Components = {
    // **Refined Paragraph Renderer for Hydration Errors**
    // Prevents nesting block-level elements (like divs, pre, lists) inside <p> tags.
    p: ({ node, children }) => {
      const blockElements = ['div', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'blockquote'];
      const containsBlockElement = React.Children.toArray(children).some(child => 
        React.isValidElement(child) && 
        typeof child.type === 'string' && 
        blockElements.includes(child.type)
      );

      if (containsBlockElement) {
        // If any child is a block element, render children directly without <p> wrapper
        return <>{children}</>;
      }
      
      // Otherwise, render as a normal paragraph
      return <p>{children}</p>;
    },
    
    // Code component renderer
    // @ts-ignore - Type complexity
    code({ node, inline, className, children, ...props }) {
      if (inline) {
        return <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm" {...props}>{children}</code>;
      }
      
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');
      const codeIndex = Math.floor(Math.random() * 10000); // Simple unique key for copy state

      // Mermaid: Render placeholder, initMermaid replaces parent <pre>
      if (language === 'mermaid') {
         // Render the raw code inside the standard structure initMermaid expects
         return <code className={className} {...props}>{children}</code>;
      }
      
      // Regular Code Block: Wrap in a div container identified by 'data-code-block-container'
      // The 'p' renderer will check for this div to prevent wrapping.
      return (
        // This outer 'div' is what the 'p' renderer looks for
        <div data-code-block-container="true" className="relative group my-4 text-sm"> {/* Ensure consistent sizing */}
          <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-1.5 rounded bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs flex items-center gap-1 text-gray-700 dark:text-gray-300"
              onClick={() => handleCopyCode(codeString, codeIndex)}
              aria-label="Copy code"
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
           {/* The actual <pre><code> structure */}
          <pre className={`overflow-auto rounded-md p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${language ? `language-${language}` : ''}`}>
             {/* The code content itself */}
            <code className={className} {...props}>{children}</code>
          </pre>
        </div>
      );
    },
    
    // Custom 'pre' renderer to handle cases where 'code' might not be the direct child
    pre: ({ node, children, ...props }) => {
        const childArray = React.Children.toArray(children);
        // Check if the direct child is our 'code' component which gets wrapped in the data-code-block-container div
        const firstChild = childArray[0];
        if (
            childArray.length === 1 &&
            React.isValidElement(firstChild) &&
            firstChild.type === 'code' && // Explicitly check if the type is 'code'
            (firstChild.props as any)?.className?.includes('language-') // Then check className (using 'as any' for pragmatic type assertion here)
        ) {
             // If it contains our syntax-highlighted code, assume the 'code' renderer handled wrapping
             // Render children directly as the 'code' component creates the necessary structure (<div..><pre><code>..</code></pre></div>)
            return <>{children}</>;
        }
        // Otherwise, it might be a plain <pre> block without syntax highlighting
        // Render it with default styling, wrapped in a div for the 'p' renderer check
        // Removed {...props} spread to avoid potential type errors like className missing
        return <div data-code-block-container="true"><pre className="overflow-auto rounded-md p-4 my-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm">{children}</pre></div>;
    }
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
          // Adjusted prose styles for better control, added dark mode explicitly
          className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-800 dark:hover:prose-a:text-indigo-300 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 dark:bg-gray-950 bg-white p-6 shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg overflow-auto" // Use dark:bg-gray-950 for main background
          style={{ minHeight: '500px', maxHeight: 'calc(100vh - 200px)' }} // Consider adjusting based on surrounding UI
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={components}
            // Removed disallowed elements as they can cause issues if not handled by custom components
            // disallowedElements={['p']} // Be cautious with this
            // unwrapDisallowed={true} // Deprecated, handled by custom 'p' component
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;
