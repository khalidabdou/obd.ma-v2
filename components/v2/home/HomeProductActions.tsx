"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useCart } from "@/Context/CartContext";
import { useAuth } from "@/Context/AuthContext";
import { useTranslation } from "@/Context/LanguageContext";
import { useFavorites } from "@/hooks/v2/queries/useFavorites";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/v2/mutations/useFavorite";
import { normalizeError } from "@/lib/apiError";
import type { Product } from "@/services/product.service";

interface HomeProductActionsProps {
  product: Product;
}

export default function HomeProductActions({ product }: HomeProductActionsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addToCart, getItemQuantity } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const productCode = product.productCode;
  const stock = product.quantity ?? 0;
  const cartQty = getItemQuantity(productCode);
  const isOutOfStock = stock <= 0;
  const maxReached = cartQty >= stock;

  const favoriteItem = favorites?.favorites?.find((f) => f.productCode === productCode);
  const isFavorite = Boolean(favoriteItem);
  const isMutating = addFavorite.isPending || removeFavorite.isPending;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMutating || authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      if (isFavorite && favoriteItem) {
        await removeFavorite.mutateAsync(favoriteItem.productCode);
      } else {
        await addFavorite.mutateAsync(productCode);
      }
    } catch (err) {
      const apiError = normalizeError(err);
      if (apiError.statusCode === 401 || apiError.statusCode === 403) {
        router.push("/login");
        return;
      }

      // If backend says already favorited, remove it (toggle-off)
      if (apiError.statusCode === 409) {
        try {
          await removeFavorite.mutateAsync(productCode);
        } catch (removeErr) {
          console.error("Failed to remove favorite after 409:", removeErr);
        }
        return;
      }

      console.error("Failed to toggle favorite:", apiError);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && !maxReached) {
      addToCart(productCode, 1);
    }
  };

  const cartButtonLabel = (() => {
    if (isOutOfStock) return t("product.out_of_stock");
    if (cartQty > 0) return `${t("product.add_to_cart")} (${cartQty})`;
    return t("product.add_to_cart");
  })();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || maxReached}
        className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
          isOutOfStock || maxReached
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : "bg-brand-blue hover:bg-[#1f6fac]"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        {cartButtonLabel}
      </button>
      <button
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? t("product.remove_from_favorites") : t("product.add_to_favorites")}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
          isFavorite
            ? "border-red-200 bg-red-50 text-red-500 hover:border-red-300 dark:border-red-900/30 dark:bg-red-950/20"
            : "border-border text-muted-foreground hover:border-brand-blue hover:text-brand-blue dark:border-white/10 dark:text-neutral-400"
        }`}
      >
        {isMutating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        )}
      </button>
    </div>
  );
}
