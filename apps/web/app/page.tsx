import ProductGrid from "@/components/store/ProductGrid";
import StoreHeader from "@/components/shared/StoreHeader";
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
      next: { revalidate: 60 },
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
    <>
      <StoreHeader />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Produk Kami</h1>
          <p className="text-gray-500 mt-1">
            {products.length > 0
              ? `${products.length} produk tersedia`
              : "Belum ada produk"}
          </p>
        </div>
        <ProductGrid products={products} />
      </main>
    </>
  );
}