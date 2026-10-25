from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from app.core.database import get_db


def calculate_sm2(rating: int, repetitions: int, ease_factor: float, interval: int):
    """
    SuperMemo-2 (SM-2) Algoritması:
    rating < 3: Başarısız (Tekrar sıfırlanır, aralık 1 güne düşer)
    rating >= 3: Başarılı (Aralık ease_factor ile katlanarak büyür)
    """
    if rating < 3:
        new_repetitions = 0
        new_interval = 1
    else:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = int(round(interval * ease_factor))
        new_repetitions = repetitions + 1

    new_ease_factor = ease_factor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    if new_ease_factor < 1.3:
        new_ease_factor = 1.3

    return new_repetitions, round(new_ease_factor, 2), new_interval


def process_card_review_result(card_id: str, is_correct: bool, rating: Optional[int] = None) -> Dict[str, Any]:
    """
    Zayıf Nokta Avcısı (Weak-Spot Hunter) + Dinamik SM-2 Değerlendirmesi:
    - is_correct == False: mistake_count += 1, consecutive_correct = 0, needs_review = True
    - is_correct == True: consecutive_correct += 1, consecutive_correct >= 2 ise needs_review = False
    
    card_id parametresi UUID olabileceği gibi doğrudan kelime metni ('word') de olabilir.
    Eğer kelime bulunamazsa kullanıcı havuzuna otomatik zayıf kart olarak kaydedilir.
    """
    import json
    import uuid

    db = get_db()
    # 1. UUID ile ara
    res = db.table("flashcards").select("*").eq("id", card_id).execute()

    # 2. Kelime metni ile tam eşleşme ara
    if not res.data:
        res = db.table("flashcards").select("*").eq("word", card_id).execute()

    # 3. Büyük/küçük harf duyarsız arama
    if not res.data:
        clean_word = card_id.strip().lower()
        all_cards = db.table("flashcards").select("*").execute().data or []
        for c in all_cards:
            if c.get("word", "").strip().lower() == clean_word:
                res.data = [c]
                break

    # 4. Hiçbir yerde yoksa (Okuma Odası veya Oyun Arenasından yeni hata yapılan kelime)
    # Kullanıcının destesine otomatik ekle
    if not res.data:
        decks = db.table("decks").select("*").limit(1).execute().data or []
        deck_id = decks[0]["id"] if decks else None
        if not deck_id:
            deck_id = str(uuid.uuid4())
            db.table("decks").insert({
                "id": deck_id,
                "title": "Genel Çalışma",
                "description": "Oyun ve Okuma Hatalarından Eklenenler",
                "created_at": datetime.now(timezone.utc).isoformat()
            }).execute()

        new_card_id = str(uuid.uuid4())
        word_clean = card_id.strip()
        auto_translation = word_clean
        auto_definition = f"Otomatik eklenen kelime: {word_clean}"
        try:
            from app.api.v1.endpoints.ai import MULTI_LANG_VOCAB
            word_lower = word_clean.lower()
            if word_lower in MULTI_LANG_VOCAB:
                auto_translation = MULTI_LANG_VOCAB[word_lower].get("translations", {}).get("tr") or auto_translation
                auto_definition = MULTI_LANG_VOCAB[word_lower].get("translations", {}).get("tr") or auto_definition
        except Exception:
            pass

        new_card_data = {
            "id": new_card_id,
            "deck_id": deck_id,
            "word": word_clean,
            "meanings": json.dumps([{"translation": auto_translation, "definition": auto_definition}]),
            "ease_factor": 2.5,
            "interval_days": 1,
            "repetitions": 0,
            "repetition_number": 0,
            "mistake_count": 0,
            "consecutive_correct": 0,
            "needs_review": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("flashcards").insert(new_card_data).execute()
        res.data = [new_card_data]

    card = res.data[0]
    actual_card_id = card["id"]
    repetitions = card.get("repetition_number") or card.get("repetitions") or 0
    ease_factor = float(card.get("ease_factor") or 2.5)
    interval = card.get("interval_days") or 0
    mistake_count = card.get("mistake_count") or 0
    consecutive_correct = card.get("consecutive_correct") or 0
    old_needs_review = bool(card.get("needs_review") or False)

    # Zayıf nokta sayaç mantığı
    if not is_correct:
        mistake_count += 1
        consecutive_correct = 0
        needs_review = True
        effective_rating = rating if rating is not None else 1
    else:
        consecutive_correct += 1
        # 2 kez üst üste doğru bilinirse zayıf noktadan otomatik çıkar
        if consecutive_correct >= 2:
            needs_review = False
        else:
            needs_review = old_needs_review
        effective_rating = rating if rating is not None else 4

    new_reps, new_ef, new_interval = calculate_sm2(effective_rating, repetitions, ease_factor, interval)

    now = datetime.now(timezone.utc)
    next_review = now + timedelta(days=new_interval)

    update_data = {
        "mistake_count": mistake_count,
        "consecutive_correct": consecutive_correct,
        "needs_review": needs_review,
        "repetition_number": new_reps,
        "repetitions": new_reps,
        "ease_factor": new_ef,
        "interval_days": new_interval,
        "next_review_date": next_review.isoformat(),
        "last_reviewed_at": now.isoformat()
    }
    db.table("flashcards").update(update_data).eq("id", actual_card_id).execute()

    if not needs_review and old_needs_review:
        msg = "Tebrikler! Kelime 2 kez doğru cevaplanarak zayıf noktalardan temizlendi. 🎯"
    elif needs_review and not is_correct:
        msg = "Zayıf nokta havuzuna eklendi. Yakında kurtarma seansında tekrar karşınıza çıkacak."
    elif is_correct:
        msg = f"Doğru! ({consecutive_correct}/2 adım tamamlandı)"
    else:
        msg = f"Tekrar kaydedildi. Bir sonraki çalışma {new_interval} gün sonra."

    return {
        "card_id": actual_card_id,
        "is_correct": is_correct,
        "mistake_count": mistake_count,
        "consecutive_correct": consecutive_correct,
        "needs_review": needs_review,
        "repetition_number": new_reps,
        "ease_factor": new_ef,
        "interval_days": new_interval,
        "next_review_date": next_review.isoformat(),
        "message": msg
    }


def process_card_review(card_id: str, rating: Optional[int] = None, is_correct: Optional[bool] = None) -> Dict[str, Any]:
    """Geriye dönük uyumlu SM-2 değerlendirici."""
    if is_correct is None:
        is_correct = (rating >= 3) if rating is not None else True
    return process_card_review_result(card_id=card_id, is_correct=is_correct, rating=rating)


def get_weak_spot_cards(deck_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """needs_review == True olan zayıf kelimeleri en çok hata yapılandan başlayarak listeler."""
    db = get_db()
    query = db.table("flashcards").select("*").eq("needs_review", True)
    if deck_id:
        query = query.eq("deck_id", deck_id)
    res = query.order("mistake_count", desc=True).limit(limit).execute()
    return res.data or []


def get_due_flashcards(deck_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Günlük tekrar havuzu:
    needs_review == True olan zayıf kelimeler havuzun en başına serpiştirilir.
    """
    db = get_db()
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Zayıf kelimeleri (needs_review=True) öncelikli olarak çek
    query_weak = db.table("flashcards").select("*").eq("needs_review", True)
    if deck_id:
        query_weak = query_weak.eq("deck_id", deck_id)
    weak_res = query_weak.order("mistake_count", desc=True).limit(limit).execute()
    weak_cards = weak_res.data or []

    # 2. Kalan kontenjanı standart tarihi gelen (due) kartlarla doldur
    remaining = limit - len(weak_cards)
    normal_cards: List[Dict[str, Any]] = []
    if remaining > 0:
        query_due = db.table("flashcards").select("*").lte("next_review_date", now_iso)
        if deck_id:
            query_due = query_due.eq("deck_id", deck_id)
        due_res = query_due.order("next_review_date", desc=False).limit(limit).execute()

        weak_ids = {c.get("id") for c in weak_cards}
        for c in (due_res.data or []):
            if c.get("id") not in weak_ids and len(normal_cards) < remaining:
                normal_cards.append(c)

    return weak_cards + normal_cards