"use client";

import { useCartStore } from "@/lib/stores/cart.store";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import Image from "next/image";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function OrderSummary() {
  const item = useCartStore((s) => s.item);
  const selected_shipping = useCheckoutStore((s) => s.selected_shipping);

  if (!item) return null;

  const subtotal = item.price * item.quantity;
  const shippingCost = selected_shipping?.cost ?? 0;
  const total = subtotal + shippingCost;

  return (
    <div className="bg-white border rounded-xl p-4 space-y-4 sticky top-24">
      <h3 className="font-semibold text-sm">Ringkasan Pesanan</h3>

      {/* Produk */}
      <div className="flex gap-3">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No img
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">{item.product_name}</p>
          <p className="text-xs text-gray-500">x{item.quantity}</p>
        </div>
      </div>

      {/* Breakdown harga */}
      <div className="space-y-2 text-sm border-t pt-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Ongkir</span>
          <span>
            {selected_shipping
              ? formatRupiah(shippingCost)
              : <span className="text-gray-400 text-xs">Pilih ekspedisi</span>}
          </span>
        </div>

        {selected_shipping && (
          <p className="text-xs text-gray-400">
            {selected_shipping.courier} {selected_shipping.service} · {selected_shipping.etd}
          </p>
        )}
      </div>

      {/* Total */}
      <div className="border-t pt-3 flex justify-between font-bold">
        <span>Total</span>
        <span>{formatRupiah(total)}</span>
      </div>
    </div>
  );
}