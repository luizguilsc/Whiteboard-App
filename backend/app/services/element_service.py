from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.element import Element
from app.schemas.element import ElementCreate, ElementUpdate


class ElementService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self, board_id: str) -> list[Element]:
        result = await self.db.execute(
            select(Element).where(Element.board_id == board_id)
        )
        return list(result.scalars().all())

    async def get_by_id(self, element_id: str) -> Element | None:
        result = await self.db.execute(
            select(Element).where(Element.id == element_id)
        )
        return result.scalar_one_or_none()

    async def create(self, board_id: str, data: ElementCreate) -> Element:
        el = Element(id=str(uuid4()), board_id=board_id, **data.model_dump())
        self.db.add(el)
        await self.db.commit()
        await self.db.refresh(el)
        return el

    async def update(self, element: Element, data: ElementUpdate) -> Element:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(element, field, value)
        await self.db.commit()
        await self.db.refresh(element)
        return element

    async def delete(self, element: Element) -> None:
        await self.db.delete(element)
        await self.db.commit()
