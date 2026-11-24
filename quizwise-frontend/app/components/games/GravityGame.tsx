"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import { Flame, Heart, X, Zap, Target, Sparkles, Send, Volume2, VolumeX } from "lucide-react";
import GameOverScreen from "./GameOverScreen";
import RespawnModal from "./RespawnModal";
import MysteryChestModal, { MysteryReward } from "./MysteryChestModal";
import {
  calculateWordReward,
  shouldTriggerMysteryChest,
} from "../../utils/gamificationEngine";
import { GameMistakeItem } from "./GameOverSummary";
import StreakMilestoneBar from "./StreakMilestoneBar";
import { getEquippedMuseumBuff } from "../../data/museumItems";
import { playArenaSound } from "../../utils/soundEffects";
import { useLanguage } from "../../context/LanguageContext";

export interface GravityGameProps {
  cards: Array<{ word: string; meaning: string }>;
  deckTitle?: string;
  onClose: () => void;
  onAwardXP?: (xp: number, label: string) => void;
}

export default function GravityGame({
  cards,
  deckTitle,
  onClose,
  onAwardXP,
}: GravityGameProps) {
  const { t } = useLanguage();
  const resolvedDeckTitle = deckTitle || t("game_default_deck", "Genel Deste");
  const equippedBuff = useMemo(() => getEquippedMuseumBuff(), []);
  const initialLives = equippedBuff?.type === "extra_life" ? 4 : 3;
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [asteroidY, setAsteroidY] = useState(10); // 10% dan 88% e doğru kayar
  const [lives, setLives] = useState(initialLives);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [streak, setStreak] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [isImpact, setIsImpact] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isRespawnOpen, setIsRespawnOpen] = useState(false);
  const [hasRespawned, setHasRespawned] = useState(false);
  const [isMysteryOpen, setIsMysteryOpen] = useState(false);
  const [mysteryBuff, setMysteryBuff] = useState(1.0);
  const [mysteryBuffCount, setMysteryBuffCount] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<GameMistakeItem[]>([]);
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

    // Hız: dalgaya göre artar (+2s ekstra süre buff'ı varsa daha yavaş iner)
    const speedInterval = Math.max(25, 60 - wave * 4) + (equippedBuff?.type === "extra_time" ? 14 : 0);

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

    setStreak(0);
    playArenaSound("wrong", soundEnabled);

    // 5 Saniyelik Hata Telafisi için kaydet
    if (activeCard) {
      setSessionMistakes((prev) => {
        if (prev.some((m) => m.word.toLowerCase() === activeCard.word.toLowerCase())) return prev;
        return [...prev, { word: activeCard.word, meaning: activeCard.meaning }];
      });
    }

    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      if (nextLives <= 0) {
        // Can bitti: Sıfır Eleme Kurtarma Odası açılır (önceden kurtarılmadıysa)
        if (!hasRespawned) {
          setTimeout(() => setIsRespawnOpen(true), 400);
        } else {
          setTimeout(() => setGameOver(true), 600);
        }
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

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak % 5 === 0) {
        playArenaSound("milestone", soundEnabled);
      } else {
        playArenaSound("correct", soundEnabled);
      }

      // Ortak Oyunlaştırma Motoru: Azalan verim, CEFR & Kombo Çarpanı
      const reward = calculateWordReward({
        word: activeCard.word,
        streak: nextStreak,
        isCorrect: true,
        activeBuffMultiplier: mysteryBuff,
      });

      if (mysteryBuffCount > 0) {
        const nextRem = mysteryBuffCount - 1;
        setMysteryBuffCount(nextRem);
        if (nextRem <= 0) setMysteryBuff(1.0);
      }

      setScore((s) => s + reward.totalXP + wave * 10);

      // Her 3 doğru seride 3 Gizemli Sandık Aç
      if (shouldTriggerMysteryChest(nextStreak)) {
        setTimeout(() => setIsMysteryOpen(true), 400);
      }

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
    setStreak(0);
    setCurrentIdx(0);
    setAsteroidY(10);
    setIsExploding(false);
    setIsImpact(false);
    setGameOver(false);
    setHasRespawned(false);
    setSessionMistakes([]);
    setTypedInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#dce3ec] text-slate-900 dark:bg-slate-950 dark:text-slate-100 px-3 sm:px-6 py-3 sm:py-6 overflow-y-auto overflow-x-hidden pb-28 select-none">
      {/* 1. Üst Panel: Canlar, Skor, Dalga ve Çıkış */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-2 pb-3 border-b border-slate-300 dark:border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-600/20 dark:text-rose-400 dark:border-rose-500/30 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">{t("game_gravity_title", "Yerçekimi Savunması (Gravity)")}</h2>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium truncate">{resolvedDeckTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* 3 Can Göstergesi (❤️ ❤️ ❤️) */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 shrink-0">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
                  heartIndex <= lives
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "fill-slate-300 text-slate-400 dark:fill-slate-800 dark:text-slate-700 opacity-40 scale-90"
                }`}
              />
            ))}
          </div>

          {/* Skor & Dalga */}
          <div className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
            <span>{score} {t("game_points_unit", "Puan")}</span>
            <span>•</span>
            <span>{t("game_wave_n", "Dalga {n}", { n: wave })}</span>
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
      <div className="max-w-4xl mx-auto w-full pt-2.5 shrink-0">
        <StreakMilestoneBar streak={streak} />
      </div>

      {/* 2. Uzay Savunma Arenası (Kayan Kelime Asteroidi) */}
      <div className="max-w-4xl mx-auto w-full h-[34vh] sm:h-[420px] shrink-0 relative my-3 sm:my-4 rounded-3xl bg-slate-900/90 border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Arka plan ızgarası */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Tabandaki Kırmızı Tehlike Sınırı */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-rose-950/40 via-rose-900/10 to-transparent border-t-2 border-dashed border-rose-500/30 flex items-center justify-center">
          <span className="text-[11px] font-mono tracking-widest text-rose-400/80 font-bold uppercase">
            {t("game_gravity_base", "⚡ SAVUNMA TABAN HATTI ⚡")}
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
        <form onSubmit={handleFormSubmit} className="w-full flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            autoFocus
            disabled={gameOver || isExploding}
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={t("game_gravity_input_ph_short", "Anlamını yaz...")}
            className="min-w-0 flex-1 bg-white dark:bg-slate-900 border-2 border-indigo-500/50 focus:border-indigo-400 rounded-2xl px-3.5 sm:px-5 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium"
          />

          <button
            type="submit"
            disabled={!typedInput.trim() || gameOver || isExploding}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer shrink-0"
          >
            <span>{t("game_gravity_blast", "Patlat")}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Hızlı Tıklanabilir İpucu Hapı */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] leading-tight text-slate-600 dark:text-slate-400 px-1">
          <span className="leading-tight">
            {t("game_gravity_hint", "İpucu: Anlamın bir parçasını yazabilirsiniz.")}
          </span>
          <button
            type="button"
            onClick={() => handleCheckExplode(activeCard.meaning)}
            className="text-amber-800 font-semibold dark:text-amber-400 hover:underline cursor-pointer shrink-0"
          >
            {t("game_gravity_solve", "Anlamı Çöz:")} {activeCard.meaning}
          </button>
        </div>
      </div>

      {/* 4. Oyun Bitiş Ekranı (5 Saniyelik Hata Telafisi ile) */}
      {gameOver && (
        <GameOverScreen
          gameTitle={t("game_gravity_over_title", "☄️ Yerçekimi Savunması")}
          deckTitle={resolvedDeckTitle}
          score={score}
          awardedXP={Math.max(50, score)}
          awardedGold={Math.max(20, Math.round(score * 0.4))}
          streakCount={streak}
          mistakes={sessionMistakes}
          onPlayAgain={resetGame}
          onBackToArena={onClose}
        />
      )}

      {/* 5. Sıfır Eleme / Kurtarma Odası (Respawn Engine) */}
      <RespawnModal
        isOpen={isRespawnOpen}
        cards={cards}
        onRespawn={() => {
          setIsRespawnOpen(false);
          setHasRespawned(true);
          setLives(1);
          setIsImpact(false);
          setAsteroidY(10);
          setTypedInput("");
          setCurrentIdx((idx) => (idx + 1) % cards.length);
        }}
        onGiveUp={() => {
          setIsRespawnOpen(false);
          setGameOver(true);
        }}
      />

      {/* 6. 3 Kapalı Gizemli Sandık Modalı (Pedagojik Kayıpsız) */}
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
