from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.board import Board
from app.schemas.board import BoardCreate, BoardResponse, BoardUpdate
from app.services.board_service import BoardService

router = APIRouter(prefix="/boards", tags=["boards"])


@router.get("/", response_model=list[BoardResponse])
async def list_boards(
    folder_id: str | None = None, db: AsyncSession = Depends(get_db)
) -> list[Board]:
    return await BoardService(db).get_all(folder_id)


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_board(data: BoardCreate, db: AsyncSession = Depends(get_db)) -> Board:
    return await BoardService(db).create(data)


@router.get("/{board_id}", response_model=BoardResponse)
async def get_board(board_id: str, db: AsyncSession = Depends(get_db)) -> Board:
    board = await BoardService(db).get_by_id(board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


@router.patch("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: str, data: BoardUpdate, db: AsyncSession = Depends(get_db)
) -> Board:
    service = BoardService(db)
    board = await service.get_by_id(board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return await service.update(board, data)


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(board_id: str, db: AsyncSession = Depends(get_db)) -> None:
    service = BoardService(db)
    board = await service.get_by_id(board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    await service.delete(board)
