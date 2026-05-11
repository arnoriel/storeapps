"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { useOrderStore } from "@/lib/stores/order.store";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function OverviewPage() {
  const { orders, isConnected } = useOrderStore();

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Overview</h2>

        {/* Live orders feed */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-4 text-sm text-gray-700">
            Live Order Feed
          </h3>

          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              {isConnected
                ? "Menunggu order masuk..."
                : "Connecting..."}
            </p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.order_number}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                >
                  <div>
                    <span className="font-mono font-semibold text-xs">
                      {order.order_number}
                    </span>
                    <p className="text-gray-500">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatRupiah(order.total_amount)}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.paid_status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paid_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}