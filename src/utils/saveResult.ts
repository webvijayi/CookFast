/**
 * Utility to save generation results for later retrieval using Netlify Blobs
 * or local file system as a fallback.
 * Updated: ${new Date().toISOString()} - Switched from fs to Netlify Blobs for persistence.
 * Updated: 2023-11-20 - Added Netlify compatibility for tmp directory (now deprecated).
 */
import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';
import path from 'path';

// Determine if running in Netlify environment with Blobs configured
const isNetlifyBlobsAvailable = process.env.NETLIFY === 'true' && process.env.NETLIFY_BLOBS_CONTEXT;

// Ensure tmp directory exists for local fallback
const localTmpDir = path.join(process.cwd(), 'tmp');
const ensureTmpDir = async () => {
  try {
    await fs.mkdir(localTmpDir, { recursive: true });
  } catch (error) {
    console.error('[saveResult] Failed to create tmp directory:', error);
    // If tmp dir creation fails, local saving won't work
  }
};
ensureTmpDir(); // Call once on module load

/**
 * Save document generation result to Netlify Blobs (if available)
 * or local file system (as fallback) for later retrieval.
 */
export async function saveGenerationResult(requestId: string, data: any): Promise<boolean> {
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
    // --- Save to Local File System (Fallback) ---
    try {
      const filePath = path.join(localTmpDir, `${requestId}.json`);
      const jsonData = JSON.stringify(data, null, 2); // Pretty print JSON
      await fs.writeFile(filePath, jsonData, 'utf-8');
      console.log(`[${requestId}] Result saved locally to: ${filePath}`);
      console.log(`[${requestId}] Local Result saved at ${new Date().toISOString()}`);
      return true;
    } catch (error: any) {
      console.error(`[${requestId}] Error saving result locally to ${localTmpDir}:`, error.message);
      return false;
    }
  }
}
