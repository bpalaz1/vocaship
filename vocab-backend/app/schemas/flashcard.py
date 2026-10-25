from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ExampleSentence(BaseModel):
    target: str = Field(description="Hedef dilde örnek cümle")
    native: str = Field(description="Öğrenenin ana dilinde tercümesi")
    source: Optional[str] = None


class MeaningItem(BaseModel):
    part_of_speech: Optional[str] = ""
    translation: str
    definition: Optional[str] = ""


# Eski importlar için Meaning eşlemesi
Meaning = MeaningItem


class CardGenerateRequest(BaseModel):
    word: str = Field(..., example="ubiquitous")
    target_lang: str = Field(default="en", example="en")
    native_lang: str = Field(default="tr", example="tr")
    level: Optional[str] = Field(default="B2", example="B2")


class BatchCardGenerateRequest(BaseModel):
    words: List[str] = Field(..., max_length=20, example=["ubiquitous", "resilient", "pragmatic"])
    target_lang: str = Field(default="en", example="en")
    native_lang: str = Field(default="tr", example="tr")


class FlashcardData(BaseModel):
    word: str
    phonetic: Optional[str] = None
    grammar_notes: Optional[str] = Field(
        None, description="Artikel, eril/dişil veya fiil türü"
    )
    meanings: List[Dict[str, Any]] = []
    example_sentences: List[Dict[str, Any]] = []
    collocations: List[str] = []
    level: Optional[str] = None


# Eski importlar için CardGenerateResponse eşlemesi
CardGenerateResponse = FlashcardData


class BatchCardResponse(BaseModel):
    total_processed: int
    cards: List[FlashcardData]


# Eski importlar için BatchCardGenerateResponse eşlemesi
BatchCardGenerateResponse = BatchCardResponse


class FlashcardResponse(BaseModel):
    id: Optional[str] = None
    deck_id: Optional[str] = None
    word: str
    phonetic: Optional[str] = None
    meanings: Optional[List[Dict[str, Any]]] = None
    grammar_notes: Optional[str] = None
    example_sentences: Optional[List[Dict[str, Any]]] = None
    collocations: Optional[List[str]] = None
    image_url: Optional[str] = None
    ease_factor: Optional[float] = 2.5
    interval_days: Optional[int] = 0
    repetitions: Optional[int] = 0
    repetition_number: Optional[int] = 0
    mistake_count: Optional[int] = 0
    consecutive_correct: Optional[int] = 0
    needs_review: Optional[bool] = False
    next_review_date: Optional[str] = None
    created_at: Optional[str] = None


class FlashcardCreate(BaseModel):
    deck_id: str
    word: str
    phonetic: Optional[str] = None
    meanings: Optional[List[Dict[str, Any]]] = None
    example_sentences: Optional[List[Dict[str, Any]]] = None
    collocations: Optional[List[str]] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None