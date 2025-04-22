/**
 * Utility to save generation results for later retrieval using Netlify Blobs
 * or local file system as a fallback.
 * Updated: ${new Date().toISOString()} - Correctly determine tmp path based on Netlify env.
 * Updated: ${new Date().toISOString()} - Moved local tmp directory creation to only run when not in Netlify env.
 * Updated: ${new Date().toISOString()} - Switched from fs to Netlify Blobs for persistence.
 * Updated: 2023-11-20 - Added Netlify compatibility for tmp directory (now deprecated).
 * Updated: 2023-10-21 - Added enhanced debug logging for document content structure.
 */
import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';
import path from 'path';

// Determine if running in Netlify environment
const isNetlify = process.env.NETLIFY === 'true';
// Determine if Netlify Blobs specifically are available
const isNetlifyBlobsAvailable = isNetlify && process.env.NETLIFY_BLOBS_CONTEXT;

// Determine the correct temporary directory path based on the environment
const tmpDir = isNetlify ? '/tmp' : path.join(process.cwd(), 'tmp');

/**
 * Save document generation result to Netlify Blobs (if available)
 * or local file system (as fallback) for later retrieval.
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

  if (isNetlifyBlobsAvailable) {
    // --- Save to Netlify Blobs ---
    try {
      const store = getStore('generationResults');
      await store.setJSON(requestId, data);
      console.log(`[${requestId}] Result saved to Netlify Blobs store 'generationResults'`);
      console.log(`[${requestId}] Netlify Blob Result saved at ${new Date().toISOString()}`);
      return true;
    } catch (error: any) {
      console.error(`[${requestId}] Error saving result to Netlify Blobs:`, error.message);
      return false;
    }
  } else {
    // --- Save to Filesystem (Netlify /tmp or local ./tmp) ---
    const filePath = path.join(tmpDir, `${requestId}.json`);
    console.log(`[${requestId}] Attempting to save result to filesystem path: ${filePath}`);

    // Only attempt to create the directory if running locally
    if (!isNetlify) {
        const ensureTmpDir = async () => {
          try {
            await fs.mkdir(tmpDir, { recursive: true });
            console.log(`[${requestId}] Ensured local tmp directory exists: ${tmpDir}`);
          } catch (error) {
            console.error(`[${requestId}] Failed to create local tmp directory:`, error);
            throw new Error('Failed to create local tmp directory for fallback storage.');
          }
        };
        try {
            await ensureTmpDir(); // Ensure directory exists before writing locally
        } catch(error: any) {
            console.error(`[${requestId}] Error ensuring local tmp directory exists: ${error.message}`);
            return false; // Stop if we can't create the local dir
        }
    } else {
        // In Netlify, /tmp is assumed to exist
        console.log(`[${requestId}] Running on Netlify, assuming ${tmpDir} exists.`);
    }

    try {
      const jsonData = JSON.stringify(data, null, 2); // Pretty print JSON
      await fs.writeFile(filePath, jsonData, 'utf-8');
      console.log(`[${requestId}] Result saved to filesystem: ${filePath}`);
      console.log(`[${requestId}] Filesystem Result saved at ${new Date().toISOString()}`);
      return true;
    } catch (error: any) {
      console.error(`[${requestId}] Error saving result to filesystem path ${filePath}:`, error.message);
      return false;
    }
  }
}
