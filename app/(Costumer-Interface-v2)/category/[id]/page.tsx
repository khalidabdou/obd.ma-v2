import { Metadata } from "next";
import Container from "@components/v2/layout/Container";
import ProductCard from "@components/v2/product/ProductCard";
import { serverFetch } from "@/lib/serverFetch";
import { categoryService } from "@/services/category.service";
import type { ProductsData } from "@/services/product.service";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await categoryService.findCategoryById(id);
  return {
    title: `${category?.categoryTitle || id} | OBD.ma`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  let products: ProductsData["products"] = [];
  let category = null;

  try {
    [products, category] = await Promise.all([
      serverFetch<ProductsData>("/products", {
        next: { revalidate: 60 },
        params: { category_id_filter: id },
      }).then((data) => data.products || []),
      categoryService.findCategoryById(id),
    ]);
  } catch (error) {
    console.error("Failed to fetch category products:", error);
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">
        {category?.categoryTitle || "Category"}
      </h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products in this category.</p>
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
