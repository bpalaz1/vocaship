import { API_BASE } from "../config";
import { pickUiText } from "./uiLocale";

export const ACTIVE_DECK_STORAGE_KEY = "vocaship_selected_deck_id";
export const DECKS_CACHE_STORAGE_KEY = "vocaship_decks_cache";
export const FOLDERS_CACHE_STORAGE_KEY = "vocaship_folders_cache";
export const FOLDER_ORDER_STORAGE_KEY = "vorego_folder_order";
export const FOLDER_HIERARCHY_STORAGE_KEY = "vorego_folder_hierarchy";
export const LIBRARY_VIEW_STORAGE_KEY = "vorego_library_view";
export const ACTIVE_DECK_EVENT = "vocaship_active_deck_changed";

export interface FolderItem {
  id: string;
  name: string;
  color?: string;
  parent_id?: string | null;
  deck_count?: number;
}

export interface DeckItem {
  id: string;
  title: string;
  description?: string;
  card_count?: number;
  folder_id?: string | null;
  target_lang?: string;
  native_lang?: string;
}

export function normalizeFolderId(folderId: unknown): string | null {
  if (folderId === null || folderId === undefined) return null;
  const trimmed = String(folderId).trim();
  if (!trimmed || trimmed === "null" || trimmed === "none" || trimmed === "undefined") {
    return null;
  }
  return trimmed;
}

export interface GameWordPair {
  id?: string;
  word: string;
  meaning: string;
  phonetic?: string;
  clue?: string;
}

export interface FlashcardItem {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{ definition: string; translation: string }>;
  example_sentences?: Array<{ en: string; tr?: string }>;
}

export const PRESET_DECKS: DeckItem[] = [];

export const PRESET_CARDS: Record<string, GameWordPair[]> = {};

export const DEFAULT_GAME_WORDS: GameWordPair[] = [];

/**
 * Aktif seçili deste kimliğini döndürür
 */
export function getActiveDeckId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(ACTIVE_DECK_STORAGE_KEY);
    if (stored && stored.trim() !== "") return stored.trim();
  } catch {}
  return null;
}

/**
 * Aktif çalışma destesini kaydeder ve tüm sekmelere / sayfalara duyurur
 */
export function setActiveDeckId(deckId: string): void {
  if (typeof window === "undefined" || !deckId) return;
  try {
    localStorage.setItem(ACTIVE_DECK_STORAGE_KEY, deckId);
    // Aynı sekmedeki dinleyiciler için CustomEvent
    window.dispatchEvent(
      new CustomEvent(ACTIVE_DECK_EVENT, { detail: { deckId } })
    );
  } catch (err) {
    console.warn("Deste kimliği kaydedilemedi:", err);
  }
}

/**
 * Aktif desteyi dinlemek için abone olur (Aynı sekme CustomEvent + Başka sekme StorageEvent)
 */
export function subscribeToActiveDeck(callback: (deckId: string) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{ deckId: string }>;
    if (customEvent.detail && customEvent.detail.deckId) {
      callback(customEvent.detail.deckId);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === ACTIVE_DECK_STORAGE_KEY && e.newValue) {
      callback(e.newValue);
    }
  };

  window.addEventListener(ACTIVE_DECK_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(ACTIVE_DECK_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

export function sortFoldersBySavedOrder(folders: FolderItem[]): FolderItem[] {
  if (typeof window === "undefined" || folders.length === 0) return folders;
  try {
    const rawOrder = localStorage.getItem(FOLDER_ORDER_STORAGE_KEY);
    if (!rawOrder) return folders;
    const savedOrder: string[] = JSON.parse(rawOrder);
    if (!Array.isArray(savedOrder) || savedOrder.length === 0) return folders;
    const orderMap = new Map(savedOrder.map((id, idx) => [String(id).trim(), idx]));
    return [...folders].sort((a, b) => {
      const posA = orderMap.has(String(a.id).trim())
        ? orderMap.get(String(a.id).trim())!
        : 999999;
      const posB = orderMap.has(String(b.id).trim())
        ? orderMap.get(String(b.id).trim())!
        : 999999;
      return posA - posB;
    });
  } catch {
    return folders;
  }
}

export function getFolderHierarchyMap(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FOLDER_HIERARCHY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setFolderParentInHierarchy(
  folderId: string,
  parentId: string | null
): void {
  if (typeof window === "undefined" || !folderId) return;
  try {
    const map = getFolderHierarchyMap();
    const cleanId = String(folderId).trim();
    const cleanParent = normalizeFolderId(parentId);
    if (cleanParent) {
      map[cleanId] = cleanParent;
    } else {
      delete map[cleanId];
    }
    localStorage.setItem(FOLDER_HIERARCHY_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function removeFolderFromHierarchy(folderId: string): void {
  if (typeof window === "undefined" || !folderId) return;
  try {
    const map = getFolderHierarchyMap();
    const cleanId = String(folderId).trim();
    const formerParent = map[cleanId] || null;
    delete map[cleanId];
    for (const key of Object.keys(map)) {
      if (map[key] === cleanId) {
        if (formerParent) map[key] = formerParent;
        else delete map[key];
      }
    }
    localStorage.setItem(FOLDER_HIERARCHY_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function wouldCreateFolderCycle(
  folders: FolderItem[],
  movingFolderId: string,
  candidateParentId: string | null
): boolean {
  const cleanMoving = String(movingFolderId || "").trim();
  let cur = normalizeFolderId(candidateParentId);
  if (!cur) return false;
  const parentLookup = new Map<string, string | null>();
  for (const f of folders) {
    parentLookup.set(String(f.id || "").trim(), normalizeFolderId(f.parent_id));
  }
  const visited = new Set<string>();
  while (cur) {
    if (cur === cleanMoving) return true;
    if (visited.has(cur)) return true;
    visited.add(cur);
    cur = parentLookup.get(cur) || null;
  }
  return false;
}

function getScopedUserContext(): { userId: string; token: string | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const rawUser = localStorage.getItem("vorego_auth_user");
    const token =
      localStorage.getItem("vocaship_token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("vorego_auth_token") ||
      localStorage.getItem("token");
    if (!rawUser) return null;
    const parsed = JSON.parse(rawUser);
    if (!parsed?.id) return null;
    return { userId: String(parsed.id), token };
  } catch {
    return null;
  }
}

function clearLegacyShowcaseCaches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DECKS_CACHE_STORAGE_KEY);
    localStorage.removeItem(FOLDERS_CACHE_STORAGE_KEY);
    localStorage.removeItem("cached_decks");
    localStorage.removeItem("vocaship_decks");
    localStorage.removeItem("quizwise_decks");
    localStorage.removeItem("vocaship_offline_decks");
    localStorage.removeItem("vocaship_deck_cards_guest_deck_daily");
    localStorage.removeItem("vocaship_deck_cards_guest_deck_business");
    localStorage.removeItem("vocaship_deck_cards_preset_core3000");
    localStorage.removeItem("vocaship_deck_cards_preset_adv5000");
    localStorage.removeItem("vocaship_deck_cards_preset_c1_pro");
    localStorage.removeItem("vocaship_deck_cards_preset_academic_pack");
  } catch {}
}

/**
 * Kullanıcının klasörlerini backend'den çeker, kullanıcıya özel localStorage anahtarına önbelleğe alır
 */
export async function fetchFoldersList(): Promise<FolderItem[]> {
  clearLegacyShowcaseCaches();
  const authCtx = getScopedUserContext();
  if (!authCtx) {
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const hierarchy = getFolderHierarchyMap();
  const scopedCacheKey = `${FOLDERS_CACHE_STORAGE_KEY}_${authCtx.userId}`;

  try {
    const headers: Record<string, string> = {};
    if (authCtx.token) {
      headers["Authorization"] = `Bearer ${authCtx.token}`;
    }
    const res = await fetch(
      `${API_BASE}/api/v1/folders?user_id=${encodeURIComponent(authCtx.userId)}`,
      {
        headers,
        signal: controller.signal,
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: FolderItem[] = data
          .filter((f: any) => !String(f.id || "").startsWith("guest_"))
          .map((f: any) => {
            const id = String(f.id || "").trim();
            const parentId =
              normalizeFolderId(f.parent_id) ?? normalizeFolderId(hierarchy[id]);
            return {
              id,
              name: String(
                f.name ||
                  pickUiText({
                    tr: "Klasör",
                    en: "Folder",
                    de: "Ordner",
                    es: "Carpeta",
                    fr: "Dossier",
                  })
              ),
              color: f.color || "#f59e0b",
              parent_id: parentId === id ? null : parentId,
              deck_count:
                typeof f.deck_count === "number" ? f.deck_count : undefined,
            };
          });
        const normalized = sortFoldersBySavedOrder(mapped);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(scopedCacheKey, JSON.stringify(normalized));
          } catch {}
        }
        return normalized;
      }
    }
  } catch (err) {
    console.warn("fetchFoldersList network/timeout fallback:", err);
  } finally {
    clearTimeout(timeoutId);
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(scopedCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return sortFoldersBySavedOrder(
            parsed
              .filter((f: any) => !String(f.id || "").startsWith("guest_"))
              .map((f: any) => {
                const id = String(f.id || "").trim();
                const parentId =
                  normalizeFolderId(f.parent_id) ??
                  normalizeFolderId(hierarchy[id]);
                return {
                  ...f,
                  id,
                  parent_id: parentId === id ? null : parentId,
                };
              })
          );
        }
      }
    } catch {}
  }

  return [];
}

/**
 * Kullanıcının destelerini backend'den çeker, kullanıcıya özel localStorage anahtarına önbelleğe alır
 */
export async function fetchDecksList(): Promise<DeckItem[]> {
  clearLegacyShowcaseCaches();
  const authCtx = getScopedUserContext();
  if (!authCtx) {
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const scopedCacheKey = `${DECKS_CACHE_STORAGE_KEY}_${authCtx.userId}`;
  try {
    const url = `${API_BASE}/api/v1/decks?user_id=${encodeURIComponent(authCtx.userId)}`;
    const headers: Record<string, string> = {};
    if (authCtx.token) {
      headers["Authorization"] = `Bearer ${authCtx.token}`;
    }

    const res = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalizedBackend: DeckItem[] = data
          .filter(
            (d: any) =>
              !String(d.id || "").startsWith("preset_") &&
              !String(d.id || "").startsWith("guest_")
          )
          .map((d: any) => ({
            ...d,
            id: String(d.id || "").trim(),
            title: String(
              d.title ||
                pickUiText({
                  tr: "İsimsiz Deste",
                  en: "Untitled Deck",
                  de: "Unbenanntes Deck",
                  es: "Mazo sin título",
                  fr: "Paquet sans titre",
                })
            ),
            description: d.description || "",
            card_count: typeof d.card_count === "number" ? d.card_count : 0,
            folder_id: normalizeFolderId(d.folder_id),
          }));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              scopedCacheKey,
              JSON.stringify(normalizedBackend)
            );
          } catch {}
        }
        return normalizedBackend;
      }
    }
  } catch (err) {
    console.warn("fetchDecksList network/timeout fallback:", err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Kullanıcıya özel önbelleği dene (otomatik preset/vitrin seed devre dışı)
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(scopedCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(
              (d: any) =>
                !String(d.id || "").startsWith("preset_") &&
                !String(d.id || "").startsWith("guest_")
            )
            .map((d: any) => ({
              ...d,
              folder_id: normalizeFolderId(d.folder_id),
            }));
        }
      }
    } catch {}
  }

  return [];
}

/**
 * Ham kart dizisini standart GameWordPair[] dizisine dönüştürür
 */
function normalizeRawCards(cards: any[]): GameWordPair[] {
  return cards
    .map((c: any) => {
      let meaning = "";
      if (c.meanings && Array.isArray(c.meanings) && c.meanings.length > 0) {
        const first = c.meanings[0];
        meaning =
          typeof first === "string"
            ? first
            : first.meaning || first.translation || first.definition || "";
      } else if (c.turkish_meaning) {
        meaning = c.turkish_meaning;
      } else if (c.meaning) {
        meaning = c.meaning;
      } else if (c.definition) {
        meaning = c.definition;
      }

      return {
        id: c.id ? String(c.id) : undefined,
        word: String(c.word || "").trim(),
        meaning: String(meaning || "").trim(),
        phonetic: c.phonetic,
        clue: c.clue || c.hint || (c.example_sentences && c.example_sentences[0]?.en),
      };
    })
    .filter((item) => item.word && item.meaning);
}

/**
 * Verilen deste ID'sine (veya aktif desteye) ait gerçek kartları döndürür.
 * allowFallback === false iken sabit DEFAULT_GAME_WORDS (mitigate, contingency...) listesine ASLA düşmez.
 */
export async function getActiveDeckCards(
  deckId?: string,
  allowFallback: boolean = false
): Promise<GameWordPair[]> {
  const targetId = deckId || getActiveDeckId();
  if (!targetId || targetId.startsWith("preset_") || targetId.startsWith("guest_")) {
    return [];
  }

  // Backend'den kartları çek (15sn timeout korumalı)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_BASE}/api/v1/decks/${encodeURIComponent(targetId)}/cards`, {
      signal: controller.signal,
    });
    if (res.ok) {
      const cards = await res.json();
      if (Array.isArray(cards)) {
        const normalized = normalizeRawCards(cards);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              `vocaship_deck_cards_${targetId}`,
              JSON.stringify(normalized)
            );
          } catch {}
        }
        return normalized;
      }
    }
  } catch (err) {
    console.warn(`Deck ${targetId} kartları backend'den alınamadı:`, err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Yerel önbellekte bu destenin kartları varsa onu döndür
  if (typeof window !== "undefined") {
    try {
      const cachedCards = localStorage.getItem(`vocaship_deck_cards_${targetId}`);
      if (cachedCards) {
        const parsed = JSON.parse(cachedCards);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
  }

  return allowFallback ? DEFAULT_GAME_WORDS : [];
}

/**
 * Standart GameWordPair listesini GoldQuestGame için FlashcardItem formatına dönüştürür
 */
export function toFlashcardItems(cards: GameWordPair[]): FlashcardItem[] {
  return cards.map((c, i) => ({
    id: c.id || `card_${i}_${c.word}`,
    word: c.word,
    phonetic: c.phonetic,
    meanings: [{ definition: c.meaning, translation: c.meaning }],
    example_sentences: [{ en: `Example sentence using "${c.word}".` }],
  }));
}

