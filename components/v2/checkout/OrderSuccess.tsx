"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/Context/LanguageContext";
import { CheckCircle, Package, Home } from "lucide-react";

interface OrderSuccessProps {
  orderId: string;
}

export default function OrderSuccess({ orderId }: OrderSuccessProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-2xl border border-brand-blue/50 bg-card p-8 text-center shadow-xl dark:border-brand-blue/40 sm:p-10">
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <Image
              src="/assets/icons/box-icon.svg"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 dark:invert"
            />
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold">{t("checkout.order_success")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("checkout.order_success_desc")}
        </p>
        <p className="mb-8 inline-block rounded-xl bg-muted/50 px-4 py-2 font-mono text-lg font-semibold text-brand-blue dark:bg-white/5">
          {t("product.product_code")}: {orderId}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/orders" className="block">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <Package className="h-4 w-4" />
              {t("checkout.view_orders")}
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button className="w-full gap-2 bg-brand-blue hover:bg-brand-blue/90 sm:w-auto">
              <Home className="h-4 w-4" />
              {t("cart.home_page")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
