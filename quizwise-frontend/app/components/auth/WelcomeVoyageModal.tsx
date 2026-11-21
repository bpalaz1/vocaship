"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

export interface WelcomeVoyageModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

const ORBIT_PILLARS = [
  {
    id: "reading",
    emoji: "📖",
    title: "Reading Room",
    subtitle: "İnteraktif Hikayeler",
    delayMs: 350,
    positionClass: "top-2 left-2 sm:top-3 sm:left-4",
    accentClass: "border-sky-400/40 bg-sky-500/15 text-sky-200 shadow-sky-500/20",
  },
  {
    id: "wordpool",
    emoji: "🃏",
    title: "Word Pool",
    subtitle: "SM-2 Akıllı Kartlar",
    delayMs: 1100,
    positionClass: "top-2 right-2 sm:top-3 sm:right-4",
    accentClass: "border-indigo-400/40 bg-indigo-500/15 text-indigo-200 shadow-indigo-500/20",
  },
  {
    id: "speaking",
    emoji: "🎙️",
    title: "Speaking Studio",
    subtitle: "Canlı AI Konuşma",
    delayMs: 1850,
    positionClass: "bottom-3 left-2 sm:bottom-4 sm:left-4",
    accentClass: "border-violet-400/40 bg-violet-500/15 text-violet-200 shadow-violet-500/20",
  },
  {
    id: "arena",
    emoji: "🏆",
    title: "Game Arena & Altınlar",
    subtitle: "Yarış, Kazan, Yüksel",
    delayMs: 2600,
    positionClass: "bottom-3 right-2 sm:bottom-4 sm:right-4",
    accentClass: "border-amber-400/40 bg-amber-500/15 text-amber-200 shadow-amber-500/20",
  },
];

export default function WelcomeVoyageModal({
  isOpen,
  onSkip,
  onOpenRegister,
  onOpenLogin,
}: WelcomeVoyageModalProps) {
  const [litCount, setLitCount] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setLitCount(0);
      return;
    }

    const timers = ORBIT_PILLARS.map((pillar, idx) =>
      setTimeout(() => {
        setLitCount((prev) => Math.max(prev, idx + 1));
      }, pillar.delayMs)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="welcome-voyage-modal"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050814]/95 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300"
    >
      <style jsx>{`
        @keyframes voyageShipFloat {
          0%, 100% {
            transform: translateY(0px) rotate(-2deg);
          }
          50% {
            transform: translateY(-9px) rotate(2.5deg);
          }
        }
        @keyframes voyageWaveSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes voyageProgress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes voyageOrbitPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.04);
            opacity: 0.9;
          }
        }
        .voyage-ship {
          animation: voyageShipFloat 3.5s ease-in-out infinite;
        }
        .voyage-wave-a {
          animation: voyageWaveSlide 6.5s linear infinite;
        }
        .voyage-wave-b {
          animation: voyageWaveSlide 9s linear infinite reverse;
        }
        .voyage-progress-bar {
          animation: voyageProgress 3.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .voyage-orbit-ring {
          animation: voyageOrbitPulse 3.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative w-full max-w-2xl rounded-[32px] bg-gradient-to-b from-[#0C1428] via-[#0B1121] to-[#080C18] border border-sky-500/25 shadow-[0_0_80px_rgba(56,189,248,0.16)] overflow-hidden text-slate-100 my-auto">
        {/* Arka Plan Yıldız & Işıltı Efektleri */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[420px] h-[220px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[460px] h-[180px] rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-5 sm:px-8 pt-8 pb-6 space-y-6">
          {/* Üst Rozet */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-[11px] font-extrabold tracking-wide uppercase">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Dil Yolculuğuna Yelken Aç</span>
            </div>
          </div>

          {/* 3.5 Saniyelik Saf SVG + CSS Gemi, Dalga ve 4 İkon Yörünge Sahnesi */}
          <div className="relative h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-slate-950/90 via-[#0A1833]/90 to-[#061229] border border-sky-500/20 overflow-hidden flex items-center justify-center">
            {/* Yörünge Halkası */}
            <div className="voyage-orbit-ring absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-dashed border-sky-400/25 pointer-events-none" />
            <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-sky-400/10 blur-2xl pointer-events-none" />

            {/* 4 Modül İkon Kartı (Sırayla Parlayarak Yörüngeye Oturur) */}
            {ORBIT_PILLARS.map((pillar, idx) => {
              const isLit = litCount > idx;
              return (
                <div
                  key={pillar.id}
                  className={`absolute z-20 ${pillar.positionClass} flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2 rounded-2xl border backdrop-blur-md transition-all duration-700 ${
                    isLit
                      ? `${pillar.accentClass} opacity-100 scale-100 translate-y-0 shadow-lg`
                      : "border-slate-800/60 bg-slate-900/40 text-slate-500 opacity-0 scale-75 translate-y-3"
                  }`}
                >
                  <span className="text-lg sm:text-xl leading-none">{pillar.emoji}</span>
                  <div className="leading-tight">
                    <div className="text-[11px] sm:text-xs font-black tracking-tight">
                      {pillar.title}
                    </div>
                    <div className="text-[9px] sm:text-[10px] opacity-80 hidden sm:block">
                      {pillar.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Merkezde Süzülen VocaShip SVG Gemisi */}
            <div className="voyage-ship relative z-10 flex flex-col items-center -mt-3">
              <svg
                viewBox="0 0 180 140"
                className="w-36 h-28 sm:w-44 sm:h-32 drop-shadow-[0_12px_28px_rgba(56,189,248,0.4)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="sailMain" x1="90" y1="14" x2="140" y2="92" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FAFC" />
                    <stop offset="1" stopColor="#BAE6FD" />
                  </linearGradient>
                  <linearGradient id="sailSub" x1="82" y1="26" x2="40" y2="90" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A5B4FC" />
                    <stop offset="1" stopColor="#38BDF8" />
                  </linearGradient>
                  <linearGradient id="shipHull" x1="28" y1="95" x2="152" y2="118" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E293B" />
                    <stop offset="0.5" stopColor="#312E81" />
                    <stop offset="1" stopColor="#0F172A" />
                  </linearGradient>
                </defs>
                {/* Direk & Bayrak */}
                <rect x="86" y="12" width="4" height="84" rx="2" fill="#E2E8F0" />
                <path d="M90 12 L114 19 L90 26 Z" fill="#FBBF24" />
                {/* Ana Yelken */}
                <path d="M92 24 C124 38 138 64 134 90 L92 90 Z" fill="url(#sailMain)" />
                {/* Ön Yelken */}
                <path d="M84 32 C60 48 48 68 50 90 L84 90 Z" fill="url(#sailSub)" />
                {/* Altın Şerit & Gövde */}
                <path d="M32 94 L148 94 L134 118 C128 124 52 124 46 118 Z" fill="url(#shipHull)" stroke="#38BDF8" strokeWidth="2.5" />
                <path d="M40 101 L140 101" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
                {/* Küçük Lomboz Pencereleri */}
                <circle cx="72" cy="110" r="3" fill="#FDE68A" />
                <circle cx="90" cy="110" r="3" fill="#FDE68A" />
                <circle cx="108" cy="110" r="3" fill="#FDE68A" />
              </svg>
            </div>

            {/* 2 Katmanlı Akan Dalga Animasyonu */}
            <div className="absolute bottom-0 left-0 right-0 h-14 overflow-hidden pointer-events-none">
              <svg
                viewBox="0 0 1200 100"
                preserveAspectRatio="none"
                className="voyage-wave-a absolute bottom-0 left-0 w-[200%] h-12 opacity-60"
              >
                <path
                  d="M0,45 C150,85 300,5 450,45 C600,85 750,5 900,45 C1050,85 1125,25 1200,45 L1200,100 L0,100 Z"
                  fill="#0284C7"
                />
              </svg>
              <svg
                viewBox="0 0 1200 100"
                preserveAspectRatio="none"
                className="voyage-wave-b absolute bottom-0 left-0 w-[200%] h-9 opacity-80"
              >
                <path
                  d="M0,55 C180,15 320,90 500,50 C680,10 820,85 1000,48 C1100,28 1150,65 1200,55 L1200,100 L0,100 Z"
                  fill="#0EA5E9"
                />
              </svg>
            </div>
          </div>

          {/* 3.5 Saniyelik İlerleme Çizgisi */}
          <div className="w-44 h-1 mx-auto rounded-full bg-slate-800 overflow-hidden">
            <div className="voyage-progress-bar h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400" />
          </div>

          {/* Başlık & Slogan */}
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>VocaShip</span>
            </h1>
            <p className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-sky-300 via-indigo-200 to-amber-300 bg-clip-text text-transparent">
              Sail to Fluency.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Kelime havuzun, okuma odan, konuşma stüdyon ve oyun arenan tek bir akıllı gemide seni bekliyor.
            </p>
          </div>

          {/* Merkezde İki Net Aksiyon Butonu */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              data-testid="welcome-register-btn"
              onClick={onOpenRegister}
              className="w-full sm:w-52 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-black text-sm shadow-xl shadow-sky-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🚀 Kayıt Ol</span>
            </button>

            <button
              type="button"
              data-testid="welcome-login-btn"
              onClick={onOpenLogin}
              className="w-full sm:w-52 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-400/50 text-slate-100 font-extrabold text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🔑 Giriş Yap</span>
            </button>
          </div>

          {/* Sağ Altta Her Zaman Tıklanabilir Atla → Butonu */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              data-testid="welcome-skip-btn"
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <span>Atla</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
