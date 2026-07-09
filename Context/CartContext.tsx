/**
 * Cart Context - Centralized cart state management
 * Handles both authenticated and guest users
 * Provides optimistic UI updates with server synchronization
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '@/services/cart.service';
import type { Product } from '@/services/product.service';

/** Rewrite public image URLs to Docker-internal hostnames so Next.js Image Optimizer can fetch them. */
function fixImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const publicBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
  const serverBase = publicBase.replace(/localhost/, 'backend');
  if (publicBase && serverBase && publicBase !== serverBase) {
    return url.replace(publicBase, serverBase);
  }
  return url;
}

export interface CartItem {
  productCode: string;
  quantity: number;
  choice?: string;
  productInfo?: Product;
}



interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  addToCart: (productCode: string, quantity: number, choice?: string) => Promise<boolean>;
  updateQuantity: (productCode: string, quantityChange: number) => Promise<boolean>;
  removeFromCart: (productCode: string) => Promise<boolean>;
  getItemQuantity: (productCode: string) => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total cart count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * Fetch cart from server
   */
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      
      if (response.success && response.data.customer_cart_products) {
        setCartItems(response.data.customer_cart_products.map(item => {
          // Normalize product images: backend returns imageUrl (top-level),
          // but frontend expects images.mainImage (nested).
          // Also rewrite URLs so Next.js Image Optimizer can reach Docker-internal hosts.
          const info = item.productInfo
            ? {
                ...item.productInfo,
                images: item.productInfo.images?.mainImage
                  ? {
                      mainImage: fixImageUrl(item.productInfo.images.mainImage),
                      image1: fixImageUrl(item.productInfo.images.image1),
                      image2: fixImageUrl(item.productInfo.images.image2),
                    }
                  : {
                      mainImage: fixImageUrl((item.productInfo as any)?.imageUrl),
                      image1: null,
                      image2: null,
                    },
              }
            : undefined;

          return {
            productCode: item.productCode,
            quantity: item.quantity,
            choice: item.choice || undefined,
            productInfo: info,
          };
        }));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // If error, keep current state (could be network issue)
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get quantity for a specific product
   */
  const getItemQuantity = useCallback((productCode: string): number => {
    const item = cartItems.find(i => i.productCode === productCode);
    return item ? item.quantity : 0;
  }, [cartItems]);

  /**
   * Add item to cart with optimistic update
   */
  const addToCart = useCallback(async (
    productCode: string,
    quantity: number,
    choice?: string
  ): Promise<boolean> => {
    // Optimistic update
    const existingItem = cartItems.find(i => i.productCode === productCode);
    
    if (existingItem) {
      // Update existing item
      setCartItems(prev => prev.map(item =>
        item.productCode === productCode
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      // Add new item
      setCartItems(prev => [...prev, { productCode, quantity, choice }]);
    }

    try {
      // Sync with server (backend expects `variant`, UI still calls it `choice`)
      const response = await cartService.addToCart({ productCode, quantity, variant: choice });
      
      if (response.success) {
        // Dispatch event for other components (like NavBar)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
        
        // Refresh to get accurate server state
        await refreshCart();
        return true;
      } else {
        // Revert optimistic update on failure
        await refreshCart();
        return false;
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error?.response?.data || error?.message || error);
      // Revert optimistic update on error
      await refreshCart();
      return false;
    }
  }, [cartItems, refreshCart]);

  /**
   * Update item quantity with optimistic update
   */
  const updateQuantity = useCallback(async (
    productCode: string,
    quantityChange: number
  ): Promise<boolean> => {
    const existingItem = cartItems.find(i => i.productCode === productCode);
    
    if (!existingItem) {
      return false;
    }

    const newQuantity = existingItem.quantity + quantityChange;

    // Optimistic update
    if (newQuantity <= 0) {
      // Remove item if quantity becomes 0 or negative
      setCartItems(prev => prev.filter(item => item.productCode !== productCode));
    } else {
      setCartItems(prev => prev.map(item =>
        item.productCode === productCode
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }

    try {
      // Sync with server
      const response = await cartService.updateCartItem({ productCode, quantity: quantityChange });
      
      if (response.success) {
        // Dispatch event for other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
        
        // Refresh to get accurate server state
        await refreshCart();
        return true;
      } else {
        // Revert optimistic update on failure
        await refreshCart();
        return false;
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      // Revert optimistic update on error
      await refreshCart();
      return false;
    }
  }, [cartItems, refreshCart]);

  /**
   * Remove item from cart with optimistic update
   */
  const removeFromCart = useCallback(async (productCode: string): Promise<boolean> => {
    // Optimistic update
    setCartItems(prev => prev.filter(item => item.productCode !== productCode));

    try {
      // Sync with server
      const response = await cartService.removeFromCart({ productCode });
      
      if (response.success) {
        // Dispatch event for other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
        
        // Refresh to get accurate server state
        await refreshCart();
        return true;
      } else {
        // Revert optimistic update on failure
        await refreshCart();
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Revert optimistic update on error
      await refreshCart();
      return false;
    }
  }, [refreshCart]);

  /**
   * Load cart on mount and when authentication changes
   */
  useEffect(() => {
    refreshCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [refreshCart]);

  const value: CartContextType = {
    cartItems,
    cartCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    getItemQuantity,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook to use cart context
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};
