import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  stock: number;
  image_url: string | null;
  weight_grams: number;
  quantity: number;
}

interface CartState {
  item: CartItem | null;
  setItem: (item: CartItem) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      item: null,
      setItem: (item) => set({ item }),
      clearCart: () => set({ item: null }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);