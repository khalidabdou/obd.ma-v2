function removeTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const config = {
  apiBaseUrl: removeTrailingSlash(process.env.NEXT_PUBLIC_API_URL || ''),
  serverApiBaseUrl: removeTrailingSlash(process.env.SERVER_API_URL || ''),
  siteUrl: removeTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || ''),
  isProduction: process.env.NODE_ENV === 'production',
  defaultRevalidate: 60,
  requestTimeout: 30_000,
} as const;
