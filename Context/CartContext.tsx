/**
 * Cart Context - Centralized cart state management
 * Handles both authenticated and guest users
 * Provides optimistic UI updates with server synchronization
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '@/services/cart.service';
import { hasCustomerToken } from '@/lib/tokenUtils';

interface CartItem {
  productCode: string;
  quantity: number;
  choice?: string;
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
  const [isLoading, setIsLoading] = useState(false);

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
        setCartItems(response.data.customer_cart_products.map(item => ({
          productCode: item.productCode,
          quantity: item.quantity,
          choice: item.choice || undefined,
        })));
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
      // Sync with server
      const response = await cartService.addToCart({ productCode, quantity, choice });
      
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
    } catch (error) {
      console.error('Error adding to cart:', error);
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
