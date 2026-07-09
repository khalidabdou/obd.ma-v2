"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/Context/LanguageContext";
import { CheckCircle, Package, Home } from "lucide-react";

interface OrderSuccessProps {
  orderId: string;
}

export default function OrderSuccess({ orderId }: OrderSuccessProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <h1 className="mb-2 text-2xl font-bold">{t("checkout.order_success")}</h1>
      <p className="mb-1 text-muted-foreground">
        {t("checkout.order_success_desc")}
      </p>
      <p className="mb-8 font-mono text-lg font-semibold text-brand-blue">
        {t("product.product_code")}: {orderId}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/orders`}>
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Package className="h-4 w-4" />
            {t("checkout.view_orders")}
          </Button>
        </Link>
        <Link href="/">
          <Button className="gap-2 bg-brand-blue hover:bg-brand-blue/90 w-full sm:w-auto">
            <Home className="h-4 w-4" />
            {t("cart.home_page")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
