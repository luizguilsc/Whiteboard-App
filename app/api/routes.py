"""Rotas HTTP (REST) do MVP de whiteboard."""
from fastapi import APIRouter, HTTPException

from app.models.board import BoardListResponse, BoardPayload, BoardResponse
from app.services import board_service

router = APIRouter(prefix="/api")


@router.get("/boards", response_model=BoardListResponse)
def list_boards():
    return {"boards": board_service.get_all_boards()}


@router.get("/boards/{board_id}", response_model=BoardResponse)
def get_board(board_id: int):
    board = board_service.get_board_or_404(board_id)
    if board is None:
        raise HTTPException(status_code=404, detail="Board não encontrado")
    return board


@router.post("/boards", response_model=BoardResponse)
def create_board(payload: BoardPayload):
    board = board_service.save_board(board_id=None, name=payload.name, data=payload.data)
    return board


@router.put("/boards/{board_id}", response_model=BoardResponse)
def update_board(board_id: int, payload: BoardPayload):
    existing = board_service.get_board_or_404(board_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Board não encontrado")
    board = board_service.save_board(board_id=board_id, name=payload.name, data=payload.data)
    return board
