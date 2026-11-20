"use client";

import React from "react";
import { MuseumItem, MuseumRarity } from "../../data/museumItems";
import type { ChestItem } from "../../data/chestItems";
import { renderArtifactSvg } from "./artifactSvg";
import { ItemSvgRenderer } from "./ItemArtwork";

export { renderArtifactSvg };

export interface MuseumArtworkProps {
  item: MuseumItem | ChestItem;
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
  sm: { box: "w-14 h-14", iconSize: "text-2xl" },
  md: { box: "w-20 h-20", iconSize: "text-3xl" },
  lg: { box: "w-28 h-28", iconSize: "text-5xl" },
  xl: { box: "w-36 h-36 sm:w-44 sm:h-44", iconSize: "text-6xl" },
};

function isMuseumOriginatedItem(item: MuseumItem | ChestItem): boolean {
  if ("source" in item && item.source === "museum") return true;
  if ("title" in item) return true;
  return /^(hero|creature|relic|monument|museum)_/.test(item.id);
}

export default function MuseumArtwork({
  item,
  isSilhouette = false,
  size = "md",
  className = "",
  showPedestal = true,
}: MuseumArtworkProps) {
  const rarity: MuseumRarity = item.rarity || "common";
  const rarityTheme = RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS.common;
  const sizeStyle = SIZE_STYLES[size];
  const isMuseumItem = isMuseumOriginatedItem(item);

  const displayTitle = "title" in item ? item.title : item.name?.tr || item.name?.en || item.id;
  const itemType =
    "type" in item
      ? item.type
      : item.category === "heroes" || item.category === "creatures"
      ? "avatar"
      : "equipment";
  const itemIcon = "avatarIcon" in item ? item.avatarIcon : item.icon;

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none group ${className}`}
    >
      {/* 1. ESER ÇERÇEVESİ VE ZEMİN */}
      <div
        className={`relative ${sizeStyle.box} rounded-2xl p-2 flex items-center justify-center overflow-hidden border transition-all duration-300 ${
          isSilhouette
            ? "bg-slate-900/95 border-slate-800/90 shadow-inner"
            : `bg-gradient-to-b ${rarityTheme.bgGradient} ${rarityTheme.border} ${rarityTheme.glow} hover:scale-105`
        }`}
      >
        {/* Nadirlik / Silüet Arka Plan Işığı */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isSilhouette ? 0.25 : 0.3,
            background: isSilhouette
              ? "radial-gradient(circle at 50% 45%, rgba(148, 163, 184, 0.35) 0%, transparent 72%)"
              : `radial-gradient(circle at 50% 42%, ${rarityTheme.accent} 0%, transparent 72%)`,
          }}
        />

        {/* Eserin Kendi Benzersiz SVG İllüstrasyonu (Kilitli ise Karartılmış Silüet) */}
        <div
          className={`w-full h-full flex items-center justify-center relative z-10 transition-all ${
            isSilhouette
              ? "brightness-0 opacity-30"
              : "group-hover:scale-110 transition-transform duration-300"
          }`}
        >
          {isMuseumItem ? (
            renderArtifactSvg(item, isSilhouette)
          ) : (
            <ItemSvgRenderer
              itemId={item.id}
              rarity={rarity}
              type={itemType}
              icon={itemIcon}
              title={displayTitle}
              isSilhouette={isSilhouette}
            />
          )}
        </div>

        {/* Kilitli Silüet Üzerinde Gizemli Kilit Rozeti veya Açık Parıltı Noktası */}
        {isSilhouette ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="w-7 h-7 rounded-full bg-slate-950/85 border border-slate-700/80 flex items-center justify-center text-xs shadow-lg">
              🔒
            </span>
          </div>
        ) : (
          <div className="absolute top-1.5 right-1.5 pointer-events-none z-20">
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
          <div
            className={`w-[85%] h-1.5 rounded-t-sm border-t ${
              isSilhouette
                ? "bg-slate-900 border-slate-800"
                : "bg-slate-800 border-slate-700 shadow-sm"
            }`}
          />
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
