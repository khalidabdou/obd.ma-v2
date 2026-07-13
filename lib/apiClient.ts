// API Client for backend-node with new response architecture
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse, ApiSuccess, ApiError } from '@/types/api';

// this is for customer api client
export class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;
  private constructor() {
    // Use different URLs for server-side (SSR) vs client-side (browser)
    // Server-side: use SERVER_API_URL (Docker internal network)
    // Client-side: use NEXT_PUBLIC_API_URL (external URL for browser)
    const isServer = typeof window === 'undefined';
    const baseURL = isServer
      ? (process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL)
      : process.env.NEXT_PUBLIC_API_URL;

    // Ensure the API URL doesn't have a trailing slash for consistent path joining
    const formattedBaseURL = baseURL?.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

    // Log which URL is being used (helpful for debugging)
    if (isServer) {
      console.log(`[ApiClient] Server-side initialized with baseURL: ${formattedBaseURL}`);
    }

    // Create axios config
    const axiosConfig: any = {
      baseURL: formattedBaseURL,
      withCredentials: true, // IMPORTANT: Required for HTTP-only cookies
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Only add httpsAgent in Node.js environment (server-side)
    // Set NODE_TLS_REJECT_UNAUTHORIZED=0 in build environment to skip SSL verification
    if (typeof window === 'undefined') {
      // Dynamically import https only in Node.js environment
      const https = require('https');
      axiosConfig.httpsAgent = new https.Agent({
        rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0'
      });
    }

    this.api = axios.create(axiosConfig);
    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor - credentials are sent automatically via HTTP-only cookies.
    // Do NOT read tokens from localStorage; rely on the secure cookie set by the backend.
    this.api.interceptors.request.use(
      (config) => {
        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.log('[ApiClient] Request:', config.method?.toUpperCase(), fullUrl);
        return config;
      },
      (error) => {
        console.log('[ApiClient] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle new response format
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Return the full response object (Axios requirement)
        return response;
      },
      async (error) => {
        const axiosError = error as any;
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        const originalRequest = axiosError.config;

        // Auto-refresh once on expired token, then retry the original request.
        // '/check_customer_token' and '/refresh_customer_token' are excluded to avoid loops.
        const isAuthEndpoint =
          originalRequest?.url?.includes('/check_customer_token') ||
          originalRequest?.url?.includes('/refresh_customer_token');

        if (
          status === 401 &&
          responseData?.name === 'TokenExpired' &&
          originalRequest &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          originalRequest._retry = true;
          try {
            await this.api.get('/refresh_customer_token');
            return this.api(originalRequest);
          } catch {
            // Refresh failed — fall through to normal error handling
          }
        }

        // Suppress logging for expected auth signals (401/403) — these are
        // handled by calling code (AuthContext, tokenUtils, guest fallbacks, etc.)
        // Log all other errors, including empty-bodied 400s that usually indicate
        // a malformed request (e.g. an invalid localhost cookie).
        if (status !== 401 && status !== 403) {
          const isEmpty400 = status === 400 && (!responseData || Object.keys(responseData).length === 0);
          console.error(
            '[ApiClient] Backend error response:',
            status,
            responseData,
            {
              url: originalRequest?.url,
              method: originalRequest?.method,
              baseURL: originalRequest?.baseURL,
              ...(typeof document !== 'undefined' && {
                cookieNames: document.cookie.split(';').map((c) => c.split('=')[0].trim()),
              }),
            }
          );
          if (isEmpty400) {
            console.error(
              '[ApiClient] Empty 400 detected — this is usually caused by a stale/malformed localhost cookie. Try clearing cookies for this site or test in an incognito window.'
            );
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // GET request
  public async get<T>(url: string, params?: any, config?: any): Promise<ApiSuccess<T>> {
    try {
      const response = await this.api.get<ApiSuccess<T>>(url, { ...config, params });
      return response.data;
    } catch (error) {
      console.debug('[ApiClient] GET failed:', url);
      throw error;
    }
  }

  // POST request
  public async post<T>(url: string, data?: any, config?: any): Promise<ApiSuccess<T>> {
    try {
      const response = await this.api.post<ApiSuccess<T>>(url, data, config);
      return response.data;
    } catch (error) {
      console.debug('[ApiClient] POST failed:', url);
      throw error;
    }
  }

  // PUT request
  public async put<T>(url: string, data?: any, config?: any): Promise<ApiSuccess<T>> {
    try {
      const response = await this.api.put<ApiSuccess<T>>(url, data, config);
      return response.data;
    } catch (error) {
      console.debug('[ApiClient] PUT failed:', url);
      throw error;
    }
  }

  // PATCH request
  public async patch<T>(url: string, data?: any, config?: any): Promise<ApiSuccess<T>> {
    try {
      const response = await this.api.patch<ApiSuccess<T>>(url, data, config);
      return response.data;
    } catch (error) {
      console.debug('[ApiClient] PATCH failed:', url);
      throw error;
    }
  }

  // DELETE request
  public async delete<T>(url: string, data?: any): Promise<ApiSuccess<T>> {
    try {
      const response = await this.api.delete<ApiSuccess<T>>(url, { data });
      return response.data;
    } catch (error) {
      console.debug('[ApiClient] DELETE failed:', url);
      throw error;
    }
  }

  // File upload helper methods (multipart/form-data)
  public async postFormData<T>(url: string, formData: FormData): Promise<ApiSuccess<T>> {
    try {
      const response = await this.api.post<ApiSuccess<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.debug('[ApiClient] POST FormData failed:', url);
      throw error;
    }
  }

  public async putFormData<T>(url: string, formData: FormData): Promise<ApiSuccess<T>> {
    try {
      const response = await this.api.put<ApiSuccess<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.debug('[ApiClient] PUT FormData failed:', url);
      throw error;
    }
  }

  public async patchFormData<T>(url: string, formData: FormData): Promise<ApiSuccess<T>> {
    try {
      const response = await this.api.patch<ApiSuccess<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.debug('[ApiClient] PATCH FormData failed:', url);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
