import { create } from "zustand";

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  addItem: (product, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
              : item
          ),
          isOpen: true
        };
      }

      return {
        items: [...state.items, { ...product, quantity: Math.min(quantity, product.stock) }],
        isOpen: true
      };
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    })),
  updateQty: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item
      )
    })),
  clearCart: () => set({ items: [], isOpen: false }),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  count: () => get().items.reduce((sum, item) => sum + item.quantity, 0)
}));

export default useCartStore;
