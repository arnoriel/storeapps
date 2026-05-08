import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CheckoutFormValues } from "@/lib/schemas/checkout.schema";

interface Coordinates {
  lat: number;
  lng: number;
}

export interface ShippingOption {
  courier: string;
  courier_code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface CheckoutState {
  customerData: CheckoutFormValues | null;
  coordinates: Coordinates | null;
  auto_address: string | null;
  selected_shipping: ShippingOption | null;
  setCustomerData: (data: CheckoutFormValues) => void;
  setCoordinates: (coords: Coordinates) => void;
  setAutoAddress: (address: string) => void;
  setSelectedShipping: (option: ShippingOption) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      customerData: null,
      coordinates: null,
      auto_address: null,
      selected_shipping: null,
      setCustomerData: (data) => set({ customerData: data }),
      setCoordinates: (coords) => set({ coordinates: coords }),
      setAutoAddress: (address) => set({ auto_address: address }),
      setSelectedShipping: (option) => set({ selected_shipping: option }),
      clearCheckout: () =>
        set({
          customerData: null,
          coordinates: null,
          auto_address: null,
          selected_shipping: null,
        }),
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);