from typing import Any

from pydantic import BaseModel, ConfigDict


class ElementBase(BaseModel):
    type: str
    x: float = 0.0
    y: float = 0.0
    w: float = 240.0
    h: float = 150.0
    title: str | None = None
    body: str | None = None
    meta: str | None = None
    color: str | None = None
    hidden: bool = False
    locked: bool = False
    extra: dict[str, Any] | None = None


class ElementCreate(ElementBase):
    pass


class ElementUpdate(BaseModel):
    x: float | None = None
    y: float | None = None
    w: float | None = None
    h: float | None = None
    title: str | None = None
    body: str | None = None
    meta: str | None = None
    color: str | None = None
    hidden: bool | None = None
    locked: bool | None = None
    extra: dict[str, Any] | None = None


class ElementResponse(ElementBase):
    id: str
    board_id: str
    model_config = ConfigDict(from_attributes=True)
