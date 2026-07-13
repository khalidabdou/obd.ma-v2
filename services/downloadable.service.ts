import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';

export interface DownloadableItem {
  downloadableId: string;
  titleOfDownloadable: string;
  subtitle: string;
  downloadableLink: string;
  downloadableImage: string;
}

export interface DownloadablesData {
  downloadables_infos: DownloadableItem[];
}

export const downloadableService = {
  getDownloadables: async (): Promise<ApiSuccess<DownloadablesData>> => {
    return apiClient.get<DownloadablesData>('/downloadables');
  },
};
