import { Metadata } from "next";
import Container from "@components/v2/layout/Container";
import ProductCard from "@components/v2/product/ProductCard";
import { serverFetch } from "@/lib/serverFetch";
import { brandService } from "@/services/brand.service";
import type { ProductsData } from "@/services/product.service";

export const revalidate = 60;

interface BrandPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { id } = await params;
  const brands = await brandService.getBrands();
  const brand = brands.data?.brands_infos.find((b) => b.brandId === id);
  return {
    title: `${brand?.brandName || id} | OBD.ma`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { id } = await params;
  let products: ProductsData["products"] = [];
  let brand = null;

  try {
    [products, brand] = await Promise.all([
      serverFetch<ProductsData>("/products", {
        next: { revalidate: 60 },
        params: { brands_ids_filter: id },
      }).then((data) => data.products || []),
      brandService
        .getBrands()
        .then((res) => res.data?.brands_infos.find((b) => b.brandId === id) || null),
    ]);
  } catch (error) {
    console.error("Failed to fetch brand products:", error);
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">{brand?.brandName || "Brand"}</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products for this brand.</p>
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
