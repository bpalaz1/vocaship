"use client";

import React from "react";
import {
  Sparkles,
  Mic,
  Volume2,
  VolumeX,
  RotateCcw,
  GraduationCap,
} from "lucide-react";
import SpeakingTranscript from "./SpeakingTranscript";
import { ConversationMode, CONVERSATION_MODES } from "../../types/speaking";
import { PersonaInfo } from "../../context/PersonaContext";
import { getCalibratedRateForPersona } from "../../utils/tts";

export interface DialogueTurn {
  role: "assistant" | "user";
  message: string;
  timestamp?: string;
}

export interface SpeakingCenterStageProps {
  dialogue: DialogueTurn[];
  activeMode: ConversationMode;
  persona: PersonaInfo;
  targetLevel: string;
  autoPlayAudio: boolean;
  isRecording: boolean;
  isThinking: boolean;
  interimText: string;
  userTranscript: string;
  speakingAudioIndex: number | null;
  activeWordIndex: number | null;
  isKidsMode: boolean;
  avatarState?: "idle" | "listening" | "speaking" | "thinking";
  currentFollowUpQuestion?: string | null;
  toggleRecording: () => void;
  handleResetDialogue: () => void;
  setTargetLevel: (level: string) => void;
  setAutoPlayAudio: (val: boolean) => void;
  stopAudio: () => void;
  playDialogueSpeech: (text: string, index: number) => void;
  t?: (key: string, fallback: string) => string;
}

function NeonWaveform({ active }: { active: boolean }) {
  const bars = [14, 28, 42, 22, 54, 32, 60, 24, 46, 20, 36, 16];
  return (
    <div className="flex items-center gap-1 h-10 px-2">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            active
              ? "bg-gradient-to-t from-emerald-500 to-teal-300 animate-pulse"
              : "bg-slate-800"
          }`}
          style={{
            height: active ? `${Math.max(10, (height * (i % 2 === 0 ? 1 : 0.7)))}%` : "20%",
            animationDelay: `${i * 70}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function SpeakingCenterStage({
  dialogue,
  activeMode,
  persona,
  targetLevel,
  autoPlayAudio,
  isRecording,
  isThinking,
  interimText,
  userTranscript,
  speakingAudioIndex,
  activeWordIndex,
  isKidsMode,
  avatarState = "idle",
  currentFollowUpQuestion,
  toggleRecording,
  handleResetDialogue,
  setTargetLevel,
  setAutoPlayAudio,
  stopAudio,
  playDialogueSpeech,
  t = (_key, fallback) => fallback,
}: SpeakingCenterStageProps) {
  return (
    <section className="flex-1 w-full min-w-0">
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 min-h-[660px] relative overflow-hidden backdrop-blur-md">
        {/* Arka Plan Neon Parıltısı */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Kart Başlığı */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 z-10 relative">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
            <h1 className="text-sm font-black uppercase tracking-wider text-white truncate">
              AI Speaking Lounge
            </h1>
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                CONVERSATION_MODES[activeMode]?.badgeColor || "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              }`}
            >
              <span>{CONVERSATION_MODES[activeMode]?.icon}</span>
              <span>{CONVERSATION_MODES[activeMode]?.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {persona.name} • {persona.level}
            </span>

            {/* Akademik Seviye Modu Toggle */}
            <button
              type="button"
              onClick={() => setTargetLevel(targetLevel === "C1" ? "B2" : "C1")}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-semibold text-slate-300 transition cursor-pointer"
              title="Akademik Seviye Modunu Değiştir"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-emerald-400 font-bold">{targetLevel}</span>
            </button>

            {/* + Practice Butonu */}
            <button
              type="button"
              onClick={handleResetDialogue}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] shadow-sm transition cursor-pointer active:scale-95"
              title="Yeni Oturum Başlat"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Practice</span>
            </button>

            {/* Otomatik TTS Aç/Kapat */}
            <button
              type="button"
              onClick={() => {
                if (autoPlayAudio) stopAudio();
                setAutoPlayAudio(!autoPlayAudio);
              }}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                autoPlayAudio
                  ? "bg-slate-950 border-emerald-500/40 text-emerald-400 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-500"
              }`}
              title="Otomatik TTS Aç/Kapat"
            >
              {autoPlayAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MESAJ DÖKÜM ALANI (Top-Center Modern Chat Stream UI Balonları)         */}
        {/* ===================================================================== */}
        <SpeakingTranscript
          dialogue={dialogue}
          userTranscript={userTranscript}
          interimText={interimText}
          isThinking={isThinking}
          speakingAudioIndex={speakingAudioIndex}
          activeWordIndex={activeWordIndex}
          isKidsMode={isKidsMode}
          rate={getCalibratedRateForPersona(persona)}
          personaName={persona.name}
          onPlayAudio={playDialogueSpeech}
        />

        {/* ===================================================================== */}
        {/* DİNAMİK TAKİP SORUSU YÖNLENDİRME KARTI                                */}
        {/* ===================================================================== */}
        {currentFollowUpQuestion && (
          <div
            data-testid="dynamic-followup-card"
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-indigo-950/60 border border-emerald-500/30 shadow-lg backdrop-blur-md z-10 relative animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                      💡 Sıradaki Soru / Konuşma Fırsatı:
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {targetLevel} • Dinamik Akış
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => playDialogueSpeech(currentFollowUpQuestion, -1)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer shrink-0"
                    title="Soruyu Dinle"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Dinle</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                  {currentFollowUpQuestion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SES DALGASI & MİKROFON KONTROLÜ (Alt Bar)                              */}
        {/* ===================================================================== */}
        <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800/90 space-y-3 z-10 relative shadow-xl">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 flex justify-start">
              <NeonWaveform active={isRecording || avatarState === "speaking"} />
            </div>

            <div className="relative group shrink-0">
              <div
                className={`absolute -inset-2 rounded-full transition duration-500 ${
                  isRecording
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-80 blur-md animate-pulse"
                    : "bg-gradient-to-r from-emerald-500/30 to-teal-500/30 opacity-40 blur-sm group-hover:opacity-75"
                }`}
              />
              <button
                type="button"
                data-testid="tap-to-speak-mic-btn"
                onClick={toggleRecording}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all duration-300 cursor-pointer shadow-2xl ${
                  isRecording
                    ? "bg-gradient-to-br from-rose-500 to-red-600 text-white animate-pulse ring-4 ring-rose-400/50"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/30"
                }`}
              >
                <Mic className={`w-7 h-7 sm:w-8 sm:h-8 mb-1 ${isRecording ? "animate-bounce text-white" : "text-slate-950"}`} />
                <span className="text-[10px] tracking-tight uppercase font-black">
                  {isRecording ? "Listening" : "Speak"}
                </span>
              </button>
            </div>

            <div className="flex-1 flex justify-end">
              <NeonWaveform active={isRecording || avatarState === "speaking"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

