import Link from "next/link";
import Container from "@components/v2/layout/Container";
import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { Product, ProductsData } from "@/services/product.service";
import { ArrowRight, ShoppingBag } from "lucide-react";
import HomeProductCard from "./HomeProductCard";

export default async function HomeProducts() {
  let products: Product[] = [];

  try {
    const productsData = await publicServerFetch<ProductsData>("/products", {
      params: { show_in_home: true, products_limit: 4 },
      next: { revalidate: 60 },
    });
    products = (productsData.products || []).map((p) => ({
      ...p,
      images: {
        ...p.images,
        mainImage: rewriteImageUrlForServer(p.images?.mainImage),
      },
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <section className="bg-background py-14 text-foreground dark:bg-[#0B0D10] dark:text-white">
      <Container>
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-blue/15 px-4 py-1.5 text-sm font-semibold text-brand-blue">
              <ShoppingBag className="h-4 w-4" />
              <span>NOS PRODUITS</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Découvrez Nos Produits
            </h2>
            <p className="text-base text-muted-foreground dark:text-neutral-400">
              Des équipements professionnels pour un diagnostic précis et fiable.
            </p>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-blue/60 px-5 py-2.5 text-sm font-medium text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
          >
            Voir tous les produits
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product cards */}
        {products.length === 0 ? (
          <p className="text-muted-foreground dark:text-neutral-400">Aucun produit disponible.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <HomeProductCard key={product.productCode} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
