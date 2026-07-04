// Brand service using new API client
import { apiClient } from '@/lib/apiClient';
import { rewriteImageUrlForServer } from '@/lib/serverFetch';
import type { ApiSuccess } from '@/types/api';

/**
 * Brand information
 */
export interface BrandInfo {
  brandId: string;
  brandName: string;
  brandImage: string;
  brandImageDark?: string | null;
  brandTitle?: string;
  brandDescription?: string;
}

/**
 * Brands response data
 */
export interface BrandsData {
  brands_infos: BrandInfo[];
}

/**
 * Brand service for brand-related operations
 */
/**
 * Helper to get brand IDs from products
 * @param products - Array of products
 * @returns Array of top brand IDs by frequency
 */
export const getBrandsIdsFromProducts = (products: any[]) => {
  const brandsIds = products
    .map((product) => product.brandId)
    .filter((brandId) => brandId !== null);
  const maxDisplayBrandsNumber = 3;

  const frequencyMap: Record<string, number> = {};
  for (const brandId of brandsIds) {
    frequencyMap[brandId] = (frequencyMap[brandId] || 0) + 1;
  }

  const brands = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1]) // sort descending by frequency
    .slice(0, maxDisplayBrandsNumber)
    .map(([brandId]) => brandId);
  return brands;
};

export const brandService = {
  /**
   * Get all brands (client-side)
   * @returns Promise with brands data
   */
  getBrands: async (): Promise<ApiSuccess<BrandsData>> => {
    const response = await apiClient.get<BrandsData>('/brands');
    
    // Construct the correct image base URL
    const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
    // Remove /api suffix if present to get the base domain
    const imageBaseURL = apiBaseURL?.replace(/\/api$/, '');
    
    // Backend returns a plain array — normalize to { brands_infos: [...] }
    const rawBrands = Array.isArray(response.data) ? response.data : response.data?.brands_infos || [];
    const mapped = rawBrands.map((item: any) => ({
      brandId: item.brand_id || item.brandId,
      brandName: item.brand_name || item.brandName,
      brandTitle: item.brand_title || item.brandTitle,
      brandImage: item.brandImage?.startsWith('http')
        ? item.brandImage
        : `${imageBaseURL}${item.brandImage}`,
      brandImageDark: item.brandImageDark?.startsWith('http')
        ? item.brandImageDark
        : item.brandImageDark
        ? `${imageBaseURL}${item.brandImageDark}`
        : null,
    }));
    response.data = { brands_infos: mapped };
    
    return response;
  },

  /**
   * Get all brands (server-side for Server Components)
   * @returns Promise with brands data
   */
  getBrandsServer: async (): Promise<BrandsData> => {
    try {
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
          response = await fetch(`${serverUrl}/brands`, {
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
        response = await fetch(`${publicUrl}/brands`, {
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
        throw new Error(`Failed to fetch brands: ${response.status}`);
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;

      // Construct image base URL
      const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
      const imageBaseURL = apiBaseURL?.replace(/\/api$/, '');

      // Backend returns a plain array — normalize to { brands_infos: [...] }
      const rawBrands = Array.isArray(data) ? data : data.brands_infos || [];
      const mapped = rawBrands.map((item: any) => {
        const brandImage = item.brandImage?.startsWith('http')
          ? item.brandImage
          : `${imageBaseURL}${item.brandImage}`;
        const brandImageDark = item.brandImageDark?.startsWith('http')
          ? item.brandImageDark
          : item.brandImageDark
          ? `${imageBaseURL}${item.brandImageDark}`
          : null;
        return {
          brandId: item.brand_id || item.brandId,
          brandName: item.brand_name || item.brandName,
          brandTitle: item.brand_title || item.brandTitle,
          brandImage: rewriteImageUrlForServer(brandImage),
          brandImageDark: brandImageDark ? rewriteImageUrlForServer(brandImageDark) : null,
        };
      });

      return { brands_infos: mapped };
    } catch (error) {
      console.error('Error fetching brands:', error);
      return { brands_infos: [] };
    }
  },

  /**
   * Find a brand by ID from server-side brands data
   * @param brandId - The brand ID to find
   * @returns Promise with brand info or null
   */
  findBrandByIdServer: async (brandId: string | undefined): Promise<BrandInfo | null> => {
    if (!brandId) return null;
    
    const brandsData = await brandService.getBrandsServer();
    
    if (brandsData.brands_infos) {
      const brand = brandsData.brands_infos.find((info) => info.brandId === brandId);
      return brand || null;
    }
    
    return null;
  },

  /**
   * Get a single brand by ID
   * @param brandId - The brand ID
   * @returns Promise with brand data
   */
  getBrand: async (brandId: string): Promise<ApiSuccess<{ brand: BrandInfo }>> => {
    return await apiClient.get(`/brands/${brandId}`);
  },

  /**
   * Create a new brand (admin only)
   * @param data - Brand data
   * @returns Promise with success message
   */
  createBrand: async (data: Partial<BrandInfo>): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.post('/brands', data);
  },

  /**
   * Update a brand (admin only)
   * @param brandId - The brand ID
   * @param data - Updated brand data
   * @returns Promise with success message
   */
  updateBrand: async (brandId: string, data: Partial<BrandInfo>): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.put(`/brands/${brandId}`, data);
  },

  /**
   * Delete a brand (admin only)
   * @param brandId - The brand ID
   * @returns Promise with success message
   */
  deleteBrand: async (brandId: string): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.delete(`/brands/${brandId}`);
  },

  /**
   * Get brand names from brand IDs (server-side)
   * @param brandIds - Optional array of brand IDs to filter
   * @returns Promise with array of brand names
   */
  getBrandNames: async (brandIds?: string[]): Promise<string[]> => {
    try {
      // Use server-side method for Server Components
      const brandsData = await brandService.getBrandsServer();
      const brandsInfo = brandsData.brands_infos;
      const fetchedNames: string[] = [];

      if (brandIds) {
        for (const brandId of brandIds) {
          for (const brand of brandsInfo) {
            if (brand.brandId === brandId) {
              fetchedNames.push(brand.brandName);
              break;
            }
          }
        }
      } else {
        brandsInfo.forEach((brand) => {
          fetchedNames.push(brand.brandName);
        });
      }
      return fetchedNames;
    } catch (error) {
      console.error('Error fetching brand names:', error);
      return [];
    }
  },

  /**
   * Get brand ID from brand name (server-side)
   * @param brandName - The brand name
   * @returns Promise with brand ID or null
   */
  getBrandIdByName: async (brandName: string): Promise<string | null> => {
    try {
      // Use server-side method for Server Components
      const brandsData = await brandService.getBrandsServer();
      const brandsInfo = brandsData.brands_infos;
      
      for (const brand of brandsInfo) {
        if (brand.brandName === brandName) {
          return brand.brandId;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching brand ID:', error);
      return null;
    }
  },

  /**
   * Extract brands data with helper functions
   * @returns Helper functions to get brand names and IDs
   */
  extractBrandsData: async () => {
    let brandsInfo: BrandInfo[] = [];

    try {
      const response = await apiClient.get<BrandsData>('/brands');
      const raw = response.data;
      brandsInfo = Array.isArray(raw) ? raw : raw?.brands_infos || [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      brandsInfo = [];
    }

    const getBrandsNames = (brandsIds?: string[]) => {
      const fetchedNames: string[] = [];

      if (brandsIds) {
        for (const brandId of brandsIds) {
          for (const brand of brandsInfo) {
            if (brand.brandId === brandId) {
              fetchedNames.push(brand.brandName);
              break;
            }
          }
        }
      } else {
        brandsInfo.forEach((brand) => {
          fetchedNames.push(brand.brandName);
        });
      }
      return fetchedNames;
    };

    const getBrandId = (brandName: string) => {
      for (const brand of brandsInfo) {
        if (brand.brandName === brandName) {
          return brand.brandId;
        }
      }
      return null;
    };

    return { getBrandsNames, getBrandId, brandsInfo };
  },
};
