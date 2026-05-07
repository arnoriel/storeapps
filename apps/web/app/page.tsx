import ProductGrid from "@/components/store/ProductGrid";
import type { Metadata } from "next";

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

interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products?page=1&limit=20`, {
      next: { revalidate: 60 }, // revalidate setiap 60 detik
    });

    if (!res.ok) return [];

    const data: ProductListResponse = await res.json();
    return data.items;
  } catch {
    return [];
  }
}

export default async function StorePage() {
  const products = await getProducts();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Produk Kami</h1>
        <p className="text-gray-500 mt-1">
          {products.length > 0
            ? `${products.length} produk tersedia`
            : "Memuat produk..."}
        </p>
      </div>

      {/* Grid */}
      <ProductGrid products={products} />
    </main>
  );
}