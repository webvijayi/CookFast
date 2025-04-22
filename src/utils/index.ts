/**
 * Utility functions for timeout handling and retrying operations
 */

/**
 * Default timeout and retry settings
 */
export const API_TIMEOUT_MS = 25000; // 25 seconds (for regular functions)
export const BACKGROUND_API_TIMEOUT_MS = 840000; // 14 minutes (for background functions)
export const MAX_RETRIES = 4; // Maximum number of retries for failed API calls
export const RETRY_DELAY_MS = 1500; // Initial retry delay in milliseconds

/**
 * Wraps a promise with a timeout
 * @param promise The promise to execute with timeout
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Error message to use when timeout occurs
 * @returns Promise with timeout handling
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

interface RetryOptions {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  isBackground?: boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 2,
    retryDelayMs = 1500,
    timeoutMs = 10000,
    isBackground = false
  } = options;

  console.info(`[withRetry] Received options:`, {
    retries,
    retryDelayMs,
    timeoutMs,
    isBackground
  });

  // For background functions, use longer timeout
  const effectiveTimeoutMs = isBackground ? Math.max(timeoutMs, 840000) : timeoutMs;
  console.info(`[withRetry] Calculated timeoutMs: ${effectiveTimeoutMs}, isBackground: ${isBackground}`);

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create a promise that rejects on timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Task timed out after ${effectiveTimeoutMs / 1000} seconds`));
        }, effectiveTimeoutMs);
      });

      // Race between the function and the timeout
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === retries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }

  throw lastError || new Error('Retry failed');
}
