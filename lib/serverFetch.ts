import { cookies } from 'next/headers';
import { config } from './config';
import type { ApiResponse, ApiError } from '@/types/api';

export interface ServerFetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  params?: Record<string, string | number | boolean | undefined>;
}

function buildQueryString(params?: ServerFetchOptions['params']): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return '';
  const query = new URLSearchParams();
  for (const [key, value] of entries) {
    query.set(key, String(value));
  }
  return `?${query.toString()}`;
}

/**
 * Centralized server-side fetch for Next.js Server Components.
 *
 * - Reads `customer_access_token` from cookies and sends it as Bearer auth.
 * - Tries SERVER_API_URL first (Docker), falls back to NEXT_PUBLIC_API_URL.
 * - Unwraps the backend's { success, data, ... } envelope and returns `data`.
 * - Supports ISR via the `next` option: `{ next: { revalidate: 60 } }`.
 *
 * @throws Error when the network fails or the backend returns a non-success response.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_access_token')?.value;
  const customerId = cookieStore.get('customer_id')?.value;

  const { params, next, ...requestInit } = options;

  const headers = new Headers(requestInit.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Forward both auth and guest cookies so SSR works for logged-in users and guests.
  const cookieHeader = [];
  if (token) cookieHeader.push(`customer_access_token=${token}`);
  if (customerId) cookieHeader.push(`customer_id=${customerId}`);
  if (cookieHeader.length > 0) {
    headers.set('Cookie', cookieHeader.join('; '));
  }

  const serverUrl = config.serverApiBaseUrl || config.apiBaseUrl;
  const publicUrl = config.serverApiBaseUrl ? config.apiBaseUrl : null;

  let response: Response | null = null;
  let lastError: Error | null = null;

  const queryString = buildQueryString(params);
  const fetchOptions: RequestInit & { next?: ServerFetchOptions['next'] } = {
    ...requestInit,
    headers,
    credentials: 'include',
    next,
  };

  if (serverUrl) {
    try {
      response = await fetch(`${serverUrl}${endpoint}${queryString}`, fetchOptions);
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (!response && publicUrl) {
    response = await fetch(`${publicUrl}${endpoint}${queryString}`, fetchOptions);
  }

  if (!response) {
    throw lastError || new Error('No API URL configured');
  }

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || data.success === false) {
    const error = data as ApiError;
    throw new Error(
      error.data?.message || error.name || `HTTP ${response.status}`
    );
  }

  return data.data;
}

/**
 * Get the appropriate API base URL for server-side requests.
 * Prefer SERVER_API_URL, fallback to NEXT_PUBLIC_API_URL.
 */
export function getServerApiUrl(): string {
  return config.serverApiBaseUrl || config.apiBaseUrl || '';
}
