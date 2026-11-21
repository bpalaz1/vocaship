from datetime import date
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from supabase import Client
from app.core.database import get_db
from app.schemas.deck import DeckCreate, DeckResponse
from app.schemas.flashcard import FlashcardCreate
from app.api.v1.endpoints.ai import save_word_to_cache
from app.services.quota_service import _extract_token_payload

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
async def list_decks(
    request: Request,
    user_id: Optional[str] = None,
    folder_id: Optional[str] = None,
    db: Client = Depends(get_db),
):
    """Yalnızca giriş yapmış kullanıcının kendi oluşturduğu desteleri döner; deste yoksa [] döner."""
    effective_user_id = (user_id or "").strip()
    if not effective_user_id:
        token_data = _extract_token_payload(request)
        if token_data and token_data.get("sub"):
            effective_user_id = str(token_data["sub"]).strip()
    if not effective_user_id:
        return []

    query = (
        db.table("decks")
        .select("id, title, description, folder_id, user_id, created_at")
        .eq("user_id", effective_user_id)
        .order("created_at")
    )
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
async def create_deck(deck_in: DeckCreate, request: Request, db: Client = Depends(get_db)):
    data = deck_in.model_dump()
    # Supabase UUID syntax hatasını önle: boş string veya geçersiz değerleri kesinlikle None yap
    raw_fid = data.get("folder_id")
    if not raw_fid or str(raw_fid).strip() in ("", "null", "none", "undefined"):
        data["folder_id"] = None
    else:
        data["folder_id"] = str(raw_fid).strip()

    if not data.get("user_id"):
        token_data = _extract_token_payload(request)
        if token_data and token_data.get("sub"):
            data["user_id"] = str(token_data["sub"]).strip()
        else:
            raise HTTPException(status_code=401, detail="Deste oluşturmak için oturum açmalısınız.")

    res = db.table("decks").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Deste oluşturulamadı")
    deck = res.data[0]
    deck["card_count"] = 0
    return deck


@router.patch("/{deck_id}/folder", status_code=status.HTTP_200_OK)
async def update_deck_folder(deck_id: str, payload: DeckUpdateFolder, db: Client = Depends(get_db)):
    """Destenin bağlı olduğu klasörü günceller."""
    raw_fid = payload.folder_id
    if not raw_fid or str(raw_fid).strip() in ("", "null", "none", "undefined"):
        f_id = None
    else:
        f_id = str(raw_fid).strip()
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
    target_lang = (data.get("target_lang") or "").strip().lower()
    native_lang = (data.get("native_lang") or "").strip().lower()

    meanings = list(data.get("meanings") or [])
    if meanings and isinstance(meanings[0], dict):
        m0 = dict(meanings[0])
        if target_lang:
            m0["target_lang"] = target_lang
        if native_lang:
            m0["native_lang"] = native_lang
        meanings[0] = m0

    example_sentences = list(data.get("example_sentences") or [])

    db_payload = {
        "deck_id": data["deck_id"],
        "word": data["word"],
        "phonetic": data.get("phonetic") or "",
        "meanings": meanings,
        "example_sentences": example_sentences,
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

    # Kaydedilen kartı anında hafıza önbelleğine de yaz (bir sonraki aramada 0ms & 0 AI)
    if target_lang and native_lang and meanings and isinstance(meanings[0], dict):
        trans = (meanings[0].get("translation") or meanings[0].get("definition") or "").strip()
        ex_t = ""
        ex_n = ""
        if example_sentences and isinstance(example_sentences[0], dict):
            ex_t = (example_sentences[0].get("target") or example_sentences[0].get("en") or "").strip()
            ex_n = (example_sentences[0].get("native") or example_sentences[0].get("tr") or "").strip()
        if trans:
            save_word_to_cache(
                db,
                word=data["word"],
                target_lang=target_lang,
                native_lang=native_lang,
                translation=trans,
                phonetic=data.get("phonetic") or "",
                definition=(meanings[0].get("definition") or "").strip(),
                part_of_speech=(meanings[0].get("part_of_speech") or "").strip(),
                example_target=ex_t,
                example_native=ex_n,
                notes=data.get("notes") or "",
                source="database",
            )

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