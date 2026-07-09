// Cart service using new API client
import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';
import type { Product } from './product.service';

/**
 * Add to cart request payload
 */
export interface AddToCartRequest {
  productCode: string;
  quantity: number;
  variant?: string;
}

/**
 * Update cart item request payload
 */
export interface UpdateCartItemRequest {
  productCode: string;
  quantity: number;
}

/**
 * Remove from cart request payload
 */
export interface RemoveFromCartRequest {
  productCode: string;
}

/**
 * Cart item from backend
 */
export interface CartItemResponse {
  productCode: string;
  quantity: number;
  choice: string | null;
  productInfo?: Product | null;
}

/**
 * Cart response from backend
 */
export interface CartResponse {
  customer_cart_products: CartItemResponse[];
}

/**
 * Cart product with full product info (matches utils/types.ts)
 */
export interface CartProductType {
  productInfo: any; // Uses productType from utils/types.ts
  quantity: number;
  choice: string | null;
}

/**
 * Server-side fetch helper with cookie support
 * This function should only be called from Server Components
 * Tries SERVER_API_URL first (Docker), falls back to NEXT_PUBLIC_API_URL (local dev)
 */
const createServerFetch = async () => {
  const { cookies } = await import('next/headers');

  return async (url: string, options: RequestInit = {}) => {
    const serverUrl = process.env.SERVER_API_URL;
    const publicUrl = process.env.NEXT_PUBLIC_API_URL;

    // Get cookies for server-side requests
    const cookieStore = await cookies();
    const customer_access_token = cookieStore.get('customer_access_token')?.value;
    const customer_id = cookieStore.get('customer_id')?.value;

    if (!options.headers) {
      options.headers = {};
    }

    // Add authentication token if available
    if (customer_access_token) {
      (options.headers as any)['Authorization'] = `Bearer ${customer_access_token}`;
    }

    // Add Cookie header to pass customer_id for guest users
    const cookieHeader = [];
    if (customer_access_token) {
      cookieHeader.push(`customer_access_token=${customer_access_token}`);
    }
    if (customer_id) {
      cookieHeader.push(`customer_id=${customer_id}`);
    }
    if (cookieHeader.length > 0) {
      (options.headers as any)['Cookie'] = cookieHeader.join('; ');
    }

    options.credentials = 'include';

    let response: Response | null = null;
    let lastError: Error | null = null;

    // Try server URL first if available (Docker environment)
    if (serverUrl) {
      try {
        response = await fetch(`${serverUrl}${url}`, options);
      } catch (err) {
        lastError = err as Error;
      }
    }

    // Fallback to public URL if server URL failed or wasn't set
    if (!response && publicUrl) {
      response = await fetch(`${publicUrl}${url}`, options);
    }

    if (!response) {
      throw lastError || new Error('No API URL configured');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  };
};

/**
 * Cart service for shopping cart operations
 */
export const cartService = {
  /**
   * Get current user's cart items
   * @returns Promise with cart items
   */
  getCart: async (): Promise<ApiSuccess<CartResponse>> => {
    // Use server-side fetch for SSR compatibility
    if (typeof window === 'undefined') {
      const serverFetch = await createServerFetch();
      return await serverFetch('/cart');
    }
    return await apiClient.get('/cart');
  },

  /**
   * Get cart products with full product information
   * Fetches cart items which are now already enriched with product details from the backend
   * @returns Promise with array of cart products
   */
  getCartProducts: async (): Promise<CartProductType[]> => {
    try {
      // Get cart items (server-side compatible)
      let cartResponse: ApiSuccess<CartResponse>;
      if (typeof window === 'undefined') {
        const serverFetch = await createServerFetch();
        cartResponse = await serverFetch('/cart');
      } else {
        cartResponse = await apiClient.get<CartResponse>('/cart');
      }

      const cartItems = cartResponse.data.customer_cart_products;

      if (!cartItems || cartItems.length === 0) {
        return [];
      }

      // Backend now returns enriched data, so we just map it to the expected Frontend type
      // The backend returns structure: { productInfo, productCode, quantity, variant, choice }
      // We map this to CartProductType: { productInfo, quantity, choice }
      return cartItems.map((item: any) => ({
        productInfo: item.productInfo,
        quantity: item.quantity,
        choice: item.choice || item.variant,
      }));

    } catch (error) {
      console.error('Error fetching cart products:', error);
      return [];
    }
  },

  /**
   * Add item to cart
   * @param data - Product code, quantity, and optional choice
   * @returns Promise with success message
   */
  addToCart: async (data: AddToCartRequest): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.post('/cart', data);
  },

  /**
   * Update cart item quantity (incremental)
   * @param data - Product code and quantity change (positive or negative)
   * @returns Promise with success message
   */
  updateCartItem: async (data: UpdateCartItemRequest): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.patch('/cart', data);
  },

  /**
   * Remove item from cart
   * @param data - Product code to remove
   * @returns Promise with success message
   */
  removeFromCart: async (data: RemoveFromCartRequest): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.delete('/cart', data as any);
  },

  /**
   * Get user's cart quantity for a specific product
   * @param productCode - Product code to check
   * @returns Promise with quantity (0 if not in cart)
   */
  getUserCartQuantity: async (productCode: string): Promise<number> => {
    try {
      // Get cart items (server-side compatible)
      let cartResponse: ApiSuccess<CartResponse>;
      if (typeof window === 'undefined') {
        const serverFetch = await createServerFetch();
        cartResponse = await serverFetch('/cart');
      } else {
        cartResponse = await apiClient.get<CartResponse>('/cart');
      }

      const cartItems = cartResponse.data.customer_cart_products;

      if (!cartItems || cartItems.length === 0) {
        return 0;
      }

      const cartItem = cartItems.find(item => item.productCode === productCode);
      return cartItem ? cartItem.quantity : 0;
    } catch (error) {
      console.error('Error fetching cart quantity:', error);
      return 0;
    }
  },
};
