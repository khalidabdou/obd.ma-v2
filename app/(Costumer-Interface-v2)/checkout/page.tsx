"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@components/v2/layout/Container";
import { useCart } from "@/Context/CartContext";
import { useTranslation } from "@/Context/LanguageContext";
import { customerAuthService } from "@/services/customer-auth.service";
import { customerInfoService } from "@/services/customer-info.service";
import type { CustomerInfoResponse } from "@/services/customer-info.service";
import CheckoutProgress from "@components/v2/checkout/CheckoutProgress";
import CustomerInfoStep from "@components/v2/checkout/CustomerInfoStep";
import DeliveryStep from "@components/v2/checkout/DeliveryStep";
import PaymentStep from "@components/v2/checkout/PaymentStep";
import OrderSuccess from "@components/v2/checkout/OrderSuccess";
import { Loader2 } from "lucide-react";

export type CheckoutStep = "info" | "delivery" | "payment" | "success";

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  cityId: number;
  password?: string;
  createAccount?: boolean;
}

export interface DeliveryCompany {
  id: string;
  name: string;
  displayName: string;
}

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
  const { cartItems, cartCount, isLoading: cartLoading, refreshCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("info");
  const [orderId] = useState(() => generateOrderId());
  const [finalOrderId, setFinalOrderId] = useState(orderId);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  // Customer info state
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
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
      try {
        // Sync cart with backend first — ensures we have the latest state
        await refreshCart();

        const res = await customerAuthService.checkCustomerToken();
        if (res.success) {
          setIsLoggedIn(true);
          // Pre-fill from customer info
          try {
            const infoRes = await customerInfoService.getCustomerInfo();
            if (infoRes.success && infoRes.data.customer_info) {
              const info: CustomerInfoResponse = infoRes.data.customer_info;
              setCustomerData((prev) => ({
                ...prev,
                firstName: info.firstName || "",
                lastName: info.lastName || "",
                email: info.email || "",
                phoneNumber: info.phoneNumber || "",
                address: info.address || "",
                city: info.city || "",
                cityId: info.cityId ?? 0,
              }));
            }
          } catch {}
        } else {
          // Pre-fill guest info from localStorage
          try {
            const saved = localStorage.getItem("obd_checkout_info");
            if (saved) {
              const parsed = JSON.parse(saved) as CustomerFormData;
              setCustomerData((prev) => ({
                ...prev,
                firstName: parsed.firstName || "",
                lastName: parsed.lastName || "",
                email: parsed.email || "",
                phoneNumber: parsed.phoneNumber || "",
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

  if (cartCount === 0 && step !== "success") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("cart.empty")}</h1>
        <p className="text-muted-foreground">{t("checkout.empty_cart_desc")}</p>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Progress bar */}
      <CheckoutProgress currentStep={step} />

      {/* Steps */}
      <div className="mt-8">
        {step === "info" && (
          <CustomerInfoStep
            data={customerData}
            onChange={setCustomerData}
            isLoggedIn={isLoggedIn}
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
                    phoneNumber: customerData.phoneNumber,
                  });
                } catch (err) {
                  console.error("Failed to update customer info:", err);
                }
              }
              setStep("delivery");
            }}
          />
        )}
        {step === "delivery" && (
          <DeliveryStep
            selected={selectedDelivery}
            onSelect={setSelectedDelivery}
            onBack={() => setStep("info")}
            onNext={() => setStep("payment")}
          />
        )}
        {step === "payment" && (
          <PaymentStep
            orderId={orderId}
            cartItems={cartItems}
            subtotal={subtotal}
            customerData={customerData}
            selectedDelivery={selectedDelivery}
            isLoggedIn={isLoggedIn}
            onBack={() => setStep("delivery")}
            onSuccess={(finalOrderId) => {
              setFinalOrderId(finalOrderId);
              setStep("success");
              refreshCart();
            }}
          />
        )}
        {step === "success" && <OrderSuccess orderId={finalOrderId} />}
      </div>
    </Container>
  );
}
