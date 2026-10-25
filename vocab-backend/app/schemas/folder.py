from typing import Optional
from pydantic import BaseModel, Field


class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=60, description="Klasör adı (örn: Kuzey, Animals)")
    color: Optional[str] = Field(default="#6366f1", description="Klasör etiketi rengi")
    user_id: Optional[str] = Field(default=None, description="Kullanıcı UUID")


class FolderResponse(BaseModel):
    id: str
    name: str
    color: Optional[str] = "#6366f1"
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    deck_count: Optional[int] = 0