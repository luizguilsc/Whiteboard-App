from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.board import Board
from app.models.connection import Connection
from app.models.element import Element
from app.models.folder import Folder

DEMO_BOARD_ID = "board-demo"

DEMO_FOLDERS = [
    {"id": "f-active",    "name": "Em andamento",  "count": 4,  "color": "var(--accent)"},
    {"id": "f-product",   "name": "Produto",        "count": 3,  "color": "oklch(0.65 0.14 220)"},
    {"id": "f-research",  "name": "Pesquisa",       "count": 7,  "color": "oklch(0.62 0.14 145)"},
    {"id": "f-marketing", "name": "Marketing",      "count": 2,  "color": "oklch(0.62 0.14 305)"},
    {"id": "f-archived",  "name": "Arquivados",     "count": 12, "color": "var(--ink-mute)", "section": "outros"},
    {"id": "f-launch",    "name": "Lançamento Q3",  "count": 14, "color": "oklch(0.65 0.14 220)", "parent_id": "f-product"},
    {"id": "f-roadmap",   "name": "Roadmap 2026",   "count": 9,  "color": "oklch(0.65 0.14 220)", "parent_id": "f-product"},
]

DEMO_ELEMENTS = [
    {"id": "el-title",   "type": "sticky",    "x": 60,   "y": 60,  "w": 280, "h": 110, "color": "yellow", "extra": {"text": "Lançamento Q3 — onboarding redesign", "meta": "amanda · 14 abr"}},
    {"id": "el-goal",    "type": "card",      "x": 60,   "y": 200, "w": 320, "h": 170, "title": "Objetivo", "body": "Reduzir o time-to-first-aha de 4'30\" para menos de 90 segundos.", "meta": "v3 · 12 cmt", "extra": {"tag": {"label": "north star", "dot": True}}},
    {"id": "el-s1",      "type": "sticky",    "x": 480,  "y": 60,  "w": 200, "h": 130, "color": "pink",   "extra": {"text": "checklist guiado dentro do produto, não tour separado", "meta": "thiago"}},
    {"id": "el-s2",      "type": "sticky",    "x": 700,  "y": 90,  "w": 200, "h": 130, "color": "blue",   "extra": {"text": "pular onboarding deve ser visível mas não óbvio", "meta": "amanda"}},
    {"id": "el-s3",      "type": "sticky",    "x": 590,  "y": 220, "w": 200, "h": 130, "color": "green",  "extra": {"text": "primeiro projeto pré-populado com exemplo real", "meta": "rita"}},
    {"id": "el-img1",    "type": "image",     "x": 940,  "y": 60,  "w": 240, "h": 170, "extra": {"caption": "ref · linear onboarding", "placeholder": "moodboard frame 01"}},
    {"id": "el-img2",    "type": "image",     "x": 1200, "y": 60,  "w": 240, "h": 170, "extra": {"caption": "ref · arc browser", "placeholder": "moodboard frame 02"}},
    {"id": "el-shape1",  "type": "shape",     "x": 380,  "y": 410, "w": 130, "h": 130, "extra": {"shape": "diamond", "label": "novo usuário?"}},
    {"id": "el-shape2",  "type": "shape",     "x": 940,  "y": 480, "w": 110, "h": 110, "extra": {"shape": "circle", "label": "Beta"}},
    {"id": "el-check",   "type": "checklist", "x": 60,   "y": 410, "w": 290, "h": 280, "title": "Sprint 21", "extra": {"items": [
        {"id": "c1", "text": "Mapear estado atual do funil", "done": True},
        {"id": "c2", "text": "Entrevistar 5 usuários novos", "done": True},
        {"id": "c3", "text": "Wireframe v1 do checklist", "done": True},
        {"id": "c4", "text": "Protótipo navegável", "done": False},
        {"id": "c5", "text": "Teste com 8 participantes", "done": False},
        {"id": "c6", "text": "Spec técnica + handoff", "done": False},
    ]}},
    {"id": "el-col1",    "type": "column",    "x": 1480, "y": 60,  "w": 240, "h": 320, "title": "Descobertas",     "color": "oklch(0.65 0.14 220)", "extra": {"items": [
        {"id": "i1", "text": "Tour atual ignora 73% dos usuários", "done": False},
        {"id": "i2", "text": "Pessoas voltam pra docs depois do tour", "done": False},
        {"id": "i3", "text": "Empty states são o gargalo real", "done": False},
        {"id": "i4", "text": "Plan free não diferencia experiência", "done": True},
    ]}},
    {"id": "el-col2",    "type": "column",    "x": 1740, "y": 60,  "w": 240, "h": 320, "title": "Em prototipação", "color": "var(--accent)",          "extra": {"items": [
        {"id": "j1", "text": "Checklist contextual flutuante", "done": False},
        {"id": "j2", "text": "Workspace com dados de exemplo", "done": False},
        {"id": "j3", "text": "Pulse de ativação no dia 3", "done": False},
    ]}},
    {"id": "el-col3",    "type": "column",    "x": 2000, "y": 60,  "w": 240, "h": 320, "title": "Descartadas",     "color": "var(--ink-mute)",         "extra": {"items": [
        {"id": "k1", "text": "Vídeo de boas-vindas obrigatório", "done": True},
        {"id": "k2", "text": "Modal de tour multi-passos", "done": True},
    ]}},
    {"id": "el-audio",   "type": "audio",     "x": 940,  "y": 270, "w": 320, "h": 90,  "title": "entrevista — usuário p4", "extra": {"duration": "08:42", "progress": 0.32}},
    {"id": "el-file1",   "type": "file",      "x": 1280, "y": 270, "w": 220, "h": 70,  "extra": {"name": "metricas-funnel-v3.xlsx", "size": "184 kb", "ext": "xls"}},
    {"id": "el-file2",   "type": "file",      "x": 1280, "y": 360, "w": 220, "h": 70,  "extra": {"name": "tracking-events.py", "size": "12 kb", "ext": "py"}},
    {"id": "el-link",    "type": "link",      "x": 700,  "y": 410, "w": 220, "h": 200, "title": "First-time user experience patterns", "extra": {"host": "growth.design", "placeholder": "preview · growth.design"}},
    {"id": "el-section", "type": "card",      "x": 60,   "y": 720, "w": 320, "h": 100, "title": "Próximos passos", "body": "validar hipótese 03 com prototipo navegável até sex 25/abr.", "meta": "—", "extra": {"tag": {"label": "esta semana", "dot": True}}},
]

DEMO_CONNECTIONS = [
    {"id": "cn-1", "from_id": "el-goal",   "to_id": "el-s1",    "from_side": "r", "to_side": "l", "style": "curve",    "arrow": True},
    {"id": "cn-2", "from_id": "el-s1",     "to_id": "el-s3",    "from_side": "b", "to_side": "t", "style": "curve",    "arrow": False},
    {"id": "cn-3", "from_id": "el-s2",     "to_id": "el-s3",    "from_side": "b", "to_side": "t", "style": "dashed",   "arrow": False},
    {"id": "cn-4", "from_id": "el-s3",     "to_id": "el-shape1","from_side": "b", "to_side": "t", "style": "straight", "arrow": True,  "label": "explorar"},
    {"id": "cn-5", "from_id": "el-shape1", "to_id": "el-check", "from_side": "l", "to_side": "r", "style": "curve",    "arrow": True,  "label": "sim"},
    {"id": "cn-6", "from_id": "el-shape1", "to_id": "el-link",  "from_side": "r", "to_side": "l", "style": "curve",    "arrow": True,  "label": "ref"},
    {"id": "cn-7", "from_id": "el-img1",   "to_id": "el-img2",  "from_side": "r", "to_side": "l", "style": "straight", "arrow": False},
]


async def seed_demo_data(db: AsyncSession) -> None:
    result = await db.execute(select(Board).limit(1))
    if result.scalar_one_or_none():
        return  # already seeded

    for fd in DEMO_FOLDERS:
        db.add(Folder(**fd))

    board = Board(id=DEMO_BOARD_ID, name="Lançamento Q3 — onboarding redesign", folder_id="f-product")
    db.add(board)

    for ed in DEMO_ELEMENTS:
        db.add(Element(board_id=DEMO_BOARD_ID, **ed))

    for cd in DEMO_CONNECTIONS:
        db.add(Connection(board_id=DEMO_BOARD_ID, **cd))

    await db.commit()
