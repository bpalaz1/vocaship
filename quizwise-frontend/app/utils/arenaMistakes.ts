/**
 * Vocaship Oyun Arenası Hata Takip ve Hatırlatma Destesi Yardımcısı
 * Oyunlarda (Quiz, Match, Boss Fight, Gravity, Gold Quest) yanlış yapılan kelimeleri
 * localStorage ('vocaship_arena_mistakes') üzerinde kalıcı olarak saklar.
 */

export interface ArenaMistakeItem {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{ definition: string; translation: string; part_of_speech?: string }>;
  example_sentences: Array<{ en?: string; tr?: string; target?: string; source?: string; native?: string }>;
  timestamp: number;
  gameType?: string;
}

const STORAGE_KEY = "vocaship_arena_mistakes";

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

    // Aynı kelime var mı kontrol et (küçük/büyük harf duyarsız)
    const existingIndex = currentList.findIndex(
      (m) => m.word.toLowerCase() === cleanWord.toLowerCase()
    );

    let updatedList: ArenaMistakeItem[];

    if (existingIndex >= 0) {
      // Varsa en başa taşı ve güncelle
      const existing = currentList[existingIndex];
      const updatedItem: ArenaMistakeItem = {
        ...existing,
        meanings: [
          {
            definition: meaningText,
            translation: meaningText,
            part_of_speech: existing.meanings?.[0]?.part_of_speech || "general",
          },
        ],
        timestamp: Date.now(),
        gameType: item.gameType || existing.gameType || "arena",
      };
      updatedList = [updatedItem, ...currentList.filter((_, idx) => idx !== existingIndex)];
    } else {
      // Yeni hata kartı oluştur (Flashcard arayüzüyle tam uyumlu)
      const newItem: ArenaMistakeItem = {
        id: `mistake_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
      };
      updatedList = [newItem, ...currentList];
    }

    // Maksimum 100 kelime sakla
    if (updatedList.length > 100) {
      updatedList = updatedList.slice(0, 100);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Ekranların anında güncellenmesi için custom event tetikle
    window.dispatchEvent(
      new CustomEvent("vocaship:arena_mistakes_updated", {
        detail: { mistakes: updatedList, count: updatedList.length },
      })
    );
  } catch (e) {
    console.warn("[ArenaMistakes] Hata kaydedilemedi:", e);
  }
}

export function clearArenaMistakes(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("vocaship:arena_mistakes_updated", {
        detail: { mistakes: [], count: 0 },
      })
    );
  } catch (e) {
    console.warn("[ArenaMistakes] Hatalar temizlenemedi:", e);
  }
}

export function removeArenaMistake(wordOrId: string): void {
  if (typeof window === "undefined" || !wordOrId) return;
  try {
    const currentList = getArenaMistakes();
    const updated = currentList.filter(
      (m) => m.id !== wordOrId && m.word.toLowerCase() !== wordOrId.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("vocaship:arena_mistakes_updated", {
        detail: { mistakes: updated, count: updated.length },
      })
    );
  } catch (e) {
    console.warn("[ArenaMistakes] Hata kartı silinemedi:", e);
  }
}

