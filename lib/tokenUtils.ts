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
 * Check if customer token is valid by calling the API
 * Only makes the API call if a token exists
 * @returns Promise<boolean> indicating if token is valid
 */
export const isCustomerTokenValid = async (): Promise<boolean> => {
  // First check if token exists to avoid unnecessary 401 errors
  if (!hasCustomerToken()) {
    return false;
  }

  try {
    const { authService } = await import('@/services/auth.service');
    await authService.checkCustomerToken();
    return true;
  } catch (error) {
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
