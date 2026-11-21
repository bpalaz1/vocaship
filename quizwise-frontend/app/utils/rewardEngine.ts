/**
 * Bütünleşik Altın & Başarı Algoritması (Unified Reward Engine)
 * SM-2 Kelime İlerlemesi, Oyun Arenası, Okuma Odası ve Speaking Lounge
 * modüllerinin tamamını tek altın kasası ve başarı sayacında toplar.
 */

import { API_BASE } from "../config";
import { addPendingGold, claimPendingGold } from "./pendingGold";
import { pickUiText, formatUiText } from "./uiLocale";

export interface UnifiedAchievementStats {
  sm2LearnedWords: number;
  arenaVictories: number;
  arenaBestStreak: number;
  readingCompletedStories: number;
  speakingCompletedSessions: number;
}

const STATS_STORAGE_KEY = "vocaship_unified_stats";
const SM2_DAILY_CARDS_PREFIX = "vocaship_sm2_daily_cards_";
const COMPLETED_STORIES_KEY = "vocaship_rewarded_stories";

function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function getUnifiedAchievementStats(): UnifiedAchievementStats {
  const defaults: UnifiedAchievementStats = {
    sm2LearnedWords: 145,
    arenaVictories: 0,
    arenaBestStreak: 0,
    readingCompletedStories: 0,
    speakingCompletedSessions: 0,
  };
  if (typeof window === "undefined") return defaults;

  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const learnedFallback = parseInt(
      localStorage.getItem("vocaship_learned_words_count") ||
        localStorage.getItem("vocaship_learned_words") ||
        "145",
      10
    );

    return {
      sm2LearnedWords:
        typeof parsed.sm2LearnedWords === "number"
          ? parsed.sm2LearnedWords
          : isNaN(learnedFallback)
          ? 145
          : learnedFallback,
      arenaVictories: Number(parsed.arenaVictories) || 0,
      arenaBestStreak: Number(parsed.arenaBestStreak) || 0,
      readingCompletedStories: Number(parsed.readingCompletedStories) || 0,
      speakingCompletedSessions: Number(parsed.speakingCompletedSessions) || 0,
    };
  } catch {
    return defaults;
  }
}

function saveUnifiedStats(updater: (prev: UnifiedAchievementStats) => UnifiedAchievementStats): UnifiedAchievementStats {
  const prev = getUnifiedAchievementStats();
  const next = updater(prev);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem("vocaship_learned_words_count", String(next.sm2LearnedWords));
      localStorage.setItem("vocaship_learned_words", String(next.sm2LearnedWords));
      window.dispatchEvent(
        new CustomEvent("vocaship_unified_stats_updated", { detail: next })
      );
    } catch {}
  }
  return next;
}

/**
 * CEFR Katsayısı (A1-A2: x1.0, B1-B2: x1.3, C1-C2: x1.6)
 */
export function getUnifiedCefrMultiplier(level?: string): number {
  const clean = (level || "B1").trim().toUpperCase();
  if (clean.startsWith("A")) return 1.0;
  if (clean.startsWith("C")) return 1.6;
  return 1.3;
}

/**
 * Backend ile altın/XP kazanımını sessiz senkronize eder.
 */
function syncRewardToBackend(goldAmount: number, action: string, label: string): void {
  if (typeof window === "undefined" || goldAmount <= 0) return;
  try {
    fetch(`${API_BASE}/api/v1/gamification/award-xp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        amount: goldAmount,
        details: { gold: goldAmount, label },
      }),
    }).catch(() => {});
  } catch {}
}

/**
 * 1. SM-2 Kelime İlerlemesi:
 * - Yeni öğrenilen / vadesi gelip doğru bilinen kart: +15 Altın * CEFR Katsayısı (1.0 / 1.3 / 1.6)
 * - Aynı gün içinde aynı kartı tekrar çözmede 0 Altın (Anti-Spam)
 */
export function rewardSm2CardMastery(
  cardId: string,
  word: string,
  level?: string
): { goldEarned: number; alreadySolvedToday: boolean } {
  if (typeof window === "undefined" || !cardId) {
    return { goldEarned: 0, alreadySolvedToday: false };
  }

  const todayKey = `${SM2_DAILY_CARDS_PREFIX}${getTodayDateStr()}`;
  const normalizedKey = String(cardId).trim().toLowerCase();

  try {
    const raw = localStorage.getItem(todayKey);
    const solvedToday: string[] = raw ? JSON.parse(raw) : [];
    if (Array.isArray(solvedToday) && solvedToday.includes(normalizedKey)) {
      return { goldEarned: 0, alreadySolvedToday: true };
    }

    const updatedSolved = [...(Array.isArray(solvedToday) ? solvedToday : []), normalizedKey];
    localStorage.setItem(todayKey, JSON.stringify(updatedSolved));
  } catch {}

  const cefrMult = getUnifiedCefrMultiplier(level);
  const goldEarned = Math.round(15 * cefrMult);

  addPendingGold(goldEarned, "sm2");
  saveUnifiedStats((prev) => ({
    ...prev,
    sm2LearnedWords: prev.sm2LearnedWords + 1,
  }));
  syncRewardToBackend(goldEarned, "sm2_card_mastery", `SM-2 Kart: ${word}`);

  return { goldEarned, alreadySolvedToday: false };
}

/**
 * 2. Oyun Arenası Zaferi & En Yüksek Seri Kaydı
 */
export function recordArenaSessionResult(bestStreakInGame: number, isVictory: boolean = true): void {
  saveUnifiedStats((prev) => ({
    ...prev,
    arenaVictories: isVictory ? prev.arenaVictories + 1 : prev.arenaVictories,
    arenaBestStreak: Math.max(prev.arenaBestStreak, bestStreakInGame || 0),
  }));
}

/**
 * 3. Okuma Odası (Sessiz Birikim):
 * - Hikaye bitirme: +40 Altın
 * - Doğru anlama sorusu: +10 Altın
 * - Metinden kelime ekleme: +5 Altın
 */
export function rewardReadingStoryComplete(storyKey: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(COMPLETED_STORIES_KEY);
    const completed: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(completed) || !completed.includes(storyKey)) {
      localStorage.setItem(
        COMPLETED_STORIES_KEY,
        JSON.stringify([...(Array.isArray(completed) ? completed : []), storyKey])
      );
      saveUnifiedStats((prev) => ({
        ...prev,
        readingCompletedStories: prev.readingCompletedStories + 1,
      }));
    }
  } catch {}

  addPendingGold(40, "reading");
  syncRewardToBackend(40, "reading_story_complete", formatUiText({ tr: "Hikaye Tamamlama: {k}", en: "Story Completed: {k}", de: "Geschichte abgeschlossen: {k}", es: "Historia completada: {k}", fr: "Histoire terminée : {k}", it: "Storia completata: {k}", ru: "История завершена: {k}" }, { k: storyKey }));
  return 40;
}

export function rewardReadingQuestionCorrect(): number {
  addPendingGold(10, "reading");
  syncRewardToBackend(10, "reading_question_correct", pickUiText({ tr: "Okuma Anlama Doğru Cevap", en: "Reading Comprehension Correct Answer", de: "Leseverständnis Richtige Antwort", es: "Comprensión lectora respuesta correcta", fr: "Compréhension écrite bonne réponse", it: "Risposta corretta alla comprensione del testo", ru: "Верный ответ на вопрос по чтению" }));
  return 10;
}

export function rewardReadingWordAdded(word: string): number {
  addPendingGold(5, "reading");
  syncRewardToBackend(5, "reading_word_added", formatUiText({ tr: "Metinden Kelime Ekleme: {w}", en: "Word Added from Text: {w}", de: "Wort aus Text hinzugefügt: {w}", es: "Palabra añadida del texto: {w}", fr: "Mot ajouté depuis le texte : {w}", it: "Parola aggiunta dal testo: {w}", ru: "Слово добавлено из текста: {w}" }, { w: word }));
  return 5;
}

/**
 * 4. Speaking Lounge (Sessiz Birikim):
 * - En az 3 turluk konuşma bitirme: +35 Altın
 * - Hedef kelime kullanma: +10 Altın
 */
export function rewardSpeakingSessionComplete(userTurnCount: number): number {
  if (userTurnCount < 3) return 0;
  addPendingGold(35, "speaking");
  saveUnifiedStats((prev) => ({
    ...prev,
    speakingCompletedSessions: prev.speakingCompletedSessions + 1,
  }));
  syncRewardToBackend(35, "speaking_session_complete", pickUiText({ tr: "Speaking Oturumu Tamamlama", en: "Speaking Session Completed", de: "Speaking-Sitzung abgeschlossen", es: "Sesión de Speaking completada", fr: "Session Speaking terminée", it: "Sessione di Speaking completata", ru: "Сессия разговорной практики завершена" }));
  return 35;
}

export function rewardSpeakingTargetWord(word: string): number {
  addPendingGold(10, "speaking");
  syncRewardToBackend(10, "speaking_target_word", formatUiText({ tr: "Speaking Hedef Kelime: {w}", en: "Speaking Target Word: {w}", de: "Speaking Zielwort: {w}", es: "Palabra objetivo Speaking: {w}", fr: "Mot cible Speaking : {w}", it: "Parola obiettivo Speaking: {w}", ru: "Целевое слово Speaking: {w}" }, { w: word }));
  return 10;
}

/**
 * 5. Oyun Arenası Giriş Teslimatı:
 * Okuma, Speaking ve SM-2'den biriken bekleyen altınları ana kasaya aktarır.
 */
export function claimUnifiedPendingGold(): {
  total: number;
  breakdown: Record<string, number>;
} {
  const claimed = claimPendingGold();
  if (claimed.total > 0 && typeof window !== "undefined") {
    syncRewardToBackend(claimed.total, "unified_pending_gold_claim", pickUiText({ tr: "Birikmiş Çalışma Altını", en: "Accumulated Study Gold", de: "Angesammeltes Lern-Gold", es: "Oro de estudio acumulado", fr: "Or d'étude accumulé", it: "Oro di studio accumulato", ru: "Накопленное учебное золото" }));
  }
  return claimed;
}
