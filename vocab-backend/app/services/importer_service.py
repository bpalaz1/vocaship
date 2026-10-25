import asyncio
from typing import List, Dict, Any
from app.schemas.importer import ParsedItem
from app.core.database import get_db
from app.services.ai_service import batch_enrich_words


def parse_quizlet_text(raw_text: str, term_sep: str = "\t", row_sep: str = "\n") -> List[ParsedItem]:
    parsed: List[ParsedItem] = []
    lines = raw_text.strip().split(row_sep)
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Eger belirtilen ayirici satirin icinde varsa bol
        if term_sep in line:
            parts = line.split(term_sep, 1)
            term = parts[0].strip()
            definition = parts[1].strip()
        else:
            # Ayirici bulunamadiysa (orn. tire, cift bosluk denemesi)
            term = line
            definition = ""
            
        if term:
            parsed.append(ParsedItem(term=term, definition=definition))
            
    return parsed


async def bulk_insert_cards(deck_id: str, items: List[ParsedItem], enrich_with_ai: bool = False) -> Dict[str, Any]:
    """Toplu kart kaydı. enrich_with_ai=True ise asyncio.gather ile paralel zenginleştirir."""
    db = get_db()
    rows_to_insert = []
    
    if enrich_with_ai and items:
        # Kelimeleri Gemini ile paralel asenkron zenginlestir
        word_list = [item.term for item in items]
        enriched_cards = await batch_enrich_words(word_list)
        
        # Enriched verileri Supabase formatina donustur
        for card in enriched_cards:
            if isinstance(card, dict):
                c_word = card.get("word", "")
                c_phonetic = card.get("phonetic", "")
                c_meanings = card.get("meanings") or []
                c_grammar = card.get("grammar_notes", "")
                c_sentences = card.get("example_sentences") or []
                c_collocations = card.get("collocations") or []
            else:
                c_word = getattr(card, "word", "")
                c_phonetic = getattr(card, "phonetic", "")
                c_meanings = [m.model_dump() if hasattr(m, "model_dump") else m for m in getattr(card, "meanings", [])]
                c_grammar = getattr(card, "grammar_notes", "")
                c_sentences = [s.model_dump() if hasattr(s, "model_dump") else s for s in getattr(card, "example_sentences", [])]
                c_collocations = getattr(card, "collocations", [])

            rows_to_insert.append({
                "deck_id": deck_id,
                "word": c_word,
                "phonetic": c_phonetic,
                "meanings": c_meanings,
                "grammar_notes": c_grammar,
                "example_sentences": c_sentences,
                "collocations": c_collocations
            })
    else:
        # Temel kart olarak kaydet
        for item in items:
            rows_to_insert.append({
                "deck_id": deck_id,
                "word": item.term,
                "meanings": [{"part_of_speech": "other", "translation": item.definition, "definition": item.definition}],
                "grammar_notes": "",
                "example_sentences": [],
                "collocations": []
            })
            
    if rows_to_insert:
        res = db.table("flashcards").insert(rows_to_insert).execute()
        return {"saved_count": len(res.data or rows_to_insert), "status": "success"}
    
    return {"saved_count": 0, "status": "empty"}


def bulk_insert_cards_sync(deck_id: str, items: List[ParsedItem], enrich_with_ai: bool = False) -> Dict[str, Any]:
    """Senkron ortamlardan çağrım için sarmalayıcı fonksiyon."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                return executor.submit(lambda: asyncio.run(bulk_insert_cards(deck_id, items, enrich_with_ai))).result()
        return loop.run_until_complete(bulk_insert_cards(deck_id, items, enrich_with_ai))
    except Exception:
        return asyncio.run(bulk_insert_cards(deck_id, items, enrich_with_ai))