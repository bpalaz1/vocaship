"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Users,
  Play,
  Pause,
  Square,
  Sparkles,
  Trophy,
  Flame,
  Swords,
  Coins,
  Zap,
  ArrowLeft,
  Maximize2,
  Minimize2,
  RefreshCw,
  Copy,
  Check,
  Radio,
  BookOpen,
  Volume2,
  AlertTriangle,
  School,
  Gamepad2,
} from "lucide-react";
import confetti from "canvas-confetti";
import CoopBossArena from "../../components/games/CoopBossArena";
import PostGameWeakWords from "../../components/games/PostGameWeakWords";
import ClassroomPodiumModal from "../../components/games/ClassroomPodiumModal";

export type HostGameMode = "coop_boss" | "gold_raid" | "speed_recall";

interface ConnectedStudent {
  id: string;
  name: string;
  avatar: string;
  status: "ready" | "in_game";
}

const INITIAL_STUDENTS: ConnectedStudent[] = [
  { id: "s1", name: "Ahmet Kaya", avatar: "🦊", status: "ready" },
  { id: "s2", name: "Selin Yılmaz", avatar: "🦁", status: "ready" },
  { id: "s3", name: "Kaan Arslan", avatar: "🦉", status: "ready" },
  { id: "s4", name: "Elif Demir", avatar: "🐼", status: "ready" },
  { id: "s5", name: "Mert Öztürk", avatar: "🐱", status: "ready" },
  { id: "s6", name: "Zeynep Kaya", avatar: "🐻", status: "ready" },
  { id: "s7", name: "Caner Aydın", avatar: "🐯", status: "ready" },
  { id: "s8", name: "Deniz Kurt", avatar: "🦅", status: "ready" },
  { id: "s9", name: "Ayşe Çelik", avatar: "🦄", status: "ready" },
  { id: "s10", name: "Oğuzhan T.", avatar: "🦫", status: "ready" },
  { id: "s11", name: "İrem Yıldız", avatar: "🐸", status: "ready" },
  { id: "s12", name: "Tolga Erdem", avatar: "🥷", status: "ready" },
  { id: "s13", name: "Burak Vural", avatar: "🤖", status: "ready" },
  { id: "s14", name: "Melis Aktaş", avatar: "👩‍🚀", status: "ready" },
  { id: "s15", name: "Ceren Güneş", avatar: "⚡", status: "ready" },
  { id: "s16", name: "Barış Çetin", avatar: "🧙‍♂️", status: "ready" },
];

function HostConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = (searchParams.get("game") as HostGameMode) || "coop_boss";

  // Oyun Ayarları
  const [selectedMode, setSelectedMode] = useState<HostGameMode>(initialMode);
  const [durationGoal, setDurationGoal] = useState<string>("boss_barrage"); // '3m' | '5m' | 'boss_barrage'
  const [className, setClassName] = useState<string>("Sosyal Oyun Odası");
  const [classPin, setClassPin] = useState<string>("VRG-8421");
  const [origin, setOrigin] = useState<string>("http://localhost:3000");

  // Oyun Durumu
  const [gameStatus, setGameStatus] = useState<"lobby" | "running" | "ended">("lobby");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Öğrenciler
  const [students, setStudents] = useState<ConnectedStudent[]>(INITIAL_STUDENTS);
  const [showPodium, setShowPodium] = useState<boolean>(false);
  const [showWeakWords, setShowWeakWords] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Yeni Öğrenci Bağlanma Simülasyonu
  useEffect(() => {
    if (gameStatus !== "lobby") return;

    const interval = setInterval(() => {
      setStudents((prev) => {
        if (prev.length >= 24) return prev;
        const newStudentNames = ["Hakan Özkan", "Ezgi Bulut", "Serkan Polat", "Volkan Sezer", "Ece Acar", "Pınar Yaman"];
        const avatars = ["🐢", "🐐", "🐪", "🦾", "🛸", "✨"];
        const nextIdx = prev.length - INITIAL_STUDENTS.length;
        if (nextIdx >= newStudentNames.length) return prev;

        return [
          ...prev,
          {
            id: `s-${Date.now()}`,
            name: newStudentNames[nextIdx],
            avatar: avatars[nextIdx % avatars.length],
            status: "ready",
          },
        ];
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [gameStatus]);

  // Tam Ekran Aç/Kapat
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // PIN Kopyala
  const handleCopyPin = () => {
    navigator.clipboard.writeText(classPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Yeni PIN Üret
  const handleRegeneratePin = () => {
    const chars = "0123456789ABKMT";
    let p1 = "";
    let p2 = "";
    for (let i = 0; i < 3; i++) {
      p1 += chars[Math.floor(Math.random() * chars.length)];
      p2 += chars[Math.floor(Math.random() * chars.length)];
    }
    setClassPin(`VRG-${p1}${p2}`);
  };

  // Oyunu Başlat
  const handleStartGame = () => {
    setGameStatus("running");
    setIsPaused(false);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
    } catch {}
  };

  // Oyunu Dondur / Duraklat
  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Oyunu Bitir
  const handleEndGame = () => {
    setGameStatus("ended");
    setIsPaused(false);
    setShowWeakWords(true);
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {}
  };

  const joinUrl = `${origin}/games?joinCode=${classPin}`;

  // =======================================================================
  // DURUM A: OYUN BİTTİ (PODYUM VE KELİME RÖNTGENİ)
  // =======================================================================
  if (gameStatus === "ended") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 flex flex-col items-center">
        <div className="max-w-5xl w-full space-y-6 py-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Seans Tamamlandı: {className}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Oda Kurucusu Değerlendirme & Özet Konsolu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPodium(true)}
                className="h-12 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                <Trophy className="w-4 h-4" />
                <span>🥇 Podyumu Göster</span>
              </button>

              <button
                type="button"
                onClick={() => setGameStatus("lobby")}
                className="h-12 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Yeni Oyun Lobisi Aç</span>
              </button>
            </div>
          </div>

          {/* Oyun Odası Kelime Röntgeni Analiz Kartı */}
          <PostGameWeakWords className={className} isHost={true} />

          {/* Oyun Odası Podyum Modalı */}
          {showPodium && (
            <ClassroomPodiumModal
              isOpen={showPodium}
              onClose={() => setShowPodium(false)}
              sessionId={`host-${Date.now()}`}
              gameTitle="Canlı Oyun Odası Karşılaşması"
              currentUserRank={1}
              currentUserName="Oyun Odası Şampiyonları"
            />
          )}
        </div>
      </div>
    );
  }

  // =======================================================================
  // DURUM B: CANLI OYUN DEVAM EDİYOR (CANAVAR BASKINI TAHTA EKRANI)
  // =======================================================================
  if (gameStatus === "running") {
    return (
      <div className="relative min-h-screen bg-slate-950 flex flex-col">
        {/* AKILLI TAHTA ÜST YÖNETİCİ KONTROL ÇUBUĞU (DOKUNMATİK DOSTU ~56px) */}
        <div className="w-full bg-slate-900 border-b-2 border-slate-800 px-4 py-2 sticky top-0 z-30 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-black text-white font-mono tracking-wider">
              CANLI YAYIN: {className}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-slate-950 text-amber-400 border border-slate-800 font-bold">
              KOD: {classPin}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 hidden sm:inline">
              👥 {students.length} Oyuncu Canlı
            </span>
          </div>

          {/* DOKUNMATİK CANLI KONTROL BUTONLARI (56px) */}
          <div className="flex items-center gap-2">
            {/* DONDUR / DURAKLAT BUTONU */}
            <button
              type="button"
              onClick={handleTogglePause}
              className={`h-12 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md active:scale-95 ${
                isPaused
                  ? "bg-amber-500 text-slate-950 ring-4 ring-amber-400/40"
                  : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30"
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? "▶️ OYUNU SÜRDÜR" : "⏸️ OYUNU DONDUR (MOLA)"}</span>
            </button>

            {/* OYUNU BİTİR BUTONU */}
            <button
              type="button"
              onClick={handleEndGame}
              className="h-12 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md shadow-rose-600/30 active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>🛑 OYUNU BİTİR</span>
            </button>

            {/* TAM EKRAN */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="h-12 w-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer border border-slate-700"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* CANLI CO-OP ARENA GÖVDESİ */}
        <div className="flex-1">
          <CoopBossArena
            cards={[]}
            deckTitle="Oyun Odası Kelimeleri"
            className={className}
            isHost={true}
            isPaused={isPaused}
            onClose={handleEndGame}
          />
        </div>
      </div>
    );
  }

  // =======================================================================
  // DURUM C: LOBİ EKRANI (ODA KURUCUSU OYUN LOBİSİ)
  // =======================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. ÜST ŞERİT: BAŞLIK, ODA ADI VE TAM EKRAN */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/games"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Oyunlar Arenasına Dön</span>
          </Link>

          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
              <span>Oda Kurucusu Canlı Oyun Lobisi</span>
            </h1>
            <p className="text-xs text-slate-400">
              Oyun Odası Yönetici Konsolu • {className}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="hidden sm:inline">Tam Ekran</span>
        </button>
      </header>

      {/* 2. ANA PANEL: SOLDA DEV PIN & QR, SAĞDA OYUN AYARLARI */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 items-start">
        {/* SOL PANEL: DEV PIN VE DİNAMİK QR KODU */}
        <section className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
              KATILIM KODU (ODA KODU)
            </span>
            <p className="text-xs text-slate-400">
              Oyuncular cihazlarından kodu girerek lobiye bağlanır.
            </p>
          </div>

          {/* DEV 6 HANELİ PIN KUTUSU */}
          <div className="w-full py-4 px-6 rounded-2xl bg-slate-950 border-2 border-amber-500/50 flex items-center justify-between shadow-inner">
            <span className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-amber-300">
              {classPin}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyPin}
                title="Kodu Kopyala"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleRegeneratePin}
                title="Yeni Kod Üret"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DİNAMİK QR KODU */}
          <div className="p-4 rounded-3xl bg-white shadow-2xl flex flex-col items-center justify-center">
            <QRCodeSVG value={joinUrl} size={180} level="H" includeMargin={false} />
            <span className="text-[10px] font-black font-mono text-slate-900 mt-2">
              Kamerayla Tara ve Katıl
            </span>
          </div>

          {/* BAĞLI OYUNCU SAYAÇ ROZETİ */}
          <div className="w-full py-3 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Hazır Oyuncular:</span>
            </div>
            <span className="text-sm font-black font-mono text-indigo-300">
              {students.length} Oyuncu
            </span>
          </div>
        </section>

        {/* SAĞ PANEL: OYUN AYARLARI, MOD SEÇİMİ VE BAĞLI OYUNCULAR */}
        <section className="space-y-6">
          {/* A) OYUN MODU SEÇİMİ */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>1. Canlı Oyun Modunu Seç</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* MOD 1: ORTAK BOSS BASKINI */}
              <button
                type="button"
                onClick={() => setSelectedMode("coop_boss")}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedMode === "coop_boss"
                    ? "bg-rose-500/15 border-rose-500 text-white ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1.5">
                  <span className="text-2xl">🐉</span>
                  <h3 className="text-xs sm:text-sm font-black">Ortak Boss Baskını</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Tüm oyuncular tek 10.000 HP ejderhayı devirir; herkes takıma katkı sağlar.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Co-op Raid (Tavsiye)
                </span>
              </button>

              {/* MOD 2: HAZİNE AVI */}
              <button
                type="button"
                onClick={() => setSelectedMode("gold_raid")}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedMode === "gold_raid"
                    ? "bg-amber-500/15 border-amber-500 text-white ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1.5">
                  <span className="text-2xl">🏴‍☠️</span>
                  <h3 className="text-xs sm:text-sm font-black">Hazine Avı & Sandık</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Sandık açma, 2x altın çarpanı ve arkadaşlarından altın yağmalama mücadelesi.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Hazine Avı
                </span>
              </button>

              {/* MOD 3: HIZLI KOMBO */}
              <button
                type="button"
                onClick={() => setSelectedMode("speed_recall")}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedMode === "speed_recall"
                    ? "bg-cyan-500/15 border-cyan-500 text-white ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1.5">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-xs sm:text-sm font-black">5s Hızlı Kombo</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    5 saniyelik seri refleks turlarıyla anlık hız ve dikkat yarışı.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Seri Refleks
                </span>
              </button>
            </div>
          </div>

          {/* B) SÜRE VE HEDEF SEÇİMİ */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>2. Seans Süresi ve Baraj Hedefi</span>
            </h2>

            <div className="flex flex-wrap gap-3">
              {[
                { id: "boss_barrage", label: "🐉 10.000 HP Canavar Barajı", desc: "Canavar ölünceye kadar" },
                { id: "3m", label: "⏱️ 3 Dakikalık Hızlı Tur", desc: "Zamana karşı hızlı sprint" },
                { id: "5m", label: "⏱️ 5 Dakikalık Tam Karşılaşma", desc: "Kapsamlı pratik ve yarış" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDurationGoal(opt.id)}
                  className={`px-4 py-3 rounded-2xl border text-left transition cursor-pointer ${
                    durationGoal === opt.id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30 font-bold"
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black block">{opt.label}</span>
                  <span className="text-[10px] text-slate-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* C) CANLI BAĞLANAN OYUNCULAR ŞERİDİ */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>3. Bağlanan Oyuncular ({students.length})</span>
              </h2>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Canlı Bağlantı Açık</span>
              </span>
            </div>

            {/* Oyuncu Avatar Rozetleri */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {students.map((st) => (
                <div
                  key={st.id}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs"
                >
                  <span className="text-lg">{st.avatar}</span>
                  <span className="font-bold text-white truncate max-w-[90px]">
                    {st.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* D) DOKUNMATİK DEV OYUNU BAŞLAT BUTONU (~56px) */}
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full h-16 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 transition active:scale-98 cursor-pointer tracking-wide"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>▶️ CANLI OYUNU BAŞLAT</span>
          </button>
        </section>
      </main>
    </div>
  );
}

export default function HostConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="text-center space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-sm text-slate-400">Yönetici Konsolu Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <HostConsoleContent />
    </Suspense>
  );
}

