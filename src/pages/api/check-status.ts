import { NextApiRequest, NextApiResponse } from 'next';
import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';
import path from 'path';

// Determine if running in Netlify environment with Blobs configured
const isNetlifyBlobsAvailable = process.env.NETLIFY === 'true' && process.env.NETLIFY_BLOBS_CONTEXT;
const localTmpDir = path.join(process.cwd(), 'tmp');

// Unified function to get document from store (Blobs or Local FS)
async function getDocumentFromStore(requestId: string): Promise<any | null> {
  if (isNetlifyBlobsAvailable) {
    // --- Read from Netlify Blobs ---
    try {
      const store = getStore('generationResults');
      const document = await store.get(requestId, { type: 'json' });
      if (!document) {
        console.log(`[${requestId}] No result found in Netlify Blobs store 'generationResults'.`);
        return null;
      }
      console.log(`[${requestId}] Successfully retrieved result from Netlify Blobs.`);
      return document;
    } catch (error: any) {
      console.error(`[${requestId}] Error reading document from Netlify Blobs store:`, error.message);
      // If Blobs configured but error reading, return null to indicate potential processing
      return null;
    }
  } else {
    // --- Read from Local File System (Fallback) ---
    try {
      const filePath = path.join(localTmpDir, `${requestId}.json`);
      const fileData = await fs.readFile(filePath, 'utf-8');
      const document = JSON.parse(fileData);
      console.log(`[${requestId}] Successfully retrieved result from local file: ${filePath}`);
      return document;
    } catch (error: any) {
      // If file not found (ENOENT) or other error, assume it's processing or doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`[${requestId}] Error reading result from local file ${localTmpDir}:`, error.message);
      } else {
        console.log(`[${requestId}] No result found in local tmp directory.`);
      }
      return null;
    }
  }
}

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
 * Check-Status API endpoint (Updated for Netlify Blobs / Local FS Fallback)
 *
 * Retrieves document generation results from the appropriate store.
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

    // Check for results using our document store utility
    const document = await getDocumentFromStore(requestId);
    
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
    
    // If no document was found, it's still processing.
    console.log(`[${requestId}] Result not yet available in store. Assuming processing.`);
    const statusResponse: StatusResponse = {
      status: 'processing',
      message: `Your document generation is still in progress. Checking ${isNetlifyBlobsAvailable ? 'Netlify Blobs' : 'local storage'}...`,
      progress: 50, // Placeholder progress
      note: 'Background functions may take several minutes. Refresh later to check again.',
      timestamp: new Date().toISOString(),
      requestId
    };

    // Return processing status
    res.setHeader('Cache-Control', 'private, max-age=10'); // Cache for 10 seconds
    return res.status(200).json(statusResponse);

  } catch (error: any) {
    const errorRequestId = requestId || 'unknown'; // Use requestId if available
    console.error(`[${errorRequestId}] General error in check-status handler: ${error.message}`, error.stack);
    return res.status(500).json({
      status: 'failed',
      message: 'Error checking generation status',
      error: error.message || 'Unknown error',
      requestId: errorRequestId // Include requestId in error response
    });
  }
}
