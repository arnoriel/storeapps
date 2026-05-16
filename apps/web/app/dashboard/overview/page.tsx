"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import MetricCard from "@/components/dashboard/MetricCard";
import { OrdersPerDayChart, RevenuePerWeekChart } from "@/components/dashboard/OrdersChart";
import { useDashboardStats } from "@/hooks/useDashboardStats";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function OverviewPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Overview</h2>

        {/* Metric Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"> 
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"> 
            <MetricCard
              title="Omzet Bulan Ini"
              value={formatRupiah(stats.omzet_this_month)}
              subtitle="Order dengan status PAID"
              icon="💰"
            />
            <MetricCard
              title="Order Bulan Ini"
              value={stats.orders_this_month}
              subtitle="Total semua order"
              icon="📦"
            />
            <MetricCard
              title="Total Refund"
              value={formatRupiah(stats.total_refunds)}
              subtitle="v2.0 feature"
              icon="↩️"
            />
            <MetricCard
              title="Produk Aktif"
              value={stats.active_products}
              subtitle="Tersedia di storefront"
              icon="🛍️"
            />
          </div>
        ) : null}

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrdersPerDayChart data={stats.orders_per_day} />
            <RevenuePerWeekChart data={stats.revenue_per_week} />
          </div>
        )}
      </div>
    </DashboardShell>
  );
}