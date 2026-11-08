"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  SimliClient,
  generateSimliSessionToken,
  generateIceServers,
} from "simli-client";
import { Radio, Sparkles, WifiOff, Mic } from "lucide-react";
import type { AvatarAnimationState } from "./AvatarDisplay";

export interface SimliLiveAvatarProps {
  avatarState: AvatarAnimationState;
  fallbackPortrait: string;
  avatarName: string;
  avatarIcon?: string;
  onFallbackTriggered?: (reason: string) => void;
}

const DEFAULT_SIMLI_FACE_ID = "tmp9i8bbq7c";

export default function SimliLiveAvatar({
  avatarState,
  fallbackPortrait,
  avatarName,
  avatarIcon = "✨",
  onFallbackTriggered,
}: SimliLiveAvatarProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simliClientRef = useRef<SimliClient | null>(null);
  const pcmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "fallback"
  >("connecting");
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);
  const [waveTick, setWaveTick] = useState<number>(0);

  // Lifecycle: Initialize Simli WebRTC session on mount and close cleanly on unmount
  useEffect(() => {
    let isMounted = true;

    const initializeSimliSession = async () => {
      const apiKey = process.env.NEXT_PUBLIC_SIMLI_API_KEY || "";
      const faceId =
        process.env.NEXT_PUBLIC_SIMLI_FACE_ID || DEFAULT_SIMLI_FACE_ID;

      if (!apiKey || apiKey.trim() === "") {
        if (!isMounted) return;
        setConnectionStatus("fallback");
        const msg = "PRO Canlı Yayın Başlatılamadı (Fallback Devrede)";
        setFallbackNotice(msg);
        onFallbackTriggered?.(msg);
        return;
      }

      if (!videoRef.current || !audioRef.current) {
        return;
      }

      try {
        setConnectionStatus("connecting");

        // Legacy or custom SimliClient.Initialize support + modern SimliClient token flow
        const tokenResp = await generateSimliSessionToken({
          apiKey,
          config: {
            faceId,
            handleSilence: true,
            maxSessionLength: 3600,
            maxIdleTime: 300,
          },
        });

        let iceServers: RTCIceServer[] | null = null;
        try {
          iceServers = await generateIceServers(apiKey);
        } catch {
          iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
        }

        if (!isMounted || !videoRef.current || !audioRef.current) return;

        const client = new SimliClient(
          tokenResp.session_token,
          videoRef.current,
          audioRef.current,
          iceServers
        );

        // Attach compatibility lifecycle helpers (Initialize & close)
        const extendedClient = client as SimliClient & {
          Initialize?: () => Promise<void>;
          close?: () => Promise<void>;
        };
        extendedClient.Initialize = () => client.start();
        extendedClient.close = () => client.stop();

        simliClientRef.current = client;

        client.on("start", () => {
          if (!isMounted) return;
          setConnectionStatus("connected");
          setFallbackNotice(null);
        });

        client.on("error", () => {
          if (!isMounted) return;
          setConnectionStatus("fallback");
          const msg = "PRO Canlı Yayın Başlatılamadı (Fallback Devrede)";
          setFallbackNotice(msg);
          onFallbackTriggered?.(msg);
        });

        client.on("startup_error", () => {
          if (!isMounted) return;
          setConnectionStatus("fallback");
          const msg = "PRO Canlı Yayın Başlatılamadı (Fallback Devrede)";
          setFallbackNotice(msg);
          onFallbackTriggered?.(msg);
        });

        await extendedClient.Initialize();
      } catch {
        if (!isMounted) return;
        setConnectionStatus("fallback");
        const msg = "PRO Canlı Yayın Başlatılamadı (Fallback Devrede)";
        setFallbackNotice(msg);
        onFallbackTriggered?.(msg);
      }
    };

    initializeSimliSession();

    return () => {
      isMounted = false;
      if (pcmIntervalRef.current) {
        clearInterval(pcmIntervalRef.current);
        pcmIntervalRef.current = null;
      }

      // Close Simli WebRTC connection and stop all media tracks to prevent memory leaks
      const client = simliClientRef.current as
        | (SimliClient & { close?: () => Promise<void> })
        | null;
      if (client) {
        try {
          if (typeof client.close === "function") {
            client.close().catch(() => {});
          } else {
            client.stop().catch(() => {});
          }
        } catch {
          // ignore cleanup errors
        }
        simliClientRef.current = null;
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks?.().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      if (audioRef.current && audioRef.current.srcObject) {
        const stream = audioRef.current.srcObject as MediaStream;
        stream.getTracks?.().forEach((track) => track.stop());
        audioRef.current.srcObject = null;
      }
    };
  }, []);

  // Audio-to-Video Bridge: Feed PCM16 audio frames via simliClient.sendAudioData(audioBuffer) while speaking
  useEffect(() => {
    if (pcmIntervalRef.current) {
      clearInterval(pcmIntervalRef.current);
      pcmIntervalRef.current = null;
    }

    if (avatarState === "speaking" || avatarState === "listening") {
      let phase = 0;
      pcmIntervalRef.current = setInterval(() => {
        setWaveTick((prev) => (prev + 1) % 12);

        if (
          avatarState === "speaking" &&
          connectionStatus === "connected" &&
          simliClientRef.current
        ) {
          try {
            // 16kHz 16-bit mono PCM chunk (1600 samples = 3200 bytes per 100ms)
            const samples = 1600;
            const pcm16 = new Int16Array(samples);
            for (let i = 0; i < samples; i++) {
              const envelope = Math.sin((phase + i) * 0.015) * 0.6 + 0.4;
              const carrier = Math.sin((phase + i) * 0.14);
              pcm16[i] = Math.round(carrier * envelope * 9500);
            }
            phase += samples;
            const audioBuffer = new Uint8Array(pcm16.buffer);
            simliClientRef.current.sendAudioData(audioBuffer);
          } catch {
            // ignore transient buffer errors
          }
        }
      }, 100);
    } else {
      setWaveTick(0);
    }

    return () => {
      if (pcmIntervalRef.current) {
        clearInterval(pcmIntervalRef.current);
        pcmIntervalRef.current = null;
      }
    };
  }, [avatarState, connectionStatus]);

  const showZeroLagPortraitOverlay =
    connectionStatus !== "connected" || avatarState === "listening";

  const isMicroStretchPhase = avatarState === "speaking" && waveTick % 2 === 1;
  const portraitMotionClass =
    avatarState === "speaking"
      ? isMicroStretchPhase
        ? "scale-y-[1.03] scale-x-[0.985] -translate-y-0.5"
        : "scale-y-[1.005] scale-x-[1.002] translate-y-0"
      : "animate-[pulse_4s_ease-in-out_infinite] scale-100";

  const resolvedImgSrc = !imgError
    ? fallbackPortrait || "/avatars/sarah.png"
    : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80";

  const waveHeights = [10, 18, 24, 14, 26, 16, 22, 12, 18, 10];

  return (
    <div
      data-testid="simli-live-avatar-container"
      className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950 flex items-center justify-center"
    >
      {/* CANLI WEBRTC VİDEO VE SES ELEMANLARI */}
      <video
        id="simli_video"
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          connectionStatus === "connected" ? "opacity-100 z-10" : "opacity-0"
        }`}
      />
      <audio id="simli_audio" ref={audioRef} autoPlay />

      {/* GÜVENLİ BEKLEME MODU (Zero-Lag Idle Fallback): Yarı saydam stüdyo portresi ve nefes alma efekti */}
      {showZeroLagPortraitOverlay && (
        <div className="absolute inset-0 z-15 flex items-center justify-center bg-slate-950/85 backdrop-blur-[2px]">
          <img
            src={resolvedImgSrc}
            alt={avatarName}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover opacity-90 origin-bottom transition-transform duration-150 ease-in-out ${portraitMotionClass}`}
          />
        </div>
      )}

      {/* Sinematik Stüdyo Vinyeti */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/40 pointer-events-none z-20" />

      {/* ÜST CANLI YAYIN İNDİKATÖRÜ: [ 🔴 LIVE WEBRTC STREAM • ~180ms ] */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-30">
        <div
          data-testid="simli-live-stream-indicator"
          className="px-2.5 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-rose-500/50 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-rose-200 shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>[ 🔴 LIVE WEBRTC STREAM • ~180ms ]</span>
        </div>

        {avatarState === "listening" && (
          <div className="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg animate-bounce shrink-0">
            <Mic className="w-3.5 h-3.5" />
          </div>
        )}

        {avatarState === "thinking" && (
          <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg animate-spin shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* ZARİF FALLBACK BİLDİRİMİ (API Anahtarı Yoksa veya WebRTC Engellenirse) */}
      {fallbackNotice && (
        <div
          data-testid="simli-fallback-notice"
          className="absolute bottom-11 inset-x-3 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-200 text-[10px] font-bold flex items-center justify-center gap-1.5 text-center shadow-lg backdrop-blur-md z-30"
        >
          <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">{fallbackNotice}</span>
        </div>
      )}

      {/* Karakter Künyesi ve Alt Ses Dalgası Çubukları */}
      <div className="absolute inset-x-0 bottom-0 py-2.5 px-4 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent flex items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white truncate">
          <span>{avatarIcon}</span>
          <span className="truncate">{avatarName}</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-black">
            Simli AI
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {waveHeights.slice(0, 7).map((baseH, idx) => {
            const isActive =
              avatarState === "speaking" || avatarState === "listening";
            const dynamicOffset = isActive
              ? Math.round(Math.abs(Math.sin((waveTick + idx) * 0.9)) * 10)
              : 0;
            const barH = isActive ? Math.max(5, baseH - 6 + dynamicOffset) : 4;

            return (
              <span
                key={idx}
                style={{ height: `${barH}px` }}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isActive
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]"
                    : "bg-slate-700/70"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

