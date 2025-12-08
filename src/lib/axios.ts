import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and format errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${axiosInstance.defaults.baseURL}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(formatError(refreshError));
      }
    }

    // Format and reject error with user-friendly message
    return Promise.reject(formatError(error));
  }
);

// Helper function to format backend errors
function formatError(error: any) {
  if (!error.response) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null,
    };
  }

  const { data, status } = error.response;

  // Extract error message from various backend response formats
  let message = 'An error occurred. Please try again.';

  if (data) {
    // Format 1: { message: "error message" }
    if (data.message) {
      message = data.message;
    }
    // Format 2: { error: { message: "error message" } }
    else if (data.error?.message) {
      message = data.error.message;
    }
    // Format 3: { error: "error message" }
    else if (typeof data.error === 'string') {
      message = data.error;
    }
    // Format 4: { statusCode: 401, message: "..." }
    else if (data.statusCode && data.message) {
      message = data.message;
    }
    // Format 5: Array of validation errors
    else if (Array.isArray(data.message)) {
      message = data.message.join(', ');
    }
  }

  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password. Please try again.',
    'user_not_found': 'User not found. Please check your credentials.',
    'email_exists': 'An account with this email already exists.',
    'weak_password': 'Password is too weak. Please use a stronger password.',
    'unauthorized': 'You are not authorized to perform this action.',
    'forbidden': 'Access forbidden. You do not have permission.',
    'not_found': 'The requested resource was not found.',
    'validation_error': 'Please check your input and try again.',
  };

  // Check if there's a specific error code
  const errorCode = data?.code || data?.error?.code;
  if (errorCode && errorMessages[errorCode]) {
    message = errorMessages[errorCode];
  }

  return {
    message,
    status,
    data,
    response: error.response,
  };
}

export default axiosInstance;
