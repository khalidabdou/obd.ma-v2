// Order service using new API client
import { apiClient } from '@/lib/apiClient';
import type { ApiSuccess } from '@/types/api';

/**
 * Order item structure
 */
export interface OrderItem {
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  choices?: string[];
}

/**
 * Order structure
 */
export interface Order {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: any;
  paymentMethod?: string;
}

/**
 * Create order data
 */
export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: any;
  paymentMethod: string;
}

/**
 * Orders response data
 */
export interface OrdersData {
  orders: Order[];
  totalCount?: number;
}

/**
 * Customer order structure for track orders page
 */
export interface CustomerOrder {
  orderId: string;
  firstProductImage: string;
  totalPrice: string;
  date: string;
  status: 'thanks' | 'waiting' | 'processed' | 'shipping' | 'delivered' | 'cancelled';
  cancelStatus: boolean;
  shipment?: {
    trackingNumber?: string | null;
    company: {
      name: string;
      displayName: string;
    };
    status: string;
  } | null;
}

/**
 * Customer order detail structure
 */
export interface CustomerOrderDetail extends CustomerOrder {
  items: {
    productCode: string;
    productName: string;
    productImage?: string | null;
    variantName?: string | null;
    quantity: number;
    unitPrice: string;
    price: string;
    discount: string;
  }[];
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    address?: string | null;
    city?: string | null;
  } | null;
  payment: {
    method: string;
    amount: string;
  } | null;
}

/**
 * Customer orders response data
 */
export interface CustomerOrdersData {
  customer_orders: CustomerOrder[];
}

/**
 * Create order request data (unified for all payment methods)
 */
export interface CreateOrderRequest {
  orderId: string;
  paymentMethod: 'COD' | 'paypal' | 'card';
  creationDate?: string;
  deliveryCompanyId?: string;
  paypalOrderId?: string;
  cardOrderId?: string;
}

/**
 * Order creation response
 */
export interface CreateOrderResponse {
  orderId?: number;
  paypal_order_id?: string;
  card_order_id?: string;
  message?: string;
}

/**
 * Order service for order-related operations
 */
export const orderService = {
  /**
   * Get customer orders
   * @returns Promise with customer orders data
   */
  getCustomerOrders: async (): Promise<ApiSuccess<CustomerOrdersData>> => {
    return await apiClient.get('/customer_order');
  },

  /**
   * Get a single customer order by ID
   * @param orderId - The order ID
   * @returns Promise with order detail data
   */
  getOrder: async (orderId: string): Promise<ApiSuccess<{ order: CustomerOrderDetail }>> => {
    return await apiClient.get(`/customer_order/${orderId}`);
  },

  /**
   * Create a new order (unified endpoint for all payment methods)
   * @param data - Order data
   * @returns Promise with created order response
   */
  createOrder: async (data: CreateOrderRequest): Promise<ApiSuccess<CreateOrderResponse>> => {
    return await apiClient.post('/order', data);
  },

  /**
   * Create COD order
   * @param orderId - Order ID
   * @param creationDate - Creation date
   * @param deliveryCompanyId - Optional delivery company ID
   * @returns Promise with success response
   */
  createCODOrder: async (
    orderId: string,
    creationDate: string,
    deliveryCompanyId?: string
  ): Promise<ApiSuccess<CreateOrderResponse>> => {
    return await apiClient.post('/order', {
      orderId,
      paymentMethod: 'COD',
      creationDate,
      deliveryCompanyId,
    });
  },

  /**
   * Create PayPal order (Step 1)
   * @param orderId - Order ID
   * @returns Promise with PayPal order ID
   */
  createPayPalOrder: async (orderId: string): Promise<ApiSuccess<CreateOrderResponse>> => {
    return await apiClient.post('/order', {
      orderId,
      paymentMethod: 'paypal',
    });
  },

  /**
   * Capture PayPal payment (Step 2)
   * @param orderId - Order ID
   * @param creationDate - Creation date
   * @param paypalOrderId - PayPal order ID
   * @param deliveryCompanyId - Optional delivery company ID
   * @returns Promise with success response
   */
  capturePayPalPayment: async (
    orderId: string,
    creationDate: string,
    paypalOrderId: string,
    deliveryCompanyId?: string
  ): Promise<ApiSuccess<CreateOrderResponse>> => {
    return await apiClient.post('/order', {
      orderId,
      paymentMethod: 'paypal',
      creationDate,
      paypalOrderId,
      deliveryCompanyId,
    });
  },

  /**
   * Create card order (Step 1)
   * @param orderId - Order ID
   * @returns Promise with card order ID
   */
  createCardOrder: async (orderId: string): Promise<ApiSuccess<CreateOrderResponse>> => {
    return await apiClient.post('/order', {
      orderId,
      paymentMethod: 'card',
    });
  },

  /**
   * Capture card payment (Step 2)
   * @param orderId - Order ID
   * @param creationDate - Creation date
   * @param cardOrderId - Card order ID
   * @param deliveryCompanyId - Optional delivery company ID
   * @returns Promise with success response
   */
  captureCardPayment: async (
    orderId: string,
    creationDate: string,
    cardOrderId: string,
    deliveryCompanyId?: string
  ): Promise<ApiSuccess<CreateOrderResponse>> => {
    return await apiClient.post('/order', {
      orderId,
      paymentMethod: 'card',
      creationDate,
      cardOrderId,
      deliveryCompanyId,
    });
  },

  /**
   * Update order status (works for both authenticated users and guests)
   * @param orderId - The order ID
   * @param newStatus - New status
   * @returns Promise with success message
   */
  updateOrderStatus: async (orderId: string, newStatus: string): Promise<ApiSuccess<{ message: string }>> => {
    // Get customer_id from cookies for guest users
    const customerId = typeof document !== 'undefined' 
      ? document.cookie.split('; ').find(row => row.startsWith('customer_id='))?.split('=')[1]
      : undefined;
    
    return await apiClient.patch('/customer_order', { 
      orderId, 
      newStatus,
      ...(customerId && { customer_id: customerId })
    });
  },

  /**
   * Get delivery price (client-side)
   * @returns Promise with delivery price
   */
  getDeliveryPrice: async (): Promise<ApiSuccess<{ deliveryPrice: number }>> => {
    return await apiClient.get('/delivery_price');
  },

  /**
   * Get delivery price (server-side for Server Components)
   * @returns Promise with delivery price
   */
  getDeliveryPriceServer: async (): Promise<number | null> => {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const customer_access_token = cookieStore.get('customer_access_token')?.value;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customer_access_token) {
        headers['Authorization'] = `Bearer ${customer_access_token}`;
      }

      const serverUrl = process.env.SERVER_API_URL;
      const publicUrl = process.env.NEXT_PUBLIC_API_URL;
      let response: Response | null = null;
      let lastError: Error | null = null;

      if (serverUrl) {
        try {
          response = await fetch(`${serverUrl}/delivery_price`, {
            method: 'GET',
            headers,
            cache: 'no-store',
          });
        } catch (err) {
          lastError = err as Error;
        }
      }
      if (!response && publicUrl) {
        response = await fetch(`${publicUrl}/delivery_price`, {
          method: 'GET',
          headers,
          cache: 'no-store',
        });
      }

      if (!response) {
        throw lastError || new Error('No API URL configured');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data?.data?.deliveryPrice ?? data?.deliveryPrice ?? null;
    } catch (error) {
      console.error('Failed to fetch delivery price:', error);
      return null;
    }
  },

  /**
   * Get delivery companies
   * @returns Promise with delivery companies list
   */
  getDeliveryCompanies: async (): Promise<ApiSuccess<{ companies: any[] }>> => {
    return await apiClient.get('/delivery-companies');
  },

  /**
   * Cancel an order (customer)
   * Customers can only cancel orders with status: THANKS, WAITING, PROCESSED
   * @param orderId - The order ID
   * @returns Promise with success message
   */
  cancelOrder: async (orderId: string): Promise<ApiSuccess<{ message: string }>> => {
    return await apiClient.patch(`/customer_order/${orderId}/cancel`, {});
  },
};
