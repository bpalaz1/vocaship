"use client";

import React, { useState } from "react";
import { ArrowRight, RotateCw, Sparkles, Volume2 } from "lucide-react";
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

const DEMO_CARDS = [
  {
    word: "resilient",
    phonetic: "/rɪˈzɪliənt/",
    meaning: "dirençli, çabuk toparlanan",
    example: "Children are remarkably resilient.",
  },
  {
    word: "eloquent",
    phonetic: "/ˈeləkwənt/",
    meaning: "akıcı, etkileyici konuşan",
    example: "She delivered an eloquent speech on stage.",
  },
  {
    word: "endeavor",
    phonetic: "/ɪnˈdevər/",
    meaning: "çaba, girişim, gayret",
    example: "Learning a language is a rewarding endeavor.",
  },
];

const READING_WORDS: Record<
  "eloquent" | "horizon",
  { word: string; phonetic: string; meaning: string; pos: string }
> = {
  eloquent: {
    word: "eloquent",
    phonetic: "/ˈeləkwənt/",
    meaning: "akıcı, güzel ve etkileyici",
    pos: "sıfat",
  },
  horizon: {
    word: "horizon",
    phonetic: "/həˈraɪzən/",
    meaning: "ufuk, görüş alanı",
    pos: "isim",
  },
};

export default function WelcomeVoyageModal({
  isOpen,
  onSkip,
  onOpenRegister,
  onOpenLogin,
}: WelcomeVoyageModalProps) {
  const [demoTab, setDemoTab] = useState<"flashcard" | "reading">("flashcard");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<"eloquent" | "horizon">("eloquent");

  if (!isOpen) return null;

  const activeCard = DEMO_CARDS[cardIndex % DEMO_CARDS.length];
  const activeReadingWord = READING_WORDS[selectedWord];

  const speakWord = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.92;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  const handleRateDemo = (xpLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setXpToast(xpLabel);
    setTimeout(() => {
      setXpToast(null);
      setIsFlipped(false);
      setCardIndex((prev) => (prev + 1) % DEMO_CARDS.length);
    }, 650);
  };

  return (
    <div
      data-testid="welcome-voyage-modal"
      className="fixed inset-0 z-[110] h-dvh w-screen overflow-hidden bg-[#070B14] flex flex-col items-center justify-between px-4 py-3 sm:py-4 text-slate-100 animate-in fade-in duration-300"
    >
      <style>{`
        @keyframes waveFlowA {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes waveFlowB {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .wave-a { animation: waveFlowA 10s linear infinite; }
        .wave-b { animation: waveFlowB 13s linear infinite; }
      `}</style>

      {/* 1. ÜST BAR (Giriş Yap • Kayıt Ol • Atla) */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 gap-2 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Yeni Nesil Akıllı Dil Platformu</span>
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

      {/* 2. MERKEZİ BÖLÜNMÜŞ SAHNE KUTUSU (Sol Marka, Sağ Tıklanabilir Mini Demo) */}
      <div className="w-full max-w-5xl flex-1 max-h-[58vh] md:max-h-[54vh] my-1.5 rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#070D1A] via-[#0B162C] to-[#081F26] relative overflow-hidden grid grid-cols-1 md:grid-cols-12 items-center px-5 py-5 sm:px-8 sm:py-6 gap-4 sm:gap-6 shadow-[0_0_60px_rgba(16,185,129,0.10)]">
        {/* Arka Plan Aurora Işığı */}
        <div className="absolute -top-12 left-10 w-64 h-48 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-8 right-10 w-72 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* SOL SÜTUN: Tek Marka Odağı & Hızlı Aksiyonlar */}
        <div className="md:col-span-5 flex flex-col items-start justify-center text-left space-y-2.5 sm:space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-slate-900/80 border border-emerald-400/25 shadow-[0_8px_24px_rgba(16,185,129,0.18)] shrink-0">
              <VocaShipLogo variant="icon" className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-none">
                Voca<span className="text-[#10B981]">Ship</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
                Sail to Fluency.
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
            Kelime havuzun, okuma odan, konuşma stüdyon, oyun arenan ve sınıfın tek bir akıllı gemide.
          </p>

          <div className="flex flex-row items-center gap-2.5 pt-1 w-full sm:w-auto">
            <button
              type="button"
              data-testid="welcome-register-btn"
              onClick={onOpenRegister}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              🚀 Ücretsiz Başla
            </button>
            <button
              type="button"
              data-testid="welcome-login-btn"
              onClick={onOpenLogin}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-400/50 text-slate-100 font-extrabold text-xs sm:text-sm transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              🔑 Giriş Yap
            </button>
          </div>
        </div>

        {/* SAĞ SÜTUN: Ziyaretçinin Tıklayabileceği Canlı Mini Demo Kutusu */}
        <div className="md:col-span-7 flex flex-col justify-center relative z-10">
          <div className="bg-slate-950/85 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3">
            {/* Demo Sekmeleri */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDemoTab("flashcard")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    demoTab === "flashcard"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🃏 Canlı SM-2 Kart
                </button>
                <button
                  type="button"
                  onClick={() => setDemoTab("reading")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    demoTab === "reading"
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📖 İnteraktif Okuma
                </button>
              </div>

              {xpToast ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black animate-bounce">
                  {xpToast}
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400">
                  {demoTab === "flashcard" ? "Tıkla & Dene" : "Kelimeye Tıkla"}
                </span>
              )}
            </div>

            {/* SEKME 1: Tıklanabilir SM-2 Kelime Kartı */}
            {demoTab === "flashcard" ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsFlipped((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsFlipped((prev) => !prev);
                  }
                }}
                className="relative rounded-xl border border-slate-700/80 hover:border-emerald-400/50 bg-gradient-to-br from-slate-900/95 to-slate-900/70 p-4 cursor-pointer transition-all duration-200 select-none"
              >
                {!isFlipped ? (
                  <div className="flex flex-col items-center text-center py-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {activeCard.word}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => speakWord(activeCard.word, e)}
                        aria-label="Telaffuzu dinle"
                        className="p-1.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/30 text-indigo-300 transition cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs font-mono text-indigo-300">
                      {activeCard.phonetic}
                    </span>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 pt-1">
                      <RotateCw className="w-3 h-3 text-emerald-400" />
                      <span>Çevirmek için karta tıkla</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2 animate-in fade-in duration-150">
                    <span className="text-base sm:text-lg font-black text-emerald-300">
                      {activeCard.meaning}
                    </span>
                    <p className="text-xs text-slate-300 italic">
                      &ldquo;{activeCard.example}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleRateDemo("+10 XP!", e)}
                        className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 text-[11px] font-bold transition cursor-pointer"
                      >
                        Zorlandım
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRateDemo("+15 XP!", e)}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 text-[11px] font-bold transition cursor-pointer"
                      >
                        Çok Kolay
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* SEKME 2: Tıklanabilir Okuma Odası Cümlesi */
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  &ldquo;Her{" "}
                  <button
                    type="button"
                    onClick={() => setSelectedWord("eloquent")}
                    className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                      selectedWord === "eloquent"
                        ? "bg-sky-500/30 border border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.35)]"
                        : "bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25"
                    }`}
                  >
                    eloquent
                  </button>{" "}
                  words inspired the crew as they sailed toward the distant{" "}
                  <button
                    type="button"
                    onClick={() => setSelectedWord("horizon")}
                    className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                      selectedWord === "horizon"
                        ? "bg-emerald-500/30 border border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                        : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                    }`}
                  >
                    horizon
                  </button>
                  .&rdquo;
                </p>

                {/* Mini Sözlük Baloncuğu */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border border-sky-500/30">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">
                        {activeReadingWord.word}
                      </span>
                      <span className="text-[10px] font-mono text-sky-300">
                        {activeReadingWord.phonetic}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-300">
                        {activeReadingWord.pos}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-300 truncate mt-0.5">
                      💬 {activeReadingWord.meaning}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => speakWord(activeReadingWord.word, e)}
                    aria-label="Kelimeyi dinle"
                    className="p-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/30 text-sky-300 shrink-0 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alt Kenarda İnce Çift Katmanlı Zümrüt-Turkuaz Dalga Şeridi */}
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-10 overflow-hidden pointer-events-none">
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="wave-a absolute bottom-0 left-0 w-[200%] h-8 opacity-40"
          >
            <path
              d="M0,45 C150,88 300,6 450,45 C600,88 750,6 900,45 C1050,88 1125,22 1200,45 L1200,100 L0,100 Z"
              fill="#0D9488"
            />
          </svg>
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="wave-b absolute bottom-0 left-0 w-[200%] h-6 opacity-65"
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
    </div>
  );
}
