/**
 * Document Store Utility
 * 
 * This utility provides methods to store and retrieve generated documents.
 * It has fallback mechanisms for different environments:
 * 
 * 1. In production (Netlify): Uses environment-specific storage
 * 2. In development: Uses localStorage and/or temporary file storage
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Type for document metadata
export type DocumentMetadata = {
  requestId: string;
  createdAt: string;
  provider: string;
  model?: string;
  projectName?: string;
};

/**
 * Check if we're running in a Node.js environment
 */
const isNodeEnv = typeof window === 'undefined';

/**
 * Save document to appropriate storage
 * @param requestId - The unique request ID
 * @param document - The document data to save
 */
export async function saveDocumentToStore(requestId: string, document: any): Promise<boolean> {
  try {
    if (isNodeEnv) {
      // In Node.js environment (server-side)
      try {
        // Create temp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        // Write to file
        const filePath = path.join(tmpDir, `${requestId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(document));
        return true;
      } catch (error) {
        console.error('Error saving document to file:', error);
        return false;
      }
    } else {
      // In browser environment (client-side)
      localStorage.setItem(`cookfast_doc_${requestId}`, JSON.stringify(document));
      return true;
    }
  } catch (error) {
    console.error('Error saving document:', error);
    return false;
  }
}

/**
 * Get document from store by requestId
 * @param requestId - The unique request ID
 */
export async function getDocumentFromStore(requestId: string): Promise<any | null> {
  try {
    if (isNodeEnv) {
      // In Node.js environment (server-side)
      try {
        const filePath = path.join(process.cwd(), 'tmp', `${requestId}.json`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(content);
        }
        return null;
      } catch (error) {
        console.error('Error reading document from file:', error);
        return null;
      }
    } else {
      // In browser environment (client-side)
      const docStr = localStorage.getItem(`cookfast_doc_${requestId}`);
      return docStr ? JSON.parse(docStr) : null;
    }
  } catch (error) {
    console.error('Error retrieving document:', error);
    return null;
  }
}

/**
 * List available documents from store
 * @param limit - Maximum number of documents to retrieve
 */
export async function listDocumentsFromStore(limit: number = 10): Promise<DocumentMetadata[]> {
  try {
    if (isNodeEnv) {
      // In Node.js environment (server-side)
      try {
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
          return [];
        }
        
        const files = fs.readdirSync(tmpDir)
          .filter(file => file.endsWith('.json'))
          .slice(0, limit);
        
        const metadataList: DocumentMetadata[] = [];
        
        for (const file of files) {
          try {
            const content = fs.readFileSync(path.join(tmpDir, file), 'utf8');
            const doc = JSON.parse(content);
            const requestId = file.replace('.json', '');
            
            metadataList.push({
              requestId,
              createdAt: doc.debug?.timestamp || new Date().toISOString(),
              provider: doc.debug?.provider || 'unknown',
              model: doc.debug?.model,
              projectName: doc.projectDetails?.projectName
            });
          } catch (err) {
            console.error(`Error reading document ${file}:`, err);
          }
        }
        
        return metadataList;
      } catch (error) {
        console.error('Error listing documents from files:', error);
        return [];
      }
    } else {
      // In browser environment (client-side)
      const metadataList: DocumentMetadata[] = [];
      let count = 0;
      
      // Iterate through localStorage items
      for (let i = 0; i < localStorage.length && count < limit; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cookfast_doc_')) {
          try {
            const docStr = localStorage.getItem(key);
            if (docStr) {
              const doc = JSON.parse(docStr);
              const requestId = key.replace('cookfast_doc_', '');
              
              metadataList.push({
                requestId,
                createdAt: doc.debug?.timestamp || new Date().toISOString(),
                provider: doc.debug?.provider || 'unknown',
                model: doc.debug?.model,
                projectName: doc.projectDetails?.projectName
              });
              
              count++;
            }
          } catch (err) {
            console.error(`Error parsing document ${key}:`, err);
          }
        }
      }
      
      return metadataList;
    }
  } catch (error) {
    console.error('Error listing documents:', error);
    return [];
  }
}
