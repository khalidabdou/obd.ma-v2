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

export function getErrorMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return normalized.data?.message || normalized.name || 'Something went wrong';
}

export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'success' in error &&
    error.success === false
  );
}
