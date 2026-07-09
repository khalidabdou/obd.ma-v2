"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import { orderService } from "@/services/order.service";
import { customerInfoService } from "@/services/customer-info.service";
import type { CustomerFormData, DeliveryCompany } from "@/app/(Costumer-Interface-v2)/checkout/page";
import type { CartItem } from "@/Context/CartContext";
import { ArrowLeft, Loader2, CreditCard, Truck, Wallet } from "lucide-react";

interface PaymentStepProps {
  orderId: string;
  cartItems: CartItem[];
  subtotal: number;
  customerData: CustomerFormData;
  selectedDelivery: DeliveryCompany | null;
  isLoggedIn: boolean;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

type PaymentMethod = "COD" | "paypal" | "card";

const DELIVERY_PRICE = 35; // Will be overridden by API in production

export default function PaymentStep({
  orderId,
  cartItems,
  subtotal,
  customerData,
  selectedDelivery,
  isLoggedIn,
  onBack,
  onSuccess,
}: PaymentStepProps) {
  const { t } = useTranslation();
  const { refreshCart, addToCart } = useCart();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const total = subtotal + DELIVERY_PRICE;

  // Save customer info for guests before proceeding
  const saveCustomerInfo = useCallback(async () => {
    if (isLoggedIn) return true;
    try {
      // Create account if requested
      if (customerData.createAccount && customerData.password) {
        await customerInfoService.createAccount({
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          password: customerData.password,
          countryCode: "+212",
          phoneNumber: customerData.phoneNumber,
          withCart: true,
        });
        // Account creation logs the user in and clears the guest customer_id cookie.
        // Save the shipping details against the new account.
        await customerInfoService.createCustomerInfo({
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phoneNumber: customerData.phoneNumber,
          address: customerData.address,
          city: customerData.city,
          cityId: customerData.cityId || 0,
        });
      } else {
        // Just save info as guest
        await customerInfoService.createCustomerInfo({
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phoneNumber: customerData.phoneNumber,
          address: customerData.address,
          city: customerData.city,
          cityId: customerData.cityId || 0,
        });
      }
      return true;
    } catch (err) {
      console.error("Failed to save customer info:", err);
      return true; // Continue anyway - backend will create guest on order
    }
  }, [customerData, isLoggedIn]);

  // COD order
  const handleCOD = async () => {
    setLoading(true);
    setError("");
    try {
      await saveCustomerInfo();
      // Sync cart with backend before creating order
      await refreshCart();
      const res = await orderService.createCODOrder(
        orderId,
        new Date().toISOString(),
        selectedDelivery?.id
      );
      if (res.success) {
        const finalOrderId = String(res.data.orderId ?? orderId);
        // Update order status to waiting
        await orderService.updateOrderStatus(finalOrderId, "waiting");
        onSuccess(finalOrderId);
      } else {
        setError(t("checkout.order_failed"));
      }
    } catch (err) {
      console.error("COD order failed:", err);
      setError(t("checkout.order_failed"));
    } finally {
      setLoading(false);
    }
  };

  // PayPal payment
  const handlePayPal = async () => {
    setLoading(true);
    setError("");
    try {
      await saveCustomerInfo();
      await refreshCart();
      const res = await orderService.createPayPalOrder(orderId);
      if (res.success && res.data.paypal_order_id) {
        // In a real implementation, this would open the PayPal popup/redirect
        // For now, simulate capture
        const capRes = await orderService.capturePayPalPayment(
          orderId,
          new Date().toISOString(),
          res.data.paypal_order_id,
          selectedDelivery?.id
        );
        if (capRes.success) {
          onSuccess(String(capRes.data.orderId ?? orderId));
        } else {
          setError(t("checkout.payment_failed"));
        }
      } else {
        setError(t("checkout.payment_failed"));
      }
    } catch (err) {
      console.error("PayPal payment failed:", err);
      setError(t("checkout.payment_failed"));
    } finally {
      setLoading(false);
    }
  };

  // Card payment
  const handleCard = async () => {
    setLoading(true);
    setError("");
    try {
      await saveCustomerInfo();
      await refreshCart();
      const res = await orderService.createCardOrder(orderId);
      if (res.success && res.data.card_order_id) {
        const capRes = await orderService.captureCardPayment(
          orderId,
          new Date().toISOString(),
          res.data.card_order_id,
          selectedDelivery?.id
        );
        if (capRes.success) {
          onSuccess(String(capRes.data.orderId ?? orderId));
        } else {
          setError(t("checkout.payment_failed"));
        }
      } else {
        setError(t("checkout.payment_failed"));
      }
    } catch (err) {
      console.error("Card payment failed:", err);
      setError(t("checkout.payment_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{t("checkout.payment_title")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("checkout.payment_desc")}
        </p>
      </div>

      {/* Order Summary */}
      <Card className="mb-6 border-border dark:border-white/10">
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.subtotal")}</span>
            <span className="font-medium">{subtotal.toFixed(2)} MAD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.shipping")}</span>
            <span className="font-medium">{DELIVERY_PRICE.toFixed(2)} MAD</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-bold">{t("cart.total")}</span>
            <span className="text-lg font-bold text-brand-blue">
              {total.toFixed(2)} MAD
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* COD */}
        <button
          onClick={() => setMethod("COD")}
          className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${
            method === "COD"
              ? "border-brand-blue bg-brand-blue/5 shadow-md"
              : "border-border bg-card hover:border-brand-blue/30 dark:border-white/10 dark:bg-[#14161B]"
          }`}
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              method === "COD"
                ? "bg-brand-blue text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Truck className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold">{t("checkout.cod")}</span>
          <span className="text-xs text-muted-foreground">
            {t("checkout.pay_on_delivery")}
          </span>
        </button>

        {/* PayPal */}
        <button
          onClick={() => setMethod("paypal")}
          className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${
            method === "paypal"
              ? "border-brand-blue bg-brand-blue/5 shadow-md"
              : "border-border bg-card hover:border-brand-blue/30 dark:border-white/10 dark:bg-[#14161B]"
          }`}
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              method === "paypal"
                ? "bg-brand-blue text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Wallet className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold">PayPal</span>
          <span className="text-xs text-muted-foreground">
            {t("checkout.secure_online")}
          </span>
        </button>

        {/* Card */}
        <button
          onClick={() => setMethod("card")}
          className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${
            method === "card"
              ? "border-brand-blue bg-brand-blue/5 shadow-md"
              : "border-border bg-card hover:border-brand-blue/30 dark:border-white/10 dark:bg-[#14161B]"
          }`}
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              method === "card"
                ? "bg-brand-blue text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <CreditCard className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold">{t("checkout.card")}</span>
          <span className="text-xs text-muted-foreground">
            Visa / Mastercard
          </span>
        </button>
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-red-500">{error}</p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("checkout.back")}
        </Button>
        <Button
          onClick={() => {
            if (method === "COD") handleCOD();
            else if (method === "paypal") handlePayPal();
            else if (method === "card") handleCard();
          }}
          size="lg"
          disabled={!method || loading}
          className="gap-2 bg-brand-blue px-8 hover:bg-brand-blue/90"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : null}
          {method === "COD"
            ? t("checkout.place_order")
            : t("checkout.pay_now")}
        </Button>
      </div>
    </div>
  );
}
