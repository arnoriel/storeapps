"use client";

import { useClaimOrder } from "@/hooks/useOrders";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/button";

interface Props {
  orderId: string;
  handledById: string | null;
}

export default function ClaimOrderButton({ orderId, handledById }: Props) {
  const user = useAuthStore((s) => s.user);
  const { mutate: claimOrder, isPending } = useClaimOrder();

  // Hanya tampil untuk BRANCH dan order yang belum di-claim
  if (user?.role !== "BRANCH") return null;
  if (handledById !== null) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => claimOrder(orderId)}
      className="text-xs"
    >
      {isPending ? "..." : "Ambil Order"}
    </Button>
  );
}