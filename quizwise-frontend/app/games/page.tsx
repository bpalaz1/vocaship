"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Gamepad2,
  Coins,
  Sparkles,
  Trophy,
  Shuffle,
  Zap,
  Flame,
  ArrowRight,
  FolderOpen,
  X,
  Play,
  RotateCcw,
  Check,
  Award,
  Layers,
  Heart,
  Target,
  Shield,
  Rocket,
  Timer,
  Swords
} from "lucide-react";
import { API_BASE } from "../config";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import GameModeSelectModal from "../components/games/GameModeSelectModal";
import JoinCodeModal from "../components/games/JoinCodeModal";

import { useLanguage } from "../context/LanguageContext";
import PlatformStandardLayout, { PlatformGamificationPanel } from "../components/layout/PlatformStandardLayout";
import { usePersona } from "../context/PersonaContext";

// Oyun Bileşenleri Dinamik Import
const GoldQuestGame = dynamic(() => import("../components/games/GoldQuestGame"), { ssr: false });
const MatchGame = dynamic(() => import("../components/games/MatchGame"), { ssr: false });
const GravityGame = dynamic(() => import("../components/games/GravityGame"), { ssr: false });
const SpeedRecallGame = dynamic(() => import("../components/games/SpeedRecallGame"), { ssr: false });
const BossFightGame = dynamic(() => import("../components/games/BossFightGame"), { ssr: false });
const LeaderboardModal = dynamic(() => import("../components/LeaderboardModal"), { ssr: false });
const ClassLeaderboardModal = dynamic(() => import("../components/games/ClassLeaderboardModal"), { ssr: false });

export interface DeckItem {
  id: string;
  title: string;
  description: string;
  card_count?: number;
}

export interface GameWordPair {
  word: string;
  meaning: string;
  phonetic?: string;
  clue?: string;
}

// Zengin Varsayılan Kelime Havuzu
const DEFAULT_GAME_WORDS: GameWordPair[] = [
  {
    word: "mitigate",
    meaning: "Hafifletmek, etkisini azaltmak",
    phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
    clue: "Zararlı bir etkinin şiddetini düşürmek",
  },
  {
    word: "resilient",
    meaning: "Dirençli, çabuk toparlanan",
    phonetic: "/rɪˈzɪl.jənt/",
    clue: "Zorluklar karşısında esnek ve güçlü kalabilen",
  },
  {
    word: "substantiate",
    meaning: "Kanıtlamak, somut gerekçelere dayandırmak",
    phonetic: "/səbˈstæn.ʃi.eɪt/",
    clue: "Bir iddiayı somut delillerle doğrulamak",
  },
  {
    word: "ubiquitous",
    meaning: "Her yerde bulunan, çok yaygın",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    clue: "Neredeyse her ortamda karşımıza çıkan",
  },
  {
    word: "coherent",
    meaning: "Tutarlı, mantıklı ve uyumlu",
    phonetic: "/kəʊˈhɪə.rənt/",
    clue: "Parçaları birbiriyle mantıksal bütünlük taşıyan",
  },
  {
    word: "detrimental",
    meaning: "Zararlı, hasar verici",
    phonetic: "/ˌdet.rɪˈmen.təl/",
    clue: "Süreçlere ve performansa negatif etkisi olan",
  },
  {
    word: "volatility",
    meaning: "Dalgalanma, değişkenlik",
    phonetic: "/ˌvɒl.əˈtɪl.ə.ti/",
    clue: "Fiyatlarda veya durumlarda ani iniş çıkışlar",
  },
  {
    word: "contingency",
    meaning: "Beklenmedik durum payı, yedek akçe",
    phonetic: "/kənˈtɪn.dʒən.si/",
    clue: "Öngörülemeyen riskler için ayrılan yedek süre/bütçe",
  },
];

const PRESET_DECKS: DeckItem[] = [
  {
    id: "preset_core3000",
    title: "🌐 En Sık Çıkan 3000 Temel Kelime",
    description: "A1-A2 Başlangıç ve günlük yaşam için en kritik temel kelimeler",
    card_count: 50,
  },
  {
    id: "preset_adv5000",
    title: "📚 İleri Düzey 5000 Kelime Dağarcığı",
    description: "C1-C2 Akademik ve profesyonel yetkinlik için ileri düzey 5000 kelime seçkisi",
    card_count: 50,
  },
  {
    id: "preset_c1_pro",
    title: "💼 C1 Profesyonel İş & Kariyer",
    description: "Proje Kontrol, FIDIC ve Yönetim terminolojisi içeren 50 ileri seviye terim",
    card_count: 50,
  },
  {
    id: "preset_academic",
    title: "🎓 Akademik Sınav Paketi (YDS & IELTS)",
    description: "Akademik makalelerde ve sınavlarda en sık çıkan kritik fiiller ve bağlaçlar",
    card_count: 45,
  },
  {
    id: "preset_engineering",
    title: "🏗️ İnşaat, EPC & Sözleşme Terimleri",
    description: "Sözleşme yönetimi, gecikme analizi ve teknik vaka kelimeleri",
    card_count: 40,
  },
];

type GameMode = "gold_raid" | "match" | "gravity" | "speed_recall" | "boss_fight";

const GAME_DETAILS: Record<GameMode, { title: string; badge: string; icon: React.ReactNode }> = {
  gold_raid: {
    title: "🏴‍☠️ Hazine Avı",
    badge: "Altın Baskını",
    icon: <Coins className="w-5 h-5 text-amber-400" />,
  },
  match: {
    title: "🃏 Kart Eşleştirme",
    badge: "12'li Tablo",
    icon: <Shuffle className="w-5 h-5 text-indigo-400" />,
  },
  gravity: {
    title: "☄️ Yerçekimi Savunması",
    badge: "Savunma & Refleks",
    icon: <Rocket className="w-5 h-5 text-rose-400" />,
  },
  speed_recall: {
    title: "⚡ 5s Hızlı Kombo",
    badge: "Seri Refleks",
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
  },
  boss_fight: {
    title: "🐉 Ejderha Baskını",
    badge: "Kritik Hasar & Epik Sandık",
    icon: <Swords className="w-5 h-5 text-rose-400" />,
  },
};


export default function GamesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedModeForDialog, setSelectedModeForDialog] = useState<GameMode | null>(null);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isClassLeaderboardOpen, setIsClassLeaderboardOpen] = useState(false);
  const { persona } = usePersona();
  const [gameFilter, setGameFilter] = useState<"all" | "solo" | "multiplayer" | "boss">("all");


  // Kullanıcı Altın & XP Durumu
  const [userProfile, setUserProfile] = useState<{
    gold: number;
    xp: number;
    streak: number;
  }>({
    gold: 240,
    xp: 450,
    streak: 5,
  });

  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  // Deste Seçim Modalı ve Aktif Oyun Durumu
  const [pendingGameMode, setPendingGameMode] = useState<GameMode | null>(null);
  const [activeGame, setActiveGame] = useState<GameMode | null>(null);
  const [activeDeck, setActiveDeck] = useState<DeckItem | null>(null);
  const [activeCards, setActiveCards] = useState<GameWordPair[]>(DEFAULT_GAME_WORDS);

  // Kullanıcı Profil Bilgisini Yükle
  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/gamification/profile`);
      if (res.ok) {
        const data = await res.json();
        setUserProfile({
          gold: data.total_gold || 240,
          xp: data.total_xp || 450,
          streak: data.streak_days || 5,
        });
        return;
      }
    } catch {}

    // Fallback: localStorage
    if (typeof window !== "undefined") {
      const savedGold = parseInt(localStorage.getItem("vocaship_gold") || "240", 10);
      const savedXP = parseInt(localStorage.getItem("vocaship_xp") || "450", 10);
      setUserProfile((prev) => ({
        ...prev,
        gold: savedGold,
        xp: savedXP,
      }));
    }
  };

  // Desteleri Yükle
  const fetchDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/decks`);
      if (res.ok) {
        const data = await res.json();
        setDecks(Array.isArray(data) && data.length > 0 ? data : PRESET_DECKS);
      } else {
        setDecks(PRESET_DECKS);
      }
    } catch {
      setDecks(PRESET_DECKS);
    } finally {
      setLoadingDecks(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchDecks();

    // Floating XP dinleyicisi ile profil puanını canlı güncelle
    const handleXPUpdate = (e: any) => {
      const amount = e.detail?.amount || 25;
      setUserProfile((prev) => ({
        ...prev,
        xp: prev.xp + amount,
      }));
    };

    window.addEventListener("quizwise_floating_xp", handleXPUpdate);
    return () => window.removeEventListener("quizwise_floating_xp", handleXPUpdate);
  }, []);

  // Oyun Kartına Tıklandığında -> Oyun Modu Seçim Modalı Aç (Tek Başına vs Sınıfça Canlı)
  const handleOpenModeSelectModal = (mode: GameMode) => {
    setSelectedModeForDialog(mode);
  };

  const handleSelectSoloMode = () => {
    if (selectedModeForDialog) {
      const mode = selectedModeForDialog;
      setSelectedModeForDialog(null);
      handleOpenDeckModal(mode);
    }
  };

  const handleSelectMultiplayerMode = () => {
    if (!selectedModeForDialog) return;
    const mode = selectedModeForDialog;
    setSelectedModeForDialog(null);
    const isEducator = Boolean(user?.isEducator || user?.role === "teacher" || user?.role === "educator");
    if (isEducator) {
      router.push("/classroom?game=" + mode);
    } else {
      setIsJoinCodeModalOpen(true);
    }
  };

  // Deste Seçimi Modalı Aç (Tek Başına Akış)
  const handleOpenDeckModal = (mode: GameMode) => {
    setPendingGameMode(mode);
  };

  // Deste Seçildiğinde -> Tam Ekran Oyunu Başlat
  const handleSelectDeckAndLaunch = async (deck: DeckItem) => {
    setActiveDeck(deck);
    setPendingGameMode(null);

    // Eğer backend'den kartlar çekilebilirse çek
    try {
      const res = await fetch(`${API_BASE}/api/v1/decks/${deck.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.cards && data.cards.length > 0) {
          const mapped: GameWordPair[] = data.cards.map((c: any) => ({
            word: c.word,
            meaning: c.turkish_meaning || c.meaning || c.definition || "Tanım",
            phonetic: c.phonetic,
          }));
          setActiveCards(mapped);
          setActiveGame(pendingGameMode);
          return;
        }
      }
    } catch {}

    // Fallback: Varsayılan kelime havuzu
    setActiveCards(DEFAULT_GAME_WORDS);
    setActiveGame(pendingGameMode);
  };

  // Oyundan Çıkış
  const handleExitGame = () => {
    setActiveGame(null);
    fetchUserProfile();
  };

  // GoldQuest için Flashcard formatı
  const goldQuestCards = activeCards.map((c, i) => ({
    id: `gq_${i}`,
    word: c.word,
    phonetic: c.phonetic,
    meanings: [{ definition: c.meaning, translation: c.meaning }],
    example_sentences: [{ en: `Example sentence for ${c.word}.` }],
  }));

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* 1. ÜST KOMPAKT ÇUBUK: ALTIN (🪙), XP VE SERİ BİLGİSİ */}
      <header className="border-b border-slate-850 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {t("game_arena", "Oyun Arenası")}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {t("games_badge", "FAZ 5 Arcade")}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t("games_subtitle", "Ana sayfadan izole, müstakil ve tam ekran çalışan kelime oyunları")}
              </p>
            </div>
          </div>

          {/* Kompakt Altın (🪙) ve XP Göstergesi */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">{t("gold_label", "Altın:")}</span>
              <span className="font-mono font-bold text-amber-300">{userProfile.gold} 🪙</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">{t("xp_label", "XP:")}</span>
              <span className="font-mono font-bold text-indigo-300">{userProfile.xp} XP</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-400">{t("streak_label", "Seri:")}</span>
              <span className="font-mono font-bold text-rose-300">{t("streak_days_count", "{count} Gün", { count: userProfile.streak })}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. DÖRT ANA OYUN MODU KATALOĞU (KOMPAKT 4'LÜ IZGARA - SIFIR KAYDIRMA) */}
      {/* 2. OYUN ARENASI 3 SÜTUNLU KÜRESEL STANDART YERLEŞİM (PlatformStandardLayout) */}
      <PlatformStandardLayout
        leftSidebar={
          <div className="space-y-4">
            {/* Oyun Filtreleri */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 text-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Gamepad2 className="w-4 h-4 text-indigo-400" />
                <span>Oyun Filtreleri</span>
              </span>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setGameFilter("all")}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    gameFilter === "all"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🎮</span>
                    <span>Tüm Oyunlar</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">5</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameFilter("solo")}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    gameFilter === "solo"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>👤</span>
                    <span>Bireysel Pratik</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameFilter("multiplayer")}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    gameFilter === "multiplayer"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>👥</span>
                    <span>Sınıfça Canlı</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">Canlı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameFilter("boss")}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    gameFilter === "boss"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                      : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>⚔️</span>
                    <span>Boss Fight</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">Epik</span>
                </button>
              </div>
            </div>

            {/* Sınıf Yarışma Odasına Katıl Butonu */}
            <div className="p-4 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 shadow-xl space-y-2">
              <span className="text-xs font-bold text-indigo-300 block">Sınıf Yarışması</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Öğretmeninizin başlattığı canlı yarışmaya 6 haneli kodla katılın.
              </p>
              <button
                type="button"
                onClick={() => setIsJoinCodeModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                <span>🔑 Giriş Kodu ile Katıl</span>
              </button>
            </div>

            {/* Aktif Deste Seçici */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 text-slate-800">
              <span className="text-xs font-bold text-slate-300 block">Aktif Deste</span>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 truncate">
                {activeDeck ? activeDeck.title : "Varsayılan Kelime Havuzu"}
              </div>
            </div>
          </div>
        }
        rightSidebar={
          <div className="space-y-4">
            <PlatformGamificationPanel
              title="Arcade Karnesi"
              streak={userProfile.streak}
              gold={userProfile.gold}
              xp={userProfile.xp}
              level={persona?.level || "Seviye 3 Kaşif"}
              mascotName={persona?.name || "Sparky"}
              mascotImage={persona?.image || "/avatars/sparky.png"}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenShop={() => router.push("/shop")}
            />

            {/* Çift Sayaçlı Liderlik Özeti (Madde 5.3) */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Çift Sayaçlı Liderlik</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 font-bold">
                  Canlı Lig
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Haftalık Lig</span>
                  <span className="text-xs font-black text-indigo-300 font-mono">#7 • 420 XP</span>
                  <span className="text-[9px] text-slate-500 block">7 Günlük Dinamik</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Tüm Zamanlar</span>
                  <span className="text-xs font-black text-amber-300 font-mono">#14 • 3,150 XP</span>
                  <span className="text-[9px] text-slate-500 block">Kalıcı Kümülatif</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLeaderboardOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 hover:text-yellow-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-yellow-500/20 transition cursor-pointer shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Kürsü ve Sıralamayı Gör ➔</span>
              </button>
            </div>

            {/* Sandık Mağazası Hızlı Erişim (Madde 5.2 Milestone Locks) */}
            <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200/80 shadow-sm space-y-2 text-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sandık Mağazası</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700 font-mono">
                  {userProfile.gold} 🪙
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Kazandığın altınlarla yeni karakter kartlarını ve seviye kilitlerini aç!
              </p>
              <Link
                href="/shop"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <span>Mağazaya Git ➔</span>
              </Link>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* ========================================================================= */}
          {/* 1. 🏴‍☠️ HAZİNE AVI: ALTIN BASKINI (GOLD RAID)                               */}
          {/* ========================================================================= */}
          <div
            onClick={() => handleOpenModeSelectModal("gold_raid")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenModeSelectModal("gold_raid");
              }
            }}
            className="group relative rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer text-slate-800"
          >
            {/* Şık Vektörel Kapak */}
            <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-600 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50%" cy="50%" r="45" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="85%" cy="30%" r="3" fill="#fff" />
                <circle cx="15%" cy="70%" r="2" fill="#fff" />
              </svg>

              <div className="relative z-10 w-11 h-11 rounded-xl bg-amber-400/30 backdrop-blur-md border border-amber-200/40 flex items-center justify-center shadow-lg shadow-amber-950/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Coins className="w-6 h-6 text-white drop-shadow" />
              </div>

              {/* Sol Üst Mini Rozet */}
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-400/40 backdrop-blur-md flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  <span>{t("game_gold_raid_badge", "Altın Baskını")}</span>
                </span>
              </div>

              {/* Sağ Üst Çarpan */}
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/60 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                  {t("game_gold_raid_multiplier", "2x Çarpan")}
                </span>
              </div>
            </div>

            {/* Kompakt İçerik */}
            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  <span>{t("game_gold_raid_title", "🏴‍☠️ Hazine Avı")}</span>
                </h2>
                <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                  {t("game_gold_raid_desc", "Sandık aç, altın ve 2x çarpan topla veya rakipten çal!")}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{t("game_gold_raid_chests", "3 Sandık")}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-300" />
                  <span>{t("game_gold_raid_steal", "Altın Çalma")}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModeSelectModal("gold_raid");
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t("game_gold_raid_btn", "Deste Seç & Oyna")}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. 🃏 KART EŞLEŞTİRME (MATCH)                                             */}
          {/* ========================================================================= */}
          <div
            onClick={() => handleOpenModeSelectModal("match")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenModeSelectModal("match");
              }
            }}
            className="group relative rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer text-slate-800"
          >
            {/* Şık Vektörel Kapak */}
            <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <rect x="25%" y="20%" width="50%" height="60%" fill="none" stroke="#a5b4fc" strokeWidth="1" rx="4" strokeDasharray="3 3" />
              </svg>

              <div className="relative z-10 w-11 h-11 rounded-xl bg-indigo-500/30 backdrop-blur-md border border-indigo-300/40 flex items-center justify-center shadow-lg shadow-indigo-950/40 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <Layers className="w-6 h-6 text-indigo-100 drop-shadow" />
              </div>

              {/* Sol Üst Mini Rozet */}
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-400/40 backdrop-blur-md flex items-center gap-1">
                  <Shuffle className="w-3 h-3" />
                  <span>{t("game_match_badge", "12'li Tablo")}</span>
                </span>
              </div>

              {/* Sağ Üst Zaman */}
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/60 text-indigo-300 border border-indigo-500/40 backdrop-blur-md">
                  {t("game_match_timer", "Zamana Karşı")}
                </span>
              </div>
            </div>

            {/* Kompakt İçerik */}
            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <span>{t("game_match_title", "🃏 Kart Eşleştirme")}</span>
                </h2>
                <p className="text-[11px] text-slate-300 line-clamp-1 leading-snug">
                  {t("game_match_desc", "12 kutulu tabloda kelime ve anlamları hızla eşleştir.")}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{t("game_match_dissolve", "Çözülme")}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>{t("game_match_podium", "Podyum")}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModeSelectModal("match");
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>{t("game_match_btn", "Deste Seç & Oyna")}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. ☄️ YERÇEKİMİ SAVUNMASI (GRAVITY)                                        */}
          {/* ========================================================================= */}
          <div
            onClick={() => handleOpenModeSelectModal("gravity")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenModeSelectModal("gravity");
              }
            }}
            className="group relative rounded-2xl bg-white border border-slate-200 hover:border-rose-400 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer text-slate-800"
          >
            {/* Şık Vektörel Kapak */}
            <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-br from-rose-700 via-red-700 to-orange-700 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <line x1="20%" y1="15%" x2="80%" y2="85%" stroke="#fed7aa" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="80%" cy="85%" r="4" fill="#fbbf24" />
              </svg>

              <div className="relative z-10 w-11 h-11 rounded-xl bg-rose-500/30 backdrop-blur-md border border-rose-300/40 flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Rocket className="w-6 h-6 text-rose-100 drop-shadow" />
              </div>

              {/* Sol Üst Mini Rozet */}
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-400/40 backdrop-blur-md flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>{t("game_gravity_badge", "Savunma")}</span>
                </span>
              </div>

              {/* Sağ Üst Can */}
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/60 text-rose-400 border border-rose-500/40 backdrop-blur-md flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500" />
                  <span>{t("game_gravity_lives", "3 Can")}</span>
                </span>
              </div>
            </div>

            {/* Kompakt İçerik */}
            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-1.5">
                  <span>{t("game_gravity_title", "☄️ Yerçekimi")}</span>
                </h2>
                <p className="text-[11px] text-slate-300 line-clamp-1 leading-snug">
                  {t("game_gravity_desc", "Düşen asteroidi çarpmadan anlamını yazarak patlat!")}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Target className="w-3 h-3 text-amber-400" />
                  <span>Yazım Refleksi</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Hızlanan Dalga</span>
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModeSelectModal("gravity");
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/30 transition active:scale-95 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{t("game_gravity_btn", "Deste Seç & Oyna")}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. ⚡ 5s HIZLI KOMBO (SPEED RECALL)                                       */}
          {/* ========================================================================= */}
          <div
            onClick={() => handleOpenModeSelectModal("speed_recall")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenModeSelectModal("speed_recall");
              }
            }}
            className="group relative rounded-2xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            {/* Şık Vektörel Kapak */}
            <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50%" cy="50%" r="35" fill="none" stroke="#67e8f9" strokeWidth="1" strokeDasharray="3 3" />
              </svg>

              <div className="relative z-10 w-11 h-11 rounded-xl bg-cyan-400/30 backdrop-blur-md border border-cyan-200/40 flex items-center justify-center shadow-lg shadow-cyan-950/40 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <Zap className="w-6 h-6 text-cyan-100 drop-shadow" />
              </div>

              {/* Sol Üst Mini Rozet */}
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-400/40 backdrop-blur-md flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>{t("game_speed_badge", "Hızlı Kombo")}</span>
                </span>
              </div>

              {/* Sağ Üst Süre */}
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/60 text-cyan-300 border border-cyan-500/40 backdrop-blur-md flex items-center gap-1">
                  <Timer className="w-3 h-3 text-cyan-400" />
                  <span>{t("game_speed_timer", "5 Sn")}</span>
                </span>
              </div>
            </div>

            {/* Kompakt İçerik */}
            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-black text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>{t("game_speed_title", "⚡ 5s Hızlı Kombo")}</span>
                </h2>
                <p className="text-[11px] text-slate-300 line-clamp-1 leading-snug">
                  {t("game_speed_desc", "5 saniyede 4 şıktan doğru anlamı yakalayarak kombo yap!")}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Seri Refleks</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Alevli Kombo</span>
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModeSelectModal("speed_recall");
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/30 transition active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{t("game_speed_btn", "Deste Seç & Oyna")}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. 🐉 EJDERHA BASKINI (BOSS FIGHT)                                        */}
          {/* ========================================================================= */}
          <div
            onClick={() => handleOpenModeSelectModal("boss_fight")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenModeSelectModal("boss_fight");
              }
            }}
            className="group relative rounded-2xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            {/* Şık Vektörel Kapak */}
            <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-700 to-purple-800 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50%" cy="50%" r="40" fill="none" stroke="#fbcfe8" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M20 70 Q 50 30 80 70" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
              </svg>

              <div className="relative z-10 w-11 h-11 rounded-xl bg-rose-500/30 backdrop-blur-md border border-rose-300/40 flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Flame className="w-6 h-6 text-amber-300 drop-shadow" />
              </div>

              {/* Sol Üst Mini Rozet */}
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-400/40 backdrop-blur-md flex items-center gap-1">
                  <Swords className="w-3 h-3 text-rose-300" />
                  <span>Boss Fight</span>
                </span>
              </div>

              {/* Sağ Üst Kritik Hasar */}
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/60 text-amber-300 border border-rose-500/40 backdrop-blur-md">
                  Kritik & Epik
                </span>
              </div>
            </div>

            {/* Kompakt İçerik */}
            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-black text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                  <span>🐉 Ejderha Baskını</span>
                </h2>
                <p className="text-[11px] text-slate-300 line-clamp-1 leading-snug">
                  Kelimeleri doğru bilerek antik ejderhaya hasar ver ve hazineyi kurtar!
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Swords className="w-3 h-3 text-rose-400" />
                  <span>Kritik Hasar</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Epik Sandık</span>
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModeSelectModal("boss_fight");
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-700 hover:from-rose-500 hover:to-purple-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/30 transition active:scale-95 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Deste Seç & Oyna</span>
              </button>
            </div>
          </div>
        </div>

          {/* ========================================================================= */}
          {/* FAZ 2: SABİT GELİŞİM KARNESİ & AKILLI LİDERLİK ERİŞİM PANELİ              */}
          {/* ========================================================================= */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-white mt-6">
            {/* 1. Üst Başlık & İlerleme Çubuğu */}
            <div className="space-y-3 pb-5 border-b border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black tracking-tight text-white uppercase">
                        GELİŞİM KARNESİ
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Lv.3 Hikaye Ustası 🥇
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Sonraki seviyeye 336 XP kaldı!
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black font-mono text-amber-300">
                    2665 / 3001 XP
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">
                    %83.2 Tamamlandı
                  </span>
                </div>
              </div>

              {/* %83.2 Doluluk Çubuğu */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 rounded-full transition-all duration-700 shadow-sm shadow-amber-500/30"
                  style={{ width: "83.2%" }}
                />
              </div>
            </div>

            {/* 2. İstatistik Blokları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 14 Gün Günlük Seri */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-2xl shadow-inner">
                    🔥
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Günlük Seri</span>
                    <span className="text-lg font-black text-white font-mono">14 Gün</span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-mono font-bold">
                  Aktif Seri
                </span>
              </div>

              {/* 275 Altın Bakiyeniz */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
                    🪙
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Altın Bakiyeniz</span>
                    <span className="text-lg font-black text-amber-300 font-mono">275 Altın</span>
                  </div>
                </div>
                <Link
                  href="/shop"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Harca</span>
                  <span>➔</span>
                </Link>
              </div>
            </div>

            {/* 3. Hızlı Erişim Satırları (Hover animasyonlu, border-slate-800/80) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* 🎓 Sınıfım & Öğretmen */}
              <Link
                href="/classroom"
                className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/50 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">🎓</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition block truncate">
                      Sınıfım & Öğretmen
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Canlı Ders & Ödevler
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>

              {/* 🏆 Sınıf Liderlik Tablosu */}
              <button
                type="button"
                onClick={() => setIsClassLeaderboardOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/50 transition-all group flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">🏆</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition block truncate">
                      Sınıf Liderlik Tablosu
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Haftalık Podyum
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>

              {/* 🎁 Sandık Mağazası */}
              <Link
                href="/shop"
                className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-yellow-500/50 transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">🎁</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-yellow-300 transition block truncate">
                      Sandık Mağazası
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Karakterler & Kilitler
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>

              {/* 🔑 Kod ile Katıl */}
              <button
                type="button"
                onClick={() => setIsJoinCodeModalOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/50 transition-all group flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">🔑</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition block truncate">
                      Kod ile Katıl
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      6 Haneli PIN Girişi
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            </div>

            {/* 4. Alt Alan: XP İpuçları */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-slate-300">XP & Altın İpuçları:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-rose-300 bg-rose-950/30 px-2 py-0.5 rounded-lg border border-rose-500/20">
                  🐉 Boss Fight: Yüksek XP & Altın Çarpanı
                </span>
                <span className="flex items-center gap-1 text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  🏴‍☠️ Hazine Avı: Altın Sandıkları & Seri
                </span>
              </div>
            </div>
          </div>

        </div>
      </PlatformStandardLayout>

      {/* Akıllı Sınıf Liderlik Modalı (FAZ 2) */}
      <ClassLeaderboardModal
        isOpen={isClassLeaderboardOpen}
        onClose={() => setIsClassLeaderboardOpen(false)}
        onOpenJoinCode={() => setIsJoinCodeModalOpen(true)}
      />

      {/* Çift Sayaçlı Liderlik Modalı */}
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} userId={user?.id} />

      {/* ========================================================================= */}
      {/* 2.5 OYUN MODU SEÇİMİ (TEK BAŞINA vs SINIFÇA CANLI) MODALI                */}
      {/* ========================================================================= */}
      <GameModeSelectModal
        isOpen={Boolean(selectedModeForDialog)}
        onClose={() => setSelectedModeForDialog(null)}
        game={
          selectedModeForDialog
            ? {
                mode: selectedModeForDialog,
                title: GAME_DETAILS[selectedModeForDialog].title,
                badge: GAME_DETAILS[selectedModeForDialog].badge,
                icon: GAME_DETAILS[selectedModeForDialog].icon,
              }
            : null
        }
        onSelectSolo={handleSelectSoloMode}
        onSelectMultiplayer={handleSelectMultiplayerMode}
        isEducator={Boolean(user?.isEducator || user?.role === "teacher" || user?.role === "educator")}
      />

      {/* CANLI KATILIM KODU GİRİŞ MODALI */}
      <JoinCodeModal
        isOpen={isJoinCodeModalOpen}
        onClose={() => setIsJoinCodeModalOpen(false)}
        onJoinSuccess={(shareData) => {
          setIsJoinCodeModalOpen(false);
          router.push("/classroom?joinCode=" + encodeURIComponent(shareData?.code || ""));
        }}
      />

      {/* ========================================================================= */}
      {/* 3. ŞIK "DESTE SEÇİMİ" MODALI                                              */}
      {/* ========================================================================= */}
      {pendingGameMode && (
        <div
          onClick={() => setPendingGameMode(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 sm:p-7 shadow-2xl shadow-indigo-950/60 space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t("select_deck_modal_title", "Çalışılacak Desteyi Seçin")}</h3>
                  <p className="text-xs text-slate-400">
                    {t("select_deck_modal_subtitle", "Oyun bu destedeki kelimelerle tam ekran başlatılacaktır")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPendingGameMode(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deste Listesi */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {decks.map((deck) => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => handleSelectDeckAndLaunch(deck)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-950 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">
                      {deck.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {deck.description || "Hazır kelime çalışma seti"}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-xs shrink-0 shadow-sm transition">
                    Başlat ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MÜSTAKİL VE TAM EKRAN OYUN MERKEZİ (FULLSCREEN FOCUS LAUNCHERS)        */}
      {/* ========================================================================= */}

      {/* 1. HAZİNE AVI: ALTIN BASKINI (GoldQuestGame) */}
      {activeGame === "gold_raid" && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
          <GoldQuestGame
            cards={goldQuestCards}
            deckTitle={activeDeck?.title || "Hazine Avı: Altın Baskını"}
            onClose={handleExitGame}
            onAwardXP={(amount) => {
              setUserProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
            }}
          />
        </div>
      )}

      {/* 2. KART EŞLEŞTİRME (MatchGame) */}
      {activeGame === "match" && (
        <MatchGame
          cards={activeCards}
          deckTitle={activeDeck?.title}
          onClose={handleExitGame}
          onAwardXP={(amount) => {
            setUserProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
          }}
        />
      )}

      {/* 3. YERÇEKİMİ SAVUNMASI (GravityGame) */}
      {activeGame === "gravity" && (
        <GravityGame
          cards={activeCards}
          deckTitle={activeDeck?.title}
          onClose={handleExitGame}
          onAwardXP={(amount) => {
            setUserProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
          }}
        />
      )}

      {/* 4. 5s HIZLI KOMBO (SpeedRecallGame) */}
      {activeGame === "speed_recall" && (
        <SpeedRecallGame
          cards={activeCards}
          deckTitle={activeDeck?.title}
          onClose={handleExitGame}
          onAwardXP={(amount) => {
            setUserProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
          }}
        />
      )}

      {/* 5. 🐉 EJDERHA BASKINI (BossFightGame) */}
      {activeGame === "boss_fight" && (
        <BossFightGame
          cards={activeCards}
          deckTitle={activeDeck?.title || "Ejderha Baskını (Boss Fight)"}
          onClose={handleExitGame}
          onAwardXP={(amount) => {
            setUserProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
          }}
          onAwardGold={(amount) => {
            setUserProfile((prev) => ({ ...prev, gold: prev.gold + amount }));
          }}
        />
      )}
    </div>
  );
}
