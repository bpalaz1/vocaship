from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class WritingAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Kullanıcının yazdığı İngilizce metin")
    source_type: str = Field(default="story", description="story | speaking | deck")
    source_context: Optional[str] = Field(default=None, description="Hikaye özeti veya konuşma konusu")
    target_words: List[str] = Field(default_factory=list, description="Kullanılması hedeflenen kelimeler")
    native_lang: str = Field(default="tr", description="Açıklama dili")


class WritingCorrectionItem(BaseModel):
    original: str
    corrected: str
    type: str = Field(default="grammar", description="spelling | grammar | style")
    explanation: str


class SuggestedVocabItem(BaseModel):
    word: str
    meaning: str
    phonetic: Optional[str] = ""


class WritingAnalyzeResponse(BaseModel):
    cefr_level: str
    corrected_text: str
    corrections: List[WritingCorrectionItem] = Field(default_factory=list)
    used_target_words: List[str] = Field(default_factory=list)
    c1_natural_version: str
    suggested_words: List[SuggestedVocabItem] = Field(default_factory=list)
