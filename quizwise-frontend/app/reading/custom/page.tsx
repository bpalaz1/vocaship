"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Volume2,
  Square,
  BookOpen,
  PlusCircle,
  Check,
  RotateCcw,
  Zap,
  BookmarkCheck,
  Copy,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import dynamic from "next/dynamic";
const WordCardModal = dynamic(() => import("../../components/reading/WordCardModal"), { ssr: false });
import TargetVocabularyFlashcards, { TargetVocabularyItem } from "../../components/reading/TargetVocabularyFlashcards";
import { API_BASE } from "../../config";
import { useLanguage } from "../../context/LanguageContext";

export interface SampleArticle {
  id?: string;
  title: string;
  source: string;
  category: string;
  level: string;
  content: string;
  target_vocabulary?: TargetVocabularyItem[];
}

export const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    title: "The Architecture of Deep Focus in the Digital Era",
    source: "The Economist / Tech Review",
    category: "Bilişsel Bilim & Kariyer",
    level: "Advanced (C1)",
    content: `In an era dominated by relentless digital interruptions, the ability to cultivate sustained focus has emerged as an indispensable cognitive asset. Knowledge workers worldwide struggle against fragmented attention spans, frequently falling prey to ephemeral notifications and shallow tasks.\n\nCognitive researchers substantiate that deep focus requires deliberate friction against cognitive fatigue. When individuals engage in demanding analytical problem-solving without task-switching, their neural networks exhibit heightened synaptic plasticity. This deliberate immersion enables mastery of complex domains in a fraction of the time required by passive learning.\n\nUltimately, organizations and professionals who leverage uninterrupted focus will maintain a decisive competitive advantage in the burgeoning knowledge economy.`,
    target_vocabulary: [
      { word: "relentless", phonetic: "/rɪˈlent.ləs/", meaning: "amansız, dur durak bilmeyen", example: "In an era dominated by relentless digital interruptions..." },
      { word: "cultivate", phonetic: "/ˈkʌl.tɪ.veɪt/", meaning: "geliştirmek, beslemek", example: "The ability to cultivate sustained focus has emerged as an asset." },
      { word: "indispensable", phonetic: "/ˌɪn.dɪˈspen.sə.bəl/", meaning: "vazgeçilmez, olmazsa olmaz", example: "Focus has emerged as an indispensable cognitive asset." },
      { word: "plasticity", phonetic: "/plæsˈtɪs.ə.ti/", meaning: "esneklik, şekillenebilirlik", example: "Their neural networks exhibit heightened synaptic plasticity." },
      { word: "burgeoning", phonetic: "/ˈbɜː.dʒən.ɪŋ/", meaning: "hızla büyüyen, gelişen", example: "A decisive advantage in the burgeoning knowledge economy." },
    ],
  },
  {
    title: "Global Supply Chains and Resilient Economics",
    source: "Financial Times / Economics",
    category: "Ekonomi & Sınav",
    level: "Upper-Intermediate (B2)",
    content: `Modern international trade is undergoing a profound structural transformation. Decades of prioritizing cost efficiency over systemic resilience exposed severe bottlenecks during global disruptions.\n\nConsequently, multinational corporations are actively diversifying supplier networks, transitioning from precarious single-source dependencies to robust, regionalized ecosystems. This strategic pivot diminishes vulnerability to unforeseen geopolitical volatility.\n\nEconomists argue that while supply chain redundancies increase baseline operating expenditures, they provide essential insurance against catastrophic revenue impairment in times of crisis.`,
    target_vocabulary: [
      { word: "resilience", phonetic: "/rɪˈzɪl.jəns/", meaning: "direnç, esneklik, dayanıklılık", example: "Prioritizing cost efficiency over systemic resilience exposed bottlenecks." },
      { word: "bottleneck", phonetic: "/ˈbɒt.əl.nek/", meaning: "darboğaz, tıkanıklık noktası", example: "Global disruptions exposed severe bottlenecks in trade." },
      { word: "precarious", phonetic: "/prɪˈkeə.ri.əs/", meaning: "güvencesiz, hassas, tehlikeli", example: "Transitioning from precarious single-source dependencies to robust networks." },
      { word: "volatility", phonetic: "/ˌvɒl.əˈtɪl.ə.ti/", meaning: "dalgalanma, değişkenlik", example: "Diminishes vulnerability to unforeseen geopolitical volatility." },
      { word: "redundancy", phonetic: "/rɪˈdʌn.dən.si/", meaning: "yedekleme, fazlalık", example: "Supply chain redundancies increase baseline operating expenditures." },
    ],
  },
  {
    id: "memory_sm2",
    title: "Neuroscience of Memory: How Spaced Repetition (SM-2) Works",
    source: "Nature Neuroscience Digest",
    category: "Hafıza & Biliş",
    level: "Intermediate (B1-B2)",
    content: `Human memory is not a static recording device; rather, it is a dynamic neural system governed by the Ebbinghaus forgetting curve. Without active reinforcement, our brains prune newly acquired vocabulary at an exponential rate within forty-eight hours.\n\nSpaced repetition algorithms, such as SuperMemo-2 (SM-2), strategically schedule flashcard reviews right at the critical juncture of forgetting. By calculating individual difficulty factors and interval expansions, learners achieve optimal retention with minimal cognitive burden.\n\nConsistent daily micro-reviews reinforce synaptic pathways, transitioning ephemeral short-term memories into permanent long-term cognitive structures.`,
    target_vocabulary: [
      { word: "prune", phonetic: "/pruːn/", meaning: "budamak, ayıklayıp elemek", example: "Our brains prune newly acquired vocabulary at an exponential rate." },
      { word: "exponential", phonetic: "/ˌek.spəˈnen.ʃəl/", meaning: "üstel, katlanarak artan", example: "Pruning vocabulary at an exponential rate within 48 hours." },
      { word: "juncture", phonetic: "/ˈdʒʌŋk.tʃər/", meaning: "kritik an, kavşak noktası", example: "Flashcard reviews right at the critical juncture of forgetting." },
      { word: "retention", phonetic: "/rɪˈten.ʃən/", meaning: "akılda tutma, hafıza koruma", example: "Learners achieve optimal retention with minimal cognitive burden." },
      { word: "synaptic", phonetic: "/sɪˈnæp.tɪk/", meaning: "sinaptik, sinirsel bağlantı", example: "Micro-reviews reinforce synaptic pathways." },
    ],
  },
];

interface SentenceItem {
  globalIndex: number;
  text: string;
  paragraphIndex: number;
  tokens: string[];
}

interface BookPage {
  pageIndex: number;
  sentences: SentenceItem[];
  wordCount: number;
}

export default function CustomArticleReaderPage() {
  const { t, currentLang } = useLanguage();

  const getSampleTitle = (sample: SampleArticle) => {
    if (sample.id === "memory_sm2" || sample.title.includes("Neuroscience of Memory")) {
      return currentLang === "tr"
        ? "Hafızanın Nörobilimi: Aralıklı Tekrar (SM-2) Nasıl Çalışır?"
        : "Neuroscience of Memory: How Spaced Repetition (SM-2) Works";
    }
    return sample.title;
  };

  const [inputText, setInputText] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [isReadingMode, setIsReadingMode] = useState(false);

  // 1. DUAL-READER GÖRÜNÜM STATE'İ VE ANAHTARI ('book' | 'focus')
  const [readerMode, setReaderMode] = useState<"book" | "focus">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vocaship_custom_reader_mode");
      if (saved === "book" || saved === "focus") return saved;
    }
    return "book";
  });

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isPlayingTTS, setIsPlayingTTS] = useState<boolean>(false);

  const isPlayingRef = useRef<boolean>(false);
  isPlayingRef.current = isPlayingTTS;

  const activeSentenceIdxRef = useRef<number>(activeSentenceIdx);
  activeSentenceIdxRef.current = activeSentenceIdx;

  const speechRateRef = useRef<number>(speechRate);
  speechRateRef.current = speechRate;

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [activeSentence, setActiveSentence] = useState<string>("");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [extractedVocabulary, setExtractedVocabulary] = useState<TargetVocabularyItem[]>([]);
  const [isExtractingVocab, setIsExtractingVocab] = useState(false);

  const paragraphs = useMemo(() => {
    return inputText.split("\n").filter((p) => p.trim().length > 0);
  }, [inputText]);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Tüm cümleleri sıralı olarak parse et
  const allSentences = useMemo<SentenceItem[]>(() => {
    const list: SentenceItem[] = [];
    let counter = 0;
    paragraphs.forEach((para, pIdx) => {
      const rawSentences = para
        .split(/(?<=[.!?…])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      rawSentences.forEach((st) => {
        const tokens = st.split(/\s+/).filter((t) => t.length > 0);
        list.push({
          globalIndex: counter++,
          text: st,
          paragraphIndex: pIdx,
          tokens,
        });
      });
    });
    return list;
  }, [paragraphs]);

  // Kitap Modu: 100-140 kelimelik anlamlı sayfalara böl
  const pages = useMemo<BookPage[]>(() => {
    if (allSentences.length === 0) return [];
    const result: BookPage[] = [];
    let curSentences: SentenceItem[] = [];
    let curWords = 0;

    for (const sent of allSentences) {
      const sWords = sent.tokens.length;
      if (curSentences.length > 0 && curWords >= 85 && curWords + sWords > 135) {
        result.push({
          pageIndex: result.length,
          sentences: curSentences,
          wordCount: curWords,
        });
        curSentences = [sent];
        curWords = sWords;
      } else {
        curSentences.push(sent);
        curWords += sWords;
      }
    }

    if (curSentences.length > 0) {
      result.push({
        pageIndex: result.length,
        sentences: curSentences,
        wordCount: curWords,
      });
    }

    return result;
  }, [allSentences]);

  const totalPages = Math.max(1, pages.length);

  // Web Speech API: Cümle Bazlı Okuma (Karaoke Read-Along)
  const speakSentence = useCallback(
    (index: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (index < 0 || index >= allSentences.length) {
        setIsPlayingTTS(false);
        return;
      }

      window.speechSynthesis.cancel();
      const sentence = allSentences[index];
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = "en-US";
      utterance.rate = speechRateRef.current;

      utterance.onend = () => {
        if (!isPlayingRef.current) return;
        const nextIdx = index + 1;
        if (nextIdx < allSentences.length) {
          setActiveSentenceIdx(nextIdx);
          speakSentence(nextIdx);
        } else {
          setIsPlayingTTS(false);
          window.speechSynthesis.cancel();
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          setIsPlayingTTS(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [allSentences]
  );

  const toggleTTS = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Tarayıcınız sesli okumayı desteklemiyor.");
      return;
    }
    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
    } else {
      setIsPlayingTTS(true);
      speakSentence(activeSentenceIdx);
    }
  };

  const handlePrevSentence = () => {
    const nextIdx = Math.max(0, activeSentenceIdx - 1);
    setActiveSentenceIdx(nextIdx);
    if (isPlayingTTS) {
      speakSentence(nextIdx);
    }
  };

  const handleNextSentence = () => {
    const nextIdx = Math.min(allSentences.length - 1, activeSentenceIdx + 1);
    setActiveSentenceIdx(nextIdx);
    if (isPlayingTTS) {
      speakSentence(nextIdx);
    }
  };

  const handleSeekSentence = (targetIdx: number) => {
    const clamped = Math.max(0, Math.min(allSentences.length - 1, targetIdx));
    setActiveSentenceIdx(clamped);
    if (isPlayingTTS) {
      speakSentence(clamped);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setSpeechRate(speed);
    speechRateRef.current = speed;
    if (isPlayingTTS) {
      speakSentence(activeSentenceIdx);
    }
  };

  // Kitap sayfa senkronizasyonu
  useEffect(() => {
    if (readerMode === "book" && pages.length > 0) {
      const targetPage = pages.findIndex((p) =>
        p.sentences.some((s) => s.globalIndex === activeSentenceIdx)
      );
      if (targetPage !== -1 && targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [activeSentenceIdx, readerMode, pages, currentPage]);

  // Klavye ok tuşları ile sayfa çevirme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowLeft") {
        if (readerMode === "book") {
          setCurrentPage((p) => Math.max(0, p - 1));
        } else {
          handlePrevSentence();
        }
      } else if (e.key === "ArrowRight") {
        if (readerMode === "book") {
          setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
        } else {
          handleNextSentence();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readerMode, totalPages, activeSentenceIdx, isPlayingTTS]);

  // Unmount durumunda sesi kapat
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const extractVocabFromText = async (text: string) => {
    setIsExtractingVocab(true);
    try {
      const res = await fetch(`${API_BASE}/classroom/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 3000),
          level: "Intermediate",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.target_vocabulary && data.target_vocabulary.length > 0) {
          const mapped = data.target_vocabulary.map((v: any) => ({
            word: v.word,
            phonetic: v.phonetic || `/${v.word}/`,
            meaning: v.meaning || v.turkish_meaning || "",
            turkish_meaning: v.turkish_meaning || v.meaning || "",
            context_sentence: v.example || v.context_sentence || "",
          }));
          setExtractedVocabulary(mapped);
          setIsExtractingVocab(false);
          return;
        }
      }
    } catch (err) {
      console.error("Metin analiz hatası:", err);
    }

    const tokens = text.match(/\b[A-Za-z]{5,}\b/g) || [];
    const unique = Array.from(new Set(tokens.map((t) => t.toLowerCase()))).slice(0, 5);
    const fallbackItems: TargetVocabularyItem[] = unique.map((w) => ({
      word: w,
      phonetic: `/${w}/`,
      meaning: "Metinden seçilen hedef kelime",
      turkish_meaning: "Metinden seçilen hedef kelime",
      context_sentence: `Bu kelime metin içerisinde yer almaktadır: "${w}".`,
    }));
    setExtractedVocabulary(fallbackItems);
    setIsExtractingVocab(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingText = sessionStorage.getItem("vocaship_pending_reading_text");
      const pendingTitle = sessionStorage.getItem("vocaship_pending_reading_title");
      if (pendingText) {
        setInputText(pendingText);
        setArticleTitle(pendingTitle || t("default_custom_title", "Özel Makale & Notlar"));
        setIsReadingMode(true);
        extractVocabFromText(pendingText);
        sessionStorage.removeItem("vocaship_pending_reading_text");
        sessionStorage.removeItem("vocaship_pending_reading_title");
      }
    }
  }, []);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const res = await fetch(`${API_BASE}/decks`);
        if (res.ok) {
          const data = await res.json();
          setDecks(Array.isArray(data) ? data : []);
          if (data && data.length > 0) {
            setSelectedDeckId(data[0].id);
          }
        } else {
          console.warn(`[fetchDecks] HTTP ${res.status}: Boş deste listesi kullanılıyor.`);
          setDecks([]);
        }
      } catch (e) {
        console.warn("Desteler yüklenemedi (sunucu kapalı veya ağ hatası), boş liste kullanılıyor:", e);
        setDecks([]);
      }
    };
    fetchDecks();
  }, []);

  const handleLoadSample = (sample: SampleArticle) => {
    setArticleTitle(getSampleTitle(sample));
    setInputText(sample.content);
    setCurrentPage(0);
    setActiveSentenceIdx(0);
    if (sample.target_vocabulary && sample.target_vocabulary.length > 0) {
      setExtractedVocabulary(sample.target_vocabulary);
    } else {
      extractVocabFromText(sample.content);
    }
    setIsReadingMode(true);
  };

  const handleStartReading = () => {
    if (!inputText.trim()) return;
    if (!articleTitle.trim()) {
      setArticleTitle(t("default_custom_title", "Özel Makale & Notlar"));
    }
    setCurrentPage(0);
    setActiveSentenceIdx(0);
    extractVocabFromText(inputText);
    setIsReadingMode(true);
  };

  const cleanWord = (token: string) => {
    return token.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”’]/g, "").trim();
  };

  const handleWordClick = (token: string, sentenceText: string) => {
    const cleaned = cleanWord(token);
    if (!cleaned || cleaned.length < 2) return;
    setSelectedWord(cleaned);
    setActiveSentence(sentenceText.trim());
  };

  const progressPercent =
    allSentences.length > 0
      ? Math.round(((activeSentenceIdx + 1) / allSentences.length) * 100)
      : 0;

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-28">
      {/* İKİLİ OKUMA MODU SEKMELERİ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <Link
            href="/reading"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-semibold text-xs transition"
          >
            <span>📚 {t("tab_curated_library", "Hazır Okuma Kütüphanesi ({count} Hikaye)", { count: 15 })}</span>
          </Link>
          <button
            type="button"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
          >
            <span>📰 {t("tab_custom_analyzer", "Serbest Makale / Haber Çözümle")}</span>
            <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded-full font-mono">
              {t("badge_active_tab", "Aktif")}
            </span>
          </button>
        </div>

        <Link
          href="/reading"
          className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("btn_back_to_library", "Kütüphaneye Dön")}</span>
        </Link>
      </div>

      {!isReadingMode ? (
        /* MOD 1: METİN YAPIŞTIRMA VE ÖRNEK SEÇME ALANI */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hızlı Başla: Örnek Makaleler */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {t("quick_start_title", "HIZLI BAŞLA: ÖRNEK AKADEMİK & KARİYER MAKALELERİ")}
              </span>
              <span className="text-xs text-slate-500">{t("quick_start_sub", "Tek tıkla yükleyin")}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_ARTICLES.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLoadSample(sample)}
                  className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850/80 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        {sample.level}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{sample.source}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {getSampleTitle(sample)}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-medium">{sample.category}</span>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform font-bold flex items-center gap-1">
                      {t("btn_read_now", "Hemen Oku")} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kendi Metnini Yapıştır Formu */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  {t("paste_article_title", "Kendi Makaleni, Sınav Parçanı veya Haber Metnini Yapıştır")}
                </h2>
                <p className="text-xs text-slate-400">
                  {t("paste_article_sub", "The Economist, BBC, PubMed, makale özetleri veya ders notlarınızı doğrudan yapıştırabilirsiniz.")}
                </p>
              </div>
              <div className="text-xs font-mono text-slate-400">
                {t("word_count_stat", "{count} kelime • ~{min} dk okuma", { count: wordCount, min: estimatedMinutes })}
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder={t("placeholder_article_title", "Makale Başlığı (Örn: The Economist - Economic Trends 2026)")}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition"
              />

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("placeholder_article_body", "İngilizce metni buraya yapıştırın... (Tüm kelimeler anında tıklanabilir ve tıklandığında fonetik, çeviri ve ses telaffuzu ile kaydedilebilir hale gelecektir.)")}
                rows={10}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setInputText("");
                  setArticleTitle("");
                }}
                disabled={!inputText}
                className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer"
              >
                {t("btn_clear", "Temizle")}
              </button>

              <button
                type="button"
                onClick={handleStartReading}
                disabled={!inputText.trim()}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t("reading_btn_analyze", "Metni İnteraktif Çözümle & Oku")}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MOD 2: İNTERAKTİF OKUMA ODASI (DUAL-READER) */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Makale Başlık & Kontrol Çubuğu */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {t("badge_interactive_reading", "İNTERAKTİF OKUMA AKTİF")}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {t("reading_stats_counter", "{count} Kelime • ~{min} dk", { count: wordCount, min: estimatedMinutes })}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {articleTitle || t("default_custom_title", "Özel Makale & Notlar")}
              </h2>
            </div>

            {/* Üst Sağ Aksiyon Alanı: Dual-Reader Segment Anahtarı & Düzenle Butonu */}
            <div className="flex items-center gap-2.5">
              {/* 1. DUAL-READER GEÇİŞ ANAHTARI (Kitap Modu vs Odak Modu) */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setReaderMode("book");
                    localStorage.setItem("vocaship_custom_reader_mode", "book");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    readerMode === "book"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>📖</span>
                  <span className="hidden sm:inline">{t("mode_book", "Kitap Modu")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReaderMode("focus");
                    localStorage.setItem("vocaship_custom_reader_mode", "focus");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    readerMode === "focus"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>📄</span>
                  <span className="hidden sm:inline">{t("mode_focus", "Odak Modu")}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isPlayingTTS) {
                    window.speechSynthesis.cancel();
                    setIsPlayingTTS(false);
                  }
                  setIsReadingMode(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                {t("btn_edit_text", "Metni Düzenle")}
              </button>
            </div>
          </div>

          {/* İpucu Barı */}
          <div className="flex items-center space-x-2 text-xs text-indigo-300 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl px-4 py-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              {t("interactive_mode_banner_tip", "Vocaship İnteraktif Mod: Metindeki bilmediğiniz herhangi bir kelimenin üzerine tıklayın. Anında fonetik telaffuzu, çevirisi ve kelime kartı açılacaktır.")}
            </span>
          </div>

          {/* ==================== GÖRÜNÜM: KİTAP MODU VEYA ODAK MODU ==================== */}
          {readerMode === "book" ? (
            /* 1. KİTAP MODU (BOOK VIEW) */
            <div className="space-y-4">
              <div className="relative flex items-stretch gap-2 sm:gap-4">
                {/* Sol Sayfa Çevirme Butonu (<) */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  aria-label={t("btn_prev_page", "Önceki Sayfa")}
                  title={t("btn_prev_page", "Önceki Sayfa")}
                  className={`hidden sm:flex items-center justify-center w-12 shrink-0 rounded-2xl border transition-all ${
                    currentPage === 0
                      ? "opacity-20 cursor-not-allowed border-transparent text-slate-600"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 shadow-md active:scale-95 cursor-pointer"
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Kitap Sayfası Kartı */}
                <div className="flex-1 rounded-3xl p-6 sm:p-10 border border-slate-800 bg-slate-900/90 shadow-2xl transition-all duration-300 min-h-[380px] flex flex-col justify-between">
                  <div className="space-y-4 text-slate-200 text-base sm:text-lg leading-relaxed">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800 text-slate-400">
                      <span className="font-semibold truncate max-w-[250px] sm:max-w-md">
                        {articleTitle || t("default_custom_title", "Özel Makale & Notlar")}
                      </span>
                      <span className="font-mono text-[11px]">
                        ~{pages[currentPage]?.wordCount || 0} {t("word_cards_count", "Kelime")}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {pages[currentPage]?.sentences.map((sent) => {
                        const isSpeaking = activeSentenceIdx === sent.globalIndex && isPlayingTTS;
                        return (
                          <span
                            key={sent.globalIndex}
                            className={`transition-all duration-200 inline mr-1.5 ${
                              isSpeaking
                                ? "bg-indigo-500/25 ring-1 ring-indigo-400/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] rounded-lg px-1"
                                : "hover:bg-slate-800/40 rounded px-1"
                            }`}
                          >
                            {sent.tokens.map((token, wIdx) => {
                              const cleaned = cleanWord(token).toLowerCase();
                              const isSaved = savedWords.has(cleaned);
                              const isCurrentlySelected = selectedWord?.toLowerCase() === cleaned;

                              return (
                                <span
                                  key={wIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWordClick(token, sent.text);
                                  }}
                                  className={`inline-block cursor-pointer px-0.5 rounded transition duration-150 ${
                                    isCurrentlySelected
                                      ? "bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400"
                                      : isSaved
                                      ? "bg-amber-500/20 text-amber-200 border-b-2 border-amber-400"
                                      : "hover:bg-indigo-500/20 hover:text-indigo-200"
                                  }`}
                                  title="Anlamını & Fonetiğini Gör"
                                >
                                  {token}{" "}
                                </span>
                              );
                            })}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sayfa Alt Göstergesi: Sayfa X / Y */}
                  <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{t("mode_book", "Kitap Modu")}</span>
                    </span>

                    <div className="px-3 py-1 rounded-full font-mono text-xs border border-slate-700 bg-slate-800/80 text-slate-300">
                      {t("page_indicator", "Sayfa {cur} / {total}", {
                        cur: currentPage + 1,
                        total: totalPages,
                      })}
                    </div>

                    {/* Mobildeki mini < ve > okları */}
                    <div className="flex sm:hidden items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 disabled:opacity-30"
                        aria-label={t("btn_prev_page", "Önceki Sayfa")}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 disabled:opacity-30"
                        aria-label={t("btn_next_page", "Sonraki Sayfa")}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="hidden sm:inline-block font-mono">
                      %{progressPercent}
                    </span>
                  </div>
                </div>

                {/* Sağ Sayfa Çevirme Butonu (>) */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  aria-label={t("btn_next_page", "Sonraki Sayfa")}
                  title={t("btn_next_page", "Sonraki Sayfa")}
                  className={`hidden sm:flex items-center justify-center w-12 shrink-0 rounded-2xl border transition-all ${
                    currentPage >= totalPages - 1
                      ? "opacity-20 cursor-not-allowed border-transparent text-slate-600"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 shadow-md active:scale-95 cursor-pointer"
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            /* 2. ODAK MODU (FOCUS VIEW - TEK SÜTUN DİKEY KAYDIRMA) */
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl leading-relaxed text-slate-200 space-y-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {paragraphs.map((para, pIdx) => {
                  const paraSentences = allSentences.filter((s) => s.paragraphIndex === pIdx);
                  return (
                    <p key={pIdx} className="leading-8 text-base sm:text-lg">
                      {paraSentences.map((sent) => {
                        const isSpeaking = activeSentenceIdx === sent.globalIndex && isPlayingTTS;
                        return (
                          <span
                            key={sent.globalIndex}
                            className={`transition-all duration-200 inline mr-1.5 ${
                              isSpeaking
                                ? "bg-indigo-500/25 ring-1 ring-indigo-400/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] rounded px-1"
                                : "hover:bg-slate-800/40 rounded px-1"
                            }`}
                          >
                            {sent.tokens.map((token, wIdx) => {
                              const cleaned = cleanWord(token).toLowerCase();
                              const isSaved = savedWords.has(cleaned);
                              const isCurrentlySelected = selectedWord?.toLowerCase() === cleaned;

                              return (
                                <span
                                  key={wIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWordClick(token, sent.text);
                                  }}
                                  className={`inline-block cursor-pointer px-0.5 rounded transition duration-150 ${
                                    isCurrentlySelected
                                      ? "bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400"
                                      : isSaved
                                      ? "bg-amber-500/20 text-amber-200 border-b-2 border-amber-400"
                                      : "hover:bg-indigo-500/20 hover:text-indigo-200"
                                  }`}
                                  title="Anlamını & Fonetiğini Gör"
                                >
                                  {token}{" "}
                                </span>
                              );
                            })}
                          </span>
                        );
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* ÇIKARTILAN HEDEF KELİMELER (İnteraktif Flashcardlar) */}
          {isExtractingVocab ? (
            <div className="flex items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 gap-2.5 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Metin analiz ediliyor ve hedef kelimeler çıkartılıyor...</span>
            </div>
          ) : (
            extractedVocabulary.length > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <TargetVocabularyFlashcards
                  vocabulary={extractedVocabulary}
                  decks={decks}
                  selectedDeckId={selectedDeckId}
                  onCardSaved={(savedWord) => {
                    setSavedWords((prev) => new Set(prev).add(savedWord.toLowerCase()));
                  }}
                />
              </div>
            )
          )}

          {/* ==================== 2. ALT SABİT SES OYNATICI (STICKY AUDIO PLAYER BAR) ==================== */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 sm:px-8 py-3 shadow-2xl transition-all">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Sol: Cümle Navigasyon & Oynat/Durdur */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-1.5">
                  {/* Önceki Cümle (⏮) */}
                  <button
                    type="button"
                    onClick={handlePrevSentence}
                    disabled={activeSentenceIdx <= 0}
                    title={t("audio_prev_sentence", "Önceki Cümle")}
                    aria-label={t("audio_prev_sentence", "Önceki Cümle")}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  {/* Oynat / Duraklat (⏯) */}
                  <button
                    type="button"
                    onClick={toggleTTS}
                    title={isPlayingTTS ? t("audio_pause", "Duraklat") : t("audio_play", "Oynat")}
                    aria-label={isPlayingTTS ? t("audio_pause", "Duraklat") : t("audio_play", "Oynat")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                      isPlayingTTS
                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                    }`}
                  >
                    {isPlayingTTS ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>{t("audio_pause", "Duraklat")}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>{t("audio_play", "Oynat")}</span>
                      </>
                    )}
                  </button>

                  {/* Sonraki Cümle (⏭) */}
                  <button
                    type="button"
                    onClick={handleNextSentence}
                    disabled={activeSentenceIdx >= allSentences.length - 1}
                    title={t("audio_next_sentence", "Sonraki Cümle")}
                    aria-label={t("audio_next_sentence", "Sonraki Cümle")}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobilde İlerleme Yüzdesi */}
                <div className="sm:hidden text-xs font-mono text-indigo-400 font-bold">
                  %{progressPercent}
                </div>
              </div>

              {/* Orta: Tıklanabilir İlerleme Kaydırıcısı (Slider) ve Cümle Sayacı */}
              <div className="flex-1 w-full max-w-md flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>
                    {t("audio_sentence_progress", "Cümle {cur} / {total}", {
                      cur: allSentences.length > 0 ? activeSentenceIdx + 1 : 0,
                      total: allSentences.length,
                    })}
                  </span>
                  <span className="hidden sm:inline font-mono text-indigo-400 font-bold">
                    %{progressPercent}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, allSentences.length - 1)}
                  value={activeSentenceIdx}
                  onChange={(e) => handleSeekSentence(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition"
                />
              </div>

              {/* Sağ: Oynatma Hızı Seçicisi (0.75x | 1.0x | 1.25x) */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shrink-0">
                {[0.75, 1.0, 1.25].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    title={t("playback_speed", "Hız: {rate}x", { rate: spd })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      speechRate === spd
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KELİME KARTI MODALI (İnteraktif Tıklama Pop-up'ı) */}
      {selectedWord && (
        <WordCardModal
          word={selectedWord}
          contextSentence={activeSentence}
          decks={decks}
          selectedDeckId={selectedDeckId}
          onClose={() => setSelectedWord(null)}
          onCardSaved={(savedWord: string) => {
            setSavedWords((prev) => new Set(prev).add(savedWord.toLowerCase()));
          }}
        />
      )}
    </main>
  );
}
