import { publicServerFetch } from '@/lib/serverFetch';

export interface ContentPage {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string | null;
  titleAr: string | null;
  contentFr: string;
  contentEn: string | null;
  contentAr: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export const contentPageService = {
  async getPage(slug: string): Promise<ContentPage> {
    const data = await publicServerFetch<{ page: ContentPage }>(`/pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    return data.page;
  },
};
