import Link from "next/link";
import { Heart } from "lucide-react";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/v2/product/ProductCard";
import { serverFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import { getServerTranslation } from "@/lib/languageServer";
import type { Product } from "@/services/product.service";
import type { CustomerFavoriteItem } from "@/services/favorite.service";

export default async function MyFavoritesPage() {
  const t = await getServerTranslation();
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
      <h1 className="mb-6 text-2xl font-bold">{t("favorites.my_title")}</h1>
      {products.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{t("favorites.empty_title")}</h2>
            <p className="text-muted-foreground">
              {t("favorites.empty_subtitle")}
            </p>
          </div>
          <Link href="/catalog">
            <Button size="lg">{t("favorites.browse_products")}</Button>
          </Link>
        </div>
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
