import { create } from "zustand";

export interface OrderEvent {
  order_number: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  paid_status: string;
  timestamp: string;
}

interface OrderStore {
  orders: OrderEvent[];
  isConnected: boolean;
  addOrder: (order: OrderEvent) => void;
  updateOrder: (order: OrderEvent) => void;
  setConnected: (connected: boolean) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  isConnected: false,

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders].slice(0, 100), // max 100 items
    })),

  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.order_number === order.order_number ? { ...o, ...order } : o
      ),
    })),

  setConnected: (connected) => set({ isConnected: connected }),

  clearOrders: () => set({ orders: [] }),
}));