from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

HubType = Literal["academic", "professional"]

AcademicHubKey = Literal["yds_yokdil", "ielts_toefl"]

ProfessionalHubKey = Literal[
    "project_management",
    "project_controls",
    "engineering_civil",
    "engineering_process_chem",
    "engineering_mechanical",
    "medical_health",
    "legal_contracts",
    "finance_accounting",
    "tech_executive",
]

CareerHubKey = Literal[
    "yds_yokdil",
    "ielts_toefl",
    "project_management",
    "project_controls",
    "engineering_civil",
    "engineering_process_chem",
    "engineering_mechanical",
    "medical_health",
    "legal_contracts",
    "finance_accounting",
    "tech_executive",
]


class CareerHubVocabularyCard(BaseModel):
    word: str
    phonetic: str
    meaning: str
    exampleEn: str
    exampleTr: str


class CareerHubReadingCase(BaseModel):
    title: str
    level: str
    snippet: str
    full_text: str


class CareerHubItem(BaseModel):
    key: str = Field(..., description="Unique hub identifier")
    type: HubType = Field(..., description="'academic' or 'professional'")
    icon: str = Field(..., description="Visual emoji or icon key")
    title: str = Field(..., description="Localized or main title")
    tagline: str = Field(..., description="Short subtitle with focus areas")
    description: str = Field(..., description="Detailed description")
    badges: List[str] = Field(default=[], description="Accreditation & sectoral tags")
    target_level: str = Field("C1", description="CEFR Level (e.g. B2, C1)")
    card_count: int = Field(..., description="Estimated card count")
    sample_words: List[str] = Field(default=[], description="Representative key terms")
    cards: List[CareerHubVocabularyCard] = Field(default=[], description="Curated preview flashcards")
    reading_case: CareerHubReadingCase = Field(..., description="Real-world case study snippet")
    speaking_scenario_id: str = Field(..., description="Matching scenario identifier in Speaking Lounge")


class CareerHubsResponse(BaseModel):
    academic: List[CareerHubItem]
    professional: List[CareerHubItem]
