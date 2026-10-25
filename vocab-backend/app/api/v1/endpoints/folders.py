from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.core.database import get_db
from app.schemas.folder import FolderCreate, FolderResponse

router = APIRouter()


@router.get("", response_model=List[FolderResponse])
@router.get("/", response_model=List[FolderResponse])
def list_folders(db: Client = Depends(get_db)):
    """Kullanıcının klasörlerini ve içerdikleri deste sayısını listeler."""
    res = db.table("folders").select("*").order("created_at").execute()
    folders = res.data or []
    for f in folders:
        count_res = db.table("decks").select("id", count="exact").eq("folder_id", f["id"]).execute()
        f["deck_count"] = count_res.count or 0
    return folders


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
def create_folder(folder_in: FolderCreate, db: Client = Depends(get_db)):
    """Yeni bir klasör (örn: Kuzey, Animals) oluşturur."""
    data = folder_in.model_dump()
    if not data.get("user_id"):
        user_res = db.table("users").select("id").limit(1).execute()
        if user_res.data:
            data["user_id"] = user_res.data[0]["id"]

    res = db.table("folders").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Klasör oluşturulamadı")
    folder = res.data[0]
    folder["deck_count"] = 0
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_200_OK)
def delete_folder(folder_id: str, db: Client = Depends(get_db)):
    """Klasörü siler; içindeki desteler silinmez, sadece klasörsüz kalır."""
    db.table("decks").update({"folder_id": None}).eq("folder_id", folder_id).execute()
    res = db.table("folders").delete().eq("id", folder_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Klasör bulunamadı")
    return {"message": "Klasör silindi, içindeki desteler korundu."}