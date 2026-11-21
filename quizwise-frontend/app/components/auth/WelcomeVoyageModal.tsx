"use client";

import React, { useRef, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { VocaShipLogo } from "../brand/VocaShipLogo";

export interface WelcomeVoyageModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

const FEATURE_BADGES = [
  {
    id: "reading",
    emoji: "📖",
    title: "Reading Room",
    subtitle: "İnteraktif Hikayeler",
    accent: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  },
  {
    id: "wordpool",
    emoji: "🃏",
    title: "Word Pool",
    subtitle: "SM-2 Akıllı Kartlar",
    accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
  },
  {
    id: "speaking",
    emoji: "🎙️",
    title: "Speaking Studio",
    subtitle: "Canlı AI Konuşma",
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  },
  {
    id: "arena",
    emoji: "🏆",
    title: "Game Arena & Altınlar",
    subtitle: "Yarış, Kazan, Yüksel",
    accent: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  },
];

export default function WelcomeVoyageModal({
  isOpen,
  onSkip,
  onOpenRegister,
  onOpenLogin,
}: WelcomeVoyageModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  return (
    <div
      data-testid="welcome-voyage-modal"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050814]/95 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300"
    >
      <style jsx>{`
        @keyframes voyageWaveSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes voyageLogoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .voyage-wave-a {
          animation: voyageWaveSlide 6.5s linear infinite;
        }
        .voyage-wave-b {
          animation: voyageWaveSlide 9s linear infinite reverse;
        }
        .voyage-logo-float {
          animation: voyageLogoFloat 3.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative w-full max-w-3xl rounded-[32px] bg-gradient-to-b from-[#0C1428] via-[#0B1121] to-[#080C18] border border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.14)] overflow-hidden text-slate-100 my-auto">
        {/* Arka Plan Dekoratif Parıltılar */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[440px] h-[220px] rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[460px] h-[180px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-5 sm:px-8 pt-6 sm:pt-8 pb-6 space-y-5">
          {/* Kurumsal VocaShipLogo & Slogan Üst Blok */}
          <div className="flex flex-col items-center text-center space-y-2">
            <VocaShipLogo
              variant="stacked"
              className="[&>span]:text-white [&>span]:text-3xl sm:[&>span]:text-4xl"
            />
            <p className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">
              Sail to Fluency.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              Kelime havuzun, okuma odan, konuşma stüdyon ve oyun arenan tek bir akıllı gemide seni bekliyor.
            </p>
          </div>

          {/* Tanıtım Videosu Alanı (16:9) + Güvenli Fallback */}
          <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden border border-slate-700/60 bg-[#0B0F19] shadow-[0_0_50px_rgba(16,185,129,0.12)]">
            {!videoFailed ? (
              <>
                <video
                  ref={videoRef}
                  src="/videos/vocaship-intro.mp4"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onError={() => setVideoFailed(true)}
                  onLoadedData={() => setVideoFailed(false)}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  data-testid="welcome-video-mute-btn"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                  title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                  className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/75 hover:bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs font-bold text-slate-200 transition cursor-pointer"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                      <span>🔇</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>🔊</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0C152B] via-[#0A1428] to-[#071022] overflow-hidden">
                <div className="voyage-logo-float relative z-10 flex flex-col items-center gap-2 px-4 text-center">
                  <VocaShipLogo
                    variant="stacked"
                    className="[&>span]:text-white"
                  />
                  <span className="text-xs font-bold tracking-widest uppercase text-sky-300/80">
                    Sail to Fluency.
                  </span>
                </div>

                {/* Yumuşak Dalga Animasyonu (Fallback) */}
                <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none">
                  <svg
                    viewBox="0 0 1200 100"
                    preserveAspectRatio="none"
                    className="voyage-wave-a absolute bottom-0 left-0 w-[200%] h-14 opacity-45"
                  >
                    <path
                      d="M0,45 C150,85 300,5 450,45 C600,85 750,5 900,45 C1050,85 1125,25 1200,45 L1200,100 L0,100 Z"
                      fill="#0284C7"
                    />
                  </svg>
                  <svg
                    viewBox="0 0 1200 100"
                    preserveAspectRatio="none"
                    className="voyage-wave-b absolute bottom-0 left-0 w-[200%] h-10 opacity-65"
                  >
                    <path
                      d="M0,55 C180,15 320,90 500,50 C680,10 820,85 1000,48 C1100,28 1150,65 1200,55 L1200,100 L0,100 Z"
                      fill="#10B981"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* 4 Özellik Rozeti (Videonun Hemen Altında Temiz Şerit) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
            {FEATURE_BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${badge.accent}`}
              >
                <span className="text-lg leading-none shrink-0">{badge.emoji}</span>
                <div className="min-w-0 leading-tight">
                  <div className="text-[11px] font-black truncate">{badge.title}</div>
                  <div className="text-[10px] opacity-80 truncate">{badge.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          {/* İki Ana Aksiyon Butonu */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              data-testid="welcome-register-btn"
              onClick={onOpenRegister}
              className="w-full sm:w-52 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🚀 Kayıt Ol</span>
            </button>

            <button
              type="button"
              data-testid="welcome-login-btn"
              onClick={onOpenLogin}
              className="w-full sm:w-52 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400/50 text-slate-100 font-extrabold text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🔑 Giriş Yap</span>
            </button>
          </div>

          {/* Sağ Altta Her Zaman Tıklanabilir Atla → Butonu */}
          <div className="flex justify-end">
            <button
              type="button"
              data-testid="welcome-skip-btn"
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <span>Atla</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
