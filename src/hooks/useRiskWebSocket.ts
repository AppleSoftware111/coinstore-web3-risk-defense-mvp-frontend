import { useCallback, useEffect, useRef, useState } from "react";
import { getWsUrl } from "../lib/apiBase";
import type { WsMessage } from "../types";

export type WsConnectionStatus = "connecting" | "connected" | "disconnected";

export function useRiskWebSocket(onMessage: (msg: WsMessage) => void): WsConnectionStatus {
  const [status, setStatus] = useState<WsConnectionStatus>("connecting");
  const handlerRef = useRef(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  const stableOnMessage = useCallback((data: string) => {
    try {
      handlerRef.current(JSON.parse(data) as WsMessage);
    } catch {
      // ignore malformed websocket payloads
    }
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      setStatus("connecting");
      ws = new WebSocket(getWsUrl());
      ws.onopen = () => setStatus("connected");
      ws.onmessage = (event) => stableOnMessage(String(event.data));
      ws.onclose = () => {
        setStatus("disconnected");
        if (!cancelled) window.setTimeout(connect, 2000);
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [stableOnMessage]);

  return status;
}
