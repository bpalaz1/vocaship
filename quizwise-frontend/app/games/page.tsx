"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
  Target
} from "lucide-react";
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";

// Oyun Bileşenleri Dinamik Import
const GoldQuestGame = dynamic(() => import("../components/games/GoldQuestGame"), { ssr: false });
const MatchGame = dynamic(() => import("../components/games/MatchGame"), { ssr: false });
const GravityGame = dynamic(() => import("../components/games/GravityGame"), { ssr: false });
const SpeedRecallGame = dynamic(() => import("../components/games/SpeedRecallGame"), { ssr: false });

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

type GameMode = "gold_raid" | "match" | "gravity" | "speed_recall";

export default function GamesPage() {
  const { t } = useLanguage();

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

  // Oyun Kartına Tıklandığında -> Deste Seçimi Modalı Aç
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

      {/* 2. DÖRT ANA OYUN MODU KATALOĞU (BÜYÜK MODERN KARTLAR) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ========================================================================= */}
          {/* 1. 🏴‍☠️ HAZİNE AVI: ALTIN BASKINI (GOLD RAID)                               */}
          {/* ========================================================================= */}
          <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-2 border-amber-500/30 hover:border-amber-400/80 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{t("game_gold_raid_badge", "Sandık & Altın Baskını")}</span>
                </span>
                <span className="text-xs text-amber-400 font-mono font-bold">{t("game_gold_raid_multiplier", "2x Çarpan & Tuzak")}</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{t("game_gold_raid_title", "🏴‍☠️ Hazine Avı: Altın Baskını")}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {t("game_gold_raid_desc", "Doğru cevaplarla gizemli 3 sandıktan birini açın: Altın toplayın, 2x katlayıcı kazanın veya rakiplerin altınlarını çalın!")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t("game_gold_raid_chests", "3 Gizemli Sandık")}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t("game_gold_raid_steal", "Altın Çalma Hamlesi")}</span>
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleOpenDeckModal("gold_raid")}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t("game_gold_raid_btn", "Deste Seç ve Altın Baskınını Başlat")}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. 🃏 KART EŞLEŞTİRME (MATCH)                                             */}
          {/* ========================================================================= */}
          <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900 border-2 border-indigo-500/30 hover:border-indigo-400/80 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>{t("game_match_badge", "12'li Karışık Tablo")}</span>
                </span>
                <span className="text-xs text-indigo-400 font-mono font-bold">{t("game_match_timer", "Zamana Karşı")}</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{t("game_match_title", "🃏 Kart Eşleştirme (Match)")}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {t("game_match_desc", "12 kutulu tabloda İngilizce kelimelerle Türkçe anlamlarını zamana karşı eşleştirin. Doğru eşleşmede parlayıp kaybolsun!")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t("game_match_dissolve", "Yeşil Çözülme Efekti")}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t("game_match_podium", "Hızlı Süre Podyumu")}</span>
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleOpenDeckModal("match")}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>{t("game_match_btn", "Deste Seç ve Eşleştirmeyi Başlat")}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. ☄️ YERÇEKİMİ SAVUNMASI (GRAVITY)                                        */}
          {/* ========================================================================= */}
          <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border-2 border-rose-500/30 hover:border-rose-400/80 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t("game_gravity_badge", "Savunma & Yazım Refleksi")}</span>
                </span>
                <span className="text-xs text-rose-400 font-mono font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {t("game_gravity_lives", "3 Can")}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{t("game_gravity_title", "☄️ Yerçekimi Savunması (Gravity)")}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {t("game_gravity_desc", "Yukarıdan süzülen kelime asteroidini tabana çarpmadan Türkçe anlamını yazarak havada patlatın! Hızlanan dalgalara karşı hayatta kalın.")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Patlama Parçacık Efekti</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Kademeli Hızlanma</span>
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleOpenDeckModal("gravity")}
                className="w-full py-3.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>{t("game_gravity_btn", "Deste Seç ve Yerçekimi Savunmasını Başlat")}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. ⚡ 5s HIZLI KOMBO (SPEED RECALL)                                       */}
          {/* ========================================================================= */}
          <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-900 border-2 border-purple-500/30 hover:border-purple-400/80 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{t("game_speed_badge", "Seri Çoktan Seçmeli")}</span>
                </span>
                <span className="text-xs text-purple-400 font-mono font-bold">{t("game_speed_timer", "5 Saniye / Soru")}</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{t("game_speed_title", "⚡ 5s Hızlı Kombo (Speed Recall)")}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {t("game_speed_desc", "5 saniyelik zaman baskısında 4 seçenek arasından doğru anlamı yakalayın. Üst üste doğru cevaplarla alevli kombo puanı kazanın!")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hızlı Hatırlama Refleksi</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alevli Kombo Çarpanı</span>
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleOpenDeckModal("speed_recall")}
                className="w-full py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 transition active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{t("game_speed_btn", "Deste Seç ve 5s Komboyu Başlat")}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

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
    </div>
  );
}
