"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import { Zap, Clock, X, Trophy, Flame, Check, AlertCircle, Volume2, VolumeX } from "lucide-react";
import GameOverScreen from "./GameOverScreen";
import MysteryChestModal, { MysteryReward } from "./MysteryChestModal";
import { saveArenaMistake } from "../../utils/arenaMistakes";
import {
  calculateWordReward,
  shouldTriggerMysteryChest,
} from "../../utils/gamificationEngine";
import { GameMistakeItem } from "./GameOverSummary";
import StreakMilestoneBar from "./StreakMilestoneBar";
import { getEquippedMuseumBuff } from "../../data/museumItems";
import { playArenaSound } from "../../utils/soundEffects";
import { useLanguage } from "../../context/LanguageContext";

export interface SpeedRecallGameProps {
  cards: Array<{ word: string; meaning: string }>;
  deckTitle?: string;
  onClose: () => void;
  onAwardXP?: (xp: number, label: string) => void;
  timeLimit?: number;
}

export default function SpeedRecallGame({
  cards,
  deckTitle,
  onClose,
  onAwardXP,
  timeLimit = 6,
}: SpeedRecallGameProps) {
  const { t } = useLanguage();
  const resolvedDeckTitle = deckTitle || t("game_default_deck", "Genel Deste");
  const equippedBuff = useMemo(() => getEquippedMuseumBuff(), []);
  const roundTimeLimit = Math.max(3, timeLimit) + (equippedBuff?.type === "extra_time" ? 2 : 0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [timer, setTimer] = useState(roundTimeLimit);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Ortak Oyunlaştırma & Gizemli Sandık & Hata Takibi
  const [isMysteryOpen, setIsMysteryOpen] = useState(false);
  const [mysteryBuff, setMysteryBuff] = useState(1.0);
  const [mysteryBuffCount, setMysteryBuffCount] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<GameMistakeItem[]>([]);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = Math.min(10, Math.max(5, cards.length));
  const activeCard = cards[currentRound % cards.length] || {
    word: "mitigate",
    meaning: "Hafifletmek, etkisini azaltmak",
  };

  // 4 seçenek oluştur (1 doğru, 3 çeldirici)
  const options = useMemo(() => {
    const correct = activeCard.meaning;
    const others = cards
      .filter((c) => c.meaning !== correct)
      .map((c) => c.meaning);

    // Çeldiricileri karıştır ve 3 tanesini al
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return all;
  }, [currentRound, cards]);

  // Dinamik saniye zamanlayıcı
  useEffect(() => {
    if (gameOver || isAnswered) return;

    setTimer(roundTimeLimit);
    countdownRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Süre bitti! Yanlış say
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [currentRound, gameOver, isAnswered, roundTimeLimit]);

  const handleTimeout = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIsAnswered(true);
    setCombo(0);

    if (activeCard) {
      setSessionMistakes((prev) => {
        if (prev.some((m) => m.word.toLowerCase() === activeCard.word.toLowerCase())) return prev;
        return [...prev, { word: activeCard.word, meaning: activeCard.meaning }];
      });

      saveArenaMistake({
        word: activeCard.word,
        meaning: activeCard.meaning,
        gameType: "speed_recall",
      });
    }

    setTimeout(() => {
      advanceRound();
    }, 900);
  };

  // Klavye Kısayolları (1-2-3-4)
  useEffect(() => {
    if (isAnswered || gameOver || isMysteryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx !== -1 && options[idx]) {
        e.preventDefault();
        handleSelectOption(options[idx]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnswered, gameOver, isMysteryOpen, options]);

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    if (countdownRef.current) clearInterval(countdownRef.current);

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === activeCard.meaning;
    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCorrectCount((c) => c + 1);

      if (nextCombo > 0 && nextCombo % 5 === 0) {
        playArenaSound("milestone", soundEnabled);
      } else {
        playArenaSound("correct", soundEnabled);
      }

      // Ortak Oyunlaştırma Motoru: Azalan verim, CEFR & Kombo Çarpanı
      const reward = calculateWordReward({
        word: activeCard.word,
        streak: nextCombo,
        isCorrect: true,
        isFinalQuestion: currentRound + 1 >= totalRounds,
        activeBuffMultiplier: mysteryBuff,
      });

      if (mysteryBuffCount > 0) {
        const nextC = mysteryBuffCount - 1;
        setMysteryBuffCount(nextC);
        if (nextC <= 0) setMysteryBuff(1.0);
      }

      setScore((s) => s + reward.totalXP);

      if (nextCombo >= 3) {
        confetti({ particleCount: 25, spread: 40 });
      }

      // Her 3 doğru seride 3 Gizemli Sandık Aç
      if (shouldTriggerMysteryChest(nextCombo)) {
        setTimeout(() => setIsMysteryOpen(true), 400);
      }
    } else {
      setCombo(0);
      playArenaSound("wrong", soundEnabled);
      if (activeCard) {
        setSessionMistakes((prev) => {
          if (prev.some((m) => m.word.toLowerCase() === activeCard.word.toLowerCase())) return prev;
          return [...prev, { word: activeCard.word, meaning: activeCard.meaning }];
        });

        saveArenaMistake({
          word: activeCard.word,
          meaning: activeCard.meaning,
          gameType: "speed_recall",
        });
      }
    }

    setTimeout(() => {
      advanceRound();
    }, 900);
  };

  // Klavye Kısayolları (1-2-3-4)
  useEffect(() => {
    if (isAnswered || gameOver || isMysteryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx !== -1 && options[idx]) {
        e.preventDefault();
        handleSelectOption(options[idx]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnswered, gameOver, isMysteryOpen, options]);

  const advanceRound = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentRound + 1 >= totalRounds) {
      setGameOver(true);
    } else {
      setCurrentRound((r) => r + 1);
    }
  };

  const resetGame = () => {
    setCurrentRound(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameOver(false);
    setSessionMistakes([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      {/* 1. Üst Bar: Zamanlayıcı, Skor, Kombo, Çıkış */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">{t("game_speed_recall_hdr", "{s}s Hızlı Kombo (Speed Recall)", { s: roundTimeLimit })}</h2>
            <p className="text-xs text-slate-400 font-medium">{resolvedDeckTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Kombo Sayacı */}
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-300 font-bold text-xs animate-bounce">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("game_combo_x", "{n}x Kombo!", { n: combo })}</span>
            </div>
          )}

          {/* Skor */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-yellow-400">
            {score} {t("game_points_unit", "Puan")}
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title={soundEnabled ? t("game_sound_off", "Sesi Kapat") : t("game_sound_on", "Sesi Aç")}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 5 Kademeli Seri Çubuğu (0/5 -> 5/5) */}
      <div className="max-w-2xl mx-auto w-full pt-3">
        <StreakMilestoneBar streak={combo} />
      </div>

      {/* 2. Merkez Oyun Kartı */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center py-6 space-y-6">
        {/* 5 Saniyelik Nabız Çemberi */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-mono text-slate-400">
            {t("game_round_of", "Tur {cur} / {total}", { cur: currentRound + 1, total: totalRounds })}
          </span>

          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black font-mono text-lg transition-all ${
              timer <= 2
                ? "border-rose-500 text-rose-400 bg-rose-500/10 animate-ping"
                : "border-purple-500 text-purple-300 bg-purple-500/10"
            }`}
          >
            {timer}
          </div>
        </div>

        {/* Hedef Kelime Kartı */}
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-indigo-500/30 shadow-2xl text-center space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
            {t("game_target_word_lbl", "Hedef Kelime:")}
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wide">
            {activeCard.word}
          </h3>
        </div>

        {/* 4 Çoktan Seçmeli Seçenek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt, i) => {
            const isCorrect = opt === activeCard.meaning;
            const isSelected = selectedOption === opt;

            let btnStyle = "bg-slate-900/90 border-slate-800 hover:border-indigo-500 text-slate-200";

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40";
              } else if (isSelected) {
                btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/40";
              } else {
                btnStyle = "bg-slate-950/60 border-slate-800 text-slate-600 opacity-40";
              }
            }

            return (
              <button
                key={i}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold text-left transition-all duration-200 cursor-pointer shadow-md flex items-center justify-between gap-2 ${btnStyle}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950/90 text-indigo-300 border border-slate-700 shrink-0 font-bold">
                    [{i + 1}]
                  </span>
                  <span className="truncate">{opt}</span>
                </div>
                {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Oyun Sonu Ekranı (5 Saniyelik Hata Telafisi ile) */}
      {gameOver && (
        <GameOverScreen
          gameTitle={t("game_speed_over_title", "⚡ Hızlı Kombo")}
          deckTitle={resolvedDeckTitle}
          score={score}
          accuracyPercent={Math.round((correctCount / totalRounds) * 100)}
          awardedXP={Math.max(40, score)}
          awardedGold={Math.max(15, Math.round(score * 0.35))}
          streakCount={maxCombo}
          mistakes={sessionMistakes}
          onPlayAgain={resetGame}
          onBackToArena={onClose}
        />
      )}

      {/* 4. 3 Kapalı Gizemli Sandık Modalı (Pedagojik Kayıpsız) */}
      <MysteryChestModal
        isOpen={isMysteryOpen}
        streak={combo}
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
