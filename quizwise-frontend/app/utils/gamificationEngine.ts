/**
 * Vocaship Ortak Oyunlaştırma & Anti-Spam Motoru (Gamification Engine)
 * - Azalan Verim (Anti-Spam)
 * - CEFR Zorluk Çarpanı (A1-C2)
 * - Seri Kombo & Final Çarpanı
 * - Günlük Kelime Çözüm Sayacı
 */

import { API_BASE } from "../config";

const DAILY_SOLVES_KEY = "vocaship_daily_word_solves";

export interface DailySolvesStorage {
  date: string; // YYYY-MM-DD
  counts: Record<string, number>;
}

export interface WordRewardResult {
  baseXP: number;
  cefrMultiplier: number;
  streakMultiplier: number;
  streakLabel: string;
  streakIcon: string;
  buffMultiplier: number;
  totalXP: number;
  totalGold: number;
  solveCountToday: number;
  isDiminished: boolean;
}

/**
 * Bugünün tarih damgasını (YYYY-MM-DD) döndürür.
 */
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Günlük kelime çözme kayıtlarını okur; gün değiştiyse temizler.
 */
export function getDailySolvesRecord(): DailySolvesStorage {
  if (typeof window === "undefined") {
    return { date: getTodayDateString(), counts: {} };
  }

  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(DAILY_SOLVES_KEY);
    if (!raw) {
      return { date: today, counts: {} };
    }
    const parsed: DailySolvesStorage = JSON.parse(raw);
    if (parsed.date !== today) {
      // Yeni gün başladı, sayaçları sıfırla
      const fresh: DailySolvesStorage = { date: today, counts: {} };
      localStorage.setItem(DAILY_SOLVES_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    return { date: today, counts: {} };
  }
}

/**
 * Belirli bir kelimenin bugün kaç kez doğru bilindiğini getirir.
 */
export function getDailyWordSolveCount(word: string): number {
  if (!word) return 0;
  const normalized = word.trim().toLowerCase();
  const record = getDailySolvesRecord();
  return record.counts[normalized] || 0;
}

/**
 * Bir kelimenin çözümünü kaydeder.
 * isCorrect === true ise gün içindeki sayacı 1 artırır ve yeni sayıyı döndürür.
 */
export function recordDailyWordSolve(word: string, isCorrect: boolean): number {
  if (typeof window === "undefined" || !word) return 0;
  if (!isCorrect) return getDailyWordSolveCount(word);

  const normalized = word.trim().toLowerCase();
  const record = getDailySolvesRecord();
  const current = record.counts[normalized] || 0;
  const next = current + 1;

  record.counts[normalized] = next;

  try {
    localStorage.setItem(DAILY_SOLVES_KEY, JSON.stringify(record));
  } catch (err) {
    console.warn("[GamificationEngine] Günlük kayıt yazılamadı:", err);
  }

  return next;
}

/**
 * Azalan Verim (Anti-Spam) Temel XP Tablosu:
 * 1. Doğru: 25 | 2. Doğru: 15 | 3. Doğru: 8 | 4+ Doğru: 2 | Yanlış: 0
 */
export function getBaseXpForSolveCount(previousSolvesCount: number, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  if (previousSolvesCount <= 0) return 25;
  if (previousSolvesCount === 1) return 15;
  if (previousSolvesCount === 2) return 8;
  return 2;
}

/**
 * CEFR Zorluk Katsayısı:
 * A1 (x1.0), A2 (x1.1), B1 (x1.25), B2 (x1.4), C1 (x1.6), C2 (x1.8)
 */
export function getCefrMultiplier(level?: string): number {
  if (!level) return 1.0;
  const clean = level.trim().toUpperCase();
  switch (clean) {
    case "A1":
      return 1.0;
    case "A2":
      return 1.1;
    case "B1":
      return 1.25;
    case "B2":
      return 1.4;
    case "C1":
      return 1.6;
    case "C2":
      return 1.8;
    default:
      return 1.0;
  }
}

/**
 * Seri Kombo Çarpanı:
 * 3–5 doğru: 🔥 x2 Çarpan
 * 6–9 doğru: ⚡ x3 Çarpan
 * 10+ doğru veya Final sorusu: 👑 x5 Süper Final Çarpanı
 */
export function getStreakMultiplier(
  streak: number,
  isFinalQuestion = false
): { multiplier: number; label: string; icon: string } {
  if (isFinalQuestion || streak >= 10) {
    return { multiplier: 5.0, label: "x5 Süper Final Çarpanı", icon: "👑" };
  }
  if (streak >= 6) {
    return { multiplier: 3.0, label: "x3 Çarpan", icon: "⚡" };
  }
  if (streak >= 3) {
    return { multiplier: 2.0, label: "x2 Çarpan", icon: "🔥" };
  }
  return { multiplier: 1.0, label: "x1 Standart", icon: "" };
}

/**
 * Her 3 doğru seride bir Gizemli Sandık modalının tetiklenip tetiklenmeyeceğini denetler.
 */
export function shouldTriggerMysteryChest(streak: number): boolean {
  return streak > 0 && streak % 3 === 0;
}

/**
 * Tek bir kelime cevabı için tüm formülleri (Azalan Verim, CEFR, Seri Kombo ve Aktif Buff)
 * harmanlayarak kazanılacak XP ve Altın miktarını hesaplar.
 */
export function calculateWordReward(options: {
  word: string;
  level?: string;
  streak: number;
  isCorrect: boolean;
  isFinalQuestion?: boolean;
  activeBuffMultiplier?: number;
  customBaseXP?: number;
}): WordRewardResult {
  const {
    word,
    level,
    streak,
    isCorrect,
    isFinalQuestion = false,
    activeBuffMultiplier = 1.0,
    customBaseXP,
  } = options;

  const previousSolves = getDailyWordSolveCount(word);
  const cefrMult = getCefrMultiplier(level);
  const streakInfo = getStreakMultiplier(streak, isFinalQuestion);
  const buffMult = Math.max(1.0, activeBuffMultiplier);

  if (!isCorrect) {
    return {
      baseXP: 0,
      cefrMultiplier: cefrMult,
      streakMultiplier: 1.0,
      streakLabel: "",
      streakIcon: "",
      buffMultiplier: buffMult,
      totalXP: 0,
      totalGold: 0,
      solveCountToday: previousSolves,
      isDiminished: false,
    };
  }

  // Temel XP: Özel değer verilmediyse azalan verim tablosundan alınır
  const baseXP = customBaseXP !== undefined ? customBaseXP : getBaseXpForSolveCount(previousSolves, true);
  const isDiminished = previousSolves >= 2;

  // Çözümü günlüğe işle
  const newSolveCount = recordDailyWordSolve(word, true);

  // Toplam XP Hesapla: Base * CEFR * Streak * Buff
  const totalXP = Math.round(baseXP * cefrMult * streakInfo.multiplier * buffMult);

  // Toplam Altın Hesapla: Orantılı pozitif altın (en az 1, tabanın ~%40'ı ile çarpanlar)
  const totalGold = Math.max(1, Math.round(totalXP * 0.4));

  return {
    baseXP,
    cefrMultiplier: cefrMult,
    streakMultiplier: streakInfo.multiplier,
    streakLabel: streakInfo.label,
    streakIcon: streakInfo.icon,
    buffMultiplier: buffMult,
    totalXP,
    totalGold,
    solveCountToday: newSolveCount,
    isDiminished,
  };
}

/**
 * Oyuncuya XP ve Altın teslim eder, yerel hafızaya kaydeder ve
 * arayüzdeki animasyonlu bildirimleri (floating XP, gold event) tetikler.
 */
export function awardGamificationReward(
  totalXP: number,
  totalGold: number,
  label = "🎮 Arena Ödülü"
): void {
  if (typeof window === "undefined") return;

  if (totalXP > 0) {
    // 1. Floating XP Event
    window.dispatchEvent(
      new CustomEvent("quizwise_floating_xp", {
        detail: { amount: totalXP, label: `${label} (+${totalXP} XP)` },
      })
    );

    // 2. LocalStorage XP
    try {
      const curXP = parseInt(localStorage.getItem("vocaship_xp") || "450", 10);
      localStorage.setItem("vocaship_xp", String(curXP + totalXP));
    } catch {}

    // 3. API Sync (Arka planda sessiz)
    fetch(`${API_BASE}/api/v1/gamification/award-xp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "arena_game_reward",
        amount: totalXP,
        details: { label },
      }),
    }).catch(() => {});
  }

  if (totalGold > 0) {
    try {
      const curGold = parseInt(localStorage.getItem("vocaship_gold") || "240", 10);
      const newGold = curGold + totalGold;
      localStorage.setItem("vocaship_gold", String(newGold));
      window.dispatchEvent(
        new CustomEvent("vocaship_gold_updated", { detail: { gold: newGold, added: totalGold } })
      );
    } catch {}
  }
}

