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

# =========================================================================
# 5. CANLI YARIŞMA PODYUM VE ADİL ÖDÜL MOTORU ŞEMALARI
# =========================================================================

class GameRewardClaimRequest(BaseModel):
    session_id: str = Field(..., description="Yarışma / Oturum Benzersiz Kimliği (örn: room-10a-xxxx)")
    user_id: Optional[str] = Field(default=None, description="Kullanıcı Kimliği")
    rank: int = Field(..., description="Kullanıcının yarışma derecesi (1, 2, 3...)")
    game_mode: Optional[str] = Field(default="live_arena", description="Oyun modu")

class GameRewardClaimResponse(BaseModel):
    success: bool
    session_id: str
    user_id: str
    rank: int
    awarded_xp: int
    awarded_gold: int
    awarded_key: Optional[str] = None
    key_name: Optional[str] = None
    new_total_xp: int
    new_coins: int
    message: str
    already_claimed: bool = False

# =========================================================================
# 6. KOLEKTİF İNTERAKTİF HİKAYE DOKUMA MOTORU (FAZ 6)
# =========================================================================

class StoryWeaveRequest(BaseModel):
    target_words: List[str] = Field(default=[], description="Hikayede yedirilmesi istenen hedef kelimeler")
    story_history: List[str] = Field(default=[], description="Şu ana kadar dokunan hikaye paragrafları")
    selected_choice: Optional[str] = Field(default=None, description="Sınıfın seçtiği son olay örgüsü hamlesi")
    grade_level: Optional[str] = Field(default="B1-B2", description="Dil seviyesi (A2, B1, B2, C1)")

class StoryWeaveResponse(BaseModel):
    next_segment: str = Field(..., description="Yeni oluşturulan 2-4 cümlelik hikaye parçası (hedef kelimeler **bold**)")
    used_words: List[str] = Field(default=[], description="Bu parçada kullanılan hedef kelimeler")
    choices: List[str] = Field(default=[], description="Sınıfın oylayacağı 3 alternatif olay örgüsü seçeneği")


# =========================================================================
# 7. AKILLI TAHTA DERS SONU YAPAY ZEKÂ ANALİZ ŞEMALARI (GEMINI 2.5 FLASH)
# =========================================================================

class BoardKeyTerm(BaseModel):
    word: str = Field(..., description="İngilizce terim")
    turkish: str = Field(..., description="Türkçe karşılığı")
    phonetic: Optional[str] = Field(default="", description="Fonetik telaffuz (IPA)")
    example: Optional[str] = Field(default="", description="Örnek cümle")

class BoardQuizQuestion(BaseModel):
    question: str = Field(..., description="Soru metni")
    options: List[str] = Field(..., description="4 şık (A, B, C, D)")
    correct_index: int = Field(default=0, description="Doğru şık indeksi (0-3)")
    explanation: Optional[str] = Field(default="", description="Pedagojik açıklama")

class BoardSummaryRequest(BaseModel):
    class_id: str = Field(default="cls-1", description="Sınıf ID'si veya kodu")
    transcript: str = Field(default="", description="Ders boyunca konuşulan yerel transkript (Zero-Audio)")
    pdf_text_context: Optional[str] = Field(default=None, description="PDF veya materyal bağlamı")
    highlighted_words: List[str] = Field(default=[], description="Tahtada vurgulanan kelimeler")

class BoardSummaryResponse(BaseModel):
    class_id: str
    title: str = Field(..., description="Ders Başlığı")
    summary_points: List[str] = Field(..., description="3-4 Maddelik Hap Yönetici Özeti")
    key_terms: List[BoardKeyTerm] = Field(..., description="Vurgulanan 5 Kritik Terim ve Türkçe Anlamları")
    quiz_questions: List[BoardQuizQuestion] = Field(..., description="3 Hızlı Anlama Sorusu")
    created_at: Optional[str] = None


# =========================================================================
# FAZ 2: TEKİL KULLANICI SINIF, BİLET, UTC TAKVİM & IBAN PROFİLİ ŞEMALARI
# =========================================================================

class PayoutProfileUpsert(BaseModel):
    user_id: str = Field(..., description="Kullanıcı benzersiz ID'si")
    account_type: str = Field(default="individual", description="'individual' | 'company'")
    legal_full_name: str = Field(..., description="Yasal Ad Soyad veya Şirket Ünvanı")
    identity_number: str = Field(..., description="T.C. Kimlik No veya Vergi Kimlik No")
    iban: str = Field(..., description="TR ile başlayan IBAN numarası")


class ClassCreateRequest(BaseModel):
    teacher_id: str = Field(..., description="Dersi açan öğretmenin ID'si")
    name: str = Field(..., description="Ders / Sınıf Başlığı")
    price: float = Field(default=0.0, description="0 = Ücretsiz, > 0 = Ücretli")
    currency: str = Field(default="TRY", description="'TRY' | 'USD' | 'EUR'")
    billing_type: str = Field(default="one_time", description="'one_time' | 'monthly'")
    schedule_mode: str = Field(default="fixed", description="'fixed' | 'slot_booking'")
    scheduled_dates_utc: List[str] = Field(default=[], description="ISO-8601 UTC tarih-saat listesi (Örn: ['2026-11-18T17:00:00Z'])")
    duration_minutes: int = Field(default=60, description="Ders süresi (dakika)")
    monthly_credits: int = Field(default=0, description="Aylık abonelik kredi hakkı")


class JoinClassRequest(BaseModel):
    user_id: str = Field(..., description="Katılan kullanıcının ID'si")
    selected_session_id: Optional[str] = Field(default=None, description="Katılmak istediği belirli oturum ID'si")


class SendMaterialRequest(BaseModel):
    teacher_id: str = Field(..., description="Materyali gönderen öğretmenin ID'si")
    class_id: str = Field(..., description="İlgili sınıf ID'si")
    subject: str = Field(..., description="Materyal / E-posta konusu")
    message_body: str = Field(..., description="Mesaj veya ödev açıklaması")
    attachment_url: Optional[str] = Field(default=None, description="Ek dosya veya link URL'i")


# =========================================================================
# FAZ 5: ÖDEME GEÇİDİ, SPLIT PAYMENT VE WEBHOOK ŞEMALARI
# =========================================================================

class CheckoutRequest(BaseModel):
    user_id: str = Field(..., description="Ödemeyi yapan öğrencinin ID'si")
    class_id: str = Field(..., description="Satın alınmak istenen sınıf ID'si")
    session_id: Optional[str] = Field(default=None, description="Opsiyonel belirli seans ID'si")


class WebhookPaymentRequest(BaseModel):
    transaction_id: str = Field(..., description="Ödeme işlemi benzersiz takip numarası")
    status: str = Field(default="success", description="'success' | 'failed'")
    user_id: Optional[str] = Field(default=None, description="Öğrenci ID'si")
    class_id: Optional[str] = Field(default=None, description="Sınıf ID'si")
    session_id: Optional[str] = Field(default=None, description="Seans ID'si")
    amount: Optional[float] = Field(default=None, description="Ödenen tutar")




