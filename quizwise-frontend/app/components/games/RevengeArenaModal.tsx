"use client";

import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Target,
  Swords,
  Flame,
  CheckCircle2,
  X,
  Sparkles,
  Trophy,
  RotateCcw,
  Zap,
  Check,
  ArrowRight,
  Shield,
  Heart,
} from "lucide-react";
import {
  getArenaMistakes,
  removeArenaMistake,
  ArenaMistakeItem,
} from "../../utils/arenaMistakes";

export interface RevengeArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardXP?: (amount: number, label: string) => void;
}

const DISTRACTOR_WORDS = [
  "Hafifletmek, etkisini azaltmak",
  "Tahsis etmek, paylaştırmak",
  "Farklılık, sapma, ayrılık",
  "Dirençli, esnek, çabuk toparlanan",
  "Uygulanabilirlik, fizibilite",
  "Beklenmedik durum, ihtiyat",
  "Kapsam, faaliyet alanı",
  "Kolaylaştırmak, hızlandırmak",
];

export default function RevengeArenaModal({
  isOpen,
  onClose,
  onAwardXP,
}: RevengeArenaModalProps) {
  const [mistakes, setMistakes] = useState<ArenaMistakeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [clearedWordsCount, setClearedWordsCount] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Hataları Yükle
  useEffect(() => {
    if (isOpen) {
      const list = getArenaMistakes();
      setMistakes(list);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setClearedWordsCount(0);
      setIsSessionComplete(false);
    }
  }, [isOpen]);

  // Maksimum 5 Soruluk Mini Oturum
  const sessionQueue = useMemo(() => {
    return mistakes.slice(0, 5);
  }, [mistakes]);

  const currentMistake = sessionQueue[currentIndex];

  // 4 Seçenek Üret
  const options = useMemo(() => {
    if (!currentMistake) return [];

    const correct =
      currentMistake.meanings?.[0]?.translation ||
      currentMistake.meanings?.[0]?.definition ||
      "Doğru Anlam";

    const otherMeanings = mistakes
      .filter((m) => m.id !== currentMistake.id)
      .map((m) => m.meanings?.[0]?.translation || m.meanings?.[0]?.definition || "")
      .filter(Boolean);

    const pool = [...otherMeanings, ...DISTRACTOR_WORDS].filter((m) => m !== correct);
    const shuffledOthers = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

    return [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentMistake, mistakes]);

  // Ses Efekti
  const playSound = (type: "correct" | "wrong" | "victory") => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "correct") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "victory") {
        [523, 659, 783, 1046].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
        });
      }
    } catch {}
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentMistake) return;

    setSelectedAnswer(opt);
    setIsAnswered(true);

    const correct =
      currentMistake.meanings?.[0]?.translation ||
      currentMistake.meanings?.[0]?.definition;

    const isCorrect = opt === correct;

    if (isCorrect) {
      playSound("correct");
      // Kelimeyi Unutma Destesinden Kalıcı Sil
      removeArenaMistake(currentMistake.word);
      setClearedWordsCount((c) => c + 1);

      // +25 Telafi XP
      if (onAwardXP) {
        onAwardXP(25, `İntikam Telafisi: ${currentMistake.word}`);
      }

      setTimeout(() => {
        advanceNext();
      }, 700);
    } else {
      setTimeout(() => {
        advanceNext();
      }, 900);
    }
  };

  const advanceNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (currentIndex + 1 >= sessionQueue.length) {
      setIsSessionComplete(true);
      playSound("victory");
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      } catch {}
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  if (!isOpen) return null;

  // DURUM 1: HİÇ HATA YOK (TEMİZ DURUM)
  if (mistakes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-white">
              Harika Gidiyorsun! 🎯
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Şu an temizlenmesi gereken bir hata kelimesi yok. Tüm geçmiş oyunlardaki
              kelimeleri başarıyla öğrendin!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Arenaya Dön
          </button>
        </div>
      </div>
    );
  }

  // DURUM 2: 5 SORULUK MİNİ OTURUM TAMAMLANDI
  if (isSessionComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-white">
              🎯 Telafi Seansı Tamamlandı!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              <strong className="text-emerald-400">{clearedWordsCount} kelime</strong>{" "}
              hafızana geri kazandırıldı ve Unutma Destesi'nden temizlendi.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 font-mono text-sm font-black text-amber-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>+{clearedWordsCount * 25} Telafi XP Kazandın!</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
          >
            Tamamla ve Arenaya Dön ➔
          </button>
        </div>
      </div>
    );
  }

  // DURUM 3: CANLI TELAFİ DÜELLOSU
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-rose-500/40 p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Üst Bar: Başlık, İlerleme, Çıkış */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>🎯 İntikam Arenası</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {mistakes.length} Hata
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Soru {currentIndex + 1} / {sessionQueue.length} • Doğru bilinen hata listesinden silinir (+25 XP)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aktif Hata Kelimesi */}
        {currentMistake && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
              Daha Önce Yanlış Yapılan Kelime
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wide">
              {currentMistake.word}
            </h4>
            {currentMistake.phonetic && (
              <p className="text-xs text-slate-400 font-mono">{currentMistake.phonetic}</p>
            )}
          </div>
        )}

        {/* 4 Şık */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect =
              currentMistake &&
              (opt === currentMistake.meanings?.[0]?.translation ||
                opt === currentMistake.meanings?.[0]?.definition);

            let btnStyle = "bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200";

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-black shadow-md shadow-emerald-500/20";
              } else if (isSelected) {
                btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold text-left transition-all cursor-pointer ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Alt Bilgi */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Doğru bilinen kelimeler hafızadan silinir</span>
          </span>
          <span className="font-mono text-emerald-400 font-bold">
            Temizlenen: {clearedWordsCount}
          </span>
        </div>
      </div>
    </div>
  );
}

