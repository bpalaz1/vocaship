"use client";

import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, X, RotateCcw, Check, HelpCircle, ArrowRight, Volume2 } from "lucide-react";
import GameOverScreen from "./GameOverScreen";
import MysteryChestModal, { MysteryReward } from "./MysteryChestModal";
import { saveArenaMistake } from "../../utils/arenaMistakes";
import {
  calculateWordReward,
  shouldTriggerMysteryChest,
} from "../../utils/gamificationEngine";
import { GameMistakeItem } from "./GameOverSummary";

export interface WordScrambleGameProps {
  cards: Array<{ word: string; meaning: string; phonetic?: string }>;
  deckTitle?: string;
  onClose: () => void;
  onAwardXP?: (xp: number, label: string) => void;
  onAwardGold?: (gold: number) => void;
}

export default function WordScrambleGame({
  cards,
  deckTitle = "Genel Deste",
  onClose,
  onAwardXP,
  onAwardGold,
}: WordScrambleGameProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isMysteryOpen, setIsMysteryOpen] = useState(false);
  const [mysteryBuff, setMysteryBuff] = useState(1.0);
  const [mysteryBuffCount, setMysteryBuffCount] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<GameMistakeItem[]>([]);

  const totalRounds = Math.min(8, Math.max(4, cards.length));
  const activeCard = cards[currentRound % cards.length] || {
    word: "mitigate",
    meaning: "Hafifletmek, etkisini azaltmak",
  };

  const targetWordUpper = activeCard.word.trim().toUpperCase();

  // Harfleri karıştır
  const scrambledLetters = useMemo(() => {
    const letters = targetWordUpper.split("");
    // Basit deterministik veya rastgele karıştırma (orijinalinden farklı olmalı)
    let shuffled = [...letters];
    let attempts = 0;
    while (attempts < 5 && shuffled.join("") === targetWordUpper && letters.length > 1) {
      shuffled = shuffled.sort(() => 0.5 - Math.random());
      attempts++;
    }
    return shuffled;
  }, [currentRound, targetWordUpper]);

  // Klavyeden harf girişini dinle
  useEffect(() => {
    if (gameOver || isAnswered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        setSelectedIndices((prev) => prev.slice(0, -1));
        setIsWrong(false);
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        const char = e.key.toUpperCase();
        // Henüz seçilmemiş indeksler arasında bu harfi ara
        const availableIdx = scrambledLetters.findIndex(
          (letter, idx) => letter === char && !selectedIndices.includes(idx)
        );
        if (availableIdx !== -1) {
          handleSelectLetter(availableIdx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, isAnswered, scrambledLetters, selectedIndices]);

  const handleSelectLetter = (idx: number) => {
    if (selectedIndices.includes(idx) || isAnswered) return;
    const next = [...selectedIndices, idx];
    setSelectedIndices(next);
    setIsWrong(false);

    // Eğer tüm harfler seçildiyse doğruluğu kontrol et
    if (next.length === scrambledLetters.length) {
      const spelled = next.map((i) => scrambledLetters[i]).join("");
      if (spelled === targetWordUpper) {
        // DOĞRU
        setIsAnswered(true);
        const nextStreak = streak + 1;
        setStreak(nextStreak);

        // Ortak Oyunlaştırma Motoru: Azalan verim, CEFR & Kombo Çarpanı
        const reward = calculateWordReward({
          word: activeCard.word,
          streak: nextStreak,
          isCorrect: true,
          isFinalQuestion: currentRound + 1 >= totalRounds,
          activeBuffMultiplier: mysteryBuff,
        });

        if (mysteryBuffCount > 0) {
          const nextRem = mysteryBuffCount - 1;
          setMysteryBuffCount(nextRem);
          if (nextRem <= 0) setMysteryBuff(1.0);
        }

        setScore((prev) => prev + reward.totalXP);
        confetti({ particleCount: 40, spread: 60 });
        if (onAwardXP) onAwardXP(reward.totalXP, "Harf Avı Doğru Kelime");
        if (onAwardGold) onAwardGold(reward.totalGold);

        // Her 3 doğru seride 3 Gizemli Sandık Aç
        if (shouldTriggerMysteryChest(nextStreak)) {
          setTimeout(() => setIsMysteryOpen(true), 400);
        }

        setTimeout(() => {
          if (currentRound + 1 >= totalRounds) {
            setGameOver(true);
          } else {
            setCurrentRound((prev) => prev + 1);
            setSelectedIndices([]);
            setIsAnswered(false);
            setHintRevealed(false);
          }
        }, 1200);
      } else {
        // YANLIŞ
        setIsWrong(true);
        setStreak(0);

        if (activeCard) {
          setSessionMistakes((prev) => {
            if (prev.some((m) => m.word.toLowerCase() === activeCard.word.toLowerCase())) return prev;
            return [
              ...prev,
              { word: activeCard.word, meaning: activeCard.meaning, phonetic: activeCard.phonetic },
            ];
          });

          saveArenaMistake({
            word: activeCard.word,
            meaning: activeCard.meaning,
            phonetic: activeCard.phonetic,
            gameType: "word_scramble",
          });
        }

        setTimeout(() => {
          setSelectedIndices([]);
          setIsWrong(false);
        }, 800);
      }
    }
  };

  const handleRemoveLetter = (selectedIndexToRemove: number) => {
    if (isAnswered) return;
    setSelectedIndices((prev) => prev.filter((_, i) => i !== selectedIndexToRemove));
    setIsWrong(false);
  };

  const currentSpelled = selectedIndices.map((i) => scrambledLetters[i]).join("");

  if (gameOver) {
    return (
      <GameOverScreen
        gameTitle="🔤 Harf Avı (Word Scramble)"
        deckTitle={deckTitle}
        score={score}
        awardedXP={Math.max(50, score)}
        awardedGold={Math.max(20, Math.round(score * 0.4))}
        streakCount={streak}
        mistakes={sessionMistakes}
        onPlayAgain={() => {
          setCurrentRound(0);
          setScore(0);
          setStreak(0);
          setSelectedIndices([]);
          setIsAnswered(false);
          setGameOver(false);
          setHintRevealed(false);
          setSessionMistakes([]);
        }}
        onBackToArena={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-slate-100 p-4 sm:p-6 select-none animate-in fade-in">
      {/* Üst Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            🔤
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Harf Avı (Word Scramble)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {deckTitle} • Kelime {currentRound + 1} / {totalRounds}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{score} Puan</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Oyundan Çık"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Orta Çalışma Sahnesi */}
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col items-center justify-center py-6 space-y-8">
        {/* Anlam / İpucu Kartı */}
        <div className="w-full p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-2 shadow-2xl">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            Türkçe Anlamı & Tanım
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            "{activeCard.meaning}"
          </h3>
          {hintRevealed && activeCard.phonetic && (
            <p className="text-xs font-mono text-slate-400">
              Telaffuz: {activeCard.phonetic}
            </p>
          )}
        </div>

        {/* Dizilen Harfler (Cevap Yuvası) */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[64px]">
            {targetWordUpper.split("").map((_, i) => {
              const letter = currentSpelled[i] || "";
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (letter) handleRemoveLetter(i);
                  }}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black font-mono transition-all cursor-pointer ${
                    isAnswered
                      ? "bg-emerald-600 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-600/40"
                      : isWrong
                      ? "bg-rose-950 text-rose-300 border-2 border-rose-500 animate-shake"
                      : letter
                      ? "bg-indigo-600 text-white border-2 border-indigo-400 shadow-md shadow-indigo-600/30"
                      : "bg-slate-900 border-2 border-dashed border-slate-700 text-slate-600"
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>

          <span className="text-xs text-slate-500">
            Harfleri tıklayarak veya klavyenizden yazarak dizin
          </span>
        </div>

        {/* Karışık Harf Butonları */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg">
          {scrambledLetters.map((letter, idx) => {
            const isUsed = selectedIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                disabled={isUsed || isAnswered}
                onClick={() => handleSelectLetter(idx)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-lg sm:text-xl font-black font-mono flex items-center justify-center transition-all cursor-pointer ${
                  isUsed
                    ? "opacity-25 bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed scale-95"
                    : "bg-slate-900 hover:bg-emerald-600/30 border-2 border-slate-700 hover:border-emerald-400 text-white shadow-md active:scale-95"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alt Kontrol & İpucu */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => setSelectedIndices([])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sıfırla</span>
        </button>

        <button
          type="button"
          onClick={() => setHintRevealed(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>İpucu Göster</span>
        </button>
      </div>

      {/* 3 Kapalı Gizemli Sandık Modalı (Pedagojik Kayıpsız) */}
      <MysteryChestModal
        isOpen={isMysteryOpen}
        streak={streak}
        onClose={() => setIsMysteryOpen(false)}
        onClaimReward={(reward: MysteryReward) => {
          if (reward.multiplier) {
            setMysteryBuff(reward.multiplier);
            setMysteryBuffCount(reward.buffQuestions || 3);
          }
        }}
      />
    </div>
  );
}
