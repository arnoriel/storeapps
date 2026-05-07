import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";

interface Product {
  id: string;
  product_name: string;
  product_description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  weight_grams: number;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}