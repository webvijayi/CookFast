// Timestamp: 2025-04-21T06:00:00Z - Enhanced MarkdownRenderer component with better error handling, layout improvements, and added copy button functionality with Mermaid diagram support.
// Timestamp: 2025-05-10T14:30:00Z - Fixed Mermaid rendering issues in production environment with enhanced error handling.
// Timestamp: 2025-05-10T16:30:00Z - Simplified Mermaid sanitization and fixed React hydration errors.
// Timestamp: 2025-05-11T10:00:00Z - Refined hydration error fix and enhanced Mermaid sanitization logic.
// Timestamp: 2025-04-24T04:35:00Z - Use full mermaid ESM bundle, remove parser dependency, apply targeted fixes.
// Timestamp: 2025-04-24T04:55:00Z - Corrected code component prop typing using a custom interface.
// Timestamp: 2025-04-24T05:00:00Z - Added mermaid.contentLoaded() call and re-applied edge label space fix.
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components, ExtraProps } from 'react-markdown';
// Import the full mermaid library directly for rendering
import mermaid from 'mermaid/dist/mermaid.esm.min.mjs'; 

interface MarkdownRendererProps {
  content: string;
  isDarkMode?: boolean;
}

// Note: Keeping minimal sanitization helpers, but primary reliance is on Mermaid's internal parser via mermaid.run()
const sanitizeMermaidText = (text: string): string => {
  const escapedQuotes = text.replace(/"/g, '#quot;'); 
  if (/[\s()\[\]{}<>"'`;:!@#$%^&*=|?]/.test(escapedQuotes)) {
    return `"${escapedQuotes}"`;
  }
  return escapedQuotes;
};

const sanitizeMermaidLabel = (label: string): string => {
  let innerLabel = label.trim();
  const shapeRegex = /^[\(\[\{>](.*)[\)\]\}<]$/; 
  const match = innerLabel.match(shapeRegex);
  let prefix = '';
  let suffix = '';
  if (match && match[1]) {
      innerLabel = match[1].trim(); 
      prefix = label.charAt(0); 
      suffix = label.charAt(label.length - 1); 
  }
  const sanitizedInnerLabel = sanitizeMermaidText(innerLabel); 
  if (prefix && suffix) {
     if (sanitizedInnerLabel === '""') return `${prefix}${suffix}`; 
     return `${prefix}${sanitizedInnerLabel}${suffix}`;
  } else {
      return sanitizedInnerLabel;
  }
};

// Define a more specific props type for the code component override
interface CustomCodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: any; // The hast node
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  // Include other potential props passed by react-markdown/plugins if needed
  [key: string]: any; // Allow other props
}


const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isDarkMode = false }) => {
  const markdownRef = useRef<HTMLDivElement>(null);
  const mermaidInitialized = useRef(false); 
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [contentStatus, setContentStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Function to initialize and render Mermaid diagrams using the v10+ API
  const initAndRenderMermaid = async (): Promise<void> => {
    if (typeof window === 'undefined' || !markdownRef.current || mermaidInitialized.current) return; 

    try {
      // Initialize mermaid - ensure this happens only once or is idempotent
      mermaid.initialize({
        startOnLoad: false, // We call run manually
        theme: isDarkMode ? 'dark' : 'default',
        securityLevel: 'loose', 
        logLevel: 3, 
        fontFamily: 'inherit', 
        flowchart: { htmlLabels: true, curve: 'basis' },
        sequence: { 
          diagramMarginX: 50, diagramMarginY: 10, actorMargin: 50, width: 150, height: 65, 
          boxMargin: 10, boxTextMargin: 5, noteMargin: 10, messageMargin: 35, messageAlign: 'center' 
        },
        suppressErrors: true, 
        errorHandler: (error: string, errorDetails?: any) => {
          console.error("Mermaid rendering error (errorHandler):", error, errorDetails);
        }
      });
      // Explicitly call contentLoaded after initialize
      mermaid.contentLoaded(); 
      mermaidInitialized.current = true; // Mark as initialized
      console.log('[Mermaid] Initialized and contentLoaded called');

      // Find all potential mermaid code blocks
      const mermaidElements = markdownRef.current.querySelectorAll<HTMLElement>('pre > code.language-mermaid');
      console.log(`[Mermaid] Found ${mermaidElements.length} potential diagram blocks.`);
      
      const containersToRender: HTMLElement[] = [];

      // Prepare containers and apply minimal fixes
      for (let i = 0; i < mermaidElements.length; i++) {
        const el = mermaidElements[i];
        let diagramText = el.textContent || '';
        
        try {
          // **Enhanced Sanitization + Fixes**
          diagramText = diagramText.replace(/\r\n|\r/g, '\n');
          diagramText = diagramText.split('\n').map(line => line.trim()).join('\n').trim();
          diagramText = diagramText.replace(/^```mermaid\s*/, '').replace(/\s*```$/, '').trim();
          diagramText = diagramText.replace(/\n{2,}/g, '\n'); 
          diagramText = diagramText.replace(/^\s*\/\/.*$/gm, ''); // Remove comments
          diagramText = diagramText.replace(/^flowchart/gm, 'graph'); // Use graph alias
          
          // Fix pipe character syntax in edge labels by adding spaces
          // This addresses the common error with edge labels like: A -->|Label|B
          diagramText = diagramText.replace(/(\|)([^\s|])/g, '$1 $2'); // Add space after opening pipe
          diagramText = diagramText.replace(/([^\s|])(\|)/g, '$1 $2'); // Add space before closing pipe
          
          // Fix labels with parens: C[...] -> C["..."]
          diagramText = diagramText.replace(/(\[)([^"\]]*\([^)]*\)[^"\]]*)(\])/g, (match, open, content, close) => {
             return `${open}"${content.replace(/"/g, '#quot;')}"${close}`;
          });
          
          // Ensure space after edge label closing pipe: |Text|Node -> |Text| Node
          diagramText = diagramText.replace(/(\|)(\S)/g, '$1 $2'); 
          
          // Replace semicolon immediately after node definition with newline
          diagramText = diagramText.replace(/([\)\]\}<>]);/g, '$1\n');

          // Fix common syntax issues with edge labels
          diagramText = diagramText.replace(/(-->|==>|~~>|-.->|===>)(\|)([^|]+)(\|)([^\s])/g, '$1$2$3$4 $5');

          console.log(`[Mermaid] Prepared code for diagram ${i}:\n${diagramText}`); 

          const container = document.createElement('div');
          container.setAttribute('data-mermaid-processed', 'false'); // Mark for rendering
          container.className = 'mermaid'; // Class needed for mermaid.run querySelector
          container.id = `mermaid-container-${i}-${Date.now()}`;
          container.textContent = diagramText; 

          const preElement = el.parentElement;
          if (preElement?.parentElement) {
            preElement.parentElement.replaceChild(container, preElement);
            containersToRender.push(container); // Add to list for batch rendering
          } else {
             console.warn(`[Mermaid] Could not find parent element for pre tag of diagram ${i}`);
          }
        } catch (processingError: unknown) {
          // Handle errors during text processing/container creation
          const errorMessage = processingError instanceof Error ? processingError.message : String(processingError);
          console.error(`[Mermaid] Error preparing diagram ${i} text:`, errorMessage);
          const errorDiv = document.createElement('div');
          errorDiv.className = 'p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md text-sm';
          errorDiv.textContent = `Error preparing diagram: ${errorMessage}`;
          el.parentElement?.parentElement?.replaceChild(errorDiv, el.parentElement);
        }
      }

      // Render all prepared diagrams using mermaid.run
      if (containersToRender.length > 0) {
        console.log(`[Mermaid] Calling mermaid.run() for ${containersToRender.length} containers.`);
        try {
          await mermaid.run({ nodes: containersToRender, suppressErrors: false }); // Let errors throw
          console.log('[Mermaid] mermaid.run() completed.');
          containersToRender.forEach(c => c.setAttribute('data-mermaid-processed', 'true'));
        } catch (runError: unknown) {
           console.error('[Mermaid] Error during mermaid.run():', runError);
           // Display error in the specific container if possible, otherwise show general error
           const errorContainer = containersToRender.find(c => (runError as any)?.message?.includes(c.id)); // Heuristic
           const errorMessage = (runError as any)?.str || (runError instanceof Error ? runError.message : String(runError));
           const targetContainer = errorContainer || containersToRender[0]; // Fallback to first container or general error
           
           if (targetContainer) {
              targetContainer.innerHTML = `<div class="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
                <p class="text-red-600 dark:text-red-400 font-medium">Mermaid Diagram Rendering Failed:</p>
                <pre class="mt-2 text-xs overflow-auto whitespace-pre-wrap border border-red-200 dark:border-red-700 p-2 rounded bg-red-50 dark:bg-red-900/50">${errorMessage}</pre>
                <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">Attempted Code (Cleaned + Fixed):</div>
                <pre class="mt-1 text-xs overflow-auto whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">${targetContainer.textContent}</pre> {/* Show code from the specific container */}
              </div>`;
           } else {
              setRenderError(`Mermaid rendering failed. Check console for details. Error: ${errorMessage}`);
           }
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
    mermaidInitialized.current = false; // Reset initialization flag on content change

    // Schedule mermaid initialization and rendering
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && markdownRef.current) { 
        initAndRenderMermaid(); // Call the combined function
      }
    }, 300); 

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

  // Component overrides for ReactMarkdown
  const components: Components = {
    p: ({ node, children }) => {
      const blockElements = ['div', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'blockquote'];
      const containsBlockElement = React.Children.toArray(children).some(child => 
        React.isValidElement(child) && 
        typeof child.type === 'string' && 
        blockElements.includes(child.type)
      );
      if (containsBlockElement) {
        return <>{children}</>;
      }
      return <p>{children}</p>;
    },
    // Use standard props provided by react-markdown, correctly typed
    code(props: CustomCodeProps) { // Use the custom interface here
      const { children, className, node, inline, ...rest } = props; // Destructure standard props
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (inline) {
        // Pass only known HTML attributes for inline code
        return <code className={`px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm ${className || ''}`} {...rest}>{children}</code>;
      }

      // For Mermaid, render the raw code inside <pre><code> for initAndRenderMermaid to find
      if (language === 'mermaid') {
        let mermaidContent = String(children).trim();
        
        // Try to normalize content to avoid common parsing errors
        // This is in addition to what initAndRenderMermaid does, to make it more robust
        try {
          // If content doesn't start with a valid diagram type, attempt to detect and fix
          const validDiagramTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie'];
          const firstLine = mermaidContent.split('\n')[0].trim();
          
          if (!validDiagramTypes.some(type => firstLine.startsWith(type))) {
            // If no diagram type is detected at start, assume flowchart/graph
            if (mermaidContent.includes('-->') || mermaidContent.includes('---')) {
              mermaidContent = 'graph TD;\n' + mermaidContent;
            }
          }
          
          // Replace unsupported flowchart with graph
          mermaidContent = mermaidContent.replace(/^flowchart\s/gm, 'graph ');
          
          // Add proper diagram terminator if missing
          if (!mermaidContent.includes(';')) {
            mermaidContent = mermaidContent + ';';
          }
          
          // Fix common syntax issues:
          
          // 1. Ensure node IDs are properly defined before edge definitions
          // Matches patterns like 'NodeA --> NodeB' where NodeA or NodeB might not be defined
          const nodeIds = new Set();
          const nodeDefRegex = /\b([A-Za-z0-9_-]+)(\[|\(|\{|\>)/g;
          let match;
          while ((match = nodeDefRegex.exec(mermaidContent)) !== null) {
            nodeIds.add(match[1]);
          }
          
          // 2. Fix edge connections with undefined nodes
          // Look for edges where nodes aren't explicitly defined
          const edgeRegex = /\b([A-Za-z0-9_-]+)\s*(-->|---|\.->.|\==>|-.->)\s*([A-Za-z0-9_-]+)\b(?!\s*[[({<])/g;
          mermaidContent = mermaidContent.replace(edgeRegex, (match, source, edge, target) => {
            // If the source or target nodes aren't defined elsewhere, define them
            let result = match;
            if (!nodeIds.has(source)) {
              result = `${source}[${source}] ${edge} ${target}`;
              nodeIds.add(source);
            }
            if (!nodeIds.has(target)) {
              result = `${source} ${edge} ${target}[${target}]`;
              nodeIds.add(target);
            }
            return result;
          });
          
          // 3. Fix malformed node definitions with spaces in brackets
          mermaidContent = mermaidContent.replace(/(\w+)\s*\[\s*([^\]]+)\s*\]/g, '$1["$2"]');
          
          // 4. Fix incomplete node definitions (missing closing brackets)
          const lines = mermaidContent.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for unbalanced brackets
            const openBrackets = (line.match(/\[/g) || []).length;
            const closeBrackets = (line.match(/\]/g) || []).length;
            if (openBrackets > closeBrackets) {
              lines[i] = line + ']'.repeat(openBrackets - closeBrackets);
            }
            
            const openCurly = (line.match(/\{/g) || []).length;
            const closeCurly = (line.match(/\}/g) || []).length;
            if (openCurly > closeCurly) {
              lines[i] = line + '}'.repeat(openCurly - closeCurly);
            }
            
            const openParen = (line.match(/\(/g) || []).length;
            const closeParen = (line.match(/\)/g) || []).length;
            if (openParen > closeParen) {
              lines[i] = line + ')'.repeat(openParen - closeParen);
            }
          }
          mermaidContent = lines.join('\n');
          
          // 5. Ensure proper spacing around edge definitions
          mermaidContent = mermaidContent.replace(/(\w+|\])(\.|-->|---|===>|-.->|==>)(\w+|\[)/g, '$1 $2 $3');
          
          // 6. Ensure nodes with edge labels have proper syntax
          // Fix common edge label issues like A-->|text|B with missing spaces
          mermaidContent = mermaidContent.replace(/(\w+|\])\s*(-->|---|===>|-.->)\s*\|([^|]+)\|\s*(\w+|\[)/g, 
            (match, source, arrow, label, target) => {
              return `${source} ${arrow}|${label.trim()}| ${target}`;
            }
          );
          
          console.log('[Mermaid] Preprocessed content:', mermaidContent);
        } catch (e) {
          console.warn('[Mermaid] Error during content normalization:', e);
          // Continue with original content if preprocessing fails
        }
        
        return (
          <pre> 
            <code className={className || 'language-mermaid'} {...rest}>
              {mermaidContent}
            </code>
          </pre>
        );
      }
      
      // Regular Code Block
      const codeString = String(children).replace(/\n$/, '');
      const codeIndex = Math.floor(Math.random() * 10000); 
      return (
        <div data-code-block-container="true" className="relative group my-4 text-sm"> 
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
          <pre className={`overflow-auto rounded-md p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${className || ''}`}>
            {/* Pass props correctly to the inner code element */}
            <code className={className} {...rest}>{children}</code>
          </pre>
        </div>
      );
    },
    pre: ({ node, children, ...props }) => {
        const childArray = React.Children.toArray(children);
        const firstChild = childArray[0];
        if (
            childArray.length === 1 &&
            React.isValidElement(firstChild) &&
            firstChild.type === 'code' && 
            (firstChild.props as any)?.className?.includes('language-mermaid') 
        ) {
            // Let the 'code' component render the <pre> for Mermaid
            return <>{children}</>; 
        }
        // Render other <pre> blocks normally
        return <div data-code-block-container="true"><pre className="overflow-auto rounded-md p-4 my-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm" {...props}>{children}</pre></div>;
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
          className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-800 dark:hover:prose-a:text-indigo-300 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 dark:bg-gray-950 bg-white p-6 shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg overflow-auto" 
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
