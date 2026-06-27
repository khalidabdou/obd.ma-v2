import { Metadata } from "next";
import Container from "@components/v2/layout/Container";
import ProductCard from "@components/v2/product/ProductCard";
import { serverFetch } from "@/lib/serverFetch";
import type { ProductsData } from "@/services/product.service";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catalog | OBD.ma",
  description: "Browse our catalog of diagnostic tools and auto parts.",
};

export default async function CatalogPage() {
  let products: ProductsData["products"] = [];

  try {
    const data = await serverFetch<ProductsData>("/products", {
      next: { revalidate: 60 },
    });
    products = data.products || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Catalog</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.productCode} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
}
