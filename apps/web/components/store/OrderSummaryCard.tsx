import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Order {
  order_number: string;
  order_status: string;
  customer_name: string;
  customer_email: string;
  shipping_courier: string | null;
  shipping_cost: number;
  total_amount: number;
  created_at: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const orderStatusMap: Record<string, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Diterima",
  CANCELLED: "Dibatalkan",
};

export default function OrderSummaryCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Detail Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">No. Order</span>
          <span className="font-mono font-semibold text-xs">{order.order_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Status Order</span>
          <Badge variant="outline">
            {orderStatusMap[order.order_status] ?? order.order_status}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Nama</span>
          <span>{order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Email</span>
          <span className="text-xs">{order.customer_email}</span>
        </div>
        {order.shipping_courier && (
          <div className="flex justify-between">
            <span className="text-gray-500">Kurir</span>
            <span>{order.shipping_courier}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Ongkir</span>
          <span>{formatRupiah(order.shipping_cost)}</span>
        </div>
        <div className="flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span>{formatRupiah(order.total_amount)}</span>
        </div>
        <div className="text-xs text-gray-400 text-right">
          {new Date(order.created_at).toLocaleString("id-ID")}
        </div>
      </CardContent>
    </Card>
  );
}