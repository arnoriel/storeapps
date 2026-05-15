import ProductCard from "./ProductCard";
import EmptyState from "@/components/shared/EmptyState";

interface Product {
  id: string;
  product_name: string;
  product_description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  weight_grams: number;
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon="🛍️"
        title="Belum ada produk"
        subtitle="Produk akan muncul di sini setelah ditambahkan oleh toko."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}