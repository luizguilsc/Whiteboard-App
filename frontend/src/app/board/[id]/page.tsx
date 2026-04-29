import { boardsApi, connectionsApi, elementsApi, foldersApi } from '@/lib/api';
import type { Board, BoardElement, Connection, Folder } from '@/types';
import BoardClient from './BoardClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: Props) {
  const { id } = await params;

  let board: Board | null = null;
  let elements: BoardElement[] = [];
  let connections: Connection[] = [];
  let folders: Folder[] = [];

  try {
    [board, elements, connections, folders] = await Promise.all([
      boardsApi.get(id),
      elementsApi.list(id),
      connectionsApi.list(id),
      foldersApi.list(),
    ]);
  } catch {
    // Board may not exist yet or backend is offline — BoardClient handles the empty state
  }

  return (
    <BoardClient
      boardId={id}
      board={board}
      initialElements={elements}
      initialConnections={connections}
      folders={folders}
    />
  );
}
