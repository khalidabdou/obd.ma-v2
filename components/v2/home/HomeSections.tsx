import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { BrandInfo, BrandsData } from "@/services/brand.service";
import type { CategoryInfo, CategoriesData } from "@/services/category.service";
import HomeSectionsClient from "./HomeSectionsClient";

export default async function HomeSections() {
  const [brandsData, categoriesData] = await Promise.all([
    publicServerFetch<BrandsData>("/brands", { next: { revalidate: 60 } }).catch(() => ({ brands_infos: [] as BrandInfo[] })),
    publicServerFetch<CategoriesData>("/categories", { next: { revalidate: 60 } }).catch(() => ({ categories_infos: [] as CategoryInfo[] })),
  ]);

  const brands: BrandInfo[] = (Array.isArray(brandsData) ? brandsData : brandsData.brands_infos || []).map(b => ({
    ...b,
    brandImage: rewriteImageUrlForServer(b.brandImage),
  }));
  const categories: CategoryInfo[] = (Array.isArray(categoriesData) ? categoriesData : categoriesData.categories_infos || []).map(c => ({
    ...c,
    categoryImage: rewriteImageUrlForServer(c.categoryImage),
  }));

  return <HomeSectionsClient brands={brands} categories={categories} />;
}
