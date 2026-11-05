"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Flame,
  Swords,
  Shield,
  Zap,
  Trophy,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Key,
  Coins,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import GameOverScreen from "./GameOverScreen";
import ClassroomPodiumModal from "./ClassroomPodiumModal";

export interface BossFightGameProps {
  cards: Array<{ word: string; meaning: string; phonetic?: string }>;
  deckTitle?: string;
  onClose: () => void;
  onAwardXP?: (amount: number, label?: string) => void;
  onAwardGold?: (amount: number) => void;
}

interface DamageIndicator {
  id: string;
  text: string;
  isCrit: boolean;
}

// Web Audio API Retro Arcade Darbe ve Zafer Sesleri (Sıfır Dış Ağ Gecikmesi)
const playSoundEffect = (type: "hit" | "crit" | "boss_attack" | "victory") => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "hit") {
      // Kılıç Darbesi
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === "crit") {
      // Kritik Vuruş
      [480, 720, 1100].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.04 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.18);
      });
    } else if (type === "boss_attack") {
      // Ejderha Alev Kükremesi
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "victory") {
      // Zafer Fanfarı
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    }
  } catch (e) {
    // Ses desteklenmiyorsa sessizce devam et
  }
};

export default function BossFightGame({
  cards,
  deckTitle = "Genel Deste",
  onClose,
  onAwardXP,
  onAwardGold,
}: BossFightGameProps) {
  const MAX_BOSS_HP = 1000;
  const [bossHp, setBossHp] = useState(MAX_BOSS_HP);
  const [playerScore, setPlayerScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [bossState, setBossState] = useState<"idle" | "hit" | "attack">("idle");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [damageIndicators, setDamageIndicators] = useState<DamageIndicator[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isVictory, setIsVictory] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);

  // Aktif soru kartı
  const activeCard = cards[currentRound % cards.length] || {
    word: "mitigate",
    meaning: "Hafifletmek, etkisini azaltmak",
    phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
  };

  // 4 seçenek (1 doğru, 3 çeldirici)
  const options = useMemo(() => {
    const correct = activeCard.meaning;
    const others = cards
      .filter((c) => c.meaning !== correct)
      .map((c) => c.meaning);

    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return all;
  }, [currentRound, cards, activeCard.meaning]);

  // Uçan Hasar Sayısı Tetikleyici
  const triggerDamage = (text: string, isCrit: boolean) => {
    const id = `dmg_${Date.now()}_${Math.random()}`;
    setDamageIndicators((prev) => [...prev, { id, text, isCrit }]);
    setTimeout(() => {
      setDamageIndicators((prev) => prev.filter((d) => d.id !== id));
    }, 900);
  };

  // Cevap Verme İşlemi
  const handleAnswer = (optionText: string, index: number) => {
    if (feedback !== null || bossHp <= 0) return;
    setAnsweredIndex(index);

    const isCorrect = optionText === activeCard.meaning;

    if (isCorrect) {
      // DOĞRU CEVAP
      setFeedback("correct");
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      const isCrit = nextCombo >= 3;
      const dmg = isCrit ? 220 : 100;

      if (soundEnabled) {
        playSoundEffect(isCrit ? "crit" : "hit");
      }

      // Ejderha darbe animasyonu
      setBossState("hit");
      setTimeout(() => setBossState("idle"), 450);

      // Hasar yazısı
      triggerDamage(isCrit ? `💥 KRİTİK -${dmg} HP!` : `-${dmg} HP`, isCrit);

      setPlayerScore((prev) => prev + (isCrit ? 250 : 100));

      // Boss Canı Düşür
      setBossHp((prev) => {
        const nextHp = Math.max(0, prev - dmg);
        if (nextHp === 0) {
          setTimeout(() => handleVictory(), 600);
        }
        return nextHp;
      });

      // Sıradaki Soru
      setTimeout(() => {
        setFeedback(null);
        setAnsweredIndex(null);
        setCurrentRound((prev) => prev + 1);
      }, 700);
    } else {
      // YANLIŞ CEVAP - EJDERHA KARŞI SALDIRISI!
      setFeedback("wrong");
      setCombo(0);

      if (soundEnabled) {
        playSoundEffect("boss_attack");
      }

      setBossState("attack");
      setTimeout(() => setBossState("idle"), 600);

      triggerDamage("ISKALANDI! 🔥", false);

      // Sıradaki Soru
      setTimeout(() => {
        setFeedback(null);
        setAnsweredIndex(null);
        setCurrentRound((prev) => prev + 1);
      }, 900);
    }
  };

  // Zafer Durumu
  const handleVictory = () => {
    setIsVictory(true);
    if (soundEnabled) {
      playSoundEffect("victory");
    }
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    if (onAwardXP) {
      onAwardXP(250, "Ejderha Baskını Zaferi");
    }
    if (onAwardGold) {
      onAwardGold(150);
    }
  };

  // Yeniden Başlat
  const handlePlayAgain = () => {
    setBossHp(MAX_BOSS_HP);
    setPlayerScore(0);
    setCombo(0);
    setCurrentRound(0);
    setBossState("idle");
    setFeedback(null);
    setIsVictory(false);
  };

  const hpPercent = Math.max(0, Math.round((bossHp / MAX_BOSS_HP) * 100));

  if (isVictory) {
    return (
      <>
        <GameOverScreen
          gameTitle="🐉 Ejderha Baskını: Zafer!"
          deckTitle={deckTitle}
          score={playerScore}
          accuracyPercent={Math.round((maxCombo / Math.max(1, currentRound + 1)) * 100)}
          awardedXP={250}
          awardedGold={150}
          streakCount={maxCombo}
          onPlayAgain={handlePlayAgain}
          onBackToArena={onClose}
          onViewPodium={() => setShowPodium(true)}
        />

        {showPodium && (
          <ClassroomPodiumModal
            isOpen={showPodium}
            onClose={() => {
              setShowPodium(false);
              onClose();
            }}
            sessionId={`boss-${Date.now()}`}
            gameTitle="🐉 Ejderha Baskını (Boss Fight)"
            currentUserRank={1}
            currentUserName="Sen (Ejderha Avcısı)"
          />
        )}
      </>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden select-none ${bossState === "attack" ? "bg-rose-950/20" : ""}`}>
      {/* Arka Plan Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-rose-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. ÜST HEADER: ÇIKIŞ, DESTE BAŞLIĞI, SKOR & SES                            */}
      {/* ========================================================================= */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/80">
        <button
          onClick={onClose}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>Arenaya Dön</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
            {deckTitle}
          </span>
          <span className="text-xs font-black text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono">
            {playerScore} Skor
          </span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. ORTA SAVAŞ ALANI: ANTİK EJDERHA, CAN BARI VE HASAR SAYILARI              */}
      {/* ========================================================================= */}
      <main className="w-full max-w-4xl mx-auto px-4 py-3 flex-1 flex flex-col items-center justify-center text-center relative">
        {/* Uçan Hasar Sayıları */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
          {damageIndicators.map((dmg) => (
            <div
              key={dmg.id}
              className={`animate-bounce text-2xl sm:text-4xl font-black drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] ${
                dmg.isCrit
                  ? "text-amber-300 scale-125"
                  : dmg.text.includes("ISKALANDI")
                  ? "text-rose-400 text-xl"
                  : "text-white"
              }`}
            >
              {dmg.text}
            </div>
          ))}
        </div>

        {/* Ejderha Görseli (Hafif Vektörel SVG & CSS Animasyonu) */}
        <div
          className={`relative transition-transform duration-300 ${
            bossState === "hit"
              ? "scale-90 rotate-2 brightness-150 filter"
              : bossState === "attack"
              ? "scale-110 -rotate-2"
              : "scale-100"
          }`}
        >
          {/* Alev Efekti (Attack Modunda) */}
          {bossState === "attack" && (
            <div className="absolute -inset-4 bg-rose-500/30 rounded-full blur-2xl animate-pulse pointer-events-none" />
          )}

          {/* Vektörel Ejderha Rozeti */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-br from-rose-950/70 via-purple-950/80 to-slate-900 border-2 border-rose-500/40 flex items-center justify-center shadow-2xl shadow-rose-950/60 relative overflow-hidden backdrop-blur-md">
            {/* Arka Plan Alev Parıltısı */}
            <div className="absolute inset-0 bg-gradient-to-t from-rose-600/20 via-transparent to-transparent" />

            {/* Vektörel Ejderha İllüstrasyonu */}
            <svg
              className="w-24 h-24 sm:w-28 sm:h-28 text-rose-400 drop-shadow-[0_8px_16px_rgba(244,63,94,0.4)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 5 2.5 6.5L4 22l3.5-.5C9 22.5 10.5 23 12 23c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
              <path d="M8 10h.01M16 10h.01" strokeWidth="3" />
              <path d="M12 14c-1.5 0-3 .5-3 1.5s1.5 1.5 3 1.5 3-.5 3-1.5-1.5-1.5-3-1.5z" />
              <path d="M6 3l2 4M18 3l-2 4M2 12l3-1M22 12l-3-1" />
            </svg>

            {/* Alev İkonu */}
            <div className="absolute bottom-2 right-2">
              <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Ejderha Adı & Ünvanı */}
        <div className="mt-3 space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              🐉 Antik Volkanik Ejderha Ignis
            </h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              BOSS
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Magma ve kül efendisi hazineyi savunuyor!</p>
        </div>

        {/* DEV CAN BARI */}
        <div className="w-full max-w-md mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-rose-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Can: {bossHp} / {MAX_BOSS_HP} HP
            </span>
            <span className={hpPercent > 50 ? "text-emerald-400" : hpPercent > 25 ? "text-amber-400" : "text-rose-400"}>
              %{hpPercent}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden shadow-inner p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                hpPercent > 50
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : hpPercent > 25
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                  : "bg-gradient-to-r from-rose-600 to-red-500"
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Kombo Rozeti */}
        {combo > 1 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-amber-300 animate-pulse">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>{combo}x Kombo Çarpanı!</span>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. ALT SALDIRI PANELİ: KELİME SORUSU VE 4 SEÇENEK                           */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-2xl mx-auto px-4 pb-6 space-y-3">
        {/* Hedef Kelime */}
        <div className="text-center py-2 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Saldırı Kelimesi
          </span>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeCard.word}
            </h3>
            {activeCard.phonetic && (
              <span className="text-xs text-indigo-400 font-mono">
                {activeCard.phonetic}
              </span>
            )}
          </div>
        </div>

        {/* 4 Şık */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((option, idx) => {
            const isSelected = answeredIndex === idx;
            const isCorrectOption = option === activeCard.meaning;

            let btnStyle = "bg-slate-900 border-slate-800 text-slate-200 hover:border-rose-500/50 hover:bg-slate-800/80";

            if (feedback !== null) {
              if (isCorrectOption) {
                btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/20";
              } else if (isSelected && !isCorrectOption) {
                btnStyle = "bg-rose-600/30 border-rose-500 text-rose-200 shadow-lg shadow-rose-500/20";
              } else {
                btnStyle = "bg-slate-900/50 border-slate-800 text-slate-500 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={feedback !== null}
                onClick={() => handleAnswer(option, idx)}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold text-left transition-all active:scale-95 flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <span className="truncate">{option}</span>
                <span className="text-[10px] font-mono opacity-40 ml-2">
                  {String.fromCharCode(65 + idx)}
                </span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

