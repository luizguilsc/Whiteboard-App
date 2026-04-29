from fastapi import APIRouter

from app.api.routes import boards, connections, elements, folders, ws

api_router = APIRouter()
api_router.include_router(folders.router)
api_router.include_router(boards.router)
api_router.include_router(elements.router)
api_router.include_router(connections.router)
api_router.include_router(ws.router)
