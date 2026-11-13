"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gamepad2,
  Coins,
  Sparkles,
  Trophy,
  Shuffle,
  Zap,
  Flame,
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
  Swords,
  Search,
  ArrowRight,
  Users,
  Crown,
  Edit3,
} from "lucide-react";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePersona } from "../context/PersonaContext";
import { useProfile } from "../context/ProfileContext";
import AvatarPickerModal from "../components/profile/AvatarPickerModal";
import GameCard, { GameCardItem } from "../components/games/GameCard";
import GameModeSelectModal from "../components/games/GameModeSelectModal";
import JoinCodeModal from "../components/games/JoinCodeModal";
import ChestOpenModal from "../components/shop/ChestOpenModal";
import { CHESTS } from "../data/chestItems";
import { getArenaMistakes } from "../utils/arenaMistakes";
import { claimPendingGold } from "../utils/pendingGold";
import {
  getActiveDeckId,
  setActiveDeckId,
  fetchDecksList,
  getActiveDeckCards,
  toFlashcardItems,
  subscribeToActiveDeck,
  DeckItem,
  GameWordPair,
  PRESET_DECKS,
  DEFAULT_GAME_WORDS,
} from "../utils/activeDeckStore";

export type { DeckItem, GameWordPair };

// Oyun Bileşenleri Dinamik Import
const GoldQuestGame = dynamic(() => import("../components/games/GoldQuestGame"), { ssr: false });
const MatchGame = dynamic(() => import("../components/games/MatchGame"), { ssr: false });
const GravityGame = dynamic(() => import("../components/games/GravityGame"), { ssr: false });
const SpeedRecallGame = dynamic(() => import("../components/games/SpeedRecallGame"), { ssr: false });
const BossFightGame = dynamic(() => import("../components/games/BossFightGame"), { ssr: false });
const WordScrambleGame = dynamic(() => import("../components/games/WordScrambleGame"), { ssr: false });
const CoopBossArena = dynamic(() => import("../components/games/CoopBossArena"), { ssr: false });
const RevengeArenaModal = dynamic(() => import("../components/games/RevengeArenaModal"), { ssr: false });
const GrandmasterCelebrationModal = dynamic(() => import("../components/games/GrandmasterCelebrationModal"), { ssr: false });
const LeaderboardModal = dynamic(() => import("../components/LeaderboardModal"), { ssr: false });
const ClassLeaderboardModal = dynamic(() => import("../components/games/ClassLeaderboardModal"), { ssr: false });



export type GameMode =
  | "boss_fight"
  | "gold_raid"
  | "match"
  | "gravity"
  | "speed_recall"
  | "word_scramble"
  | "coop_boss";

const GAME_DETAILS: Record<GameMode, { title: string; badge: string; icon: React.ReactNode }> = {
  boss_fight: {
    title: "🐉 Ejderha Baskını",
    badge: "Boss Fight",
    icon: <Swords className="w-5 h-5 text-rose-400" />,
  },
  coop_boss: {
    title: "🐉 Sınıfça Ortak Boss Baskını",
    badge: "Co-op Raid",
    icon: <Users className="w-5 h-5 text-amber-400" />,
  },
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
    title: "⚡ Hızlı Kombo",
    badge: "Dinamik Refleks",
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
  },
  word_scramble: {
    title: "🔤 Harf Avı",
    badge: "Harf Dizme",
    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
  },
};

const CORE_GAMES: GameCardItem[] = [
  {
    id: "game_boss_fight",
    mode: "boss_fight",
    title: "🐉 Ejderha Baskını",
    badge: "Boss Fight & Co-op",
    tag: "Kritik & Ortak Baskın",
    description: "Kelimeleri doğru bilerek antik ejderhaya hasar ver; ister tek başına ister sınıfça ortak devir!",
    bgGradient: "from-rose-600 via-rose-700 to-purple-800",
    icon: <Swords className="w-6 h-6 text-amber-300 drop-shadow" />,
    featurePills: [
      { label: "Ortak Baskın", icon: <Users className="w-3 h-3 text-amber-300" /> },
      { label: "Kritik Hasar", icon: <Flame className="w-3 h-3 text-rose-400" /> },
    ],
    actionText: "Ejderhaya Meydan Oku",
    actionBg: "bg-gradient-to-r from-rose-600 to-purple-700 hover:from-rose-500 hover:to-purple-600 text-white shadow-rose-600/30",
  },
  {
    id: "game_gold_raid",
    mode: "gold_raid",
    title: "🏴‍☠️ Hazine Avı: Altın Baskını",
    badge: "Altın Baskını",
    tag: "2x Çarpan",
    description: "Sandık aç, altın ve 2x çarpan topla veya rakipten altın çal!",
    bgGradient: "from-amber-500 via-amber-600 to-yellow-600",
    icon: <Coins className="w-6 h-6 text-yellow-100 drop-shadow" />,
    featurePills: [
      { label: "3 Sandık", icon: <Sparkles className="w-3 h-3 text-amber-400" /> },
      { label: "Altın Çalma", icon: <Shield className="w-3 h-3 text-amber-300" /> },
    ],
    actionText: "Hazineyi Yağmala",
    actionBg: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25",
  },
  {
    id: "game_match",
    mode: "match",
    title: "🃏 Kart Eşleştirme",
    badge: "12'li Tablo",
    tag: "Zamana Karşı",
    description: "12 kutulu tabloda İngilizce kelime ve anlamları hızla eşleştir.",
    bgGradient: "from-indigo-600 via-purple-700 to-violet-800",
    icon: <Layers className="w-6 h-6 text-indigo-100 drop-shadow" />,
    featurePills: [
      { label: "Çözülme Efekti", icon: <Sparkles className="w-3 h-3 text-indigo-400" /> },
      { label: "Podyum Skoru", icon: <Trophy className="w-3 h-3 text-amber-400" /> },
    ],
    actionText: "Kartları Eşleştir",
    actionBg: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30",
  },
  {
    id: "game_gravity",
    mode: "gravity",
    title: "☄️ Yerçekimi Savunması",
    badge: "Savunma",
    tag: "3 Can",
    description: "Düşen asteroidi yere çarpmadan anlamını yazarak patlat!",
    bgGradient: "from-orange-600 via-red-600 to-red-700",
    icon: <Rocket className="w-6 h-6 text-orange-100 drop-shadow" />,
    featurePills: [
      { label: "Yazım Refleksi", icon: <Target className="w-3 h-3 text-amber-400" /> },
      { label: "Hızlanan Dalga", icon: <Flame className="w-3 h-3 text-rose-400" /> },
    ],
    actionText: "Savunmayı Başlat",
    actionBg: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-orange-600/30",
  },
  {
    id: "game_speed_recall",
    mode: "speed_recall",
    title: "⚡ Hızlı Kombo",
    badge: "Hızlı Kombo",
    tag: "6-10 Sn Refleks",
    description: "Seviyene göre 6-10 saniyede 4 şıktan doğru anlamı yakalayarak seri kombo yap!",
    bgGradient: "from-cyan-500 via-blue-600 to-blue-700",
    icon: <Zap className="w-6 h-6 text-cyan-100 drop-shadow" />,
    featurePills: [
      { label: "Dinamik Süre", icon: <Zap className="w-3 h-3 text-cyan-400" /> },
      { label: "Alevli Kombo", icon: <Flame className="w-3 h-3 text-amber-400" /> },
    ],
    actionText: "Komboyu Başlat",
    actionBg: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30",
  },
  {
    id: "game_word_scramble",
    mode: "word_scramble",
    title: "🔤 Harf Avı (Word Scramble)",
    badge: "Harf Dizme",
    tag: "Kelime Avı",
    description: "Karışık harfleri Türkçe tanıma göre doğru sıraya dizerek kelimeyi bul!",
    bgGradient: "from-emerald-500 via-teal-600 to-teal-700",
    icon: <Sparkles className="w-6 h-6 text-emerald-100 drop-shadow" />,
    featurePills: [
      { label: "Harf Bulmaca", icon: <Sparkles className="w-3 h-3 text-emerald-400" /> },
      { label: "Kelime Bilgisi", icon: <Trophy className="w-3 h-3 text-amber-300" /> },
    ],
    actionText: "Harfleri Çöz",
    actionBg: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30",
  },
];

export default function GamesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const { persona } = usePersona();
  const { userProfile: profileData, setIsSettingsModalOpen } = useProfile();
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);

  // Modallar
  const [selectedModeForDialog, setSelectedModeForDialog] = useState<GameMode | null>(null);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isClassLeaderboardOpen, setIsClassLeaderboardOpen] = useState(false);
  const [isChestModalOpen, setIsChestModalOpen] = useState(false);
  const [learnedWordsCount, setLearnedWordsCount] = useState(145);

  // İntikam Arenası ve Grandmaster
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isRevengeModalOpen, setIsRevengeModalOpen] = useState(false);
  const [isGrandmasterModalOpen, setIsGrandmasterModalOpen] = useState(false);

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

  // Sessiz Altın Köprüsü Karşılama Bildirimi
  const [claimedRewardBanner, setClaimedRewardBanner] = useState<{
    total: number;
    breakdown: Record<string, number>;
  } | null>(null);

  // Seviyeye Göre Dinamik Hızlı Kombo Süresi (A1-A2: 10s, B1+: 6s)
  const userStudyLevel = profileData?.study_level || "B1";
  const isBeginnerLevel = userStudyLevel === "A1" || userStudyLevel === "A2";
  const speedRecallTimeLimit = isBeginnerLevel ? 10 : 6;

  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  // Deste Seçim Modalı ve Aktif Oyun Durumu
  const [pendingGameMode, setPendingGameMode] = useState<GameMode | null>(null);
  const [isDeckPickerOpen, setIsDeckPickerOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameMode | null>(null);
  const [activeDeck, setActiveDeck] = useState<DeckItem | null>(null);
  const [activeCards, setActiveCards] = useState<GameWordPair[]>(DEFAULT_GAME_WORDS);

  // Kullanıcı Profil Bilgisini Yükle ve Sessiz Altınları Teslim Et
  const fetchUserProfile = async () => {
    let currentGold = 240;
    let currentXP = 450;
    let currentStreak = 5;

    try {
      const res = await fetch(`${API_BASE}/api/v1/gamification/profile`);
      if (res.ok) {
        const data = await res.json();
        currentGold = data.total_gold ?? 240;
        currentXP = data.total_xp ?? 450;
        currentStreak = data.streak_days ?? 5;
      } else if (typeof window !== "undefined") {
        const savedGold = parseInt(localStorage.getItem("vocaship_gold") || "240", 10);
        const savedXP = parseInt(localStorage.getItem("vocaship_xp") || "450", 10);
        const savedStreak = parseInt(localStorage.getItem("vocaship_streak") || "5", 10);
        currentGold = isNaN(savedGold) ? 240 : savedGold;
        currentXP = isNaN(savedXP) ? 450 : savedXP;
        currentStreak = isNaN(savedStreak) ? 5 : savedStreak;
      }
    } catch {
      if (typeof window !== "undefined") {
        const savedGold = parseInt(localStorage.getItem("vocaship_gold") || "240", 10);
        const savedXP = parseInt(localStorage.getItem("vocaship_xp") || "450", 10);
        const savedStreak = parseInt(localStorage.getItem("vocaship_streak") || "5", 10);
        currentGold = isNaN(savedGold) ? 240 : savedGold;
        currentXP = isNaN(savedXP) ? 450 : savedXP;
        currentStreak = isNaN(savedStreak) ? 5 : savedStreak;
      }
    }

    // Sessiz Altın Köprüsü: Okuma ve Konuşma çalışmalarından bekleyen altınları topla
    const claimed = claimPendingGold();
    if (claimed.total > 0) {
      setClaimedRewardBanner(claimed);
      currentGold += claimed.total;
      if (typeof window !== "undefined") {
        localStorage.setItem("vocaship_gold", currentGold.toString());
      }
    }

    setUserProfile({
      gold: currentGold,
      xp: currentXP,
      streak: currentStreak,
    });
  };

  useEffect(() => {
    fetchUserProfile();

    // Aktif Deste ve Kartları Başlat
    const initDecksAndCards = async () => {
      setLoadingDecks(true);
      const deckList = await fetchDecksList();
      setDecks(deckList);

      const savedDeckId = getActiveDeckId();
      let currentDeck = deckList.find((d) => d.id === savedDeckId);
      if (!currentDeck && deckList.length > 0) {
        currentDeck = deckList[0];
        setActiveDeckId(currentDeck.id);
      }
      setActiveDeck(currentDeck || null);

      if (currentDeck) {
        const cards = await getActiveDeckCards(currentDeck.id);
        setActiveCards(cards);
      }
      setLoadingDecks(false);
    };

    initDecksAndCards();

    // Global Deste Değişikliklerini Dinle (Diğer sekmeler veya Okuma/Speaking modülleri)
    const unsubscribe = subscribeToActiveDeck(async (newDeckId) => {
      const deckList = await fetchDecksList();
      const currentDeck = deckList.find((d) => d.id === newDeckId) || {
        id: newDeckId,
        title: "Aktif Deste",
        description: "",
      };
      setActiveDeck(currentDeck);
      const cards = await getActiveDeckCards(newDeckId);
      setActiveCards(cards);
    });

    // İntikam Arenası Hata Sayısını Başlat
    const updateMistakes = () => {
      const list = getArenaMistakes();
      setMistakesCount(list.length);
    };
    updateMistakes();

    const handleMistakesUpdated = (e: any) => {
      const count = e.detail?.count ?? getArenaMistakes().length;
      setMistakesCount(count);
    };

    window.addEventListener("vocaship:arena_mistakes_updated", handleMistakesUpdated);

    // 1000 Kelime Grandmaster Kontrolü
    if (typeof window !== "undefined") {
      const savedGm = localStorage.getItem("vocaship_grandmaster") === "true";
      const gmCelebrated = localStorage.getItem("vocaship_gm_celebrated") === "true";
      if (learnedWordsCount >= 1000 || savedGm) {
        if (!savedGm) {
          localStorage.setItem("vocaship_grandmaster", "true");
        }
        if (!gmCelebrated && learnedWordsCount >= 1000) {
          setIsGrandmasterModalOpen(true);
          localStorage.setItem("vocaship_gm_celebrated", "true");
        }
      }
    }

    const handleXPUpdate = (e: any) => {
      const amount = e.detail?.amount || 25;
      setUserProfile((prev) => ({
        ...prev,
        xp: prev.xp + amount,
      }));
    };

    window.addEventListener("quizwise_floating_xp", handleXPUpdate);
    return () => {
      unsubscribe();
      window.removeEventListener("quizwise_floating_xp", handleXPUpdate);
      window.removeEventListener("vocaship:arena_mistakes_updated", handleMistakesUpdated);
    };
  }, [learnedWordsCount]);

  // Seviyeye uygun aktif sandık (1. Doğa, 2. Kahramanlar, 3. Kozmik, 4. Efsaneler)
  const activeSuggestedChest =
    CHESTS.find((c) => learnedWordsCount < c.requiredWords) ||
    CHESTS[CHESTS.length - 1];

  // Oyun Kartına Tıklandığında -> Oyun Modu Seçim Modalı Aç (Tek Başına vs Sınıfça Canlı)
  const handleOpenModeSelectModal = (mode: GameMode) => {
    setSelectedModeForDialog(mode);
  };

  const handleSelectSoloMode = () => {
    if (selectedModeForDialog) {
      const mode = selectedModeForDialog;
      setSelectedModeForDialog(null);
      setPendingGameMode(mode);
    }
  };

  const handleSelectMultiplayerMode = () => {
    if (!selectedModeForDialog) return;
    const mode = selectedModeForDialog;
    setSelectedModeForDialog(null);
    const isEducator = Boolean(user?.isEducator || user?.role === "teacher" || user?.role === "educator");
    if (isEducator) {
      router.push("/classroom/host?game=" + mode);
    } else {
      setIsJoinCodeModalOpen(true);
    }
  };

  // Deste Seçildiğinde -> Tam Ekran Oyunu Başlat veya Aktif Desteyi Senkronize Et
  const handleSelectDeckAndLaunch = async (deck: DeckItem) => {
    setActiveDeck(deck);
    setActiveDeckId(deck.id);
    const modeToLaunch = pendingGameMode;
    setPendingGameMode(null);
    setIsDeckPickerOpen(false);

    const cards = await getActiveDeckCards(deck.id);
    setActiveCards(cards);

    if (modeToLaunch) {
      setActiveGame(modeToLaunch);
    }
  };

  // Oyundan Çıkış
  const handleExitGame = () => {
    setActiveGame(null);
    fetchUserProfile();
  };

  // GoldQuest için Flashcard formatı
  const goldQuestCards = useMemo(() => {
    return toFlashcardItems(activeCards);
  }, [activeCards]);

  const isGrandmaster =
    learnedWordsCount >= 1000 ||
    (typeof window !== "undefined" && localStorage.getItem("vocaship_grandmaster") === "true");

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden transition-colors duration-200">
      {/* ========================================================================= */}
      {/* SPLIT-CONSOLE WRAPPER: 1366px ve 1080p İÇİN SIFIR KAYDIRMA KONSOLU       */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 py-4 min-h-[calc(100vh-80px)] w-full grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
        {/* ======================================================================= */}
        {/* SOL SÜTUN - SABİT GELİŞİM VE SANDIK KOKPİTİ                            */}
        {/* ======================================================================= */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 flex flex-col gap-4 shadow-sm dark:shadow-xl backdrop-blur-md lg:sticky lg:top-20">
          {/* 1. Profil & Aktif Avatar */}
          <div
            onClick={() => setIsAvatarStudioOpen(true)}
            className="flex items-center gap-3 pb-3 border-b border-slate-800 cursor-pointer group"
          >
            <div
              className={`w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 transition-all ${
                isGrandmaster
                  ? "ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse"
                  : "ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
              }`}
            >
              {profileData?.avatar_url && (profileData.avatar_url.startsWith("http") || profileData.avatar_url.startsWith("/") || profileData.avatar_url.startsWith("data:")) ? (
                <img
                  src={profileData.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avatars/presets/avatar_01.svg";
                  }}
                />
              ) : profileData?.avatar_url ? (
                <span className="text-2xl">{profileData.avatar_url}</span>
              ) : (
                <span className="text-base font-bold text-amber-300">
                  {((profileData?.full_name || profileData?.username || "K").charAt(0)).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                  {profileData?.username ? (profileData.username.startsWith("@") ? profileData.username : `@${profileData.username}`) : (profileData?.full_name || "@kasif")} • Lv.{profileData?.study_level || "B1"}
                </h2>
                {isGrandmaster && (
                  <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                    <Crown className="w-2.5 h-2.5 fill-slate-950" />
                    <span>GRANDMASTER</span>
                  </span>
                )}
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isGrandmaster ? "👑 1000+ Kelime Efsanesi" : (profileData?.full_name || "Seviye Kaşif")}
              </span>
            </div>
            {/* Zarif ✏️ Düzenle Butonu */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAvatarStudioOpen(true);
              }}
              title="Avatarı Değiştir"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Sayaçlar (Stat Pills) */}
          <div className="grid grid-cols-3 gap-2">
            {/* Altın */}
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                <span>🪙</span>
                <span className="hidden sm:inline">Altın</span>
              </div>
              <span className="text-xs sm:text-sm font-bold font-mono text-amber-300 block truncate">
                {userProfile.gold}
              </span>
            </div>

            {/* XP */}
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                <Zap className="w-3 h-3 text-indigo-400" />
                <span className="hidden sm:inline">XP</span>
              </div>
              <span className="text-xs sm:text-sm font-bold font-mono text-indigo-300 block truncate">
                {userProfile.xp}
              </span>
            </div>

            {/* Seri */}
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                <Flame className="w-3 h-3 text-rose-400" />
                <span className="hidden sm:inline">Seri</span>
              </div>
              <span className="text-xs sm:text-sm font-bold font-mono text-rose-300 block truncate">
                {userProfile.streak} G
              </span>
            </div>
          </div>

          {/* İntikam Arenası (Unutma Destesi Telafi Modu) */}
          <button
            type="button"
            onClick={() => setIsRevengeModalOpen(true)}
            className={`w-full p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer text-left ${
              mistakesCount > 0
                ? "bg-rose-500/15 border-rose-500/50 hover:bg-rose-500/25 shadow-md shadow-rose-500/10 text-white ring-1 ring-rose-500/30"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  mistakesCount > 0
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate text-white">
                  🎯 İntikam Arenası
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {mistakesCount > 0
                    ? `${mistakesCount} Hata Kelimesi Bekliyor`
                    : "Hata listen tertemiz!"}
                </span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                mistakesCount > 0
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {mistakesCount > 0 ? `${mistakesCount} Kelime` : "0"}
            </span>
          </button>

          {/* 3. Hızlı Sandık Kartı (Widget) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeSuggestedChest.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate max-w-[130px]">
                    {activeSuggestedChest.name.tr}
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400">
                    {activeSuggestedChest.costGold}🪙 Altın
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  learnedWordsCount >= activeSuggestedChest.requiredWords && userProfile.gold >= activeSuggestedChest.costGold
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {learnedWordsCount >= activeSuggestedChest.requiredWords && userProfile.gold >= activeSuggestedChest.costGold
                  ? "Açılabilir"
                  : `${activeSuggestedChest.requiredWords} Kelime`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              50 parçalık koleksiyondan yeni avatar, unvan ve ekipmanlar kazan!
            </p>
            <button
              type="button"
              onClick={() => setIsChestModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
            >
              <span>🛍️ Sandık Aç / Albüme Git ➔</span>
            </button>
          </div>

          {/* 🏛️ 100 Eserlik Müze Vitrini Köprüsü */}
          <Link
            href="/museum"
            className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border border-amber-500/30 hover:border-amber-400 space-y-2 block transition group shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">🏛️</span>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition">
                    100 Eserlik Grand Müze
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-mono">
                    4 Sergi Salonu & Kelime Peteği
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div className="w-full py-1.5 px-3 rounded-xl bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-amber-500/30 transition">
              <span>🏛️ Sergi Salonlarını Gez ➔</span>
            </div>
          </Link>

          {/* 4. Lig Göstergesi & Liderlik Köprüsü */}
          <Link
            href="/leaderboard"
            className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 space-y-2.5 block transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg group-hover:scale-110 transition-transform">🥇</span>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition">
                    Altın Lig (#3)
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Yükselme Hattında (Top 5)
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div className="w-full py-2 px-3 rounded-xl bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-yellow-500 group-hover:text-slate-950 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 group-hover:border-amber-400 transition shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950" />
              <span>🏆 Haftalık Lig & Podyuma Git ➔</span>
            </div>
          </Link>
        </aside>

        {/* ======================================================================= */}
        {/* SAĞ GENİŞ ALAN - OYUN VİTRİNİ                                          */}
        {/* ======================================================================= */}
        <section className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Üst Başlık & Deste Seçici */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-md">
            {/* Sol: Başlık & Deste Seçici */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Vocaship Arcade Arenası</span>
              </h2>

              {/* Aktif Deste Seçici Hapı */}
              <button
                type="button"
                onClick={() => setIsDeckPickerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-indigo-300 flex items-center gap-1.5 transition cursor-pointer"
                title="Aktif Çalışma Destesini Seçin"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {activeDeck ? activeDeck.title : "Varsayılan Kelime Havuzu"}
                </span>
                <span className="text-[10px] text-slate-500">▾</span>
              </button>
            </div>

            {/* Sağ: 🏛️ 100 Eserlik Grand Müze Köprüsü */}
            <Link
              href="/museum"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition cursor-pointer shadow-sm group shrink-0"
              title="100 Eserlik Bütünleşik Müze & Sergi Salonuna Git"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🏛️</span>
              <span className="hidden sm:inline">100 Eserlik Müzem</span>
              <span className="sm:hidden">Müzem</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">
                4 Salon ➔
              </span>
            </Link>
          </div>

          {/* Sessiz Altın Köprüsü Karşılama Rozeti/Bannerı */}
          {claimedRewardBanner && claimedRewardBanner.total > 0 && (
            <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border border-amber-500/40 shadow-lg shadow-amber-500/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shrink-0 animate-bounce">
                  🪙
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-200">
                    🎁 Okuma ve Konuşma çalışmalarından +{claimedRewardBanner.total} Altın kazandın ve kasana eklendi!
                  </h3>
                  <p className="text-xs text-amber-300/80 font-medium">
                    {claimedRewardBanner.breakdown.reading ? `Okuma: +${claimedRewardBanner.breakdown.reading} 📖 ` : ""}
                    {claimedRewardBanner.breakdown.ai_story ? `Hikaye: +${claimedRewardBanner.breakdown.ai_story} ✨ ` : ""}
                    {claimedRewardBanner.breakdown.speaking ? `Konuşma: +${claimedRewardBanner.breakdown.speaking} 🎙️` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClaimedRewardBanner(null)}
                className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-500/20 transition cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 6 Çekirdek Oyun Modu (Kompakt 3x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {CORE_GAMES.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => handleOpenModeSelectModal(game.mode as GameMode)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* MODALLAR: OYUN MODU SEÇİMİ, ODA PIN KATILIMI, LİDERLİK & DESTE SEÇİMİ       */}
      {/* ========================================================================= */}

      {/* 1. Oyun Modu Seçimi (Tek Başına vs Sınıfça Canlı) Modalı */}
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

      {/* 2. Sınıf Liderlik Modalı */}
      <ClassLeaderboardModal
        isOpen={isClassLeaderboardOpen}
        onClose={() => setIsClassLeaderboardOpen(false)}
        onOpenJoinCode={() => setIsJoinCodeModalOpen(true)}
      />

      {/* 3. Genel Liderlik Modalı */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        userId={user?.id}
      />

      {/* 4. Canlı Katılım Kodu Giriş Modalı */}
      <JoinCodeModal
        isOpen={isJoinCodeModalOpen}
        onClose={() => setIsJoinCodeModalOpen(false)}
        onJoinSuccess={(shareData) => {
          setIsJoinCodeModalOpen(false);
          router.push("/classroom?joinCode=" + encodeURIComponent(shareData?.code || ""));
        }}
      />

      {/* 4.5 Sandık Mağazası & Gacha Çarkı Modalı */}
      <ChestOpenModal
        isOpen={isChestModalOpen}
        onClose={() => setIsChestModalOpen(false)}
        userGold={userProfile.gold}
        userLearnedWords={learnedWordsCount}
        onGoldChange={(newGold) => {
          setUserProfile((prev) => ({ ...prev, gold: newGold }));
        }}
      />

      {/* 5. Deste Seçim Modalı */}
      {(pendingGameMode || isDeckPickerOpen) && (
        <div
          onClick={() => {
            setPendingGameMode(null);
            setIsDeckPickerOpen(false);
          }}
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
                  <h3 className="text-base font-bold text-white">Çalışılacak Desteyi Seçin</h3>
                  <p className="text-xs text-slate-400">
                    {pendingGameMode
                      ? "Oyun bu destedeki kelimelerle tam ekran başlatılacaktır"
                      : "Seçtiğiniz deste Oyun Arenası, Okuma ve Speaking için aktifleşir"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPendingGameMode(null);
                  setIsDeckPickerOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deste Listesi */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {decks.map((deck) => {
                const isCurrent = activeDeck?.id === deck.id;
                return (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => handleSelectDeckAndLaunch(deck)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                      isCurrent
                        ? "bg-indigo-950/40 border-2 border-indigo-500 shadow-md"
                        : "bg-slate-950 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">
                          {deck.title}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {deck.description || "Hazır kelime çalışma seti"}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-xs shrink-0 shadow-sm transition">
                      {pendingGameMode ? "Başlat ➔" : "Seç ✓"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5.5 İntikam Arenası (Unutma Destesi Telafi) Modalı */}
      <RevengeArenaModal
        isOpen={isRevengeModalOpen}
        onClose={() => setIsRevengeModalOpen(false)}
        onAwardXP={(amount, label) => {
          setUserProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
        }}
      />

      {/* 5.6 Vocaship Grandmaster (1000 Kelime) Zafer Modalı */}
      <GrandmasterCelebrationModal
        isOpen={isGrandmasterModalOpen}
        onClose={() => setIsGrandmasterModalOpen(false)}
        avatarUrl={profileData?.avatar_url || "/avatars/presets/avatar_01.svg"}
        userName={profileData?.username ? `@${profileData.username}` : (profileData?.full_name || "Kaşif")}
      />

      {/* Avatar Seçici Modal (ProfileContext Sync) */}
      <AvatarPickerModal
        isOpen={isAvatarStudioOpen}
        onClose={() => setIsAvatarStudioOpen(false)}
      />

      {/* ========================================================================= */}
      {/* 6. TAM EKRAN OYUN MERKEZİ (FULLSCREEN FOCUS LAUNCHERS)                     */}
      {/* ========================================================================= */}

      {/* 1. EJDERHA BASKINI (BossFightGame) */}
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

      {/* 2. HAZİNE AVI: ALTIN BASKINI (GoldQuestGame) */}
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

      {/* 3. KART EŞLEŞTİRME (MatchGame) */}
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

      {/* 4. YERÇEKİMİ SAVUNMASI (GravityGame) */}
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

      {/* 5. HIZLI KOMBO (SpeedRecallGame - Dinamik Süre) */}
      {activeGame === "speed_recall" && (
        <SpeedRecallGame
          cards={activeCards}
          deckTitle={activeDeck?.title}
          timeLimit={speedRecallTimeLimit}
          onClose={handleExitGame}
          onAwardXP={(amount) => {
            setUserProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
          }}
        />
      )}

      {/* 6. HARF AVI (WordScrambleGame) */}
      {activeGame === "word_scramble" && (
        <WordScrambleGame
          cards={activeCards}
          deckTitle={activeDeck?.title || "Harf Avı (Word Scramble)"}
          onClose={handleExitGame}
          onAwardXP={(amount) => {
            setUserProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
          }}
          onAwardGold={(amount) => {
            setUserProfile((prev) => ({ ...prev, gold: prev.gold + amount }));
          }}
        />
      )}

      {/* 7. SINIFÇA ORTAK BOSS BASKINI (CoopBossArena) */}
      {activeGame === "coop_boss" && (
        <CoopBossArena
          cards={activeCards}
          deckTitle={activeDeck?.title || "10-A Ortak Kelime Havuzu"}
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
