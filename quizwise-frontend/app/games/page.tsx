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
import { useAppTheme } from "../context/ThemeContext";
import AvatarPickerModal from "../components/profile/AvatarPickerModal";
import GameCard, { GameCardItem } from "../components/games/GameCard";
import GameModeSelectModal from "../components/games/GameModeSelectModal";
import JoinCodeModal from "../components/games/JoinCodeModal";
import ChestShopModal from "../components/shop/ChestShopModal";
import { CHESTS } from "../data/chestItems";
import { getLocalizedChestInfo } from "../data/collectionLocales";
import {
  getArenaMistakes,
  syncUnifiedWeakSpots,
  ARENA_MISTAKES_EVENT,
} from "../utils/arenaMistakes";
import {
  claimUnifiedPendingGold,
  getUnifiedAchievementStats,
} from "../utils/rewardEngine";
import {
  getActiveDeckId,
  setActiveDeckId,
  fetchDecksList,
  getActiveDeckCards,
  toFlashcardItems,
  subscribeToActiveDeck,
  DeckItem,
  GameWordPair,
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

export default function GamesPage() {
  const { t, language } = useLanguage();

  const gameDetails = useMemo<Record<GameMode, { title: string; badge: string; icon: React.ReactNode }>>(
    () => ({
      boss_fight: {
        title: t("game_boss_title"),
        badge: "Boss Fight",
        icon: <Swords className="w-5 h-5 text-rose-400" />,
      },
      coop_boss: {
        title: t("game_boss_coop_title"),
        badge: "Co-op Raid",
        icon: <Users className="w-5 h-5 text-amber-400" />,
      },
      gold_raid: {
        title: t("game_treasure_card_title"),
        badge: t("game_treasure_badge"),
        icon: <Coins className="w-5 h-5 text-amber-400" />,
      },
      match: {
        title: t("game_match_title"),
        badge: t("game_match_chip_2"),
        icon: <Shuffle className="w-5 h-5 text-indigo-400" />,
      },
      gravity: {
        title: t("game_gravity_title"),
        badge: t("game_gravity_tag"),
        icon: <Rocket className="w-5 h-5 text-rose-400" />,
      },
      speed_recall: {
        title: t("game_speed_title"),
        badge: t("game_speed_badge"),
        icon: <Zap className="w-5 h-5 text-cyan-400" />,
      },
      word_scramble: {
        title: t("game_scramble_title"),
        badge: t("game_scramble_tag"),
        icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      },
    }),
    [t]
  );

  const coreGames = useMemo<GameCardItem[]>(
    () => [
      {
        id: "game_boss_fight",
        mode: "boss_fight",
        title: t("game_boss_title"),
        badge: "Boss Fight & Co-op",
        tag: t("game_boss_tag"),
        description: t("game_boss_desc"),
        bgGradient: "from-rose-600 via-rose-700 to-purple-800",
        icon: <Swords className="w-6 h-6 text-amber-300 drop-shadow" />,
        featurePills: [
          { label: t("game_boss_chip_1"), icon: <Users className="w-3 h-3 text-amber-300" /> },
          { label: t("game_boss_chip_2"), icon: <Flame className="w-3 h-3 text-rose-400" /> },
        ],
        actionText: t("game_boss_cta"),
        actionBg: "bg-gradient-to-r from-rose-600 to-purple-700 hover:from-rose-500 hover:to-purple-600 text-white shadow-rose-600/30",
      },
      {
        id: "game_gold_raid",
        mode: "gold_raid",
        title: t("game_treasure_full_title"),
        badge: t("game_treasure_badge"),
        tag: t("game_treasure_tag"),
        description: t("game_treasure_desc"),
        bgGradient: "from-amber-500 via-amber-600 to-yellow-600",
        icon: <Coins className="w-6 h-6 text-yellow-100 drop-shadow" />,
        featurePills: [
          { label: t("game_treasure_chip_1"), icon: <Sparkles className="w-3 h-3 text-amber-400" /> },
          { label: t("game_treasure_chip_2"), icon: <Shield className="w-3 h-3 text-amber-300" /> },
        ],
        actionText: t("game_treasure_cta"),
        actionBg: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25",
      },
      {
        id: "game_match",
        mode: "match",
        title: t("game_match_title"),
        badge: t("game_match_chip_2"),
        tag: t("game_match_tag"),
        description: t("game_match_desc"),
        bgGradient: "from-indigo-600 via-purple-700 to-violet-800",
        icon: <Layers className="w-6 h-6 text-indigo-100 drop-shadow" />,
        featurePills: [
          { label: t("game_match_chip_1"), icon: <Sparkles className="w-3 h-3 text-indigo-400" /> },
          { label: t("mode_multi_podium"), icon: <Trophy className="w-3 h-3 text-amber-400" /> },
        ],
        actionText: t("game_match_cta"),
        actionBg: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30",
      },
      {
        id: "game_gravity",
        mode: "gravity",
        title: t("game_gravity_title"),
        badge: t("game_gravity_tag"),
        tag: t("game_gravity_chip_1"),
        description: t("game_gravity_desc"),
        bgGradient: "from-orange-600 via-red-600 to-red-700",
        icon: <Rocket className="w-6 h-6 text-orange-100 drop-shadow" />,
        featurePills: [
          { label: t("game_gravity_chip_1"), icon: <Target className="w-3 h-3 text-amber-400" /> },
          { label: t("game_gravity_chip_2"), icon: <Flame className="w-3 h-3 text-rose-400" /> },
        ],
        actionText: t("game_gravity_cta"),
        actionBg: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-orange-600/30",
      },
      {
        id: "game_speed_recall",
        mode: "speed_recall",
        title: t("game_speed_title"),
        badge: t("game_speed_badge"),
        tag: t("game_speed_tag"),
        description: t("game_speed_desc"),
        bgGradient: "from-cyan-500 via-blue-600 to-blue-700",
        icon: <Zap className="w-6 h-6 text-cyan-100 drop-shadow" />,
        featurePills: [
          { label: t("game_speed_chip_1"), icon: <Zap className="w-3 h-3 text-cyan-400" /> },
          { label: t("game_speed_chip_2"), icon: <Flame className="w-3 h-3 text-amber-400" /> },
        ],
        actionText: t("game_speed_cta"),
        actionBg: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30",
      },
      {
        id: "game_word_scramble",
        mode: "word_scramble",
        title: t("game_scramble_full_title"),
        badge: t("game_scramble_chip_1"),
        tag: t("game_scramble_tag"),
        description: t("game_scramble_desc"),
        bgGradient: "from-emerald-500 via-teal-600 to-teal-700",
        icon: <Sparkles className="w-6 h-6 text-emerald-100 drop-shadow" />,
        featurePills: [
          { label: t("game_scramble_chip_1"), icon: <Sparkles className="w-3 h-3 text-emerald-400" /> },
          { label: t("game_scramble_chip_2"), icon: <Trophy className="w-3 h-3 text-amber-300" /> },
        ],
        actionText: t("game_scramble_cta"),
        actionBg: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30",
      },
    ],
    [t]
  );
  const router = useRouter();
  const { user } = useAuth();
  const { persona } = usePersona();
  const { userProfile: profileData, setIsSettingsModalOpen } = useProfile();
  const { isDark } = useAppTheme();
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);

  // Modallar
  const [selectedModeForDialog, setSelectedModeForDialog] = useState<GameMode | null>(null);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isClassLeaderboardOpen, setIsClassLeaderboardOpen] = useState(false);
  const [isChestModalOpen, setIsChestModalOpen] = useState(false);
  const [learnedWordsCount, setLearnedWordsCount] = useState(0);

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
    gold: 0,
    xp: 0,
    streak: 0,
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
  const [activeCards, setActiveCards] = useState<GameWordPair[]>([]);
  const [deckCardsCache, setDeckCardsCache] = useState<Record<string, GameWordPair[]>>({});
  const [deckPickerWarning, setDeckPickerWarning] = useState<string | null>(null);
  const [loadingDeckId, setLoadingDeckId] = useState<string | null>(null);

  // Kullanıcı Profil Bilgisini Yükle ve Sessiz Altınları Teslim Et
  const fetchUserProfile = async () => {
    const { readUserRewardNumber, writeUserRewardNumber } = await import("../utils/rewardsStorage");
    let currentGold = 0;
    let currentXP = 0;
    let currentStreak = 0;

    try {
      const res = await fetch(`${API_BASE}/api/v1/gamification/profile`);
      if (res.ok) {
        const data = await res.json();
        currentGold = data.total_gold ?? 0;
        currentXP = data.total_xp ?? 0;
        currentStreak = data.streak_days ?? 0;
      } else if (typeof window !== "undefined") {
        currentGold = readUserRewardNumber("gold", 0);
        currentXP = readUserRewardNumber("xp", 0);
        currentStreak = readUserRewardNumber("streak", 0);
      }
    } catch {
      if (typeof window !== "undefined") {
        currentGold = readUserRewardNumber("gold", 0);
        currentXP = readUserRewardNumber("xp", 0);
        currentStreak = readUserRewardNumber("streak", 0);
      }
    }

    // Sessiz Altın Köprüsü: Okuma, Speaking ve SM-2 çalışmalarından biriken altınları topla
    const claimed = claimUnifiedPendingGold();
    if (claimed.total > 0) {
      setClaimedRewardBanner(claimed);
      currentGold += claimed.total;
      if (typeof window !== "undefined") {
        writeUserRewardNumber("gold", currentGold);
      }
    }

    const unifiedStats = getUnifiedAchievementStats();
    setLearnedWordsCount(unifiedStats.sm2LearnedWords);

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
        const cards = await getActiveDeckCards(currentDeck.id, false);
        setActiveCards(cards);
        setDeckCardsCache((prev) => ({ ...prev, [currentDeck!.id]: cards }));
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
      const cards = await getActiveDeckCards(newDeckId, false);
      setActiveCards(cards);
      setDeckCardsCache((prev) => ({ ...prev, [newDeckId]: cards }));
    });

    // İntikam Arenası & Zayıf Nokta Ortak Hata Sayısını Başlat ve Senkronize Et
    const updateMistakes = () => {
      const list = getArenaMistakes();
      setMistakesCount(list.length);
    };
    updateMistakes();
    syncUnifiedWeakSpots().then((synced) => {
      setMistakesCount(synced.length);
    });

    const handleMistakesUpdated = (e: any) => {
      const count = e.detail?.count ?? getArenaMistakes().length;
      setMistakesCount(count);
    };

    window.addEventListener(ARENA_MISTAKES_EVENT, handleMistakesUpdated);

    // URL üzerinden ?tab=shop veya #shop gelirse 3 sekmeli Sandık & Başarı Merkezi'ni doğrudan aç
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "shop" || window.location.hash === "#shop") {
        setIsChestModalOpen(true);
      }

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

  // "Çalışılacak Desteyi Seçin" modalı açıldığında her destenin gerçek kart sayısını ve kart listesini backend'den çek
  useEffect(() => {
    if (!pendingGameMode && !isDeckPickerOpen) return;
    setDeckPickerWarning(null);
    let cancelled = false;

    (async () => {
      const latestDecks = await fetchDecksList();
      if (cancelled) return;
      setDecks(latestDecks);

      const entries = await Promise.all(
        latestDecks.map(async (d) => {
          const cards = await getActiveDeckCards(d.id, false);
          return [d.id, cards] as const;
        })
      );
      if (cancelled) return;
      const nextCache: Record<string, GameWordPair[]> = {};
      for (const [id, cards] of entries) {
        nextCache[id] = cards;
      }
      setDeckCardsCache((prev) => ({ ...prev, ...nextCache }));
    })();

    return () => {
      cancelled = true;
    };
  }, [pendingGameMode, isDeckPickerOpen]);

  // Deste Seçildiğinde -> Tam Ekran Oyunu Başlat veya Aktif Desteyi Senkronize Et
  const handleSelectDeckAndLaunch = async (deck: DeckItem) => {
    setDeckPickerWarning(null);
    setLoadingDeckId(deck.id);

    const cards = await getActiveDeckCards(deck.id, false);
    setDeckCardsCache((prev) => ({ ...prev, [deck.id]: cards }));
    setLoadingDeckId(null);

    if (cards.length < 4) {
      setDeckPickerWarning(t("games_insufficient_words"));
      return;
    }

    setActiveDeck(deck);
    setActiveDeckId(deck.id);
    setActiveCards(cards);
    const modeToLaunch = pendingGameMode;
    setPendingGameMode(null);
    setIsDeckPickerOpen(false);

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
    <div
      className={`flex-1 w-full min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:overflow-hidden flex flex-col selection:bg-indigo-500 selection:text-white overflow-x-hidden transition-colors duration-200 ${
        isDark ? "bg-[#0B0F19] text-slate-100" : "bg-[#dce3ec] text-slate-900"
      }`}
    >
      {/* ========================================================================= */}
      {/* TEK EKRANA SIĞAN SPLIT-CONSOLE DÜZENİ (DİKEY SCROLL YOK)                  */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 py-3 flex-1 min-h-0 w-full grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-4 items-stretch">
        {/* ======================================================================= */}
        {/* SOL SÜTUN - ARENA BAŞLIĞI, DESTE SEÇİCİ, SAYAÇLAR & SANDIK MAĞAZASI    */}
        {/* ======================================================================= */}
        <aside
          className={`w-full lg:w-[310px] h-full min-h-0 flex-shrink-0 border rounded-3xl p-4 flex flex-col justify-between gap-3 backdrop-blur-md transition-colors ${
            isDark
              ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl"
              : "bg-[#f8fafc] border-slate-300 text-slate-900 shadow-sm"
          }`}
        >
          <div className="space-y-3">
            {/* 1. Taşınan Başlık & Tam Genişlik Deste Seçici Bloğu */}
            <div className={`space-y-2 pb-3 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <h1 className={`text-base font-black flex items-center gap-2 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                <span className="text-lg">🎮</span>
                <span>{t("games_arena_title")}</span>
              </h1>

              <button
                type="button"
                onClick={() => setIsDeckPickerOpen(true)}
                className={`w-full px-3 py-2 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
                    : "bg-white hover:bg-indigo-50 border-slate-300 text-slate-900"
                }`}
                title={t("games_select_active_deck")}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                  <span className="truncate">
                    📁 {activeDeck ? activeDeck.title : t("games_default_pool")}
                  </span>
                </span>
                <span className="text-[10px] opacity-70 shrink-0">▾</span>
              </button>
            </div>

            {/* 2. Kompakt Sayaçlar (3'lü Yan Yana) */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2 rounded-2xl border text-center space-y-0.5 ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-300"}`}>
                <div className={`flex items-center justify-center gap-1 text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <span>🪙</span>
                  <span>{t("games_gold_unit")}</span>
                </div>
                <span className={`text-xs sm:text-sm font-bold font-mono block truncate ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  {userProfile.gold}
                </span>
              </div>

              <div className={`p-2 rounded-2xl border text-center space-y-0.5 ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-300"}`}>
                <div className={`flex items-center justify-center gap-1 text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <Zap className={`w-3 h-3 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                  <span>{t("games_xp_unit")}</span>
                </div>
                <span className={`text-xs sm:text-sm font-bold font-mono block truncate ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                  {userProfile.xp}
                </span>
              </div>

              <div className={`p-2 rounded-2xl border text-center space-y-0.5 ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-300"}`}>
                <div className={`flex items-center justify-center gap-1 text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <Flame className={`w-3 h-3 ${isDark ? "text-rose-400" : "text-rose-600"}`} />
                  <span>{t("games_streak_unit")}</span>
                </div>
                <span className={`text-xs sm:text-sm font-bold font-mono block truncate ${isDark ? "text-rose-300" : "text-rose-700"}`}>
                  {userProfile.streak}🔥
                </span>
              </div>
            </div>

            {/* 3. İntikam Arenası & Lig Özeti (Kompakt Satırlar) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsRevengeModalOpen(true)}
                className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition cursor-pointer text-left ${
                  mistakesCount > 0
                    ? isDark
                      ? "bg-rose-500/15 border-rose-500/50 hover:bg-rose-500/25 shadow-sm shadow-rose-500/10 text-white ring-1 ring-rose-500/30"
                      : "bg-rose-100 border-rose-300 hover:bg-rose-200/80 shadow-sm text-rose-950 ring-1 ring-rose-300"
                    : isDark
                    ? "bg-slate-950/90 border-slate-800 hover:border-slate-700 text-slate-300"
                    : "bg-white border-slate-300 hover:border-slate-400 text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                      mistakesCount > 0
                        ? isDark
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : "bg-rose-200 text-rose-700 border-rose-300"
                        : isDark
                        ? "bg-slate-800 text-slate-400 border-slate-700"
                        : "bg-slate-100 text-slate-600 border-slate-300"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs font-bold block truncate ${isDark ? "text-white" : mistakesCount > 0 ? "text-rose-950" : "text-slate-900"}`}>
                      🎯 {t("games_revenge_arena")}
                    </span>
                    <span className={`text-[10px] block truncate ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {mistakesCount > 0
                        ? `${mistakesCount} ${t("lib_weak_spot")}`
                        : "✓ 0"}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    mistakesCount > 0
                      ? "bg-rose-600 text-white animate-pulse"
                      : isDark
                      ? "bg-slate-800 text-slate-400 border border-slate-700"
                      : "bg-slate-100 text-slate-700 border border-slate-300"
                  }`}
                >
                  {mistakesCount > 0 ? mistakesCount : "0"}
                </span>
              </button>

              <Link
                href="/leaderboard"
                className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition group cursor-pointer ${
                  isDark
                    ? "bg-slate-950/90 border-slate-800 hover:border-amber-500/40"
                    : "bg-white border-slate-300 hover:border-amber-400"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-xl border flex items-center justify-center text-sm shrink-0 ${isDark ? "bg-amber-500/15 border-amber-500/30" : "bg-amber-100 border-amber-300"}`}>
                    🏆
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs font-bold block truncate transition ${isDark ? "text-white group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-700"}`}>
                      {t("games_gold_league")}
                    </span>
                    <span className={`text-[10px] flex items-center gap-1 font-semibold truncate ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${isDark ? "bg-emerald-400" : "bg-emerald-600"}`} />
                      {t("games_promotion_zone")}
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold shrink-0 ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                  <span>{t("card_podium_badge")}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            </div>
          </div>

          {/* 4. Sandık Mağazası & Başarı Butonu (Sol Sütun En Alt - Tam Genişlik) */}
          <div className={`pt-2 border-t space-y-2 shrink-0 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <div className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-[11px] ${isDark ? "bg-slate-950/70 border-amber-500/20" : "bg-amber-50 border-amber-300"}`}>
              <span className={`font-semibold truncate ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                {activeSuggestedChest.icon} {getLocalizedChestInfo(activeSuggestedChest.id, { name: activeSuggestedChest.name.tr, badge: activeSuggestedChest.badge, description: activeSuggestedChest.description }, language).name}
              </span>
              <span
                className={`font-mono font-bold shrink-0 ${
                  learnedWordsCount >= activeSuggestedChest.requiredWords &&
                  userProfile.gold >= activeSuggestedChest.costGold
                    ? isDark ? "text-emerald-400" : "text-emerald-700"
                    : isDark ? "text-amber-400" : "text-amber-800"
                }`}
              >
                {activeSuggestedChest.costGold}🪙
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsChestModalOpen(true)}
              title={t("games_chest_shop_banner_title")}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
            >
              <span>{t("games_chest_shop_btn")}</span>
            </button>
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* SAĞ SÜTUN - DOĞRUDAN TAM EKRAN 3x2 OYUN VİTRİNİ                        */}
        {/* ======================================================================= */}
        <section className="flex-1 min-w-0 h-full min-h-0 flex flex-col">
          {/* Bütünleşik Sessiz Altın Köprüsü Yüzen Bildirim */}
          {claimedRewardBanner && claimedRewardBanner.total > 0 && (
            <div className="fixed top-20 right-4 z-40 max-w-md p-3.5 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shrink-0">
                  🪙
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-200">
                    {t("games_gold_claimed_banner", undefined, { total: claimedRewardBanner.total })}
                  </h3>
                  <p className="text-[11px] text-amber-300/80 font-medium">
                    {claimedRewardBanner.breakdown.sm2 ? `SM-2: +${claimedRewardBanner.breakdown.sm2} 🧠 ` : ""}
                    {claimedRewardBanner.breakdown.reading ? `${t("chest_stat_reading")}: +${claimedRewardBanner.breakdown.reading} 📖 ` : ""}
                    {claimedRewardBanner.breakdown.ai_story ? `${t("read_story_unit")}: +${claimedRewardBanner.breakdown.ai_story} ✨ ` : ""}
                    {claimedRewardBanner.breakdown.speaking ? `${t("chest_stat_speaking")}: +${claimedRewardBanner.breakdown.speaking} 🎙️` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClaimedRewardBanner(null)}
                className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-500/20 transition cursor-pointer"
                aria-label={t("lib_close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 6 Çekirdek Oyun Modu (Tam Ekran 3x2 Izgara) */}
          <div className="h-full min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-3.5">
            {coreGames.map((game) => (
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
              title: gameDetails[selectedModeForDialog].title,
              badge: gameDetails[selectedModeForDialog].badge,
              icon: gameDetails[selectedModeForDialog].icon,
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

      {/* 4.5 Tek Merkez: Sandık Mağazası & Başarı Merkezi Modalı */}
      <ChestShopModal
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
                  <h3 className="text-base font-bold text-white">{t("games_choose_deck_modal_title")}</h3>
                  <p className="text-xs text-slate-400">
                    {pendingGameMode
                      ? t("games_choose_deck_for_game")
                      : t("games_choose_deck_global")}
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

            {/* Yetersiz Kelime Uyarısı (< 4 kelime) */}
            {deckPickerWarning && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
                <span>⚠️ {deckPickerWarning}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPendingGameMode(null);
                    setIsDeckPickerOpen(false);
                    router.push("/");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-[11px] font-black shrink-0 transition cursor-pointer"
                >
                  {t("add_word")} ➔
                </button>
              </div>
            )}

            {/* Deste Listesi */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {decks.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    {t("games_no_decks_available")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingGameMode(null);
                      setIsDeckPickerOpen(false);
                      router.push("/");
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    {t("add_word")} ➔
                  </button>
                </div>
              ) : null}
              {decks.map((deck) => {
                const isCurrent = activeDeck?.id === deck.id;
                const realCards = deckCardsCache[deck.id];
                const realCount = realCards ? realCards.length : (deck.card_count ?? 0);
                const samplePreview =
                  realCards && realCards.length > 0
                    ? realCards
                      .slice(0, 4)
                      .map((c) => c.word)
                      .join(", ")
                    : deck.description || t("games_deck_default_desc");

                return (
                  <button
                    key={deck.id}
                    type="button"
                    disabled={loadingDeckId === deck.id}
                    onClick={() => handleSelectDeckAndLaunch(deck)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${isCurrent
                      ? "bg-indigo-950/40 border-2 border-indigo-500 shadow-md"
                      : "bg-slate-950 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50"
                      }`}
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">
                          {deck.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${realCount >= 4
                            ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                            : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            }`}
                        >
                          {realCount} {t("lib_word_unit")}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                            {t("chest_owned_badge")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {samplePreview}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-xs shrink-0 shadow-sm transition">
                      {loadingDeckId === deck.id
                        ? "..."
                        : pendingGameMode
                          ? t("games_start_arrow")
                          : t("games_select_check")}
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

      {/* 5.6 VocaShip Grandmaster (1000 Kelime) Zafer Modalı */}
      <GrandmasterCelebrationModal
        isOpen={isGrandmasterModalOpen}
        onClose={() => setIsGrandmasterModalOpen(false)}
        avatarUrl={profileData?.avatar_url || "/avatars/presets/avatar_01.svg"}
        userName={profileData?.username ? `@${profileData.username}` : (profileData?.full_name || t("games_explorer_fallback"))}
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
          deckTitle={activeDeck?.title || t("game_boss_title")}
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
            deckTitle={activeDeck?.title || t("game_treasure_full_title")}
            isSoloMode={true}
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
          deckTitle={activeDeck?.title || t("game_scramble_full_title")}
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
          deckTitle={activeDeck?.title || t("games_default_pool")}
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
