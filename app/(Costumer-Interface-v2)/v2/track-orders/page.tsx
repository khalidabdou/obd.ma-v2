import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { serverFetch } from "@/lib/serverFetch";
import { orderService } from "@/services/order.service";
import type { CustomerOrdersData } from "@/services/order.service";

export default async function TrackOrdersPage() {
  let orders: CustomerOrdersData["customer_orders"] = [];
  let isAuthenticated = false;

  try {
    const data = await serverFetch<CustomerOrdersData>("/customer_order", {
      cache: "no-store",
    });
    orders = data.customer_orders || [];
    isAuthenticated = true;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Sign in to track orders</h1>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Track Orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Order #{order.orderId}</span>
                <span className="rounded bg-muted px-2 py-1 text-xs font-medium uppercase">
                  {order.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Total: {order.totalPrice} MAD · {order.date}
              </p>
              {order.shipment?.trackingNumber && (
                <p className="mt-1 text-sm">
                  Tracking: {order.shipment.trackingNumber} (
                  {order.shipment.company.displayName})
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
