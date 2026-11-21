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

const SPARKLES = [
  { top: "18%", left: "16%", delay: "0s", size: "w-1.5 h-1.5" },
  { top: "26%", left: "78%", delay: "0.9s", size: "w-2 h-2" },
  { top: "48%", left: "24%", delay: "1.6s", size: "w-1 h-1" },
  { top: "34%", left: "66%", delay: "2.2s", size: "w-1.5 h-1.5" },
  { top: "15%", left: "52%", delay: "1.2s", size: "w-1 h-1" },
  { top: "54%", left: "84%", delay: "0.4s", size: "w-1.5 h-1.5" },
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
      className="fixed inset-0 z-[110] h-dvh w-screen overflow-hidden bg-[#070B14] flex flex-col items-center justify-between px-4 py-4 sm:py-6 text-slate-100 animate-in fade-in duration-300"
    >
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(-1.5deg);
          }
          50% {
            transform: translateY(-9px) rotate(1.5deg);
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

      {/* 1. ÜST SATIR: Yalnızca Zarif Rozet + Atla Butonu (Çift Logo Yok) */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 shrink-0">
        <div className="w-16 hidden sm:block" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-[11px] font-extrabold tracking-wider uppercase mx-auto sm:mx-0">
          <span>🧭 DİL YOLCULUĞUNA YELKEN AÇ</span>
        </div>
        <button
          type="button"
          data-testid="welcome-skip-btn"
          onClick={onSkip}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer shrink-0"
        >
          <span>Atla</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. MERKEZİ CANLI YELKENLİ & DALGA SAHNESİ */}
      <div className="relative w-full max-w-4xl flex-1 max-h-[46vh] my-2 rounded-3xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-[#0B1222] via-[#091526] to-[#081C24] flex flex-col items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.10)]">
        {/* Arka Plan Atmosferik Işık & Hareketli Parıltılar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/3 w-48 h-32 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        {SPARKLES.map((sp, i) => (
          <span
            key={i}
            style={{ top: sp.top, left: sp.left, animationDelay: sp.delay }}
            className={`sparkle-dot absolute ${sp.size} rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)] pointer-events-none`}
          />
        ))}

        {/* Kurumsal V + Açılan Kitap Yelkeni Süzülen Gemi & Tek Marka Odağı */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pb-6 sm:pb-8">
          <div className="sail-float mb-2 sm:mb-3 p-3 rounded-3xl bg-slate-900/50 border border-emerald-400/25 shadow-[0_12px_35px_rgba(16,185,129,0.22)]">
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

        {/* Alt Kenarda İki Katmanlı Zümrüt-Turkuaz Akan SVG Deniz Dalgası */}
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

      {/* 3. 5 MODÜL ŞERİDİ (Sınıfım Dahil) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full max-w-4xl shrink-0">
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

      {/* 4. ALT AKSİYON BUTONLARI & TEK SATIR AÇIKLAMA */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-2.5 shrink-0 pt-1">
        <p className="text-[11px] sm:text-xs text-slate-400 text-center truncate max-w-full px-2">
          Kelime havuzun, okuma odan, konuşma stüdyon, oyun arenan ve sınıfın tek bir akıllı gemide seni bekliyor.
        </p>

        <div className="flex flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            data-testid="welcome-register-btn"
            onClick={onOpenRegister}
            className="flex-1 sm:flex-none sm:w-48 py-2.5 sm:py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀 Kayıt Ol</span>
          </button>

          <button
            type="button"
            data-testid="welcome-login-btn"
            onClick={onOpenLogin}
            className="flex-1 sm:flex-none sm:w-48 py-2.5 sm:py-3 px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-400/50 backdrop-blur-md text-slate-100 font-extrabold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🔑 Giriş Yap</span>
          </button>
        </div>
      </div>
    </div>
  );
}
