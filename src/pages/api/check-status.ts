import { NextApiRequest, NextApiResponse } from 'next';
// Remove unused imports and local definitions
// import { getStore } from '@netlify/blobs'; 
// import fs from 'fs/promises';
// import path from 'path';

// Import the new centralized function
import { getGenerationResult } from '../../utils/saveResult';

// Re-enable isNetlify as it might be used elsewhere
const isNetlify = process.env.NETLIFY === 'true' || 
                  process.env.NETLIFY_BLOBS_CONTEXT === 'production' || 
                  process.env.NETLIFY_DEV === 'true' ||
                  process.cwd().includes('/var/task');

console.log(`[check-status] Environment detection: isNetlify=${isNetlify}, NETLIFY=${process.env.NETLIFY}, NETLIFY_BLOBS_CONTEXT=${process.env.NETLIFY_BLOBS_CONTEXT}, cwd=${process.cwd()}`);

// Remove local environment detection and path constants
/*
const isNetlify = process.env.NETLIFY === 'true' || 
                  process.env.NETLIFY_BLOBS_CONTEXT === 'production' || 
                  process.env.NETLIFY_DEV === 'true' ||
                  process.cwd().includes('/var/task');

console.log(`[check-status] Environment detection: isNetlify=${isNetlify}, NETLIFY=${process.env.NETLIFY}, NETLIFY_BLOBS_CONTEXT=${process.env.NETLIFY_BLOBS_CONTEXT}, cwd=${process.cwd()}`);

// Remove store name if no longer needed locally
// const STORE_NAME = 'generationResults';

// Remove tmpDir constant
// const tmpDir = isNetlify ? '/tmp' : path.join(process.cwd(), 'tmp');
*/

// Remove local type definitions if no longer needed
/*
interface GetOptions {
  type?: 'json' | 'text' | 'arrayBuffer' | 'blob' | 'stream';
  consistency?: 'eventual' | 'strong';
}

interface GetMetadataOptions {
  consistency?: 'eventual' | 'strong';
}
*/

// Remove the entire local getDocumentFromStore function
/*
async function getDocumentFromStore(requestId: string): Promise<any | null> {
  // ... implementation ...
}
*/

type StatusResponse = {
  status: 'processing' | 'completed' | 'failed' | 'unknown';
  message: string;
  result?: any;
  error?: string;
  progress?: number; // Keep progress for potential future enhancements
  tokensUsed?: { input: number; output: number; total: number };
  processingTimeMs?: number;
  note?: string; // Keep note for Netlify free tier info
  timestamp?: string;
  requestId?: string;
  debug?: any; // Add debug field to allow passing it through on failure
};

/**
 * Check-Status API endpoint
 * 
 * Retrieves document generation results from Netlify Blobs in production
 * or from local filesystem during development.
 *
 * @param req - NextApiRequest object
 * @param res - NextApiResponse object
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse> // Use specific type for response
) {
  // Add appropriate CORS headers for API calls
  // Allow all origins for development
  const allowedOrigins = [
    'https://cook-fast.webvijayi.com',
    'https://cookfast.netlify.app',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight
  res.setHeader('Vary', 'Origin');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Only allow GET method
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({
      status: 'failed',
      message: 'Only GET requests are supported for status checks',
      error: 'Method not allowed'
    });
  }

  let requestId: string | undefined; // Declare requestId here

  try {
    requestId = req.query.requestId as string; // Assign here

    if (!requestId) {
      return res.status(400).json({
        status: 'failed',
        message: 'Missing or invalid requestId parameter',
        error: 'Missing or invalid requestId parameter'
      });
    }
    
    // Add debug info in headers (won't affect the response but helps with debugging)
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Processing-Time', new Date().toISOString());
    res.setHeader('X-Storage-Method', isNetlify ? 'Netlify-Blobs' : 'Local-Filesystem');
    res.setHeader('X-Netlify-Environment', process.env.NETLIFY_BLOBS_CONTEXT || 'unknown');

    // Log the request
    console.log(`[${requestId}] Processing status check request at ${new Date().toISOString()}`);

    // Use the imported function
    const document = await getGenerationResult(requestId);
    
    // If we found a document, return it as completed/failed result
    if (document) {
      const finalStatus = document.status || (document.error ? 'failed' : 'completed'); // Determine status
      console.log(`[${requestId}] Found result in store with status: ${finalStatus}.`);
      
      // Extract token usage if available
      const tokenInfo = document?.debug?.tokensUsed || {
        input: 0,
        output: 0,
        total: 0
      };
      
      // Log the token usage for monitoring
      if(finalStatus === 'completed') {
        console.info(`[${requestId}] Completed - Tokens: Input=${tokenInfo.input}, Output=${tokenInfo.output}, Total=${tokenInfo.total}`);
      } else if (finalStatus === 'failed') {
        console.warn(`[${requestId}] Failed - Error: ${document.error}`);
      }
      
      // Check if we need to validate document structure before returning
      if (finalStatus === 'completed' && document && document.documents) {
        // Check if documents array exists and has valid structure
        if (!Array.isArray(document.documents) || document.documents.length === 0) {
          console.warn(`[${requestId}] Document has 'completed' status but documents array is empty or not an array`);
          // Keep the status as completed but add warning in message
          return res.status(200).json({
            status: 'completed',
            message: 'Document generation completed but no valid documents were found in the result.',
            result: document,
            error: 'No documents were generated',
            tokensUsed: tokenInfo,
            processingTimeMs: document?.debug?.processingTimeMs || 0,
            timestamp: document?.debug?.timestamp || document.timestamp || new Date().toISOString(),
            requestId,
            debug: document.debug
          });
        }
        
        // Ensure all documents have title and content properties
        const validDocuments = document.documents.filter((doc: any) => 
          doc && typeof doc === 'object' && doc.title && doc.content
        );
        
        if (validDocuments.length === 0) {
          console.warn(`[${requestId}] Document has 'completed' status but no valid documents with title/content were found`);
          return res.status(200).json({
            status: 'completed',
            message: 'Document generation completed but documents are missing required fields.',
            result: document,
            error: 'Generated documents are malformed',
            tokensUsed: tokenInfo,
            processingTimeMs: document?.debug?.processingTimeMs || 0,
            timestamp: document?.debug?.timestamp || document.timestamp || new Date().toISOString(),
            requestId,
            debug: document.debug
          });
        }
        
        // If we found fewer valid documents than the total, log a warning
        if (validDocuments.length < document.documents.length) {
          console.warn(`[${requestId}] Some documents were filtered out due to missing fields: ${document.documents.length - validDocuments.length} invalid out of ${document.documents.length} total`);
        }
      }
      
      // Return the completed/failed results with proper headers for caching
      res.setHeader('Cache-Control', 'private, max-age=60');
      return res.status(200).json({
        status: finalStatus,
        message: document.message || (finalStatus === 'completed' ? 'Document generation completed successfully.' : 'Document generation failed.'),
        result: finalStatus === 'completed' ? document : undefined, // Only include full result on success
        error: document.error, // Include error if failed
        tokensUsed: tokenInfo,
        processingTimeMs: document?.debug?.processingTimeMs || 0,
        timestamp: document?.debug?.timestamp || document.timestamp || new Date().toISOString(),
        requestId,
        debug: document.debug
      });
    }
    
    // If no document, assume it's still processing
    console.log(`[${requestId}] No document found in store, assuming processing`);
    
    // Return processing status to client
    return res.status(202).json({
      status: 'processing',
      message: 'Document generation is still in progress...',
      progress: 0, // Unknown progress
      requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    // Handle any unexpected errors
    console.error(`[${requestId || 'unknown'}] Unexpected error in check-status:`, error.message || String(error));
    console.error(error.stack || 'No stack trace available');
    
    return res.status(500).json({
      status: 'failed',
      message: 'An unexpected error occurred while checking generation status',
      error: `Internal server error: ${error.message || String(error)}`,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
}
