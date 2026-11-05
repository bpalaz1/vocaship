"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Zap,
  Coins,
  Key,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  Loader2,
  Users,
  Flame,
} from "lucide-react";
import { awardGameRewards, AwardGameRewardsResult } from "../../actions/awardGameRewards";

export interface PodiumParticipant {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface ClassroomPodiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  gameTitle?: string;
  currentUserRank?: number;
  currentUserId?: string;
  currentUserName?: string;
  participants?: PodiumParticipant[];
  onRewardsClaimed?: (result: AwardGameRewardsResult) => void;
}

const DEFAULT_PARTICIPANTS: PodiumParticipant[] = [
  { id: "p1", name: "Efe Yılmaz", avatar: "👑", score: 940, rank: 1 },
  { id: "p2", name: "Selin Kaya", avatar: "🦊", score: 860, rank: 2 },
  { id: "p3", name: "Can Demir", avatar: "🚀", score: 780, rank: 3 },
  { id: "p4", name: "Zeynep Aydın", avatar: "🌸", score: 650, rank: 4 },
  { id: "p5", name: "Sen (Öğrenci)", avatar: "🌟", score: 590, rank: 5, isCurrentUser: true },
];

export default function ClassroomPodiumModal({
  isOpen,
  onClose,
  sessionId,
  gameTitle = "Canlı Sınıf Arenası",
  currentUserRank = 1,
  currentUserId = "current_user",
  currentUserName = "Sen",
  participants = DEFAULT_PARTICIPANTS,
  onRewardsClaimed,
}: ClassroomPodiumModalProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<AwardGameRewardsResult | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  // Zafer ve Ödül Sentezleyici Ses Efekti (Web Audio API)
  const playRewardSound = (isWin: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const freqs = isWin ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch {}
  };

  // Konfeti ve İlk Yükleme
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
      });
      playRewardSound(currentUserRank <= 3);

      // Daha önce bu oturum için ödül alınmış mı kontrol et
      const claimKey = `vocaship_reward_claimed_${sessionId}_${currentUserId}`;
      const local = localStorage.getItem(claimKey);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setClaimResult(parsed);
          setAlreadyClaimed(true);
        } catch {}
      }
    }
  }, [isOpen, sessionId, currentUserId, currentUserRank]);

  if (!isOpen) return null;

  // Sıralamadaki ilk 3 kişiyi bul
  const first = participants.find((p) => p.rank === 1) || {
    name: "1. Şampiyon",
    avatar: "👑",
    score: 950,
  };
  const second = participants.find((p) => p.rank === 2) || {
    name: "2. Finalist",
    avatar: "🥈",
    score: 820,
  };
  const third = participants.find((p) => p.rank === 3) || {
    name: "3. Derece",
    avatar: "🥉",
    score: 740,
  };

  // Güvenli Ödül Talep İşlemi (Server Action / Backend API)
  const handleClaimRewards = async () => {
    if (claiming || alreadyClaimed) return;
    setClaiming(true);

    try {
      const result = await awardGameRewards({
        sessionId,
        rank: currentUserRank,
        userId: currentUserId,
        gameMode: gameTitle,
      });

      setClaimResult(result);
      setAlreadyClaimed(true);
      playRewardSound(true);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });

      if (onRewardsClaimed) {
        onRewardsClaimed(result);
      }
    } catch (err) {
      console.error("Ödül tesliminde hata:", err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-slate-900/95 border border-slate-800 p-5 sm:p-7 shadow-2xl shadow-indigo-950/60 relative overflow-hidden space-y-5 my-4"
      >
        {/* Dekoratif Işık Efektleri */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Üst Başlık & Kapatma Butonu */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  🏆 Sınıf Podyumu & Sonuçlar
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Canlı Multiplayer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {gameTitle} • Oturum #{sessionId.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 1. CANLI PODYUM BLOKLARI (2. Sıra - 1. Şampiyon - 3. Sıra)                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-4 pb-2 relative z-10">
          {/* 2. BASAMAK (GÜMÜŞ) */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-slate-400/60 flex items-center justify-center text-xl sm:text-2xl shadow-md">
                {second.avatar || "🥈"}
              </div>
              <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-slate-400 text-slate-950 font-black text-[10px] shadow">
                #2
              </div>
            </div>
            <div className="text-center w-full px-1">
              <p className="text-xs font-bold text-white truncate">{second.name}</p>
              <p className="text-[11px] font-mono text-slate-400">{second.score} Puan</p>
            </div>
            <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-slate-850 to-slate-800 border-t-2 border-slate-400/50 flex flex-col items-center justify-center shadow-lg">
              <Medal className="w-6 h-6 text-slate-300" />
              <span className="text-xs font-black text-slate-300 mt-1">2. SIRA</span>
            </div>
          </div>

          {/* 1. BASAMAK (ALTIN ŞAMPİYON - EN YÜKSEK) */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-300 animate-bounce">
                <Crown className="w-6 h-6 fill-amber-400 text-yellow-300 drop-shadow-md" />
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-amber-300 flex items-center justify-center text-2xl sm:text-3xl shadow-xl shadow-amber-500/30">
                {first.avatar || "👑"}
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow">
                #1
              </div>
            </div>
            <div className="text-center w-full px-1">
              <p className="text-xs sm:text-sm font-black text-amber-200 truncate">{first.name}</p>
              <p className="text-xs font-mono font-bold text-amber-400">{first.score} Puan</p>
            </div>
            <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-t from-amber-950/70 via-amber-900/50 to-amber-600/30 border-t-2 border-amber-400 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-400/10 blur-xl pointer-events-none" />
              <Trophy className="w-8 h-8 text-amber-300 drop-shadow" />
              <span className="text-sm font-black text-amber-300 mt-1">ŞAMPİYON</span>
            </div>
          </div>

          {/* 3. BASAMAK (BRONZ) */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-amber-700/60 flex items-center justify-center text-xl sm:text-2xl shadow-md">
                {third.avatar || "🥉"}
              </div>
              <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-amber-700 text-white font-black text-[10px] shadow">
                #3
              </div>
            </div>
            <div className="text-center w-full px-1">
              <p className="text-xs font-bold text-white truncate">{third.name}</p>
              <p className="text-[11px] font-mono text-slate-400">{third.score} Puan</p>
            </div>
            <div className="w-full h-18 sm:h-20 rounded-t-2xl bg-gradient-to-t from-slate-900 to-amber-950/40 border-t-2 border-amber-700/50 flex flex-col items-center justify-center shadow-lg">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-[11px] font-black text-amber-600 mt-1">3. SIRA</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. KULLANICININ KENDİ DERECESİ VE NET ÖDÜL KUTUSU                          */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-850">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm">
                #{currentUserRank}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>
                    {currentUserRank === 1
                      ? "🏆 Tebrikler! 1. Sırada Tamamladın!"
                      : currentUserRank === 2
                      ? "🥈 Tebrikler! 2. Sıradasın!"
                      : currentUserRank === 3
                      ? "🥉 Tebrikler! Podyumdasın (3. Sıra)!"
                      : `🎯 Sen ${currentUserRank}. sırada tamamladın!`}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {currentUserRank <= 3
                    ? "Büyük podyum derecesiyle azami ödül kazandın!"
                    : "Katılımın ve serin korundu, tebrikler!"}
                </p>
              </div>
            </div>

            <span className="self-start sm:self-auto px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
              {currentUserName}
            </span>
          </div>

          {/* Kazanılan Ödül Kutucukları */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {/* XP Ödülü */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Kazanılan XP</p>
                <p className="text-xs sm:text-sm font-black font-mono text-indigo-300">
                  +{currentUserRank === 1 ? 100 : currentUserRank === 2 ? 70 : currentUserRank === 3 ? 50 : 20} XP
                </p>
              </div>
            </div>

            {/* Altın Ödülü */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Kazanılan Altın</p>
                <p className="text-xs sm:text-sm font-black font-mono text-amber-300">
                  +{currentUserRank === 1 ? 50 : currentUserRank === 2 ? 35 : currentUserRank === 3 ? 25 : 10} 🪙
                </p>
              </div>
            </div>

            {/* Sandık Anahtarı (1-3. sıra için) */}
            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium">Sandık Anahtarı</p>
                <p className="text-xs font-black text-cyan-300 truncate">
                  {currentUserRank === 1
                    ? "1x Epik Anahtar 🔑"
                    : currentUserRank === 2
                    ? "1x Nadir Anahtar 🔑"
                    : currentUserRank === 3
                    ? "1x Std. Anahtar 🔑"
                    : "Katılım Rozeti 🎖️"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ÖDÜL TOPLAMA & AKSİYON BUTONLARI                                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 relative z-10">
          {!alreadyClaimed ? (
            <button
              type="button"
              disabled={claiming}
              onClick={handleClaimRewards}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {claiming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ödüller Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Ödülleri Cüzdana Aktar ➔</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{claimResult?.message || "Ödüller başarıyla cüzdanınıza aktarıldı!"}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <span>Arenaya Dön</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

