/**
 * Utility to save generation results for later retrieval using Netlify Blobs
 * or local file system as a fallback.
 * Updated: ${new Date().toISOString()} - Simplified Netlify detection, removed FS fallback on Netlify, improved Blob logging.
 * Updated: ${new Date().toISOString()} - Fixed Netlify Blobs write issues with strong consistency and better error handling.
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
import fs from 'fs/promises';
import path from 'path';
import { getStore } from '@netlify/blobs';

// Type definitions for Netlify Blobs API options
interface SetOptions {
  consistency?: 'eventual' | 'strong';
  metadata?: Record<string, unknown>;
}

interface GetOptions {
  type?: 'json' | 'text' | 'arrayBuffer' | 'blob' | 'stream';
  consistency?: 'eventual' | 'strong';
}

interface GetMetadataOptions {
  consistency?: 'eventual' | 'strong';
}

interface DebugResponse {
  isNetlify: boolean;
  // netlifyContext: string | undefined; // Removed - Rely on SDK's internal context
  // blobsEnabled: boolean; // Removed - Redundant check
  storeUsed: string | null; // Track which store was actually used (blobs or fs)
  storeCreated: boolean;
  attemptedStorage: string[];
  errors: Record<string, string>;
  timestamp: string;
  processingTimeMs: number;
  tokensUsed?: { 
    input: number; 
    output: number; 
    total: number;
  };
  // Additional fields for debugging
  environment: {
    NETLIFY?: boolean;
    NETLIFY_DEV?: boolean;
    CWD?: string;
    NODE_ENV?: string;
  };
}

// Store name for all generation results
const STORE_NAME = 'generationResults';

// Determine if running in a deployed Netlify environment
// const isNetlify = process.env.NETLIFY === 'true'; // Old check
// More robust check for Netlify Function environment
const isNetlify = process.env.NETLIFY === 'true' || process.cwd().includes('/var/task');

// Determine if running in Netlify Dev
const isNetlifyDev = process.env.NETLIFY_DEV === 'true';

console.log(`[saveResult] Environment detection: isNetlify=${isNetlify}, isNetlifyDev=${isNetlifyDev}, NETLIFY=${process.env.NETLIFY}, NETLIFY_DEV=${process.env.NETLIFY_DEV}, cwd=${process.cwd()}`);

// Determine the correct temporary directory path (only used for local dev/non-Netlify)
const localTmpDir = path.join(process.cwd(), 'tmp');

/**
 * Prepares a debug response object with information about the environment and configuration.
 * 
 * @returns Debug response object with environment and configuration information
 */
function prepareDebugResponse(startTime: number): DebugResponse {
  const processingTimeMs = Date.now() - startTime;
  
  const debugResponse: DebugResponse = {
    isNetlify,
    storeUsed: null,
    // netlifyContext: process.env.NETLIFY_BLOBS_CONTEXT, // Removed
    // blobsEnabled: !!process.env.NETLIFY_BLOBS_CONTEXT, // Removed
    storeCreated: false, // Will be updated if store is created
    attemptedStorage: [], // Will track storage attempts
    errors: {}, // Will track errors during storage attempts
    timestamp: new Date().toISOString(),
    processingTimeMs,
    environment: {
      NETLIFY: isNetlify,
      NETLIFY_DEV: isNetlifyDev,
      CWD: process.cwd(),
      NODE_ENV: process.env.NODE_ENV
    }
  };
  
  return debugResponse;
}

/**
 * Saves generation result using Netlify Blobs in production or local file system for local dev.
 * 
 * @param requestId - Unique identifier for the generation request
 * @param result - Generation result to save
 * @returns Promise<{success: boolean, location: string, debug: object}> - Result of save operation
 */
export async function saveGenerationResult(
  requestId: string,
  result: any
): Promise<{ success: boolean; location: string; debug: DebugResponse }> {
  const startTime = Date.now();
  const debug = prepareDebugResponse(startTime);
  
  console.log(`[${requestId}] Environment detection for saving: isNetlify=${isNetlify}, isNetlifyDev=${isNetlifyDev}, CWD=${process.cwd()}`);
  
  // Add metadata to the result for tracking
  const resultWithMeta = {
    ...result,
    _meta: {
      savedAt: new Date().toISOString(),
      environment: isNetlify ? 'netlify' : (isNetlifyDev ? 'netlify-dev' : 'local'),
      version: '1.0.3', // Increment this when changing save format
      requestId
    }
  };
  
  // Use Netlify Blobs if in a deployed Netlify environment (NOT Netlify Dev)
  if (isNetlify) {
    debug.attemptedStorage.push('netlify-blobs');
    debug.storeUsed = 'netlify-blobs';
    try {
      console.log(`[${requestId}] Attempting to use Netlify Blobs (environment: deployed Netlify)`);
      
      // Log environment details relevant to Blobs SDK
      console.log(`[${requestId}] Netlify Blobs Context Check:`, {
        NETLIFY: process.env.NETLIFY,
        NETLIFY_FUNCTION_NAME: process.env.NETLIFY_FUNCTION_NAME,
        NETLIFY_SITE_ID: process.env.CONTEXT === 'dev' ? 'mock-site-id' : process.env.SITE_ID, // SITE_ID might not be available like this
        NODE_VERSION: process.env.NODE_VERSION,
        storeName: STORE_NAME,
        key: requestId,
        cwd: process.cwd()
      });
      
      // Get the store - This MUST work implicitly in a correctly configured v2 Netlify Function.
      // If this fails, the function environment is likely misconfigured or saveGenerationResult
      // is called outside the handler scope.
      let store;
      try {
        store = getStore(STORE_NAME);
        console.log(`[${requestId}] Successfully obtained Netlify Blobs store instance for '${STORE_NAME}'.`);
        debug.storeCreated = true; // Indicates getStore succeeded
      } catch (storeError: unknown) {
        const error = storeError instanceof Error ? storeError : new Error(String(storeError));
        console.error(`[${requestId}] CRITICAL: Failed to get Netlify Blobs store instance for '${STORE_NAME}'. Error: ${error.message}`, error.stack);
        debug.errors.netlifyBlobsInit = `Failed to get store: ${error.message}`;
        // In deployed Netlify, failure to get the store is critical. Do not fallback.
        return {
          success: false,
          location: 'failed-init-blobs',
          debug
        };
      }
      
      // Save the result to Netlify Blobs with strong consistency
      const setOptions: SetOptions = { 
        consistency: 'strong', // Ensure data is fully written before returning
        metadata: {
          timestamp: new Date().toISOString(),
          requestType: result._meta?.version || 'unknown',
          status: result.status || 'unknown'
        }
      };
      
      console.log(`[${requestId}] Saving result to Netlify Blobs with key: ${requestId}...`);
      await store.setJSON(requestId, resultWithMeta, setOptions);
      debug.attemptedStorage.push('netlify-blobs-set-success');
      console.log(`[${requestId}] store.setJSON completed for key: ${requestId}`);

      // --- Verification Step ---
      try {
        console.log(`[${requestId}] Verifying blob save by retrieving metadata (strong consistency)...`);
        const metadataOptions: GetMetadataOptions = { consistency: 'strong' };
        const metadata = await store.getMetadata(requestId, metadataOptions);
        
        if (metadata) {
          console.log(`[${requestId}] VERIFICATION SUCCESS: Blob metadata found after save:`, metadata);
          debug.attemptedStorage.push('netlify-blobs-verify-success');
        } else {
          // This should ideally not happen with strong consistency on set/get
          console.warn(`[${requestId}] VERIFICATION WARNING: Blob metadata NOT found after save, despite using strong consistency.`);
          debug.errors.netlifyBlobsVerify = 'Metadata not found after save';
           debug.attemptedStorage.push('netlify-blobs-verify-fail');
        }
      } catch (verifyError: unknown) {
        const error = verifyError instanceof Error ? verifyError : new Error(String(verifyError));
        console.error(`[${requestId}] VERIFICATION ERROR: Error retrieving metadata after save: ${error.message}`, error.stack);
        debug.errors.netlifyBlobsVerify = `Verification failed: ${error.message}`;
        debug.attemptedStorage.push('netlify-blobs-verify-error');
        // Continue, as the write might have succeeded but verification failed.
      }
      // --- End Verification Step ---
      
      console.log(`[${requestId}] Result successfully saved to Netlify Blobs.`);
      return {
        success: true,
        location: `netlify-blobs://${STORE_NAME}/${requestId}`,
        debug
      };
    } catch (netlifyError: unknown) {
      const error = netlifyError instanceof Error ? netlifyError : new Error(String(netlifyError));
      
      console.error(`[${requestId}] CRITICAL: Error saving to Netlify Blobs: ${error.message}`, error.stack);
      debug.errors.netlifyBlobsSet = error.message;
      debug.attemptedStorage.push('netlify-blobs-set-fail');
      
      // No filesystem fallback in deployed Netlify environment.
      return {
        success: false,
        location: 'failed-save-blobs',
        debug
      };
    }
  } else {
    // Local development (including Netlify Dev) - use filesystem directly
    debug.attemptedStorage.push('filesystem-direct');
    debug.storeUsed = 'filesystem';
    console.log(`[${requestId}] Local/Netlify Dev environment: saving to filesystem at ${localTmpDir}`);
    // Use saveToFilesystem function (assuming it's defined below or imported)
    // Note: Netlify Dev uses a sandboxed local store, NOT the production Blobs. 
    // Filesystem is a reasonable approach for local dev persistence/inspection.
    return await saveToFilesystem(requestId, resultWithMeta, debug);
  }
}

/**
 * Saves result to local filesystem (used for local dev / Netlify Dev).
 * 
 * @param requestId - Unique identifier for the generation request
 * @param result - Generation result to save
 * @param debug - Debug information to update
 * @returns Promise<{success: boolean, location: string, debug: object}> - Result of save operation
 */
async function saveToFilesystem(
  requestId: string,
  result: any,
  debug: DebugResponse
): Promise<{ success: boolean; location: string; debug: DebugResponse }> {
  try {
    // Ensure tmp directory exists
    await fs.mkdir(localTmpDir, { recursive: true });
    console.log(`[${requestId}] Ensured local tmp directory exists: ${localTmpDir}`);
    
    // Save to temporary file
    const filePath = path.join(localTmpDir, `${requestId}.json`);
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`[${requestId}] Successfully saved result to local file: ${filePath}`);
    debug.attemptedStorage.push('filesystem-success');
    
    // Verify the file was saved correctly by reading its stats
    try {
      const stats = await fs.stat(filePath);
      console.log(`[${requestId}] File saved, size: ${stats.size} bytes, created: ${stats.birthtime}`);
       debug.attemptedStorage.push('filesystem-verify-success');
    } catch (verifyError: unknown) {
      const error = verifyError instanceof Error ? verifyError : new Error(String(verifyError));
      console.warn(`[${requestId}] Error verifying file save: ${error.message}`);
      debug.errors.filesystemVerify = `Verification failed: ${error.message}`;
      debug.attemptedStorage.push('filesystem-verify-error');
      // Continue since the save itself might have succeeded
    }
    
    return {
      success: true,
      location: `file://${filePath}`,
      debug
    };
  } catch (error: unknown) {
    const fsError = error instanceof Error ? error : new Error(String(error));
    
    console.error(`[${requestId}] Error saving to filesystem: ${fsError.message}`, fsError.stack);
    debug.errors.filesystem = fsError.message;
    debug.attemptedStorage.push('filesystem-fail');
    
    return {
      success: false,
      location: 'failed-to-save-filesystem',
      debug
    };
  }
}

/**
 * Retrieves generation result from Netlify Blobs in production or local file system for local dev.
 * 
 * @param requestId - Unique identifier for the generation request
 * @returns Promise<any | null> - The stored generation result or null if not found or on error
 */
export async function getGenerationResult(requestId: string): Promise<any | null> {
  console.log(`[${requestId}] Attempting to retrieve result. isNetlify=${isNetlify}, isNetlifyDev=${isNetlifyDev}`);

  if (isNetlify) {
    // --- Deployed Netlify: Use Netlify Blobs ---
    console.log(`[${requestId}] Using Netlify Blobs for retrieval.`);
    try {
      const store = getStore(STORE_NAME);
      console.log(`[${requestId}] Obtained store instance for '${STORE_NAME}'.`);
      
      const getOptions: GetOptions = { 
        type: 'json',
        consistency: 'strong' // Ensure latest data is read
      };
      
      console.log(`[${requestId}] Attempting store.get with key: ${requestId}`);
      const document = await store.get(requestId, getOptions);
      
      if (document) {
        console.log(`[${requestId}] Successfully retrieved result from Netlify Blobs.`);
        return document;
      } else {
        console.log(`[${requestId}] No result found in Netlify Blobs store '${STORE_NAME}' for key '${requestId}'.`);
        return null;
      }
    } catch (error: unknown) {
      const blobError = error instanceof Error ? error : new Error(String(error));
      console.error(`[${requestId}] CRITICAL: Error retrieving result from Netlify Blobs: ${blobError.message}`, blobError.stack);
      // Do not fallback to filesystem in deployed Netlify
      return null;
    }
  } else {
    // --- Local Development / Netlify Dev: Use Filesystem ---
    const filePath = path.join(localTmpDir, `${requestId}.json`);
    console.log(`[${requestId}] Local/Netlify Dev: Reading from filesystem at ${filePath}`);
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      const document = JSON.parse(fileData);
      console.log(`[${requestId}] Successfully retrieved result from local file: ${filePath}`);
      return document;
    } catch (error: unknown) {
      const fsError = error instanceof Error ? error : new Error(String(error));
      // Log only if it's not a simple file-not-found error
      if ((fsError as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`[${requestId}] Error reading result from local file ${filePath}: ${fsError.message}`, fsError.stack);
      } else {
        console.log(`[${requestId}] Result file not found locally: ${filePath}`);
      }
      return null;
    }
  }
}
