from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Connection(Base):
    __tablename__ = "connections"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    board_id: Mapped[str] = mapped_column(
        String, ForeignKey("boards.id"), nullable=False, index=True
    )
    from_id: Mapped[str] = mapped_column(String, nullable=False)
    from_side: Mapped[str] = mapped_column(String, nullable=False)
    to_id: Mapped[str] = mapped_column(String, nullable=False)
    to_side: Mapped[str] = mapped_column(String, nullable=False)
    style: Mapped[str] = mapped_column(String, default="curve")
    arrow: Mapped[bool] = mapped_column(Boolean, default=True)
    label: Mapped[str | None] = mapped_column(String, nullable=True)
