"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
  AlertTriangle,
  Radio,
  Check,
  Languages,
  Activity,
  Flame,
  HelpCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { BoardTerm } from "../../classroom/board/page";

// =========================================================================
// HEDEF AKADEMİK VE BRANŞ TERİM LİSTESİ (KEYWORD DICTIONARY)
// =========================================================================

export const DEFAULT_ACADEMIC_KEYWORDS: {
  word: string;
  turkish_meaning: string;
  category: "science" | "history" | "math" | "english";
  phonetic: string;
  academic_definition: string;
  example: string;
}[] = [
  // Science
  {
    word: "Mitochondria",
    turkish_meaning: "Mitokondri (Hücrenin enerji santrali)",
    category: "science",
    phonetic: "/ˌmaɪ.təˈkɒn.dri.ən/",
    academic_definition: "Organelles that generate chemical energy for cellular processes.",
    example: "Mitochondria produce ATP through cellular respiration.",
  },
  {
    word: "Photosynthesis",
    turkish_meaning: "Fotosentez (Işıkla besin sentezi)",
    category: "science",
    phonetic: "/ˌfoʊ.toʊˈsɪn.θə.sɪs/",
    academic_definition: "Process by which green plants synthesize nutrients using sunlight.",
    example: "Chlorophyll absorbs sunlight to trigger photosynthesis.",
  },
  {
    word: "Osmosis",
    turkish_meaning: "Ozmoz (Seçici geçirgen zardan su geçişi)",
    category: "science",
    phonetic: "/ɒzˈmoʊ.sɪs/",
    academic_definition: "Spontaneous net movement of solvent across a semipermeable membrane.",
    example: "Plant roots absorb groundwater through osmosis.",
  },
  {
    word: "Homeostasis",
    turkish_meaning: "Homeostaz (Hücresel iç denge)",
    category: "science",
    phonetic: "/ˌhoʊ.mi.oʊˈsteɪ.sɪs/",
    academic_definition: "State of steady internal physical and chemical conditions in organisms.",
    example: "The endocrine system maintains metabolic homeostasis.",
  },
  {
    word: "Ribosome",
    turkish_meaning: "Ribozom (Protein sentez fabrikası)",
    category: "science",
    phonetic: "/ˈraɪ.bə.soʊm/",
    academic_definition: "Macromolecular machines that perform biological protein synthesis.",
    example: "Ribosomes translate mRNA into polypeptide chains.",
  },
  {
    word: "Metabolism",
    turkish_meaning: "Metabolizma (Madde ve enerji dönüşümleri)",
    category: "science",
    phonetic: "/məˈtæb.əl.ɪ.zəm/",
    academic_definition: "Life-sustaining chemical reactions within cells.",
    example: "Enzymes regulate the rate of cellular metabolism.",
  },
  {
    word: "Hypothesis",
    turkish_meaning: "Hipotez (Sınanabilir bilimsel varsayım)",
    category: "science",
    phonetic: "/haɪˈpɒθ.ə.sɪs/",
    academic_definition: "A proposed scientific explanation made on limited evidence as a starting point.",
    example: "The scientist formulated a testable hypothesis before experimentation.",
  },
  {
    word: "Velocity",
    turkish_meaning: "Hız (Vektörel hız ve yön)",
    category: "science",
    phonetic: "/vəˈlɒs.ə.ti/",
    academic_definition: "The directional speed of an object in motion as a vector quantity.",
    example: "The rocket attained escape velocity as it left Earth's atmosphere.",
  },
  {
    word: "Friction",
    turkish_meaning: "Sürtünme kuvveti",
    category: "science",
    phonetic: "/ˈfrɪk.ʃən/",
    academic_definition: "The force resisting the relative motion of solid surfaces or fluid layers.",
    example: "Brake pads generate friction to decelerate the vehicle.",
  },
  {
    word: "Ecosystem",
    turkish_meaning: "Ekosistem (Canlı-cansız çevre birliği)",
    category: "science",
    phonetic: "/ˈiː.kəʊˌsɪs.təm/",
    academic_definition: "A biological community of interacting organisms and their physical environment.",
    example: "Coral reefs represent one of Earth's most diverse aquatic ecosystems.",
  },

  // History & Social
  {
    word: "Renaissance",
    turkish_meaning: "Rönesans (Yeniden Doğuş)",
    category: "history",
    phonetic: "/rəˈneɪ.səns/",
    academic_definition: "European cultural, artistic and intellectual revival from 14th to 17th century.",
    example: "The Renaissance initiated revolutionary shifts in European arts and science.",
  },
  {
    word: "Democracy",
    turkish_meaning: "Demokrasi (Halkın egemenliği)",
    category: "history",
    phonetic: "/dɪˈmɒk.rə.si/",
    academic_definition: "A system of government where power is vested in the people who rule either directly or via representatives.",
    example: "Ancient Athens developed an early form of direct participatory democracy.",
  },
  {
    word: "Feudalism",
    turkish_meaning: "Feodalizm (Derebeylik düzeni)",
    category: "history",
    phonetic: "/ˈfjuː.dəl.ɪ.zəm/",
    academic_definition: "Dominant medieval European social system based on land tenure and military service.",
    example: "Under feudalism, serfs worked agricultural manors in exchange for lordly protection.",
  },
  {
    word: "Civilization",
    turkish_meaning: "Uygarlık / Medeniyet",
    category: "history",
    phonetic: "/ˌsɪv.əl.aɪˈzeɪ.ʃən/",
    academic_definition: "A complex human society with developed urban centers, culture, and social stratification.",
    example: "Mesopotamia is widely revered as the cradle of early agrarian civilization.",
  },
  {
    word: "Sovereignty",
    turkish_meaning: "Egemenlik / Hükümranlık",
    category: "history",
    phonetic: "/ˈsɒv.rɪn.ti/",
    academic_definition: "Supreme and independent political authority over a geographic territory.",
    example: "The treaty recognized national sovereignty over domestic legislative affairs.",
  },

  // Math & Logic
  {
    word: "Derivative",
    turkish_meaning: "Türev (Anlık değişim oranı)",
    category: "math",
    phonetic: "/dɪˈrɪv.ə.tɪv/",
    academic_definition: "The instantaneous rate of change of a mathematical function with respect to a variable.",
    example: "The derivative of position with respect to time represents velocity.",
  },
  {
    word: "Integral",
    turkish_meaning: "İntegral (Eğri altındaki alan)",
    category: "math",
    phonetic: "/ˈɪn.tɪ.ɡrəl/",
    academic_definition: "The continuous accumulation of quantities, computing areas beneath function curves.",
    example: "Integration calculates total accumulated distance from an instantaneous velocity curve.",
  },
  {
    word: "Matrix",
    turkish_meaning: "Matris (Dizi ve vektör tablosu)",
    category: "math",
    phonetic: "/ˈmeɪ.trɪks/",
    academic_definition: "A rectangular array of numbers or expressions arranged in rows and columns.",
    example: "Linear transformations in computer graphics rely heavily on matrix operations.",
  },
  {
    word: "Logarithm",
    turkish_meaning: "Logaritma (Üslü işlem tersi)",
    category: "math",
    phonetic: "/ˈlɒɡ.ə.rɪð.əm/",
    academic_definition: "The exponent to which a fixed base number must be raised to produce that number.",
    example: "The Richter scale calculates earthquake energy via a base-10 logarithm.",
  },
  {
    word: "Algorithm",
    turkish_meaning: "Algoritma (Adım adım çözüm kuralı)",
    category: "math",
    phonetic: "/ˈæl.ɡə.rɪð.əm/",
    academic_definition: "A finite step-by-step procedure designed to perform a specific computational calculation.",
    example: "Search engines deploy ranking algorithms to index internet resources.",
  },
  {
    word: "Polynomial",
    turkish_meaning: "Polinom (Çok terimli cebirsel ifade)",
    category: "math",
    phonetic: "/ˌpɒl.ɪˈnəʊ.mi.əl/",
    academic_definition: "An algebraic expression composed of variables and coefficients with non-negative exponents.",
    example: "Quadratic curves are second-degree polynomial equations.",
  },

  // English & Academic Discourse
  {
    word: "Ephemeral",
    turkish_meaning: "Geçici / Fani / Kısa ömürlü",
    category: "english",
    phonetic: "/ɪˈfem.ər.əl/",
    academic_definition: "Lasting for a remarkably brief duration; fleeting or transitory.",
    example: "Morning fog over the harbor is remarkably ephemeral once daylight breaks.",
  },
  {
    word: "Ubiquitous",
    turkish_meaning: "Her yerde bulunan / Çok yaygın",
    category: "english",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    academic_definition: "Existing or being encountered everywhere at the same time; omnipresent.",
    example: "Smart mobile devices have become ubiquitous throughout global society.",
  },
  {
    word: "Resilience",
    turkish_meaning: "Dirençlilik / Psikolojik sağlamlık",
    category: "english",
    phonetic: "/rɪˈzɪl.jəns/",
    academic_definition: "The capacity to withstand and rapidly recover from adversity or stress.",
    example: "Ecological resilience allows rainforests to recover from periodic storms.",
  },
  {
    word: "Paradigm",
    turkish_meaning: "Paradigma (Düşünce kalıbı / model)",
    category: "english",
    phonetic: "/ˈpær.ə.daɪm/",
    academic_definition: "A distinct set of concepts, theories, and standards forming a comprehensive worldview.",
    example: "The shift to renewable energy represents an economic paradigm shift.",
  },
  {
    word: "Pragmatic",
    turkish_meaning: "Pragmatik / Faydacı yaklaşım",
    category: "english",
    phonetic: "/præɡˈmæt.ɪk/",
    academic_definition: "Guided by practical real-world considerations rather than rigid theoretical dogma.",
    example: "Engineers adopted a pragmatic approach to meet rigorous deployment timelines.",
  },
  {
    word: "Articulate",
    turkish_meaning: "Kendini iyi ifade eden / Düzgün konuşan",
    category: "english",
    phonetic: "/ɑːˈtɪk.jə.lət/",
    academic_definition: "Expressing ideas fluently, coherently and effectively in verbal discourse.",
    example: "The delegate offered an articulate summary of the international treaty.",
  },
];

export interface LiveWhisperPanelProps {
  onTermCaught?: (term: BoardTerm) => void;
  activeBranch?: string;
  alreadyCoveredIds?: string[];
}

export default function LiveWhisperPanel({
  onTermCaught,
  activeBranch = "science",
  alreadyCoveredIds = [],
}: LiveWhisperPanelProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
  const [currentInterim, setCurrentInterim] = useState<string>("");
  const [capturedWords, setCapturedWords] = useState<string[]>([]);
  const [language, setLanguage] = useState<"en-US" | "tr-TR">("en-US");
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [recentCaughtPill, setRecentCaughtPill] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const isListeningRef = useRef(isListening);

  // Keep ref synchronized with state for auto-reconnect logic
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Seslendirme (TTS)
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS playback error:", e);
    }
  };

  // Konuşma içinden anahtar terim avcısı (Keyword Catcher)
  const analyzeTranscriptForKeywords = useCallback(
    (text: string) => {
      if (!text || text.trim().length === 0) return;
      const lowerText = text.toLowerCase();

      DEFAULT_ACADEMIC_KEYWORDS.forEach((kw) => {
        const kwLower = kw.word.toLowerCase();
        // Regex word boundary match
        const regex = new RegExp(`\\b${kwLower}\\b`, "i");
        if (regex.test(lowerText)) {
          // Bu kelime daha önce bu oturumda yakalandı mı?
          setCapturedWords((prev) => {
            if (prev.some((w) => w.toLowerCase() === kwLower)) {
              return prev;
            }

            // Yeni yakalandı! Görsel geri bildirim & konfeti
            setRecentCaughtPill(kw.word);
            setTimeout(() => setRecentCaughtPill(null), 3500);

            try {
              confetti({
                particleCount: 25,
                spread: 45,
                origin: { x: 0.85, y: 0.7 },
              });
            } catch (e) {
              // ignore confetti error
            }

            // Sayfadaki ortak listeye (Bugün İşlenen Terimler) aktar
            if (onTermCaught) {
              const matchedTerm: BoardTerm = {
                id: `live_${kw.word.toLowerCase()}`,
                word: kw.word,
                phonetic: kw.phonetic,
                academic_definition: kw.academic_definition,
                turkish_meaning: kw.turkish_meaning,
                example: kw.example,
                category: kw.category,
              };
              onTermCaught(matchedTerm);
            }

            return [kw.word, ...prev];
          });
        }
      });
    },
    [onTermCaught]
  );

  // Web Speech Recognition Kurulumu & Olay Yönetimi
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      setMicError("Tarayıcınız Web Speech API tanımayı desteklemiyor (Chrome/Edge önerilir).");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let interimText = "";
        let finalSentence = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSentence += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (interimText) {
          setCurrentInterim(interimText);
          analyzeTranscriptForKeywords(interimText);
        }

        if (finalSentence.trim()) {
          const trimmed = finalSentence.trim();
          setTranscriptHistory((prev) => {
            const next = [...prev, trimmed];
            return next.slice(-10); // Son 10 cümleyi tut
          });
          setCurrentInterim("");
          analyzeTranscriptForKeywords(trimmed);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicError("Mikrofon erişim izni reddedildi. Lütfen tarayıcı ayarlarından mikrofonu açın.");
          setIsListening(false);
        } else if (event.error === "no-speech") {
          // Normal sessizlik durumu, hata rozetine gerek yok
        } else if (event.error === "aborted") {
          // Kullanıcı durdurdu
        } else {
          setMicError(`Konuşma tanıma uyarısı: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Eğer kullanıcı kapatmadıysa (oturum süresi dolduysa) otomatik yeniden bağlan
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.warn("Speech recognition auto-reconnect error:", e);
          }
        } else {
          setCurrentInterim("");
        }
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      setHasSpeechSupport(false);
      setMicError(`Başlatma hatası: ${err?.message || "Bilinmiyor"}`);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [language, analyzeTranscriptForKeywords]);

  // Transkript değiştikçe yumuşakça en alta kaydır
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcriptHistory, currentInterim]);

  // Dinleme Başlat / Durdur
  const toggleListening = () => {
    if (!hasSpeechSupport) {
      setMicError("Tarayıcınız ses tanımayı desteklemiyor.");
      return;
    }

    if (isListening) {
      // Durdur
      setIsListening(false);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    } else {
      // Başlat
      setMicError(null);
      setIsListening(true);
      isListeningRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Recognition start failed, re-initializing:", e);
          try {
            recognitionRef.current.abort();
            setTimeout(() => recognitionRef.current?.start(), 100);
          } catch (err) {
            // ignore
          }
        }
      }
    }
  };

  // Transkript ve yakalananları temizle
  const handleClearTranscript = () => {
    setTranscriptHistory([]);
    setCurrentInterim("");
  };

  // Dil Değiştir
  const toggleLanguage = () => {
    const nextLang = language === "en-US" ? "tr-TR" : "en-US";
    setLanguage(nextLang);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.lang = nextLang;
            recognitionRef.current.start();
          }
        }, 150);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div
      data-testid="live-whisper-panel"
      className="h-full flex flex-col justify-between space-y-3.5 select-none"
    >
      {/* ======================================================================= */}
      {/* 1. ÜST PANEL: MİKROFON BUTONU & TEMİZLEME & DİL SEÇİCİ                   */}
      {/* ======================================================================= */}
      <div className="space-y-2.5">
        {/* Hata veya İzin Uyarısı */}
        {micError && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="flex-1 font-medium">{micError}</span>
          </div>
        )}

        {/* Ana Dokunmatik Mikrofon Butonu (min-h-[48px]) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            data-testid="live-mic-button"
            className={`flex-1 min-h-[48px] px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 touch-manipulation select-none relative overflow-hidden ${
              isListening
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-4 ring-rose-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-slate-900/50"
            }`}
          >
            {isListening ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <Radio className="w-4 h-4 animate-pulse text-white" />
                <span>🎙️ Canlı Dinleniyor (Kapat)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>🎙️ Canlı Dinlemeyi Başlat</span>
              </>
            )}
          </button>

          {/* Dil Değiştirici Buton */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="min-h-[48px] px-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            title={`Dinleme Dilini Değiştir (Şu an: ${language})`}
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === "en-US" ? "EN" : "TR"}</span>
          </button>

          {/* Transkript Temizle Butonu */}
          <button
            type="button"
            onClick={handleClearTranscript}
            className="min-h-[48px] w-12 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-sm"
            title="Konuşma Geçmişini Temizle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Canlı Dinleme Durum Bilgisi */}
        <div className="flex items-center justify-between text-[11px] px-1 font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Activity className={`w-3.5 h-3.5 ${isListening ? "text-rose-400 animate-pulse" : "text-slate-500"}`} />
            <span>{isListening ? "Akıllı Terim Dedektörü Aktif" : "Mikrofon Beklemede"}</span>
          </span>
          <span className="text-emerald-400 font-bold">
            {capturedWords.length} Terim Yakalandı
          </span>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. ORTA PANEL: CANLI TRANSKRİPT AKIŞI (Yarı Saydam Baloncuklar)          */}
      {/* ======================================================================= */}
      <div className="flex-1 min-h-[140px] max-h-[220px] rounded-2xl bg-slate-950/80 border border-slate-800/90 p-3 overflow-y-auto flex flex-col space-y-2 scrollbar-thin scrollbar-thumb-slate-800 relative">
        {transcriptHistory.length === 0 && !currentInterim ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-1.5 text-slate-500">
            <Mic className="w-6 h-6 stroke-[1.5] text-slate-600 animate-bounce" />
            <p className="text-xs font-medium text-slate-400">
              Ders anlatımını dinlemek için mikrofonu başlatın.
            </p>
            <span className="text-[10px] text-slate-600">
              Öğretmen hedef kelimeleri söylediğinde otomatik tespit edilir.
            </span>
          </div>
        ) : (
          <>
            {transcriptHistory.map((text, idx) => (
              <div
                key={`trans_${idx}`}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-200 leading-relaxed shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-200"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono">
                  <span>Öğretmen</span>
                  <span>Cümle #{idx + 1}</span>
                </div>
                <p>{text}</p>
              </div>
            ))}

            {/* O an konuşulan geçici ara metin (Interim Result) */}
            {currentInterim && (
              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed italic animate-pulse">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-2" />
                {currentInterim}...
              </div>
            )}

            <div ref={transcriptEndRef} />
          </>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 3. ALT PANEL: BUGÜNÜN YAKALANAN TERİMLERİ (Yeşil Parlayan Rozetler)    */}
      {/* ======================================================================= */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Canlı Yakalanan Terimler</span>
          </span>
          {recentCaughtPill && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold animate-bounce shadow-sm">
              🎯 &ldquo;{recentCaughtPill}&rdquo; Yakalandı!
            </span>
          )}
        </div>

        {/* Yakalanan Terim Hapları */}
        <div className="min-h-[46px] max-h-[88px] overflow-y-auto p-1 flex flex-wrap gap-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {capturedWords.length === 0 ? (
            <span className="text-[11px] text-slate-500 italic py-1 px-1">
              Henüz konuşmada hedef akademik terim geçmedi.
            </span>
          ) : (
            capturedWords.map((word, idx) => (
              <button
                key={`${word}_${idx}`}
                type="button"
                onClick={() => speakText(word)}
                className="px-2.5 py-1 rounded-xl bg-emerald-950/60 hover:bg-emerald-800/80 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Telaffuzu Dinlet"
              >
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span>{word}</span>
                <Volume2 className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

