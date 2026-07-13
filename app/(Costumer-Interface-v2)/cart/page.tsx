"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiError";
import {
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ArrowRight,
} from "lucide-react";

export default function CartPage() {
  const { cartItems, cartCount, isLoading, updateQuantity, removeFromCart } =
    useCart();
  const { t } = useTranslation();
  const { toast } = useToast();

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const info = item.productInfo;
      if (!info) return sum;
      const unitPrice = info.discountedPrice ?? info.price ?? 0;
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const handleIncrease = async (productCode: string) => {
    const result = await updateQuantity(productCode, 1);
    if (!result.success) {
      toast({
        title: t("common.error"),
        description: result.error
          ? getErrorMessage(result.error, t)
          : t("toaster.quantity_increase_failed"),
        variant: "destructive",
      });
    }
  };

  const handleDecrease = async (productCode: string) => {
    const result = await updateQuantity(productCode, -1);
    if (!result.success) {
      toast({
        title: t("common.error"),
        description: result.error
          ? getErrorMessage(result.error, t)
          : t("toaster.quantity_decrease_failed"),
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (productCode: string) => {
    const success = await removeFromCart(productCode);
    if (success) {
      toast({
        title: t("cart.title"),
        description: t("messages.removed_from_cart"),
      });
    } else {
      toast({
        title: t("common.error"),
        description: t("messages.error_occurred"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">{t("common.loading")}</span>
        </div>
      </Container>
    );
  }

  if (cartCount === 0) {
    return (
      <Container className="py-16 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t("cart.empty")}</h1>
            <p className="text-muted-foreground">
              {t("home.random_products_title")}
            </p>
          </div>
          <Link href="/catalog">
            <Button size="lg">{t("cart.continue_shopping")}</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">
        {t("cart.title")} ({cartCount})
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cartItems.map((item) => {
            const info = item.productInfo;
            const image = info?.images?.mainImage || "/placeholder.svg";
            const unitPrice = info?.discountedPrice ?? info?.price ?? null;
            const originalPrice = info?.price ?? null;
            const hasDiscount =
              info?.discountedPrice != null && info?.discountedPrice !== info?.price;
            const itemTotal = unitPrice != null ? unitPrice * item.quantity : 0;

            return (
              <Card
                key={`${item.productCode}-${item.choice || "default"}`}
                className="overflow-hidden"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <Link
                      href={`/product/${item.productCode}`}
                      className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-28"
                    >
                      <Image
                        src={image}
                        alt={info?.title || item.productCode}
                        fill
                        sizes="(max-width: 640px) 100vw, 112px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col gap-2">
                      <Link href={`/product/${item.productCode}`}>
                        <h3 className="font-medium hover:text-brand-blue line-clamp-2">
                          {info?.title || item.productCode}
                        </h3>
                      </Link>

                      {item.choice && (
                        <p className="text-sm text-muted-foreground">
                          {t("cart.type")}{" "}
                          <span className="font-medium text-foreground">
                            {item.choice}
                          </span>
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground">
                        {t("product.product_code")}: {item.productCode}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 sm:hidden">
                        {unitPrice != null ? (
                          <span className="font-bold text-brand-blue">
                            {unitPrice.toFixed(2)} MAD
                          </span>
                        ) : null}
                        {hasDiscount && originalPrice != null ? (
                          <span className="text-sm text-muted-foreground line-through">
                            {originalPrice.toFixed(2)} MAD
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="hidden flex-col items-end gap-1 sm:flex">
                        {unitPrice != null ? (
                          <span className="font-bold text-brand-blue">
                            {unitPrice.toFixed(2)} MAD
                          </span>
                        ) : null}
                        {hasDiscount && originalPrice != null ? (
                          <span className="text-sm text-muted-foreground line-through">
                            {originalPrice.toFixed(2)} MAD
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDecrease(item.productCode)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[2rem] text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleIncrease(item.productCode)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        {unitPrice != null ? (
                          <span className="font-medium">
                            {t("cart.total_label")} {itemTotal.toFixed(2)} MAD
                          </span>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(item.productCode)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold">{t("cart.summary")}</h2>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("cart.product_price")}
                  </span>
                  <span className="font-medium">{subtotal.toFixed(2)} MAD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("cart.quantity")}
                  </span>
                  <span className="font-medium">{totalQuantity}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>{t("cart.total")}</span>
                  <span className="text-brand-blue">{subtotal.toFixed(2)} MAD</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full gap-2" size="lg">
                  {t("cart.checkout")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link
                href="/catalog"
                className="block text-center text-sm text-muted-foreground hover:text-brand-blue"
              >
                {t("cart.continue_shopping")}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
