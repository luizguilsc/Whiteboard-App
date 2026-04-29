from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.connection import Connection
from app.schemas.connection import ConnectionCreate, ConnectionResponse, ConnectionUpdate
from app.services.board_service import BoardService
from app.services.connection_service import ConnectionService

router = APIRouter(prefix="/boards/{board_id}/connections", tags=["connections"])


async def _board_or_404(board_id: str, db: AsyncSession) -> None:
    if not await BoardService(db).get_by_id(board_id):
        raise HTTPException(status_code=404, detail="Board not found")


@router.get("/", response_model=list[ConnectionResponse])
async def list_connections(
    board_id: str, db: AsyncSession = Depends(get_db)
) -> list[Connection]:
    await _board_or_404(board_id, db)
    return await ConnectionService(db).get_all(board_id)


@router.post("/", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(
    board_id: str, data: ConnectionCreate, db: AsyncSession = Depends(get_db)
) -> Connection:
    await _board_or_404(board_id, db)
    return await ConnectionService(db).create(board_id, data)


@router.patch("/{connection_id}", response_model=ConnectionResponse)
async def update_connection(
    board_id: str,
    connection_id: str,
    data: ConnectionUpdate,
    db: AsyncSession = Depends(get_db),
) -> Connection:
    service = ConnectionService(db)
    conn = await service.get_by_id(connection_id)
    if not conn or conn.board_id != board_id:
        raise HTTPException(status_code=404, detail="Connection not found")
    return await service.update(conn, data)


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    board_id: str, connection_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    service = ConnectionService(db)
    conn = await service.get_by_id(connection_id)
    if not conn or conn.board_id != board_id:
        raise HTTPException(status_code=404, detail="Connection not found")
    await service.delete(conn)
