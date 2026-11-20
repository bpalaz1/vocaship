"use client";

import React from "react";
import {
  X,
  User,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  Flame,
  Radio,
  Gamepad2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAppTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export interface GameModeInfo {
  mode: string;
  title: string;
  badge?: string;
  colorTheme?: string;
  icon?: React.ReactNode;
}

interface GameModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameModeInfo | null;
  onSelectSolo: () => void;
  onSelectMultiplayer: () => void;
  isEducator?: boolean;
}

export default function GameModeSelectModal({
  isOpen,
  onClose,
  game,
  onSelectSolo,
  onSelectMultiplayer,
  isEducator = false,
}: GameModeSelectModalProps) {
  const { isDark } = useAppTheme();
  const { t } = useLanguage();
  if (!isOpen || !game) return null;

  // Sıfır gecikmeli hafif click efekti
  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden ${
          isDark
            ? "bg-slate-900/95 border-slate-800 shadow-indigo-950/50"
            : "bg-[#f8fafc] border-slate-300 shadow-slate-900/20"
        }`}
      >
        {/* Dekoratif Arka Plan Glow Efekti */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Başlığı */}
        <div className={`flex items-center justify-between pb-4 border-b relative z-10 ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-600/20 flex items-center justify-center text-white shrink-0">
              {game.icon || <Gamepad2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {game.title}
                </h3>
                {game.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-indigo-100 text-indigo-800 border-indigo-200"}`}>
                    {game.badge}
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {t("mode_select_prompt")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${isDark ? "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800" : "bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300"}`}
            title={t("lib_close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Büyük Etkileşimli Seçim Kartı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {/* Kart 1: Tek Başına Oyna */}
          <div
            onClick={() => {
              playClickSound();
              onSelectSolo();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                playClickSound();
                onSelectSolo();
              }
            }}
            className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 space-y-4 ${
              isDark
                ? "bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/60"
                : "bg-white hover:bg-indigo-50/40 border-slate-300 hover:border-indigo-400"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all ${isDark ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" : "bg-indigo-100 border-indigo-200 text-indigo-700"}`}>
                  <User className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${isDark ? "bg-indigo-950/80 text-indigo-300 border-indigo-400/30" : "bg-indigo-100 text-indigo-800 border-indigo-200"}`}>
                  {t("mode_solo_badge")}
                </span>
              </div>

              <div>
                <h4 className={`text-base font-bold transition-colors flex items-center gap-1.5 ${isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"}`}>
                  <span>{t("mode_solo_title")}</span>
                </h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {t("mode_solo_desc")}
                </p>
              </div>

              <div className={`flex flex-wrap gap-1.5 text-[10px] pt-1 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-300"}`}>
                  <Flame className="w-3 h-3 text-rose-500" />
                  <span>{t("games_streak_unit")}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-300"}`}>
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>{t("games_xp_unit")}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 transition group-hover:translate-x-0.5"
            >
              <span>{t("mode_solo_cta")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Kart 2: Sınıfça Canlı Yarış */}
          <div
            onClick={() => {
              playClickSound();
              onSelectMultiplayer();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                playClickSound();
                onSelectMultiplayer();
              }
            }}
            className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-amber-500/10 space-y-4 ${
              isDark
                ? "bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-amber-500/60"
                : "bg-white hover:bg-amber-50/40 border-slate-300 hover:border-amber-400"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all ${isDark ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : "bg-amber-100 border-amber-300 text-amber-700"}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${isDark ? "bg-amber-950/80 text-amber-300 border-amber-400/30" : "bg-amber-100 text-amber-900 border-amber-300"}`}>
                  <Radio className="w-3 h-3 animate-pulse text-amber-500" />
                  <span>{t("mode_multi_badge")}</span>
                </span>
              </div>

              <div>
                <h4 className={`text-base font-bold transition-colors flex items-center gap-1.5 ${isDark ? "text-white group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-700"}`}>
                  <span>{t("mode_multi_title")}</span>
                </h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {t("mode_multi_desc")}
                </p>
              </div>

              <div className={`flex flex-wrap gap-1.5 text-[10px] pt-1 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-300"}`}>
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span>{t("mode_multi_podium")}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-300"}`}>
                  <Sparkles className="w-3 h-3 text-cyan-500" />
                  <span>{t("mode_multi_live_rank")}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 transition group-hover:translate-x-0.5"
            >
              <span>{isEducator ? t("mode_multi_host_cta") : t("mode_multi_join_cta")}</span>
            </button>
          </div>
        </div>

        {/* Bilgilendirme Notu */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t("mode_footer_sm2_note")}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {isEducator ? t("mode_teacher") : t("mode_student")}
          </span>
        </div>
      </div>
    </div>
  );
}

