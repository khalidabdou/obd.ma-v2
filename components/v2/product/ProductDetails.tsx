"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/v2/queries/useFavorites";
import {
  useAddFavorite,
  useRemoveFavorite,
} from "@/hooks/v2/mutations/useFavorite";
import HomeProductCard from "../home/HomeProductCard";
import type { Product } from "@/services/product.service";
import type { CategoryInfo } from "@/services/category.service";
import type { BrandInfo } from "@/services/brand.service";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Check,
  Package,
  Loader2,
  ArrowRight,
  Home,
  ChevronRight,
  Tag,
  Truck,
  Shield,
} from "lucide-react";

interface ProductDetailsProps {
  product: Product;
  category: CategoryInfo | null;
  brand: BrandInfo | null;
  relatedProducts: Product[];
}

export default function ProductDetails({
  product,
  category,
  brand,
  relatedProducts,
}: ProductDetailsProps) {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { addToCart, getItemQuantity } = useCart();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const [quantity, setQuantity] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState<string | undefined>();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Image gallery: track which image is shown as main
  const images = product.images;
  const allImages = [
    images?.mainImage,
    images?.image1,
    images?.image2,
  ].filter(Boolean) as string[];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = allImages[activeImageIndex] || "/placeholder.svg";

  const price = product.price;
  const discountedPrice = product.discountedPrice;
  const hasDiscount =
    discountedPrice != null && discountedPrice !== price && price != null;
  const isOutOfStock = !product.quantity || product.quantity <= 0;
  const inCartQuantity = getItemQuantity(product.productCode);

  const favoriteItem = favorites?.favorites?.find(
    (f) => f.productCode === product.productCode
  );
  const isFavorite = Boolean(favoriteItem);
  const isFavoriteMutating = addFavorite.isPending || removeFavorite.isPending;

  const displayDescription =
    (language === "ar" && product.description_ar) ||
    (language === "en" && product.description_en) ||
    product.description;

  // Short description — language-aware fallback
  const shortDescription =
    (product as any).shortDescription || null;
  const displayShortDescription = shortDescription || displayDescription?.slice(0, 200) || null;

  const filteredProductContent =
    product.productContent?.filter(
      (content) => content && content.trim().length > 0
    ) || [];

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAddingToCart(true);
    const success = await addToCart(
      product.productCode,
      quantity,
      selectedChoice
    );
    setIsAddingToCart(false);
    if (success) {
      toast({
        title: t("cart.title"),
        description: t("messages.added_to_cart"),
      });
      setQuantity(1);
    } else {
      toast({
        title: t("common.error"),
        description: t("messages.error_occurred"),
        variant: "destructive",
      });
    }
  };

  const handleFavoriteToggle = async () => {
    if (isFavoriteMutating) return;
    try {
      if (isFavorite && favoriteItem) {
        await removeFavorite.mutateAsync(product.productCode);
        toast({
          title: t("favorites.title"),
          description: t("messages.removed_from_favorites"),
        });
      } else {
        await addFavorite.mutateAsync(product.productCode);
        toast({
          title: t("favorites.title"),
          description: t("messages.added_to_favorites"),
        });
      }
    } catch {
      toast({
        title: t("common.error"),
        description: t("messages.error_occurred"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-10">
      {/* ── Breadcrumbs ── */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>{t("common.home") || "Accueil"}</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {category ? (
          <>
            <Link
              href={`/category/${category.categoryId}`}
              className="hover:text-foreground transition-colors"
            >
              {category.categoryTitle}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        ) : null}
        <span className="font-medium text-foreground line-clamp-1">
          {product.title}
        </span>
      </nav>

      {/* ── Main product layout ── */}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* ── Image Gallery ── */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted dark:bg-[#14161B]">
            <Image
              src={activeImage}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 40vw"
              className="object-contain p-4"
              priority
            />
            {hasDiscount && (
              <Badge className="absolute left-4 top-4 bg-brand-red px-2.5 py-1 text-sm font-semibold text-white">
                -{Math.round((1 - discountedPrice! / price!) * 100)}%
              </Badge>
            )}
            {isOutOfStock && (
              <Badge
                variant="secondary"
                className="absolute right-4 top-4 bg-muted px-2.5 py-1 text-sm font-medium text-muted-foreground"
              >
                {t("product.out_of_stock")}
              </Badge>
            )}
          </div>

          {/* Thumbnail selector */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((imgSrc, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    idx === activeImageIndex
                      ? "border-brand-blue shadow-md"
                      : "border-border hover:border-brand-blue/50"
                  }`}
                >
                  <Image
                    src={imgSrc}
                    alt={`${product.title} - image ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col gap-5">
          {/* Title and meta */}
          <div>
            <h1 className="mb-3 text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono">
                {t("product.product_code")}: {product.productCode}
              </span>
              {category && (
                <>
                  <span className="text-border">|</span>
                  <Link
                    href={`/category/${category.categoryId}`}
                    className="flex items-center gap-1 hover:text-brand-blue transition-colors"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {category.categoryTitle}
                  </Link>
                </>
              )}
              {brand && (
                <>
                  <span className="text-border">|</span>
                  <Link
                    href={`/brand/${brand.brandId}`}
                    className="flex items-center gap-1 hover:text-brand-blue transition-colors"
                  >
                    {brand.brandName}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Short description */}
          {displayShortDescription && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {displayShortDescription}
            </p>
          )}

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="destructive" className="gap-1 px-3 py-1">
                {t("product.out_of_stock")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-green-600 px-3 py-1 text-green-600"
              >
                <Check className="h-3.5 w-3.5" />
                {t("product.in_stock")}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-3">
            {discountedPrice != null && discountedPrice !== price ? (
              <>
                <span className="text-3xl font-bold text-brand-blue">
                  {discountedPrice.toFixed(2)} MAD
                </span>
                {price != null && (
                  <span className="text-lg text-muted-foreground line-through">
                    {price.toFixed(2)} MAD
                  </span>
                )}
              </>
            ) : price != null ? (
              <span className="text-3xl font-bold text-brand-blue">
                {price.toFixed(2)} MAD
              </span>
            ) : null}
          </div>

          {/* Choices (variants) */}
          {product.choices && product.choices.length > 1 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">
                {t("cart.type")}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.choices.map((choice) => (
                  <Button
                    key={choice}
                    type="button"
                    variant={selectedChoice === choice ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChoice(choice)}
                  >
                    {choice}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Cart actions */}
          {!isOutOfStock && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t("cart.quantity")}</span>
                <div className="flex items-center rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none rounded-l-lg"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none rounded-r-lg"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {inCartQuantity > 0 && (
                <span className="text-sm text-muted-foreground">
                  {t("cart.in_cart")}: {inCartQuantity}
                </span>
              )}
            </div>
          )}

          {/* Add to cart + Favorite buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="lg"
              className="gap-2 bg-brand-blue px-8 text-base hover:bg-brand-blue/90"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              {isOutOfStock
                ? t("product.contact_us_to_order")
                : t("product.add_to_cart")}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handleFavoriteToggle}
              disabled={isFavoriteMutating}
            >
              {isFavoriteMutating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart
                  className="h-5 w-5"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              )}
              {isFavorite
                ? t("product.remove_from_favorites")
                : t("product.add_to_favorites")}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-[#14161B]/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-brand-blue" />
              <span>{t("product.fast_delivery") || "Livraison rapide"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-brand-blue" />
              <span>{t("product.secure_payment") || "Paiement sécurisé"}</span>
            </div>
          </div>

          {/* Product content (box contents / features) */}
          {filteredProductContent.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 font-semibold">
                  <Package className="h-4 w-4 text-brand-blue" />
                  {t("product.product_content")}
                </div>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                  {filteredProductContent.map((content, index) => (
                    <li key={index}>{content}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      {displayDescription && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold lg:text-2xl">
            {t("product.description")}
          </h2>
          <div className="prose max-w-none text-muted-foreground dark:prose-invert">
            {displayDescription}
          </div>
        </div>
      )}

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold lg:text-2xl">
              {t("product.same_category")}
            </h2>
            <Link
              href={`/category/${product.categoryId}`}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
            >
              {t("product.more")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {relatedProducts.map((related) => (
              <HomeProductCard key={related.productCode} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
