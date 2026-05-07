import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "@/components/store/ProductDetail";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Product {
  id: string;
  product_name: string;
  product_description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  weight_grams: number;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Generate metadata per produk — ini yang bikin SEO individual
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Produk Tidak Ditemukan" };
  }

  return {
    title: `${product.product_name} — Toko Online`,
    description:
      product.product_description ??
      `Beli ${product.product_name} dengan harga terbaik.`,
    openGraph: {
      title: product.product_name,
      description:
        product.product_description ??
        `Beli ${product.product_name} dengan harga terbaik.`,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}