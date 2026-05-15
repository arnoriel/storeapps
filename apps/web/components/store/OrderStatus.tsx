"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

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

interface OrderStatusProps {
  order: Order;
  paymentUrl: string | null;
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

export default function OrderStatus({ order, paymentUrl }: OrderStatusProps) {
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const handleContinuePayment = async (url: string | null) => {
    if (url) {
      window.location.href = url;
      return;
    }

    // Fetch ulang payment link kalau tidak ada
    setIsLoadingPayment(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${order.order_number}/payment-link`
      );
      const data = await res.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error("Link pembayaran tidak tersedia. Hubungi toko.");
      }
    } catch {
      toast.error("Koneksi bermasalah. Coba lagi.");
    } finally {
      setIsLoadingPayment(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Status header */}
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
            <p className="text-gray-500 mt-1">Silakan coba bayar ulang</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900">Menunggu Pembayaran</h1>
            <p className="text-gray-500 mt-1">Selesaikan pembayaranmu</p>
          </>
        )}
      </div>

      {/* Detail order */}
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
            <span className="text-xs">{order.customer_email}</span>
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

      {/* Action buttons */}
      <div className="mt-6 space-y-3">
        {/* UNPAID — ada payment URL */}
        {order.paid_status === "UNPAID" && paymentUrl && (
          <>
            <Button
              className="w-full"
              disabled={isLoadingPayment}
              onClick={() => handleContinuePayment(paymentUrl)}
            >
              {isLoadingPayment ? "Memproses..." : "Lanjutkan Pembayaran"}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Kamu akan diarahkan ke halaman pembayaran HitPay yang aman
            </p>
          </>
        )}

        {/* UNPAID — payment URL tidak ada */}
        {order.paid_status === "UNPAID" && !paymentUrl && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 text-sm font-medium mb-1">
              Link pembayaran tidak tersedia
            </p>
            <p className="text-red-400 text-xs mb-3">
              Hubungi toko untuk mendapatkan link pembayaran baru.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoadingPayment}
              onClick={() => handleContinuePayment(null)}
            >
              {isLoadingPayment ? "Memuat..." : "Coba Ambil Link Baru"}
            </Button>
          </div>
        )}

        {/* FAILED — retry */}
        {order.paid_status === "FAILED" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 text-sm font-medium mb-3">
              Pembayaran tidak berhasil diproses
            </p>
            <Button
              variant="destructive"
              className="w-full"
              disabled={isLoadingPayment}
              onClick={() => handleContinuePayment(paymentUrl)}
            >
              {isLoadingPayment ? "Memuat..." : "Coba Bayar Lagi"}
            </Button>
          </div>
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