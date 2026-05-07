import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CheckoutFormValues } from "@/lib/schemas/checkout.schema";

interface CheckoutState {
  customerData: CheckoutFormValues | null;
  setCustomerData: (data: CheckoutFormValues) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      customerData: null,
      setCustomerData: (data) => set({ customerData: data }),
      clearCheckout: () => set({ customerData: null }),
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);