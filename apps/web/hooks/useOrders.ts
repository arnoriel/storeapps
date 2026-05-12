"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth.store";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Order {
  id: string;
  order_number: string;
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  shipping_courier: string | null;
  shipping_cost: number;
  total_amount: number;
  order_status: string;
  paid_status: string;
  handled_by_id: string | null;
  created_at: string;
}

interface OrderFilters {
  order_status?: string;
  paid_status?: string;
  search?: string;
  page?: number;
}

function useAuthHeaders() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

export function useOrders(filters: OrderFilters = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const headers = useAuthHeaders();

  const params = new URLSearchParams();
  if (filters.order_status) params.set("order_status", filters.order_status);
  if (filters.paid_status) params.set("paid_status", filters.paid_status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  params.set("limit", "20");

  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async (): Promise<Order[]> => {
      const res = await fetch(`${API_URL}/api/v1/orders?${params}`, { headers });
      if (!res.ok) throw new Error("Gagal mengambil data order");
      return res.json();
    },
    enabled: !!accessToken,
    staleTime: 30 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const headers = useAuthHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, order_status }: { orderId: string; order_status: string }) => {
      const res = await fetch(`${API_URL}/api/v1/orders/${orderId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ order_status }),
      });
      if (!res.ok) throw new Error("Gagal update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status order diperbarui");
    },
    onError: () => toast.error("Gagal update status order"),
  });
}

export function useClaimOrder() {
  const headers = useAuthHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`${API_URL}/api/v1/orders/${orderId}/claim`, {
        method: "PATCH",
        headers,
      });
      if (!res.ok) throw new Error("Gagal claim order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order berhasil di-claim");
    },
    onError: () => toast.error("Gagal claim order"),
  });
}