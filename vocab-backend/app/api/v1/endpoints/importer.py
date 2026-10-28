from fastapi import APIRouter, HTTPException, status
from app.schemas.importer import QuizletImportRequest, ImportPreviewResponse, BulkSaveRequest
from app.services.importer_service import parse_quizlet_text, bulk_insert_cards

router = APIRouter(prefix="/import", tags=["Importer"])


@router.post("/quizlet/preview", response_model=ImportPreviewResponse)
async def preview_quizlet_import(payload: QuizletImportRequest):
    """Quizlet metnini ayristirip onizleme listesi dondurur."""
    cards = parse_quizlet_text(
        raw_text=payload.raw_text,
        term_sep=payload.term_separator,
        row_sep=payload.row_separator
    )
    return ImportPreviewResponse(total_detected=len(cards), cards=cards)


@router.post("/quizlet/save", status_code=status.HTTP_201_CREATED)
async def save_imported_cards(payload: BulkSaveRequest):
    """Ayristirilan kartlari Supabase destesine toplu kaydeder (Asenkron)."""
    try:
        result = await bulk_insert_cards(
            deck_id=payload.deck_id,
            items=payload.cards,
            enrich_with_ai=payload.enrich_with_ai
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kayit hatasi: {str(e)}")