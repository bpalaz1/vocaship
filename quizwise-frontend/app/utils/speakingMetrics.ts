/**
 * Speaking Lounge Dinamik Seviyeleme & Metrik Yardımcıları
 * 
 * Çocuk Modu (Star Scorecard) ve Yetişkin Modu (Relative CEFR Alignment)
 * hesaplamalarını harici API çağrısı olmadan sıfır ek maliyetle yönetir.
 */

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CEFR_COEFFICIENTS: Record<string, number> = {
  A1: 0.55,
  A2: 0.65,
  B1: 0.75,
  B2: 0.85,
  C1: 0.95,
  C2: 1.00,
};

/**
 * Yetişkin Modu: Hedef seviye katsayısına göre normalize edilmiş CEFR uyum puanı.
 * Örneğin B1 hedefleyen kullanıcı ham 70 puan aldığında, 70 / 0.75 = %93 seviye uyumu kazanır.
 */
export function calculateRelativeCEFRScore(rawScore: number, targetLevel: string = "B2"): number {
  if (!rawScore || rawScore <= 0) return 0;
  const coeff = CEFR_COEFFICIENTS[targetLevel.toUpperCase()] || 0.85;
  const relative = Math.round(rawScore / coeff);
  return Math.min(100, Math.max(0, relative));
}

/**
 * Yetişkin Modu Kelime Çeşitliliği / Jargon Metriği
 */
export function calculateVocabularyDiversity(
  vocabCount: number,
  targetLevel: string = "B2"
): number {
  if (vocabCount <= 0) return 0;
  // Seviyeye göre beklenen kelime sayısı
  const expectedMap: Record<string, number> = {
    A1: 2,
    A2: 3,
    B1: 4,
    B2: 5,
    C1: 6,
    C2: 7,
  };
  const expected = expectedMap[targetLevel.toUpperCase()] || 4;
  const ratio = (vocabCount / expected) * 100;
  return Math.min(100, Math.round(Math.max(40, ratio)));
}

export interface KidsMetricsResult {
  spoken: boolean;
  usedTargetWord: boolean;
  sentenceComplete: boolean;
  starsCount: number;
  isAllCompleted: boolean;
}

/**
 * Çocuk Modu: Yıldızlı Görev Karnesi metrik tespiti
 */
export function calculateKidsMetrics(
  spokenGiven?: boolean,
  usedTargetWordGiven?: boolean,
  sentenceCompleteGiven?: boolean,
  rawFluency: number = 0,
  vocabHighlightsCount: number = 0,
  dialogueHasUser: boolean = false
): KidsMetricsResult {
  // 1. Yıldız: Sesini Duyduk! (Kullanıcı konuştu mu?)
  const spoken = spokenGiven ?? (dialogueHasUser || rawFluency > 0);

  // 2. Yıldız: Hedef Kelime (Deste kelimesi veya hedef kelime kullandı mı?)
  const usedTargetWord = usedTargetWordGiven ?? (vocabHighlightsCount > 0);

  // 3. Yıldız: Harika Cümle (Cümle tamamlandı mı veya akıcılık var mı?)
  const sentenceComplete =
    sentenceCompleteGiven ?? (rawFluency >= 50 || (spoken && usedTargetWord));

  let starsCount = 0;
  if (spoken) starsCount += 1;
  if (usedTargetWord) starsCount += 1;
  if (sentenceComplete) starsCount += 1;

  return {
    spoken,
    usedTargetWord,
    sentenceComplete,
    starsCount,
    isAllCompleted: starsCount === 3,
  };
}

