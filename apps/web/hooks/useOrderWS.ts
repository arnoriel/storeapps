"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOrderStore } from "@/lib/stores/order.store";

const WS_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
  .replace("http://", "ws://")
  .replace("https://", "wss://");

const MIN_RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 30000;

export function useOrderWS() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { addOrder, updateOrder, setConnected } = useOrderStore();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(MIN_RECONNECT_DELAY);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!accessToken || !isMounted.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}/api/v1/ws/dashboard`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Auth via first message
      ws.send(JSON.stringify({ token: accessToken }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle auth success response
        if (data.type === "auth_success") {
          setConnected(true);
          reconnectDelay.current = MIN_RECONNECT_DELAY; // reset backoff
          return;
        }

        // Handle order events
        if (data.order_number) {
          const isNew = !useOrderStore
            .getState()
            .orders.some((o) => o.order_number === data.order_number);

          if (isNew) {
            addOrder(data);
          } else {
            updateOrder(data);
          }
        }
      } catch {
        // ignore parse error
      }
    };

    ws.onclose = () => {
      setConnected(false);

      if (!isMounted.current) return;

      // Exponential backoff reconnect
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(
          reconnectDelay.current * 2,
          MAX_RECONNECT_DELAY
        );
        connect();
      }, reconnectDelay.current);
    };

    ws.onerror = () => {
      setConnected(false);
      ws.close();
    };
  }, [accessToken, addOrder, updateOrder, setConnected]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    // Tambah ini:
    const handleOnline = () => {
      reconnectDelay.current = MIN_RECONNECT_DELAY; // reset backoff
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      connect();
    };

    const handleOffline = () => {
      setConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      setConnected(false);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [connect, setConnected]);
}