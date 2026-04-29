from collections import defaultdict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    def __init__(self) -> None:
        self.rooms: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, ws: WebSocket, board_id: str) -> None:
        await ws.accept()
        self.rooms[board_id].append(ws)

    def disconnect(self, ws: WebSocket, board_id: str) -> None:
        room = self.rooms[board_id]
        if ws in room:
            room.remove(ws)

    async def broadcast(
        self, message: dict, board_id: str, exclude: WebSocket | None = None
    ) -> None:
        for ws in list(self.rooms[board_id]):
            if ws is exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(ws, board_id)


manager = ConnectionManager()


@router.websocket("/ws/{board_id}")
async def board_websocket(ws: WebSocket, board_id: str) -> None:
    await manager.connect(ws, board_id)
    try:
        while True:
            data = await ws.receive_json()
            await manager.broadcast(data, board_id, exclude=ws)
    except WebSocketDisconnect:
        manager.disconnect(ws, board_id)
