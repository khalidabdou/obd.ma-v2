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

const stepOrder: CheckoutStep[] = ["info", "delivery", "payment"];

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, idx) => {
        const isCompleted = idx < currentIdx || currentStep === "success";
        const isActive = s.key === currentStep && currentStep !== "success";

        return (
          <div key={s.key} className="flex items-center gap-2 sm:gap-4">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all sm:h-12 sm:w-12 ${
                  isCompleted
                    ? "border-brand-blue bg-brand-blue text-white"
                    : isActive
                    ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs font-medium sm:text-sm ${
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
                className={`hidden h-0.5 w-12 sm:block sm:w-20 lg:w-32 ${
                  isCompleted ? "bg-brand-blue" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
