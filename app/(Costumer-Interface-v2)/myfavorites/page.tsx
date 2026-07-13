import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/v2/product/ProductCard";
import { serverFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { Product } from "@/services/product.service";
import type { CustomerFavoriteItem } from "@/services/favorite.service";

export default async function MyFavoritesPage() {
  let favoriteItems: CustomerFavoriteItem[] = [];
  let isAuthenticated = false;

  try {
    const data = await serverFetch<{ favorites: CustomerFavoriteItem[] }>(
      "/customer_favorite",
      { cache: "no-store" }
    );
    favoriteItems = data.favorites || [];
    isAuthenticated = true;
  } catch (error) {
    console.error("MyFavorites fetch failed:", error);
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

  const products: Product[] = favoriteItems.map((item) => ({
    productCode: item.productCode,
    images: {
      mainImage: rewriteImageUrlForServer(item.image) || "/placeholder.svg",
      image1: null,
      image2: null,
    },
    title: item.title,
    brandId: item.brandId,
    price: item.price,
    discountPercentage: item.discount,
    discountedPrice: item.discountedPrice,
    quantity: item.quantity,
    description: "",
    categoryId: item.categoryId,
    productContent: [],
    choices: [],
    creationDate: item.date,
  }));

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">My Favorites</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">You have no favorite products.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.productCode} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
}
