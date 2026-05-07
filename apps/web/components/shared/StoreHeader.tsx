"use client";

import Link from "next/link";
import CartBadge from "@/components/shared/CartBadge";

export default function StoreHeader() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          🛍️ Toko Online
        </Link>
        <CartBadge />
      </div>
    </header>
  );
}