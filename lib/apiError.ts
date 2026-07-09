import { AxiosError } from 'axios';
import type { ApiError, ApiResponse } from '@/types/api';

export function normalizeError(error: unknown): ApiError {
  if (error && typeof error === 'object') {
    // Axios error
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError<ApiResponse>;
      const response = axiosError.response?.data;

      if (response && 'success' in response && response.success === false) {
        return response as ApiError;
      }

      return {
        statusCode: axiosError.response?.status || 500,
        name: axiosError.code || 'NetworkError',
        success: false,
        data: { message: axiosError.message || 'Network request failed' },
      };
    }

    // Already an ApiError shape
    if ('success' in error && error.success === false) {
      return error as ApiError;
    }
  }

  return {
    statusCode: 500,
    name: 'UnknownError',
    success: false,
    data: {
      message: error instanceof Error ? error.message : 'Something went wrong',
    },
  };
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

export function getErrorMessage(
  error: unknown,
  t?: (key: string) => string
): string {
  const normalized = normalizeError(error);

  // Try to translate the backend error name first
  if (normalized.name && t) {
    const translationKey = `apiErrors.${toCamelCase(normalized.name)}`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }

  // Fall back to server-provided message / error / error name
  const fallback =
    normalized.data?.message ||
    normalized.data?.error ||
    normalized.name ||
    (t ? t('messages.error_occurred') : 'Something went wrong');

  return fallback;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'success' in error &&
    error.success === false
  );
}
