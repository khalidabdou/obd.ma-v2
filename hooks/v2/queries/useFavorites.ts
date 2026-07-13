'use client';

import { useQuery } from '@tanstack/react-query';
import { favoriteService, type FavoritesData } from '@/services/favorite.service';
import { useAuth } from '@/Context/AuthContext';

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: () => [...favoriteKeys.all, 'list'] as const,
};

export function useFavorites() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: async () => {
      const response = await favoriteService.getFavorites();
      return response.data;
    },
    // Backend returns an empty list for guests, but avoid firing the
    // request at all until auth state is known — saves a network round-trip.
    enabled: !authLoading && isAuthenticated,
    retry: false,
  });
}
