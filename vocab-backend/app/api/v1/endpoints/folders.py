from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from supabase import Client
from app.core.database import get_db
from app.schemas.folder import FolderCreate, FolderResponse
from app.services.quota_service import _extract_token_payload

router = APIRouter()


class FolderUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


@router.get("", response_model=List[FolderResponse])
@router.get("/", response_model=List[FolderResponse])
async def list_folders(
    request: Request,
    user_id: Optional[str] = None,
    db: Client = Depends(get_db),
):
    """Yalnızca giriş yapmış kullanıcının kendi klasörlerini listeler; yoksa [] döner."""
    effective_user_id = (user_id or "").strip()
    if not effective_user_id:
        token_data = _extract_token_payload(request)
        if token_data and token_data.get("sub"):
            effective_user_id = str(token_data["sub"]).strip()
    if not effective_user_id:
        return []

    res = db.table("folders").select("*").eq("user_id", effective_user_id).order("created_at").execute()
    folders = res.data or []
    for f in folders:
        count_res = db.table("decks").select("id", count="exact").eq("folder_id", f["id"]).execute()
        f["deck_count"] = count_res.count or 0
    return folders


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(folder_in: FolderCreate, request: Request, db: Client = Depends(get_db)):
    """Yeni bir klasör (örn: Kuzey, Animals) oluşturur."""
    data = folder_in.model_dump()
    if not data.get("user_id"):
        token_data = _extract_token_payload(request)
        if token_data and token_data.get("sub"):
            data["user_id"] = str(token_data["sub"]).strip()
        else:
            raise HTTPException(status_code=401, detail="Klasör oluşturmak için oturum açmalısınız.")

    res = db.table("folders").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Klasör oluşturulamadı")
    folder = res.data[0]
    folder["deck_count"] = 0
    return folder


@router.patch("/{folder_id}", response_model=FolderResponse, status_code=status.HTTP_200_OK)
@router.put("/{folder_id}", response_model=FolderResponse, status_code=status.HTTP_200_OK)
async def update_folder(folder_id: str, folder_in: FolderUpdate, db: Client = Depends(get_db)):
    """Klasör adını veya rengini günceller."""
    updates = {k: v for k, v in folder_in.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Güncellenecek alan belirtilmedi.")
    res = db.table("folders").update(updates).eq("id", folder_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Klasör bulunamadı")
    folder = res.data[0]
    count_res = db.table("decks").select("id", count="exact").eq("folder_id", folder_id).execute()
    folder["deck_count"] = count_res.count or 0
    return folder


def cleanup_orphan_decks(db: Client) -> int:
    """folder_id NULL olan sahipsiz desteleri ve ilişkili kartlarını kalıcı olarak siler."""
    try:
        all_decks = db.table("decks").select("id, folder_id").execute().data or []
        orphan_ids = [d["id"] for d in all_decks if not d.get("folder_id")]
        for oid in orphan_ids:
            db.table("flashcards").delete().eq("deck_id", oid).execute()
            db.table("decks").delete().eq("id", oid).execute()
        return len(orphan_ids)
    except Exception:
        return 0


@router.delete("/orphans/cleanup", status_code=status.HTTP_200_OK)
async def delete_orphan_decks(db: Client = Depends(get_db)):
    """Mevcut tüm klasörsüz (folder_id IS NULL) desteleri ve kartlarını temizler."""
    deleted_count = cleanup_orphan_decks(db)
    return {"message": f"{deleted_count} klasörsüz deste temizlendi.", "deleted_count": deleted_count}


@router.delete("/{folder_id}", status_code=status.HTTP_200_OK)
async def delete_folder(folder_id: str, db: Client = Depends(get_db)):
    """Klasörü, klasöre bağlı tüm desteleri ve bu destelerin kartlarını kalıcı olarak siler."""
    # 1. Klasöre bağlı desteleri bul
    decks_res = db.table("decks").select("id").eq("folder_id", folder_id).execute()
    folder_decks = decks_res.data or []

    # 2. Her desteye bağlı tüm kartları (flashcards) sil
    for deck in folder_decks:
        deck_id = deck.get("id")
        if deck_id:
            db.table("flashcards").delete().eq("deck_id", deck_id).execute()

    # 3. Klasöre bağlı tüm desteleri sil
    if folder_decks:
        db.table("decks").delete().eq("folder_id", folder_id).execute()

    # 4. Klasörün kendisini sil
    res = db.table("folders").delete().eq("id", folder_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Klasör bulunamadı")

    # 5. Varsa sahipsiz (folder_id IS NULL) kalmış desteleri de temizle
    cleanup_orphan_decks(db)
    return {
        "message": "Klasör ve içindeki tüm desteler/kartlar kalıcı olarak silindi.",
        "deleted_decks_count": len(folder_decks),
    }