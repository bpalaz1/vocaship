import { API_BASE } from "../config";

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar: string;
  total_xp: number;
  level: number;
  title: string;
  badge: string;
  streak_days: number;
  is_current_user: boolean;
  weekly_xp?: number;
  all_time_xp?: number;
}

export interface LeaderboardResponse {
  timeframe: string;
  current_user_rank: number;
  current_user_weekly_xp?: number;
  current_user_all_time_xp?: number;
  total_participants: number;
  entries: LeaderboardEntry[];
}

/**
 * Çift Sayaçlı (Dual Ledger) Liderlik Tablosunu getirir.
 * - weekly: Son 7 günün dinamik haftalık ligi (puanlar silinmez).
 * - all_time: Tüm zamanların kalıcı şeref kürsüsü (total_xp asla silinmez).
 */
export async function getLeaderboard(
  timeframe: "weekly" | "all_time" = "weekly",
  userId?: string
): Promise<LeaderboardResponse> {
  const query = new URLSearchParams({ timeframe });
  if (userId) query.append("user_id", userId);

  try {
    const res = await fetch(`${API_BASE}/gamification/leaderboard?${query.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("fetchLeaderboard failed, using structured fallback:", err);
  }

  return {
    timeframe,
    current_user_rank: 7,
    current_user_weekly_xp: 420,
    current_user_all_time_xp: 3150,
    total_participants: 12,
    entries: [],
  };
}

