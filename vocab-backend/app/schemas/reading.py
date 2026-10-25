from typing import Optional, List
from pydantic import BaseModel, Field

class StoryGenerateRequest(BaseModel):
    level: str = Field(default="Intermediate", description="Elementary, Intermediate, Advanced")
    topic: Optional[str] = Field(default="Daily Life", description="Hikaye konusu veya teması")
    target_words: Optional[List[str]] = Field(default=None, description="Hikayede geçmesi zorunlu kelimeler")
    length_words: Optional[int] = Field(default=250, description="Kelime uzunluğu")

class VocabularyItem(BaseModel):
    word: str
    phonetic: Optional[str] = ""
    turkish_meaning: str
    context_sentence: Optional[str] = ""

class ComprehensionQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int

class StoryResponse(BaseModel):
    title: str
    level: str
    topic: Optional[str] = ""
    content: str
    target_vocabulary: List[VocabularyItem] = []
    comprehension_questions: List[ComprehensionQuestion] = []