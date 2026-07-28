import { apiClient } from '@/lib/apiClient';
import { publicServerFetch } from '@/lib/serverFetch';
import type { ApiSuccess } from '@/types/api';

export interface CarouselImage {
  image: string | null;
  carouselImage: string | null;
  link: string | null;
  category: string | null;
  productCode: string | null;
  title?: string | null;
  title_ar?: string | null;
  title_en?: string | null;
  subtitle?: string | null;
  subtitle_ar?: string | null;
  subtitle_en?: string | null;
  buttonText?: string | null;
  buttonText_ar?: string | null;
  buttonText_en?: string | null;
}

export interface CarouselData {
  carousel: CarouselImage[];
}

export const carouselService = {
  getCarousel: async (name: string): Promise<ApiSuccess<CarouselData>> => {
    return apiClient.get<CarouselData>(`/carousels?name=${name}`);
  },

  getCarouselServer: async (name: string): Promise<CarouselData> => {
    return publicServerFetch<CarouselData>(`/carousels?name=${name}`, {
      next: { revalidate: 60 },
    });
  },

  getAllCarouselsServer: async (): Promise<CarouselData> => {
    return publicServerFetch<CarouselData>(`/carousels/all`, {
      next: { revalidate: 60 },
    });
  },
};
