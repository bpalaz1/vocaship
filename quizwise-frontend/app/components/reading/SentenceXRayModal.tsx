"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Volume2,
  Mic,
  Layers,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Info,
} from "lucide-react";
import {
  decompileSentence,
  DecompiledSentence,
  DecompiledComponent,
} from "../../utils/sentenceDecompiler";
import { playNeuralTTS, stopSpeech } from "../../utils/tts";

export interface SentenceXRayModalProps {
  sentence: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenShadowing?: (sentence: string) => void;
}

export default function SentenceXRayModal({
  sentence,
  isOpen,
  onClose,
  onOpenShadowing,
}: SentenceXRayModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Cümleyi X-Ray sözdizim motoruyla ayrıştır
  const decompiled: DecompiledSentence = useMemo(() => {
    return decompileSentence(sentence || "");
  }, [sentence]);

  // Sesli okuma - Edge-TTS Nöral Ses Motoru
  const handlePlaySentence = () => {
    if (!sentence) return;
    setIsPlayingAudio(true);
    playNeuralTTS(sentence, {
      rate: 0.85,
      voice: "en-US-JennyNeural",
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="X-Ray Cümle Röntgeni"
      className="fixed bottom-24 right-4 sm:right-8 z-50 w-[calc(100%-2rem)] sm:w-[520px] max-h-[78vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="relative w-full max-h-[78vh] bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-cyan-500/20 backdrop-blur-2xl text-slate-100">
        {/* ============================================================== */}
        {/* 1. ÜST BAŞLIK VE KONTROLLER                                    */}
        {/* ============================================================== */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
              <span className="text-sm leading-none">🔬</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">
                  X-Ray Cümle Röntgeni
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  DECOMPILER
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Gramer iskeletini ve ögelerini renk bloklarıyla keşfedin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2. GÖVDE: RENKLİ SÖZDİZİM VE BİLEŞEN KARTLARI                   */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* RENK LEJANTI (COLOR LEGEND) */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className="bg-blue-950/60 border border-blue-500/40 text-blue-200 px-2.5 py-1 rounded-lg">
              🔵 Özne (Subject)
            </span>
            <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-2.5 py-1 rounded-lg">
              🟢 Yüklem (Verb Phrase)
            </span>
            <span className="bg-amber-950/60 border border-amber-500/40 text-amber-200 px-2.5 py-1 rounded-lg">
              🟡 Nesne (Object)
            </span>
            <span className="bg-purple-950/60 border border-purple-500/40 text-purple-200 px-2.5 py-1 rounded-lg">
              🟣 Zarf / Koşul (Adverbial)
            </span>
          </div>

          {/* İNTERAKTİF RENKLİ CÜMLE RÖNTGENİ GÖRÜNÜMÜ */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">
              Gramer Röntgeni (Sözdizim İskeleti):
            </span>

            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-semibold leading-relaxed">
              {decompiled.components.map((comp, idx) => (
                <span
                  key={idx}
                  className={`inline-block px-2.5 py-1 rounded-xl shadow-sm transition-all hover:scale-102 ${comp.badgeColorClass}`}
                  title={`${comp.titleTr}: ${comp.explanationTr}`}
                >
                  {comp.text}
                </span>
              ))}
            </div>

            {decompiled.structureFormula && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Formül:</span>
                <span className="text-cyan-300 font-bold">
                  {decompiled.structureFormula}
                </span>
              </div>
            )}
          </div>

          {/* DETAYLI ÖGE ÇÖZÜMLEME KARTLARI */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Öge Ayrıştırma & Açıklamalar</span>
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {decompiled.components.map((comp, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${comp.cardColorClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${comp.badgeColorClass}`}>
                      {comp.titleTr}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white mt-2 font-mono">
                    &ldquo;{comp.text}&rdquo;
                  </p>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {comp.explanationTr}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* TÜRKÇE MANTIKSAL İSKELET KARŞILAŞTIRMASI */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Türkçe Mantıksal Çeviri Akışı:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {decompiled.turkishSkeleton}
            </p>
            <p className="text-[11px] text-slate-400 italic">
              💡 İpucu: İngilizcede yüklem (Fiil) hemen özneden sonra gelirken (SVO), Türkçede yüklem cümlenin en sonuna taşınır (SOV).
            </p>
          </div>

          {/* BAĞLAÇLAR (VARSA) */}
          {decompiled.conjunctions.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Tespit Edilen Bağlaçlar:</span>
              <div className="flex items-center gap-1">
                {decompiled.conjunctions.map((conj, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold"
                  >
                    {conj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 3. ALT EYLEM ÇUBUĞU                                            */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePlaySentence}
            disabled={isPlayingAudio}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              isPlayingAudio
                ? "bg-indigo-600 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            <Volume2 className="w-4 h-4 text-indigo-300" />
            <span>{isPlayingAudio ? "Okunuyor..." : "Cümleyi Dinle"}</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenShadowing && (
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onClose();
                  onOpenShadowing(sentence);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Gölgele & Telaffuz Et</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

