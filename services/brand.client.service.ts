import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';

export interface BrandInfo {
  brandId: string;
  brandName: string;
  brandImage: string;
  brandImageDark?: string | null;
  brandTitle?: string;
  brandDescription?: string;
}

export interface BrandsData {
  brands_infos: BrandInfo[];
}

export const getBrandsIdsFromProducts = (products: any[]) => {
  const brandsIds = products
    .map((product) => product.brandId)
    .filter((brandId) => brandId !== null);
  const maxDisplayBrandsNumber = 3;

  const frequencyMap: Record<string, number> = {};
  for (const brandId of brandsIds) {
    frequencyMap[brandId] = (frequencyMap[brandId] || 0) + 1;
  }

  const brands = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxDisplayBrandsNumber)
    .map(([brandId]) => brandId);
  return brands;
};

export async function getBrands(): Promise<ApiSuccess<BrandsData>> {
  const response = await apiClient.get<BrandsData>('/brands');

  const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
  const imageBaseURL = apiBaseURL?.replace(/\/api$/, '');

  const rawBrands = Array.isArray(response.data)
    ? response.data
    : response.data?.brands_infos || [];
  const mapped = rawBrands.map((item: any) => ({
    brandId: item.brand_id || item.brandId,
    brandName: item.brand_name || item.brandName,
    brandTitle: item.brand_title || item.brandTitle,
    brandImage: item.brandImage?.startsWith('http')
      ? item.brandImage
      : `${imageBaseURL}${item.brandImage}`,
    brandImageDark: item.brandImageDark?.startsWith('http')
      ? item.brandImageDark
      : item.brandImageDark
      ? `${imageBaseURL}${item.brandImageDark}`
      : null,
  }));
  response.data = { brands_infos: mapped };

  return response;
}
