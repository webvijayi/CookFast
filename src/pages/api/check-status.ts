import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Local document store function (simplified version from documentStore.ts)
async function getDocumentFromStore(requestId: string): Promise<any | null> {
  try {
    // Use the OS tmp directory in serverless environments, otherwise use a local tmp directory
    const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
    const tmpDir = isServerless ? '/tmp' : path.join(process.cwd(), 'tmp');
    const filePath = path.join(tmpDir, `${requestId}.json`);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error('Error reading document from store:', error);
    return null;
  }
}

type StatusResponse = {
  status: 'processing' | 'completed' | 'failed' | 'unknown';
  message: string;
  result?: any;
  error?: string;
  progress?: number;
};

/**
 * Check-Status API endpoint
 * 
 * This API follows Netlify background function best practices for status checking.
 * It attempts to retrieve document generation results from multiple sources:
 * 1. From our document store if using Netlify KV (production)
 * 2. From cookies/localStorage if browser-based (development fallback)
 * 3. From temporary file storage (local development only)
 *
 * @param req - NextApiRequest object
 * @param res - NextApiResponse object
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: 'failed',
      error: 'Method not allowed',
      message: 'Only GET requests are supported for status checks' 
    });
  }

  try {
    const { requestId } = req.query;

    if (!requestId || typeof requestId !== 'string') {
      return res.status(400).json({ 
        error: 'Missing or invalid requestId parameter'
      });
    }
    
    // Add debug info in headers (won't affect the response but helps with debugging)
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Processing-Time', new Date().toISOString());

    // Check for results using our document store utility
    // This implements a production-ready approach for Netlify background functions
    try {
      // Try to retrieve the document from the store
      const document = await getDocumentFromStore(requestId);
      
      // If we found a document, return it as completed result
      if (document) {
        console.log(`Found results for request ${requestId}`);
        
        // Extract token usage if available
        const tokenInfo = document?.debug?.tokensUsed || {
          input: 0,
          output: 0,
          total: 0
        };
        
        // Log the token usage for monitoring
        console.info(`[STATUS] Found completed results for request ${requestId} - TokensUsed: Input=${tokenInfo.input}, Output=${tokenInfo.output}, Total=${tokenInfo.total}`);
        
        // Return the completed results with proper headers for caching
        res.setHeader('Cache-Control', 'private, max-age=60');
        return res.status(200).json({
          status: 'completed',
          message: 'Document generation completed successfully.',
          result: document,
          tokensUsed: tokenInfo,
          processingTimeMs: document?.debug?.processingTimeMs || 0
        });
      }
      
      // If no document was found, check if this is a known requestId
      // This would be handled by a database query in a full implementation
      // For now, we assume all requestIds are valid and still processing
    } catch (readError) {
      console.log('Error retrieving document from store:', readError);
      // Continue with processing status if error reading
    }

    // If we couldn't find results, try to create a tmp directory if it doesn't exist yet
    // This helps with local development
    try {
      // Use the OS tmp directory in serverless environments, otherwise use a local tmp directory
      const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
      const tmpDir = isServerless ? '/tmp' : path.join(process.cwd(), 'tmp');
      
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
        console.log('Created tmp directory for document storage');
      }
    } catch (dirError) {
      console.log('Error creating tmp directory:', dirError);
      // Continue even if this fails
    }
    
    // Check the status file for generation processing status/errors
    try {
      // Use the OS tmp directory in serverless environments, otherwise use a local tmp directory
      const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
      const tmpDir = isServerless ? '/tmp' : path.join(process.cwd(), 'tmp');
      
      const statusFilePath = path.join(tmpDir, `${requestId}.json`);
      if (fs.existsSync(statusFilePath)) {
        const statusContent = fs.readFileSync(statusFilePath, 'utf8');
        const statusData = JSON.parse(statusContent);
        
        // If the status file indicates a failure, return that to the frontend
        if (statusData.status === 'failed') {
          console.log(`Found failed generation for request ${requestId} - Error: ${statusData.error}`);
          
          return res.status(200).json({
            status: 'failed',
            message: 'Your document generation has failed',
            error: statusData.error || 'Unknown error occurred during generation',
            debug: statusData.debug || {
              provider: statusData.debug?.provider || 'unknown',
              model: statusData.debug?.model || 'unknown',
              timestamp: statusData.debug?.timestamp || new Date().toISOString(),
            }
          });
        }
      }
    } catch (checkError) {
      console.error('Error checking for failure status:', checkError);
      // Continue with normal processing status if error checking fails
    }
    
    // Return processing status with progress information if no failure detected
    const statusResponse: StatusResponse = {
      status: 'processing',
      message: 'Your document generation is still in progress. This may take several minutes for complex requests.',
      progress: 50 // We don't have real progress info, so use a placeholder
    };

    // Add a timestamp to help with debugging
    return res.status(200).json({
      ...statusResponse,
      note: 'Background functions on Netlify free plan do not provide real-time status updates. Please check back in a few minutes and refresh the page to see your completed documents.',
      timestamp: new Date().toISOString(),
      requestId
    });
    
  } catch (error) {
    console.error('Error checking generation status:', error);
    return res.status(500).json({ 
      status: 'failed',
      message: 'Error checking generation status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
