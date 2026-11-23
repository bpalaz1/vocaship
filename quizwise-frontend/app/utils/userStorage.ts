"use client";

const LEGACY_SHARED_KEYS = [
  "vocaship_due_words",
  "quizwise_due_words",
  "completed_stories",
  "vocaship_user_stories",
  "vocaship_gold",
  "vocaship_xp",
  "vocaship_streak",
  "vocaship_speaking_archives",
  "vocaship_speaking_archive",
  "vocaship_active_deck",
  "vocaship_gold_quest_best",
  "quizwise_reading_progress",
  "vocaship_rewarded_stories",
  "cached_decks",
  "vocaship_decks",
  "quizwise_decks",
  "vocaship_offline_decks",
];

/**
 * Aktif kullanıcı ID'sini döndürür (parametre veya localStorage üzerinden).
 */
export function resolveActiveUserId(explicitUserId?: string | null): string | null {
  const clean = (explicitUserId || "").trim();
  if (clean) return clean;
  if (typeof window === "undefined") return null;
  try {
    const rawUser = localStorage.getItem("vorego_auth_user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return String(parsed.id).trim();
    }
  } catch {}
  return null;
}

/**
 * Verilen temel anahtar için kullanıcıya izole edilmiş depolama anahtarı üretir.
 * - Giriş yapılmışsa: `${baseKey}_user_${userId}`
 * - Misafir modundaysa: `${baseKey}_guest`
 */
export function getScopedKey(baseKey: string, userId?: string | null): string {
  const uid = resolveActiveUserId(userId);
  return uid ? `${baseKey}_user_${uid}` : `${baseKey}_guest`;
}

/**
 * Kullanıcı kimliği içermeyen eski ortak localStorage anahtarlarını temizler
 * ve arayüz bileşenlerinin yeni kullanıcı verisiyle senkronize olmasını tetikler.
 */
export function clearLegacySharedCaches(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [...LEGACY_SHARED_KEYS];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith("quizwise_progress_") ||
          k.startsWith("vocaship_deck_cards_preset_"))
      ) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }
    window.dispatchEvent(new CustomEvent("vocaship_session_changed"));
    window.dispatchEvent(new CustomEvent("vocaship_active_deck_changed"));
  } catch {}
}
