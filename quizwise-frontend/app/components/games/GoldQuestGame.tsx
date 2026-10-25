"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  Sparkles,
  Timer,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  Flame,
  Zap,
  Crown,
  Volume2,
  VolumeX,
  Coins,
  Shield,
  HelpCircle
} from "lucide-react";
import { API_BASE } from "../../config";
import { useLanguage } from "../../context/LanguageContext";

export interface FlashcardItem {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{ definition: string; translation: string; part_of_speech?: string }>;
  example_sentences?: Array<{ en?: string; tr?: string; target?: string; source?: string; native?: string }>;
  collocations?: string[];
}

export interface GoldQuestGameProps {
  cards: FlashcardItem[];
  deckTitle?: string;
  userName?: string;
  onClose: () => void;
  onAwardXP?: (amount: number, label: string) => void;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  gold: number;
  isUser: boolean;
  color: string;
  recentChange?: number;
}

interface Question {
  card: FlashcardItem;
  prompt: string;
  phonetic?: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

type GamePhase = "START" | "QUESTION" | "FEEDBACK_WRONG" | "CHEST_SELECT" | "CHEST_REVEAL" | "STEAL_SELECT" | "GAME_OVER";

type ChestRewardType = "gold_25" | "gold_50" | "gold_100" | "multiplier_2x" | "steal" | "bomb";

interface ChestReward {
  type: ChestRewardType;
  title: string;
  description: string;
  icon: string;
  amount?: number;
}

const FALLBACK_WORDS: FlashcardItem[] = [
  { id: "fb-1", word: "Treasure", meanings: [{ translation: "Hazine", definition: "A quantity of precious metals or gems" }] },
  { id: "fb-2", word: "Adventure", meanings: [{ translation: "Macera", definition: "An unusual and exciting experience" }] },
  { id: "fb-3", word: "Courage", meanings: [{ translation: "Cesaret", definition: "The ability to do something that frightens one" }] },
  { id: "fb-4", word: "Discovery", meanings: [{ translation: "Keşif", definition: "The act of finding something unexpectedly" }] },
  { id: "fb-5", word: "Victory", meanings: [{ translation: "Zafer", definition: "An act of defeating an enemy or opponent" }] },
  { id: "fb-6", word: "Journey", meanings: [{ translation: "Yolculuk", definition: "An act of traveling from one place to another" }] },
  { id: "fb-7", word: "Island", meanings: [{ translation: "Ada", definition: "A piece of land surrounded by water" }] },
  { id: "fb-8", word: "Compass", meanings: [{ translation: "Pusula", definition: "An instrument containing a magnetized pointer" }] }
];

export default function GoldQuestGame({
  cards,
  deckTitle = "Kelime Destesi",
  userName = "Sen",
  onClose,
  onAwardXP
}: GoldQuestGameProps) {
  const { t } = useLanguage();
  // Aktif kelimeler havuzu
  const pool = useMemo(() => {
    const valid = cards && cards.length >= 2 ? cards : FALLBACK_WORDS;
    return valid;
  }, [cards]);

  // Ses Durumu
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Oyun Durumları
  const [phase, setPhase] = useState<GamePhase>("START");
  const [timeLeft, setTimeLeft] = useState(180); // 3 dakika = 180 saniye
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, goldEarned: 0 });

  // Canlı Sınıf Arkadaşları
  const [players, setPlayers] = useState<Player[]>([
    { id: "user", name: userName, avatar: "🤠", gold: 0, isUser: true, color: "from-amber-500 to-yellow-400" },
    { id: "p1", name: "Zeynep", avatar: "👩‍🎓", gold: 130, isUser: false, color: "from-purple-500 to-indigo-500" },
    { id: "p2", name: "Can", avatar: "🧑‍🚀", gold: 110, isUser: false, color: "from-blue-500 to-cyan-500" },
    { id: "p3", name: "Defne", avatar: "👩‍🎨", gold: 85, isUser: false, color: "from-emerald-500 to-teal-500" },
    { id: "p4", name: "Emir", avatar: "🧑‍💻", gold: 70, isUser: false, color: "from-rose-500 to-orange-500" }
  ]);

  // Canlı Olay Akışı (Ticker)
  const [activityFeed, setActivityFeed] = useState<string[]>([]);

  // Sandık Durumu
  const [selectedChestIdx, setSelectedChestIdx] = useState<number | null>(null);
  const [chestRewards, setChestRewards] = useState<ChestReward[]>([]);
  const [activeReward, setActiveReward] = useState<ChestReward | null>(null);
  const [stealVictim, setStealVictim] = useState<Player | null>(null);

  // Ses Efektleri (Web Audio API)
  const playSound = (type: "correct" | "wrong" | "chest" | "gold" | "bomb" | "steal" | "gameover") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(164.81, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "chest" || type === "gold") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "bomb") {
        osc.type = "square";
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "steal") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.1);
        osc.frequency.setValueAtTime(750, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "gameover") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.15);
        osc.frequency.setValueAtTime(659.25, now + 0.3);
        osc.frequency.setValueAtTime(880, now + 0.45);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Soru Üretici
  const generateQuestion = (idx: number): Question => {
    const card = pool[idx % pool.length];
    const wordLower = (card.word || "").trim().toLowerCase();

    // Fallback sözlük
    const quickDict: Record<string, string> = {
      animal: "hayvan",
      dog: "köpek",
      cat: "kedi",
      apple: "elma",
      orange: "portakal, turuncu",
      routine: "rutin, alışılmış düzen",
      repair: "tamir etmek, onarmak",
      squirrel: "sincap",
      pocket: "cep",
      cacophonous: "kulak tırmalayıcı, ahenksiz",
      mitigate: "hafifletmek, azaltmak",
      ubiquitous: "her yerde bulunan, yaygın",
      ephemeral: "geçici, kısa ömürlü",
      resilient: "dirençli, dayanıklı",
      detrimental: "zararlı, hasar verici",
      treasure: "hazine",
      adventure: "macera",
      courage: "cesaret",
      discovery: "keşif",
      victory: "zafer",
      journey: "yolculuk",
      island: "ada",
      compass: "pusula"
    };

    let rawMeaning = (card.meanings?.[0]?.translation || card.meanings?.[0]?.definition || "").trim();
    if (!rawMeaning || rawMeaning.toLowerCase() === wordLower) {
      rawMeaning = quickDict[wordLower] || rawMeaning || "Anlam";
    }
    const correctMeaning = rawMeaning;

    // Diğer kartlardan yanlış şıklar üret
    const otherCards = pool.filter((c) => c.id !== card.id);
    const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random()).slice(0, 3);

    // Eğer havuzda az kelime varsa alternatif dolgular
    const wrongOptions = shuffledOthers
      .map((c) => {
        const cLower = (c.word || "").trim().toLowerCase();
        let m = (c.meanings?.[0]?.translation || c.meanings?.[0]?.definition || "").trim();
        if (!m || m.toLowerCase() === cLower) {
          m = quickDict[cLower] || m;
        }
        return m;
      })
      .filter((t) => t && t.toLowerCase() !== correctMeaning.toLowerCase() && t.toLowerCase() !== wordLower);

    while (wrongOptions.length < 3) {
      const genericDummies = ["Hazine", "Pusula", "Yolculuk", "Ada", "Kaptan", "Harita", "Elma", "Zafer", "Macera"];
      const dummy = genericDummies[Math.floor(Math.random() * genericDummies.length)];
      if (!wrongOptions.includes(dummy) && dummy.toLowerCase() !== correctMeaning.toLowerCase() && dummy.toLowerCase() !== wordLower) {
        wrongOptions.push(dummy);
      }
    }

    const options = [
      { text: correctMeaning, isCorrect: true },
      ...wrongOptions.map((text) => ({ text, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());

    return {
      card,
      prompt: card.word,
      phonetic: card.phonetic,
      options
    };
  };

  // Rastgele Sandık Ödülleri Üretici
  const rollChestRewards = (): ChestReward[] => {
    const possibleRewards: ChestReward[] = [
      { type: "gold_25", title: "+25 Altın", description: "Küçük bir hazine sandığı buldun!", icon: "💰", amount: 25 },
      { type: "gold_50", title: "+50 Altın", description: "Korsan altınları!", icon: "💎", amount: 50 },
      { type: "gold_100", title: "+100 Altın!", description: "Büyük ganimet çantası!", icon: "👑", amount: 100 },
      { type: "multiplier_2x", title: "2x Çarpan! 🔥", description: "Tüm altınların 2 katına çıktı!", icon: "⚡" },
      { type: "steal", title: "Altın Çalma! 🏴‍☠️", description: "Bir arkadaşının %25 altınını kap!", icon: "🥷" },
      { type: "bomb", title: "Korsan Tuzağı! 💣", description: "Güm! Altınlarının %20'si denize düştü!", icon: "💣" }
    ];

    // 3 sandık için ağırlıklı rastgele seçim
    const getWeighted = (): ChestReward => {
      const r = Math.random();
      if (r < 0.28) return possibleRewards[0]; // +25
      if (r < 0.58) return possibleRewards[1]; // +50
      if (r < 0.73) return possibleRewards[2]; // +100
      if (r < 0.85) return possibleRewards[3]; // 2x
      if (r < 0.94) return possibleRewards[4]; // Steal
      return possibleRewards[5]; // Bomb
    };

    return [getWeighted(), getWeighted(), getWeighted()];
  };

  // Oyunu Başlat
  const startGame = () => {
    setPhase("QUESTION");
    setTimeLeft(180);
    setStats({ correct: 0, wrong: 0, goldEarned: 0 });
    setPlayers((prev) => prev.map((p) => (p.isUser ? { ...p, gold: 0 } : p)));
    setQuestionIndex(0);
    setCurrentQuestion(generateQuestion(0));
    setSelectedOptionIdx(null);
  };

  // 3 Dakikalık Geri Sayım Sayacı
  useEffect(() => {
    if (phase === "START" || phase === "GAME_OVER") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Canlı Sınıf Arkadaşları Simülasyonu (Vocaship Canlı Yarış Hissi)
  useEffect(() => {
    if (phase === "START" || phase === "GAME_OVER") return;

    const botInterval = setInterval(() => {
      // Rastgele bir bot seç
      const bots = ["p1", "p2", "p3", "p4"];
      const botId = bots[Math.floor(Math.random() * bots.length)];
      const botAction = Math.random();

      setPlayers((prev) => {
        return prev.map((p) => {
          if (p.id !== botId) return p;

          let delta = 0;
          let actionText = "";

          if (botAction < 0.6) {
            delta = Math.random() < 0.5 ? 25 : 50;
            actionText = `${p.name} sandıktan +${delta} 💰 buldu!`;
          } else if (botAction < 0.75) {
            delta = 100;
            actionText = `${p.name} büyük ganimet (+100 💰) kaptı!`;
          } else if (botAction < 0.88) {
            delta = Math.floor(p.gold * 0.5);
            actionText = `${p.name} 2x Çarpan buldu! 🔥`;
          } else {
            delta = -Math.floor(p.gold * 0.2);
            actionText = `${p.name} korsan bombasına bastı! 💣`;
          }

          const newGold = Math.max(0, p.gold + delta);

          if (actionText) {
            setActivityFeed((feed) => [actionText, ...feed.slice(0, 3)]);
          }

          return { ...p, gold: newGold, recentChange: delta };
        });
      });
    }, 4500);

    return () => clearInterval(botInterval);
  }, [phase]);

  // Soruya Yanıt Verme
  const handleAnswer = (optionIdx: number) => {
    if (selectedOptionIdx !== null || !currentQuestion) return;
    setSelectedOptionIdx(optionIdx);

    const isCorrect = currentQuestion.options[optionIdx].isCorrect;

    if (isCorrect) {
      playSound("correct");
      setStats((s) => ({ ...s, correct: s.correct + 1 }));

      // Sandık seçim ekranına geç
      const rewards = rollChestRewards();
      setChestRewards(rewards);
      setSelectedChestIdx(null);
      setActiveReward(null);

      setTimeout(() => {
        setPhase("CHEST_SELECT");
      }, 700);
    } else {
      playSound("wrong");
      setStats((s) => ({ ...s, wrong: s.wrong + 1 }));
      setPhase("FEEDBACK_WRONG");

      // Zayıf Nokta Avcısı: Yanlış cevabı zayıf havuzuna aktar
      const cardIdentifier = currentQuestion.card?.id && !currentQuestion.card.id.startsWith("fb-")
        ? currentQuestion.card.id
        : currentQuestion.card?.word;
      if (cardIdentifier) {
        fetch(`${API_BASE}/cards/${encodeURIComponent(cardIdentifier)}/review-result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_correct: false }),
        }).catch((err) => console.error("Hazine avı zayıf nokta güncelleme hatası:", err));
      }

      // 1.5 saniye sonra sıradaki soruya geç
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  // Sıradaki Soru
  const nextQuestion = () => {
    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    setCurrentQuestion(generateQuestion(nextIdx));
    setSelectedOptionIdx(null);
    setPhase("QUESTION");
  };

  // Sandık Seçimi
  const handleSelectChest = (chestIdx: number) => {
    if (selectedChestIdx !== null) return;
    setSelectedChestIdx(chestIdx);
    const reward = chestRewards[chestIdx];
    setActiveReward(reward);
    setPhase("CHEST_REVEAL");

    // Ödül mantığını uygula
    if (reward.type === "gold_25" || reward.type === "gold_50" || reward.type === "gold_100") {
      playSound("gold");
      const amount = reward.amount || 25;
      updateUserGold(amount);
      setStats((s) => ({ ...s, goldEarned: s.goldEarned + amount }));
    } else if (reward.type === "multiplier_2x") {
      playSound("gold");
      setPlayers((prev) =>
        prev.map((p) => {
          if (!p.isUser) return p;
          const bonus = p.gold === 0 ? 50 : p.gold;
          setStats((s) => ({ ...s, goldEarned: s.goldEarned + bonus }));
          return { ...p, gold: p.gold + bonus, recentChange: bonus };
        })
      );
    } else if (reward.type === "bomb") {
      playSound("bomb");
      setPlayers((prev) =>
        prev.map((p) => {
          if (!p.isUser) return p;
          const loss = Math.max(15, Math.floor(p.gold * 0.2));
          return { ...p, gold: Math.max(0, p.gold - loss), recentChange: -loss };
        })
      );
    } else if (reward.type === "steal") {
      playSound("steal");
      // Steal seçim ekranını aç
      setTimeout(() => {
        setPhase("STEAL_SELECT");
      }, 1000);
    }
  };

  // Kullanıcı Altınını Güncelle
  const updateUserGold = (delta: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.isUser ? { ...p, gold: Math.max(0, p.gold + delta), recentChange: delta } : p))
    );
  };

  // Altın Çalma (Steal Action)
  const handleStealFromPlayer = (victim: Player) => {
    setStealVictim(victim);
    const stolenAmount = Math.max(20, Math.floor(victim.gold * 0.25));

    playSound("gold");

    // Kurbanın altınını düşür, oyuncuya ekle
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === victim.id) {
          return { ...p, gold: Math.max(0, p.gold - stolenAmount), recentChange: -stolenAmount };
        }
        if (p.isUser) {
          return { ...p, gold: p.gold + stolenAmount, recentChange: stolenAmount };
        }
        return p;
      })
    );

    setStats((s) => ({ ...s, goldEarned: s.goldEarned + stolenAmount }));
    setActivityFeed((feed) => [`${victim.name}'den ${stolenAmount} 💰 çaldın! 🥷`, ...feed.slice(0, 3)]);

    setTimeout(() => {
      setStealVictim(null);
      nextQuestion();
    }, 1400);
  };

  // Oyunu Bitir & Şampiyonluk Podyumu
  const finishGame = () => {
    setPhase("GAME_OVER");
    playSound("gameover");

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Kullanıcının altınını ve XP kazancını hesapla
    const user = players.find((p) => p.isUser);
    const userGold = user?.gold || 0;

    // Sıralama kontrolü
    const sorted = [...players].sort((a, b) => b.gold - a.gold);
    const rank = sorted.findIndex((p) => p.isUser) + 1;

    let rankBonus = 0;
    if (rank === 1) rankBonus = 35;
    else if (rank === 2) rankBonus = 20;
    else if (rank === 3) rankBonus = 10;

    const baseXP = Math.floor(userGold * 0.15);
    const totalEarnedXP = Math.max(20, baseXP + rankBonus);

    if (onAwardXP) {
      onAwardXP(totalEarnedXP, `🏴‍☠️ Hazine Avı (${rank}. Sıra - +${totalEarnedXP} XP)`);
    }
  };

  // Sıralı Liderlik Listesi
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.gold - a.gold);
  }, [players]);

  const userRank = useMemo(() => {
    return sortedPlayers.findIndex((p) => p.isUser) + 1;
  }, [sortedPlayers]);

  const userGold = useMemo(() => {
    return players.find((p) => p.isUser)?.gold || 0;
  }, [players]);

  // Süre Formatlayıcı
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-950 border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col relative text-slate-100 min-h-[640px]">
      {/* Üst Bilgi Barı: Altın Sayacı, Geri Sayım Sayacı, Ses & Kapat Butonları */}
      <header className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/20 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-sm sm:text-base shadow-inner">
            <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="font-mono tracking-tight">{t("badge_gold_stat", "{amount} ALTIN", { amount: userGold.toLocaleString() })}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-300">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{t("badge_rank_stat", "{rank}. Sıra", { rank: userRank })}</span>
          </div>
        </div>

        {/* 3 Dakika Geri Sayım Sayacı */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border font-mono font-bold text-sm sm:text-base ${
              timeLeft <= 30
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse"
                : "bg-slate-900/90 border-slate-700 text-slate-200"
            }`}
          >
            <Timer className={`w-4 h-4 ${timeLeft <= 30 ? "text-rose-400" : "text-amber-400"}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Kontroller */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold transition"
          >
            {t("btn_leave_game", "Ayrıl")}
          </button>
        </div>
      </header>

      {/* Ana Oyun Alanı & Canlı Sağ Sıralama Çubuğu */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 relative">
        {/* SOL: Oyun Aşamaları (3 kolon) */}
        <div className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-b from-slate-950/40 to-slate-900/60">
          {/* 1. BAŞLANGIÇ EKRANI */}
          {phase === "START" && (
            <div className="max-w-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-pulse">
                <span className="text-4xl">🏴‍☠️</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {t("treasure_hunt_title", "Hazine & Altın Avı")}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {t("treasure_hunt_subtitle", "\"{deck}\" destesinden kelime sorularını doğru cevapla, gizemli sandıkları aç, rakiplerinden altın çal ve sınıf lideri ol!", { deck: deckTitle })}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-left text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{t("pirate_rules_title", "Korsan Kuralları:")}</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-slate-400">
                  <li>{t("pirate_rule_1", "Doğru cevaplar Altın Sandığı açma şansı verir.")}</li>
                  <li>{t("pirate_rule_2", "Sandıklardan +Altın, 2x Çarpan, Altın Çalma veya Bomba çıkabilir!")}</li>
                  <li>{t("pirate_rule_3", "Süre: 3 Dakika. En çok altını toplayan podyuma çıkar!")}</li>
                </ul>
              </div>

              <button
                onClick={startGame}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>{t("btn_start_treasure_action", "Hazine Avını Başlat! 🏴‍☠️ →")}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 2. SORU AŞAMASI */}
          {(phase === "QUESTION" || phase === "FEEDBACK_WRONG") && currentQuestion && (
            <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-200">
              {/* Soru Başlığı */}
              <div className="text-center space-y-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Kelime #{questionIndex + 1}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide pt-1">
                  {currentQuestion.prompt}
                </h3>
                {currentQuestion.phonetic && (
                  <p className="text-xs font-mono text-slate-400">{currentQuestion.phonetic}</p>
                )}
                <p className="text-xs text-slate-400 pt-1">Bu kelimenin doğru karşılığı hangisidir?</p>
              </div>

              {/* 4 Şık Butonu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedOptionIdx === optIdx;
                  const isWrongFeedback = phase === "FEEDBACK_WRONG" && isSelected && !opt.isCorrect;
                  const isCorrectFeedback = phase === "FEEDBACK_WRONG" && opt.isCorrect;

                  let style =
                    "bg-slate-900/90 border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 text-slate-200";

                  if (selectedOptionIdx !== null) {
                    if (opt.isCorrect) {
                      style = "bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50";
                    } else if (isWrongFeedback) {
                      style = "bg-rose-600/30 border-rose-500 text-rose-200 ring-2 ring-rose-500/50";
                    } else {
                      style = "bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={selectedOptionIdx !== null}
                      onClick={() => handleAnswer(optIdx)}
                      className={`p-4 rounded-2xl border text-sm sm:text-base font-bold transition-all text-left flex items-center justify-between gap-3 shadow-md ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-xs font-mono text-slate-300">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </div>
                      {isCorrectFeedback && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isWrongFeedback && <X className="w-5 h-5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {phase === "FEEDBACK_WRONG" && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-center text-xs font-semibold animate-pulse">
                  ❌ Yanlış cevap! Sandık açılamadı, sıradaki soruya geçiliyor...
                </div>
              )}
            </div>
          )}

          {/* 3. SANDIK SEÇİM EKRANI (CHEST_SELECT) */}
          {phase === "CHEST_SELECT" && (
            <div className="w-full max-w-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  🎯 Doğru Cevap!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Bir Hazine Sandığı Seç!
                </h3>
                <p className="text-xs text-slate-400">Sandıkların ardında gizlenmiş altınlar ve sürprizler var.</p>
              </div>

              {/* 3 Tıklanabilir Sandık */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4">
                {[0, 1, 2].map((cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => handleSelectChest(cIdx)}
                    className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/40 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-2 active:scale-95 flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl sm:text-5xl transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                      🎁
                    </div>
                    <span className="text-xs sm:text-sm font-black text-amber-300 group-hover:text-amber-200">
                      Sandık #{cIdx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Açmak İçin Tıkla
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. SANDIK AÇILMA & ÖDÜL GÖSTERİMİ (CHEST_REVEAL) */}
          {phase === "CHEST_REVEAL" && activeReward && (
            <div className="w-full max-w-md text-center space-y-6 animate-in zoom-in-75 duration-300">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-1 flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-bounce">
                <span className="text-5xl">{activeReward.icon}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {activeReward.title}
                </h3>
                <p className="text-sm text-slate-300">{activeReward.description}</p>
              </div>

              {/* Diğer Sandıklarda Ne Vardı? */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Diğer sandıklarda ne vardı?</span>
                <div className="flex justify-around items-center pt-1 text-[11px]">
                  {chestRewards.map((cr, idx) => (
                    <span key={idx} className={idx === selectedChestIdx ? "text-amber-400 font-bold" : "text-slate-500"}>
                      #{idx + 1}: {cr.title}
                    </span>
                  ))}
                </div>
              </div>

              {activeReward.type !== "steal" && (
                <button
                  onClick={nextQuestion}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2"
                >
                  <span>Sonraki Soruya Geç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* 5. ALTIN ÇALMA MODALI (STEAL_SELECT) */}
          {phase === "STEAL_SELECT" && (
            <div className="w-full max-w-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full border border-rose-400/20">
                  🏴‍☠️ Korsan Baskını
                </span>
                <h3 className="text-2xl font-black text-white">Kimin Altınını Çalacaksın?</h3>
                <p className="text-xs text-slate-400">Seçtiğin arkadaşının hazinesinin %25'ini anında kasanıza aktaracaksın!</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {players
                  .filter((p) => !p.isUser)
                  .map((player) => {
                    const stealable = Math.max(20, Math.floor(player.gold * 0.25));
                    return (
                      <button
                        key={player.id}
                        onClick={() => handleStealFromPlayer(player)}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400 hover:bg-slate-850 transition transform hover:-translate-y-1 text-left space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{player.avatar}</span>
                          <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                            +{stealable} 💰 Çal
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white group-hover:text-amber-300">
                            {player.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            Mevcut: <span className="font-mono text-slate-300">{player.gold}</span> 💰
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 6. OYUN SONU ŞAMPİYONLUK PODYUMU (GAME_OVER) */}
          {phase === "GAME_OVER" && (
            <div className="w-full max-w-lg text-center space-y-6 animate-in fade-in zoom-in-90 duration-500">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  ⏱️ Süre Doldu!
                </span>
                <h2 className="text-3xl font-black text-white">Hazine Avı Şampiyonası</h2>
                <p className="text-xs text-slate-300">İşte 3 dakikalık rekabetin ardından sınıf liderlik podyumu!</p>
              </div>

              {/* 3'lü Podyum Tasarımı (1st, 2nd, 3rd) */}
              <div className="pt-6 pb-2 flex items-end justify-center gap-3">
                {/* 2. Sıra */}
                {sortedPlayers[1] && (
                  <div className="flex flex-col items-center space-y-2 w-24 sm:w-28">
                    <span className="text-2xl">{sortedPlayers[1].avatar}</span>
                    <span className="text-xs font-bold text-slate-200 truncate w-full text-center">
                      {sortedPlayers[1].name}
                    </span>
                    <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-2 border-slate-400 flex flex-col items-center justify-center p-2 shadow-lg">
                      <span className="text-xl">🥈</span>
                      <span className="text-xs font-black text-slate-200 font-mono">
                        {sortedPlayers[1].gold} 💰
                      </span>
                    </div>
                  </div>
                )}

                {/* 1. Sıra (Şampiyon) */}
                {sortedPlayers[0] && (
                  <div className="flex flex-col items-center space-y-2 w-28 sm:w-32 -translate-y-2">
                    <div className="relative">
                      <Crown className="w-6 h-6 text-yellow-300 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                      <span className="text-3xl">{sortedPlayers[0].avatar}</span>
                    </div>
                    <span className="text-xs font-black text-amber-300 truncate w-full text-center">
                      {sortedPlayers[0].name}
                    </span>
                    <div className="w-full h-32 rounded-t-2xl bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 border-t-2 border-yellow-200 flex flex-col items-center justify-center p-2 shadow-2xl shadow-amber-500/40">
                      <span className="text-2xl">🥇</span>
                      <span className="text-sm font-black text-slate-950 font-mono">
                        {sortedPlayers[0].gold} 💰
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Sıra */}
                {sortedPlayers[2] && (
                  <div className="flex flex-col items-center space-y-2 w-24 sm:w-28">
                    <span className="text-2xl">{sortedPlayers[2].avatar}</span>
                    <span className="text-xs font-bold text-slate-200 truncate w-full text-center">
                      {sortedPlayers[2].name}
                    </span>
                    <div className="w-full h-16 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-2 border-amber-600 flex flex-col items-center justify-center p-2 shadow-md">
                      <span className="text-lg">🥉</span>
                      <span className="text-xs font-black text-amber-200 font-mono">
                        {sortedPlayers[2].gold} 💰
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Kullanıcı Skor Kartı */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between text-left">
                <div>
                  <div className="text-xs text-slate-400">Senin Sıralaman:</div>
                  <div className="text-base font-black text-white flex items-center gap-1.5">
                    <span>{userRank}. Sıradasın</span>
                    <span className="text-xs font-bold text-amber-400 font-mono">({userGold} Altın)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Kazanılan XP Bonusu:</div>
                  <div className="text-sm font-black text-emerald-400 flex items-center gap-1 justify-end">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>+{Math.max(20, Math.floor(userGold * 0.15) + (userRank === 1 ? 35 : userRank === 2 ? 20 : 10))} XP</span>
                  </div>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={startGame}
                  className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tekrar Oyna</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition"
                >
                  Desteye Dön
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SAĞ: Canlı Sınıf Sıralama Çubuğu (Live Leaderboard) & Olay Akışı */}
        <aside className="p-5 bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>{t("label_live_leaderboard", "CANLI SIRALAMA")}</span>
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Sıralama Listesi */}
            <div className="space-y-2">
              {sortedPlayers.map((player, idx) => {
                const isLeader = idx === 0;
                return (
                  <div
                    key={player.id}
                    className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between gap-2 ${
                      player.isUser
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md ring-1 ring-amber-400/40"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black font-mono shrink-0 ${
                        idx === 0
                          ? "bg-yellow-400 text-slate-950"
                          : idx === 1
                          ? "bg-slate-300 text-slate-950"
                          : idx === 2
                          ? "bg-amber-700 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-base shrink-0">{player.avatar}</span>
                      <span className={`text-xs font-bold truncate ${player.isUser ? "text-amber-300" : "text-slate-200"}`}>
                        {player.name} {player.isUser && `(${t("label_you", "Sen")})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs font-black text-amber-400 shrink-0">
                      <span>{player.gold}</span>
                      <span className="text-[10px]">💰</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canlı Olay Akışı (Ticker) */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Oyun Akışı</span>
            </span>
            <div className="space-y-1 min-h-[60px] text-[11px] text-slate-400">
              {activityFeed.length === 0 ? (
                <p className="text-slate-500 italic text-[10px]">Oyun başladığında olaylar burada akacak...</p>
              ) : (
                activityFeed.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="truncate animate-in fade-in slide-in-from-bottom-1 duration-200 text-slate-300">
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
