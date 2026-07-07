// Customer authentication service using new API client
import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';

/**
 * Customer login request payload
 */
export interface CustomerLoginRequest {
  email: string;
  password: string;
}

/**
 * Customer login response data
 */
export interface CustomerLoginResponse {
  message: string;
  account_type?: string;
}

/**
 * Google OAuth request payload
 */
export interface GoogleAuthRequest {
  code: string;
}

/**
 * Google OAuth response data
 */
export interface GoogleAuthResponse {
  message: string;
  access_token?: string;
  refresh_token?: string;
}

/**
 * Customer info response data
 */
export interface CustomerInfo {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

/**
 * Authentication service for customer operations
 */
export const customerAuthService = {
  /**
   * Customer login
   * @param credentials - Email and password
   * @returns Promise with login success data
   */
  customerLogin: async (credentials: CustomerLoginRequest): Promise<ApiSuccess<CustomerLoginResponse>> => {
    return await apiClient.post('/customer_login', credentials);
  },

  /**
   * Google OAuth login
   * @param payload - Google authorization code
   * @returns Promise with login success data
   */
  googleAuth: async (payload: GoogleAuthRequest): Promise<ApiSuccess<GoogleAuthResponse>> => {
    return await apiClient.post('/auth/google', payload);
  },

  /**
   * Customer logout
   * @returns Promise with logout success message
   */
  customerLogout: async (): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.post('/customer_logout');
  },

  /**
   * Check if customer token is valid
   * @returns Promise with token validation result
   */
  checkCustomerToken: async (): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.get('/check_customer_token');
  },

  /**
   * Get customer information
   * @returns Promise with customer info
   */
  getCustomerInfo: async (): Promise<ApiSuccess<{ customer_info: CustomerInfo }>> => {
    return await apiClient.get('/customer_info');
  },
};
