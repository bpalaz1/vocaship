"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  Loader2,
  Lightbulb,
  ScrollText,
  X,
  BookmarkPlus,
  CheckCircle2,
  Trophy,
  Clock,
  MessageCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { API_BASE } from "../config";
import { ALL_STORIES } from "../data/stories";
import { useAuth } from "../context/AuthContext";
import { usePersona } from "../context/PersonaContext";
import { useProfile } from "../context/ProfileContext";
import SettingsModal from "../components/settings/SettingsModal";
import { NEURAL_VOICES } from "../utils/ttsVoices";
import { addPendingGold } from "../utils/pendingGold";
import {
  getActiveDeckId,
  setActiveDeckId,
  fetchDecksList,
  getActiveDeckCards,
  subscribeToActiveDeck,
  GameWordPair,
} from "../utils/activeDeckStore";
import {
  saveSpeakingArchiveSession,
  getSpeakingArchives,
  SpeakingArchiveItem,
} from "../actions/speakingArchive";

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

function SpeakingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedCharacter, characterVoice } = usePersona();
  const searchParams = useSearchParams();

  // URL Parametreleri
  const storyParam = searchParams.get("story");
  const storyIdParam = searchParams.get("storyId");
  const titleParam = searchParams.get("title");
  const storyTitleParam = searchParams.get("story_title");
  const levelParam = searchParams.get("level");

  // 1. Merkezi Profil Yönetimi
  const { userProfile, isSettingsModalOpen, setIsSettingsModalOpen } = useProfile();
  const currentUsername = userProfile?.username || user?.username || "bpal";
  const planTier: "basic" | "plus" | "pro" =
    user?.planTier ||
    userProfile?.planTier ||
    userProfile?.plan_tier ||
    (user?.isPro ? "pro" : "basic");

  // Seviye Belirleme (URL'den level varsa öncelikli: Level Sync)
  const [currentLevel, setCurrentLevel] = useState<string>(() => {
    return (levelParam || userProfile?.study_level || "A1").toUpperCase();
  });

  // Ses Seçimi
  const isAlex = selectedCharacter === "alex_adult";

  // 2. Açılış Kapıları (Kapı 1: Serbest Giriş vs Kapı 2: Hikayeden Giriş)
  const isFromStory = Boolean(storyIdParam || titleParam || storyTitleParam || storyParam);
  const detectedStoryTitle = titleParam || storyTitleParam || storyParam || "";

  // Saate Duyarlı Sıcak Selamlama (Kapı 1)
  const timeAwareGreeting = useMemo(() => {
    const currentHour = new Date().getHours();
    return currentHour >= 5 && currentHour < 12
      ? "Good morning! Got your coffee ready? How is your day starting?"
      : "Hey there! How was your day today?";
  }, []);

  const [activeStoryTitle, setActiveStoryTitle] = useState<string | null>(detectedStoryTitle || null);
  const [aiMessage, setAiMessage] = useState<string>(() => {
    if (isFromStory && detectedStoryTitle) {
      return `Whoa! We just finished "${detectedStoryTitle}"! Did that ending surprise you?`;
    }
    return timeAwareGreeting;
  });

  const [dialogue, setDialogue] = useState<DialogueTurn[]>(() => [
    {
      role: "assistant",
      message: isFromStory && detectedStoryTitle
        ? `Whoa! We just finished "${detectedStoryTitle}"! Did that ending surprise you?`
        : timeAwareGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const debateInitRef = useRef<string | null>(null);

  // Gerçek Tarayıcı Tam Ekran Kontrolü (Full-Viewport + Browser Fullscreen)
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);
  const [isInitializingStory, setIsInitializingStory] = useState(false);

  // Canlı STT & Ses Durumları
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [fluencyHint, setFluencyHint] = useState<string>("");

  // Konuşma Oturumu Yaşam Döngüsü ('idle' | 'active' | 'finished')
  const [sessionState, setSessionState] = useState<"idle" | "active" | "finished">("idle");

  // Aktif Nöral Mentor Bilgisi (Edge-TTS)
  const [activeVoiceId, setActiveVoiceId] = useState<string>("en-US-JennyNeural");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("vocaship_neural_voice");
      if (v) setActiveVoiceId(v);

      const handleVoiceChange = () => {
        const updated = localStorage.getItem("vocaship_neural_voice");
        if (updated) setActiveVoiceId(updated);
      };
      window.addEventListener("vocaship-voice-change", handleVoiceChange);
      return () => window.removeEventListener("vocaship-voice-change", handleVoiceChange);
    }
  }, []);

  const activeMentor = useMemo(() => {
    return NEURAL_VOICES.find((v) => v.id === activeVoiceId) || NEURAL_VOICES[0];
  }, [activeVoiceId]);

  const activeMentorName = useMemo(() => {
    return activeMentor.name.split(" ")[0] || "Jenny";
  }, [activeMentor]);

  // 3'lü Cümle Gösterim Modu ('flow' | 'text' | 'focus')
  const [displayMode, setDisplayMode] = useState<"flow" | "text" | "focus">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vocaship_speaking_display_mode");
      if (saved === "flow" || saved === "text" || saved === "focus") {
        return saved;
      }
      if (saved === "karaoke") return "flow";
      if (saved === "full") return "text";
      if (saved === "blind") return "focus";
    }
    return "flow";
  });

  const [karaokeWordIdx, setKaraokeWordIdx] = useState<number>(-1);
  const karaokeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Arka Plan Konuşma Arşivi
  const [sessionArchive, setSessionArchive] = useState<SessionArchiveTurn[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("vocaship_speaking_archives");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const handleSelectDisplayMode = (mode: "flow" | "text" | "focus") => {
    setDisplayMode(mode);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vocaship_speaking_display_mode", mode);
      } catch {}
    }
  };

  const addToSessionArchive = useCallback((turn: SessionArchiveTurn) => {
    setSessionArchive((prev) => {
      const updated = [...prev, turn];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("vocaship_speaking_archives", JSON.stringify(updated));
        } catch (e) {
          console.warn("Session archive save error:", e);
        }
      }
      return updated;
    });
  }, []);

  // Oturum Süresi & Sayaç (Yalnızca aktif oturumda çalışır)
  const [sessionSeconds, setSessionSeconds] = useState(0);

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

  // Pratik Edilen Kelimeler ve Aktif Deste Hedefleri
  const [capturedWords, setCapturedWords] = useState<string[]>([]);
  const [deckTargetWords, setDeckTargetWords] = useState<GameWordPair[]>([]);
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [isSavingWords, setIsSavingWords] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [deckSaveToast, setDeckSaveToast] = useState<string | null>(null);

  // Kelimenin aktif deste hedeflerinde olup olmadığını kontrol eden yardımcı
  const isWordTarget = useCallback(
    (wordStr: string) => {
      const clean = wordStr.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!clean) return false;
      return (
        deckTargetWords.some((tw) => tw.word.toLowerCase() === clean) ||
        capturedWords.includes(clean)
      );
    },
    [deckTargetWords, capturedWords]
  );

  // Modallar ve Çekmeceler
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [archives, setArchives] = useState<SpeakingArchiveItem[]>([]);
  const [isLoadingArchives, setIsLoadingArchives] = useState(false);

  // Ses & Mikrofon Referansları & Donanımsal İzolasyon
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSpokenTextRef = useRef<string>("");
  const isThinkingRef = useRef(false);
  const isAiSpeakingRef = useRef<boolean>(false);
  const cooldownRef = useRef<boolean>(false);
  const latestAiMessageRef = useRef<string>("Hey there! How was your day today?");
  const startContinuousRecognitionRef = useRef<() => void>(() => {});
  const isHandsFreeActiveRef = useRef(true);
  const [isUserMuted, setIsUserMuted] = useState(false);
  const isUserMutedRef = useRef(false);

  // Kullanıcı konuşmaya başladı mı kontrolü
  const hasStartedSpeaking = useMemo(() => {
    return dialogue.some((d) => d.role === "user") || Boolean(transcript.trim()) || Boolean(interimText.trim());
  }, [dialogue, transcript, interimText]);

  // Son kullanıcının söylediği cümle
  const lastUserTurn = useMemo(() => {
    for (let i = dialogue.length - 1; i >= 0; i--) {
      if (dialogue[i].role === "user") {
        return dialogue[i].message;
      }
    }
    return null;
  }, [dialogue]);

  // Akıllı İpucu Fısıltısı
  const activeFluencyHint = useMemo(() => {
    if (fluencyHint && fluencyHint.trim()) {
      return fluencyHint.trim();
    }
    const q = (aiMessage || "").toLowerCase();
    const lvl = (currentLevel || "A1").toUpperCase();

    if (activeStoryTitle) {
      return lvl === "A1" || lvl === "A2"
        ? "In the story, I really liked..."
        : "From my perspective, what happened in the story was...";
    }
    if (q.includes("why") || q.includes("reason")) {
      return lvl === "A1" || lvl === "A2"
        ? "I think so because it makes me happy."
        : "The main reason behind this is...";
    }
    return lvl === "A1" || lvl === "A2"
      ? "Actually, I think that was really fun!"
      : "To be honest, I feel quite positive about that.";
  }, [fluencyHint, aiMessage, currentLevel, activeStoryTitle]);

  const handleApplyHint = (hint: string) => {
    const cleanHint = hint.replace(/^["']|["']$/g, "").trim();
    setTextInput(cleanHint);
    setTranscript(cleanHint);
    currentSpokenTextRef.current = cleanHint;
  };

  /**
   * Yapay zekânın hoparlörden çıkan sesinin mikrofona sızmasını (Acoustic Feedback Loop) engeller.
   * Gelen transcript son AI mesajının içinde geçiyorsa veya kelimelerinin %50'sinden fazlası örtüşüyorsa true döner.
   */
  const isEchoOfAiMessage = useCallback((transcriptText: string, lastAiMessage: string): boolean => {
    if (!transcriptText || !lastAiMessage) return false;

    const cleanTrans = transcriptText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
    const cleanAi = lastAiMessage
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

    if (!cleanTrans || !cleanAi) return false;

    // 1. Doğrudan alt dize (substring) kontrolü
    if (cleanAi.includes(cleanTrans) || cleanTrans.includes(cleanAi)) {
      return true;
    }

    // 2. Kelime bazlı örtüşme (%50 veya daha fazla)
    const transWords = cleanTrans.split(/\s+/).filter(Boolean);
    if (transWords.length === 0) return false;

    const aiWordSet = new Set(cleanAi.split(/\s+/).filter(Boolean));
    let overlapCount = 0;
    for (const word of transWords) {
      if (aiWordSet.has(word)) {
        overlapCount++;
      }
    }

    const overlapRatio = overlapCount / transWords.length;
    return overlapRatio >= 0.5;
  }, []);

  // ⚡ Doğal Kesme (Barge-in): Yapay zeka sesini anında durdur
  const handleBargeIn = useCallback(() => {
    if (karaokeIntervalRef.current) {
      clearInterval(karaokeIntervalRef.current);
      karaokeIntervalRef.current = null;
    }
    setKaraokeWordIdx(9999);
    if (audioRef.current) {
      try {
        audioRef.current.onplay = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
      } catch {}
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    isAiSpeakingRef.current = false;
    setIsAiSpeaking(false);
    cooldownRef.current = false;
    setIsCooldown(false);
    setPlayBlocked(false);
  }, []);

  // 🎙️ Sıfır Fallback: Edge-TTS Nöral Ses Motoru
  const playNeuralAudio = useCallback((text: string) => {
    handleBargeIn();

    const clean = (text || "")
      .replace(/^AI Mentor:\s*/i, "")
      .replace(/^\[.*?\]:\s*/, "")
      .trim();
    if (!clean) return;

    // 1. Donanımsal mikrofon durdurma ve AI konuşuyor kilidi
    isAiSpeakingRef.current = true;
    setIsAiSpeaking(true);
    cooldownRef.current = false;
    setIsCooldown(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Aktif recognition nesnesini abort ederek dinlemeyi donanımsal olarak durdur
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsListening(false);

    const storedVoice =
      typeof window !== "undefined"
        ? localStorage.getItem("vocaship_neural_voice")
        : null;
    const targetVoice = storedVoice || "en-US-JennyNeural";
    const encodedText = encodeURIComponent(clean);
    const baseUrl = API_BASE || "http://127.0.0.1:8000";
    const streamUrl = `${baseUrl}/api/v1/tts/stream?text=${encodedText}&voice=${encodeURIComponent(targetVoice)}&rate=-4%`;

    const audio = new Audio(streamUrl);
    audioRef.current = audio;

    const words = clean.split(/\s+/).filter(Boolean);
    const wordsCount = words.length;

    audio.onplay = () => {
      isAiSpeakingRef.current = true;
      setIsAiSpeaking(true);
      cooldownRef.current = false;
      setIsCooldown(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListening(false);

      // Karaoke Senkronizasyonu Başlat
      setKaraokeWordIdx(0);
      if (karaokeIntervalRef.current) {
        clearInterval(karaokeIntervalRef.current);
      }
      const estimatedTotalMs = Math.max(1200, wordsCount * 330);
      const stepMs = Math.max(120, estimatedTotalMs / Math.max(1, wordsCount));
      let currentWord = 0;
      karaokeIntervalRef.current = setInterval(() => {
        if (
          audioRef.current &&
          audioRef.current.duration &&
          !isNaN(audioRef.current.duration) &&
          audioRef.current.duration > 0
        ) {
          const progress = audioRef.current.currentTime / audioRef.current.duration;
          currentWord = Math.min(wordsCount - 1, Math.floor(progress * wordsCount));
        } else {
          currentWord = Math.min(wordsCount - 1, currentWord + 1);
        }
        setKaraokeWordIdx(currentWord);
      }, stepMs);
    };

    audio.onerror = (e) => {
      console.error("Nöral TTS servisine ulaşılamadı (Port 8000):", e);
      if (karaokeIntervalRef.current) {
        clearInterval(karaokeIntervalRef.current);
        karaokeIntervalRef.current = null;
      }
      setKaraokeWordIdx(9999);
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
      cooldownRef.current = false;
      setIsCooldown(false);
      if (isHandsFreeActiveRef.current && !isUserMutedRef.current) {
        try {
          recognitionRef.current?.start();
        } catch {
          startContinuousRecognitionRef.current();
        }
      }
    };

    audio.onended = () => {
      if (karaokeIntervalRef.current) {
        clearInterval(karaokeIntervalRef.current);
        karaokeIntervalRef.current = null;
      }
      setKaraokeWordIdx(9999);
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
      cooldownRef.current = true;
      setIsCooldown(true);

      // Hoparlör yankısının odada sönümlenmesi için 450 ms bekle (Acoustic Echo Cooldown)
      setTimeout(() => {
        isAiSpeakingRef.current = false;
        cooldownRef.current = false;
        setIsCooldown(false);
        // Eller serbest modda mikrofonu otomatik geri aç
        if (isHandsFreeActiveRef.current && !isUserMutedRef.current) {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            } else {
              startContinuousRecognitionRef.current();
            }
          } catch {
            startContinuousRecognitionRef.current();
          }
        }
      }, 450);
    };

    setPlayBlocked(false);

    audio.play().catch((err) => {
      console.warn("Otomatik oynatma tarayıcı tarafından engellendi:", err);
      if (karaokeIntervalRef.current) {
        clearInterval(karaokeIntervalRef.current);
        karaokeIntervalRef.current = null;
      }
      setKaraokeWordIdx(9999);
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
      cooldownRef.current = false;
      setIsCooldown(false);
      setPlayBlocked(true);
      if (isHandsFreeActiveRef.current && !isUserMutedRef.current) {
        try {
          recognitionRef.current?.start();
        } catch {}
      }
    });
  }, [handleBargeIn]);

  const speakText = playNeuralAudio;

  // Desteleri ve Aktif Hedef Kelimeleri Yükle
  useEffect(() => {
    async function loadDecks() {
      try {
        const data = await fetchDecksList();
        if (Array.isArray(data) && data.length > 0) {
          setDecks(data);
          const activeId = getActiveDeckId() || data[0].id;
          setSelectedDeckId(activeId);
          if (activeId) {
            const cards = await getActiveDeckCards(activeId);
            setDeckTargetWords(cards);
          }
          return;
        }
      } catch (err) {
        console.warn("Deste listesi alınamadı:", err);
      }
      const fallback = [
        { id: "default_speaking_deck", title: "🎙️ Speaking Oturumu Kelimeleri" },
        { id: "preset_c1_pro", title: "💼 Profesyonel Kelimeler" },
      ];
      setDecks(fallback);
      setSelectedDeckId(fallback[0].id);
      const cards = await getActiveDeckCards(fallback[0].id);
      setDeckTargetWords(cards);
    }
    loadDecks();

    const unsubscribe = subscribeToActiveDeck(async (newId) => {
      setSelectedDeckId(newId);
      const cards = await getActiveDeckCards(newId);
      setDeckTargetWords(cards);
    });

    return () => unsubscribe();
  }, []);

  const handleDeckChange = async (newId: string) => {
    setSelectedDeckId(newId);
    setActiveDeckId(newId);
    const cards = await getActiveDeckCards(newId);
    setDeckTargetWords(cards);
  };

  // Geçmiş Arşivleri Çek
  const fetchArchives = useCallback(async () => {
    setIsLoadingArchives(true);
    try {
      const data = await getSpeakingArchives(user?.id);
      setArchives(data || []);
    } catch (e) {
      console.warn("Archives fetch error:", e);
    } finally {
      setIsLoadingArchives(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  // Sayfa Geçişi ve Unmount Temizliği
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // 🌉 Okuma Odası $\to$ Speaking Köprüsü ve Seviye Senkronizasyonu
  useEffect(() => {
    let isCancelled = false;

    async function initStoryDebateBridge() {
      try {
        const rawStoryKey = (storyIdParam || storyParam || "").trim();
        const hasStorySignal = Boolean(rawStoryKey || titleParam || storyTitleParam);

        if (!hasStorySignal) {
          // Doğrudan giriş yapıldıysa ilk selamlama metnini ve arşiv kaydını hazırla (otomatik seslendirme yok)
          const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          latestAiMessageRef.current = timeAwareGreeting;
          addToSessionArchive({
            speaker: "AI",
            text: timeAwareGreeting,
            timestamp: now,
          });
          return;
        }

        const matchedStory = ALL_STORIES.find(
          (s) =>
            (rawStoryKey && s.id.toLowerCase() === rawStoryKey.toLowerCase()) ||
            (rawStoryKey && s.title.toLowerCase() === rawStoryKey.toLowerCase()) ||
            (titleParam && s.title.toLowerCase() === titleParam.trim().toLowerCase()) ||
            (storyTitleParam && s.title.toLowerCase() === storyTitleParam.trim().toLowerCase())
        );

        const finalTitle = titleParam || storyTitleParam || matchedStory?.title || rawStoryKey;
        const finalLevel = (levelParam || matchedStory?.level || (matchedStory as any)?.cefr || "B1").toUpperCase();
        const finalSnippet = matchedStory?.content ? matchedStory.content.slice(0, 1500) : (matchedStory?.desc || "");

        if (!finalTitle) return;
        if (debateInitRef.current === finalTitle) return;
        debateInitRef.current = finalTitle;

        setActiveStoryTitle(finalTitle);
        setCurrentLevel(finalLevel);

        // Sıcak açılış merak sorusu (Kapı 2)
        const warmStoryQuestion = `Whoa! We just finished "${finalTitle}"! Did that ending surprise you?`;

        setAiMessage(warmStoryQuestion);
        latestAiMessageRef.current = warmStoryQuestion;
        addToSessionArchive({
          speaker: "AI",
          text: warmStoryQuestion,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        setDialogue([
          {
            role: "assistant",
            message: warmStoryQuestion,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } catch (e) {
        console.warn("Story context bridge error:", e);
      }
    }

    initStoryDebateBridge();

    return () => {
      isCancelled = true;
    };
  }, [storyParam, storyIdParam, titleParam, storyTitleParam, levelParam, speakText, timeAwareGreeting]);

  // STT Durdurma
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
    }
    setIsListening(false);
  }, []);

  // Mesaj Gönderimi & Backend Entegrasyonu
  const sendMessage = useCallback(
    async (overrideText?: string) => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // 1. Durum Kilidi: Yapay zekâ konuşuyorsa veya yankı sönümlenme (cooldown) aktifse İPTAL ET
      if (isAiSpeakingRef.current || cooldownRef.current) {
        return;
      }

      const textToSend = (overrideText || currentSpokenTextRef.current || transcript || interimText || textInput).trim();
      if (!textToSend || isThinkingRef.current) return;

      // 2. Kendi Sesini Tanıma Filtresi: Hoparlör sızıntısı kontrolü
      const currentAiMsg = latestAiMessageRef.current || aiMessage;
      if (isEchoOfAiMessage(textToSend, currentAiMsg)) {
        console.info("[Acoustic Echo Filter] Hoparlör sızıntısı engellendi (sendMessage):", textToSend);
        currentSpokenTextRef.current = "";
        setTranscript("");
        setInterimText("");
        setTextInput("");
        return;
      }

      // 3. Anlamsız Gürültü ve VAD Koruması:
      // Elle metin kutusuna yazılmadıysa, mikrofon/VAD girdisinde 3 kelimeden az sesleri gönderme
      const isManualTextInput = Boolean(textInput.trim() && textToSend === textInput.trim());
      const wordCount = textToSend.split(/\s+/).filter(Boolean).length;
      if (!isManualTextInput && wordCount < 3) {
        return;
      }

      currentSpokenTextRef.current = "";
      setTranscript("");
      setInterimText("");
      setTextInput("");
      handleBargeIn();
      setIsThinking(true);
      isThinkingRef.current = true;

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const userTurn: DialogueTurn = {
        role: "user",
        message: textToSend,
        timestamp: now,
      };
      addToSessionArchive({
        speaker: "Sen",
        text: textToSend,
        timestamp: now,
      });
      const updatedDialogue = [...dialogue, userTurn];
      setDialogue(updatedDialogue);

      try {
        const targetWordsToSend = Array.from(
          new Set([
            ...deckTargetWords.slice(0, 10).map((w) => w.word),
            ...capturedWords,
          ])
        );

        // Kullanıcının telaffuz ettiği aktif deste kelimelerini anında yakala
        const userLower = textToSend.toLowerCase();
        deckTargetWords.forEach((tw) => {
          const wLower = tw.word.toLowerCase();
          if (userLower.includes(wLower)) {
            setCapturedWords((prev) =>
              prev.includes(wLower) ? prev : [...prev, wLower]
            );
          }
        });

        const res = await fetch(`${API_BASE}/api/v1/speaking/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario_id: activeStoryTitle ? "story_debate" : "casual_chat",
            user_transcript: textToSend,
            history: updatedDialogue.map((turn) => ({
              role: turn.role,
              message: turn.message,
            })),
            persona: isAlex ? "alex" : "sparky",
            target_level: currentLevel || "A1",
            level: currentLevel,
            story_context: {
              title: activeStoryTitle || "Hedef Deste Pratiği",
              level: currentLevel || "A1",
              target_words: targetWordsToSend,
            },
            conversation_mode: activeStoryTitle ? "story_debate" : "casual",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const replyText =
            data.assistant_reply ||
            data.reply_message ||
            "Oh, that sounds wonderful! What did you enjoy the most about it?";

          const assistantTurn: DialogueTurn = {
            role: "assistant",
            message: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          setDialogue([...updatedDialogue, assistantTurn]);
          setAiMessage(replyText);
          latestAiMessageRef.current = replyText;
          addToSessionArchive({
            speaker: "AI",
            text: replyText,
            timestamp: assistantTurn.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });

          // Fluency Hint Güncellemesi
          if (data.fluency_hint) {
            setFluencyHint(data.fluency_hint);
          }

          // Hedef Kelimeleri Topla
          const spotted = [
            ...(Array.isArray(data.target_words_spotted) ? data.target_words_spotted : []),
            ...(Array.isArray(data.session_vocabulary_used) ? data.session_vocabulary_used : []),
          ];
          if (spotted.length > 0) {
            spotted.forEach((w: string) => {
              if (w && typeof w === "string") {
                setCapturedWords((prev) =>
                  prev.includes(w.toLowerCase()) ? prev : [...prev, w.toLowerCase()]
                );
              }
            });
          }

          // Nöral seslendir
          speakText(replyText);

          // Arka planda arşive kaydet
          saveSpeakingArchiveSession({
            user_id: user?.id,
            session_title: activeStoryTitle ? `Story Debate: ${activeStoryTitle}` : "Canlı İngilizce Sohbet",
            transcript: [...updatedDialogue, assistantTurn].map((d) => ({
              sender: d.role === "assistant" ? ("ai" as const) : ("user" as const),
              text: d.message,
              timestamp: d.timestamp,
            })),
            metrics: {
              fluency: data.feedback?.fluency_score || 90,
              vocabulary: 88,
              grammar: 85,
              overall_score: 88,
              level: currentLevel || "A1",
            },
          })
            .then(() => fetchArchives())
            .catch(() => {});

          return;
        }
        throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        console.warn("Backend response fallback:", err);
        const fallbackReply = "That sounds so fun! What made you start thinking about this today?";
        const assistantTurn: DialogueTurn = {
          role: "assistant",
          message: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setDialogue([...updatedDialogue, assistantTurn]);
        setAiMessage(fallbackReply);
        latestAiMessageRef.current = fallbackReply;
        addToSessionArchive({
          speaker: "AI",
          text: fallbackReply,
          timestamp: assistantTurn.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        speakText(fallbackReply);
      } finally {
        setIsThinking(false);
        isThinkingRef.current = false;
      }
    },
    [
      transcript,
      interimText,
      textInput,
      handleBargeIn,
      dialogue,
      speakText,
      user?.id,
      currentLevel,
      activeStoryTitle,
      isAlex,
      capturedWords,
      fetchArchives,
      isEchoOfAiMessage,
      aiMessage,
    ]
  );

  // 🎙️ Eller Serbest Dinleme & Software Mic Gate
  const startContinuousRecognition = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition tarayıcı tarafından desteklenmiyor.");
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
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        // 1. Durum Kilidi: Yapay zekâ konuşuyorsa veya yankı sönümlenme süresi (cooldown) aktifse mikrofonu yut
        if (isAiSpeakingRef.current || cooldownRef.current) {
          return;
        }

        let finalStr = "";
        let interimStr = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        const rawSpoken = (finalStr || interimStr).trim();
        if (!rawSpoken) return;

        // 2. Kendi Sesini Tanıma Filtresi: Hoparlörden gelen yankıyı engelle
        const currentAiMsg = latestAiMessageRef.current || aiMessage;
        if (isEchoOfAiMessage(rawSpoken, currentAiMsg)) {
          console.info("[Acoustic Echo Filter] Hoparlör sızıntısı engellendi (onresult):", rawSpoken);
          currentSpokenTextRef.current = "";
          setInterimText("");
          return;
        }

        if (isThinkingRef.current) {
          return;
        }

        if (finalStr) {
          setTranscript((prev) => {
            const updated = prev ? `${prev} ${finalStr}`.trim() : finalStr.trim();
            currentSpokenTextRef.current = updated;
            return updated;
          });
          setInterimText("");
        } else {
          setInterimText(interimStr);
          currentSpokenTextRef.current = (transcript ? `${transcript} ${interimStr}` : interimStr).trim();
        }

        // 🎙️ 3. AKILLI VAD: 1.3 saniye tam sessizlik bekle, 3 kelimeden az gürültüleri filtrele
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          // Durum Kilidi kontrolü
          if (isAiSpeakingRef.current || cooldownRef.current || isThinkingRef.current) {
            return;
          }

          const spokenNow = currentSpokenTextRef.current.trim();
          const words = spokenNow.split(/\s+/).filter(Boolean);

          // 3 kelimeden az ve anlamsız ortam seslerini filtrele
          if (words.length < 3) {
            return;
          }

          // Kendi sesini tanıma filtresi (VAD aşaması)
          const latestAi = latestAiMessageRef.current || aiMessage;
          if (isEchoOfAiMessage(spokenNow, latestAi)) {
            console.info("[Acoustic Echo Filter] Hoparlör sızıntısı engellendi (VAD):", spokenNow);
            currentSpokenTextRef.current = "";
            setTranscript("");
            setInterimText("");
            return;
          }

          if (spokenNow && isHandsFreeActiveRef.current && !isUserMutedRef.current) {
            sendMessage(spokenNow);
          }
        }, 1300);
      };

      rec.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition notice:", e.error);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        // AI konuşurken veya cooldown aktifken otomatik yeniden başlatmayı engelle
        if (isAiSpeakingRef.current || cooldownRef.current || isUserMutedRef.current || !isHandsFreeActiveRef.current) {
          return;
        }
        setTimeout(() => {
          if (!isAiSpeakingRef.current && !cooldownRef.current && !isUserMutedRef.current && isHandsFreeActiveRef.current) {
            try {
              rec.start();
            } catch {}
          }
        }, 200);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Continuous recognition error:", err);
      setIsListening(false);
    }
  }, [sendMessage, transcript, isEchoOfAiMessage, aiMessage]);

  useEffect(() => {
    startContinuousRecognitionRef.current = startContinuousRecognition;
  }, [startContinuousRecognition]);

  // Mikrofon Sessize Al / Aç
  const toggleMuteCall = useCallback(() => {
    handleBargeIn();

    if (isUserMuted) {
      setIsUserMuted(false);
      isUserMutedRef.current = false;
      startContinuousRecognition();
    } else {
      setIsUserMuted(true);
      isUserMutedRef.current = true;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      stopRecording();
    }
  }, [isUserMuted, handleBargeIn, startContinuousRecognition, stopRecording]);

  // Otomatik Dinlemeyi Başlat (Yalnızca sessionState === 'active' iken)
  useEffect(() => {
    if (sessionState !== "active") return;

    const timer = setTimeout(() => {
      if (!isUserMuted && !isAiSpeakingRef.current && !cooldownRef.current) {
        startContinuousRecognition();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [sessionState, isUserMuted, startContinuousRecognition]);

  // 🎙️ Konuşmayı Başlat: Kullanıcı butona bastığında aktifleşir
  const handleStartSession = useCallback(() => {
    setSessionState("active");
    const greetingToSpeak = latestAiMessageRef.current || aiMessage;

    // Oturum arşivinde henüz karşılama yoksa ekle
    if (sessionArchive.length === 0) {
      addToSessionArchive({
        speaker: "AI",
        text: greetingToSpeak,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    // Mentorun sıcak selamlama cümlesini seslendir & eller serbest döngüyü başlat
    speakText(greetingToSpeak);
    if (!isUserMuted) {
      startContinuousRecognition();
    }
  }, [aiMessage, sessionArchive.length, addToSessionArchive, speakText, isUserMuted, startContinuousRecognition]);

  // 🔴 Konuşmayı Bitir: Sesi & mikrofonu kapat, arşive kaydet ve Karneli Özet Modalını Aç
  const handleEndSession = useCallback(() => {
    handleBargeIn();
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
      } catch {}
    }
    stopRecording();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    setSessionState("finished");

    // Sessiz Altın Köprüsü: En az 2 tur konuşulduğunda Speaking Lounge ödülü (+45)
    const userTurnCount = dialogue.filter((d) => d.role === "user").length;
    if (userTurnCount >= 2) {
      addPendingGold(45, "speaking");
    }

    // Tüm konuşma satırlarını vocaship_speaking_archives (localStorage) arşivine garantili kaydet
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vocaship_speaking_archives", JSON.stringify(sessionArchive));
      } catch (e) {
        console.warn("Session archive save error:", e);
      }
    }

    if (dialogue.length > 1) {
      saveSpeakingArchiveSession({
        user_id: user?.id,
        session_title: activeStoryTitle ? `Story Debate: ${activeStoryTitle}` : "Canlı İngilizce Sohbet",
        transcript: dialogue.map((d) => ({
          sender: d.role === "assistant" ? ("ai" as const) : ("user" as const),
          text: d.message,
          timestamp: d.timestamp,
        })),
        metrics: {
          fluency: 90,
          vocabulary: 88,
          grammar: 85,
          overall_score: 88,
          level: currentLevel || "A1",
        },
      })
        .then(() => fetchArchives())
        .catch(() => {});
    }
    setIsSummaryModalOpen(true);
  }, [handleBargeIn, stopRecording, dialogue, sessionArchive, user?.id, activeStoryTitle, currentLevel, fetchArchives]);

  const handleOpenEndSessionModal = handleEndSession;

  // 🔄 Yeni Konuşma Başlat: State'leri sıfırlayıp idle durumuna döndürür
  const handleRestartSession = useCallback(() => {
    handleBargeIn();
    stopRecording();
    setIsSummaryModalOpen(false);
    setTranscript("");
    setInterimText("");
    setTextInput("");
    setCapturedWords([]);
    setSavedWords([]);
    setSessionSeconds(0);
    setDialogue([
      {
        role: "assistant",
        message: aiMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setSessionState("idle");
  }, [handleBargeIn, stopRecording, aiMessage]);

  // Seçilen Kelimeleri Flashcard Destesine Ekle
  const handleSaveWordsToDeck = async () => {
    const toSave = capturedWords.filter((w) => !savedWords.includes(w));
    if (toSave.length === 0 || !selectedDeckId) return;

    setIsSavingWords(true);
    let count = 0;
    for (const w of toSave) {
      try {
        await fetch(`${API_BASE}/api/v1/decks/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deck_id: selectedDeckId,
            word: w,
            meanings: [{ translation: "Speaking Lounge pratiği", definition: "Encountered in speaking" }],
            notes: "Vocaship Speaking Lounge oturumundan kaydedildi.",
          }),
        });
        count++;
      } catch {}
    }
    setSavedWords((prev) => [...prev, ...toSave]);
    setIsSavingWords(false);
    setDeckSaveToast(`${toSave.length} kelime başarıyla destene eklendi! 🎉`);
    setTimeout(() => setDeckSaveToast(null), 3500);
  };

  const userSentencesCount = useMemo(() => {
    return dialogue.filter((d) => d.role === "user").length;
  }, [dialogue]);

  return (
    <div
      className={`w-full ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen overflow-hidden p-0 m-0" : "min-h-[calc(100vh-4rem)] flex-1"
      } bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200 select-none relative transition-colors duration-200`}
    >
      {/* ========================================================================= */}
      {/* SAĞ ÜST KÖŞE: Yüzen [ KOTA ROZETİ ], [ ⛶ Tam Ekran ] ve [ 📜 Geçmiş ]    */}
      {/* ========================================================================= */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Kota Göstergesi Rozeti */}
        {planTier === "pro" ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-bold backdrop-blur-md shadow-sm">
            <span>👑 PRO</span>
            <span className="text-[10px] text-amber-400/80">• Sınırsız</span>
          </div>
        ) : planTier === "plus" ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 text-xs font-bold backdrop-blur-md shadow-sm">
            <span>⚡ Plus</span>
            <span className="text-[10px] text-indigo-300/80">• Günlük: 3/3 Seans</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/70 text-slate-300 text-xs font-bold backdrop-blur-md shadow-sm">
            <span>🆓 Basic</span>
            <span className="text-[10px] text-slate-400">• Günlük: 1/1 Seans</span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md transition-all cursor-pointer shadow-md active:scale-95 ${
            isFullscreen
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
              : "bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white"
          }`}
          title={isFullscreen ? "Tam Ekrandan Çık" : "Gerçek Tarayıcı Tam Ekran Moduna Geç"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
              <span>🗗 Küçült</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>⛶ Tam Ekran</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsHistoryDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium backdrop-blur-md transition-all cursor-pointer shadow-md active:scale-95"
          title="Geçmiş Konuşmaları ve Transkripti Aç"
        >
          <ScrollText className="w-3.5 h-3.5 text-indigo-400" />
          <span>📜 Geçmiş</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MERKEZ DİYALOG SAHNESİ: Ferah, Tam Genişlik & Geniş Sahne                */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-12 lg:px-20 w-full text-center space-y-4 sm:space-y-6 pt-4 pb-2 overflow-y-auto">
        {sessionState === "idle" ? (
          /* 1. BAŞLANGIÇ DURUMU (sessionState === 'idle') */
          <div className="flex flex-col items-center justify-center space-y-5 w-full max-w-3xl animate-in fade-in duration-300 py-3 sm:py-6">
            {/* Aktif Mentorun Adı & Rozeti */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md">
              <span className="text-3xl leading-none">{activeMentor.avatar}</span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-slate-100">
                    {activeMentor.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                    {activeMentor.role}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{activeMentor.accent}</span>
              </div>
            </div>

            {/* AI Karşılama Kartı */}
            <div data-theme-preserve="dark" className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl flex items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-100 text-center flex-1 leading-relaxed tracking-tight">
                &ldquo;{aiMessage}&rdquo;
              </h2>
            </div>

            {/* Net ve Davetkâr Başlatma Butonu */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartSession}
                className="inline-flex items-center gap-3.5 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer ring-4 ring-emerald-500/20 hover:ring-emerald-500/40"
              >
                <Mic className="w-6 h-6 animate-pulse" />
                <span>🎙️ {activeMentorName} ile Konuşmaya Başla</span>
              </button>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Mikrofon ve eller serbest konuşma bu butona basıldığında başlayacaktır.
              </p>
            </div>
          </div>
        ) : (
          /* 2. AKTİF VEYA TAMAMLANMIŞ DİYALOG GÖRÜNÜMÜ */
          <>
            {/* AI Mesajı */}
            <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-4xl">
              {/* 3'lü Cümle Gösterim Seçicisi (Segmented Pill) */}
              <div className="flex flex-col items-center gap-1">
                <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
                  <button
                    type="button"
                    onClick={() => handleSelectDisplayMode("flow")}
                    className={`px-3.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      displayMode === "flow"
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    title="Kelimeler okundukça sesle eşzamanlı parlar"
                  >
                    <span>✨</span>
                    <span>Akış</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDisplayMode("text")}
                    className={`px-3.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      displayMode === "text"
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    title="Cümleyi ses başlamadan eksiksiz gösterir"
                  >
                    <span>📄</span>
                    <span>Metin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDisplayMode("focus")}
                    className={`px-3.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      displayMode === "focus"
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    title="Ses bitene kadar metni gizler, sonra açar"
                  >
                    <span>🎧</span>
                    <span>Odak</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 font-medium transition-all">
                  {displayMode === "flow" && "✨ Kelimeler sesle eşzamanlı parlar."}
                  {displayMode === "text" && "📄 Cümlenin tamamı baştan itibaren ekranda açık kalır."}
                  {displayMode === "focus" && "🎧 Önce dinle; cümle bittiğinde yazı otomatik açılır."}
                </p>
              </div>

              <div data-theme-preserve="dark" className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl flex items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-100 text-center flex-1 leading-relaxed tracking-tight">
                  {isInitializingStory ? (
                    <span className="inline-flex items-center gap-2 text-indigo-300 text-xl font-normal">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                      Bağlanıyor...
                    </span>
                  ) : displayMode === "focus" && isAiSpeaking ? (
                    <div className="relative select-none py-1">
                      <span className="filter blur-md select-none opacity-50 transition-all duration-300">
                        &ldquo;{aiMessage}&rdquo;
                      </span>
                      <div className="text-xs font-medium text-indigo-300 flex items-center justify-center gap-1.5 mt-2 animate-pulse">
                        <span>🎧</span>
                        <span>Önce dinle; cümle bittiğinde yazı otomatik açılır.</span>
                      </div>
                    </div>
                  ) : displayMode === "flow" && isAiSpeaking ? (
                    <span className="transition-all duration-150">
                      &ldquo;
                      {aiMessage.split(/\s+/).map((word, i) => {
                        const isRead = i <= karaokeWordIdx;
                        const isTarget = isWordTarget(word);
                        return (
                          <span
                            key={i}
                            className={`transition-colors duration-150 inline-block mr-1.5 ${
                              isTarget
                                ? "bg-amber-500/20 text-amber-200 border-b border-amber-400 font-semibold px-1 rounded shadow-sm"
                                : isRead
                                ? "text-slate-100 font-semibold"
                                : "text-slate-500/70 font-normal"
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                      &rdquo;
                    </span>
                  ) : (
                    <span>
                      &ldquo;
                      {aiMessage.split(/\s+/).map((word, i) => {
                        const isTarget = isWordTarget(word);
                        return (
                          <span
                            key={i}
                            className={`inline-block mr-1.5 ${
                              isTarget
                                ? "bg-amber-500/20 text-amber-200 border-b border-amber-400 font-semibold px-1 rounded shadow-sm"
                                : ""
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                      &rdquo;
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (isAiSpeaking) {
                      handleBargeIn();
                    } else {
                      speakText(aiMessage);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-lg shrink-0 ${
                    isAiSpeaking
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse"
                      : "bg-slate-800 hover:bg-slate-750 border-slate-700 text-indigo-400 hover:text-indigo-300"
                  }`}
                  title={isAiSpeaking ? "Sesi Durdur" : "Nöral Sesle Dinle"}
                >
                  {isAiSpeaking ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-indigo-400" />}
                </button>
              </div>

              {/* Autoplay engellendiğinde tek dokunuşla dinleme butonu */}
              {playBlocked && !isAiSpeaking && (
                <button
                  type="button"
                  onClick={() => speakText(aiMessage)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg animate-bounce cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 Dinlemek İçin Dokunun</span>
                </button>
              )}

              {/* 🌟 AÇILIŞ BUZ KIRICILARI (Kapı 1) vs TEKİL [ 💡 İpucu ] FISILTISI */}
              {!hasStartedSpeaking && !activeStoryTitle ? (
                <div className="flex items-center justify-center gap-2.5 flex-wrap animate-in fade-in duration-300">
                  <button
                    type="button"
                    onClick={() => {
                      const text = "Actually, my day was really nice and productive!";
                      handleApplyHint(text);
                      sendMessage(text);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-300 hover:text-amber-200 text-xs font-medium transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span>☕</span>
                    <span>How was your day?</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = "I recently watched a great movie with exciting visuals.";
                      handleApplyHint(text);
                      sendMessage(text);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-300 hover:text-amber-200 text-xs font-medium transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span>🎬</span>
                    <span>Any good movies lately?</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApplyHint(activeFluencyHint)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-medium transition cursor-pointer active:scale-95 shadow-sm max-w-3xl truncate animate-in fade-in duration-300"
                  title="Bu ipucunu konuşma alanına eklemek için tıkla"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-400 shrink-0">İpucu:</span>
                  <span className="truncate italic font-sans">"{activeFluencyHint}"</span>
                </button>
              )}
            </div>

            {/* Kullanıcının Canlı Dökümü veya Son Söylediği Cümle */}
            <div className="min-h-[50px] flex items-center justify-center w-full px-4 max-w-4xl">
              {isThinking ? (
                <div className="flex items-center gap-2 text-indigo-300 text-base font-medium animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Yapay zekâ düşünüyor...</span>
                </div>
              ) : (transcript || interimText) ? (
                <p className="text-base sm:text-lg text-emerald-300 text-center w-full font-medium drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                  "{transcript || interimText}"
                </p>
              ) : lastUserTurn ? (
                <p className="text-base sm:text-lg text-slate-400 text-center w-full italic">
                  "{lastUserTurn}"
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-slate-500 text-center italic">
                  Konuşmaya başladığınızda sesiniz burada belirecektir...
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. ALT KONTROL & DURUM GÖSTERGESİ: Ses Dalgası (Waveform) & Mikrofon       */}
      {/* ========================================================================= */}
      <footer className="w-full pb-8 pt-2 flex flex-col items-center justify-center space-y-4 shrink-0 px-4">
        {sessionState === "idle" ? (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-medium shadow-md">
            <span>🎧</span>
            <span>
              Konuşmaya başlamak için merkezdeki <strong>{activeMentorName} ile Konuşmaya Başla</strong> butonuna dokunun.
            </span>
          </div>
        ) : (
          <>
            {/* Ses Dalgası (Waveform) / Durum Göstergesi */}
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
              {isAiSpeaking || isCooldown ? (
                <>
                  {/* Kırmızı/Rose pulsing audio wave bars */}
                  <div className="flex items-center gap-1 h-5">
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-3" />
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-5" />
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_300ms] h-4" />
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_400ms] h-2" />
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_250ms] h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-rose-300 flex items-center gap-1.5">
                    <span>🔊</span>
                    <span>{isAiSpeaking ? "Yapay Zekâ Konuşuyor..." : "Dinleme Başlatılıyor..."}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">
                    (Durdurmak için dokunabilirsiniz)
                  </span>
                </>
              ) : isThinking ? (
                <>
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-xs sm:text-sm font-bold text-indigo-300">
                    💭 Yanıt Hazırlanıyor...
                  </span>
                </>
              ) : (
                <>
                  {/* Zümrüt Yeşili pulsing audio wave bars */}
                  <div className="flex items-center gap-1 h-5">
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_200ms] h-4" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_300ms] h-5" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_200ms] h-3" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>🎙️</span>
                    <span>Seni Dinliyorum...</span>
                  </span>
                </>
              )}
            </div>

            {/* Kompakt Mikrofon / Mute Kontrolü, [🔴 Konuşmayı Bitir] & Opsiyonel Yazma Formu */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
              <button
                type="button"
                onClick={toggleMuteCall}
                className={`px-4 py-2.5 rounded-2xl border transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-2 ${
                  isUserMuted
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                    : "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-emerald-400 hover:text-emerald-300"
                }`}
                title={isUserMuted ? "Mikrofonu Aç (Canlı Görüşmeye Başla)" : "Mikrofonu Sessize Al"}
              >
                {isUserMuted ? (
                  <>
                    <MicOff className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-rose-300">Mikrofon Kapalı</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-300">Mikrofon Açık</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleEndSession}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-2 shadow-sm"
                title="Konuşmayı Bitir ve Değerlendirmeyi Gör"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>🔴 Konuşmayı Bitir</span>
              </button>

              {/* Dileyen kullanıcılar için mini yazma alanı */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (textInput.trim()) {
                    sendMessage(textInput.trim());
                  }
                }}
                className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl px-3 py-1.5 shadow-md"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Veya buraya yazın..."
                  disabled={isThinking}
                  className="bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none w-36 sm:w-48 transition"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isThinking}
                  className="p-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition cursor-pointer"
                  title="Gönder"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </footer>

      {/* ========================================================================= */}
      {/* 4. SAĞ SLIDE-OVER ÇEKMECESİ: [ 📜 Geçmiş & Canlı Transkript ]             */}
      {/* ========================================================================= */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsHistoryDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-slate-900/95 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl z-10 backdrop-blur-xl animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Geçmiş & Diyalog Akışı
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Aktif Oturum Transkripti */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Aktif Oturum Kaydı ({sessionArchive.length} Mesaj)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    vocaship_speaking_archives
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
                  {sessionArchive.length === 0 ? (
                    <p className="text-slate-500 text-xs italic py-2 text-center">
                      Henüz konuşma kaydı bulunmuyor.
                    </p>
                  ) : (
                    sessionArchive.map((turn, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border ${
                          turn.speaker === "AI"
                            ? "bg-indigo-950/30 border-indigo-500/20 text-indigo-200"
                            : "bg-slate-850 border-slate-800 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[11px] text-indigo-400">
                            {turn.speaker === "AI" ? "🤖 AI Mentor" : "👤 Sen"}
                          </span>
                          {turn.timestamp && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {turn.timestamp}
                            </span>
                          )}
                        </div>
                        <p className={`leading-relaxed ${turn.speaker === "AI" ? "text-indigo-300 font-medium" : "text-slate-200"}`}>
                          {turn.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Önceki Arşiv Kayıtları */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Önceki Konuşmalarım ({archives.length})
                </span>
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1 text-xs">
                  {isLoadingArchives ? (
                    <div className="flex items-center justify-center py-4 text-slate-500 text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      Yükleniyor...
                    </div>
                  ) : archives.length === 0 ? (
                    <p className="text-slate-500 text-xs italic py-2">
                      Henüz kaydedilmiş bir arşiv bulunmuyor.
                    </p>
                  ) : (
                    archives.slice(0, 5).map((arch) => (
                      <div
                        key={arch.id}
                        className="p-2.5 rounded-xl bg-slate-850/60 border border-slate-800/80 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-200 truncate pr-2">
                            {arch.session_title}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0">
                            {arch.metrics?.overall_score || 88} Puan
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{arch.transcript?.length || 0} mesaj</span>
                          <span>•</span>
                          <span>{arch.created_at?.slice(0, 10) || "Yakın zamanda"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. [ 🔴 OTURUMU BİTİR ] KARNELİ DEĞERLENDİRME MODALI                       */}
      {/* ========================================================================= */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-center">
            {/* Rozet & Tebrik */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center justify-center shadow-inner">
                <Trophy className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 tracking-tight">
                Oturum Sonu Karnesi
              </h3>
              <p className="text-xs text-indigo-300 max-w-sm">
                &ldquo;Harika bir sohbet oldu! Düşüncelerini {currentLevel} seviyesinde böylesine akıcı ve doğal paylaşman harikaydı. 🌟&rdquo;
              </p>
            </div>

            {/* İstatistikler (Süre & Cümle Sayısı) */}
            <div className="grid grid-cols-2 gap-3 py-1">
              <div className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-800 flex flex-col items-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" /> Oturum Süresi
                </span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {formatDuration(sessionSeconds)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-800 flex flex-col items-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-emerald-400" /> Konuşulan Cümle
                </span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {userSentencesCount} Cümle
                </span>
              </div>
            </div>

            {/* 🎯 Aktif Deste Hedef Kelimeleri */}
            {deckTargetWords.length > 0 && (
              <div className="space-y-2 text-left p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Destendeki Hedef Kelimeler ({deckTargetWords.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Oturumda kullan
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto">
                  {deckTargetWords.slice(0, 12).map((tw) => {
                    const isUsed = capturedWords.includes(tw.word.toLowerCase());
                    return (
                      <span
                        key={tw.word}
                        className={`px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                          isUsed
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                            : "bg-slate-900 text-slate-300 border border-slate-700/60 hover:border-amber-400/50"
                        }`}
                        title={tw.meaning}
                      >
                        {tw.word} {isUsed && "✓"}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pratik Edilen Kelimeler & Desteye Ekle */}
            <div className="space-y-3 text-left p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
                  Pratik Edilen Kelimeler ({capturedWords.length})
                </span>
                {decks.length > 0 && (
                  <select
                    value={selectedDeckId}
                    onChange={(e) => handleDeckChange(e.target.value)}
                    className="bg-slate-900 text-slate-300 text-[11px] px-2 py-1 rounded-lg border border-slate-700 outline-none cursor-pointer max-w-[150px] truncate"
                  >
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {capturedWords.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Bu oturumda özel bir hedef kelime yakalanmadı.
                </p>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto">
                  {capturedWords.map((word) => (
                    <span
                      key={word}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}

              {capturedWords.length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Öğrendiğin kelimeleri destene aktar
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveWordsToDeck}
                    disabled={isSavingWords || capturedWords.every((w) => savedWords.includes(w))}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    {isSavingWords ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Ekleniyor...</span>
                      </>
                    ) : savedWords.length > 0 ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                        <span>Desteye Eklendi</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3 h-3" />
                        <span>Desteye Ekle</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {deckSaveToast && (
                <p className="text-xs text-emerald-400 font-semibold text-center mt-1">
                  {deckSaveToast}
                </p>
              )}
            </div>

            {/* Oturum Konuşma Dökümü (Tüm Diyalog Listesi) */}
            <div className="space-y-2 text-left p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ScrollText className="w-3.5 h-3.5 text-indigo-400" />
                  Oturum Konuşma Dökümü ({sessionArchive.length} Mesaj)
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Kaydedildi
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
                {sessionArchive.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2 text-center">
                    Henüz kayıtlı diyalog yok.
                  </p>
                ) : (
                  sessionArchive.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border text-xs ${
                        turn.speaker === "AI"
                          ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-200"
                          : "bg-slate-900 border-slate-800 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-0.5">
                        <span className={turn.speaker === "AI" ? "text-indigo-400" : "text-emerald-400"}>
                          {turn.speaker === "AI" ? "AI Mentor" : "Sen"}
                        </span>
                        <span className="font-mono text-slate-500">{turn.timestamp}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${turn.speaker === "AI" ? "text-indigo-300 font-medium" : "text-slate-200"}`}>
                        {turn.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Alt Eylem Butonları: [ 🔄 Yeni Konuşma Başlat ] & [ 📚 Kütüphaneye Dön ] */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleRestartSession}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>🔄 Yeni Konuşma Başlat</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700/60 transition active:scale-95 cursor-pointer"
              >
                📚 Kütüphaneye Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merkezi Hesap & Tercihler Modalı */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default function SpeakingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#0B0F19] text-white flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SpeakingContent />
    </Suspense>
  );
}
