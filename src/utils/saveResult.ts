/**
 * Utility to save generation results for later retrieval using Netlify Blobs
 * or local file system as a fallback.
 * Updated: ${new Date().toISOString()} - Prioritized Netlify Blobs for production, removed conditional NETLIFY_BLOBS_CONTEXT check.
 * Updated: ${new Date().toISOString()} - Fixed tmp path to use /tmp instead of /var/task/tmp on Netlify.
 * Updated: ${new Date().toISOString()} - Correctly determine tmp path based on Netlify env.
 * Updated: ${new Date().toISOString()} - Moved local tmp directory creation to only run when not in Netlify env.
 * Updated: ${new Date().toISOString()} - Switched from fs to Netlify Blobs for persistence.
 * Updated: 2023-11-20 - Added Netlify compatibility for tmp directory (now deprecated).
 * Updated: 2023-10-21 - Added enhanced debug logging for document content structure.
 * Updated: 2025-04-22 - Removed filesystem fallback for production, enhanced Netlify Blobs implementation.
 * Updated: 2025-04-22 - Fixed environment detection logic to properly identify Netlify deployments.
 */
import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';
import path from 'path';

// Determine if running in Netlify environment - check multiple indicators
// The NETLIFY env var is the primary indicator, but also check deployment-specific paths
const isNetlify = process.env.NETLIFY === 'true' || 
                  process.env.NETLIFY_BLOBS_CONTEXT === 'production' || 
                  process.env.NETLIFY_DEV === 'true' ||
                  process.cwd().includes('/var/task');

console.log(`Environment detection: isNetlify=${isNetlify}, NETLIFY=${process.env.NETLIFY}, NETLIFY_BLOBS_CONTEXT=${process.env.NETLIFY_BLOBS_CONTEXT}, cwd=${process.cwd()}`);

// Use consistent store name for all generation results
const STORE_NAME = 'generationResults';

// Determine the correct temporary directory path for local development only
const tmpDir = isNetlify ? '/tmp' : path.join(process.cwd(), 'tmp');

/**
 * Save document generation result to Netlify Blobs in production
 * or local file system (as fallback) during local development.
 * 
 * @param requestId - Unique identifier for this generation request
 * @param data - The data to save
 * @returns Promise<boolean> - True if save was successful
 */
export async function saveGenerationResult(requestId: string, data: any): Promise<boolean> {
  // Log document structure for debugging
  if (data?.documents) {
    console.log(`[${requestId}] Saving document result with ${data.documents.length || 0} documents`);
    if (Array.isArray(data.documents)) {
      // Log document titles for debugging
      console.log(`[${requestId}] Document titles: ${data.documents.map((doc: any) => 
        doc?.title || 'Untitled').join(', ')}`);
      
      // Log rough content length for each document
      data.documents.forEach((doc: any, index: number) => {
        const contentLength = doc?.content?.length || 0;
        console.log(`[${requestId}] Document ${index+1}: ${doc?.title || 'Untitled'} (content length: ${contentLength} chars)`);
      });
    } else {
      console.warn(`[${requestId}] WARNING: documents is not an array: ${typeof data.documents}`);
    }
  } else {
    console.log(`[${requestId}] Saving result without documents array`);
  }

  if (isNetlify) {
    // --- In production: Use Netlify Blobs ---
    try {
      console.log(`[${requestId}] Using Netlify Blobs for storage (environment: ${process.env.NETLIFY_BLOBS_CONTEXT || 'unknown'})`);
      
      // Create a site-wide store using standard getStore method
      const store = getStore(STORE_NAME);
      
      // Add timestamp to metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        contentType: 'application/json',
        environment: process.env.NETLIFY_BLOBS_CONTEXT || 'netlify'
      };
      
      // Store using setJSON with metadata
      await store.setJSON(requestId, data, { metadata });
      
      console.log(`[${requestId}] Result saved to Netlify Blobs store '${STORE_NAME}'`);
      console.log(`[${requestId}] Blob saved at ${metadata.timestamp}`);
      return true;
    } catch (error: any) {
      console.error(`[${requestId}] Error saving result to Netlify Blobs:`, error.message);
      console.error(`[${requestId}] Stack trace:`, error.stack);
      
      // Log additional diagnostic information
      if (error.code || error.statusCode) {
        console.error(`[${requestId}] Error code:`, error.code || error.statusCode);
      }
      
      // Attempt to fallback to filesystem in case of Netlify Blobs failure
      try {
        console.log(`[${requestId}] Attempting filesystem fallback after Netlify Blobs failure`);
        const filePath = path.join(tmpDir, `${requestId}.json`);
        
        // Add metadata to the data
        data._meta = {
          savedAt: new Date().toISOString(),
          environment: 'netlify-filesystem-fallback'
        };
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`[${requestId}] Result saved to Netlify filesystem fallback at: ${filePath}`);
        return true;
      } catch (fallbackError: any) {
        console.error(`[${requestId}] Filesystem fallback also failed:`, fallbackError.message);
        return false;
      }
    }
  } else {
    // --- In local development: Use filesystem ---
    const filePath = path.join(tmpDir, `${requestId}.json`);
    console.log(`[${requestId}] Local development: Saving to filesystem at ${filePath}`);

    // Ensure the tmp directory exists locally
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      console.log(`[${requestId}] Ensured local tmp directory exists: ${tmpDir}`);
    } catch(error: any) {
      console.error(`[${requestId}] Error ensuring local tmp directory exists:`, error.message);
      return false;
    }
    
    // Write the file
    try {
      // Add timestamp and environment info to data
      data._meta = {
        savedAt: new Date().toISOString(),
        environment: 'local-development'
      };
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`[${requestId}] Result saved to local file system at: ${filePath}`);
      return true;
    } catch (error: any) {
      console.error(`[${requestId}] Error saving result to file:`, error.message);
      return false;
    }
  }
}
