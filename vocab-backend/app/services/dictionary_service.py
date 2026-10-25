import urllib.parse
import httpx
from typing import Optional, Dict, Any

FREE_DICT_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/{word}"

def fetch_from_free_dictionary(word: str) -> Optional[Dict[str, Any]]:
    """
    Ücretsiz Free Dictionary API üzerinden kelimeyi sorgular.
    Başarılı olursa anında fonetik, tanım ve örnek cümle döndürür.
    Bulamazsa (404 vb.) None döner ve yapay zekaya paslar.
    """
    clean_word = word.strip().lower()
    if not clean_word:
        return None

    try:
        url = FREE_DICT_URL.format(word=urllib.parse.quote(clean_word))
        with httpx.Client(timeout=3.0) as client:
            resp = client.get(url)
            if resp.status_code != 200:
                return None

            data = resp.json()
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
                            "definition": definition_text
                        })
                    if not example_en and d.get("example"):
                        example_en = d.get("example").strip()

            if not meanings_list:
                return None

            # İlk anlamı birincil olarak seç
            primary_meaning = meanings_list[0]["definition"]

            return {
                "word": entry.get("word", clean_word),
                "phonetic": phonetic,
                "grammar_notes": part_of_speech,
                "meanings": [{"part_of_speech": part_of_speech, "translation": primary_meaning, "definition": primary_meaning}],
                "example_sentences": [{"en": example_en, "tr": ""}],
                "source": "dictionary_api"
            }

    except Exception as e:
        print(f"[FreeDict API] Bağlantı hatası: {e}")
        return None