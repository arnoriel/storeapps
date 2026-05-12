"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import OrdersTable from "@/components/dashboard/OrdersTable";

export default function OrdersPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Manajemen Order</h2>
        <OrdersTable />
      </div>
    </DashboardShell>
  );
}