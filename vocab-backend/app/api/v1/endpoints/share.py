import random
import string
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.core.database import get_db

logger = logging.getLogger("vocaship.share")

router = APIRouter(prefix="/share", tags=["Share & Classroom Code"])

# In-memory storage for immediate, high-speed access
SHARED_STORE: Dict[str, Dict[str, Any]] = {}


class CreateShareRequest(BaseModel):
    item_type: str = "deck"  # "deck" | "story" | "both"
    item_id: Optional[str] = None
    title: Optional[str] = ""
    deck: Optional[Dict[str, Any]] = None
    cards: Optional[List[Dict[str, Any]]] = None
    words: Optional[List[Dict[str, Any]]] = None
    story: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None


def generate_pin() -> str:
    """Generates a unique 6-character/digit code in 'QW-XXXX' format (e.g. 'QW-8492')."""
    digits = "".join(random.choices(string.digits, k=4))
    return f"QW-{digits}"


def normalize_code(code: str) -> str:
    """Cleans and standardizes input code to 'QW-XXXX' format."""
    cleaned = code.strip().upper()
    # Strip URL fragments or query parameters if user pasted a link
    if "JOIN=" in cleaned:
        cleaned = cleaned.split("JOIN=")[-1]
    if "?" in cleaned:
        cleaned = cleaned.split("?")[-1]
    if "=" in cleaned:
        cleaned = cleaned.split("=")[-1]
    if "&" in cleaned:
        cleaned = cleaned.split("&")[0]
    cleaned = cleaned.strip()

    # If user typed just 4 digits e.g. "8492" -> "QW-8492"
    if cleaned.isdigit() and len(cleaned) == 4:
        return f"QW-{cleaned}"
    # If user typed "QW8492" without hyphen -> "QW-8492"
    if cleaned.startswith("QW") and len(cleaned) == 6 and cleaned[2:].isdigit():
        return f"QW-{cleaned[2:]}"

    return cleaned


def _save_to_db(pin: str, item_type: str, item_id: Optional[str], title: str, full_payload: Dict[str, Any]):
    """Attempts to persist share record in local/Supabase database."""
    try:
        db = get_db()
        db.table("shared_items").insert({
            "pin": pin,
            "item_type": item_type,
            "item_id": item_id or "",
            "title": title or "",
            "payload": full_payload,
            "created_at": datetime.now(timezone.utc).isoformat()
        }).execute()
    except Exception as e:
        logger.warning(f"Shared item DB persistence skipped: {e}")


def _load_from_db(pin: str) -> Optional[Dict[str, Any]]:
    """Tries to retrieve shared item from database."""
    try:
        db = get_db()
        res = db.table("shared_items").select("*").eq("pin", pin).execute()
        if res.data:
            row = res.data[0]
            payload = row.get("payload")
            if isinstance(payload, dict):
                return payload
    except Exception as e:
        logger.warning(f"Shared item DB lookup failed: {e}")
    return None


@router.post("/create")
@router.post("")
def create_share(payload: CreateShareRequest):
    """
    Creates a unique 6-digit classroom/share code (e.g. 'QW-8492') for a deck or story.
    Returns the PIN, shareable direct link, and full data.
    """
    db = get_db()

    # 1. Generate unique PIN
    pin = generate_pin()
    attempts = 0
    while pin in SHARED_STORE and attempts < 100:
        pin = generate_pin()
        attempts += 1

    deck_data = payload.deck or {}
    cards_data = payload.cards or payload.words or []
    story_data = payload.story or {}
    extra_data = payload.data or {}

    # If caller gave embedded story/deck inside extra_data
    if not story_data and "story" in extra_data:
        story_data = extra_data.get("story") or {}
    if not deck_data and "deck" in extra_data:
        deck_data = extra_data.get("deck") or {}
    if not cards_data and "cards" in extra_data:
        cards_data = extra_data.get("cards") or []

    # If item_type is deck (or both) and item_id provided, fetch live deck & cards if empty
    if payload.item_id and payload.item_type in ("deck", "both"):
        try:
            if not deck_data:
                d_res = db.table("decks").select("*").eq("id", payload.item_id).execute()
                if d_res.data:
                    deck_data = d_res.data[0]
            if not cards_data:
                c_res = db.table("flashcards").select("*").eq("deck_id", payload.item_id).order("created_at").execute()
                if c_res.data:
                    cards_data = c_res.data
        except Exception as e:
            logger.warning(f"Deck/cards DB lookup during share creation: {e}")

    # Set title fallback
    title = payload.title or deck_data.get("title") or story_data.get("title") or "Paylaşılan İçerik"

    share_obj = {
        "pin": pin,
        "code": pin,
        "item_type": payload.item_type,
        "item_id": payload.item_id or deck_data.get("id") or story_data.get("id") or "",
        "title": title,
        "deck": deck_data,
        "cards": cards_data,
        "words": cards_data,
        "story": story_data,
        "data": extra_data,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "share_url": f"http://localhost:3000/?join={pin}"
    }

    # Store in memory
    SHARED_STORE[pin] = share_obj

    # Persist to local/supabase DB
    _save_to_db(pin, payload.item_type, payload.item_id, title, share_obj)

    return share_obj


@router.get("/{code}")
def get_share_content(code: str):
    """
    Retrieves full deck, cards/words, and linked story content for a given 6-character code.
    """
    clean_code = normalize_code(code)

    # 1. Check in-memory store
    item = SHARED_STORE.get(clean_code)

    # 2. Check DB if not found in memory
    if not item:
        item = _load_from_db(clean_code)
        if item:
            SHARED_STORE[clean_code] = item

    if not item:
        raise HTTPException(
            status_code=404,
            detail=f"Geçersiz veya süresi dolmuş katılım kodu: '{code}' (Beklenen format: QW-XXXX)"
        )

    # Ensure cards are up-to-date if item has a deck_id
    if item.get("item_type") in ("deck", "both") and item.get("item_id"):
        try:
            if not item.get("cards"):
                db = get_db()
                c_res = db.table("flashcards").select("*").eq("deck_id", item["item_id"]).order("created_at").execute()
                if c_res.data:
                    item["cards"] = c_res.data
                    item["words"] = c_res.data
        except Exception as e:
            logger.warning(f"Live card reload failed: {e}")

    # Mirror words and cards keys for convenience
    if not item.get("words") and item.get("cards"):
        item["words"] = item["cards"]
    elif not item.get("cards") and item.get("words"):
        item["cards"] = item["words"]

    return item