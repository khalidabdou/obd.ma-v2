// Favorite service using new API client
import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';

/**
 * Favorite item structure
 */
export interface FavoriteItem {
  favoriteId: string;
  productCode: string;
  customerId: string;
  createdAt?: string;
}

/**
 * Customer favorite with product details (for favorites page)
 */
export interface CustomerFavoriteItem {
  favoriteId: string;
  productCode: string;
  image: string;
  title: string;
  price: number;
  discount: number | null;
  discountedPrice: number | null;
  quantity: number;
  brandId: string;
  categoryId: string;
  date: string;
}

/**
 * Favorites response data
 */
export interface FavoritesData {
  favorites: FavoriteItem[];
  totalCount?: number;
}



/**
 * Favorite service for favorite-related operations
 */
export const favoriteService = {
  /**
   * Get customer favorites
   * @param productCode - Optional product code to check if specific product is favorited
   * @returns Promise with favorites data
   */
  getFavorites: async (productCode?: string): Promise<ApiSuccess<FavoritesData>> => {
    const params = productCode ? { productCode } : undefined;
    return await apiClient.get('/customer_favorite', params);
  },

  /**
   * Add product to favorites
   * @param productCode - The product code to add
   * @returns Promise with success message
   */
  addToFavorites: async (productCode: string): Promise<ApiSuccess<{ message: string; favoriteId: string }>> => {
    const response = await apiClient.post<{ message: string; favoriteId: string }>('/customer_favorite', { productCode });
    // Dispatch custom event to update favorites count in NavBar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('favoritesUpdated'))
    }
    return response;
  },

  /**
   * Remove product from favorites
   * @param productCode - The product code to remove
   * @returns Promise with success message
   */
  removeFromFavorites: async (productCode: string): Promise<ApiSuccess<{ message: string }>> => {
    const response = await apiClient.delete<{ message: string }>('/customer_favorite', { productCode });
    // Dispatch custom event to update favorites count in NavBar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('favoritesUpdated'))
    }
    return response;
  },

  /**
   * Toggle favorite status for a product
   * @param productCode - The product code
   * @param favoriteId - The favorite ID if already favorited
   * @returns Promise with success message
   */
  toggleFavorite: async (productCode: string, isFavorited?: boolean): Promise<ApiSuccess<{ message: string }>> => {
    if (isFavorited) {
      return await favoriteService.removeFromFavorites(productCode);
    } else {
      return await favoriteService.addToFavorites(productCode);
    }
  },

  /**
   * Get favorite ID for a specific product
   * @param productCode - The product code to check
   * @returns Promise with favorite ID or null
   */
  getFavoriteId: async (productCode: string): Promise<string | null> => {
    try {
      const response = await apiClient.get<FavoritesData>('/customer_favorite', { productCode });
      const data = response.data as any;
      return data?.favoriteId || null;
    } catch (error) {
      console.log('Error fetching favorite status:', error);
      return null;
    }
  },

  /**
   * Get all favorites (server-side for Server Components)
   * @returns Promise with favorites data or null
   */
  getFavoritesServer: async (): Promise<FavoritesData | null> => {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const customer_access_token = cookieStore.get('customer_access_token')?.value;
      if (!customer_access_token) return null;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customer_access_token}`,
      };

      const serverUrl = process.env.SERVER_API_URL;
      const publicUrl = process.env.NEXT_PUBLIC_API_URL;
      let response: Response | null = null;

      if (serverUrl) {
        try {
          response = await fetch(`${serverUrl}/customer_favorite`, {
            method: 'GET',
            headers,
            cache: 'no-store',
          });
        } catch {
          // fallback to public URL
        }
      }
      if ((!response || !response.ok) && publicUrl) {
        response = await fetch(`${publicUrl}/customer_favorite`, {
          method: 'GET',
          headers,
          cache: 'no-store',
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        return data?.data || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching favorites (server):', error);
      return null;
    }
  },

  /**
   * Get favorite ID for a specific product (server-side for Server Components)
   * @param productCode - The product code to check
   * @returns Promise with favorite ID or null
   */
  getFavoriteIdServer: async (productCode: string): Promise<string | null> => {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const customer_access_token = cookieStore.get('customer_access_token')?.value;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customer_access_token) {
        headers['Authorization'] = `Bearer ${customer_access_token}`;
      }

      const serverUrl = process.env.SERVER_API_URL;
      const publicUrl = process.env.NEXT_PUBLIC_API_URL;
      let response: Response | null = null;

      if (serverUrl) {
        try {
          response = await fetch(`${serverUrl}/customer_favorite?productCode=${productCode}`, {
            method: 'GET',
            headers,
          });
        } catch {
          // fallback to public URL
        }
      }
      if (!response && publicUrl) {
        response = await fetch(`${publicUrl}/customer_favorite?productCode=${productCode}`, {
          method: 'GET',
          headers,
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        return data?.favoriteId || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching favorite status:', error);
      return null;
    }
  },

  /**
   * Get customer favorites with product details (server-side for favorites page)
   * @returns Promise with customer favorites data
   */
  getCustomerFavoritesServer: async (): Promise<CustomerFavoriteItem[]> => {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const customer_access_token = cookieStore.get('customer_access_token')?.value;
      if (!customer_access_token) return [];

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customer_access_token}`,
      };

      const serverUrl = process.env.SERVER_API_URL;
      const publicUrl = process.env.NEXT_PUBLIC_API_URL;
      let response: Response | null = null;

      if (serverUrl) {
        try {
          response = await fetch(`${serverUrl}/customer_favorite`, {
            method: 'GET',
            headers,
            cache: 'no-store',
          });
        } catch {
          // fallback to public URL
        }
      }
      if ((!response || !response.ok) && publicUrl) {
        response = await fetch(`${publicUrl}/customer_favorite`, {
          method: 'GET',
          headers,
          cache: 'no-store',
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        return data?.data?.favorites || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching customer favorites (server):', error);
      return [];
    }
  },
};
