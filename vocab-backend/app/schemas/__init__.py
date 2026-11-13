from typing import Optional
from pydantic import BaseModel
from app.schemas.flashcard import (
    FlashcardData,
    Meaning,
    ExampleSentence,
    CardGenerateRequest,
    BatchCardGenerateRequest,
    CardGenerateResponse,
    BatchCardGenerateResponse,
)


from app.schemas.gamification import AwardXPRequest, UserProfileResponse
from app.schemas.speaking import SpeakingRespondRequest, SpeakingRespondResponse, ScenarioMetadata
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    UpdateProfileRequest,
)
from app.schemas.classroom import (
    PayoutProfileUpsert,
    ClassCreateRequest,
    JoinClassRequest,
    SendMaterialRequest,
)


class HealthCheck(BaseModel):
    status: str
    project_name: str
    api_version: str
    database_connected: Optional[bool] = None

