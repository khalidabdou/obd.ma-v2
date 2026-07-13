"use client";

import { Check, Package, Truck, CreditCard } from "lucide-react";
import type { CheckoutStep } from "@/app/(Costumer-Interface-v2)/checkout/page";

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

const steps: { key: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { key: "info", label: "Infos", icon: Package },
  { key: "delivery", label: "Livraison", icon: Truck },
  { key: "payment", label: "Paiement", icon: CreditCard },
];

const stepOrder: CheckoutStep[] = ["info", "delivery", "payment", "success", "failure"];

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-brand-blue/50 bg-card p-4 shadow-sm dark:border-brand-blue/40 sm:p-6">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isCompleted = idx < currentIdx || currentStep === "success";
            const isActive = s.key === currentStep && currentStep !== "success";

            return (
              <div key={s.key} className={`flex items-center ${idx < steps.length - 1 ? "flex-1" : ""}`}>
                {/* Step circle */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 sm:h-12 sm:w-12 ${
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
                      <Check className="h-5 w-5 transition-transform duration-300" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold transition-colors duration-300 sm:text-sm ${
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
                  <div className="relative mx-2 h-1 flex-1 overflow-hidden rounded-full bg-border sm:mx-3">
                    <div
                      className={`absolute inset-y-0 start-0 rounded-full bg-brand-blue transition-all duration-700 ease-out ${
                        isCompleted ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
