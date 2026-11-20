import urllib.parse
import httpx
from typing import Optional, Dict, Any

FREE_DICT_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/{word}"


def _parse_free_dictionary_payload(clean_word: str, data: Any) -> Optional[Dict[str, Any]]:
    if not isinstance(data, list) or len(data) == 0:
        return None

    entry = data[0]

    # 1. Fonetik Okunuş
    phonetic = entry.get("phonetic") or ""
    if not phonetic and entry.get("phonetics"):
        for p in entry["phonetics"]:
            if p.get("text"):
                phonetic = p["text"]
                break

    # 2. Tanım ve Kelime Türü
    meanings_list = []
    example_en = ""
    part_of_speech = ""

    for m in entry.get("meanings", []):
        pos = m.get("part_of_speech") or m.get("partOfSpeech") or ""
        if not part_of_speech and pos:
            part_of_speech = pos

        for d in m.get("definitions", []):
            definition_text = d.get("definition", "").strip()
            if definition_text:
                meanings_list.append({
                    "part_of_speech": pos,
                    "translation": definition_text,
                    "definition": definition_text,
                })
            if not example_en and d.get("example"):
                example_en = d.get("example").strip()

    if not meanings_list:
        return None

    primary_meaning = meanings_list[0]["definition"]

    return {
        "word": entry.get("word", clean_word),
        "phonetic": phonetic,
        "grammar_notes": part_of_speech,
        "meanings": [{
            "part_of_speech": part_of_speech,
            "translation": primary_meaning,
            "definition": primary_meaning,
        }],
        "example_sentences": [{"en": example_en, "tr": ""}] if example_en else [],
        "source": "dictionary_api",
    }


def fetch_from_free_dictionary(word: str) -> Optional[Dict[str, Any]]:
    """
    Ücretsiz Free Dictionary API üzerinden kelimeyi senkron sorgular.
    """
    clean_word = word.strip().lower()
    if not clean_word:
        return None

    try:
        url = FREE_DICT_URL.format(word=urllib.parse.quote(clean_word))
        with httpx.Client(timeout=2.0) as client:
            resp = client.get(url)
            if resp.status_code != 200:
                return None
            return _parse_free_dictionary_payload(clean_word, resp.json())
    except Exception as e:
        print(f"[FreeDict API] Bağlantı hatası: {e}")
        return None


async def async_fetch_from_free_dictionary(word: str, timeout: float = 1.8) -> Optional[Dict[str, Any]]:
    """
    Ücretsiz Free Dictionary API üzerinden kelimeyi asenkron ve düşük zaman aşımı ile sorgular.
    Event loop'u asla bloklamaz.
    """
    clean_word = word.strip().lower()
    if not clean_word:
        return None

    try:
        url = FREE_DICT_URL.format(word=urllib.parse.quote(clean_word))
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return None
            return _parse_free_dictionary_payload(clean_word, resp.json())
    except Exception as e:
        print(f"[FreeDict Async API] Bağlantı hatası: {e}")
        return None
