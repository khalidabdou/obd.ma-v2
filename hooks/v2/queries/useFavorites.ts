'use client';

import { useQuery } from '@tanstack/react-query';
import { favoriteService, type FavoritesData } from '@/services/favorite.service';

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: () => [...favoriteKeys.all, 'list'] as const,
};

export function useFavorites() {
  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: async () => {
      const response = await favoriteService.getFavorites();
      return response.data;
    },
    retry: false,
  });
}
