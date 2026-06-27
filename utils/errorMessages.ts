// Centralized error messages for API errors
import type { ApiError, ApiErrorName } from '@/types/api';

/**
 * Error message mappings for different error types
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  ValidationError: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى',
  MissingToken: 'يجب تسجيل الدخول أولاً',
  TokenExpired: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
  InvalidToken: 'رمز المصادقة غير صالح',
  Unauthorized: 'ليس لديك صلاحية للقيام بهذا الإجراء',
  
  // Admin errors
  AdminNotFound: 'حساب المسؤول غير موجود',
  InvalidPassword: 'كلمة المرور غير صحيحة',
  
  // Product errors
  ProductNotFound: 'المنتج غير موجود',
  InsufficientStock: 'الكمية المتوفرة غير كافية',
  
  // Category errors
  CategoryNotFound: 'الفئة غير موجودة',
  CategoryTitleExists: 'اسم الفئة موجود بالفعل',
  
  // Cart errors
  CartItemNotFound: 'المنتج غير موجود في سلة التسوق',
  
  // Network errors
  NetworkError: 'خطأ في الاتصال، يرجى المحاولة مرة أخرى',
};

/**
 * Get a user-friendly error message from an ApiError
 * 
 * @param error - The API error object
 * @param fallback - Optional fallback message
 * @returns User-friendly error message in Arabic
 */
export function getErrorMessage(error: ApiError, fallback?: string): string {
  // Check if we have a predefined message for this error name
  if (error.name && ERROR_MESSAGES[error.name]) {
    return ERROR_MESSAGES[error.name];
  }
  
  // Try to extract error message from data
  if (error.data) {
    if (typeof error.data === 'string') {
      return error.data;
    }
    if (error.data.error && typeof error.data.error === 'string') {
      return error.data.error;
    }
    if (error.data.message && typeof error.data.message === 'string') {
      return error.data.message;
    }
  }
  
  // Return fallback or generic error message
  return fallback || 'حدث خطأ، يرجى المحاولة مرة أخرى';
}

/**
 * Get validation error messages from a ValidationError
 * 
 * @param error - The API error object
 * @returns Array of validation error messages
 */
export function getValidationErrors(error: ApiError): string[] {
  if (error.name !== 'ValidationError' || !error.data?.errors) {
    return [];
  }
  
  const errors: string[] = [];
  
  if (Array.isArray(error.data.errors)) {
    error.data.errors.forEach((err: any) => {
      if (err.constraints) {
        Object.values(err.constraints).forEach((message) => {
          if (typeof message === 'string') {
            errors.push(message);
          }
        });
      }
    });
  }
  
  return errors;
}

/**
 * Check if an error requires authentication
 * 
 * @param error - The API error object
 * @returns True if the error is authentication-related
 */
export function isAuthError(error: ApiError): boolean {
  const authErrorNames: ApiErrorName[] = [
    'MissingToken',
    'TokenExpired',
    'InvalidToken',
    'Unauthorized',
  ];
  
  return authErrorNames.includes(error.name as ApiErrorName);
}

/**
 * Check if an error is a validation error
 * 
 * @param error - The API error object
 * @returns True if the error is a validation error
 */
export function isValidationError(error: ApiError): boolean {
  return error.name === 'ValidationError';
}
