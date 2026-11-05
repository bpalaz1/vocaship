"use client";

import React, { useRef, useEffect } from "react";
import {
  MessageSquare,
  Volume2,
  Sparkles,
  Mic,
  User,
} from "lucide-react";
import LiveTranscript from "./LiveTranscript";

export interface DialogueTurn {
  role: "assistant" | "user";
  message: string;
  timestamp?: string;
}

export interface SpeakingTranscriptProps {
  dialogue: DialogueTurn[];
  userTranscript?: string;
  interimText?: string;
  isThinking?: boolean;
  speakingAudioIndex?: number | null;
  activeWordIndex?: number | null;
  isKidsMode?: boolean;
  rate?: number;
  personaName?: string;
  onPlayAudio?: (text: string, index: number) => void;
  emptyStateMessage?: string;
}

function cleanUserMessage(msg: string): string {
  return msg.replace(/^User:\s*/i, "").trim();
}

export default function SpeakingTranscript({
  dialogue = [],
  userTranscript = "",
  interimText = "",
  isThinking = false,
  speakingAudioIndex = null,
  activeWordIndex = null,
  isKidsMode = false,
  rate = 0.86,
  personaName = "AI Mentor",
  onPlayAudio,
  emptyStateMessage = "Mikrofon butonuna basarak ilk cümleni söyleyebilirsin. Hazır olduğunda seni dinliyorum!",
}: SpeakingTranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Otomatik yumuşak kaydırma (Auto-Scroll)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dialogue, userTranscript, interimText, isThinking]);

  return (
    <div
      data-testid="speaking-chat-stream-container"
      className="flex-1 w-full overflow-y-auto space-y-4 p-4 max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-2xl bg-white/90 border border-slate-200 shadow-sm z-10 relative flex flex-col justify-start"
    >
      {/* ===================================================================== */}
      {/* 1. BOŞ DURUM (EMPTY STATE / HOŞ GELDİN REHBERİ)                       */}
      {/* ===================================================================== */}
      {dialogue.length === 0 && !userTranscript && !interimText && (
        <div
          data-testid="speaking-transcript-empty-state"
          className="my-auto py-10 flex flex-col items-center justify-center text-center space-y-3.5"
        >
          <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <MessageSquare className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-sm px-2">
            <h3 className="text-sm font-extrabold text-slate-900">
              Konuşma Başlatılmaya Hazır
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {emptyStateMessage}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-emerald-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Mentor ({personaName}) Çevrim içi</span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. DİYALOG BALONLARI AKIŞI (CHAT STREAM UI)                           */}
      {/* ===================================================================== */}
      {dialogue.map((turn, idx) => {
        const isAssistant = turn.role === "assistant";

        if (isAssistant) {
          // AI Yanıtı: Sola yaslı, koyu slate arka plan (bg-slate-800/90)
          return (
            <div
              key={idx}
              className="flex flex-col items-start max-w-[85%] sm:max-w-[80%] mr-auto space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 pl-1">
                <span className="font-bold text-emerald-400">{personaName}</span>
                {turn.timestamp && <span>• {turn.timestamp}</span>}
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900 text-white border border-slate-800 rounded-2xl rounded-tl-none p-3.5 sm:p-4 shadow-md text-xs sm:text-sm leading-relaxed font-medium break-words group">
                <div className="flex-1 min-w-0">
                  <LiveTranscript
                    text={turn.message}
                    isSpeaking={speakingAudioIndex === idx}
                    activeWordIndex={speakingAudioIndex === idx ? activeWordIndex : null}
                    isKidsMode={isKidsMode}
                    rate={rate}
                  />
                </div>

                {onPlayAudio && (
                  <button
                    type="button"
                    onClick={() => onPlayAudio(turn.message, idx)}
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-emerald-300 text-xs transition cursor-pointer shrink-0 mt-0.5 active:scale-95"
                    title="Sesli Dinle (TTS)"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        }

        // Kullanıcı Mesajı: Sağa yaslı, modern indigo arka plan (bg-indigo-600)
        return (
          <div
            key={idx}
            className="flex flex-col items-end max-w-[85%] sm:max-w-[80%] ml-auto space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 pr-1">
              <span className="font-bold text-indigo-300">Sen</span>
              {turn.timestamp && <span>• {turn.timestamp}</span>}
            </div>

            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 sm:py-3.5 shadow-md text-xs sm:text-sm leading-relaxed font-medium break-words">
              {cleanUserMessage(turn.message)}
            </div>
          </div>
        );
      })}

      {/* ===================================================================== */}
      {/* 3. CANLI KONUŞMA / INTERIM DEŞİFRE BALONU                             */}
      {/* ===================================================================== */}
      {(userTranscript || interimText) && (
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[80%] ml-auto space-y-1 animate-pulse">
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 pr-1">
            <Mic className="w-3 h-3 animate-bounce" />
            <span>Canlı Deşifre Ediliyor...</span>
          </div>

          <div className="bg-emerald-950/40 text-emerald-200 border border-emerald-500/40 rounded-2xl rounded-tr-none px-4 py-3 shadow-md text-xs sm:text-sm leading-relaxed font-medium break-words">
            {userTranscript} <span className="opacity-60 italic">{interimText}</span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. DÜŞÜNÜYOR (THINKING) ANİMASYONLU YANIT BEKLEME                     */}
      {/* ===================================================================== */}
      {isThinking && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 animate-pulse max-w-[80%] mr-auto">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
          <span>AI Mentor değerlendiriyor ve yanıt hazırlıyor...</span>
        </div>
      )}

      {/* Otomatik kaydırma referans noktası */}
      <div ref={messagesEndRef} />
    </div>
  );
}

