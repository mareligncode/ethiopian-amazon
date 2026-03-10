import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]); // Items saved for later
  const [loading, setLoading] = useState(false);

  // UI State for Cart Drawer
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Fetch cart from backend whenever user changes (logs in)
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setSavedItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/cart/');
      if (resp.data.cart) {
        // Assume backend returns all cart items. We might filter them locally based on is_saved_for_later if that exists.
        const activeItems = resp.data.cart.filter(item => !item.is_saved_for_later);
        const laterItems = resp.data.cart.filter(item => item.is_saved_for_later);
        setCartItems(activeItems);
        setSavedItems(laterItems);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      console.log("Adding to cart:", { productId: product.id, quantity });
      await api.post('/cart/', { product_id: product.id, quantity });
      await fetchCart(); // Refresh cart to get accurate backend state
      setLastAddedItem({ ...product, quantity });
      setIsCartDrawerOpen(true); // Open the side drawer automatically instead of an alert
    } catch (err) {
      console.error("Error adding to cart", err);
      const errorMsg = err.response?.data?.error || "Could not add to cart. Stock may be limited.";
      alert(errorMsg);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }
    try {
      await api.put(`/cart/${cartItemId}`, { quantity });
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      fetchCart();
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  const toggleSaveForLater = async (cartItemId) => {
    try {
      await api.put(`/cart/${cartItemId}/save-for-later`);
      fetchCart();
    } catch (err) {
      console.error("Error saving for later", err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/');
      fetchCart();
    } catch (err) {
      console.error("Error clearing cart", err);
    }
  };

  const getCartTotal = () => {
    return cartItems
      .filter(item => item.is_selected !== false) // Default to true if undefined
      .reduce((total, item) => total + (item.Product.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      savedItems,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleSaveForLater,
      clearCart,
      getCartTotal,
      getCartCount,
      refreshCart: fetchCart,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
      lastAddedItem
    }}>
      {children}
    </CartContext.Provider>
  );
};
