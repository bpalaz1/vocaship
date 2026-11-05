"use client";

import React, { useEffect, useState } from "react";
import { Mic, Sparkles, Radio } from "lucide-react";
import { usePersona, PersonaId, PERSONAS } from "../../context/PersonaContext";

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

const PORTRAIT_FALLBACK_MAP: Record<string, { src: string; fallback: string }> = {
  sparky: {
    src: "/avatars/sparky.png",
    fallback: "/avatars/sparky.png",
  },
  chuck: {
    src: "/avatars/chuck.png",
    fallback: "/avatars/sparky.png",
  },
  alex: {
    src: "/avatars/alex.png",
    fallback:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  sarah: {
    src: "/avatars/sarah.png",
    fallback:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  },
  sandy: {
    src: "/avatars/sarah.png",
    fallback:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  },
  leo: {
    src: "/avatars/leo.png",
    fallback:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  mr_harrison: {
    src: "/avatars/mr_harrison.png",
    fallback:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  },
};

export default function AvatarDisplay({
  personaId,
  avatarState,
  state = "idle",
  showBadges = true,
  className = "",
  onClick,
}: AvatarDisplayProps) {
  const { persona: contextPersona, customAvatar } = usePersona();

  const currentState: AvatarAnimationState = avatarState || state || "idle";
  const activePersona =
    personaId === "custom"
      ? contextPersona.id === "custom"
        ? contextPersona
        : PERSONAS.custom
      : personaId === "my_avatar"
      ? contextPersona.id === "my_avatar"
        ? contextPersona
        : PERSONAS.my_avatar
      : personaId
      ? PERSONAS[personaId] || contextPersona
      : contextPersona;

  const isCustomAvatar = activePersona.id === "custom";
  const is3DAvatar = activePersona.id === "my_avatar";

  const [imgError, setImgError] = useState<boolean>(false);
  const [waveTick, setWaveTick] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [idleFloatPhase, setIdleFloatPhase] = useState<boolean>(false);

  // Karakter değiştiğinde hata durumunu sıfırla
  useEffect(() => {
    setImgError(false);
  }, [activePersona.id, activePersona.image, personaId, customAvatar?.imageDataUrl]);

  // Karakter idle modundayken hafif nefes alma salınımı ve 4 saniyede bir doğal göz kırpma döngüsü
  useEffect(() => {
    if (currentState !== "idle") {
      setIsBlinking(false);
      setIdleFloatPhase(false);
      return;
    }

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);

    const floatInterval = setInterval(() => {
      setIdleFloatPhase((prev) => !prev);
    }, 1800);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(floatInterval);
      setIsBlinking(false);
    };
  }, [currentState]);

  // Konuşma ve dinleme sırasında alt ses dalgası çubukları ve mikro-esneme için akıcı ritim
  useEffect(() => {
    if (currentState !== "speaking" && currentState !== "listening") {
      setWaveTick(0);
      return;
    }

    const timer = setInterval(() => {
      setWaveTick((prev) => (prev + 1) % 12);
    }, 110);

    return () => {
      clearInterval(timer);
      setWaveTick(0);
    };
  }, [currentState]);

  const portraitEntry = isCustomAvatar
    ? {
        src: customAvatar?.imageDataUrl || activePersona.image || "/avatars/sarah.png",
        fallback: "/avatars/sarah.png",
      }
    : is3DAvatar
    ? {
        src: activePersona.image || "/avatars/alex.png",
        fallback: PORTRAIT_FALLBACK_MAP.alex.fallback,
      }
    : PORTRAIT_FALLBACK_MAP[activePersona.id] || {
        src: activePersona.image || "/avatars/sarah.png",
        fallback: PORTRAIT_FALLBACK_MAP.sarah.fallback,
      };
  const resolvedPortrait = !imgError ? portraitEntry.src : portraitEntry.fallback;

  // Durum Ritimleri (State Animation):
  // - 'speaking': scale-y-[1.04] scale-x-[0.98] transition-transform duration-150 mikro-esneme
  // - 'idle': hafif nefes alma salınımı
  const isMicroStretchPhase = currentState === "speaking" && waveTick % 2 === 1;
  const portraitMotionClass =
    currentState === "speaking"
      ? isMicroStretchPhase
        ? "scale-y-[1.04] scale-x-[0.98] -translate-y-0.5 transition-transform duration-150"
        : "scale-y-[1.01] scale-x-[1.005] translate-y-0 transition-transform duration-150"
      : currentState === "idle"
      ? idleFloatPhase
        ? "scale-[1.018] -translate-y-1 transition-transform duration-1000 ease-in-out"
        : "scale-100 translate-y-0 transition-transform duration-1000 ease-in-out"
      : "scale-100 translate-y-0 transition-transform duration-150";

  const listeningRingClass =
    currentState === "listening"
      ? "ring-4 ring-cyan-400 animate-pulse border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.8)]"
      : currentState === "speaking"
      ? "ring-2 ring-amber-400/70 border-amber-400/60 shadow-[0_0_28px_rgba(251,191,36,0.35)]"
      : "";

  const waveHeights = [10, 18, 24, 14, 26, 16, 22, 12, 18, 10];

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-center relative select-none ${className}`}
    >
      {/* YEREL STÜDYO SAHNESİ (3D POLİGON VEYA CANLI MASKOT) */}
      <div
        data-testid="video-loop-avatar-stage"
        data-avatar-state={currentState}
        className={`relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center ${listeningRingClass}`}
      >
        {/* Derinlikli Stüdyo Işığı & Canlı Aura Katmanı */}
        <div
          className={`pointer-events-none absolute -inset-6 z-0 transition-all duration-300 ${
            currentState === "speaking"
              ? "bg-[radial-gradient(circle_at_50%_35%,rgba(251,191,36,0.28),rgba(16,185,129,0.18),transparent_70%)] scale-110"
              : currentState === "listening"
              ? "bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.34),transparent_70%)] animate-pulse"
              : "bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.14),transparent_70%)]"
          }`}
        />

        {/* Kararlı Canlı Maskot & 3D Poligon Portre Katmanı */}
        <img
          data-testid="cartoon-mascot-portrait"
          src={resolvedPortrait}
          alt={activePersona.name}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover select-none relative z-10 origin-bottom ${portraitMotionClass} ${
            isBlinking ? "brightness-95 scale-y-[0.992]" : "brightness-100"
          }`}
        />

        {/* Idle Modu: 4 Saniyede Bir Doğal Göz Kırpma (Blink) Katmanı */}
        {currentState === "idle" && (
          <div
            data-testid="avatar-idle-blink-layer"
            className={`pointer-events-none absolute inset-x-0 top-[28%] h-6 bg-slate-950/25 backdrop-blur-[1px] transition-opacity duration-100 z-20 ${
              isBlinking ? "opacity-80" : "opacity-0"
            }`}
          />
        )}

        {/* Speaking Modu: Konuşma Mimikleri & Dudak Ritmi Katmanı */}
        {currentState === "speaking" && (
          <div
            data-testid="avatar-speaking-mimic-layer"
            className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center z-20"
          >
            <span
              className={`rounded-full bg-amber-400/25 border border-amber-300/50 backdrop-blur-[1px] transition-all duration-100 ${
                isMicroStretchPhase
                  ? "w-7 h-3.5 shadow-[0_0_14px_rgba(251,191,36,0.75)]"
                  : "w-5 h-1.5 opacity-75"
              }`}
            />
          </div>
        )}

        {/* Sinematik Stüdyo Vinyeti */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20 pointer-events-none z-20" />

        {/* Sol Üst: Karakter Rozeti */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/70 flex items-center gap-1.5 text-[11px] font-bold text-white shadow-md z-30">
          <span>{activePersona.avatarIcon}</span>
          <span>{activePersona.name}</span>
        </div>

        {/* Sağ Üst: Dinleme / Düşünme İkonu */}
        {currentState === "listening" && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.9)] animate-bounce z-30">
            <Mic className="w-4 h-4" />
          </div>
        )}

        {currentState === "thinking" && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-spin z-30">
            <Sparkles className="w-4 h-4" />
          </div>
        )}

        {/* Alt Ses Dalgası Çubukları */}
        <div className="absolute inset-x-0 bottom-0 py-2.5 px-4 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent backdrop-blur-[2px] flex items-center justify-center gap-1.5 z-30">
          {waveHeights.map((baseH, idx) => {
            const isActive =
              currentState === "speaking" || currentState === "listening";
            const dynamicOffset = isActive
              ? Math.round(Math.abs(Math.sin((waveTick + idx) * 0.9)) * 12)
              : 0;
            const barH = isActive ? Math.max(6, baseH - 6 + dynamicOffset) : 4;

            return (
              <span
                key={idx}
                style={{ height: `${barH}px` }}
                className={`w-1.5 rounded-full transition-all duration-100 ${
                  isActive
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]"
                    : "bg-slate-700/70"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* KARAKTER KARTI ALTI: AKTİF DURUM ROZETİ + İSİM VE ROL */}
      {showBadges && (
        <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
          {currentState === "speaking" && (
            <div
              data-testid="avatar-status-badge"
              className="px-4 py-1.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 animate-pulse"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
              <span>[ 🟢 AI Mentor: Aktif &amp; Konuşuyor ]</span>
            </div>
          )}

          {currentState === "listening" && (
            <div
              data-testid="avatar-status-badge"
              className="px-4 py-1.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-400/70 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.35)] animate-pulse"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
              <span>[ 🎙️ Sizi Dinliyor... ]</span>
            </div>
          )}

          {currentState === "thinking" && (
            <div
              data-testid="avatar-status-badge"
              className="px-4 py-1.5 rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-500/50 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
              <span>[ ✨ AI Mentor: Düşünüyor... ]</span>
            </div>
          )}

          {currentState === "idle" && (
            <div
              data-testid="avatar-status-badge"
              className="px-4 py-1 rounded-full bg-slate-950/90 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span>[ ⚪ Hazır ]</span>
            </div>
          )}

          <p
            data-testid="avatar-name-role"
            className="text-xs sm:text-sm font-bold text-slate-200 tracking-tight"
          >
            {activePersona.name} <span className="text-emerald-400">•</span>{" "}
            <span className="text-slate-400 font-medium">{activePersona.title}</span>
          </p>
        </div>
      )}
    </div>
  );
}
