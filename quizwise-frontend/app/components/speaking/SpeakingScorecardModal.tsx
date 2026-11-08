"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Archive,
  CheckCircle2,
  Award,
} from "lucide-react";

export interface SpeakingScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLevel: string;
  scorecard: {
    fluency_score: number;
    jargon_score: number;
    grammar_feedback?: string | null;
    better_alternative: string;
    improvement_suggestion?: string;
  };
  capturedWords: string[];
  targetWords: string[];
  sessionTitle?: string;
  onOpenArchive: () => void;
  onResetSession: () => void;
  onPlaySpeech: (text: string) => void;
}

export default function SpeakingScorecardModal({
  isOpen,
  onClose,
  targetLevel,
  scorecard,
  capturedWords,
  targetWords,
  sessionTitle,
  onOpenArchive,
  onResetSession,
  onPlaySpeech,
}: SpeakingScorecardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fluency = scorecard.fluency_score || 85;
  const vocabulary = scorecard.jargon_score || 82;
  const grammar = scorecard.grammar_feedback ? 78 : 92;
  const overall = Math.round((fluency + vocabulary + grammar) / 3);

  const handleCopy = () => {
    if (scorecard.better_alternative) {
      navigator.clipboard.writeText(scorecard.better_alternative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-6 text-slate-100 my-auto">
        {/* Başlık ve Kapat */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Oturum Sonu Konuşma Karnesi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {targetLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {sessionTitle || "Harika bir pratik oturumu tamamladınız"} (+30 XP).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4'lü Skor Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
              Genel Uyum
            </span>
            <span className="text-2xl font-black text-white font-mono">{overall}</span>
            <span className="text-[10px] text-indigo-300 block">/ 100</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Akıcılık
            </span>
            <span className="text-2xl font-black text-white font-mono">{fluency}</span>
            <span className="text-[10px] text-emerald-300 block">/ 100</span>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
              Kelime
            </span>
            <span className="text-2xl font-black text-white font-mono">{vocabulary}</span>
            <span className="text-[10px] text-cyan-300 block">/ 100</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              Dilbilgisi
            </span>
            <span className="text-2xl font-black text-white font-mono">{grammar}</span>
            <span className="text-[10px] text-amber-300 block">/ 100</span>
          </div>
        </div>

        {/* 🎯 Yakalanan Hedef Kelimeler Rozetleri */}
        {targetWords && targetWords.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>🎯 Yakalanan Hedef Kelimeler ({capturedWords.length}/{targetWords.length})</span>
              <span className="text-emerald-400 font-mono">
                {Math.round((capturedWords.length / targetWords.length) * 100)}% Başarı
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {targetWords.map((word) => {
                const isCaptured = capturedWords.some(
                  (c) => c.toLowerCase() === word.toLowerCase()
                );
                return (
                  <span
                    key={word}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono border transition ${
                      isCaptured
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        : "bg-slate-900 text-slate-500 border-slate-800"
                    }`}
                  >
                    {isCaptured ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    )}
                    <span>{word}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 💎 ALTIN CÜMLE (Executive Phrasing) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/40 border border-indigo-500/30 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>💎 Altın Cümle (Executive Phrasing)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPlaySpeech(scorecard.better_alternative)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
                title="Altın Cümleyi Dinle"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dinle</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
                title="Panoya Kopyala"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Bunu yerel / kurumsal bir konuşmacı gibi şöyle ifade edebilirdin:
          </p>

          <p className="text-sm font-medium text-emerald-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-emerald-500/20 shadow-inner">
            "{scorecard.better_alternative || 'We strategically prioritized critical path activities to mitigate schedule and cost variances.'}"
          </p>

          {scorecard.improvement_suggestion && (
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              💡 <span className="font-semibold text-slate-300">Geri Bildirim:</span>{" "}
              {scorecard.improvement_suggestion}
            </p>
          )}
        </div>

        {/* Modal Alt Butonları */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenArchive();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>🗂️ Tüm Konuşma Arşivimi Aç</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onResetSession();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeni Oturum Başlat</span>
          </button>
        </div>
      </div>
    </div>
  );
}

