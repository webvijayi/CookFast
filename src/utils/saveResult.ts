/**
 * Utility to save generation results for later retrieval
 * Updated: 2023-11-20 - Added Netlify compatibility for tmp directory
 */
import fs from 'fs';
import path from 'path';

/**
 * Save document generation result to the file system
 * for later retrieval by the check-status API
 */
export async function saveGenerationResult(requestId: string, data: any): Promise<boolean> {
  try {
    // Check if running in Netlify or other serverless environment
    const isServerless = !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    // Use /tmp directory in serverless environments
    const tmpDir = isServerless ? '/tmp' : path.join(process.cwd(), 'tmp');
    
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    // Write result to file with requestId as filename
    const resultPath = path.join(tmpDir, `${requestId}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(data, null, 2));
    console.log(`Result saved to ${resultPath} for request ${requestId}`);
    
    // Add timestamp for debugging
    console.log(`Result saved at ${new Date().toISOString()} for request ${requestId}`);
    
    return true;
  } catch (error) {
    console.error(`Error saving result for ${requestId}:`, error);
    return false;
  }
}
