export const GUEST_MAX_WORDS = 10;
const GUEST_WORD_COUNT_KEY = "vocaship_guest_added_words";

export function getGuestAddedWordCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GUEST_WORD_COUNT_KEY);
    const parsed = parseInt(raw || "0", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function incrementGuestAddedWordCount(): number {
  if (typeof window === "undefined") return 0;
  const next = getGuestAddedWordCount() + 1;
  try {
    localStorage.setItem(GUEST_WORD_COUNT_KEY, String(next));
  } catch {}
  return next;
}
