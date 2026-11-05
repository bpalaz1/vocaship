"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";

export interface LiveCapturedWord {
  id: string;
  word: string;
  phonetic?: string;
  turkish_meaning?: string;
  contextSentence: string;
  timestamp: string;
  senderRole?: "teacher" | "student";
}

export interface UseLiveTranscriptionOptions {
  sessionId?: string;
  classCode?: string;
  isTeacher?: boolean;
  lang?: string;
  onNewWord?: (word: LiveCapturedWord) => void;
}

// 1. İNGİLİZCE DURDURMA KELİMELERİ (STOP WORDS)
const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he",
  "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about",
  "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day",
  "most", "us", "very", "much", "many", "more", "such", "than", "here", "were", "been", "being", "done",
  "does", "did", "said", "saying", "having", "going", "goes", "gone", "went", "made", "making", "took",
  "taking", "taken", "seen", "seeing", "looks", "looking", "looked", "okay", "yeah", "hello", "hi", "yes",
  "please", "thanks", "thank", "right", "sure", "am", "is", "are", "was", "has", "had", "let", "lets",
  "today", "tomorrow", "yesterday", "class", "lesson", "everyone", "listen", "talking", "speech",
]);

// 2. KRİTİK SEVİYE & VAKA KELİMELERİ VERİ TABANI (Hızlı eşleme)
const VOCABULARY_DICTIONARY: Record<
  string,
  { phonetic: string; turkish_meaning: string }
> = {
  substantiate: {
    phonetic: "/səbˈstæn.ʃi.eɪt/",
    turkish_meaning: "Somut delillerle ispatlamak, doğrulamak",
  },
  mitigate: {
    phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
    turkish_meaning: "Hafifletmek, etkisini azaltmak",
  },
  resilience: {
    phonetic: "/rɪˈzɪl.jəns/",
    turkish_meaning: "Direnç, toparlanma kabiliyeti",
  },
  contemporaneous: {
    phonetic: "/kənˌtem.pəˈreɪ.ni.əs/",
    turkish_meaning: "Eşzamanlı tutulan, döneme ait",
  },
  mandatory: {
    phonetic: "/ˈmæn.də.tər.i/",
    turkish_meaning: "Zorunlu, bağlayıcı",
  },
  contractual: {
    phonetic: "/kənˈtræk.tʃu.əl/",
    turkish_meaning: "Sözleşmeden doğan, akdi",
  },
  compliance: {
    phonetic: "/kəmˈplaɪ.əns/",
    turkish_meaning: "Uyumluluk, kurallara riayet",
  },
  arbitration: {
    phonetic: "/ˌɑː.bɪˈtreɪ.ʃən/",
    turkish_meaning: "Tahkim, hakem kurulu yoluyla çözüm",
  },
  concurrent: {
    phonetic: "/kənˈkʌr.ənt/",
    turkish_meaning: "Eşzamanlı, çakışan",
  },
  liability: {
    phonetic: "/ˌlaɪ.əˈbɪl.ə.ti/",
    turkish_meaning: "Hukuki sorumluluk, yükümlülük",
  },
  precedent: {
    phonetic: "/ˈpres.ɪ.dənt/",
    turkish_meaning: "Emsal karar, teamül",
  },
  disruption: {
    phonetic: "/dɪsˈrʌp.ʃən/",
    turkish_meaning: "Aksama, bölünme, kesinti",
  },
  superficial: {
    phonetic: "/ˌsuː.pəˈfɪʃ.əl/",
    turkish_meaning: "Yüzeysel, derinliği olmayan",
  },
  cognitive: {
    phonetic: "/ˈkɒɡ.nə.tɪv/",
    turkish_meaning: "Bilişsel, zihinsel",
  },
  proliferation: {
    phonetic: "/prəˌlɪf.ərˈeɪ.ʃən/",
    turkish_meaning: "Hızlı çoğalma, yayılma",
  },
  ephemeral: {
    phonetic: "/ɪˈfem.ər.əl/",
    turkish_meaning: "Kısa ömürlü, geçici",
  },
  ubiquitous: {
    phonetic: "/juːˈbɪk.wɪ.təs/",
    turkish_meaning: "Her yerde hazır ve nazır bulunan",
  },
  coherent: {
    phonetic: "/kəʊˈhɪə.rənt/",
    turkish_meaning: "Tutarlı, ahenkli, mantıklı",
  },
  deliberate: {
    phonetic: "/dɪˈlɪb.ər.ət/",
    turkish_meaning: "Kasti, üzerinde düşünülmüş",
  },
  acceleration: {
    phonetic: "/əkˌsel.əˈreɪ.ʃən/",
    turkish_meaning: "Hızlanma, süre kısaltma",
  },
  dispute: {
    phonetic: "/dɪˈspjuːt/",
    turkish_meaning: "Uyuşmazlık, ihtilaf",
  },
  entitled: {
    phonetic: "/ɪnˈtaɪ.təld/",
    turkish_meaning: "Hak sahibi, yetkili",
  },
  procurement: {
    phonetic: "/prəˈkjʊə.mənt/",
    turkish_meaning: "Satın alma ve tedarik yönetimi",
  },
  feasibility: {
    phonetic: "/ˌfiː.zəˈbɪl.ə.ti/",
    turkish_meaning: "Uygulanabilirlik, fizibilite",
  },
  contingency: {
    phonetic: "/kənˈtɪn.dʒən.si/",
    turkish_meaning: "Beklenmedik durum payı",
  },
};

export function useLiveTranscription({
  sessionId = "live-session-1",
  classCode = "VRG-2535",
  isTeacher = false,
  lang = "en-US",
  onNewWord,
}: UseLiveTranscriptionOptions = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [capturedWords, setCapturedWords] = useState<LiveCapturedWord[]>([]);

  const recognitionRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const localBcRef = useRef<BroadcastChannel | null>(null);
  const recentWordsRef = useRef<Set<string>>(new Set());

  // 1. SUPABASE REALTIME & NATIVE BROADCAST KANALI KURULUMU
  useEffect(() => {
    const channelName = `live-whisper:${classCode || sessionId}`;

    // A. Native BroadcastChannel (Yerel sekmeler arası anlık senkron)
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel(channelName);
        localBcRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.event === "new-live-word" && event.data?.payload) {
            handleInboundWord(event.data.payload);
          }
        };
      } catch (e) {
        console.warn("[BroadcastChannel setup warn]:", e);
      }
    }

    // B. Supabase Realtime Broadcast (Cihazlar ve ağlar arası canlı yayın)
    try {
      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "new-live-word" }, (payload: any) => {
          if (payload?.payload) {
            handleInboundWord(payload.payload);
          }
        })
        .subscribe((status: string) => {
          if (status === "CHANNEL_ERROR") {
            console.warn("[Supabase Realtime Channel Status]:", status);
          }
        });
    } catch (err) {
      console.warn("[Supabase channel error]:", err);
    }

    return () => {
      try {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
        if (localBcRef.current) {
          localBcRef.current.close();
        }
      } catch {}
    };
  }, [classCode, sessionId]);

  // Gelen yeni canlı kelimeyi güvenli ve mükerrer olmadan listeye ekle
  const handleInboundWord = useCallback(
    (newWord: LiveCapturedWord) => {
      setCapturedWords((prev) => {
        if (prev.some((item) => item.id === newWord.id || (item.word.toLowerCase() === newWord.word.toLowerCase() && Date.now() - new Date(item.timestamp).getTime() < 15000))) {
          return prev;
        }
        return [newWord, ...prev];
      });
      if (onNewWord) onNewWord(newWord);
    },
    [onNewWord]
  );

  // 2. KELİME ÇIKARTMA VE YAYINLAMA MOTORU
  const extractAndBroadcastWords = useCallback(
    (sentence: string) => {
      if (!sentence || sentence.trim().length === 0) return;

      // Cümleyi kelimelere böl ve temizle
      const rawTokens = sentence
        .replace(/[^a-zA-Z0-9\s-]/g, " ")
        .split(/\s+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const detectedWords: LiveCapturedWord[] = [];

      for (const token of rawTokens) {
        // En az 4 harfli, durdurma listesinde olmayan ve yakın zamanda yakalanmamış kelimeler
        if (token.length >= 4 && !STOP_WORDS.has(token) && !recentWordsRef.current.has(token)) {
          // Yakalanan son kelimelere ekle (spam engelleme)
          recentWordsRef.current.add(token);
          setTimeout(() => {
            recentWordsRef.current.delete(token);
          }, 45000); // 45 saniye boyunca aynı kelimeyi tekrar patlatma

          const dictEntry = VOCABULARY_DICTIONARY[token];
          const phonetic = dictEntry?.phonetic || `/${token}/`;
          const turkishMeaning =
            dictEntry?.turkish_meaning ||
            (token.endsWith("tion")
              ? "Eylem, süreç veya durum terimi"
              : token.endsWith("able") || token.endsWith("ible")
              ? "Yapılabilir, uygun nitelikte"
              : token.endsWith("ive")
              ? "Nitelik belirten sıfat / terim"
              : "Canlı derste vurgulanan hedef kavram");

          const captured: LiveCapturedWord = {
            id: `live-word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            word: token,
            phonetic,
            turkish_meaning: turkishMeaning,
            contextSentence: sentence.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            senderRole: isTeacher ? "teacher" : "student",
          };

          detectedWords.push(captured);
        }
      }

      // Yakalananları yerel state'e ekle ve kanala fırlat
      if (detectedWords.length > 0) {
        setCapturedWords((prev) => [...detectedWords, ...prev]);

        for (const w of detectedWords) {
          // A. Native BroadcastChannel
          try {
            if (localBcRef.current) {
              localBcRef.current.postMessage({
                event: "new-live-word",
                payload: w,
              });
            }
          } catch {}

          // B. Supabase Realtime Broadcast (Görev Spesifikasyonu Formatı)
          try {
            if (channelRef.current) {
              channelRef.current.send({
                type: "broadcast",
                event: "new-live-word",
                payload: {
                  ...w,
                  word: w.word,
                  contextSentence: w.contextSentence,
                },
              });
            }
          } catch (err) {
            console.warn("[Broadcast live word error]:", err);
          }

          if (onNewWord) onNewWord(w);
        }
      }
    },
    [isTeacher, onNewWord]
  );

  // 3. WEB SPEECH API İLE SÜREKLİ DİNLEME (CONTINUOUS SPEECH RECOGNITION)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage("Tarayıcınızda yerel Web Speech API (konuşma tanıma) desteği bulunamadı.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalSentence = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSentence += transcriptPiece + " ";
          } else {
            currentInterim += transcriptPiece;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalSentence.trim().length > 0) {
          extractAndBroadcastWords(finalSentence);
        }
      };

      recognition.onerror = (event: any) => {
        // 'no-speech' veya 'aborted' normal akışta gelebilir
        if (event.error !== "no-speech" && event.error !== "aborted") {
          console.warn("[SpeechRecognition Error]:", event.error);
          setErrorMessage(`Konuşma algılama uyarısı: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Öğretmen dinlemeyi kapatmadıysa otomatik devam et (continuous mod)
        if (recognitionRef.current && isListening) {
          try {
            recognition.start();
          } catch {}
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (e: any) {
      setIsSupported(false);
      setErrorMessage(e.message || "SpeechRecognition başlatılamadı.");
    }

    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        }
      } catch {}
    };
  }, [lang, extractAndBroadcastWords, isListening]);

  // Dinlemeyi Başlat
  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage("Mikrofon desteği bulunamadı veya konuşma tanıma bu tarayıcıda kapalı.");
      return;
    }
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setErrorMessage(null);
      }
    } catch (err: any) {
      // Eğer zaten dinliyorsa hata vermesin
      if (err.name !== "InvalidStateError") {
        console.warn("[startListening error]:", err);
      }
    }
  }, [isSupported]);

  // Dinlemeyi Durdur
  const stopListening = useCallback(() => {
    try {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (err) {
      console.warn("[stopListening error]:", err);
    }
  }, []);

  // Belirli bir kelimeyi listeden çıkart (Öğretmen yanlış telaffuz temizliği)
  const removeWord = useCallback((wordId: string) => {
    setCapturedWords((prev) => prev.filter((w) => w.id !== wordId));
  }, []);

  // Tüm listeyi sıfırla
  const clearWords = useCallback(() => {
    setCapturedWords([]);
  }, []);

  // 4. TEST / DEMO SİMÜLASYON FONKSİYONU
  // (Mikrofon kapalıyken veya testlerde öğretmen cümlesi tetiklemek için)
  const simulateSpokenPhrase = useCallback(
    (phrase: string) => {
      extractAndBroadcastWords(phrase);
    },
    [extractAndBroadcastWords]
  );

  return {
    isListening,
    isSupported,
    errorMessage,
    interimTranscript,
    capturedWords,
    startListening,
    stopListening,
    removeWord,
    clearWords,
    simulateSpokenPhrase,
  };
}

