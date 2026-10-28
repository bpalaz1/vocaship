"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Flame, Heart, X, Zap, Target, Sparkles, Send } from "lucide-react";
import GameOverScreen from "./GameOverScreen";

export interface GravityGameProps {
  cards: Array<{ word: string; meaning: string }>;
  deckTitle?: string;
  onClose: () => void;
  onAwardXP?: (xp: number, label: string) => void;
}

export default function GravityGame({
  cards,
  deckTitle = "Genel Deste",
  onClose,
  onAwardXP,
}: GravityGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [asteroidY, setAsteroidY] = useState(10); // 10% dan 88% e doğru kayar
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [isExploding, setIsExploding] = useState(false);
  const [isImpact, setIsImpact] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [typedInput, setTypedInput] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeCard = cards[currentIdx % cards.length] || {
    word: "resilient",
    meaning: "Dirençli, esnek",
  };

  // Yerçekimi döngüsü (Gravity loop)
  useEffect(() => {
    if (gameOver || isExploding || isImpact) return;

    // Hız: dalgaya göre artar
    const speedInterval = Math.max(25, 60 - wave * 4);

    loopTimerRef.current = setInterval(() => {
      setAsteroidY((prevY) => {
        if (prevY >= 82) {
          // Tabana çarptı! Can kaybı
          handleAsteroidImpact();
          return 10;
        }
        return prevY + 1.2;
      });
    }, speedInterval);

    return () => {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    };
  }, [currentIdx, wave, gameOver, isExploding, isImpact]);

  // Tabana çarpma hadisesi
  const handleAsteroidImpact = () => {
    setIsImpact(true);
    if (loopTimerRef.current) clearInterval(loopTimerRef.current);

    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      if (nextLives <= 0) {
        setTimeout(() => setGameOver(true), 600);
      } else {
        setTimeout(() => {
          setIsImpact(false);
          setAsteroidY(10);
          setTypedInput("");
          setCurrentIdx((idx) => (idx + 1) % cards.length);
        }, 700);
      }
      return nextLives;
    });
  };

  // Doğru yazıldığında patlat
  const handleCheckExplode = (inputToCheck?: string) => {
    const input = (inputToCheck || typedInput).trim().toLowerCase();
    if (!input) return;

    const targetMeaning = activeCard.meaning.toLowerCase();
    const meaningTokens = targetMeaning
      .split(/[,;/\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2);

    // Eşleşme kontrolü (Tam anlam veya anahtar kelime eşleşmesi)
    const isMatched =
      targetMeaning.includes(input) ||
      meaningTokens.some((t) => input.includes(t) || t.includes(input));

    if (isMatched) {
      // PATLAMA EFEKTİ!
      setIsExploding(true);
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: Math.min(0.8, asteroidY / 100) },
      });

      setScore((s) => s + 100 + wave * 20);

      setTimeout(() => {
        setIsExploding(false);
        setAsteroidY(10);
        setTypedInput("");
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);

        // Her 4 kelimede bir dalga artar
        if (nextIdx % 4 === 0) {
          setWave((w) => w + 1);
        }
      }, 550);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckExplode();
  };

  // Oyunu Sıfırla
  const resetGame = () => {
    setLives(3);
    setScore(0);
    setWave(1);
    setCurrentIdx(0);
    setAsteroidY(10);
    setIsExploding(false);
    setIsImpact(false);
    setGameOver(false);
    setTypedInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-hidden select-none">
      {/* 1. Üst Panel: Canlar, Skor, Dalga ve Çıkış */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Yerçekimi Savunması (Gravity)</h2>
            <p className="text-xs text-slate-400 font-medium">{deckTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 3 Can Göstergesi (❤️ ❤️ ❤️) */}
          <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-4 h-4 transition-transform duration-300 ${
                  heartIndex <= lives
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "fill-slate-800 text-slate-700 opacity-40 scale-90"
                }`}
              />
            ))}
          </div>

          {/* Skor & Dalga */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-400">
            {score} Puan • Dalga {wave}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Uzay Savunma Arenası (Kayan Kelime Asteroidi) */}
      <div className="max-w-4xl mx-auto w-full flex-1 relative my-4 rounded-3xl bg-slate-900/60 border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Arka plan ızgarası */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Tabandaki Kırmızı Tehlike Sınırı */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-rose-950/40 via-rose-900/10 to-transparent border-t-2 border-dashed border-rose-500/30 flex items-center justify-center">
          <span className="text-[11px] font-mono tracking-widest text-rose-400/80 font-bold uppercase">
            ⚡ SAVUNMA TABAN HATTI ⚡
          </span>
        </div>

        {/* DÜŞEN KELİME ASTEROİDİ */}
        {!gameOver && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 transition-all duration-75 flex flex-col items-center ${
              isExploding
                ? "scale-150 opacity-0 transition-all duration-300"
                : isImpact
                ? "animate-bounce ring-4 ring-rose-500 rounded-3xl"
                : ""
            }`}
            style={{ top: `${asteroidY}%` }}
          >
            <div className="px-6 py-3.5 rounded-3xl bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600 p-[2px] shadow-2xl shadow-rose-500/25">
              <div className="px-5 py-2.5 rounded-[22px] bg-slate-950/95 flex items-center space-x-2.5">
                <Target className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-base sm:text-xl font-black text-white font-mono tracking-wider">
                  {activeCard.word}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Alt Giriş Konsolu (Yazıp Patlatma) */}
      <div className="max-w-2xl mx-auto w-full shrink-0 space-y-2">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            autoFocus
            disabled={gameOver || isExploding}
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Yukarıdaki kelimenin Türkçe anlamını yazıp Enter'a basın..."
            className="flex-1 bg-slate-900 border-2 border-indigo-500/50 focus:border-indigo-400 rounded-2xl px-5 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium"
          />

          <button
            type="submit"
            disabled={!typedInput.trim() || gameOver || isExploding}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
          >
            <span>Patlat</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Hızlı Tıklanabilir İpucu Hapı */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>
            İpucu: Anlamın bir parçasını yazabilirsiniz.
          </span>
          <button
            type="button"
            onClick={() => handleCheckExplode(activeCard.meaning)}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            Anlamı Çöz: {activeCard.meaning}
          </button>
        </div>
      </div>

      {/* 4. Oyun Bitiş Ekranı */}
      {gameOver && (
        <GameOverScreen
          gameTitle="Yerçekimi Savunması (Gravity)"
          deckTitle={deckTitle}
          score={score}
          awardedXP={90}
          awardedGold={40}
          streakCount={wave}
          onPlayAgain={resetGame}
          onBackToArena={onClose}
        />
      )}
    </div>
  );
}
