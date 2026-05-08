"use client";

import { useShippingOptions, type FlatShippingOption } from "@/hooks/useShippingOptions";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import { useCartStore } from "@/lib/stores/cart.store";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ShippingOptions() {
  const coordinates = useCheckoutStore((s) => s.coordinates);
  const selected_shipping = useCheckoutStore((s) => s.selected_shipping);
  const setSelectedShipping = useCheckoutStore((s) => s.setSelectedShipping);
  const item = useCartStore((s) => s.item);

  const { data, isLoading, isError } = useShippingOptions(
    coordinates?.lat ?? null,
    coordinates?.lng ?? null,
    item?.product_id ?? null
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Gagal mengambil opsi pengiriman. Pastikan lokasi sudah dipilih.
      </div>
    );
  }

  if (!data || data.options.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        Tidak ada opsi pengiriman tersedia untuk lokasi ini.
      </div>
    );
  }

  const handleSelect = (option: FlatShippingOption) => {
    setSelectedShipping({
      courier: option.courier,
      courier_code: option.courier_code,
      service: option.service,
      description: option.description,
      cost: option.cost,
      etd: option.etd,
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-3">
        Pengiriman ke: <span className="font-medium">{data.destination_city}</span>
      </p>
      {data.options.map((option) => {
        const isSelected =
        selected_shipping?.courier_code === option.courier_code &&
        selected_shipping?.service === option.service;

        return (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
              isSelected
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm">
                  {option.courier} {option.service}
                </span>
                <p className="text-xs text-gray-500">{option.description} · {option.etd}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{formatRupiah(option.cost)}</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-black" : "border-gray-300"
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}