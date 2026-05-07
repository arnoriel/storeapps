"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/stores/cart.store";
import { ShoppingCart } from "lucide-react";

export default function CartBadge() {
  const item = useCartStore((state) => state.item);
  const count = item ? item.quantity : 0;

  return (
    <Link href="/checkout" className="relative inline-flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}