"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Users,
  Heart,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import RespawnModal from "./RespawnModal";
import PostGameWeakWords from "./PostGameWeakWords";
import ClassroomPodiumModal from "./ClassroomPodiumModal";
import { saveArenaMistake } from "../../utils/arenaMistakes";

export interface CoopBossArenaProps {
  cards: Array<{ word: string; meaning: string; phonetic?: string }>;
  deckTitle?: string;
  className?: string;
  isHost?: boolean;
  isPaused?: boolean;
  onClose: () => void;
  onAwardXP?: (amount: number, label?: string) => void;
  onAwardGold?: (amount: number) => void;
}

interface DamageIndicator {
  id: string;
  text: string;
  isCrit: boolean;
  sender?: string;
}

interface ClassmateHitEvent {
  id: string;
  studentName: string;
  avatar: string;
  damage: number;
  isCrit: boolean;
  timestamp: number;
}

const CLASSMATE_NAMES = [
  { name: "Selin Y.", avatar: "🦊" },
  { name: "Kaan A.", avatar: "🦁" },
  { name: "Elif D.", avatar: "🦉" },
  { name: "Mert Ö.", avatar: "🐼" },
  { name: "Zeynep K.", avatar: "🐱" },
  { name: "Caner A.", avatar: "🐻" },
  { name: "Deniz K.", avatar: "🐯" },
  { name: "Ayşe Ç.", avatar: "🦅" },
  { name: "Oğuzhan T.", avatar: "🐸" },
  { name: "İrem Y.", avatar: "🦄" },
  { name: "Tolga E.", avatar: "🥷" },
  { name: "Burak V.", avatar: "🤖" },
];

const MAX_BOSS_HP = 10000;

// Web Audio API Retro Darbe & Zafer Sesleri
const playSoundEffect = (type: "hit" | "crit" | "boss_attack" | "victory") => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "hit") {
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
      [523, 659, 783, 1046].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
      });
    }
  } catch {}
};

export default function CoopBossArena({
  cards,
  deckTitle = "10-A Ortak Kelime Havuzu",
  className = "10-A İngilizce",
  isHost = false,
  isPaused = false,
  onClose,
  onAwardXP,
  onAwardGold,
}: CoopBossArenaProps) {
  // Canavar Durumu
  const [bossHp, setBossHp] = useState<number>(MAX_BOSS_HP);
  const [bossState, setBossState] = useState<"idle" | "hit" | "attack">("idle");
  const [damageIndicators, setDamageIndicators] = useState<DamageIndicator[]>([]);
  const [liveHits, setLiveHits] = useState<ClassmateHitEvent[]>([]);

  // Oyuncu Durumu
  const [playerDamageDealt, setPlayerDamageDealt] = useState(0);
  const [playerLives, setPlayerLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  // Modal Durumları
  const [isVictory, setIsVictory] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [isRespawnOpen, setIsRespawnOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Güvenli Soru Havuzu
  const safeCards = useMemo(() => {
    return cards && cards.length >= 4 ? cards : [
      { word: "mitigate", meaning: "Hafifletmek, etkisini azaltmak", phonetic: "/ˈmɪt.ɪ.ɡeɪt/" },
      { word: "allocate", meaning: "Tahsis etmek, paylaştırmak", phonetic: "/ˈæl.ə.keɪt/" },
      { word: "variance", meaning: "Farklılık, sapma, değişkenlik", phonetic: "/ˈveə.ri.əns/" },
      { word: "resilient", meaning: "Dirençli, esnek", phonetic: "/rɪˈzɪl.jənt/" },
      { word: "feasibility", meaning: "Uygulanabilirlik, fizibilite", phonetic: "/ˌfiː.zəˈbɪl.ə.ti/" },
      { word: "contingency", meaning: "Beklenmedik durum, ihtiyat", phonetic: "/kənˈtɪn.dʒən.si/" },
    ];
  }, [cards]);

  const activeCard = safeCards[currentRound % safeCards.length];

  // 4 Seçenek Üret
  const options = useMemo(() => {
    const correct = activeCard.meaning;
    const others = safeCards
      .filter((c) => c.meaning !== correct)
      .map((c) => c.meaning);

    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentRound, safeCards, activeCard]);

  // 1. Sınıftaki Diğer 29 Öğrencinin Canlı Saldırı Akışı (Simülatör)
  useEffect(() => {
    if (isVictory || isPaused || bossHp <= 0) return;

    const interval = setInterval(() => {
      // Rastgele bir sınıf arkadaşı darbe vurur
      const mate = CLASSMATE_NAMES[Math.floor(Math.random() * CLASSMATE_NAMES.length)];
      const isCrit = Math.random() > 0.75;
      const dmg = isCrit ? Math.floor(Math.random() * 80) + 120 : Math.floor(Math.random() * 50) + 50;

      // Canı azalt
      setBossHp((prev) => {
        const next = Math.max(0, prev - dmg);
        if (next === 0 && !isVictory) {
          handleVictory();
        }
        return next;
      });

      // Canlı Akışa Ekle
      setLiveHits((prev) => [
        {
          id: `hit-${Date.now()}-${Math.random()}`,
          studentName: mate.name,
          avatar: mate.avatar,
          damage: dmg,
          isCrit: isCrit,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 5),
      ]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isVictory, isPaused, bossHp]);

  // Uçan Hasar Sayısı Tetikle
  const triggerDamage = (text: string, isCrit: boolean, sender?: string) => {
    const newIndicator: DamageIndicator = {
      id: `dmg-${Date.now()}-${Math.random()}`,
      text,
      isCrit,
      sender,
    };
    setDamageIndicators((prev) => [...prev, newIndicator]);
    setTimeout(() => {
      setDamageIndicators((prev) => prev.filter((d) => d.id !== newIndicator.id));
    }, 1200);
  };

  // Oyuncunun Soruya Yanıt Vermesi
  const handleAnswer = (choice: string, index: number) => {
    if (feedback !== null || answeredIndex !== null || isVictory || isPaused) return;

    setAnsweredIndex(index);
    const isCorrect = choice === activeCard.meaning;

    if (isCorrect) {
      // DOĞRU CEVAP: KRİTİK / NORMAL HASAR
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setFeedback("correct");

      const isCrit = nextCombo >= 3 || Math.random() > 0.7;
      const damage = isCrit ? 220 + nextCombo * 30 : 120 + nextCombo * 15;

      setPlayerDamageDealt((prev) => prev + damage);

      // Canavara hasar ver
      setBossHp((prev) => {
        const next = Math.max(0, prev - damage);
        if (next <= 0) {
          handleVictory();
        }
        return next;
      });

      // Ses & Animasyon
      if (soundEnabled) {
        playSoundEffect(isCrit ? "crit" : "hit");
      }

      setBossState("hit");
      setTimeout(() => setBossState("idle"), 400);

      triggerDamage(
        isCrit ? `Sen: -${damage} KRİTİK! 💥` : `Sen: -${damage} HASAR! 🗡️`,
        isCrit
      );

      // Sıradaki Soru
      setTimeout(() => {
        setFeedback(null);
        setAnsweredIndex(null);
        setCurrentRound((prev) => prev + 1);
      }, 700);
    } else {
      // YANLIŞ CEVAP: EJDERHA KARŞI SALDIRISI!
      setFeedback("wrong");
      setCombo(0);

      if (activeCard) {
        saveArenaMistake({
          word: activeCard.word,
          meaning: activeCard.meaning,
          phonetic: activeCard.phonetic,
          gameType: "coop_boss_raid",
        });
      }

      if (soundEnabled) {
        playSoundEffect("boss_attack");
      }

      setBossState("attack");
      setTimeout(() => setBossState("idle"), 500);

      triggerDamage("ISKALANDI! 🔥", false);

      // Can Kaybı ve Yeniden Canlanma (Respawn)
      setPlayerLives((prevLives) => {
        const next = prevLives - 1;
        if (next <= 0) {
          // CAN TÜKENDİ! Sıfır Eleme Kurtarma Odası Devreye Girer
          setTimeout(() => {
            setIsRespawnOpen(true);
          }, 600);
          return 0;
        }
        return next;
      });

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
    setBossHp(0);
    if (soundEnabled) {
      playSoundEffect("victory");
    }
    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    } catch {}

    if (onAwardXP) {
      onAwardXP(400, "Sınıfça Boss Baskını Zaferi");
    }
    if (onAwardGold) {
      onAwardGold(250);
    }
  };

  const hpPercent = Math.max(0, Math.round((bossHp / MAX_BOSS_HP) * 100));

  // ZAFER EKRANI & SINIF HATA RÖNTGENİ
  if (isVictory) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0F19] text-slate-100 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full space-y-6 py-6 animate-in fade-in duration-300">
          {/* Üst Zafer Başlığı */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border-2 border-amber-400 text-center space-y-2 shadow-2xl relative overflow-hidden">
            <span className="text-4xl sm:text-5xl block animate-bounce">🏆 🐉</span>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-300 tracking-tight">
              SINIFÇA ZAFER! ANTİK IGNIS DEVRİLDİ!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Tüm sınıf tek bir yürek olarak 10.000 HP ejderhayı dize getirdi. Senin katkın:{" "}
              <strong className="text-amber-400 font-mono">
                {playerDamageDealt.toLocaleString()} Hasar
              </strong>
              !
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPodium(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>🥇 Sınıf Podyumunu Aç</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Arenaya Dön
              </button>
            </div>
          </div>

          {/* Sınıf Kelime Röntgeni Analiz Kartı */}
          <PostGameWeakWords className={className} isHost={isHost} />

          {/* Sınıf Podyum Modalı */}
          {showPodium && (
            <ClassroomPodiumModal
              isOpen={showPodium}
              onClose={() => setShowPodium(false)}
              sessionId={`coop-boss-${Date.now()}`}
              gameTitle="🐉 Sınıfça Ortak Boss Baskını"
              currentUserRank={2}
              currentUserName="Sen"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0F19] text-slate-100 overflow-y-auto">
      {/* 1. ÜST ŞERİT: MOD BİLGİSİ, CAN BARI VE DONDURMA KONTROLLERİ */}
      <header className="w-full bg-slate-950/80 border-b border-slate-800 px-4 py-3 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white">
                  🐉 Sınıfça Ortak Boss Baskını (Co-op Raid)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {className}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tüm sınıf tek hedefe saldırıyor • Ortak Bar: {bossHp.toLocaleString()} / 10.000 HP
              </p>
            </div>
          </div>

          {/* Sağ: Canların, Vurulan Hasar, Çıkış */}
          <div className="flex items-center gap-3">
            {/* Oyuncunun Canları */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Canın:</span>
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 transition-all ${
                    playerLives >= heart
                      ? "text-rose-500 fill-rose-500"
                      : "text-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Oyuncunun Vurduğu Toplam Hasar */}
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hidden sm:flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-mono font-black text-amber-300">
                {playerDamageDealt.toLocaleString()} Hasar
              </span>
            </div>

            {/* Ses */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Çıkış */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* DONDURMA (PAUSE) BİLDİRİMİ */}
      {isPaused && (
        <div className="w-full bg-amber-500/90 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg animate-pulse">
          <Pause className="w-4 h-4" />
          <span>⏸️ DERS MOLASI: Öğretmen kelimeyi tahtada açıklıyor. Ekran kilitlendi!</span>
        </div>
      )}

      {/* 2. ORTA SAHNE: DEV EJDERHA & CANLI SALDIRI AKIŞI */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 items-start">
        {/* SOL: BOSS ARENASI VE SORU KARTI */}
        <section className="space-y-5">
          {/* BOSS SAHNESİ KARTI */}
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-950 border-2 border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[340px] overflow-hidden shadow-2xl">
            {/* Ortak Can Barı (Top) */}
            <div className="w-full max-w-lg space-y-1.5 mb-4 z-10">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Antik Lav Ejderhası Ignis</span>
                </span>
                <span className="text-white font-black">
                  {bossHp.toLocaleString()} / {MAX_BOSS_HP.toLocaleString()} HP (%{hpPercent})
                </span>
              </div>

              {/* Pürüzsüz Dinamik Lav Can Barı */}
              <div className="w-full h-4 rounded-full bg-slate-950 border border-rose-900/60 overflow-hidden shadow-inner relative">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-500 rounded-full"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Boss Görseli & Animasyonu */}
            <div className="relative my-2">
              <div
                className={`w-44 h-44 sm:w-56 sm:h-56 rounded-3xl flex items-center justify-center transition-transform duration-300 select-none ${
                  bossState === "hit"
                    ? "scale-90 rotate-3 filter brightness-150 animate-shake"
                    : bossState === "attack"
                    ? "scale-110 -translate-y-2 filter drop-shadow-[0_0_30px_rgba(244,63,94,0.6)]"
                    : "animate-float"
                }`}
              >
                <img
                  src="/bosses/dragon_ignis.png"
                  alt="Ignis Dragon Boss"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    // Fallback illüstrasyon
                    (e.target as any).style.display = "none";
                  }}
                />
                <span className="text-7xl sm:text-8xl drop-shadow-2xl">🐉</span>
              </div>

              {/* Uçan Hasar Sayıları */}
              {damageIndicators.map((dmg) => (
                <div
                  key={dmg.id}
                  className={`absolute top-4 left-1/2 -translate-x-1/2 font-black font-mono text-sm sm:text-base animate-bounce px-3 py-1 rounded-xl shadow-lg whitespace-nowrap pointer-events-none z-30 ${
                    dmg.isCrit
                      ? "bg-amber-500 text-slate-950 border-2 border-yellow-300 scale-110 shadow-amber-500/40"
                      : "bg-rose-600 text-white border border-rose-400"
                  }`}
                >
                  {dmg.text}
                </div>
              ))}
            </div>
          </div>

          {/* OYUNCUNUN SORU & SALDIRI PANELİ */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Doğru Cevapla ve Ejderhaya Hasar Vur!</span>
              </span>

              {combo > 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                  🔥 {combo}x Kombo
                </span>
              )}
            </div>

            {/* Soru Kelimesi */}
            <div className="text-center py-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wide">
                {activeCard.word}
              </h3>
              {activeCard.phonetic && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activeCard.phonetic}</p>
              )}
            </div>

            {/* 4 Şık */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, idx) => {
                const isSelected = answeredIndex === idx;
                const isCorrect = opt === activeCard.meaning;

                let btnStyle = "bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200";

                if (feedback !== null) {
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
                    disabled={feedback !== null || isPaused}
                    onClick={() => handleAnswer(opt, idx)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-semibold text-left transition-all cursor-pointer active:scale-98 ${btnStyle}`}
                  >
                    <span className="text-slate-400 font-mono mr-2">{idx + 1}.</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SAĞ: CANLI SINIF SALDIRI AKIŞI (LIVE RAID FEED) */}
        <aside className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs sm:text-sm font-black text-white">
                Canlı Sınıf Saldırı Akışı
              </h4>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Akan Vuruşlar Listesi */}
          <div className="space-y-2.5">
            {liveHits.map((hit) => (
              <div
                key={hit.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-all animate-in slide-in-from-top-2 duration-200 ${
                  hit.isCrit
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                    : "bg-slate-950/70 border-slate-800/80 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{hit.avatar}</span>
                  <span className="font-bold">{hit.studentName}</span>
                </div>

                <span
                  className={`font-mono font-black ${
                    hit.isCrit ? "text-amber-300" : "text-rose-400"
                  }`}
                >
                  -{hit.damage} {hit.isCrit ? "💥 Kritik!" : "🗡️"}
                </span>
              </div>
            ))}

            {liveHits.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">
                Sınıf arkadaşların hazırlanıyor...
              </p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-white block">🤝 Sınıf Dayanışması</span>
            <p className="leading-snug">
              Zayıf öğrenci dahi vurduğu 50-100 hasarla takıma katkı sağlar; kimse oyun dışı kalmaz.
            </p>
          </div>
        </aside>
      </main>

      {/* SIFIR ELEME / KURTARMA ODASI MODALI (RESPAWN ENGINE) */}
      <RespawnModal
        isOpen={isRespawnOpen}
        cards={safeCards}
        onRespawn={() => {
          setIsRespawnOpen(false);
          setPlayerLives(1); // 1 Canla savaşa geri döner
        }}
        onGiveUp={() => {
          setIsRespawnOpen(false);
          onClose();
        }}
      />
    </div>
  );
}

