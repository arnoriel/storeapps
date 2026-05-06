"use client";

import { useAuthStore } from "@/lib/auth.store";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, accessToken, login, logout } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    const data = await apiFetch<{
      access_token: string;
      refresh_token: string;
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    const me = await apiFetch<{
      id: string;
      username: string;
      role: string;
      store_address: string | null;
      orders_count: number;
    }>("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    login(
      { accessToken: data.access_token, refreshToken: data.refresh_token },
      me
    );

    // Set cookie untuk middleware
    document.cookie = `auth-token=${data.access_token}; path=/; max-age=900`; // 15 menit

    router.push("/dashboard/overview");
  };

  const handleLogout = async () => {
    const { refreshToken } = useAuthStore.getState();
    if (refreshToken) {
      await apiFetch("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {}); // Silent fail
    }
    logout();
    document.cookie = "auth-token=; path=/; max-age=0"; // Hapus cookie
    router.push("/dashboard/login");
  };

  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    login: handleLogin,
    logout: handleLogout,
  };
}