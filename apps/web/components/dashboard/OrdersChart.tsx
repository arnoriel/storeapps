"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DayStats { date: string; count: number; }
interface WeekStats { week: string; amount: number; }

function formatRupiah(amount: number) {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return `Rp ${amount}`;
}

export function OrdersPerDayChart({ data }: { data: DayStats[] }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Order per Hari (7 hari)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            formatter={(v) => [`${Number(v)} order`, "Jumlah"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenuePerWeekChart({ data }: { data: WeekStats[] }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Omzet per Minggu (4 minggu)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={formatRupiah} />
          <Tooltip
            formatter={(v) => [formatRupiah(Number(v)), "Omzet"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#1a1a1a"
            strokeWidth={2}
            dot={{ fill: "#1a1a1a", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}