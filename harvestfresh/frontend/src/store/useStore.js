import { create } from 'zustand';
import api from '../services/api';

export const useStore = create((set, get) => ({
  // Auth state
  user: JSON.parse(localStorage.getItem('harvestfresh_user') || 'null'),
  token: localStorage.getItem('harvestfresh_token') || null,
  
  setAuth: (token, user) => {
    localStorage.setItem('harvestfresh_token', token);
    localStorage.setItem('harvestfresh_user', JSON.stringify(user));
    set({ token, user });
    get().fetchCart();
  },
  
  logout: () => {
    localStorage.removeItem('harvestfresh_token');
    localStorage.removeItem('harvestfresh_user');
    set({ token: null, user: null, cartItems: [], cartSubtotal: 0, cartItemCount: 0 });
  },

  // Cart state
  cartItems: [],
  cartSubtotal: 0,
  cartItemCount: 0,
  cartLoading: false,

  fetchCart: async () => {
    const { token } = get();
    if (!token) return;
    try {
      set({ cartLoading: true });
      const res = await api.get('/cart');
      set({
        cartItems: res.data.items || [],
        cartSubtotal: res.data.subtotal || 0,
        cartItemCount: res.data.item_count || 0,
        cartLoading: false
      });
    } catch (err) {
      set({ cartLoading: false });
    }
  },

  addToCart: async (productId, qty = 1) => {
    const { token, cartItems } = get();
    if (!token) {
      // Local fallback for guest
      get().showToast("Please log in to add items to your cart", "warning");
      return false;
    }
    try {
      const res = await api.post('/cart/items', { product_id: productId, qty });
      set({
        cartItems: res.data.items || [],
        cartSubtotal: res.data.subtotal || 0,
        cartItemCount: res.data.item_count || 0
      });
      get().showToast("Item added to fresh cart!", "success");
      return true;
    } catch (err) {
      get().showToast(err.response?.data?.detail || "Failed to add item", "error");
      return false;
    }
  },

  updateCartQty: async (productId, qty) => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await api.patch(`/cart/items/${productId}`, { qty });
      set({
        cartItems: res.data.items || [],
        cartSubtotal: res.data.subtotal || 0,
        cartItemCount: res.data.item_count || 0
      });
    } catch (err) {
      get().showToast("Failed to update quantity", "error");
    }
  },

  removeFromCart: async (productId) => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      set({
        cartItems: res.data.items || [],
        cartSubtotal: res.data.subtotal || 0,
        cartItemCount: res.data.item_count || 0
      });
      get().showToast("Item removed from cart", "info");
    } catch (err) {
      get().showToast("Failed to remove item", "error");
    }
  },

  clearCart: async () => {
    const { token } = get();
    if (!token) return;
    try {
      await api.delete('/cart/clear');
      set({ cartItems: [], cartSubtotal: 0, cartItemCount: 0 });
    } catch (err) {
      console.error("Error clearing cart", err);
    }
  },

  // Pincode / Delivery location state
  currentPincode: localStorage.getItem('harvestfresh_pincode') || '560038',
  deliveryEta: 'Under 45 Mins',
  pincodeVerified: true,

  setPincode: (pincode, eta = 'Under 60 Mins') => {
    localStorage.setItem('harvestfresh_pincode', pincode);
    set({ currentPincode: pincode, deliveryEta: eta, pincodeVerified: true });
  },

  // Toast notification state
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => {
      set((state) => (state.toast?.id === get().toast?.id ? { toast: null } : state));
    }, 3500);
  },
  hideToast: () => set({ toast: null })
}));
