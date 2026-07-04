import Link from "next/link";
import Image from "next/image";
import Container from "@components/v2/layout/Container";
import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { Product, ProductsData } from "@/services/product.service";
import { ArrowRight, ShoppingBag } from "lucide-react";
import HomeProductActions from "./HomeProductActions";

function isNewProduct(creationDate: string): boolean {
  if (!creationDate) return false;
  const created = new Date(creationDate).getTime();
  if (Number.isNaN(created)) return false;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - created <= THIRTY_DAYS;
}

export default async function HomeProducts() {
  let products: Product[] = [];

  try {
    const productsData = await publicServerFetch<ProductsData>("/products", {
      params: { products_limit: 4 },
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
            {products.map((product) => {
              const price = product.discountedPrice ?? product.price;
              const hasDiscount =
                product.discountedPrice !== null &&
                product.discountedPrice !== undefined &&
                product.price !== null &&
                product.price !== undefined &&
                product.discountedPrice < product.price;

              return (
                <div
                  key={product.productCode}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 dark:border-white/10 dark:bg-[#14161B] dark:hover:bg-[#1A1D24]"
                >
                  {isNewProduct(product.creationDate) && (
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white">
                      NOUVEAU
                    </span>
                  )}

                  <Link href={`/product/${product.productCode}`} className="block">
                    <div className="relative mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-muted dark:bg-[#0B0D10]">
                      {product.images?.mainImage ? (
                        <Image
                          src={product.images.mainImage}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain p-4"
                        />
                      ) : (
                        <span className="text-lg font-bold text-brand-blue">
                          {product.title.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground dark:text-white">
                      {product.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-xs text-muted-foreground dark:text-neutral-400">
                      {product.description}
                    </p>

                    <div className="mb-4 flex items-center gap-2">
                      {price !== null && price !== undefined && (
                        <span className="text-lg font-bold text-brand-blue">
                          {price.toFixed(2)} MAD
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through dark:text-neutral-500">
                          {product.price!.toFixed(2)} MAD
                        </span>
                      )}
                    </div>
                  </Link>

                  <HomeProductActions productCode={product.productCode} />
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
