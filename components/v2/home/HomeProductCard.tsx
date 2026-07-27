"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import { useTranslation } from "@/Context/LanguageContext";
import { useFavorites } from "@/hooks/v2/queries/useFavorites";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/v2/mutations/useFavorite";
import { normalizeError } from "@/lib/apiError";
import type { Product } from "@/services/product.service";
import HomeProductActions from "./HomeProductActions";

function isNewProduct(creationDate: string): boolean {
  if (!creationDate) return false;
  const created = new Date(creationDate).getTime();
  if (Number.isNaN(created)) return false;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - created <= THIRTY_DAYS;
}

interface HomeProductCardProps {
  product: Product;
}

export default function HomeProductCard({ product }: HomeProductCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const price = product.discountedPrice || product.price;
  const hasDiscount =
    product.discountedPrice !== null &&
    product.discountedPrice !== undefined &&
    product.price !== null &&
    product.price !== undefined &&
    product.discountedPrice < product.price;

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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 dark:border-white/10 dark:bg-[#14161B] dark:hover:bg-[#1A1D24]">
      {isNewProduct(product.creationDate) && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white">
          {t("home.new")}
        </span>
      )}

      <button
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? t("product.remove_from_favorites") : t("product.add_to_favorites")}
        className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-colors ${
          isFavorite
            ? "border-red-200 bg-red-50 text-red-500 hover:border-red-300 dark:border-red-900/30 dark:bg-red-950/20"
            : "border-border bg-background/80 text-muted-foreground hover:border-brand-blue hover:text-brand-blue dark:border-white/10 dark:bg-black/30 dark:text-neutral-400"
        }`}
      >
        {isMutating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        )}
      </button>

      <Link href={`/product/${product.productCode}`} className="block">
        <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-muted dark:bg-[#0B0D10]">
          {product.images?.mainImage ? (
            <Image
              src={product.images.mainImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4"
            />
          ) : (
            <span className="text-lg font-bold text-brand-blue">
              {product.title.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground dark:text-white">
          {product.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground dark:text-neutral-400">
          {product.description}
        </p>

        <div className="mb-4 flex items-center gap-2">
          {price !== null && price !== undefined && (
            <span className="text-lg font-bold text-brand-blue">
              {price.toFixed(2)} MAD
            </span>
          )}
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through dark:text-neutral-500">
              {product.price!.toFixed(2)} MAD
            </span>
          )}
        </div>
      </Link>

      <HomeProductActions product={product} />
    </div>
  );
}
