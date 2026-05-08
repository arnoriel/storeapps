import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CheckoutFormValues } from "@/lib/schemas/checkout.schema";

interface Coordinates {
  lat: number;
  lng: number;
}

interface CheckoutState {
  customerData: CheckoutFormValues | null;
  coordinates: Coordinates | null;
  auto_address: string | null;
  setCustomerData: (data: CheckoutFormValues) => void;
  setCoordinates: (coords: Coordinates) => void;
  setAutoAddress: (address: string) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      customerData: null,
      coordinates: null,
      auto_address: null,
      setCustomerData: (data) => set({ customerData: data }),
      setCoordinates: (coords) => set({ coordinates: coords }),
      setAutoAddress: (address) => set({ auto_address: address }),
      clearCheckout: () => set({
        customerData: null,
        coordinates: null,
        auto_address: null,
      }),
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);