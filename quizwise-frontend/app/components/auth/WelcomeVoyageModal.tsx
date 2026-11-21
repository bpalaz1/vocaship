"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { VocaShipLogo } from "../brand/VocaShipLogo";

export interface WelcomeVoyageModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

const MODULES = [
  {
    id: "wordpool",
    emoji: "🃏",
    title: "Word Pool",
    subtitle: "SM-2 Akıllı Kartlar",
    accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
    spanClass: "",
  },
  {
    id: "reading",
    emoji: "📖",
    title: "Reading Room",
    subtitle: "İnteraktif Hikayeler",
    accent: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    spanClass: "",
  },
  {
    id: "speaking",
    emoji: "🎙️",
    title: "Speaking Studio",
    subtitle: "Canlı AI Konuşma",
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    spanClass: "",
  },
  {
    id: "arena",
    emoji: "🏆",
    title: "Game Arena",
    subtitle: "Yarış, Kazan, Yüksel",
    accent: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    spanClass: "",
  },
  {
    id: "classroom",
    emoji: "🎓",
    title: "Sınıfım",
    subtitle: "Canlı Tahta & Ödevler",
    accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    spanClass: "col-span-2 sm:col-span-1",
  },
];

const STARS = [
  { top: "10%", left: "12%", delay: "0s", size: "w-1.5 h-1.5", color: "bg-amber-300" },
  { top: "18%", left: "24%", delay: "0.7s", size: "w-1 h-1", color: "bg-teal-300" },
  { top: "14%", left: "78%", delay: "1.3s", size: "w-1.5 h-1.5", color: "bg-amber-200" },
  { top: "24%", left: "88%", delay: "0.4s", size: "w-1 h-1", color: "bg-emerald-300" },
  { top: "30%", left: "16%", delay: "1.9s", size: "w-1.5 h-1.5", color: "bg-sky-300" },
  { top: "12%", left: "62%", delay: "2.3s", size: "w-1 h-1", color: "bg-amber-300" },
  { top: "28%", left: "72%", delay: "1.0s", size: "w-1.5 h-1.5", color: "bg-teal-200" },
  { top: "8%", left: "38%", delay: "1.6s", size: "w-1 h-1", color: "bg-emerald-200" },
];

const TRAIL_TOKENS = [
  { emoji: "✨", left: "14%", bottom: "40%", delay: "0s", ring: "border-amber-400/40 bg-amber-500/10" },
  { emoji: "📖", left: "24%", bottom: "48%", delay: "0.6s", ring: "border-sky-400/40 bg-sky-500/10" },
  { emoji: "💬", left: "35%", bottom: "43%", delay: "1.2s", ring: "border-indigo-400/40 bg-indigo-500/10" },
  { emoji: "🎙️", left: "45%", bottom: "35%", delay: "1.8s", ring: "border-emerald-400/40 bg-emerald-500/10" },
];

export default function WelcomeVoyageModal({
  isOpen,
  onSkip,
  onOpenRegister,
  onOpenLogin,
}: WelcomeVoyageModalProps) {
  if (!isOpen) return null;

  return (
    <div
      data-testid="welcome-voyage-modal"
      className="fixed inset-0 z-[110] h-dvh w-screen overflow-hidden bg-[#070B14] flex flex-col items-center justify-between px-4 py-3 sm:py-4 text-slate-100 animate-in fade-in duration-300"
    >
      <style>{`
        @keyframes shipFloat {
          0%, 100% {
            transform: translateY(0px) rotate(-1.6deg);
          }
          50% {
            transform: translateY(-9px) rotate(1.6deg);
          }
        }
        @keyframes tokenBob {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-7px) scale(1.06);
          }
        }
        @keyframes trailDash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -48;
          }
        }
        @keyframes waveFlowA {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes waveFlowB {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        @keyframes starTwinkle {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.35);
          }
        }
        .ship-voyage {
          animation: shipFloat 4s ease-in-out infinite;
        }
        .trail-token {
          animation: tokenBob 3.6s ease-in-out infinite;
        }
        .trail-path {
          animation: trailDash 3s linear infinite;
        }
        .wave-a {
          animation: waveFlowA 9s linear infinite;
        }
        .wave-b {
          animation: waveFlowB 12s linear infinite;
        }
        .star-twinkle {
          animation: starTwinkle 3s ease-in-out infinite;
        }
      `}</style>

      {/* 1. ÜST BAR (Sade İkon Rozeti + Giriş Yap • Kayıt Ol • Atla) */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 gap-2 shrink-0">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800/90">
          <VocaShipLogo variant="icon" className="w-6 h-6" />
          <span className="hidden sm:inline text-[11px] font-bold text-slate-300 tracking-wide">
            Yeni Nesil Dil Platformu
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            data-testid="welcome-top-login-btn"
            onClick={onOpenLogin}
            className="px-3.5 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-400/50 backdrop-blur-md text-xs font-bold text-slate-100 transition active:scale-95 cursor-pointer"
          >
            Giriş Yap
          </button>

          <button
            type="button"
            data-testid="welcome-top-register-btn"
            onClick={onOpenRegister}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
          >
            Kayıt Ol
          </button>

          <button
            type="button"
            data-testid="welcome-skip-btn"
            onClick={onSkip}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-transparent hover:bg-slate-900/80 border border-transparent hover:border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <span>Atla</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. MERKEZİ SAHNE KUTUSU (Ufka İlerleyen VocaShip Gemisi & Keşif Rotası) */}
      <div className="w-full max-w-5xl flex-1 max-h-[54vh] my-1.5 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#070D1A] via-[#0B162C] to-[#081F26] relative overflow-hidden flex flex-col items-center justify-between pt-5 sm:pt-6 pb-0 shadow-[0_0_60px_rgba(16,185,129,0.10)]">
        {/* Gökyüzü Aurora Işığı & Yıldızlar */}
        <div className="absolute -top-6 left-1/3 w-72 h-44 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-4 right-1/4 w-64 h-40 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        {STARS.map((star, idx) => (
          <span
            key={idx}
            style={{ top: star.top, left: star.left, animationDelay: star.delay }}
            className={`star-twinkle absolute ${star.size} ${star.color} rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] pointer-events-none`}
          />
        ))}

        {/* Üst Marka & Slogan Odağı (Tek Marka Adı) */}
        <div className="relative z-20 flex flex-col items-center text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none">
            Voca<span className="text-[#10B981]">Ship</span>
          </h1>
          <p className="mt-1.5 text-sm sm:text-lg font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent tracking-wide">
            Sail to Fluency.
          </p>
        </div>

        {/* Orta-Alt Alan: Keşif Rotası İzleri + Süzülen VocaShip Gemisi */}
        <div className="relative z-10 w-full flex-1 flex items-end justify-center overflow-hidden">
          {/* Kavisli Keşif Rotası SVG (Kesikli Parlayan Işık İzi) */}
          <svg
            viewBox="0 0 900 220"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <defs>
              <linearGradient id="voyageTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                <stop offset="45%" stopColor="#2DD4BF" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <path
              d="M 60 155 Q 240 60 470 135 T 580 140"
              fill="none"
              stroke="url(#voyageTrailGrad)"
              strokeWidth="2.5"
              strokeDasharray="8 8"
              strokeLinecap="round"
              className="trail-path"
            />
          </svg>

          {/* Keşif Rotası Boyunca Süzülen Mini Öğrenme İkonları */}
          {TRAIL_TOKENS.map((item, idx) => (
            <div
              key={idx}
              style={{ left: item.left, bottom: item.bottom, animationDelay: item.delay }}
              className={`trail-token hidden sm:flex absolute w-9 h-9 rounded-2xl border backdrop-blur-md items-center justify-center text-base shadow-lg pointer-events-none ${item.ring}`}
            >
              <span>{item.emoji}</span>
            </div>
          ))}

          {/* Ufka İlerleyen Işıklı VocaShip Yelkenli / Keşif Gemisi */}
          <div className="ship-voyage relative z-20 mb-7 sm:mb-9 sm:ml-24 flex flex-col items-center pointer-events-none">
            {/* Gemi Arkası Aura */}
            <div className="absolute -inset-4 rounded-full bg-emerald-400/15 blur-2xl" />
            <svg
              viewBox="0 0 220 150"
              className="w-40 h-28 sm:w-52 sm:h-36 drop-shadow-[0_12px_24px_rgba(16,185,129,0.28)]"
              fill="none"
            >
              <defs>
                <linearGradient id="hullGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="55%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id="mainSailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="55%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id="foreSailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>

              {/* Ana Direk */}
              <line x1="110" y1="16" x2="110" y2="112" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />

              {/* Arka/Sol Yelken (Açılan Kitap Kanadı Formu - İndigo/Sky) */}
              <path
                d="M104 26 C74 44, 52 72, 48 104 L104 104 Z"
                fill="url(#foreSailGrad)"
                opacity="0.92"
              />
              {/* Ön/Sağ Ana Yelken (Zümrüt-Turkuaz Geçiş) */}
              <path
                d="M116 18 C154 40, 174 72, 178 104 L116 104 Z"
                fill="url(#mainSailGrad)"
              />
              {/* Direk Tepesi Altın Yıldız/Fener */}
              <circle cx="110" cy="14" r="4" fill="#FBBF24" />

              {/* Geometrik Gemi Gövdesi (Sol Pruva İndigo -> Sağ Zümrüt) */}
              <path
                d="M32 108 L194 108 L172 134 C166 138, 156 140, 142 140 L72 140 C58 140, 48 136, 42 128 Z"
                fill="url(#hullGrad)"
              />
              {/* Güverte Işık Çizgisi */}
              <path
                d="M44 114 L182 114"
                stroke="#E0F2FE"
                strokeWidth="2"
                strokeOpacity="0.65"
                strokeLinecap="round"
              />
              {/* Lomboz Işıkları */}
              <circle cx="84" cy="125" r="3" fill="#FEF08A" />
              <circle cx="108" cy="125" r="3" fill="#FEF08A" />
              <circle cx="132" cy="125" r="3" fill="#FEF08A" />
            </svg>
            {/* Su Üzerindeki Işık Yansıması */}
            <div className="w-36 h-2.5 -mt-2 rounded-full bg-gradient-to-r from-indigo-500/30 via-emerald-400/50 to-teal-300/30 blur-sm" />
          </div>
        </div>

        {/* Alt Kenarda Derinlikli İki Katmanlı Zümrüt-Turkuaz Deniz Ufku */}
        <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-16 overflow-hidden pointer-events-none z-20">
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="wave-a absolute bottom-0 left-0 w-[200%] h-14 opacity-50"
          >
            <path
              d="M0,45 C150,88 300,6 450,45 C600,88 750,6 900,45 C1050,88 1125,22 1200,45 L1200,100 L0,100 Z"
              fill="#0D9488"
            />
          </svg>
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="wave-b absolute bottom-0 left-0 w-[200%] h-10 opacity-75"
          >
            <path
              d="M0,55 C180,15 320,90 500,50 C680,10 820,85 1000,48 C1100,28 1150,65 1200,55 L1200,100 L0,100 Z"
              fill="#10B981"
            />
          </svg>
        </div>
      </div>

      {/* 3. ALT BÖLÜM: 5 MODÜL ŞERİDİ */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full max-w-5xl shrink-0">
        {MODULES.map((mod) => (
          <div
            key={mod.id}
            className={`${mod.spanClass} flex items-center gap-2 px-2.5 py-2 rounded-xl border ${mod.accent}`}
          >
            <span className="text-base sm:text-lg leading-none shrink-0">{mod.emoji}</span>
            <div className="min-w-0 leading-tight">
              <div className="text-[11px] font-black truncate">{mod.title}</div>
              <div className="text-[9.5px] opacity-80 truncate">{mod.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. TEK SATIR ÖZET & MERKEZİ AKSİYON SATIRI */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-2 shrink-0 pt-1">
        <p className="text-[11px] sm:text-xs text-slate-400 text-center truncate max-w-full px-2">
          Kelime havuzun, okuma odan, konuşma stüdyon, oyun arenan ve sınıfın tek bir akıllı gemide seni bekliyor.
        </p>

        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            data-testid="welcome-register-btn"
            onClick={onOpenRegister}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>🚀 Ücretsiz Kayıt Ol</span>
          </button>

          <button
            type="button"
            data-testid="welcome-login-btn"
            onClick={onOpenLogin}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-400/50 backdrop-blur-md text-slate-100 font-extrabold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>🔑 Giriş Yap</span>
          </button>

          <button
            type="button"
            data-testid="welcome-bottom-skip-btn"
            onClick={onSkip}
            className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>Atla</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
