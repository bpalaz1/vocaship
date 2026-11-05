/**
 * pronunciationMatcher.ts
 * Mikro Telaffuz & Gölgeleme (Shadowing) benzerlik hesaplama motoru.
 * Orijinal cümle token'ları ile STT çıktısını karşılaştırarak
 * kelime bazında doğruluk oranlarını ve renk durumunu belirler.
 * $0.00 harici API maliyeti, sıfır gecikme.
 */

export interface WordAccuracy {
  word: string; // Orijinal noktalama işaretli hali
  cleanWord: string; // Küçük harf, noktalama temizlenmiş hali
  spokenWord?: string; // Kullanıcının söylediği eşleşen kelime
  status: "correct" | "near" | "incorrect"; // correct: >=85%, near: 60-84%, incorrect: <60%
  score: number; // 0 - 100
}

export interface PronunciationResult {
  overallScore: number; // 0 - 100
  words: WordAccuracy[];
  recognizedText: string;
  correctCount: number;
  totalCount: number;
  badge: string;
  xpBonus: number;
}

/**
 * Noktalama işaretlerini ve kenar boşluklarını temizler.
 */
export function cleanToken(token: string): string {
  if (!token) return "";
  return token
    .replace(/^["'“‘(]+|[.,;:!?)"’]+$/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Levenshtein mesafesi algoritması
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * İki kelime arasındaki benzerlik oranını yüzde olarak (0 - 100) döndürür.
 */
export function computeWordSimilarity(w1: string, w2: string): number {
  const c1 = cleanToken(w1);
  const c2 = cleanToken(w2);

  if (!c1 && !c2) return 100;
  if (!c1 || !c2) return 0;
  if (c1 === c2) return 100;

  const maxLen = Math.max(c1.length, c2.length);
  if (maxLen === 0) return 100;

  const dist = levenshteinDistance(c1, c2);
  const ratio = (1 - dist / maxLen) * 100;
  return Math.max(0, Math.round(ratio));
}

/**
 * Hedef cümle ile mikrofondan algılanan metni kelime bazında hizalar ve değerlendirir.
 */
export function evaluatePronunciation(
  targetSentence: string,
  spokenText: string
): PronunciationResult {
  if (!targetSentence) {
    return {
      overallScore: 0,
      words: [],
      recognizedText: spokenText || "",
      correctCount: 0,
      totalCount: 0,
      badge: "Tekrar Dene! 💪",
      xpBonus: 0,
    };
  }

  // Orijinal kelimeleri boşluklardan böl
  const rawTargetTokens = targetSentence.trim().split(/\s+/).filter(Boolean);
  const rawSpokenTokens = (spokenText || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const cleanSpokenTokens = rawSpokenTokens.map(cleanToken);

  let spokenPtr = 0;
  const wordAccuracies: WordAccuracy[] = [];
  let totalScoreSum = 0;
  let correctCount = 0;

  for (let i = 0; i < rawTargetTokens.length; i++) {
    const rawWord = rawTargetTokens[i];
    const cleanW = cleanToken(rawWord);

    let bestScore = 0;
    let bestSpokenWord = "";
    let bestIndex = -1;

    // Kullanıcının atlamış veya duraklamış olabileceği senaryolar için
    // spokenPtr etrafındaki 3 kelimelik pencereyi tara
    const searchWindowEnd = Math.min(
      cleanSpokenTokens.length,
      spokenPtr + 3
    );

    for (let sIdx = spokenPtr; sIdx < searchWindowEnd; sIdx++) {
      const score = computeWordSimilarity(cleanW, cleanSpokenTokens[sIdx]);
      if (score > bestScore) {
        bestScore = score;
        bestSpokenWord = rawSpokenTokens[sIdx];
        bestIndex = sIdx;
      }
    }

    // Eğer pencere içinde makul bir eşleşme bulunduysa (en az %50)
    if (bestIndex !== -1 && bestScore >= 50) {
      spokenPtr = bestIndex + 1;
    } else {
      bestScore = 0;
      bestSpokenWord = "";
    }

    let status: "correct" | "near" | "incorrect";
    if (bestScore >= 85) {
      status = "correct";
      correctCount++;
    } else if (bestScore >= 60) {
      status = "near";
    } else {
      status = "incorrect";
    }

    totalScoreSum += bestScore;

    wordAccuracies.push({
      word: rawWord,
      cleanWord: cleanW,
      spokenWord: bestSpokenWord || undefined,
      status,
      score: bestScore,
    });
  }

  const totalCount = rawTargetTokens.length;
  const overallScore =
    totalCount > 0 ? Math.round(totalScoreSum / totalCount) : 0;

  let badge = "Tekrar Dene! 💪";
  let xpBonus = 0;

  if (overallScore >= 90) {
    badge = "Mükemmel Telaffuz! 🌟 (+15 XP)";
    xpBonus = 15;
  } else if (overallScore >= 75) {
    badge = "Çok İyi Telaffuz! 👏 (+10 XP)";
    xpBonus = 10;
  } else if (overallScore >= 60) {
    badge = "Güzel Deneme! 👍 (+5 XP)";
    xpBonus = 5;
  }

  return {
    overallScore,
    words: wordAccuracies,
    recognizedText: spokenText || "",
    correctCount,
    totalCount,
    badge,
    xpBonus,
  };
}

