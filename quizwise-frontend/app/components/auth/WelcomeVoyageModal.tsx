"use client";

import React from "react";
import { ArrowRight, Coins, Globe, Users } from "lucide-react";
import { VocaShipLogo } from "../brand/VocaShipLogo";
import { Language, useLanguage } from "../../context/LanguageContext";

export interface WelcomeVoyageModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

const WELCOME_LANGS: { code: Language; label: string }[] = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
  { code: "it", label: "IT" },
  { code: "ru", label: "RU" },
];

const SPARKLES = [
  { top: "14%", left: "34%", delay: "0s", size: "w-1.5 h-1.5" },
  { top: "20%", left: "66%", delay: "0.9s", size: "w-2 h-2" },
  { top: "68%", left: "38%", delay: "1.6s", size: "w-1 h-1" },
  { top: "64%", left: "62%", delay: "2.2s", size: "w-1.5 h-1.5" },
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
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const modules = [
    {
      id: "wordpool",
      emoji: "🃏",
      title: t("welcome_mod_wordpool_title", "Word Pool"),
      subtitle: t("welcome_mod_wordpool_sub", "Akıllı Tekrar Kartları"),
      accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
      spanClass: "",
    },
    {
      id: "reading",
      emoji: "📖",
      title: t("welcome_mod_reading_title", "Reading Room"),
      subtitle: t("welcome_mod_reading_sub", "İnteraktif Hikayeler"),
      accent: "border-sky-500/30 bg-sky-500/10 text-sky-200",
      spanClass: "",
    },
    {
      id: "speaking",
      emoji: "🎙️",
      title: t("welcome_mod_speaking_title", "Speaking Studio"),
      subtitle: t("welcome_mod_speaking_sub", "Canlı AI Konuşma"),
      accent: "border-violet-500/30 bg-violet-500/10 text-violet-200",
      spanClass: "",
    },
    {
      id: "arena",
      emoji: "🏆",
      title: t("welcome_mod_arena_title", "Game Arena"),
      subtitle: t("welcome_mod_arena_sub", "Yarış, Kazan, Yüksel"),
      accent: "border-amber-500/30 bg-amber-500/10 text-amber-200",
      spanClass: "",
    },
    {
      id: "classroom",
      emoji: "🎓",
      title: t("welcome_mod_classroom_title", "Sınıfım"),
      subtitle: t("welcome_mod_classroom_sub", "Canlı Tahta & Ödevler"),
      accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
      spanClass: "col-span-2 sm:col-span-1",
    },
  ];

  return (
    <div
      data-testid="welcome-voyage-modal"
      className="fixed inset-0 z-[110] h-dvh w-screen overflow-hidden bg-[#070B14] flex flex-col items-center justify-between px-4 py-4 sm:py-5 gap-3 text-slate-100 animate-in fade-in duration-300"
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1.2deg); }
          50% { transform: translateY(-7px) rotate(1.2deg); }
        }
        @keyframes cardFloatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes cardFloatB {
          0%, 100% { transform: translateY(-3px); }
          50% { transform: translateY(3px); }
        }
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.42); }
          50% { transform: scaleY(1); }
        }
        @keyframes waveFlowA {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes waveFlowB {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes sparklePulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.35); }
        }
        .sail-float { animation: float 4s ease-in-out infinite; }
        .card-float-a { animation: cardFloatA 4.8s ease-in-out infinite; }
        .card-float-b { animation: cardFloatB 5.2s ease-in-out infinite; }
        .speak-bar { transform-origin: bottom; animation: waveBar 1.1s ease-in-out infinite; }
        .wave-a { animation: waveFlowA 9s linear infinite; }
        .wave-b { animation: waveFlowB 12s linear infinite; }
        .sparkle-dot { animation: sparklePulse 3.2s ease-in-out infinite; }
      `}</style>

      {/* 1. MERKEZİ VİTRİN KUTUSU (Dengeli 3 Sütun + Sağ Üst Dil Seçici) */}
      <div className="relative w-full max-w-5xl flex-1 max-h-[60vh] rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#070D1A] via-[#0B162C] to-[#081F26] overflow-hidden flex items-center justify-center px-5 py-3 sm:px-7 shadow-[0_0_60px_rgba(16,185,129,0.10)]">
        {/* Sağ Üst Köşe: Kompakt Dil Seçici (🌐 TR / EN / DE / ES / FR / IT / RU) */}
        <div
          data-testid="welcome-lang-switcher"
          className="absolute top-3 right-3 sm:top-3.5 sm:right-4 z-30 inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400 mr-1 shrink-0" />
          {WELCOME_LANGS.map((item) => {
            const active = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                data-testid={`welcome-lang-${item.code}`}
                onClick={() => setLanguage(item.code)}
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-wide transition cursor-pointer ${
                  active
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

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

        {/* 3 Sütunlu Dengeli Yerleşim */}
        <div className="relative z-10 w-full h-full grid grid-cols-1 md:grid-cols-12 items-center gap-4 pb-5">
          {/* SOL SÜTUN: Akıllı Tekrar Kartı + Speaking Studio (Tam Ortada) + Sınıfım */}
          <div className="hidden md:flex md:col-span-3 lg:col-span-4 flex-col justify-between gap-2.5 h-full py-4 pointer-events-none">
            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/70 shadow-xl card-float-a">
              <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-[10px] font-extrabold text-indigo-300">
                {t("welcome_card_sm2_badge", "🃏 Akıllı Tekrar Kartı")}
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm sm:text-base font-black text-white tracking-tight">resilient</span>
                <span className="text-[10.5px] font-mono text-indigo-300">/rɪˈzɪliənt/</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {t("welcome_card_sm2_meaning", "dirençli, çabuk toparlanan")}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-emerald-500/30 shadow-xl card-float-b">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-[10px] font-extrabold text-violet-300">
                  {t("welcome_card_speak_badge", "🎙️ Speaking Studio")}
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
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-[10.5px] font-bold text-emerald-300">
                {t("welcome_card_speak_xp", "Great pronunciation! +25 XP")}
              </div>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-teal-500/40 shadow-xl card-float-a">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/35 text-[10px] font-extrabold text-indigo-200">
                  {t("welcome_card_class_badge", "🎓 Sınıfım")}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-950/90 border border-teal-500/40 font-mono text-[10px] font-black text-teal-300">
                  PIN: 7A2-5K9
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-bold text-emerald-300 truncate">
                  {t("welcome_card_class_live", "● Canlı Tahta & Ödev")}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 shrink-0">
                  <Users className="w-3 h-3 text-teal-300" />
                  24
                </span>
              </div>
            </div>
          </div>

          {/* MERKEZ SÜTUN: Taç Rozet + VocaShip Logosu & Sloganı */}
          <div className="md:col-span-6 lg:col-span-4 flex flex-col items-center justify-center text-center px-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 mb-3">
              {t("welcome_badge", "✨ Yeni Nesil Akıllı Dil Platformu")}
            </span>

            <div className="sail-float mb-2.5 p-3 rounded-3xl bg-slate-900/55 border border-emerald-400/25 shadow-[0_12px_35px_rgba(16,185,129,0.22)]">
              <VocaShipLogo
                variant="icon"
                className="w-16 h-16 sm:w-20 sm:h-20"
              />
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none">
              Voca<span className="text-[#10B981]">Ship</span>
            </h1>
            <p className="mt-1.5 text-sm sm:text-lg font-extrabold bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">
              Sail to Fluency.
            </p>
          </div>

          {/* SAĞ SÜTUN: Reading Room + Game Arena (2 Kart, Ferah Aralık) */}
          <div className="hidden md:flex md:col-span-3 lg:col-span-4 flex-col justify-between gap-8 h-full py-4 pt-10 pointer-events-none">
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/70 shadow-xl card-float-b">
              <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[10px] font-extrabold text-sky-300">
                {t("welcome_card_read_badge", "📖 Reading Room")}
              </span>
              <p className="text-[11px] text-slate-200 leading-snug">
                &ldquo;She delivered an{" "}
                <span className="px-1.5 py-0.5 rounded bg-sky-500/25 border border-sky-400/40 text-sky-200 font-bold">
                  eloquent
                </span>{" "}
                speech.&rdquo;
              </p>
              <div className="px-2 py-1 rounded-lg bg-slate-950/90 border border-slate-700/80 text-[10.5px] font-semibold text-amber-300">
                {t("welcome_card_read_meaning", "💬 akıcı ve etkileyici")}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-500/40 shadow-xl card-float-a">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-[10px] font-extrabold text-amber-300">
                  {t("welcome_card_arena_badge", "🏆 Game Arena")}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {t("welcome_gold_reward", "+120 Altın")}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-200">
                {t("welcome_boss_rank", "🐉 Ejderha Baskını • 1. Sıra")}
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kenarda İnce Çift Katmanlı Zümrüt-Turkuaz Dalga Ufku */}
        <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 overflow-hidden pointer-events-none">
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="wave-a absolute bottom-0 left-0 w-[200%] h-10 opacity-45"
          >
            <path
              d="M0,45 C150,88 300,6 450,45 C600,88 750,6 900,45 C1050,88 1125,22 1200,45 L1200,100 L0,100 Z"
              fill="#0D9488"
            />
          </svg>
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="wave-b absolute bottom-0 left-0 w-[200%] h-7 opacity-70"
          >
            <path
              d="M0,55 C180,15 320,90 500,50 C680,10 820,85 1000,48 C1100,28 1150,65 1200,55 L1200,100 L0,100 Z"
              fill="#10B981"
            />
          </svg>
        </div>
      </div>

      {/* 2. ALT BÖLÜM: 5 MODÜL ŞERİDİ */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full max-w-5xl shrink-0">
        {modules.map((mod) => (
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

      {/* 3. TEK SATIR AÇIKLAMA & 3 TEMİZ AKSİYON */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-2.5 shrink-0">
        <p className="text-[11px] sm:text-xs text-slate-400 text-center truncate max-w-full px-2">
          {t(
            "welcome_subtitle_full",
            "Kelime havuzun, okuma odan, konuşma stüdyon, oyun arenan ve sınıfın tek bir akıllı gemide seni bekliyor."
          )}
        </p>

        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            data-testid="welcome-register-btn"
            onClick={onOpenRegister}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>🚀 {t("welcome_btn_register", "Ücretsiz Kayıt Ol")}</span>
          </button>

          <button
            type="button"
            data-testid="welcome-login-btn"
            onClick={onOpenLogin}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-400/50 backdrop-blur-md text-slate-100 font-extrabold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>🔑 {t("welcome_btn_login", "Giriş Yap")}</span>
          </button>

          <button
            type="button"
            data-testid="welcome-skip-btn"
            onClick={onSkip}
            className="px-3.5 sm:px-5 py-2.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>{t("welcome_btn_skip", "Atla")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
