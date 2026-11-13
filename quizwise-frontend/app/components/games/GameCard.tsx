"use client";

import React from "react";
import { Play } from "lucide-react";

export interface GameCardItem {
  id: string;
  mode: string;
  title: string;
  badge: string;
  tag: string;
  description: string;
  bgGradient: string;
  icon: React.ReactNode;
  featurePills: Array<{ label: string; icon?: React.ReactNode }>;
  actionText?: string;
  actionBg?: string;
}

export interface GameCardProps {
  game: GameCardItem;
  onClick: () => void;
}

/* ========================================================================= */
/* 1. ÖZEL TEMATİK SVG İLLÜSTRASYONLARI (TAM VE INLINE ÇÖZÜM)                 */
/* ========================================================================= */

// 1. Ejderha Baskını (Boss Fight)
function DragonIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Lav Kıvılcımı Parçacıkları */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15%" cy="20%" r="2" fill="#FDA4AF" className="animate-pulse" />
        <circle cx="28%" cy="75%" r="1.5" fill="#FB7185" />
        <circle cx="45%" cy="15%" r="2.5" fill="#F43F5E" className="animate-pulse" />
        <circle cx="72%" cy="80%" r="2" fill="#FB7185" />
        <circle cx="85%" cy="25%" r="1.5" fill="#FDA4AF" />
        <circle cx="60%" cy="30%" r="1" fill="#FEE2E2" />
        <path d="M0 120 Q 50 100, 100 115 T 200 110 T 300 120 L 300 150 L 0 150 Z" fill="rgba(159,18,57,0.3)" />
      </svg>

      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(244,63,94,0.45)_0%,transparent_65%)]" />

      {/* Merkez SVG Hero */}
      <svg
        viewBox="0 0 200 140"
        className="w-48 h-32 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] group-hover:drop-shadow-[0_0_24px_rgba(244,63,94,0.9)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dragonGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="50%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>
          <linearGradient id="swordBlade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="goldHilt" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
        </defs>

        {/* Dragon Wings */}
        <path
          d="M 100 65 C 80 20, 30 15, 10 35 C 25 55, 45 65, 75 72 Z"
          fill="url(#dragonGrad)"
          opacity="0.85"
        />
        <path
          d="M 100 65 C 120 20, 170 15, 190 35 C 175 55, 155 65, 125 72 Z"
          fill="url(#dragonGrad)"
          opacity="0.85"
        />
        <path d="M 100 65 Q 55 30 10 35 M 40 45 L 30 25 M 65 55 L 60 28" stroke="#FECDD3" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 100 65 Q 145 30 190 35 M 160 45 L 170 25 M 135 55 L 140 28" stroke="#FECDD3" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Dragon Body */}
        <path
          d="M 85 85 C 85 55, 92 40, 100 35 C 108 40, 115 55, 115 85 C 115 105, 85 105, 85 85 Z"
          fill="url(#dragonGrad)"
        />

        {/* Dragon Head */}
        <path
          d="M 90 42 L 80 22 L 92 30 L 100 15 L 108 30 L 120 22 L 110 42 C 114 48, 110 56, 100 58 C 90 56, 86 48, 90 42 Z"
          fill="#9F1239"
          stroke="#FDA4AF"
          strokeWidth="1.2"
        />
        {/* Horns */}
        <path d="M 92 30 Q 82 12 75 10 Q 82 22 88 28 Z" fill="#FDE047" />
        <path d="M 108 30 Q 118 12 125 10 Q 118 22 112 28 Z" fill="#FDE047" />

        {/* Glowing Eyes */}
        <circle cx="95" cy="42" r="2.5" fill="#FBBF24" />
        <circle cx="105" cy="42" r="2.5" fill="#FBBF24" />
        <circle cx="95" cy="42" r="1" fill="#FFFFFF" />
        <circle cx="105" cy="42" r="1" fill="#FFFFFF" />
        <ellipse cx="100" cy="53" rx="4" ry="2" fill="#F97316" opacity="0.8" />

        {/* Crossed Swords in Foreground */}
        <g transform="translate(100, 95) rotate(-35) translate(-100, -95)">
          <rect x="98" y="55" width="4" height="60" rx="1" fill="url(#swordBlade)" />
          <path d="M 100 50 L 98 55 L 102 55 Z" fill="#FFFFFF" />
          <rect x="91" y="105" width="18" height="4" rx="2" fill="url(#goldHilt)" />
          <rect x="98.5" y="109" width="3" height="15" rx="1" fill="#78350F" />
          <circle cx="100" cy="126" r="3" fill="url(#goldHilt)" />
        </g>
        <g transform="translate(100, 95) rotate(35) translate(-100, -95)">
          <rect x="98" y="55" width="4" height="60" rx="1" fill="url(#swordBlade)" />
          <path d="M 100 50 L 98 55 L 102 55 Z" fill="#FFFFFF" />
          <rect x="91" y="105" width="18" height="4" rx="2" fill="url(#goldHilt)" />
          <rect x="98.5" y="109" width="3" height="15" rx="1" fill="#78350F" />
          <circle cx="100" cy="126" r="3" fill="url(#goldHilt)" />
        </g>
      </svg>
    </div>
  );
}

// 2. Hazine Avı: Altın Baskını (Gold Raid)
function GoldRaidIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Işık Huzmeleri */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
        <line x1="50%" y1="70%" x2="10%" y2="10%" stroke="#FEF08A" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="50%" y1="70%" x2="35%" y2="5%" stroke="#FEF08A" strokeWidth="3" />
        <line x1="50%" y1="70%" x2="65%" y2="5%" stroke="#FEF08A" strokeWidth="3" />
        <line x1="50%" y1="70%" x2="90%" y2="10%" stroke="#FEF08A" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="20%" cy="40%" r="2" fill="#FDE047" className="animate-ping" />
        <circle cx="80%" cy="35%" r="3" fill="#FDE047" className="animate-pulse" />
      </svg>

      {/* Radial Gold Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(250,204,21,0.5)_0%,transparent_65%)]" />

      {/* Merkez Hazine Sandığı & Sikkeler */}
      <svg
        viewBox="0 0 200 140"
        className="w-48 h-32 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_16px_rgba(234,179,8,0.75)] group-hover:drop-shadow-[0_0_24px_rgba(250,204,21,0.95)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="chestWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
          <linearGradient id="goldBars" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Sandıktan Çıkan Altın Işık */}
        <polygon points="100,55 50,0 150,0" fill="url(#goldBars)" opacity="0.35" />

        {/* Havada Parlayan Sikkeler ve Taşlar */}
        <g className="animate-pulse">
          <circle cx="75" cy="40" r="7" fill="url(#goldBars)" stroke="#FEF08A" strokeWidth="1.2" />
          <text x="75" y="43" textAnchor="middle" fontSize="7" fill="#78350F" fontWeight="bold">$</text>

          <circle cx="125" cy="35" r="8" fill="url(#goldBars)" stroke="#FEF08A" strokeWidth="1.2" />
          <text x="125" y="38.5" textAnchor="middle" fontSize="8" fill="#78350F" fontWeight="bold">$</text>

          <circle cx="100" cy="28" r="9" fill="url(#goldBars)" stroke="#FFFBEB" strokeWidth="1.5" />
          <text x="100" y="32" textAnchor="middle" fontSize="9" fill="#78350F" fontWeight="bold">$</text>

          <polygon points="58,48 64,43 70,48 64,55" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1" />
          <polygon points="135,46 142,40 148,46 142,53" fill="#10B981" stroke="#6EE7B7" strokeWidth="1" />
        </g>

        {/* Sandık Açık Kapağı */}
        <path
          d="M 45 58 C 45 42, 60 32, 100 32 C 140 32, 155 42, 155 58 L 150 63 L 50 63 Z"
          fill="url(#chestWood)"
          stroke="url(#goldBars)"
          strokeWidth="3"
        />
        <path d="M 72 34 C 72 45, 72 55, 72 63" stroke="url(#goldBars)" strokeWidth="3" />
        <path d="M 128 34 C 128 45, 128 55, 128 63" stroke="url(#goldBars)" strokeWidth="3" />

        {/* Sandık İçi Altın Parlama */}
        <ellipse cx="100" cy="65" rx="48" ry="12" fill="#FDE047" />

        {/* Sandık Gövdesi */}
        <path
          d="M 48 65 L 152 65 L 146 115 C 146 120, 140 124, 134 124 L 66 124 C 60 124, 54 120, 54 115 Z"
          fill="url(#chestWood)"
          stroke="#291205"
          strokeWidth="2"
        />

        {/* Metal Şeritler ve Kilit */}
        <path d="M 48 65 L 152 65" stroke="url(#goldBars)" strokeWidth="4" />
        <path d="M 54 118 L 146 118" stroke="url(#goldBars)" strokeWidth="4" />
        <path d="M 72 65 L 70 122" stroke="url(#goldBars)" strokeWidth="3.5" />
        <path d="M 128 65 L 130 122" stroke="url(#goldBars)" strokeWidth="3.5" />

        <rect x="94" y="65" width="12" height="15" rx="3" fill="url(#goldBars)" stroke="#78350F" strokeWidth="1.5" />
        <circle cx="100" cy="71" r="2" fill="#78350F" />
        <line x1="100" y1="73" x2="100" y2="76" stroke="#78350F" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// 3. Kart Eşleştirme (Match)
function MatchIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* İnce Izgara Dokusu */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" xmlns="http://www.w3.org/2000/svg">
        <pattern id="cardGrid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#C4B5FD" strokeWidth="0.8" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#cardGrid)" />
      </svg>

      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,250,0.4)_0%,transparent_65%)]" />

      {/* Merkez Kartlar & Kıvılcım */}
      <svg
        viewBox="0 0 200 140"
        className="w-48 h-32 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_16px_rgba(139,92,246,0.65)] group-hover:drop-shadow-[0_0_24px_rgba(168,85,247,0.9)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cardGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <linearGradient id="cardGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>

        {/* 1. Kart (Sola Açılı) */}
        <g transform="translate(68, 70) rotate(-14) translate(-68, -70)">
          <rect x="36" y="28" width="62" height="84" rx="8" fill="url(#cardGrad1)" stroke="#818CF8" strokeWidth="2.5" />
          <circle cx="67" cy="55" r="12" fill="#312E81" stroke="#A5B4FC" strokeWidth="1.5" />
          <path d="M 67 48 L 70 54 L 76 55 L 71 59 L 73 65 L 67 61 L 61 65 L 63 59 L 58 55 L 64 54 Z" fill="#FDE047" />
          <rect x="46" y="75" width="42" height="5" rx="2.5" fill="#E0E7FF" opacity="0.9" />
          <rect x="52" y="85" width="30" height="4" rx="2" fill="#A5B4FC" opacity="0.7" />
          <rect x="57" y="93" width="20" height="3" rx="1.5" fill="#818CF8" opacity="0.5" />
        </g>

        {/* 2. Kart (Sağa Açılı) */}
        <g transform="translate(132, 70) rotate(14) translate(-132, -70)">
          <rect x="102" y="28" width="62" height="84" rx="8" fill="url(#cardGrad2)" stroke="#C084FC" strokeWidth="2.5" />
          <circle cx="133" cy="55" r="12" fill="#581C87" stroke="#E9D5FF" strokeWidth="1.5" />
          <path d="M 133 48 L 136 54 L 142 55 L 137 59 L 139 65 L 133 61 L 127 65 L 129 59 L 124 55 L 130 54 Z" fill="#FDE047" />
          <rect x="112" y="75" width="42" height="5" rx="2.5" fill="#F5D0FE" opacity="0.9" />
          <rect x="118" y="85" width="30" height="4" rx="2" fill="#E879F9" opacity="0.7" />
          <rect x="123" y="93" width="20" height="3" rx="1.5" fill="#C084FC" opacity="0.5" />
        </g>

        {/* İki Kart Arasındaki Bağlantı Kıvılcımı */}
        <g className="animate-pulse">
          <path
            d="M 85 70 Q 100 50, 103 68 T 115 66"
            stroke="url(#sparkGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <polygon points="100,58 103,66 111,68 103,71 100,79 97,71 89,68 97,66" fill="#FFFFFF" />
          <circle cx="100" cy="68" r="3" fill="#38BDF8" />
        </g>
      </svg>
    </div>
  );
}

// 4. Yerçekimi Savunması (Gravity)
function GravityIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Uzay Yıldız Noktaları */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10%" cy="80%" r="1" fill="#FFFFFF" />
        <circle cx="25%" cy="30%" r="2" fill="#FED7AA" />
        <circle cx="75%" cy="20%" r="1.5" fill="#FFFFFF" />
        <circle cx="85%" cy="60%" r="2" fill="#FED7AA" className="animate-pulse" />
        <circle cx="50%" cy="10%" r="1" fill="#FFFFFF" />
      </svg>

      {/* Radial Uzay Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_45%,rgba(249,115,22,0.45)_0%,transparent_65%)]" />

      {/* Düşen Kraterli Asteroid & Savunma Roketi */}
      <svg
        viewBox="0 0 200 140"
        className="w-48 h-32 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_16px_rgba(239,68,68,0.7)] group-hover:drop-shadow-[0_0_25px_rgba(249,115,22,0.9)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fireTrail" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <linearGradient id="asteroidRock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="60%" stopColor="#451A03" />
            <stop offset="100%" stopColor="#1C1917" />
          </linearGradient>
          <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>

        {/* Asteroid Alev İzi */}
        <path
          d="M 15 10 C 35 25, 55 45, 75 60 C 58 55, 40 40, 20 20 Z"
          fill="url(#fireTrail)"
          opacity="0.8"
        />
        <path
          d="M 30 5 C 45 25, 65 48, 78 58 C 65 50, 50 35, 35 15 Z"
          fill="#FDE047"
          opacity="0.6"
        />

        {/* Kraterli Asteroid */}
        <g transform="translate(75, 62)">
          <circle cx="0" cy="0" r="24" fill="#EA580C" opacity="0.4" />
          <path
            d="M -18 -8 Q -10 -20, 5 -18 Q 18 -12, 19 2 Q 18 16, 4 20 Q -12 21, -19 10 Q -24 0, -18 -8 Z"
            fill="url(#asteroidRock)"
            stroke="#F97316"
            strokeWidth="2"
          />
          <circle cx="-6" cy="-4" r="4.5" fill="#1C1917" stroke="#78350F" strokeWidth="1" />
          <circle cx="8" cy="4" r="3.5" fill="#1C1917" stroke="#78350F" strokeWidth="1" />
          <circle cx="-2" cy="11" r="2.5" fill="#1C1917" stroke="#78350F" strokeWidth="1" />
        </g>

        {/* Roketten Ateşlenen Enerji Işını */}
        <line x1="140" y1="102" x2="88" y2="70" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
        <line x1="140" y1="102" x2="88" y2="70" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="88" cy="70" r="4" fill="#38BDF8" className="animate-ping" />

        {/* Uzay Savunma Roketi */}
        <g transform="translate(150, 110) rotate(-45)">
          <polygon points="-5,20 0,32 5,20" fill="#38BDF8" />
          <polygon points="-3,20 0,27 3,20" fill="#FFFFFF" />
          <path d="M -10 12 L -18 20 L -10 18 Z" fill="#EF4444" />
          <path d="M 10 12 L 18 20 L 10 18 Z" fill="#EF4444" />
          <path d="M 0 -22 C 10 -8, 10 15, 8 20 L -8 20 C -10 15, -10 -8, 0 -22 Z" fill="url(#rocketBody)" stroke="#CBD5E1" strokeWidth="1" />
          <circle cx="0" cy="-4" r="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}

// 5. 5s Hızlı Kombo (Speed Recall)
function SpeedRecallIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Hız Çizgileri */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="30" x2="70" y2="30" stroke="#67E8F9" strokeWidth="1.5" strokeDasharray="12 8" />
        <line x1="10" y1="50" x2="85" y2="50" stroke="#38BDF8" strokeWidth="2" strokeDasharray="18 10" />
        <line x1="120" y1="90" x2="200" y2="90" stroke="#67E8F9" strokeWidth="1.5" strokeDasharray="14 8" />
        <line x1="130" y1="110" x2="190" y2="110" stroke="#38BDF8" strokeWidth="2" strokeDasharray="16 12" />
      </svg>

      {/* Elektrik Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.45)_0%,transparent_65%)]" />

      {/* Kronometre ve Parlayan Şimşek */}
      <svg
        viewBox="0 0 200 140"
        className="w-48 h-32 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_16px_rgba(6,182,212,0.75)] group-hover:drop-shadow-[0_0_26px_rgba(56,189,248,0.95)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
        </defs>

        {/* Dairesel Kronometre Halkası */}
        <circle cx="100" cy="70" r="42" stroke="#1E293B" strokeWidth="8" />
        <circle
          cx="100"
          cy="70"
          r="42"
          stroke="url(#ringGrad)"
          strokeWidth="7"
          strokeDasharray="210 264"
          strokeLinecap="round"
          transform="rotate(-90 100 70)"
        />

        {/* Buton ve İşaretçiler */}
        <rect x="94" y="20" width="12" height="6" rx="2" fill="#94A3B8" />
        <rect x="97" y="24" width="6" height="5" fill="#64748B" />
        <line x1="100" y1="36" x2="100" y2="40" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="134" y1="70" x2="130" y2="70" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="100" y1="104" x2="100" y2="100" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="66" y1="70" x2="70" y2="70" stroke="#FFFFFF" strokeWidth="2" />

        {/* Keskin Şimşek Bolt'u */}
        <polygon
          points="106,28 84,70 104,70 94,112 122,63 102,63"
          fill="url(#boltGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Kombo Şok Dalgaları */}
        <path d="M 68 55 Q 60 70, 70 85" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <path d="M 132 55 Q 140 70, 130 85" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    </div>
  );
}

// 6. Harf Avı (Word Scramble)
function WordScrambleIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Harf Silüetleri */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <text x="15%" y="25%" fill="#6EE7B7" fontSize="14" fontWeight="bold">A</text>
        <text x="80%" y="30%" fill="#6EE7B7" fontSize="16" fontWeight="bold">Z</text>
        <text x="20%" y="85%" fill="#6EE7B7" fontSize="14" fontWeight="bold">K</text>
        <text x="75%" y="85%" fill="#6EE7B7" fontSize="16" fontWeight="bold">T</text>
      </svg>

      {/* Zümrüt-Turkuaz Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.45)_0%,transparent_65%)]" />

      {/* 3D Harf Blokları (W, O, R, D) */}
      <svg
        viewBox="0 0 200 140"
        className="w-48 h-32 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_16px_rgba(16,185,129,0.7)] group-hover:drop-shadow-[0_0_24px_rgba(20,184,166,0.9)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blockW" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="blockO" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="blockR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="blockD" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Parıltı Şeridi */}
        <path
          d="M 30 75 Q 70 30, 100 70 T 170 65"
          stroke="#FDE047"
          strokeWidth="2"
          strokeDasharray="4 4"
          fill="none"
          opacity="0.8"
        />

        {/* Blok 1: W */}
        <g transform="translate(38, 62) rotate(-16) translate(-38, -62)">
          <rect x="25" y="47" width="30" height="30" rx="6" fill="#064E3B" />
          <rect x="23" y="44" width="30" height="30" rx="6" fill="url(#blockW)" stroke="#A7F3D0" strokeWidth="1.5" />
          <text x="38" y="65" textAnchor="middle" fontSize="17" fill="#FFFFFF" fontWeight="900" fontFamily="sans-serif">W</text>
        </g>

        {/* Blok 2: O */}
        <g transform="translate(78, 48) rotate(10) translate(-78, -48)">
          <rect x="65" y="33" width="30" height="30" rx="6" fill="#134E4A" />
          <rect x="63" y="30" width="30" height="30" rx="6" fill="url(#blockO)" stroke="#99F6E4" strokeWidth="1.5" />
          <text x="78" y="51" textAnchor="middle" fontSize="17" fill="#FFFFFF" fontWeight="900" fontFamily="sans-serif">O</text>
        </g>

        {/* Blok 3: R */}
        <g transform="translate(122, 72) rotate(-8) translate(-122, -72)">
          <rect x="109" y="57" width="30" height="30" rx="6" fill="#0C4A6E" />
          <rect x="107" y="54" width="30" height="30" rx="6" fill="url(#blockR)" stroke="#BAE6FD" strokeWidth="1.5" />
          <text x="122" y="75" textAnchor="middle" fontSize="17" fill="#FFFFFF" fontWeight="900" fontFamily="sans-serif">R</text>
        </g>

        {/* Blok 4: D */}
        <g transform="translate(162, 54) rotate(14) translate(-162, -54)">
          <rect x="149" y="39" width="30" height="30" rx="6" fill="#78350F" />
          <rect x="147" y="36" width="30" height="30" rx="6" fill="url(#blockD)" stroke="#FEF08A" strokeWidth="1.5" />
          <text x="162" y="57" textAnchor="middle" fontSize="17" fill="#FFFFFF" fontWeight="900" fontFamily="sans-serif">D</text>
        </g>

        {/* Parıltı Yıldızları */}
        <polygon points="100,22 102,27 107,29 102,31 100,36 98,31 93,29 98,27" fill="#FFFFFF" />
        <polygon points="52,95 53,99 57,100 53,101 52,105 51,101 47,100 51,99" fill="#FDE047" />
        <polygon points="150,90 152,94 156,95 152,96 150,100 148,96 144,95 148,94" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

function renderIllustration(mode: string, id: string) {
  const key = `${mode} ${id}`.toLowerCase();
  if (key.includes("boss")) {
    return <DragonIllustration />;
  }
  if (key.includes("gold")) {
    return <GoldRaidIllustration />;
  }
  if (key.includes("match")) {
    return <MatchIllustration />;
  }
  if (key.includes("gravity")) {
    return <GravityIllustration />;
  }
  if (key.includes("speed")) {
    return <SpeedRecallIllustration />;
  }
  if (key.includes("scramble")) {
    return <WordScrambleIllustration />;
  }
  return <MatchIllustration />;
}

function getIllustrationGradient(mode: string, id: string): string {
  const key = `${mode} ${id}`.toLowerCase();
  if (key.includes("boss")) {
    return "from-rose-900 via-red-700 to-purple-900";
  }
  if (key.includes("gold")) {
    return "from-amber-600 via-orange-500 to-yellow-600";
  }
  if (key.includes("match")) {
    return "from-indigo-700 via-violet-600 to-purple-700";
  }
  if (key.includes("gravity")) {
    return "from-red-800 via-orange-600 to-amber-700";
  }
  if (key.includes("speed")) {
    return "from-blue-700 via-cyan-600 to-sky-500";
  }
  if (key.includes("scramble")) {
    return "from-emerald-700 via-teal-600 to-cyan-700";
  }
  return "from-indigo-700 via-violet-600 to-purple-700";
}

/* ========================================================================= */
/* 2. GAME CARD BİLEŞENİ                                                     */
/* ========================================================================= */

export default function GameCard({ game, onClick }: GameCardProps) {
  const bgGrad = getIllustrationGradient(game.mode, game.id);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-md dark:shadow-2xl hover:shadow-xl dark:hover:shadow-indigo-950/40 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer select-none"
    >
      {/* Vektörel & Özel Tematik SVG Üst Sahne (h-36 sm:h-40) */}
      <div
        className={`h-36 sm:h-40 relative overflow-hidden bg-gradient-to-br ${bgGrad} flex items-center justify-center shrink-0`}
      >
        {/* Özel Tematik SVG Sahnesi */}
        {renderIllustration(game.mode, game.id)}

        {/* Sol Üst Rozet (z-20 ile illüstrasyon üzerinde net) */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white border border-white/20 backdrop-blur-md shadow-md">
            {game.badge}
          </span>
        </div>

        {/* Sağ Üst Etiket (z-20 ile illüstrasyon üzerinde net) */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-black/70 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-md">
            {game.tag}
          </span>
        </div>
      </div>

      {/* Kompakt İçerik & Aksiyon Alanı */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-3 bg-white dark:bg-slate-900">
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
            {game.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Özellik Hapları */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 overflow-hidden flex-wrap">
          {game.featurePills.map((pill, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-1 shrink-0 font-medium"
            >
              {pill.icon}
              <span className="truncate max-w-[110px]">{pill.label}</span>
            </span>
          ))}
        </div>

        {/* Eylem Butonu */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition active:scale-95 cursor-pointer ${
            game.actionBg || "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{game.actionText || "Oyna ➔"}</span>
        </button>
      </div>
    </div>
  );
}
