"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";

export const checkoutKeys = {
  all: ["checkout"] as const,
  options: (country: string, cartSignature: string) =>
    [...checkoutKeys.all, "options", country, cartSignature] as const,
};

export function useCheckoutOptions(country: string, cartSignature: string, enabled: boolean) {
  return useQuery({
    queryKey: checkoutKeys.options(country, cartSignature),
    queryFn: async () => {
      const response = await orderService.getCheckoutOptions(country);
      if (!response.success || !response.data) {
        throw new Error("Failed to load checkout options");
      }
      return response.data;
    },
    enabled: enabled && Boolean(country) && Boolean(cartSignature),
    staleTime: 30_000,
  });
}
