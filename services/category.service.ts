// Category service using new API client
import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';

/**
 * Category information
 */
export interface CategoryInfo {
  categoryId: string;
  categoryTitle: string;
  categoryImage: string;
  categoryDescription?: string;
  titleAr?: string;
  titleEn?: string;
}

/**
 * Categories response data
 */
export interface CategoriesData {
  categories_infos: CategoryInfo[];
}

/**
 * Category service for category-related operations
 */
export const categoryService = {
  /**
   * Get all categories
   * @returns Promise with categories data
   */
  getCategories: async (): Promise<ApiSuccess<CategoriesData>> => {
    const response = await apiClient.get<CategoriesData>('/categories');

    // Backend already returns properly formatted camelCase data
    // No transformation needed - just return the response as-is
    return response;
  },

  /**
   * Find a category by ID from all categories (server-side)
   * @param categoryId - The category ID to find
   * @returns Promise with category info or null
   */
  findCategoryById: async (categoryId: string | undefined): Promise<CategoryInfo | null> => {
    if (!categoryId) {
      return null;
    }

    try {
      // Use server-side method for Server Components
      const categoriesData = await categoryService.getCategoriesServer();
      const categories = categoriesData.categories_infos;

      const category = categories.find((cat) => cat.categoryId === categoryId);
      return category || null;
    } catch (error) {
      console.error('Error finding category:', error);
      return null;
    }
  },

  /**
   * Get a single category by ID
   * @param categoryId - The category ID
   * @returns Promise with category data
   */
  getCategory: async (categoryId: string): Promise<ApiSuccess<{ category: CategoryInfo }>> => {
    return await apiClient.get(`/categories/${categoryId}`);
  },

  /**
   * Create a new category (admin only)
   * @param data - Category data
   * @returns Promise with success message
   */
  createCategory: async (data: Partial<CategoryInfo>): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.post('/categories', data);
  },

  /**
   * Update a category (admin only)
   * @param categoryId - The category ID
   * @param data - Updated category data
   * @returns Promise with success message
   */
  updateCategory: async (categoryId: string, data: Partial<CategoryInfo>): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.put(`/categories/${categoryId}`, data);
  },

  /**
   * Delete a category (admin only)
   * @param categoryId - The category ID
   * @returns Promise with success message
   */
  deleteCategory: async (categoryId: string): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.delete(`/categories/${categoryId}`);
  },

  /**
   * Get all categories (server-side for Server Components)
   * Uses apiClient which handles server-side vs client-side URL selection automatically
   * @returns Promise with categories data
   */
  getCategoriesServer: async (): Promise<CategoriesData> => {
    try {
      const response = await apiClient.get<CategoriesData>('/categories');

      return {
        categories_infos: response.data?.categories_infos || []
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { categories_infos: [] };
    }
  },

  /**
   * Extract categories data with helper functions (server-side)
   * @returns Helper functions to get category info and titles
   */
  extractCategoriesData: async () => {
    const categoriesData = await categoryService.getCategoriesServer();
    const allCategoriesInfo = categoriesData.categories_infos;

    const getCategoriesInfo = (categoriesIds: string[]): CategoryInfo[] => {
      const extractedCategoriesInfo: CategoryInfo[] = [];

      if (allCategoriesInfo.length > 0) {
        for (const categoryId of categoriesIds) {
          allCategoriesInfo.forEach((categoryInfo) => {
            if (categoryInfo.categoryId === categoryId) {
              extractedCategoriesInfo.push(categoryInfo);
            }
          });
        }
      }
      return extractedCategoriesInfo;
    };

    const getCategoriesTitles = (categoriesIds: string[], locale?: string): string[] => {
      const extractedCategoriesTitle: string[] = [];

      if (allCategoriesInfo.length > 0) {
        for (const categoryId of categoriesIds) {
          allCategoriesInfo.forEach((categoryInfo) => {
            if (categoryInfo.categoryId === categoryId) {
              // Get localized title based on locale
              let title = categoryInfo.categoryTitle; // Default (French)
              if (locale === 'ar' && categoryInfo.titleAr) {
                title = categoryInfo.titleAr;
              } else if (locale === 'en' && categoryInfo.titleEn) {
                title = categoryInfo.titleEn;
              }
              extractedCategoriesTitle.push(title);
            }
          });
        }
      }

      return extractedCategoriesTitle;
    };

    /**
     * Get localized category title based on locale
     * @param categoryInfo - Category info object
     * @param locale - Locale string (ar, en, or default for French)
     * @returns Localized title
     */
    const getLocalizedTitle = (categoryInfo: CategoryInfo, locale?: string): string => {
      if (locale === 'ar' && categoryInfo.titleAr) {
        return categoryInfo.titleAr;
      }
      if (locale === 'en' && categoryInfo.titleEn) {
        return categoryInfo.titleEn;
      }
      return categoryInfo.categoryTitle; // Default (French)
    };

    return { getCategoriesInfo, getCategoriesTitles, getLocalizedTitle, allCategoriesInfo };
  },
};
