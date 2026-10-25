from typing import Optional
from pydantic import BaseModel, Field


class DeckCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Deste başlığı")
    description: Optional[str] = Field(default="", description="Deste açıklaması")
    folder_id: Optional[str] = Field(default=None, description="Bağlı olduğu klasör UUID")
    user_id: Optional[str] = Field(default=None, description="Kullanıcı UUID")


class DeckResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    folder_id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    created_at: Optional[str] = None
    card_count: Optional[int] = 0

    class Config:
        from_attributes = True