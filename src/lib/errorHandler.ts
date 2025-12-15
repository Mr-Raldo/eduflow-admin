import { toast } from 'sonner';

/**
 * Handles errors and displays user-friendly messages
 * @param error The error object from axios or other sources
 * @param defaultMessage Optional default message if error parsing fails
 * @returns The error message that was displayed
 */
export function handleError(error: any, defaultMessage?: string): string {
  let message = defaultMessage || 'An error occurred. Please try again.';

  if (error) {
    // If error was formatted by axios interceptor
    if (error.message && typeof error.message === 'string') {
      message = error.message;
    }
    // Legacy format: error.response.data.message
    else if (error.response?.data?.message) {
      if (Array.isArray(error.response.data.message)) {
        message = error.response.data.message.join(', ');
      } else {
        message = error.response.data.message;
      }
    }
    // Legacy format: error.response.data.error
    else if (error.response?.data?.error) {
      if (typeof error.response.data.error === 'string') {
        message = error.response.data.error;
      } else if (error.response.data.error.message) {
        message = error.response.data.error.message;
      }
    }
    // Network errors
    else if (error.request && !error.response) {
      message = 'Network error. Please check your internet connection.';
    }
  }

  // Display toast notification
  toast.error(message);

  return message;
}

/**
 * Handles success messages
 * @param message The success message to display
 */
export function handleSuccess(message: string) {
  toast.success(message);
}

/**
 * Displays a warning message
 * @param message The warning message to display
 */
export function handleWarning(message: string) {
  toast.warning(message);
}

/**
 * Displays an info message
 * @param message The info message to display
 */
export function handleInfo(message: string) {
  toast.info(message);
}

/**
 * Maps HTTP status codes to user-friendly messages
 */
export const STATUS_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Authentication failed. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Service unavailable. Please try again later.',
};

/**
 * Gets a user-friendly message for an HTTP status code
 */
export function getStatusMessage(status: number, defaultMessage?: string): string {
  return STATUS_MESSAGES[status] || defaultMessage || 'An error occurred.';
}
