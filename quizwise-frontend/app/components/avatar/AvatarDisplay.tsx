"use client";

import React, { useState, useEffect } from "react";
import { Mic, Sparkles, Radio } from "lucide-react";
import { usePersona, PersonaId, PERSONAS } from "../../context/PersonaContext";
import { useLanguage } from "../../context/LanguageContext";

export type AvatarAnimationState = "idle" | "listening" | "speaking" | "thinking";

export interface AvatarDisplayProps {
  personaId?: PersonaId | string;
  avatarState?: AvatarAnimationState;
  state?: AvatarAnimationState;
  size?: "sm" | "md" | "lg" | "xl";
  showBadges?: boolean;
  className?: string;
  onClick?: () => void;
}

// 3D Stüdyo Portre Eşlemesi (İnsan Karakterler İçin)
const AVATAR_3D_REGISTRY: Record<string, { src: string; fallback: string }> = {
  alex: {
    src: "/avatars/alex.png",
    fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  sarah: {
    src: "/avatars/sarah.png",
    fallback: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  },
  leo: {
    src: "/avatars/leo.png",
    fallback: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  mr_harrison: {
    src: "/avatars/mr_harrison.png",
    fallback: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  },
};

/**
 * 🦊 SPARKY (3D EFEKTLİ, SEVİMLİ GÖLGELİ, GÖZLÜKLÜ CANLI SVG TİLKİ MASKOTU)
 * - avatarState === 'speaking': 0.12 sn aralıklarla scaleY ve translateY ile dinamik açılıp kapanan ağız
 * - avatarState === 'idle': Ağız kapalı, 4 saniyede bir göz kırpma (blink) ve yukarı-aşağı nefes alma (float)
 * - avatarState === 'listening': Kulaklar dikilmiş, dikkat kesilmiş bakış
 */
function SparkyFoxMascot({
  currentState,
  mouthOpenRatio,
  isBlinking,
  earTwitch,
}: {
  currentState: AvatarAnimationState;
  mouthOpenRatio: number;
  isBlinking: boolean;
  earTwitch: number;
}) {
  const isSpeaking = currentState === "speaking";
  const isListening = currentState === "listening";
  const isIdle = currentState === "idle";

  return (
    <div
      data-testid="mascot-sparky"
      className={`w-full h-full flex items-center justify-center bg-slate-950 select-none will-change-transform ${
        isIdle ? "avatar-float-idle" : isListening ? "avatar-attentive-listening" : ""
      }`}
    >
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Sahne Arka Plan Gradyanı (Amber / Turuncu) */}
          <radialGradient id="bg_sparky_fox" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="55%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#7C2D12" />
          </radialGradient>

          {/* 3D Tilki Kürkü Gölgelendirmesi */}
          <radialGradient id="fox_fur_3d" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="45%" stopColor="#FB923C" />
            <stop offset="85%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </radialGradient>

          {/* 3D Krem Yanak & Burun Altı Gölgelendirmesi */}
          <linearGradient id="fox_cream_3d" x1="70" y1="68" x2="70" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#FFF7ED" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>

          {/* Yumuşak 3D Drop Shadow Filtresi */}
          <filter id="sparky_3d_shadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#431407" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* Dairesel 3D Sahne Arka Planı */}
        <circle cx="70" cy="70" r="68" fill="url(#bg_sparky_fox)" />
        <circle cx="70" cy="70" r="62" stroke="#FDE68A" strokeOpacity="0.22" strokeWidth="1.5" />

        {/* Sallanan 3D Kuyruk */}
        <g
          style={{
            transformOrigin: "94px 105px",
            transform: isSpeaking
              ? `rotate(${10 + mouthOpenRatio * 9}deg)`
              : isListening
              ? "rotate(14deg)"
              : "rotate(0deg)",
            transition: "transform 0.12s ease",
          }}
          className={isIdle ? "animate-[fox-tail-wag_2.8s_ease-in-out_infinite]" : ""}
          filter="url(#sparky_3d_shadow)"
        >
          <path d="M96,78 C124,64 138,88 120,112 C106,124 90,116 94,98 Z" fill="url(#fox_fur_3d)" />
          <path d="M120,112 C126,104 130,94 124,84 C118,92 110,102 120,112 Z" fill="#FFFFFF" />
        </g>

        {/* Sol Kulak (Ses Dinlerken Dikkat Kesilir) */}
        <g
          style={{
            transformOrigin: "48px 54px",
            transform: isListening
              ? "rotate(-11deg) translateY(-3px) scale(1.04)"
              : earTwitch === 1
              ? "rotate(-6deg)"
              : `rotate(${mouthOpenRatio * 4}deg)`,
            transition: "transform 0.12s ease-out",
          }}
          filter="url(#sparky_3d_shadow)"
        >
          <polygon points="30,58 43,12 67,48" fill="url(#fox_fur_3d)" />
          <polygon points="39,52 45,22 59,46" fill="#FED7AA" />
          <polygon points="42,50 46,28 55,46" fill="#F97316" opacity="0.35" />
        </g>

        {/* Sağ Kulak */}
        <g
          style={{
            transformOrigin: "92px 54px",
            transform: isListening
              ? "rotate(11deg) translateY(-3px) scale(1.04)"
              : earTwitch === 1
              ? "rotate(7deg)"
              : `rotate(-${mouthOpenRatio * 4}deg)`,
            transition: "transform 0.12s ease-out",
          }}
          filter="url(#sparky_3d_shadow)"
        >
          <polygon points="110,58 97,12 73,48" fill="url(#fox_fur_3d)" />
          <polygon points="101,52 95,22 81,46" fill="#FED7AA" />
          <polygon points="98,50 94,28 85,46" fill="#F97316" opacity="0.35" />
        </g>

        {/* Gövde: Kolej Ceketi & 3D Papyon */}
        <g filter="url(#sparky_3d_shadow)">
          <path d="M30,132 C34,104 48,96 70,96 C92,96 106,104 110,132 Z" fill="#0F172A" />
          <path d="M52,98 L70,122 L88,98" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
          <circle cx="48" cy="116" r="7.5" fill="#10B981" />
          <text
            x="48"
            y="119.5"
            fontSize="9"
            fontWeight="900"
            fill="#FFFFFF"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            V
          </text>

          {/* Kırmızı 3D Papyon */}
          <g transform="translate(70, 96)">
            <polygon points="-9,-4.5 0,0 -9,4.5" fill="#DC2626" />
            <polygon points="9,-4.5 0,0 9,4.5" fill="#DC2626" />
            <circle cx="0" cy="0" r="3.2" fill="#991B1B" />
            <circle cx="-0.5" cy="-0.5" r="1.4" fill="#F87171" />
          </g>
        </g>

        {/* 3D Baş ve Yüz Katmanı */}
        <g
          filter="url(#sparky_3d_shadow)"
          style={{
            transformOrigin: "70px 86px",
            transform: isListening
              ? "rotate(-2.5deg) translateY(-2px) scale(1.03)"
              : isSpeaking
              ? `translateY(${mouthOpenRatio * 1.5}px)`
              : "none",
            transition: "transform 0.12s ease-out",
          }}
        >
          {/* Tilki Yüz Konturu (3D Gradyan) */}
          <path
            d="M29,68 C29,96 46,110 70,110 C94,110 111,96 111,68 C111,47 92,40 70,40 C48,40 29,47 29,68 Z"
            fill="url(#fox_fur_3d)"
          />
          {/* Alın 3D Işık Parlaması */}
          <ellipse cx="64" cy="48" rx="18" ry="5" fill="#FFEDD5" opacity="0.32" />

          {/* Krem Renkli Yanak & Çene Katmanı */}
          <path
            d="M31,74 C38,95 54,105 70,105 C86,105 102,95 109,74 C100,66 88,74 70,76 C52,74 40,66 31,74 Z"
            fill="url(#fox_cream_3d)"
          />

          {/* Yanak Allıkları */}
          <ellipse cx="41" cy="80" rx="5.5" ry="4" fill="#FB7185" opacity="0.55" />
          <ellipse cx="99" cy="80" rx="5.5" ry="4" fill="#FB7185" opacity="0.55" />

          {/* Gözler (4 saniyede bir kırpışan göz kapakları) */}
          <g>
            <ellipse
              cx="53"
              cy="65"
              rx={isListening ? 6.2 : 5.6}
              ry={isBlinking ? 0.7 : isListening ? 7.2 : 6.6}
              fill="#0F172A"
              style={{ transition: "ry 0.08s ease, rx 0.12s ease" }}
            />
            {!isBlinking && (
              <>
                <circle cx="55" cy="62.8" r="2.3" fill="#FFFFFF" />
                <circle cx="51" cy="67" r="1.1" fill="#FFFFFF" />
              </>
            )}

            <ellipse
              cx="87"
              cy="65"
              rx={isListening ? 6.2 : 5.6}
              ry={isBlinking ? 0.7 : isListening ? 7.2 : 6.6}
              fill="#0F172A"
              style={{ transition: "ry 0.08s ease, rx 0.12s ease" }}
            />
            {!isBlinking && (
              <>
                <circle cx="89" cy="62.8" r="2.3" fill="#FFFFFF" />
                <circle cx="85" cy="67" r="1.1" fill="#FFFFFF" />
              </>
            )}
          </g>

          {/* 3D Altın Çerçeveli Akıllı Gözlük */}
          <g>
            <circle cx="53" cy="65" r="13.5" stroke="#FBBF24" strokeWidth="3.2" fill="#38BDF8" fillOpacity="0.12" />
            <circle cx="87" cy="65" r="13.5" stroke="#FBBF24" strokeWidth="3.2" fill="#38BDF8" fillOpacity="0.12" />
            <path d="M66.5,65 L73.5,65" stroke="#FBBF24" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M39.5,64 L31,61" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M100.5,64 L109,61" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cam Yansıması */}
            <line x1="44" y1="57" x2="54" y2="57" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <line x1="78" y1="57" x2="88" y2="57" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* Parlak 3D Siyah Burun */}
          <polygon points="65,76 75,76 70,82" fill="#0F172A" />
          <ellipse cx="68.8" cy="77.5" rx="2" ry="1" fill="#FFFFFF" opacity="0.85" />

          {/* ================================================================= */}
          {/* CANLI AĞIZ HAREKETİ (LIP-SYNC: 0.12s scaleY + translateY)         */}
          {/* ================================================================= */}
          {isSpeaking ? (
            <g
              className="lip-sync-mouth-012s"
              style={{
                transformOrigin: "70px 85px",
                transform: `translateY(${mouthOpenRatio * 2.5}px) scaleY(${0.55 + mouthOpenRatio * 0.85})`,
                transition: "transform 0.11s ease-in-out",
              }}
            >
              {/* Ağız Boşluğu */}
              <ellipse
                cx="70"
                cy="88"
                rx="10"
                ry="8.5"
                fill="#4C0519"
                stroke="#0F172A"
                strokeWidth="2.4"
              />
              {/* Üst Dişler */}
              <path
                d="M63,84 Q70,86.5 77,84"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Pembe Dil */}
              <ellipse cx="70" cy="92" rx="6.2" ry="4.2" fill="#FB7185" />
            </g>
          ) : isListening ? (
            /* Dinlerken Meraklı Hafif Açık Gülümseme */
            <g>
              <path
                d="M61,86 Q70,93 79,86"
                stroke="#0F172A"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="70" cy="88.5" rx="3.5" ry="2" fill="#FB7185" opacity="0.8" />
            </g>
          ) : (
            /* Idle: Kapalı Sevimli Gülümseme */
            <path
              d="M60,86 Q70,92.5 80,86"
              stroke="#0F172A"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * 🐔 CHUCK (BÜYÜK GÖZLÜ, KIRMIZI İBİKLİ, ŞAŞKIN VE AŞIRI SEVİMLİ KOMİK TAVUK MASKOTU)
 * - avatarState === 'speaking': 0.12 sn aralıklarla sarı gaga scaleY ve translateY ile dinamik açılıp kapanır
 * - avatarState === 'idle': Gaga kapalı, 4 saniyede bir göz kırpma (blink) ve nefes alma (float)
 * - avatarState === 'listening': Karakter dikkat kesilir, ibik ve kanatlar canlanır
 */
function ChuckChickenMascot({
  currentState,
  mouthOpenRatio,
  isBlinking,
  wobble,
}: {
  currentState: AvatarAnimationState;
  mouthOpenRatio: number;
  isBlinking: boolean;
  wobble: number;
}) {
  const isSpeaking = currentState === "speaking";
  const isListening = currentState === "listening";
  const isIdle = currentState === "idle";

  return (
    <div
      data-testid="mascot-chuck"
      className={`w-full h-full flex items-center justify-center bg-slate-950 select-none will-change-transform ${
        isIdle ? "avatar-float-idle" : isListening ? "avatar-attentive-listening" : ""
      }`}
    >
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sarı / Altın Sahne Arka Planı (Tema: yellow) */}
          <radialGradient id="bg_chuck_chicken" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="55%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#CA8A04" />
          </radialGradient>

          {/* 3D Beyaz/Krem Tüy Gövde Gradyanı */}
          <radialGradient id="chicken_feather_3d" cx="46%" cy="36%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="72%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </radialGradient>

          {/* 3D Kırmızı İbik Gradyanı */}
          <linearGradient id="comb_red_3d" x1="0" y1="8" x2="0" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="35%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>

          {/* 3D Sarı Gaga Gradyanı */}
          <linearGradient id="beak_yellow_3d" x1="70" y1="66" x2="70" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Yumuşak 3D Gölge */}
          <filter id="chuck_3d_shadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#713F12" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Dairesel Sarı Sahne Arka Planı */}
        <circle cx="70" cy="70" r="68" fill="url(#bg_chuck_chicken)" />
        <circle cx="70" cy="70" r="62" stroke="#FEF9C3" strokeOpacity="0.45" strokeWidth="1.5" />

        {/* Yan Kanatlar (Konuşurken & Dinlerken Hafif Çırpınır) */}
        <g
          filter="url(#chuck_3d_shadow)"
          style={{
            transformOrigin: "70px 85px",
            transform: isSpeaking
              ? `scaleX(${1 + mouthOpenRatio * 0.05}) translateY(-${mouthOpenRatio * 2}px)`
              : isListening
              ? "scaleX(1.04) translateY(-1.5px)"
              : "none",
            transition: "transform 0.12s ease",
          }}
        >
          <path d="M22,94 C14,80 24,66 37,73 C31,86 28,100 22,94 Z" fill="url(#chicken_feather_3d)" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M118,94 C126,80 116,66 103,73 C109,86 112,100 118,94 Z" fill="url(#chicken_feather_3d)" stroke="#CBD5E1" strokeWidth="1.5" />
        </g>

        {/* =================================================================== */}
        {/* KIRMIZI İBİK (Büyük, Neşeli Sallanan 3D İbik)                       */}
        {/* =================================================================== */}
        <g
          filter="url(#chuck_3d_shadow)"
          style={{
            transformOrigin: "70px 38px",
            transform: isSpeaking
              ? `rotate(${wobble === 1 ? 6 : -6}deg) translateY(-${mouthOpenRatio * 2.5}px) scale(1.03)`
              : isListening
              ? "translateY(-3px) scale(1.06)"
              : `rotate(${wobble === 1 ? 3 : -3}deg)`,
            transition: "transform 0.15s ease-in-out",
          }}
        >
          {/* Sol Lob */}
          <ellipse cx="56" cy="24" rx="8" ry="12" fill="url(#comb_red_3d)" />
          {/* Orta Büyük Lob */}
          <ellipse cx="70" cy="17" rx="9.5" ry="15" fill="url(#comb_red_3d)" />
          {/* Sağ Lob */}
          <ellipse cx="84" cy="23" rx="8" ry="12" fill="url(#comb_red_3d)" />
          {/* İbik 3D Parlama Noktaları */}
          <ellipse cx="67" cy="12" rx="3" ry="4.5" fill="#FDA4AF" opacity="0.65" />
          <ellipse cx="54" cy="19" rx="2" ry="3" fill="#FDA4AF" opacity="0.55" />
          <ellipse cx="82" cy="18" rx="2" ry="3" fill="#FDA4AF" opacity="0.55" />
        </g>

        {/* 3D Yuvarlak Sevimli Tavuk Gövdesi & Başı */}
        <g filter="url(#chuck_3d_shadow)">
          <circle cx="70" cy="81" r="44" fill="url(#chicken_feather_3d)" />
          <circle cx="70" cy="81" r="44" stroke="#E2E8F0" strokeWidth="2.5" />
          {/* Baş Üstü Tüy Parlaması */}
          <ellipse cx="64" cy="44" rx="16" ry="5" fill="#FFFFFF" opacity="0.9" />
        </g>

        {/* Pembe Yanaklar */}
        <ellipse cx="37" cy="79" rx="7" ry="5" fill="#FDA4AF" opacity="0.8" />
        <ellipse cx="103" cy="79" rx="7" ry="5" fill="#FDA4AF" opacity="0.8" />

        {/* Kırmızı Gıdı / Sakal (Wattle) Gaga Altında */}
        <g
          style={{
            transformOrigin: "70px 88px",
            transform: isSpeaking ? `translateY(${mouthOpenRatio * 4}px)` : "none",
            transition: "transform 0.11s ease",
          }}
        >
          <ellipse cx="63.5" cy="93" rx="5" ry="8.5" fill="url(#comb_red_3d)" />
          <ellipse cx="76.5" cy="93" rx="5" ry="8.5" fill="url(#comb_red_3d)" />
        </g>

        {/* Sevimli Mavi Papyon */}
        <g transform="translate(70, 119)" filter="url(#chuck_3d_shadow)">
          <polygon points="-11,-5.5 0,0 -11,5.5" fill="#2563EB" />
          <polygon points="11,-5.5 0,0 11,5.5" fill="#2563EB" />
          <circle cx="0" cy="0" r="3.8" fill="#1D4ED8" />
          <circle cx="-0.6" cy="-0.6" r="1.5" fill="#93C5FD" />
        </g>

        {/* =================================================================== */}
        {/* BÜYÜK, ŞAŞKIN VE AŞIRI SEVİMLİ GÖZLER (4sn'de bir blink)            */}
        {/* =================================================================== */}
        <g>
          {/* Sol Büyük Göz */}
          <circle cx="52" cy="56" r="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.8" />
          <ellipse
            cx="53.5"
            cy="56"
            rx={isListening ? 6.8 : 6}
            ry={isBlinking ? 0.7 : isListening ? 7.8 : 7}
            fill="#0F172A"
            style={{ transition: "ry 0.08s ease, rx 0.12s ease" }}
          />
          {!isBlinking && (
            <>
              <circle cx="56" cy="53" r="2.7" fill="#FFFFFF" />
              <circle cx="51" cy="58.5" r="1.4" fill="#FFFFFF" />
            </>
          )}

          {/* Sağ Büyük Göz */}
          <circle cx="88" cy="56" r="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.8" />
          <ellipse
            cx="86.5"
            cy="56"
            rx={isListening ? 6.8 : 6}
            ry={isBlinking ? 0.7 : isListening ? 7.8 : 7}
            fill="#0F172A"
            style={{ transition: "ry 0.08s ease, rx 0.12s ease" }}
          />
          {!isBlinking && (
            <>
              <circle cx="89" cy="53" r="2.7" fill="#FFFFFF" />
              <circle cx="84" cy="58.5" r="1.4" fill="#FFFFFF" />
            </>
          )}

          {/* Şaşkın & Sevimli Kalkık Kaşlar */}
          <path
            d={isListening ? "M41,38 Q51,32 61,38" : "M42,40 Q52,34 61,40"}
            stroke="#0F172A"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={isListening ? "M79,38 Q89,32 99,38" : "M79,40 Q88,34 98,40"}
            stroke="#0F172A"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* =================================================================== */}
        {/* CANLI SARI GAGA HAREKETİ (0.12sn scaleY ve translateY Lip-Sync)     */}
        {/* =================================================================== */}
        <g filter="url(#chuck_3d_shadow)">
          {/* Alt Gaga & Ağız İçi (Konuşurken 0.12sn ritimle açılıp kapanır) */}
          {isSpeaking ? (
            <g
              className="lip-sync-beak-012s"
              style={{
                transformOrigin: "70px 76px",
                transform: `translateY(${mouthOpenRatio * 3.5}px) scaleY(${0.65 + mouthOpenRatio * 0.85})`,
                transition: "transform 0.11s ease-in-out",
              }}
            >
              {/* Açılan Ağız Boşluğu */}
              <ellipse
                cx="70"
                cy="82"
                rx="11.5"
                ry="8.5"
                fill="#881337"
                stroke="#0F172A"
                strokeWidth="2.2"
              />
              {/* Neşeli Pembe Dil */}
              <ellipse cx="70" cy="85" rx="6" ry="3.8" fill="#FB7185" />
              {/* Aşağı İnen Sarı Alt Gaga */}
              <polygon
                points="56,81 84,81 70,95"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </g>
          ) : (
            /* Idle veya Listening: Kapalı Sarı Alt Gaga */
            <polygon
              points="58,77 82,77 70,86.5"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* Üst Sarı Gaga (3D Parlak Üçgen Gaga) */}
          <polygon
            points="53,69 87,69 70,81"
            fill="url(#beak_yellow_3d)"
            stroke="#B45309"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {/* Gaga Üstü 3D Parlama Çizgisi */}
          <polygon points="60,70.5 76,70.5 70,76" fill="#FEF08A" opacity="0.65" />
          {/* Burun Delikleri */}
          <circle cx="65.5" cy="72.5" r="1.1" fill="#78350F" />
          <circle cx="74.5" cy="72.5" r="1.1" fill="#78350F" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 🧔 ALEX & İNSAN PORTRELERİ
 * 3D Stüdyo Portresi, konuşurken altından canlı dans eden neon ses dalgaları
 */
function HumanPortraitAvatar({
  imageSrc,
  name,
  currentState,
  mouthOpenRatio,
  onError,
}: {
  imageSrc: string;
  name: string;
  currentState: AvatarAnimationState;
  mouthOpenRatio: number;
  onError: () => void;
}) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 z-0">
      <img
        src={imageSrc}
        alt={name}
        className={`w-full h-full object-cover select-none transition-all duration-300 will-change-transform ${
          currentState === "idle" ? "avatar-float-idle" : ""
        }`}
        style={{
          transform:
            currentState === "speaking"
              ? `scale(1.03) translateY(${mouthOpenRatio * 1.8}px)`
              : currentState === "listening"
              ? "scale(1.02) rotate(-1deg)"
              : "scale(1)",
        }}
        onError={onError}
      />

      {/* Görsel Üzeri Hafif Sinematik Vinyet */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none z-10" />

      {/* TTS Konuşurken: Canlı Ses Dalgası Dans Çubukları */}
      {currentState === "speaking" && (
        <div className="absolute inset-x-0 bottom-0 py-2.5 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent backdrop-blur-[2px] flex items-center justify-center gap-1.5 border-t border-violet-400/30 z-20">
          <span
            style={{ height: `${10 + mouthOpenRatio * 18}px` }}
            className="w-1.5 bg-violet-400 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
          />
          <span
            style={{ height: `${16 + mouthOpenRatio * 22}px` }}
            className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          />
          <span
            style={{ height: `${12 + mouthOpenRatio * 20}px` }}
            className="w-1.5 bg-teal-300 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(94,234,212,0.8)]"
          />
          <span
            style={{ height: `${18 + mouthOpenRatio * 24}px` }}
            className="w-1.5 bg-indigo-400 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
          />
          <span
            style={{ height: `${8 + mouthOpenRatio * 14}px` }}
            className="w-1.5 bg-violet-400 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
          />
        </div>
      )}
    </div>
  );
}

export default function AvatarDisplay({
  personaId,
  avatarState,
  state = "idle",
  size = "xl",
  showBadges = true,
  className = "",
  onClick,
}: AvatarDisplayProps) {
  const { persona: contextPersona } = usePersona();
  const { t } = useLanguage();

  const currentState: AvatarAnimationState = avatarState || state || "idle";
  const active = personaId ? PERSONAS[personaId] || contextPersona : contextPersona;

  const [imgError, setImgError] = useState(false);
  const [mouthOpenRatio, setMouthOpenRatio] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [wobble, setWobble] = useState<number>(0);

  useEffect(() => {
    setImgError(false);
  }, [active.id, personaId]);

  // 1. CANLI SES RİTİMİ (0.12s / 120ms aralıklarla ses ritmine göre açılıp kapanma)
  useEffect(() => {
    if (currentState !== "speaking") {
      setMouthOpenRatio(0);
      return;
    }

    let step = 0;
    const phonemeCadence = [
      0.92, 0.15, 0.86, 0.12, 0.78, 0.96, 0.22, 0.84, 0.14, 0.74, 0.9, 0.2,
    ];

    const cadenceInterval = setInterval(() => {
      const base = phonemeCadence[step % phonemeCadence.length];
      const sineWave = Math.sin(step * 0.85) * 0.08;
      const ratio = Math.max(0, Math.min(1.0, base + sineWave));
      setMouthOpenRatio(ratio);
      step++;
    }, 120);

    return () => {
      clearInterval(cadenceInterval);
      setMouthOpenRatio(0);
    };
  }, [currentState]);

  // 2. DOĞAL GÖZ KIRPMA (Her 4 saniyede bir blink) & HAFİF KIPIRDAMA
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);

    const wobbleInterval = setInterval(() => {
      setWobble((prev) => (prev === 0 ? 1 : 0));
    }, 2200);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(wobbleInterval);
    };
  }, []);

  // Karakter Türü Kontrolleri ('sparky' = fox, 'chuck' = chicken)
  const isSparky =
    active.id === "sparky" ||
    active.id === "kids" ||
    active.id === "kids_female" ||
    active.type === "fox";
  const isChuck = active.id === "chuck" || active.type === "chicken";

  // İnsan Portresi İçin Kaynak
  const registryEntry = AVATAR_3D_REGISTRY[active.id] || {
    src: active.image || "/avatars/alex.png",
    fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  };
  const imageSrc = !imgError ? registryEntry.src : registryEntry.fallback;

  // Standart Kapsayıcı Boyut Haritası
  const sizeClasses = {
    sm: "w-16 h-16 rounded-2xl",
    md: "w-28 h-28 rounded-2xl",
    lg: "w-48 h-48 sm:w-56 sm:h-56 rounded-3xl",
    xl: "w-64 h-64 sm:w-72 sm:h-72 rounded-3xl",
  };

  // Çerçeve Neon ve Parlama Stilleri
  const getContainerBorderStyles = () => {
    switch (currentState) {
      case "listening":
        return "border-emerald-400 ring-4 ring-emerald-400/90 shadow-[0_0_40px_rgba(52,211,153,0.8)] scale-[1.03]";
      case "speaking":
        return isChuck
          ? "border-yellow-400 ring-4 ring-yellow-400/60 shadow-[0_0_38px_rgba(250,204,21,0.65)] scale-[1.02]"
          : isSparky
          ? "border-amber-400 ring-4 ring-amber-500/60 shadow-[0_0_38px_rgba(245,158,11,0.65)] scale-[1.02]"
          : "border-violet-500/80 ring-4 ring-violet-500/50 shadow-[0_0_35px_rgba(139,92,246,0.6)] scale-[1.02]";
      case "thinking":
        return "border-indigo-500/70 ring-4 ring-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.5)]";
      case "idle":
      default:
        return isChuck
          ? "border-yellow-500/50 shadow-2xl hover:border-yellow-400/80"
          : isSparky
          ? "border-amber-500/50 shadow-2xl hover:border-amber-400/80"
          : "border-slate-700/60 shadow-2xl hover:border-emerald-500/50 hover:shadow-emerald-500/10";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-center relative select-none ${className}`}
    >
      {/* 60 FPS GPU-Hızlandırmalı Keyframe Animasyonları */}
      <style>{`
        @keyframes avatar-float-breathe {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.015);
          }
        }
        @keyframes avatar-attentive-pulse {
          0%, 100% {
            transform: translateY(-2px) scale(1.02);
          }
          50% {
            transform: translateY(-4px) scale(1.035);
          }
        }
        @keyframes fox-tail-wag {
          0%, 100% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(12deg);
          }
        }
        @keyframes lip-sync-012s {
          0% {
            transform: translateY(0px) scaleY(0.55);
          }
          100% {
            transform: translateY(3px) scaleY(1.32);
          }
        }
        .avatar-float-idle {
          animation: avatar-float-breathe 4s ease-in-out infinite;
        }
        .avatar-attentive-listening {
          animation: avatar-attentive-pulse 1.8s ease-in-out infinite;
        }
        .lip-sync-mouth-012s,
        .lip-sync-beak-012s {
          animation: lip-sync-012s 0.12s ease-in-out infinite alternate;
        }
      `}</style>

      {/* 1. STANDART KAPSAYICI & NEON DİNLEME / KONUŞMA DALGALARI */}
      <div className="relative group">
        {/* Dinleme Durumu: Etrafında Parlayan Neon Yeşil Dinleme Dalgaları */}
        {currentState === "listening" && (
          <>
            <span
              className="absolute -inset-4 rounded-3xl border-2 border-emerald-400/60 animate-ping pointer-events-none shadow-[0_0_25px_rgba(52,211,153,0.6)]"
              style={{ animationDuration: "1.4s" }}
            />
            <span
              className="absolute -inset-2.5 rounded-3xl border-2 border-emerald-300/70 animate-pulse pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.7)]"
            />
            <span className="absolute -inset-1 rounded-3xl border border-emerald-400/90 pointer-events-none" />
          </>
        )}

        {/* Konuşma Halkası: Karakter Temasına Göre Canlı Dalga */}
        {currentState === "speaking" && (
          <>
            <span
              className={`absolute -inset-3 rounded-3xl border-2 animate-ping pointer-events-none ${
                isChuck
                  ? "border-yellow-400/50"
                  : isSparky
                  ? "border-amber-400/50"
                  : "border-violet-500/40"
              }`}
              style={{ animationDuration: "1.6s" }}
            />
            <span
              className={`absolute -inset-1 rounded-3xl border animate-pulse pointer-events-none ${
                isChuck
                  ? "border-yellow-300/70"
                  : isSparky
                  ? "border-amber-300/70"
                  : "border-violet-400/60"
              }`}
            />
          </>
        )}

        {/* Kapsayıcı Kutu */}
        <div
          className={`relative ${sizeClasses[size]} mx-auto overflow-hidden shadow-2xl border bg-slate-900 transition-all duration-300 ${getContainerBorderStyles()}`}
        >
          {/* ======================================================================= */}
          {/* KARAKTER SEÇİMİNE GÖRE RENDER                                           */}
          {/* ======================================================================= */}
          {isSparky ? (
            /* 1. 'sparky': 3D Efektli, Sevimli Gölgeli, Gözlüklü 🦊 Tilki Maskotu */
            <SparkyFoxMascot
              currentState={currentState}
              mouthOpenRatio={mouthOpenRatio}
              isBlinking={isBlinking}
              earTwitch={wobble}
            />
          ) : isChuck ? (
            /* 2. 'chuck': Büyük Gözlü, Kırmızı İbikli, Şaşkın 🐔 Komik Tavuk Maskotu */
            <ChuckChickenMascot
              currentState={currentState}
              mouthOpenRatio={mouthOpenRatio}
              isBlinking={isBlinking}
              wobble={wobble}
            />
          ) : (
            /* 3. İnsan Portreleri (Sarah, Leo, Alex, Mr. Harrison) */
            <HumanPortraitAvatar
              imageSrc={imageSrc}
              name={active.name}
              currentState={currentState}
              mouthOpenRatio={mouthOpenRatio}
              onError={() => setImgError(true)}
            />
          )}

          {/* Kullanıcı Konuşurken: Sağ Üst Neon Yeşil Mikrofon İkonu Rozeti */}
          {currentState === "listening" && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_0_16px_rgba(52,211,153,0.9)] animate-bounce z-30">
              <Mic className="w-4 h-4" />
            </div>
          )}

          {/* AI Düşünürken: Sağ Üst Dönen Parıltı İkonu */}
          {currentState === "thinking" && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-spin z-30">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DURUM ROZETLERİ (SPEAKING, LISTENING, THINKING, IDLE)                      */}
      {/* ========================================================================= */}
      {showBadges && currentState === "speaking" && (
        <div className="mt-3 px-3.5 py-1.5 rounded-full bg-emerald-950/85 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <Radio className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
          <span>
            🟢 {active.name} ({active.title}) • {t("speaking_ai_active", "Konuşuyor")}
          </span>
        </div>
      )}

      {showBadges && currentState === "listening" && (
        <div className="mt-3 px-3.5 py-1.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-400/70 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.35)] animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          <Mic className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
          <span>
            🟢 {active.name} {t("speaking_listening_you", "Dikkatle Seni Dinliyor...")}
          </span>
        </div>
      )}

      {showBadges && currentState === "thinking" && (
        <div className="mt-3 px-3.5 py-1.5 rounded-full bg-indigo-950/85 text-indigo-300 border border-indigo-500/50 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
          <span>✨ {active.name} {t("speaking_thinking", "Düşünüyor...")}</span>
        </div>
      )}

      {showBadges && currentState === "idle" && (
        <div className="mt-3 flex flex-col items-center gap-1">
          <div className="px-3.5 py-1 rounded-full bg-slate-950/85 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span>
              {active.avatarIcon} {active.name} • {t("ready", "Hazır")}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{active.title}</p>
        </div>
      )}
    </div>
  );
}
