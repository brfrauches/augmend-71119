
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getStoredToken, clearStoredToken } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Queue for requests made when offline
let requestQueue: Array<() => Promise<any>> = [];
let isQueueProcessing = false;

// Track online status
const isOnline = (): boolean => navigator.onLine;

// Process queued requests when back online
const processQueue = async (): Promise<void> => {
  if (isQueueProcessing || !isOnline() || requestQueue.length === 0) {
    return;
  }

  isQueueProcessing = true;

  try {
    // Process all requests in the queue
    while (requestQueue.length > 0) {
      const request = requestQueue.shift();
      if (request) {
        await request();
      }
    }
  } finally {
    isQueueProcessing = false;
  }
};

// Listen for online event to process queue
window.addEventListener('online', processQueue);

// Request interceptor for adding auth token and queueing offline requests
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Add auth token if available
    const token = getStoredToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // If offline and not a GET request, add to queue
    if (!isOnline() && config.method !== 'get') {
      return new Promise((resolve, reject) => {
        requestQueue.push(async () => {
          try {
            const response = await api(config);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      }) as any;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle unauthorized errors (401)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      // In a real app, you would refresh the token here
      // For now, just clear the token and reject
      clearStoredToken();
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Network errors when offline
    if (!error.response && !isOnline() && originalRequest.method !== 'get') {
      // Add to queue for later
      return new Promise((resolve, reject) => {
        requestQueue.push(async () => {
          try {
            const response = await api(originalRequest);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
    
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: originalRequest.url,
      method: originalRequest.method
    });
    
    return Promise.reject(error);
  }
);

export default api;

// Helper for better error handling
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    if (response?.data?.message) {
      return response.data.message;
    }
    if (response?.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (response?.status === 404) {
      return 'Resource not found.';
    }
    if (response?.status === 401) {
      return 'Please login to continue.';
    }
    if (response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (response?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return error.message || 'An error occurred. Please try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred. Please try again.';
};
