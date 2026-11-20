"use client";

import React from "react";
import { Flame, Coins, Zap, Crown } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  getStreakMultiplier,
  getFiveCardMilestoneReward,
} from "../../utils/gamificationEngine";

export interface StreakMilestoneBarProps {
  streak: number;
  className?: string;
}

export default function StreakMilestoneBar({
  streak,
  className = "",
}: StreakMilestoneBarProps) {
  const { t } = useLanguage();
  const { multiplier, label, icon } = getStreakMultiplier(streak);
  const milestoneInfo = getFiveCardMilestoneReward(streak);
  const filledSteps = streak <= 0 ? 0 : milestoneInfo.progressInCycle;

  const nextMilestoneTarget = Math.floor(streak / 5) * 5 + 5;
  const nextRewardText =
    nextMilestoneTarget === 5
      ? t("game_milestone_5", "5. Doğru: x2 Çarpan & +25 🪙")
      : nextMilestoneTarget === 10
      ? t("game_milestone_10", "10. Doğru: x3 Çarpan & +50 🪙 + 🎁")
      : t("game_milestone_n", "{n}. Doğru: x5 Süper Çarpan & +100 🪙", { n: nextMilestoneTarget });

  return (
    <div
      data-theme-preserve="dark"
      className={`w-full max-w-2xl mx-auto px-3.5 py-2 rounded-2xl bg-slate-900/95 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5 shadow-md ${className}`}
    >
      {/* Sol: 5 Kademeli Seri Çubuğu (0/5 -> 5/5) */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1 text-xs font-black text-amber-300 font-mono">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{t("game_streak_lbl", "Seri:")} {filledSteps}/5</span>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((step) => {
            const isFilled = step <= filledSteps;
            const isFifth = step === 5;
            return (
              <div
                key={step}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isFifth ? "w-6 sm:w-7" : "w-4 sm:w-5"
                } ${
                  isFilled
                    ? isFifth
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-105"
                      : "bg-gradient-to-r from-indigo-500 to-amber-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]"
                    : "bg-slate-800 border border-slate-700"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Sağ: Aktif Çarpan & Sıradaki 5'li Ödül */}
      <div className="flex items-center gap-2 ml-auto">
        <span
          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black font-mono flex items-center gap-1 border ${
            multiplier >= 5
              ? "bg-amber-500/25 border-amber-400 text-amber-200 animate-pulse"
              : multiplier >= 3
              ? "bg-purple-500/25 border-purple-400 text-purple-200"
              : multiplier >= 2
              ? "bg-rose-500/25 border-rose-400 text-rose-200"
              : "bg-slate-800 border-slate-700 text-slate-300"
          }`}
        >
          {icon ? <span>{icon}</span> : <Zap className="w-3 h-3 text-slate-400" />}
          <span>{multiplier > 1 ? label : t("game_x1_mult", "x1 Çarpan")}</span>
        </span>

        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300/90 bg-slate-950/90 px-2.5 py-0.5 rounded-lg border border-slate-800">
          <Coins className="w-3 h-3 text-amber-400" />
          <span>{nextRewardText}</span>
        </span>
      </div>
    </div>
  );
}
