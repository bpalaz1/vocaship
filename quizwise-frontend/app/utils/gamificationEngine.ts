/**
 * VocaShip Ortak Oyunlaştırma & Anti-Spam Motoru (Gamification Engine)
 * - Azalan Verim (Anti-Spam)
 * - CEFR Zorluk Çarpanı (A1-C2)
 * - Seri Kombo & Final Çarpanı
 * - Günlük Kelime Çözüm Sayacı
 */

import { API_BASE } from "../config";
import { getEquippedMuseumBuff } from "../data/museumItems";
import { pickUiText, formatUiText } from "./uiLocale";

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
 * Azalan Verim (Anti-Spam) Oranı & Temel XP Tablosu:
 * Aynı gün içinde aynı kelimenin:
 * 1. Doğru: %100 (25 XP) | 2. Doğru: %60 (15 XP) | 3. Doğru: %30 (8 XP) | 4+ Doğru: %10 (3 XP) | Yanlış: 0
 */
export function getDiminishingMultiplier(previousSolvesCount: number, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  if (previousSolvesCount <= 0) return 1.0;
  if (previousSolvesCount === 1) return 0.6;
  if (previousSolvesCount === 2) return 0.3;
  return 0.1;
}

export function getBaseXpForSolveCount(previousSolvesCount: number, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  const ratio = getDiminishingMultiplier(previousSolvesCount, true);
  return Math.max(2, Math.round(25 * ratio));
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
 * 5'li Seri (5-Card Streak Engine) Çarpanı:
 * 1–4 doğru: x1 Standart
 * 5–9 doğru: 🔥 x2 Çarpan
 * 10–14 doğru: ⚡ x3 Çarpan
 * 15+ doğru: 👑 x5 Süper Çarpan
 */
export function getStreakMultiplier(
  streak: number,
  _isFinalQuestion = false
): { multiplier: number; label: string; icon: string } {
  if (streak >= 15) {
    return { multiplier: 5.0, label: pickUiText({ tr: "x5 Süper Çarpan", en: "x5 Super Multiplier", de: "x5 Super-Multiplikator", es: "Multiplicador x5", fr: "Super multiplicateur x5", it: "Super Moltiplicatore x5", ru: "Супермножитель x5" }), icon: "👑" };
  }
  if (streak >= 10) {
    return { multiplier: 3.0, label: pickUiText({ tr: "x3 Çarpan", en: "x3 Multiplier", de: "x3 Multiplikator", es: "Multiplicador x3", fr: "Multiplicateur x3", it: "Moltiplicatore x3", ru: "Множитель x3" }), icon: "⚡" };
  }
  if (streak >= 5) {
    return { multiplier: 2.0, label: pickUiText({ tr: "x2 Çarpan", en: "x2 Multiplier", de: "x2 Multiplikator", es: "Multiplicador x2", fr: "Multiplicateur x2", it: "Moltiplicatore x2", ru: "Множитель x2" }), icon: "🔥" };
  }
  return { multiplier: 1.0, label: pickUiText({ tr: "x1 Standart", en: "x1 Standard", de: "x1 Standard", es: "x1 Estándar", fr: "x1 Standard", it: "x1 Standard", ru: "x1 Стандарт" }), icon: "" };
}

export interface FiveCardMilestoneInfo {
  isMilestone: boolean;
  bonusGold: number;
  triggerChest: boolean;
  multiplier: number;
  milestoneLabel: string;
  progressInCycle: number; // 0..5
}

/**
 * Her 5 doğru cevapta bir (5., 10., 15., 20...) çarpan ve bonus altın ödülünü hesaplar.
 */
export function getFiveCardMilestoneReward(streak: number): FiveCardMilestoneInfo {
  if (streak <= 0) {
    return {
      isMilestone: false,
      bonusGold: 0,
      triggerChest: false,
      multiplier: 1,
      milestoneLabel: "",
      progressInCycle: 0,
    };
  }

  const progressInCycle = ((streak - 1) % 5) + 1;
  const isMilestone = streak % 5 === 0;
  const { multiplier } = getStreakMultiplier(streak);

  if (!isMilestone) {
    return {
      isMilestone: false,
      bonusGold: 0,
      triggerChest: false,
      multiplier,
      milestoneLabel: "",
      progressInCycle,
    };
  }

  if (streak === 5) {
    return {
      isMilestone: true,
      bonusGold: 25,
      triggerChest: false,
      multiplier: 2,
      milestoneLabel: pickUiText({ tr: "🔥 5/5 Seri! x2 Çarpan & +25 Bonus Altın!", en: "🔥 5/5 Streak! x2 Multiplier & +25 Bonus Gold!", de: "🔥 5/5 Serie! x2 Multiplikator & +25 Bonus-Gold!", es: "🔥 ¡Racha 5/5! Multiplicador x2 y +25 Oro extra!", fr: "🔥 Série 5/5 ! Multiplicateur x2 & +25 Or bonus !", it: "🔥 Serie 5/5! Moltiplicatore x2 e +25 Oro bonus!", ru: "🔥 Серия 5/5! Множитель x2 и +25 бонусного золота!" }),
      progressInCycle: 5,
    };
  }

  if (streak === 10) {
    return {
      isMilestone: true,
      bonusGold: 50,
      triggerChest: true,
      multiplier: 3,
      milestoneLabel: pickUiText({ tr: "⚡ 10. Doğru! x3 Çarpan, +50 Bonus Altın & Sandık Bonusu!", en: "⚡ 10th Correct! x3 Multiplier, +50 Bonus Gold & Chest Bonus!", de: "⚡ 10. Richtig! x3 Multiplikator, +50 Bonus-Gold & Truhenbonus!", es: "⚡ ¡10.ª correcta! Multiplicador x3, +50 Oro extra y Cofre!", fr: "⚡ 10e bonne réponse ! Multiplicateur x3, +50 Or & Coffre !", it: "⚡ 10ª risposta esatta! Moltiplicatore x3, +50 Oro bonus e Forziere!", ru: "⚡ 10-й верный ответ! Множитель x3, +50 золота и бонусный сундук!" }),
      progressInCycle: 5,
    };
  }

  return {
    isMilestone: true,
    bonusGold: 100,
    triggerChest: true,
    multiplier: 5,
    milestoneLabel: formatUiText({ tr: "👑 {n}. Doğru! x5 Süper Çarpan & +100 Bonus Altın!", en: "👑 {n}th Correct! x5 Super Multiplier & +100 Bonus Gold!", de: "👑 {n}. Richtig! x5 Super-Multiplikator & +100 Bonus-Gold!", es: "👑 ¡{n}.ª correcta! Supermultiplicador x5 y +100 Oro extra!", fr: "👑 {n}e bonne réponse ! Super multiplicateur x5 & +100 Or !", it: "👑 {n}ª risposta esatta! Super Moltiplicatore x5 e +100 Oro bonus!", ru: "👑 {n}-й верный ответ! Супермножитель x5 и +100 бонусного золота!" }, { n: streak }),
    progressInCycle: 5,
  };
}

/**
 * Her 5 doğru seride bir (5., 10., 15., 20...) "Al veya Değiştir" Gizemli Sandık modalını tetikler.
 */
export function shouldTriggerMysteryChest(streak: number): boolean {
  return streak > 0 && streak % 5 === 0;
}

/**
 * Tek bir kelime cevabı için 5-Card Streak Engine kurallarıyla XP ve Bonus Altın hesaplar.
 * - 1, 2, 3, 4. doğrularda yalnızca standart taban XP verilir (altın = 0).
 * - Her 5 doğru kartta bir (5., 10., 15., 20.) çarpan yükselir ve +25 / +50 / +100 Bonus Altın kasaya eklenir.
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
      streakLabel: pickUiText({ tr: "x1 Standart", en: "x1 Standard", de: "x1 Standard", es: "x1 Estándar", fr: "x1 Standard", it: "x1 Standard", ru: "x1 Стандарт" }),
      streakIcon: "",
      buffMultiplier: 1.0,
      totalXP: 0,
      totalGold: 0,
      solveCountToday: previousSolves,
      isDiminished: false,
    };
  }

  // Temel XP: Özel değer verilmediyse azalan verim (%100 / %60 / %30 / %10) tablosundan alınır
  const dimRatio = getDiminishingMultiplier(previousSolves, true);
  const baseXP =
    customBaseXP !== undefined
      ? Math.max(1, Math.round(customBaseXP * dimRatio))
      : getBaseXpForSolveCount(previousSolves, true);
  const isDiminished = previousSolves >= 1;

  // Çözümü günlüğe işle
  const newSolveCount = recordDailyWordSolve(word, true);

  // Toplam XP Hesapla: Base * CEFR * 5'li Seri Çarpanı * Buff
  const totalXP = Math.round(baseXP * cefrMult * streakInfo.multiplier * buffMult);

  // Altın: SADECE her 5 doğru kartta bir (5., 10., 15., 20.) milestone bonusu olarak verilir!
  const milestone = getFiveCardMilestoneReward(streak);
  const equippedBuff = getEquippedMuseumBuff();
  const goldBuffMult = equippedBuff?.type === "bonus_gold" ? 1.15 : 1.0;
  const totalGold = milestone.isMilestone
    ? Math.max(1, Math.round(milestone.bonusGold * dimRatio * goldBuffMult))
    : 0;

  if (milestone.isMilestone && totalGold > 0) {
    awardGamificationReward(0, totalGold, milestone.milestoneLabel);
  }

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
  label?: string
): void {
  const resolvedLabel = label || pickUiText({ tr: "🎮 Arena Ödülü", en: "🎮 Arena Reward", de: "🎮 Arena-Belohnung", es: "🎮 Recompensa de Arena", fr: "🎮 Récompense d'Arène", it: "🎮 Ricompensa Arena", ru: "🎮 Награда арены" });
  if (typeof window === "undefined") return;

  if (totalXP > 0) {
    // 1. Floating XP Event
    window.dispatchEvent(
      new CustomEvent("quizwise_floating_xp", {
        detail: { amount: totalXP, label: `${resolvedLabel} (+${totalXP} XP)` },
      })
    );

    // 2. LocalStorage XP (Kullanıcı bazlı izole)
    try {
      const { readUserRewardNumber, writeUserRewardNumber } = require("./rewardsStorage");
      const curXP = readUserRewardNumber("xp", 0);
      writeUserRewardNumber("xp", curXP + totalXP);
    } catch {}

    // 3. API Sync (Arka planda sessiz)
    fetch(`${API_BASE}/api/v1/gamification/award-xp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "arena_game_reward",
        amount: totalXP,
        details: { label: resolvedLabel },
      }),
    }).catch(() => {});
  }

  if (totalGold > 0) {
    try {
      const { readUserRewardNumber, writeUserRewardNumber } = require("./rewardsStorage");
      const curGold = readUserRewardNumber("gold", 0);
      const newGold = curGold + totalGold;
      writeUserRewardNumber("gold", newGold);
      window.dispatchEvent(
        new CustomEvent("vocaship_gold_updated", { detail: { gold: newGold, added: totalGold } })
      );
    } catch {}
  }
}

