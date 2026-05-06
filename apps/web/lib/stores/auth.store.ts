import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserResponse {
  id: string;
  username: string;
  role: string;
  store_address: string | null;
  orders_count: number;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  login: (tokens: { accessToken: string; refreshToken: string }, user: UserResponse) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      login: (tokens, user) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),

      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: "auth-storage",
      // Hanya persist refreshToken dan user — accessToken di memory
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);