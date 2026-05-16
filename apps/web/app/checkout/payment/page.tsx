"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart.store";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import StoreHeader from "@/components/shared/StoreHeader";
import OrderSummary from "@/components/store/OrderSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentPage() {
  const router = useRouter();
  const item = useCartStore((s) => s.item);
  const clearCart = useCartStore((s) => s.clearCart);
  const {
    customerData,
    coordinates,
    selected_shipping,
    clearCheckout,
  } = useCheckoutStore();
  const { mutate: createOrder, isPending } = useCreateOrder();

  if (!item || !customerData || !selected_shipping) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Silakan mulai dari awal.</p>
        <Link href="/"><Button variant="outline">Ke Beranda</Button></Link>
      </div>
    );
  }

  const subtotal = item.price * item.quantity;
  const total = subtotal + selected_shipping.cost;

  const handlePay = () => {
    createOrder(
      {
        product_id: item.product_id,
        quantity: item.quantity,
        customer_name: customerData.customer_name,
        customer_phone: customerData.customer_phone,
        customer_email: customerData.customer_email,
        customer_address: customerData.customer_address,
        customer_location: coordinates,
        shipping_cost: selected_shipping.cost,
        shipping_courier: `${selected_shipping.courier} ${selected_shipping.service}`,
        total_amount: total,
      },
      {
        onSuccess: () => {
          clearCart();
          clearCheckout();
        },
      }
    );
  };

  return (
    <>
      <StoreHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <span className="text-gray-400">1. Data Diri</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">2. Pengiriman</span>
          <span className="text-gray-300">→</span>
          <span className="font-semibold text-black">3. Pembayaran</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {/* Ringkasan data diri */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Penerima</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama</span>
                  <span className="font-medium">{customerData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">No. HP</span>
                  <span>{customerData.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span>{customerData.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Alamat</span>
                  <span className="text-right max-w-[60%]">{customerData.customer_address}</span>
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={() => router.push("/checkout")}
                >
                  Ubah data
                </Button>
              </CardContent>
            </Card>

            {/* Ringkasan pengiriman */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Kurir</span>
                  <span className="font-medium">
                    {selected_shipping.courier} {selected_shipping.service}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimasi</span>
                  <span>{selected_shipping.etd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkir</span>
                  <span>{formatRupiah(selected_shipping.cost)}</span>
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={() => router.push("/checkout/shipping")}
                >
                  Ubah pengiriman
                </Button>
              </CardContent>
            </Card>

            {/* Tombol bayar */}
            <Button
              className="w-full min-h-[44px]"
              size="lg"
              onClick={handlePay}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : `Bayar ${formatRupiah(total)}`}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Kamu akan diarahkan ke halaman pembayaran HitPay yang aman
            </p>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </>
  );
}