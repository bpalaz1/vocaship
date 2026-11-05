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
  Camera,
  Flag,
  Archive,
} from "lucide-react";
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  usePersona,
  PersonaId,
  PersonaInfo,
  PERSONAS,
  CORE_PERSONAS,
} from "../context/PersonaContext";
import { speakPersonaText, stopSpeech, getActiveVoiceDisplay, getCalibratedRateForPersona } from "../utils/tts";
import LiveTranscript from "../components/speaking/LiveTranscript";
import SpeakingScorecard from "../components/speaking/SpeakingScorecard";
import SpeakingTranscript from "../components/speaking/SpeakingTranscript";
import SpeakingSidebar, { DeckItem, DeckQuestionItem } from "../components/speaking/SpeakingSidebar";
import SpeakingLounge from "../components/speaking/SpeakingLounge";
import SpeakingArchiveModal from "../components/speaking/SpeakingArchiveModal";
import { saveSpeakingArchiveSession } from "../actions/speakingArchive";
import {
  generateStoryDebateQuestions,
  StoryDebateQuestionItem,
} from "../actions/speakingAI";
import AvatarDisplay from "../components/avatar/AvatarDisplay";
import CustomAvatarModal, { CustomUserAvatarData } from "../components/avatar/CustomAvatarModal";
import Transform3DModal, { Transform3DAvatarMeta } from "../components/avatar/Transform3DModal";
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
  storyId?: string;
  title: string;
  level?: string;
  topic?: string;
  content?: string;
  snippet?: string;
  targetWords?: string[];
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
    customAvatar,
    saveCustomAvatar,
    user3DAvatarUrl,
    user3DAvatarMeta,
    saveUser3DAvatar,
  } = usePersona();
  const { user } = useAuth();

  const [isCustomAvatarModalOpen, setIsCustomAvatarModalOpen] = useState<boolean>(false);
  const [isTransform3DModalOpen, setIsTransform3DModalOpen] = useState<boolean>(false);
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
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
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
  const [storyDebateQuestions, setStoryDebateQuestions] = useState<StoryDebateQuestionItem[]>([]);
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

  // Dinamik Takip Sorusu Motoru (Dynamic Follow-up Question Engine)
  const [currentFollowUpQuestion, setCurrentFollowUpQuestion] = useState<string | null>(
    "What did you have for breakfast this morning?"
  );

  // 📚 Aktif Destemden Sorular State ve Entegrasyonu
  const PRESET_DECKS: DeckItem[] = [
    {
      id: "preset_c1_pro",
      title: "💼 C1 Profesyonel İş & Kariyer",
      description: "Proje Kontrol, FIDIC ve Yönetim terminolojisi",
      card_count: 50,
    },
    {
      id: "preset_core3000",
      title: "🌐 En Sık Çıkan 3000 Temel Kelime",
      description: "A1-B1 Başlangıç ve günlük yaşam için temel kelimeler",
      card_count: 50,
    },
    {
      id: "preset_academic",
      title: "🎓 Akademik Sınav Paketi (YDS & IELTS)",
      description: "Akademik makalelerde ve sınavlarda en sık çıkan kritik kelimeler",
      card_count: 45,
    },
  ];

  const PRESET_DECK_WORDS: Record<string, string[]> = {
    preset_c1_pro: ["allocate", "mitigate", "variance", "critical path", "demurrage", "contingency"],
    preset_core3000: ["routine", "efficient", "adventure", "relaxing", "habit", "favorite"],
    preset_academic: ["substantiate", "coherent", "detrimental", "ubiquitous", "resilient", "synthesize"],
  };

  const [decks, setDecks] = useState<DeckItem[]>(PRESET_DECKS);
  const [selectedDeck, setSelectedDeck] = useState<DeckItem | null>(PRESET_DECKS[0]);
  const [deckWords, setDeckWords] = useState<string[]>(PRESET_DECK_WORDS["preset_c1_pro"]);
  const [deckQuestions, setDeckQuestions] = useState<DeckQuestionItem[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [generatingDeckQuestions, setGeneratingDeckQuestions] = useState(false);

  // 🗂️ Konuşma Arşivim State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isSavingArchive, setIsSavingArchive] = useState(false);

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
    // Okuma Odası sessionStorage & URL parametresi karşılama (Story-to-Speaking Bridge)
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const isFromStory = urlParams.get("from_story") === "true";
        const stored =
          sessionStorage.getItem("active_story_context") ||
          sessionStorage.getItem("vocaship_active_story_context");

        if (stored) {
          const parsed: ActiveStoryContext = JSON.parse(stored);
          if (parsed && parsed.title) {
            setActiveStory(parsed);
            setActiveMode("story_debate");
            setActiveTopicTitle(`📖 ${parsed.title}`);

            const targetWords = parsed.targetWords || parsed.target_vocabulary || [];
            if (targetWords.length) {
              setScorecard((prev) => ({
                ...prev,
                vocabulary_highlight: targetWords.slice(0, 5),
              }));
            }

            // Karakter açılış sorusu ve 3-4 dinamik analitik tartışma sorusunu üret
            generateStoryDebateQuestions(parsed).then((res) => {
              if (res.questions && res.questions.length > 0) {
                setStoryDebateQuestions(res.questions);
              }
              const opening =
                res.opening_question ||
                `In '${parsed.title}', looking at the central dilemma, what would you have done differently?`;

              setDialogue([
                {
                  role: "assistant",
                  message: `AI Mentor: ${opening}`,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ]);
              setCurrentFollowUpQuestion(opening);

              if (isFromStory) {
                setTimeout(() => {
                  speakPersonaText(opening, persona);
                }, 700);
              }
            });
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

  // C1 Değerlendirme Karnesi State'i (Başlangıçta sıfırlanmış - Analyze butonuna basılınca hesaplanır)
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [pendingScorecard, setPendingScorecard] = useState<{
    grammar_feedback: string | null;
    improvement_original: string;
    improvement_suggestion: string;
    better_alternative: string;
    vocabulary_highlight: string[];
    jargon_score: number;
    fluency_score: number;
    idiomatic_phrase?: string;
  } | null>(null);

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
    improvement_original: "",
    improvement_suggestion: "",
    better_alternative: "",
    vocabulary_highlight: [],
    jargon_score: 0,
    fluency_score: 0,
    idiomatic_phrase: "",
  });

  const [copiedAlt, setCopiedAlt] = useState(false);

  // Referanslar
  const recognitionRef = useRef<any>(null);
  const spokenBufferRef = useRef<string>("");
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    setActiveWordIndex(null);
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
        ? 0.78
        : targetP.ttsSettings.rate
      : speechSpeedMode === "0.8x"
      ? targetP.id === "mr_harrison"
        ? 0.82
        : 0.86
      : 1.0;

    // TTS konuşmaya başladığı anda avatarState anında 'speaking' olsun
    setSpeakingAudioIndex(index);

    speakPersonaText(clean, targetP, {
      pitch: targetP.ttsSettings.pitch,
      rate: targetRate,
      onBoundary: (wIdx) => setActiveWordIndex(wIdx),
      onStart: () => setSpeakingAudioIndex(index),
      onEnd: () => {
        setSpeakingAudioIndex(null);
        setActiveWordIndex(null);
      },
      onError: () => setSpeakingAudioIndex(null),
    });
  };

  // Karakter Seçici (Sparky / Chuck / Alex / Özel Avatar / 3D Benim Avatarım) Tıklandığında Anında Sahne, Tema, Ses Tonu ve Karşılama Cümlesini Değiştirir
  const handleSelectStageCharacter = (
    charId: "sparky" | "chuck" | "alex" | "sandy" | "custom" | "my_avatar"
  ) => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    if (charId === "sparky" || charId === "chuck") {
      setSelectedKidsCharacter(charId);
      const kidsCat = SPEAKING_CATEGORIES.find((c) => c.id === "kids");
      if (kidsCat) {
        setActiveCategory(kidsCat);
        setOpenCategoryId("kids");
      }
      setActiveMode("casual");
      setSelectedScenarioId("casual_sparky");
    } else if (charId === "alex") {
      const advCat = SPEAKING_CATEGORIES.find((c) => c.id === "adventure");
      if (advCat) {
        setActiveCategory(advCat);
        setOpenCategoryId("adventure");
      }
      setActiveMode("casual");
      setSelectedScenarioId("casual_travel");
    }

    setPersona(charId);

    const targetPersona = PERSONAS[charId] || persona;
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
      playSpeech(targetPersona.greeting, 0, targetPersona);
    }
  };

  // 3D Poligon Avatar Oluşturulduğunda Anında Sahneye ve "3D Avatarım" Sekmesine Geç
  const handle3DAvatarCreated = (url: string, meta: Transform3DAvatarMeta) => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    const updatedPersona = saveUser3DAvatar(url, meta);
    setActiveVoiceBadge(getActiveVoiceDisplay(updatedPersona));
    setActiveTopicTitle(`🧊 ${updatedPersona.name} (3D Poligon Avatar)`);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${updatedPersona.greeting}`,
        timestamp: now,
      },
    ]);

    setToastNotice("🧊 3D Poligon Avatarın Başarıyla Oluşturuldu!");

    if (autoPlayAudio) {
      setTimeout(() => {
        playSpeech(updatedPersona.greeting, 0, updatedPersona);
      }, 180);
    }
  };

  // Özel Avatar Kaydedildiğinde Anında Sahneye ve Cinsiyet Ses Tonuna Geç
  const handleSaveCustomAvatar = (data: CustomUserAvatarData) => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    const updatedPersona = saveCustomAvatar(data);
    setActiveVoiceBadge(getActiveVoiceDisplay(updatedPersona));
    setActiveTopicTitle(`${updatedPersona.avatarIcon} ${updatedPersona.name} (Kişisel Mentor)`);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${updatedPersona.greeting}`,
        timestamp: now,
      },
    ]);

    const voiceLabel =
      data.gender === "female"
        ? "Kadın Nöral Ses (Pitch: 1.05)"
        : data.gender === "male"
        ? "Tok Erkek Nöral Ses (Pitch: 0.92)"
        : "Çocuk Sesi (Pitch: 1.20)";
    setToastNotice(`✨ ${updatedPersona.name} kaydedildi! (${voiceLabel})`);

    if (autoPlayAudio) {
      setTimeout(() => {
        playSpeech(updatedPersona.greeting, 0, updatedPersona);
      }, 150);
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
      playSpeech(pill.initialQuestion, 0);
    }
  };

  // =========================================================================
  // 📚 AKTİF DESTEMDEN SORULAR ENTEGRASYONU & STATE YÖNETİMİ
  // =========================================================================
  const generateDeckQuestionsForWords = async (deck: DeckItem, words: string[]) => {
    try {
      setGeneratingDeckQuestions(true);
      const res = await fetch(`${API_BASE}/api/v1/speaking/generate-deck-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deck_id: deck.id,
          deck_title: deck.title,
          target_words: words.slice(0, 8),
          target_level: targetLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setDeckQuestions(data.questions);
          return;
        }
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn("Deste soruları backend'den üretilemedi, şablon sorular kullanılıyor:", err);
      const fallbackList: DeckQuestionItem[] = words.slice(0, 4).map((w, idx) => {
        const tpls = [
          `Proje süreçlerinde kaynakları ve görevleri daha iyi yönetmek için '${w}' stratejisini nasıl uygularsınız?`,
          `Beklenmedik bir risk veya kriz karşısında durumu '${w}' etmek için ilk adımınız ne olurdu?`,
          `Günlük iş veya çalışma temponuzda '${w}' kavramının başarınıza etkisi nedir?`,
          `Geçmiş tecrübelerinizden yola çıkarak '${w}' ile ilgili somut bir örnek verebilir misiniz?`,
        ];
        return {
          question: tpls[idx % tpls.length],
          target_word_hint: w,
        };
      });
      setDeckQuestions(fallbackList);
    } finally {
      setGeneratingDeckQuestions(false);
    }
  };

  const handleSelectDeck = async (deck: DeckItem) => {
    setSelectedDeck(deck);
    let words: string[] = [];

    if (!deck.id.startsWith("preset_")) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/decks/${deck.id}/cards`);
        if (res.ok) {
          const cards = await res.json();
          if (Array.isArray(cards) && cards.length > 0) {
            words = cards.map((c: any) => c.word).filter(Boolean);
          }
        }
      } catch (err) {
        console.warn("Deste kartları çekilemedi:", err);
      }
    }

    if (words.length === 0) {
      words = PRESET_DECK_WORDS[deck.id] || ["allocate", "mitigate", "variance", "strategy", "efficient"];
    }

    setDeckWords(words);
    await generateDeckQuestionsForWords(deck, words);
  };

  const handleSelectDeckQuestion = (question: string, targetWordHint: string) => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    setActiveQuestionText(question);
    setCurrentFollowUpQuestion(question);
    setActiveTopicTitle(`📚 ${selectedDeck?.title || "Deste"}: ${targetWordHint}`);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const nextTurn: DialogueTurn = {
      role: "assistant",
      message: `AI Mentor: ${question}`,
      timestamp: now,
      feedback: {
        grammar_feedback: null,
        better_alternative: "",
        vocabulary_highlight: [targetWordHint],
        jargon_score: 85,
        fluency_score: 85,
      },
    };

    setDialogue((prev) => [...prev, nextTurn]);
    setToastNotice(`🎯 Hedef Kelime: "${targetWordHint}" kullanmanız bekleniyor!`);

    if (autoPlayAudio) {
      setTimeout(() => {
        playSpeech(question, dialogue.length);
      }, 200);
    }
  };

  const handleRefreshDeckQuestions = () => {
    if (selectedDeck && deckWords.length > 0) {
      generateDeckQuestionsForWords(selectedDeck, deckWords);
    }
  };

  const handleSelectStoryQuestion = (question: string) => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    setActiveQuestionText(question);
    setCurrentFollowUpQuestion(question);
    setActiveTopicTitle(`📖 ${activeStory?.title || "Hikaye Tartışması"}`);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const targetWords = activeStory?.targetWords || activeStory?.target_vocabulary || [];
    const nextTurn: DialogueTurn = {
      role: "assistant",
      message: `AI Mentor: ${question}`,
      timestamp: now,
      feedback: {
        grammar_feedback: null,
        better_alternative: "",
        vocabulary_highlight: targetWords.slice(0, 3),
        jargon_score: 85,
        fluency_score: 85,
      },
    };

    setDialogue((prev) => [...prev, nextTurn]);
    setToastNotice(`📖 Hikaye Tartışma Sorusu Aktif Edildi`);

    if (autoPlayAudio) {
      setTimeout(() => {
        playSpeech(question, dialogue.length);
      }, 200);
    }
  };

  const handleClearStoryContext = () => {
    setActiveStory(null);
    setStoryDebateQuestions([]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("active_story_context");
      sessionStorage.removeItem("vocaship_active_story_context");
    }
  };

  useEffect(() => {
    async function loadInitialDecks() {
      try {
        setLoadingDecks(true);
        const res = await fetch(`${API_BASE}/api/v1/decks`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDecks(data);
            await handleSelectDeck(data[0]);
            return;
          }
        }
        setDecks(PRESET_DECKS);
        await handleSelectDeck(PRESET_DECKS[0]);
      } catch (err) {
        console.warn("Deste API hatası, presetler yüklendi:", err);
        setDecks(PRESET_DECKS);
        await handleSelectDeck(PRESET_DECKS[0]);
      } finally {
        setLoadingDecks(false);
      }
    }
    loadInitialDecks();
  }, []);

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
        playSpeech(targetP.greeting, 0, targetP);
      }
    }
  };

  // Sohbet Açıcı Fikir / Öneri Hapına Tıklandığında Diyaloğa Doğal Olarak Ekle veya Başlat
  const handleSelectQuestion = (qText: string, cat: SpeakingCategory, slotIndex: number) => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");

    setActiveCategory(cat);
    setOpenCategoryId(cat.id);
    setActiveQuestionText(qText);
    setCurrentFollowUpQuestion(qText);
    setActiveTopicTitle(`${cat.icon} ${cat.title}`);

    const targetPersonaId =
      cat.id === "kids"
        ? selectedKidsCharacter
        : (cat.defaultPersonaId as PersonaId) || "sarah";
    setPersona(targetPersonaId);
    setSelectedScenarioId(cat.scenarioId);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const nextTurn: DialogueTurn = {
      role: "assistant",
      message: `AI Mentor: ${qText}`,
      timestamp: now,
    };

    // Mevcut sohbet devam ediyorsa geçmişi silmeden akışa ekle; yeni başlıyorsa ilk mesaj yap
    const nextIdx = dialogue.length > 1 ? dialogue.length : 0;
    setDialogue((prev) => (prev.length > 1 ? [...prev, nextTurn] : [nextTurn]));

    const targetP = PERSONAS[targetPersonaId] || persona;
    if (autoPlayAudio) {
      playSpeech(qText, nextIdx, targetP);
    }

    setToastNotice(`💡 Sohbet fikri eklendi. Dilediğiniz gibi konuşabilir veya konuyu değiştirebilirsiniz.`);
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
    setToastNotice("Yeni sohbet fikri getirildi.");
  };

  // 5. Seçenek: Kategoriye Özel Serbest Sohbet Başlatma (Esnek & Doğal Akış)
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
          history: dialogue.slice(-20).map((t) => ({ role: t.role, message: t.message })),
          user_transcript: `Let's talk about: "${topic}". As my friendly mentor ${persona.name} (${persona.title}), respond warmly and ask me a natural, open-ended question to get our conversation flowing.`,
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
      setCurrentFollowUpQuestion(data.follow_up_question || openingQuestion);

      setActiveQuestionText(openingQuestion);
      setCurrentFollowUpQuestion(data.follow_up_question || openingQuestion);
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

      setActiveQuestionText(openingQuestion);
      setCurrentFollowUpQuestion(data.follow_up_question || openingQuestion);

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
                ? 0.86
                : persona.id === "mr_harrison"
                ? 0.82
                : 0.85
              : 1.0;
          setSpeakingAudioIndex(0);
          speakPersonaText(openingQuestion, persona, {
            rate: targetRate,
      onBoundary: (wIdx) => setActiveWordIndex(wIdx),
            onStart: () => setSpeakingAudioIndex(0),
            onEnd: () => {
        setSpeakingAudioIndex(null);
        setActiveWordIndex(null);
      },
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
            onEnd: () => {
        setSpeakingAudioIndex(null);
        setActiveWordIndex(null);
      },
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
              ? 0.86
              : targetP.id === "mr_harrison"
              ? 0.82
              : 0.85
            : 1.0;
        setSpeakingAudioIndex(0);
        speakPersonaText(targetSc.initial_greeting, targetP, {
          rate: targetRate,
      onBoundary: (wIdx) => setActiveWordIndex(wIdx),
          onStart: () => setSpeakingAudioIndex(0),
          onEnd: () => {
        setSpeakingAudioIndex(null);
        setActiveWordIndex(null);
      },
          onError: () => setSpeakingAudioIndex(null),
        });
      }, 200);
    }
  };

  // Faz 3: Söz Kesme (Barge-in / Interruption) & Konuşma Tanıma (STT)
  const startListening = () => {
    // 1. Çalmakta olan TTS sesini ve HTML5 audio akışlarını milisaniyelik gecikme olmadan anında durdur
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      try {
        document.querySelectorAll("audio").forEach((audio) => {
          if (!audio.paused) audio.pause();
        });
      } catch {}
    }

    // 2. Kelime parlatma animasyonunu ve konuşma indeksini anında sonlandır
    stopAudio();
    setActiveWordIndex(null);
    setSpeakingAudioIndex(null);

    // 3. Karakter durumunu milisaniyelik gecikme olmadan doğrudan avatarState = 'listening' moduna geçir
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    spokenBufferRef.current = "";
    setIsRecording(true);
    setPermissionError(null);
    setUserTranscript("");
    setInterimText("");

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Tarayıcı STT desteklemese bile Barge-in ile 'listening' modunda kalır (yazılı/manuel girişe izin verir)
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
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
          spokenBufferRef.current = spokenBufferRef.current
            ? `${spokenBufferRef.current} ${finalStr.trim()}`.trim()
            : finalStr.trim();
          setUserTranscript(spokenBufferRef.current);
        }
        setInterimText(interimStr);

        // Kullanıcı cümlesini tamamladığında Gönder butonunu beklemeden otomatik fırlat
        if (autoSendTimerRef.current) {
          clearTimeout(autoSendTimerRef.current);
        }
        const candidateText = (
          spokenBufferRef.current
            ? `${spokenBufferRef.current} ${interimStr}`.trim()
            : interimStr.trim()
        ).trim();
        if (candidateText) {
          autoSendTimerRef.current = setTimeout(() => {
            const finalToSend = (
              spokenBufferRef.current || candidateText
            ).trim();
            if (finalToSend) {
              spokenBufferRef.current = "";
              try {
                recognition.stop();
              } catch {}
              setIsRecording(false);
              sendMessage(finalToSend);
            }
          }, 1100);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setPermissionError("Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofona izin verin.");
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        if (autoSendTimerRef.current) {
          clearTimeout(autoSendTimerRef.current);
          autoSendTimerRef.current = null;
        }
        setIsRecording(false);
        const autoText = spokenBufferRef.current.trim();
        if (autoText) {
          spokenBufferRef.current = "";
          sendMessage(autoText);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("SpeechRecognition start warning:", err?.message);
    }
  };

  const startRecording = startListening;

  const stopRecording = () => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    const pendingText = (
      spokenBufferRef.current ||
      userTranscript.trim() ||
      interimText.trim()
    ).trim();
    if (interimText.trim()) {
      setUserTranscript((prev) => (prev ? `${prev} ${interimText.trim()}` : interimText.trim()));
      setInterimText("");
    }
    if (pendingText) {
      spokenBufferRef.current = "";
      sendMessage(pendingText);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startListening();
    }
  };

  // Yanıtı Backend'e Gönder ve Değerlendir (Canlı Sohbet Geçmişi & Bağlam ile)
  const sendMessage = async (explicitText?: string) => {
    const textToSend = (explicitText || userTranscript.trim() || interimText.trim()).trim();
    if (!textToSend || isThinking) return;

    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    spokenBufferRef.current = "";
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
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
    // Kullanıcı mevcut soruyu cevapladığında tamamlandı işaretlenir
    if (activeQuestionText) {
      setAnsweredQuestions((prev) => (prev.includes(activeQuestionText) ? prev : [...prev, activeQuestionText]));
    }
    if (currentFollowUpQuestion) {
      setAnsweredQuestions((prev) => (prev.includes(currentFollowUpQuestion) ? prev : [...prev, currentFollowUpQuestion]));

      const currentCat = activeCategory;
      if (currentCat) {
        const currentQuestions = categoryActiveQuestions[currentCat.id] || currentCat.questionPool.slice(0, 4);
        const slotIdx = currentQuestions.findIndex((q) => q === activeQuestionText || q === currentFollowUpQuestion);
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
      const conversationHistory = dialogue.map((m) => ({
        role: m.role,
        content: m.message.replace(/^(AI Mentor:|User:)\s*/i, "").trim(),
      }));

      const historyPayload = dialogue.slice(-20).map((turn) => ({
        role: turn.role,
        message: turn.message,
      }));

      const res = await fetch(`${API_BASE}/api/v1/speaking/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: selectedScenarioId,
          conversation_mode: activeMode,
          conversation_history: conversationHistory,
          history: historyPayload,
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
      const fb = data.feedback || {};
      const grammarCorrection = fb.grammar_correction ?? data.grammar_feedback ?? null;
      const betterAlt =
        fb.better_alternative ||
        data.better_alternative ||
        "We were compelled to fast-track key deliverables to mitigate variances across the critical path baseline.";
      const storyWords = activeStory?.targetWords || activeStory?.target_vocabulary || [];
      const lowerInput = textToSend.toLowerCase();
      const detectedStoryWords = storyWords.filter((w) => lowerInput.includes(w.toLowerCase()));
      const rawVocab: string[] =
        Array.isArray(fb.used_vocabulary) && fb.used_vocabulary.length > 0
          ? fb.used_vocabulary
          : Array.isArray(data.vocabulary_highlight) && data.vocabulary_highlight.length > 0
          ? data.vocabulary_highlight
          : ["variance", "mitigate", "critical path"];
      const usedVocab: string[] = Array.from(new Set([...rawVocab, ...detectedStoryWords]));
      const fluencyVal = data.metrics?.fluency ?? (fb.fluency_score ?? data.fluency_score ?? 86);
      const vocabScore = data.metrics?.vocabulary ?? (data.jargon_score ?? fluencyVal);

      // Dinamik Takip Sorusu Güncelleme (Dynamic Follow-up Question Engine)
      const nextFollowUp =
        data.follow_up_question ||
        (data.assistant_reply && data.assistant_reply.includes("?")
          ? data.assistant_reply.split("?").slice(-2)[0]?.trim() + "?"
          : null) ||
        activeCategory?.questionPool[(updatedDialogue.length + 1) % (activeCategory?.questionPool.length || 1)] ||
        "What was the most memorable aspect of that experience for you?";

      setCurrentFollowUpQuestion(nextFollowUp);
      setActiveQuestionText(nextFollowUp);

      const assistantTurn: DialogueTurn = {
        role: "assistant",
        message: `AI Mentor: ${data.assistant_reply || data.reply_message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: {
          grammar_feedback: grammarCorrection,
          better_alternative: betterAlt,
          vocabulary_highlight: usedVocab,
          jargon_score: vocabScore,
          fluency_score: fluencyVal,
        },
      };

      const computedScorecard = {
        grammar_feedback: grammarCorrection,
        improvement_original: textToSend,
        improvement_suggestion:
          grammarCorrection || "Cümlenizde gramer hatası yok — doğal ve akıcı yapı!",
        better_alternative: betterAlt,
        vocabulary_highlight: usedVocab,
        jargon_score: vocabScore,
        fluency_score: fluencyVal,
        idiomatic_phrase: "",
      };

      setDialogue([...updatedDialogue, assistantTurn]);
      setPendingScorecard(computedScorecard);
      if (hasAnalyzed) {
        setScorecard(computedScorecard);
      }

      if (autoPlayAudio && (data.assistant_reply || data.reply_message)) {
        const nextIdx = updatedDialogue.length;
        setTimeout(() => playSpeech(data.assistant_reply || data.reply_message, nextIdx), 250);
      }
    } catch (err: any) {
      console.warn("Backend response failed, using adaptive infinite fallback simulation:", err);
      const lowerInput = textToSend.toLowerCase();
      const isSmallTalk = ["rain", "weather", "coffee", "tea", "tired", "morning", "day", "weekend", "traffic"].some(
        (w) => lowerInput.includes(w)
      );
      const turnIdx = updatedDialogue.length;

      let fallbackReply = "That's a really good point! How did things unfold from there, and what are you thinking of doing next?";
      if (isSmallTalk && activeCategory?.section === "professional") {
        const bridgeReplies = [
          "I totally hear you—days like that really set the mood! Speaking of the weather and daily pace, did conditions like rain or traffic affect the outdoor activities on the jobsite today?",
          "Nothing beats a quick coffee and breather when the day gets busy! Once you settle in, how is the team feeling about our current schedule milestones on-site?",
        ];
        fallbackReply = bridgeReplies[turnIdx % bridgeReplies.length];
      } else if (activeMode === "casual" || isSmallTalk) {
        const casualReplies = [
          "That sounds really nice! What do you enjoy most about moments like that, and how is the rest of your day looking?",
          "I completely get that! Sometimes switching up the routine feels great. Have you got anything fun planned for the weekend?",
        ];
        fallbackReply = casualReplies[turnIdx % casualReplies.length];
      } else if (activeMode === "problem_solving") {
        const problemReplies = [
          "That's a practical immediate step, but what happens if our main supplier delays further? What backup plan should we keep ready?",
          "Good call—acting early gives us breathing room. How should we update the project stakeholders so they stay confident in our plan?",
        ];
        fallbackReply = problemReplies[turnIdx % problemReplies.length];
      } else if (activeMode === "story_debate") {
        fallbackReply = "That's an intriguing take on the story. If you were in the protagonist's shoes on that day, what would you have done differently?";
      } else {
        const mentorReplies = [
          "I see where you're coming from—reallocating the crew could really help us recover the critical path. How is the site team feeling about shifting priorities this week?",
          "That sounds like a solid approach. By the way, did any external factors on-site—like weather or material deliveries—affect the crew's progress today?",
        ];
        fallbackReply = mentorReplies[turnIdx % mentorReplies.length];
      }

      // Akıllı Fallback: Ağ gecikmesi veya bağlantı hatasında konuşmayı asla kilitleme, konu havuzundan devam et
      const pool = activeCategory?.questionPool || [];
      const fallbackFollowUp =
        (fallbackReply.includes("?") ? fallbackReply.split("?").slice(-2)[0]?.trim() + "?" : null) ||
        pool[(turnIdx + 1) % (pool.length || 1)] ||
        "What are your next thoughts on that, and how do you see it progressing?";

      setCurrentFollowUpQuestion(fallbackFollowUp);
      setActiveQuestionText(fallbackFollowUp);

      const assistantTurn: DialogueTurn = {
        role: "assistant",
        message: `AI Mentor: ${fallbackReply}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setDialogue([...updatedDialogue, assistantTurn]);
      const fallbackScorecard = {
        grammar_feedback: null,
        improvement_original: textToSend,
        improvement_suggestion: "Doğal ve akıcı cümle yapısı tespit edildi.",
        better_alternative:
          "We proactively reallocated key resources along the critical path to safeguard project milestones.",
        vocabulary_highlight:
          activeStory?.targetWords &&
          activeStory.targetWords.some((w) => lowerInput.includes(w.toLowerCase()))
            ? activeStory.targetWords.filter((w) => lowerInput.includes(w.toLowerCase()))
            : activeScenario.target_vocabulary.slice(0, 3),
        jargon_score: activeMode === "casual" ? 92 : 88,
        fluency_score: activeMode === "casual" ? 92 : 88,
        idiomatic_phrase: "",
      };
      setPendingScorecard(fallbackScorecard);
      if (hasAnalyzed) {
        setScorecard(fallbackScorecard);
      }

      if (autoPlayAudio) {
        const nextIdx = updatedDialogue.length;
        setTimeout(() => playSpeech(fallbackReply, nextIdx), 250);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmitResponse = sendMessage;

  // Kullanıcı yeşil 'Analyze' butonuna bastığında gerçek konuşma analizini karneye yansıt
  const handleAnalyzeConversation = async () => {
    if (userTranscript.trim() || interimText.trim()) {
      await sendMessage();
    }
    setHasAnalyzed(true);

    const lastUserTurn = [...dialogue]
      .reverse()
      .find((t) => t.role === "user");
    const lastAssistantWithFb = [...dialogue]
      .reverse()
      .find((t) => t.role === "assistant" && t.feedback);

    if (pendingScorecard) {
      setScorecard(pendingScorecard);
    } else if (lastAssistantWithFb?.feedback) {
      const fb = lastAssistantWithFb.feedback;
      setScorecard({
        grammar_feedback: fb.grammar_feedback ?? null,
        improvement_original:
          lastUserTurn?.message.replace(/^User:\s*/i, "") || "",
        improvement_suggestion:
          fb.grammar_feedback ||
          "Cümlenizde gramer hatası yok — doğal ve akıcı yapı!",
        better_alternative:
          fb.better_alternative ||
          "We proactively fast-tracked critical path activities to mitigate budget variances.",
        vocabulary_highlight:
          fb.vocabulary_highlight && fb.vocabulary_highlight.length > 0
            ? fb.vocabulary_highlight
            : activeScenario.target_vocabulary.slice(0, 3),
        jargon_score: fb.jargon_score ?? 86,
        fluency_score: fb.fluency_score ?? 86,
        idiomatic_phrase: "",
      });
    } else {
      const cleanUserMsg =
        lastUserTurn?.message.replace(/^User:\s*/i, "") || "";
      const detectedWords = activeScenario.target_vocabulary.filter((w) =>
        cleanUserMsg.toLowerCase().includes(w.toLowerCase())
      );
      setScorecard({
        grammar_feedback: null,
        improvement_original: cleanUserMsg,
        improvement_suggestion:
          "Akıcı ve anlaşılır konuşma yapısı — C1 düzeyinde terim kullanımı başarılı!",
        better_alternative:
          "In our previous phase, we encountered critical path slippage and fast-tracked key activities to mitigate the budget variance.",
        vocabulary_highlight:
          detectedWords.length > 0
            ? detectedWords
            : activeScenario.target_vocabulary.slice(0, 3),
        jargon_score: 88,
        fluency_score: 88,
        idiomatic_phrase: "",
      });
    }
    setToastNotice("📊 Konuşma analizi tamamlandı ve karne güncellendi!");
  };

  // =========================================================================
  // 🏁 PRATİĞİ BİTİR & ARŞİVE KAYDET (+30 XP)
  // =========================================================================
  const handleFinishAndSavePractice = async () => {
    const userTurns = dialogue.filter((t) => t.role === "user");
    if (userTurns.length === 0) {
      setToastNotice("⚠️ Henüz konuşma yapılmadı. Arşivlemek için önce mikrofona basıp pratik yapın.");
      return;
    }

    try {
      setIsSavingArchive(true);
      const transcriptPayload = dialogue.map((turn) => ({
        sender: (turn.role === "user" ? "user" : "ai") as "user" | "ai",
        text: turn.message,
        timestamp: turn.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: turn.feedback || undefined,
      }));

      const fluency = scorecard.fluency_score || 85;
      const vocabulary = scorecard.jargon_score || 80;
      const grammar = scorecard.grammar_feedback ? 78 : 92;
      const overall = Math.round((fluency + vocabulary + grammar) / 3);

      const metricsPayload = {
        fluency,
        vocabulary,
        grammar,
        overall_score: overall,
        level: targetLevel,
      };

      const sessionTitle =
        activeTopicTitle || selectedDeck?.title || activeScenario.title || "Speaking Lounge Seansı";

      await saveSpeakingArchiveSession({
        session_title: sessionTitle,
        transcript: transcriptPayload,
        metrics: metricsPayload,
        user_id: user?.id,
      });

      setToastNotice("🎉 Konuşmanız arşivinize kaydedildi! (+30 XP)");
    } catch (err: any) {
      console.error("Arşivleme başarısız:", err);
      setToastNotice("Arşiv kaydedilirken bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setIsSavingArchive(false);
    }
  };

  // Diyaloğu Baştan Başlat
  const handleResetDialogue = () => {
    stopAudio();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");
    setHasAnalyzed(false);
    setPendingScorecard(null);
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
      improvement_original: "",
      improvement_suggestion: "",
      better_alternative: "",
      vocabulary_highlight: [],
      jargon_score: 0,
      fluency_score: 0,
      idiomatic_phrase: "",
    });
    setToastNotice("Pratik oturumu sıfırlandı.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* 3 SÜTUNLU KÜRESEL STANDART YERLEŞİM (SpeakingLounge / PlatformStandardLayout) */}
      <SpeakingLounge
        sidebar={
        <SpeakingSidebar
          decks={decks}
          selectedDeck={selectedDeck}
          deckWords={deckWords}
          deckQuestions={deckQuestions}
          loadingDecks={loadingDecks}
          generatingQuestions={generatingDeckQuestions}
          activeQuestionText={activeQuestionText}
          answeredQuestions={answeredQuestions}
          onSelectDeck={handleSelectDeck}
          onSelectDeckQuestion={handleSelectDeckQuestion}
          onRefreshDeckQuestions={handleRefreshDeckQuestions}
          activeStoryContext={activeStory}
          storyDebateQuestions={storyDebateQuestions}
          onSelectStoryQuestion={handleSelectStoryQuestion}
          onClearStoryContext={handleClearStoryContext}
          generalCultureCats={generalCultureCats}
          professionalCats={professionalCats}
          openCategoryId={openCategoryId}
          activeCategory={activeCategory}
          categoryActiveQuestions={categoryActiveQuestions}
          onToggleCategory={handleToggleCategory}
          onSelectCategoryQuestion={handleSelectQuestion}
          onGenerateCustomTopic={(cat) => handleCustomCategoryTopicSubmit({ preventDefault: () => {} } as any, cat)}
          categoryCustomInputs={categoryCustomInputs}
          onCustomInputChange={(catId, val) =>
            setCategoryCustomInputs((prev) => ({ ...prev, [catId]: val }))
          }
          isGeneratingTopic={isGeneratingTopic}
          onOpenArchive={() => setIsArchiveModalOpen(true)}
          t={t}
        >
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
        </SpeakingSidebar>
        }
        scorecard={
          <SpeakingScorecard
            userName={user?.fullName || user?.username || "Öğrenci"}
            mascotImage={persona.image || "/avatars/sparky.png"}
            mascotName={persona.name || "Sparky"}
            isKidsMode={isKidsMode}
            targetLevel={targetLevel}
            avatarState={avatarState}
            activeMode={activeMode}
            hasAnalyzed={hasAnalyzed}
            scorecard={scorecard}
            scorecardTitle={CONVERSATION_MODES[activeMode]?.scorecardTitle || "C1 DEĞERLENDİRME KARNESİ"}
            onAnalyze={handleAnalyzeConversation}
            metrics={{
              spoken: dialogue.some(
                (turn) => turn.role === "user" && turn.message?.trim().length > 0
              ),
              usedTargetWord: scorecard.vocabulary_highlight.length > 0,
              sentenceComplete:
                scorecard.fluency_score >= 50 ||
                dialogue.some(
                  (turn) =>
                    turn.role === "user" &&
                    turn.message?.trim().split(/\s+/).length >= 3
                ),
            }}
            copiedAlt={copiedAlt}
            onCopyAlt={() => {
              if (scorecard.better_alternative) {
                navigator.clipboard.writeText(scorecard.better_alternative);
                setCopiedAlt(true);
                setTimeout(() => setCopiedAlt(false), 2000);
              }
            }}
            t={t}
          />
        }
      >
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

                {/* Hız Seçici Toggle: [ 0.8x | 1.0x ] */}
                <div className="hidden sm:inline-flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setSpeechSpeedMode("0.8x")}
                    className={`px-2 py-0.5 rounded-lg transition font-bold cursor-pointer ${
                      speechSpeedMode === "0.8x"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Sakin mülakat temposu (0.86x)"
                  >
                    0.8x
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
                    1.0x
                  </button>
                </div>

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

                {/* 🏁 Pratiği Bitir & Kaydet Butonu */}
                <button
                  type="button"
                  data-testid="finish-and-save-practice-btn"
                  onClick={handleFinishAndSavePractice}
                  disabled={isSavingArchive}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-[10px] shadow-sm transition cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Oturumu Tamamla ve Arşivime Kaydet (+30 XP)"
                >
                  <Flag className="w-3 h-3 text-amber-300" />
                  <span>{isSavingArchive ? "Kaydediliyor..." : "🏁 Bitir & Kaydet"}</span>
                </button>

                {/* 🗂️ Arşivim Butonu */}
                <button
                  type="button"
                  data-testid="header-speaking-archive-btn"
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-[10px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  title="Konuşma Arşivimi Görüntüle"
                >
                  <Archive className="w-3 h-3 text-indigo-400" />
                  <span>Arşivim</span>
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

            {/* 2. MESAJ DÖKÜM ALANI (Top-Center Modern Chat Stream UI Balonları) */}
            <SpeakingTranscript
              dialogue={dialogue}
              userTranscript={userTranscript}
              interimText={interimText}
              isThinking={isThinking}
              speakingAudioIndex={speakingAudioIndex}
              activeWordIndex={activeWordIndex}
              isKidsMode={isKidsMode}
              rate={getCalibratedRateForPersona(persona)}
              personaName={persona.name}
              onPlayAudio={(msg, idx) => playSpeech(msg, idx)}
            />

            {/* 3. DİNAMİK TAKİP SORUSU YÖNLENDİRME KARTI (Dynamic Follow-up Question Card) */}
            {currentFollowUpQuestion && (
              <div
                data-testid="dynamic-followup-card"
                className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-indigo-950/60 border border-emerald-500/30 shadow-lg backdrop-blur-md z-10 relative animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                          💡 Sıradaki Soru / Konuşma Fırsatı:
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {targetLevel} • Dinamik Akış
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => playSpeech(currentFollowUpQuestion, -1)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer shrink-0"
                        title="Soruyu Dinle"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Dinle</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                      {currentFollowUpQuestion}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SES DALGASI & MİKROFON KONTROLÜ (Alt Kısım) */}
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
                    data-testid="tap-to-speak-mic-btn"
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

              {/* Serbest Yazılı veya Sesli Mesaj Gönderim Çubuğu (Sonsuz Akış) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  data-testid="speaking-chat-input"
                  value={userTranscript}
                  onChange={(e) => setUserTranscript(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Mikrofona konuşun veya dilediğiniz konuda buraya yazıp sohbete devam edin..."
                  disabled={isThinking}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={(!userTranscript.trim() && !interimText.trim()) || isThinking}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer shrink-0"
                >
                  <span>{t("speaking_send_btn", "Gönder")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Alt Bilgi: "Infinite Flow • 01:24" ve Kırmızı Kare Durdurma Butonu */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-850 px-1">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRecording
                        ? "bg-emerald-400 animate-ping"
                        : isThinking
                        ? "bg-indigo-400 animate-spin"
                        : "bg-emerald-500/60"
                    }`}
                  />
                  <span>
                    {isThinking
                      ? t("speaking_analyzing_speech", "Analyzing Speech...")
                      : isRecording
                      ? t("speaking_listening_voice", "Listening to Voice...")
                      : `Sonsuz Doğal Sohbet • ${dialogue.length} Mesaj`}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">{formatTimer(recordingSeconds)}</span>
                </div>

                {/* Kırmızı Kare Durdurma ve Yeşil Analyze Butonları */}
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

                  {/* Yeşil Analyze Butonu: Yalnızca basıldığında C1 karnesini hesaplar ve gösterir */}
                  <button
                    type="button"
                    data-testid="analyze-conversation-btn"
                    onClick={handleAnalyzeConversation}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
                    title="Konuşmayı Analiz Et ve Karneyi Güncelle"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Analyze</span>
                  </button>
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
      </SpeakingLounge>

      {/* Özel Avatar Yükleme & Dinamik Ses Seçimi Modalı */}
      <CustomAvatarModal
        isOpen={isCustomAvatarModalOpen}
        onClose={() => setIsCustomAvatarModalOpen(false)}
        initialData={customAvatar}
        onSave={handleSaveCustomAvatar}
      />

      {/* Vocaship 3D Poligon Avatar Stüdyosu (Fotoğraftan 3D'ye Dönüşüm Modalı) */}
      <Transform3DModal
        isOpen={isTransform3DModalOpen}
        onClose={() => setIsTransform3DModalOpen(false)}
        initialUrl={user3DAvatarUrl}
        initialGender={user3DAvatarMeta?.gender || "male"}
        initialName={user3DAvatarMeta?.name || "3D Avatarım"}
        onAvatarCreated={handle3DAvatarCreated}
      />

      {/* 🗂️ Konuşma Arşivim Modalı */}
      <SpeakingArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        userId={user?.id}
      />
    </div>
  );
}
