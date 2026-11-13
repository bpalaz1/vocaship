"use client";

import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Flame,
  Swords,
  Shield,
  Zap,
  Trophy,
  X,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import GameOverScreen from "./GameOverScreen";
import ClassroomPodiumModal from "./ClassroomPodiumModal";
import MysteryChestModal, { MysteryReward } from "./MysteryChestModal";
import RespawnModal from "./RespawnModal";
import { saveArenaMistake } from "../../utils/arenaMistakes";
import {
  calculateWordReward,
  shouldTriggerMysteryChest,
  awardGamificationReward,
} from "../../utils/gamificationEngine";
import { GameMistakeItem } from "./GameOverSummary";

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

  // Sıfır Eleme (Respawn), Gizemli Sandık ve Oyunlaştırma State'leri
  const [playerLives, setPlayerLives] = useState(3);
  const [isRespawnOpen, setIsRespawnOpen] = useState(false);
  const [hasRespawned, setHasRespawned] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);
  const [isMysteryOpen, setIsMysteryOpen] = useState(false);
  const [mysteryBuff, setMysteryBuff] = useState(1.0);
  const [mysteryBuffCount, setMysteryBuffCount] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<GameMistakeItem[]>([]);

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

  // Uçan Hasar Sayısı Tetikleyici (Floating Damage Numbers)
  const triggerDamage = (text: string, isCrit: boolean) => {
    const id = `dmg_${Date.now()}_${Math.random()}`;
    setDamageIndicators((prev) => [...prev, { id, text, isCrit }]);
    setTimeout(() => {
      setDamageIndicators((prev) => prev.filter((d) => d.id !== id));
    }, 1100);
  };

  // Cevap Verme İşlemi
  const handleAnswer = (optionText: string, index: number) => {
    if (feedback !== null || bossHp <= 0 || playerLives <= 0) return;
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

      // Ortak Oyunlaştırma Motoru: Azalan verim, CEFR & Kombo Çarpanı
      const reward = calculateWordReward({
        word: activeCard.word,
        streak: nextCombo,
        isCorrect: true,
        activeBuffMultiplier: mysteryBuff,
      });

      if (mysteryBuffCount > 0) {
        const nextRem = mysteryBuffCount - 1;
        setMysteryBuffCount(nextRem);
        if (nextRem <= 0) setMysteryBuff(1.0);
      }

      if (soundEnabled) {
        playSoundEffect(isCrit ? "crit" : "hit");
      }

      // Ejderha darbe animasyonu (350ms darbe sarsıntısı & parlama)
      setBossState("hit");
      setTimeout(() => setBossState("idle"), 350);

      // Uçan hasar yazısı (-100 HP! 💥 veya -220 HP KRİTİK! 🔥)
      triggerDamage(isCrit ? `💥 -${dmg} HP CRIT!` : `-${dmg} HP! 💥`, isCrit);

      setPlayerScore((prev) => prev + (isCrit ? reward.totalXP * 1.5 : reward.totalXP));

      // Her 3 doğru seride 3 Gizemli Sandık Aç
      if (shouldTriggerMysteryChest(nextCombo)) {
        setTimeout(() => setIsMysteryOpen(true), 400);
      }

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

      // 5 Saniyelik Hata Telafisi için kaydet
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
          gameType: "boss_fight",
        });
      }

      // Can Azaltma & Sıfır Eleme (Respawn)
      setPlayerLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          if (!hasRespawned) {
            setTimeout(() => setIsRespawnOpen(true), 400);
          } else {
            setTimeout(() => setIsDefeated(true), 600);
          }
        }
        return Math.max(0, nextLives);
      });

      if (soundEnabled) {
        playSoundEffect("boss_attack");
      }

      setBossState("attack");
      setTimeout(() => setBossState("idle"), 500);

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
    setIsDefeated(false);
    setPlayerLives(3);
    setHasRespawned(false);
    setSessionMistakes([]);
  };

  const hpPercent = Math.max(0, Math.round((bossHp / MAX_BOSS_HP) * 100));

  if (isVictory || isDefeated) {
    return (
      <>
        <GameOverScreen
          gameTitle={isVictory ? "🐉 Ejderha Baskını: Zafer!" : "🐉 Ejderha Baskını: Mücadele Tamamlandı"}
          deckTitle={deckTitle}
          score={playerScore}
          accuracyPercent={Math.round((maxCombo / Math.max(1, currentRound + 1)) * 100)}
          awardedXP={isVictory ? 250 : Math.max(40, playerScore)}
          awardedGold={isVictory ? 150 : 30}
          streakCount={maxCombo}
          mistakes={sessionMistakes}
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
    <div className={`fixed inset-0 z-50 bg-[#0B0F19] text-slate-100 flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 ${bossState === "attack" ? "bg-rose-950/30" : ""}`}>
      {/* Özel RPG Animasyon Stilleri */}
      <style jsx>{`
        @keyframes dragonFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }
        @keyframes hitShakeEffect {
          0%, 100% {
            transform: translateX(0);
            filter: brightness(1.7) saturate(1.8) drop-shadow(0 0 25px rgba(244, 63, 94, 0.8));
          }
          20% {
            transform: translateX(-10px) rotate(-2deg);
          }
          40% {
            transform: translateX(10px) rotate(2deg);
          }
          60% {
            transform: translateX(-6px) rotate(-1deg);
          }
          80% {
            transform: translateX(6px) rotate(1deg);
          }
        }
        @keyframes damageFloatAnim {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.85);
          }
          20% {
            opacity: 1;
            transform: translateY(-5px) scale(1.25);
          }
          80% {
            opacity: 1;
            transform: translateY(-35px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.9);
          }
        }
        .animate-dragon-idle {
          animation: dragonFloat 4s ease-in-out infinite;
        }
        .animate-dragon-hit {
          animation: hitShakeEffect 0.35s ease-in-out;
        }
        .animate-damage-float {
          animation: damageFloatAnim 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      {/* Arka Plan Atmosferik Kırmızı Parıltı */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-rose-600/15 via-red-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. ÜST HEADER: ÇIKIŞ, DESTE BAŞLIĞI, SKOR & SES                            */}
      {/* ========================================================================= */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition active:scale-95 cursor-pointer shadow-sm"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>Arenaya Dön</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Oyuncu Canları (❤️) */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-rose-400">
            <span>{"❤️".repeat(Math.max(0, playerLives)) || "💔"}</span>
            <span className="text-[10px] text-slate-400">({playerLives})</span>
          </div>

          {mysteryBuff > 1 && (
            <span className="text-[10px] font-black text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg animate-pulse">
              ⚡ {mysteryBuff}x ({mysteryBuffCount})
            </span>
          )}

          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl hidden sm:inline">
            {deckTitle}
          </span>
          <span className="text-xs font-black text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono">
            {playerScore} Skor
          </span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer shadow-sm"
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
      {/* 2. ORTA SAVAŞ ALANI: EPİK SİNEMATİK BOSS SAHNESİ, CAN BARI VE HASAR SAYISI */}
      {/* ========================================================================= */}
      <main className="w-full max-w-4xl mx-auto px-4 py-2 flex-1 flex flex-col items-center justify-center text-center relative gap-3">
        {/* Sahne Çerçevesi (Stage Container) */}
        <div className="w-full max-w-md h-56 mx-auto relative flex items-center justify-center rounded-3xl overflow-hidden bg-slate-900/80 border border-rose-500/30 backdrop-blur-md shadow-[0_0_40px_rgba(244,63,94,0.2)]">
          {/* Arkasında Hafif Kızıl-Kehribar Ortam Parıltısı */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(225,29,72,0.25) 0%, rgba(245,158,11,0.1) 40%, transparent 70%)",
            }}
          />

          {/* Uçan Hasar Sayıları (Floating Damage Numbers) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40">
            {damageIndicators.map((dmg) => (
              <div
                key={dmg.id}
                className={`animate-damage-float font-black tracking-wider drop-shadow-[0_4px_16px_rgba(0,0,0,1)] ${
                  dmg.isCrit
                    ? "text-amber-300 text-3xl sm:text-4xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                    : dmg.text.includes("ISKALANDI")
                    ? "text-rose-400 text-xl font-bold"
                    : "text-rose-200 text-2xl sm:text-3xl"
                }`}
              >
                {dmg.text}
              </div>
            ))}
          </div>

          {/* Boss Görseli (Idle Süzülme ve Hit Sarsıntı Efekti) */}
          <div
            className={`relative z-10 w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center transition-all ${
              bossState === "hit"
                ? "animate-dragon-hit"
                : bossState === "attack"
                ? "scale-110 brightness-125"
                : "animate-dragon-idle"
            }`}
          >
            {/* Gerçek Ejderha Görseli */}
            <img
              src="/bosses/dragon_ignis.png"
              alt="Antik Volkanik Ejderha Ignis"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(225,29,72,0.45)]"
              onError={(e) => {
                // Fallback: Yüksek kaliteli şık SVG illüstrasyonu
                (e.target as HTMLImageElement).style.display = "none";
                const fallbackEl = document.getElementById("boss-svg-fallback");
                if (fallbackEl) fallbackEl.style.display = "block";
              }}
            />

            {/* SVG Fallback (Görsel gecikirse veya yüklenemezse devreye girer) */}
            <div id="boss-svg-fallback" style={{ display: "none" }} className="w-full h-full">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full filter drop-shadow-[0_8px_20px_rgba(244,63,94,0.5)]"
              >
                <circle cx="100" cy="100" r="80" fill="#1e1017" stroke="#e11d48" strokeWidth="2" />
                <path d="M40 70 Q 100 20 160 70 Q 100 120 40 70 Z" fill="#9f1239" />
                <polygon points="100,50 85,90 115,90" fill="#fbbf24" />
                <polygon points="75,85 85,100 80,105" fill="#f59e0b" />
                <polygon points="125,85 115,100 120,105" fill="#f59e0b" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ejderha Adı & Ünvanı */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              🐉 Antik Volkanik Ejderha Ignis
            </h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              BOSS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Magma ve kül efendisi hazineyi savunuyor!
          </p>
        </div>

        {/* DİNAMİK LAV CAN BARI (HP BAR) */}
        <div className="w-full max-w-md mx-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-rose-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Can: {bossHp} / {MAX_BOSS_HP} HP</span>
            </span>
            <span className="text-amber-300 font-black">%{hpPercent}</span>
          </div>
          <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 transition-all duration-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Kombo Rozeti */}
        {combo > 1 && (
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 animate-pulse bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>{combo}x Kombo Çarpanı!</span>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. ALT SALDIRI PANELİ: KELİME SORUSU VE 4 SEÇENEK                           */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-2xl mx-auto px-4 pb-6 space-y-3 shrink-0">
        {/* Hedef Kelime (Antrasit RPG Saldırı Kartı) */}
        <div className="text-center py-4 px-6 rounded-3xl bg-slate-950/95 border-2 border-rose-500/50 backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.85)] ring-1 ring-rose-500/30">
          <span className="inline-block text-[11px] uppercase font-black tracking-widest text-amber-400 font-mono bg-rose-950/60 px-3 py-0.5 rounded-full border border-amber-500/30 shadow-sm">
            ⚔️ SALDIRI KELİMESİ
          </span>
          <div className="flex items-center justify-center gap-3 mt-1.5">
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-wide drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]">
              {activeCard.word}
            </h3>
            {activeCard.phonetic && (
              <span className="text-xs text-indigo-300 font-mono font-bold bg-indigo-950/70 px-2.5 py-1 rounded-lg border border-indigo-500/40 shadow-sm">
                {activeCard.phonetic}
              </span>
            )}
          </div>
        </div>

        {/* 4 Şık (A, B, C, D Anlık Geri Bildirimli Butonlar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((option, idx) => {
            const isSelected = answeredIndex === idx;
            const isCorrectOption = option === activeCard.meaning;

            let btnStyle =
              "bg-slate-900 border-slate-800 text-slate-200 hover:border-rose-500/50 hover:bg-slate-800/80 shadow-md";

            if (feedback !== null) {
              if (isCorrectOption) {
                btnStyle =
                  "bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400";
              } else if (isSelected && !isCorrectOption) {
                btnStyle =
                  "bg-rose-600/30 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)] ring-1 ring-rose-400 animate-shake";
              } else {
                btnStyle = "bg-slate-900/50 border-slate-800 text-slate-500 opacity-40";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={feedback !== null}
                onClick={() => handleAnswer(option, idx)}
                className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-bold text-left transition-all active:scale-95 flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <span className="truncate mr-2">{option}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-400 border border-slate-800 shrink-0 font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
              </button>
            );
          })}
        </div>
      </footer>

      {/* Sıfır Eleme Kurtarma Odası (Respawn Modal) */}
      <RespawnModal
        isOpen={isRespawnOpen}
        cards={cards}
        onRespawn={() => {
          setIsRespawnOpen(false);
          setHasRespawned(true);
          setPlayerLives(1);
          setFeedback(null);
          setAnsweredIndex(null);
        }}
        onGiveUp={() => {
          setIsRespawnOpen(false);
          setIsDefeated(true);
        }}
      />

      {/* 3 Kapalı Gizemli Sandık Modalı (Pedagojik Kayıpsız) */}
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
