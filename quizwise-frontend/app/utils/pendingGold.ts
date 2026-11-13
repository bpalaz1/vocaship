/**
 * Sessiz Altın Köprüsü (Silent Gold Bridge)
 * Okuma Odası ve Speaking Lounge aktivitelerinden kazanılan altınları arka planda
 * sessizce biriktirip /games sayfasına girildiğinde toplu teslim eden modül.
 */

export type GoldSource = 'reading' | 'ai_story' | 'speaking';

export interface PendingGoldData {
  total: number;
  breakdown: Record<GoldSource | string, number>;
}

const STORAGE_KEY = "vocaship_pending_arena_gold";

/**
 * Sessizce bekleyen altın miktarını artırır (ekrana popup veya ses basmaz).
 */
export function addPendingGold(amount: number, source: GoldSource): void {
  if (typeof window === "undefined" || amount <= 0) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let data: PendingGoldData = { total: 0, breakdown: {} };

    if (raw) {
      try {
        data = JSON.parse(raw);
        if (!data.breakdown) data.breakdown = {};
      } catch {
        data = { total: 0, breakdown: {} };
      }
    }

    data.total = (data.total || 0) + amount;
    data.breakdown[source] = (data.breakdown[source] || 0) + amount;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.debug("[PendingGold] Altın eklenemedi:", err);
  }
}

/**
 * Birikmiş altın miktarını okur, bekleyen havuzu sıfırlar ve teslim edilecek paketi döner.
 */
export function claimPendingGold(): { total: number; breakdown: Record<string, number> } {
  if (typeof window === "undefined") return { total: 0, breakdown: {} };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { total: 0, breakdown: {} };

    const data: PendingGoldData = JSON.parse(raw);
    const total = data.total || 0;
    const breakdown = data.breakdown || {};

    // Havuzu sıfırla
    localStorage.removeItem(STORAGE_KEY);

    return { total, breakdown };
  } catch (err) {
    console.debug("[PendingGold] Altın teslim alınamadı:", err);
    return { total: 0, breakdown: {} };
  }
}

/**
 * Bekleyen altın miktarını sıfırlamadan sadece görüntüler.
 */
export function peekPendingGold(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const data: PendingGoldData = JSON.parse(raw);
    return data.total || 0;
  } catch {
    return 0;
  }
}

