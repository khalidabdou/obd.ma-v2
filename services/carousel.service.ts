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
  subtitle?: string | null;
  buttonText?: string | null;
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
