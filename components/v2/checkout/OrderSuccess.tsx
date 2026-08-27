"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/Context/LanguageContext";
import type { DeliveryCompany } from "@/app/(Costumer-Interface-v2)/checkout/page";
import type { CheckoutOptions, CheckoutPaymentMethod } from "@/services/order.service";
import { CheckCircle, Home, Landmark, MapPin, Package } from "lucide-react";

interface OrderSuccessProps {
  orderId: string;
  paymentMethod: CheckoutPaymentMethod | null;
  delivery: DeliveryCompany | null;
  checkoutOptions?: CheckoutOptions;
}

export default function OrderSuccess({ orderId, paymentMethod, delivery, checkoutOptions }: OrderSuccessProps) {
  const { t } = useTranslation();
  const bankDetails = paymentMethod === "bank_transfer" ? checkoutOptions?.bankDetails : null;
  const isPickup = delivery?.name === "PICKUP";

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-2xl border border-brand-blue/50 bg-card p-8 text-center shadow-xl dark:border-brand-blue/40 sm:p-10">
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <Image src="/assets/icons/box-icon.svg" alt="" width={40} height={40} className="h-10 w-10 dark:invert" />
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold">{t("checkout.order_success")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {paymentMethod === "bank_transfer" ? t("checkout.bank_order_pending") : t("checkout.order_success_desc")}
        </p>
        <p className="mb-6 inline-block rounded-xl bg-muted/50 px-4 py-2 font-mono text-lg font-semibold text-brand-blue dark:bg-white/5">
          {t("product.product_code")}: {orderId}
        </p>

        {bankDetails && (
          <div className="mb-6 space-y-2 rounded-xl border border-border bg-muted/50 p-4 text-start text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold"><Landmark className="h-4 w-4 text-brand-blue" />{t("checkout.bank_transfer")}</div>
            <p>{bankDetails.bankName}</p>
            <p>{bankDetails.accountHolder}</p>
            {bankDetails.accountNumber && <p>{t("checkout.account_number")}: {bankDetails.accountNumber}</p>}
            {bankDetails.iban && <p>IBAN: {bankDetails.iban}</p>}
            {bankDetails.swift && <p>SWIFT: {bankDetails.swift}</p>}
            <p className="font-medium text-brand-blue">{t("checkout.transfer_reference")}: {orderId}</p>
            {bankDetails.instructions && <p className="text-muted-foreground">{bankDetails.instructions}</p>}
          </div>
        )}

        {isPickup && checkoutOptions?.pickupAddress && (
          <div className="mb-6 space-y-2 rounded-xl border border-border bg-muted/50 p-4 text-start text-sm">
            <div className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-brand-blue" />{t("checkout.pickup_address")}</div>
            <p>{checkoutOptions.pickupAddress}</p>
            {checkoutOptions.pickupInstructions && <p className="text-muted-foreground">{checkoutOptions.pickupInstructions}</p>}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/orders" className="block">
            <Button variant="outline" className="w-full gap-2 sm:w-auto"><Package className="h-4 w-4" />{t("checkout.view_orders")}</Button>
          </Link>
          <Link href="/" className="block">
            <Button className="w-full gap-2 bg-brand-blue hover:bg-brand-blue/90 sm:w-auto"><Home className="h-4 w-4" />{t("cart.home_page")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
