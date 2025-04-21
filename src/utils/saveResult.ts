/**
 * Utility to save generation results for later retrieval
 */
import fs from 'fs';
import path from 'path';

/**
 * Save document generation result to the file system
 * for later retrieval by the check-status API
 */
export async function saveGenerationResult(requestId: string, data: any): Promise<boolean> {
  try {
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    // Write result to file with requestId as filename
    const resultPath = path.join(tmpDir, `${requestId}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(data, null, 2));
    console.log(`Result saved to ${resultPath} for request ${requestId}`);
    return true;
  } catch (error) {
    console.error(`Error saving result for ${requestId}:`, error);
    return false;
  }
}
