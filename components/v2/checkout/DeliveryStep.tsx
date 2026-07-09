"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/Context/LanguageContext";
import { orderService } from "@/services/order.service";
import type { DeliveryCompany } from "@/app/(Costumer-Interface-v2)/checkout/page";
import { ArrowRight, ArrowLeft, Truck, Loader2, Check } from "lucide-react";

interface DeliveryStepProps {
  selected: DeliveryCompany | null;
  onSelect: (company: DeliveryCompany) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function DeliveryStep({
  selected,
  onSelect,
  onBack,
  onNext,
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
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t("checkout.delivery_title")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("checkout.delivery_desc")}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-border p-8 text-center text-muted-foreground">
          <Truck className="mx-auto mb-3 h-10 w-10" />
          <p>{t("checkout.no_delivery")}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {companies.map((company) => {
            const isSelected = selected?.id === company.id;
            return (
              <button
                key={company.id}
                onClick={() => onSelect(company)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-brand-blue bg-brand-blue/5 shadow-md"
                    : "border-border bg-card hover:border-brand-blue/30 dark:border-white/10 dark:bg-[#14161B]"
                }`}
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                    isSelected
                      ? "bg-brand-blue text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isSelected ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Truck className="h-5 w-5" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold">{company.displayName || company.name}</p>
                  <p className="text-sm text-muted-foreground">{company.name}</p>
                </div>
              </button>
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
  );
}
