"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Order {
  order_number: string;
  order_status: string;
  paid_status: string;
  customer_name: string;
  customer_email: string;
  shipping_courier: string | null;
  shipping_cost: number;
  total_amount: number;
  created_at: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getPaidStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return <Badge className="bg-green-100 text-green-700">Lunas</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Gagal</Badge>;
    default:
      return <Badge variant="secondary">Menunggu Pembayaran</Badge>;
  }
}

function getOrderStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: "Menunggu",
    CONFIRMED: "Dikonfirmasi",
    PROCESSING: "Diproses",
    SHIPPED: "Dikirim",
    DELIVERED: "Diterima",
    CANCELLED: "Dibatalkan",
  };
  return <Badge variant="outline">{map[status] ?? status}</Badge>;
}

export default function OrderStatus({ order }: { order: Order }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        {order.paid_status === "PAID" ? (
          <>
            <div className="text-5xl mb-3">✅</div>
            <h1 className="text-2xl font-bold text-gray-900">Pembayaran Berhasil!</h1>
            <p className="text-gray-500 mt-1">Pesananmu sedang diproses</p>
          </>
        ) : order.paid_status === "FAILED" ? (
          <>
            <div className="text-5xl mb-3">❌</div>
            <h1 className="text-2xl font-bold text-gray-900">Pembayaran Gagal</h1>
            <p className="text-gray-500 mt-1">Silakan coba lagi</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900">Menunggu Pembayaran</h1>
            <p className="text-gray-500 mt-1">Selesaikan pembayaranmu</p>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detail Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">No. Order</span>
            <span className="font-mono font-semibold">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status Bayar</span>
            {getPaidStatusBadge(order.paid_status)}
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status Order</span>
            {getOrderStatusBadge(order.order_status)}
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Nama</span>
            <span>{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span>{order.customer_email}</span>
          </div>
          {order.shipping_courier && (
            <div className="flex justify-between">
              <span className="text-gray-500">Kurir</span>
              <span>{order.shipping_courier}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-3 font-bold">
            <span>Total</span>
            <span>{formatRupiah(order.total_amount)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        {order.paid_status === "UNPAID" && (
          <Button
            className="w-full"
            onClick={async () => {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${order.order_number}/payment-link`
              );
              const data = await res.json();
              if (data.payment_url) window.location.href = data.payment_url;
            }}
          >
            Lanjutkan Pembayaran
          </Button>
        )}
        <Link href="/">
          <Button variant="outline" className="w-full">
            Kembali ke Toko
          </Button>
        </Link>
      </div>
    </div>
  );
}