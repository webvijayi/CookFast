import { NextApiRequest, NextApiResponse } from 'next';

type StatusResponse = {
  status: 'processing' | 'completed' | 'failed' | 'unknown';
  message: string;
  result?: any;
  error?: string;
  progress?: number;
};

// This is a simple placeholder implementation that works with Netlify's background functions
// For a real implementation, you would need a database or some form of state storage
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requestId } = req.query;

    if (!requestId || typeof requestId !== 'string') {
      return res.status(400).json({ 
        error: 'Missing or invalid requestId parameter'
      });
    }

    // Check if the result file exists in tmp directory
    const fs = require('fs');
    const path = require('path');
    
    // Use the OS tmp directory in serverless environments, otherwise use a local tmp directory
    const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
    const tmpDir = isServerless ? '/tmp' : path.join(process.cwd(), 'tmp');
    const resultPath = path.join(tmpDir, `${requestId}.json`);
    
    let statusResponse: StatusResponse;
    
    if (fs.existsSync(resultPath)) {
      try {
        // Read the result file
        const resultData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
        
        // Return completed status with the result data
        statusResponse = {
          status: 'completed',
          message: 'Your document generation has completed successfully.',
          result: resultData
        };
        
        // Log completion for monitoring
        console.info(`[STATUS] Found completed results for request ${requestId} - TokensUsed: Input=${resultData.debug?.tokensUsed?.input || 0}, Output=${resultData.debug?.tokensUsed?.output || 0}`);
      } catch (readError) {
        console.error(`Error reading result file for ${requestId}:`, readError);
        statusResponse = {
          status: 'processing',
          message: 'Your document generation is still in progress. This may take several minutes for complex requests.',
          progress: 75 // Higher progress since the file exists but couldn't be read
        };
      }
    } else {
      // Result file doesn't exist yet, still processing
      statusResponse = {
        status: 'processing',
        message: 'Your document generation is still in progress. This may take several minutes for complex requests.',
        progress: 50 // Placeholder progress
      };
    }

    // This message instructs the user to refresh the page later to check completed results
    return res.status(200).json({
      ...statusResponse,
      note: 'Background functions on Netlify free plan do not provide real-time status updates. Please check back in a few minutes and refresh the page to see your completed documents.'
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
