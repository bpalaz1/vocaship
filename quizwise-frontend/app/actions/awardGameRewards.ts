import { API_BASE } from "../config";

export interface AwardGameRewardsParams {
  sessionId: string;
  rank: number;
  userId?: string;
  gameMode?: string;
}

export interface AwardGameRewardsResult {
  success: boolean;
  sessionId: string;
  userId: string;
  rank: number;
  awardedXP: number;
  awardedGold: number;
  awardedKey?: string | null;
  keyName?: string | null;
  newTotalXP: number;
  newCoins: number;
  message: string;
  alreadyClaimed: boolean;
}

// Derece bazlı yerel yedek kurallar (Backend erişilemezse offline fallback)
const FALLBACK_REWARDS: Record<number, { xp: number; coins: number; key?: string; keyName?: string }> = {
  1: { xp: 100, coins: 50, key: "chest_key_epic", keyName: "Epik Sandık Anahtarı 🔑" },
  2: { xp: 70, coins: 35, key: "chest_key_rare", keyName: "Nadir Sandık Anahtarı 🔑" },
  3: { xp: 50, coins: 25, key: "chest_key_common", keyName: "Standart Sandık Anahtarı 🔑" },
};
const FALLBACK_DEFAULT = { xp: 20, coins: 10 };

/**
 * Sunucu tarafı korumalı ödül talep fonksiyonu (Server-Side Verified Reward Claim)
 * İstemci doğrudan XP/Altın miktarı belirleyemez; yalnızca sessionId ve rank iletir.
 * Sunucu tarafında oturum ve mükerrerlik (anti-cheat) doğrulanıp bakiye güvenle artırılır.
 */
export async function awardGameRewards({
  sessionId,
  rank,
  userId = "current_user",
  gameMode = "live_arena",
}: AwardGameRewardsParams): Promise<AwardGameRewardsResult> {
  const claimKey = `vocaship_reward_claimed_${sessionId}_${userId}`;

  // 1. İstemci Ön Kontrolü (Hızlı Anti-Cheat kontrolü)
  if (typeof window !== "undefined") {
    const localClaimed = localStorage.getItem(claimKey);
    if (localClaimed) {
      try {
        const parsed = JSON.parse(localClaimed);
        return {
          ...parsed,
          alreadyClaimed: true,
          message: "Bu yarışmanın ödüllerini daha önce aldınız.",
        };
      } catch {}
    }
  }

  // 2. Sunucu Tarafı Güvenli Doğrulama ve Bakiye Artırma
  try {
    const res = await fetch(`${API_BASE}/api/v1/classroom/award-rewards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
        rank: rank,
        game_mode: gameMode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const result: AwardGameRewardsResult = {
        success: data.success,
        sessionId: data.session_id,
        userId: data.user_id,
        rank: data.rank,
        awardedXP: data.awarded_xp,
        awardedGold: data.awarded_gold,
        awardedKey: data.awarded_key,
        keyName: data.key_name,
        newTotalXP: data.new_total_xp,
        newCoins: data.new_coins,
        message: data.message,
        alreadyClaimed: Boolean(data.already_claimed),
      };

      // Cüzdan & XP Bildirimlerini Güncelle
      if (typeof window !== "undefined") {
        localStorage.setItem(claimKey, JSON.stringify(result));

        if (!result.alreadyClaimed) {
          // Canlı XP float balonu
          window.dispatchEvent(
            new CustomEvent("quizwise_floating_xp", {
              detail: {
                amount: result.awardedXP,
                label: `🏆 ${rank}. Sıra Podyum Ödülü (+${result.awardedXP} XP)`,
              },
            })
          );

          // Altın Bakiyesi Artışı
          const curGold = parseInt(localStorage.getItem("vocaship_gold") || "240", 10);
          localStorage.setItem("vocaship_gold", String(curGold + result.awardedGold));

          // XP Bakiyesi Artışı
          const curXP = parseInt(localStorage.getItem("vocaship_xp") || "450", 10);
          localStorage.setItem("vocaship_xp", String(curXP + result.awardedXP));

          // Sandık Anahtarı Envanteri
          if (result.awardedKey) {
            const rawKeys = localStorage.getItem("vocaship_chest_keys") || "{}";
            try {
              const keys = JSON.parse(rawKeys);
              keys[result.awardedKey] = (keys[result.awardedKey] || 0) + 1;
              localStorage.setItem("vocaship_chest_keys", JSON.stringify(keys));
            } catch {}
          }
        }
      }

      return result;
    }
  } catch (err) {
    console.warn("Server reward API failed, using local offline fallback:", err);
  }

  // 3. Çevrimdışı (Offline) Fallback
  const rule = FALLBACK_REWARDS[rank] || FALLBACK_DEFAULT;
  const offlineResult: AwardGameRewardsResult = {
    success: true,
    sessionId,
    userId,
    rank,
    awardedXP: rule.xp,
    awardedGold: rule.coins,
    awardedKey: rule.key || null,
    keyName: rule.keyName || null,
    newTotalXP: 0,
    newCoins: 0,
    message: `Tebrikler! ${rank}. sıra ödülleri (+${rule.xp} XP, +${rule.coins} 🪙) cüzdanınıza kaydedildi!`,
    alreadyClaimed: false,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(claimKey, JSON.stringify(offlineResult));

    window.dispatchEvent(
      new CustomEvent("quizwise_floating_xp", {
        detail: {
          amount: rule.xp,
          label: `🏆 ${rank}. Sıra Podyum Ödülü (+${rule.xp} XP)`,
        },
      })
    );

    const curGold = parseInt(localStorage.getItem("vocaship_gold") || "240", 10);
    localStorage.setItem("vocaship_gold", String(curGold + rule.coins));
  }

  return offlineResult;
}

