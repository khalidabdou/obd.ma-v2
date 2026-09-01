"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import { orderService } from "@/services/order.service";
import { customerInfoService } from "@/services/customer-info.service";
import { customerAuthService } from "@/services/customer-auth.service";
import type { CustomerFormData, DeliveryCompany } from "@/app/(Costumer-Interface-v2)/checkout/page";
import type { CartItem } from "@/Context/CartContext";
import type { CheckoutOptions, CheckoutPaymentMethod } from "@/services/order.service";
import { ArrowLeft, Loader2, AlertCircle, Check } from "lucide-react";
import PayPalHostedFields from "@components/v2/checkout/PayPalHostedFields";
import { NEXT_PUBLIC_PAYPAL_CLIENT_ID } from "@/utils/variables";

interface PaymentStepProps {
  orderId: string;
  cartItems: CartItem[];
  subtotal: number;
  customerData: CustomerFormData;
  selectedDelivery: DeliveryCompany | null;
  checkoutOptions?: CheckoutOptions;
  isLoggedIn: boolean;
  onBack: () => void;
  onSuccess: (orderId: string, paymentMethod: PaymentMethod) => void;
  onFailure?: (errorMessage: string) => void;
  onLoggedIn?: () => void;
}

type PaymentMethod = CheckoutPaymentMethod;

export default function PaymentStep({
  orderId,
  cartItems,
  subtotal,
  customerData,
  selectedDelivery,
  checkoutOptions,
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
  const [cardOrderId, setCardOrderId] = useState<string | null>(null);
  const [cardAmount, setCardAmount] = useState<string>("");

  const deliveryPrice = selectedDelivery?.fee ?? 0;
  const total = subtotal + deliveryPrice;
  const availableMethods = selectedDelivery?.paymentMethods ?? [];

  // Check for returning PayPal approval on mount
  useEffect(() => {
    const pendingPayPal = sessionStorage.getItem("obd_paypal_pending");
    // Card payments now use Hosted Fields (no redirect), so only handle PayPal
    if (pendingPayPal) {
      try {
        const { orderId: ppOrderId, paypalOrderId, deliveryCompanyId, latitude, longitude, receiverPhone } = JSON.parse(pendingPayPal);
        sessionStorage.removeItem("obd_paypal_pending");
        // Auto-capture after user returns from PayPal approval
        (async () => {
          setLoading(true);
          setError("");
          try {
            const capRes = await orderService.capturePayPalPayment(
              ppOrderId,
              new Date().toISOString(),
              paypalOrderId,
              deliveryCompanyId,
              latitude,
              longitude,
              receiverPhone
            );
            if (capRes.success) {
              onSuccess(String(capRes.data.orderId ?? ppOrderId), "paypal");
            } else {
              const msg = t("checkout.payment_failed");
              if (onFailure) {
                onFailure(msg);
              } else {
                setError(msg);
              }
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
        sessionStorage.removeItem("obd_paypal_pending");
      }
    }
  }, []);

  // Reset card-specific state when user switches payment method so the old
  // method's UI (e.g. hosted fields) doesn't "stack" on the new selection.
  useEffect(() => {
    setCardOrderId(null);
    setError("");
  }, [method]);

  useEffect(() => {
    if (method && !availableMethods.includes(method)) setMethod(null);
  }, [availableMethods, method]);

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
        country: customerData.country,
        address: customerData.address,
        city: customerData.city,
        cityId: customerData.cityId || 0,
        deliveryName: selectedDelivery?.name,
      };

      if (customerData.createAccount && customerData.password) {
        try {
          // Create account — this sets auth cookies (auto-login)
          await customerInfoService.createAccount({
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            email: customerData.email,
            password: customerData.password,
            countryCode: customerData.countryCode || "+212",
            phoneNumber: customerData.phoneNumber,
            country: customerData.country,
            withCart: true,
          });
          // Verify new auth state
          try {
            await customerAuthService.checkCustomerToken();
            if (onLoggedIn) onLoggedIn();
          } catch (e) {
            console.warn("Failed to verify auth after account creation:", e);
          }
        } catch (accountErr: any) {
          // If email or phone already exists, continue checkout without throwing error
          console.warn("Account creation skipped (email or phone may already exist):", accountErr);
        }
      }

      // Save or update customer shipping info
      try {
        await customerInfoService.createCustomerInfo(infoPayload);
      } catch (infoErr: any) {
        try {
          await customerInfoService.updateCustomerInfo(infoPayload);
        } catch (updateErr) {
          console.warn("Customer info update skipped/failed, proceeding with order:", updateErr);
        }
      }

      return true;
    } catch (err) {
      console.warn("saveCustomerInfo encountered an error, continuing order placement:", err);
      return true;
    }
  }, [customerData, isLoggedIn, onLoggedIn, selectedDelivery?.name]);

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
        selectedDelivery?.id,
        customerData.latitude,
        customerData.longitude,
        isLoggedIn ? customerData.phoneNumber : undefined
      );
      if (res.success) {
        const finalOrderId = String(res.data.orderId ?? orderId);
        // Update order status to waiting (non-critical, don't fail if this fails)
        try {
          await orderService.updateOrderStatus(finalOrderId, "waiting");
        } catch (statusErr) {
          console.error("Failed to update order status to waiting:", statusErr);
        }
        onSuccess(finalOrderId, "CRBT");
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

      if (!selectedDelivery) throw new Error("Delivery method is required");
      const res = await orderService.createPayPalOrder(orderId, selectedDelivery.id);
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
              latitude: customerData.latitude,
              longitude: customerData.longitude,
              receiverPhone: isLoggedIn ? customerData.phoneNumber : undefined,
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
          selectedDelivery?.id,
          customerData.latitude,
          customerData.longitude,
          isLoggedIn ? customerData.phoneNumber : undefined
        );
        if (capRes.success) {
          onSuccess(String(capRes.data.orderId ?? orderId), "paypal");
        } else {
          const msg = t("checkout.payment_failed");
          if (onFailure) {
            onFailure(msg);
          } else {
            setError(msg);
          }
        }
      } else {
        const msg = t("checkout.payment_failed");
        if (onFailure) {
          onFailure(msg);
        } else {
          setError(msg);
        }
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

  // Card payment — Step 1: create PayPal order, then show Hosted Fields
  const handleCard = async () => {
    setLoading(true);
    setError("");
    try {
      const infoSaved = await saveCustomerInfo();
      if (!infoSaved) return;

      if (!selectedDelivery) throw new Error("Delivery method is required");
      const res = await orderService.createCardOrder(orderId, selectedDelivery.id);
      if (res.success && res.data.card_order_id) {
        setCardOrderId(res.data.card_order_id);
        if (!res.data.card_amount) throw new Error("Card amount was not returned by the server");
        setCardAmount(res.data.card_amount);
      } else {
        const msg = t("checkout.payment_failed");
        if (onFailure) {
          onFailure(msg);
        } else {
          setError(msg);
        }
      }
    } catch (err) {
      console.error("Card order creation failed:", err);
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

  // Card payment — Step 2: after Hosted Fields approves, capture payment
  const handleCardApprove = async (paypalOrderId: string) => {
    setLoading(true);
    setError("");
    try {
      const capRes = await orderService.captureCardPayment(
        orderId,
        new Date().toISOString(),
        paypalOrderId,
        selectedDelivery?.id,
        customerData.latitude,
        customerData.longitude,
        isLoggedIn ? customerData.phoneNumber : undefined
      );
      if (capRes.success) {
        onSuccess(String(capRes.data.orderId ?? orderId), "card");
      } else {
        const msg = t("checkout.payment_failed");
        if (onFailure) {
          onFailure(msg);
        } else {
          setError(msg);
        }
      }
    } catch (err) {
      console.error("Card capture failed:", err);
      const msg = parseErrorMessage(err, "checkout.payment_failed");
      if (onFailure) {
        onFailure(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      setCardOrderId(null);
    }
  };

  const handleBankTransfer = async () => {
    setLoading(true);
    setError("");
    try {
      const infoSaved = await saveCustomerInfo();
      if (!infoSaved) return;
      if (!selectedDelivery) throw new Error("Delivery method is required");
      const response = await orderService.createBankTransferOrder(
        orderId,
        new Date().toISOString(),
        selectedDelivery.id,
        customerData.latitude,
        customerData.longitude,
        isLoggedIn ? customerData.phoneNumber : undefined
      );
      if (!response.success) throw new Error(t("checkout.order_failed"));
      onSuccess(String(response.data.orderId ?? orderId), "bank_transfer");
    } catch (err) {
      const message = parseErrorMessage(err, "checkout.order_failed");
      if (onFailure) onFailure(message);
      else setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
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
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">{t("checkout.payment_title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("checkout.payment_desc")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left: Payment Methods */}
            <div className="rounded-2xl border border-brand-blue/50 bg-card p-6 shadow-xl dark:border-brand-blue/40 sm:p-8">
              <h3 className="mb-4 text-lg font-semibold">{t("checkout.payment_method")}</h3>

              <div className="grid gap-3">
                {/* COD */}
                <button
                  onClick={() => setMethod("CRBT")}
                  disabled={!availableMethods.includes("CRBT")}
                  className={`${availableMethods.includes("CRBT") ? "flex" : "hidden"} items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                    method === "CRBT"
                      ? "border-brand-red bg-brand-red/5 shadow-md ring-1 ring-brand-red/20"
                      : "border-brand-blue/30 bg-card hover:border-brand-red hover:bg-muted/50 dark:border-brand-blue/30 dark:bg-card dark:hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      method === "CRBT"
                        ? "bg-brand-red text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Image
                      src="/assets/icons/wallet-icon.svg"
                      alt=""
                      width={28}
                      height={28}
                      className={`h-7 w-7 ${method === "CRBT" ? "" : "dark:invert"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{t("checkout.cod")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("checkout.pay_on_delivery")}
                    </p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      method === "CRBT"
                        ? "border-brand-red bg-brand-red"
                        : "border-border"
                    }`}
                  >
                    {method === "CRBT" && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => setMethod("paypal")}
                  disabled={!availableMethods.includes("paypal")}
                  className={`${availableMethods.includes("paypal") ? "flex" : "hidden"} items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                    method === "paypal"
                      ? "border-brand-red bg-brand-red/5 shadow-md ring-1 ring-brand-red/20"
                      : "border-brand-blue/30 bg-card hover:border-brand-red hover:bg-muted/50 dark:border-brand-blue/30 dark:bg-card dark:hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      method === "paypal"
                        ? "bg-brand-red text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Image
                      src="/assets/icons/paypal-icon.svg"
                      alt="PayPal"
                      width={28}
                      height={28}
                      className="h-7 w-7"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">PayPal</p>
                    <p className="text-sm text-muted-foreground">
                      {t("checkout.secure_online")}
                    </p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      method === "paypal"
                        ? "border-brand-red bg-brand-red"
                        : "border-border"
                    }`}
                  >
                    {method === "paypal" && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => setMethod("card")}
                  disabled={!availableMethods.includes("card")}
                  className={`${availableMethods.includes("card") ? "flex" : "hidden"} items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                    method === "card"
                      ? "border-brand-red bg-brand-red/5 shadow-md ring-1 ring-brand-red/20"
                      : "border-brand-blue/30 bg-card hover:border-brand-red hover:bg-muted/50 dark:border-brand-blue/30 dark:bg-card dark:hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      method === "card"
                        ? "bg-brand-red text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="flex -space-x-2">
                      <Image
                        src="/assets/icons/visa-icon.svg"
                        alt="Visa"
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full bg-white p-0.5"
                      />
                      <Image
                        src="/assets/icons/master-card-icon.svg"
                        alt="Mastercard"
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full bg-white p-0.5"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{t("checkout.card")}</p>
                    <p className="text-sm text-muted-foreground">Visa / Mastercard</p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      method === "card"
                        ? "border-brand-red bg-brand-red"
                        : "border-border"
                    }`}
                  >
                    {method === "card" && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("bank_transfer")}
                  disabled={!availableMethods.includes("bank_transfer")}
                  className={`${availableMethods.includes("bank_transfer") ? "flex" : "hidden"} items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                    method === "bank_transfer"
                      ? "border-brand-red bg-brand-red/5 shadow-md ring-1 ring-brand-red/20"
                      : "border-brand-blue/30 bg-card hover:border-brand-red hover:bg-muted/50 dark:border-brand-blue/30 dark:bg-card dark:hover:bg-white/5"
                  }`}
                >
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${method === "bank_transfer" ? "bg-brand-red" : "bg-muted"}`}>
                    <Image src="/assets/icons/wallet-icon.svg" alt="" width={28} height={28} className={`h-7 w-7 ${method === "bank_transfer" ? "" : "dark:invert"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{t("checkout.bank_transfer")}</p>
                    <p className="text-sm text-muted-foreground">{t("checkout.bank_transfer_desc")}</p>
                  </div>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${method === "bank_transfer" ? "border-brand-red bg-brand-red" : "border-border"}`}>
                    {method === "bank_transfer" && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>
              </div>

              {method === "bank_transfer" && checkoutOptions?.bankDetails && (
                <div className="mt-4 space-y-1 rounded-xl border border-border bg-muted/50 p-4 text-sm">
                  <p className="font-semibold">{checkoutOptions.bankDetails.bankName}</p>
                  <p>{checkoutOptions.bankDetails.accountHolder}</p>
                  {checkoutOptions.bankDetails.accountNumber && <p>{t("checkout.account_number")}: {checkoutOptions.bankDetails.accountNumber}</p>}
                  {checkoutOptions.bankDetails.iban && <p>IBAN: {checkoutOptions.bankDetails.iban}</p>}
                  {checkoutOptions.bankDetails.swift && <p>SWIFT: {checkoutOptions.bankDetails.swift}</p>}
                  {checkoutOptions.bankDetails.instructions && <p className="pt-1 text-muted-foreground">{checkoutOptions.bankDetails.instructions}</p>}
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {cardOrderId && NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                <div className="mt-6">
                  <PayPalHostedFields
                    clientId={NEXT_PUBLIC_PAYPAL_CLIENT_ID}
                    amount={cardAmount}
                    currency="USD"
                    paypalOrderId={cardOrderId}
                    onApprove={handleCardApprove}
                    onError={(msg) => {
                      if (onFailure) {
                        onFailure(msg);
                      } else {
                        setError(msg);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      setCardOrderId(null);
                      setError("");
                    }}
                    className="mt-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("checkout.back")}
                  </button>
                </div>
              ) : (
              <div className="mt-6 flex items-center justify-between">
                <Button variant="outline" onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("checkout.back")}
                </Button>
                <Button
                  onClick={() => {
                    if (method === "CRBT") handleCOD();
                    else if (method === "paypal") handlePayPal();
                    else if (method === "card") handleCard();
                    else if (method === "bank_transfer") handleBankTransfer();
                  }}
                  size="lg"
                  disabled={!method || loading}
                  className="gap-2 bg-brand-red px-8 hover:bg-brand-red/90"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {method === "CRBT" || method === "bank_transfer" ? t("checkout.place_order") : t("checkout.pay_now")}
                </Button>
              </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="border-brand-blue/50 dark:border-brand-blue/40">
                <CardContent className="space-y-4 p-6">
                  <h3 className="text-lg font-bold">{t("checkout.summary_title")}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                      <span className="font-medium">{subtotal.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("cart.shipping")}</span>
                      <span className="font-medium">
                        {deliveryPrice === 0 ? t("checkout.free") : `${deliveryPrice.toFixed(2)} MAD`}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>{t("cart.total")}</span>
                      <span className="text-brand-blue">{total.toFixed(2)} MAD</span>
                    </div>
                  </div>

                  {selectedDelivery && (
                    <div className="rounded-xl border border-brand-blue/30 bg-muted/50 p-3 text-sm dark:border-brand-blue/30">
                      <p className="text-muted-foreground">{t("checkout.delivery_company")}</p>
                      <p className="font-medium text-foreground">
                        {selectedDelivery.displayName || selectedDelivery.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
