"use client";

import React from "react";
import { ChestItem, ItemRarity, ItemType } from "../../data/chestItems";

export interface ItemArtworkProps {
  item:
    | ChestItem
    | {
        id: string;
        type?: ItemType | string;
        rarity?: ItemRarity | string;
        icon?: string;
        name?: { tr?: string; en?: string } | string;
        image?: string;
      };
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
}

// =============================================================================
// NADİRLİK (RARITY) IŞIK VE ARKA PLAN PROFİLLERİ
// =============================================================================
export const RARITY_THEMES: Record<
  ItemRarity,
  {
    bgGradient: string;
    borderClass: string;
    glowClass: string;
    accentColor: string;
    particleColor: string;
  }
> = {
  common: {
    bgGradient: "from-slate-800/90 via-emerald-950/40 to-slate-950",
    borderClass: "border-emerald-500/40",
    glowClass: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    accentColor: "#10b981",
    particleColor: "rgba(52, 211, 153, 0.4)",
  },
  rare: {
    bgGradient: "from-blue-900/70 via-cyan-950/60 to-slate-950",
    borderClass: "border-cyan-400/60",
    glowClass: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    accentColor: "#06b6d4",
    particleColor: "rgba(56, 189, 248, 0.6)",
  },
  epic: {
    bgGradient: "from-purple-900/80 via-fuchsia-950/70 to-slate-950",
    borderClass: "border-purple-400/70",
    glowClass: "shadow-[0_0_25px_rgba(168,85,247,0.35)]",
    accentColor: "#a855f7",
    particleColor: "rgba(232, 121, 249, 0.6)",
  },
  legendary: {
    bgGradient: "from-amber-900/80 via-yellow-950/80 to-slate-950",
    borderClass: "border-amber-400/80",
    glowClass: "shadow-[0_0_30px_rgba(251,191,36,0.5)]",
    accentColor: "#f59e0b",
    particleColor: "rgba(251, 191, 36, 0.8)",
  },
};

export default function ItemArtwork({
  item,
  className = "",
  size = "md",
  showGlow = true,
}: ItemArtworkProps) {
  const rarity: ItemRarity = (item.rarity as ItemRarity) || "common";
  const theme = RARITY_THEMES[rarity] || RARITY_THEMES.common;

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-base",
    xl: "w-28 h-28 text-lg",
  }[size];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden flex items-center justify-center border transition-all duration-300 group select-none ${sizeClasses} ${
        showGlow ? theme.glowClass : ""
      } ${theme.borderClass} bg-gradient-to-b ${theme.bgGradient} ${className}`}
    >
      {/* 1. Arka Plan Dinamik Radyal Işık Efekti */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${theme.accentColor} 0%, transparent 70%)`,
        }}
      />

      {/* 2. Nadirlik Parıltı Noktaları */}
      {rarity === "legendary" && (
        <>
          <span className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-amber-300 animate-ping opacity-75" />
          <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-yellow-200 animate-pulse opacity-80" />
        </>
      )}
      {rarity === "epic" && (
        <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-fuchsia-300 animate-pulse opacity-70" />
      )}

      {/* 3. Özel Vektörel SVG Çizimi */}
      <div className="w-full h-full p-1.5 flex items-center justify-center relative z-10">
        <ItemSvgRenderer itemId={item.id} rarity={rarity} type={item.type} icon={item.icon} />
      </div>
    </div>
  );
}

// =============================================================================
// HER BİR EŞYANIN KENDİ KİMLİĞİNE ÖZGÜ VEKTÖREL SVG RENDERER'I
// =============================================================================
function ItemSvgRenderer({
  itemId,
  rarity,
  type,
  icon,
}: {
  itemId: string;
  rarity: ItemRarity;
  type?: string;
  icon?: string;
}) {
  switch (itemId) {
    // -------------------------------------------------------------------------
    // TIER 1: HAYVANLAR & DOĞA MASKOTLARI
    // -------------------------------------------------------------------------
    case "fox_sparky":
      // Akıllı Gözlüklü Neşeli Tilki
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="foxFur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="foxCheek" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FED7AA" />
            </linearGradient>
          </defs>
          {/* Kulaklar */}
          <polygon points="20,15 35,45 10,40" fill="#EA580C" />
          <polygon points="20,20 30,42 14,38" fill="#FFFFFF" />
          <polygon points="80,15 65,45 90,40" fill="#EA580C" />
          <polygon points="80,20 70,42 86,38" fill="#FFFFFF" />
          {/* Yüz Gövdesi */}
          <polygon points="50,85 15,45 85,45" fill="url(#foxFur)" />
          {/* Beyaz Yanaklar */}
          <polygon points="50,85 15,45 35,55" fill="url(#foxCheek)" />
          <polygon points="50,85 85,45 65,55" fill="url(#foxCheek)" />
          {/* Burun */}
          <circle cx="50" cy="80" r="4.5" fill="#1E293B" />
          {/* Gözlük Çerçevesi */}
          <circle cx="36" cy="48" r="9" fill="none" stroke="#FBBF24" strokeWidth="2.5" />
          <circle cx="64" cy="48" r="9" fill="none" stroke="#FBBF24" strokeWidth="2.5" />
          <line x1="45" y1="48" x2="55" y2="48" stroke="#FBBF24" strokeWidth="2.5" />
          {/* Gözler */}
          <circle cx="36" cy="48" r="3.5" fill="#1E293B" />
          <circle cx="38" cy="46" r="1.2" fill="#FFFFFF" />
          <circle cx="64" cy="48" r="3.5" fill="#1E293B" />
          <circle cx="66" cy="46" r="1.2" fill="#FFFFFF" />
        </svg>
      );

    case "chicken_chuck":
      // Tavuk / Horoz Chuck
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="combGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>
          {/* İbik (Kırmızı Üçlü Tepe) */}
          <circle cx="40" cy="18" r="8" fill="url(#combGrad)" />
          <circle cx="50" cy="14" r="10" fill="url(#combGrad)" />
          <circle cx="60" cy="18" r="8" fill="url(#combGrad)" />
          {/* Kafa & Gövde */}
          <ellipse cx="50" cy="55" rx="32" ry="30" fill="#FEF08A" stroke="#FACC15" strokeWidth="2" />
          {/* Sakal (Gerdan Sarkıntısı) */}
          <ellipse cx="50" cy="74" rx="6" ry="10" fill="#EF4444" />
          {/* Gaga */}
          <polygon points="40,54 60,54 50,68" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
          {/* Gözler */}
          <circle cx="34" cy="46" r="5" fill="#FFFFFF" />
          <circle cx="34" cy="46" r="2.5" fill="#0F172A" />
          <circle cx="66" cy="46" r="5" fill="#FFFFFF" />
          <circle cx="66" cy="46" r="2.5" fill="#0F172A" />
        </svg>
      );

    case "river_beaver":
      // Nehir Kunduzu
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="beaverFur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#92400E" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          {/* Kulaklar */}
          <circle cx="26" cy="28" r="9" fill="#78350F" />
          <circle cx="26" cy="28" r="5" fill="#FDE68A" />
          <circle cx="74" cy="28" r="9" fill="#78350F" />
          <circle cx="74" cy="28" r="5" fill="#FDE68A" />
          {/* Kafa */}
          <ellipse cx="50" cy="52" rx="34" ry="28" fill="url(#beaverFur)" />
          {/* Yanak ve Ağız Alanı */}
          <ellipse cx="50" cy="62" rx="20" ry="14" fill="#D97706" />
          {/* Dişler (İki Beyaz Ön Diş) */}
          <rect x="44" y="68" width="5" height="9" rx="1" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.5" />
          <rect x="51" y="68" width="5" height="9" rx="1" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.5" />
          {/* Burun */}
          <ellipse cx="50" cy="58" rx="7" ry="5" fill="#1E293B" />
          {/* Gözler */}
          <circle cx="35" cy="46" r="4" fill="#0F172A" />
          <circle cx="36.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="65" cy="46" r="4" fill="#0F172A" />
          <circle cx="66.5" cy="44.5" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case "forest_frog":
      // Orman Kurbağası
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="frogSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>
          {/* Pörtlek Göz Soketleri */}
          <circle cx="28" cy="32" r="16" fill="url(#frogSkin)" />
          <circle cx="72" cy="32" r="16" fill="url(#frogSkin)" />
          {/* Göz Yuvarlağı */}
          <circle cx="28" cy="32" r="11" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <ellipse cx="28" cy="32" rx="4" ry="8" fill="#0F172A" />
          <circle cx="72" cy="32" r="11" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <ellipse cx="72" cy="32" rx="4" ry="8" fill="#0F172A" />
          {/* Kafa & Geniş Ağız */}
          <ellipse cx="50" cy="58" rx="38" ry="26" fill="url(#frogSkin)" />
          <path d="M 24 58 Q 50 78 76 58" fill="none" stroke="#14532D" strokeWidth="3" strokeLinecap="round" />
          {/* Burun Delikleri */}
          <circle cx="45" cy="50" r="1.5" fill="#14532D" />
          <circle cx="55" cy="50" r="1.5" fill="#14532D" />
        </svg>
      );

    case "night_owl":
      // Gece Baykuşu
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="owlFeathers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
          {/* Kulak Tüyleri / Boynuzlar */}
          <polygon points="20,15 35,40 15,38" fill="#4338CA" />
          <polygon points="80,15 65,40 85,38" fill="#4338CA" />
          {/* Gövde / Kafa */}
          <ellipse cx="50" cy="52" rx="35" ry="32" fill="url(#owlFeathers)" />
          {/* Dev Gece Görüş Gözleri */}
          <circle cx="34" cy="46" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          <circle cx="34" cy="46" r="10" fill="#0F172A" />
          <circle cx="37" cy="43" r="3" fill="#FFFFFF" />
          <circle cx="66" cy="46" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          <circle cx="66" cy="46" r="10" fill="#0F172A" />
          <circle cx="69" cy="43" r="3" fill="#FFFFFF" />
          {/* Keskin Gaga */}
          <polygon points="46,52 54,52 50,68" fill="#F59E0B" />
        </svg>
      );

    case "baby_panda":
      // Yavru Panda
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Siyah Kulaklar */}
          <circle cx="24" cy="24" r="13" fill="#0F172A" />
          <circle cx="76" cy="24" r="13" fill="#0F172A" />
          {/* Beyaz Yüz */}
          <circle cx="50" cy="54" r="34" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
          {/* Göz Yamaları */}
          <ellipse cx="33" cy="48" rx="10" ry="13" fill="#0F172A" transform="rotate(-15 33 48)" />
          <ellipse cx="67" cy="48" rx="10" ry="13" fill="#0F172A" transform="rotate(15 67 48)" />
          {/* Parlayan Göz Bebekleri */}
          <circle cx="34" cy="46" r="3.5" fill="#FFFFFF" />
          <circle cx="66" cy="46" r="3.5" fill="#FFFFFF" />
          {/* Burun ve Pembe Yanaklar */}
          <ellipse cx="50" cy="62" rx="6" ry="4" fill="#0F172A" />
          <circle cx="24" cy="60" r="5" fill="#FDA4AF" opacity="0.6" />
          <circle cx="76" cy="60" r="5" fill="#FDA4AF" opacity="0.6" />
        </svg>
      );

    case "apprentice_cat":
      // Çırak Kedi (Sihirbaz Şapkalı)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Kedi Kulakları */}
          <polygon points="18,22 36,44 14,46" fill="#F59E0B" />
          <polygon points="20,26 32,42 17,43" fill="#FDE68A" />
          <polygon points="82,22 64,44 86,46" fill="#F59E0B" />
          <polygon points="80,26 68,42 83,43" fill="#FDE68A" />
          {/* Baş */}
          <ellipse cx="50" cy="56" rx="34" ry="26" fill="#FBBF24" />
          {/* Minik Büyücü Şapkası */}
          <polygon points="50,10 38,32 62,32" fill="#7C3AED" />
          <ellipse cx="50" cy="32" rx="15" ry="3" fill="#6D28D9" />
          <circle cx="50" cy="20" r="2.5" fill="#FDE047" />
          {/* Gözler */}
          <ellipse cx="36" cy="52" rx="5" ry="7" fill="#10B981" />
          <ellipse cx="36" cy="52" rx="2" ry="6" fill="#0F172A" />
          <ellipse cx="64" cy="52" rx="5" ry="7" fill="#10B981" />
          <ellipse cx="64" cy="52" rx="2" ry="6" fill="#0F172A" />
          {/* Burun ve Bıyıklar */}
          <polygon points="47,62 53,62 50,66" fill="#F43F5E" />
          <line x1="20" y1="62" x2="35" y2="64" stroke="#78350F" strokeWidth="1.5" />
          <line x1="18" y1="68" x2="34" y2="68" stroke="#78350F" strokeWidth="1.5" />
          <line x1="80" y1="62" x2="65" y2="64" stroke="#78350F" strokeWidth="1.5" />
          <line x1="82" y1="68" x2="66" y2="68" stroke="#78350F" strokeWidth="1.5" />
        </svg>
      );

    case "cheerful_squirrel":
      // Neşeli Sincap (Palamutlu)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Kabarık Kuyruk */}
          <path d="M 65 75 C 95 60 90 20 65 15 C 55 13 52 22 60 28 C 72 38 72 65 55 70 Z" fill="#D97706" />
          {/* Kulaklar */}
          <ellipse cx="30" cy="22" rx="5" ry="10" fill="#B45309" />
          <ellipse cx="44" cy="20" rx="5" ry="10" fill="#B45309" />
          {/* Kafa & Yanaklar */}
          <ellipse cx="38" cy="42" rx="22" ry="20" fill="#D97706" />
          <circle cx="38" cy="48" r="14" fill="#FED7AA" />
          {/* Göz */}
          <circle cx="34" cy="38" r="4.5" fill="#0F172A" />
          <circle cx="35.5" cy="36.5" r="1.5" fill="#FFFFFF" />
          {/* Palamut */}
          <ellipse cx="38" cy="72" rx="10" ry="12" fill="#92400E" />
          <ellipse cx="38" cy="62" rx="11" ry="5" fill="#78350F" stroke="#451A03" strokeWidth="1" />
        </svg>
      );

    case "wise_turtle":
      // Bilge Kaplumbağa
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Kabuk (Hekzagonal Desenli) */}
          <circle cx="50" cy="52" r="32" fill="#15803D" stroke="#166534" strokeWidth="3" />
          <polygon points="50,32 64,40 64,56 50,64 36,56 36,40" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
          <line x1="50" y1="32" x2="50" y2="20" stroke="#14532D" strokeWidth="2" />
          <line x1="64" y1="40" x2="78" y2="35" stroke="#14532D" strokeWidth="2" />
          <line x1="64" y1="56" x2="78" y2="65" stroke="#14532D" strokeWidth="2" />
          <line x1="50" y1="64" x2="50" y2="80" stroke="#14532D" strokeWidth="2" />
          <line x1="36" y1="56" x2="22" y2="65" stroke="#14532D" strokeWidth="2" />
          <line x1="36" y1="40" x2="22" y2="35" stroke="#14532D" strokeWidth="2" />
          {/* Baş */}
          <ellipse cx="50" cy="20" rx="12" ry="10" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
          <circle cx="45" cy="18" r="2" fill="#0F172A" />
          <circle cx="55" cy="18" r="2" fill="#0F172A" />
        </svg>
      );

    case "mountain_goat":
      // Dağ Keçisi
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Kavisli Boynuzlar */}
          <path d="M 38 32 C 30 10 15 15 12 25" fill="none" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
          <path d="M 62 32 C 70 10 85 15 88 25" fill="none" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
          {/* Kafa */}
          <polygon points="50,75 32,32 68,32" fill="#E2E8F0" />
          {/* Sakal */}
          <polygon points="50,75 44,90 56,90" fill="#CBD5E1" />
          {/* Kulaklar */}
          <ellipse cx="24" cy="40" rx="8" ry="4" fill="#CBD5E1" transform="rotate(-25 24 40)" />
          <ellipse cx="76" cy="40" rx="8" ry="4" fill="#CBD5E1" transform="rotate(25 76 40)" />
          {/* Gözler */}
          <circle cx="40" cy="44" r="3.5" fill="#0F172A" />
          <circle cx="60" cy="44" r="3.5" fill="#0F172A" />
        </svg>
      );

    // -------------------------------------------------------------------------
    // TIER 2: ORTAÇAĞ & FANTEZİ KAHRAMANLARI
    // -------------------------------------------------------------------------
    case "knight_leo":
      // Kale Şövalyesi Leo (Yeleli Aslan Miğferi)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="leoGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          {/* Aslan Yelesi */}
          <circle cx="50" cy="50" r="38" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          {/* Şövalye Miğferi */}
          <path d="M 28 45 C 28 25 72 25 72 45 L 72 70 C 72 80 50 86 50 86 C 50 86 28 80 28 70 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2.5" />
          {/* Kırmızı Tüy Plume */}
          <path d="M 50 25 C 50 8 75 10 80 18 C 75 22 60 22 50 25 Z" fill="#EF4444" />
          {/* Altın Vizör Izgarası */}
          <rect x="36" y="46" width="28" height="6" rx="2" fill="#0F172A" stroke="url(#leoGold)" strokeWidth="1.5" />
          <line x1="42" y1="46" x2="42" y2="52" stroke="url(#leoGold)" strokeWidth="1" />
          <line x1="50" y1="46" x2="50" y2="52" stroke="url(#leoGold)" strokeWidth="1" />
          <line x1="58" y1="46" x2="58" y2="52" stroke="url(#leoGold)" strokeWidth="1" />
        </svg>
      );

    case "village_archer":
      // Köy Okçusu (Kapüşonlu)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Yay Silüeti Arka Plan */}
          <path d="M 20 20 Q 10 50 20 80" fill="none" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
          <line x1="20" y1="20" x2="20" y2="80" stroke="#E2E8F0" strokeWidth="1" />
          {/* Yeşil Orman Kapüşonu */}
          <path d="M 32 30 C 32 15 68 15 68 30 L 76 65 C 76 80 50 86 50 86 C 50 86 24 80 24 65 Z" fill="#15803D" stroke="#14532D" strokeWidth="2" />
          {/* Yüz Gölgesi & Gözler */}
          <polygon points="36,45 64,45 50,70" fill="#0F172A" />
          <ellipse cx="43" cy="50" rx="3" ry="1.5" fill="#4ADE80" />
          <ellipse cx="57" cy="50" rx="3" ry="1.5" fill="#4ADE80" />
          {/* Ok Ucu Rozeti */}
          <polygon points="50,22 45,30 55,30" fill="#E2E8F0" />
        </svg>
      );

    case "desert_nomad_alex":
      // Çöl Göçebesi Alex (Puşili ve Gözlüklü)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Puşi / Sarık Katları */}
          <ellipse cx="50" cy="30" rx="30" ry="16" fill="#DC2626" />
          <ellipse cx="50" cy="38" rx="28" ry="10" fill="#B91C1C" />
          {/* Göz Bandı / Toz Gözlüğü */}
          <rect x="30" y="44" width="40" height="12" rx="4" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="40" cy="50" rx="6" ry="4" fill="#38BDF8" opacity="0.8" />
          <ellipse cx="60" cy="50" rx="6" ry="4" fill="#38BDF8" opacity="0.8" />
          {/* Alt Peçe / Yüz Örtüsü */}
          <path d="M 28 54 L 72 54 L 64 86 L 36 86 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />
        </svg>
      );

    case "stone_golem":
      // Taş Golem (Işıyan Mavi Rünlü)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Köşeli Granit Kafa */}
          <polygon points="25,25 75,25 82,75 50,90 18,75" fill="#475569" stroke="#334155" strokeWidth="3" />
          <polygon points="32,32 68,32 74,70 50,82 26,70" fill="#64748B" />
          {/* Rünik Parlayan Gözler */}
          <rect x="34" y="46" width="10" height="5" rx="1" fill="#38BDF8" className="animate-pulse" />
          <rect x="56" y="46" width="10" height="5" rx="1" fill="#38BDF8" className="animate-pulse" />
          {/* Alında Rün Çatlağı */}
          <path d="M 50 32 L 48 42 L 53 45 L 50 56" fill="none" stroke="#06B6D4" strokeWidth="2.5" />
        </svg>
      );

    case "shadow_thief":
      // Gölge Hırsızı
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Mor Sis Halesi */}
          <circle cx="50" cy="50" r="38" fill="#581C87" opacity="0.4" />
          {/* Kara Kapüşon */}
          <path d="M 50 15 C 30 15 20 40 20 65 C 20 85 50 90 50 90 C 50 90 80 85 80 65 C 80 40 70 15 50 15 Z" fill="#0F172A" stroke="#3B0764" strokeWidth="2" />
          {/* Karanlık Yüz ve Parlayan Ametist Gözler */}
          <polygon points="35,50 65,50 50,72" fill="#020617" />
          <ellipse cx="42" cy="52" rx="4" ry="2" fill="#C084FC" className="animate-pulse" />
          <ellipse cx="58" cy="52" rx="4" ry="2" fill="#C084FC" className="animate-pulse" />
        </svg>
      );

    case "sailor_captain":
      // Denizci Kaptan
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Kaptan Şapkası (Tricorn) */}
          <path d="M 15 35 Q 50 15 85 35 Q 50 25 15 35 Z" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="50" cy="30" rx="20" ry="12" fill="#0F172A" />
          {/* Altın Çapa Amblemi */}
          <circle cx="50" cy="28" r="3" fill="#FBBF24" />
          <path d="M 46 32 Q 50 36 54 32" fill="none" stroke="#FBBF24" strokeWidth="1.5" />
          {/* Yüz ve Beyaz Sakal */}
          <ellipse cx="50" cy="54" rx="24" ry="18" fill="#FCD34D" opacity="0.8" />
          <path d="M 32 58 Q 50 88 68 58 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Göz Bağı & Sağ Göz */}
          <line x1="30" y1="42" x2="52" y2="52" stroke="#0F172A" strokeWidth="2" />
          <circle cx="42" cy="48" r="5" fill="#0F172A" />
          <circle cx="60" cy="48" r="3" fill="#0F172A" />
        </svg>
      );

    case "night_mage":
      // Gece Büyücüsü
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Yıldızlı Büyücü Şapkası */}
          <path d="M 50 10 L 72 45 L 28 45 Z" fill="#4338CA" stroke="#312E81" strokeWidth="2" />
          <ellipse cx="50" cy="45" rx="32" ry="7" fill="#3730A3" stroke="#6366F1" strokeWidth="1.5" />
          <polygon points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27" fill="#FDE047" />
          {/* Uzun Beyaz Sakal */}
          <path d="M 32 52 Q 50 95 68 52 Z" fill="#F8FAFC" />
          {/* Büyülü Gözler */}
          <circle cx="42" cy="48" r="2.5" fill="#818CF8" />
          <circle cx="58" cy="48" r="2.5" fill="#818CF8" />
        </svg>
      );

    case "winged_pegasus":
      // Kanatlı Pegasus
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="pegasusWing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>
          {/* Sol & Sağ Açık Kanatlar */}
          <path d="M 40 45 C 10 30 5 10 20 15 C 35 20 38 35 42 45 Z" fill="url(#pegasusWing)" stroke="#BFDBFE" strokeWidth="1.5" />
          <path d="M 60 45 C 90 30 95 10 80 15 C 65 20 62 35 58 45 Z" fill="url(#pegasusWing)" stroke="#BFDBFE" strokeWidth="1.5" />
          {/* At Başı & Boynu */}
          <polygon points="50,25 38,55 50,75 62,55" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
          {/* Gök Mavisi Yele */}
          <path d="M 50 25 Q 56 12 50 8" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
          <circle cx="45" cy="48" r="3" fill="#1E3A8A" />
          <circle cx="55" cy="48" r="3" fill="#1E3A8A" />
        </svg>
      );

    case "armored_bear":
      // Zırhlı Ayı
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Ayı Kulakları */}
          <circle cx="25" cy="25" r="10" fill="#78350F" />
          <circle cx="75" cy="25" r="10" fill="#78350F" />
          {/* İri Baş */}
          <circle cx="50" cy="52" r="34" fill="#92400E" />
          {/* Çelik Alın Zırhı */}
          <polygon points="34,30 66,30 60,55 50,62 40,55" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          <circle cx="50" cy="42" r="3" fill="#F59E0B" />
          {/* Pençe Çiziği */}
          <line x1="38" y1="36" x2="34" y2="44" stroke="#DC2626" strokeWidth="1.5" />
          {/* Burun */}
          <ellipse cx="50" cy="70" rx="10" ry="7" fill="#451A03" />
        </svg>
      );

    case "cave_troll":
      // Mağara Trollü
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Sivri Kulaklar */}
          <polygon points="15,40 30,35 25,50" fill="#65A30D" />
          <polygon points="85,40 70,35 75,50" fill="#65A30D" />
          {/* Kafa & Çıkık Çene */}
          <ellipse cx="50" cy="52" rx="32" ry="28" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
          {/* Yukarı Bakan Dişler (Tusks) */}
          <polygon points="36,68 40,58 44,68" fill="#FEF08A" />
          <polygon points="56,68 60,58 64,68" fill="#FEF08A" />
          {/* Sarı Küçük Gözler */}
          <circle cx="38" cy="42" r="3.5" fill="#EAB308" />
          <circle cx="38" cy="42" r="1.5" fill="#0F172A" />
          <circle cx="62" cy="42" r="3.5" fill="#EAB308" />
          <circle cx="62" cy="42" r="1.5" fill="#0F172A" />
        </svg>
      );

    // -------------------------------------------------------------------------
    // TIER 3: GELECEK & SİBER KAHRAMANLAR
    // -------------------------------------------------------------------------
    case "cyber_cat":
      // Siber Kedi
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Siber Kulaklar */}
          <polygon points="20,18 38,40 16,42" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          <polygon points="80,18 62,40 84,42" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          {/* Kafa */}
          <polygon points="50,82 22,46 78,46" fill="#1E293B" stroke="#06B6D4" strokeWidth="2" />
          {/* Neon Vizör Göz */}
          <rect x="28" y="44" width="44" height="8" rx="2" fill="#06B6D4" className="animate-pulse" />
          {/* Dijital Bıyık Işınları */}
          <line x1="15" y1="58" x2="30" y2="60" stroke="#22D3EE" strokeWidth="2" />
          <line x1="85" y1="58" x2="70" y2="60" stroke="#22D3EE" strokeWidth="2" />
        </svg>
      );

    case "cyborg_robot":
      // Siborg Robot
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Anten */}
          <line x1="50" y1="12" x2="50" y2="24" stroke="#94A3B8" strokeWidth="3" />
          <circle cx="50" cy="12" r="4" fill="#EF4444" className="animate-ping" />
          {/* Kasa */}
          <rect x="24" y="24" width="52" height="52" rx="10" fill="#334155" stroke="#64748B" strokeWidth="2.5" />
          {/* LED Ekran / Gözler */}
          <rect x="32" y="36" width="36" height="16" rx="4" fill="#0F172A" stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="42" cy="44" r="4" fill="#38BDF8" className="animate-pulse" />
          <circle cx="58" cy="44" r="4" fill="#38BDF8" className="animate-pulse" />
          {/* Ağız Izgarası */}
          <line x1="36" y1="62" x2="64" y2="62" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      );

    case "nebula_guardian_evelyn":
      // Nebula Muhafızı Dr. Evelyn (Astronot Kaskı)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="nebulaVisor" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          {/* Kask Dış Halkası */}
          <circle cx="50" cy="50" r="38" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="3" />
          {/* Nebula Yansımalı Altın/Mor Vizör */}
          <ellipse cx="50" cy="50" rx="28" ry="22" fill="url(#nebulaVisor)" stroke="#F59E0B" strokeWidth="2" />
          {/* Vizör Üzeri Işık Parıltısı */}
          <path d="M 32 40 Q 50 32 68 40" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
        </svg>
      );

    case "galaxy_pilot":
      // Galaksi Pilotu
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Pilot Kaskı */}
          <ellipse cx="50" cy="48" rx="34" ry="30" fill="#1E293B" stroke="#F97316" strokeWidth="2.5" />
          {/* Turuncu Vizör */}
          <ellipse cx="50" cy="44" rx="24" ry="14" fill="#EA580C" opacity="0.9" />
          {/* Çift Oksijen Hortumu */}
          <path d="M 38 65 Q 30 80 25 85" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <path d="M 62 65 Q 70 80 75 85" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case "plasma_alien":
      // Plazma Uzaylısı
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <defs>
            <linearGradient id="alienSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>
          </defs>
          {/* Geniş Damla Kafa */}
          <path d="M 50 15 C 22 15 15 45 30 75 C 38 88 62 88 70 75 C 85 45 78 15 50 15 Z" fill="url(#alienSkin)" stroke="#A855F7" strokeWidth="2" />
          {/* Kocaman Badem Gözler */}
          <ellipse cx="36" cy="50" rx="9" ry="16" fill="#0F172A" transform="rotate(20 36 50)" />
          <ellipse cx="64" cy="50" rx="9" ry="16" fill="#0F172A" transform="rotate(-20 64 50)" />
          <circle cx="36" cy="45" r="3" fill="#E879F9" opacity="0.8" />
          <circle cx="64" cy="45" r="3" fill="#E879F9" opacity="0.8" />
        </svg>
      );

    case "hologram_sage":
      // Hologram Bilge
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Hologram Çerçeve Çizgileri */}
          <polygon points="50,15 80,35 80,65 50,85 20,65 20,35" fill="none" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Silüet Baş */}
          <circle cx="50" cy="45" r="22" fill="#0891B2" opacity="0.3" stroke="#22D3EE" strokeWidth="2" />
          {/* Dalga Taraması */}
          <line x1="25" y1="38" x2="75" y2="38" stroke="#67E8F9" strokeWidth="1" opacity="0.7" />
          <line x1="22" y1="46" x2="78" y2="46" stroke="#67E8F9" strokeWidth="1" opacity="0.7" />
          <line x1="25" y1="54" x2="75" y2="54" stroke="#67E8F9" strokeWidth="1" opacity="0.7" />
        </svg>
      );

    case "quantum_agent_sarah":
      // Kuantum Ajanı Sarah
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Ajan Başlığı */}
          <ellipse cx="50" cy="50" rx="30" ry="32" fill="#0F172A" stroke="#8B5CF6" strokeWidth="2.5" />
          {/* Tek Göz Siber Hedefleme Monoklü */}
          <circle cx="40" cy="46" r="9" fill="#1E1B4B" stroke="#A855F7" strokeWidth="2" />
          <circle cx="40" cy="46" r="3" fill="#EC4899" className="animate-ping" />
          {/* Diğer Göz */}
          <circle cx="62" cy="46" r="4" fill="#E2E8F0" />
          {/* Çene Altı Şimşek / Kuantum Devresi */}
          <path d="M 40 68 L 50 62 L 60 68" fill="none" stroke="#C084FC" strokeWidth="2" />
        </svg>
      );

    case "star_angel":
      // Yıldız Meleği
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Hale */}
          <ellipse cx="50" cy="20" rx="24" ry="7" fill="none" stroke="#FDE047" strokeWidth="3" className="animate-pulse" />
          {/* Kanatlar */}
          <path d="M 35 48 C 10 35 15 15 25 30 Z" fill="#E0E7FF" opacity="0.8" />
          <path d="M 65 48 C 90 35 85 15 75 30 Z" fill="#E0E7FF" opacity="0.8" />
          {/* Melek Yüzü */}
          <circle cx="50" cy="52" r="22" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1.5" />
          {/* Yıldız Gözler */}
          <circle cx="43" cy="50" r="2.5" fill="#6366F1" />
          <circle cx="57" cy="50" r="2.5" fill="#6366F1" />
        </svg>
      );

    // -------------------------------------------------------------------------
    // TIER 4: KADİM EFSANELER (LEGENDARY BOSS & MYTHIC VARLIKLAR)
    // -------------------------------------------------------------------------
    case "ancient_lava_dragon_ignis":
      // Antik Lav Ejderhası Ignis
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
          <defs>
            <linearGradient id="dragonFire" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="50%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>
          {/* Kıvrık Sivri Boynuzlar */}
          <path d="M 35 30 C 20 10 5 12 8 2" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          <path d="M 65 30 C 80 10 95 12 92 2" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          {/* Ejderha Başı */}
          <polygon points="50,88 20,40 50,25 80,40" fill="url(#dragonFire)" stroke="#F97316" strokeWidth="2.5" />
          {/* Kor Lav Gözleri */}
          <polygon points="34,42 44,46 36,50" fill="#FACC15" className="animate-pulse" />
          <polygon points="66,42 56,46 64,50" fill="#FACC15" className="animate-pulse" />
          {/* Burun Alev Dumanı */}
          <circle cx="44" cy="74" r="2" fill="#F59E0B" />
          <circle cx="56" cy="74" r="2" fill="#F59E0B" />
        </svg>
      );

    case "golden_phoenix":
      // Altın Anka Kuşu
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]">
          {/* Alev Kanatları */}
          <path d="M 50 50 C 15 40 10 10 30 20 C 35 35 45 45 50 50 Z" fill="#F59E0B" opacity="0.9" />
          <path d="M 50 50 C 85 40 90 10 70 20 C 65 35 55 45 50 50 Z" fill="#F59E0B" opacity="0.9" />
          {/* Anka Başı */}
          <polygon points="50,15 42,45 58,45" fill="#EF4444" />
          {/* Altın Tepe Tüyü */}
          <path d="M 50 15 Q 50 2 60 5" fill="none" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
          {/* Gaga */}
          <polygon points="50,35 45,45 55,45 50,55" fill="#FACC15" />
        </svg>
      );

    case "judge_harrison":
      // Baş Yargıç Harrison
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Pudralı Beyaz Peruk */}
          <ellipse cx="50" cy="36" rx="32" ry="24" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="22" cy="48" r="8" fill="#F1F5F9" />
          <circle cx="78" cy="48" r="8" fill="#F1F5F9" />
          {/* Yüz */}
          <ellipse cx="50" cy="50" rx="20" ry="18" fill="#FDE68A" />
          {/* Altın Monokl */}
          <circle cx="42" cy="48" r="6" fill="none" stroke="#CA8A04" strokeWidth="2" />
          <circle cx="42" cy="48" r="2.5" fill="#0F172A" />
          <circle cx="58" cy="48" r="2.5" fill="#0F172A" />
          {/* Yargıç Kravatı (Jabot) */}
          <polygon points="50,68 44,88 56,88" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        </svg>
      );

    case "cosmic_dragon_bahamut":
      // Kozmik Ejderha Bahamut
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]">
          {/* Nebula Boynuzları */}
          <path d="M 35 25 Q 15 5 10 0" fill="none" stroke="#A855F7" strokeWidth="5" strokeLinecap="round" />
          <path d="M 65 25 Q 85 5 90 0" fill="none" stroke="#A855F7" strokeWidth="5" strokeLinecap="round" />
          {/* Gece Mavisi Kafa */}
          <polygon points="50,86 18,36 50,22 82,36" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2.5" />
          {/* Galaksi Gözler */}
          <circle cx="36" cy="44" r="4.5" fill="#38BDF8" className="animate-pulse" />
          <circle cx="64" cy="44" r="4.5" fill="#38BDF8" className="animate-pulse" />
        </svg>
      );

    case "infinity_lord":
      // Sonsuzluk Lordu
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
          {/* Taç */}
          <polygon points="28,24 38,10 50,20 62,10 72,24" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          {/* Yüz Silüeti */}
          <polygon points="50,82 26,35 74,35" fill="#0F172A" stroke="#F59E0B" strokeWidth="2.5" />
          {/* Alında Sonsuzluk Sembolü (∞) */}
          <path d="M 42 46 C 36 40 36 52 42 46 C 48 40 54 52 58 46 C 64 40 64 52 58 46 C 54 40 48 52 42 46 Z" fill="none" stroke="#FDE047" strokeWidth="2.5" className="animate-pulse" />
        </svg>
      );

    // =========================================================================
    // EKİPMAN KARTLARI (PARLAK METALİK & NEON İLLÜSTRASYONLAR)
    // =========================================================================
    case "wooden_dict_pen":
      // Tahta Sözlük Kalemi
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Ahşap Gövde */}
          <line x1="25" y1="75" x2="65" y2="35" stroke="#92400E" strokeWidth="8" strokeLinecap="round" />
          {/* Pirinç / Altın Uç */}
          <polygon points="65,35 78,22 82,26 69,39" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
          <line x1="78" y1="22" x2="84" y2="16" stroke="#1E293B" strokeWidth="2" />
        </svg>
      );

    case "bronze_dagger":
      // Bronz Hançer
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Kabza */}
          <line x1="25" y1="75" x2="40" y2="60" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <circle cx="22" cy="78" r="4" fill="#D97706" />
          <line x1="33" y1="67" x2="47" y2="53" stroke="#D97706" strokeWidth="4" />
          {/* Bronz Bıçak */}
          <polygon points="40,60 76,24 82,18 76,30 60,46" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
        </svg>
      );

    case "apprentice_notebook":
      // Çırak Not Defteri
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <rect x="26" y="20" width="48" height="60" rx="5" fill="#451A03" stroke="#D97706" strokeWidth="2" />
          {/* Sayfa Kenarı */}
          <rect x="30" y="24" width="40" height="52" rx="3" fill="#FEF3C7" />
          {/* Kırmızı Şerit Ayraç */}
          <line x1="50" y1="20" x2="50" y2="70" stroke="#DC2626" strokeWidth="3" />
        </svg>
      );

    case "nature_compass":
      // Doğa Pusulası
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <circle cx="50" cy="50" r="34" fill="#1E293B" stroke="#D97706" strokeWidth="3" />
          {/* Zümrüt Pusula İğnesi */}
          <polygon points="50,22 55,50 50,46 45,50" fill="#10B981" />
          <polygon points="50,78 55,50 50,54 45,50" fill="#94A3B8" />
          <circle cx="50" cy="50" r="3" fill="#FBBF24" />
        </svg>
      );

    case "leaf_amulet":
      // Yaprak Tılsımı
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
          {/* Altın Zincir */}
          <path d="M 35 15 Q 50 35 65 15" fill="none" stroke="#FBBF24" strokeWidth="2.5" />
          {/* Yeşim Yaprak */}
          <path d="M 50 35 C 30 50 35 75 50 85 C 65 75 70 50 50 35 Z" fill="#10B981" stroke="#34D399" strokeWidth="2" />
          <line x1="50" y1="38" x2="50" y2="82" stroke="#065F46" strokeWidth="2" />
        </svg>
      );

    case "silver_quill":
      // Gümüş Tüy Kalem
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <path d="M 25 80 Q 40 40 80 18 C 75 35 65 50 45 65 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="25" y1="80" x2="80" y2="18" stroke="#64748B" strokeWidth="1.5" />
        </svg>
      );

    case "knight_steel_shield":
      // Şövalye Çelik Kalkanı
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <path d="M 25 22 L 75 22 L 75 55 C 75 75 50 86 50 86 C 50 86 25 75 25 55 Z" fill="#1E3A8A" stroke="#94A3B8" strokeWidth="3" />
          {/* Altın Haç */}
          <line x1="50" y1="26" x2="50" y2="78" stroke="#FBBF24" strokeWidth="5" />
          <line x1="32" y1="45" x2="68" y2="45" stroke="#FBBF24" strokeWidth="5" />
        </svg>
      );

    case "flaming_dict_sword":
      // Alevli Sözlük Kılıcı
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">
          {/* Alev Efekti */}
          <path d="M 40 50 Q 55 25 80 15 Q 75 40 60 55 Z" fill="#F97316" opacity="0.6" />
          {/* Kılıç Namlusu */}
          <line x1="25" y1="75" x2="78" y2="22" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
          {/* Altın Kabza */}
          <line x1="30" y1="65" x2="40" y2="75" stroke="#FBBF24" strokeWidth="4" />
          <circle cx="23" cy="77" r="4" fill="#B45309" />
        </svg>
      );

    case "wind_boots":
      // Rüzgar Çizmeleri (Kanatlı)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          {/* Kanat */}
          <path d="M 30 35 C 15 20 20 5 35 15 C 40 22 38 30 30 35 Z" fill="#67E8F9" stroke="#06B6D4" strokeWidth="1.5" />
          {/* Çizme */}
          <path d="M 38 25 L 55 25 L 55 58 L 78 68 L 78 80 L 38 80 Z" fill="#78350F" stroke="#B45309" strokeWidth="2" />
        </svg>
      );

    case "ancient_scroll":
      // Kadim Parşömen
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <rect x="25" y="28" width="50" height="44" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <circle cx="25" cy="50" r="6" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
          <circle cx="75" cy="50" r="6" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
          {/* Kırmızı Mühür */}
          <circle cx="50" cy="50" r="6" fill="#DC2626" />
        </svg>
      );

    case "laser_pen":
      // Lazer Kalem
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
          {/* Gövde */}
          <line x1="25" y1="75" x2="65" y2="35" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
          {/* Lazer Işını */}
          <line x1="65" y1="35" x2="88" y2="12" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
        </svg>
      );

    case "gravity_belt":
      // Yerçekimi Kemeri
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
          <rect x="18" y="38" width="64" height="24" rx="6" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          {/* Merkez Yerçekimi Küresi */}
          <circle cx="50" cy="50" r="14" fill="#581C87" stroke="#A855F7" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="6" fill="#E879F9" className="animate-pulse" />
        </svg>
      );

    case "quantum_visor":
      // Kuantum Vizörü
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
          <path d="M 20 45 L 80 45 L 75 62 L 55 62 L 50 54 L 45 62 L 25 62 Z" fill="#0E7490" stroke="#22D3EE" strokeWidth="2.5" />
          <circle cx="36" cy="53" r="3" fill="#A5F3FC" className="animate-ping" />
        </svg>
      );

    case "cosmic_compass":
      // Kozmik Pusula
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
          {/* Jiroskopik Halka */}
          <ellipse cx="50" cy="50" rx="34" ry="16" fill="none" stroke="#FBBF24" strokeWidth="2.5" transform="rotate(30 50 50)" />
          <ellipse cx="50" cy="50" rx="34" ry="16" fill="none" stroke="#FBBF24" strokeWidth="2.5" transform="rotate(-30 50 50)" />
          {/* Merkez Yıldız */}
          <circle cx="50" cy="50" r="8" fill="#FDE047" className="animate-pulse" />
        </svg>
      );

    case "cosmic_gold_pen":
      // Kozmik Altın Kalem (Grandmaster)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]">
          <line x1="20" y1="80" x2="68" y2="32" stroke="#F59E0B" strokeWidth="9" strokeLinecap="round" />
          <polygon points="68,32 82,18 86,22 72,36" fill="#FDE047" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="85" cy="15" r="3" fill="#FFFFFF" className="animate-ping" />
        </svg>
      );

    case "ancient_wisdom_shield":
      // Kadim Bilgelik Kalkanı
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]">
          <circle cx="50" cy="50" r="36" fill="#78350F" stroke="#FBBF24" strokeWidth="3.5" />
          <circle cx="50" cy="50" r="26" fill="#B45309" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* Merkez Aslan / Bilgelik Amblemi */}
          <circle cx="50" cy="50" r="10" fill="#F59E0B" />
        </svg>
      );

    case "volcanic_dragon_staff":
      // Volkanik Ejderha Asası
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
          {/* Obsidyen Asa Sapı */}
          <line x1="25" y1="85" x2="65" y2="35" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          {/* Pençe Başı & Magma Küresi */}
          <circle cx="70" cy="28" r="12" fill="#DC2626" stroke="#F59E0B" strokeWidth="2.5" className="animate-pulse" />
          <polygon points="65,16 68,26 62,24" fill="#1E293B" />
          <polygon points="80,24 72,30 76,34" fill="#1E293B" />
        </svg>
      );

    // -------------------------------------------------------------------------
    // GENEL FALLBACK (Eğer yeni veya bilinmeyen bir ID gelirse)
    // -------------------------------------------------------------------------
    default:
      if (type === "equipment") {
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
            <circle cx="50" cy="50" r="32" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
            <text x="50" y="60" fontSize="32" textAnchor="middle" fill="#FFFFFF">
              {icon || "⚔️"}
            </text>
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
          <circle cx="50" cy="50" r="32" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          <text x="50" y="60" fontSize="32" textAnchor="middle" fill="#FFFFFF">
            {icon || "🦊"}
          </text>
        </svg>
      );
  }
}

