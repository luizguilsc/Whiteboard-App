"""Regras de negócio para manipulação de boards."""
from typing import Dict, Optional

from app.storage import db


def bootstrap() -> None:
    db.init_db()


def get_all_boards():
    return db.list_boards()


def get_board_or_404(board_id: int):
    board = db.get_board(board_id)
    return board


def save_board(*, board_id: Optional[int], name: str, data: Dict):
    return db.save_board(board_id=board_id, name=name, data=data)
