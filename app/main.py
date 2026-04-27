"""Entry-point do backend FastAPI."""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.routes import router
from app.core.config import STATIC_DIR
from app.services.board_service import bootstrap

app = FastAPI(title="Whiteboard MVP", version="0.1.0")


@app.on_event("startup")
def on_startup() -> None:
    bootstrap()


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


app.include_router(router)
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
