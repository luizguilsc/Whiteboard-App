from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BoardBase(BaseModel):
    name: str
    folder_id: str | None = None


class BoardCreate(BoardBase):
    pass


class BoardUpdate(BaseModel):
    name: str | None = None
    folder_id: str | None = None


class BoardResponse(BoardBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
