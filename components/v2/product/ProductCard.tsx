"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/Context/CartContext";
import { useFavorites } from "@/hooks/v2/queries/useFavorites";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/v2/mutations/useFavorite";
import type { Product } from "@/services/product.service";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const image = product.images?.mainImage || "/placeholder.svg";
  const price = product.discountedPrice ?? product.price;

  const favoriteItem = favorites?.favorites?.find(
    (f) => f.productCode === product.productCode
  );
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
        await addFavorite.mutateAsync(product.productCode);
      }
    } catch (err) {
      router.push("/v2/login");
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/v2/product/${product.productCode}`}>
        <div className="relative aspect-square bg-muted">
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-2 text-brand-red backdrop-blur transition-colors hover:bg-background"
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
      <CardContent className="p-4">
        <Link href={`/v2/product/${product.productCode}`}>
          <h3 className="mb-2 line-clamp-2 font-medium hover:text-brand-blue">
            {product.title}
          </h3>
        </Link>
        <div className="mb-3 flex items-center gap-2">
          {price !== null && price !== undefined && (
            <span className="font-bold text-brand-blue">
              {price.toFixed(2)} MAD
            </span>
          )}
          {product.discountedPrice !== null &&
            product.discountedPrice !== undefined &&
            product.price !== null &&
            product.price !== undefined && (
              <span className="text-sm text-muted-foreground line-through">
                {product.price.toFixed(2)} MAD
              </span>
            )}
        </div>
        <Button
          className="w-full gap-2"
          onClick={() => addToCart(product.productCode, 1)}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
