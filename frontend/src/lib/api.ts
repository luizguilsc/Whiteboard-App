import type { Board, BoardElement, Connection, Folder } from '@/types';

const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Folders ----
export const foldersApi = {
  list: () => req<Folder[]>('/folders'),
  create: (data: Omit<Folder, 'id'>) =>
    req<Folder>('/folders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Folder>) =>
    req<Folder>(`/folders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => req<void>(`/folders/${id}`, { method: 'DELETE' }),
};

// ---- Boards ----
export const boardsApi = {
  list: (folderId?: string) =>
    req<Board[]>(`/boards${folderId ? `?folder_id=${folderId}` : ''}`),
  get: (id: string) => req<Board>(`/boards/${id}`),
  create: (data: { name: string; folder_id?: string }) =>
    req<Board>('/boards', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; folder_id?: string }) =>
    req<Board>(`/boards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => req<void>(`/boards/${id}`, { method: 'DELETE' }),
};

// ---- Elements ----
export const elementsApi = {
  list: (boardId: string) => req<BoardElement[]>(`/boards/${boardId}/elements`),
  create: (boardId: string, data: Omit<BoardElement, 'id' | 'board_id'>) =>
    req<BoardElement>(`/boards/${boardId}/elements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (boardId: string, id: string, data: Partial<BoardElement>) =>
    req<BoardElement>(`/boards/${boardId}/elements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (boardId: string, id: string) =>
    req<void>(`/boards/${boardId}/elements/${id}`, { method: 'DELETE' }),
};

// ---- Connections ----
export const connectionsApi = {
  list: (boardId: string) => req<Connection[]>(`/boards/${boardId}/connections`),
  create: (boardId: string, data: Omit<Connection, 'id' | 'board_id'>) =>
    req<Connection>(`/boards/${boardId}/connections`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (boardId: string, id: string, data: Partial<Connection>) =>
    req<Connection>(`/boards/${boardId}/connections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (boardId: string, id: string) =>
    req<void>(`/boards/${boardId}/connections/${id}`, { method: 'DELETE' }),
};
