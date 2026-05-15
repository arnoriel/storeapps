"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handleApiError";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface CreateOrderPayload {
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  customer_location: { lat: number; lng: number } | null;
  shipping_cost: number;
  shipping_courier: string;
  total_amount: number;
}

interface CreateOrderResponse {
  order_number: string;
  payment_url: string;
  total_amount: number;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
      const res = await fetch(`${API_URL}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? "Gagal membuat order");
      }

      return res.json();
    },

    onSuccess: (data) => {
      toast.success("Order berhasil dibuat! Mengarahkan ke halaman pembayaran...");
      // Redirect full page ke HitPay
      setTimeout(() => {
        window.location.href = data.payment_url;
      }, 1000);
    },

    onError: (error: Error) => {
      toast.error(handleApiError(error));
    },
  });
}