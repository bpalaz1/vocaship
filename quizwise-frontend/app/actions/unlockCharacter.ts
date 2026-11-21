import { API_BASE } from "../config";
import { STORE_CHARACTERS, checkCharacterMilestone } from "../data/characters";
import { pickUiText, formatUiText } from "../utils/uiLocale";

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
    throw new Error(pickUiText({ tr: "Karakter bulunamadı!", en: "Character not found!", de: "Charakter nicht gefunden!", es: "¡Personaje no encontrado!", fr: "Personnage introuvable !", it: "Personaggio non trovato!", ru: "Персонаж не найден!" }, language));
  }

  // 1. İstemci / Ön Doğrulama (Client-side Early Barrier)
  const milestoneCheck = checkCharacterMilestone(targetChar, userLevel, completedStoriesCount, language);
  if (!milestoneCheck.isUnlocked) {
    throw new Error(`Anti-Tamper: ${milestoneCheck.missingReason}`);
  }

  if (userCoins < targetChar.priceGold) {
    throw new Error(formatUiText({ tr: "Yetersiz Altın! Bu karakter için {coins} 🪙 gerekiyor.", en: "Insufficient Gold! {coins} 🪙 required for this character.", de: "Nicht genug Gold! {coins} 🪙 für diesen Charakter erforderlich.", es: "¡Oro insuficiente! Se necesitan {coins} 🪙 para este personaje.", fr: "Or insuffisant ! {coins} 🪙 requis pour ce personnage.", it: "Oro insufficiente! Servono {coins} 🪙 per questo personaggio.", ru: "Недостаточно золота! Для этого персонажа требуется {coins} 🪙." }, { coins: targetChar.priceGold }, language));
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
        unlockQuote: data.unlock_quote || (targetChar.locales as any)[language]?.unlockQuote || targetChar.locales.en.unlockQuote,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.detail || pickUiText({ tr: "Karakter kilidi açılamadı!", en: "Could not unlock character!", de: "Charakter konnte nicht freigeschaltet werden!", es: "¡No se pudo desbloquear el personaje!", fr: "Impossible de débloquer le personnage !", it: "Impossibile sbloccare il personaggio!", ru: "Не удалось разблокировать персонажа!" }, language);
      throw new Error(errMsg);
    }
  } catch (err: any) {
    if (err.message && (err.message.includes("Anti-Tamper") || err.message.includes("🪙"))) {
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
      message: pickUiText({ tr: "Karakter kilidi başarıyla açıldı!", en: "Character unlocked successfully!", de: "Charakter erfolgreich freigeschaltet!", es: "¡Personaje desbloqueado con éxito!", fr: "Personnage débloqué avec succès !", it: "Personaggio sbloccato con successo!", ru: "Персонаж успешно разблокирован!" }, language),
      unlockQuote: quote,
    };
  }
}

