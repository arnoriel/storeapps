"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl mb-6 block">⚠️</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Maaf, ada yang tidak beres. Tim kami sudah diberitahu. Coba muat ulang
          halaman.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Coba Lagi</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Ke Beranda
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-6 text-xs text-red-400 font-mono text-left bg-red-50 p-3 rounded-lg">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}