"use client";

import React from "react";
import { ArrowRight, Coins, Globe, Users, Volume2 } from "lucide-react";
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
        @keyframes arrowGlide {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(3px); }
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
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 0.95; transform: scale(1.35); }
        }
        .sail-float { animation: float 4s ease-in-out infinite; }
        .card-float-a { animation: cardFloatA 4.8s ease-in-out infinite; }
        .card-float-b { animation: cardFloatB 5.2s ease-in-out infinite; }
        .speak-bar { transform-origin: bottom; animation: waveBar 1.1s ease-in-out infinite; }
        .arrow-glide { display: inline-block; animation: arrowGlide 1.8s ease-in-out infinite; }
        .wave-a { animation: waveFlowA 9s linear infinite; }
        .wave-b { animation: waveFlowB 12s linear infinite; }
        .sparkle-dot { animation: sparklePulse 3.2s ease-in-out infinite; }
      `}</style>

      {/* 1. GENİŞLETİLMİŞ MERKEZİ VİTRİN KUTUSU (Aydınlık Aurora + 6 Yüzen Kart) */}
      <div className="relative w-full max-w-6xl flex-1 max-h-[72vh] rounded-3xl border border-slate-700/70 bg-gradient-to-b from-[#0C162D] via-[#0F1E3A] to-[#0B2930] overflow-hidden flex items-center justify-center px-5 py-4 sm:px-8 shadow-[0_0_70px_rgba(16,185,129,0.14)]">
        {/* Merkezde Yumuşak Zümrüt-İndigo Aurora Işık Halesi */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16)_0%,rgba(99,102,241,0.12)_42%,transparent_75%)] pointer-events-none" />

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

        {/* Parıltılar */}
        {SPARKLES.map((sp, i) => (
          <span
            key={i}
            style={{ top: sp.top, left: sp.left, animationDelay: sp.delay }}
            className={`sparkle-dot absolute ${sp.size} rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)] pointer-events-none`}
          />
        ))}

        {/* 3 Sütunlu Dengeli Yerleşim */}
        <div className="relative z-10 w-full h-full grid grid-cols-1 md:grid-cols-12 items-center gap-5 pb-5">
          {/* SOL SÜTUN: Word Pool + Speaking Studio + Sınıfım */}
          <div className="hidden md:flex md:col-span-4 flex-col justify-between gap-3 h-full py-4 pointer-events-none">
            {/* 1. Word Pool Kartı */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-xl card-float-a">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex w-fit items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-xs font-semibold text-indigo-300">
                  🃏 {t("welcome_mod_wordpool_title", "Kelime Havuzu")}
                </span>
                <Volume2 className="w-4 h-4 text-indigo-300 animate-pulse shrink-0" />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-extrabold text-white tracking-tight">resilient</span>
                <span className="text-xs font-mono text-indigo-300">/rɪˈzɪliənt/</span>
              </div>
              <p className="text-sm text-slate-200 font-medium">
                {t("welcome_card_sm2_meaning", "dirençli, çabuk toparlanan")}
              </p>
            </div>

            {/* 2. Speaking Studio Kartı */}
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-xl card-float-b">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-xs font-semibold text-violet-300">
                  🎙️ {t("welcome_mod_speaking_title", "Konuşma Stüdyosu")}
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
              <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-sm font-semibold text-emerald-300">
                {t("welcome_card_speak_xp", "Great pronunciation! +25 XP")}
              </div>
            </div>

            {/* 3. Sınıfım Kartı */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-xl card-float-a">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/35 text-xs font-semibold text-indigo-200">
                  🎓 {t("welcome_mod_classroom_title", "Sınıfım")}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950/85 border border-teal-500/40 font-mono text-xs font-semibold text-teal-300">
                  PIN: 7A2-5K9
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 truncate">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="truncate">
                    {t("welcome_card_class_live", "Canlı Tahta & Ödev").replace(/^●\s*/, "")}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 shrink-0">
                  <Users className="w-3.5 h-3.5 text-teal-300" />
                  24
                </span>
              </div>
            </div>
          </div>

          {/* MERKEZ SÜTUN: Taç Rozet + VocaShip Logosu & Sloganı */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center px-2">
            <span className="-mt-4 sm:-mt-6 mb-7 sm:mb-9 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm sm:text-base font-bold tracking-wide bg-emerald-950/70 border border-emerald-400/40 text-emerald-300 shadow-lg shadow-emerald-500/10">
              <span className="text-base sm:text-lg leading-none">✨</span>
              <span>
                {t("welcome_badge", "✨ Yeni Nesil Akıllı Dil Platformu").replace(/^✨\s*/, "")}
              </span>
            </span>

            <div className="sail-float mb-3 p-3.5 rounded-3xl bg-slate-900/65 border border-emerald-400/30 shadow-[0_14px_40px_rgba(16,185,129,0.28)]">
              <VocaShipLogo
                variant="icon"
                className="w-16 h-16 sm:w-22 sm:h-22"
              />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
              Voca<span className="text-[#10B981]">Ship</span>
            </h1>
            <p className="mt-2 text-sm sm:text-lg font-extrabold bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">
              Sail to Fluency.
            </p>
          </div>

          {/* SAĞ SÜTUN: Reading Room + AI İçerik Stüdyosu + Game Arena */}
          <div className="hidden md:flex md:col-span-4 flex-col justify-between gap-3 h-full py-4 pt-10 pointer-events-none">
            {/* 1. Reading Room Kartı */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-xl card-float-b">
              <span className="inline-flex w-fit items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-xs font-semibold text-sky-300">
                📖 {t("welcome_mod_reading_title", "Okuma Odası")}
              </span>
              <p className="text-sm text-slate-100 leading-snug">
                &ldquo;She delivered an{" "}
                <span className="px-1.5 py-0.5 rounded ring-1 ring-sky-400/50 bg-sky-500/20 text-sky-200 font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                  eloquent
                </span>{" "}
                speech.&rdquo;
              </p>
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700/80 text-sm font-semibold text-amber-300">
                {t("welcome_card_read_meaning", "💬 akıcı ve etkileyici")}
              </div>
            </div>

            {/* 2. AI Content Studio Kartı */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-xl card-float-a">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-xs font-semibold text-indigo-300">
                  ✨ {t("welcome_ai_studio_badge", "AI İçerik Stüdyosu")}
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/35 text-xs font-semibold text-indigo-200 animate-pulse">
                  AI ⚡
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5 truncate">
                <span>📄</span>
                <span className="truncate flex items-center gap-1">
                  {t("welcome_ai_studio_desc", "Metin Yapıştır → Anında Kelime Analizi")
                    .split("→")
                    .map((part, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span>{part.trim()}</span>
                        {idx < arr.length - 1 && (
                          <span className="arrow-glide text-emerald-300 font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                </span>
              </p>
            </div>

            {/* 3. Game Arena Kartı */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-700/80 shadow-xl card-float-b">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-xs font-semibold text-amber-300">
                  🏆 {t("welcome_mod_arena_title", "Oyun Arenası")}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                  <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  {t("welcome_gold_reward", "+120 Altın")}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-100">
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

      {/* 2. TEK SATIR AÇIKLAMA & 3 TEMİZ AKSİYON */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-2.5 shrink-0">
        <p className="text-sm sm:text-base text-slate-300 text-center truncate max-w-full px-2">
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
