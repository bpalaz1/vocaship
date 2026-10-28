from datetime import date
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client
from app.core.database import get_db
from app.schemas.deck import DeckCreate, DeckResponse
from app.schemas.flashcard import FlashcardCreate

router = APIRouter()


class DeckUpdateFolder(BaseModel):
    folder_id: Optional[str] = None


class CardUpdatePayload(BaseModel):
    word: Optional[str] = None
    phonetic: Optional[str] = None
    meanings: Optional[List[Any]] = None
    example_sentences: Optional[List[Any]] = None
    collocations: Optional[List[str]] = None
    grammar_notes: Optional[str] = None


@router.get("", response_model=List[DeckResponse])
@router.get("/", response_model=List[DeckResponse])
async def list_decks(folder_id: Optional[str] = None, db: Client = Depends(get_db)):
    """Tüm desteleri ve bağlı oldukları folder_id bilgisini net olarak döner."""
    query = db.table("decks").select("id, title, description, folder_id, user_id, created_at").order("created_at")
    if folder_id:
        query = query.eq("folder_id", folder_id)
    decks_res = query.execute()
    decks = decks_res.data or []
    for deck in decks:
        if deck.get("folder_id"):
            deck["folder_id"] = str(deck["folder_id"])
        else:
            deck["folder_id"] = None

        count_res = db.table("flashcards").select("id", count="exact").eq("deck_id", deck["id"]).execute()
        deck["card_count"] = count_res.count or 0
    return decks


@router.post("", response_model=DeckResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=DeckResponse, status_code=status.HTTP_201_CREATED)
async def create_deck(deck_in: DeckCreate, db: Client = Depends(get_db)):
    data = deck_in.model_dump()
    if not data.get("user_id"):
        user_res = db.table("users").select("id").limit(1).execute()
        if user_res.data:
            data["user_id"] = user_res.data[0]["id"]
        else:
            raise HTTPException(status_code=400, detail="Kullanıcı bulunamadı.")

    res = db.table("decks").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Deste oluşturulamadı")
    deck = res.data[0]
    deck["card_count"] = 0
    return deck


@router.patch("/{deck_id}/folder", status_code=status.HTTP_200_OK)
async def update_deck_folder(deck_id: str, payload: DeckUpdateFolder, db: Client = Depends(get_db)):
    """Destenin bağlı olduğu klasörü günceller."""
    f_id = str(payload.folder_id) if payload.folder_id else None
    res = db.table("decks").update({"folder_id": f_id}).eq("id", deck_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deste bulunamadı.")
    return res.data[0]


@router.get("/{deck_id}/cards")
async def get_all_cards_in_deck(deck_id: str, db: Client = Depends(get_db)):
    res = db.table("flashcards").select("*").eq("deck_id", deck_id).order("created_at").execute()
    return res.data or []


@router.post("/cards", status_code=status.HTTP_201_CREATED)
async def add_card_to_deck(card_in: FlashcardCreate, db: Client = Depends(get_db)):
    data = card_in.model_dump()
    db_payload = {
        "deck_id": data["deck_id"],
        "word": data["word"],
        "phonetic": data.get("phonetic") or "",
        "meanings": data.get("meanings") or [],
        "example_sentences": data.get("example_sentences") or [],
        "collocations": data.get("collocations") or [],
        "grammar_notes": data.get("notes") or "",
        "ease_factor": 2.5,
        "interval_days": 0,
        "repetitions": 0,
        "next_review_date": str(date.today()),
    }
    res = db.table("flashcards").insert(db_payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Kart kaydedilemedi")
    return res.data[0]


@router.patch("/cards/{card_id}", status_code=status.HTTP_200_OK)
async def update_deck_card(card_id: str, payload: CardUpdatePayload, db: Client = Depends(get_db)):
    """Deste içindeyken mevcut bir kartın anlamını, kelimesini veya örnek cümlesini günceller."""
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="Güncellenecek alan belirtilmedi.")
    
    res = db.table("flashcards").update(data).eq("id", card_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Kart bulunamadı veya güncellenemedi.")
    return res.data[0]


@router.delete("/cards/{card_id}", status_code=status.HTTP_200_OK)
async def remove_card_from_deck(card_id: str, db: Client = Depends(get_db)):
    res = db.table("flashcards").delete().eq("id", card_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Kart bulunamadı veya zaten silinmiş.")
    return {"message": "Kart desteden başarıyla silindi."}


@router.delete("/{deck_id}", status_code=status.HTTP_200_OK)
async def delete_deck(deck_id: str, db: Client = Depends(get_db)):
    db.table("flashcards").delete().eq("deck_id", deck_id).execute()
    res = db.table("decks").delete().eq("id", deck_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deste bulunamadı.")
    return {"message": "Deste ve ilişkili tüm kartlar başarıyla silindi."}