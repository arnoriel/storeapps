import ProductGrid from "@/components/store/ProductGrid";
import SkeletonCard from "@/components/shared/SkeletonCard";
import StoreHeader from "@/components/shared/StoreHeader";
import type { Metadata } from "next";
import { Suspense } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const metadata: Metadata = {
  title: "Toko Online — Produk Terbaru",
  description: "Temukan produk terbaik dengan harga terjangkau.",
};

interface Product {
  id: string;
  product_name: string;
  product_description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  weight_grams: number;
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products?page=1&limit=20`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items;
  } catch {
    return [];
  }
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

async function ProductSection() {
  const products = await getProducts();
  return (
    <>
      <p className="text-gray-500 mt-1 mb-8">
        {products.length > 0
          ? `${products.length} produk tersedia`
          : "Belum ada produk"}
      </p>
      <ProductGrid products={products} />
    </>
  );
}

export default function StorePage() {
  return (
    <>
      <StoreHeader />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Produk Kami</h1>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductSection />
        </Suspense>
      </main>
    </>
  );
}