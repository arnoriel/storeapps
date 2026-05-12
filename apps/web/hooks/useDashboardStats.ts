"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface DayStats { date: string; count: number; }
interface WeekStats { week: string; amount: number; }

export interface DashboardStats {
  omzet_this_month: number;
  orders_this_month: number;
  total_refunds: number;
  active_products: number;
  orders_per_day: DayStats[];
  revenue_per_week: WeekStats[];
}

export function useDashboardStats() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const res = await fetch(`${API_URL}/api/v1/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error("Gagal mengambil statistik");
      return res.json();
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,   // 5 menit
    refetchInterval: 5 * 60 * 1000,
  });
}