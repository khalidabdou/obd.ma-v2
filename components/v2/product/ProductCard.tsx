"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/Context/CartContext";
import { useAuth } from "@/Context/AuthContext";
import { useFavorites } from "@/hooks/v2/queries/useFavorites";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/v2/mutations/useFavorite";
import { useTranslation } from "@/Context/LanguageContext";
import { normalizeError } from "@/lib/apiError";
import type { Product } from "@/services/product.service";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_IMAGE = "/product-placeholder.png";

function ProductCardImage({ src, title }: { src: string | null | undefined; title: string }) {
  const [failed, setFailed] = useState(false);
  const image = !failed && src?.trim() ? src.trim() : PLACEHOLDER_IMAGE;

  return (
    <Image
      src={image}
      alt={image === PLACEHOLDER_IMAGE ? "" : title}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
      className="object-contain"
      // In Docker the image optimizer cannot reach a browser-facing localhost URL.
      unoptimized={image.startsWith("http://localhost:")}
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { addToCart, getItemQuantity } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const hasDiscount = product.price != null && product.discountedPrice != null &&
    product.discountedPrice >= 0 && product.discountedPrice < product.price;
  const price = hasDiscount ? product.discountedPrice : product.price;
  const formatPrice = (value: number) =>
    `${new Intl.NumberFormat(language === "en" ? "en-MA" : language === "ar" ? "ar-MA" : "fr-MA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}\u00a0MAD`;

  const stock = product.quantity ?? 0;
  const cartQty = getItemQuantity(product.productCode);
  const isOutOfStock = stock <= 0;
  const maxReached = cartQty >= stock;

  const favoriteItem = favorites?.favorites?.find(
    (f) => f.productCode === product.productCode
  );
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
        await addFavorite.mutateAsync(product.productCode);
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
          await removeFavorite.mutateAsync(product.productCode);
        } catch (removeErr) {
          console.error("Failed to remove favorite after 409:", removeErr);
        }
        return;
      }

      console.error("Failed to toggle favorite:", apiError);
    }
  };

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/product/${product.productCode}`} className="block">
        <div className="relative aspect-square bg-slate-50 dark:bg-[#0B0D10]">
          <ProductCardImage key={product.images?.mainImage || product.productCode} src={product.images?.mainImage} title={product.title} />
          <button
            onClick={handleFavoriteClick}
            className={`absolute right-2 top-2 rounded-full p-2 backdrop-blur transition-colors ${
              isFavorite
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-background/80 text-brand-red hover:bg-background"
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isMutating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className="h-4 w-4"
                fill={isFavorite ? "currentColor" : "none"}
              />
            )}
          </button>
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.productCode}`}>
          <h3 className="mb-2 line-clamp-2 font-medium hover:text-brand-blue">
            {product.title}
          </h3>
        </Link>
        <div className="mb-3 flex min-h-14 flex-col justify-start gap-0.5">
          {price !== null && price !== undefined && (
            <span className="text-lg font-bold leading-7 text-brand-blue" aria-label={formatPrice(price)}>
              {formatPrice(price)}
            </span>
          )}
          {hasDiscount && product.price != null && (
              <span className="text-sm leading-5 text-muted-foreground line-through" aria-label={formatPrice(product.price)}>
                {formatPrice(product.price)}
              </span>
            )}
        </div>
        <Button
          className="mt-auto w-full gap-2"
          disabled={isOutOfStock || maxReached}
          onClick={() => !isOutOfStock && !maxReached && addToCart(product.productCode, 1)}
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock
            ? t("product.out_of_stock")
            : cartQty > 0
              ? `${t("product.add_to_cart")} (${cartQty})`
              : t("product.add_to_cart")}
        </Button>
      </CardContent>
    </Card>
  );
}
