"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Crown, Sparkles, Trophy, Award, Check, Star } from "lucide-react";

export interface GrandmasterCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string;
  userName?: string;
}

export default function GrandmasterCelebrationModal({
  isOpen,
  onClose,
  avatarUrl = "/avatars/sparky.png",
  userName = "Ahmet Kaya",
}: GrandmasterCelebrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.4 },
        });

        // 2. dalga konfeti
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 120,
            origin: { y: 0.6 },
          });
        }, 500);
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-amber-950/30 to-slate-950 border-2 border-amber-400 p-6 sm:p-8 shadow-[0_0_50px_rgba(251,191,36,0.35)] text-center space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Parıltı Efekti */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Taç & Avatar */}
        <div className="relative inline-block mx-auto pt-4">
          <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-bounce absolute -top-7 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />

          {/* Animasyonlu Altın Çerçeve */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.7)] p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 animate-pulse">
            <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={avatarUrl}
                alt="Grandmaster Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avatars/sparky.png";
                }}
              />
            </div>
          </div>
        </div>

        {/* Başlık ve Metin */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1000 Kelime Barajı Tamamlandı!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            👑 VOCASHIP GRANDMASTER
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Tebrikler <strong>{userName}</strong>! 1000 kelimelik dev maratonu başarıyla tamamladın
            ve platformun en yüksek dereceli efsaneler kulübüne adını yazdırdın.
          </p>
        </div>

        {/* Kazanılan Ayrıcalıklar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left max-w-md mx-auto">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span>Altın Çerçeve</span>
            </span>
            <p className="text-[10px] text-slate-400">
              Avatarın etrafında kalıcı parlak altın aura.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              <span>Grandmaster Tacı</span>
            </span>
            <p className="text-[10px] text-slate-400">
              Liderlik ve sınıf listelerinde özel unvan rozeti.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Efsane Sandık</span>
            </span>
            <p className="text-[10px] text-slate-400">
              Tüm tematik sandıkların kilitleri kalıcı açıldı.
            </p>
          </div>
        </div>

        {/* Buton */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition active:scale-95 cursor-pointer"
        >
          Zaferi Kutla & Tacını Tak ➔
        </button>
      </div>
    </div>
  );
}

