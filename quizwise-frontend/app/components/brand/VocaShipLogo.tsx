"use client";

import React, { useId } from "react";

interface VocaShipLogoProps {
  variant?: "horizontal" | "stacked" | "icon";
  size?: "sm" | "lg";
  className?: string;
}

function useVocaShipIcon(svgClassName: string, svgSize: number) {
  const rawId = useId().replace(/:/g, "");
  const leftStrokeId = `vocaLeftStroke-${rawId}`;
  const pageSailId = `vocaPageSail-${rawId}`;
  const waveLineId = `vocaWaveLine-${rawId}`;

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 120 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClassName}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={leftStrokeId} x1="16" y1="16" x2="48" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="55%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id={pageSailId} x1="46" y1="76" x2="96" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="45%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id={waveLineId} x1="20" y1="92" x2="100" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* V Harfinin Sol Keskin Kanadı */}
      <path
        d="M18 18 L34 18 L52 66 L44 78 Z"
        stroke={`url(#${leftStrokeId})`}
        strokeWidth="5.5"
        strokeLinejoin="round"
        fill="none"
      />

      {/* V Harfinin Sağ Kanadı: Açılan Kitap Sayfası & Yelken */}
      <path
        d="M44 78 C50 48, 66 26, 96 16 C92 44, 86 60, 82 68 C66 66, 54 70, 44 78 Z"
        fill={`url(#${pageSailId})`}
      />

      {/* Şekil ile Yazı Arasındaki Zarif Tek Dalga Çizgisi */}
      <path
        d="M22 92 Q 42 84, 60 92 T 98 92"
        stroke={`url(#${waveLineId})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function VocaShipMark({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const isLg = size === "lg";
  const iconSvg = useVocaShipIcon(
    isLg ? "w-10 h-10 shrink-0 block" : "w-8 h-8 shrink-0 block",
    isLg ? 40 : 32
  );

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 bg-gradient-to-br from-slate-800 via-indigo-950/60 to-slate-900 border border-emerald-400/40 ${
        isLg
          ? "w-16 h-16 rounded-2xl p-2.5 shadow-[0_0_25px_rgba(16,185,129,0.18)]"
          : "w-11 h-11 rounded-xl p-1.5 shadow-[0_0_20px_rgba(16,185,129,0.18)]"
      } ${className}`}
    >
      <div
        className={`absolute inset-0 bg-emerald-400/5 pointer-events-none ${
          isLg ? "rounded-2xl" : "rounded-xl"
        }`}
      />
      <div className="relative z-10 flex items-center justify-center">{iconSvg}</div>
    </div>
  );
}

export function VocaShipLogo({ variant = "horizontal", size = "sm", className = "" }: VocaShipLogoProps) {
  const iconSize = variant === "stacked" ? 64 : variant === "icon" ? 36 : 32;
  const iconSvg = useVocaShipIcon(
    variant === "icon" ? `w-9 h-9 shrink-0 block ${className}` : "w-8 h-8 shrink-0 block",
    iconSize
  );

  if (variant === "icon") {
    return iconSvg;
  }

  if (variant === "stacked") {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <div className="w-16 h-16 shrink-0 flex items-center justify-center [&>svg]:w-16 [&>svg]:h-16">
          {iconSvg}
        </div>
        <span className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Voca<span className="text-emerald-500">Ship</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 shrink-0 select-none ${className}`}>
      <VocaShipMark size={size} />

      {/* Eski Kompakt Boyutuna Getirilmiş Marka & Slogan Bloğu */}
      <div className="flex flex-col justify-center leading-tight">
        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
          Voca<span className="text-emerald-400">Ship</span>
        </span>
        <span className="text-[11px] font-medium tracking-wide text-slate-400 mt-0.5 whitespace-nowrap">
          Sail to Fluency.
        </span>
      </div>
    </div>
  );
}

export default VocaShipLogo;
