'use client';

import { useQuery } from '@tanstack/react-query';
import { getBrands, type BrandsData } from '@/services/brand.client.service';

export const brandKeys = {
  all: ['brands'] as const,
  list: () => [...brandKeys.all, 'list'] as const,
};

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.list(),
    queryFn: async () => {
      const response = await getBrands();
      return response.data;
    },
  });
}
