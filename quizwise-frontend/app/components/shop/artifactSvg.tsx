"use client";

import React from "react";
import { MuseumCategory, MuseumItem } from "../../data/museumItems";
import type { ChestItem } from "../../data/chestItems";

export const ARTIFACT_PALETTES = [
  { main: "#f59e0b", sec: "#fde047", dark: "#78350f" },
  { main: "#06b6d4", sec: "#67e8f9", dark: "#164e63" },
  { main: "#10b981", sec: "#6ee7b7", dark: "#064e3b" },
  { main: "#a855f7", sec: "#d8b4fe", dark: "#581c87" },
  { main: "#f43f5e", sec: "#fda4af", dark: "#881337" },
  { main: "#3b82f6", sec: "#93c5fd", dark: "#1e3a8a" },
  { main: "#eab308", sec: "#fef08a", dark: "#713f12" },
  { main: "#ec4899", sec: "#f9a8d4", dark: "#831843" },
];

export function getItemIndex(id: string): number {
  const m = id.match(/(\d+)/);
  if (m) return parseInt(m[1], 10);
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 25 + 1;
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function normalizeForSvg(item: MuseumItem | ChestItem): {
  id: string;
  rawId: string;
  title: string;
  category: MuseumCategory;
} {
  const rawId = item.id.replace(/^museum_/, "");
  if ("title" in item) {
    return {
      id: item.id,
      rawId,
      title: item.title,
      category: item.category,
    };
  }
  const category: MuseumCategory =
    item.category || (item.type === "avatar" ? "heroes" : "relics");
  return {
    id: item.id,
    rawId,
    title: item.name?.tr || item.name?.en || item.id,
    category,
  };
}

function renderUniqueCrestAccent(crestIndex: number, cMain: string, cSec: string) {
  switch (crestIndex) {
    case 0:
      return (
        <g opacity="0.8">
          <circle cx="16" cy="20" r="2.2" fill={cSec} />
          <circle cx="84" cy="80" r="2.2" fill={cSec} />
        </g>
      );
    case 1:
      return (
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="16"
          fill="none"
          stroke={cSec}
          strokeWidth="1.4"
          strokeDasharray="4 4"
          transform="rotate(-22 50 50)"
          opacity="0.7"
        />
      );
    case 2:
      return (
        <g opacity="0.85">
          <polygon points="50,4 52.5,10 59,10 54,14 56,20 50,16 44,20 46,14 41,10 47.5,10" fill={cSec} />
        </g>
      );
    case 3:
      return (
        <g opacity="0.75">
          <polygon points="10,50 15,44 20,50 15,56" fill={cMain} stroke={cSec} strokeWidth="1" />
          <polygon points="80,50 85,44 90,50 85,56" fill={cMain} stroke={cSec} strokeWidth="1" />
        </g>
      );
    default:
      return (
        <g opacity="0.75">
          <circle cx="50" cy="50" r="44" fill="none" stroke={cMain} strokeWidth="1.5" strokeDasharray="8 6" />
          <circle cx="20" cy="78" r="2.5" fill={cSec} />
          <circle cx="80" cy="22" r="2.5" fill={cSec} />
        </g>
      );
  }
}

/**
 * Her eserin kendi kimliğine (Başlık & ID) uygun benzersiz, renkli özel SVG illüstrasyonu üretir.
 * Kilitli kartlarda da standart kilit ikonu yerine o eserin karartılmış silüetini gösterir.
 */
export function renderArtifactSvg(item: MuseumItem | ChestItem, isSilhouette: boolean) {
  const { id, rawId, title, category } = normalizeForSvg(item);
  const lowerTitle = (title || "").toLowerCase();
  const idx = getItemIndex(rawId);
  const titleHash = hashString(lowerTitle + rawId);
  const pal = ARTIFACT_PALETTES[(idx + titleHash + category.length) % ARTIFACT_PALETTES.length];
  const crestIndex = (Math.floor((idx - 1) / 5) + (titleHash % 3)) % 5;

  const cMain = isSilhouette ? "#334155" : pal.main;
  const cSec = isSilhouette ? "#475569" : pal.sec;
  const cDark = isSilhouette ? "#0f172a" : pal.dark;

  // 1. ÖZEL KİMLİK TASARIMLARI: Gölge Okçusu / Okçu / Kolcu (Yay ve Parlak Ok)
  if (lowerTitle.includes("okçu") || lowerTitle.includes("kolcu") || lowerTitle.includes("yay") || rawId === "hero_03") {
    const bowColor = isSilhouette ? "#334155" : "#10b981";
    const arrowGlow = isSilhouette ? "#475569" : "#34d399";
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <radialGradient id={`bow-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={bowColor} stopOpacity={isSilhouette ? "0.1" : "0.55"} />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill={`url(#bow-${id})`} />
        <path
          d="M 32 16 C 68 26, 68 74, 32 84"
          fill="none"
          stroke={bowColor}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line x1="32" y1="16" x2="22" y2="50" stroke={cSec} strokeWidth="1.8" />
        <line x1="32" y1="84" x2="22" y2="50" stroke={cSec} strokeWidth="1.8" />
        <line x1="18" y1="50" x2="82" y2="50" stroke={arrowGlow} strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="88,50 74,42 78,50 74,58" fill={isSilhouette ? "#475569" : "#6ee7b7"} />
        <polygon points="18,50 10,43 15,43 22,50" fill={bowColor} />
        <polygon points="18,50 10,57 15,57 22,50" fill={bowColor} />
      </svg>
    );
  }

  // 2. ÖZEL KİMLİK: Çöl Büyücüsü / Simyacı / Kahin / Büyücü (Asa ve Kum Fırtınası Küresi)
  if (
    lowerTitle.includes("büyücü") ||
    lowerTitle.includes("simyacı") ||
    lowerTitle.includes("kahin") ||
    lowerTitle.includes("küre") ||
    rawId === "hero_10"
  ) {
    const orbColor = isSilhouette ? "#334155" : "#f59e0b";
    const swirlColor = isSilhouette ? "#475569" : "#fde047";
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <radialGradient id={`orb-${id}`} cx="50%" cy="42%" r="45%">
            <stop offset="0%" stopColor={swirlColor} stopOpacity={isSilhouette ? "0.15" : "0.85"} />
            <stop offset="60%" stopColor={orbColor} stopOpacity={isSilhouette ? "0.1" : "0.45"} />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="44" r="38" fill={`url(#orb-${id})`} />
        <line x1="26" y1="86" x2="50" y2="54" stroke={orbColor} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 40 56 C 34 38, 66 38, 60 56" fill="none" stroke={swirlColor} strokeWidth="3" />
        <circle cx="50" cy="38" r="16" fill={isSilhouette ? "#1e293b" : "#78350f"} stroke={swirlColor} strokeWidth="2.5" />
        <path
          d="M 40 38 Q 50 26 60 38 Q 50 50 42 42"
          fill="none"
          stroke={swirlColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="50" cy="38" r="3.5" fill={swirlColor} />
      </svg>
    );
  }

  // 3. ÖZEL KİMLİK: Fırtına Paladini / Şimşek / Çekiç (Şimşekli Kalkan ve Çekiç)
  if (
    lowerTitle.includes("paladin") ||
    lowerTitle.includes("fırtına") ||
    lowerTitle.includes("çekiç") ||
    lowerTitle.includes("şimşek") ||
    rawId === "hero_11"
  ) {
    const stormBlue = isSilhouette ? "#334155" : "#38bdf8";
    const boltGold = isSilhouette ? "#475569" : "#facc15";
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <path
          d="M 24 24 Q 46 18 68 24 L 68 54 Q 68 76 46 88 Q 24 76 24 54 Z"
          fill={isSilhouette ? "#0f172a" : "#0c4a6e"}
          stroke={stormBlue}
          strokeWidth="3"
        />
        <polygon points="48,30 36,52 46,52 40,72 58,46 47,46" fill={boltGold} />
        <g transform="translate(58, 16) rotate(28)">
          <rect x="10" y="16" width="5" height="54" rx="2" fill={isSilhouette ? "#334155" : "#94a3b8"} />
          <rect x="0" y="6" width="26" height="14" rx="3" fill={stormBlue} stroke={boltGold} strokeWidth="2" />
        </g>
      </svg>
    );
  }

  // 4. ÖZEL KİMLİK: Tilki Sparky (Sevimli Keşif Tilkisi)
  if (lowerTitle.includes("tilki") || lowerTitle.includes("sparky") || rawId === "hero_01") {
    const foxOrange = isSilhouette ? "#334155" : "#f97316";
    const foxCream = isSilhouette ? "#1e293b" : "#fef3c7";
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <polygon points="24,44 18,14 42,30" fill={foxOrange} />
        <polygon points="76,44 82,14 58,30" fill={foxOrange} />
        <polygon points="26,40 22,20 38,31" fill={foxCream} />
        <polygon points="74,40 78,20 62,31" fill={foxCream} />
        <polygon points="20,42 50,26 80,42 72,72 50,86 28,72" fill={foxOrange} />
        <polygon points="28,58 50,86 46,56" fill={foxCream} />
        <polygon points="72,58 50,86 54,56" fill={foxCream} />
        <circle cx="38" cy="50" r="4" fill={isSilhouette ? "#020617" : "#0f172a"} />
        <circle cx="62" cy="50" r="4" fill={isSilhouette ? "#020617" : "#0f172a"} />
        <polygon points="45,76 55,76 50,84" fill={isSilhouette ? "#020617" : "#0f172a"} />
      </svg>
    );
  }

  // 5. ÖZEL KİMLİK: Siber Samuray / Katana (Neon Vizör ve Çift Katana)
  if (lowerTitle.includes("samuray") || lowerTitle.includes("siber") || rawId === "hero_05") {
    const neonPink = isSilhouette ? "#334155" : "#ec4899";
    const neonCyan = isSilhouette ? "#475569" : "#22d3ee";
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <line x1="16" y1="84" x2="84" y2="16" stroke={neonCyan} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="84" y1="84" x2="16" y2="16" stroke={neonPink} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 24 54 Q 50 24 76 54 L 84 64 L 16 64 Z" fill={isSilhouette ? "#0f172a" : "#1e1b4b"} stroke={neonCyan} strokeWidth="2.5" />
        <path d="M 32 32 Q 50 48 68 32 Q 50 38 32 32 Z" fill={neonPink} />
        <rect x="32" y="52" width="36" height="8" rx="4" fill={neonCyan} />
      </svg>
    );
  }

  // 6. ÖZEL KİMLİK: Kozmik Astronot (Uzay Kaskı ve Gezegen Halkası)
  if (lowerTitle.includes("astronot") || lowerTitle.includes("kozmik") || rawId === "hero_06") {
    const visorColor = isSilhouette ? "#334155" : "#38bdf8";
    const suitColor = isSilhouette ? "#1e293b" : "#e2e8f0";
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <ellipse cx="50" cy="54" rx="42" ry="12" fill="none" stroke={visorColor} strokeWidth="2.5" transform="rotate(-18 50 54)" />
        <circle cx="50" cy="48" r="24" fill={suitColor} stroke={visorColor} strokeWidth="2.5" />
        <rect x="33" y="36" width="34" height="22" rx="10" fill={isSilhouette ? "#0f172a" : "#0369a1"} stroke={visorColor} strokeWidth="2" />
        <path d="M 38 42 Q 46 38 56 42" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity={isSilhouette ? "0.2" : "0.8"} />
      </svg>
    );
  }

  // 7. ÖZEL KİMLİK: Zaman Lordu Chronos (Altın Kum Saati)
  if (lowerTitle.includes("zaman") || lowerTitle.includes("chronos") || rawId === "hero_07") {
    const gold = isSilhouette ? "#334155" : "#fbbf24";
    const sand = isSilhouette ? "#475569" : "#fde047";
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="38" fill="none" stroke={gold} strokeWidth="2" strokeDasharray="4 4" />
        <rect x="28" y="18" width="44" height="6" rx="3" fill={gold} />
        <rect x="28" y="76" width="44" height="6" rx="3" fill={gold} />
        <path d="M 32 24 L 68 24 L 50 50 L 68 76 L 32 76 L 50 50 Z" fill={isSilhouette ? "#0f172a" : "#451a03"} stroke={gold} strokeWidth="2.5" />
        <polygon points="38,34 62,34 50,48" fill={sand} />
        <polygon points="36,74 64,74 50,56" fill={sand} />
      </svg>
    );
  }

  // 8. ÖZEL KİMLİK: Buzul Şövalyesi / Buz / Kristal (Buz Kristali ve Kalkan)
  if (lowerTitle.includes("buz") || lowerTitle.includes("kuzey") || lowerTitle.includes("kristal") || rawId === "hero_04") {
    const iceCyan = isSilhouette ? "#334155" : "#67e8f9";
    const deepIce = isSilhouette ? "#1e293b" : "#0891b2";
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <polygon points="50,10 66,34 58,86 50,92 42,86 34,34" fill={deepIce} stroke={iceCyan} strokeWidth="2.5" />
        <polygon points="50,16 58,36 50,82 42,36" fill={iceCyan} opacity={isSilhouette ? "0.3" : "0.75"} />
        <polygon points="20,42 36,34 38,56" fill={iceCyan} />
        <polygon points="80,42 64,34 62,56" fill={iceCyan} />
      </svg>
    );
  }

  // 9. ÖZEL KİMLİK: Deniz Kaptanı Nautilus / Pusula (Altın Denizci Pusulası)
  if (lowerTitle.includes("deniz") || lowerTitle.includes("kaptan") || lowerTitle.includes("pusula") || rawId === "hero_13") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="34" fill={cDark} stroke={cMain} strokeWidth="3.5" />
        <circle cx="50" cy="50" r="27" fill="none" stroke={cSec} strokeWidth="1.2" strokeDasharray="3 3" />
        <polygon points="50,18 57,43 82,50 57,57 50,82 43,57 18,50 43,43" fill={cMain} />
        <polygon points="50,24 54,46 50,50 46,46" fill={cSec} />
        <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
      </svg>
    );
  }

  // 10. DİĞER TÜM ESERLER İÇİN BENZERSİZ İNDEKS + ARMADAN OLUŞAN VEKTÖR SANATI
  const variant = idx % 5;

  if (category === "heroes") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="36" fill={cDark} stroke={cMain} strokeWidth="2" />
        {renderUniqueCrestAccent(crestIndex, cMain, cSec)}
        {variant === 0 && (
          <g>
            <path d="M 18 42 Q 28 22 38 40 L 32 54 Z" fill={cSec} />
            <path d="M 82 42 Q 72 22 62 40 L 68 54 Z" fill={cSec} />
            <circle cx="50" cy="48" r="18" fill={cMain} />
            <polygon points="40,46 50,54 60,46 50,62" fill={cDark} />
            <polygon points="50,12 45,30 55,30" fill={cSec} />
          </g>
        )}
        {variant === 1 && (
          <g>
            <line x1="22" y1="78" x2="78" y2="22" stroke={cSec} strokeWidth="4" />
            <line x1="78" y1="78" x2="22" y2="22" stroke={cSec} strokeWidth="4" />
            <polygon points="28,36 38,20 50,32 62,20 72,36 66,64 34,64" fill={cMain} stroke={cSec} strokeWidth="2" />
            <circle cx="50" cy="50" r="6" fill={cSec} />
          </g>
        )}
        {variant === 2 && (
          <g>
            <path d="M 26 76 Q 26 24 50 18 Q 74 24 74 76 Z" fill={cMain} stroke={cSec} strokeWidth="2" />
            <path d="M 36 72 Q 36 36 50 30 Q 64 36 64 72 Z" fill={cDark} />
            <polygon points="50,38 54,48 64,48 56,54 59,64 50,58 41,64 44,54 36,48 46,48" fill={cSec} />
          </g>
        )}
        {variant === 3 && (
          <g>
            <path d="M 30 30 Q 50 10 70 30 L 66 70 Q 50 84 34 70 Z" fill={cMain} stroke={cSec} strokeWidth="2.5" />
            <polygon points="36,44 46,48 38,54" fill={cSec} />
            <polygon points="64,44 54,48 62,54" fill={cSec} />
            <polygon points="44,64 56,64 50,74" fill={cDark} />
          </g>
        )}
        {variant === 4 && (
          <g>
            <path d="M 56 22 A 24 24 0 1 0 76 62 A 18 18 0 1 1 56 22 Z" fill={cSec} />
            <polygon points="50,34 62,50 50,66 38,50" fill={cMain} stroke={cSec} strokeWidth="2" />
          </g>
        )}
      </svg>
    );
  }

  if (category === "creatures") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="38" fill={cDark} stroke={cMain} strokeWidth="2" />
        {renderUniqueCrestAccent(crestIndex, cMain, cSec)}
        {variant === 0 && (
          <g>
            <path d="M 50 48 Q 16 18 10 42 Q 24 60 40 62 Z" fill={cMain} />
            <path d="M 50 48 Q 84 18 90 42 Q 76 60 60 62 Z" fill={cMain} />
            <polygon points="50,20 62,38 50,56 38,38" fill={cSec} />
            <circle cx="45" cy="36" r="2.5" fill={cDark} />
            <circle cx="55" cy="36" r="2.5" fill={cDark} />
            <polygon points="44,58 56,58 50,82" fill={cMain} />
          </g>
        )}
        {variant === 1 && (
          <g>
            <path d="M 50 64 C 22 54, 12 28, 24 18 C 30 34, 40 42, 50 44 C 60 42, 70 34, 76 18 C 88 28, 78 54, 50 64 Z" fill={cMain} stroke={cSec} strokeWidth="2" />
            <polygon points="50,22 56,36 50,48 44,36" fill={cSec} />
            <polygon points="44,64 50,86 56,64" fill={cSec} />
          </g>
        )}
        {variant === 2 && (
          <g>
            <path d="M 20 66 Q 35 50 50 66 T 80 66" fill="none" stroke={cSec} strokeWidth="4" strokeLinecap="round" />
            <path d="M 28 56 C 28 26, 72 26, 72 56 Z" fill={cMain} />
            <circle cx="42" cy="44" r="3.5" fill={cSec} />
            <circle cx="58" cy="44" r="3.5" fill={cSec} />
          </g>
        )}
        {variant === 3 && (
          <g>
            <rect x="28" y="26" width="44" height="48" rx="8" fill={cMain} stroke={cSec} strokeWidth="2.5" />
            <rect x="36" y="38" width="10" height="6" rx="2" fill={cSec} />
            <rect x="54" y="38" width="10" height="6" rx="2" fill={cSec} />
            <path d="M 38 58 L 62 58" stroke={cDark} strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {variant === 4 && (
          <g>
            <polygon points="26,22 38,40 24,48" fill={cSec} />
            <polygon points="74,22 62,40 76,48" fill={cSec} />
            <polygon points="30,36 70,36 62,74 50,84 38,74" fill={cMain} stroke={cSec} strokeWidth="2" />
            <polygon points="38,50 46,54 40,58" fill={cSec} />
            <polygon points="62,50 54,54 60,58" fill={cSec} />
          </g>
        )}
      </svg>
    );
  }

  if (category === "relics") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="38" fill={cDark} stroke={cMain} strokeWidth="2" />
        {renderUniqueCrestAccent(crestIndex, cMain, cSec)}
        {variant === 0 && (
          <g transform="rotate(25 50 50)">
            <polygon points="50,12 55,22 54,62 46,62 45,22" fill={cSec} stroke={cMain} strokeWidth="1.5" />
            <rect x="34" y="62" width="32" height="6" rx="3" fill={cMain} />
            <rect x="47" y="68" width="6" height="14" fill={cSec} />
            <circle cx="50" cy="84" r="4" fill={cMain} />
          </g>
        )}
        {variant === 1 && (
          <g>
            <polygon points="20,68 24,34 38,48 50,26 62,48 76,34 80,68" fill={cMain} stroke={cSec} strokeWidth="2.5" />
            <rect x="20" y="68" width="60" height="8" rx="3" fill={cSec} />
            <circle cx="50" cy="54" r="5" fill={cSec} />
          </g>
        )}
        {variant === 2 && (
          <g>
            <rect x="26" y="22" width="48" height="56" rx="5" fill={cMain} stroke={cSec} strokeWidth="2.5" />
            <line x1="34" y1="22" x2="34" y2="78" stroke={cSec} strokeWidth="2" />
            <polygon points="53,36 58,46 68,46 60,52 63,62 53,56 43,62 46,52 38,46 48,46" fill={cSec} />
          </g>
        )}
        {variant === 3 && (
          <g>
            <rect x="44" y="18" width="12" height="12" rx="2" fill={cSec} />
            <path d="M 44 30 L 56 30 L 72 56 A 22 22 0 1 1 28 56 Z" fill={cMain} stroke={cSec} strokeWidth="2.5" />
            <circle cx="44" cy="60" r="3" fill={cSec} />
            <circle cx="56" cy="52" r="4" fill={cSec} />
          </g>
        )}
        {variant === 4 && (
          <g>
            <path d="M 26 24 Q 50 18 74 24 L 74 52 Q 74 76 50 86 Q 26 76 26 52 Z" fill={cMain} stroke={cSec} strokeWidth="2.5" />
            <polygon points="50,32 62,50 50,68 38,50" fill={cSec} />
          </g>
        )}
      </svg>
    );
  }

  // 4. KALELER & BİLGELİK ANITLARI (Monuments)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      <circle cx="50" cy="50" r="38" fill={cDark} stroke={cMain} strokeWidth="2" />
      {renderUniqueCrestAccent(crestIndex, cMain, cSec)}
      {variant === 0 && (
        <g>
          <rect x="22" y="54" width="56" height="26" fill={cMain} stroke={cSec} strokeWidth="1.5" />
          <rect x="20" y="36" width="14" height="44" fill={cMain} stroke={cSec} strokeWidth="1.5" />
          <rect x="66" y="36" width="14" height="44" fill={cMain} stroke={cSec} strokeWidth="1.5" />
          <rect x="40" y="28" width="20" height="52" fill={cSec} stroke={cMain} strokeWidth="1.5" />
          <polygon points="38,28 50,14 62,28" fill={cMain} />
        </g>
      )}
      {variant === 1 && (
        <g>
          <circle cx="50" cy="26" r="8" fill={cSec} />
          <polygon points="50,32 82,78 18,78" fill={cMain} stroke={cSec} strokeWidth="2.5" />
          <line x1="50" y1="32" x2="58" y2="78" stroke={cSec} strokeWidth="1.5" />
        </g>
      )}
      {variant === 2 && (
        <g>
          <polygon points="18,34 50,16 82,34" fill={cSec} />
          <rect x="20" y="34" width="60" height="5" fill={cMain} />
          <rect x="26" y="39" width="8" height="34" fill={cSec} />
          <rect x="46" y="39" width="8" height="34" fill={cSec} />
          <rect x="66" y="39" width="8" height="34" fill={cSec} />
          <rect x="18" y="73" width="64" height="7" fill={cMain} />
        </g>
      )}
      {variant === 3 && (
        <g>
          <polygon points="50,28 84,18 84,38" fill={cSec} opacity="0.6" />
          <polygon points="38,78 43,32 57,32 62,78" fill={cMain} stroke={cSec} strokeWidth="2" />
          <circle cx="50" cy="26" r="6" fill={cSec} />
        </g>
      )}
      {variant === 4 && (
        <g>
          <polygon points="50,14 60,28 58,76 42,76 40,28" fill={cMain} stroke={cSec} strokeWidth="2" />
          <polygon points="50,14 55,28 50,74 45,28" fill={cSec} />
          <rect x="30" y="76" width="40" height="6" rx="2" fill={cSec} />
        </g>
      )}
    </svg>
  );
}
