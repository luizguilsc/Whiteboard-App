'use client';

import { useCallback, useEffect, useRef } from 'react';

export type WsMessage = {
  type:
    | 'element_update'
    | 'element_delete'
    | 'connection_update'
    | 'connection_delete'
    | 'cursor';
  payload: unknown;
};

export function useWebSocket(
  boardId: string,
  onMessage: (msg: WsMessage) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000';
    const ws = new WebSocket(`${base}/api/ws/${boardId}`);
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as WsMessage;
        onMessageRef.current(data);
      } catch {
        // ignore malformed messages
      }
    };

    return () => ws.close();
  }, [boardId]);

  const send = useCallback((msg: WsMessage) => {
    wsRef.current?.send(JSON.stringify(msg));
  }, []);

  return { send };
}
