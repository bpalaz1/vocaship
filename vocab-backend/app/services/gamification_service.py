import logging
import random
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple, List
from fastapi import HTTPException
from app.core.database import get_db
from app.schemas.gamification import (
    UserProfileResponse,
    LeaderboardEntry,
    LeaderboardResponse,
    Character,
    Chest,
    OpenChestResponse,
    MyCharactersResponse,
    ShopResponse,
)

logger = logging.getLogger("vocaship.gamification")

# XP Kuralları
XP_RULES: Dict[str, int] = {
    "story_completed": 50,
    "quiz_correct": 20,
    "sm2_review": 10,
    "card_added": 5,
    "daily_login": 25,
    "weak_spots_cleared": 20,
}

# Altın / Coin Kuralları
COIN_RULES: Dict[str, int] = {
    "story_completed": 50,
    "quiz_correct": 15,
    "sm2_review": 10,
    "card_added": 5,
    "daily_login": 25,
    "weak_spots_cleared": 20,
}

# Seviye ve Unvan Tanımları
# 0-300: Kelime Çırağı 🥉 (Lv. 1)
# 301-1000: Kelime Avcısı 🥈 (Lv. 2)
# 1001-3000: Hikaye Ustası 🥇 (Lv. 3)
# 3000+: Sözlük Efsanesi 👑 (Lv. 4)
def calculate_level_info(total_xp: int) -> Dict[str, Any]:
    xp = max(0, total_xp)

    if xp <= 300:
        level = 1
        title = "Kelime Çırağı"
        badge = "🥉"
        min_xp = 0
        next_xp = 301
        progress = (xp / 300.0) * 100 if xp > 0 else 0.0
    elif xp <= 1000:
        level = 2
        title = "Kelime Avcısı"
        badge = "🥈"
        min_xp = 301
        next_xp = 1001
        progress = ((xp - 301) / (1000 - 301)) * 100
    elif xp <= 3000:
        level = 3
        title = "Hikaye Ustası"
        badge = "🥇"
        min_xp = 1001
        next_xp = 3001
        progress = ((xp - 1001) / (3000 - 1001)) * 100
    else:
        level = 4
        title = "Sözlük Efsanesi"
        badge = "👑"
        min_xp = 3001
        next_xp = xp
        progress = 100.0

    xp_to_next = max(0, next_xp - xp) if level < 4 else 0

    return {
        "level": level,
        "title": title,
        "badge": badge,
        "level_title": f"{title} {badge}",
        "current_level_min_xp": min_xp,
        "next_level_xp": next_xp,
        "xp_to_next_level": xp_to_next,
        "level_progress_percent": round(min(100.0, max(0.0, progress)), 1),
    }


def update_user_streak(current_streak: Optional[int], last_active: Optional[str]) -> Tuple[int, str, bool]:
    """
    Kullanıcının alevli günlük serisini (streak 🔥) hesaplar.
    Döner: (yeni_streak, bugünün_tarihi, bugün_ilk_aktivite_mi)
    """
    today_str = date.today().isoformat()
    yesterday_str = (date.today() - timedelta(days=1)).isoformat()

    streak = int(current_streak) if current_streak is not None and current_streak > 0 else 1

    if not last_active:
        return 1, today_str, True

    last_date_str = str(last_active)[:10]

    if last_date_str == today_str:
        # Bugün zaten giriş yapılmış
        return streak, today_str, False
    elif last_date_str == yesterday_str:
        # Dün giriş yapılmış, seri 1 gün artar!
        return streak + 1, today_str, True
    else:
        # Bir günden fazla ara verilmiş, seri 1'e döner
        return 1, today_str, True


def get_or_create_user(db, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Mevcut kullanıcıyı getirir veya varsayılan kullanıcı oluşturur."""
    if user_id:
        try:
            res = db.table("users").select("*").eq("id", user_id).limit(1).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warning(f"User lookup by ID failed: {e}")

    # Fallback to primary active user
    try:
        res = db.table("users").select("*").limit(1).execute()
        if res.data:
            return res.data[0]
    except Exception as e:
        logger.warning(f"Primary user lookup failed: {e}")

    # Create default user if none exists
    new_user = {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "user@vocaship.com",
        "full_name": "Vocaship Kahramanı",
        "total_xp": 0,
        "level": 1,
        "streak_days": 1,
        "last_active_date": date.today().isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        res = db.table("users").insert(new_user).execute()
        if res.data:
            return res.data[0]
    except Exception as e:
        logger.warning(f"Default user insert failed: {e}")

    return new_user


def get_user_profile(user_id: Optional[str] = None) -> UserProfileResponse:
    """Kullanıcının profil, XP, seviye ve streak bilgilerini döner ve günlük girişi günceller."""
    db = get_db()
    user = get_or_create_user(db, user_id)

    curr_xp = int(user.get("total_xp") or 0)
    curr_coins = int(user.get("coins") if user.get("coins") is not None else 300)
    curr_streak = int(user.get("streak_days") or 1)
    last_active = user.get("last_active_date")
    active_avatar = str(user.get("active_avatar") or "🌟")
    active_avatar_id = str(user.get("active_avatar_id") or "char_default")

    new_streak, new_active_date, is_first_today = update_user_streak(curr_streak, last_active)

    update_payload = {}
    extra_login_xp = 0
    message = None

    if is_first_today:
        extra_login_xp = XP_RULES["daily_login"]
        curr_xp += extra_login_xp
        curr_coins += COIN_RULES["daily_login"]
        update_payload["total_xp"] = curr_xp
        update_payload["coins"] = curr_coins
        update_payload["streak_days"] = new_streak
        update_payload["last_active_date"] = new_active_date
        message = f"Günün ilk girişi! +{extra_login_xp} XP, +{COIN_RULES['daily_login']} 🪙 ve 🔥 {new_streak}. gün serisi kazanıldı!"
    elif last_active != new_active_date or curr_streak != new_streak:
        update_payload["streak_days"] = new_streak
        update_payload["last_active_date"] = new_active_date

    lvl_info = calculate_level_info(curr_xp)
    update_payload["level"] = lvl_info["level"]

    if update_payload:
        try:
            db.table("users").update(update_payload).eq("id", user["id"]).execute()
        except Exception as e:
            logger.warning(f"Profile update sync failed: {e}")

    return UserProfileResponse(
        user_id=str(user.get("id")),
        email=str(user.get("email", "user@vocaship.com")),
        full_name=str(user.get("full_name", "Vocaship Öğrencisi")),
        total_xp=curr_xp,
        level=lvl_info["level"],
        title=lvl_info["title"],
        badge=lvl_info["badge"],
        level_title=lvl_info["level_title"],
        streak_days=new_streak,
        last_active_date=new_active_date,
        next_level_xp=lvl_info["next_level_xp"],
        xp_to_next_level=lvl_info["xp_to_next_level"],
        current_level_min_xp=lvl_info["current_level_min_xp"],
        level_progress_percent=lvl_info["level_progress_percent"],
        recent_awarded_xp=extra_login_xp if is_first_today else None,
        leveled_up=False,
        message=message,
        coins=curr_coins,
        active_avatar=active_avatar,
        active_avatar_id=active_avatar_id,
    )


def award_xp(
    action: str,
    amount: Optional[int] = None,
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> UserProfileResponse:
    """
    Belirli bir aktivite için kullanıcıya XP ve Altın (Coin) kazandırır, seviye atlamasını denetler ve günceller.
    """
    db = get_db()
    user = get_or_create_user(db, user_id)

    # 1. Kazanılacak XP ve Altın miktarını belirle
    xp_to_add = amount if amount is not None else XP_RULES.get(action, 10)
    earned_coins = COIN_RULES.get(action, 10)

    curr_xp = int(user.get("total_xp") or 0)
    curr_coins = int(user.get("coins") if user.get("coins") is not None else 300)
    active_avatar = str(user.get("active_avatar") or "🌟")
    active_avatar_id = str(user.get("active_avatar_id") or "char_default")

    old_lvl_info = calculate_level_info(curr_xp)
    old_level = old_lvl_info["level"]

    # 2. Streak ve günlük giriş kontrolü
    curr_streak = int(user.get("streak_days") or 1)
    last_active = user.get("last_active_date")
    new_streak, new_active_date, is_first_today = update_user_streak(curr_streak, last_active)

    daily_bonus = 0
    if is_first_today and action != "daily_login":
        daily_bonus = XP_RULES["daily_login"]
        earned_coins += COIN_RULES["daily_login"]

    total_added = xp_to_add + daily_bonus
    new_total_xp = curr_xp + total_added
    new_coins = curr_coins + earned_coins

    # 3. Yeni seviye ve unvan hesaplaması
    new_lvl_info = calculate_level_info(new_total_xp)
    new_level = new_lvl_info["level"]
    leveled_up = new_level > old_level

    # 4. Veritabanı güncellemesi
    update_payload = {
        "total_xp": new_total_xp,
        "coins": new_coins,
        "level": new_level,
        "streak_days": new_streak,
        "last_active_date": new_active_date,
    }

    try:
        db.table("users").update(update_payload).eq("id", user["id"]).execute()
    except Exception as e:
        logger.warning(f"Award XP DB update failed: {e}")

    # Mesaj kurgusu
    action_labels = {
        "story_completed": "Hikaye Tamamlandı! 📖",
        "quiz_correct": "Doğru Yanıt! 🎯",
        "sm2_review": "Kart Tekrarı! 🧠",
        "card_added": "Yeni Kelime Eklendi! ✨",
        "daily_login": "Günlük Giriş Bonusu! 🌟",
    }
    label = action_labels.get(action, "Aktivite Tamamlandı!")

    if leveled_up:
        msg = f"🎉 TEBRİKLER! Seviye Atladınız: {new_lvl_info['level_title']} (Lv. {new_level})! +{total_added} XP, +{earned_coins} 🪙"
    elif daily_bonus > 0:
        msg = f"✨ +{xp_to_add} XP ({label}), +{earned_coins} 🪙 ve +{daily_bonus} XP Günlük Giriş Bonusu! 🔥 {new_streak} Günlük Seri!"
    else:
        msg = f"✨ +{xp_to_add} XP ({label}), +{earned_coins} 🪙"

    return UserProfileResponse(
        user_id=str(user.get("id")),
        email=str(user.get("email", "user@vocaship.com")),
        full_name=str(user.get("full_name", "Vocaship Öğrencisi")),
        total_xp=new_total_xp,
        level=new_level,
        title=new_lvl_info["title"],
        badge=new_lvl_info["badge"],
        level_title=new_lvl_info["level_title"],
        streak_days=new_streak,
        last_active_date=new_active_date,
        next_level_xp=new_lvl_info["next_level_xp"],
        xp_to_next_level=new_lvl_info["xp_to_next_level"],
        current_level_min_xp=new_lvl_info["current_level_min_xp"],
        level_progress_percent=new_lvl_info["level_progress_percent"],
        recent_awarded_xp=total_added,
        leveled_up=leveled_up,
        message=msg,
        coins=new_coins,
        active_avatar=active_avatar,
        active_avatar_id=active_avatar_id,
    )


# -------------------------------------------------------------
# Liderlik Tablosu & Rekabet Verileri (Sprint 3.3)
# -------------------------------------------------------------
SIMULATED_CLASSMATES = [
    {
        "user_id": "sim-user-01",
        "name": "Zeynep Kaya",
        "avatar": "🦊",
        "streak_days": 14,
        "all_time_xp": 1850,
        "weekly_xp": 520,
    },
    {
        "user_id": "sim-user-02",
        "name": "Emir Demir",
        "avatar": "🦁",
        "streak_days": 9,
        "all_time_xp": 1420,
        "weekly_xp": 410,
    },
    {
        "user_id": "sim-user-03",
        "name": "Defne Yılmaz",
        "avatar": "🦄",
        "streak_days": 18,
        "all_time_xp": 1180,
        "weekly_xp": 360,
    },
    {
        "user_id": "sim-user-04",
        "name": "Can Yıldız",
        "avatar": "🚀",
        "streak_days": 6,
        "all_time_xp": 950,
        "weekly_xp": 280,
    },
    {
        "user_id": "sim-user-05",
        "name": "Selin Çelik",
        "avatar": "🐼",
        "streak_days": 11,
        "all_time_xp": 780,
        "weekly_xp": 240,
    },
    {
        "user_id": "sim-user-06",
        "name": "Burak Şahin",
        "avatar": "🦅",
        "streak_days": 4,
        "all_time_xp": 610,
        "weekly_xp": 190,
    },
    {
        "user_id": "sim-user-07",
        "name": "Elif Öztürk",
        "avatar": "🦉",
        "streak_days": 8,
        "all_time_xp": 490,
        "weekly_xp": 150,
    },
    {
        "user_id": "sim-user-08",
        "name": "Mert Aydın",
        "avatar": "🐺",
        "streak_days": 3,
        "all_time_xp": 360,
        "weekly_xp": 110,
    },
    {
        "user_id": "sim-user-09",
        "name": "Aslı Koç",
        "avatar": "🐯",
        "streak_days": 5,
        "all_time_xp": 280,
        "weekly_xp": 90,
    },
    {
        "user_id": "sim-user-10",
        "name": "Kerem Bulut",
        "avatar": "⚡",
        "streak_days": 2,
        "all_time_xp": 190,
        "weekly_xp": 60,
    },
]


def get_leaderboard(timeframe: str = "weekly", user_id: Optional[str] = None) -> LeaderboardResponse:
    """
    Haftalık veya tüm zamanlar için gerçek kullanıcı ve sınıf arkadaşlarını
    içeren sıralı liderlik tablosunu döner.
    """
    db = get_db()
    current_user = get_or_create_user(db, user_id)

    user_total_xp = int(current_user.get("total_xp") or 0)
    user_streak = int(current_user.get("streak_days") or 1)
    user_name = str(current_user.get("full_name") or "Vocaship Kahramanı")
    user_uid = str(current_user.get("id"))

    # Haftalık XP hesabı (kullanıcının toplam XP'siyle dinamik orantılı)
    is_weekly = timeframe.lower() != "all_time"
    if is_weekly:
        user_xp = min(user_total_xp, max(80, int(user_total_xp * 0.55))) if user_total_xp > 0 else 0
    else:
        user_xp = user_total_xp

    items = []

    # 1. Simüle sınıf arkadaşları
    for peer in SIMULATED_CLASSMATES:
        peer_xp = peer["weekly_xp"] if is_weekly else peer["all_time_xp"]
        lvl_info = calculate_level_info(peer_xp)
        items.append({
            "user_id": peer["user_id"],
            "name": peer["name"],
            "avatar": peer["avatar"],
            "xp": peer_xp,
            "level": lvl_info["level"],
            "title": lvl_info["title"],
            "badge": lvl_info["badge"],
            "streak_days": peer["streak_days"],
            "is_current_user": False,
        })

    # 2. Gerçek kullanıcıyı listeye ekle
    user_lvl_info = calculate_level_info(user_xp)
    items.append({
        "user_id": user_uid,
        "name": f"{user_name} (Sen)",
        "avatar": current_user.get("active_avatar") or "🌟",
        "xp": user_xp,
        "level": user_lvl_info["level"],
        "title": user_lvl_info["title"],
        "badge": user_lvl_info["badge"],
        "streak_days": user_streak,
        "is_current_user": True,
    })

    # 3. XP'ye göre azalan sırada sırala (aynı puanda gerçek kullanıcıyı önceliklendir)
    items.sort(key=lambda x: (x["xp"], 1 if x["is_current_user"] else 0), reverse=True)

    # 4. Sıralama ve LeaderboardEntry oluşturma
    entries: List[LeaderboardEntry] = []
    current_user_rank = 1

    for idx, item in enumerate(items, start=1):
        if item["is_current_user"]:
            current_user_rank = idx

        entries.append(
            LeaderboardEntry(
                rank=idx,
                user_id=item["user_id"],
                name=item["name"],
                avatar=item["avatar"],
                total_xp=item["xp"],
                level=item["level"],
                title=item["title"],
                badge=item["badge"],
                streak_days=item["streak_days"],
                is_current_user=item["is_current_user"],
            )
        )

    return LeaderboardResponse(
        timeframe="weekly" if is_weekly else "all_time",
        current_user_rank=current_user_rank,
        total_participants=len(entries),
        entries=entries,
    )


# -------------------------------------------------------------
# Karakter Koleksiyonu & Sandık (Gacha) Kataloğu
# -------------------------------------------------------------
ALL_CHARACTERS: List[Dict[str, Any]] = [
    # --- COMMON (%70) ---
    {
        "id": "char_squire",
        "name": "Acemi Şövalye",
        "rarity": "common",
        "icon": "⚔️",
        "image_url": None,
        "description": "Kraliyet ordusunda ilk adımlarını atan hevesli bir kılıç ustası.",
        "chest_theme": "medieval",
    },
    {
        "id": "char_archer",
        "name": "Köy Okçusu",
        "rarity": "common",
        "icon": "🏹",
        "image_url": None,
        "description": "Hedefini 100 metreden ıskalamayan keskin gözlü köy avcısı.",
        "chest_theme": "medieval",
    },
    {
        "id": "char_cadet",
        "name": "Kozmik Stajyer",
        "rarity": "common",
        "icon": "🛰️",
        "image_url": None,
        "description": "Yıldız filosunun en yeni ve meraklı astronom adayı.",
        "chest_theme": "space",
    },
    {
        "id": "char_bot_fixer",
        "name": "Uzay Tamircisi",
        "rarity": "common",
        "icon": "🔧",
        "image_url": None,
        "description": "Hiperuzay motorlarını somun anahtarıyla tamir eden becerikli usta.",
        "chest_theme": "space",
    },
    {
        "id": "char_gnome",
        "name": "Orman Cücesi",
        "rarity": "common",
        "icon": "🍄",
        "image_url": None,
        "description": "Büyülü mantarların altında yaşayan neşeli minik köylü.",
        "chest_theme": "legends",
    },
    {
        "id": "char_goblin",
        "name": "Altın Avcısı Goblin",
        "rarity": "common",
        "icon": "👺",
        "image_url": None,
        "description": "Her köşede parıldayan sikkelerin peşinde koşan afacan.",
        "chest_theme": "legends",
    },
    # --- RARE (%20) ---
    {
        "id": "char_knight",
        "name": "Kraliyet Muhafızı",
        "rarity": "rare",
        "icon": "🛡️",
        "image_url": None,
        "description": "Kırılmaz çelik kalkanıyla kalenin kapılarını koruyan asil bekçi.",
        "chest_theme": "medieval",
    },
    {
        "id": "char_alchemist",
        "name": "Gizemli Simyacı",
        "rarity": "rare",
        "icon": "🧪",
        "image_url": None,
        "description": "Görünmezlik iksirleri ve sihirli elementler üreten dahi.",
        "chest_theme": "medieval",
    },
    {
        "id": "char_pilot",
        "name": "Yıldız Pilotu",
        "rarity": "rare",
        "icon": "🚀",
        "image_url": None,
        "description": "Işık hızında manevralar yapabilen gözüpek galaksi pilotu.",
        "chest_theme": "space",
    },
    {
        "id": "char_rover",
        "name": "Kuantum Kaşifi",
        "rarity": "rare",
        "icon": "🌌",
        "image_url": None,
        "description": "Karadeliklerin kıyısında yeni galaksiler haritalandıran astronot.",
        "chest_theme": "space",
    },
    {
        "id": "char_wolf",
        "name": "Buz Kurdu",
        "rarity": "rare",
        "icon": "🐺",
        "image_url": None,
        "description": "Kuzey dağlarının ay ışığında uluyan asil ve hızlı yırtıcısı.",
        "chest_theme": "legends",
    },
    {
        "id": "char_ninja",
        "name": "Gölge Hırsızı",
        "rarity": "rare",
        "icon": "🥷",
        "image_url": None,
        "description": "Karanlıkta fısıltı kadar sessizce hareket eden usta suikastçı.",
        "chest_theme": "legends",
    },
    # --- EPIC (%8) ---
    {
        "id": "char_wizard",
        "name": "Ak Büyücü",
        "rarity": "epic",
        "icon": "🧙‍♂️",
        "image_url": None,
        "description": "Yıldırımları ve kadim alfabeleri yöneten asırlık bilge büyücü.",
        "chest_theme": "medieval",
    },
    {
        "id": "char_paladin",
        "name": "Güneş Paladini",
        "rarity": "epic",
        "icon": "⚜️",
        "image_url": None,
        "description": "Kutsal ışığın gücüyle karanlığı dağıtan altın zırhlı kahraman.",
        "chest_theme": "medieval",
    },
    {
        "id": "char_cyborg",
        "name": "Siborg Komutan",
        "rarity": "epic",
        "icon": "🤖",
        "image_url": None,
        "description": "Yapay zekâ destekli sibernetik donanımıyla yenilmez filo lideri.",
        "chest_theme": "space",
    },
    {
        "id": "char_alien",
        "name": "Kozmik Ziyaretçi",
        "rarity": "epic",
        "icon": "👾",
        "image_url": None,
        "description": "Derin uzaydan gelen, psişik dalgalarla iletişim kuran gizemli varlık.",
        "chest_theme": "space",
    },
    {
        "id": "char_phoenix",
        "name": "Alev Anka Kuşu",
        "rarity": "epic",
        "icon": "🦅",
        "image_url": None,
        "description": "Küllerinden yeniden doğan ebedi ateşin ve dirilişin sembolü.",
        "chest_theme": "legends",
    },
    {
        "id": "char_shadow_lord",
        "name": "Karanlık Şövalye",
        "rarity": "epic",
        "icon": "🖤",
        "image_url": None,
        "description": "Gecenin zırhını kuşanmış kadim gölge klanının başı.",
        "chest_theme": "legends",
    },
    # --- LEGENDARY (%2) ---
    {
        "id": "char_dragon",
        "name": "Kadim Ateş Ejderhası",
        "rarity": "legendary",
        "icon": "🐉",
        "image_url": None,
        "description": "Yanardağların kalbinde uyanan, alev püskürten göklerin tek mutlak efendisi!",
        "chest_theme": "medieval",
    },
    {
        "id": "char_chronos",
        "name": "Kozmik Zaman Lordu",
        "rarity": "legendary",
        "icon": "🪐",
        "image_url": None,
        "description": "Zamanı büken ve kuantum gerçekliğini kontrol eden galaktik varlık!",
        "chest_theme": "space",
    },
    {
        "id": "char_titan",
        "name": "Altın Melek Titan",
        "rarity": "legendary",
        "icon": "👑",
        "image_url": None,
        "description": "Gök kubbenin koruyucusu, saf altın ve ışıktan yaratılmış titan!",
        "chest_theme": "legends",
    },
    {
        "id": "char_necromancer",
        "name": "Ruhlar Hükümdarı",
        "rarity": "legendary",
        "icon": "🔮",
        "image_url": None,
        "description": "Kayıp boyutların ve gizemli tılsımların tek mutlak hükümdarı!",
        "chest_theme": "legends",
    },
]

CHEST_CATALOG: Dict[str, Dict[str, Any]] = {
    "medieval": {
        "id": "medieval",
        "name": "Orta Çağ Sandığı",
        "price": 100,
        "icon": "🛡️",
        "description": "Şövalyeler, okçular, muhafızlar ve ak büyücüler! Kadim krallık teması.",
        "theme": "medieval",
        "rates": {"common": 70, "rare": 20, "epic": 8, "legendary": 2},
    },
    "space": {
        "id": "space",
        "name": "Uzay Sandığı",
        "price": 200,
        "icon": "🚀",
        "description": "Kozmik astronotlar, yıldız pilotları ve siborg komutanlar! Galaktik tema.",
        "theme": "space",
        "rates": {"common": 65, "rare": 24, "epic": 9, "legendary": 2},
    },
    "legends": {
        "id": "legends",
        "name": "Efsaneler Sandığı",
        "price": 400,
        "icon": "👑",
        "description": "Yüksek efsanevi şansı! Kadim ejderhalar, titanlar ve anka kuşları!",
        "theme": "legends",
        "rates": {"common": 45, "rare": 32, "epic": 16, "legendary": 7},
    },
}


def _ensure_starter_character(db, user_id: str):
    """Kullanıcının ilk başlangıç karakterine sahip olmasını sağlar."""
    try:
        res = db.table("unlocked_characters").select("*").eq("user_id", user_id).limit(1).execute()
        if not res.data:
            # Starter karakter: Acemi Şövalye
            db.table("unlocked_characters").insert({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "character_id": "char_squire",
                "unlocked_at": datetime.now(timezone.utc).isoformat(),
            }).execute()
    except Exception as e:
        logger.warning(f"Starter character ensure failed: {e}")


def get_shop_info(user_id: Optional[str] = None) -> ShopResponse:
    """Mevcut sandıkları, fiyatlarını ve kullanıcının altın bakiyesini döner."""
    db = get_db()
    user = get_or_create_user(db, user_id)
    user_coins = int(user.get("coins") if user.get("coins") is not None else 300)
    active_avatar = str(user.get("active_avatar") or "🌟")

    chests: List[Chest] = []
    for c_id, c_data in CHEST_CATALOG.items():
        # Bu sandıktan çıkabilecek karakter isimleri
        avail = [ch["name"] for ch in ALL_CHARACTERS if ch.get("chest_theme") == c_data["theme"]]
        chests.append(
            Chest(
                id=c_data["id"],
                name=c_data["name"],
                price=c_data["price"],
                icon=c_data["icon"],
                description=c_data["description"],
                theme=c_data["theme"],
                available_characters=avail,
                rarity_rates=c_data["rates"],
            )
        )

    return ShopResponse(
        chests=chests,
        user_coins=user_coins,
        active_avatar=active_avatar,
    )


def get_my_characters(user_id: Optional[str] = None) -> MyCharactersResponse:
    """Kullanıcının topladığı karakterleri, açık/kilit durumlarını ve aktif avatarını döner."""
    db = get_db()
    user = get_or_create_user(db, user_id)
    u_id = str(user.get("id"))
    _ensure_starter_character(db, u_id)

    user_coins = int(user.get("coins") if user.get("coins") is not None else 300)
    active_avatar = str(user.get("active_avatar") or "⚔️")
    active_avatar_id = str(user.get("active_avatar_id") or "char_squire")

    # Kullanıcının açtığı karakterleri çek
    unlocked_map: Dict[str, str] = {}
    try:
        res = db.table("unlocked_characters").select("*").eq("user_id", u_id).execute()
        for row in (res.data or []):
            unlocked_map[row["character_id"]] = row.get("unlocked_at") or ""
    except Exception as e:
        logger.warning(f"Fetch unlocked characters failed: {e}")

    # Daima starter karakter açık olsun
    if "char_squire" not in unlocked_map:
        unlocked_map["char_squire"] = datetime.now(timezone.utc).isoformat()

    characters: List[Character] = []
    for c_raw in ALL_CHARACTERS:
        cid = c_raw["id"]
        is_u = cid in unlocked_map
        characters.append(
            Character(
                id=cid,
                name=c_raw["name"],
                rarity=c_raw["rarity"],
                icon=c_raw["icon"],
                image_url=c_raw.get("image_url"),
                description=c_raw["description"],
                chest_theme=c_raw.get("chest_theme"),
                is_unlocked=is_u,
                unlocked_at=unlocked_map.get(cid) if is_u else None,
            )
        )

    total_unlocked = sum(1 for c in characters if c.is_unlocked)

    return MyCharactersResponse(
        characters=characters,
        active_avatar=active_avatar,
        active_avatar_id=active_avatar_id,
        total_coins=user_coins,
        total_unlocked=total_unlocked,
        total_characters=len(characters),
    )


def open_chest(chest_id: str, user_id: Optional[str] = None) -> OpenChestResponse:
    """
    Kullanıcının bakiyesini kontrol eder, olasılıklara göre gacha çekimi yapar,
    karakteri envantere ekler veya kopya ise altın iadesi yapar.
    """
    if chest_id not in CHEST_CATALOG:
        raise HTTPException(status_code=404, detail="Geçersiz sandık türü!")

    db = get_db()
    user = get_or_create_user(db, user_id)
    u_id = str(user.get("id"))
    user_coins = int(user.get("coins") if user.get("coins") is not None else 300)

    chest = CHEST_CATALOG[chest_id]
    chest_price = chest["price"]

    # 1. Bakiye kontrolü
    if user_coins < chest_price:
        raise HTTPException(
            status_code=400,
            detail=f"Yetersiz altın! {chest['name']} için {chest_price}🪙 gerekiyor. Mevcut altınınız: {user_coins}🪙."
        )

    # 2. Rarity kura çekimi (% olasılıklarına göre)
    rates = chest["rates"]
    rarities = list(rates.keys())
    weights = list(rates.values())
    chosen_rarity = random.choices(rarities, weights=weights, k=1)[0]

    # 3. İlgili rarity'ye uygun karakter havuzu
    # Öncelikli olarak sandığın kendi temasındaki karakterler
    theme_candidates = [
        c for c in ALL_CHARACTERS
        if c["rarity"] == chosen_rarity and c.get("chest_theme") == chest["theme"]
    ]
    if theme_candidates:
        chosen_char_dict = random.choice(theme_candidates)
    else:
        # Fallback: aynı rarity'deki herhangi bir karakter
        fallback_candidates = [c for c in ALL_CHARACTERS if c["rarity"] == chosen_rarity]
        chosen_char_dict = random.choice(fallback_candidates if fallback_candidates else ALL_CHARACTERS)

    # 4. Envanter kontrolü (Mevcut mu?)
    is_duplicate = False
    try:
        existing = db.table("unlocked_characters").select("*").eq("user_id", u_id).eq("character_id", chosen_char_dict["id"]).limit(1).execute()
        if existing.data and len(existing.data) > 0:
            is_duplicate = True
    except Exception as e:
        logger.warning(f"Duplicate check failed: {e}")

    # 5. Altın hesaplama ve envanter kaydı
    coins_refunded = 0
    if is_duplicate:
        # Kopya karakterde sandık bedelinin %35'i iade edilir
        coins_refunded = int(chest_price * 0.35)
        new_coins = user_coins - chest_price + coins_refunded
        rarity_tr = {
            "common": "Sıradan",
            "rare": "Nadir",
            "epic": "Destansı",
            "legendary": "EFSANEVİ 🌟"
        }.get(chosen_char_dict["rarity"], chosen_char_dict["rarity"])
        message = f"'{chosen_char_dict['name']}' zaten koleksiyonunuzda vardı! +{coins_refunded}🪙 iade edildi."
    else:
        new_coins = user_coins - chest_price
        # Envantere ekle
        try:
            db.table("unlocked_characters").insert({
                "id": str(uuid.uuid4()),
                "user_id": u_id,
                "character_id": chosen_char_dict["id"],
                "unlocked_at": datetime.now(timezone.utc).isoformat(),
            }).execute()
        except Exception as e:
            logger.warning(f"Character unlock save failed: {e}")

        rarity_tr = {
            "common": "Sıradan",
            "rare": "Nadir 💎",
            "epic": "DESTANSI ⚡",
            "legendary": "EFSANEVİ 🔥"
        }.get(chosen_char_dict["rarity"], chosen_char_dict["rarity"])

        if chosen_char_dict["rarity"] == "legendary":
            message = f"🎉 TEBRİKLER! İNANILMAZ ŞANS! Efsanevi {chosen_char_dict['name']} çıktı!"
        else:
            message = f"Tebrikler! {rarity_tr} seviye '{chosen_char_dict['name']}' koleksiyonunuza katıldı!"

    # Kullanıcı bakiyesini güncelle
    try:
        db.table("users").update({"coins": new_coins}).eq("id", u_id).execute()
    except Exception as e:
        logger.warning(f"User coins update failed: {e}")

    unlocked_char = Character(
        id=chosen_char_dict["id"],
        name=chosen_char_dict["name"],
        rarity=chosen_char_dict["rarity"],
        icon=chosen_char_dict["icon"],
        image_url=chosen_char_dict.get("image_url"),
        description=chosen_char_dict["description"],
        chest_theme=chosen_char_dict.get("chest_theme"),
        is_unlocked=True,
        unlocked_at=datetime.now(timezone.utc).isoformat(),
    )

    return OpenChestResponse(
        unlocked_character=unlocked_char,
        remaining_coins=new_coins,
        is_duplicate=is_duplicate,
        coins_refunded=coins_refunded,
        message=message,
    )


def set_active_avatar(character_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Seçilen karakteri kullanıcının aktif avatarı yapar."""
    # Karakteri bul
    target_char = next((c for c in ALL_CHARACTERS if c["id"] == character_id), None)
    if not target_char:
        raise HTTPException(status_code=404, detail="Karakter bulunamadı!")

    db = get_db()
    user = get_or_create_user(db, user_id)
    u_id = str(user.get("id"))

    # Karakterin kilitli olup olmadığını denetle
    is_unlocked = False
    if character_id == "char_squire":
        is_unlocked = True
    else:
        try:
            res = db.table("unlocked_characters").select("*").eq("user_id", u_id).eq("character_id", character_id).limit(1).execute()
            if res.data and len(res.data) > 0:
                is_unlocked = True
        except Exception as e:
            logger.warning(f"Check avatar unlock status failed: {e}")

    if not is_unlocked:
        raise HTTPException(status_code=400, detail="Bu karakter henüz açılmamış! Önce sandıklardan çıkartmalısınız.")

    # Profil güncelle
    try:
        db.table("users").update({
            "active_avatar": target_char["icon"],
            "active_avatar_id": target_char["id"],
        }).eq("id", u_id).execute()
    except Exception as e:
        logger.warning(f"Set active avatar failed: {e}")

    return {
        "success": True,
        "message": f"Aktif avatarınız '{target_char['name']}' ({target_char['icon']}) olarak güncellendi!",
        "active_avatar": target_char["icon"],
        "active_avatar_id": target_char["id"],
    }


