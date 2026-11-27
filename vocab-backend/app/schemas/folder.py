from typing import Optional, Any
from pydantic import BaseModel, Field, field_validator


class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=60, description="Klasör adı (örn: Kuzey, Animals)")
    color: Optional[str] = Field(default="#6366f1", description="Klasör etiketi rengi")
    user_id: Optional[str] = Field(default=None, description="Kullanıcı UUID")
    parent_id: Optional[str] = Field(default=None, description="Üst klasör UUID")

    @field_validator("parent_id", mode="before")
    @classmethod
    def normalize_parent_id(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s or s.lower() in ("null", "none", "undefined", "root directory"):
            return None
        return s


class FolderResponse(BaseModel):
    id: str
    name: str
    color: Optional[str] = "#6366f1"
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    deck_count: Optional[int] = 0