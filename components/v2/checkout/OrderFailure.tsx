"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/Context/LanguageContext";
import { XCircle, RefreshCw, ShoppingCart, Mail } from "lucide-react";

interface OrderFailureProps {
  errorMessage?: string;
  onRetry: () => void;
}

export default function OrderFailure({ errorMessage, onRetry }: OrderFailureProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-2xl border border-brand-blue/50 bg-card p-8 text-center shadow-xl dark:border-brand-blue/40 sm:p-10">
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Image
              src="/assets/icons/exclamation-circle-icon.svg"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 dark:invert"
            />
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold">{t("checkout.order_failed_title")}</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("checkout.order_failed_desc")}
        </p>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <p className="mb-8 text-sm text-muted-foreground">
          {t("checkout.cart_preserved")}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            {t("checkout.try_again")}
          </Button>
          <Link href="/cart" className="block">
            <Button className="w-full gap-2 bg-brand-blue hover:bg-brand-blue/90 sm:w-auto">
              <ShoppingCart className="h-4 w-4" />
              {t("checkout.back_to_cart")}
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>
            {t("checkout.need_help")}{" "}
            <a href="mailto:support@obd.ma" className="text-brand-blue hover:underline">
              support@obd.ma
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
