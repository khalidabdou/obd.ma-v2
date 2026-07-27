import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { CategoryInfo, CategoriesData } from "@/services/category.service";
import HomeCategoriesClient from "./HomeCategoriesClient";

export default async function HomeCategories() {
  let categories: CategoryInfo[] = [];

  try {
    const categoriesData = await publicServerFetch<CategoriesData>("/categories", {
      next: { revalidate: 60 },
    });
    categories = (Array.isArray(categoriesData) ? categoriesData : categoriesData.categories_infos || []).map((c) => ({
      ...c,
      categoryImage: rewriteImageUrlForServer(c.categoryImage),
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return <HomeCategoriesClient categories={categories} />;
}
