import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { serverFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { CustomerOrderDetail } from "@/services/order.service";
import { ArrowLeft, Package, Truck, User, Receipt } from "lucide-react";
import Image from "next/image";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  let order: CustomerOrderDetail | null = null;
  let error: string | null = null;

  try {
    const data = await serverFetch<{ order: CustomerOrderDetail }>(`/customer_order/${id}`, {
      cache: "no-store",
    });
    order = {
      ...data.order,
      firstProductImage: rewriteImageUrlForServer(data.order.firstProductImage),
      items: data.order.items.map((item) => ({
        ...item,
        productImage: rewriteImageUrlForServer(item.productImage),
      })),
    };
  } catch (err) {
    console.error("Failed to fetch order:", err);
    error = "Order not found or you do not have access.";
  }

  if (error || !order) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">{error || "Order not found"}</h1>
        <Link href="/orders">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/orders">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
        <span
          className={`ml-auto rounded px-3 py-1 text-sm font-medium uppercase ${
            order.cancelStatus
              ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              : "bg-muted"
          }`}
        >
          {order.cancelStatus ? "Cancelled" : order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5" />
              Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productCode} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <Package className="h-full w-full p-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">{item.variantName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {item.unitPrice} MAD
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.price} MAD</p>
                    {Number(item.discount) > 0 && (
                      <p className="text-xs text-green-600">-{item.discount} MAD</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.shipment && (
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Truck className="h-5 w-5" />
                Shipment
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Company:</span>{" "}
                  {order.shipment.company.displayName}
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {order.shipment.status}
                </p>
                {order.shipment.trackingNumber && (
                  <p>
                    <span className="text-muted-foreground">Tracking:</span>{" "}
                    {order.shipment.trackingNumber}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Receipt className="h-5 w-5" />
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
              {order.payment && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span>{order.payment.method}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-medium">Total</span>
                <span className="font-semibold">{order.totalPrice} MAD</span>
              </div>
            </div>
          </div>

          {order.customerInfo && (
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Customer Info
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  {order.customerInfo.firstName} {order.customerInfo.lastName}
                </p>
                <p className="text-muted-foreground">{order.customerInfo.email}</p>
                {order.customerInfo.phoneNumber && (
                  <p className="text-muted-foreground">{order.customerInfo.phoneNumber}</p>
                )}
                {order.customerInfo.address && (
                  <p className="text-muted-foreground">{order.customerInfo.address}</p>
                )}
                {order.customerInfo.city && (
                  <p className="text-muted-foreground">{order.customerInfo.city}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
