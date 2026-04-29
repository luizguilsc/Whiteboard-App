from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.connection import Connection
from app.schemas.connection import ConnectionCreate, ConnectionUpdate


class ConnectionService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self, board_id: str) -> list[Connection]:
        result = await self.db.execute(
            select(Connection).where(Connection.board_id == board_id)
        )
        return list(result.scalars().all())

    async def get_by_id(self, connection_id: str) -> Connection | None:
        result = await self.db.execute(
            select(Connection).where(Connection.id == connection_id)
        )
        return result.scalar_one_or_none()

    async def create(self, board_id: str, data: ConnectionCreate) -> Connection:
        conn = Connection(id=str(uuid4()), board_id=board_id, **data.model_dump())
        self.db.add(conn)
        await self.db.commit()
        await self.db.refresh(conn)
        return conn

    async def update(self, connection: Connection, data: ConnectionUpdate) -> Connection:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(connection, field, value)
        await self.db.commit()
        await self.db.refresh(connection)
        return connection

    async def delete(self, connection: Connection) -> None:
        await self.db.delete(connection)
        await self.db.commit()
