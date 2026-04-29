from pydantic import BaseModel, ConfigDict


class ConnectionBase(BaseModel):
    from_id: str
    from_side: str
    to_id: str
    to_side: str
    style: str = "curve"
    arrow: bool = True
    label: str | None = None


class ConnectionCreate(ConnectionBase):
    pass


class ConnectionUpdate(BaseModel):
    from_side: str | None = None
    to_id: str | None = None
    to_side: str | None = None
    style: str | None = None
    arrow: bool | None = None
    label: str | None = None


class ConnectionResponse(ConnectionBase):
    id: str
    board_id: str
    model_config = ConfigDict(from_attributes=True)
