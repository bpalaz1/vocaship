"use client";

const LEGACY_REWARD_KEYS = [
  "vocaship_gold",
  "vocaship_xp",
  "vocaship_streak",
  "vocaship_unified_stats",
  "vocaship_learned_words_count",
  "vocaship_learned_words",
  "vocaship_unlocked_chest_items",
  "vocaship_unlocked_museum_items",
  "vocaship_claimed_honeycomb_tiers",
  "vocaship_selected_avatar_id",
  "vocaship_equipped_buff",
];

const MIGRATION_FLAG_KEY = "vocaship_rewards_user_scoped_v1";

/**
 * Aktif oturumdaki kullanıcı ID'sini döndürür; oturum yoksa "guest" döner.
 */
export function getRewardsUserId(): string {
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
 * Eski ortak test önbelleklerini tek seferlik temizler.
 */
export function clearLegacyGlobalRewardCaches(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(MIGRATION_FLAG_KEY) === "true") return;
    for (const k of LEGACY_REWARD_KEYS) {
      localStorage.removeItem(k);
    }
    localStorage.setItem(MIGRATION_FLAG_KEY, "true");
  } catch {}
}

export function getUserRewardsStorageKey(suffix: string): string {
  clearLegacyGlobalRewardCaches();
  return `vocaship_rewards_${getRewardsUserId()}_${suffix}`;
}

export function readUserRewardNumber(suffix: string, fallback = 0): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(getUserRewardsStorageKey(suffix));
    if (raw === null) return fallback;
    const val = parseInt(raw, 10);
    return Number.isNaN(val) ? fallback : val;
  } catch {
    return fallback;
  }
}

export function writeUserRewardNumber(suffix: string, value: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getUserRewardsStorageKey(suffix), String(value));
  } catch {}
}

export function readUserRewardJson<T>(suffix: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(getUserRewardsStorageKey(suffix));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeUserRewardJson<T>(suffix: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getUserRewardsStorageKey(suffix), JSON.stringify(value));
  } catch {}
}
