"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import { useFavorites } from "@/hooks/v2/queries/useFavorites";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/v2/mutations/useFavorite";

interface HomeProductActionsProps {
  productCode: string;
  isOutOfStock?: boolean;
}

export default function HomeProductActions({ productCode, isOutOfStock }: HomeProductActionsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addToCart } = useCart();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const favoriteItem = favorites?.favorites?.find((f) => f.productCode === productCode);
  const isFavorite = Boolean(favoriteItem);
  const isMutating = addFavorite.isPending || removeFavorite.isPending;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMutating) return;

    try {
      if (isFavorite && favoriteItem) {
        await removeFavorite.mutateAsync(favoriteItem.productCode);
      } else {
        await addFavorite.mutateAsync(productCode);
      }
    } catch (err) {
      router.push("/login");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(productCode, 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
          isOutOfStock
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : "bg-brand-blue hover:bg-[#1f6fac]"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        {isOutOfStock ? t("product.out_of_stock") : t("product.add_to_cart")}
      </button>
      <button
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? t("product.remove_from_favorites") : t("product.add_to_favorites")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand-blue hover:text-brand-blue dark:border-white/10 dark:text-neutral-400"
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
