from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ParsedItem(BaseModel):
    term: str = Field(..., description="Hedef kelime / kavram")
    definition: str = Field(..., description="Anlam veya aciklama")


class QuizletImportRequest(BaseModel):
    raw_text: str = Field(..., description="Quizlet'ten kopyalanan ham metin")
    term_separator: str = Field(default="\t", description="Kelime ve anlam arasindaki ayirici (varsayilan TAB)")
    row_separator: str = Field(default="\n", description="Satir ayirici (varsayilan yeni satir)")
    deck_id: Optional[str] = Field(default=None, description="Hedef deste ID'si")


class ImportPreviewResponse(BaseModel):
    total_detected: int
    cards: List[ParsedItem]


class BulkSaveRequest(BaseModel):
    deck_id: str = Field(..., description="Kartlarin eklenecegi deste UUID")
    cards: List[ParsedItem]
    enrich_with_ai: bool = Field(default=False, description="Gemini ile zenginlestirilsin mi?")