from pydantic import BaseModel, ConfigDict


class FolderBase(BaseModel):
    name: str
    color: str = "var(--accent)"
    count: int = 0
    parent_id: str | None = None
    section: str | None = None


class FolderCreate(FolderBase):
    pass


class FolderUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    count: int | None = None


class FolderResponse(FolderBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
