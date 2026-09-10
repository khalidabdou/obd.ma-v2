"use client";

import { Check, Package, Truck, CreditCard } from "lucide-react";
import type { CheckoutStep } from "@/app/(Costumer-Interface-v2)/checkout/page";

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

const steps: { key: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { key: "delivery", label: "Livraison", icon: Truck },
  { key: "info", label: "Infos", icon: Package },
  { key: "payment", label: "Paiement", icon: CreditCard },
];

const stepOrder: CheckoutStep[] = ["delivery", "info", "payment", "success", "failure"];

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border border-brand-blue/40 bg-card px-3 py-3 shadow-sm dark:border-brand-blue/40 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between">
          {steps.map((s, idx) => {
            const isCompleted = idx < currentIdx || currentStep === "success";
            const isActive = s.key === currentStep && currentStep !== "success";

            return (
              <div key={s.key} className={`flex items-start ${idx < steps.length - 1 ? "flex-1" : ""}`}>
                {/* Step circle */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 sm:h-9 sm:w-9 ${
                      isCompleted
                        ? "border-brand-blue bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                        : isActive
                        ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-brand-blue/30 ring-offset-2 ring-offset-card animate-pulse" />
                    )}
                    {isCompleted ? (
                      <Check className="h-4 w-4 transition-transform duration-300" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold leading-none transition-colors duration-300 sm:text-xs ${
                      isCompleted || isActive
                        ? "text-brand-blue"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`mx-1.5 mt-4 flex-1 border-t-2 border-dashed sm:mx-2 sm:mt-[18px] ${
                      isCompleted ? "border-brand-blue" : "border-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
