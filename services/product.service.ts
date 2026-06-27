// Product service using new API client
import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';

/**
 * Product query parameters
 */
export interface ProductQueryParams {
  start_product_index?: number;
  products_limit?: number;
  search_query?: string;
  product_code_query?: string;
  category_id_filter?: string;
  brands_ids_filter?: string;
  min_price_filter?: number;
  max_price_filter?: number;
  discount_filter?: number;
  number_of_products?: boolean;
  titles_only?: boolean;
  no_limit?: boolean;
}

/**
 * Product data structure (matches productType from utils/types.ts)
 */
export interface Product {
  productCode: string;
  images: {
    mainImage: string;
    image1: string | null;
    image2: string | null;
  };
  title: string;
  brandId: string;
  price: number | null;
  discountPercentage?: number | null;
  discountedPrice?: number | null;
  quantity: number | null;
  description: string;
  description_ar?: string;
  description_en?: string;
  categoryId: string;
  productContent: string[];
  choices: string[];
  creationDate: string;
  [key: string]: any;
}

/**
 * Products response data
 */
export interface ProductsData {
  products?: Product[];
  totalCount?: number;
  number_of_product?: number;
  products_titles?: string[];
}

/**
 * Server-side fetch helper for products (for use in Server Components)
 * Uses fetch with proper cookie handling for SSR
 */
export const fetchProducts = async (params?: ProductQueryParams): Promise<ProductsData> => {
  const { cookies } = await import('next/headers');

  const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';

  // Get cookies for server-side requests
  const cookieStore = await cookies();
  const customer_access_token = cookieStore.get('customer_access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authentication token if available
  if (customer_access_token) {
    headers['Authorization'] = `Bearer ${customer_access_token}`;
  }

  // Try SERVER_API_URL first (for Docker), fallback to NEXT_PUBLIC_API_URL (for local dev)
  const serverUrl = process.env.SERVER_API_URL;
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;

  let response: Response | null = null;
  let lastError: Error | null = null;

  if (serverUrl) {
    try {
      response = await fetch(`${serverUrl}/products${queryString}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers,
      });
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (!response && publicUrl) {
    response = await fetch(`${publicUrl}/products${queryString}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers,
    });
  }

  if (!response) {
    throw lastError || new Error('No API URL configured');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Handle API response structure: { data: { products: [], total: number } }
  if (data.data) {
    return {
      products: data.data.products,
      totalCount: data.data.total,
      number_of_product: data.data.number_of_product,
      products_titles: data.data.products_titles
    };
  }

  return data; // Fallback for old format
};

/**
 * Product service for product-related operations (for use in Client Components)
 */
export const productService = {
  /**
   * Get products with optional filters
   * @param params - Query parameters for filtering
   * @returns Promise with products data
   */
  getProducts: async (params?: ProductQueryParams): Promise<ApiSuccess<ProductsData>> => {
    return await apiClient.get('/products', params);
  },

  /**
   * Get a single product by product code
   * @param productCode - The product code
   * @returns Promise with product data
   */
  getProductByCode: async (productCode: string): Promise<ApiSuccess<ProductsData>> => {
    return await apiClient.get('/products', { product_code_query: productCode });
  },

  /**
   * Create a new product (admin only)
   * @param formData - Product data as FormData (for file uploads)
   * @returns Promise with success message
   */
  createProduct: async (formData: FormData): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.postFormData('/products', formData);
  },

  /**
   * Update a product (admin only)
   * @param productId - The product ID
   * @param formData - Updated product data
   * @returns Promise with success message
   */
  updateProduct: async (productId: string, formData: FormData): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.putFormData(`/products/${productId}`, formData);
  },

  /**
   * Delete a product (admin only)
   * @param productId - The product ID
   * @returns Promise with success message
   */
  deleteProduct: async (productId: string): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.delete(`/products/${productId}`);
  },

  /**
   * Get random products (client-side)
   * @param limit - Number of random products to fetch (default: 10)
   * @returns Promise with random products data
   */
  getRandomProducts: async (limit: number = 10): Promise<ApiSuccess<ProductsData>> => {
    return await apiClient.get('/products/random', { limit: limit.toString() });
  },
};

/**
 * Server-side fetch helper for random products (for use in Server Components)
 */
export const fetchRandomProducts = async (limit: number = 10): Promise<ProductsData> => {
  const { cookies } = await import('next/headers');

  // Get cookies for server-side requests
  const cookieStore = await cookies();
  const customer_access_token = cookieStore.get('customer_access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authentication token if available
  if (customer_access_token) {
    headers['Authorization'] = `Bearer ${customer_access_token}`;
  }

  // Try SERVER_API_URL first (for Docker), fallback to NEXT_PUBLIC_API_URL (for local dev)
  const serverUrl = process.env.SERVER_API_URL;
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;

  let response: Response | null = null;
  let lastError: Error | null = null;

  if (serverUrl) {
    try {
      response = await fetch(`${serverUrl}/products/random?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers,
      });
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (!response && publicUrl) {
    response = await fetch(`${publicUrl}/products/random?limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers,
    });
  }

  if (!response) {
    throw lastError || new Error('No API URL configured');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch random products: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Handle API response structure: { data: { products: [] } }
  if (data.data) {
    return {
      products: data.data.products,
    };
  }

  return data; // Fallback for old format
};
