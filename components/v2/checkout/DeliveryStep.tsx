"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/Context/LanguageContext";
import { orderService } from "@/services/order.service";
import type { DeliveryCompany } from "@/app/(Costumer-Interface-v2)/checkout/page";
import { ArrowRight, ArrowLeft, Loader2, AlertCircle, Phone, Scissors, PackageMinus } from "lucide-react";

const OZONE_MAX_LIMIT = 9900;

interface DeliveryStepProps {
  selected: DeliveryCompany | null;
  onSelect: (company: DeliveryCompany) => void;
  onBack: () => void;
  onNext: () => void;
  subtotal: number;
}

export default function DeliveryStep({
  selected,
  onSelect,
  onBack,
  onNext,
  subtotal,
}: DeliveryStepProps) {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await orderService.getDeliveryCompanies();
        if (res.success) {
          const data = res.data as any;
          const list = Array.isArray(data) ? data : data?.companies || [];
          setCompanies(list as DeliveryCompany[]);
        }
      } catch (err) {
        console.error("Failed to fetch delivery companies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-brand-blue/50 bg-card p-6 shadow-xl dark:border-brand-blue/40 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
            <Image
              src="/assets/icons/box-icon.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 dark:invert"
            />
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
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-brand-blue/30 bg-muted/50 p-8 text-center text-muted-foreground dark:border-brand-blue/30">
            <Image
              src="/assets/icons/box-icon.svg"
              alt=""
              width={40}
              height={40}
              className="mx-auto mb-3 h-10 w-10 dark:invert"
            />
            <p>{t("checkout.no_delivery")}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {companies.map((company) => {
              const isSelected = selected?.id === company.id;
              const isOzone = company.name === "OZONE_EXPRESS";
              const isOverLimit = isOzone && subtotal > OZONE_MAX_LIMIT;
              const logoSrc =
                company.name === "OZONE_EXPRESS"
                  ? "/assets/icons/ozone_icon.png"
                  : company.name === "TAWSIL"
                    ? "/assets/icons/tawsil-logo.svg"
                    : "/assets/icons/box-icon.svg";
              return (
                <div key={company.id} className="flex flex-col gap-2">
                  <button
                    onClick={() => !isOverLimit && onSelect(company)}
                    disabled={isOverLimit}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                      isOverLimit
                        ? "cursor-not-allowed border-muted bg-muted/30 opacity-60 dark:border-muted/30 dark:bg-muted/10"
                        : isSelected
                          ? "border-brand-blue bg-brand-blue/5 shadow-md ring-1 ring-brand-blue/20"
                          : "border-brand-blue/30 bg-card hover:border-brand-blue hover:bg-muted/50 dark:border-brand-blue/30 dark:bg-card dark:hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                        isSelected ? "bg-white" : "bg-muted"
                      }`}
                    >
                      <Image
                        src={logoSrc}
                        alt={company.displayName || company.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{company.displayName || company.name}</p>
                    </div>
                  </button>
                  {isOverLimit && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-50 p-3 text-sm dark:border-amber-400/30 dark:bg-amber-950/30">
                      <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{t("checkout.ozone_limit_reason")}</span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-muted-foreground">{t("checkout.ozone_limit_solutions")}</p>
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Scissors className="h-3.5 w-3.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                          <span>{t("checkout.ozone_limit_solution_split")}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <PackageMinus className="h-3.5 w-3.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                          <span>{t("checkout.ozone_limit_solution_reduce")}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                          <span>{t("checkout.ozone_limit_solution_support")}</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("checkout.back")}
          </Button>
          <Button
            onClick={onNext}
            size="lg"
            disabled={!selected}
            className="gap-2 bg-brand-blue px-8 hover:bg-brand-blue/90"
          >
            {t("checkout.continue")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
