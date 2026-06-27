"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Container from "./Container";
import { useCart } from "@/Context/CartContext";
import ThemeToggle from "@components/v2/ui/ThemeToggle";
import { Menu, Search, ShoppingCart, User, Heart } from "lucide-react";

export default function NavBar() {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/v2" className="text-xl font-bold text-brand-blue">
            OBD.ma
          </Link>

          <div className="hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9" />
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/v2/favorite">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/v2/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/v2/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            <ThemeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-6 flex flex-col gap-4">
                  <Link href="/v2/catalog" className="text-lg font-medium">
                    Catalog
                  </Link>
                  <Link href="/v2/cart" className="text-lg font-medium">
                    Cart
                  </Link>
                  <Link href="/v2/account" className="text-lg font-medium">
                    Account
                  </Link>
                  <Link href="/v2/favorite" className="text-lg font-medium">
                    Favorites
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </Container>
    </header>
  );
}
