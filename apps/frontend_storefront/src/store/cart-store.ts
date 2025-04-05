import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};

type CartActions = {
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
};

// Helper function to calculate cart totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,
      totalPrice: 0,

      // Actions
      addItem: (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
        
        let updatedItems;
        if (existingItemIndex >= 0) {
          // Item exists, update quantity
          updatedItems = [...state.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
          };
        } else {
          // New item, add to cart
          updatedItems = [...state.items, newItem];
        }
        
        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        return { items: updatedItems, totalItems, totalPrice };
      }),

      removeItem: (itemId) => set((state) => {
        const updatedItems = state.items.filter(item => item.id !== itemId);
        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        return { items: updatedItems, totalItems, totalPrice };
      }),

      updateQuantity: (itemId, quantity) => set((state) => {
        const updatedItems = state.items.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        );
        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        return { items: updatedItems, totalItems, totalPrice };
      }),

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    {
      name: 'hope-world-cart', // name for localStorage
    }
  )
);