from typing import List, Dict, Any, Optional
from app.core.database import get_db


def create_deck(title: str, description: str = "", user_id: str = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11") -> Dict[str, Any]:
    db = get_db()
    res = db.table("decks").insert({
        "title": title,
        "description": description,
        "user_id": user_id
    }).execute()
    
    if not res.data:
        raise ValueError("Deste olusturulamadi.")
    return res.data[0]


def get_user_decks(user_id: str = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11") -> List[Dict[str, Any]]:
    db = get_db()
    decks_res = db.table("decks").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    decks = decks_res.data or []
    
    for deck in decks:
        count_res = db.table("flashcards").select("id", count="exact").eq("deck_id", deck["id"]).execute()
        deck["card_count"] = count_res.count or 0
        
    return decks


def get_deck_by_id(deck_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    res = db.table("decks").select("*").eq("id", deck_id).execute()
    if not res.data:
        return None
    deck = res.data[0]
    count_res = db.table("flashcards").select("id", count="exact").eq("deck_id", deck_id).execute()
    deck["card_count"] = count_res.count or 0
    return deck


def delete_deck(deck_id: str) -> bool:
    db = get_db()
    res = db.table("decks").delete().eq("id", deck_id).execute()
    return bool(res.data)


def update_flashcard(card_id: str, fields: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    clean_fields = {k: v for k, v in fields.items() if v is not None}
    if not clean_fields:
        raise ValueError("Guncellenecek alan belirtilmedi.")
        
    res = db.table("flashcards").update(clean_fields).eq("id", card_id).execute()
    if not res.data:
        raise ValueError("Kart bulunamadi veya guncellenemedi.")
    return res.data[0]


def delete_flashcard(card_id: str) -> bool:
    db = get_db()
    res = db.table("flashcards").delete().eq("id", card_id).execute()
    return bool(res.data)