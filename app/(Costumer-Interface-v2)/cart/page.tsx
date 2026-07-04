"use client";

import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { useCart } from "@/Context/CartContext";
import { Loader2 } from "lucide-react";

export default function CartPage() {
  const { cartItems, cartCount, isLoading } = useCart();

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading cart...
        </div>
      </Container>
    );
  }

  if (cartCount === 0) {
    return (
      <Container className="py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
        <Link href="/catalog">
          <Button>Continue Shopping</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Cart ({cartCount})</h1>
      <ul className="space-y-4">
        {cartItems.map((item) => (
          <li
            key={item.productCode}
            className="rounded-lg border border-border bg-card p-4"
          >
            <span className="font-medium">{item.productCode}</span>
            <span className="ml-4 text-muted-foreground">
              × {item.quantity}
            </span>
          </li>
        ))}
      </ul>
    </Container>
  );
}
