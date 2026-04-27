"""Camada simples de persistência SQLite para boards."""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.config import DB_PATH


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS boards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def list_boards() -> List[Dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, name, updated_at FROM boards ORDER BY updated_at DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def get_board(board_id: int) -> Optional[Dict[str, Any]]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM boards WHERE id = ?", (board_id,)).fetchone()
    if not row:
        return None
    board = dict(row)
    board["data"] = json.loads(board["data"])
    return board


def save_board(*, board_id: Optional[int], name: str, data: Dict[str, Any]) -> Dict[str, Any]:
    now = utc_now_iso()
    encoded = json.dumps(data)

    with get_conn() as conn:
        if board_id is None:
            cursor = conn.execute(
                "INSERT INTO boards (name, data, created_at, updated_at) VALUES (?, ?, ?, ?)",
                (name, encoded, now, now),
            )
            board_id = cursor.lastrowid
        else:
            conn.execute(
                "UPDATE boards SET name = ?, data = ?, updated_at = ? WHERE id = ?",
                (name, encoded, now, board_id),
            )
        conn.commit()

    board = get_board(board_id)
    if board is None:
        raise RuntimeError("Falha ao salvar board")
    return board
