"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Gamepad2,
  Coins,
  Sparkles,
  Trophy,
  BrainCircuit,
  BookOpen,
  ArrowRight,
  Flame,
  Zap,
  Play,
  Layers,
  Crown,
  Swords,
  ShoppingBag,
  GraduationCap,
  Clock,
  Shuffle,
  CheckCircle2,
  RotateCcw,
  X,
  KeyRound,
  Check,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useExperience } from "../context/ExperienceContext";
import { API_BASE } from "../config";

interface Deck {
  id: string;
  title: string;
  description: string;
  card_count?: number;
}

// Varsayılan Akademik Kartlar (Eşleştirme ve Şifreli Kelime için)
const ACADEMIC_WORDS = [
  { word: "resilient", meaning: "Dirençli, çabuk toparlanan", clue: "Zorluklar karşısında esnek kalabilen", sentence: "The economy proved remarkably _______ following the financial crisis." },
  { word: "mitigate", meaning: "Hafifletmek, etkisini azaltmak", clue: "Zararlı bir etkinin şiddetini düşürmek", sentence: "Effective risk management helps _______ severe operational losses." },
  { word: "detrimental", meaning: "Zararlı, hasar verici", clue: "Bilişsel ve fiziksel sağlığa zarar veren", sentence: "Chronic sleep deprivation has a _______ impact on memory retention." },
  { word: "coherent", meaning: "Tutarlı, mantıklı ve uyumlu", clue: "Parçaları birbiriyle bütünlük arz eden", sentence: "The researcher presented a _______ argument supported by empirical data." },
  { word: "ubiquitous", meaning: "Her yerde bulunan, yaygın", clue: "Hemen her ortamda karşımıza çıkan", sentence: "Mobile smartphones have become _______ in modern urban life." },
  { word: "ephemeral", meaning: "Kısa ömürlü, geçici", clue: "Çok kısa süren, kalıcı olmayan", sentence: "Fame on social media is often _______, fading within days." },
];

export default function GamesHubPage() {
  const { t } = useLanguage();
  const { mode } = useExperience();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  // Egzersiz Modalleri Durumu
  const [activeModal, setActiveModal] = useState<"match" | "cipher" | "speed" | null>(null);
  const [selectedDeckForGame, setSelectedDeckForGame] = useState<Deck | null>(null);

  // --- KART EŞLEŞTİRME (MATCH LAB) OYUN STATE'İ ---
  interface MatchCardItem {
    id: string;
    text: string;
    pairId: string;
    type: "word" | "meaning";
    isMatched: boolean;
    word?: string;
  }
  const [matchCards, setMatchCards] = useState<MatchCardItem[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [matchTime, setMatchTime] = useState(0);
  const [matchGameOver, setMatchGameOver] = useState(false);
  const matchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- ŞİFRELİ KELİME (CIPHER LAB) OYUN STATE'İ ---
  const [cipherIndex, setCipherIndex] = useState(0);
  const [cipherInput, setCipherInput] = useState("");
  const [cipherFeedback, setCipherFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [cipherScore, setCipherScore] = useState(0);

  // --- SM-2 HIZ TESTİ STATE'İ ---
  const [speedIndex, setSpeedIndex] = useState(0);
  const [speedCountdown, setSpeedCountdown] = useState(5);
  const [speedFlipped, setSpeedFlipped] = useState(false);
  const [speedScore, setSpeedScore] = useState({ known: 0, forgotten: 0 });
  const [speedGameOver, setSpeedGameOver] = useState(false);
  const speedTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const res = await fetch(`${API_BASE}/decks`);
        if (res.ok) {
          const data = await res.json();
          setDecks(data || []);
        }
      } catch (err) {
        console.error("Desteler yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  // --- KART EŞLEŞTİRME BAŞLATICI ---
  const startMatchGame = (deck?: Deck) => {
    setSelectedDeckForGame(deck || null);
    const pairs = ACADEMIC_WORDS.slice(0, 6);
    const items: MatchCardItem[] = [];

    pairs.forEach((p, idx) => {
      items.push({
        id: `word_${idx}`,
        text: p.word,
        pairId: `pair_${idx}`,
        type: "word",
        isMatched: false,
        word: p.word,
      });
      items.push({
        id: `meaning_${idx}`,
        text: p.meaning,
        pairId: `pair_${idx}`,
        type: "meaning",
        isMatched: false,
        word: p.word,
      });
    });

    // Karıştır (Fisher-Yates)
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    setMatchCards(items);
    setSelectedCardIds([]);
    setMatchTime(0);
    setMatchGameOver(false);
    setActiveModal("match");

    if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    matchTimerRef.current = setInterval(() => {
      setMatchTime((prev) => prev + 1);
    }, 1000);
  };

  const handleCardClick = (card: MatchCardItem) => {
    if (card.isMatched || selectedCardIds.includes(card.id) || selectedCardIds.length >= 2) return;

    const newSelected = [...selectedCardIds, card.id];
    setSelectedCardIds(newSelected);

    if (newSelected.length === 2) {
      const firstCard = matchCards.find((c) => c.id === newSelected[0]);
      const secondCard = card;

      if (firstCard && firstCard.pairId === secondCard.pairId) {
        // Eşleşti!
        setTimeout(() => {
          setMatchCards((prev) =>
            prev.map((c) => (c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c))
          );
          setSelectedCardIds([]);

          // Tüm kartlar eşleşti mi?
          const remaining = matchCards.filter((c) => !c.isMatched && c.pairId !== firstCard.pairId);
          if (remaining.length === 0) {
            setMatchGameOver(true);
            if (matchTimerRef.current) clearInterval(matchTimerRef.current);
            confetti({ particleCount: 70, spread: 60 });
          }
        }, 300);
      } else {
        // Hatalı eşleşme: Yanlış yapılan kelimeleri zayıf havuzuna aktar
        const wordsToMark = [firstCard?.word, secondCard?.word].filter(Boolean) as string[];
        const uniqueWords = Array.from(new Set(wordsToMark));
        uniqueWords.forEach((w) => {
          fetch(`${API_BASE}/cards/${encodeURIComponent(w)}/review-result`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_correct: false }),
          }).catch((err) => console.error("Eşleştirme hatası zayıf havuza aktarılamadı:", err));
        });

        setTimeout(() => {
          setSelectedCardIds([]);
        }, 700);
      }
    }
  };

  // --- ŞİFRELİ KELİME BAŞLATICI ---
  const startCipherGame = () => {
    setCipherIndex(0);
    setCipherInput("");
    setCipherFeedback("idle");
    setCipherScore(0);
    setActiveModal("cipher");
  };

  const handleCheckCipher = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentWord = ACADEMIC_WORDS[cipherIndex]?.word.toLowerCase().trim();
    if (cipherInput.toLowerCase().trim() === currentWord) {
      setCipherFeedback("correct");
      setCipherScore((prev) => prev + 1);
      confetti({ particleCount: 40, spread: 50 });
      setTimeout(() => {
        if (cipherIndex < ACADEMIC_WORDS.length - 1) {
          setCipherIndex((prev) => prev + 1);
          setCipherInput("");
          setCipherFeedback("idle");
        }
      }, 1200);
    } else {
      setCipherFeedback("wrong");
      const missedWord = ACADEMIC_WORDS[cipherIndex]?.word;
      if (missedWord) {
        fetch(`${API_BASE}/cards/${encodeURIComponent(missedWord)}/review-result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_correct: false }),
        }).catch((err) => console.error("Şifreli kelime hatası zayıf havuza aktarılamadı:", err));
      }
    }
  };

  // --- SM-2 HIZ TESTİ BAŞLATICI ---
  const startSpeedTest = () => {
    setSpeedIndex(0);
    setSpeedCountdown(5);
    setSpeedFlipped(false);
    setSpeedScore({ known: 0, forgotten: 0 });
    setSpeedGameOver(false);
    setActiveModal("speed");

    if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    speedTimerRef.current = setInterval(() => {
      setSpeedCountdown((prev) => {
        if (prev <= 1) {
          setSpeedFlipped(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSpeedAnswer = (remembered: boolean) => {
    if (remembered) {
      setSpeedScore((s) => ({ ...s, known: s.known + 1 }));
    } else {
      setSpeedScore((s) => ({ ...s, forgotten: s.forgotten + 1 }));
      const missedWord = ACADEMIC_WORDS[speedIndex]?.word;
      if (missedWord) {
        fetch(`${API_BASE}/cards/${encodeURIComponent(missedWord)}/review-result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_correct: false }),
        }).catch((err) => console.error("Hız testi hatası zayıf havuza aktarılamadı:", err));
      }
    }

    if (speedIndex < ACADEMIC_WORDS.length - 1) {
      setSpeedIndex((prev) => prev + 1);
      setSpeedCountdown(5);
      setSpeedFlipped(false);
    } else {
      setSpeedGameOver(true);
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
      confetti({ particleCount: 60, spread: 60 });
    }
  };

  // Modal kapatma temizleyicisi
  const handleCloseModal = () => {
    if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    setActiveModal(null);
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. BAŞLIK VE PERSONA VİTRİNİ */}
      <div className="text-center max-w-3xl mx-auto">
        {mode === "academic" ? (
          <>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-4 shadow-sm">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>{t("cog_lab_badge", "BİLİŞSEL HAFIZA & ODAK LABORATUVARI")}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              🧠 Hafıza & Odak Egzersizleri
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {t("cog_lab_desc", "SuperMemo-2 bilimsel unutma eğrisi, anlamsal eşleştirme refleksleri ve akademik odak testleriyle kelimeleri uzun süreli belleğinize kaydedin.")}
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4 shadow-sm">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>{t("blooket_subtitle")}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              {t("heading_games")}
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              {t("desc_games")}
            </p>
          </>
        )}
      </div>

      {/* 2. PERSONA BAZLI ÖNE ÇIKAN OYUN MODLARI */}
      {mode === "academic" ? (
        /* ==================== AKADEMİK MOD SPOTTU ==================== */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. KART EŞLEŞTİRME (COGNITIVE MATCH) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-2 border-indigo-500/40 hover:border-indigo-400 transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Hafıza & Çeviklik</span>
                  </span>
                  <span className="text-xs text-indigo-400/80 font-mono font-semibold">12 Kart (6 Çift)</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center gap-2">
                  <span>🃏 {t("card_match_title", "Kart Eşleştirme (Match)")}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  {t("card_match_desc", "İngilizce akademik terimler ile Türkçe karşılıklarını zamana karşı eşleştirin. Görsel ve anlamsal hafıza bağlarını hızlandırın.")}
                </p>

                <div className="space-y-2 mb-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Hatasız eşleştirme serisi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Anlık kronometre ve hız ölçümü</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => startMatchGame()}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>{t("btn_start_match", "Kart Eşleştirmeyi Başlat")}</span>
              </button>
            </div>

            {/* 2. SM-2 HIZ TESTİ (SPACED REPETITION BLITZ) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/40 hover:border-purple-400 transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                    <span>SM-2 Geri Çağırma</span>
                  </span>
                  <span className="text-xs text-purple-400/80 font-mono font-semibold">5 Sn / Soru</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center gap-2">
                  <span>⏱️ {t("card_speed_title", "SM-2 Bilişsel Hız Testi")}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  {t("card_speed_desc", "SuperMemo-2 algoritması ile unutma eşiğindeki akademik kelimeleri 5 saniyede geri çağırın. Aktif hatırlama refleksinizi ölçün.")}
                </p>

                <div className="space-y-2 mb-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Ebbinghaus unutma eğrisi simülasyonu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>Refleksif kelime tanıma skoru</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => startSpeedTest()}
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 transition active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{t("btn_start_speed", "SM-2 Hız Testini Başlat")}</span>
              </button>
            </div>

            {/* 3. ŞİFRELİ KELİME & AKIL OYUNU (CIPHER LAB) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/40 hover:border-emerald-400 transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bağlam & Anagram</span>
                  </span>
                  <span className="text-xs text-emerald-400/80 font-mono font-semibold">C1-B2 Akademik</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center gap-2">
                  <span>🔐 {t("card_cipher_title", "Şifreli Kelime & Akıl Oyunu")}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  {t("card_cipher_desc", "Örnek cümle bağlamı ve eksik harflerden yola çıkarak gizli akademik kelimeyi tahmin edin. Kelime köklerini zihninizde sabitleyin.")}
                </p>

                <div className="space-y-2 mb-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bağlam cümlesi ipuçları</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>YDS / TOEFL / Akademik format</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => startCipherGame()}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{t("btn_start_cipher", "Şifreli Kelimeyi Çöz")}</span>
              </button>
            </div>
          </div>

          {/* AKADEMİK MODDA ÇOCUKÇA OYUNLARI GERİ PLANA ALAN ZARİF MOLA ALANI */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <span>{t("break_area_title")}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {t("break_area_desc")}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/games/boss-fight"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Swords className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t("break_boss_btn")}</span>
                </Link>
                <Link
                  href="/games/gold-quest"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t("break_treasure_btn")}</span>
                </Link>
                <Link
                  href="/leaderboard"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-yellow-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{t("nav_leaderboard")}</span>
                </Link>
                <Link
                  href="/shop"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t("break_shop_btn")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== OYUN (ARCADE) MODU SPOTTU ==================== */
        <div className="space-y-12">
          {/* DEV AFİŞLER: BOSS FIGHT & HAZİNE AVI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. BOSS FIGHT (SINIF CANAVARI ARENASI) */}
            <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-2 border-rose-500/40 hover:border-rose-400 transition-all duration-300 shadow-xl hover:shadow-rose-500/10 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/30">
                    <Crown className="w-3.5 h-3.5 fill-current text-rose-400" />
                    <span>{t("class_dragon_mode")}</span>
                  </span>
                  <span className="text-xs text-rose-400/90 font-bold flex items-center gap-1">
                    <Swords className="w-4 h-4" /> {t("badge_shared_hp")}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2">
                  <span>🐉 {t("boss_fight_title")}</span>
                </h2>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  {t("boss_fight_desc")}
                </p>

                <div className="flex flex-wrap gap-2.5 mb-6">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t("feat_shared_hp")}</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t("feat_combo_crit")}</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{t("feat_mvp_podium")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/games/boss-fight"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm transition-all shadow-lg shadow-rose-600/30 active:scale-95"
                >
                  <Swords className="w-4 h-4 fill-current" />
                  <span>{t("btn_join_boss_fight")} ({t("badge_shared_hp")})</span>
                </Link>
                <span className="text-xs text-slate-400">{t("tag_live_class")}</span>
              </div>
            </div>

            {/* 2. GOLD QUEST (HAZİNE AVI) */}
            <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/40 hover:border-amber-400 transition-all duration-300 shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    <span>{t("blooket_classic")}</span>
                  </span>
                  <span className="text-xs text-amber-400/80 font-bold flex items-center gap-1">
                    <Coins className="w-4 h-4" /> {t("badge_chest_steal")}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2">
                  <span>🏴‍☠️ {t("treasure_raid_title")}</span>
                </h2>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  {t("treasure_raid_desc")}
                </p>

                <div className="flex flex-wrap gap-2.5 mb-6">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t("feat_gold_rewards")}</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t("feat_steal_gold")}</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{t("feat_live_leaderboard")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/games/gold-quest"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t("btn_start_treasure")}</span>
                </Link>
                <span className="text-xs text-slate-400">{t("tag_all_decks")}</span>
              </div>
            </div>
          </div>

          {/* DİĞER MODLAR & MAĞAZA GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. GİZEMLİ SANDIKLAR & MAĞAZA */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t("shop_chests_title")}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {t("shop_chests_desc")}
                </p>
              </div>
              <Link
                href="/shop"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-amber-300 border border-slate-800 transition"
              >
                <span>{t("shop_chests_btn")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2. CANLI LİDERLİK SIRALAMASI */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-yellow-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-4 border border-yellow-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t("leaderboard_card_title")}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {t("leaderboard_card_desc")}
                </p>
              </div>
              <Link
                href="/leaderboard"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-yellow-300 border border-slate-800 transition"
              >
                <span>{t("leaderboard_card_btn")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 3. OKUMA ODASI & QUIZ */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t("reading_quizzes_title")}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {t("reading_quizzes_desc")}
                </p>
              </div>
              <Link
                href="/reading"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-emerald-300 border border-slate-800 transition"
              >
                <span>{t("reading_quizzes_btn")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 4. SM-2 ÇALIŞMA KARTI */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t("sm2_marathon_title")}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {t("sm2_marathon_desc")}
                </p>
              </div>
              <Link
                href="/"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-indigo-300 border border-slate-800 transition"
              >
                <span>{t("sm2_marathon_btn")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. DESTELERİNLE HEMEN OYNA / ÇALIŞ BÖLÜMÜ */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === "academic" ? t("exercise_section_title", "Desteleriniz ile Bilişsel Egzersiz Başlatın") : t("quick_start_with_deck")}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === "academic"
                  ? t("exercise_section_desc", "Kendi kelime desteleriniz ile Eşleştirme (Match) veya SM-2 tekrar seansı başlatın.")
                  : t("quick_start_desc")}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Desteler yükleniyor...</div>
        ) : decks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            {t("no_decks_title")}.{" "}
            <Link href="/" className="text-indigo-400 underline font-bold">
              {t("btn_first_deck")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/40 transition group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {deck.title}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {deck.card_count || 0} {t("word_cards_count")}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {mode === "academic" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startMatchGame(deck)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition shadow-sm active:scale-95 cursor-pointer"
                        title="Kart Eşleştirme Modunda Oyna"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>{t("btn_match_deck", "Eşleştir")}</span>
                      </button>
                      <Link
                        href={`/study/${deck.id}`}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition shadow-sm active:scale-95"
                        title="SM-2 Kart Çalışması"
                      >
                        <BrainCircuit className="w-3.5 h-3.5" />
                        <span>SM-2</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/games/boss-fight?deckId=${deck.id}`}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition shadow-sm active:scale-95"
                        title="Boss Fight Modunda Başlat"
                      >
                        <Swords className="w-3.5 h-3.5 text-rose-400" />
                        <span>Boss</span>
                      </Link>
                      <Link
                        href={`/games/gold-quest?deckId=${deck.id}`}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition shadow-sm active:scale-95"
                        title="Gold Quest Modunda Başlat"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>{t("btn_gold_quest")}</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== 1. KART EŞLEŞTİRME (MATCH) MODALI ==================== */}
      {activeModal === "match" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Shuffle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t("card_match_title", "Kart Eşleştirme (Match Lab)")}</h3>
                  <p className="text-xs text-slate-400">İngilizce kelime ve Türkçe anlamları eşleştirin</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{matchTime} sn</span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {matchGameOver ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                  <Trophy className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-white">Tebrikler! Mükemmel Odaklanma</h4>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Tüm 6 kart çiftini <strong className="text-indigo-400">{matchTime} saniyede</strong> başarıyla eşleştirdiniz!
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => startMatchGame(selectedDeckForGame || undefined)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Tekrar Oyna</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {matchCards.map((card) => {
                  const isSelected = selectedCardIds.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={card.isMatched}
                      onClick={() => handleCardClick(card)}
                      className={`min-h-[90px] p-3 rounded-2xl border text-center flex items-center justify-center transition-all duration-150 select-none cursor-pointer ${
                        card.isMatched
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-40 cursor-default scale-95"
                          : isSelected
                          ? "bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/50 scale-105"
                          : "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-900"
                      }`}
                    >
                      <span className={`text-xs font-bold ${card.type === "word" ? "font-mono" : ""}`}>
                        {card.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 2. ŞİFRELİ KELİME (CIPHER) MODALI ==================== */}
      {activeModal === "cipher" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t("cipher_lab_title", "Şifreli Kelime (Cipher Lab)")}</h3>
                  <p className="text-xs text-slate-400">{t("cipher_lab_desc", "İpucu ve bağlam cümlesinden gizli kelimeyi çözün")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  {t("cipher_score", "Skor: {cur} / {total}", { cur: cipherScore, total: ACADEMIC_WORDS.length })}
                </span>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {cipherIndex >= ACADEMIC_WORDS.length ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-white">Tüm Kelimeler Çözüldü!</h4>
                <p className="text-sm text-slate-300">
                  Akademik kelime dağarcığınız mükemmel seviyede.
                </p>
                <button
                  type="button"
                  onClick={startCipherGame}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Tekrar Başlat
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* İpucu ve Cümle */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{t("label_turkish_meaning", "Anlamı:")}</span>
                    <span className="text-emerald-300 font-bold">{ACADEMIC_WORDS[cipherIndex]?.meaning}</span>
                  </div>
                  <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 leading-relaxed">
                    <span className="text-slate-500 block mb-1 font-semibold uppercase text-[10px]">{t("label_context_sentence", "BAĞLAM CÜMLESİ:")}</span>
                    <p className="italic text-slate-200">"{ACADEMIC_WORDS[cipherIndex]?.sentence}"</p>
                  </div>
                </div>

                {/* Maskelenmiş Kelime Görseli */}
                <div className="flex justify-center items-center gap-2 flex-wrap py-2">
                  {ACADEMIC_WORDS[cipherIndex]?.word.split("").map((letter, idx) => {
                    // İlk ve son harfi veya bazı harfleri göster
                    const isRevealed = idx === 0 || idx === ACADEMIC_WORDS[cipherIndex]?.word.length - 1 || idx % 3 === 0;
                    return (
                      <div
                        key={idx}
                        className="w-10 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-base font-bold text-white shadow-inner"
                      >
                        {isRevealed ? letter.toUpperCase() : "_"}
                      </div>
                    );
                  })}
                </div>

                {/* Giriş Formu */}
                <form onSubmit={handleCheckCipher} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cipherInput}
                      onChange={(e) => {
                        setCipherInput(e.target.value);
                        setCipherFeedback("idle");
                      }}
                      placeholder={t("input_cipher_placeholder", "İngilizce kelimeyi buraya yazın...")}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      {t("btn_check_answer", "Kontrol Et")}
                    </button>
                  </div>

                  {cipherFeedback === "correct" && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Harika! Doğru Kelime: {ACADEMIC_WORDS[cipherIndex]?.word}</span>
                    </div>
                  )}

                  {cipherFeedback === "wrong" && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Yanıt hatalı, ipucunu inceleyip tekrar deneyin.</span>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 3. SM-2 HIZ TESTİ MODALI ==================== */}
      {activeModal === "speed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t("card_speed_title", "SM-2 Bilişsel Hız Testi")}</h3>
                  <p className="text-xs text-slate-400">5 saniyede anlamı zihninizde çağırın</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                  speedCountdown <= 2 ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse" : "bg-slate-950 text-purple-300 border-slate-800"
                }`}>
                  ⏱️ {speedCountdown}s
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {speedGameOver ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-white">Hız Testi Tamamlandı</h4>
                <p className="text-sm text-slate-300">
                  Hatırlanan: <strong className="text-emerald-400">{speedScore.known}</strong> • Tekrar Gereken: <strong className="text-rose-400">{speedScore.forgotten}</strong>
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={startSpeedTest}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Tekrar Dene
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Kelime Kartı */}
                <div className="min-h-[160px] p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    Kart {speedIndex + 1} / {ACADEMIC_WORDS.length}
                  </span>
                  <h4 className="text-2xl font-black text-white font-mono">
                    {ACADEMIC_WORDS[speedIndex]?.word}
                  </h4>

                  {speedFlipped ? (
                    <div className="pt-2 animate-in fade-in duration-200">
                      <p className="text-sm text-emerald-300 font-bold">
                        {ACADEMIC_WORDS[speedIndex]?.meaning}
                      </p>
                      <p className="text-xs text-slate-400 italic mt-1">
                        "{ACADEMIC_WORDS[speedIndex]?.sentence}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Zihninde Türkçe anlamını hatırla... (Kart açılacak)
                    </p>
                  )}
                </div>

                {/* Eylem Butonları */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSpeedAnswer(false)}
                    className="py-3 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    ❌ Unuttum / Hatırlayamadım
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpeedAnswer(true)}
                    className="py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    ✅ Hatırladım (Hızlı)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
