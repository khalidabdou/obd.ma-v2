'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '@/services/favorite.service';
import { productKeys } from '../queries/useProducts';

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: favoriteService.addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: favoriteService.removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
