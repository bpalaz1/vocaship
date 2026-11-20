import asyncio
import re
import urllib.parse
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, Tuple
from app.core.database import get_db
from app.core.local_db import LocalDatabaseClient
from app.services.dictionary_service import async_fetch_from_free_dictionary
from app.services.ai_service import async_generate_single_card
from app.services.vocab_memory_pool import MULTI_LANG_VOCAB, lookup_vocab_pool
from app.api.v1.endpoints.translate import (
    translate_via_free_google_endpoint,
    translate_via_mymemory_endpoint,
)

router = APIRouter(tags=["Yapay Zeka & Sözlük"])

# Eski importlar için takma ad
COMMON_VOCAB = MULTI_LANG_VOCAB

# Süreç içi RAM önbelleği: (target_lang, native_lang, norm_word) -> standardize sözlük cevabı
WORD_MEMORY_CACHE: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
_MAX_RAM_CACHE_SIZE = 5000


class EnrichRequest(BaseModel):
    word: str
    target_lang: Optional[str] = "en"
    native_lang: Optional[str] = "tr"
    context_hint: Optional[str] = None
    memory_only: Optional[bool] = False
    force_ai: Optional[bool] = False


def _normalize_word(word: str) -> str:
    return " ".join((word or "").strip().lower().split())


def _normalize_lang(lang: Optional[str], default: str) -> str:
    return (lang or default).strip().lower()


def _get_local_cache_client(db: Any) -> Optional[LocalDatabaseClient]:
    if isinstance(db, LocalDatabaseClient):
        return db
    local_attr = getattr(db, "local_client", None)
    if isinstance(local_attr, LocalDatabaseClient):
        return local_attr
    try:
        return LocalDatabaseClient()
    except Exception:
        return None


def _is_valid_translation_for_lang(
    translation: str,
    word: str,
    target_lang: str,
    native_lang: str,
) -> bool:
    clean = (translation or "").strip()
    if not clean:
        return False
    # Rusça hedef dilinde mutlaka Kiril harfi olmalı (eski Türkçe/İngilizce sızıntısını önler)
    if native_lang == "ru" and not re.search(r"[\u0400-\u04FF]", clean):
        return False
    # Aynı olmayan dillerde sadece İngilizce kelimenin kendisini geri döndürmüşse (ve İngilizce tanım değilse) reddet
    if (
        target_lang != native_lang
        and native_lang in ("tr", "ru")
        and clean.lower() == word.lower()
    ):
        return False
    return True


def _build_response(
    *,
    word: str,
    target_lang: str,
    native_lang: str,
    phonetic: str,
    translation: str,
    definition: str = "",
    part_of_speech: str = "",
    example_target: str = "",
    example_native: str = "",
    collocations: Optional[list] = None,
    notes: str = "",
    source: str = "memory_cache",
) -> Dict[str, Any]:
    clean_ex_target = (example_target or "").strip()
    clean_ex_native = (example_native or "").strip() if clean_ex_target else ""
    clean_trans = (translation or "").strip()
    clean_def = (definition or "").strip()

    return {
        "found": True,
        "word": word,
        "target_lang": target_lang,
        "native_lang": native_lang,
        "phonetic": (phonetic or "").strip() or (f"/{word}/" if target_lang == "en" else ""),
        "translation": clean_trans,
        "meanings": [
            {
                "translation": clean_trans,
                "definition": clean_def or (clean_trans if native_lang == "en" else ""),
                "part_of_speech": (part_of_speech or "").strip(),
                "target_lang": target_lang,
                "native_lang": native_lang,
            }
        ],
        "example_sentences": (
            [
                {
                    "en": clean_ex_target,
                    "tr": clean_ex_native,
                    "target": clean_ex_target,
                    "native": clean_ex_native,
                }
            ]
            if clean_ex_target
            else []
        ),
        "collocations": collocations or [],
        "notes": (notes or "").strip(),
        "source": source,
        "was_corrected": False,
    }


def save_word_to_cache(
    db: Any,
    *,
    word: str,
    target_lang: str,
    native_lang: str,
    translation: str,
    phonetic: str = "",
    definition: str = "",
    part_of_speech: str = "",
    example_target: str = "",
    example_native: str = "",
    notes: str = "",
    source: str = "memory_cache",
) -> None:
    """
    Sonucu hem süreç içi RAM önbelleğine hem de kalıcı SQLite word_cache tablosuna kaydeder.
    Böylece aynı (kelime, target_lang, native_lang) tekrar sorulduğunda AI'ya hiç gidilmez.
    """
    norm_word = _normalize_word(word)
    t_lang = _normalize_lang(target_lang, "en")
    n_lang = _normalize_lang(native_lang, "tr")
    if not _is_valid_translation_for_lang(translation, norm_word, t_lang, n_lang):
        return

    cache_payload = _build_response(
        word=norm_word,
        target_lang=t_lang,
        native_lang=n_lang,
        phonetic=phonetic,
        translation=translation,
        definition=definition,
        part_of_speech=part_of_speech,
        example_target=example_target,
        example_native=example_native,
        notes=notes,
        source="memory_cache" if source in ("gemini", "translate_fallback") else source,
    )

    if len(WORD_MEMORY_CACHE) >= _MAX_RAM_CACHE_SIZE:
        try:
            WORD_MEMORY_CACHE.pop(next(iter(WORD_MEMORY_CACHE)))
        except StopIteration:
            pass
    WORD_MEMORY_CACHE[(t_lang, n_lang, norm_word)] = cache_payload

    local_client = _get_local_cache_client(db)
    if local_client:
        local_client.upsert_word_cache(
            word=norm_word,
            target_lang=t_lang,
            native_lang=n_lang,
            translation=translation,
            phonetic=phonetic,
            definition=definition,
            part_of_speech=part_of_speech,
            example_target=example_target,
            example_native=example_native,
            notes=notes,
            source=cache_payload["source"],
        )


def _lookup_flashcards_matching_lang(
    db: Any, word: str, target_lang: str, native_lang: str
) -> Optional[Dict[str, Any]]:
    """
    Yalnızca dil çifti (target_lang, native_lang) ile eşleşen flashcard kayıtlarını döndürür.
    Başka bir dilde (ör. Türkçe) kaydedilmiş kartı Rusça istendiğinde asla döndürmez.
    """
    try:
        db_res = db.table("flashcards").select("*").eq("word", word).execute()
        rows = list(db_res.data or [])
        if not rows and word.capitalize() != word:
            cap_res = db.table("flashcards").select("*").eq("word", word.capitalize()).execute()
            rows.extend(cap_res.data or [])

        if not rows:
            return None

        deck_lang_cache: Dict[str, Tuple[str, str]] = {}

        for card in rows:
            card_meanings = card.get("meanings") or []
            if not (card_meanings and isinstance(card_meanings, list) and isinstance(card_meanings[0], dict)):
                continue

            m0 = card_meanings[0]
            card_trans = (m0.get("translation") or m0.get("definition") or "").strip()
            if not card_trans:
                continue

            card_t_lang = (m0.get("target_lang") or "").strip().lower()
            card_n_lang = (m0.get("native_lang") or "").strip().lower()

            if not card_t_lang or not card_n_lang:
                deck_id = card.get("deck_id")
                if deck_id:
                    if deck_id not in deck_lang_cache:
                        try:
                            d_res = db.table("decks").select("source_lang, target_lang").eq("id", deck_id).limit(1).execute()
                            if d_res.data:
                                d_row = d_res.data[0]
                                deck_lang_cache[deck_id] = (
                                    (d_row.get("target_lang") or "en").strip().lower(),
                                    (d_row.get("source_lang") or "tr").strip().lower(),
                                )
                            else:
                                deck_lang_cache[deck_id] = ("en", "tr")
                        except Exception:
                            deck_lang_cache[deck_id] = ("en", "tr")
                    deck_t, deck_n = deck_lang_cache[deck_id]
                    card_t_lang = card_t_lang or deck_t
                    card_n_lang = card_n_lang or deck_n
                else:
                    card_t_lang = card_t_lang or "en"
                    card_n_lang = card_n_lang or "tr"

            if card_t_lang != target_lang or card_n_lang != native_lang:
                continue

            if not _is_valid_translation_for_lang(card_trans, word, target_lang, native_lang):
                continue

            card_sentences = card.get("example_sentences") or []
            card_ex_target = ""
            card_ex_native = ""
            if card_sentences and isinstance(card_sentences, list) and isinstance(card_sentences[0], dict):
                cs = card_sentences[0]
                card_ex_target = (cs.get("target") or cs.get("en") or "").strip()
                card_ex_native = (cs.get("native") or cs.get("tr") or "").strip()

            return _build_response(
                word=word,
                target_lang=target_lang,
                native_lang=native_lang,
                phonetic=card.get("phonetic") or "",
                translation=card_trans,
                definition=(m0.get("definition") or "").strip(),
                part_of_speech=(m0.get("part_of_speech") or "").strip(),
                example_target=card_ex_target,
                example_native=card_ex_native,
                collocations=card.get("collocations") or [],
                notes=card.get("grammar_notes") or "",
                source="database",
            )
    except Exception as e:
        print(f"[DB Flashcards Lookup]: {e}")

    return None


@router.post("/enrich")
@router.post("/lookup")
async def enrich_word(payload: EnrichRequest, db: Any = Depends(get_db)):
    word = _normalize_word(payload.word)
    if not word:
        raise HTTPException(status_code=400, detail="Kelime boş olamaz.")

    target_lang = _normalize_lang(payload.target_lang, "en")
    native_lang = _normalize_lang(payload.native_lang, "tr")
    context_hint = (payload.context_hint or "").strip()
    skip_memory = bool(payload.force_ai and context_hint)

    cache_key = (target_lang, native_lang, word)

    if not skip_memory:
        # 1. KADEME: Süreç içi RAM Hafızası (0ms — kesin (target_lang, native_lang, word) eşleşmesi)
        ram_hit = WORD_MEMORY_CACHE.get(cache_key)
        if ram_hit and _is_valid_translation_for_lang(ram_hit.get("translation", ""), word, target_lang, native_lang):
            return ram_hit

        # 2. KADEME: Yerel Çok Dilli Hızlı Sözlük Havuzu (0ms — tüm 7 dil çifti, çapraz indeksli)
        pool_hit = lookup_vocab_pool(word, target_lang, native_lang)
        if pool_hit:
            resp = _build_response(
                word=pool_hit["word"],
                target_lang=target_lang,
                native_lang=native_lang,
                phonetic=pool_hit.get("phonetic", ""),
                translation=pool_hit["translation"],
                definition=pool_hit.get("definition", ""),
                example_target=pool_hit.get("example_target", ""),
                example_native=pool_hit.get("example_native", ""),
                source="common_vocab",
            )
            WORD_MEMORY_CACHE[cache_key] = resp
            return resp

        # 3. KADEME: Kalıcı SQLite word_cache Tablosu (~1ms — önceki AI/sözlük sonuçları sunucu yeniden başlasa da 0 AI çağrısıyla döner)
        local_client = _get_local_cache_client(db)
        if local_client:
            cached_row = local_client.get_word_cache(word, target_lang, native_lang)
            if cached_row and _is_valid_translation_for_lang(
                cached_row.get("translation", ""), word, target_lang, native_lang
            ):
                resp = _build_response(
                    word=word,
                    target_lang=target_lang,
                    native_lang=native_lang,
                    phonetic=cached_row.get("phonetic") or "",
                    translation=cached_row.get("translation") or "",
                    definition=cached_row.get("definition") or "",
                    part_of_speech=cached_row.get("part_of_speech") or "",
                    example_target=cached_row.get("example_target") or "",
                    example_native=cached_row.get("example_native") or "",
                    notes=cached_row.get("notes") or "",
                    source=cached_row.get("source") or "memory_cache",
                )
                WORD_MEMORY_CACHE[cache_key] = resp
                return resp

        # 4. KADEME: Dil Çifti Doğrulanmış Flashcards Tablosu (~1-2ms)
        db_card_hit = _lookup_flashcards_matching_lang(db, word, target_lang, native_lang)
        if db_card_hit:
            WORD_MEMORY_CACHE[cache_key] = db_card_hit
            return db_card_hit

    # Yalnızca hafıza sorgusu istendiyse AI'ya gitmeden anında miss döndür
    if payload.memory_only:
        return {
            "found": False,
            "word": word,
            "target_lang": target_lang,
            "native_lang": native_lang,
            "source": "miss",
        }

    # 5. KADEME: Hafızada Yoksa Dış Sözlük / Gemini AI (Paralel, Düşük Gecikmeli)
    if target_lang == "en" and native_lang == "en" and not context_hint:
        dict_only = await async_fetch_from_free_dictionary(word, timeout=2.0)
        if dict_only and dict_only.get("meanings"):
            dict_def = dict_only["meanings"][0].get("definition", "").strip()
            dict_ex = (
                dict_only["example_sentences"][0].get("en", "").strip()
                if dict_only.get("example_sentences")
                else ""
            )
            dict_pos = dict_only["meanings"][0].get("part_of_speech", "")
            dict_phon = dict_only.get("phonetic", "") or f"/{word}/"
            if dict_def:
                save_word_to_cache(
                    db,
                    word=word,
                    target_lang=target_lang,
                    native_lang=native_lang,
                    translation=dict_def,
                    phonetic=dict_phon,
                    definition=dict_def,
                    part_of_speech=dict_pos,
                    example_target=dict_ex,
                    example_native="",
                    source="free_dictionary",
                )
                return _build_response(
                    word=word,
                    target_lang=target_lang,
                    native_lang=native_lang,
                    phonetic=dict_phon,
                    translation=dict_def,
                    definition=dict_def,
                    part_of_speech=dict_pos,
                    example_target=dict_ex,
                    example_native="",
                    source="free_dictionary",
                )

    # Gemini AI + (İngilizce ise fonetik desteği için paralel FreeDict)
    gemini_task = async_generate_single_card(
        word=word,
        target_lang=target_lang,
        native_lang=native_lang,
        level="B2",
        context_hint=context_hint or None,
    )
    if target_lang == "en":
        gemini_raw, dict_raw = await asyncio.gather(
            gemini_task,
            async_fetch_from_free_dictionary(word, timeout=1.6),
            return_exceptions=True,
        )
    else:
        gemini_raw, dict_raw = await asyncio.gather(
            gemini_task,
            asyncio.sleep(0, result=None),
            return_exceptions=True,
        )

    dict_data = dict_raw if isinstance(dict_raw, dict) else None
    dict_phonetic = (dict_data.get("phonetic") or "").strip() if dict_data else ""
    dict_definition = (
        dict_data["meanings"][0].get("definition", "").strip()
        if dict_data and dict_data.get("meanings")
        else ""
    )
    dict_example_en = (
        dict_data["example_sentences"][0].get("en", "").strip()
        if dict_data and dict_data.get("example_sentences")
        else ""
    )

    translation = ""
    definition = ""
    phonetic = dict_phonetic
    part_of_speech = ""
    example_target = ""
    example_native = ""
    notes = ""
    source = "gemini"

    if isinstance(gemini_raw, dict):
        meanings = gemini_raw.get("meanings") or []
        if meanings and isinstance(meanings[0], dict):
            m0 = meanings[0]
            cand_trans = (m0.get("translation") or m0.get("definition") or "").strip()
            if _is_valid_translation_for_lang(cand_trans, word, target_lang, native_lang):
                translation = cand_trans
            definition = (m0.get("definition") or "").strip()
            part_of_speech = (m0.get("part_of_speech") or "").strip()

        if not phonetic:
            phonetic = (gemini_raw.get("phonetic") or "").strip()
        notes = (gemini_raw.get("grammar_notes") or "").strip()

        sentences = gemini_raw.get("example_sentences") or []
        if sentences and isinstance(sentences[0], dict):
            s0 = sentences[0]
            g_target = (s0.get("target") or s0.get("en") or "").strip()
            g_native = (s0.get("native") or s0.get("source") or s0.get("tr") or "").strip()
            # Cümle ve çevirisinin birebir eşleştiğinden emin ol:
            if g_target and g_native and (
                native_lang != "ru" or re.search(r"[\u0400-\u04FF]", g_native)
            ):
                example_target = g_target
                example_native = g_native
            elif g_target:
                example_target = g_target
                if target_lang != native_lang:
                    translated_ex = await translate_via_free_google_endpoint(
                        g_target, target_lang, native_lang
                    )
                    example_native = (translated_ex or "").strip()
    elif isinstance(gemini_raw, Exception):
        print(f"[Gemini Fallback Devrede]: {gemini_raw}")

    # Gemini başarısız olduysa veya hedef dilde çeviri üretemediyse hızlı ücretsiz çeviri yedeği
    if not translation and native_lang != target_lang:
        source = "translate_fallback"
        gtx_word = await translate_via_free_google_endpoint(word, target_lang, native_lang)
        if gtx_word and _is_valid_translation_for_lang(gtx_word, word, target_lang, native_lang):
            translation = gtx_word
        else:
            mm_word = await translate_via_mymemory_endpoint(word, target_lang, native_lang)
            if mm_word and _is_valid_translation_for_lang(mm_word, word, target_lang, native_lang):
                translation = mm_word

    # Örnek cümle hâlâ boşsa ve FreeDict İngilizce örnek cümle verdiyse, AYNI cümleyi hedef dile çevir
    if not example_target and dict_example_en and target_lang == "en":
        example_target = dict_example_en
        if native_lang != "en":
            translated_dict_ex = await translate_via_free_google_endpoint(
                dict_example_en, "en", native_lang
            )
            example_native = (translated_dict_ex or "").strip()

    final_translation = translation or (dict_definition if native_lang == "en" else "")
    final_definition = (
        definition
        or (dict_definition if dict_definition and dict_definition.lower() != word else "")
        or (final_translation if native_lang == "en" else "")
    )
    final_phonetic = phonetic or (f"/{word}/" if target_lang == "en" else "")

    # Sonucu hafızaya ve kalıcı SQLite önbelleğine kaydet (özel bağlam ipucu yoksa)
    if final_translation and not context_hint:
        save_word_to_cache(
            db,
            word=word,
            target_lang=target_lang,
            native_lang=native_lang,
            translation=final_translation,
            phonetic=final_phonetic,
            definition=final_definition,
            part_of_speech=part_of_speech,
            example_target=example_target,
            example_native=example_native,
            notes=notes,
            source=source,
        )

    return _build_response(
        word=word,
        target_lang=target_lang,
        native_lang=native_lang,
        phonetic=final_phonetic,
        translation=final_translation,
        definition=final_definition,
        part_of_speech=part_of_speech,
        example_target=example_target,
        example_native=example_native,
        notes=notes,
        source=source if final_translation else "free_dictionary",
    )
