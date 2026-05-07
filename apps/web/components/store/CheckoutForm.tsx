"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart.store";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/schemas/checkout.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutForm() {
  const router = useRouter();
  const item = useCartStore((state) => state.item);
  const setCustomerData = useCheckoutStore((state) => state.setCustomerData);
  const customerData = useCheckoutStore((state) => state.customerData);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: customerData ?? {},
  });

  // Cart kosong — redirect ke homepage
  if (!item) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Cart kamu kosong.</p>
        <Link href="/">
          <Button variant="outline">Lihat Produk</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = (data: CheckoutFormValues) => {
    setCustomerData(data);
    router.push("/checkout/shipping");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className="font-semibold text-black">1. Data Diri</span>
        <span className="text-gray-300">→</span>
        <span className="text-gray-400">2. Pengiriman</span>
        <span className="text-gray-300">→</span>
        <span className="text-gray-400">3. Pembayaran</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Data Penerima</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Nama */}
                <div className="space-y-1">
                  <Label htmlFor="customer_name">Nama Lengkap</Label>
                  <Input
                    id="customer_name"
                    placeholder="Masukkan nama lengkap"
                    {...register("customer_name")}
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-xs">{errors.customer_name.message}</p>
                  )}
                </div>

                {/* No HP */}
                <div className="space-y-1">
                  <Label htmlFor="customer_phone">Nomor HP</Label>
                  <Input
                    id="customer_phone"
                    placeholder="081234567890"
                    {...register("customer_phone")}
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-xs">{errors.customer_phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    placeholder="email@contoh.com"
                    {...register("customer_email")}
                  />
                  {errors.customer_email && (
                    <p className="text-red-500 text-xs">{errors.customer_email.message}</p>
                  )}
                </div>

                {/* Alamat */}
                <div className="space-y-1">
                  <Label htmlFor="customer_address">Alamat Lengkap</Label>
                  <textarea
                    id="customer_address"
                    rows={3}
                    placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    {...register("customer_address")}
                  />
                  {errors.customer_address && (
                    <p className="text-red-500 text-xs">{errors.customer_address.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  Lanjut ke Pengiriman →
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Gambar + nama produk */}
              <div className="flex gap-3">
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No img
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium line-clamp-2">{item.product_name}</p>
                  <p className="text-xs text-gray-500">x{item.quantity}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">{formatRupiah(item.price * item.quantity)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Ongkir dihitung di langkah berikutnya</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}