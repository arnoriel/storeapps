"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart.store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  product_name: string;
  product_description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  weight_grams: number;
}

interface ProductDetailProps {
  product: Product;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const isOutOfStock = product.stock === 0;
  const setItem = useCartStore((state) => state.setItem);
  const router = useRouter();

  const handleBuy = () => {
    setItem({
      product_id: product.id,
      product_name: product.product_name,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      weight_grams: product.weight_grams,
      quantity: 1,
    });
    router.push("/checkout");
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Produk
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.product_name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gambar */}
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.product_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.product_name}
          </h1>

          <p className="text-3xl font-bold text-gray-900 mb-4">
            {formatRupiah(product.price)}
          </p>

          <div className="mb-4">
            {isOutOfStock ? (
              <Badge variant="destructive">Stok Habis</Badge>
            ) : (
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                Stok tersedia: {product.stock}
              </Badge>
            )}
          </div>

          {product.product_description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Deskripsi
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.product_description}
              </p>
            </div>
          )}

          <div className="mb-8 text-sm text-gray-500">
            Berat: {product.weight_grams}g
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={isOutOfStock}
            onClick={handleBuy}
          >
            {isOutOfStock ? "Stok Habis" : "Beli Sekarang"}
          </Button>
        </div>
      </div>
    </main>
  );
}