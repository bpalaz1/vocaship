"use client";

import React from "react";
import { MuseumItem, MuseumRarity, MuseumCategory } from "../../data/museumItems";
import { Lock, Sparkles } from "lucide-react";

export interface MuseumArtworkProps {
  item: MuseumItem;
  isSilhouette?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showPedestal?: boolean;
}

const RARITY_GRADIENTS: Record<
  MuseumRarity,
  {
    bgGradient: string;
    border: string;
    glow: string;
    accent: string;
    badgeBg: string;
  }
> = {
  common: {
    bgGradient: "from-slate-800 via-slate-900 to-slate-950",
    border: "border-slate-700/80",
    glow: "shadow-[0_0_15px_rgba(100,116,139,0.2)]",
    accent: "#94a3b8",
    badgeBg: "bg-slate-700/60 text-slate-300",
  },
  rare: {
    bgGradient: "from-blue-900/60 via-slate-900 to-slate-950",
    border: "border-cyan-500/50",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    accent: "#06b6d4",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  },
  epic: {
    bgGradient: "from-purple-900/70 via-slate-900 to-slate-950",
    border: "border-purple-500/60",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    accent: "#c084fc",
    badgeBg: "bg-purple-500/20 text-purple-200 border border-purple-500/40",
  },
  legendary: {
    bgGradient: "from-amber-900/80 via-yellow-950/60 to-slate-950",
    border: "border-amber-400/80",
    glow: "shadow-[0_0_35px_rgba(251,191,36,0.5)]",
    accent: "#fbbf24",
    badgeBg: "bg-amber-500/25 text-amber-200 border border-amber-400/50",
  },
};

const SIZE_STYLES = {
  sm: { box: "w-16 h-16", svgSize: 48, iconSize: "text-2xl" },
  md: { box: "w-24 h-24", svgSize: 72, iconSize: "text-4xl" },
  lg: { box: "w-36 h-36", svgSize: 110, iconSize: "text-5xl" },
  xl: { box: "w-48 h-48 sm:w-56 sm:h-56", svgSize: 160, iconSize: "text-7xl" },
};

/**
 * 100 Eser için kategori ve id'ye göre zengin SVG illüstrasyonu çizer.
 */
function renderArtifactSvg(item: MuseumItem, isSilhouette: boolean) {
  const { id, category, rarity } = item;
  const colors = RARITY_GRADIENTS[rarity];

  // Silüet durumunda siyah-koyu gri ton
  const primaryColor = isSilhouette ? "#1e293b" : colors.accent;
  const secondaryColor = isSilhouette ? "#0f172a" : "#f1f5f9";
  const glowColor = isSilhouette ? "transparent" : colors.accent;

  // 1. KAHRAMANLAR (Heroes)
  if (category === "heroes") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <radialGradient id={`rad-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={isSilhouette ? "0.1" : "0.6"} />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Arka Işık */}
        <circle cx="50" cy="50" r="38" fill={`url(#rad-${id})`} />

        {/* Gövde / Pelerin */}
        <path
          d="M 30 80 Q 50 68 70 80 L 65 92 Q 50 86 35 92 Z"
          fill={primaryColor}
          opacity={isSilhouette ? "0.3" : "0.85"}
        />
        {/* Zırh Gövdesi */}
        <path
          d="M 36 50 L 64 50 L 60 76 L 50 82 L 40 76 Z"
          fill={isSilhouette ? "#0f172a" : "#1e293b"}
          stroke={primaryColor}
          strokeWidth="2"
        />
        {/* Göğüs Amblemi */}
        <polygon
          points="50,56 55,64 50,72 45,64"
          fill={isSilhouette ? "#334155" : primaryColor}
        />
        {/* Omuz Zırhları */}
        <path d="M 28 50 Q 34 44 40 50 L 36 60 Q 30 58 28 50 Z" fill={primaryColor} />
        <path d="M 72 50 Q 66 44 60 50 L 64 60 Q 70 58 72 50 Z" fill={primaryColor} />

        {/* Baş / Miğfer */}
        <circle cx="50" cy="34" r="15" fill={isSilhouette ? "#0f172a" : "#334155"} stroke={primaryColor} strokeWidth="2" />
        {/* Vizör / Gözler */}
        <path
          d="M 42 34 Q 50 36 58 34 Q 50 38 42 34 Z"
          fill={isSilhouette ? "#020617" : primaryColor}
          filter={!isSilhouette ? "drop-shadow(0 0 3px currentColor)" : undefined}
        />
        {/* Miğfer Tepeliği (Crest) */}
        <path
          d="M 48 16 Q 50 8 52 16 L 52 26 L 48 26 Z"
          fill={isSilhouette ? "#1e293b" : "#fbbf24"}
        />

        {/* Silah: Kılıç veya Asa */}
        {id.includes("samurai") || id.includes("knight") || id.includes("blade") ? (
          <g transform="translate(68, 20) rotate(15)">
            <rect x="0" y="0" width="3" height="42" fill={secondaryColor} stroke={primaryColor} strokeWidth="1" />
            <polygon points="-4,38 7,38 1.5,42" fill={primaryColor} />
            <rect x="-1" y="42" width="5" height="12" fill="#475569" />
          </g>
        ) : (
          <g transform="translate(68, 25)">
            <line x1="2" y1="0" x2="2" y2="50" stroke={primaryColor} strokeWidth="2.5" />
            <circle cx="2" cy="0" r="5" fill={isSilhouette ? "#334155" : "#38bdf8"} />
          </g>
        )}
      </svg>
    );
  }

  // 2. EJDERHALAR & YARATIKLAR (Creatures)
  if (category === "creatures") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <radialGradient id={`crad-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={isSilhouette ? "0.1" : "0.55"} />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="38" fill={`url(#crad-${id})`} />

        {/* Ejderha / Yaratık Kanatları */}
        <path
          d="M 50 48 Q 20 20 8 36 Q 22 56 36 60 Z"
          fill={primaryColor}
          opacity={isSilhouette ? "0.35" : "0.75"}
        />
        <path
          d="M 50 48 Q 80 20 92 36 Q 78 56 64 60 Z"
          fill={primaryColor}
          opacity={isSilhouette ? "0.35" : "0.75"}
        />

        {/* Gövde ve Kuyruk */}
        <path
          d="M 45 42 Q 50 36 55 42 Q 58 64 50 78 Q 44 88 40 92 Q 46 84 52 74 Q 54 58 45 42 Z"
          fill={isSilhouette ? "#0f172a" : "#1e293b"}
          stroke={primaryColor}
          strokeWidth="2"
        />

        {/* Ejderha Başı */}
        <path
          d="M 46 22 L 54 22 L 60 30 L 50 38 L 40 30 Z"
          fill={isSilhouette ? "#1e293b" : primaryColor}
        />
        {/* Boynuzlar */}
        <path d="M 44 22 Q 38 12 34 14 Q 40 18 44 24 Z" fill={secondaryColor} />
        <path d="M 56 22 Q 62 12 66 14 Q 60 18 56 24 Z" fill={secondaryColor} />

        {/* Parlayan Gözler */}
        <circle cx="46" cy="28" r="2" fill={isSilhouette ? "#020617" : "#fef08a"} />
        <circle cx="54" cy="28" r="2" fill={isSilhouette ? "#020617" : "#fef08a"} />

        {/* Alev Nefesi / Işıltı */}
        {!isSilhouette && (
          <path
            d="M 48 38 Q 50 46 52 38 Q 54 48 50 54 Q 46 48 48 38 Z"
            fill="#f97316"
            opacity="0.8"
          />
        )}
      </svg>
    );
  }

  // 3. KADİM SİLAHLAR & ZIRHLAR (Relics)
  if (category === "relics") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id={`relicGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="50%" stopColor={primaryColor} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Kalkan veya Çapraz Kılıç */}
        {id.includes("shield") || id.includes("kalkan") ? (
          <g>
            <path
              d="M 30 25 Q 50 20 70 25 L 70 54 Q 70 76 50 86 Q 30 76 30 54 Z"
              fill={`url(#relicGrad-${id})`}
              stroke={primaryColor}
              strokeWidth="2.5"
            />
            <path
              d="M 40 34 Q 50 30 60 34 L 60 52 Q 60 66 50 74 Q 40 66 40 52 Z"
              fill={isSilhouette ? "#020617" : "#0f172a"}
              stroke={secondaryColor}
              strokeWidth="1.5"
            />
            <circle cx="50" cy="50" r="5" fill={isSilhouette ? "#334155" : primaryColor} />
          </g>
        ) : (
          /* Kılıç (Excalibur / Relic Blade) */
          <g transform="translate(10, -5) rotate(25 50 50)">
            {/* Bıçak Parıltısı */}
            <path
              d="M 47 12 L 53 12 L 54 62 L 46 62 Z"
              fill={isSilhouette ? "#1e293b" : `url(#relicGrad-${id})`}
              stroke={primaryColor}
              strokeWidth="1.5"
            />
            <polygon points="50,4 47,12 53,12" fill={secondaryColor} />
            {/* Kabza Siperliği */}
            <rect x="36" y="62" width="28" height="5" rx="2" fill={primaryColor} />
            {/* Sap */}
            <rect x="47" y="67" width="6" height="15" rx="1.5" fill="#334155" />
            {/* Topuz (Pommel) */}
            <circle cx="50" cy="85" r="4.5" fill={secondaryColor} stroke={primaryColor} strokeWidth="1" />
          </g>
        )}
      </svg>
    );
  }

  // 4. KALELER & BİLGELİK ANITLARI (Monuments)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      <defs>
        <radialGradient id={`monGrad-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity={isSilhouette ? "0.1" : "0.5"} />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill={`url(#monGrad-${id})`} />

      {/* Kale Tabanı / Sur */}
      <rect
        x="24"
        y="58"
        width="52"
        height="26"
        rx="2"
        fill={isSilhouette ? "#0f172a" : "#1e293b"}
        stroke={primaryColor}
        strokeWidth="2"
      />
      {/* Kapı Kemeri */}
      <path
        d="M 44 84 L 44 68 Q 50 62 56 68 L 56 84 Z"
        fill={isSilhouette ? "#020617" : "#0f172a"}
        stroke={primaryColor}
        strokeWidth="1.5"
      />

      {/* Sol Kule */}
      <rect x="22" y="38" width="14" height="38" fill={isSilhouette ? "#1e293b" : "#334155"} stroke={primaryColor} strokeWidth="1.5" />
      <polygon points="20,38 29,26 38,38" fill={primaryColor} />

      {/* Sağ Kule */}
      <rect x="64" y="38" width="14" height="38" fill={isSilhouette ? "#1e293b" : "#334155"} stroke={primaryColor} strokeWidth="1.5" />
      <polygon points="62,38 71,26 80,38" fill={primaryColor} />

      {/* Ana Merkez Kule */}
      <rect x="40" y="30" width="20" height="36" fill={isSilhouette ? "#0f172a" : "#1e293b"} stroke={primaryColor} strokeWidth="2" />
      <polygon points="38,30 50,14 62,30" fill={secondaryColor} />
      <circle cx="50" cy="22" r="3" fill={primaryColor} />

      {/* Siper Burçları */}
      <rect x="42" y="27" width="4" height="4" fill={primaryColor} />
      <rect x="48" y="27" width="4" height="4" fill={primaryColor} />
      <rect x="54" y="27" width="4" height="4" fill={primaryColor} />
    </svg>
  );
}

export default function MuseumArtwork({
  item,
  isSilhouette = false,
  size = "md",
  className = "",
  showPedestal = true,
}: MuseumArtworkProps) {
  const rarityTheme = RARITY_GRADIENTS[item.rarity];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none group ${className}`}
    >
      {/* 1. ESER ÇERÇEVESİ VE ZEMİN */}
      <div
        className={`relative ${sizeStyle.box} rounded-2xl p-2 flex items-center justify-center overflow-hidden border transition-all duration-300 ${
          isSilhouette
            ? "bg-slate-950/80 border-slate-800/80 shadow-inner"
            : `bg-gradient-to-b ${rarityTheme.bgGradient} ${rarityTheme.border} ${rarityTheme.glow} hover:scale-105`
        }`}
      >
        {/* Karartılmış Gizemli Silüet Filtresi */}
        <div
          className={`w-full h-full flex items-center justify-center transition-all ${
            isSilhouette
              ? "brightness-0 opacity-30 contrast-200 grayscale"
              : "group-hover:scale-110 transition-transform duration-300"
          }`}
        >
          {renderArtifactSvg(item, isSilhouette)}
        </div>

        {/* Kilitli İse Üzerine Gizemli Kilit Rozeti (?) */}
        {isSilhouette && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[1px]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-400 font-black text-sm shadow-lg animate-pulse">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-500 mt-1 uppercase">
              KİLİTLİ
            </span>
          </div>
        )}

        {/* Nadirlik Parıltı Noktası (Açık İse) */}
        {!isSilhouette && (
          <div className="absolute top-1 right-1 pointer-events-none">
            <span
              className="block w-2 h-2 rounded-full animate-ping opacity-75"
              style={{ backgroundColor: rarityTheme.accent }}
            />
            <span
              className="block w-2 h-2 rounded-full absolute top-0 right-0 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: rarityTheme.accent }}
            />
          </div>
        )}
      </div>

      {/* 2. MÜZE KAİDESİ (PEDESTAL) */}
      {showPedestal && (
        <div className="w-full flex flex-col items-center -mt-1 z-10">
          {/* Kaide Üst Tabla */}
          <div
            className={`w-[85%] h-1.5 rounded-t-sm border-t ${
              isSilhouette
                ? "bg-slate-900 border-slate-800"
                : "bg-slate-800 border-slate-700 shadow-sm"
            }`}
          />
          {/* Kaide Gövdesi */}
          <div
            className={`w-[70%] h-1 rounded-b-md ${
              isSilhouette ? "bg-slate-950" : "bg-slate-900 border border-t-0 border-slate-800"
            }`}
          />
        </div>
      )}
    </div>
  );
}

