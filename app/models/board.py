"""Modelos de dados para o domínio de boards."""
from pydantic import BaseModel, Field
from typing import Any, Dict, List


class BoardMetadata(BaseModel):
    id: int
    name: str
    updated_at: str


class BoardPayload(BaseModel):
    name: str = Field(default="Meu Board")
    # Estrutura aberta para facilitar evolução do schema no MVP.
    data: Dict[str, Any] = Field(default_factory=lambda: {"elements": [], "connections": []})


class BoardResponse(BoardPayload):
    id: int
    updated_at: str


class BoardListResponse(BaseModel):
    boards: List[BoardMetadata]
