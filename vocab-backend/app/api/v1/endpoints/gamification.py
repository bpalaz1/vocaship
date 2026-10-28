from typing import Optional, Dict, Any
from fastapi import APIRouter, status, Query
from app.schemas.gamification import (
    AwardXPRequest,
    UserProfileResponse,
    LeaderboardResponse,
    ShopResponse,
    OpenChestRequest,
    OpenChestResponse,
    MyCharactersResponse,
    SetAvatarRequest,
)
from app.services.gamification_service import (
    award_xp,
    get_user_profile,
    get_leaderboard,
    get_shop_info,
    open_chest,
    get_my_characters,
    set_active_avatar,
)

router = APIRouter(prefix="", tags=["Gamification, XP & Gacha Shop"])


@router.post("/award-xp", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
@router.post("/award", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
async def award_xp_endpoint(payload: AwardXPRequest):
    """
    Kullanıcıya belirli bir eylem için XP ve Altın kazandırır.
    Eylemler:
    - story_completed: +50 XP, +50 🪙
    - quiz_correct: +20 XP, +15 🪙
    - sm2_review: +10 XP, +10 🪙
    - card_added: +5 XP, +5 🪙
    - daily_login: +25 XP, +25 🪙
    - custom: amount alanında belirtilen kadar XP
    """
    profile = award_xp(
        action=payload.get_action(),
        amount=payload.get_amount(),
        user_id=payload.user_id,
        details=payload.details,
    )
    return profile


@router.get("/profile", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
async def get_profile_endpoint(user_id: Optional[str] = None):
    """
    Kullanıcının güncel seviye, unvan, toplam XP, altın ve günlük seri (streak 🔥) bilgilerini döner.
    """
    profile = get_user_profile(user_id=user_id)
    return profile


@router.get("/leaderboard", response_model=LeaderboardResponse, status_code=status.HTTP_200_OK)
async def get_leaderboard_endpoint(
    timeframe: str = Query("weekly", description="Zaman aralığı: weekly veya all_time"),
    user_id: Optional[str] = None,
):
    """
    Haftalık veya tüm zamanlar için rekabet ve liderlik tablosu sıralamasını döner.
    """
    leaderboard = get_leaderboard(timeframe=timeframe, user_id=user_id)
    return leaderboard


@router.get("/shop", response_model=ShopResponse, status_code=status.HTTP_200_OK)
async def get_shop_endpoint(user_id: Optional[str] = None):
    """
    Mağazadaki mevcut gizemli sandıkları, fiyatlarını ve kullanıcının altın bakiyesini döner.
    """
    return get_shop_info(user_id=user_id)


@router.post("/open-chest", response_model=OpenChestResponse, status_code=status.HTTP_200_OK)
async def open_chest_endpoint(payload: OpenChestRequest):
    """
    Sandık açıp olasılıklara göre yeni bir karakter kazandırır veya kopya ise altın iadesi yapar.
    """
    return open_chest(chest_id=payload.chest_id, user_id=payload.user_id)


@router.get("/my-characters", response_model=MyCharactersResponse, status_code=status.HTTP_200_OK)
async def get_my_characters_endpoint(user_id: Optional[str] = None):
    """
    Kullanıcının kilitli ve açtığı tüm karakterleri, istatistiklerini ve aktif avatarını döner.
    """
    return get_my_characters(user_id=user_id)


@router.patch("/set-avatar", status_code=status.HTTP_200_OK)
async def set_avatar_endpoint(payload: SetAvatarRequest):
    """
    Açılmış karakterlerden birini kullanıcının profil ve liderlik tablosundaki aktif avatarı yapar.
    """
    return set_active_avatar(character_id=payload.character_id, user_id=payload.user_id)


