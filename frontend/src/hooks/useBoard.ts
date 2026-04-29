'use client';

import { useCallback, useState } from 'react';

import { connectionsApi, elementsApi } from '@/lib/api';
import type { BoardElement, Connection } from '@/types';

export function useBoard(
  boardId: string,
  initialElements: BoardElement[],
  initialConnections: Connection[],
) {
  const [elements, setElements] = useState<BoardElement[]>(initialElements);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);

  // ---- Elements ----
  const addElement = useCallback(
    async (data: Omit<BoardElement, 'id' | 'board_id'>) => {
      const el = await elementsApi.create(boardId, data);
      setElements((prev) => [...prev, el]);
      return el;
    },
    [boardId],
  );

  const updateElement = useCallback(
    async (id: string, patch: Partial<BoardElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...patch } : el)),
      );
      await elementsApi.update(boardId, id, patch);
    },
    [boardId],
  );

  const updateElementLocal = useCallback((id: string, patch: Partial<BoardElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    );
  }, []);

  const removeElement = useCallback(
    async (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      setConnections((prev) =>
        prev.filter((c) => c.from_id !== id && c.to_id !== id),
      );
      await elementsApi.delete(boardId, id);
    },
    [boardId],
  );

  // ---- Connections ----
  const addConnection = useCallback(
    async (data: Omit<Connection, 'id' | 'board_id'>) => {
      const conn = await connectionsApi.create(boardId, data);
      setConnections((prev) => [...prev, conn]);
      return conn;
    },
    [boardId],
  );

  const updateConnection = useCallback(
    async (id: string, patch: Partial<Connection>) => {
      setConnections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
      await connectionsApi.update(boardId, id, patch);
    },
    [boardId],
  );

  const removeConnection = useCallback(
    async (id: string) => {
      setConnections((prev) => prev.filter((c) => c.id !== id));
      await connectionsApi.delete(boardId, id);
    },
    [boardId],
  );

  return {
    elements,
    setElements,
    connections,
    setConnections,
    addElement,
    updateElement,
    updateElementLocal,
    removeElement,
    addConnection,
    updateConnection,
    removeConnection,
  };
}
