"""Camada simples de persistência SQLite para boards."""
from __future__ import annotations

import json
import re
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


def slugify(value: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    base = re.sub(r"-+", "-", base).strip("-")
    return base or "board"


def _ensure_slug_column(conn: sqlite3.Connection) -> None:
    cols = conn.execute("PRAGMA table_info(boards)").fetchall()
    names = {row[1] for row in cols}
    if "slug" not in names:
        conn.execute("ALTER TABLE boards ADD COLUMN slug TEXT")

    rows = conn.execute("SELECT id, name, slug FROM boards").fetchall()
    used: set[str] = set()
    for row in rows:
        desired = row["slug"] or slugify(row["name"])
        unique = desired
        idx = 2
        while unique in used:
            unique = f"{desired}-{idx}"
            idx += 1
        used.add(unique)
        if row["slug"] != unique:
            conn.execute("UPDATE boards SET slug = ? WHERE id = ?", (unique, row["id"]))

    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_boards_slug ON boards(slug)")


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS boards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        _ensure_slug_column(conn)
        conn.commit()


def list_boards() -> List[Dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, name, slug, updated_at FROM boards ORDER BY updated_at DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def _decode_board(row: sqlite3.Row | None) -> Optional[Dict[str, Any]]:
    if not row:
        return None
    board = dict(row)
    board["data"] = json.loads(board["data"])
    return board


def get_board(board_id: int) -> Optional[Dict[str, Any]]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM boards WHERE id = ?", (board_id,)).fetchone()
    return _decode_board(row)


def get_board_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM boards WHERE slug = ?", (slug,)).fetchone()
    return _decode_board(row)


def _ensure_unique_slug(conn: sqlite3.Connection, desired: str, current_id: Optional[int]) -> str:
    candidate = desired
    idx = 2
    while True:
        row = conn.execute("SELECT id FROM boards WHERE slug = ?", (candidate,)).fetchone()
        if row is None or row["id"] == current_id:
            return candidate
        candidate = f"{desired}-{idx}"
        idx += 1


def save_board(*, board_id: Optional[int], name: str, data: Dict[str, Any], slug: Optional[str] = None) -> Dict[str, Any]:
    now = utc_now_iso()
    encoded = json.dumps(data)

    with get_conn() as conn:
        desired_slug = slugify(slug or name)
        final_slug = _ensure_unique_slug(conn, desired_slug, board_id)

        if board_id is None:
            cursor = conn.execute(
                "INSERT INTO boards (name, slug, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                (name, final_slug, encoded, now, now),
            )
            board_id = cursor.lastrowid
        else:
            conn.execute(
                "UPDATE boards SET name = ?, slug = ?, data = ?, updated_at = ? WHERE id = ?",
                (name, final_slug, encoded, now, board_id),
            )
        conn.commit()

    board = get_board(board_id)
    if board is None:
        raise RuntimeError("Falha ao salvar board")
    return board
