from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.board import Board
from app.schemas.board import BoardCreate, BoardUpdate


class BoardService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self, folder_id: str | None = None) -> list[Board]:
        q = select(Board)
        if folder_id:
            q = q.where(Board.folder_id == folder_id)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_by_id(self, board_id: str) -> Board | None:
        result = await self.db.execute(select(Board).where(Board.id == board_id))
        return result.scalar_one_or_none()

    async def create(self, data: BoardCreate) -> Board:
        board = Board(id=str(uuid4()), **data.model_dump())
        self.db.add(board)
        await self.db.commit()
        await self.db.refresh(board)
        return board

    async def update(self, board: Board, data: BoardUpdate) -> Board:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(board, field, value)
        await self.db.commit()
        await self.db.refresh(board)
        return board

    async def delete(self, board: Board) -> None:
        await self.db.delete(board)
        await self.db.commit()
