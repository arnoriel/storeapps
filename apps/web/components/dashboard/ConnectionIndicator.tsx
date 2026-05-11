"use client";

import { useOrderStore } from "@/lib/stores/order.store";

export default function ConnectionIndicator() {
  const isConnected = useOrderStore((s) => s.isConnected);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${
          isConnected
            ? "bg-green-500 animate-pulse"
            : "bg-red-500"
        }`}
      />
      <span className={isConnected ? "text-green-600" : "text-red-500"}>
        {isConnected ? "Live" : "Disconnected"}
      </span>
    </div>
  );
}