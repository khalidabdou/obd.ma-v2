// Customer info service for managing customer personal information
import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';

/**
 * Customer info data
 */
export interface CustomerInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode?: string;
  phoneNumber: string;
  address: string;
  city: string;
  cityId: number;
}

/**
 * Create customer account request
 */
export interface CreateCustomerAccountRequest {
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
  countryCode: string;
  phoneNumber: string;
  withCart?: boolean;
}

/**
 * Update customer info request (all fields optional for partial updates)
 */
export interface UpdateCustomerInfoRequest {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneCode?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  cityId?: number | null;
  password?: string | null;
  confirmPassword?: string | null;
}

/**
 * Customer info response
 */
export interface CustomerInfoResponse {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode?: string;
  phoneNumber: string;
  address: string;
  city: string;
  cityId?: number;
  accountType?: 'NORMAL' | 'GOOGLE' | 'ZOBAZE' | string;
  amountDue?: number;
  wallet?: number;
}

/**
 * Customer info service for personal information operations
 */
export const customerInfoService = {
  /**
   * Create a new customer account
   * @param data - Customer account data
   * @returns Promise with success message
   */
  createAccount: async (data: CreateCustomerAccountRequest): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.post('/customer_account', data);
  },

  /**
   * Create/update customer info (POST - for new info during checkout)
   * @param data - Customer info data
   * @returns Promise with success message
   */
  createCustomerInfo: async (data: CustomerInfoData): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.post('/customer_info', data);
  },

  /**
   * Update customer info (PUT - for existing customer updates)
   * @param data - Partial customer info data (only changed fields)
   * @returns Promise with success message
   */
  updateCustomerInfo: async (data: UpdateCustomerInfoRequest): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.put('/customer_info', data);
  },

  /**
   * Get customer info
   * @returns Promise with customer info
   */
  getCustomerInfo: async (): Promise<ApiSuccess<{ customer_info: CustomerInfoResponse }>> => {
    return await apiClient.get('/customer_info');
  },
};
