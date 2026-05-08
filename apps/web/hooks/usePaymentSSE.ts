"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const RECONNECT_DELAY = 3000;

interface PaymentEvent {
  order_number: string;
  paid_status: "PAID" | "FAILED" | "UNPAID";
}

interface UsePaymentSSEOptions {
  orderNumber: string;
  initialPaidStatus: string;
  onStatusChange?: (status: string) => void;
}

export function usePaymentSSE({
  orderNumber,
  initialPaidStatus,
  onStatusChange,
}: UsePaymentSSEOptions) {
  const [paidStatus, setPaidStatus] = useState(initialPaidStatus);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFinalStatus = paidStatus === "PAID" || paidStatus === "FAILED";

  const connect = () => {
    // Skip jika status sudah final
    if (isFinalStatus) return;

    const url = `${API_URL}/api/v1/stream/payment/${orderNumber}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const data: PaymentEvent = JSON.parse(event.data);
        setPaidStatus(data.paid_status);
        onStatusChange?.(data.paid_status);

        // Close jika status final
        if (data.paid_status === "PAID" || data.paid_status === "FAILED") {
          es.close();
          setIsConnected(false);
        }
      } catch {
        // ignore parse error
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();

      // Auto-reconnect setelah 3 detik jika belum final
      if (paidStatus !== "PAID" && paidStatus !== "FAILED") {
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY);
      }
    };
  };

  useEffect(() => {
    // Skip SSE jika status sudah final saat halaman dibuka
    if (isFinalStatus) return;

    connect();

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [orderNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  return { paidStatus, isConnected };
}