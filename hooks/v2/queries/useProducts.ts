'use client';

import { useQuery } from '@tanstack/react-query';
import {
  productService,
  type ProductQueryParams,
  type ProductsData,
} from '@/services/product.service';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductQueryParams) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (code: string) => [...productKeys.details(), code] as const,
};

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await productService.getProducts(params);
      return response.data;
    },
  });
}

export function useProductByCode(productCode: string) {
  return useQuery({
    queryKey: productKeys.detail(productCode),
    queryFn: async () => {
      const response = await productService.getProductByCode(productCode);
      return response.data;
    },
    enabled: !!productCode,
  });
}
