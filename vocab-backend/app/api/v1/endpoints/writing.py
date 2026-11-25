import re
from typing import List
from fastapi import APIRouter, HTTPException, Request, status
from app.schemas.writing import (
    WritingAnalyzeRequest,
    WritingAnalyzeResponse,
    WritingCorrectionItem,
    SuggestedVocabItem,
)
from app.services.ai_service import async_call_gemini_with_fallback
from app.services.quota_service import check_and_consume_quota

router = APIRouter(tags=["Writing Studio"])


def _match_used_target_words(text: str, target_words: List[str]) -> List[str]:
    lower_text = (text or "").lower()
    matched: List[str] = []
    for w in target_words:
        clean = (w or "").strip()
        if not clean:
            continue
        lw = clean.lower()
        # Inflected stem match (e.g., decide -> decided/deciding, adapt -> adapted/adapting)
        stem = lw[:-1] if lw.endswith("e") and len(lw) > 4 else lw
        pattern = rf"\b{re.escape(stem)}[a-z]*\b"
        if re.search(pattern, lower_text):
            matched.append(clean)
    return matched


@router.post("/analyze", response_model=WritingAnalyzeResponse, status_code=status.HTTP_200_OK)
async def analyze_writing(payload: WritingAnalyzeRequest, request: Request):
    """
    Kullanıcının İngilizce metnini pedagojik olarak sade bir yaklaşımla analiz eder:
    - En kritik en fazla 4 yazım/gramer hatasını tek cümlelik Türkçe açıklamayla döner.
    - Bağlama uygun kullanılan hedef kelimeleri doğrular.
    - Doğal C1 alternatifi ve desteye eklenebilecek 2-3 yeni kelime önerir.
    """
    clean_text = (payload.text or "").strip()
    if len(clean_text) < 8:
        raise HTTPException(
            status_code=400,
            detail="Analiz için lütfen en az birkaç kelimelik İngilizce bir metin yazın.",
        )

    check_and_consume_quota(request, "text")

    target_words_clean = [w.strip() for w in (payload.target_words or []) if w and w.strip()][:5]
    explanation_lang = "Turkish" if (payload.native_lang or "tr").lower().startswith("tr") else "English"
    raw_level = (payload.level or "B1").strip().upper()
    target_level = raw_level if raw_level in ("A1", "A2", "B1", "B2", "C1") else "B1"

    prompt = f"""
You are a supportive, concise VocaShip English Writing Coach.
Source Type: {payload.source_type}
Source Context: {payload.source_context or "General English writing practice"}
Target CEFR Level: {target_level}
Target Vocabulary Words: {target_words_clean}
Student Text:
\"\"\"
{clean_text[:3000]}
\"\"\"

Pedagogical Rules:
1. Do NOT overwhelm the student with 15 minor punctuation nitpicks. Return AT MOST 4 of the most important spelling, grammar, or style corrections.
2. Each correction explanation MUST be a single clear sentence in {explanation_lang}.
3. Check which words from Target Vocabulary Words were used accurately in context (including inflected forms) and list them in "used_target_words".
4. Provide "corrected_text" (the student's text with those fixes applied cleanly).
5. Provide "c1_natural_version" (natural rewrite strictly matched to CEFR {target_level} vocabulary and grammar complexity — if {target_level} is A1 or A2, keep sentences short, clear, and strictly within {target_level} vocabulary without advanced C1/C2 words; if B1/B2/C1, match that exact level naturally).
6. Extract 2 to 3 useful words/phrases from "c1_natural_version" appropriate for CEFR {target_level} into "suggested_words" with {explanation_lang} meaning and IPA phonetic.
7. Estimate the student's actual CEFR level (e.g. "A1", "A2", "B1", "B2", "C1").

Return ONLY valid compact JSON matching this schema:
{{
  "cefr_level": "{target_level}",
  "corrected_text": "...",
  "corrections": [
    {{
      "original": "wrong phrase",
      "corrected": "right phrase",
      "type": "grammar",
      "explanation": "Tek cümlelik açıklama."
    }}
  ],
  "used_target_words": ["word1"],
  "c1_natural_version": "...",
  "suggested_words": [
    {{
      "word": "nuance",
      "meaning": "ince ayrım",
      "phonetic": "/ˈnjuː.ɑːns/"
    }}
  ]
}}
"""

    local_used = _match_used_target_words(clean_text, target_words_clean)

    try:
        ai_data = await async_call_gemini_with_fallback(prompt, temperature=0.25, timeout_per_model=9.0)
        if not isinstance(ai_data, dict) or not ai_data.get("corrected_text"):
            raise ValueError("Empty AI response")

        raw_corrections = ai_data.get("corrections") or []
        corrections: List[WritingCorrectionItem] = []
        for item in raw_corrections[:4]:
            if isinstance(item, dict) and item.get("original") and item.get("corrected"):
                corr_type = str(item.get("type") or "grammar").lower()
                if corr_type not in ("spelling", "grammar", "style"):
                    corr_type = "grammar"
                corrections.append(
                    WritingCorrectionItem(
                        original=str(item["original"]).strip(),
                        corrected=str(item["corrected"]).strip(),
                        type=corr_type,
                        explanation=str(item.get("explanation") or "").strip(),
                    )
                )

        raw_used = ai_data.get("used_target_words")
        used_words = (
            [str(w).strip() for w in raw_used if str(w).strip()]
            if isinstance(raw_used, list)
            else local_used
        )
        # Ensure deterministic matches are not missed
        for w in local_used:
            if not any(u.lower() == w.lower() for u in used_words):
                used_words.append(w)

        raw_suggested = ai_data.get("suggested_words") or []
        suggested: List[SuggestedVocabItem] = []
        for s in raw_suggested[:3]:
            if isinstance(s, dict) and s.get("word"):
                suggested.append(
                    SuggestedVocabItem(
                        word=str(s["word"]).strip(),
                        meaning=str(s.get("meaning") or "").strip() or "Detay için tıklayın",
                        phonetic=str(s.get("phonetic") or "").strip(),
                    )
                )

        return WritingAnalyzeResponse(
            cefr_level=str(ai_data.get("cefr_level") or target_level).strip(),
            corrected_text=str(ai_data.get("corrected_text") or clean_text).strip(),
            corrections=corrections,
            used_target_words=used_words,
            c1_natural_version=str(ai_data.get("c1_natural_version") or ai_data.get("corrected_text") or clean_text).strip(),
            suggested_words=suggested,
        )
    except Exception as e:
        print(f"[Writing Studio Gemini Fallback]: {e}")
        return WritingAnalyzeResponse(
            cefr_level=target_level,
            corrected_text=clean_text,
            corrections=[],
            used_target_words=local_used,
            c1_natural_version=clean_text,
            suggested_words=[
                SuggestedVocabItem(word="clear", meaning="açık, net", phonetic="/klɪr/"),
                SuggestedVocabItem(word="explain", meaning="açıklamak", phonetic="/ɪkˈspleɪn/"),
            ],
        )
