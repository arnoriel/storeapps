"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart.store";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import StoreHeader from "@/components/shared/StoreHeader";
import LocationPicker from "@/components/store/LocationPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ShippingPage() {
  const router = useRouter();
  const item = useCartStore((state) => state.item);
  const { customerData, coordinates, auto_address, setCoordinates, setAutoAddress } =
    useCheckoutStore();

  // Guard: harus ada cart dan customer data
  if (!item || !customerData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Silakan mulai dari awal.</p>
        <Link href="/">
          <Button variant="outline">Ke Beranda</Button>
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

  const handleNext = () => {
    if (!coordinates) return;
    router.push("/checkout/payment");
  };

  return (
    <>
      <StoreHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <span className="text-gray-400">1. Data Diri</span>
          <span className="text-gray-300">→</span>
          <span className="font-semibold text-black">2. Pengiriman</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">3. Pembayaran</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lokasi Pengiriman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialCoords={coordinates}
            />

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                ← Kembali
              </Button>
              <Button
                className="flex-1"
                disabled={!coordinates}
                onClick={handleNext}
              >
                Lanjut ke Pembayaran →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}