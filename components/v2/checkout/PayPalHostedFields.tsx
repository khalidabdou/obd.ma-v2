"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, Lock, CreditCard } from "lucide-react";
import { useTranslation } from "@/Context/LanguageContext";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalCardButtonProps {
  clientId: string;
  amount: string;
  currency: string;
  paypalOrderId: string;
  onApprove: (orderId: string) => void;
  onError: (message: string) => void;
}

export default function PayPalCardButton({
  clientId,
  amount,
  currency,
  paypalOrderId,
  onApprove,
  onError,
}: PayPalCardButtonProps) {
  const { t } = useTranslation();
  const cardFieldRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const sdkLoadedRef = useRef(false);
  const orderIdRef = useRef(paypalOrderId);
  const onApproveRef = useRef(onApprove);
  const onErrorRef = useRef(onError);

  orderIdRef.current = paypalOrderId;
  onApproveRef.current = onApprove;
  onErrorRef.current = onError;

  useEffect(() => {
    if (sdkLoadedRef.current) return;
    sdkLoadedRef.current = true;

    const initCardFields = () => {
      // 1. Try PayPal Hosted CardFields first
      if (window.paypal?.CardFields) {
        try {
          const cardField = window.paypal.CardFields({
            createOrder: () => {
              return Promise.resolve(orderIdRef.current);
            },
            onApprove: (data: any) => {
              onApproveRef.current(data.orderID || orderIdRef.current);
            },
            onError: (err: any) => {
              console.error("PayPal CardFields error:", err);
              const msg = err?.message || t("checkout.payment_failed");
              setError(msg);
              onErrorRef.current(msg);
            },
            style: {
              input: {
                "font-size": "16px",
                "font-family": "inherit",
                color: "#1E262D",
                transition: "color 0.3s ease",
              },
              ":focus": {
                color: "#278CD9",
              },
              ".invalid": {
                color: "#ED312B",
              },
              ".valid": {
                color: "#35C191",
              },
            },
          });

          if (cardField.isEligible()) {
            cardFieldRef.current = cardField;

            cardField.NumberField({
              placeholder: t("checkout.card_number_placeholder") || "1234 5678 9012 3456",
            }).render("#paypal-card-number");

            cardField.ExpiryField({
              placeholder: t("checkout.card_expiry_placeholder") || "MM/YY",
            }).render("#paypal-card-expiry");

            cardField.CVVField({
              placeholder: t("checkout.card_cvv_placeholder") || "123",
            }).render("#paypal-card-cvv");

            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn("PayPal CardFields ineligible or failed, trying fallback buttons:", err);
        }
      }

      // 2. Fallback to PayPal Card / Smart Payment Button if CardFields is ineligible on the merchant account
      if (window.paypal?.Buttons) {
        try {
          const cardFunding = window.paypal.FUNDING?.CARD;
          const cardButton = window.paypal.Buttons({
            fundingSource: cardFunding,
            style: {
              layout: "vertical",
              color: "black",
              shape: "rect",
              label: "pay",
            },
            createOrder: () => {
              return Promise.resolve(orderIdRef.current);
            },
            onApprove: (data: any) => {
              onApproveRef.current(data.orderID || orderIdRef.current);
            },
            onError: (err: any) => {
              console.error("PayPal Card Button error:", err);
              const msg = err?.message || t("checkout.payment_failed");
              setError(msg);
              onErrorRef.current(msg);
            },
          });

          setUseFallback(true);
          setLoading(false);
          setTimeout(() => {
            const container = document.getElementById("paypal-card-button-container");
            if (container) {
              container.innerHTML = "";
              cardButton.render("#paypal-card-button-container");
            }
          }, 50);
          return;
        } catch (err: any) {
          console.error("PayPal Card Button init failed:", err);
        }
      }

      // If both fail:
      setError(t("checkout.card_load_failed"));
      setLoading(false);
    };

    const existingScript = document.querySelector(
      `script[data-paypal-sdk]`
    ) as HTMLScriptElement | null;

    if (existingScript && window.paypal) {
      initCardFields();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=card-fields,buttons&currency=${currency}&intent=capture`;
    script.setAttribute("data-paypal-sdk", "true");
    script.async = true;
    script.onload = () => initCardFields();
    script.onerror = () => {
      setError(t("checkout.card_load_failed"));
      setLoading(false);
    };
    document.body.appendChild(script);
  }, [clientId, currency, t]);

  const handleSubmit = async () => {
    if (!cardFieldRef.current || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      await cardFieldRef.current.submit({
        cardholderName: cardholderName.trim() || undefined,
      });
    } catch (err: any) {
      console.error("Card payment submit failed:", err);
      const msg =
        err?.message ||
        err?.data?.errors?.[0]?.description ||
        t("checkout.payment_failed");
      setError(msg);
      onErrorRef.current(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
          <span className="text-sm text-muted-foreground">
            {t("checkout.loading_card_form")}
          </span>
        </div>
      )}

      {!loading && !error && useFallback && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CreditCard className="h-4 w-4 text-brand-blue" />
            <span>Pay with Credit / Debit Card (PayPal)</span>
          </div>
          <div id="paypal-card-button-container" className="min-h-[50px] w-full" />
        </div>
      )}

      {!loading && !error && !useFallback && (
        <>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-brand-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("checkout.card_number")}
              </label>
              <div
                id="paypal-card-number"
                className="h-11 rounded-lg border border-border bg-background px-3 flex items-center"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("checkout.card_expiry")}
                </label>
                <div
                  id="paypal-card-expiry"
                  className="h-11 rounded-lg border border-border bg-background px-3 flex items-center"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("checkout.card_cvv")}
                </label>
                <div
                  id="paypal-card-cvv"
                  className="h-11 rounded-lg border border-border bg-background px-3 flex items-center"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3 font-semibold text-white transition-all hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {submitting ? t("checkout.processing_payment") : `${t("checkout.pay_now")} ${amount} ${currency}`}
          </button>
        </>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        {t("checkout.secure_payment")}
      </p>
    </div>
  );
}

