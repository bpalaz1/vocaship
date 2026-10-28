from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# =========================================================================
# FAZ 6: SINIF YÖNETİMİ & EĞİTMEN PORTALI ŞEMALARI
# =========================================================================

class ClassroomCreateRequest(BaseModel):
    name: str = Field(..., description="Sınıf Adı (örn: C1 Business English)")
    grade_level: str = Field(default="Intermediate", description="Seviye (Elementary, Intermediate, Advanced, C1 Pro)")

class ClassroomResponse(BaseModel):
    id: str
    name: str
    code: str = Field(..., description="Benzersiz 6 haneli sınıf kodu, örn: VRG-2535")
    student_count: int = 0
    grade_level: Optional[str] = "Intermediate"
    created_at: Optional[str] = None

class AssignmentExtractRequest(BaseModel):
    content: Optional[str] = Field(default="", description="Öğretmenin yapıştırdığı metin")
    text: Optional[str] = Field(default=None, description="Alternatif metin parametresi")
    level: Optional[str] = Field(default="Intermediate", description="Elementary, Intermediate, Advanced")

class AssignmentExtractResponse(BaseModel):
    title: Optional[str] = "Yeni Okuma Parçası"
    topic: Optional[str] = "Genel"
    target_words: List[Dict[str, Any]] = []
    questions: List[Dict[str, Any]] = []

class AssignmentCreateRequest(BaseModel):
    classroom_id: str = Field(..., description="Ödevin bağlanacağı sınıf ID'si veya kodu")
    title: str = Field(..., description="Ödev Başlığı")
    story_content: Optional[str] = Field(default=None, description="Okuma parçası metni")
    target_words: List[Dict[str, Any]] = Field(default=[], description="Hedef kelimeler")
    questions: List[Dict[str, Any]] = Field(default=[], description="Çoktan seçmeli sorular")
    due_date: Optional[str] = Field(default=None, description="Son teslim tarihi (örn: Bu Cuma, 18:00)")

class AssignmentResponse(BaseModel):
    id: str
    classroom_id: str
    class_code: Optional[str] = None
    title: str
    story_content: Optional[str] = None
    target_words: List[Dict[str, Any]] = []
    questions: List[Dict[str, Any]] = []
    due_date: Optional[str] = None
    created_at: Optional[str] = None
    completed_percent: Optional[int] = 0

# =========================================================================
# GERİYE DÖNÜK UYUMLULUK ŞEMALARI
# =========================================================================

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
