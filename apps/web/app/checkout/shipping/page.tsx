"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart.store";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import StoreHeader from "@/components/shared/StoreHeader";
import LocationPicker from "@/components/store/LocationPicker";
import ShippingOptions from "@/components/store/ShippingOptions";
import OrderSummary from "@/components/store/OrderSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ShippingPage() {
  const router = useRouter();
  const item = useCartStore((s) => s.item);
  const { customerData, coordinates, selected_shipping, setCoordinates, setAutoAddress } =
    useCheckoutStore();

  if (!item || !customerData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Silakan mulai dari awal.</p>
        <Link href="/">
          <Button variant="outline" className="min-h-[44px]">Ke Beranda</Button>
        </Link>
      </div>
    );
  }

  const handleLocationSelect = (
    coords: { lat: number; lng: number },
    address: string
  ) => {
    setCoordinates(coords);
    setAutoAddress(address);
  };

  return (
    <>
      <StoreHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step indicator — scroll horizontal di mobile */}
        <div className="flex items-center gap-2 mb-8 text-sm overflow-x-auto pb-1 whitespace-nowrap">
          <span className="text-gray-400">1. Data Diri</span>
          <span className="text-gray-300">→</span>
          <span className="font-semibold text-black">2. Pengiriman</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">3. Pembayaran</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order summary — tampil di atas di mobile, kanan di desktop */}
          <div className="md:col-span-1 md:order-last">
            <OrderSummary />
          </div>

          <div className="md:col-span-2 md:order-first space-y-6">
            {/* Lokasi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lokasi Pengiriman</CardTitle>
              </CardHeader>
              <CardContent>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialCoords={coordinates}
                />
              </CardContent>
            </Card>

            {/* Ekspedisi */}
            {coordinates && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pilih Ekspedisi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShippingOptions />
                </CardContent>
              </Card>
            )}

            {/* Tombol navigasi — full width, min 44px */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => router.back()}
              >
                ← Kembali
              </Button>
              <Button
                className="flex-1 min-h-[44px]"
                disabled={!selected_shipping}
                onClick={() => router.push("/checkout/payment")}
              >
                Lanjut ke Pembayaran →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}