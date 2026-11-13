"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Coins, Zap, Flame, Check, RefreshCw, Gift } from "lucide-react";
import { awardGamificationReward } from "../../utils/gamificationEngine";

export interface MysteryReward {
  id: string;
  type: "gold_30" | "gold_75" | "multiplier_x3" | "magic_dust_25";
  title: string;
  description: string;
  icon: string;
  goldAmount?: number;
  multiplier?: number;
  buffQuestions?: number;
  magicDust?: number;
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
    type: "magic_dust_25",
    title: "+25 Sihirli Toz",
    description: "Sandık açılışları ve gacha için kozmik sihir tozu!",
    icon: "✨",
    magicDust: 25,
    badge: "Kozmik Toz",
    gradient: "from-purple-500 to-pink-500",
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
  const [chestRewards, setChestRewards] = useState<MysteryReward[]>([]);
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  const [hasRerolled, setHasRerolled] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

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
      setOpenedIndex(null);
      setHasRerolled(false);
      setIsClaimed(false);
    }
  }, [isOpen]);

  // Ses Efekti (Web Audio API)
  const playChime = (type: "open" | "claim" | "switch") => {
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
      } else if (type === "claim") {
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
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {}
  };

  // Sandığı Aç
  const handleOpenChest = (index: number) => {
    if (isClaimed) return;
    setOpenedIndex(index);
    playChime("open");

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Başka Sandık Seç (Değiştir)
  const handleSwitchChest = () => {
    if (hasRerolled || openedIndex === null || isClaimed) return;
    setHasRerolled(true);
    playChime("switch");

    // Kalan diğer sandıklardan birine geç
    const remaining = [0, 1, 2].filter((i) => i !== openedIndex);
    const nextIndex = remaining[Math.floor(Math.random() * remaining.length)];
    setOpenedIndex(nextIndex);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Ödülü Onayla ve Teslim Et
  const handleClaim = () => {
    if (openedIndex === null || isClaimed) return;
    const reward = chestRewards[openedIndex];
    if (!reward) return;

    setIsClaimed(true);
    playChime("claim");

    // 1. Altın ödülü ise hemen yaz
    if (reward.goldAmount) {
      awardGamificationReward(0, reward.goldAmount, `🎁 Gizemli Sandık (${reward.title})`);
    }

    // 2. Sihirli Toz ise localStorage'a ekle
    if (reward.magicDust && typeof window !== "undefined") {
      try {
        const curDust = parseInt(localStorage.getItem("vocaship_magic_dust") || "0", 10);
        localStorage.setItem("vocaship_magic_dust", String(curDust + reward.magicDust));
      } catch {}
    }

    // 3. Callback ile oyuna bildir (özellikle x3 çarpan buff'ı için)
    onClaimReward(reward);

    setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  const currentReward = openedIndex !== null ? chestRewards[openedIndex] : null;

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
            <span>{streak} Doğru Kombo Bonusu!</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>🎁 3 Gizemli Sandık</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
            {openedIndex === null
              ? "Bir sandık seç ve aç! Kesinlikle tuzak yok, tüm sandıklar pozitif ödül dolu."
              : "Ödülün açıldı! İster ödülü hemen al, ister şansını diğer sandıkta dene."}
          </p>
        </div>

        {/* 3 KAPALI / AÇIK SANDIK */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 py-2">
          {[0, 1, 2].map((idx) => {
            const isThisOpened = openedIndex === idx;
            const reward = chestRewards[idx];

            return (
              <button
                key={idx}
                type="button"
                disabled={isClaimed}
                onClick={() => handleOpenChest(idx)}
                className={`relative group p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px] ${
                  isThisOpened
                    ? "bg-slate-800/90 border-amber-400 shadow-xl shadow-amber-500/20 scale-105"
                    : openedIndex !== null
                    ? "bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-90"
                    : "bg-slate-950/90 hover:bg-slate-850 border-slate-800 hover:border-amber-500/60 hover:scale-105 shadow-md"
                }`}
              >
                {isThisOpened && reward ? (
                  <div className="space-y-2 animate-in zoom-in-75 duration-300">
                    <span className="text-3xl sm:text-4xl block animate-bounce">
                      {reward.icon}
                    </span>
                    <span className="text-[11px] font-black text-amber-300 block leading-tight">
                      {reward.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase block">
                      {reward.badge}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border border-amber-500/40 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-transform shadow-inner">
                      📦
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-amber-300 transition">
                      Sandık #{idx + 1}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* SEÇİLEN ÖDÜL DETAYI VE EYLEMLER */}
        {currentReward && (
          <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl shrink-0">
                {currentReward.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-black text-amber-200 block">
                  {currentReward.title}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  {currentReward.description}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {/* Ödülü Al Butonu */}
              <button
                type="button"
                onClick={handleClaim}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Ödülü Al</span>
              </button>

              {/* Değiştir Butonu */}
              {!hasRerolled && (
                <button
                  type="button"
                  onClick={handleSwitchChest}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Değiştir ve Diğerini Aç</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* PEDAGOJİK GÜVENCE BİLGİSİ */}
        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Kayıpsız Ödül Garantisi: Tüm sandıklar pozitif takviye içerir.</span>
        </div>
      </div>
    </div>
  );
}

