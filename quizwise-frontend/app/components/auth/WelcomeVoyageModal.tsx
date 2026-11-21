"use client";

import React from "react";
import { ArrowRight, Coins, Sparkles } from "lucide-react";
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

const SPARKLES = [
  { top: "14%", left: "34%", delay: "0s", size: "w-1.5 h-1.5" },
  { top: "20%", left: "66%", delay: "0.9s", size: "w-2 h-2" },
  { top: "62%", left: "36%", delay: "1.6s", size: "w-1 h-1" },
  { top: "58%", left: "65%", delay: "2.2s", size: "w-1.5 h-1.5" },
  { top: "12%", left: "50%", delay: "1.2s", size: "w-1 h-1" },
];

const WAVE_BARS = [
  { height: "45%", delay: "0s" },
  { height: "85%", delay: "0.15s" },
  { height: "100%", delay: "0.3s" },
  { height: "70%", delay: "0.45s" },
  { height: "50%", delay: "0.6s" },
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
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(-1.2deg);
          }
          50% {
            transform: translateY(-8px) rotate(1.2deg);
          }
        }
        @keyframes cardFloatA {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes cardFloatB {
          0%, 100% {
            transform: translateY(-4px);
          }
          50% {
            transform: translateY(4px);
          }
        }
        @keyframes waveBar {
          0%, 100% {
            transform: scaleY(0.45);
          }
          50% {
            transform: scaleY(1);
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
        @keyframes sparklePulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.35);
          }
        }
        .sail-float {
          animation: float 4s ease-in-out infinite;
        }
        .card-float-a {
          animation: cardFloatA 4.8s ease-in-out infinite;
        }
        .card-float-b {
          animation: cardFloatB 5.2s ease-in-out infinite;
        }
        .speak-bar {
          transform-origin: bottom;
          animation: waveBar 1.1s ease-in-out infinite;
        }
        .wave-a {
          animation: waveFlowA 8s linear infinite;
        }
        .wave-b {
          animation: waveFlowB 11s linear infinite;
        }
        .sparkle-dot {
          animation: sparklePulse 3.2s ease-in-out infinite;
        }
      `}</style>

      {/* 1. ÜST BAR (Kayıt Ol • Giriş Yap • Atla) */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 gap-2 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Yeni Nesil Dil Öğrenme Platformu</span>
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

      {/* 2. MERKEZİ SAHNE KUTUSU (Yüzen Mini Ürün Vitrini + Canlı Yelkenli) */}
      <div className="w-full max-w-5xl flex-1 max-h-[54vh] my-1.5 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#0B1222] via-[#091526] to-[#081C24] relative overflow-hidden flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.10)]">
        {/* Arka Plan Atmosferik Işık & Parıltılar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-12 left-1/3 w-52 h-36 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        {SPARKLES.map((sp, i) => (
          <span
            key={i}
            style={{ top: sp.top, left: sp.left, animationDelay: sp.delay }}
            className={`sparkle-dot absolute ${sp.size} rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)] pointer-events-none`}
          />
        ))}

        {/* SOL ÜST YÜZEN KART: SM-2 Akıllı Kart */}
        <div className="hidden md:flex flex-col gap-1.5 absolute top-5 left-5 lg:left-7 z-10 w-56 p-3.5 rounded-2xl bg-slate-950/75 border border-indigo-500/30 backdrop-blur-md shadow-xl card-float-a pointer-events-none">
          <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-[10px] font-extrabold text-indigo-300">
            🃏 SM-2 Kart
          </span>
          <div className="flex items-baseline justify-between gap-2 mt-0.5">
            <span className="text-base font-black text-white tracking-tight">resilient</span>
            <span className="text-[11px] font-mono text-indigo-300">/rɪˈzɪliənt/</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            dirençli, çabuk toparlanan
          </p>
        </div>

        {/* SOL ALT YÜZEN KART: AI Speaking & Ses Dalgası */}
        <div className="hidden md:flex flex-col gap-2 absolute bottom-12 left-5 lg:left-7 z-10 w-60 p-3.5 rounded-2xl bg-slate-950/75 border border-emerald-500/30 backdrop-blur-md shadow-xl card-float-b pointer-events-none">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-[10px] font-extrabold text-violet-300">
              🎙️ Speaking Studio
            </span>
            <div className="flex items-end gap-1 h-4">
              {WAVE_BARS.map((bar, idx) => (
                <span
                  key={idx}
                  style={{ height: bar.height, animationDelay: bar.delay }}
                  className="speak-bar w-1 rounded-full bg-emerald-400"
                />
              ))}
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-[11px] font-bold text-emerald-300">
            Great pronunciation! +25 XP
          </div>
        </div>

        {/* MERKEZ ODAK: Kurumsal V + Kitap Yelkeni & Tek Marka */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pb-6 sm:pb-8">
          <div className="sail-float mb-2.5 p-3 rounded-3xl bg-slate-900/55 border border-emerald-400/25 shadow-[0_12px_35px_rgba(16,185,129,0.22)]">
            <VocaShipLogo
              variant="icon"
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none">
            Voca<span className="text-emerald-400">Ship</span>
          </h1>
          <p className="mt-1.5 text-sm sm:text-lg font-extrabold bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">
            Sail to Fluency.
          </p>
        </div>

        {/* SAĞ ÜST YÜZEN KART: Okuma Odası İnteraktif Metin */}
        <div className="hidden md:flex flex-col gap-1.5 absolute top-5 right-5 lg:right-7 z-10 w-60 p-3.5 rounded-2xl bg-slate-950/75 border border-sky-500/30 backdrop-blur-md shadow-xl card-float-b pointer-events-none">
          <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[10px] font-extrabold text-sky-300">
            📖 Reading Room
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">
            &ldquo;She delivered an{" "}
            <span className="px-1.5 py-0.5 rounded bg-sky-500/25 border border-sky-400/40 text-sky-200 font-bold">
              eloquent
            </span>{" "}
            speech.&rdquo;
          </p>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-700/80 text-[11px] font-semibold text-amber-300">
            💬 akıcı ve etkileyici
          </div>
        </div>

        {/* SAĞ ALT YÜZEN KART: Oyun Arenası & Sınıfım */}
        <div className="hidden md:flex flex-col gap-2 absolute bottom-12 right-5 lg:right-7 z-10 w-56 p-3.5 rounded-2xl bg-slate-950/75 border border-amber-500/30 backdrop-blur-md shadow-xl card-float-a pointer-events-none">
          <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-[10px] font-extrabold text-amber-300">
            🏆 Arena &amp; Sınıfım
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              +120 Altın
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
              ● Canlı Sınıf
            </span>
          </div>
        </div>

        {/* Alt Kenarda Çift Katmanlı Zümrüt-Turkuaz Dalga Ufku */}
        <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-16 overflow-hidden pointer-events-none">
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="wave-a absolute bottom-0 left-0 w-[200%] h-14 opacity-45"
          >
            <path
              d="M0,45 C150,88 300,6 450,45 C600,88 750,6 900,45 C1050,88 1125,22 1200,45 L1200,100 L0,100 Z"
              fill="#0D9488"
            />
          </svg>
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="wave-b absolute bottom-0 left-0 w-[200%] h-10 opacity-70"
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
