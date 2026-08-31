"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@components/v2/layout/Container";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import { customerAuthService } from "@/services/customer-auth.service";
import { customerInfoService } from "@/services/customer-info.service";
import type { CustomerInfoResponse } from "@/services/customer-info.service";
import { getCountryByPhoneCode } from "@/locales/countries";
import CheckoutProgress from "@components/v2/checkout/CheckoutProgress";
import CustomerInfoStep from "@components/v2/checkout/CustomerInfoStep";
import DeliveryStep from "@components/v2/checkout/DeliveryStep";
import PaymentStep from "@components/v2/checkout/PaymentStep";
import OrderSuccess from "@components/v2/checkout/OrderSuccess";
import OrderFailure from "@components/v2/checkout/OrderFailure";
import { Loader2 } from "lucide-react";
import { useCheckoutOptions } from "@/hooks/v2/queries/useCheckoutOptions";
import type { CheckoutDeliveryOption, CheckoutOptions, CheckoutPaymentMethod } from "@/services/order.service";

export type CheckoutStep = "delivery" | "info" | "payment" | "success" | "failure";

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  country: string;
  address: string;
  city: string;
  cityId: number;
  password?: string;
  createAccount?: boolean;
  latitude?: number;
  longitude?: number;
}

export type DeliveryCompany = CheckoutDeliveryOption;

function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { cartItems, cartCount, isLoading: cartLoading, refreshCart, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("delivery");
  const [orderId] = useState(() => generateOrderId());
  const [finalOrderId, setFinalOrderId] = useState(orderId);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethod | null>(null);
  const [successCheckoutOptions, setSuccessCheckoutOptions] = useState<CheckoutOptions | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [orderError, setOrderError] = useState("");

  // Customer info state
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+212",
    country: getCountryByPhoneCode("+212").name,
    address: "",
    city: "",
    cityId: 0,
    password: "",
    createAccount: false,
  });

  // Delivery state
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryCompany | null>(null);

  // Check auth and sync cart on mount
  useEffect(() => {
    async function init() {
      // If returning from PayPal approval, jump straight to payment step
      // Card payments now use Hosted Fields (no redirect), so only check PayPal
      const pendingPayPal = sessionStorage.getItem("obd_paypal_pending");
      if (pendingPayPal) {
        // Check if PayPal actually approved (token + PayerID in URL)
        const urlParams = new URLSearchParams(window.location.search);
        const hasToken = urlParams.has("token") || urlParams.has("PayerID");
        // Clean up URL query params so refresh doesn't re-trigger
        if (urlParams.toString()) {
          window.history.replaceState({}, "", window.location.pathname);
        }
        if (hasToken) {
          // User approved payment — proceed to capture
          setStep("payment");
        } else {
          // User cancelled on PayPal — clean up and show failure
          sessionStorage.removeItem("obd_paypal_pending");
          setOrderError(t("checkout.payment_cancelled"));
          setStep("failure");
        }
      }

      try {
        // Sync cart with backend first — ensures we have the latest state
        await refreshCart();

        const res = await customerAuthService.checkCustomerToken();
        // The API returns success:true even for guest users (with authenticated:false).
        // Only treat the user as logged-in when authenticated is explicitly true.
        if (res.success && res.data?.authenticated === true) {
          setIsLoggedIn(true);
          // Pre-fill from customer info
          try {
            const infoRes = await customerInfoService.getCustomerInfo();
            if (infoRes.success && infoRes.data.customer_info) {
              const info: CustomerInfoResponse = infoRes.data.customer_info;
              const phoneCode = info.phoneCode || "+212";
              let phoneNum = info.phoneNumber || "";
              // Strip country code from phoneNumber if it's prepended
              if (phoneNum.startsWith(phoneCode)) {
                phoneNum = phoneNum.substring(phoneCode.length);
              } else if (phoneNum.startsWith("+")) {
                // If phone starts with a different +prefix, try to extract the code
                const match = phoneNum.match(/^(\+\d{1,4})(.*)$/);
                if (match) {
                  phoneNum = match[2];
                }
              }
              setCustomerData((prev) => ({
                ...prev,
                firstName: info.firstName || "",
                lastName: info.lastName || "",
                email: info.email || "",
                countryCode: phoneCode,
                country: info.country || getCountryByPhoneCode(phoneCode).name,
                phoneNumber: phoneNum,
                address: info.address || "",
                city: info.city || "",
                cityId: info.cityId ?? 0,
                // Reuse the last saved GPS location so the customer doesn't have
                // to grant geolocation permission on every checkout.
                latitude: info.lastLocation?.latitude ?? prev.latitude,
                longitude: info.lastLocation?.longitude ?? prev.longitude,
              }));
            }
          } catch {}
        } else {
          // Guest user — do NOT pre-fill name/email (backend generates fake placeholders
          // like "Guest User" / "GUEST…@guest.local"). Only restore phone/address/city
          // from the last saved checkout if available.
          try {
            const saved = localStorage.getItem("obd_checkout_info");
            if (saved) {
              const parsed = JSON.parse(saved) as CustomerFormData;
              const phoneCode = parsed.countryCode || "+212";
              let phoneNum = parsed.phoneNumber || "";
              // Strip country code from phoneNumber if it's prepended
              if (phoneNum.startsWith(phoneCode)) {
                phoneNum = phoneNum.substring(phoneCode.length);
              } else if (phoneNum.startsWith("+")) {
                const match = phoneNum.match(/^(\+\d{1,4})(.*)$/);
                if (match) {
                  phoneNum = match[2];
                }
              }
              setCustomerData((prev) => ({
                ...prev,
                // Name & email intentionally left blank — guest must enter real details
                firstName: "",
                lastName: "",
                email: "",
                countryCode: phoneCode,
                country: parsed.country || getCountryByPhoneCode(phoneCode).name,
                phoneNumber: phoneNum,
                address: parsed.address || "",
                city: parsed.city || "",
                cityId: parsed.cityId || 0,
              }));
            }
          } catch {}
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoadingCustomer(false);
      }
    }
    init();
  }, []);

  // Cart totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const info = item.productInfo;
      if (!info) return sum;
      const unitPrice = info.discountedPrice ?? info.price ?? 0;
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [cartItems]);
  const cartSignature = useMemo(
    () => cartItems.map((item) => `${item.productCode}:${item.quantity}`).sort().join("|"),
    [cartItems]
  );
  const checkoutOptionsQuery = useCheckoutOptions(
    customerData.country,
    cartSignature,
    !cartLoading && !loadingCustomer && cartItems.length > 0
  );
  const checkoutOptions = checkoutOptionsQuery.data as CheckoutOptions | undefined;

  useEffect(() => {
    if (!selectedDelivery || !checkoutOptions) return;
    const current = checkoutOptions.deliveryOptions.find((option) => option.id === selectedDelivery.id);
    if (!current?.available) setSelectedDelivery(null);
  }, [checkoutOptions, selectedDelivery]);

  if (cartLoading || loadingCustomer) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">{t("common.loading")}</span>
        </div>
      </Container>
    );
  }

  if (cartCount === 0 && step !== "success" && step !== "failure") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("cart.empty")}</h1>
        <p className="text-muted-foreground">{t("checkout.empty_cart_desc")}</p>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("checkout.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cartCount > 0 ? `${cartCount} ${t("cart.quantity")}` : ""}
        </p>
      </div>

      {/* Progress bar */}
      {step !== "success" && step !== "failure" && (
        <CheckoutProgress currentStep={step} />
      )}

      {/* Steps */}
      <div className="mt-8">
        {step === "delivery" && (
          <DeliveryStep
            selected={selectedDelivery}
            onSelect={setSelectedDelivery}
            onBack={() => router.push("/cart")}
            onNext={() => setStep("info")}
            options={checkoutOptions}
            loading={checkoutOptionsQuery.isLoading}
            error={checkoutOptionsQuery.error instanceof Error ? checkoutOptionsQuery.error.message : undefined}
          />
        )}
        {step === "info" && (
          <CustomerInfoStep
            data={customerData}
            onChange={setCustomerData}
            isLoggedIn={isLoggedIn}
            onBack={() => setStep("delivery")}
            onNext={async () => {
              // Save guest info for next checkout
              if (!isLoggedIn) {
                localStorage.setItem("obd_checkout_info", JSON.stringify(customerData));
              } else {
                // Update logged-in customer info in the background
                try {
                  await customerInfoService.updateCustomerInfo({
                    address: customerData.address,
                    city: customerData.city,
                    cityId: customerData.cityId || undefined,
                    phoneCode: customerData.countryCode,
                    phoneNumber: customerData.phoneNumber,
                    country: customerData.country,
                  });
                } catch (err) {
                  console.error("Failed to update customer info:", err);
                }
              }
              setStep("payment");
            }}
          />
        )}
        {step === "payment" && (
          <PaymentStep
            orderId={orderId}
            cartItems={cartItems}
            subtotal={checkoutOptions?.subtotal ?? subtotal}
            customerData={customerData}
            selectedDelivery={selectedDelivery}
            checkoutOptions={checkoutOptions}
            isLoggedIn={isLoggedIn}
            onBack={() => setStep("info")}
            onSuccess={(finalOrderId, paymentMethod) => {
              setFinalOrderId(finalOrderId);
              setSelectedPaymentMethod(paymentMethod);
              setSuccessCheckoutOptions(checkoutOptions);
              setStep("success");
              clearCart();
            }}
            onFailure={(errorMessage) => {
              setOrderError(errorMessage);
              setStep("failure");
            }}
            onLoggedIn={() => {
              setIsLoggedIn(true);
              refreshCart();
            }}
          />
        )}
        {step === "success" && (
          <OrderSuccess
            orderId={finalOrderId}
            paymentMethod={selectedPaymentMethod}
            delivery={selectedDelivery}
            checkoutOptions={successCheckoutOptions}
          />
        )}
        {step === "failure" && (
          <OrderFailure
            errorMessage={orderError}
            onRetry={() => {
              setOrderError("");
              setStep("payment");
            }}
          />
        )}
      </div>
    </Container>
  );
}
