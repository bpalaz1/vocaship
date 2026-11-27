from typing import List, Optional, Dict, Any
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


def _extract_user_field(current_user: Any, key: str, default: str = "") -> str:
    if isinstance(current_user, dict):
        val = current_user.get(key)
    else:
        val = getattr(current_user, key, None)
    return str(val).strip() if val is not None else default


def _ensure_public_user_exists(db: Client, current_user: Any) -> str:
    """
    public.folders(user_id) -> public.users(id) Foreign Key hatasını önlemek için
    aktif kullanıcının public.users tablosunda var olduğundan emin olur; yoksa upsert eder.
    """
    uid = _extract_user_field(current_user, "id")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçerli bir kullanıcı kimliği bulunamadı.",
        )

    try:
        existing = db.table("users").select("id").eq("id", uid).limit(1).execute()
        if existing.data and len(existing.data) > 0:
            return uid
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"public.users kontrolü başarısız: {str(exc)}",
        )

    email = _extract_user_field(current_user, "email").lower()
    full_name = _extract_user_field(current_user, "full_name")
    username = _extract_user_field(current_user, "username").lower()

    safe_email = email or f"user-{uid[:8]}@vocaship.local"
    safe_full_name = full_name or username or safe_email.split("@")[0]
    safe_username = username or safe_email.split("@")[0]

    candidates: List[Dict[str, Any]] = [
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
            db.table("users").upsert(row, on_conflict="id").execute()
            return uid
        except Exception as exc:
            last_err = exc

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"public.users kaydı oluşturulamadı: {str(last_err)}",
    )


@router.get("", response_model=List[FolderResponse])
@router.get("/", response_model=List[FolderResponse])
async def list_folders(
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Yalnızca giriş yapmış kullanıcının kendi klasörlerini Supabase public.folders tablosundan listeler."""
    effective_user_id = _extract_user_field(current_user, "id")
    if not effective_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum doğrulanamadı.",
        )

    try:
        res = (
            db.table("folders")
            .select("id, user_id, name, color, created_at")
            .eq("user_id", effective_user_id)
            .order("created_at")
            .execute()
        )
        folders = res.data or []
        for f in folders:
            count_res = (
                db.table("decks")
                .select("id", count="exact")
                .eq("folder_id", f["id"])
                .eq("user_id", effective_user_id)
                .execute()
            )
            f["deck_count"] = count_res.count or 0
        return folders
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_in: FolderCreate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Yeni bir klasör oluşturur ve yalnızca gerçek public.folders sütunlarını yazar."""
    clean_name = (folder_in.name or "").strip()
    if not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Klasör adı boş olamaz.",
        )

    uid = _ensure_public_user_exists(db, current_user)

    payload = {
        "user_id": uid,
        "name": clean_name,
        "color": folder_in.color or "#6366f1",
    }

    try:
        res = db.table("folders").insert(payload).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Supabase folders.insert boş yanıt döndürdü.",
            )
        folder = res.data[0]
        folder["deck_count"] = 0
        return folder
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/{folder_id}", response_model=FolderResponse, status_code=status.HTTP_200_OK)
@router.put("/{folder_id}", response_model=FolderResponse, status_code=status.HTTP_200_OK)
async def update_folder(
    folder_id: str,
    folder_in: FolderUpdate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Klasör adını veya rengini günceller."""
    uid = _extract_user_field(current_user, "id")
    updates: Dict[str, Any] = {}
    if folder_in.name is not None:
        trimmed = folder_in.name.strip()
        if trimmed:
            updates["name"] = trimmed
    if folder_in.color is not None:
        updates["color"] = folder_in.color

    if not updates:
        raise HTTPException(status_code=400, detail="Güncellenecek alan belirtilmedi.")

    try:
        res = db.table("folders").update(updates).eq("id", folder_id).eq("user_id", uid).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Klasör bulunamadı")
        folder = res.data[0]
        count_res = (
            db.table("decks")
            .select("id", count="exact")
            .eq("folder_id", folder_id)
            .eq("user_id", uid)
            .execute()
        )
        folder["deck_count"] = count_res.count or 0
        return folder
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


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
    deleted_count = cleanup_orphan_decks(db, user_id=_extract_user_field(current_user, "id"))
    return {"message": f"{deleted_count} klasörsüz deste temizlendi.", "deleted_count": deleted_count}


@router.delete("/{folder_id}", status_code=status.HTTP_200_OK)
async def delete_folder(
    folder_id: str,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Klasörü, klasöre bağlı tüm desteleri ve bu destelerin kartlarını kalıcı olarak siler."""
    uid = _extract_user_field(current_user, "id")
    try:
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

        return {
            "message": "Klasör ve içindeki tüm desteler/kartlar kalıcı olarak silindi.",
            "deleted_decks_count": len(folder_decks),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
