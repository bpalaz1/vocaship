"use client";

import React from "react";
import { Eye, EyeOff, Flashlight, Sparkles, BookOpen } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export interface ReaderToolbarProps {
  bionicMode: boolean;
  onToggleBionic: () => void;
  ghostMode: boolean;
  onToggleGhost: () => void;
  className?: string;
}

export default function ReaderToolbar({
  bionicMode,
  onToggleBionic,
  ghostMode,
  onToggleGhost,
  className = "",
}: ReaderToolbarProps) {
  const { t } = useLanguage();
  return (
    <div
      role="toolbar"
      aria-label={t("read_bionic_label", "Okuma Odası Bilişsel Araç Çubuğu")}
      className={`flex items-center gap-1.5 p-1 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-inner backdrop-blur-md ${className}`}
    >
      {/* 1. BİYONİK ODAK BUTONU */}
      <button
        type="button"
        onClick={onToggleBionic}
        aria-pressed={bionicMode}
        title={
          bionicMode
            ? t("read_bionic_on", "Biyonik Odak Açık: Kelime başları kalınlaştırılarak okuma hızı artırıldı.")
            : t("read_bionic_off", "Biyonik Odak Kapalı: Kelimelerin ilk harflerini kalınlaştırarak hızlı okumayı açın.")
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
          bionicMode
            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        }`}
      >
        <span className="text-sm leading-none">👁️</span>
        <span className="font-mono">{t("read_bionic_label", "Biyonik Odak")}</span>
        {bionicMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping"></span>
        )}
      </button>

      {/* 2. GHOST READER (ODAK TÜNELİ) BUTONU */}
      <button
        type="button"
        onClick={onToggleGhost}
        aria-pressed={ghostMode}
        title={
          ghostMode
            ? t("read_ghost_on", "Ghost Reader Açık: Aktif satır hariç diğer cümleler karartıldı.")
            : t("read_ghost_off", "Ghost Reader Kapalı: Dikkat dağılmasını önlemek için aktif satır haricini karartın.")
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
          ghostMode
            ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black shadow-md shadow-amber-600/30 ring-1 ring-yellow-400/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        }`}
      >
        <span className="text-sm leading-none">🔦</span>
        <span className="font-mono">Ghost Reader</span>
        {ghostMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
        )}
      </button>
    </div>
  );
}

