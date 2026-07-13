import { Metadata } from "next";
import Container from "@components/v2/layout/Container";
import ProductGrid from "@components/v2/catalog/ProductGrid";
import { brandService } from "@/services/brand.service";
import type { BrandInfo } from "@/services/brand.client.service";

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
  let brand: BrandInfo | null = null;

  try {
    brand = await brandService
      .getBrands()
      .then((res) => res.data?.brands_infos.find((b) => b.brandId === id) || null);
  } catch (error) {
    console.error("Failed to fetch brand info:", error);
  }

  return (
    <Container className="py-8">
      <ProductGrid
        baseFilters={{ brands_ids_filter: id }}
        title={brand?.brandName || "Brand"}
      />
    </Container>
  );
}
