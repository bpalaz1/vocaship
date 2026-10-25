from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ExtractRequest(BaseModel):
    text: str = Field(..., description="Öğretmenin yapıştırdığı okuma metni")
    level: Optional[str] = Field(default="Intermediate", description="Elementary, Intermediate, Advanced")

class TargetWordItem(BaseModel):
    word: str
    phonetic: Optional[str] = ""
    meaning: str
    example: Optional[str] = ""

class QuestionItem(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: Optional[str] = ""

class ExtractResponse(BaseModel):
    title: Optional[str] = "Yeni Okuma Parçası"
    topic: Optional[str] = "Genel"
    target_vocabulary: List[Dict[str, Any]] = []
    comprehension_questions: List[Dict[str, Any]] = []

class TeacherStoryCreateRequest(BaseModel):
    title: str = Field(..., description="Hikaye / Okuma parçası başlığı")
    level: str = Field(default="Intermediate", description="Elementary, Intermediate, Advanced")
    content: str = Field(..., description="İngilizce okuma parçası metni")
    topic: Optional[str] = Field(default="Genel", description="Metin konusu")
    target_vocabulary: List[Dict[str, Any]] = Field(default=[], description="Hedef kelimeler")
    comprehension_questions: List[Dict[str, Any]] = Field(default=[], description="3 adet anlama sorusu")
    visibility: str = Field(default="class_only", description="class_only veya public")
    class_code: Optional[str] = Field(default=None, description="Sınıf kodu")

class TeacherStoryResponse(BaseModel):
    id: str
    title: str
    level: str
    content: str
    topic: str
    target_vocabulary: List[Dict[str, Any]] = []
    comprehension_questions: List[Dict[str, Any]] = []
    status: str = "pending"  # "pending" | "approved"
    visibility: str = "class_only"
    share_code: Optional[str] = None
    created_at: str
