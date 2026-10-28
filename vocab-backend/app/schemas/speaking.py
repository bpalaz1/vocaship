from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class DialogueTurn(BaseModel):
    role: str = Field(..., description="'assistant' or 'user'")
    message: str = Field(..., description="Content of the dialogue turn")


class SpeakingRespondRequest(BaseModel):
    scenario_id: str = Field(
        ...,
        description="Scenario identifier ('project_control' | 'contract_claims' | 'corporate_finance' | 'ielts_simulator')",
    )
    history: List[Dict[str, str]] = Field(
        default=[],
        description="List of previous dialogue turns (e.g. [{'role': 'assistant', 'message': '...'}])",
    )
    user_transcript: str = Field(..., description="Spoken transcript from the user")
    story_context: Optional[str] = Field(
        default=None,
        description="Optional story context passed from reading room or custom document",
    )
    target_level: Optional[str] = Field(
        default="C1",
        description="Target CEFR level (B2 or C1)",
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
        description="Boundary of allowed topics to enforce strict category guardrails",
    )


class SpeakingRespondResponse(BaseModel):
    assistant_reply: str = Field(
        ...,
        description="Natural in-character reply and follow-up question to be spoken by TTS",
    )
    grammar_feedback: Optional[str] = Field(
        default=None,
        description="Grammar or phrasing corrections, or None if error-free",
    )
    better_alternative: str = Field(
        ...,
        description="C1 level polished corporate alternative to the user's sentence",
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
        default=80,
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
