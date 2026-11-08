"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Square,
  GraduationCap,
  BookOpen,
  Archive,
  ArrowLeft,
  Coffee,
} from "lucide-react";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";
import SpeakingCenterStage from "../components/speaking/SpeakingCenterStage";
import SpeakingScorecardModal from "../components/speaking/SpeakingScorecardModal";
import SpeakingArchiveDrawer from "../components/speaking/SpeakingArchiveDrawer";
import SpeakingWordCollector, {
  CollectedWordItem,
} from "../components/speaking/SpeakingWordCollector";
import {
  saveSpeakingArchiveSession,
  getSpeakingArchives,
  SpeakingArchiveItem,
} from "../actions/speakingArchive";
import {
  generateStoryDebateQuestions,
  ActiveStoryContext,
} from "../actions/speakingAI";

export interface DialogueTurn {
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

// =========================================================================
// 📚 SPEAKING SÖZLÜK VE ANLAM VERİTABANI
// =========================================================================
export const COMMON_SPEAKING_VOCAB: Record<
  string,
  { tr: string; phonetic?: string; example?: string }
> = {
  commute: {
    tr: "İşe/okula gidip gelmek, düzenli yolculuk",
    phonetic: "/kəˈmjuːt/",
    example: "How was your morning commute today?",
  },
  routine: {
    tr: "Alışılagelmiş düzen, günlük rutin",
    phonetic: "/ruːˈtiːn/",
    example: "My morning routine starts with a fresh coffee.",
  },
  weather: {
    tr: "Hava durumu",
    phonetic: "/ˈweð.ər/",
    example: "The weather is very pleasant this afternoon.",
  },
  unwind: {
    tr: "Günün yorgunluğunu atmak, rahatlamak",
    phonetic: "/ʌnˈwaɪnd/",
    example: "I like listening to relaxing music to unwind.",
  },
  rainfall: {
    tr: "Yağış miktarı, yağmur",
    phonetic: "/ˈreɪn.fɔːl/",
    example: "Heavy rainfall caused unexpected traffic delays.",
  },
  stamina: {
    tr: "Dayanıklılık, kondisyon",
    phonetic: "/ˈstæm.ɪ.nə/",
    example: "Regular outdoor runs build great physical stamina.",
  },
  workout: {
    tr: "Antrenman, egzersiz",
    phonetic: "/ˈwɜːk.aʊt/",
    example: "Did you get time for a quick workout today?",
  },
  recreation: {
    tr: "Dinlenme, eğlence, rekreasyon",
    phonetic: "/ˌrek.riˈeɪ.ʃən/",
    example: "Parks provide wonderful spaces for recreation.",
  },
  discovery: {
    tr: "Keşif, buluş",
    phonetic: "/dɪˈskʌv.ər.i/",
    example: "Astronomers made a fascinating space discovery.",
  },
  fascinating: {
    tr: "Büyüleyici, son derece ilginç",
    phonetic: "/ˈfæs.ɪ.neɪ.tɪŋ/",
    example: "Deep space galaxies are genuinely fascinating.",
  },
  cinematography: {
    tr: "Görüntü yönetimi, sinematografi",
    phonetic: "/ˌsɪn.ə.məˈtɒɡ.rə.fi/",
    example: "The film received praise for its cinematography.",
  },
  narrative: {
    tr: "Anlatı, hikaye akışı",
    phonetic: "/ˈnær.ə.tɪv/",
    example: "A compelling narrative keeps viewers engaged.",
  },
  compelling: {
    tr: "Etkileyici, sürükleyici, inandırıcı",
    phonetic: "/kəmˈpel.ɪŋ/",
    example: "It was a compelling presentation of new ideas.",
  },
  mitigate: {
    tr: "Hafifletmek, riski azaltmak",
    phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
    example: "We proactively mitigated potential schedule risks.",
  },
  variance: {
    tr: "Sapma, fark, uyuşmazlık",
    phonetic: "/ˈveə.ri.əns/",
    example: "We tracked cost and timeline variances closely.",
  },
  dilemma: {
    tr: "İkilem, zorlu tercih",
    phonetic: "/daɪˈlem.ə/",
    example: "The team faced an ethical and technical dilemma.",
  },
  outcome: {
    tr: "Sonuç, netice",
    phonetic: "/ˈaʊt.kʌm/",
    example: "What was the final outcome of the meeting?",
  },
  substantiate: {
    tr: "Somut delille kanıtlamak",
    phonetic: "/səbˈstæn.ʃi.eɪt/",
    example: "Can you substantiate your claim with actual figures?",
  },
  resilient: {
    tr: "Dirençli, çabuk toparlanan",
    phonetic: "/rɪˈzɪl.i.ənt/",
    example: "Our systems remained remarkably resilient.",
  },
  hesitate: {
    tr: "Tereddüt etmek, duraklamak",
    phonetic: "/ˈhez.ɪ.teɪt/",
    example: "Don't hesitate to share your thoughts.",
  },
  articulate: {
    tr: "Düşüncelerini açık ve net ifade etmek",
    phonetic: "/ɑːˈtɪk.jə.lət/",
    example: "She can articulate complex ideas with ease.",
  },
  breakthrough: {
    tr: "Çığır açan gelişme, büyük adım",
    phonetic: "/ˈbreɪk.θruː/",
    example: "This tech represents a significant breakthrough.",
  },
};

// =========================================================================
// 🏷️ OTOMATİK ÇARPINCI BAŞLIKLANDIRMA (3-4 Word Punchy Title)
// =========================================================================
export function generatePunchyTitle(
  dialogue: DialogueTurn[],
  activeStoryContext?: ActiveStoryContext | null,
  fallbackTopic?: string
): string {
  if (activeStoryContext?.title) {
    return activeStoryContext.title.length > 32
      ? activeStoryContext.title.slice(0, 32)
      : activeStoryContext.title;
  }

  const userTurns = dialogue.filter((t) => t.role === "user");
  if (userTurns.length > 0) {
    const text = userTurns
      .map((u) => u.message)
      .join(" ")
      .toLowerCase();
    if (
      text.includes("weather") ||
      text.includes("rain") ||
      text.includes("storm") ||
      text.includes("commute")
    ) {
      return "Regional Weather & Commute";
    }
    if (
      text.includes("space") ||
      text.includes("telescope") ||
      text.includes("science") ||
      text.includes("galaxy")
    ) {
      return "Deep Space & Tech Insights";
    }
    if (
      text.includes("sport") ||
      text.includes("match") ||
      text.includes("workout") ||
      text.includes("run")
    ) {
      return "Sports Spirit & Wellness";
    }
    if (
      text.includes("movie") ||
      text.includes("film") ||
      text.includes("cinema") ||
      text.includes("story")
    ) {
      return "Cinema Tech & Storytelling";
    }
    if (
      text.includes("delay") ||
      text.includes("cost") ||
      text.includes("schedule") ||
      text.includes("project")
    ) {
      return "Concrete Delay & Mitigation";
    }
  }

  return fallbackTopic && fallbackTopic.length > 0
    ? fallbackTopic.slice(0, 30)
    : "Daily Conversational Practice";
}

// =========================================================================
// 💡 FISILTI KOÇU (Whisper Coach Starter Bank)
// =========================================================================
const WHISPER_STARTERS: Record<string, string[]> = {
  A2: [
    "In my opinion, I think that...",
    "Usually in my daily routine, I prefer...",
    "For me, the most interesting thing is...",
    "I believe it is important because...",
  ],
  B1: [
    "From my perspective, the main factor is...",
    "When I look at this situation, I usually prioritize...",
    "In my recent personal experience, I noticed that...",
    "To solve this kind of challenge, we should first...",
  ],
  B2: [
    "Taking everything into account, it appears evident that...",
    "From an analytical standpoint, the primary driver is...",
    "When considering the long-term implications, we ought to...",
    "In our professional practice, we encountered similar scenarios where...",
  ],
  C1: [
    "From an executive perspective, mitigating this core issue requires...",
    "Synthesizing the underlying variables, one can argue that...",
    "A proactive strategy in this domain fundamentally hinges upon...",
    "When navigating such multifaceted dilemmas, our decisive focus was...",
  ],
};

export default function SpeakingPage() {
  const { user } = useAuth();

  // 1. Evrensel Profil Senkronizasyonu (Decoupled Identity)
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    name: string;
    avatar: string;
  }>({
    fullName: "Burak P.",
    name: "Burak",
    avatar: "/avatars/sparky.png",
  });

  // 2. Seviye ve Bağlam (Varsayılan: Günlük Doğal Yaşam Sohbeti)
  const [availableRecentStory, setAvailableRecentStory] =
    useState<ActiveStoryContext | null>(null);
  const [activeStory, setActiveStory] = useState<ActiveStoryContext | null>(null);
  const [targetLevel, setTargetLevel] = useState<string>("B1");
  const [activeTopicTitle, setActiveTopicTitle] = useState<string>("Günlük Yaşam Sohbeti");

  // Hedef kelimeler: Yalnızca hikaye veya deste seçiliyse doldurulur, varsayılanda boş!
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [capturedWords, setCapturedWords] = useState<string[]>([]);

  // 3. Karşılaşılan Kelimeler Paneli (Vocabulary Review & Deck Save)
  const [collectedWords, setCollectedWords] = useState<CollectedWordItem[]>([
    {
      id: "word_commute",
      word: "commute",
      translation: "İşe/okula gidip gelmek, düzenli yolculuk",
      phonetic: "/kəˈmjuːt/",
      example: "How did your morning commute go today?",
      selected: true,
    },
    {
      id: "word_routine",
      word: "routine",
      translation: "Alışılagelmiş düzen, günlük rutin",
      phonetic: "/ruːˈtiːn/",
      example: "My morning routine starts with a fresh coffee.",
      selected: true,
    },
    {
      id: "word_unwind",
      word: "unwind",
      translation: "Günün yorgunluğunu atmak, rahatlamak",
      phonetic: "/ʌnˈwaɪnd/",
      example: "I like listening to relaxing music to unwind.",
      selected: true,
    },
  ]);

  // 4. Diyalog Akışı & Canlı Ses
  const [dialogue, setDialogue] = useState<DialogueTurn[]>([
    {
      role: "assistant",
      message:
        "AI Mentor: Hey Burak, how is your day going so far? Did you get a chance to enjoy the weather today?",
      timestamp: "10:00",
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentFollowUpQuestion, setCurrentFollowUpQuestion] = useState<string | null>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);

  // 5. Karne & Arşiv
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isSavingArchive, setIsSavingArchive] = useState(false);
  const [archives, setArchives] = useState<SpeakingArchiveItem[]>([]);
  const [isLoadingArchives, setIsLoadingArchives] = useState(false);
  const [scorecard, setScorecard] = useState<{
    grammar_feedback: string | null;
    improvement_original: string;
    improvement_suggestion: string;
    better_alternative: string;
    vocabulary_highlight: string[];
    jargon_score: number;
    fluency_score: number;
  }>({
    grammar_feedback: null,
    improvement_original: "",
    improvement_suggestion: "",
    better_alternative: "",
    vocabulary_highlight: [],
    jargon_score: 85,
    fluency_score: 88,
  });

  const recognitionRef = useRef<any>(null);

  // Profil Senkronizasyonu (localStorage: vocaship_user_profile, vocaship_custom_avatar)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const syncProfile = () => {
        try {
          const raw = localStorage.getItem("vocaship_user_profile");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.fullName || parsed.name)) {
              setUserProfile({
                fullName: parsed.fullName || parsed.name || user?.fullName || "Burak P.",
                name: parsed.name || (parsed.fullName || user?.fullName || "Burak").split(" ")[0],
                avatar:
                  parsed.avatar ||
                  localStorage.getItem("vocaship_custom_avatar") ||
                  "/avatars/sparky.png",
              });
              return;
            }
          }
        } catch (e) {
          console.warn("Profile sync error:", e);
        }

        const customAvatar = localStorage.getItem("vocaship_custom_avatar");
        setUserProfile({
          fullName: user?.fullName || user?.username || "Burak P.",
          name: (user?.fullName || user?.username || "Burak").split(" ")[0],
          avatar: customAvatar || "/avatars/sparky.png",
        });
      };

      syncProfile();
      window.addEventListener("vocaship:avatar-updated", syncProfile);
      window.addEventListener("storage", syncProfile);
      return () => {
        window.removeEventListener("vocaship:avatar-updated", syncProfile);
        window.removeEventListener("storage", syncProfile);
      };
    }
  }, [user]);

  // Arşivleri Yükle
  const fetchArchives = async () => {
    try {
      setIsLoadingArchives(true);
      const data = await getSpeakingArchives(user?.id);
      if (Array.isArray(data)) {
        setArchives(data);
      }
    } catch (err) {
      console.warn("Could not fetch archives:", err);
    } finally {
      setIsLoadingArchives(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, [user?.id]);

  // Sayfa İlk Açılışı: Varsayılan Olarak Doğal Günlük Yaşam Sorusu ile Başlat (Hikayeyi Zorunlu Kılma)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Varsa son okunan hikayeyi buton için hazırla, fakat otomatik açma!
      try {
        const stored =
          sessionStorage.getItem("active_story_context") ||
          sessionStorage.getItem("vocaship_active_story_context");
        if (stored) {
          const parsed: ActiveStoryContext = JSON.parse(stored);
          if (parsed && parsed.title) {
            setAvailableRecentStory(parsed);
          }
        }
      } catch (e) {
        console.warn("Story context parse error:", e);
      }

      // 2. Doğal günlük yaşam buz kırıcı sorusu (İsim ve günün saatine göre)
      const currentName = userProfile.name || (user?.fullName || "Burak").split(" ")[0];
      const hour = new Date().getHours();
      let greeting = `Hey ${currentName}, how is your day going so far? Did you get a chance to enjoy the weather today?`;

      if (hour < 12) {
        greeting = `Good morning ${currentName}! How is your day starting off? Grabbing a coffee or getting ready for the day?`;
      } else if (hour >= 18) {
        greeting = `Good evening ${currentName}! How did your day go? Doing anything relaxing tonight?`;
      }

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setDialogue([
        {
          role: "assistant",
          message: `AI Mentor: ${greeting}`,
          timestamp: now,
        },
      ]);
      setCurrentFollowUpQuestion(greeting);
      setActiveTopicTitle("Günlük Yaşam Sohbeti");
      setTargetWords([]); // Varsayılanda mock kelimeler YOK!
    }
  }, [userProfile.name]);

  // Hikaye Moduna Geçiş (Kullanıcı rozete bastığında)
  const handleSwitchToStory = () => {
    if (!availableRecentStory) return;
    handleBargeIn();
    if (isRecording) stopRecording();

    setActiveStory(availableRecentStory);
    const lockedLevel = availableRecentStory.level || "B1";
    setTargetLevel(lockedLevel);
    setActiveTopicTitle(`📖 ${availableRecentStory.title}`);

    const storyWords = (
      availableRecentStory.targetWords ||
      availableRecentStory.target_vocabulary ||
      []
    ).slice(0, 4);

    setTargetWords(storyWords);
    setCapturedWords([]);

    // Hikaye kelimelerini oturum kelime listesine ekle
    storyWords.forEach((word) => {
      handleAddCollectedWord(word);
    });

    generateStoryDebateQuestions(availableRecentStory).then((res) => {
      const opening =
        res.opening_question ||
        `In '${availableRecentStory.title}', looking at the central dilemma, what would you have done differently?`;
      setDialogue([
        {
          role: "assistant",
          message: `AI Mentor: ${opening}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setCurrentFollowUpQuestion(opening);
      playSpeech(opening);
    });
  };

  // Günlük Doğal Sohbete Dönüş
  const handleSwitchToDaily = () => {
    handleBargeIn();
    if (isRecording) stopRecording();

    setActiveStory(null);
    setTargetWords([]);
    setCapturedWords([]);

    const currentName = userProfile.name || (user?.fullName || "Burak").split(" ")[0];
    const hour = new Date().getHours();
    let greeting = `Hey ${currentName}, how is your day going so far? Did you get a chance to enjoy the weather today?`;
    if (hour < 12) {
      greeting = `Good morning ${currentName}! How is your day starting off? Grabbing a coffee or getting ready for the day?`;
    } else if (hour >= 18) {
      greeting = `Good evening ${currentName}! How did your day go? Doing anything relaxing tonight?`;
    }

    setActiveTopicTitle("Günlük Yaşam Sohbeti");
    setDialogue([
      {
        role: "assistant",
        message: `AI Mentor: ${greeting}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setCurrentFollowUpQuestion(greeting);
    playSpeech(greeting);
  };

  // Karşılaşılan Kelimeler Listesine Kelime Ekleme Yardımcısı
  const handleAddCollectedWord = (word: string, customTr?: string) => {
    const clean = word.trim();
    if (!clean) return;
    const lower = clean.toLowerCase();

    setCollectedWords((prev) => {
      if (prev.some((w) => w.word.toLowerCase() === lower)) {
        return prev;
      }
      const dictEntry = COMMON_SPEAKING_VOCAB[lower];
      const translation =
        customTr || dictEntry?.tr || "Speaking canlı pratik oturumunda karşılaşılan kelime";
      const phonetic = dictEntry?.phonetic || "";
      const example = dictEntry?.example || "";

      return [
        {
          id: `word_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          word: clean,
          translation,
          phonetic,
          example,
          selected: true,
        },
        ...prev,
      ];
    });
  };

  const handleToggleCollectedWord = (id: string) => {
    setCollectedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const handleRemoveCollectedWord = (id: string) => {
    setCollectedWords((prev) => prev.filter((w) => w.id !== id));
  };

  // 🎯 Görünmez Kelime Avcısı: Yalnızca aktif bir hedef kelime listesi varsa yakalar
  useEffect(() => {
    if (!targetWords || targetWords.length === 0) return;

    const fullSpokenText = (
      userTranscript +
      " " +
      interimText +
      " " +
      dialogue
        .filter((d) => d.role === "user")
        .map((d) => d.message)
        .join(" ")
    ).toLowerCase();

    targetWords.forEach((word) => {
      const cleanWord = word.trim().toLowerCase();
      if (cleanWord && fullSpokenText.includes(cleanWord)) {
        setCapturedWords((prev) => (prev.includes(word) ? prev : [...prev, word]));
      }
    });
  }, [userTranscript, interimText, dialogue, targetWords]);

  // ⚡ Doğal Kesme (Barge-in): Yapay zeka sesini anında iptal et
  const handleBargeIn = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  };

  // TTS Seslendirme (Seviyeye göre kalibre edilmiş tempo)
  const playSpeech = (text: string) => {
    handleBargeIn();
    const clean = text.replace(/^AI Mentor:\s*/i, "").replace(/^\[.*?\]:\s*/, "");
    setIsAiSpeaking(true);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(clean);
      utter.rate = targetLevel === "A2" ? 0.82 : targetLevel === "B1" ? 0.90 : 1.0;
      utter.lang = "en-US";
      utter.onend = () => setIsAiSpeaking(false);
      utter.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };

  // Web Speech API STT Motoru (Continuous Listening Loop)
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
    }
    setIsRecording(false);
  };

  const startListening = () => {
    handleBargeIn();
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tarayıcınız Web Speech API'yi desteklemiyor. Lütfen Chrome veya Edge kullanın.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (e: any) => {
        handleBargeIn();

        let interim = "";
        let final = "";

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcriptChunk = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            final += transcriptChunk + " ";
          } else {
            interim += transcriptChunk;
          }
        }

        if (final) {
          setUserTranscript((prev) => (prev ? prev + " " + final : final).trim());
        }
        setInterimText(interim);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        if (e.error !== "no-speech") {
          setIsRecording(false);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Recognition start failed:", err);
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      if (userTranscript.trim() || interimText.trim()) {
        sendMessage();
      }
    } else {
      startListening();
    }
  };

  // Mesaj Gönder & Dinamik Takip Sorusu Üret
  const sendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText || userTranscript || interimText).trim();
    if (!textToSend || isThinking) return;

    stopRecording();
    handleBargeIn();
    setUserTranscript("");
    setInterimText("");
    setIsThinking(true);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userTurn: DialogueTurn = {
      role: "user",
      message: `User: ${textToSend}`,
      timestamp: now,
    };
    const updatedDialogue = [...dialogue, userTurn];
    setDialogue(updatedDialogue);

    try {
      const res = await fetch(`${API_BASE}/api/v1/speaking/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: activeStory ? "story_debate" : "casual_coffee",
          user_transcript: textToSend,
          history: updatedDialogue.map((turn) => ({
            role: turn.role,
            message: turn.message,
          })),
          story_context: activeStory?.content || activeStory?.snippet,
          target_level: targetLevel,
          conversation_mode: activeStory ? "story_debate" : "casual",
          active_category: activeTopicTitle,
          allowed_scope: activeStory
            ? `Story context: ${activeStory.title}`
            : `Everyday natural life, weather, personal hobbies, work, daily routine`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data.assistant_reply || "That's very interesting! What do you think about next?";
        const assistantTurn: DialogueTurn = {
          role: "assistant",
          message: `AI Mentor: ${replyText}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          feedback: {
            grammar_feedback: data.feedback?.grammar_correction,
            better_alternative: data.feedback?.better_alternative,
            vocabulary_highlight: data.feedback?.used_vocabulary || [],
            jargon_score: data.feedback?.fluency_score || 85,
            fluency_score: data.feedback?.fluency_score || 88,
          },
        };

        setDialogue([...updatedDialogue, assistantTurn]);
        setCurrentFollowUpQuestion(replyText);

        // Gelen yeni kelimeleri ve altın cümle terimlerini kelime listesine ekle
        if (data.feedback?.used_vocabulary && Array.isArray(data.feedback.used_vocabulary)) {
          data.feedback.used_vocabulary.forEach((w: string) => {
            handleAddCollectedWord(w);
          });
        }

        if (data.feedback) {
          setScorecard({
            grammar_feedback: data.feedback.grammar_correction,
            improvement_original: textToSend,
            improvement_suggestion:
              data.feedback.grammar_correction || "Cümleniz akıcı ve seviyeye uygun bir yapıda!",
            better_alternative:
              data.feedback.better_alternative ||
              "From an executive perspective, we strategically mitigated critical path variances.",
            vocabulary_highlight: data.feedback.used_vocabulary || targetWords,
            jargon_score: data.feedback.fluency_score || 85,
            fluency_score: data.feedback.fluency_score || 88,
          });
        }

        playSpeech(replyText);
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn("Backend response failed, fallback activated:", err);
      const fallbackReply =
        "That is a great perspective! Looking at how situations like this develop, what would you suggest doing as the decisive next step?";
      const assistantTurn: DialogueTurn = {
        role: "assistant",
        message: `AI Mentor: ${fallbackReply}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setDialogue([...updatedDialogue, assistantTurn]);
      setCurrentFollowUpQuestion(fallbackReply);
      playSpeech(fallbackReply);
    } finally {
      setIsThinking(false);
    }
  };

  // Konuşma Analizi
  const handleAnalyzeConversation = async () => {
    const lastUserTurn = [...dialogue].reverse().find((t) => t.role === "user");
    const lastAssistantFb = [...dialogue].reverse().find((t) => t.role === "assistant" && t.feedback);

    if (lastAssistantFb?.feedback) {
      setScorecard({
        grammar_feedback: lastAssistantFb.feedback.grammar_feedback || null,
        improvement_original: lastUserTurn?.message.replace(/^User:\s*/i, "") || "",
        improvement_suggestion:
          lastAssistantFb.feedback.grammar_feedback || "Akıcı ve seviyeye uygun doğal cümle yapısı!",
        better_alternative:
          lastAssistantFb.feedback.better_alternative ||
          "We strategically prioritized key actions to achieve the targeted outcome.",
        vocabulary_highlight: capturedWords.length > 0 ? capturedWords : targetWords,
        jargon_score: 88,
        fluency_score: 90,
      });
    }
  };

  // ⏹️ Sohbeti Bitir: Arşivle ve Karneni Gör
  const handleEndSession = async () => {
    handleBargeIn();
    if (isRecording) stopRecording();

    await handleAnalyzeConversation();

    const punchyTitle = generatePunchyTitle(dialogue, activeStory, activeTopicTitle);

    try {
      setIsSavingArchive(true);
      const transcriptPayload = dialogue.map((turn) => ({
        sender: (turn.role === "user" ? "user" : "ai") as "user" | "ai",
        text: turn.message,
        timestamp:
          turn.timestamp ||
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: turn.feedback || undefined,
      }));

      const fluency = scorecard.fluency_score || 88;
      const vocabulary = scorecard.jargon_score || 85;
      const grammar = scorecard.grammar_feedback ? 80 : 92;
      const overall = Math.round((fluency + vocabulary + grammar) / 3);

      await saveSpeakingArchiveSession({
        session_title: punchyTitle,
        transcript: transcriptPayload,
        metrics: {
          fluency,
          vocabulary,
          grammar,
          overall_score: overall,
          level: targetLevel,
        },
        user_id: user?.id,
      });

      await fetchArchives();
    } catch (err) {
      console.warn("Archive save failed:", err);
    } finally {
      setIsSavingArchive(false);
      setIsSummaryModalOpen(true);
    }
  };

  // Diyaloğu Baştan Başlat
  const handleResetDialogue = () => {
    handleBargeIn();
    if (isRecording) stopRecording();
    setUserTranscript("");
    setInterimText("");
    setCapturedWords([]);

    if (activeStory) {
      const openingMsg = `In '${activeStory.title}', looking at the central dilemma, what would you have done differently?`;
      setDialogue([
        {
          role: "assistant",
          message: `AI Mentor: ${openingMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setCurrentFollowUpQuestion(openingMsg);
    } else {
      handleSwitchToDaily();
    }
  };

  // Fısıltı Koçu Kalıbı
  const starters = WHISPER_STARTERS[targetLevel] || WHISPER_STARTERS["B1"];
  const currentWhisperPrompt = starters[whisperIndex % starters.length];

  const latestAssistantTurn = [...dialogue].reverse().find((d) => d.role === "assistant");
  const latestMentorMessage = latestAssistantTurn
    ? latestAssistantTurn.message.replace(/^AI Mentor:\s*/i, "").replace(/^\[.*?\]:\s*/, "")
    : "Hello! Ready to practice speaking?";

  const latestUserTurn = [...dialogue].reverse().find((d) => d.role === "user");
  const latestUserMessage = latestUserTurn ? latestUserTurn.message.replace(/^User:\s*/i, "") : "";

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. ÜST PANEL (TOP NAVIGATION BAR & PROFILE ROZETİ)                       */}
      {/* ========================================================================= */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Sol: Geri Dön & Başlık & Opsiyonel Hikaye Rozeti */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              title="Kütüphaneye Dön"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  {activeTopicTitle}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {targetLevel}
                </span>

                {/* 📖 Opsiyonel Hikaye Tartışma Butonu / Rozeti */}
                {availableRecentStory && !activeStory && (
                  <button
                    type="button"
                    onClick={handleSwitchToStory}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-semibold transition cursor-pointer shadow-sm"
                    title={`Son okunan hikayeyi tartış: ${availableRecentStory.title}`}
                  >
                    <BookOpen className="w-3 h-3 text-indigo-400" />
                    <span>📖 Son Okunan Hikayeyi Tartış</span>
                  </button>
                )}

                {/* ☕ Hikaye Modundaysa Günlük Sohbete Dönüş Butonu */}
                {activeStory && (
                  <button
                    type="button"
                    onClick={handleSwitchToDaily}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 hover:text-white text-[11px] font-semibold transition cursor-pointer"
                    title="Günlük Yaşam Sohbetine Dön"
                  >
                    <Coffee className="w-3 h-3 text-amber-400" />
                    <span>☕ Günlük Sohbete Dön</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                AI Konuşma Stüdyosu • Google Voice Sadeliğinde Canlı Pratik
              </p>
            </div>
          </div>

          {/* Sağ: Kullanıcı Avatarı & Sohbeti Bitir Butonu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Profil Rozeti (Seviyeden Bağımsız Kullanıcı Maskotu) */}
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800/80 py-1.5 px-3 rounded-2xl shadow-lg backdrop-blur-md">
              <img
                src={userProfile.avatar || "/avatars/sparky.png"}
                alt={userProfile.name}
                className="w-7 h-7 rounded-full border border-amber-400/60 object-cover shadow-sm shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avatars/sparky.png";
                }}
              />
              <span className="text-xs font-bold text-slate-200 hidden sm:inline">
                👤 {userProfile.name}
              </span>
            </div>

            {/* [ ⏹️ Sohbeti Bitir ] Butonu */}
            <button
              type="button"
              data-testid="finish-and-save-practice-btn"
              onClick={handleEndSession}
              disabled={isSavingArchive}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition cursor-pointer active:scale-95 disabled:opacity-50"
              title="Sohbeti Bitir ve Karneni Gör"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{isSavingArchive ? "Kaydediliyor..." : "⏹️ Sohbeti Bitir"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CANLI KONUŞMA SAHNESİ & MODÜLLER                                       */}
      {/* ========================================================================= */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col justify-between">
        {/* Canlı Konuşma ve Mikrofon Sahnesi */}
        <SpeakingCenterStage
          latestMentorMessage={latestMentorMessage}
          latestUserMessage={latestUserMessage}
          followUpQuestion={currentFollowUpQuestion}
          isRecording={isRecording}
          isThinking={isThinking}
          isAiSpeaking={isAiSpeaking}
          userTranscript={userTranscript}
          interimText={interimText}
          targetLevel={targetLevel}
          targetWords={targetWords}
          capturedWords={capturedWords}
          whisperPrompt={currentWhisperPrompt}
          onCycleWhisper={() => setWhisperIndex((prev) => prev + 1)}
          onSelectWhisper={(phrase) => {
            setUserTranscript((prev) => (prev ? prev + " " + phrase : phrase));
          }}
          toggleRecording={toggleRecording}
          onPlayMentorSpeech={() => {
            if (isAiSpeaking) {
              handleBargeIn();
            } else {
              playSpeech(latestMentorMessage);
            }
          }}
          onSendMessage={sendMessage}
          setUserTranscript={setUserTranscript}
        />

        {/* 🎯 ZORLANILAN / ÖNERİLEN KELİMELERİ ONAYLI DESTEYE KAYDETME PANELİ */}
        <SpeakingWordCollector
          words={collectedWords}
          onToggleWord={handleToggleCollectedWord}
          onAddWord={handleAddCollectedWord}
          onRemoveWord={handleRemoveCollectedWord}
          onPlayWordSpeech={(word) => playSpeech(word)}
        />

        {/* ========================================================================= */}
        {/* 3. ALT ÇEKMECE ARŞİVİ (SpeakingArchiveDrawer)                             */}
        {/* ========================================================================= */}
        <SpeakingArchiveDrawer
          archives={archives}
          isLoading={isLoadingArchives}
          onRefresh={fetchArchives}
        />
      </main>

      {/* ========================================================================= */}
      {/* 4. OTURUM SONU KARNESİ MODALI (SpeakingScorecardModal)                    */}
      {/* ========================================================================= */}
      <SpeakingScorecardModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        targetLevel={targetLevel}
        scorecard={scorecard}
        capturedWords={capturedWords}
        targetWords={targetWords}
        sessionTitle={activeTopicTitle}
        onOpenArchive={() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }}
        onResetSession={handleResetDialogue}
        onPlaySpeech={playSpeech}
      />
    </div>
  );
}
