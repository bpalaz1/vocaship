import re
import uuid
from datetime import date
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from supabase import Client
from app.core.database import get_db
from app.schemas.deck import DeckCreate, DeckResponse
from app.schemas.flashcard import FlashcardCreate
from app.api.v1.endpoints.ai import save_word_to_cache
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


class DeckUpdateFolder(BaseModel):
    folder_id: Optional[str] = None


class CloneSharedDeckPayload(BaseModel):
    folder_id: Optional[str] = None


def _deck_share_code(deck_id: str) -> str:
    clean = str(deck_id or "").strip().replace("-", "")
    return f"VS-{clean[:6].upper()}"


def _extract_user_field(current_user: Any, key: str, default: str = "") -> str:
    if isinstance(current_user, dict):
        val = current_user.get(key)
    else:
        val = getattr(current_user, key, None)
    return str(val).strip() if val is not None else default


def _ensure_public_user_exists(db: Client, current_user: Any) -> str:
    """
    decks(user_id) -> public.users(id) Foreign Key hatasını önlemek için
    aktif kullanıcının public.users tablosunda var olup olmadığını .select('id') ile kontrol eder;
    kayıt yoksa .insert({...}) ile ekler.
    """
    uid = _extract_user_field(current_user, "id")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçerli bir kullanıcı kimliği bulunamadı.",
        )

    existing = db.table("users").select("id").eq("id", uid).execute()
    if existing.data and len(existing.data) > 0:
        return uid

    email = _extract_user_field(current_user, "email").lower()
    full_name = _extract_user_field(current_user, "full_name")
    username = _extract_user_field(current_user, "username").lower()

    safe_email = email or f"user-{uid[:8]}@vocaship.local"
    safe_full_name = full_name or username or safe_email.split("@")[0]
    safe_username = username or safe_email.split("@")[0]

    candidates = [
        {
            "id": uid,
            "email": safe_email,
            "full_name": safe_full_name,
            "username": safe_username,
        },
        {
            "id": uid,
            "email": safe_email,
            "full_name": safe_full_name,
        },
        {
            "id": uid,
            "email": safe_email,
        },
    ]

    last_err: Optional[Exception] = None
    for row in candidates:
        try:
            db.table("users").insert(row).execute()
            return uid
        except Exception as exc:
            try:
                recheck = db.table("users").select("id").eq("id", uid).execute()
                if recheck.data and len(recheck.data) > 0:
                    return uid
            except Exception:
                pass
            last_err = exc

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Deste kopyalanamadı: kullanıcı kaydı oluşturulamadı ({str(last_err)})",
    )


def _find_deck_by_code_or_id(db: Client, code_or_id: str) -> Optional[dict]:
    raw = (code_or_id or "").strip()
    if not raw:
        return None

    # 1. Tam UUID kontrolü
    try:
        parsed_uuid = str(uuid.UUID(raw))
        res = (
            db.table("decks")
            .select("id, title, description, folder_id, user_id, created_at")
            .eq("id", parsed_uuid)
            .limit(1)
            .execute()
        )
        if res.data:
            return res.data[0]
    except ValueError:
        pass

    # 2. VS-XXXXXX veya 6+ karakterlik önek eşleştirmesi (sıfır şema değişikliği, UUID aralık sorgusu)
    cleaned = raw
    if cleaned.upper().startswith("VS-"):
        cleaned = cleaned[3:]
    hex_prefix = cleaned.strip().lower().replace("-", "")

    if re.fullmatch(r"[0-9a-f]{6,32}", hex_prefix):
        low_hex = hex_prefix.ljust(32, "0")
        high_hex = hex_prefix.ljust(32, "f")
        low_uuid = f"{low_hex[:8]}-{low_hex[8:12]}-{low_hex[12:16]}-{low_hex[16:20]}-{low_hex[20:32]}"
        high_uuid = f"{high_hex[:8]}-{high_hex[8:12]}-{high_hex[12:16]}-{high_hex[16:20]}-{high_hex[20:32]}"
        try:
            range_res = (
                db.table("decks")
                .select("id, title, description, folder_id, user_id, created_at")
                .gte("id", low_uuid)
                .lte("id", high_uuid)
                .limit(1)
                .execute()
            )
            if range_res.data:
                return range_res.data[0]
        except Exception:
            pass

    # 3. Yedek önek taraması (standart dışı ID'ler için)
    if len(hex_prefix) >= 6:
        try:
            scan_res = (
                db.table("decks")
                .select("id, title, description, folder_id, user_id, created_at")
                .limit(1000)
                .execute()
            )
            for row in scan_res.data or []:
                rid = str(row.get("id") or "").lower().replace("-", "")
                if rid.startswith(hex_prefix):
                    return row
        except Exception:
            pass

    return None


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
    folder_id: Optional[str] = None,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Yalnızca giriş yapmış kullanıcının kendi oluşturduğu desteleri döner; deste yoksa [] döner."""
    effective_user_id = str(current_user["id"]).strip()

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
        raw_folder = deck.get("folder_id")
        deck["folder_id"] = str(raw_folder) if raw_folder else None

        count_res = db.table("flashcards").select("id", count="exact").eq("deck_id", deck["id"]).execute()
        deck["card_count"] = count_res.count or 0
    return decks


@router.post("", response_model=DeckResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=DeckResponse, status_code=status.HTTP_201_CREATED)
async def create_deck(
    deck_in: DeckCreate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    data = deck_in.model_dump()
    # Supabase UUID syntax hatasını önle: boş string veya geçersiz değerleri kesinlikle None yap
    raw_fid = data.get("folder_id")
    if not raw_fid or str(raw_fid).strip() in ("", "null", "none", "undefined"):
        data["folder_id"] = None
    else:
        data["folder_id"] = str(raw_fid).strip()

    data["user_id"] = str(current_user["id"]).strip()

    res = db.table("decks").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Deste oluşturulamadı")
    deck = res.data[0]
    raw_folder = deck.get("folder_id")
    deck["folder_id"] = str(raw_folder) if raw_folder else None
    deck["card_count"] = 0
    return deck


@router.get("/shared/{code_or_id}", status_code=status.HTTP_200_OK)
async def preview_shared_deck(code_or_id: str, db: Client = Depends(get_db)):
    """Herkese açık kalıcı deste paylaşım önizlemesi (UUID veya VS-XXXXXX)."""
    deck = _find_deck_by_code_or_id(db, code_or_id)
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paylaşılan deste bulunamadı. Kodu kontrol edip tekrar deneyin.",
        )

    cards_res = (
        db.table("flashcards")
        .select("id, word, phonetic, meanings, example_sentences, collocations, grammar_notes, created_at")
        .eq("deck_id", deck["id"])
        .order("created_at")
        .execute()
    )
    cards = cards_res.data or []
    return {
        "id": str(deck["id"]),
        "share_code": _deck_share_code(str(deck["id"])),
        "title": deck.get("title") or "İsimsiz Deste",
        "description": deck.get("description") or "",
        "card_count": len(cards),
        "preview_words": cards[:8],
    }


@router.post("/shared/{code_or_id}/clone", status_code=status.HTTP_201_CREATED)
async def clone_shared_deck(
    code_or_id: str,
    payload: Optional[CloneSharedDeckPayload] = None,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Paylaşılan desteyi orijinaline dokunmadan kullanıcının kendi hesabına bağımsız kopya olarak ekler."""
    try:
        uid = _ensure_public_user_exists(db, current_user)

        source_deck = _find_deck_by_code_or_id(db, code_or_id)
        if not source_deck:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kopyalanacak paylaşılan deste bulunamadı.",
            )

        raw_fid = payload.folder_id if payload else None
        if not raw_fid or str(raw_fid).strip().lower() in ("", "null", "none", "undefined"):
            target_folder_id = None
        else:
            candidate_fid = str(raw_fid).strip()
            # Hedef klasör bu kullanıcıda gerçekten yoksa FK hatasını önlemek için None yap
            f_check = (
                db.table("folders")
                .select("id")
                .eq("id", candidate_fid)
                .eq("user_id", uid)
                .execute()
            )
            target_folder_id = candidate_fid if (f_check.data and len(f_check.data) > 0) else None

        source_cards_res = (
            db.table("flashcards")
            .select("word, phonetic, meanings, grammar_notes, example_sentences, collocations, created_at")
            .eq("deck_id", source_deck["id"])
            .order("created_at")
            .execute()
        )
        source_cards = source_cards_res.data or []

        new_deck_data = {
            "user_id": uid,
            "title": str(source_deck.get("title") or "Paylaşılan Deste").strip(),
            "description": str(source_deck.get("description") or ""),
            "folder_id": target_folder_id,
        }
        created_res = db.table("decks").insert(new_deck_data).execute()
        if not created_res.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deste kopyalanamadı: yeni deste kaydı oluşturulamadı.",
            )

        new_deck = created_res.data[0]
        new_deck_id = str(new_deck["id"])

        today_str = str(date.today())
        new_cards = [
            {
                "deck_id": new_deck_id,
                "word": str(c.get("word") or ""),
                "phonetic": str(c.get("phonetic") or ""),
                "meanings": c.get("meanings") if isinstance(c.get("meanings"), list) else [],
                "grammar_notes": str(c.get("grammar_notes") or ""),
                "example_sentences": (
                    c.get("example_sentences")
                    if isinstance(c.get("example_sentences"), list)
                    else []
                ),
                "collocations": (
                    c.get("collocations")
                    if isinstance(c.get("collocations"), list)
                    else []
                ),
                "ease_factor": 2.5,
                "interval_days": 0,
                "repetitions": 0,
                "next_review_date": today_str,
            }
            for c in source_cards
        ]

        if new_cards:
            chunk_size = 100
            for i in range(0, len(new_cards), chunk_size):
                db.table("flashcards").insert(new_cards[i : i + chunk_size]).execute()

        raw_folder = new_deck.get("folder_id")
        new_deck["folder_id"] = str(raw_folder) if raw_folder else None
        new_deck["card_count"] = len(new_cards)
        new_deck["share_code"] = _deck_share_code(new_deck_id)
        return new_deck
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Deste kopyalanamadı: {str(e)}",
        )


@router.patch("/{deck_id}/folder", status_code=status.HTTP_200_OK)
async def update_deck_folder(
    deck_id: str,
    payload: DeckUpdateFolder,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Destenin bağlı olduğu klasörü günceller."""
    raw_fid = payload.folder_id
    if not raw_fid or str(raw_fid).strip() in ("", "null", "none", "undefined"):
        f_id = None
    else:
        f_id = str(raw_fid).strip()
    res = (
        db.table("decks")
        .update({"folder_id": f_id})
        .eq("id", deck_id)
        .eq("user_id", str(current_user["id"]).strip())
        .execute()
    )
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
async def delete_deck(
    deck_id: str,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    uid = str(current_user["id"]).strip()
    existing = db.table("decks").select("id").eq("id", deck_id).eq("user_id", uid).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Deste bulunamadı.")
    db.table("flashcards").delete().eq("deck_id", deck_id).execute()
    res = db.table("decks").delete().eq("id", deck_id).eq("user_id", uid).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Deste bulunamadı.")
    return {"message": "Deste ve ilişkili tüm kartlar başarıyla silindi."}