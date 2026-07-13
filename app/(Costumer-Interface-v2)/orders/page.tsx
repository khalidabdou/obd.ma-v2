import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { serverFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { CustomerOrdersData } from "@/services/order.service";
import { Package, ArrowRight, Home, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default async function OrdersPage() {
  let orders: CustomerOrdersData["customer_orders"] = [];
  let isAuthenticated = false;

  try {
    const data = await serverFetch<CustomerOrdersData>("/customer_order", {
      cache: "no-store",
    });
    orders = (data.customer_orders || []).map((order) => ({
      ...order,
      firstProductImage: rewriteImageUrlForServer(order.firstProductImage),
    }));
    isAuthenticated = true;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }

  if (!isAuthenticated) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Sign in to view your orders</h1>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <ShoppingBag className="h-6 w-6" />
        My Orders
      </h1>
      {orders.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">You have no orders yet.</p>
          <Link href="/">
            <Button className="gap-2 bg-brand-blue hover:bg-brand-blue/90">
              <Home className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.orderId}
              href={`/orders/${order.orderId}`}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                {order.firstProductImage ? (
                  <Image
                    src={order.firstProductImage}
                    alt="Product"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <Package className="h-full w-full p-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Order #{order.orderId}</span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium uppercase ${
                      order.cancelStatus
                        ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-muted"
                    }`}
                  >
                    {order.cancelStatus ? "Cancelled" : order.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Total: {order.totalPrice} MAD · {new Date(order.date).toLocaleDateString()}
                </p>
                {order.shipment?.trackingNumber && (
                  <p className="mt-1 text-sm">
                    Tracking: {order.shipment.trackingNumber} ({order.shipment.company.displayName})
                  </p>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
