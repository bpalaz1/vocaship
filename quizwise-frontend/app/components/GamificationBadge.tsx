"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  ChevronDown,
  Award,
  GraduationCap,
  Trophy,
  ShoppingBag,
  KeyRound,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface UserProfileData {
  user_id?: string;
  email?: string;
  full_name?: string;
  name?: string;
  total_xp: number;
  xp?: number;
  level: number;
  title?: string;
  badge?: string;
  level_title?: string;
  streak_days: number;
  streak?: number;
  last_active_date?: string | null;
  next_level_xp?: number;
  xp_to_next_level?: number;
  current_level_min_xp?: number;
  level_progress_percent?: number;
  recent_awarded_xp?: number | null;
  leveled_up?: boolean;
  message?: string | null;
  coins?: number;
  active_avatar?: string;
  active_avatar_id?: string;
}

export const DEFAULT_GUEST_PROFILE: UserProfileData = {
  user_id: "guest",
  email: "guest@vocaship.ai",
  full_name: "Guest",
  name: "Guest",
  total_xp: 0,
  xp: 0,
  level: 1,
  title: "Kelime Çırağı",
  badge: "🥉",
  level_title: "Seviye 1 - Kelime Çırağı 🥉",
  streak_days: 0,
  streak: 0,
  next_level_xp: 300,
  xp_to_next_level: 300,
  current_level_min_xp: 0,
  level_progress_percent: 0,
  coins: 300,
  active_avatar: "🌟",
  active_avatar_id: "char_default",
};

interface GamificationBadgeProps {
  profile: UserProfileData | null;
  loading?: boolean;
  onRefresh?: () => void;
  onOpenJoinModal?: () => void;
}

export default function GamificationBadge({
  profile,
  loading,
  onRefresh,
  onOpenJoinModal,
}: GamificationBadgeProps) {
  const { t, currentLang } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [isBumping, setIsBumping] = useState(false);
  const prevXpRef = useRef<number | null>(null);

  const effectiveXp = profile ? (profile.total_xp ?? profile.xp ?? 0) : 0;

  useEffect(() => {
    if (profile && prevXpRef.current !== null && effectiveXp > prevXpRef.current) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 700);
      return () => clearTimeout(timer);
    }
    if (profile) {
      prevXpRef.current = effectiveXp;
    }
  }, [profile, effectiveXp]);

  if (!profile) {
    return (
      <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-2xl animate-pulse">
        <div className="w-5 h-5 rounded-full bg-slate-800" />
        <div className="w-16 h-4 rounded bg-slate-800" />
      </div>
    );
  }

  const total_xp = profile.total_xp ?? profile.xp ?? 0;
  const level = profile.level ?? 1;
  const title = profile.title || "Kelime Çırağı";
  const badge = profile.badge || "🥉";
  const streak_days = profile.streak_days ?? profile.streak ?? 0;
  const xp_to_next_level = profile.xp_to_next_level ?? 300;
  const level_progress_percent = profile.level_progress_percent ?? 0;
  const next_level_xp = profile.next_level_xp ?? 300;
  const coins = profile.coins ?? 300;

  // Seviye Temaları (Level Themes)
  const getLevelTheme = (lvl: number) => {
    switch (lvl) {
      case 1:
        return {
          bg: "bg-slate-900/90 hover:bg-slate-850",
          border: "border-slate-700/80 hover:border-indigo-500/60",
          text: "text-indigo-300",
          bar: "bg-gradient-to-r from-indigo-500 to-indigo-400",
        };
      case 2:
        return {
          bg: "bg-slate-900/90 hover:bg-slate-850",
          border: "border-sky-500/40 hover:border-sky-400/70",
          text: "text-sky-300",
          bar: "bg-gradient-to-r from-sky-500 to-cyan-300",
        };
      case 3:
        return {
          bg: "bg-slate-900/90 hover:bg-slate-850",
          border: "border-amber-500/40 hover:border-amber-400/70",
          text: "text-amber-300",
          bar: "bg-gradient-to-r from-amber-500 to-yellow-300",
        };
      default:
        return {
          bg: "bg-slate-900/90 hover:bg-slate-850",
          border: "border-purple-500/40 hover:border-purple-400/70",
          text: "text-purple-300",
          bar: "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400",
        };
    }
  };

  const theme = getLevelTheme(level);

  return (
    <div className="relative shrink-0">
      {/* TETİKLEYİCİ KOMPAKT BUTON (XP & ALTIN & SEVİYE) */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className={`group cursor-pointer select-none flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-2xl border transition-all duration-150 shadow-sm ${theme.bg} ${theme.border} hover:scale-[1.02] active:scale-95`}
        title="Gelişim Karnesi, Altın ve Hızlı Menü"
        aria-expanded={showDetails}
      >
        {/* Aktif Avatar / Simge */}
        <span
          className="w-6 h-6 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-xs shadow-inner shrink-0"
          title="Seçili Avatar"
        >
          {profile.active_avatar || "🌟"}
        </span>

        {/* Altın Sayacı */}
        <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-xs font-mono">
          <span className="text-xs leading-none">🪙</span>
          <span>{coins}</span>
        </div>

        {/* XP Sayacı */}
        <div
          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-black transition-all duration-300 font-mono ${
            isBumping
              ? "scale-110 text-yellow-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
              : "text-indigo-300"
          }`}
        >
          <Zap className={`w-3 h-3 fill-current ${isBumping ? "text-yellow-300 animate-pulse" : "text-amber-400"}`} />
          <span>{total_xp.toLocaleString()}</span>
        </div>

        {/* Seviye Etiketi */}
        <span className="hidden md:inline-block text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
          Lv.{level}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
            showDetails ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* GELİŞİM KARNESİ & İKİNCİL MENÜ AÇILIR PANELİ (DROPDOWN) */}
      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute right-2 top-full mt-2 w-72 max-w-xs overflow-x-hidden z-50 p-4 bg-slate-900/98 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            {/* 1. Başlık & Toplam XP */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {t("progress_report", "GELİŞİM KARNESİ")}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400">
                {total_xp} / {level < 4 ? next_level_xp : total_xp} XP
              </span>
            </div>

            {/* 2. Seviye İlerleme Çubuğu */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={theme.text}>
                  Lv.{level} {title === "Hikaye Ustası" ? t("story_master", "Hikaye Ustası") : t(title, title)} {badge}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  %{level_progress_percent}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                  style={{ width: `${Math.max(5, level_progress_percent)}%` }}
                />
              </div>
              {level < 4 ? (
                <p className="text-[11px] text-slate-400">
                  {t("xp_remaining", "Sonraki seviyeye {xp} XP kaldı!", { xp: xp_to_next_level }).replace("{xp}", String(xp_to_next_level))}
                </p>
              ) : (
                <p className="text-[11px] text-amber-300 font-semibold">
                  {t("legendary_status", "👑 Sözlük Efsanesisiniz!")}
                </p>
              )}
            </div>

            {/* 3. Günlük Seri & Altın Durumu */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-orange-950/20 border border-orange-500/20 rounded-2xl flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-orange-300 block">
                    {t("streak_days", "{count} Gün", { count: streak_days }).replace("{count}", String(streak_days))}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">{t("daily_streak", "Günlük Seri")}</span>
                </div>
              </div>

              <div className="p-2 bg-amber-950/20 border border-amber-500/20 rounded-2xl flex items-center space-x-2">
                <span className="text-sm">🪙</span>
                <div>
                  <span className="text-xs font-bold text-amber-300 block">
                    {t("gold_count", "{count} Altın", { count: coins }).replace("{count}", String(coins))}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">{t("balance", "Bakiyeniz")}</span>
                </div>
              </div>
            </div>

            {/* 4. Aşamalı İfşa: İkincil Hızlı Menü Bağlantıları */}
            <div className="pt-1 space-y-1 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                {t("quick_access", "HIZLI ERİŞİM")}
              </span>

              <Link
                href="/classroom"
                onClick={() => setShowDetails(false)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition group"
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>🎓 {t("menu_classroom", "Sınıfım & Öğretmen")}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
              </Link>

              <Link
                href="/leaderboard"
                onClick={() => setShowDetails(false)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition group"
              >
                <div className="flex items-center space-x-2">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>🏆 {t("menu_leaderboard", "Sınıf Liderlik Tablosu")}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
              </Link>

              <Link
                href="/shop"
                onClick={() => setShowDetails(false)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition group"
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎁 {t("menu_vault", "Sandık Mağazası")}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
              </Link>

              {onOpenJoinModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDetails(false);
                    onOpenJoinModal();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition group text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>🔑 {t("menu_join_code", "Kod ile Katıl")}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                </button>
              )}
            </div>

            {/* 5. XP Kazanma İpuçları (Kompakt) */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                {t("xp_tips", "XP İPUÇLARI")}
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                <span className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  ⚔️ {t("tab_boss_fight", "Boss Fight")}: <strong className="text-emerald-400">XP & Altın</strong>
                </span>
                <span className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  💰 {t("tab_treasure_hunt", "Hazine Avı")}: <strong className="text-emerald-400">XP & Altın</strong>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
