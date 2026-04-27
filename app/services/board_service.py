"""Regras de negócio para manipulação de boards."""
from typing import Dict, Optional

from app.storage import db


def bootstrap() -> None:
    db.init_db()


def get_all_boards():
    return db.list_boards()


def get_board_or_404(board_id: int):
    return db.get_board(board_id)


def get_board_by_slug(slug: str):
    return db.get_board_by_slug(slug)


def save_board(*, board_id: Optional[int], name: str, data: Dict, slug: Optional[str] = None):
    return db.save_board(board_id=board_id, name=name, data=data, slug=slug)
