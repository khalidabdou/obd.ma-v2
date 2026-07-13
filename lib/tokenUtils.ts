/**
 * Centralized token utilities for customer authentication
 * This module provides a single source of truth for token checking
 */

/**
 * Check if customer access token cookie exists (client-side only)
 * @returns boolean indicating if token exists
 */
export const hasCustomerToken = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return document.cookie.split(';').some(cookie => 
    cookie.trim().startsWith('customer_access_token=')
  );
};

/**
 * Check if customer token is valid by calling the API.
 * Always calls the backend because the auth cookie is HttpOnly and
 * cannot be read from document.cookie in the browser.
 * @returns Promise<boolean> indicating if token is valid
 */
export const isCustomerTokenValid = async (): Promise<boolean> => {
  try {
    const { customerAuthService } = await import('@/services/customer-auth.service');
    const res = await customerAuthService.checkCustomerToken();
    // Backend now returns 200 with authenticated:false for guests
    return res.data?.authenticated === true;
  } catch (error) {
    // 401 means token is expired or invalid (not just absent)
    return false;
  }
};

/**
 * Get customer access token value from cookie (server-side safe)
 * @param cookieString - Optional cookie string (for server-side)
 * @returns token value or null
 */
export const getCustomerTokenValue = (cookieString?: string): string | null => {
  const cookies = cookieString || (typeof document !== 'undefined' ? document.cookie : '');
  
  const tokenCookie = cookies.split(';').find(cookie => 
    cookie.trim().startsWith('customer_access_token=')
  );
  
  if (!tokenCookie) {
    return null;
  }
  
  return tokenCookie.split('=')[1] || null;
};
