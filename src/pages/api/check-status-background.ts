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

    // For now, we'll always return that the request is still processing
    // In a real implementation, you would check a database or storage
    const statusResponse: StatusResponse = {
      status: 'processing',
      message: 'Your document generation is still in progress. This may take several minutes for complex requests.',
      progress: 50 // Placeholder progress
    };

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
