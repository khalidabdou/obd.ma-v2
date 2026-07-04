import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Container from "@components/v2/layout/Container";
import { Button } from "@/components/ui/button";
import { serverFetch } from "@/lib/serverFetch";
import type { Product, ProductsData } from "@/services/product.service";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `${code} | OBD.ma`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { code } = await params;
  let product: Product | null = null;

  try {
    const data = await serverFetch<ProductsData>("/products", {
      next: { revalidate: 60 },
      params: { product_code_query: code },
    });
    product = data.products?.find((p) => p.productCode === code) || null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
  }

  if (!product) {
    notFound();
  }

  const image = product.images?.mainImage || "/placeholder.svg";
  const price = product.discountedPrice ?? product.price;

  return (
    <Container className="py-8">
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 40vw"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="mb-4 text-2xl font-bold md:text-3xl">
            {product.title}
          </h1>
          <p className="mb-4 text-muted-foreground">{product.description}</p>
          {price !== null && price !== undefined && (
            <div className="mb-6 text-2xl font-bold text-brand-blue">
              {price.toFixed(2)} MAD
            </div>
          )}
          <Button size="lg">Add to Cart</Button>
        </div>
      </div>
    </Container>
  );
}
