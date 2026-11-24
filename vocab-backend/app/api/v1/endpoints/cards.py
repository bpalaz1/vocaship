from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request, status
from app.schemas.study import ReviewResultRequest, ReviewResultResponse, WeakSpotsResponse
from app.services.study_service import get_weak_spot_cards, process_card_review_result
from app.services.quota_service import _extract_token_payload

router = APIRouter(tags=["Cards & Weak-Spot Hunter"])


@router.get("/weak-spots", response_model=WeakSpotsResponse)
async def list_weak_spots(
    request: Request,
    deck_id: Optional[str] = Query(None, description="Opsiyonel deste filtresi"),
    user_id: Optional[str] = Query(None, description="Kullanıcı UUID'si"),
    limit: int = Query(50, ge=1, le=100, description="Getirilecek maksimum zayıf kart sayısı")
):
    """
    Zayıf Nokta Avcısı (Weak-Spot Hunter):
    Sadece needs_review == true olan kartları listeler.
    En çok hata yapılan kelimeler en üstte yer alır.
    """
    effective_user_id = (user_id or "").strip() or None
    if not effective_user_id:
        token_data = _extract_token_payload(request)
        if token_data and token_data.get("sub"):
            effective_user_id = str(token_data["sub"]).strip()
    try:
        cards = get_weak_spot_cards(deck_id=deck_id, limit=limit, user_id=effective_user_id)
        return {"total": len(cards), "cards": cards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zayıf noktalar getirilemedi: {str(e)}")


@router.post("/{card_id}/review-result", response_model=ReviewResultResponse)
async def submit_review_result(card_id: str, payload: ReviewResultRequest):
    """
    Kullanıcının ikili cevap sonucunu (Biliyorum / Bilemedim) işler:
    - is_correct=False: mistake_count += 1, consecutive_correct = 0, needs_review = True
    - is_correct=True: consecutive_correct += 1, consecutive_correct >= 2 ise needs_review = False
    Dinamik SM-2 aralığını günceller.
    """
    try:
        result = process_card_review_result(
            card_id=card_id,
            is_correct=payload.is_correct,
            rating=payload.rating,
            force_clear=payload.force_clear,
            meaning=payload.meaning,
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"İnceleme kaydedilemedi: {str(e)}")
