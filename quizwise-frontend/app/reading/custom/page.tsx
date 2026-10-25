"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Loader2
} from "lucide-react";
import WordCardModal from "../../components/reading/WordCardModal";
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
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [activeSentence, setActiveSentence] = useState<string>("");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [wordLookupLoading, setWordLookupLoading] = useState(false);
  const [extractedVocabulary, setExtractedVocabulary] = useState<TargetVocabularyItem[]>([]);
  const [isExtractingVocab, setIsExtractingVocab] = useState(false);

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

    // Yerel akıllı çıkarıcı (fallback)
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

  // Desteleri çek ve sessionStorage'dan aktarılan metin varsa yükle
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

  // Desteleri çek (kelime kaydetmek için)
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const res = await fetch(`${API_BASE}/decks`);
        if (res.ok) {
          const data = await res.json();
          setDecks(data || []);
          if (data && data.length > 0) {
            setSelectedDeckId(data[0].id);
          }
        }
      } catch (e) {
        console.error("Desteler yüklenemedi:", e);
      }
    };
    fetchDecks();
  }, []);

  const handleLoadSample = (sample: SampleArticle) => {
    setArticleTitle(getSampleTitle(sample));
    setInputText(sample.content);
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

  // TTS (Web Speech API)
  const toggleTTS = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Tarayıcınız sesli okumayı desteklemiyor.");
      return;
    }

    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(inputText);
    utterance.lang = "en-US";
    utterance.rate = speechRate;

    utterance.onstart = () => setIsPlayingTTS(true);
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  const paragraphs = inputText.split("\n").filter((p) => p.trim().length > 0);
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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

      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                {t("badge_academic_tool", "AKADEMİK & SINAV ARACI")}
              </span>
              <span className="text-xs text-slate-400">
                BBC • The Economist • {t("tag_free_text", "Serbest Metin")}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("tab_custom_analyzer", "Serbest Makale & Haber Çözümle")}
            </h1>
          </div>
        </div>

        {isReadingMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isPlayingTTS) window.speechSynthesis.cancel();
                setIsPlayingTTS(false);
                setIsReadingMode(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t("btn_edit_text", "Metni Düzenle")}</span>
            </button>

            <button
              onClick={toggleTTS}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                isPlayingTTS
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
            >
              {isPlayingTTS ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{t("btn_stop", "Durdur")}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t("btn_listen_tts", "Sesli Dinle (TTS)")}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* MOD 1: METİN GİRİŞ & HAZIR ÖRNEKLER PANELİ */}
      {!isReadingMode ? (
        <div className="space-y-6">
          {/* Hazır Prestijli Makale Şablonları */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t("quick_start_title", "HIZLI BAŞLA: ÖRNEK AKADEMİK & KARİYER MAKALELERİ")}
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                {t("quick_start_sub", "Tek tıkla yükleyin")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_ARTICLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="group flex flex-col p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      {sample.level}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{sample.source}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
                    {getSampleTitle(sample)}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-auto">
                    {sample.category} • {t("ready_interactive_reading", "İnteraktif okumaya hazır")}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Kendi Metnini / Haberini Yapıştırma Alanı */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
        /* MOD 2: İNTERAKTİF OKUMA ODASI */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Makale Başlık & Bilgi Kartı */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
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

            {/* TTS Hız Ayarı & Bilgi */}
            <div className="flex items-center gap-3 bg-slate-950/70 p-2 px-3 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">{t("label_playback_speed", "Okuma Hızı:")}</span>
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setSpeechRate(rate);
                    if (isPlayingTTS) {
                      window.speechSynthesis.cancel();
                      setIsPlayingTTS(false);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg font-mono font-bold transition ${
                    speechRate === rate
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* İpucu Barı */}
          <div className="flex items-center space-x-2 text-xs text-indigo-300 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl px-4 py-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              {t("interactive_mode_banner_tip", "Vocaship İnteraktif Mod: Metindeki bilmediğiniz herhangi bir kelimenin üzerine tıklayın. Anında fonetik telaffuzu, çevirisi ve kelime kartı açılacaktır.")}
            </span>
          </div>

          {/* İnteraktif Metin Gövdesi */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl leading-relaxed text-slate-200 space-y-6">
            {paragraphs.map((para, pIdx) => (
              <p key={pIdx} className="leading-8 text-base sm:text-lg">
                {para.split(" ").map((token, wIdx) => {
                  const cleaned = cleanWord(token).toLowerCase();
                  const isSaved = savedWords.has(cleaned);
                  const isCurrentlySelected = selectedWord?.toLowerCase() === cleaned;

                  return (
                    <span
                      key={`${pIdx}-${wIdx}`}
                      onClick={() => handleWordClick(token, para)}
                      className={`inline-block cursor-pointer px-0.5 rounded transition-colors duration-150 ${
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
              </p>
            ))}
          </div>

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
