import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StoreHeader from "@/components/shared/StoreHeader";
import OrderStatus from "@/components/store/OrderStatus";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Order {
  order_number: string;
  order_status: string;
  paid_status: string;
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_email: string;
  shipping_courier: string | null;
  shipping_cost: number;
  total_amount: number;
  created_at: string;
}

async function getOrder(orderNumber: string): Promise<Order | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/orders/${orderNumber}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} — Status Pesanan`,
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) notFound();

  return (
    <>
      <StoreHeader />
      <OrderStatus order={order} />
    </>
  );
}