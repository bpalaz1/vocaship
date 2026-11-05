from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class DialogueTurn(BaseModel):
    role: str = Field(..., description="'assistant' or 'user'")
    message: str = Field(..., description="Content of the dialogue turn")


class SpeakingFeedback(BaseModel):
    grammar_correction: Optional[str] = Field(
        default=None,
        description="Kullanıcının cümlesinde gramer/edat hatası varsa düzeltilmiş hali, yoksa null",
    )
    better_alternative: str = Field(
        default="",
        description="Kullanıcının söylediği cümlenin daha doğal, akıcı veya C1 düzeyindeki hali",
    )
    used_vocabulary: List[str] = Field(
        default=[],
        description="Kullanıcının başarıyla telaffuz ettiği hedef/sektörel kelimeler",
    )
    fluency_score: int = Field(
        default=85,
        ge=0,
        le=100,
        description="0-100 arası akıcılık ve doğallık puanı",
    )


class SpeakingRespondRequest(BaseModel):
    scenario_id: str = Field(
        default="project_control",
        description="Scenario identifier ('project_control' | 'contract_claims' | 'corporate_finance' | 'ielts_simulator')",
    )
    history: List[Dict[str, Any]] = Field(
        default=[],
        description="List of previous dialogue turns (e.g. [{'role': 'assistant', 'message': '...'}])",
    )
    conversation_history: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Full conversation history [{'role': m.role, 'content': m.text}]",
    )
    user_transcript: str = Field(..., description="Spoken transcript from the user")
    story_context: Optional[str] = Field(
        default=None,
        description="Optional story context passed from reading room or custom document",
    )
    target_level: Optional[str] = Field(
        default="C1",
        description="Target CEFR level (A1, A2, B1, B2, or C1)",
    )
    conversation_mode: Optional[str] = Field(
        default="interview",
        description="'casual' | 'problem_solving' | 'interview' | 'story_debate'",
    )
    active_category: Optional[str] = Field(
        default=None,
        description="Active category (e.g. 'Daily Life & Basics', 'Project Controls', etc.)",
    )
    allowed_scope: Optional[str] = Field(
        default=None,
        description="Boundary of allowed topics",
    )


class SpeakingMetrics(BaseModel):
    fluency: int = Field(default=85, ge=0, le=100, description="Fluency score (0-100)")
    vocabulary: int = Field(default=80, ge=0, le=100, description="Vocabulary/jargon score (0-100)")
    grammar: int = Field(default=90, ge=0, le=100, description="Grammar accuracy score (0-100)")


class SpeakingRespondResponse(BaseModel):
    assistant_reply: str = Field(
        ...,
        description="Kullanıcının seviyesine uygun, doğal, seslendirilecek İngilizce cevap",
    )
    reply_message: Optional[str] = Field(
        default=None,
        description="Alias for assistant_reply",
    )
    follow_up_question: Optional[str] = Field(
        default=None,
        description="Kullanıcının cümlesine ve CEFR seviyesine özel dinamik açık uçlu takip sorusu",
    )
    metrics: Optional[SpeakingMetrics] = Field(
        default=None,
        description="Fluency, vocabulary ve grammar değerlendirme skorları",
    )
    feedback: Any = Field(
        ...,
        description="Vocaship Live Speaking Engine standardında gramer düzeltmesi, alternatif cümle veya övgü/geri bildirim",
    )
    # Geriye dönük uyumluluk alanları (mevcut arayüz bileşenlerinin sorunsuz çalışması için)
    grammar_feedback: Optional[str] = Field(
        default=None,
        description="Grammar or phrasing corrections, or None if error-free",
    )
    better_alternative: str = Field(
        default="",
        description="C1 level polished alternative to the user's sentence",
    )
    vocabulary_highlight: List[str] = Field(
        default=[],
        description="List of strong technical jargon terms used by the user",
    )
    jargon_score: int = Field(
        default=85,
        ge=0,
        le=100,
        description="Sectoral jargon appropriateness score (0-100)",
    )
    fluency_score: int = Field(
        default=85,
        ge=0,
        le=100,
        description="Fluency and coherence score (0-100)",
    )


class ScenarioMetadata(BaseModel):
    id: str
    icon: str
    title: str
    role_name: str
    tagline: str
    context_desc: str
    target_vocabulary: List[str]
    initial_greeting: str


class DeckQuestionItem(BaseModel):
    question: str = Field(..., description="Açık uçlu konuşma sorusu")
    target_word_hint: str = Field(..., description="Soruda kullanılması teşvik edilen hedef kelime")


class GenerateDeckQuestionsRequest(BaseModel):
    deck_id: Optional[str] = Field(default=None, description="Opsiyonel deste kimliği")
    deck_title: Optional[str] = Field(default="Aktif Destem", description="Deste başlığı")
    target_words: List[str] = Field(..., description="Desteden seçilen 5-8 adet hedef kelime")
    target_level: Optional[str] = Field(default="B2", description="Hedef CEFR seviyesi (A2, B1, B2, C1)")


class GenerateDeckQuestionsResponse(BaseModel):
    deck_id: Optional[str] = None
    deck_title: Optional[str] = "Aktif Destem"
    target_words: List[str] = []
    questions: List[DeckQuestionItem] = []


class ArchiveTranscriptTurn(BaseModel):
    sender: str = Field(..., description="'user' | 'ai'")
    text: str = Field(..., description="Message text")
    timestamp: Optional[str] = Field(default=None, description="Time formatted")
    feedback: Optional[Dict[str, Any]] = None


class ArchiveMetrics(BaseModel):
    fluency: int = Field(default=85, ge=0, le=100)
    vocabulary: int = Field(default=80, ge=0, le=100)
    grammar: int = Field(default=90, ge=0, le=100)
    overall_score: int = Field(default=85, ge=0, le=100)
    level: Optional[str] = "B2"


class StoryQuestionItem(BaseModel):
    question: str
    theme_hint: Optional[str] = None


class GenerateStoryQuestionsRequest(BaseModel):
    story_id: Optional[str] = None
    title: str
    snippet: Optional[str] = None
    content: Optional[str] = None
    target_words: List[str] = Field(default=[])
    target_level: Optional[str] = "B1"


class GenerateStoryQuestionsResponse(BaseModel):
    story_id: Optional[str] = None
    title: str
    opening_question: str
    questions: List[StoryQuestionItem] = []


class SpeakingArchiveCreate(BaseModel):
    session_title: str = Field(..., description="Session title / topic name")
    transcript: List[Dict[str, Any]] = Field(..., description="List of turns: [{ sender, text, timestamp }]")
    metrics: Dict[str, Any] = Field(..., description="{ fluency, vocabulary, grammar, overall_score }")
    user_id: Optional[str] = Field(default=None, description="User UUID")


class SpeakingArchiveResponse(BaseModel):
    id: str
    user_id: str
    session_title: str
    transcript: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    created_at: str
    xp_awarded: Optional[int] = 30
