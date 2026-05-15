"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-7xl mb-6 block">🔍</span>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>Ke Beranda</Button>
          </Link>
          <Button variant="outline" onClick={() => history.back()}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}