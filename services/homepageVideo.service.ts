import { publicServerFetch } from '@/lib/serverFetch';

export interface HomepageVideoData {
  id: number | null;
  videoUrl: string | null;
  posterUrl: string | null;
  youtubeVideoId: string | null;
  enabled: boolean;
}

export const homepageVideoService = {
  getHomepageVideoServer: async (): Promise<HomepageVideoData> => {
    return publicServerFetch<HomepageVideoData>('/homepage-video', {
      next: { revalidate: 60 },
    });
  },
};
