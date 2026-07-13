import { Metadata } from "next";
import Container from "@components/v2/layout/Container";
import ProductGrid from "@components/v2/catalog/ProductGrid";
import { categoryService } from "@/services/category.service";
import type { CategoryInfo } from "@/services/category.service";

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
  let category: CategoryInfo | null = null;

  try {
    category = await categoryService.findCategoryById(id);
  } catch (error) {
    console.error("Failed to fetch category info:", error);
  }

  return (
    <Container className="py-8">
      <ProductGrid
        baseFilters={{ category_ids_filter: id }}
        title={category?.categoryTitle || "Category"}
      />
    </Container>
  );
}
