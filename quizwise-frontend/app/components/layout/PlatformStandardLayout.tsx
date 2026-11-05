"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  Coins,
  Trophy,
  ShoppingBag,
  Sparkles,
  Layers,
  AlertTriangle,
  FolderOpen,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import MobileBottomTabbar from "./MobileBottomTabbar";
import MobileDrawerSheet from "./MobileDrawerSheet";

export interface PlatformStandardLayoutProps {
  leftSidebar?: React.ReactNode;
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerAction?: React.ReactNode;
  maxWidthClass?: string;
  className?: string;
  leftDrawerTitle?: string;
  rightDrawerTitle?: string;
  hideBottomTabbar?: boolean;
}

/**
 * PlatformStandardLayout (Dual-Tone Ergonomik Yerleşim Standardı)
 * - Buzul Açık Gri Gövde: bg-slate-50 text-slate-800
 * - Koyu Lacivert Kontrol Barları: bg-slate-900 text-white
 * - Yüksek Kontrastlı Çalışma Kartları: bg-white border border-slate-200
 */
export default function PlatformStandardLayout({
  leftSidebar,
  children,
  rightSidebar,
  headerTitle,
  headerSubtitle,
  headerAction,
  maxWidthClass = "max-w-7xl 2xl:max-w-[1680px]",
  className = "",
  leftDrawerTitle = "Navigasyon & Filtreler",
  rightDrawerTitle = "Karne & Gelişim Özeti",
  hideBottomTabbar = false,
}: PlatformStandardLayoutProps) {
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  const hasLeft = Boolean(leftSidebar);
  const hasRight = Boolean(rightSidebar);

  return (
    <div
      data-testid="platform-standard-layout"
      className={`w-full max-w-full overflow-x-hidden min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white ${className}`}
    >
      {/* 1. MASAÜSTÜ ÜST KONTROL VE BAŞLIK BARI (bg-slate-900 / Dual-Tone Koyu Kontrast) */}
      {(headerTitle || headerAction) && (
        <header className="hidden lg:block border-b border-slate-800 bg-slate-900 text-white shadow-lg sticky top-0 z-30">
          <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4`}>
            <div className="space-y-0.5 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-2">
                <span>{headerTitle}</span>
              </h1>
              {headerSubtitle && (
                <p className="text-xs text-slate-300 truncate">{headerSubtitle}</p>
              )}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        </header>
      )}

      {/* 2. MOBİL ÜST BAR (Dual-Tone Koyu Lacivert Bar / < lg) */}
      <div className="lg:hidden border-b border-slate-800 bg-slate-900 text-white shadow-md sticky top-0 z-30 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Sol Panel Çekmece Butonu */}
          {hasLeft ? (
            <button
              type="button"
              onClick={() => setIsLeftDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-sm shrink-0"
              title="Filtreleri & Menüyü Aç"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[90px]">Menü</span>
            </button>
          ) : (
            <div className="w-8 shrink-0" />
          )}

          {/* Merkez Başlık */}
          <div className="text-center min-w-0 flex-1 px-1">
            <h2 className="text-xs sm:text-sm font-black text-white truncate">
              {headerTitle || "Vocaship"}
            </h2>
            {headerSubtitle && (
              <p className="text-[10px] text-slate-300 truncate">{headerSubtitle}</p>
            )}
          </div>

          {/* Sağ Panel Karne Çekmece Butonu */}
          {hasRight ? (
            <button
              type="button"
              onClick={() => setIsRightDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-indigo-600/25 hover:from-amber-500/35 hover:to-indigo-600/35 border border-amber-400/40 text-xs font-bold text-amber-300 transition active:scale-95 cursor-pointer shadow-sm shrink-0"
              title="Karneni & Maskotunu Gör"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="truncate max-w-[90px]">Karne</span>
            </button>
          ) : headerAction ? (
            <div className="shrink-0">{headerAction}</div>
          ) : (
            <div className="w-8 shrink-0" />
          )}
        </div>
      </div>

      {/* 3. 3 SÜTUNLU ANA GÖVDE (Ferah bg-slate-50 Açık Buzul Zemin) */}
      <main
        className={`flex-1 w-full max-w-full ${maxWidthClass} mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col lg:flex-row gap-5 lg:gap-6 items-start`}
      >
        {/* ========================================================================= */}
        {/* 1. SOL SÜTUN - MASAÜSTÜNDE AÇIK (lg:block), MOBİLDE ÇEKMECE İÇİNDE        */}
        {/* ========================================================================= */}
        {hasLeft && (
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div className="lg:sticky lg:top-20 space-y-4">
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* ========================================================================= */}
        {/* 2. ORTA SÜTUN - GENİŞ ÇALIŞMA SAHNESİ                                      */}
        {/* ========================================================================= */}
        <section className="w-full flex-1 min-w-0 max-w-4xl mx-auto pb-24 lg:pb-8">
          {children}
        </section>

        {/* ========================================================================= */}
        {/* 3. SAĞ SÜTUN - MASAÜSTÜNDE AÇIK (lg:block), MOBİLDE ÇEKMECE İÇİNDE         */}
        {/* ========================================================================= */}
        {hasRight && (
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div className="lg:sticky lg:top-20 space-y-4">
              {rightSidebar}
            </div>
          </aside>
        )}
      </main>

      {/* 4. MOBİL ALT ÇEKMECELER (BOTTOM SHEETS) */}
      {hasLeft && (
        <MobileDrawerSheet
          isOpen={isLeftDrawerOpen}
          onClose={() => setIsLeftDrawerOpen(false)}
          title={leftDrawerTitle}
          icon={<FolderOpen className="w-4 h-4" />}
        >
          {leftSidebar}
        </MobileDrawerSheet>
      )}

      {hasRight && (
        <MobileDrawerSheet
          isOpen={isRightDrawerOpen}
          onClose={() => setIsRightDrawerOpen(false)}
          title={rightDrawerTitle}
          icon={<Trophy className="w-4 h-4 text-yellow-400" />}
        >
          {rightSidebar}
        </MobileDrawerSheet>
      )}

      {/* 5. MOBİL ALTA SABİTLENEN 5 İKONLU TABBAR (< lg) */}
      {!hideBottomTabbar && <MobileBottomTabbar />}
    </div>
  );
}

/**
 * Dual-Tone Gamification Özeti (Yüksek Kontrastlı Beyaz Kart)
 */
export function PlatformGamificationPanel({
  title = "Öğrenci Gelişim Özeti",
  streak = 5,
  gold = 240,
  xp = 450,
  level = "Seviye 3 Kaşif",
  learnedCount,
  totalCount,
  weakCount = 0,
  mascotName = "Sparky",
  mascotImage = "/avatars/sparky.png",
  onOpenShop,
  onOpenLeaderboard,
}: {
  title?: string;
  streak?: number;
  gold?: number;
  xp?: number;
  level?: string;
  learnedCount?: number;
  totalCount?: number;
  weakCount?: number;
  mascotName?: string;
  mascotImage?: string;
  onOpenShop?: () => void;
  onOpenLeaderboard?: () => void;
}) {
  const percentLearned =
    totalCount && totalCount > 0 && typeof learnedCount === "number"
      ? Math.min(100, Math.round((learnedCount / totalCount) * 100))
      : null;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 text-slate-800">
      {/* Maskot ve Seviye Rozeti */}
      <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-md shadow-indigo-500/15 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mascotImage}
            alt={mascotName}
            className="w-full h-full object-cover rounded-[14px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/avatars/sparky.png";
            }}
          />
          <span className="absolute -bottom-1 -right-1 text-xs">🦊</span>
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-slate-900 truncate">{mascotName}</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {level}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium truncate">{title}</p>
        </div>
      </div>

      {/* Günlük Seri (🔥) & Altın (🪙) & XP (⚡) Sayaçları */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-amber-600">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-black font-mono">{streak}</span>
          </div>
          <span className="text-[10px] text-slate-600 font-medium block">Seri Gün</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-yellow-50/70 border border-yellow-200/80 text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-yellow-600">
            <Coins className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-black font-mono">{gold}</span>
          </div>
          <span className="text-[10px] text-slate-600 font-medium block">Altın</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-indigo-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-black font-mono">{xp}</span>
          </div>
          <span className="text-[10px] text-slate-600 font-medium block">XP</span>
        </div>
      </div>

      {/* Deste Hakimiyeti Barı */}
      {percentLearned !== null && (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Deste Hakimiyeti</span>
            </span>
            <span className="text-emerald-600 font-bold font-mono">
              {learnedCount} / {totalCount} (%{percentLearned})
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${percentLearned}%` }}
            />
          </div>
        </div>
      )}

      {/* Zayıf Nokta Uyarısı */}
      {weakCount > 0 && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{weakCount} kelime tekrar bekliyor</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 border border-rose-200 font-mono">
            🎯 Zayıf Nokta
          </span>
        </div>
      )}

      {/* Hızlı Erişim Butonları: Sandık Mağazası & Liderlik Paneli (Koyu Kontrast Butonlar) */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
        {onOpenShop ? (
          <button
            type="button"
            onClick={onOpenShop}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Mağaza</span>
          </button>
        ) : (
          <Link
            href="/shop"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Mağaza</span>
          </Link>
        )}

        {onOpenLeaderboard ? (
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Liderlik</span>
          </button>
        ) : (
          <Link
            href="/leaderboard"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Liderlik</span>
          </Link>
        )}
      </div>
    </div>
  );
}
