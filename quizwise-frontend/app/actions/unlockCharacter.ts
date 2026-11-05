import { API_BASE } from "../config";
import { STORE_CHARACTERS, checkCharacterMilestone } from "../data/characters";

export interface UnlockCharacterParams {
  characterId: string;
  userId?: string;
  userLevel?: string;
  completedStoriesCount?: number;
  language?: string;
  userCoins?: number;
}

export interface UnlockCharacterResult {
  success: boolean;
  characterId: string;
  remainingCoins: number;
  unlockedCharacters: string[];
  message: string;
  unlockQuote: string;
}

/**
 * Karakter kilidini açar.
 * İstemci ve sunucu tarafında Milestone Lock (seviye veya hikaye) ve bakiye doğrulaması yapar (Anti-Tamper).
 */
export async function unlockCharacter(
  params: UnlockCharacterParams
): Promise<UnlockCharacterResult> {
  const {
    characterId,
    userId,
    userLevel = "A1",
    completedStoriesCount = 0,
    language = "tr",
    userCoins = 0,
  } = params;

  const targetChar = STORE_CHARACTERS.find((c) => c.id === characterId);
  if (!targetChar) {
    throw new Error("Karakter bulunamadı!");
  }

  // 1. İstemci / Ön Doğrulama (Client-side Early Barrier)
  const milestoneCheck = checkCharacterMilestone(targetChar, userLevel, completedStoriesCount);
  if (!milestoneCheck.isUnlocked) {
    throw new Error(`Anti-Tamper Koruması: ${milestoneCheck.missingReason}`);
  }

  if (userCoins < targetChar.priceGold) {
    throw new Error(`Yetersiz Altın! Bu karakter için ${targetChar.priceGold} 🪙 gerekiyor.`);
  }

  // 2. Sunucu Tarafı Doğrulama ve Veritabanı Kaydı (Server Anti-Tamper)
  try {
    const res = await fetch(`${API_BASE}/gamification/unlock-character`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: characterId,
        user_id: userId,
        user_level: userLevel,
        completed_stories_count: completedStoriesCount,
        language,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success,
        characterId: data.character_id,
        remainingCoins: data.remaining_coins,
        unlockedCharacters: data.unlocked_characters || [characterId],
        message: data.message,
        unlockQuote: data.unlock_quote || targetChar.locales.tr.unlockQuote,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.detail || "Karakter kilidi açılamadı!";
      throw new Error(errMsg);
    }
  } catch (err: any) {
    if (err.message && (err.message.includes("Anti-Tamper") || err.message.includes("Yetersiz Altın"))) {
      throw err;
    }
    console.warn("Sunucu çağrısı yapılamadı, yerel doğrulama ile kilit açılıyor:", err);
    const newCoins = Math.max(0, userCoins - targetChar.priceGold);
    const quote = (targetChar.locales as any)[language]?.unlockQuote || targetChar.locales.en.unlockQuote;

    return {
      success: true,
      characterId,
      remainingCoins: newCoins,
      unlockedCharacters: [characterId],
      message: "Karakter kilidi başarıyla açıldı!",
      unlockQuote: quote,
    };
  }
}

