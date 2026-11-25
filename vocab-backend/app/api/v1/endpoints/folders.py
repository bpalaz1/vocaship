from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client
from app.core.database import get_db
from app.schemas.folder import FolderCreate, FolderResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


class FolderUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


@router.get("", response_model=List[FolderResponse])
@router.get("/", response_model=List[FolderResponse])
async def list_folders(
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Yalnızca giriş yapmış kullanıcının kendi klasörlerini listeler; yoksa [] döner."""
    effective_user_id = str(current_user["id"]).strip()

    res = db.table("folders").select("*").eq("user_id", effective_user_id).order("created_at").execute()
    folders = res.data or []
    for f in folders:
        raw_parent = f.get("parent_id")
        f["parent_id"] = str(raw_parent) if raw_parent else None
        count_res = (
            db.table("decks")
            .select("id", count="exact")
            .eq("folder_id", f["id"])
            .eq("user_id", effective_user_id)
            .execute()
        )
        f["deck_count"] = count_res.count or 0
    return folders


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_in: FolderCreate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Yeni bir klasör (örn: Kuzey, Animals) oluşturur."""
    data = folder_in.model_dump()
    raw_parent = str(data.get("parent_id") or "").strip()
    if not raw_parent or raw_parent.lower() == "root directory":
        data["parent_id"] = None
    else:
        data["parent_id"] = raw_parent
    if data.get("parent_id") is None:
        data.pop("parent_id", None)

    data["user_id"] = str(current_user["id"]).strip()

    res = db.table("folders").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Klasör oluşturulamadı")
    folder = res.data[0]
    folder["deck_count"] = 0
    return folder


@router.patch("/{folder_id}", response_model=FolderResponse, status_code=status.HTTP_200_OK)
@router.put("/{folder_id}", response_model=FolderResponse, status_code=status.HTTP_200_OK)
async def update_folder(
    folder_id: str,
    folder_in: FolderUpdate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Klasör adını veya rengini günceller."""
    uid = str(current_user["id"]).strip()
    updates = {k: v for k, v in folder_in.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Güncellenecek alan belirtilmedi.")
    res = db.table("folders").update(updates).eq("id", folder_id).eq("user_id", uid).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Klasör bulunamadı")
    folder = res.data[0]
    count_res = db.table("decks").select("id", count="exact").eq("folder_id", folder_id).eq("user_id", uid).execute()
    folder["deck_count"] = count_res.count or 0
    return folder


def cleanup_orphan_decks(db: Client, user_id: Optional[str] = None) -> int:
    """folder_id NULL olan sahipsiz desteleri ve ilişkili kartlarını kalıcı olarak siler."""
    try:
        query = db.table("decks").select("id, folder_id")
        if user_id:
            query = query.eq("user_id", user_id)
        all_decks = query.execute().data or []
        orphan_ids = [d["id"] for d in all_decks if not d.get("folder_id")]
        for oid in orphan_ids:
            db.table("flashcards").delete().eq("deck_id", oid).execute()
            db.table("decks").delete().eq("id", oid).execute()
        return len(orphan_ids)
    except Exception:
        return 0


@router.delete("/orphans/cleanup", status_code=status.HTTP_200_OK)
async def delete_orphan_decks(
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Mevcut tüm klasörsüz (folder_id IS NULL) desteleri ve kartlarını temizler."""
    deleted_count = cleanup_orphan_decks(db, user_id=str(current_user["id"]).strip())
    return {"message": f"{deleted_count} klasörsüz deste temizlendi.", "deleted_count": deleted_count}


@router.delete("/{folder_id}", status_code=status.HTTP_200_OK)
async def delete_folder(
    folder_id: str,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Klasörü, klasöre bağlı tüm desteleri ve bu destelerin kartlarını kalıcı olarak siler."""
    uid = str(current_user["id"]).strip()
    # 1. Klasöre bağlı desteleri bul
    decks_res = db.table("decks").select("id").eq("folder_id", folder_id).eq("user_id", uid).execute()
    folder_decks = decks_res.data or []

    # 2. Her desteye bağlı tüm kartları (flashcards) sil
    for deck in folder_decks:
        deck_id = deck.get("id")
        if deck_id:
            db.table("flashcards").delete().eq("deck_id", deck_id).execute()

    # 3. Klasöre bağlı tüm desteleri sil
    if folder_decks:
        db.table("decks").delete().eq("folder_id", folder_id).eq("user_id", uid).execute()

    # 4. Klasörün kendisini sil
    res = db.table("folders").delete().eq("id", folder_id).eq("user_id", uid).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Klasör bulunamadı")

    # 5. Varsa sahipsiz (folder_id IS NULL) kalmış desteleri de temizle
    cleanup_orphan_decks(db, user_id=uid)
    return {
        "message": "Klasör ve içindeki tüm desteler/kartlar kalıcı olarak silindi.",
        "deleted_decks_count": len(folder_decks),
    }