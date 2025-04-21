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

/**
 * Retry function with exponential backoff
 * @param fn Function to retry
 * @param options Retry options
 * @returns Promise that will retry on failure
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: {
    retries?: number,
    retryDelayMs?: number,
    onRetry?: (attempt: number, error: Error, willRetry: boolean) => void,
    timeoutMs?: number, // Timeout for the specific operation
    errorMessage?: string,
    shouldRetry?: (error: Error) => boolean,
    isBackground?: boolean // Flag to indicate if running in a background context
  } = {}
): Promise<T> => {
  console.log("[withRetry] Received options:", { retries: options.retries, retryDelayMs: options.retryDelayMs, timeoutMs: options.timeoutMs, isBackground: options.isBackground }); // Log received options
  
  const {
    retries = MAX_RETRIES,
    retryDelayMs = RETRY_DELAY_MS,
    onRetry,
    // Use different default timeout based on context
    timeoutMs = options.isBackground ? BACKGROUND_API_TIMEOUT_MS : API_TIMEOUT_MS,
    errorMessage = "Operation timed out",
    shouldRetry = (error: Error) => true // Default behavior: retry all errors
  } = options;
  
  console.log(`[withRetry] Calculated timeoutMs: ${timeoutMs}, isBackground: ${options.isBackground}`); // Log calculated timeout
  
  let lastError: Error = new Error("No error information available");
  
  // Try the operation multiple times
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Execute the function with the appropriate timeout
      return await withTimeout(fn(), timeoutMs, errorMessage);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry this specific error
      const errorShouldRetry = shouldRetry(lastError);
      
      // Special handling for rate limits and quota errors
      const isRateLimitError = lastError.message.includes('429') || 
                              lastError.message.includes('Too Many Requests') ||
                              lastError.message.includes('quota');
      
      // Check if this was the last attempt or if we shouldn't retry this error
      if (attempt === retries || !errorShouldRetry) {
        // Call onRetry with willRetry = false to indicate final failure
        if (onRetry) onRetry(attempt + 1, lastError, false);
        console.error(`Failed after ${attempt + 1} attempts. Error: ${lastError.message}`);
        break;
      }
      
      // Apply exponential backoff with longer delays for rate limiting
      const delayMs = retryDelayMs * Math.pow(2, attempt) * (isRateLimitError ? 2 : 1);
      const jitter = Math.random() * 500; // Add random jitter to prevent thundering herd
      const finalDelay = Math.min(delayMs + jitter, 10000); // Cap at 10 seconds
      
      // Call the onRetry callback if provided (with willRetry = true)
      if (onRetry) {
        onRetry(attempt + 1, lastError, true);
      }
      
      console.log(`Attempt ${attempt + 1} failed with ${lastError.message}. Retrying in ${Math.round(finalDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  // If we get here, all attempts failed
  throw lastError;
};
