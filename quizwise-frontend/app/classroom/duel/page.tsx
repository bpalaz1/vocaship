"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Swords,
  Trophy,
  Flame,
  Zap,
  RotateCcw,
  ArrowLeft,
  Maximize2,
  Minimize2,
  School,
  Gamepad2,
  Crown,
  Sparkles,
} from "lucide-react";

interface DuelQuestion {
  word: string;
  phonetic?: string;
  correctMeaning: string;
  options: string[];
}

const DEFAULT_DUEL_QUESTIONS: DuelQuestion[] = [
  {
    word: "mitigate",
    phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
    correctMeaning: "Hafifletmek, etkisini azaltmak",
    options: [
      "Hafifletmek, etkisini azaltmak",
      "Genişletmek, büyütmek",
      "Ertelenmek, gecikmek",
      "Yok saymak, ihmal etmek",
    ],
  },
  {
    word: "allocate",
    phonetic: "/ˈæl.ə.keɪt/",
    correctMeaning: "Tahsis etmek, paylaştırmak",
    options: [
      "Tahsis etmek, paylaştırmak",
      "Geri çekilmek, vazgeçmek",
      "Kayıp vermek",
      "İspatlamak, kanıtlamak",
    ],
  },
  {
    word: "variance",
    phonetic: "/ˈveə.ri.əns/",
    correctMeaning: "Farklılık, sapma, ayrılık",
    options: [
      "Farklılık, sapma, ayrılık",
      "Benzerlik, aynılık",
      "Süreklilik, kalıcılık",
      "Sınır, kısıtlama",
    ],
  },
  {
    word: "resilient",
    phonetic: "/rɪˈzɪl.jənt/",
    correctMeaning: "Dirençli, esnek, çabuk toparlanan",
    options: [
      "Dirençli, esnek, çabuk toparlanan",
      "Kırılgan, narin",
      "Aceleci, sabırsız",
      "Korkak, ürkek",
    ],
  },
  {
    word: "contingency",
    phonetic: "/kənˈtɪn.dʒən.si/",
    correctMeaning: "Beklenmedik durum, ihtiyat planı",
    options: [
      "Beklenmedik durum, ihtiyat planı",
      "Kesin kural, kaide",
      "Garantili kazanç",
      "Zaman aşımı",
    ],
  },
  {
    word: "feasibility",
    phonetic: "/ˌfiː.zəˈbɪl.ə.ti/",
    correctMeaning: "Uygulanabilirlik, fizibilite",
    options: [
      "Uygulanabilirlik, fizibilite",
      "İmkansızlık",
      "Gereksizlik",
      "Masraf, harcama",
    ],
  },
  {
    word: "procurement",
    phonetic: "/prəˈkjʊə.mənt/",
    correctMeaning: "Tedarik, satın alma",
    options: [
      "Tedarik, satın alma",
      "Satış, elden çıkarma",
      "Gecikme, erteleme",
      "Rekabet",
    ],
  },
  {
    word: "compliance",
    phonetic: "/kəmˈplaɪ.əns/",
    correctMeaning: "Uyumluluk, kurallara uyma",
    options: [
      "Uyumluluk, kurallara uyma",
      "İtiraz, başkaldırı",
      "Bozulma, çöküş",
      "İstisna",
    ],
  },
  {
    word: "benchmark",
    phonetic: "/ˈbentʃ.mɑːk/",
    correctMeaning: "Kıyaslama ölçütü, mihenk taşı",
    options: [
      "Kıyaslama ölçütü, mihenk taşı",
      "Başlangıç noktası",
      "Sonuç raporu",
      "Rastgele hedef",
    ],
  },
  {
    word: "milestone",
    phonetic: "/ˈmaɪl.stəʊn/",
    correctMeaning: "Dönüm noktası, kritik aşama",
    options: [
      "Dönüm noktası, kritik aşama",
      "Son durak",
      "Küçük ayrıntı",
      "İlk deneme",
    ],
  },
];

export default function SplitScreenDuelPage() {
  const [currentRound, setCurrentRound] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [redScore, setRedScore] = useState(0);
  const [roundWinner, setRoundWinner] = useState<"blue" | "red" | "wrong_blue" | "wrong_red" | null>(null);
  const [roundLocked, setRoundLocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalRounds = DEFAULT_DUEL_QUESTIONS.length;
  const activeQuestion = DEFAULT_DUEL_QUESTIONS[currentRound] || DEFAULT_DUEL_QUESTIONS[0];

  // Her iki taraf için seçenekleri sabitle / karıştır
  const shuffledOptions = useMemo(() => {
    return [...activeQuestion.options].sort(() => 0.5 - Math.random());
  }, [currentRound, activeQuestion]);

  // Ses Efekti (Web Audio API)
  const playSound = (type: "point" | "buzz" | "game_win") => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "point") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "buzz") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "game_win") {
        [523, 659, 783, 1046, 1318].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
        });
      }
    } catch {}
  };

  // Tam Ekran Kontrolü
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Bir Oyuncu Butona Dokunduğunda
  const handlePlayerTap = (player: "blue" | "red", optionText: string) => {
    if (roundLocked || isGameOver) return;

    const isCorrect = optionText === activeQuestion.correctMeaning;

    if (isCorrect) {
      // Doğru şıkka İLK DOKUNAN PUANI ALIR!
      setRoundLocked(true);
      playSound("point");

      if (player === "blue") {
        setBlueScore((s) => s + 100);
        setRoundWinner("blue");
      } else {
        setRedScore((s) => s + 100);
        setRoundWinner("red");
      }

      // Kısa bir aradan sonra sıradaki soruya geç
      setTimeout(() => {
        advanceRound();
      }, 1300);
    } else {
      // Yanlış şık: Hata sesi ve kısa kilitlenme
      playSound("buzz");
      setRoundWinner(player === "blue" ? "wrong_blue" : "wrong_red");
      setTimeout(() => {
        setRoundWinner(null);
      }, 800);
    }
  };

  const advanceRound = () => {
    setRoundWinner(null);
    setRoundLocked(false);

    if (currentRound + 1 >= totalRounds) {
      setIsGameOver(true);
      playSound("game_win");
      try {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      } catch {}
    } else {
      setCurrentRound((r) => r + 1);
    }
  };

  const resetDuel = () => {
    setCurrentRound(0);
    setBlueScore(0);
    setRedScore(0);
    setRoundWinner(null);
    setRoundLocked(false);
    setIsGameOver(false);
  };

  // =======================================================================
  // DURUM 1: 10 SORU BİTTİ -> KAZANAN VE TAHTA PODYUMU
  // =======================================================================
  if (isGameOver) {
    const isBlueWin = blueScore > redScore;
    const isRedWin = redScore > blueScore;
    const isTie = blueScore === redScore;

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="max-w-2xl w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="space-y-3">
            <span className="text-6xl animate-bounce block">
              {isTie ? "🤝" : "👑"}
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              {isTie
                ? "DOSTLUK KAZANDI! BERABERE!"
                : isBlueWin
                ? "👑 TAHTA ŞAMPİYONU: MAVİ GLADYATÖR!"
                : "👑 TAHTA ŞAMPİYONU: KIRMIZI ŞÖVALYE!"}
            </h1>

            <p className="text-sm sm:text-base text-slate-400">
              10 soruluk hızlı parmak düellosu tamamlandı.
            </p>
          </div>

          {/* Skor Karşılaştırma Kutusu */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-4 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-2xl">
            {/* Mavi Oyuncu */}
            <div
              className={`p-4 rounded-2xl border text-center space-y-1 ${
                isBlueWin
                  ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400"
                  : "bg-slate-950 border-slate-800"
              }`}
            >
              <span className="text-xs font-bold text-blue-400 uppercase">
                Mavi Oyuncu
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono block text-white">
                {blueScore}
              </span>
              <span className="text-[10px] text-slate-400">Puan</span>
            </div>

            {/* Kırmızı Oyuncu */}
            <div
              className={`p-4 rounded-2xl border text-center space-y-1 ${
                isRedWin
                  ? "bg-rose-600/20 border-rose-500 shadow-lg shadow-rose-500/20 ring-2 ring-rose-400"
                  : "bg-slate-950 border-slate-800"
              }`}
            >
              <span className="text-xs font-bold text-rose-400 uppercase">
                Kırmızı Oyuncu
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono block text-white">
                {redScore}
              </span>
              <span className="text-[10px] text-slate-400">Puan</span>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={resetDuel}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>🔄 Yeni Rövanş Maçı Başlat</span>
            </button>

            <Link
              href="/classroom/host"
              className="h-14 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 transition"
            >
              <School className="w-4 h-4" />
              <span>🎓 Lobi Konsoluna Dön</span>
            </Link>

            <Link
              href="/games"
              className="h-14 px-6 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-sm flex items-center gap-2 border border-slate-800 transition"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>🎮 Oyun Arenası</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================================
  // DURUM 2: CANLI 1v1 BÖLÜNMÜŞ EKRAN DÜELLOSU
  // =======================================================================
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden">
      {/* ÜST ŞERİT: SKOR TABLOSU & KONTROLLER */}
      <header className="h-16 bg-slate-900 border-b-2 border-slate-800 px-4 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-2">
          <Link
            href="/classroom/host"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Lobiye Dön"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs font-black text-slate-300 hidden sm:inline">
            Akıllı Tahta 1v1 Düello
          </span>
        </div>

        {/* ORTA: SKORBOARD */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-400">MAVİ:</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-white">
              {blueScore}
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400">
            Soru {currentRound + 1} / {totalRounds}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-white">
              {redScore}
            </span>
            <span className="text-xs font-bold text-rose-400">:KIRMIZI</span>
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </header>

      {/* ORTAK SORU BİLGİ ŞERİDİ (EKRANIN EN ÜST MERKEZİ) */}
      <div className="bg-slate-900/90 border-b border-slate-800 py-3 px-4 text-center shrink-0 z-10 shadow-md">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
          Doğru Şıkka İlk Dokunan Puanı Alır (+100)
        </span>
        <h2 className="text-3xl sm:text-4xl font-black font-mono text-white tracking-wide">
          {activeQuestion.word}
        </h2>
        {activeQuestion.phonetic && (
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {activeQuestion.phonetic}
          </p>
        )}
      </div>

      {/* KAZANAN ANLIK FLAŞ BİLDİRİMİ */}
      {roundWinner && (
        <div
          className={`w-full py-2 text-center text-xs sm:text-sm font-black tracking-wider uppercase shadow-xl transition-all ${
            roundWinner === "blue"
              ? "bg-blue-600 text-white animate-bounce"
              : roundWinner === "red"
              ? "bg-rose-600 text-white animate-bounce"
              : roundWinner === "wrong_blue"
              ? "bg-rose-500/80 text-white"
              : "bg-rose-500/80 text-white"
          }`}
        >
          {roundWinner === "blue" && "⚡ Mavi Oyuncu İlk Dokundu! (+100 Puan)"}
          {roundWinner === "red" && "⚡ Kırmızı Oyuncu İlk Dokundu! (+100 Puan)"}
          {roundWinner === "wrong_blue" && "❌ Mavi Oyuncu Yanlış Bastı!"}
          {roundWinner === "wrong_red" && "❌ Kırmızı Oyuncu Yanlış Bastı!"}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2 SÜTUNLU BÖLÜNMÜŞ EKRAN (SPLIT-SCREEN 1v1 SAHNE)                    */}
      {/* ===================================================================== */}
      <div className="flex-1 grid grid-cols-2 divide-x-4 divide-slate-800 p-2 sm:p-4 gap-0 items-stretch overflow-hidden">
        {/* SOL BÖLGE: MAVİ OYUNCU (BLUE ZONE) */}
        <div className="flex flex-col justify-between p-2 sm:p-6 bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-950 h-full">
          <div className="flex items-center justify-between pb-2">
            <span className="px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-black text-xs sm:text-sm">
              🔵 MAVİ BÖLGE
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              Dokun ve Kap!
            </span>
          </div>

          {/* 4 DOKUNMATİK BUTON (≥ 64px YÜKSEKLİK) */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 my-auto">
            {shuffledOptions.map((opt, idx) => (
              <button
                key={`blue-${opt}-${idx}`}
                type="button"
                disabled={roundLocked}
                onClick={() => handlePlayerTap("blue", opt)}
                className="h-16 sm:h-20 px-4 rounded-2xl bg-blue-950/80 hover:bg-blue-900/90 active:scale-95 border-2 border-blue-500/40 hover:border-blue-400 text-white font-bold text-xs sm:text-base flex items-center justify-center text-center shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="text-center text-[11px] text-blue-400/80 font-bold">
            1. Oyuncu Sahası
          </div>
        </div>

        {/* SAĞ BÖLGE: KIRMIZI OYUNCU (RED ZONE) */}
        <div className="flex flex-col justify-between p-2 sm:p-6 bg-gradient-to-bl from-rose-950/40 via-slate-950 to-slate-950 h-full">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono font-bold text-slate-400">
              Dokun ve Kap!
            </span>
            <span className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-xs sm:text-sm">
              🔴 KIRMIZI BÖLGE
            </span>
          </div>

          {/* 4 DOKUNMATİK BUTON (≥ 64px YÜKSEKLİK) */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 my-auto">
            {shuffledOptions.map((opt, idx) => (
              <button
                key={`red-${opt}-${idx}`}
                type="button"
                disabled={roundLocked}
                onClick={() => handlePlayerTap("red", opt)}
                className="h-16 sm:h-20 px-4 rounded-2xl bg-rose-950/80 hover:bg-rose-900/90 active:scale-95 border-2 border-rose-500/40 hover:border-rose-400 text-white font-bold text-xs sm:text-base flex items-center justify-center text-center shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="text-center text-[11px] text-rose-400/80 font-bold">
            2. Oyuncu Sahası
          </div>
        </div>
      </div>
    </div>
  );
}

