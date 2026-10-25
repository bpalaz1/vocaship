from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.study import (
    ReviewCardRequest,
    ReviewCardResponse,
    ReviewResultRequest,
    ReviewResultResponse,
    WeakSpotsResponse,
)
from app.services.study_service import (
    process_card_review,
    process_card_review_result,
    get_due_flashcards,
    get_weak_spot_cards,
)

router = APIRouter(tags=["Study & SM-2"])


@router.post("/review", response_model=ReviewCardResponse)
def review_card(payload: ReviewCardRequest):
    """
    İkili seçim (Biliyorum/Bilemedim) veya puanla SM-2 ve Zayıf Nokta Avcısı işletir.
    """
    try:
        result = process_card_review(
            card_id=payload.card_id,
            rating=payload.rating,
            is_correct=payload.is_correct,
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"İşlem hatası: {str(e)}")


@router.get("/due-cards")
def list_due_cards(
    deck_id: Optional[str] = Query(None, description="Opsiyonel deste UUID'si"),
    limit: int = Query(20, ge=1, le=100, description="Getirilecek maksimum kart sayısı")
):
    """
    Bugün tekrar edilmesi gereken kelime kartlarını listeler.
    Zayıf kelimeler (needs_review=True) havuzun en başına serpiştirilir.
    """
    try:
        cards = get_due_flashcards(deck_id=deck_id, limit=limit)
        return {"total": len(cards), "cards": cards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kartlar getirilemedi: {str(e)}")


@router.get("/weak-spots", response_model=WeakSpotsResponse)
def list_study_weak_spots(
    deck_id: Optional[str] = Query(None, description="Opsiyonel deste filtresi"),
    limit: int = Query(50, ge=1, le=100, description="Getirilecek maksimum zayıf kart sayısı")
):
    """Zayıf Nokta Avcısı: Sadece needs_review == true olan kartları listeler."""
    try:
        cards = get_weak_spot_cards(deck_id=deck_id, limit=limit)
        return {"total": len(cards), "cards": cards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zayıf noktalar getirilemedi: {str(e)}")