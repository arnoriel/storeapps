import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  product_name: string;
  product_description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  weight_grams: number;
}

interface ProductCardProps {
  product: Product;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        {/* Gambar */}
        <div className="relative aspect-square bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.product_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                Stok Habis
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
            {product.product_name}
          </h3>
          {product.product_description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {product.product_description}
            </p>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
          <span className="font-bold text-gray-900">
            {formatRupiah(product.price)}
          </span>
          <span className="text-xs text-gray-400">
            Stok: {product.stock}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}