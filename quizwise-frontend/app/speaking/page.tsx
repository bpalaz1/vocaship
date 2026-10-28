"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  RotateCcw,
  AlertCircle,
  Award,
  Quote,
  Copy,
  Check,
  ArrowRight,
  SlidersHorizontal,
  X,
  WifiOff,
  FileCheck,
  Radio,
  Play,
  Square,
  GraduationCap,
  BookOpen,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Globe2,
  Briefcase,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";
import {
  usePersona,
  PersonaId,
  PersonaInfo,
  PERSONAS,
  CORE_PERSONAS,
} from "../context/PersonaContext";
import { speakPersonaText, stopSpeech, getActiveVoiceDisplay } from "../utils/tts";
import AvatarDisplay from "../components/avatar/AvatarDisplay";
import {
  ConversationMode,
  ConversationModeConfig,
  ScenarioItem,
  CONVERSATION_MODES,
} from "../types/speaking";
import { SPEAKING_CATEGORIES, SpeakingCategory } from "../data/speakingCategories";

interface DialogueTurn {
  role: "assistant" | "user";
  message: string;
  timestamp?: string;
  feedback?: {
    grammar_feedback?: string | null;
    better_alternative?: string;
    vocabulary_highlight?: string[];
    jargon_score?: number;
    fluency_score?: number;
  };
}

const SCENARIOS: ScenarioItem[] = [
  // =========================================================================
  // 1. ☕ CASUAL - Günlük Samimi Sohbet (Leo, Sparky)
  // =========================================================================
  {
    id: "casual_coffee",
    mode: "casual",
    icon: "☕",
    title: "Kahve Molası & Günlük Rutinler",
    role_name: "Leo",
    tagline: "Samimi Sohbet • Seviye: A2-B1",
    context_desc:
      "Güne sıcak bir kahve molasıyla başlarken günlük rutinler, sevilen kafeler ve hafta sonu planları üzerine gerilimsiz, dostane bir sohbet.",
    target_vocabulary: ["routine", "relaxing", "weekend", "favorite", "coffee"],
    initial_greeting:
      "Hey there! Great to see you! How is your day going so far? Grabbing some nice coffee or tea?",
    persona_id: "leo",
  },
  {
    id: "casual_travel",
    mode: "casual",
    icon: "✈️",
    title: "Seyahat & Tatil Maceraları",
    role_name: "Leo",
    tagline: "Gezi & Kültür • Seviye: A2-B1",
    context_desc:
      "Ziyaret edilen şehirler, unutulmaz tatil anıları ve sıradaki seyahat hayalleri üzerine rahat ve keyifli bir arkadaş sohbeti.",
    target_vocabulary: ["destination", "explore", "memorable", "itinerary", "culture"],
    initial_greeting:
      "I was just daydreaming about my next holiday! If you could pack your bags and fly anywhere right now, where would you go first?",
    persona_id: "leo",
  },
  {
    id: "casual_sparky",
    mode: "casual",
    icon: "🦊",
    title: "Sparky ile Eğlenceli Sohbet",
    role_name: "Sparky",
    tagline: "Fun & Games • Seviye: A1-A2",
    context_desc:
      "Çocuklar ve temel seviye için sevimli tilki maskotu Sparky ile neşeli oyunlar, evcil hayvanlar ve hobiler.",
    target_vocabulary: ["friendly", "adventure", "favorite", "play", "fun"],
    initial_greeting:
      "Hello friend! Sparky here! Are you ready to play some fun games and practice cool words today?",
    persona_id: "sparky",
  },

  // =========================================================================
  // 2. 🚨 PROBLEM SOLVING - Anlık Kriz Çözme (Sarah, Alex, Mr. Harrison)
  // =========================================================================
  {
    id: "problem_site_delay",
    mode: "problem_solving",
    icon: "🚨",
    title: "Şantiye Gecikmesi & Kritik Yol",
    role_name: "Sarah",
    tagline: "Kriz Yönetimi • Seviye: C1",
    context_desc:
      "Kritik yol üzerinde ana türbin tedarikinde 3 haftalık aksama yaşandı. İşveren gecikme tazminatı (liquidated damages) uyarısı yaptı.",
    target_vocabulary: ["mitigate", "critical path", "acceleration", "contingency", "liquidated damages"],
    initial_greeting:
      "We have an immediate emergency: our primary turbine supplier just confirmed a three-week shipment delay on our critical path. How do we resolve this before the client enforces liquidated damages?",
    persona_id: "sarah",
  },
  {
    id: "problem_flight_cancellation",
    mode: "problem_solving",
    icon: "🧳",
    title: "Havalimanında İptal & Kayıp Bagaj",
    role_name: "Alex",
    tagline: "Acil Durum • Seviye: B2",
    context_desc:
      "Aktarmalı uçuş iptal edildi, sunum materyallerinin olduğu bagaj kayboldu ve yarın sabah yönetim kurulu sunumu var.",
    target_vocabulary: ["rebook", "compensation", "carry-on", "transit", "emergency"],
    initial_greeting:
      "Our connecting flight was just cancelled and our luggage with prototype samples is missing in transit, but our investor pitch is tomorrow at 9 AM! How do we salvage this situation right now?",
    persona_id: "alex",
  },
  {
    id: "problem_contract_dispute",
    mode: "problem_solving",
    icon: "⚠️",
    title: "Tedarikçi İflası & Lojistik Krizi",
    role_name: "Mr. Harrison",
    tagline: "Hukuki Kriz • Seviye: C1",
    context_desc:
      "Ana deniz lojistiği partneri iflas başvurusunda bulundu. Limandaki 20 konteyner gümrükte bloke kaldı.",
    target_vocabulary: ["default notice", "force majeure", "remedy", "breach", "alternative carrier"],
    initial_greeting:
      "Our core freight forwarder has abruptly filed for insolvency, leaving twenty critical containers frozen at customs. How do we legally release the cargo and prevent a catastrophic operational halt?",
    persona_id: "mr_harrison",
  },

  // =========================================================================
  // 3. 💼 INTERVIEW - Resmi Mülakat & IELTS Simülasyonu
  // =========================================================================
  {
    id: "project_control",
    mode: "interview",
    icon: "💼",
    title: "Project Controls (EVM / AACE)",
    role_name: "Sarah",
    tagline: "Roleplay cases • Level: C1",
    context_desc:
      "EPC yürütme kurulu mülakatı. Program Performans İndeksi (SPI) ve kritik yol maliyet sapmaları değerlendiriliyor.",
    target_vocabulary: ["variance", "mitigate", "critical path", "earned value"],
    initial_greeting:
      "Could you describe how you monitor and mitigate project cost variances across the critical path?",
    persona_id: "sarah",
  },
  {
    id: "contract_claims",
    mode: "interview",
    icon: "📑",
    title: "Contract Claims (FIDIC)",
    role_name: "Mr. Harrison",
    tagline: "Commercial negotiation • Level: C1",
    context_desc:
      "İşveren ve yüklenici arasındaki FIDIC uyuşmazlık müzakeresi. Öngörülemeyen zemin koşulları ve gecikme tazminatları değerlendiriliyor.",
    target_vocabulary: ["liquidated damages", "FIDIC", "Extension of Time", "Clause 20.1"],
    initial_greeting:
      "The contractor has formally submitted a dispute claim citing unforeseeable conditions under FIDIC Clause 20.1. How do you assess their delay narrative and liquidated damages exposure?",
    persona_id: "mr_harrison",
  },
  {
    id: "corporate_finance",
    mode: "interview",
    icon: "📈",
    title: "Corporate Finance (CFO Review)",
    role_name: "Sarah",
    tagline: "Roleplay • Level: C1",
    context_desc:
      "Yönetim kurulu çeyrek sonu finansal değerlendirmesi. Operasyonel maliyet artışları EBITDA marjlarını ve borç kovenantlarını zorlamıştır.",
    target_vocabulary: ["EBITDA", "liquidity ratio", "CapEx", "debt covenant"],
    initial_greeting:
      "Our preliminary quarterly figures indicate margin compression in core divisions, tightening our net debt to EBITDA covenant threshold. How do you propose we adjust CapEx to safeguard liquidity?",
    persona_id: "sarah",
  },
  {
    id: "technical_pitch",
    mode: "interview",
    icon: "💻",
    title: "Technical & SaaS Executive Pitch",
    role_name: "Alex",
    tagline: "Roleplay • Level: C1",
    context_desc:
      "Kurumsal SaaS bulut altyapı mimarisinin yönetim kuruluna sunumu. SLA taahhütleri, çok bölgeli yedeklilik ve gecikme toleransları.",
    target_vocabulary: ["mitigate", "critical path", "latency SLAs", "scalability"],
    initial_greeting:
      "When presenting our enterprise SaaS cloud migration, how do you plan to mitigate critical path latency variances across distributed clusters?",
    persona_id: "alex",
  },

  // =========================================================================
  // 4. 📖 STORY DEBATE - Okuma Odası & Fikir Tartışması
  // =========================================================================
  {
    id: "story_moral_dilemma",
    mode: "story_debate",
    icon: "📖",
    title: "Karakterin Ahlaki İkilemi & Sadakat",
    role_name: "Sarah",
    tagline: "Okuma Odası Vaka Tartışması • Seviye: B2-C1",
    context_desc:
      "Okunan hikayede başkahramanın şirketi kurtarmak ile etik gerçeği açıklamak arasındaki zorlu tercihi üzerine münazara.",
    target_vocabulary: ["ethical dilemma", "protagonist", "justified", "integrity", "consequences"],
    initial_greeting:
      "In the narrative we just reviewed, do you believe the protagonist was justified in concealing the engineering flaw to protect the workforce, or was it a fatal breach of professional ethics?",
    persona_id: "sarah",
  },
  {
    id: "story_ai_future",
    mode: "story_debate",
    icon: "🤖",
    title: "Yapay Zeka & Toplumsal Özgürlük",
    role_name: "Alex",
    tagline: "Eleştirel Düşünce & Münazara • Seviye: C1",
    context_desc:
      "Okunan distopik bilimkurgu metni üzerinden algoritmik karar vericilerin insan özgürlüğüne ve sezgisine etkisini tartışma.",
    target_vocabulary: ["algorithmic governance", "autonomy", "dystopian", "societal shift", "predetermined"],
    initial_greeting:
      "The author suggests that surrendering executive autonomy to predictive algorithms is an irreversible societal sacrifice. Do you believe human intuition is fundamentally irreplaceable?",
    persona_id: "alex",
  },
];

// =========================================================================
// Proje Kontrol (Sarah) Mesleki Hızlı Öneri Etiketleri (Context-Aware Topic Pills)
// =========================================================================
export interface TopicPill {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  topic: string;
  initialQuestion: string;
  target_vocabulary: string[];
}

export const PROJECT_CONTROL_PILLS: TopicPill[] = [
  {
    id: "spi_cpi_variance",
    icon: "📊",
    title: "SPI/CPI Sapması",
    tagline: "EVM & Bütçe Maliyet Sapması",
    topic: "Şantiyede SPI ve CPI sapması, bütçe varyansı ve Earned Value analizi",
    initialQuestion:
      "Our monthly EVM metrics show an SPI of 0.84 and a CPI of 0.89 on the main civil package. Could you describe how you monitor and mitigate this project cost variance across the critical path?",
    target_vocabulary: ["variance", "mitigate", "critical path", "earned value", "CPI"],
  },
  {
    id: "critical_path_delay",
    icon: "⏱️",
    title: "Kritik Yol Gecikmesi",
    tagline: "Schedule Slippage & Hızlandırma",
    topic: "Kritik yolda 18 günlük montaj gecikmesi ve program hızlandırma (fast-tracking/crashing)",
    initialQuestion:
      "The turbine installation package has slipped by 18 days directly on our critical path baseline. Are we looking at fast-tracking or crashing subcontractor activities to recover the milestone?",
    target_vocabulary: ["critical path", "slippage", "fast-track", "baseline", "contingency"],
  },
  {
    id: "eot_subcontractor_claim",
    icon: "📑",
    title: "Taşeron EOT Talebi",
    tagline: "FIDIC Madde 8.4 & Uyuşmazlık",
    topic: "Taşeronun FIDIC Madde 8.4 kapsamında süre uzatımı (EOT) ve gecikme cezası müzakeresi",
    initialQuestion:
      "The mechanical subcontractor has formally submitted an Extension of Time (EOT) claim citing concurrent delays. How do you assess their time-impact analysis and defend against liquidated damages?",
    target_vocabulary: ["liquidated damages", "FIDIC", "Extension of Time", "Clause 8.4", "concurrent delay"],
  },
  {
    id: "jobsite_daily_chat",
    icon: "☕",
    title: "Şantiyede Günlük Sohbet",
    tagline: "Şantiye Rutini & Saha İletişimi",
    topic: "Şantiyede sabah kahve molasında mühendisler arası günlük koordinasyon sohbeti",
    initialQuestion:
      "Good morning! How did yesterday's critical concrete pour go on the north section? Let's grab a quick coffee before the 9 AM EPC coordination meeting!",
    target_vocabulary: ["pour", "inspection", "coordination", "routine", "jobsite"],
  },
];

export interface ActiveStoryContext {
  id?: string;
  title: string;
  level?: string;
  topic?: string;
  content: string;
  target_vocabulary?: string[];
}

export const DEFAULT_EPC_STORY: ActiveStoryContext = {
  id: "epc_megaproject_claims",
  title: "The Critical Path Dilemma",
  level: "C1",
  topic: "EPC Project Controls & Claims",
  content:
    "On week 42 of the LNG Terminal expansion, unexpected subsurface ground conditions halted excavation along the jetty berth. The contractor submitted a formal notice of delay under FIDIC Clause 8.4, claiming a 60-day Extension of Time and substantial disruption costs. The project controls director analyzed the baseline Primavera P6 schedule and identified concurrent delay caused by late procurement of cryogenic piping. A high-stakes executive dispute meeting was convened to negotiate delay mitigation before liquidated damages were imposed.",
  target_vocabulary: ["concurrent delay", "Extension of Time", "critical path", "liquidated damages", "mitigation"],
};

// Canlı Neon Frekans Waveform Bileşeni
function NeonWaveform({ active }: { active: boolean }) {
  const bars = [
    { h: 35, delay: "0ms", dur: "0.8s" },
    { h: 65, delay: "100ms", dur: "0.6s" },
    { h: 90, delay: "200ms", dur: "0.7s" },
    { h: 45, delay: "150ms", dur: "0.9s" },
    { h: 100, delay: "300ms", dur: "0.5s" },
    { h: 70, delay: "250ms", dur: "0.75s" },
    { h: 85, delay: "50ms", dur: "0.65s" },
    { h: 40, delay: "350ms", dur: "0.85s" },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 h-12 px-1 sm:px-2">
      {bars.map((bar, i) => (
        <span
          key={i}
          className={`w-1 sm:w-1.5 rounded-full transition-all duration-300 ${
            active
              ? "bg-gradient-to-t from-violet-600 via-teal-400 to-pink-500 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.6)]"
              : "bg-slate-800/80"
          }`}
          style={{
            height: active ? `${bar.h}%` : "18%",
            animationDelay: bar.delay,
            animationDuration: bar.dur,
          }}
        />
      ))}
    </div>
  );
}

export default function SpeakingPage() {
  const { t } = useLanguage();
  const {
    activePersona,
    persona,
    setPersona,
    selectedKidsCharacter,
    setSelectedKidsCharacter,
  } = usePersona();

  const [activeMode, setActiveMode] = useState<ConversationMode>("interview");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("project_control");
  const [targetLevel, setTargetLevel] = useState<"B2" | "C1">("C1");

  const activeScenario =
    SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    SCENARIOS.find((s) => s.mode === activeMode) ||
    SCENARIOS[0];

  // Aktif moda ait senaryolar
  const filteredScenarios = SCENARIOS.filter((s) => s.mode === activeMode);

  // Diyalog Durumu (Başlangıçta görsel referanstaki gibi Sarah'nın sorusu ve kullanıcının cevabı hazır bulunur)
  const [dialogue, setDialogue] = useState<DialogueTurn[]>([
    {
      role: "assistant",
      message: "AI Mentor: Could you describe how you monitor and mitigate project cost variances?",
      timestamp: "10:00",
    },
    {
      role: "user",
      message:
        "User: In our last phase, we faced a slippage on the critical path, so we had to fast-track activities to mitigate the budget variance...",
      timestamp: "10:01",
    },
  ]);

  // Ses ve Deşifre State'leri
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [speakingAudioIndex, setSpeakingAudioIndex] = useState<number | null>(null);
  const [speechSpeedMode, setSpeechSpeedMode] = useState<"0.8x" | "1.0x">("0.8x");
  const [activeVoiceBadge, setActiveVoiceBadge] = useState<string>("");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Serbest Konu Arama / Giriş Barı ve Dinamik Öneriler State'leri
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [activeTopicTitle, setActiveTopicTitle] = useState("📊 SPI/CPI Sapması");

  // Okuma Odası Hikaye Bağlantısı & Aynı Başlıkta Yeni Hikaye Üretimi State'i
  const [activeStory, setActiveStory] = useState<ActiveStoryContext | null>(null);
  const [isGeneratingNewStory, setIsGeneratingNewStory] = useState(false);

  // Akıllı Konuşma Gezgini - Kategori & Dinamik 4 Soru Döngüsü State'leri
  const [openCategoryId, setOpenCategoryId] = useState<string>("daily_life");
  const [activeCategory, setActiveCategory] = useState<SpeakingCategory>(() => {
    return SPEAKING_CATEGORIES.find((c) => c.id === "daily_life") || SPEAKING_CATEGORIES[0];
  });

  // Her kategori için ekranda aktif gösterilen 4 soru
  const [categoryActiveQuestions, setCategoryActiveQuestions] = useState<Record<string, string[]>>(() => {
    const initialMap: Record<string, string[]> = {};
    SPEAKING_CATEGORIES.forEach((cat) => {
      initialMap[cat.id] = cat.questionPool.slice(0, 4);
    });
    return initialMap;
  });

  // Havuzdan sonraki sorunun çekileceği indeks (her kategori için)
  const [categoryPoolIndex, setCategoryPoolIndex] = useState<Record<string, number>>(() => {
    const initialIdx: Record<string, number> = {};
    SPEAKING_CATEGORIES.forEach((cat) => {
      initialIdx[cat.id] = 4;
    });
    return initialIdx;
  });

  // Tamamlanan / cevaplanan sorular kümesi
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);

  // Şu an seçili / cevaplanmakta olan soru
  const [activeQuestionText, setActiveQuestionText] = useState<string | null>(
    "What did you have for breakfast this morning?"
  );

  // Kategori bazlı serbest konu inputları (5. seçenek)
  const [categoryCustomInputs, setCategoryCustomInputs] = useState<Record<string, string>>({});

  const generalCultureCats = SPEAKING_CATEGORIES.filter(
    (c) => c.section === "general_culture"
  );
  const professionalCats = SPEAKING_CATEGORIES.filter(
    (c) => c.section === "professional"
  );

  useEffect(() => {
    setMounted(true);
    // Okuma Odası sessionStorage kontrolü
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("vocaship_active_story_context");
        if (stored) {
          const parsed: ActiveStoryContext = JSON.parse(stored);
          if (parsed && parsed.title) {
            setActiveStory(parsed);
            setActiveTopicTitle(`📖 ${parsed.title}`);
            const storyIntro = `Welcome to our speaking session on "${parsed.title}". In your opinion, what was the primary operational oversight that triggered this crisis?`;
            setDialogue([
              {
                role: "assistant",
                message: `AI Mentor: ${storyIntro}`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
            if (parsed.target_vocabulary?.length) {
              setScorecard((prev) => ({
                ...prev,
                vocabulary_highlight: parsed.target_vocabulary!.slice(0, 3),
              }));
            }
          }
        }
      } catch (err) {
        console.warn("Could not load story context:", err);
      }
    }
  }, []);

  // Doğal Nöral Ses Değişimi ve Asenkron Yükleme Senkronizasyonu
  useEffect(() => {
    const syncVoice = () => {
      setActiveVoiceBadge(getActiveVoiceDisplay(persona));
    };
    syncVoice();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", syncVoice);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", syncVoice);
      };
    }
  }, [persona]);

  // Süre Sayacı (Görsel referansındaki 01:24 için başlangıç değeri)
  const [recordingSeconds, setRecordingSeconds] = useState(84);
  const timerIntervalRef = useRef<any>(null);

  // C1 Değerlendirme Karnesi State'i (%100 Görsel Referans Uyumu)
  const [scorecard, setScorecard] = useState<{
    grammar_feedback: string | null;
    improvement_original: string;
    improvement_suggestion: string;
    better_alternative: string;
    vocabulary_highlight: string[];
    jargon_score: number;
    fluency_score: number;
    idiomatic_phrase?: string;
  }>({
    grammar_feedback: null,
    improvement_original: "to catch cost overrun early",
    improvement_suggestion: "Suggesting to mitigate potential cost overruns proactively",
    better_alternative:
      "We were compelled to fast-track key deliverables to mitigate variances across the critical path baseline.",
    vocabulary_highlight: ["variance", "mitigate", "critical path"],
    jargon_score: 86,
    fluency_score: 86,
    idiomatic_phrase: "keep on a tight rein for idiomatic tight management",
  });

  const [copiedAlt, setCopiedAlt] = useState(false);

  // Referanslar
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Otomatik aşağı kaydır
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [dialogue, isThinking, interimText]);

  // Sayaç Mantığı
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Ses Durumu
  const avatarState = isRecording
    ? "listening"
    : isThinking
    ? "thinking"
    : speakingAudioIndex !== null
    ? "speaking"
    : "idle";

  const isKidsMode =
    persona.category === "kids" ||
    activeCategory.id === "kids" ||
    activePersona === "sparky" ||
    activePersona === "chuck";

  const stopAudio = () => {
    stopSpeech();
    setSpeakingAudioIndex(null);
  };

  const playSpeech = (text: string, index: number, overridePersona?: PersonaInfo) => {
    if (speakingAudioIndex === index) {
      stopAudio();
      return;
    }
    stopAudio();
    const targetP = overridePersona || persona;
    const clean = text.replace(/^AI Mentor:\s*/i, "").replace(/^\[.*?\]:\s*/, "");

    const isKidsChar =
      targetP.id === "sparky" || targetP.id === "chuck" || targetP.category === "kids";

    const targetRate = isKidsChar
      ? speechSpeedMode === "0.8x"
        ? targetP.ttsSettings.rate * 0.92
        : targetP.ttsSettings.rate
      : speechSpeedMode === "0.8x"
      ? targetP.gender === "female"
        ? 0.84
        : targetP.id === "mr_harrison"
        ? 0.82
        : 0.85
      : 1.0;

    // TTS konuşmaya başladığı anda avatarState anında 'speaking' olsun
    setSpeakingAudioIndex(index);

    speakPersonaText(clean, targetP, {
      pitch: targetP.ttsSettings.pitch,
      rate: targetRate,
      onStart: () => setSpeakingAudioIndex(index),
      onEnd: () => setSpeakingAudioIndex(null),
      onError: () => setSpeakingAudioIndex(null),
    });
  };

  // Çocuk Modu Karakter Seçici (Sparky / Chuck) Tıklandığında Anında Maskot, Ses Tonu ve Karşılama Cümlesini Değiştirir
  const handleSelectKidsCharacter = (charId: "sparky" | "chuck") => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    setSelectedKidsCharacter(charId);
    setPersona(charId);

    const kidsCat = SPEAKING_CATEGORIES.find((c) => c.id === "kids");
    if (kidsCat) {
      setActiveCategory(kidsCat);
      setOpenCategoryId("kids");
    }
    setActiveMode("casual");
    setSelectedScenarioId("casual_sparky");

    const targetPersona = PERSONAS[charId];
    setActiveVoiceBadge(getActiveVoiceDisplay(targetPersona));
    setActiveTopicTitle(`${targetPersona.avatarIcon} ${targetPersona.name} (${targetPersona.title})`);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${targetPersona.greeting}`,
        timestamp: now,
      },
    ]);

    setToastNotice(
      `${targetPersona.avatarIcon} ${targetPersona.name} (${targetPersona.title}) seçildi!`
    );

    if (autoPlayAudio) {
      setTimeout(() => {
        playSpeech(targetPersona.greeting, 0, targetPersona);
      }, 120);
    }
  };

  // 1. Dinamik Mesleki Öneri Etiketine (Pill) Tıklandığında
  const handlePillClick = (pill: TopicPill) => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");
    setActiveTopicTitle(pill.title);
    setCustomTopicInput(pill.title);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${pill.initialQuestion}`,
        timestamp: now,
      },
    ]);

    setScorecard((prev) => ({
      ...prev,
      vocabulary_highlight: pill.target_vocabulary.slice(0, 3),
      grammar_feedback: null,
    }));

    setToastNotice(`🎯 Mesleki Konu Seçildi: ${pill.title}`);

    if (autoPlayAudio) {
      setTimeout(() => {
        const targetRate =
          speechSpeedMode === "0.8x"
            ? persona.gender === "female"
              ? 0.84
              : persona.id === "mr_harrison"
              ? 0.82
              : 0.85
            : 1.0;
        setSpeakingAudioIndex(0);
        speakPersonaText(pill.initialQuestion, persona, {
          rate: targetRate,
          onStart: () => setSpeakingAudioIndex(0),
          onEnd: () => setSpeakingAudioIndex(null),
          onError: () => setSpeakingAudioIndex(null),
        });
      }, 200);
    }
  };

  // Akıllı Konuşma Gezgini - Kategori Aç/Kapat (Accordion Toggle)
  const handleToggleCategory = (cat: SpeakingCategory) => {
    setOpenCategoryId((prev) => (prev === cat.id ? "" : cat.id));
    setActiveCategory(cat);
    const targetPersonaId =
      cat.id === "kids"
        ? selectedKidsCharacter
        : (cat.defaultPersonaId as PersonaId) || "sarah";
    setPersona(targetPersonaId);
    setSelectedScenarioId(cat.scenarioId);
    setActiveTopicTitle(`${cat.icon} ${cat.title}`);

    if (cat.id === "kids") {
      setActiveMode("casual");
      const targetP = PERSONAS[targetPersonaId] || PERSONAS.sparky;
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setDialogue([
        {
          role: "assistant",
          message: `AI Mentor: ${targetP.greeting}`,
          timestamp: now,
        },
      ]);
      if (autoPlayAudio) {
        setTimeout(() => {
          playSpeech(targetP.greeting, 0, targetP);
        }, 150);
      }
    }
  };

  // 4 Sorudan Birine Tıklandığında Diyaloğu Başlat
  const handleSelectQuestion = (qText: string, cat: SpeakingCategory, slotIndex: number) => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    setActiveCategory(cat);
    setOpenCategoryId(cat.id);
    setActiveQuestionText(qText);
    setActiveTopicTitle(`${cat.icon} ${cat.title}`);

    const targetPersonaId =
      cat.id === "kids"
        ? selectedKidsCharacter
        : (cat.defaultPersonaId as PersonaId) || "sarah";
    setPersona(targetPersonaId);
    setSelectedScenarioId(cat.scenarioId);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${qText}`,
        timestamp: now,
      },
    ]);

    const targetP = PERSONAS[targetPersonaId] || persona;
    if (autoPlayAudio) {
      setTimeout(() => {
        playSpeech(qText, 0, targetP);
      }, 200);
    }

    setToastNotice(`Soru seçildi. Mikrofonla veya yazarak yanıt verebilirsiniz.`);
  };

  // Dinamik Soru Yenileme (Slot Replenish)
  const handleReplenishQuestionSlot = (cat: SpeakingCategory, slotIndex: number) => {
    const currentQuestions = categoryActiveQuestions[cat.id] || cat.questionPool.slice(0, 4);
    const nextIdx = categoryPoolIndex[cat.id] ?? 4;
    const nextQ = cat.questionPool[nextIdx % cat.questionPool.length];

    const updated = [...currentQuestions];
    updated[slotIndex] = nextQ;

    setCategoryActiveQuestions((prev) => ({
      ...prev,
      [cat.id]: updated,
    }));
    setCategoryPoolIndex((prev) => ({
      ...prev,
      [cat.id]: nextIdx + 1,
    }));
    setToastNotice("Yeni soru eklendi.");
  };

  // 5. Seçenek: Kategoriye Özel Serbest Konu Başlatma (Strict Topic Guardrails)
  const handleCustomCategoryTopicSubmit = async (e: React.FormEvent, cat: SpeakingCategory) => {
    e.preventDefault();
    const topic = (categoryCustomInputs[cat.id] || "").trim();
    if (!topic || isGeneratingTopic) return;

    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");
    setIsGeneratingTopic(true);
    setActiveCategory(cat);
    setActiveTopicTitle(`${cat.icon} ${topic}`);
    if (cat.defaultPersonaId) {
      setPersona(cat.defaultPersonaId as PersonaId);
    }
    setSelectedScenarioId(cat.scenarioId);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const res = await fetch(`${API_BASE}/api/v1/speaking/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: cat.scenarioId,
          conversation_mode: activeMode,
          history: [],
          user_transcript: `Let's discuss: "${topic}". As ${persona.title} (${persona.name}), ask me a concise, engaging opening question strictly within the scope of ${cat.title} (${cat.allowedScope}).`,
          story_context: activeStory?.content || undefined,
          target_level: targetLevel,
          active_category: cat.title,
          allowed_scope: cat.allowedScope,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const openingQuestion = data.assistant_reply;

      setDialogue([
        {
          role: "assistant",
          message: `AI Mentor: ${openingQuestion}`,
          timestamp: now,
          feedback: {
            grammar_feedback: null,
            better_alternative: data.better_alternative,
            vocabulary_highlight: data.vocabulary_highlight,
            jargon_score: data.jargon_score,
            fluency_score: data.fluency_score,
          },
        },
      ]);

      setActiveQuestionText(openingQuestion);
      setCategoryCustomInputs((prev) => ({ ...prev, [cat.id]: "" }));

      if (autoPlayAudio) {
        setTimeout(() => {
          playSpeech(openingQuestion, 0);
        }, 200);
      }
    } catch (err) {
      console.warn("Kategori serbest konusu başlatılamadı:", err);
      setToastNotice("AI Mentor sorusu oluşturulamadı, lütfen tekrar deneyin.");
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  // 2. Serbest Konu Girişi (Free Topic Submission)
  const handleCustomTopicSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const topic = customTopicInput.trim();
    if (!topic || isGeneratingTopic) return;

    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");
    setIsGeneratingTopic(true);
    setActiveTopicTitle(topic);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const res = await fetch(`${API_BASE}/api/v1/speaking/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: activeCategory?.scenarioId || selectedScenarioId || "project_control",
          conversation_mode: activeMode,
          history: [],
          user_transcript: `Let's start a speaking discussion about: "${topic}". As ${persona.title} (${persona.name}), ask me a sharp, direct opening question to start our conversation on this topic.`,
          story_context: activeStory?.content || undefined,
          target_level: targetLevel,
          active_category: activeCategory?.title || undefined,
          allowed_scope: activeCategory?.allowedScope || undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const openingQuestion = data.assistant_reply;

      setDialogue([
        {
          role: "assistant",
          message: `AI Mentor: ${openingQuestion}`,
          timestamp: now,
          feedback: {
            grammar_feedback: null,
            better_alternative: data.better_alternative,
            vocabulary_highlight: data.vocabulary_highlight,
            jargon_score: data.jargon_score,
            fluency_score: data.fluency_score,
          },
        },
      ]);

      if (data.vocabulary_highlight?.length) {
        setScorecard((prev) => ({
          ...prev,
          vocabulary_highlight: data.vocabulary_highlight.slice(0, 3),
          better_alternative: data.better_alternative || prev.better_alternative,
        }));
      }

      setToastNotice(`🎯 Yeni Konu Başlatıldı: ${topic}`);

      if (autoPlayAudio) {
        setTimeout(() => {
          const targetRate =
            speechSpeedMode === "0.8x"
              ? persona.gender === "female"
                ? 0.84
                : persona.id === "mr_harrison"
                ? 0.82
                : 0.85
              : 1.0;
          setSpeakingAudioIndex(0);
          speakPersonaText(openingQuestion, persona, {
            rate: targetRate,
            onStart: () => setSpeakingAudioIndex(0),
            onEnd: () => setSpeakingAudioIndex(null),
            onError: () => setSpeakingAudioIndex(null),
          });
        }, 200);
      }
    } catch (err) {
      console.warn("Custom topic generation fallback:", err);
      const fallbackQuestion = `Welcome. Regarding "${topic}", what is the immediate critical path impact, and what mitigation protocol do you propose to ensure compliance with our baseline?`;
      setDialogue([
        {
          role: "assistant",
          message: `AI Mentor: ${fallbackQuestion}`,
          timestamp: now,
        },
      ]);
      if (autoPlayAudio) {
        setTimeout(() => {
          setSpeakingAudioIndex(0);
          speakPersonaText(fallbackQuestion, persona, {
            rate: 0.84,
            onStart: () => setSpeakingAudioIndex(0),
            onEnd: () => setSpeakingAudioIndex(null),
            onError: () => setSpeakingAudioIndex(null),
          });
        }, 200);
      }
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  // 3. Aynı Başlıkta Yeni Hikaye Üretimi (Story Pivot Bridge)
  const handleGenerateNewStoryVariant = async () => {
    if (!activeStory || isGeneratingNewStory) return;
    setIsGeneratingNewStory(true);
    setToastNotice("📖 Yeni hikaye varyantı üretiliyor...");
    stopAudio();
    if (isRecording) stopRecording();

    try {
      const vocabList = activeStory.target_vocabulary || ["variance", "critical path", "liquidated damages"];
      const res = await fetch(`${API_BASE}/api/v1/reading/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: activeStory.level || "Advanced",
          topic: `${activeStory.title} - Part 2 (Alternative Plot)`,
          target_words: vocabList.slice(0, 5),
          length_words: 250,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const newStoryData = await res.json();

      const updatedStory: ActiveStoryContext = {
        ...activeStory,
        title: newStoryData.title || `${activeStory.title} (Part 2)`,
        content: newStoryData.content,
        target_vocabulary: newStoryData.target_vocabulary
          ? newStoryData.target_vocabulary.map((v: any) => (typeof v === "string" ? v : v.word))
          : vocabList,
      };

      setActiveStory(updatedStory);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vocaship_active_story_context", JSON.stringify(updatedStory));
      }

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const pivotGreeting = `We have an alternative development in "${updatedStory.title}". As events unfolded: ${newStoryData.content.slice(0, 150)}... How does this shift impact our schedule baseline and how should we advise the project director?`;

      setDialogue([
        {
          role: "assistant",
          message: `AI Mentor: ${pivotGreeting}`,
          timestamp: now,
        },
      ]);

      setScorecard((prev) => ({
        ...prev,
        vocabulary_highlight: (updatedStory.target_vocabulary || []).slice(0, 4),
      }));

      setToastNotice(`✨ Yeni Hikaye Üretildi: ${updatedStory.title}`);

      if (autoPlayAudio) {
        setTimeout(() => playSpeech(pivotGreeting, 0), 200);
      }
    } catch (err: any) {
      console.error("Failed to generate new story variant:", err);
      setToastNotice("Hikaye varyantı üretilemedi, lütfen tekrar deneyin.");
    } finally {
      setIsGeneratingNewStory(false);
    }
  };

  // Örnek EPC Vaka Hikayesi Yükleme
  const handleLoadSampleEPCStory = () => {
    setActiveStory(DEFAULT_EPC_STORY);
    setActiveTopicTitle(`📖 ${DEFAULT_EPC_STORY.title}`);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vocaship_active_story_context", JSON.stringify(DEFAULT_EPC_STORY));
    }
    const intro = `Welcome to our case discussion on "${DEFAULT_EPC_STORY.title}". The contractor submitted an EOT claim for 60 days under Clause 8.4, but we detected concurrent piping procurement delays. How will you substantiate this in tomorrow's executive claims meeting?`;
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${intro}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setScorecard((prev) => ({
      ...prev,
      vocabulary_highlight: DEFAULT_EPC_STORY.target_vocabulary!.slice(0, 3),
    }));
    setToastNotice(`📖 Örnek EPC Vaka Yüklendi: ${DEFAULT_EPC_STORY.title}`);
    if (autoPlayAudio) {
      setTimeout(() => playSpeech(intro, 0), 200);
    }
  };

  // Mod Değiştirme (4 Modlu Dinamik Konuşma Mimarisi)
  const handleSelectMode = (mode: ConversationMode) => {
    setActiveMode(mode);
    const scenariosInMode = SCENARIOS.filter((s) => s.mode === mode);
    if (scenariosInMode.length > 0) {
      handleSelectScenario(scenariosInMode[0].id, scenariosInMode[0]);
    }
  };

  // Senaryo Değiştirme
  const handleSelectScenario = (scId: string, customSc?: ScenarioItem) => {
    setSelectedScenarioId(scId);
    const targetSc = customSc || SCENARIOS.find((s) => s.id === scId) || SCENARIOS[0];

    // Karakteri senaryoya göre güncelle
    if (targetSc.persona_id && PERSONAS[targetSc.persona_id]) {
      setPersona(targetSc.persona_id);
    }

    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${targetSc.initial_greeting}`,
        timestamp: now,
      },
    ]);

    // Karnedeki terimleri senaryoya göre güncelle
    setScorecard((prev) => ({
      ...prev,
      vocabulary_highlight: targetSc.target_vocabulary.slice(0, 3),
      grammar_feedback: null,
    }));

    setToastNotice(`🎯 ${CONVERSATION_MODES[targetSc.mode].shortLabel}: ${targetSc.title}`);

    if (autoPlayAudio) {
      setTimeout(() => {
        const targetP = PERSONAS[targetSc.persona_id] || persona;
        const targetRate =
          speechSpeedMode === "0.8x"
            ? targetP.gender === "female"
              ? 0.84
              : targetP.id === "mr_harrison"
              ? 0.82
              : 0.85
            : 1.0;
        setSpeakingAudioIndex(0);
        speakPersonaText(targetSc.initial_greeting, targetP, {
          rate: targetRate,
          onStart: () => setSpeakingAudioIndex(0),
          onEnd: () => setSpeakingAudioIndex(null),
          onError: () => setSpeakingAudioIndex(null),
        });
      }, 200);
    }
  };

  // Konuşma Tanıma (STT)
  const startRecording = () => {
    stopAudio();
    setPermissionError(null);
    setUserTranscript("");
    setInterimText("");

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setPermissionError("Tarayıcınız ses tanımayı desteklemiyor. Chrome veya Edge önerilir.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += trans;
          } else {
            interimStr += trans;
          }
        }

        if (finalStr) {
          setUserTranscript((prev) => (prev ? `${prev} ${finalStr}` : finalStr));
        }
        setInterimText(interimStr);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setPermissionError("Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofona izin verin.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setPermissionError(err?.message || "Mikrofon başlatılamadı.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    if (interimText.trim()) {
      setUserTranscript((prev) => (prev ? `${prev} ${interimText.trim()}` : interimText.trim()));
      setInterimText("");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Yanıtı Backend'e Gönder ve Değerlendir
  const handleSubmitResponse = async (explicitText?: string) => {
    const textToSend = explicitText || userTranscript.trim() || interimText.trim();
    if (!textToSend || isThinking) return;

    if (isRecording) {
      stopRecording();
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userTurn: DialogueTurn = {
      role: "user",
      message: `User: ${textToSend}`,
      timestamp,
    };

    const updatedDialogue = [...dialogue, userTurn];
    setDialogue(updatedDialogue);
    setUserTranscript("");
    setInterimText("");
    setIsThinking(true);
    setToastNotice(null);

    // 2. DİNAMİK SORU DÖNGÜSÜ (Interactive Question Replenish):
    // Kullanıcı 4 sorudan birini seçip cevap verdiğinde soru tamamlandı işaretlenir ve yerine yeni soru gelir
    if (activeQuestionText) {
      setAnsweredQuestions((prev) => (prev.includes(activeQuestionText) ? prev : [...prev, activeQuestionText]));

      const currentCat = activeCategory;
      if (currentCat) {
        const currentQuestions = categoryActiveQuestions[currentCat.id] || currentCat.questionPool.slice(0, 4);
        const slotIdx = currentQuestions.findIndex((q) => q === activeQuestionText);
        if (slotIdx !== -1) {
          const nextIdx = categoryPoolIndex[currentCat.id] ?? 4;
          const nextQ = currentCat.questionPool[nextIdx % currentCat.questionPool.length];
          const updated = [...currentQuestions];
          updated[slotIdx] = nextQ;
          setCategoryActiveQuestions((prev) => ({
            ...prev,
            [currentCat.id]: updated,
          }));
          setCategoryPoolIndex((prev) => ({
            ...prev,
            [currentCat.id]: nextIdx + 1,
          }));
        }
      }
    }

    try {
      const historyPayload = updatedDialogue.map((turn) => ({
        role: turn.role,
        message: turn.message,
      }));

      const res = await fetch(`${API_BASE}/api/v1/speaking/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: selectedScenarioId,
          conversation_mode: activeMode,
          history: historyPayload.slice(-4),
          user_transcript: textToSend,
          story_context: activeStory?.content || undefined,
          target_level: targetLevel,
          active_category: activeCategory?.title || undefined,
          allowed_scope: activeCategory?.allowedScope || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantTurn: DialogueTurn = {
        role: "assistant",
        message: `AI Mentor: ${data.assistant_reply}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: {
          grammar_feedback: data.grammar_feedback || null,
          better_alternative: data.better_alternative,
          vocabulary_highlight: data.vocabulary_highlight || [],
          jargon_score: data.jargon_score ?? 86,
          fluency_score: data.fluency_score ?? 86,
        },
      };

      setDialogue([...updatedDialogue, assistantTurn]);
      setScorecard({
        grammar_feedback: data.grammar_feedback || null,
        improvement_original: "to catch cost overrun early",
        improvement_suggestion: data.grammar_feedback || "Suggesting to mitigate potential cost overruns proactively",
        better_alternative:
          data.better_alternative ||
          "We were compelled to fast-track key deliverables to mitigate variances across the critical path baseline.",
        vocabulary_highlight:
          data.vocabulary_highlight && data.vocabulary_highlight.length > 0
            ? data.vocabulary_highlight
            : ["variance", "mitigate", "critical path"],
        jargon_score: data.jargon_score ?? 86,
        fluency_score: data.fluency_score ?? 86,
        idiomatic_phrase: "keep on a tight rein for idiomatic tight management",
      });

      if (autoPlayAudio && data.assistant_reply) {
        const nextIdx = updatedDialogue.length;
        setTimeout(() => playSpeech(data.assistant_reply, nextIdx), 250);
      }
    } catch (err: any) {
      console.warn("Backend response failed, using fast fallback simulation:", err);
      let fallbackReply = "Could you elaborate on how you propose to mitigate this?";
      if (activeMode === "casual") {
        fallbackReply = "That sounds really fun! What do you like to do most when you have free time?";
      } else if (activeMode === "problem_solving") {
        fallbackReply = "That's a quick fix, but what happens if the main supplier delays further? What is your backup plan?";
      } else if (activeMode === "story_debate") {
        fallbackReply = "That's an intriguing take on the story. Do you think the protagonist had any other moral choice?";
      } else {
        fallbackReply =
          "Reallocating subcontractor teams could compress the critical path by several weeks. How will this expedite our delivery without incurring substantial acceleration claims?";
      }

      const assistantTurn: DialogueTurn = {
        role: "assistant",
        message: `AI Mentor: ${fallbackReply}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setDialogue([...updatedDialogue, assistantTurn]);
      setScorecard((prev) => ({
        ...prev,
        fluency_score: activeMode === "casual" ? 92 : 86,
      }));

      if (autoPlayAudio) {
        const nextIdx = updatedDialogue.length;
        setTimeout(() => playSpeech(fallbackReply, nextIdx), 250);
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Diyaloğu Baştan Başlat
  const handleResetDialogue = () => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${activeScenario.initial_greeting}`,
        timestamp: now,
      },
    ]);
    setScorecard({
      grammar_feedback: null,
      improvement_original: "to catch cost overrun early",
      improvement_suggestion: "Suggesting to mitigate potential cost overruns proactively",
      better_alternative:
        "We were compelled to fast-track key deliverables to mitigate variances across the critical path baseline.",
      vocabulary_highlight: ["variance", "mitigate", "critical path"],
      jargon_score: 86,
      fluency_score: 86,
      idiomatic_phrase: "keep on a tight rein for idiomatic tight management",
    });
    setToastNotice("Pratik oturumu sıfırlandı.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      {/* 3 SÜTUNLU ANA DÜZEN (GRID & FLEX) - Doğrudan Ana Navbar Altında Ferah Boşluk */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 pt-6 pb-8 flex flex-col lg:flex-row gap-5 items-start w-full overflow-x-hidden flex-1">
        {/* ========================================================================= */}
        {/* A) SOL SÜTUN - BUGÜN NE KONUŞMAK İSTERSİN? & MESLEKİ ÖNERİLER (w-80)      */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {/* ========================================================================= */}
          {/* 1. AKILLI KONUŞMA GEZGİNİ (SMART CONVERSATION EXPLORER ACCORDION)         */}
          {/* Reading Room ile birebir aynı görsel stil: 🌍 GENEL KÜLTÜR + 💼 MESLEKLER */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
            {/* Üst Başlık & Rozet */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-white">
                  {t("speaking_explorer_title", "Akıllı Konuşma Gezgini")}
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                8 Kategori
              </span>
            </div>

            {/* Kategori Grupları */}
            <div className="space-y-4">
              {/* BÖLÜM 1: 🌍 GENERAL CULTURE */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t("speaking_cat_general_culture", "🌍 GENERAL CULTURE")}</span>
                </div>

                <div className="space-y-2">
                  {generalCultureCats.map((cat) => {
                    const isOpen = openCategoryId === cat.id;
                    const isCatActive = activeCategory.id === cat.id;
                    const activeQuestions =
                      categoryActiveQuestions[cat.id] || cat.questionPool.slice(0, 4);

                    return (
                      <div
                        key={cat.id}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isCatActive
                            ? "border-emerald-500/70 bg-slate-950/90 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                            : isOpen
                            ? "border-slate-700/80 bg-slate-950/70"
                            : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-700/60"
                        }`}
                      >
                        {/* Klasör Başlığı (Akordeon Butonu) */}
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          className="w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base shrink-0 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                              {cat.icon}
                            </span>
                            <div className="min-w-0">
                              <h3
                                className={`text-xs font-bold truncate transition-colors ${
                                  isCatActive
                                    ? "text-emerald-300"
                                    : "text-slate-200 group-hover:text-white"
                                }`}
                              >
                                {cat.title}
                              </h3>
                              <p className="text-[10px] text-slate-400 truncate">
                                {cat.subTitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isCatActive
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-slate-800 text-slate-400 border-slate-700/50"
                              }`}
                            >
                              {cat.levelBadge}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isOpen
                                  ? "rotate-180 text-emerald-400"
                                  : "text-slate-500 group-hover:text-slate-300"
                              }`}
                            />
                          </div>
                        </button>

                        {/* Akordeon Açılır Alanı: 4 Dinamik Soru + 5. Serbest Konu */}
                        {isOpen && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                            {/* 4 Dinamik Soru */}
                            <div className="space-y-1.5">
                              {activeQuestions.map((qText, qIdx) => {
                                const isAnswered = answeredQuestions.includes(qText);
                                const isSelected = activeQuestionText === qText;

                                return (
                                  <div
                                    key={qIdx}
                                    onClick={() => handleSelectQuestion(qText, cat, qIdx)}
                                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 relative group cursor-pointer ${
                                      isSelected
                                        ? "bg-emerald-950/50 border-emerald-500/80 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                                        : isAnswered
                                        ? "bg-slate-900/60 border-slate-800/60 opacity-80"
                                        : "bg-slate-900/40 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-2 min-w-0">
                                        <span
                                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${
                                            isAnswered
                                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                              : isSelected
                                              ? "bg-emerald-500 text-slate-950 font-black"
                                              : "bg-slate-800 text-slate-400"
                                          }`}
                                        >
                                          {isAnswered ? "✓" : `Q${qIdx + 1}`}
                                        </span>
                                        <p
                                          className={`text-[11px] leading-snug line-clamp-2 ${
                                            isSelected
                                              ? "text-emerald-200 font-semibold"
                                              : isAnswered
                                              ? "text-slate-400 line-through"
                                              : "text-slate-300 group-hover:text-white"
                                          }`}
                                        >
                                          {qText}
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        title="Sıradaki Soruyla Tazele"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReplenishQuestionSlot(cat, qIdx);
                                        }}
                                        className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition shrink-0 opacity-40 group-hover:opacity-100"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* 5. Seçenek: ✍️ Bugün ne konuşmak istersin? */}
                            <div className="pt-2 border-t border-slate-800/70">
                              <div className="flex items-center gap-1.5 pb-1.5 text-[10px] font-bold text-slate-400">
                                <span>✍️</span>
                                <span>
                                  {t("speaking_what_to_talk_today", "Bugün ne konuşmak istersin?")}
                                </span>
                              </div>
                              <form
                                onSubmit={(e) => handleCustomCategoryTopicSubmit(e, cat)}
                                className="relative flex items-center"
                              >
                                <input
                                  type="text"
                                  value={categoryCustomInputs[cat.id] || ""}
                                  onChange={(e) =>
                                    setCategoryCustomInputs((prev) => ({
                                      ...prev,
                                      [cat.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Örn: Hafta sonu kahvaltısı, seyahat planı..."
                                  disabled={isGeneratingTopic}
                                  className="w-full pl-2.5 pr-14 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-[11px] text-white placeholder-slate-500 outline-none transition"
                                />
                                <button
                                  type="submit"
                                  disabled={!categoryCustomInputs[cat.id]?.trim() || isGeneratingTopic}
                                  className="absolute right-1 top-1 bottom-1 px-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                  title="Bu konuda oturumu başlat"
                                >
                                  {isGeneratingTopic && activeCategory.id === cat.id ? (
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <>
                                      <span>{t("speaking_start_short", "Başlat")}</span>
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </>
                                  )}
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BÖLÜM 2: 💼 PROFESSIONAL & SPECIALIZED */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t("speaking_cat_professional", "💼 PROFESSIONAL & SPECIALIZED")}</span>
                </div>

                <div className="space-y-2">
                  {professionalCats.map((cat) => {
                    const isOpen = openCategoryId === cat.id;
                    const isCatActive = activeCategory.id === cat.id;
                    const activeQuestions =
                      categoryActiveQuestions[cat.id] || cat.questionPool.slice(0, 4);

                    return (
                      <div
                        key={cat.id}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isCatActive
                            ? "border-emerald-500/70 bg-slate-950/90 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                            : isOpen
                            ? "border-slate-700/80 bg-slate-950/70"
                            : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-700/60"
                        }`}
                      >
                        {/* Klasör Başlığı (Akordeon Butonu) */}
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          className="w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base shrink-0 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                              {cat.icon}
                            </span>
                            <div className="min-w-0">
                              <h3
                                className={`text-xs font-bold truncate transition-colors ${
                                  isCatActive
                                    ? "text-emerald-300"
                                    : "text-slate-200 group-hover:text-white"
                                }`}
                              >
                                {cat.title}
                              </h3>
                              <p className="text-[10px] text-slate-400 truncate">
                                {cat.subTitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isCatActive
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-slate-800 text-slate-400 border-slate-700/50"
                              }`}
                            >
                              {cat.levelBadge}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isOpen
                                  ? "rotate-180 text-emerald-400"
                                  : "text-slate-500 group-hover:text-slate-300"
                              }`}
                            />
                          </div>
                        </button>

                        {/* Akordeon Açılır Alanı: 4 Dinamik Soru + 5. Serbest Konu */}
                        {isOpen && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                            {/* 4 Dinamik Soru */}
                            <div className="space-y-1.5">
                              {activeQuestions.map((qText, qIdx) => {
                                const isAnswered = answeredQuestions.includes(qText);
                                const isSelected = activeQuestionText === qText;

                                return (
                                  <div
                                    key={qIdx}
                                    onClick={() => handleSelectQuestion(qText, cat, qIdx)}
                                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 relative group cursor-pointer ${
                                      isSelected
                                        ? "bg-emerald-950/50 border-emerald-500/80 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                                        : isAnswered
                                        ? "bg-slate-900/60 border-slate-800/60 opacity-80"
                                        : "bg-slate-900/40 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-2 min-w-0">
                                        <span
                                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${
                                            isAnswered
                                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                              : isSelected
                                              ? "bg-emerald-500 text-slate-950 font-black"
                                              : "bg-slate-800 text-slate-400"
                                          }`}
                                        >
                                          {isAnswered ? "✓" : `Q${qIdx + 1}`}
                                        </span>
                                        <p
                                          className={`text-[11px] leading-snug line-clamp-2 ${
                                            isSelected
                                              ? "text-emerald-200 font-semibold"
                                              : isAnswered
                                              ? "text-slate-400 line-through"
                                              : "text-slate-300 group-hover:text-white"
                                          }`}
                                        >
                                          {qText}
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        title="Sıradaki Soruyla Tazele"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReplenishQuestionSlot(cat, qIdx);
                                        }}
                                        className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition shrink-0 opacity-40 group-hover:opacity-100"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* 5. Seçenek: ✍️ Bugün ne konuşmak istersin? */}
                            <div className="pt-2 border-t border-slate-800/70">
                              <div className="flex items-center gap-1.5 pb-1.5 text-[10px] font-bold text-slate-400">
                                <span>✍️</span>
                                <span>
                                  {t("speaking_what_to_talk_today", "Bugün ne konuşmak istersin?")}
                                </span>
                              </div>
                              <form
                                onSubmit={(e) => handleCustomCategoryTopicSubmit(e, cat)}
                                className="relative flex items-center"
                              >
                                <input
                                  type="text"
                                  value={categoryCustomInputs[cat.id] || ""}
                                  onChange={(e) =>
                                    setCategoryCustomInputs((prev) => ({
                                      ...prev,
                                      [cat.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Örn: Gecikme analizi, EVM kriz toplantısı..."
                                  disabled={isGeneratingTopic}
                                  className="w-full pl-2.5 pr-14 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-[11px] text-white placeholder-slate-500 outline-none transition"
                                />
                                <button
                                  type="submit"
                                  disabled={!categoryCustomInputs[cat.id]?.trim() || isGeneratingTopic}
                                  className="absolute right-1 top-1 bottom-1 px-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                  title="Bu konuda oturumu başlat"
                                >
                                  {isGeneratingTopic && activeCategory.id === cat.id ? (
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <>
                                      <span>{t("speaking_start_short", "Başlat")}</span>
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </>
                                  )}
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 3. AYNI BAŞLIKTA YENİ HİKAYE ÜRETİMİ (Story Pivot Bridge) */}
          {activeStory ? (
            <div className="p-4 rounded-3xl bg-indigo-950/30 border border-indigo-500/40 shadow-xl space-y-3 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-indigo-500/30">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t("speaking_reading_case_link", "Okuma Odası Vaka Bağlantısı")}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  {activeStory.level || "C1"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📖</span>
                  <span className="truncate">{t("speaking_topic_label", "Konu:")} {activeStory.title}</span>
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {activeStory.content}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateNewStoryVariant}
                disabled={isGeneratingNewStory}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-500/25 active:scale-98"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingNewStory ? "animate-spin" : ""}`} />
                <span>{isGeneratingNewStory ? t("speaking_generating_story", "Yeni Hikaye Üretiliyor...") : t("speaking_generate_new_story", "🔄 Aynı Başlıkta Yeni Bir Hikaye Üret")}</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-indigo-400" />
                  <span>{t("speaking_reading_story_link", "Okuma Odası Hikaye Bağlantısı")}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t("speaking_reading_story_desc", "Okuma Odası'ndan açılan hikayeleri tartışabilir veya tek tıkla EPC örnek vaka yükleyebilirsiniz.")}
              </p>
              <button
                type="button"
                onClick={handleLoadSampleEPCStory}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-indigo-300 font-semibold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{t("speaking_load_sample_epc", "📑 Örnek EPC Vaka Hikayesi Yükle")}</span>
              </button>
            </div>
          )}

          {/* Aktif Konuşma Odağı Özeti */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              {t("speaking_active_focus", "Aktif Konuşma Odağı:")}
            </span>
            <p className="text-slate-300 text-[11px] font-medium leading-relaxed truncate">
              {activeTopicTitle}
            </p>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* B) ORTA SÜTUN - CANLI DİYALOG & MİKROFON SAHNESİ (flex-1)                 */}
        {/* ========================================================================= */}
        <section className="flex-1 w-full min-w-0">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 min-h-[660px] relative overflow-hidden backdrop-blur-md">
            {/* Arka Plan Neon Parıltısı */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Kart Başlığı */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 z-10 relative">
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                <h1 className="text-sm font-black uppercase tracking-wider text-white truncate">
                  AI Speaking Lounge
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    CONVERSATION_MODES[activeMode].badgeColor
                  }`}
                >
                  <span>{CONVERSATION_MODES[activeMode].icon}</span>
                  <span>{CONVERSATION_MODES[activeMode].label}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {persona.name} • {persona.level}
                </span>

                {/* Akademik Seviye Modu Toggle */}
                <button
                  type="button"
                  onClick={() => setTargetLevel(targetLevel === "C1" ? "B2" : "C1")}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-semibold text-slate-300 transition cursor-pointer"
                  title="Akademik Seviye Modunu Değiştir"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-emerald-400 font-bold">{targetLevel}</span>
                </button>

                {/* + Practice Butonu */}
                <button
                  type="button"
                  onClick={handleResetDialogue}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] shadow-sm transition cursor-pointer active:scale-95"
                  title="Yeni Oturum Başlat"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Practice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (autoPlayAudio) stopAudio();
                    setAutoPlayAudio(!autoPlayAudio);
                  }}
                  className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    autoPlayAudio
                      ? "bg-slate-950 border-emerald-500/40 text-emerald-400 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}
                  title="Otomatik TTS Aç/Kapat"
                >
                  {autoPlayAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 1. CANLI & ANİMASYONLU AVATAR MOTORU + KOMPAKT ÇOCUK KARAKTER SEÇİCİ */}
            <div className="flex flex-col items-center justify-center pt-1 pb-1 z-10 relative space-y-2.5">
              {/* Çocuk Modu Aktifken (veya Hızlı Geçiş İçin) Avatarın Hemen Üstünde Kompakt Karakter Seçici */}
              <div
                data-testid="kids-character-selector"
                className={`inline-flex items-center gap-1.5 p-1 rounded-2xl border transition-all duration-200 shadow-lg ${
                  isKidsMode
                    ? "bg-slate-950/95 border-amber-500/40 shadow-amber-500/10"
                    : "bg-slate-950/80 border-slate-800/80"
                }`}
              >
                <button
                  type="button"
                  data-testid="select-mascot-sparky"
                  onClick={() => handleSelectKidsCharacter("sparky")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer active:scale-95 ${
                    persona.id === "sparky"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-300/60"
                      : "text-slate-300 hover:text-amber-300 hover:bg-slate-900/90"
                  }`}
                >
                  <span className="text-base leading-none">🦊</span>
                  <span>Sparky</span>
                </button>

                <button
                  type="button"
                  data-testid="select-mascot-chuck"
                  onClick={() => handleSelectKidsCharacter("chuck")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer active:scale-95 ${
                    persona.id === "chuck"
                      ? "bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-950 shadow-md shadow-yellow-400/30 ring-2 ring-yellow-200/70"
                      : "text-slate-300 hover:text-yellow-300 hover:bg-slate-900/90"
                  }`}
                >
                  <span className="text-base leading-none">🐔</span>
                  <span>Chuck (Tavuk)</span>
                </button>
              </div>

              <AvatarDisplay
                personaId={persona.id}
                avatarState={avatarState}
                size="xl"
                showBadges={true}
              />
            </div>

            {/* 2. MESAJ DÖKÜM ALANI (Orta Kısım) */}
            <div
              ref={chatScrollRef}
              className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3 px-1 sm:px-2 py-2 rounded-2xl bg-slate-950/50 border border-slate-800/80 scrollbar-thin z-10 relative"
            >
              {dialogue.map((turn, idx) => {
                const isAssistant = turn.role === "assistant";
                return isAssistant ? (
                  // AI Konuşma Balonu
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-md transition"
                  >
                    <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            AI Mentor
                          </span>
                          {turn.timestamp && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {turn.timestamp}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                          {turn.message.replace(/^\[.*?\]:\s*/, "").replace(/^AI Mentor:\s*/i, "")}
                        </p>
                      </div>
                    </div>

                    {/* Sağ Üst / Aksiyon Kontrolleri: Hız Seçici, Ses/Aksan İndikatörü ve Dinle Butonu */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-end sm:self-start">
                      {/* Ses/Aksan İndikatörü */}
                      <span
                        suppressHydrationWarning
                        className="inline-flex items-center px-2 py-1 rounded-xl text-[10px] font-mono font-bold bg-slate-950 text-emerald-400 border border-emerald-500/30 shadow-inner whitespace-nowrap"
                        title="Seçili karaktere göre aktif doğal nöral ses"
                      >
                        {!mounted
                          ? t("speaking_voice_loading", "🎙️ Ses Yükleniyor...")
                          : activeVoiceBadge || getActiveVoiceDisplay(persona)}
                      </span>

                      {/* Hız Seçici Toggle: [ 0.8x (Sakin) | 1.0x (Normal) ] */}
                      <div className="inline-flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => setSpeechSpeedMode("0.8x")}
                          className={`px-2 py-0.5 rounded-lg transition font-bold cursor-pointer ${
                            speechSpeedMode === "0.8x"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                          title="Sakin mülakat temposu (0.84x)"
                        >
                          {t("speaking_speed_calm", "0.8x (Sakin)")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpeechSpeedMode("1.0x")}
                          className={`px-2 py-0.5 rounded-lg transition font-bold cursor-pointer ${
                            speechSpeedMode === "1.0x"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                          title="Normal konuşma temposu (1.0x)"
                        >
                          {t("speaking_speed_normal", "1.0x (Normal)")}
                        </button>
                      </div>

                      {/* [ 🔊 Sesli Dinle ] Butonu */}
                      <button
                        type="button"
                        onClick={() => playSpeech(turn.message, idx)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition cursor-pointer ${
                          speakingAudioIndex === idx
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse font-bold"
                            : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800"
                        }`}
                        title={speakingAudioIndex === idx ? t("speaking_stop", "Durdur") : t("speaking_listen", "Sesli Dinle")}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {speakingAudioIndex === idx ? t("speaking_stop", "Durdur") : t("speaking_listen", "Sesli Dinle")}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Kullanıcı Baloncuğu
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 shadow-md ml-4 sm:ml-8"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
                        User
                      </span>
                      <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                        {turn.message.replace(/^User:\s*/i, "")}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Canlı Konuşma Transkripti */}
              {(userTranscript || interimText) && (
                <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 animate-pulse ml-4 sm:ml-8">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Mic className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                      {t("speaking_live_transcription", "User (Canlı Deşifre)")}
                    </span>
                    <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
                      {userTranscript} <span className="opacity-60 italic">{interimText}</span>
                    </p>
                  </div>
                </div>
              )}

              {isThinking && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 animate-pulse">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>{t("speaking_mentor_evaluating", "AI Mentor değerlendirme karnesini hazırlıyor...")}</span>
                </div>
              )}
            </div>

            {/* 3. SES DALGASI & MİKROFON KONTROLÜ (Alt Kısım) */}
            <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800/90 space-y-3 z-10 relative shadow-xl">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Sol Waveform Frekans Barları */}
                <div className="flex-1 flex justify-start">
                  <NeonWaveform active={isRecording || avatarState === "speaking"} />
                </div>

                {/* Merkezde Parlayan Gradyan Halkalı [ 🎙️ Tap to Speak ] Butonu */}
                <div className="relative group shrink-0">
                  <div
                    className={`absolute -inset-2 rounded-full transition duration-500 ${
                      isRecording
                        ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-80 blur-md animate-pulse"
                        : "bg-gradient-to-r from-emerald-500/30 to-teal-500/30 opacity-40 blur-sm group-hover:opacity-75"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all duration-300 cursor-pointer shadow-2xl ${
                      isRecording
                        ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-slate-950 ring-4 ring-emerald-300/80 scale-105 shadow-emerald-500/50"
                        : "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-2 border-emerald-500/50 text-white hover:border-emerald-400 hover:scale-102"
                    }`}
                    title={isRecording ? "Kaydı Durdur ve Gönder" : "Bas ve Konuş"}
                  >
                    <Mic
                      className={`w-6 h-6 mb-1 ${
                        isRecording ? "text-slate-950 animate-bounce" : "text-emerald-400"
                      }`}
                    />
                    <span className="text-[10px] tracking-tight font-black uppercase text-center px-1">
                      {isRecording ? t("speaking_listening", "Dinliyor") : t("speaking_tap_to_speak", "Tap to Speak")}
                    </span>
                  </button>
                </div>

                {/* Sağ Waveform Frekans Barları */}
                <div className="flex-1 flex justify-end">
                  <NeonWaveform active={isRecording || avatarState === "speaking"} />
                </div>
              </div>

              {/* Alt Bilgi: "Analyzing Speech... • 01:24" ve Kırmızı Kare Durdurma Butonu */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-850 px-1">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRecording
                        ? "bg-emerald-400 animate-ping"
                        : isThinking
                        ? "bg-indigo-400 animate-spin"
                        : "bg-slate-600"
                    }`}
                  />
                  <span>
                    {isThinking
                      ? t("speaking_analyzing_speech", "Analyzing Speech...")
                      : isRecording
                      ? t("speaking_listening_voice", "Listening to Voice...")
                      : t("speaking_analyzing_speech", "Analyzing Speech...")}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">{formatTimer(recordingSeconds)}</span>
                </div>

                {/* Kırmızı Kare Durdurma Butonu */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isRecording) stopRecording();
                      stopAudio();
                      setIsThinking(false);
                    }}
                    className="w-8 h-8 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 flex items-center justify-center transition cursor-pointer shadow-sm shadow-rose-500/20"
                    title="Durdur (Stop)"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Konuşmayı bitirince hemen değerlendir butonu */}
                  {(userTranscript || interimText) && (
                    <button
                      type="button"
                      onClick={() => handleSubmitResponse()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      {t("speaking_analyze_btn", "Analiz Et")}
                    </button>
                  )}
                </div>
              </div>

              {/* Hata veya Toast Bildirimi */}
              {permissionError && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{permissionError}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* C) SAĞ SÜTUN - DEĞERLENDİRME KARNESİ / SOHBET AKICILIĞI (w-80 flex-shrink-0) */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 space-y-4 backdrop-blur-md">
            {/* Başlık: Moda Göre Dinamik Karne Başlığı */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Award
                  className={`w-4 h-4 ${
                    activeMode === "casual"
                      ? "text-amber-400"
                      : activeMode === "problem_solving"
                      ? "text-rose-400"
                      : activeMode === "story_debate"
                      ? "text-indigo-400"
                      : "text-emerald-400"
                  }`}
                />
                <span>{CONVERSATION_MODES[activeMode].scorecardTitle}</span>
              </h2>
            </div>

            {/* 1. Skor Çemberi: Aktif Moda Göre Özelleştirilmiş */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 relative">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Arka plan daire */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* İlerleme dairesi */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ease-out ${
                      activeMode === "casual"
                        ? "stroke-amber-400"
                        : activeMode === "problem_solving"
                        ? "stroke-rose-400"
                        : activeMode === "story_debate"
                        ? "stroke-indigo-400"
                        : "stroke-emerald-400"
                    }`}
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (scorecard.fluency_score || (activeMode === "casual" ? 92 : 86))) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                      filter:
                        activeMode === "casual"
                          ? "drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))"
                          : activeMode === "problem_solving"
                          ? "drop-shadow(0 0 8px rgba(244, 63, 94, 0.6))"
                          : activeMode === "story_debate"
                          ? "drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))"
                          : "drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white tracking-tight">
                    %{scorecard.fluency_score || (activeMode === "casual" ? 92 : 86)}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span
                  className={`text-xs font-bold ${
                    activeMode === "casual"
                      ? "text-amber-400"
                      : activeMode === "problem_solving"
                      ? "text-rose-400"
                      : activeMode === "story_debate"
                      ? "text-indigo-400"
                      : "text-emerald-400"
                  }`}
                >
                  {activeMode === "casual"
                    ? "Doğal & Akıcı İletişim"
                    : activeMode === "problem_solving"
                    ? "Kriz Çözüm & Karar Hızı"
                    : activeMode === "story_debate"
                    ? "Argüman Bütünlüğü & Derinlik"
                    : "C1 - Advanced Precision"}
                </span>
                <p className="text-[10px] text-slate-500 font-mono">
                  {activeMode === "casual"
                    ? "Stresten Uzak, Rahat Sohbet"
                    : activeMode === "problem_solving"
                    ? "Hızlı Eylem & Analitik Netlik"
                    : activeMode === "story_debate"
                    ? "Eleştirel Düşünce & Münazara"
                    : "Executive Fluency & Precision"}
                </p>
              </div>
            </div>

            {/* 2. Jargon / Hedef Kelimeler Kutusu */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileCheck
                    className={`w-3.5 h-3.5 ${
                      activeMode === "casual"
                        ? "text-amber-400"
                        : activeMode === "problem_solving"
                        ? "text-rose-400"
                        : activeMode === "story_debate"
                        ? "text-indigo-400"
                        : "text-emerald-400"
                    }`}
                  />
                  <span>
                    {activeMode === "casual"
                      ? "Günlük Kalıplar & İfadeler"
                      : activeMode === "problem_solving"
                      ? "Kriz & Müdahale Terimleri"
                      : activeMode === "story_debate"
                      ? "Münazara ve Analiz Terimleri"
                      : t("speaking_jargon_precision", "Jargon Precision / Teknik Terimler")}
                  </span>
                </h4>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    activeMode === "casual"
                      ? "text-amber-400"
                      : activeMode === "problem_solving"
                      ? "text-rose-400"
                      : activeMode === "story_debate"
                      ? "text-indigo-400"
                      : "text-emerald-400"
                  }`}
                >
                  {scorecard.vocabulary_highlight.length} Tespit
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {scorecard.vocabulary_highlight.map((word, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold shadow-sm ${
                      activeMode === "casual"
                        ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                        : activeMode === "problem_solving"
                        ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                        : activeMode === "story_debate"
                        ? "bg-indigo-950 text-indigo-300 border border-indigo-500/40"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    [ {word} ]
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Düzeltme & İpucu Kutusu (Casual modda yumuşak ipucu, diğerlerinde düzeltme) */}
            <div
              className={`p-3.5 rounded-2xl space-y-2 ${
                activeMode === "casual"
                  ? "bg-teal-950/20 border border-teal-500/30"
                  : "bg-amber-950/20 border border-amber-500/30"
              }`}
            >
              <div
                className={`flex items-center space-x-1.5 ${
                  activeMode === "casual" ? "text-teal-400" : "text-amber-400"
                }`}
              >
                {activeMode === "casual" ? (
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <h4 className="text-[11px] font-bold uppercase tracking-wider">
                  {activeMode === "casual"
                    ? "Doğal Konuşma İpucu"
                    : activeMode === "problem_solving"
                    ? "Aksiyon Güçlendirme Önerisi"
                    : activeMode === "story_debate"
                    ? "Argümanı Güçlendirme İpucu"
                    : t("speaking_improvement_needed", "Improvement Needed / Düzeltme Önerisi")}
                </h4>
              </div>
              <div className="space-y-1.5 text-xs">
                {activeMode !== "casual" && (
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 line-through text-rose-400/90 font-mono text-[11px]">
                    &quot;{scorecard.improvement_original}&quot;
                  </div>
                )}
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-medium pl-1 ${
                    activeMode === "casual" ? "text-teal-300" : "text-amber-300"
                  }`}
                >
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeMode === "casual" ? "text-teal-400" : "text-emerald-400"
                    }`}
                  />
                  <span>
                    {scorecard.grammar_feedback ||
                      (activeMode === "casual"
                        ? "Cümleleriniz oldukça doğal ve anlaşılır. Samimi üslubunuzu koruyun!"
                        : scorecard.improvement_suggestion)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Alternatif İfade Kutusu */}
            <div
              className={`p-3.5 rounded-2xl space-y-2.5 ${
                activeMode === "casual"
                  ? "bg-amber-950/20 border border-amber-500/30"
                  : activeMode === "problem_solving"
                  ? "bg-rose-950/25 border border-rose-500/30"
                  : "bg-indigo-950/30 border border-indigo-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4
                  className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    activeMode === "casual"
                      ? "text-amber-300"
                      : activeMode === "problem_solving"
                      ? "text-rose-300"
                      : "text-indigo-300"
                  }`}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      activeMode === "casual"
                        ? "text-amber-400"
                        : activeMode === "problem_solving"
                        ? "text-rose-400"
                        : "text-indigo-400"
                    }`}
                  />
                  <span>
                    {activeMode === "casual"
                      ? "Doğal & Günlük Alternatif"
                      : activeMode === "problem_solving"
                      ? "Net Kriz Çözüm İfadesi"
                      : activeMode === "story_debate"
                      ? "Entelektüel Münazara Cümlesi"
                      : t("speaking_executive_phrasing", "Executive Phrasing (C1) / Kurumsal İfade")}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(scorecard.better_alternative);
                    setCopiedAlt(true);
                    setTimeout(() => setCopiedAlt(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  title="Alternatif Cümleyi Kopyala"
                >
                  {copiedAlt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAlt ? t("speaking_copied", "Kopyalandı!") : t("speaking_copy", "Kopyala")}</span>
                </button>
              </div>

              {/* Deyimsel / Vurgulu İfade */}
              {scorecard.idiomatic_phrase && activeMode !== "casual" && (
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 italic font-serif">
                  &ldquo;{scorecard.idiomatic_phrase}&rdquo;
                </div>
              )}

              {/* Alternatif Cümle */}
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {scorecard.better_alternative}
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
