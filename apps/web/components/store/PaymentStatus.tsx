"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePaymentSSE } from "@/hooks/usePaymentSSE";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PaymentStatusProps {
  orderNumber: string;
  initialPaidStatus: string;
  paymentUrl: string | null;
}

const statusConfig = {
  PAID: {
    icon: "✅",
    title: "Pembayaran Berhasil!",
    subtitle: "Pesananmu sedang diproses oleh toko.",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  FAILED: {
    icon: "❌",
    title: "Pembayaran Gagal",
    subtitle: "Silakan coba lagi atau hubungi kami.",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
  UNPAID: {
    icon: "⏳",
    title: "Menunggu Pembayaran",
    subtitle: "Selesaikan pembayaranmu untuk melanjutkan.",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
  },
};

export default function PaymentStatus({
  orderNumber,
  initialPaidStatus,
  paymentUrl,
}: PaymentStatusProps) {
  const { paidStatus, isConnected } = usePaymentSSE({
    orderNumber,
    initialPaidStatus,
  });

  const config = statusConfig[paidStatus as keyof typeof statusConfig] ?? statusConfig.UNPAID;

  return (
    <div className="space-y-6">
      {/* Status card dengan animasi */}
      <AnimatePresence mode="wait">
        <motion.div
          key={paidStatus}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`border rounded-xl p-6 text-center ${config.bg}`}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-5xl mb-3"
          >
            {config.icon}
          </motion.div>
          <h2 className={`text-xl font-bold ${config.color} mb-1`}>
            {config.title}
          </h2>
          <p className="text-gray-500 text-sm">{config.subtitle}</p>

          {/* Indikator live */}
          {paidStatus === "UNPAID" && isConnected && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Memantau status pembayaran...
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tombol aksi */}
      <div className="space-y-3">
        {paidStatus === "UNPAID" && paymentUrl && (
          <Button
            className="w-full"
            onClick={() => (window.location.href = paymentUrl)}
          >
            Lanjutkan Pembayaran
          </Button>
        )}

        {paidStatus === "FAILED" && paymentUrl && (
          <Button
            className="w-full"
            variant="destructive"
            onClick={() => (window.location.href = paymentUrl)}
          >
            Coba Bayar Lagi
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