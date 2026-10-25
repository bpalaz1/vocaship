from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class AwardXPRequest(BaseModel):
    action: Optional[str] = Field(None, description="Action type: story_completed, quiz_correct, sm2_review, card_added, daily_login, custom")
    action_type: Optional[str] = Field(None, description="Alternative field for action")
    amount: Optional[int] = Field(None, description="Optional custom XP amount override")
    custom_xp: Optional[int] = Field(None, description="Alternative field for custom XP amount")
    user_id: Optional[str] = Field(None, description="Optional user ID, defaults to current active user")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional metadata or context")

    def get_action(self) -> str:
        return self.action or self.action_type or "quiz_correct"

    def get_amount(self) -> Optional[int]:
        if self.amount is not None:
            return self.amount
        if self.custom_xp is not None:
            return self.custom_xp
        return None


class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    total_xp: int
    level: int
    title: str
    badge: str
    level_title: str
    streak_days: int
    last_active_date: Optional[str] = None
    next_level_xp: int
    xp_to_next_level: int
    current_level_min_xp: int
    level_progress_percent: float
    recent_awarded_xp: Optional[int] = None
    leveled_up: bool = False
    message: Optional[str] = None
    coins: Optional[int] = 300
    active_avatar: Optional[str] = "🌟"
    active_avatar_id: Optional[str] = "char_default"


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    name: str
    avatar: str
    total_xp: int
    level: int
    title: str
    badge: str
    streak_days: int
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    timeframe: str
    current_user_rank: int
    total_participants: int
    entries: List[LeaderboardEntry]


class Character(BaseModel):
    id: str
    name: str
    rarity: str = Field(..., description="'common' | 'rare' | 'epic' | 'legendary'")
    icon: str
    image_url: Optional[str] = None
    description: str
    chest_theme: Optional[str] = None
    is_unlocked: bool = False
    unlocked_at: Optional[str] = None


class Chest(BaseModel):
    id: str
    name: str
    price: int
    icon: str
    description: str
    theme: str
    available_characters: List[str] = Field(default_factory=list)
    rarity_rates: Dict[str, int] = Field(default_factory=dict)


class OpenChestRequest(BaseModel):
    chest_id: str
    user_id: Optional[str] = None


class OpenChestResponse(BaseModel):
    unlocked_character: Character
    remaining_coins: int
    is_duplicate: bool = False
    coins_refunded: int = 0
    message: str


class SetAvatarRequest(BaseModel):
    character_id: str
    user_id: Optional[str] = None


class MyCharactersResponse(BaseModel):
    characters: List[Character]
    active_avatar: str
    active_avatar_id: str
    total_coins: int
    total_unlocked: int
    total_characters: int


class ShopResponse(BaseModel):
    chests: List[Chest]
    user_coins: int
    active_avatar: str

