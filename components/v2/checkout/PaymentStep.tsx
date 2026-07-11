"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import { orderService } from "@/services/order.service";
import { customerInfoService } from "@/services/customer-info.service";
import { customerAuthService } from "@/services/customer-auth.service";
import type { CustomerFormData, DeliveryCompany } from "@/app/(Costumer-Interface-v2)/checkout/page";
import type { CartItem } from "@/Context/CartContext";
import { ArrowLeft, Loader2, CreditCard, Truck, Wallet, AlertCircle } from "lucide-react";

const FALLBACK_DELIVERY_PRICE = 35;

interface PaymentStepProps {
  orderId: string;
  cartItems: CartItem[];
  subtotal: number;
  customerData: CustomerFormData;
  selectedDelivery: DeliveryCompany | null;
  isLoggedIn: boolean;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
  onFailure?: (errorMessage: string) => void;
  onLoggedIn?: () => void;
}

type PaymentMethod = "COD" | "paypal" | "card";

export default function PaymentStep({
  orderId,
  cartItems,
  subtotal,
  customerData,
  selectedDelivery,
  isLoggedIn,
  onBack,
  onSuccess,
  onFailure,
  onLoggedIn,
}: PaymentStepProps) {
  const { t } = useTranslation();
  const { refreshCart, addToCart } = useCart();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState<number>(FALLBACK_DELIVERY_PRICE);
  const [deliveryPriceLoading, setDeliveryPriceLoading] = useState(true);

  const total = subtotal + deliveryPrice;

  // Fetch dynamic delivery price from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await orderService.getDeliveryPrice();
        if (mounted && res.success && res.data) {
          const price = (res.data as any).deliveryPrice ?? (res.data as any).price ?? FALLBACK_DELIVERY_PRICE;
          setDeliveryPrice(Number(price));
        }
      } catch (err) {
        console.error("Failed to fetch delivery price, using fallback:", err);
      } finally {
        if (mounted) setDeliveryPriceLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Check for returning PayPal/card approval on mount
  useEffect(() => {
    const pendingPayPal = sessionStorage.getItem("obd_paypal_pending");
    const pendingCard = sessionStorage.getItem("obd_card_pending");
    const pending = pendingPayPal || pendingCard;
    const storageKey = pendingPayPal ? "obd_paypal_pending" : "obd_card_pending";

    if (pending) {
      try {
        const { orderId: ppOrderId, paypalOrderId, deliveryCompanyId } = JSON.parse(pending);
        sessionStorage.removeItem(storageKey);
        // Auto-capture after user returns from PayPal approval
        (async () => {
          setLoading(true);
          setError("");
          try {
            const capRes = pendingPayPal
              ? await orderService.capturePayPalPayment(
                  ppOrderId,
                  new Date().toISOString(),
                  paypalOrderId,
                  deliveryCompanyId
                )
              : await orderService.captureCardPayment(
                  ppOrderId,
                  new Date().toISOString(),
                  paypalOrderId,
                  deliveryCompanyId
                );
            if (capRes.success) {
              onSuccess(String(capRes.data.orderId ?? ppOrderId));
            } else {
              setError(t("checkout.payment_failed"));
            }
          } catch (err) {
            console.error("Capture after redirect failed:", err);
            const msg = parseErrorMessage(err, "checkout.payment_failed");
            if (onFailure) {
              onFailure(msg);
            } else {
              setError(msg);
            }
          } finally {
            setLoading(false);
          }
        })();
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, []);

  // Parse backend error message for user-friendly display
  const parseErrorMessage = useCallback((err: any, fallbackKey: string): string => {
    const backendMessage = err?.response?.data?.data?.error || err?.response?.data?.error;
    if (backendMessage && typeof backendMessage === "string") {
      return backendMessage;
    }
    if (err?.code === "ERR_NETWORK" || err?.code === "ECONNABORTED") {
      return t("checkout.network_error");
    }
    return t(fallbackKey);
  }, [t]);

  // Save customer info for guests before proceeding
  const saveCustomerInfo = useCallback(async (): Promise<boolean> => {
    if (isLoggedIn) return true;
    try {
      const infoPayload = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phoneCode: customerData.countryCode || "+212",
        phoneNumber: customerData.phoneNumber,
        address: customerData.address,
        city: customerData.city,
        cityId: customerData.cityId || 0,
      };

      if (customerData.createAccount && customerData.password) {
        // Create account — this sets auth cookies (auto-login)
        await customerInfoService.createAccount({
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          password: customerData.password,
          countryCode: customerData.countryCode || "+212",
          phoneNumber: customerData.phoneNumber,
          withCart: true,
        });
        // Account creation logs the user in and clears the guest customer_id cookie.
        // Verify the new auth state so subsequent calls use the new identity.
        try {
          await customerAuthService.checkCustomerToken();
          if (onLoggedIn) onLoggedIn();
        } catch (e) {
          console.error("Failed to verify new auth after account creation:", e);
        }
        // Save the shipping details against the new account.
        try {
          await customerInfoService.createCustomerInfo(infoPayload);
        } catch (infoErr: any) {
          // If info already exists (e.g. guest had info), fall back to update
          const msg = infoErr?.response?.data?.message || infoErr?.response?.data?.data?.error || "";
          if (msg.toLowerCase().includes("already exists")) {
            await customerInfoService.updateCustomerInfo(infoPayload);
          } else {
            throw infoErr;
          }
        }
      } else {
        // Just save info as guest
        try {
          await customerInfoService.createCustomerInfo(infoPayload);
        } catch (infoErr: any) {
          // If info already exists from a previous attempt, fall back to update
          const msg = infoErr?.response?.data?.message || infoErr?.response?.data?.data?.error || "";
          if (msg.toLowerCase().includes("already exists")) {
            await customerInfoService.updateCustomerInfo(infoPayload);
          } else {
            throw infoErr;
          }
        }
      }
      return true;
    } catch (err) {
      console.error("Failed to save customer info:", err);
      setError(parseErrorMessage(err, "checkout.customer_info_failed"));
      return false;
    }
  }, [customerData, isLoggedIn, parseErrorMessage, onLoggedIn]);

  // COD order
  const handleCOD = async () => {
    setLoading(true);
    setError("");
    try {
      const infoSaved = await saveCustomerInfo();
      if (!infoSaved) return;

      const res = await orderService.createCODOrder(
        orderId,
        new Date().toISOString(),
        selectedDelivery?.id
      );
      if (res.success) {
        const finalOrderId = String(res.data.orderId ?? orderId);
        // Update order status to waiting (non-critical, don't fail if this fails)
        try {
          await orderService.updateOrderStatus(finalOrderId, "waiting");
        } catch (statusErr) {
          console.error("Failed to update order status to waiting:", statusErr);
        }
        onSuccess(finalOrderId);
      } else {
        setError(t("checkout.order_failed"));
      }
    } catch (err) {
      console.error("COD order failed:", err);
      const msg = parseErrorMessage(err, "checkout.order_failed");
      if (onFailure) {
        onFailure(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // PayPal payment
  const handlePayPal = async () => {
    setLoading(true);
    setError("");
    try {
      const infoSaved = await saveCustomerInfo();
      if (!infoSaved) return;

      const res = await orderService.createPayPalOrder(orderId);
      if (res.success && res.data.paypal_order_id) {
        const paypalOrderId = res.data.paypal_order_id;
        const approvalUrl = res.data.approval_url;

        if (approvalUrl) {
          // Store pending PayPal details so we can capture when user returns
          sessionStorage.setItem(
            "obd_paypal_pending",
            JSON.stringify({
              orderId,
              paypalOrderId,
              deliveryCompanyId: selectedDelivery?.id,
            })
          );
          // Redirect to PayPal for buyer approval
          window.location.href = approvalUrl;
          return;
        }

        // Fallback: no approval URL (shouldn't happen), try capture directly
        const capRes = await orderService.capturePayPalPayment(
          orderId,
          new Date().toISOString(),
          paypalOrderId,
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
      const msg = parseErrorMessage(err, "checkout.payment_failed");
      if (onFailure) {
        onFailure(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Card payment
  const handleCard = async () => {
    setLoading(true);
    setError("");
    try {
      const infoSaved = await saveCustomerInfo();
      if (!infoSaved) return;

      const res = await orderService.createCardOrder(orderId);
      if (res.success && res.data.card_order_id) {
        const cardOrderId = res.data.card_order_id;
        const approvalUrl = res.data.approval_url;

        if (approvalUrl) {
          sessionStorage.setItem(
            "obd_card_pending",
            JSON.stringify({
              orderId,
              paypalOrderId: cardOrderId,
              deliveryCompanyId: selectedDelivery?.id,
            })
          );
          window.location.href = approvalUrl;
          return;
        }

        // Fallback: no approval URL, try capture directly
        const capRes = await orderService.captureCardPayment(
          orderId,
          new Date().toISOString(),
          cardOrderId,
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
      const msg = parseErrorMessage(err, "checkout.payment_failed");
      if (onFailure) {
        onFailure(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {loading && (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
          <p className="text-lg font-medium text-muted-foreground">
            {t("checkout.processing_payment")}
          </p>
        </div>
      )}

      {!loading && (
        <>
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
            <span className="font-medium">
              {deliveryPriceLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                `${deliveryPrice.toFixed(2)} MAD`
              )}
            </span>
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
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
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
        </>
      )}
    </div>
  );
}
