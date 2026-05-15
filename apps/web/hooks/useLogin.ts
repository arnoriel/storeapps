"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/lib/handleApiError";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface LoginPayload {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface UserResponse {
  id: string;
  username: string;
  role: string;
  store_address: string | null;
  orders_count: number;
}

export function useLogin() {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json().catch(() => ({}));
        throw new Error(err?.detail ?? "Login gagal");
      }

      const tokens: TokenResponse = await loginRes.json();

      const meRes = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!meRes.ok) throw new Error("Gagal mengambil data user");
      const user: UserResponse = await meRes.json();

      return { tokens, user };
    },

    onSuccess: ({ tokens, user }) => {
      login(
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        user
      );

      document.cookie = `auth-token=${tokens.access_token}; path=/; max-age=900`;

      router.push("/dashboard/overview");
    },

    onError: (error: Error) => {
      // Error tetap ditampilkan di form via error state LoginForm.tsx
      // Toast sebagai fallback untuk error yang tidak ter-handle di UI
      const msg = handleApiError(error);
      if (msg.includes("Sesi") || msg.includes("server") || msg.includes("internet")) {
        toast.error(msg);
      }
    },
  });
}