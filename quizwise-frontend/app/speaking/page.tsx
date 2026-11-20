"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Mic,
  Volume2,
  Loader2,
  Maximize2,
  Minimize2,
  History,
  Lightbulb,
  X,
  BookOpen,
  Sparkles,
  Check,
  BookPlus,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePersona } from "../context/PersonaContext";
import { useProfile } from "../context/ProfileContext";
import { useAppTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import {
  rewardSpeakingSessionComplete,
  rewardSpeakingTargetWord,
} from "../utils/rewardEngine";
import {
  getActiveDeckId,
  getActiveDeckCards,
  subscribeToActiveDeck,
  GameWordPair,
} from "../utils/activeDeckStore";
import { saveSpeakingArchiveSession } from "../actions/speakingArchive";
import { resilientFetch } from "../config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface DialogueTurn {
  role: "assistant" | "user";
  message: string;
  timestamp?: string;
}

export interface SessionArchiveTurn {
  speaker: "AI" | "Sen";
  text: string;
  timestamp: string;
}

export interface SpeakingSummaryData {
  session_title: string;
  fluency_score: number;
  coach_feedback: string;
  golden_sentence: {
    original: string;
    improved: string;
    reason_tr: string;
  };
  extracted_words: Array<{
    word: string;
    turkish_meaning: string;
    example_sentence: string;
  }>;
}

interface ActiveStoryContext {
  storyId?: string;
  title: string;
  level: string;
  snippet?: string;
  content?: string;
  target_vocabulary?: string[];
  target_words?: string[];
  targetWords?: string[];
  topic?: string;
}

function buildContextualHints(
  currentAiPrompt: string,
  storyTitle: string | null,
  level: string,
  turnCount: number = 0
): [string, string] {
  const lower = (currentAiPrompt || "").toLowerCase();
  if (storyTitle) {
    return turnCount % 2 === 0
      ? [
          `In "${storyTitle}", I think the turning point was...`,
          "If I were in that situation, I would probably...",
        ]
      : [
          `What surprised me most in "${storyTitle}" was...`,
          "I agree with the character's choice because...",
        ];
  }
  if (/(weather|sunny|rain|temperature)/.test(lower)) {
    return [
      "Today the weather feels...",
      "I usually enjoy this kind of weather because...",
    ];
  }
  if (/(animal|zoo|elephant|dog|cat)/.test(lower)) {
    return [
      "My favorite animal is...",
      "I really like them because...",
    ];
  }
  if (/(day|doing|weekend|plans)/.test(lower)) {
    return [
      "So far, my day has been...",
      "Later today, I am planning to...",
    ];
  }
  if (/(food|eat|movie|book|hobby)/.test(lower)) {
    return [
      "One of my absolute favorites is...",
      "I got into it recently because...",
    ];
  }
  if (/(think|future|prefer|why)/.test(lower)) {
    return [
      "From my point of view...",
      "The main reason I feel this way is...",
    ];
  }
  if (level === "A1" || level === "A2") {
    const pools: Array<[string, string]> = [
      ["Today I feel really good because...", "In my free time, I enjoy..."],
      ["For me, the nicest part is...", "I usually do that when I am..."],
      ["Yes, I really like it because...", "In my daily life, I often..."],
    ];
    return pools[turnCount % pools.length];
  }
  const pools: Array<[string, string]> = [
    ["Actually, my day has been...", "I would love to talk about..."],
    ["To be honest, what stands out most is...", "In my experience, it really depends on..."],
    ["What I find most interesting is...", "Usually in situations like that, I tend to..."],
  ];
  return pools[turnCount % pools.length];
}

function SpeakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedCharacter } = usePersona();
  const { userProfile } = useProfile();
  const { isDark } = useAppTheme();
  const { t, language } = useLanguage();

  const isAlex = selectedCharacter === "alex_adult";

  // Evrensel Profil Senkronizasyonu (Seviyeden Bağımsız Görsel Kimlik)
  const [syncedProfile, setSyncedProfile] = useState<{
    displayName: string;
    avatarUrl: string;
  }>({
    displayName: userProfile?.username || user?.username || t("speak_speaker_fallback", "Konuşmacı"),
    avatarUrl: userProfile?.avatar_url || "🦊",
  });

  useEffect(() => {
    let localProfile: { username?: string; avatar_url?: string } | null = null;
    if (typeof window !== "undefined") {
      try {
        const rawProfile =
          localStorage.getItem("vocaship_user_profile") ||
          localStorage.getItem("auth_user");
        if (rawProfile) {
          localProfile = JSON.parse(rawProfile);
        }
      } catch {}
    }
    setSyncedProfile({
      displayName:
        userProfile?.username ||
        user?.username ||
        localProfile?.username ||
        t("speak_speaker_fallback", "Konuşmacı"),
      avatarUrl:
        userProfile?.avatar_url || localProfile?.avatar_url || "🦊",
    });
  }, [userProfile, user, t]);

  // Tam Ekran, Geçmiş Çekmecesi ve Akıllı İpucu Durumları
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedArchives, setSavedArchives] = useState<
    Array<{
      id: string;
      title: string;
      created_at: string;
      turns: SessionArchiveTurn[];
    }>
  >([]);
  const [isHintBoxOpen, setIsHintBoxOpen] = useState<boolean>(false);
  const [dynamicHints, setDynamicHints] = useState<[string, string]>([
    "Actually, my day has been...",
    "I would love to talk about...",
  ]);
  const backendHintsForMessageRef = useRef<string>("");

  // FAZ 4: Oturum Sonu Karnesi & Desteye Kelime Kaydı
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [summaryModalData, setSummaryModalData] = useState<SpeakingSummaryData | null>(null);
  const [selectedSummaryWords, setSelectedSummaryWords] = useState<Record<string, boolean>>({});
  const [userDecks, setUserDecks] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedTargetDeckId, setSelectedTargetDeckId] = useState<string>("__new__");
  const [isSavingWords, setIsSavingWords] = useState<boolean>(false);
  const [wordsSavedMessage, setWordsSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  const loadSavedArchives = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("vocaship_speaking_archives");
      const parsed = raw ? JSON.parse(raw) : [];
      setSavedArchives(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSavedArchives([]);
    }
  }, []);

  // Okuma Odasından Gelindiğinde Hikaye Bağlamı (?mode=story_debate veya ?mode=story)
  const urlMode = searchParams.get("mode");
  const isExplicitStoryMode = urlMode === "story_debate" || urlMode === "story";
  const urlTitle = isExplicitStoryMode
    ? searchParams.get("title") || searchParams.get("story_title") || searchParams.get("story")
    : null;
  const [storyContext, setStoryContext] = useState<ActiveStoryContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search || "");
        const modeParam = params.get("mode");
        const hasStoryModeParam = modeParam === "story_debate" || modeParam === "story";

        if (!hasStoryModeParam) {
          sessionStorage.removeItem("vocaship_active_story_context");
          sessionStorage.removeItem("active_story_context");
          setStoryContext(null);
          return;
        }

        const stored =
          sessionStorage.getItem("vocaship_active_story_context") ||
          sessionStorage.getItem("active_story_context");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.title) {
            setStoryContext(parsed);
          }
        }
      } catch {
        setStoryContext(null);
      }
    }
  }, [urlMode]);

  const activeStoryTitle = isExplicitStoryMode
    ? storyContext?.title || urlTitle || null
    : null;
  const isStoryLevelLocked = Boolean(isExplicitStoryMode && storyContext?.level);
  const activeLevel = (
    storyContext?.level ||
    userProfile?.study_level ||
    "B1"
  ).toUpperCase();

  // Oturum Durumu ('idle' | 'active')
  const [sessionState, setSessionState] = useState<"idle" | "active">("idle");
  const sessionStateRef = useRef<"idle" | "active">("idle");
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  // Ses ve Dinleme Durumları
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const isAiSpeakingRef = useRef<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const isThinkingRef = useRef<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const [storyOpeningQuestion, setStoryOpeningQuestion] = useState<string>("");

  // Canlı Mesajlar & Transkript
  const [aiMessage, setAiMessage] = useState<string>("");
  const latestAiMessageRef = useRef<string>("");
  const previousAiMessageRef = useRef<string>("");
  const [userTranscript, setUserTranscript] = useState<string>("");
  const transcriptBufferRef = useRef<string>("");
  const currentSessionFinalRef = useRef<string>("");
  const latestInterimRef = useRef<string>("");

  // Zamanlayıcı ve Ses Referansları
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioFailsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartListenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechWatchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSessionRef = useRef<number>(0);

  // Sayfa değiştiğinde veya bileşen ayrıldığında aktif sesleri ve dinlemeyi temizle
  useEffect(() => {
    return () => {
      speechSessionRef.current += 1;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (audioFailsafeTimerRef.current) clearTimeout(audioFailsafeTimerRef.current);
      if (restartListenTimerRef.current) clearTimeout(restartListenTimerRef.current);
      if (speechWatchIntervalRef.current) clearInterval(speechWatchIntervalRef.current);
      if (audioRef.current) {
        try {
          audioRef.current.onended = null;
          audioRef.current.onerror = null;
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      try {
        recognitionRef.current?.abort();
      } catch {}
    };
  }, []);

  // Diyalog Geçmişi & Arşiv
  const [dialogue, setDialogue] = useState<DialogueTurn[]>([]);
  const dialogueRef = useRef<DialogueTurn[]>([]);
  const updateDialogue = useCallback((nextDialogue: DialogueTurn[]) => {
    dialogueRef.current = nextDialogue;
    setDialogue(nextDialogue);
  }, []);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});
  const [sessionArchive, setSessionArchive] = useState<SessionArchiveTurn[]>([]);
  const sessionArchiveRef = useRef<SessionArchiveTurn[]>([]);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [deckTargetWords, setDeckTargetWords] = useState<GameWordPair[]>([]);

  // Okuma Odasından Gelindiğinde Hikayeye Özel Açılış Sorusu Çek
  useEffect(() => {
    if (!isExplicitStoryMode || !activeStoryTitle) {
      setStoryOpeningQuestion("");
      return;
    }

    let cancelled = false;
    const snippetToSend = (storyContext?.snippet || storyContext?.content || "").slice(0, 800);
    const firstSentence = snippetToSend
      ? snippetToSend
          .split(/[.!?]+/)
          .find((s) => s.trim().length > 15)
          ?.trim()
      : "";
    const fallbackQ = firstSentence
      ? `We just read "${activeStoryTitle}", where ${
          firstSentence[0].toLowerCase() + firstSentence.slice(1)
        }. What stood out to you the most in this story?`
      : `We just finished reading "${activeStoryTitle}"! What moment or character decision caught your attention the most?`;

    setStoryOpeningQuestion(fallbackQ);

    (async () => {
      try {
        const res = await resilientFetch(`${API_BASE}/api/v1/speaking/init-story`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story_title: activeStoryTitle,
            story_snippet: snippetToSend,
            level: activeLevel,
            target_vocabulary:
              storyContext?.target_vocabulary || storyContext?.target_words || [],
          }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const dynamicQ = (data.assistant_reply || data.initial_question || "").trim();
        if (dynamicQ && !cancelled) {
          setStoryOpeningQuestion(dynamicQ);
        }
      } catch {
        // Hikaye başlangıç sorusu yedek metinle devam eder
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isExplicitStoryMode, activeStoryTitle, storyContext, activeLevel]);

  // Sıcak Yerel Buz Kırıcı (Warm Local Icebreaker)
  const openingGreeting = useMemo(() => {
    if (activeStoryTitle) {
      return (
        storyOpeningQuestion ||
        `We just finished reading "${activeStoryTitle}"! What moment or character decision caught your attention the most?`
      );
    }
    return "Hey there! Great to see you. What has been the highlight of your day so far?";
  }, [activeStoryTitle, storyOpeningQuestion]);

  // 🎯 Hedef Kelime Avcısı (Yalnızca Hikaye Modunda Göster)
  const targetWordsList = useMemo<string[]>(() => {
    if (!isExplicitStoryMode || !storyContext) {
      return [];
    }
    const rawStoryWords =
      storyContext.targetWords || storyContext.target_words || storyContext.target_vocabulary || [];
    const normalizedStory: string[] = rawStoryWords
      .map((w: any) => (typeof w === "string" ? w : w?.word || ""))
      .map((w: string) => w.trim())
      .filter(Boolean);
    return Array.from(new Set<string>(normalizedStory)).slice(0, 6);
  }, [isExplicitStoryMode, storyContext]);

  // Render Sunucusunu Arka Planda Uyandır (Cold Start Koruması)
  useEffect(() => {
    fetch(`${API_BASE}/health`).catch(() => {});
  }, []);

  const huntedTargetWords = useMemo(() => {
    const combinedUserSpeech = [
      ...dialogue.filter((d) => d.role === "user").map((d) => d.message),
      userTranscript,
    ]
      .join(" ")
      .toLowerCase();

    const matched = new Set<string>();
    for (const word of targetWordsList) {
      const cleanWord = word.toLowerCase().trim();
      if (!cleanWord) continue;
      const escaped = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}`, "i").test(combinedUserSpeech)) {
        matched.add(word);
      }
    }
    return matched;
  }, [targetWordsList, dialogue, userTranscript]);

  const rewardedSpeakingWordsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    huntedTargetWords.forEach((w) => {
      const key = w.toLowerCase().trim();
      if (key && !rewardedSpeakingWordsRef.current.has(key)) {
        rewardedSpeakingWordsRef.current.add(key);
        rewardSpeakingTargetWord(w);
      }
    });
  }, [huntedTargetWords]);

  useEffect(() => {
    const activeAiText = aiMessage || openingGreeting;
    if (activeAiText && activeAiText !== latestAiMessageRef.current) {
      previousAiMessageRef.current = latestAiMessageRef.current;
      latestAiMessageRef.current = activeAiText;
    }
  }, [aiMessage, openingGreeting]);

  // Kullanıcı Transkriptinden AI Cümlesini (Hoparlör Yankısını) Filtreleyen Yardımcı Fonksiyon
  const stripAiEchoFromUserText = useCallback(
    (rawTranscript: string): string => {
      if (!rawTranscript) return "";
      let cleaned = rawTranscript.trim();
      if (!cleaned) return "";

      const candidates = [
        latestAiMessageRef.current,
        previousAiMessageRef.current,
        aiMessage,
        openingGreeting,
      ].filter(Boolean);

      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      for (const aiSent of candidates) {
        // 1. Tam cümle ve alt cümlecikleri (nokta, soru işareti, ünlem veya virgüle göre) ayır
        const subClauses = [
          aiSent,
          ...aiSent.split(/[.!?]+/),
          ...aiSent.split(/[,;]+/),
        ]
          .map((c) => c.trim())
          .filter((c) => c.length > 0);

        for (const clause of subClauses) {
          const words = clause
            .replace(/[^a-zA-Z0-9\s']/g, " ")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

          // En az 3 kelimelik AI cümle parçalarını (noktalama ve büyük/küçük harf duyarsız) sil
          if (words.length >= 3) {
            const pattern = words.map(escapeRegex).join("[\\s,.;:!?'\"]+");
            const regex = new RegExp(pattern, "gi");
            cleaned = cleaned.replace(regex, " ").replace(/\s+/g, " ").trim();
          }

          // Ayrıca AI cümlesinin son 3-6 kelimesi oda yankısıyla mikrofonun başına takıldıysa temizle
          if (words.length >= 4) {
            for (let tailLen = Math.min(words.length, 7); tailLen >= 3; tailLen--) {
              const tailWords = words.slice(words.length - tailLen);
              const tailPattern =
                "^[\\s,.;:!?'\"]*" +
                tailWords.map(escapeRegex).join("[\\s,.;:!?'\"]+") +
                "[\\s,.;:!?'\"]*";
              const tailRegex = new RegExp(tailPattern, "i");
              if (tailRegex.test(cleaned)) {
                cleaned = cleaned.replace(tailRegex, "").replace(/\s+/g, " ").trim();
              }
            }
          }
        }
      }

      return cleaned.replace(/\s+/g, " ").trim();
    },
    [aiMessage, openingGreeting]
  );

  // Oturum Süresi Sayacı
  useEffect(() => {
    if (sessionState !== "active") return;
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionState]);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Aktif Deste Kelimelerini Yükle
  useEffect(() => {
    async function loadDecks() {
      try {
        const activeId = getActiveDeckId();
        if (activeId) {
          const cards = await getActiveDeckCards(activeId);
          setDeckTargetWords(cards);
        }
      } catch {}
    }
    loadDecks();
    const unsubscribe = subscribeToActiveDeck(async (newId) => {
      const cards = await getActiveDeckCards(newId);
      setDeckTargetWords(cards);
    });
    return () => unsubscribe();
  }, []);

  const addToSessionArchive = useCallback((turn: SessionArchiveTurn) => {
    setSessionArchive((prev) => {
      const updated = [...prev, turn];
      sessionArchiveRef.current = updated;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("vocaship_speaking_archives", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // 🎙️ KESİNTİSİZ SPEECH RECOGNITION & 1.5SN AKILLI GÖNDERİM
  // ---------------------------------------------------------------------------

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartListenTimerRef.current) {
      clearTimeout(restartListenTimerRef.current);
      restartListenTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setMicVolume(0);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    if (
      isAiSpeakingRef.current ||
      isThinkingRef.current ||
      sessionStateRef.current !== "active"
    ) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError(
        t("speak_browser_unsupported", "Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome veya Edge kullanın.")
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }

      currentSessionFinalRef.current = "";
      latestInterimRef.current = "";

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        if (
          isAiSpeakingRef.current ||
          isThinkingRef.current ||
          sessionStateRef.current !== "active"
        ) {
          return;
        }

        let sessionFinal = "";
        let sessionInterim = "";
        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            sessionFinal += item[0].transcript + " ";
          } else {
            sessionInterim += item[0].transcript + " ";
          }
        }

        // Hoparlörden mikrofona sızan AI cümlesi varsa otomatik filtrele
        const filteredFinal = stripAiEchoFromUserText(sessionFinal);
        const filteredInterim = stripAiEchoFromUserText(sessionInterim);

        currentSessionFinalRef.current = filteredFinal;
        latestInterimRef.current = filteredInterim;

        const rawCombined = [
          transcriptBufferRef.current,
          currentSessionFinalRef.current,
          latestInterimRef.current,
        ]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        const currentLive = stripAiEchoFromUserText(rawCombined);

        if (!currentLive) {
          setUserTranscript("");
          return;
        }

        setUserTranscript(currentLive);
        setMicVolume(60);
        setTimeout(() => setMicVolume(20), 220);

        // Kullanıcı 2.0 saniye (2000ms) sustuğunda biriken tüm cümleyi tek tur olarak gönder (3 kelimeden az gürültüyü filtrele)
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          const rawCompleted = [
            transcriptBufferRef.current,
            currentSessionFinalRef.current,
            latestInterimRef.current,
          ]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

          const completedSentence = stripAiEchoFromUserText(rawCompleted);
          const wordCount = completedSentence.split(/\s+/).filter(Boolean).length;

          if (wordCount < 3) {
            transcriptBufferRef.current = "";
            currentSessionFinalRef.current = "";
            latestInterimRef.current = "";
            setUserTranscript("");
            return;
          }

          if (
            completedSentence &&
            !isAiSpeakingRef.current &&
            !isThinkingRef.current &&
            sessionStateRef.current === "active"
          ) {
            transcriptBufferRef.current = "";
            currentSessionFinalRef.current = "";
            latestInterimRef.current = "";
            sendMessageRef.current(completedSentence);
          }
        }, 2000);
      };

      recognition.onerror = (e: any) => {
        if (
          e.error === "not-allowed" ||
          e.error === "service-not-allowed" ||
          e.error === "audio-capture"
        ) {
          setMicError(t("speak_mic_denied", "Mikrofon erişimi engellendi, lütfen tarayıcı iznini açın."));
          setIsListening(false);
          return;
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setMicVolume(0);

        // Mevcut oturumda yakalanmış kelimeleri ana tamponda koru
        const chunkToPreserve = stripAiEchoFromUserText(
          [currentSessionFinalRef.current, latestInterimRef.current]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()
        );

        if (chunkToPreserve) {
          transcriptBufferRef.current = stripAiEchoFromUserText(
            [transcriptBufferRef.current, chunkToPreserve]
              .filter(Boolean)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim()
          );
          currentSessionFinalRef.current = "";
          latestInterimRef.current = "";
        }

        // Oturum aktifse ve AI konuşmuyorsa 250ms içinde mikrofonu otomatik yeniden başlat
        if (
          !isAiSpeakingRef.current &&
          !isThinkingRef.current &&
          sessionStateRef.current === "active"
        ) {
          if (restartListenTimerRef.current) {
            clearTimeout(restartListenTimerRef.current);
          }
          restartListenTimerRef.current = setTimeout(() => {
            if (
              !isAiSpeakingRef.current &&
              !isThinkingRef.current &&
              sessionStateRef.current === "active"
            ) {
              startListening();
            }
          }, 250);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [stripAiEchoFromUserText]);

  // ---------------------------------------------------------------------------
  // 🔊 YANKI KİLİTLİ SESLENDİRME (700ms Oda Yankısı Sönümlenme Korumalı)
  // ---------------------------------------------------------------------------

  const speakAiResponse = useCallback(
    (textToSpeak: string) => {
      const clean = (textToSpeak || "").trim();
      if (!clean) {
        isAiSpeakingRef.current = false;
        isThinkingRef.current = false;
        setIsAiSpeaking(false);
        setIsThinking(false);
        startListening();
        return;
      }

      if (clean !== latestAiMessageRef.current) {
        previousAiMessageRef.current = latestAiMessageRef.current;
        latestAiMessageRef.current = clean;
      }

      // Sıfır Yankı Kuralı: AI konuşurken mikrofonu TAMAMEN kapat
      isAiSpeakingRef.current = true;
      isThinkingRef.current = false;
      setIsAiSpeaking(true);
      setIsThinking(false);

      try {
        recognitionRef.current?.abort();
      } catch {}
      recognitionRef.current = null;
      stopListening();

      transcriptBufferRef.current = "";
      currentSessionFinalRef.current = "";
      latestInterimRef.current = "";
      setUserTranscript("");

      if (audioFailsafeTimerRef.current) {
        clearTimeout(audioFailsafeTimerRef.current);
        audioFailsafeTimerRef.current = null;
      }
      if (speechWatchIntervalRef.current) {
        clearInterval(speechWatchIntervalRef.current);
        speechWatchIntervalRef.current = null;
      }

      if (audioRef.current) {
        try {
          audioRef.current.onended = null;
          audioRef.current.onerror = null;
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }

      const sessionId = ++speechSessionRef.current;
      let hasFinishedTurn = false;
      let objectUrl: string | null = null;
      let activeChunkAbort: AbortController | null = null;

      // 3 yönlü kilit açıcı: HTML5 audio onended/onerror, speechSynthesis onend/onerror veya maksimum güvenlik zamanlayıcısı
      const unlockAndListen = () => {
        if (hasFinishedTurn) return;
        hasFinishedTurn = true;
        try {
          activeChunkAbort?.abort();
        } catch {}

        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {}
          objectUrl = null;
        }

        if (audioFailsafeTimerRef.current) {
          clearTimeout(audioFailsafeTimerRef.current);
          audioFailsafeTimerRef.current = null;
        }
        if (speechWatchIntervalRef.current) {
          clearInterval(speechWatchIntervalRef.current);
          speechWatchIntervalRef.current = null;
        }

        if (speechSessionRef.current !== sessionId) return;

        try {
          recognitionRef.current?.abort();
        } catch {}
        recognitionRef.current = null;

        isAiSpeakingRef.current = false;
        isThinkingRef.current = false;
        setIsAiSpeaking(false);
        setIsThinking(false);

        if (restartListenTimerRef.current) {
          clearTimeout(restartListenTimerRef.current);
        }
        restartListenTimerRef.current = setTimeout(() => {
          if (
            speechSessionRef.current === sessionId &&
            sessionStateRef.current === "active" &&
            !isAiSpeakingRef.current
          ) {
            transcriptBufferRef.current = "";
            currentSessionFinalRef.current = "";
            latestInterimRef.current = "";
            startListening();
          }
        }, 700);
      };

      // Metni cümle parçalarına böl ve onended ile sıralı oynat (sequential player)
      const rawChunks = clean.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [clean];
      const chunks = rawChunks.map((c) => c.trim()).filter(Boolean);
      if (chunks.length === 0) {
        unlockAndListen();
        return;
      }

      // Metin uzunluğuna göre dinamik maksimum güvenlik zamanlayıcısı (Zero-Deadlock)
      const safetyMs = Math.max(6000, clean.length * 105);
      audioFailsafeTimerRef.current = setTimeout(() => {
        unlockAndListen();
      }, safetyMs);

      const storedVoice =
        typeof window !== "undefined" ? localStorage.getItem("vocaship_neural_voice") : null;
      const targetVoice = storedVoice || "en-US-JennyNeural";

      const playChunkAt = (chunkIndex: number) => {
        if (hasFinishedTurn || speechSessionRef.current !== sessionId) return;
        if (chunkIndex >= chunks.length) {
          unlockAndListen();
          return;
        }

        const chunkText = chunks[chunkIndex];
        let chunkAdvanced = false;
        const advanceNext = () => {
          if (chunkAdvanced || hasFinishedTurn || speechSessionRef.current !== sessionId) return;
          chunkAdvanced = true;
          if (speechWatchIntervalRef.current) {
            clearInterval(speechWatchIntervalRef.current);
            speechWatchIntervalRef.current = null;
          }
          if (objectUrl) {
            try {
              URL.revokeObjectURL(objectUrl);
            } catch {}
            objectUrl = null;
          }
          playChunkAt(chunkIndex + 1);
        };

        const playBrowserChunkFallback = () => {
          if (chunkAdvanced || hasFinishedTurn || speechSessionRef.current !== sessionId) return;
          if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            advanceNext();
            return;
          }

          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(chunkText);
            utteranceRef.current = utterance;
            const targetLang = targetVoice.includes("en-GB") ? "en-GB" : "en-US";
            utterance.lang = targetLang;
            utterance.rate = 0.90;

            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
              const preferred =
                voices.find(
                  (v) =>
                    v.lang.startsWith(targetLang) &&
                    (v.name.includes("Natural") ||
                      v.name.includes("Jenny") ||
                      v.name.includes("Aria") ||
                      v.name.includes("Google"))
                ) ||
                voices.find((v) => v.lang.startsWith(targetLang)) ||
                voices.find((v) => v.lang.startsWith("en"));
              if (preferred) {
                utterance.voice = preferred;
              }
            }

            utterance.onend = () => advanceNext();
            utterance.onerror = () => advanceNext();
            window.speechSynthesis.speak(utterance);

            let startedSpeaking = false;
            let ticks = 0;
            if (speechWatchIntervalRef.current) clearInterval(speechWatchIntervalRef.current);
            speechWatchIntervalRef.current = setInterval(() => {
              ticks++;
              if (window.speechSynthesis.speaking) {
                startedSpeaking = true;
              } else if (startedSpeaking || ticks > 10) {
                advanceNext();
              }
            }, 250);
          } catch {
            advanceNext();
          }
        };

        const streamUrl = `${API_BASE}/api/v1/tts/stream?text=${encodeURIComponent(
          chunkText
        )}&voice=${encodeURIComponent(targetVoice)}&rate=-2%`;
        const chunkAbortController = new AbortController();
        activeChunkAbort = chunkAbortController;
        const chunkTimeoutId = setTimeout(() => chunkAbortController.abort(), 1500);

        fetch(streamUrl, { signal: chunkAbortController.signal })
          .then(async (res) => {
            clearTimeout(chunkTimeoutId);
            if (!res.ok) {
              throw new Error(`TTS HTTP ${res.status}`);
            }
            const blob = await res.blob();
            if (hasFinishedTurn || speechSessionRef.current !== sessionId) return;
            if (!blob || blob.size === 0) {
              throw new Error("Empty TTS audio blob");
            }

            objectUrl = URL.createObjectURL(blob);
            const audio = new Audio(objectUrl);
            audioRef.current = audio;

            audio.onplay = () => {
              if (speechSessionRef.current !== sessionId) return;
              isAiSpeakingRef.current = true;
              setIsAiSpeaking(true);
              try {
                recognitionRef.current?.abort();
              } catch {}
              recognitionRef.current = null;
              stopListening();
            };

            audio.onended = () => advanceNext();
            audio.onerror = () => {
              console.warn("Nöral TTS oynatılamadı, tarayıcı ses motoruna geçiliyor.");
              playBrowserChunkFallback();
            };

            await audio.play();
          })
          .catch(() => {
            clearTimeout(chunkTimeoutId);
            if (!hasFinishedTurn && speechSessionRef.current === sessionId) {
              console.warn("Nöral TTS yanıt vermedi, tarayıcı ses motoruna geçiliyor.");
              playBrowserChunkFallback();
            }
          });
      };

      playChunkAt(0);
    },
    [stopListening, startListening]
  );

  // Söz Kesme (Küreye Dokunarak)
  const interruptAi = useCallback(() => {
    if (audioFailsafeTimerRef.current) {
      clearTimeout(audioFailsafeTimerRef.current);
      audioFailsafeTimerRef.current = null;
    }
    if (speechWatchIntervalRef.current) {
      clearInterval(speechWatchIntervalRef.current);
      speechWatchIntervalRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    try {
      recognitionRef.current?.abort();
    } catch {}
    recognitionRef.current = null;
    isAiSpeakingRef.current = false;
    isThinkingRef.current = false;
    setIsAiSpeaking(false);
    setIsThinking(false);
    setUserTranscript("");
    transcriptBufferRef.current = "";
    currentSessionFinalRef.current = "";
    latestInterimRef.current = "";
    setTimeout(() => {
      if (sessionStateRef.current === "active") {
        startListening();
      }
    }, 700);
  }, [startListening]);

  // ---------------------------------------------------------------------------
  // 🚀 GEMINI BACKEND SOHBET GÖNDERİMİ (${API_BASE}/api/v1/speaking/respond)
  // ---------------------------------------------------------------------------

  const handleSendTranscript = useCallback(
    async (finalTranscript: string) => {
      const cleanText = stripAiEchoFromUserText(finalTranscript).trim();
      if (!cleanText || isThinkingRef.current) return;

      stopListening();
      setUserTranscript("");
      transcriptBufferRef.current = "";
      currentSessionFinalRef.current = "";
      latestInterimRef.current = "";
      setIsThinking(true);
      isThinkingRef.current = true;
      setMicError(null);

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const userTurn: DialogueTurn = { role: "user", message: cleanText, timestamp: now };
      addToSessionArchive({ speaker: "Sen", text: cleanText, timestamp: now });

      const updatedDialogue = [...dialogueRef.current, userTurn];
      updateDialogue(updatedDialogue);

      const formattedHistoryPayload = updatedDialogue.map((d) => ({
        role: d.role,
        message: d.message,
        content: d.message,
      }));

      try {
        const targetWordsToSend = activeStoryTitle
          ? Array.from(new Set(storyContext?.targetWords || storyContext?.target_vocabulary || []))
          : [];

        const requestBody = JSON.stringify({
          user_message: cleanText,
          message: cleanText,
          transcript: cleanText,
          user_transcript: cleanText,
          scenario_id: activeStoryTitle ? "story_debate" : "casual_coffee",
          history: formattedHistoryPayload,
          conversation_history: formattedHistoryPayload,
          persona: isAlex ? "alex" : "sparky",
          target_level: activeLevel,
          level: activeLevel,
          story_context: activeStoryTitle
            ? {
                title: activeStoryTitle,
                level: activeLevel,
                snippet: (storyContext?.snippet || storyContext?.content || "").slice(
                  0,
                  800
                ),
                content: (storyContext?.content || storyContext?.snippet || "").slice(
                  0,
                  800
                ),
                target_words: targetWordsToSend,
                target_vocabulary: targetWordsToSend,
              }
            : null,
          conversation_mode: activeStoryTitle ? "story_debate" : "casual",
        });

        const executeRespondFetch = async (): Promise<Response> => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort("timeout"), 45000);
          try {
            return await fetch(`${API_BASE}/api/v1/speaking/respond`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: requestBody,
              signal: controller.signal,
            });
          } finally {
            clearTimeout(timeoutId);
          }
        };

        let res: Response;
        try {
          res = await executeRespondFetch();
        } catch (firstErr) {
          const errStr =
            typeof firstErr === "string"
              ? firstErr
              : firstErr instanceof Error
              ? `${firstErr.name}: ${firstErr.message}`
              : "";
          const isRetryable =
            firstErr === "timeout" ||
            (firstErr instanceof Error && firstErr.name === "AbortError") ||
            errStr.toLowerCase().includes("abort") ||
            errStr.toLowerCase().includes("timeout") ||
            errStr.toLowerCase().includes("failed to fetch") ||
            errStr.toLowerCase().includes("network") ||
            errStr.toLowerCase().includes("load failed");

          if (!isRetryable) {
            throw firstErr;
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
          res = await executeRespondFetch();
        }

        if (res.ok) {
          const data = await res.json();

          const replyText = String(
            data.assistant_reply ||
              data.reply_message ||
              data.reply ||
              data.response ||
              data.message ||
              ""
          ).trim();

          const incomingHints =
            Array.isArray(data.hints) && data.hints.length >= 2
              ? data.hints
              : Array.isArray(data.hint_suggestions) && data.hint_suggestions.length >= 2
              ? data.hint_suggestions
              : null;

          if (incomingHints) {
            backendHintsForMessageRef.current = replyText;
            setDynamicHints([String(incomingHints[0]), String(incomingHints[1])]);
          } else if (replyText) {
            backendHintsForMessageRef.current = "";
            setDynamicHints(
              buildContextualHints(replyText, activeStoryTitle, activeLevel, dialogueRef.current.length + 1)
            );
          }
          if (replyText) {
            const assistantTurn: DialogueTurn = {
              role: "assistant",
              message: replyText,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            const nextFullDialogue = [...updatedDialogue, assistantTurn];
            updateDialogue(nextFullDialogue);
            setAiMessage(replyText);
            addToSessionArchive({
              speaker: "AI",
              text: replyText,
              timestamp: assistantTurn.timestamp || now,
            });

            setIsThinking(false);
            isThinkingRef.current = false;
            speakAiResponse(replyText);
            return;
          }
        }
        let errDetail = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson?.detail) {
            errDetail = String(errJson.detail);
          }
        } catch {}
        throw new Error(errDetail);
      } catch (err) {
        const rawErr =
          typeof err === "string"
            ? err
            : err instanceof Error
            ? `${err.name}: ${err.message}`
            : "Sunucu bağlantı hatası";
        const isAbortOrTimeout =
          err === "timeout" ||
          (err instanceof Error && err.name === "AbortError") ||
          rawErr.toLowerCase().includes("abort") ||
          rawErr.toLowerCase().includes("timeout");

        console.warn("Speaking respond error:", rawErr);
        isAiSpeakingRef.current = false;
        isThinkingRef.current = false;
        setIsAiSpeaking(false);
        setIsThinking(false);

        const isLocalBackend =
          API_BASE.includes("127.0.0.1") || API_BASE.includes("localhost");
        const isUnreachable =
          rawErr.toLowerCase().includes("failed to fetch") ||
          rawErr.toLowerCase().includes("networkerror") ||
          rawErr.toLowerCase().includes("load failed") ||
          rawErr.toLowerCase().includes("err_connection_refused");

        if (isLocalBackend && (isAbortOrTimeout || isUnreachable)) {
          setMicError(t("speak_backend_down", "Yerel backend (Port 8000) yanıt vermiyor"));
        } else if (isAbortOrTimeout) {
          setMicError(t("speak_server_waking", "Sunucu uyanıyor, tekrar deneyebilirsin..."));
        } else {
          const cleanErr = err instanceof Error ? err.message : t("speak_backend_down", "Sunucu bağlantı hatası");
          setMicError(cleanErr);
        }

        if (sessionStateRef.current === "active") {
          setTimeout(() => {
            if (sessionStateRef.current === "active" && !isAiSpeakingRef.current) {
              startListening();
            }
          }, 900);
        }
      } finally {
        setIsThinking(false);
        isThinkingRef.current = false;
      }
    },
    [
      stripAiEchoFromUserText,
      stopListening,
      addToSessionArchive,
      updateDialogue,
      deckTargetWords,
      storyContext,
      activeStoryTitle,
      isAlex,
      activeLevel,
      speakAiResponse,
    ]
  );

  useEffect(() => {
    sendMessageRef.current = handleSendTranscript;
  }, [handleSendTranscript]);

  // ---------------------------------------------------------------------------
  // 🎛️ TEK TIKLA SOHBETİ BAŞLATMA & BİTİRME (handleStartChat / handleEndChat)
  // ---------------------------------------------------------------------------

  const handleStartChat = async () => {
    setMicError(null);
    isAiSpeakingRef.current = false;
    isThinkingRef.current = false;

    try {
      // Tarayıcı mikrofon iznini doğrula ve mikrofonu SpeechRecognition için hemen serbest bırak
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setMicError(t("speak_mic_denied", "Mikrofon erişimi engellendi, lütfen tarayıcı iznini açın."));
      return;
    }

    setSessionState("active");
    sessionStateRef.current = "active";

    const firstGreeting = openingGreeting;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAiMessage(firstGreeting);
    addToSessionArchive({ speaker: "AI", text: firstGreeting, timestamp: now });
    updateDialogue([{ role: "assistant", message: firstGreeting, timestamp: now }]);

    speakAiResponse(firstGreeting);
  };

  const handleEndChat = async () => {
    if (isGeneratingSummary) return;

    stopListening();
    if (restartListenTimerRef.current) {
      clearTimeout(restartListenTimerRef.current);
      restartListenTimerRef.current = null;
    }
    if (audioFailsafeTimerRef.current) {
      clearTimeout(audioFailsafeTimerRef.current);
      audioFailsafeTimerRef.current = null;
    }
    if (speechWatchIntervalRef.current) {
      clearInterval(speechWatchIntervalRef.current);
      speechWatchIntervalRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    isAiSpeakingRef.current = false;
    isThinkingRef.current = false;
    setIsAiSpeaking(false);
    setIsThinking(false);

    const userTurnCount = dialogueRef.current.filter((d) => d.role === "user").length;
    if (userTurnCount >= 3) {
      rewardSpeakingSessionComplete(userTurnCount);
    }

    const turnsToSave =
      sessionArchiveRef.current.length > 0
        ? sessionArchiveRef.current
        : dialogueRef.current.map((d) => ({
            speaker: d.role === "assistant" ? ("AI" as const) : ("Sen" as const),
            text: d.message,
            timestamp: d.timestamp,
          }));

    if (typeof window !== "undefined" && turnsToSave.length > 0) {
      try {
        const existingRaw = localStorage.getItem("vocaship_speaking_archives");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const newEntry = {
          id: Date.now().toString(),
          title: activeStoryTitle
            ? t("speak_story_discussion_title", "Hikaye Tartışması: {title}", { title: activeStoryTitle })
            : "Gemini Speaking",
          created_at: new Date().toISOString(),
          turns: turnsToSave,
        };
        localStorage.setItem(
          "vocaship_speaking_archives",
          JSON.stringify([newEntry, ...(Array.isArray(existing) ? existing : [])])
        );
      } catch {}
    }

    saveSpeakingArchiveSession({
      user_id: user?.id,
      session_title: activeStoryTitle
        ? t("speak_story_discussion_title", "Hikaye Tartışması: {title}", { title: activeStoryTitle })
        : "Gemini Speaking",
      transcript: dialogueRef.current.map((d) => ({
        sender: d.role === "assistant" ? ("ai" as const) : ("user" as const),
        text: d.message,
        timestamp: d.timestamp,
      })),
      metrics: {
        fluency: 92,
        vocabulary: 90,
        grammar: 90,
        overall_score: 91,
        level: activeLevel,
      },
    }).catch(() => {});

    setIsGeneratingSummary(true);
    setWordsSavedMessage(null);

    const userLines = dialogueRef.current
      .filter((d) => d.role === "user" && d.message.trim())
      .map((d) => d.message.trim());
    const longestUser =
      userLines.sort((a, b) => b.length - a.length)[0] ||
      "I enjoyed practicing English today.";

    const localFallbackSummary: SpeakingSummaryData = {
      session_title: activeStoryTitle
        ? `Discussing ${activeStoryTitle.slice(0, 24)}`
        : "Everyday English Chat",
      fluency_score: Math.min(94, Math.max(74, 75 + userLines.length * 4)),
      coach_feedback: t(
        "speak_coach_fallback",
        "Konuşma pratiğine aktif olarak katılman harika! Her oturumda cümlelerin daha akıcı ve doğal hale geliyor."
      ),
      golden_sentence: {
        original: longestUser,
        improved: `Honestly, ${longestUser.charAt(0).toLowerCase() + longestUser.slice(1)}`,
        reason_tr: t(
          "speak_golden_reason_fallback",
          "Cümleye 'Honestly' gibi doğal bir konuşma bağlacı eklemek akıcılığı artırır."
        ),
      },
      extracted_words: [
        {
          word: "highlight",
          turkish_meaning: "en güzel an / öne çıkan nokta",
          example_sentence: "The highlight of my day was having a great conversation.",
        },
        {
          word: "perspective",
          turkish_meaning: "bakış açısı",
          example_sentence: "Hearing your perspective made the topic much clearer.",
        },
        {
          word: "consistent",
          turkish_meaning: "istikrarlı, düzenli",
          example_sentence: "Consistent speaking practice helps build strong confidence.",
        },
      ],
    };

    try {
      const decksUrl = user?.id
        ? `${API_BASE}/api/v1/decks?user_id=${encodeURIComponent(user.id)}`
        : `${API_BASE}/api/v1/decks`;

      const [summaryRes, decksRes] = await Promise.all([
        resilientFetch(`${API_BASE}/api/v1/speaking/summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: dialogueRef.current,
            target_level: activeLevel,
            story_title: activeStoryTitle,
          }),
        }).catch(() => null),
        resilientFetch(decksUrl).catch(() => null),
      ]);

      let finalSummary: SpeakingSummaryData = localFallbackSummary;
      if (summaryRes && summaryRes.ok) {
        const data = await summaryRes.json();
        if (data && data.session_title) {
          finalSummary = data;
        }
      }

      if (decksRes && decksRes.ok) {
        const decksJson = await decksRes.json();
        if (Array.isArray(decksJson)) {
          setUserDecks(decksJson);
          if (decksJson.length > 0) {
            setSelectedTargetDeckId(decksJson[0].id);
          } else {
            setSelectedTargetDeckId("__new__");
          }
        }
      }

      const initialChecks: Record<string, boolean> = {};
      for (const w of finalSummary.extracted_words || []) {
        if (w.word) initialChecks[w.word] = true;
      }
      setSelectedSummaryWords(initialChecks);
      setSummaryModalData(finalSummary);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const speakSentencePreview = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleSaveSelectedWordsToDeck = async () => {
    if (!summaryModalData || isSavingWords) return;
    const chosenWords = (summaryModalData.extracted_words || []).filter(
      (w) => selectedSummaryWords[w.word]
    );
    if (chosenWords.length === 0) {
      setWordsSavedMessage(t("speak_pick_at_least_one", "Lütfen en az bir kelime seçin."));
      return;
    }

    setIsSavingWords(true);
    setWordsSavedMessage(null);
    try {
      let targetDeckId = selectedTargetDeckId;
      if (!targetDeckId || targetDeckId === "__new__") {
        const existingPractice = userDecks.find(
          (d) => d.title.toLowerCase() === "speaking pratikleri"
        );
        if (existingPractice) {
          targetDeckId = existingPractice.id;
        } else {
          const createRes = await resilientFetch(`${API_BASE}/api/v1/decks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: t("speak_practice_deck_name", "Speaking Pratikleri"),
              description: t("speak_practice_deck_desc", "Speaking Lounge oturumlarından kaydedilen kelimeler"),
              user_id: user?.id || null,
            }),
          });
          if (!createRes.ok) {
            throw new Error(t("speak_deck_create_failed", "Deste oluşturulamadı."));
          }
          const createdDeck = await createRes.json();
          targetDeckId = createdDeck.id;
          setUserDecks((prev) => [createdDeck, ...prev]);
          setSelectedTargetDeckId(createdDeck.id);
        }
      }

      let savedCount = 0;
      for (const item of chosenWords) {
        const res = await resilientFetch(`${API_BASE}/api/v1/decks/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deck_id: targetDeckId,
            word: item.word,
            phonetic: null,
            meanings: [
              {
                part_of_speech: "",
                translation: item.turkish_meaning,
                definition: "",
              },
            ],
            example_sentences: item.example_sentence
              ? [{ en: item.example_sentence, tr: "" }]
              : [],
            collocations: [],
          }),
        });
        if (res.ok) {
          savedCount++;
        }
      }

      if (savedCount > 0) {
        setWordsSavedMessage(t("speak_words_saved_count", "{count} kelime desteye başarıyla eklendi!", { count: savedCount }));
      } else {
        setWordsSavedMessage(t("speak_words_save_failed", "Kelimeler kaydedilemedi, lütfen tekrar deneyin."));
      }
    } catch {
      setWordsSavedMessage(t("speak_deck_connect_error", "Desteye bağlanırken bir hata oluştu."));
    } finally {
      setIsSavingWords(false);
    }
  };

  const handleResetFromSummaryModal = () => {
    setSummaryModalData(null);
    setWordsSavedMessage(null);
    updateDialogue([]);
    setSessionArchive([]);
    sessionArchiveRef.current = [];
    setUserTranscript("");
    setAiMessage("");
    setSessionSeconds(0);
    setSessionState("idle");
    sessionStateRef.current = "idle";
  };

  const handleExitStoryMode = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("vocaship_active_story_context");
      sessionStorage.removeItem("active_story_context");
    }
    setStoryContext(null);
    setStoryOpeningQuestion("");
    router.replace("/speaking");
  };

  // Unmount Temizliği
  useEffect(() => {
    return () => {
      stopListening();
      if (audioFailsafeTimerRef.current) {
        clearTimeout(audioFailsafeTimerRef.current);
      }
      if (speechWatchIntervalRef.current) {
        clearInterval(speechWatchIntervalRef.current);
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, [stopListening]);

  useEffect(() => {
    const activePrompt = aiMessage || openingGreeting;
    if (!activePrompt) return;
    if (backendHintsForMessageRef.current && backendHintsForMessageRef.current === activePrompt) {
      return;
    }
    setDynamicHints(
      buildContextualHints(activePrompt, activeStoryTitle, activeLevel, dialogue.length)
    );
  }, [aiMessage, openingGreeting, activeStoryTitle, activeLevel, dialogue.length]);

  const activeStarterPhrases = dynamicHints;

  const isAvatarImageUrl =
    syncedProfile.avatarUrl.startsWith("http") ||
    syncedProfile.avatarUrl.startsWith("/");

  return (
    <div
      className={`h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] w-full overflow-hidden flex flex-col justify-between relative px-4 py-3 select-none transition-colors duration-200 ${
        isDark ? "bg-[#0B0F19] text-slate-100" : "bg-[#dce3ec] text-slate-900"
      }`}
    >
      {/* 🌟 Arka Plan Ambient Radyal Işık Parıltısı */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-700 blur-[130px] ${
          isDark ? "opacity-40" : "opacity-25"
        } ${
          isAiSpeaking
            ? "bg-gradient-to-b from-blue-600/40 via-indigo-800/30 to-transparent"
            : isListening
            ? "bg-gradient-to-b from-emerald-700/40 via-teal-900/30 to-transparent"
            : isThinking
            ? "bg-gradient-to-b from-amber-700/30 via-indigo-900/30 to-transparent"
            : isDark
            ? "bg-gradient-to-b from-slate-900/30 via-slate-950 to-transparent"
            : "bg-gradient-to-b from-indigo-300/40 to-transparent"
        }`}
      />

      {/* ========================================================================= */}
      {/* ÜST YÜZEN KONTROLLER: SOL ÜST (TAM EKRAN + GEÇMİŞ + HİKAYE)               */}
      {/* ========================================================================= */}
      <div className="absolute left-4 sm:left-6 top-4 z-30 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`px-3.5 py-2 rounded-full border shadow-sm text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
            isDark
              ? "bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700/70"
              : "bg-white/90 hover:bg-white text-slate-900 border-slate-200/80"
          }`}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className={`w-3.5 h-3.5 ${isDark ? "text-cyan-400" : "text-cyan-700"}`} />
              <span>{t("speak_exit_fullscreen", "🗗 Küçült")}</span>
            </>
          ) : (
            <>
              <Maximize2 className={`w-3.5 h-3.5 ${isDark ? "text-cyan-400" : "text-cyan-700"}`} />
              <span>{t("speak_fullscreen", "⛶ Tam Ekran")}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            loadSavedArchives();
            setIsHistoryOpen(true);
          }}
          className={`px-3.5 py-2 rounded-full border shadow-sm text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
            isDark
              ? "bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700/70"
              : "bg-white/90 hover:bg-white text-slate-900 border-slate-200/80"
          }`}
        >
          <History className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-indigo-700"}`} />
          <span>{t("speak_history", "📜 Geçmiş")}</span>
        </button>

        {activeStoryTitle && (
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md shadow-sm ${
              isDark
                ? "bg-slate-900/80 border-violet-500/30 text-violet-300"
                : "bg-[#f8fafc] border-violet-300 text-violet-900"
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-violet-400" : "text-violet-700"}`} />
            <span className="truncate max-w-[140px]">{activeStoryTitle}</span>
            {isStoryLevelLocked && (
              <span
                className={`px-1.5 py-0.5 rounded-full border text-[10px] font-bold ${
                  isDark
                    ? "bg-violet-500/20 border-violet-400/40 text-violet-200"
                    : "bg-violet-100 border-violet-300 text-violet-800"
                }`}
              >
                🔒 {activeLevel}
              </span>
            )}
            <button
              type="button"
              onClick={handleExitStoryMode}
              className={`ml-1 text-[10px] font-bold cursor-pointer ${isDark ? "text-slate-400 hover:text-rose-300" : "text-slate-500 hover:text-rose-700"}`}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SADE 3 KATMANLI MERKEZ SAHNE                                              */}
      {/* ========================================================================= */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center gap-5 max-w-3xl mx-auto w-full text-center min-h-0">
        {micError && (
          <div className={`px-4 py-2 rounded-2xl border text-xs font-medium shadow-xl max-w-md ${isDark ? "bg-rose-950/70 border-rose-800 text-rose-200" : "bg-rose-100 border-rose-300 text-rose-900"}`}>
            ⚠️ {micError}
          </div>
        )}

        {/* KATMAN 1: ÜST-ORTA AKTİF DİYALOG */}
        <div className="w-full flex flex-col items-center justify-center gap-2">
          <div className="flex flex-col items-center gap-2 max-w-2xl">
            <p
              className={`max-w-2xl px-6 py-4 text-lg md:text-xl font-semibold text-center leading-relaxed tracking-tight rounded-3xl border ${
                isDark
                  ? "bg-slate-900/90 border-slate-800 text-white shadow-lg"
                  : "bg-[#f8fafc] border-slate-300 text-slate-900 shadow-md"
              }`}
            >
              &ldquo;{aiMessage || openingGreeting}&rdquo;
            </p>
            {sessionState === "active" && (
              <button
                type="button"
                onClick={() => speakAiResponse(aiMessage || openingGreeting)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm ${
                  isDark
                    ? "bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-indigo-300"
                    : "bg-[#f8fafc] hover:bg-indigo-50 border-slate-300 text-indigo-700"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t("speak_listen_again", "Tekrar Dinle")}</span>
              </button>
            )}
          </div>

          {sessionState === "active" && (
            <div
              className={`w-full max-w-xl px-4 py-2 rounded-2xl border backdrop-blur-md shadow-sm ${
                isDark
                  ? "bg-slate-900/90 border-indigo-500/25"
                  : "bg-[#f8fafc] border-slate-300"
              }`}
            >
              {userTranscript ? (
                <p className={`text-sm font-medium ${isDark ? "text-indigo-200" : "text-slate-800"}`}>
                  <span className={`font-semibold mr-1.5 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>{t("speak_you_prefix", "🎙️ Sen:")}</span>
                  <span className={isDark ? "text-slate-100" : "text-slate-900"}>{userTranscript}</span>
                </p>
              ) : (
                <p className={`text-xs italic ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {t("speak_listening_prompt", "🎙️ Seni dinliyorum, İngilizce konuşmaya başlayabilirsin...")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* KATMAN 2: MERKEZ MİKROFON & AKILLI İPUCU KÖPRÜSÜ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          {sessionState === "idle" ? (
            <button
              type="button"
              onClick={handleStartChat}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full transition-all duration-500 flex flex-col items-center justify-center relative cursor-pointer shadow-2xl active:scale-95 bg-gradient-to-tr from-indigo-900 via-indigo-600 to-violet-500 hover:scale-105 shadow-indigo-600/40 ring-4 ring-indigo-400/30"
            >
              <Mic className="w-8 h-8 mb-1.5 text-white animate-bounce" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide px-2 leading-tight">
                {t("speak_start_chat", "🎙️ Sohbete Başla")}
              </span>
            </button>
          ) : (
            <div className="relative flex items-center justify-center">
              {isListening && (
                <div
                  className="absolute rounded-full border border-emerald-400/40 transition-transform duration-75 pointer-events-none"
                  style={{
                    width: "168px",
                    height: "168px",
                    transform: `scale(${1 + micVolume * 0.005})`,
                    boxShadow: `0 0 ${22 + micVolume * 0.5}px rgba(16, 185, 129, 0.35)`,
                  }}
                />
              )}

              {isAiSpeaking && (
                <div
                  className="absolute rounded-full border border-indigo-400/35 pointer-events-none animate-ping"
                  style={{
                    width: "160px",
                    height: "160px",
                    animationDuration: "2.3s",
                  }}
                />
              )}

              <button
                type="button"
                onClick={() => {
                  if (isAiSpeaking) {
                    interruptAi();
                  }
                }}
                disabled={!isAiSpeaking}
                className={`w-32 h-32 md:w-36 md:h-36 rounded-full transition-all duration-500 flex flex-col items-center justify-center relative shadow-2xl select-none ${
                  isAiSpeaking
                    ? "cursor-pointer active:scale-95 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-500/60 ring-4 ring-indigo-400/50 animate-pulse"
                    : isThinking
                    ? "bg-gradient-to-tr from-amber-600 via-indigo-600 to-purple-600 shadow-purple-500/50 ring-4 ring-purple-400/40"
                    : "bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 shadow-emerald-500/50 ring-4 ring-emerald-400/40"
                }`}
              >
                {isAiSpeaking ? (
                  <div className="flex flex-col items-center justify-center p-2">
                    <Volume2 className="w-7 h-7 mb-1 text-white animate-pulse" />
                    <span className="whitespace-normal text-center leading-tight px-2 text-xs font-semibold text-white">
                      {t("speak_ai_speaking", "🔊 Konuşuyor...")}
                    </span>
                    <span className="text-[10px] text-indigo-200 mt-0.5">
                      {t("speak_tap_interrupt", "(Söz kesmek için dokun)")}
                    </span>
                  </div>
                ) : isThinking ? (
                  <div className="flex flex-col items-center justify-center p-2">
                    <Loader2 className="w-7 h-7 mb-1 text-white animate-spin" />
                    <span className="whitespace-normal text-center leading-tight px-2 text-xs font-semibold text-white">
                      {t("speak_thinking", "Düşünüyor...")}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2">
                    <Mic className="w-7 h-7 mb-1 text-white" />
                    <span className="whitespace-normal text-center leading-tight px-2 text-xs font-semibold text-white">
                      {t("speak_listening", "🟢 Seni Dinliyorum...")}
                    </span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Akıllı İpucu Köprüsü Butonu */}
          <button
            type="button"
            onClick={() => setIsHintBoxOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-sm ${
              isHintBoxOpen
                ? "bg-amber-300 border-amber-400 text-amber-950"
                : "bg-amber-300/90 hover:bg-amber-300 border-amber-500/40 text-amber-950"
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-900" />
            <span>{t("speak_what_to_say", "Ne Diyebilirim?")}</span>
          </button>
        </div>

        {/* Açılır Fısıltı İpucu Kutusu (2 Hazır Cümle Başlatıcı Kalıp) */}
        {isHintBoxOpen && (
          <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {activeStarterPhrases.map((phrase, idx) => (
              <div
                key={idx}
                className={`px-3.5 py-2 rounded-2xl border text-xs shadow-md ${
                  isDark
                    ? "bg-slate-900/90 border-amber-500/35 text-amber-100"
                    : "bg-[#f8fafc] border-amber-300 text-slate-900"
                }`}
              >
                <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                  {idx === 0 ? t("speak_tip_1", "İpucu 1") : t("speak_tip_2", "İpucu 2")}
                </span>
                <span className="font-medium leading-snug">&ldquo;{phrase}&rdquo;</span>
              </div>
            ))}
          </div>
        )}

        {/* 🎯 Hedef Kelime Avcısı (Kompakt Takip Şeridi) */}
        {targetWordsList.length > 0 && (
          <div
            className={`w-full max-w-xl px-3 py-1.5 rounded-2xl border flex items-center justify-center flex-wrap gap-1.5 shadow-sm ${
              isDark
                ? "bg-slate-900/90 border-slate-800"
                : "bg-[#f8fafc] border-slate-300"
            }`}
          >
            <span className={`text-[11px] font-bold mr-1 ${isDark ? "text-amber-300" : "text-amber-800"}`}>
              🎯 {huntedTargetWords.size}/{targetWordsList.length}
            </span>
            {targetWordsList.map((word) => {
              const isHunted = huntedTargetWords.has(word);
              return (
                <span
                  key={word}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                    isHunted
                      ? isDark
                        ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-200"
                        : "bg-emerald-100 border-emerald-400 text-emerald-900"
                      : isDark
                      ? "bg-slate-950/80 border-slate-700/70 text-slate-300"
                      : "bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                >
                  {isHunted ? `✓ ${word}` : word}
                </span>
              );
            })}
          </div>
        )}

        {/* KATMAN 3: ALT KOMPAKT KONUŞMA AKIŞI (text-xs) */}
        {dialogue.length > 0 && (
          <div
            className={`w-full max-w-xl px-3.5 py-2 rounded-2xl border text-xs max-h-20 overflow-y-auto text-left space-y-1 backdrop-blur-sm shadow-sm ${
              isDark
                ? "bg-slate-900/90 border-slate-800 text-slate-200"
                : "bg-[#f8fafc] border-slate-300 text-slate-900"
            }`}
          >
            {dialogue.slice(-6).map((turn, idx) => (
              <div key={idx} className="leading-relaxed">
                <span
                  className={`font-bold mr-1.5 ${
                    turn.role === "assistant"
                      ? isDark ? "text-indigo-400" : "text-indigo-700"
                      : isDark ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  {turn.role === "assistant" ? "AI:" : "Sen:"}
                </span>
                <span>{turn.message}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* EN ALT BAR: YALNIZCA AKTİFKEN [ 🔴 Sohbeti Bitir ] BUTONU                 */}
      {/* ========================================================================= */}
      {sessionState === "active" && (
        <footer
          className={`relative z-20 w-full px-4 pt-2 pb-1 flex items-center justify-center border-t shrink-0 backdrop-blur-md ${
            isDark ? "border-slate-900/70" : "border-slate-300/80"
          }`}
        >
          <button
            type="button"
            onClick={handleEndChat}
            disabled={isGeneratingSummary}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border font-bold text-sm transition active:scale-95 cursor-pointer shadow-md disabled:opacity-70 ${
              isDark
                ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-500/40 shadow-rose-950/40"
                : "bg-rose-600 hover:bg-rose-700 text-white border-rose-700"
            }`}
          >
            {isGeneratingSummary ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("speak_preparing_card", "Karne Hazırlanıyor...")}</span>
              </>
            ) : (
              <span>{t("speak_end_chat", "🔴 Sohbeti Bitir")}</span>
            )}
          </button>
        </footer>
      )}

      {/* ========================================================================= */}
      {/* GEÇMİŞ ARŞİV ÇEKMECESİ / MODALI                                           */}
      {/* ========================================================================= */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/75 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">{t("speak_history_title", "Konuşma Geçmişi")}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-left">
              {savedArchives.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">
                  {t("speak_history_empty", "Henüz kaydedilmiş bir konuşma oturumu bulunmuyor.")}
                </p>
              ) : (
                savedArchives.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-300 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(item.created_at).toLocaleDateString(language === "tr" ? "tr-TR" : language)}
                      </span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto text-xs text-slate-300">
                      {(item.turns || []).map((turn, tIdx) => (
                        <p key={tIdx} className="leading-snug">
                          <span
                            className={`font-semibold mr-1 ${
                              turn.speaker === "AI" ? "text-indigo-400" : "text-emerald-400"
                            }`}
                          >
                            {turn.speaker === "AI" ? t("speak_ai_prefix", "AI:") : t("speak_user_prefix", "Sen:")}
                          </span>
                          <span>{turn.text}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FAZ 4: OTURUM SONU KARNESİ, ALTIN CÜMLE & DESTEYE KELİME KAYIT MODALI     */}
      {/* ========================================================================= */}
      {summaryModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 border border-slate-700/70 shadow-2xl p-6 text-left space-y-5">
            {/* Üst Başlık & Puan Rozeti */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {t("speak_scorecard_title", "Oturum Sonu Karnesi")}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {summaryModalData.session_title}
                </h2>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-center">
                  <span className="block text-[10px] font-semibold text-emerald-300">
                    {t("speak_fluency_label", "Akıcılık")} ({activeLevel})
                  </span>
                  <span className="text-lg font-extrabold text-emerald-200">
                    {summaryModalData.fluency_score}/100
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFromSummaryModal}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  aria-label={t("close", "Kapat")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Koç Yorumu */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-indigo-300">{t("speak_coach_feedback", "Koç Yorumu")}</span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {summaryModalData.coach_feedback}
              </p>
            </div>

            {/* ✨ Altın Cümle Kartı */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950/80 to-emerald-500/10 border border-amber-400/35 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>{t("speak_golden_sentence", "Altın Cümle Önerisi")}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speakSentencePreview(summaryModalData.golden_sentence.improved)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold transition cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t("speak_listen_btn", "Dinle")}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 line-through">
                &ldquo;{summaryModalData.golden_sentence.original}&rdquo;
              </p>
              <p className="text-sm sm:text-base font-semibold text-emerald-300">
                &ldquo;{summaryModalData.golden_sentence.improved}&rdquo;
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {summaryModalData.golden_sentence.reason_tr}
              </p>
            </div>

            {/* 📚 Oturum Kelimeleri (Onay Kutulu Liste) & Hedef Deste Seçici */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200">
                  📚 {t("speak_session_words", "Oturum Kelimeleri")}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t("speak_select_words_hint", "Desteye eklemek istediklerini seç")}
                </span>
              </div>

              <div className="space-y-2">
                {(summaryModalData.extracted_words || []).map((item) => {
                  const isChecked = Boolean(selectedSummaryWords[item.word]);
                  return (
                    <label
                      key={item.word}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                        isChecked
                          ? "bg-indigo-950/40 border-indigo-500/40"
                          : "bg-slate-950/50 border-slate-800/80 opacity-70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedSummaryWords((prev) => ({
                            ...prev,
                            [item.word]: !prev[item.word],
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">
                            {item.word}
                          </span>
                          <span className="text-xs text-emerald-300 font-medium">
                            — {item.turkish_meaning}
                          </span>
                        </div>
                        {item.example_sentence && (
                          <p className="text-xs text-slate-400 mt-0.5 italic">
                            &ldquo;{item.example_sentence}&rdquo;
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                <select
                  value={selectedTargetDeckId}
                  onChange={(e) => setSelectedTargetDeckId(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="__new__">{t("speak_new_deck_opt", "Yeni Deste: Speaking Pratikleri")}</option>
                  {userDecks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleSaveSelectedWordsToDeck}
                  disabled={isSavingWords}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isSavingWords ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookPlus className="w-4 h-4" />
                  )}
                  <span>{t("speak_add_words_btn", "Seçilen Kelimeleri Desteye Ekle")}</span>
                </button>
              </div>

              {wordsSavedMessage && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-200 text-xs font-semibold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{wordsSavedMessage}</span>
                </div>
              )}
            </div>

            {/* Alt Aksiyon */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleResetFromSummaryModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t("speak_new_chat_btn", "Yeni Sohbet Başlat")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpeakingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-76px)] bg-[#0B0F19] text-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SpeakingContent />
    </Suspense>
  );
}
