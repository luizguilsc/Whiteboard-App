from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.element import Element
from app.schemas.element import ElementCreate, ElementResponse, ElementUpdate
from app.services.board_service import BoardService
from app.services.element_service import ElementService

router = APIRouter(prefix="/boards/{board_id}/elements", tags=["elements"])


async def _board_or_404(board_id: str, db: AsyncSession) -> None:
    if not await BoardService(db).get_by_id(board_id):
        raise HTTPException(status_code=404, detail="Board not found")


@router.get("/", response_model=list[ElementResponse])
async def list_elements(
    board_id: str, db: AsyncSession = Depends(get_db)
) -> list[Element]:
    await _board_or_404(board_id, db)
    return await ElementService(db).get_all(board_id)


@router.post("/", response_model=ElementResponse, status_code=status.HTTP_201_CREATED)
async def create_element(
    board_id: str, data: ElementCreate, db: AsyncSession = Depends(get_db)
) -> Element:
    await _board_or_404(board_id, db)
    return await ElementService(db).create(board_id, data)


@router.patch("/{element_id}", response_model=ElementResponse)
async def update_element(
    board_id: str,
    element_id: str,
    data: ElementUpdate,
    db: AsyncSession = Depends(get_db),
) -> Element:
    service = ElementService(db)
    el = await service.get_by_id(element_id)
    if not el or el.board_id != board_id:
        raise HTTPException(status_code=404, detail="Element not found")
    return await service.update(el, data)


@router.delete("/{element_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_element(
    board_id: str, element_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    service = ElementService(db)
    el = await service.get_by_id(element_id)
    if not el or el.board_id != board_id:
        raise HTTPException(status_code=404, detail="Element not found")
    await service.delete(el)
