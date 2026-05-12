"use client";

import { useUpdateOrderStatus } from "@/hooks/useOrders";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600",
  CONFIRMED: "text-blue-600",
  PROCESSING: "text-purple-600",
  SHIPPED: "text-orange-600",
  DELIVERED: "text-green-600",
  CANCELLED: "text-red-600",
};

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusDropdown({ orderId, currentStatus }: Props) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => updateStatus({ orderId, order_status: e.target.value })}
      className={`text-xs border rounded px-2 py-1 bg-white cursor-pointer ${
        STATUS_COLORS[currentStatus] ?? ""
      }`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}