"use client";

const READING_MIGRATION_FLAG_KEY = "vocaship_reading_user_scoped_v1";

/**
 * Aktif kullanıcının ID'sini döndürür; oturum yoksa "guest" döner.
 */
export function getReadingScopeId(explicitUserId?: string | null): string {
  const cleanExplicit = (explicitUserId || "").trim();
  if (cleanExplicit) return cleanExplicit;
  if (typeof window === "undefined") return "guest";
  try {
    const rawUser = localStorage.getItem("vorego_auth_user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && parsed.id) {
        return String(parsed.id);
      }
    }
  } catch {}
  return "guest";
}

/**
 * Kullanıcı kimliği içermeyen eski ortak okuma geçmişi ve hikaye önbelleklerini tek seferlik temizler.
 */
export function clearLegacyGlobalReadingCaches(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(READING_MIGRATION_FLAG_KEY) === "true") return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith("quizwise_progress_") ||
          k === "vocaship_user_stories" ||
          k === "completed_stories" ||
          k === "quizwise_reading_progress" ||
          k === "vocaship_rewarded_stories")
      ) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }
    localStorage.setItem(READING_MIGRATION_FLAG_KEY, "true");
  } catch {}
}

export function getReadingProgressPrefix(explicitUserId?: string | null): string {
  clearLegacyGlobalReadingCaches();
  return `vocaship_progress_${getReadingScopeId(explicitUserId)}_`;
}

export function getReadingProgressKey(
  storyKey: string,
  explicitUserId?: string | null
): string {
  return `${getReadingProgressPrefix(explicitUserId)}${storyKey}`;
}

export function getUserStoriesStorageKey(explicitUserId?: string | null): string {
  clearLegacyGlobalReadingCaches();
  return `vocaship_user_stories_${getReadingScopeId(explicitUserId)}`;
}
