from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class ReviewCardRequest(BaseModel):
    card_id: str = Field(..., description="Tekrar edilen kartın UUID'si")
    rating: Optional[int] = Field(None, ge=0, le=5, description="0 (unutuldu) ile 5 (mükemmel) arası puan")
    is_correct: Optional[bool] = Field(None, description="İkili seçim: Doğru/Biliyorum (True) veya Bilemedim (False)")


class ReviewCardResponse(BaseModel):
    card_id: str
    repetition_number: int
    ease_factor: float
    interval_days: int
    next_review_date: datetime
    mistake_count: Optional[int] = 0
    consecutive_correct: Optional[int] = 0
    needs_review: Optional[bool] = False
    message: str


class ReviewResultRequest(BaseModel):
    is_correct: bool = Field(..., description="Kullanıcı kelimeyi doğru hatırladı mı?")
    rating: Optional[int] = Field(None, ge=0, le=5, description="Opsiyonel manuel puanlama")


class ReviewResultResponse(BaseModel):
    card_id: str
    is_correct: bool
    mistake_count: int
    consecutive_correct: int
    needs_review: bool
    repetition_number: int
    ease_factor: float
    interval_days: int
    next_review_date: Optional[str] = None
    message: str


class WeakSpotsResponse(BaseModel):
    total: int
    cards: List[Dict[str, Any]]