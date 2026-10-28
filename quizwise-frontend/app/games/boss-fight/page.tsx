"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { API_BASE } from "../../config";
import { triggerFloatingXP } from "../../components/FloatingXP";
import { useLanguage } from "../../context/LanguageContext";
import {
  Swords,
  Flame,
  Shield,
  Zap,
  Trophy,
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Sparkles,
  Layers,
  Crown,
  Heart,
  Loader2,
  Play
} from "lucide-react";

// Web Audio API Retro Arcade & RPG Ses Efektleri
const playSound = (type: "hit" | "crit" | "boss_attack" | "victory" | "click") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === "hit") {
      // Normal Vuruş (Kılıç Darbesi)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "crit") {
      // Kritik Vuruş (Çift Patlama)
      [440, 880, 1320].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
      });
    } else if (type === "boss_attack") {
      // Boss Karşı Saldırısı (Tok Kükreme)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "victory") {
      // Zafer Fanfarı
      const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      melody.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
      });
    }
  } catch (e) {
    // Ses desteği kısıtlıysa devam et
  }
};

interface FlashcardItem {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{ definition: string; translation: string; part_of_speech?: string }>;
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

interface BossProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  maxHp: number;
  color: string;
  bgGradient: string;
  description: string;
  attackName: string;
}

const BOSS_LIST: BossProfile[] = [
  {
    id: "ignis",
    name: "Volkanik Alev Ejderhası Ignis",
    title: "Magma & Kül Hükümdarı",
    avatar: "🐉",
    maxHp: 15000,
    color: "from-rose-500 to-amber-500",
    bgGradient: "from-rose-950/40 via-slate-900 to-slate-950",
    description: "Yanardağların magma kalbinden yükselen, alev püskürten göklerin kadim efendisi!",
    attackName: "Cehennem Alevi Püskürtmesi! 🔥",
  },
  {
    id: "colossus",
    name: "Kadim Rünik Golem Colossus",
    title: "Yenilmez Taş Muhafız",
    avatar: "🗿",
    maxHp: 20000,
    color: "from-emerald-500 to-teal-400",
    bgGradient: "from-emerald-950/40 via-slate-900 to-slate-950",
    description: "Bin yıllık rünik taşlardan oyulmuş devasa dağ devi!",
    attackName: "Tektonik Kaya Ezmesi! 💥",
  },
  {
    id: "void_lord",
    name: "Kozmik Karadelik Devi Void Lord",
    title: "Derin Uzay Titanı",
    avatar: "👾",
    maxHp: 25000,
    color: "from-purple-500 to-indigo-500",
    bgGradient: "from-purple-950/40 via-slate-900 to-slate-950",
    description: "Karanlık maddenin ve psişik fırtınaların efendisi, zamanı büken titanyum titan!",
    attackName: "Kozmik Psişik Patlama! 🌌",
  },
];

interface HeroParticipant {
  id: string;
  name: string;
  avatar: string;
  damage: number;
  hits: number;
  isUser: boolean;
  color: string;
}

interface DamageIndicator {
  id: string;
  text: string;
  isCrit: boolean;
  isHeal?: boolean;
}

const FALLBACK_CARDS: FlashcardItem[] = [
  { id: "c1", word: "Victory", meanings: [{ translation: "Zafer", definition: "Success in a fight or competition" }] },
  { id: "c2", word: "Courage", meanings: [{ translation: "Cesaret", definition: "Bravery in facing difficulty or pain" }] },
  { id: "c3", word: "Warrior", meanings: [{ translation: "Savaşçı", definition: "A brave or experienced soldier or fighter" }] },
  { id: "c4", word: "Colossal", meanings: [{ translation: "Devasa", definition: "Extremely large or magnificent" }] },
  { id: "c5", word: "Resilience", meanings: [{ translation: "Direnç / Dayanıklılık", definition: "The capacity to recover quickly from difficulties" }] },
  { id: "c6", word: "Immense", meanings: [{ translation: "Uçsuz bucaksız / Muazzam", definition: "Extremely large or great, especially in scale or degree" }] },
  { id: "c7", word: "Alliance", meanings: [{ translation: "İttifak / Birlik", definition: "A union or association formed for mutual benefit" }] },
  { id: "c8", word: "Dragon", meanings: [{ translation: "Ejderha", definition: "A mythical monster like a giant reptile" }] },
];


const VOCAB_TRANSLATIONS: Record<string, Record<string, string>> = {
  animal: { tr: "hayvan", de: "Tier", es: "animal", fr: "animal" },
  dog: { tr: "köpek", de: "Hund", es: "perro", fr: "chien" },
  cat: { tr: "kedi", de: "Katze", es: "gato", fr: "chat" },
  apple: { tr: "elma", de: "Apfel", es: "manzana", fr: "pomme" },
  orange: { tr: "portakal, turuncu", de: "Orange", es: "naranja", fr: "orange" },
  routine: { tr: "rutin, alışılmış düzen", de: "Routine", es: "rutina", fr: "routine" },
  repair: { tr: "tamir etmek, onarmak", de: "reparieren", es: "reparar", fr: "réparer" },
  squirrel: { tr: "sincap", de: "Eichhörnchen", es: "ardilla", fr: "écureuil" },
  pocket: { tr: "cep", de: "Tasche", es: "bolsillo", fr: "poche" },
  cacophonous: { tr: "kulak tırmalayıcı, ahenksiz", de: "kakophonisch", es: "cacofónico", fr: "cacophonique" },
  mitigate: { tr: "hafifletmek, azaltmak", de: "mildern", es: "mitigar", fr: "atténuer" },
  ubiquitous: { tr: "her yerde bulunan, yaygın", de: "allgegenwärtig", es: "omnipresente", fr: "omniprésent" },
  ephemeral: { tr: "geçici, kısa ömürlü", de: "flüchtig, vergänglich", es: "efímero", fr: "éphémère" },
  resilient: { tr: "dirençli, dayanıklı", de: "widerstandsfähig", es: "resiliente", fr: "résilient" },
  detrimental: { tr: "zararlı, hasar verici", de: "schädlich", es: "perjudicial", fr: "nuisible" },
  good: { tr: "iyi, güzel", de: "gut", es: "bueno", fr: "bon" },
  book: { tr: "kitap", de: "Buch", es: "libro", fr: "livre" },
  interest: { tr: "faiz / ilgi, çıkar", de: "Interesse / Zins", es: "interés", fr: "intérêt" },
  victory: { tr: "zafer", de: "Sieg", es: "victoria", fr: "victoire" },
  courage: { tr: "cesaret", de: "Mut", es: "coraje", fr: "courage" },
  warrior: { tr: "savaşçı", de: "Krieger", es: "guerrero", fr: "guerrier" },
  colossal: { tr: "devasa", de: "kolossal", es: "colosal", fr: "colossal" },
  resilience: { tr: "direnç / dayanıklılık", de: "Widerstandskraft", es: "resiliencia", fr: "résilience" },
  immense: { tr: "muazzam / uçsuz bucaksız", de: "immens", es: "inmenso", fr: "immense" },
  alliance: { tr: "ittifak / birlik", de: "Allianz", es: "alianza", fr: "alliance" },
  dragon: { tr: "ejderha", de: "Drache", es: "dragón", fr: "dragon" },
};

function getCardMeaning(card: FlashcardItem, lang: string = "tr"): string {
  const wordLower = (card.word || "").trim().toLowerCase();
  const rawTranslation = (card.meanings?.[0]?.translation || "").trim();
  const rawDefinition = (card.meanings?.[0]?.definition || "").trim();

  // If raw translation exists and is distinct from the English word
  if (rawTranslation && rawTranslation.toLowerCase() !== wordLower) {
    return rawTranslation;
  }
  // Check our offline translations
  if (VOCAB_TRANSLATIONS[wordLower]) {
    const lKey = lang as "tr" | "de" | "es" | "fr";
    if (VOCAB_TRANSLATIONS[wordLower][lKey]) {
      return VOCAB_TRANSLATIONS[wordLower][lKey];
    }
    if (VOCAB_TRANSLATIONS[wordLower].tr) {
      return VOCAB_TRANSLATIONS[wordLower].tr;
    }
  }
  // Check definition
  if (
    rawDefinition &&
    rawDefinition.toLowerCase() !== wordLower &&
    !rawDefinition.toLowerCase().startsWith("otomatik eklenen")
  ) {
    return rawDefinition;
  }
  return "";
}

function BossFightContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentLang, t } = useLanguage();
  const initialDeckId = searchParams.get("deckId");

  // Desteler ve Kartlar
  const [decks, setDecks] = useState<{ id: string; title: string; card_count?: number }[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(initialDeckId || "");
  const [cards, setCards] = useState<FlashcardItem[]>(FALLBACK_CARDS);
  const [deckTitle, setDeckTitle] = useState<string>("Genel Kelime Destesi");
  const [loadingCards, setLoadingCards] = useState(false);

  // Boss ve Savaş Durumu
  const [selectedBossIndex, setSelectedBossIndex] = useState(0);
  const activeBoss = BOSS_LIST[selectedBossIndex];

  const [bossHp, setBossHp] = useState(activeBoss.maxHp);
  const [bossState, setBossState] = useState<"idle" | "hit" | "counter_attack" | "defeated">("idle");
  const [damageIndicators, setDamageIndicators] = useState<DamageIndicator[]>([]);

  // Soru ve Yanıt Durumu
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);

  // Sınıf Katılımcıları (Canlı Hasar Listesi)
  const [heroes, setHeroes] = useState<HeroParticipant[]>([
    { id: "u-me", name: "Sen (Kahraman)", avatar: "🌟", damage: 0, hits: 0, isUser: true, color: "text-amber-300" },
    { id: "u-1", name: "Zeynep Kaya", avatar: "🦊", damage: 0, hits: 0, isUser: false, color: "text-orange-400" },
    { id: "u-2", name: "Can Yıldız", avatar: "🚀", damage: 0, hits: 0, isUser: false, color: "text-sky-400" },
    { id: "u-3", name: "Defne Yılmaz", avatar: "🦄", damage: 0, hits: 0, isUser: false, color: "text-pink-400" },
    { id: "u-4", name: "Emir Demir", avatar: "🦁", damage: 0, hits: 0, isUser: false, color: "text-yellow-400" },
  ]);

  // Savaş Günlüğü (Combat Log)
  const [combatLog, setCombatLog] = useState<string[]>([
    "⚔️ Sınıf Canavarı Arenası başladı! Tüm sınıf ortak bir canavara karşı savaşıyor!",
  ]);

  // Zafer ve Ödül
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 1. Desteleri Çek
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const res = await fetch(`${API_BASE}/decks`);
        if (res.ok) {
          const data = await res.json();
          setDecks(Array.isArray(data) ? data : []);
          if (!selectedDeckId && data && data.length > 0) {
            setSelectedDeckId(data[0].id);
          }
        } else {
          console.warn(`[fetchDecks] HTTP ${res.status}: Boş deste listesi kullanılıyor.`);
          setDecks([]);
        }
      } catch (err) {
        console.warn("Desteler yüklenemedi (sunucu kapalı veya ağ hatası), boş liste kullanılıyor:", err);
        setDecks([]);
      }
    };
    fetchDecks();
  }, []);

  // 2. Seçili Desteden Kartları Çek
  useEffect(() => {
    if (!selectedDeckId) return;
    const fetchCards = async () => {
      setLoadingCards(true);
      try {
        const res = await fetch(`${API_BASE}/decks/${selectedDeckId}/cards`);
        if (res.ok) {
          const data: any[] = await res.json();
          if (data && data.length > 0) {
            const formatted: FlashcardItem[] = data.map((d) => ({
              id: d.id,
              word: d.word,
              phonetic: d.phonetic,
              meanings: Array.isArray(d.meanings) ? d.meanings : [{ translation: d.meanings || d.word, definition: "" }],
            }));
            setCards(formatted);
            const found = decks.find((d) => d.id === selectedDeckId);
            if (found) setDeckTitle(found.title);
          }
        }
      } catch (e) {
        console.error("Kartlar yüklenemedi:", e);
      } finally {
        setLoadingCards(false);
      }
    };
    fetchCards();
  }, [selectedDeckId, decks]);

  // Boss Değiştiğinde Canı Yenile
  useEffect(() => {
    setBossHp(activeBoss.maxHp);
    setBossState("idle");
    setHeroes((prev) => prev.map((h) => ({ ...h, damage: 0, hits: 0 })));
    setCombatLog([t("boss_fight_log_started", "⚔️ Canavar uyanışa geçti: {boss}! Haydi sınıf, hazır olun!", { boss: activeBoss.name })]);
  }, [selectedBossIndex]);

  // Soru Oluşturma (İngilizce kelime tekrarı asla şık olamaz, dil desteği tam)
  const generateNewQuestion = () => {
    if (!cards || cards.length === 0) return;
    const sourceCards = cards.length >= 4 ? cards : [...cards, ...FALLBACK_CARDS];

    // Sadece geçerli ve kelimeden farklı bir çeviriye sahip kartları seç
    const validCards = sourceCards.filter((c) => {
      const m = getCardMeaning(c, currentLang);
      return m && m.toLowerCase() !== c.word.trim().toLowerCase();
    });

    const pool = validCards.length >= 4 ? validCards : [...validCards, ...FALLBACK_CARDS];
    if (pool.length === 0) return;

    // Rastgele doğru kart
    const correctCard = pool[Math.floor(Math.random() * pool.length)];
    const correctTranslation = getCardMeaning(correctCard, currentLang);

    // 3 adet çeldirici kart (kelimenin kendisi veya doğru cevap olamaz)
    const distractors = pool
      .filter((c) => c.id !== correctCard.id)
      .map((c) => getCardMeaning(c, currentLang))
      .filter(
        (t) =>
          t &&
          t.toLowerCase() !== correctTranslation.toLowerCase() &&
          t.toLowerCase() !== correctCard.word.trim().toLowerCase()
      );

    const uniqueDistractors = Array.from(new Set(distractors))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // Yetersizse güvenli dil havuzu alternatifleri
    const fallbackDummies =
      currentLang === "de"
        ? ["Apfel", "Krieger", "Mut", "Drache", "Sieg", "Tasche", "Tier"]
        : currentLang === "es"
        ? ["Manzana", "Guerrero", "Coraje", "Dragón", "Victoria", "Bolsillo"]
        : currentLang === "fr"
        ? ["Pomme", "Guerrier", "Courage", "Dragon", "Victoire", "Poche"]
        : ["Elma", "Savaşçı", "Cesaret", "Ejderha", "Zafer", "Cep", "Kedi", "Köpek", "Rutin"];

    while (uniqueDistractors.length < 3) {
      const candidate = fallbackDummies[Math.floor(Math.random() * fallbackDummies.length)];
      if (
        !uniqueDistractors.includes(candidate) &&
        candidate.toLowerCase() !== correctTranslation.toLowerCase() &&
        candidate.toLowerCase() !== correctCard.word.trim().toLowerCase()
      ) {
        uniqueDistractors.push(candidate);
      }
    }

    const allOptions = [
      { text: correctTranslation, isCorrect: true },
      ...uniqueDistractors.map((text) => ({ text, isCorrect: false })),
    ].sort(() => 0.5 - Math.random());

    setCurrentQuestion({
      card: correctCard,
      prompt: correctCard.word,
      phonetic: correctCard.phonetic,
      options: allOptions,
    });
    setFeedback(null);
    setAnsweredIndex(null);
  };

  useEffect(() => {
    if (cards.length > 0) {
      generateNewQuestion();
    }
  }, [cards, currentLang]);

  // 3. Simüle Edilmiş Sınıf Arkadaşı Saldırıları (Canlı Sınıf Hissi)
  useEffect(() => {
    if (bossHp <= 0 || isVictoryModalOpen) return;

    const interval = setInterval(() => {
      // Rastgele bir sınıf arkadaşı seç
      const peerHeroes = heroes.filter((h) => !h.isUser);
      const randomPeer = peerHeroes[Math.floor(Math.random() * peerHeroes.length)];

      const peerDmg = Math.floor(Math.random() * 140) + 120; // 120-260 hasar

      setBossHp((prev) => {
        const next = Math.max(0, prev - peerDmg);
        if (next === 0) {
          handleBossDefeated();
        }
        return next;
      });

      // İstatistik Güncelle
      setHeroes((prev) =>
        prev.map((h) =>
          h.id === randomPeer.id
            ? { ...h, damage: h.damage + peerDmg, hits: h.hits + 1 }
            : h
        )
      );

      // Hasar Efekti
      triggerDamageIndicator(`-${peerDmg}`, false);

      // Log
      setCombatLog((prev) => [
        t("boss_fight_log_peer_hit", "🏹 {name} vuruş yaptı: -{dmg} Hasar!", {
          name: randomPeer.name,
          dmg: peerDmg,
        }),
        ...prev.slice(0, 5),
      ]);
    }, 3800);

    return () => clearInterval(interval);
  }, [bossHp, isVictoryModalOpen, heroes]);

  // Hasar Animasyon Göstergesi
  const triggerDamageIndicator = (text: string, isCrit: boolean) => {
    const id = `${Date.now()}-${Math.random()}`;
    setDamageIndicators((prev) => [...prev, { id, text, isCrit }]);
    setTimeout(() => {
      setDamageIndicators((prev) => prev.filter((d) => d.id !== id));
    }, 1200);
  };

  // 4. Oyuncu Cevap Verdiğinde
  const handleAnswer = (option: { text: string; isCorrect: boolean }, idx: number) => {
    if (feedback !== null || bossHp <= 0) return;
    setAnsweredIndex(idx);

    if (option.isCorrect) {
      // DOĞRU CEVAP!
      setFeedback("correct");
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      const isCrit = nextCombo >= 3;
      const baseDmg = Math.floor(Math.random() * 100) + 200; // 200 - 300
      const totalDmg = isCrit ? Math.floor(baseDmg * 2.2) : baseDmg;

      if (soundEnabled) {
        if (isCrit) playSound("crit");
        else playSound("hit");
      }

      // Boss hit animasyonu
      setBossState("hit");
      setTimeout(() => setBossState("idle"), 500);

      // Boss Canı Düşür
      setBossHp((prev) => {
        const next = Math.max(0, prev - totalDmg);
        if (next === 0) {
          handleBossDefeated();
        }
        return next;
      });

      // Uçan hasar yazısı
      triggerDamageIndicator(
        isCrit
          ? t("boss_fight_crit_hit_text", "💥 -{dmg} KRİTİK!", { dmg: totalDmg })
          : `-${totalDmg}`,
        isCrit
      );

      // Kahraman İstatistiği
      setHeroes((prev) =>
        prev.map((h) =>
          h.isUser
            ? { ...h, damage: h.damage + totalDmg, hits: h.hits + 1 }
            : h
        )
      );

      // Savaş Günlüğü
      setCombatLog((prev) => [
        isCrit
          ? t("boss_fight_log_user_crit", "💥 SEN KRİTİK VURUŞ YAPTIN ({combo}x Kombo): -{dmg} DEV HASAR!", {
              combo: nextCombo,
              dmg: totalDmg,
            })
          : t("boss_fight_log_user_hit", "⚔️ Sen vuruş yaptın: -{dmg} Hasar!", {
              dmg: totalDmg,
            }),
        ...prev.slice(0, 5),
      ]);

      // Sıradaki Soru
      setTimeout(() => {
        generateNewQuestion();
      }, 700);
    } else {
      // YANLIŞ CEVAP - BOSS KARŞI SALDIRISI!
      setFeedback("wrong");
      setCombo(0);
      if (soundEnabled) playSound("boss_attack");

      // Zayıf Nokta Avcısı: Yanlış cevabı zayıf havuzuna aktar
      const cardIdentifier = currentQuestion?.card?.id && !currentQuestion.card.id.startsWith("c")
        ? currentQuestion.card.id
        : currentQuestion?.card?.word;
      if (cardIdentifier) {
        fetch(`${API_BASE}/cards/${encodeURIComponent(cardIdentifier)}/review-result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_correct: false }),
        }).catch((err) => console.error("Boss Fight zayıf nokta güncelleme hatası:", err));
      }

      // Boss saldırı animasyonu & ekran titremesi
      setBossState("counter_attack");
      setTimeout(() => setBossState("idle"), 800);

      triggerDamageIndicator(t("boss_fight_missed", "⚠️ ISKALANDI! KOMBO BOZULDU!"), false);

      setCombatLog((prev) => [
        t("boss_fight_log_boss_counter", '⚠️ Yanıt yanlış! Boss {boss} karşı saldırı yaptı: "{attack}"', {
          boss: activeBoss.name,
          attack: activeBoss.attackName,
        }),
        ...prev.slice(0, 5),
      ]);

      setTimeout(() => {
        generateNewQuestion();
      }, 1100);
    }
  };

  // Klavye Kısayolları (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion || feedback !== null || bossHp <= 0) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (currentQuestion.options[idx]) {
          handleAnswer(currentQuestion.options[idx], idx);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, feedback, bossHp]);

  // 5. Boss Yenildiğinde
  const handleBossDefeated = async () => {
    setBossState("defeated");
    if (soundEnabled) playSound("victory");

    // Konfeti Yağmuru
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setIsVictoryModalOpen(true);
    }, 800);

    // +100 XP ve Altın Kazanımı
    try {
      await fetch(`${API_BASE}/gamification/award-xp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "custom",
          amount: 100,
          details: { game: "boss-fight", boss: activeBoss.name },
        }),
      });
      triggerFloatingXP(100, "Boss Yenildi! Efsanevi Zafer! 🏆");
      window.dispatchEvent(new CustomEvent("quizwise_profile_update"));
    } catch (e) {
      console.error("XP ödülü kaydedilemedi:", e);
    }
  };

  // Sıralı Hasar Listesi (MVP Sıralaması)
  const sortedHeroes = useMemo(() => {
    return [...heroes].sort((a, b) => b.damage - a.damage);
  }, [heroes]);

  const hpPercent = Math.max(0, Math.round((bossHp / activeBoss.maxHp) * 100));

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white ${bossState === "counter_attack" ? "animate-shake" : ""}`}>
      {/* Üst Boss Savaş Alanı Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b ${activeBoss.color} opacity-15 blur-3xl pointer-events-none -z-10`} />

      {/* ============================================================== */}
      {/* 1. ÜST HEADER: GERİ DÖN, DESTE SEÇİCİ, BOSS DEĞİŞTİRME         */}
      {/* ============================================================== */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/80">
        <button
          onClick={() => router.push("/games")}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>{t("boss_fight_back_to_arena", "Arenaya Dön")}</span>
        </button>

        {/* Canavar Seçici & Deste Seçici */}
        <div className="flex items-center space-x-3">
          {/* Deste Seçici */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="bg-transparent text-amber-300 font-bold outline-none cursor-pointer text-xs"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                  {d.title} ({t("label_card_count_suffix", "{count} kart", { count: d.card_count || 0 })})
                </option>
              ))}
            </select>
          </div>

          {/* Boss Değiştirici Butonları */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl gap-1">
            {BOSS_LIST.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setSelectedBossIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                  selectedBossIndex === idx
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title={
                  b.id === "ignis"
                    ? t("boss_title_ignis", "Volkanik Alev Ejderhası Ignis")
                    : b.id === "colossus"
                    ? t("boss_title_golem", "Kadim Rünik Golem Colossus")
                    : t("boss_title_void", "Kozmik Karadelik Devi Void Lord")
                }
              >
                <span>{b.avatar}</span>
                <span className="hidden md:inline">
                  {b.id === "ignis"
                    ? t("boss_tab_volcanic", "Volkanik")
                    : b.id === "colossus"
                    ? t("boss_tab_ancient", "Kadim")
                    : t("boss_tab_cosmic", "Kozmik")}
                </span>
              </button>
            ))}
          </div>

          {/* Ses Aç / Kapat */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title={soundEnabled ? t("boss_fight_sound_off", "Sesi Kapat") : t("boss_fight_sound_on", "Sesi Aç")}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. ORTA SAVAŞ ALANI: BOSS, CAN BARI VE HASAR SAYILARI          */}
      {/* ============================================================== */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col justify-between">
        {/* DEV BOSS SAHNESİ */}
        <div className="relative rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6 flex flex-col items-center justify-center text-center overflow-hidden backdrop-blur-xl mb-4">
          {/* Uçan Hasar Sayıları */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {damageIndicators.map((dmg) => (
              <div
                key={dmg.id}
                className={`animate-damage-float text-3xl sm:text-5xl font-black drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${
                  dmg.isCrit
                    ? "text-amber-300 scale-125"
                    : dmg.text.includes("ISKALANDI")
                    ? "text-rose-500 text-2xl"
                    : "text-white"
                }`}
              >
                {dmg.text}
              </div>
            ))}
          </div>

          {/* Boss Bilgisi & Can Barı */}
          <div className="w-full max-w-2xl space-y-3 mb-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {activeBoss.id === "ignis"
                    ? t("boss_badge_ignis", "MAGMA & KÜL HÜKÜMDARI")
                    : activeBoss.id === "colossus"
                    ? t("boss_badge_golem", "YENİLMEZ TAŞ MUHAFIZ")
                    : t("boss_badge_void", "DERİN UZAY TİTANI")}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {activeBoss.id === "ignis"
                    ? t("boss_title_ignis", "Volkanik Alev Ejderhası Ignis")
                    : activeBoss.id === "colossus"
                    ? t("boss_title_golem", "Kadim Rünik Golem Colossus")
                    : t("boss_title_void", "Kozmik Karadelik Devi Void Lord")}
                </h2>
              </div>

              <div className="text-right font-mono">
                <span className="text-sm sm:text-lg font-black text-rose-400">
                  {bossHp.toLocaleString()} / {activeBoss.maxHp.toLocaleString()} HP
                </span>
                <span className="text-xs text-slate-400 block font-semibold">
                  {t("boss_fight_hp_remaining", "%{percent} Kalan Can", { percent: hpPercent })}
                </span>
              </div>
            </div>

            {/* Devasa Kırmızı Can Barı */}
            <div className="w-full h-5 sm:h-6 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700/80 p-0.5 shadow-inner relative">
              <div
                className={`h-full rounded-xl transition-all duration-300 ${
                  hpPercent < 25
                    ? "bg-gradient-to-r from-red-600 to-rose-500 animate-pulse"
                    : hpPercent < 50
                    ? "bg-gradient-to-r from-amber-600 via-rose-500 to-red-500"
                    : "bg-gradient-to-r from-emerald-500 via-rose-500 to-red-600"
                }`}
                style={{ width: `${hpPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-black uppercase text-white tracking-widest drop-shadow">
                {hpPercent <= 0 ? t("boss_fight_hp_defeated", "💀 CANAVAR YENİLDİ!") : hpPercent < 30 ? t("boss_fight_hp_enraged", "🔥 ÇILGIN ÖFKE FAZI!") : t("boss_fight_hp_shared", "ORTAK SINIF CAN BARI")}
              </div>
            </div>
          </div>

          {/* Animasyonlu Dev Boss Görseli */}
          <div className="relative my-2 sm:my-4 flex items-center justify-center">
            {/* Arkaplan Enerji Halkası */}
            <div className={`absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr ${activeBoss.color} opacity-20 blur-2xl animate-spin`} />

            <div
              className={`text-8xl sm:text-9xl transition-all duration-200 select-none cursor-pointer filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] ${
                bossState === "hit"
                  ? "scale-90 brightness-200 saturate-200 -rotate-6"
                  : bossState === "counter_attack"
                  ? "scale-125 rotate-6 text-red-500"
                  : bossState === "defeated"
                  ? "opacity-30 scale-50 rotate-90"
                  : "animate-bounce"
              }`}
            >
              {activeBoss.avatar}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. ALT BÖLÜM: SORU VE ŞIKLAR + SAĞDA CANLI HASAR LİSTESİ       */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* SOL / ORTA (2 Kolon): SORU VE ŞIKLAR PANELİ */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
            {/* Soru Başlığı ve Kombo Çarpanı */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Swords className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {t("boss_fight_attack_question", "Saldırı Sorusu ({deck})", { deck: deckTitle })}
                </span>
              </div>

              {/* Kombo Rozeti */}
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
                <Zap className="w-4 h-4 fill-current text-amber-400" />
                <span>{t("boss_fight_combo", "{count}x Kombo", { count: combo })}</span>
                {combo >= 3 && <span className="animate-pulse">{t("boss_fight_crit_active", "💥 KRİTİK AKTİF!")}</span>}
              </div>
            </div>

            {/* Soru Kelimesi */}
            <div className="text-center py-4 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {t("boss_fight_meaning_prompt", "Bu kelimenin anlamı nedir?")}
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {currentQuestion?.prompt || t("boss_fight_loading_prompt", "Yükleniyor...")}
              </h3>
              {currentQuestion?.phonetic && (
                <span className="text-xs text-indigo-400 font-mono block">
                  {currentQuestion.phonetic}
                </span>
              )}
            </div>

            {/* 4 Şıklı Butonlar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuestion?.options.map((opt, idx) => {
                const isSelected = answeredIndex === idx;
                let btnStyle = "bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-200";

                if (feedback === "correct" && opt.isCorrect) {
                  btnStyle = "bg-emerald-600/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/50";
                } else if (feedback === "wrong" && isSelected) {
                  btnStyle = "bg-rose-600/30 border-rose-400 text-rose-200 ring-2 ring-rose-500/50";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt, idx)}
                    disabled={feedback !== null || bossHp <= 0}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border text-left font-bold text-sm sm:text-base transition-all duration-150 flex items-center justify-between group active:scale-95 ${btnStyle}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition">
                        {idx + 1}
                      </span>
                      <span className="line-clamp-2">{opt.text}</span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      [{idx + 1}]
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-400 font-medium">
                {t("boss_fight_kbd_hint", "💡 İpucu: Klavyenizdeki 1 2 3 4 tuşlarıyla ultra hızlı saldırabilirsiniz!")}
              </span>
            </div>
          </div>

          {/* SAĞ PANEL (1 Kolon): SINIFIN KAHRAMANLARI & SAVAŞ GÜNLÜĞÜ */}
          <div className="space-y-4">
            {/* Canlı Hasar Listesi */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800/90 p-4 sm:p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    {t("boss_fight_class_heroes", "Sınıfın Kahramanları")}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{t("boss_fight_damage_podium", "Hasar Podyumu")}</span>
              </div>

              <div className="space-y-2">
                {sortedHeroes.map((hero, idx) => (
                  <div
                    key={hero.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                      hero.isUser
                        ? "bg-amber-500/15 border-amber-500/40 shadow-sm shadow-amber-500/10 font-black"
                        : "bg-slate-950/60 border-slate-800/80 font-semibold"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs w-4 text-slate-400">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`}
                      </span>
                      <span className="text-base">{hero.avatar}</span>
                      <span className={hero.isUser ? "text-amber-300" : "text-white"}>
                        {hero.isUser ? t("boss_fight_hero_you", "Sen (Kahraman)") : hero.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-rose-400">
                        {hero.damage.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        {t("boss_fight_hits_count", "{count} vuruş", { count: hero.hits })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Savaş Günlüğü (Combat Log) */}
            <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {t("boss_fight_battle_log", "Canlı Savaş Günlüğü")}
              </span>
              <div className="space-y-1.5 h-24 overflow-y-auto text-[11px] font-mono">
                {combatLog.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-tight ${
                      log.includes("KRİTİK")
                        ? "text-amber-300 font-bold"
                        : log.includes("SEN")
                        ? "text-emerald-300 font-bold"
                        : log.includes("karşı saldırı")
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 4. ZAFER MODALI & KUTLAMA EKRANI (BOSS DEFEATED)                 */}
      {/* ============================================================== */}
      {isVictoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-400 shadow-2xl shadow-amber-500/30 text-center relative animate-in zoom-in-95 duration-200">
            {/* Zafer Başlığı */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40 mb-3">
              <Crown className="w-4 h-4 fill-current" />
              <span>{t("boss_fight_victory_celebration", "SINIF ZAFERİ KUTLAMASI")}</span>
            </div>

            <div className="my-4 text-7xl select-none animate-bounce">
              🏆
            </div>

            <h2 className="text-3xl font-black text-white">
              {t("boss_fight_victory_title", "BOSS YENİLDİ!")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
              {t("boss_fight_victory_desc", "Tebrikler! Sınıfınız ortak güçle {boss} canavarını dize getirdi!", { boss: activeBoss.name })}
            </p>

            {/* +100 XP ve Ödül Kutusu */}
            <div className="my-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-around shadow-inner">
              <div className="flex items-center space-x-2">
                <Zap className="w-6 h-6 text-amber-400 animate-pulse fill-current" />
                <div className="text-left">
                  <span className="text-xs uppercase font-bold text-amber-400/80 block">{t("boss_fight_reward_earned", "Kazanılan Ödül")}</span>
                  <span className="text-xl font-black text-amber-200">+100 XP & +50 🪙</span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs uppercase font-bold text-slate-400 block">{t("boss_fight_highest_combo", "En Yüksek Kombo")}</span>
                <span className="text-xl font-black text-white">{maxCombo}x {t("boss_fight_hits_suffix", "Vuruş")}</span>
              </div>
            </div>

            {/* Savaşın MVP Podyumu */}
            <div className="space-y-2 mb-6 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">
                {t("boss_fight_mvp_heroes", "🎖️ En Çok Hasar Veren Sınıf Kahramanları")}
              </span>
              <div className="space-y-1.5">
                {sortedHeroes.slice(0, 3).map((h, i) => (
                  <div
                    key={h.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      i === 0
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 font-black"
                        : i === 1
                        ? "bg-slate-800/80 border-slate-600 text-slate-200 font-bold"
                        : "bg-slate-900 border-amber-700/50 text-amber-400 font-bold"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{i === 0 ? "🥇 1." : i === 1 ? "🥈 2." : "🥉 3."}</span>
                      <span>{h.avatar}</span>
                      <span>{h.name}</span>
                    </div>
                    <span className="font-mono font-black">{h.damage.toLocaleString()} Hasar</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Butonlar */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setIsVictoryModalOpen(false);
                  setBossHp(activeBoss.maxHp);
                  setBossState("idle");
                  setHeroes((prev) => prev.map((h) => ({ ...h, damage: 0, hits: 0 })));
                  generateNewQuestion();
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm transition flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>{t("boss_fight_fight_again", "Tekrar Savaş")}</span>
              </button>

              <button
                onClick={() => router.push("/games")}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-1.5"
              >
                <span>{t("boss_fight_back_to_arena", "Arenaya Dön")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BossFightPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    }>
      <BossFightContent />
    </Suspense>
  );
}
