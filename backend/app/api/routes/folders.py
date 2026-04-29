from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.folder import Folder
from app.schemas.folder import FolderCreate, FolderResponse, FolderUpdate

router = APIRouter(prefix="/folders", tags=["folders"])


@router.get("/", response_model=list[FolderResponse])
async def list_folders(db: AsyncSession = Depends(get_db)) -> list[Folder]:
    result = await db.execute(select(Folder))
    return list(result.scalars().all())


@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(data: FolderCreate, db: AsyncSession = Depends(get_db)) -> Folder:
    folder = Folder(id=str(uuid4()), **data.model_dump())
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    return folder


@router.patch("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: str, data: FolderUpdate, db: AsyncSession = Depends(get_db)
) -> Folder:
    result = await db.execute(select(Folder).where(Folder.id == folder_id))
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(folder, field, value)
    await db.commit()
    await db.refresh(folder)
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(folder_id: str, db: AsyncSession = Depends(get_db)) -> None:
    result = await db.execute(select(Folder).where(Folder.id == folder_id))
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    await db.delete(folder)
    await db.commit()
