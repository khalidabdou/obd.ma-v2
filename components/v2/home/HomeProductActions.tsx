"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import type { Product } from "@/services/product.service";

interface HomeProductActionsProps {
  product: Product;
}

export default function HomeProductActions({ product }: HomeProductActionsProps) {
  const { t } = useTranslation();
  const { addToCart, getItemQuantity } = useCart();

  const productCode = product.productCode;
  const stock = product.quantity ?? 0;
  const cartQty = getItemQuantity(productCode);
  const isOutOfStock = stock <= 0;
  const maxReached = cartQty >= stock;

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
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock || maxReached}
      className={`flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold text-white transition-colors sm:text-sm ${
        isOutOfStock || maxReached
          ? "cursor-not-allowed bg-muted text-muted-foreground"
          : "bg-brand-blue hover:bg-[#1f6fac]"
      }`}
    >
      <ShoppingCart className="h-4 w-4" />
      {cartButtonLabel}
    </button>
  );
}
