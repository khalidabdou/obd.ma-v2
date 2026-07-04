import Image from "next/image";
import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { serverFetch } from "@/lib/serverFetch";
import type { CustomerFavoriteItem } from "@/services/favorite.service";

export default async function FavoritesPage() {
  let favorites: CustomerFavoriteItem[] = [];
  let isAuthenticated = false;

  try {
    const data = await serverFetch<{ favorites: CustomerFavoriteItem[] }>(
      "/customer_favorite",
      { cache: "no-store" }
    );
    favorites = data.favorites || [];
    isAuthenticated = true;
  } catch (error) {
    console.error("Favorites fetch failed:", error);
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Sign in to see favorites</h1>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-muted-foreground">You have no favorite products.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {favorites.map((item) => (
            <div
              key={item.favorite_id}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              <Link href={`/product/${item.product_code}`}>
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/product/${item.product_code}`}>
                  <h3 className="mb-2 font-medium hover:text-brand-blue line-clamp-2">
                    {item.title}
                  </h3>
                </Link>
                <p className="font-bold text-brand-blue">
                  {(item.discounted_price ?? item.price)?.toFixed(2)} MAD
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
