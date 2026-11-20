"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Flame } from "lucide-react";
import { awardGamificationReward } from "../../utils/gamificationEngine";
import { useLanguage } from "../../context/LanguageContext";

export interface MysteryReward {
  id: string;
  type: "gold_30" | "gold_75" | "multiplier_x3" | "gold_100";
  title: string;
  description: string;
  icon: string;
  goldAmount?: number;
  multiplier?: number;
  buffQuestions?: number;
  badge: string;
  gradient: string;
}

const GUARANTEED_POSITIVE_REWARDS: Omit<MysteryReward, "id">[] = [
  {
    type: "gold_30",
    title: "+30 Altın",
    description: "Kasana anında 30 parlak altın eklenir!",
    icon: "🪙",
    goldAmount: 30,
    badge: "Hazine Bonusu",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    type: "gold_75",
    title: "+75 Büyük Altın",
    description: "Büyük ganimet! Kasana +75 altın akar.",
    icon: "👑",
    goldAmount: 75,
    badge: "Nadir Hazine",
    gradient: "from-yellow-400 to-amber-600",
  },
  {
    type: "multiplier_x3",
    title: "Sonraki 3 Soru x3 Çarpan",
    description: "Gelecek 3 doğru cevabında tam 3 kat XP & Altın kazanırsın!",
    icon: "⚡",
    multiplier: 3,
    buffQuestions: 3,
    badge: "Süper Kombo Buff",
    gradient: "from-cyan-400 to-blue-600",
  },
  {
    type: "gold_100",
    title: "+100 Efsanevi Altın",
    description: "Efsane sandık ödülü! Kasana anında +100 altın eklenir.",
    icon: "💎",
    goldAmount: 100,
    badge: "Efsane Hazine",
    gradient: "from-amber-400 to-orange-500",
  },
];

export interface MysteryChestModalProps {
  isOpen: boolean;
  streak?: number;
  onClose: () => void;
  onClaimReward: (reward: MysteryReward) => void;
}

export default function MysteryChestModal({
  isOpen,
  streak = 3,
  onClose,
  onClaimReward,
}: MysteryChestModalProps) {
  const { t } = useLanguage();
  const [chestRewards, setChestRewards] = useState<MysteryReward[]>([]);
  const [selectedChestIndex, setSelectedChestIndex] = useState<number | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);

  const getLocalizedReward = (r: MysteryReward) => ({
    title: t(`game_myst_${r.type}_title`, r.title),
    description: t(`game_myst_${r.type}_desc`, r.description),
    badge: t(`game_myst_${r.type}_badge`, r.badge),
  });

  // Modal açıldığında 3 sandığa pozitif ödülleri karıştırarak dağıt
  useEffect(() => {
    if (isOpen) {
      const shuffled = [...GUARANTEED_POSITIVE_REWARDS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((r, i) => ({
          ...r,
          id: `rew_${i}_${Date.now()}`,
        }));
      setChestRewards(shuffled);
      setSelectedChestIndex(null);
      setIsClaimed(false);
    }
  }, [isOpen]);

  // Ses Efekti (Web Audio API)
  const playChime = (type: "open" | "claim") => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "open") {
        [523, 659, 784, 1046].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.3);
        });
      } else {
        [440, 554, 659, 880].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.06);
          osc.stop(ctx.currentTime + i * 0.06 + 0.25);
        });
      }
    } catch {}
  };

  // Tek Seçim Kuralı: İlk seçilen sandık açılır ve kilitlenir
  const handleOpenChest = (index: number) => {
    if (selectedChestIndex !== null || isClaimed) return;
    setSelectedChestIndex(index);
    playChime("open");

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Ödülü Onayla ve Teslim Et
  const handleClaim = () => {
    if (selectedChestIndex === null || isClaimed) return;
    const reward = chestRewards[selectedChestIndex];
    if (!reward) return;

    setIsClaimed(true);
    playChime("claim");

    // 1. Altın ödülü ise hemen yaz
    if (reward.goldAmount) {
      const loc = getLocalizedReward(reward);
      awardGamificationReward(0, reward.goldAmount, `🎁 ${t("game_myst_title_short", "Gizemli Sandık")} (${loc.title})`);
    }

    // 2. Callback ile oyuna bildir (özellikle x3 çarpan buff'ı için)
    onClaimReward(reward);

    setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  const currentReward = selectedChestIndex !== null ? chestRewards[selectedChestIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-center">
        {/* Arka plan ışıltıları */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* ÜST BAŞLIK */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{t("game_myst_streak_bonus", "{n} Doğru Kombo Bonusu!", { n: streak })}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>{t("game_myst_hdr", "🎁 3 Gizemli Sandık")}</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
            {t("game_myst_pick_desc", "3 sandıktan 1 tanesini seç ve içindeki sürpriz ödülü hemen kazan!")}
          </p>
        </div>

        {/* 3 KAPALI / AÇIK SANDIK (TEK SEÇİM KURALI) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 py-2">
          {[0, 1, 2].map((idx) => {
            const isThisOpened = selectedChestIndex === idx;
            const isLockedOut = selectedChestIndex !== null && !isThisOpened;
            const reward = chestRewards[idx];
            const locReward = reward ? getLocalizedReward(reward) : null;

            return (
              <button
                key={idx}
                type="button"
                disabled={selectedChestIndex !== null || isClaimed}
                onClick={selectedChestIndex === null ? () => handleOpenChest(idx) : undefined}
                className={`relative group p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px] ${
                  isThisOpened
                    ? "bg-slate-800/90 border-amber-400 shadow-xl shadow-amber-500/20 scale-105 cursor-default"
                    : isLockedOut
                    ? "bg-slate-950/60 border-slate-800 pointer-events-none opacity-50 cursor-not-allowed"
                    : "bg-slate-950/90 hover:bg-slate-850 border-slate-800 hover:border-amber-500/60 hover:scale-105 shadow-md cursor-pointer"
                }`}
              >
                {isThisOpened && reward && locReward ? (
                  <div className="space-y-2 animate-in zoom-in-75 duration-300">
                    <span className="text-3xl sm:text-4xl block animate-bounce">
                      {reward.icon}
                    </span>
                    <span className="text-[11px] font-black text-amber-300 block leading-tight">
                      {locReward.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase block">
                      {locReward.badge}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border border-amber-500/40 flex items-center justify-center text-2xl sm:text-3xl transition-transform shadow-inner ${
                        selectedChestIndex === null ? "group-hover:scale-110" : ""
                      }`}
                    >
                      📦
                    </div>
                    <span
                      className={`text-xs font-bold text-slate-300 transition ${
                        selectedChestIndex === null ? "group-hover:text-amber-300" : ""
                      }`}
                    >
                      {t("game_myst_chest_n", "Sandık #{n}", { n: idx + 1 })}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* SEÇİLEN ÖDÜL DETAYI VE TEK ONAY BUTONU */}
        {currentReward && (() => {
          const locCurrent = getLocalizedReward(currentReward);
          return (
          <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl shrink-0">
                {currentReward.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-black text-amber-200 block">
                  {locCurrent.title}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  {locCurrent.description}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isClaimed}
              onClick={handleClaim}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <span>{t("game_myst_claim", "✅ Bu Ödülü Al")}</span>
            </button>
          </div>
          );
        })()}

        {/* PEDAGOJİK GÜVENCE BİLGİSİ */}
        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{t("game_myst_guarantee", "Kayıpsız Ödül Garantisi: Tüm sandıklar pozitif takviye içerir.")}</span>
        </div>
      </div>
    </div>
  );
}

