"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/Context/LanguageContext";
import type { CheckoutOptions } from "@/services/order.service";
import type { DeliveryCompany } from "@/app/(Costumer-Interface-v2)/checkout/page";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, MapPin, Phone, Scissors, PackageMinus } from "lucide-react";

const OZONE_MAX_LIMIT = 9900;

interface DeliveryStepProps {
  selected: DeliveryCompany | null;
  onSelect: (company: DeliveryCompany) => void;
  onBack: () => void;
  onNext: () => void;
  options?: CheckoutOptions;
  loading: boolean;
  error?: string;
}

const reasonKeys: Record<string, string> = {
  MIXED_SHIPPING_REQUIREMENTS: "checkout.mixed_shipping_requirements",
  MIXED_INTERNATIONAL_ELIGIBILITY: "checkout.mixed_international_eligibility",
  NOT_ELIGIBLE_FOR_INTERNATIONAL_SHIPPING: "checkout.not_eligible_international",
  INTERNATIONAL_SHIPPING_NOT_CONFIGURED: "checkout.international_not_configured",
  PICKUP_NOT_CONFIGURED: "checkout.pickup_not_configured",
  DELIVERY_PRICE_NOT_CONFIGURED: "checkout.delivery_price_not_configured",
  OZONE_MAX_LIMIT: "checkout.ozone_limit_reason",
};

export default function DeliveryStep({
  selected,
  onSelect,
  onBack,
  onNext,
  options,
  loading,
  error,
}: DeliveryStepProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-brand-blue/50 bg-card p-6 shadow-xl dark:border-brand-blue/40 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
            <Image src="/assets/icons/box-icon.svg" alt="" width={24} height={24} className="h-6 w-6 dark:invert" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("checkout.delivery_title")}</h2>
            <p className="text-sm text-muted-foreground">{t("checkout.delivery_desc")}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("common.loading")}</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : options?.blockedReason ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">{t(reasonKeys[options.blockedReason] || "checkout.delivery_unavailable")}</p>
                {options.incompatibleProducts.length > 0 && (
                  <p className="mt-2 text-sm">{options.incompatibleProducts.join(", ")}</p>
                )}
              </div>
            </div>
          </div>
        ) : !options || options.deliveryOptions.length === 0 ? (
          <div className="rounded-2xl border border-brand-blue/30 bg-muted/50 p-8 text-center text-muted-foreground">
            <p>{t("checkout.no_delivery")}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {options.deliveryOptions.map((company) => {
              const isSelected = selected?.id === company.id;
              const isOzone = company.name === "OZONE_EXPRESS";
              const isOverLimit = isOzone && options.subtotal > OZONE_MAX_LIMIT;
              const disabled = !company.available || isOverLimit;
              const logoSrc = company.name === "OZONE_EXPRESS"
                ? "/assets/icons/ozone_icon.png"
                : company.name === "TAWSIL"
                  ? "/assets/icons/tawsil-logo.svg"
                  : "/assets/icons/box-icon.svg";
              return (
                <div key={company.id} className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => !disabled && onSelect(company)}
                    disabled={disabled}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                      disabled
                        ? "cursor-not-allowed border-border bg-muted/30 opacity-70"
                        : isSelected
                          ? "border-brand-blue bg-brand-blue/5 shadow-md ring-1 ring-brand-blue/20"
                          : "border-brand-blue/30 bg-card hover:border-brand-blue hover:bg-muted/50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${isSelected ? "bg-background" : "bg-muted"}`}>
                      <Image src={logoSrc} alt={company.displayName} width={40} height={40} className="h-10 w-10 rounded-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{company.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.fee === 0 ? t("checkout.free") : `${company.fee.toFixed(2)} MAD`}
                      </p>
                    </div>
                  </button>
                  {!company.available && company.unavailableReason && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{t(reasonKeys[company.unavailableReason] || "checkout.delivery_unavailable")}</span>
                    </div>
                  )}
                  {isOverLimit && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-50 p-3 text-sm dark:border-amber-400/30 dark:bg-amber-950/30">
                      <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{t("checkout.ozone_limit_reason")}</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2"><Scissors className="h-3.5 w-3.5" /><span>{t("checkout.ozone_limit_solution_split")}</span></li>
                        <li className="flex items-center gap-2"><PackageMinus className="h-3.5 w-3.5" /><span>{t("checkout.ozone_limit_solution_reduce")}</span></li>
                        <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{t("checkout.ozone_limit_solution_support")}</span></li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {options?.pickupAddress && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-blue" />
            <div><p className="font-medium">{t("checkout.pickup_address")}</p><p className="text-muted-foreground">{options.pickupAddress}</p></div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />{t("checkout.back")}
          </Button>
          <Button
            onClick={onNext}
            size="lg"
            disabled={loading || !selected || Boolean(options?.blockedReason) || !options?.deliveryOptions.some((option) => option.id === selected.id && option.available)}
            className="gap-2 bg-brand-blue px-8 hover:bg-brand-blue/90"
          >
            {t("checkout.continue")}<ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
