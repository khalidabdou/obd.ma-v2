// API Response Types based on backend-node API_RESPONSE_GUIDE.md

export interface ApiResponse<T = any> {
  statusCode: number;
  name: string;
  data: T;
  success: boolean;
}

export type ApiSuccess<T = any> = ApiResponse<T> & { success: true };
export type ApiError = ApiResponse & { success: false };

// Type guard to check if response is an error
export function isApiError(response: any): response is ApiError {
  return response && typeof response === 'object' && 'success' in response && response.success === false;
}

// Type guard to check if response is successful
export function isApiSuccess<T>(response: any): response is ApiSuccess<T> {
  return response && typeof response === 'object' && 'success' in response && response.success === true;
}

// Common response data types
export interface LoginSuccessData {
  message: string;
  accessToken?: string;
}

export interface LogoutSuccessData {
  message: string;
}

export interface ValidationErrorData {
  errors: Array<{
    property: string;
    constraints: Record<string, string>;
  }>;
}

export interface MessageData {
  message: string;
}

// Error names from the backend
export type ApiErrorName =
  | 'ValidationError'
  | 'MissingToken'
  | 'TokenExpired'
  | 'InvalidToken'
  | 'Unauthorized'
  | 'AdminNotFound'
  | 'InvalidPassword'
  | 'ProductNotFound'
  | 'CategoryNotFound'
  | 'CategoryTitleExists'
  | 'InsufficientStock'
  | 'CartItemNotFound'
  | 'GuestAccountExists'
  | 'AccountNotFound'
  | 'IncorrectAccountType'
  | 'NetworkError';

// Success names from the backend
export type ApiSuccessName =
  | 'LoginSuccess'
  | 'LogoutSuccess'
  | 'TokenValid'
  | 'TokenRefreshed'
  | 'ProductsRetrieved'
  | 'ProductCreated'
  | 'ProductUpdated'
  | 'ProductDeleted'
  | 'CategoryCreated'
  | 'BrandCreated'
  | 'CartUpdated'
  | 'AddedToCart'
  | 'OrderCreated';
