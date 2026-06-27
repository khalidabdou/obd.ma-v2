'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryService, type CategoriesData } from '@/services/category.service';

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const response = await categoryService.getCategories();
      return response.data;
    },
  });
}
