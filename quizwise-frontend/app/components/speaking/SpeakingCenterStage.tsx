"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  X,
  VolumeX,
} from "lucide-react";

export interface SpeakingCenterStageProps {
  latestMentorMessage: string;
  latestUserMessage: string;
  followUpQuestion?: string | null;
  isRecording: boolean;
  isThinking: boolean;
  isAiSpeaking: boolean;
  userTranscript: string;
  interimText: string;
  targetLevel: string;
  targetWords: string[];
  capturedWords: string[];
  whisperPrompt: string;
  onCycleWhisper: () => void;
  onSelectWhisper: (phrase: string) => void;
  toggleRecording: () => void;
  onPlayMentorSpeech: () => void;
  onSendMessage: (text?: string) => void;
  setUserTranscript: (val: string) => void;
}

// Akıcı Canlı Frekans Dalga Formu
function NeonWaveform({ active }: { active: boolean }) {
  const bars = [14, 28, 48, 24, 62, 36, 70, 30, 52, 22, 40, 18];
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 h-12 px-2">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
            active
              ? "bg-gradient-to-t from-emerald-500 via-teal-400 to-indigo-400 animate-pulse"
              : "bg-slate-800/80"
          }`}
          style={{
            height: active
              ? `${Math.max(15, height * (i % 2 === 0 ? 1 : 0.7))}%`
              : "20%",
            animationDelay: `${i * 65}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function SpeakingCenterStage({
  latestMentorMessage,
  latestUserMessage,
  followUpQuestion,
  isRecording,
  isThinking,
  isAiSpeaking,
  userTranscript,
  interimText,
  targetLevel,
  targetWords,
  capturedWords,
  whisperPrompt,
  onCycleWhisper,
  onSelectWhisper,
  toggleRecording,
  onPlayMentorSpeech,
  onSendMessage,
  setUserTranscript,
}: SpeakingCenterStageProps) {
  const [showWhisper, setShowWhisper] = useState(false);

  // Doğal Kesme (Barge-in): Kullanıcı konuşurken veya kelime yakalandığında yapay zeka sesini kes
  useEffect(() => {
    if ((isRecording || interimText.trim() || userTranscript.trim()) && isAiSpeaking) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isRecording, interimText, userTranscript, isAiSpeaking]);

  return (
    <div className="flex-1 flex flex-col justify-between space-y-6 my-auto w-full">
      {/* 1. ÜST MERKEZ: AI DİYALOG KARTI */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl p-6 sm:p-7 relative backdrop-blur-md transition-all hover:border-slate-750">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAiSpeaking
                  ? "bg-emerald-400 animate-ping shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                  : isThinking
                  ? "bg-indigo-400 animate-spin"
                  : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
              }`}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              {isAiSpeaking ? "AI Konuşuyor..." : isThinking ? "Düşünüyor..." : "AI Mentor Sorusu"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {targetLevel} Odak
            </span>
          </div>

          <button
            type="button"
            onClick={onPlayMentorSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isAiSpeaking
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                : "bg-slate-950/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white"
            }`}
            title="Soruyu Sesli Dinle"
          >
            {isAiSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium hidden sm:inline">Durdur</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-medium hidden sm:inline">Dinle</span>
              </>
            )}
          </button>
        </div>

        {/* AI Sorusu Metni */}
        <p className="text-lg sm:text-2xl font-medium text-slate-100 leading-relaxed font-sans">
          {latestMentorMessage || "Hello! Ready to practice speaking?"}
        </p>

        {/* Dinamik Takip Sorusu (Varsa ve farklıysa) */}
        {followUpQuestion && followUpQuestion !== latestMentorMessage && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
              <span className="font-semibold text-amber-300 not-italic">Takip Sorusu: </span>
              {followUpQuestion}
            </p>
          </div>
        )}
      </div>

      {/* 2. ORTA MERKEZ: KULLANICI TRANSKRİPTİ */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl p-6 sm:p-7 relative backdrop-blur-md transition-all hover:border-slate-750">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRecording
                  ? "bg-emerald-400 animate-ping shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                  : "bg-indigo-400/60"
              }`}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isRecording ? "Konuşmanız Algılanıyor..." : "Senin Cevabın"}
            </span>
          </div>

          {isRecording && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Canlı Web Speech API
            </span>
          )}
        </div>

        {/* Canlı dökülen sesli metin (indigo / zümrüt neon vurgusu) */}
        <div className="min-h-[72px] flex items-center">
          {isRecording ? (
            <p className="text-base sm:text-xl font-medium text-emerald-300 leading-relaxed drop-shadow-[0_0_12px_rgba(52,211,153,0.3)] animate-pulse">
              {userTranscript || interimText || "Konuşmaya başlayın, sesiniz anında dökülüyor..."}
            </p>
          ) : latestUserMessage ? (
            <p className="text-base sm:text-xl text-slate-200 leading-relaxed">
              {latestUserMessage}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Henüz bir cevap vermediniz. Konuşmaya başlamak için aşağıdaki mikrofona dokunun.
            </p>
          )}
        </div>

        {/* Hızlı Yazılı Gönderim Alanı */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/60"
        >
          <input
            type="text"
            value={userTranscript}
            onChange={(e) => setUserTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Dilerseniz buraya yazarak da cevap verebilirsiniz..."
            disabled={isThinking}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500/60 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
          />
          <button
            type="submit"
            disabled={(!userTranscript.trim() && !interimText.trim()) || isThinking}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <span>Gönder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 3. ALT MERKEZ: BÜYÜK MİKROFON, WAVEFORM, KELİME AVCISI & FISILTI KOÇU */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-lg">
          {/* Sol Waveform Frekans Barları */}
          <div className="flex-1 flex justify-end">
            <NeonWaveform active={isRecording || isAiSpeaking} />
          </div>

          {/* Merkezde Büyük Yuvarlak Parlayan Mikrofon Butonu */}
          <div className="relative group shrink-0">
            <div
              className={`absolute -inset-3.5 rounded-full transition duration-500 ${
                isRecording
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-90 blur-xl animate-pulse"
                  : "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-40 blur-md group-hover:opacity-75"
              }`}
            />
            <button
              type="button"
              data-testid="tap-to-speak-mic-btn"
              onClick={toggleRecording}
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all duration-300 cursor-pointer shadow-2xl ${
                isRecording
                  ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-slate-950 ring-4 ring-emerald-300/80 scale-105 shadow-[0_0_35px_rgba(52,211,153,0.6)]"
                  : "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-2 border-emerald-500/50 text-white hover:border-emerald-400 hover:scale-102 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]"
              }`}
              title={isRecording ? "Kaydı Durdur ve Gönder" : "Bas ve Konuş"}
            >
              <Mic
                className={`w-8 h-8 mb-1.5 transition-transform ${
                  isRecording ? "text-slate-950 animate-bounce scale-110" : "text-emerald-400 group-hover:scale-110"
                }`}
              />
              <span className="text-[10px] sm:text-[11px] tracking-wider font-black uppercase text-center px-1">
                {isRecording ? "Dinliyor" : "TAP TO SPEAK"}
              </span>
            </button>
          </div>

          {/* Sağ Waveform Frekans Barları */}
          <div className="flex-1 flex justify-start">
            <NeonWaveform active={isRecording || isAiSpeaking} />
          </div>
        </div>

        {/* 🎯 GÖRÜNMEZ KELİME AVCISI (Invisible Word Catcher): 3 Hedef Kelime Hapı */}
        {targetWords && targetWords.length > 0 && (
          <div className="flex items-center justify-center gap-2.5 mt-5 flex-wrap">
            {targetWords.slice(0, 3).map((word) => {
              const isCaptured = capturedWords.some(
                (c) => c.toLowerCase() === word.toLowerCase()
              );
              return (
                <div
                  key={word}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border transition-all duration-300 select-none ${
                    isCaptured
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/80 shadow-[0_0_14px_rgba(16,185,129,0.5)] scale-105 animate-in zoom-in-95"
                      : "bg-slate-900/80 text-slate-400 border-slate-800"
                  }`}
                  title={isCaptured ? `Tebrikler! "${word}" kelimesini kullandınız.` : `Hedef kelime: ${word}`}
                >
                  {isCaptured ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-in spin-in-90 duration-300" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                  <span>{word}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 💡 FISILTI KOÇU BUTONU & BALONU */}
        <div className="mt-4 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowWhisper((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border shadow-sm ${
              showWhisper
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60"
                : "bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-amber-300 border-slate-800 hover:border-amber-500/40"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>💡 Ne Diyebilirim? (Fısıltı Koçu)</span>
          </button>

          {showWhisper && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-top-1 text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <span>💡 Cümle Başlatıcı Kalıp ({targetLevel}):</span>
                <button
                  type="button"
                  onClick={() => setShowWhisper(false)}
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-slate-200 italic leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 font-medium">
                "{whisperPrompt}"
              </p>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onCycleWhisper}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Farklı bir kalıp fısılda ↻
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectWhisper(whisperPrompt);
                    setShowWhisper(false);
                  }}
                  className="text-[11px] font-semibold text-emerald-400 hover:underline cursor-pointer"
                >
                  Metne Ekle ✍️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
