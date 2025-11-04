/**
 * Centralized error handling utilities
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Parse API error response
 */
export function parseApiError(error: any): ApiError {
  if (error?.response?.data) {
    return {
      message: error.response.data.message || error.response.data.error || 'An error occurred',
      status: error.response.status,
      code: error.response.data.code,
      details: error.response.data,
    };
  }

  if (error?.message) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ApiError | any): string {
  const apiError = error?.response ? parseApiError(error) : error;

  // Network errors
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }

  // HTTP status codes
  switch (apiError.status) {
    case 400:
      return apiError.message || 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authorized. Please log in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with the current state. Please refresh and try again.';
    case 422:
      return apiError.message || 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Our team has been notified. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again in a few moments.';
    default:
      return apiError.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Log error for monitoring
 */
export function logError(error: Error | ApiError, context?: string) {
  const errorData = {
    message: error instanceof Error ? error.message : error.message,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  console.error('Error logged:', errorData);

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error tracking service (e.g., Sentry)
    // sendToErrorTracking(errorData);
  }
}

/**
 * Retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Validate error is retryable
 */
export function isRetryableError(error: ApiError | any): boolean {
  const apiError = error?.response ? parseApiError(error) : error;
  
  // Network errors are retryable
  if (!navigator.onLine) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (apiError.status && apiError.status >= 500 && apiError.status < 600) {
    return true;
  }

  // Rate limiting (429) is retryable
  if (apiError.status === 429) {
    return true;
  }

  // Timeout errors are retryable
  if (apiError.code === 'ECONNABORTED' || apiError.message?.includes('timeout')) {
    return true;
  }

  return false;
}

