/**
 * VocaShip Ortak Hata & Zayıf Nokta Havuzu (İntikam Arenası <-> Zayıf Nokta Tek Kaynak)
 * Hem oyun içi hataları (kart ID'si olsun/olmasın) hem de veritabanındaki needs_review=true
 * kartlarını çift yönlü senkronize eder ve tek sayaç altında toplar.
 */

import { API_BASE } from "../config";

export interface ArenaMistakeItem {
  id: string;
  cardId?: string;
  word: string;
  phonetic?: string;
  meanings: Array<{
    definition: string;
    translation: string;
    part_of_speech?: string;
  }>;
  example_sentences: Array<{
    en?: string;
    tr?: string;
    target?: string;
    source?: string;
    native?: string;
  }>;
  timestamp: number;
  gameType?: string;
  mistake_count?: number;
  consecutive_correct?: number;
  needs_review?: boolean;
  pendingSync?: boolean;
}

const STORAGE_KEY = "vocaship_arena_mistakes";
export const ARENA_MISTAKES_EVENT = "vocaship:arena_mistakes_updated";

function emitMistakesUpdated(list: ArenaMistakeItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(ARENA_MISTAKES_EVENT, {
        detail: { mistakes: list, count: list.length },
      })
    );
  } catch {}
}

function writeMistakesStorage(list: ArenaMistakeItem[]): ArenaMistakeItem[] {
  if (typeof window === "undefined") return list;
  const deduped: ArenaMistakeItem[] = [];
  const seenWords = new Set<string>();
  for (const item of list) {
    const cleanWord = String(item?.word || "").trim();
    if (!cleanWord) continue;
    const key = cleanWord.toLowerCase();
    if (seenWords.has(key)) continue;
    seenWords.add(key);
    deduped.push({ ...item, word: cleanWord });
  }
  const capped = deduped.slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch (e) {
    console.warn("[ArenaMistakes] LocalStorage yazma hatası:", e);
  }
  emitMistakesUpdated(capped);
  return capped;
}

function mapBackendCardToMistake(card: any): ArenaMistakeItem {
  const word = String(card?.word || "").trim();
  const meanings =
    Array.isArray(card?.meanings) && card.meanings.length > 0
      ? card.meanings.map((m: any) => ({
          definition: String(m?.definition || m?.translation || word),
          translation: String(m?.translation || m?.definition || word),
          part_of_speech: m?.part_of_speech || "general",
        }))
      : [{ definition: word, translation: word, part_of_speech: "general" }];

  return {
    id: String(card?.id || word),
    cardId: card?.id ? String(card.id) : undefined,
    word,
    phonetic: card?.phonetic || undefined,
    meanings,
    example_sentences: Array.isArray(card?.example_sentences)
      ? card.example_sentences
      : [],
    timestamp: card?.last_reviewed_at
      ? Date.parse(card.last_reviewed_at) || Date.now()
      : Date.now(),
    mistake_count: Number(card?.mistake_count) || 1,
    consecutive_correct: Number(card?.consecutive_correct) || 0,
    needs_review: true,
    pendingSync: false,
  };
}

export function getArenaMistakes(): ArenaMistakeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("[ArenaMistakes] LocalStorage okuma hatası:", e);
    return [];
  }
}

export function saveArenaMistake(item: {
  id?: string;
  cardId?: string;
  word: string;
  meaning?: string;
  translation?: string;
  phonetic?: string;
  example?: string;
  gameType?: string;
}): void {
  if (typeof window === "undefined" || !item.word) return;

  const cleanWord = item.word.trim();
  if (!cleanWord) return;

  try {
    const currentList = getArenaMistakes();
    const meaningText = item.meaning || item.translation || cleanWord;
    const explicitCardId =
      item.cardId ||
      (item.id && !item.id.startsWith("mistake_") ? item.id : undefined);

    const existingIndex = currentList.findIndex(
      (m) => m.word.toLowerCase() === cleanWord.toLowerCase()
    );

    let updatedList: ArenaMistakeItem[];
    if (existingIndex >= 0) {
      const existing = currentList[existingIndex];
      const updatedItem: ArenaMistakeItem = {
        ...existing,
        cardId: explicitCardId || existing.cardId,
        meanings: [
          {
            definition: meaningText,
            translation: meaningText,
            part_of_speech: existing.meanings?.[0]?.part_of_speech || "general",
          },
        ],
        timestamp: Date.now(),
        gameType: item.gameType || existing.gameType || "arena",
        needs_review: true,
        pendingSync: true,
      };
      updatedList = [
        updatedItem,
        ...currentList.filter((_, idx) => idx !== existingIndex),
      ];
    } else {
      const newItem: ArenaMistakeItem = {
        id:
          explicitCardId ||
          `mistake_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        cardId: explicitCardId,
        word: cleanWord,
        phonetic: item.phonetic || `/${cleanWord}/`,
        meanings: [
          {
            definition: meaningText,
            translation: meaningText,
            part_of_speech: "general",
          },
        ],
        example_sentences: item.example ? [{ en: item.example, tr: "" }] : [],
        timestamp: Date.now(),
        gameType: item.gameType || "arena",
        mistake_count: 1,
        consecutive_correct: 0,
        needs_review: true,
        pendingSync: true,
      };
      updatedList = [newItem, ...currentList];
    }

    writeMistakesStorage(updatedList);

    // Backend veritabanındaki needs_review=true havuzuna da kalıcı olarak işle
    const targetKey = explicitCardId || cleanWord;
    fetch(
      `${API_BASE}/api/v1/cards/${encodeURIComponent(targetKey)}/review-result`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_correct: false,
          meaning: meaningText !== cleanWord ? meaningText : undefined,
        }),
      }
    )
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        const latest = getArenaMistakes().map((m) =>
          m.word.toLowerCase() === cleanWord.toLowerCase()
            ? {
                ...m,
                cardId: data?.card_id || m.cardId,
                id: data?.card_id || m.id,
                mistake_count: data?.mistake_count ?? m.mistake_count,
                needs_review: true,
                pendingSync: false,
              }
            : m
        );
        writeMistakesStorage(latest);
      })
      .catch(() => {
        // Çevrimdışıysa pendingSync=true kalır, sonraki syncUnifiedWeakSpots çağrısında aktarılır
      });
  } catch (e) {
    console.warn("[ArenaMistakes] Hata kaydedilemedi:", e);
  }
}

export function clearArenaMistakes(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    emitMistakesUpdated([]);
  } catch (e) {
    console.warn("[ArenaMistakes] Hatalar temizlenemedi:", e);
  }
}

export function removeArenaMistake(
  wordOrId: string,
  options?: { syncBackend?: boolean; cardId?: string }
): void {
  if (typeof window === "undefined" || !wordOrId) return;
  try {
    const currentList = getArenaMistakes();
    const targetLower = wordOrId.trim().toLowerCase();
    const matchedItem = currentList.find(
      (m) =>
        m.id === wordOrId ||
        m.cardId === wordOrId ||
        m.word.toLowerCase() === targetLower
    );

    const updated = currentList.filter(
      (m) =>
        m.id !== wordOrId &&
        m.cardId !== wordOrId &&
        m.word.toLowerCase() !== targetLower
    );
    writeMistakesStorage(updated);

    if (options?.syncBackend !== false) {
      const backendKey =
        options?.cardId ||
        matchedItem?.cardId ||
        (matchedItem && !matchedItem.id.startsWith("mistake_")
          ? matchedItem.id
          : null) ||
        matchedItem?.word ||
        wordOrId;

      fetch(
        `${API_BASE}/api/v1/cards/${encodeURIComponent(backendKey)}/review-result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_correct: true,
            force_clear: true,
          }),
        }
      ).catch(() => {});
    }
  } catch (e) {
    console.warn("[ArenaMistakes] Hata kartı silinemedi:", e);
  }
}

/**
 * Backend needs_review=true listesi ile localStorage önbelleğini tek ortak havuzda eşitleyerek döndürür.
 */
export async function syncUnifiedWeakSpots(): Promise<ArenaMistakeItem[]> {
  const localList = getArenaMistakes();

  // 1. Henüz backend'e aktarılamamış yerel hataları gönder
  const pendingItems = localList.filter((item) => item.pendingSync);
  if (pendingItems.length > 0) {
    await Promise.allSettled(
      pendingItems.map((item) => {
        const key = item.cardId || item.word;
        const meaning =
          item.meanings?.[0]?.translation || item.meanings?.[0]?.definition;
        return fetch(
          `${API_BASE}/api/v1/cards/${encodeURIComponent(key)}/review-result`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              is_correct: false,
              meaning:
                meaning && meaning !== item.word ? meaning : undefined,
            }),
          }
        );
      })
    );
  }

  // 2. Backend'deki güncel zayıf noktaları çek ve yerel havuzu birebir eşitle
  try {
    const res = await fetch(`${API_BASE}/api/v1/cards/weak-spots?limit=100`);
    if (res.ok) {
      const data = await res.json();
      const backendCards = Array.isArray(data?.cards) ? data.cards : [];
      const backendMistakes = backendCards
        .map(mapBackendCardToMistake)
        .filter((m: ArenaMistakeItem) => Boolean(m.word));

      // Backend'de anlamı sadece kelime olan kartlar için yerel önbellekteki Türkçe anlamı koru
      const localMeaningMap = new Map(
        localList.map((m) => [m.word.toLowerCase(), m])
      );
      const enriched = backendMistakes.map((bm: ArenaMistakeItem) => {
        const localMatch = localMeaningMap.get(bm.word.toLowerCase());
        const bmMeaning = bm.meanings?.[0]?.translation || "";
        const localMeaning = localMatch?.meanings?.[0]?.translation || "";
        if (
          (!bmMeaning || bmMeaning.toLowerCase() === bm.word.toLowerCase()) &&
          localMeaning &&
          localMeaning.toLowerCase() !== bm.word.toLowerCase()
        ) {
          return {
            ...bm,
            meanings: localMatch!.meanings,
            gameType: localMatch?.gameType || bm.gameType,
          };
        }
        return bm;
      });

      return writeMistakesStorage(enriched);
    }
  } catch (err) {
    console.warn("[ArenaMistakes] Ortak zayıf nokta senkronizasyonu başarısız, yerel önbellek kullanılıyor:", err);
  }

  return localList;
}
