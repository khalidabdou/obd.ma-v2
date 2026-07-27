import { publicServerFetch, rewriteImageUrlForServer } from "@/lib/serverFetch";
import type { BrandInfo, BrandsData } from "@/services/brand.service";
import HomeBrandsClient from "./HomeBrandsClient";

export default async function HomeBrands() {
  let brands: BrandInfo[] = [];

  try {
    const brandsData = await publicServerFetch<BrandsData>("/brands", {
      next: { revalidate: 60 },
    });
    brands = (Array.isArray(brandsData) ? brandsData : brandsData.brands_infos || []).map((b) => ({
      ...b,
      brandImage: rewriteImageUrlForServer(b.brandImage),
    }));
  } catch (error) {
    console.error("Failed to fetch brands:", error);
  }

  return <HomeBrandsClient brands={brands} />;
}
