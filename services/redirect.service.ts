// Redirect service for handling short URLs and redirections in frontend-v2

export interface RedirectInfo {
  toPath: string;
  statusCode: number;
}

export const redirectService = {
  /**
   * Build the backend redirect URL for direct browser navigation
   * @param path - Short URL path (e.g., 'dls' or '/dls')
   */
  buildRedirectUrl: (path: string): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${apiUrl}/r/${cleanPath}`;
  },
};
