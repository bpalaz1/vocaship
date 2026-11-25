"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  PenTool,
  BookOpen,
  Mic,
  Layers,
  Columns2,
  Rows2,
  RefreshCw,
  Lightbulb,
  Sparkles,
  Check,
  Plus,
  Send,
  ChevronDown,
  ChevronUp,
  Archive,
  Loader2,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { fetchDecksList, getActiveDeckCards } from "../utils/activeDeckStore";

type SourceType = "story" | "speaking" | "deck";
type SplitMode = "side_by_side" | "top_bottom";

interface TargetWordInfo {
  word: string;
  meaning?: string;
  example?: string;
  phonetic?: string;
}

interface WritingCorrection {
  original: string;
  corrected: string;
  type: "spelling" | "grammar" | "style" | string;
  explanation: string;
}

interface SuggestedWord {
  word: string;
  meaning: string;
  phonetic?: string;
}

interface WritingAnalysisResult {
  cefr_level: string;
  corrected_text: string;
  corrections: WritingCorrection[];
  used_target_words: string[];
  c1_natural_version: string;
  suggested_words: SuggestedWord[];
}

interface WritingArchiveEntry {
  id: string;
  createdAt: string;
  sourceType: SourceType;
  sourceTitle: string;
  text: string;
  cefrLevel: string;
  c1Version: string;
  usedWords: string[];
}

const ARCHIVE_STORAGE_KEY = "vocaship_writing_archive";
const FREE_DAILY_LIMIT = 2;

function isWordUsedInText(text: string, word: string): boolean {
  const clean = (word || "").trim().toLowerCase();
  if (!clean || !text) return false;
  const stem = clean.endsWith("e") && clean.length > 4 ? clean.slice(0, -1) : clean;
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}[a-z]*\\b`, "i");
  return regex.test(text);
}

function WritingStudioContent() {
  const searchParams = useSearchParams();
  const { user, isGuest, openRegistrationGate } = useAuth();
  const { userProfile } = useProfile();
  const { t, language } = useLanguage();

  const isPro = Boolean(
    user &&
      (user.isPro ||
        user.planTier === "pro" ||
        user.role === "admin" ||
        userProfile?.is_pro ||
        userProfile?.planTier === "pro" ||
        userProfile?.plan_tier === "pro")
  );

  const paramSource = searchParams.get("source");
  const initialSource: SourceType =
    paramSource === "speaking" || paramSource === "deck" || paramSource === "story"
      ? paramSource
      : "story";

  const [sourceType, setSourceType] = useState<SourceType>(initialSource);
  const [splitMode, setSplitMode] = useState<SplitMode>("side_by_side");

  // Kaynak & Hedef Kelime Havuzu (Maksimum 5 Kelime)
  const [sourceTitle, setSourceTitle] = useState<string>("");
  const [taskPrompt, setTaskPrompt] = useState<string>(
    "Hikayenin sonunu veya ana fikrini kendi cümlelerinle yeniden kurgula."
  );
  const [sourceContext, setSourceContext] = useState<string>("");
  const [targetWords, setTargetWords] = useState<TargetWordInfo[]>([]);
  const [selectedWordPopup, setSelectedWordPopup] = useState<TargetWordInfo | null>(null);

  // Deste Kaynağı State'i
  const [decks, setDecks] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [deckAllCards, setDeckAllCards] = useState<TargetWordInfo[]>([]);

  // Yazım Editörü & Koç
  const [text, setText] = useState<string>("");
  const [showStarters, setShowStarters] = useState<boolean>(false);

  // Analiz & Karne
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<WritingAnalysisResult | null>(null);
  const [dailyUsed, setDailyUsed] = useState<number>(0);

  // Önerilen Kelimeyi Desteye Ekleme
  const [savedSuggestedWords, setSavedSuggestedWords] = useState<Record<string, boolean>>({});
  const [savingWordKey, setSavingWordKey] = useState<string | null>(null);

  // Aktif Sınıf Ödev Teslimi
  const [activeClass, setActiveClass] = useState<{ classId: string; className: string } | null>(null);
  const [homeworkSent, setHomeworkSent] = useState<boolean>(false);
  const [sendingHomework, setSendingHomework] = useState<boolean>(false);

  // Yazım Arşivi
  const [archiveOpen, setArchiveOpen] = useState<boolean>(false);
  const [archiveList, setArchiveList] = useState<WritingArchiveEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      const used = Number(localStorage.getItem(`vocaship_writing_daily_${today}`) || "0");
      setDailyUsed(Number.isFinite(used) ? used : 0);
    } catch {}
    try {
      const rawArch = localStorage.getItem(ARCHIVE_STORAGE_KEY);
      if (rawArch) {
        const parsed = JSON.parse(rawArch);
        if (Array.isArray(parsed)) setArchiveList(parsed);
      }
    } catch {}
    try {
      const rawClass = localStorage.getItem("vocaship_active_class");
      if (rawClass) {
        const parsed = JSON.parse(rawClass);
        if (parsed?.classId) {
          setActiveClass({
            classId: parsed.classId,
            className: parsed.className || "Aktif Sınıf",
          });
        }
      }
    } catch {}
  }, []);

  const loadFromStory = useCallback(() => {
    setSourceType("story");
    setSelectedWordPopup(null);
    if (typeof window === "undefined") return;
    try {
      const raw =
        sessionStorage.getItem("vocaship_active_writing_context") ||
        sessionStorage.getItem("vocaship_active_story_context");
      if (raw) {
        const ctx = JSON.parse(raw);
        if (!ctx?.sourceType || ctx.sourceType === "story") {
          setSourceTitle(ctx.title || "Okuma Hikayesi");
          setSourceContext(ctx.snippet || ctx.content || ctx.title || "");
          setTaskPrompt(
            ctx.title
              ? `"${ctx.title}" hikayesinin sonunu kendi cümlelerinle yeniden kurgula.`
              : "Hikayenin sonunu kendi cümlelerinle yeniden kurgula."
          );
          const fullVocab = Array.isArray(ctx.full_vocabulary) ? ctx.full_vocabulary : [];
          const list: TargetWordInfo[] = fullVocab.length > 0
            ? fullVocab.slice(0, 5).map((v: any) => ({
                word: v.word,
                meaning: v.turkish_meaning || v.meaning || "",
                example: v.context_sentence || v.example || "",
              }))
            : (Array.isArray(ctx.target_vocabulary) ? ctx.target_vocabulary : []).slice(0, 5).map((w: any) => ({
                word: typeof w === "string" ? w : w.word,
                meaning: typeof w === "string" ? "" : w.turkish_meaning || "",
              }));
          if (list.length > 0) {
            setTargetWords(list);
            return;
          }
        }
      }
    } catch {}

    setSourceTitle("Günlük Okuma Pratiği");
    setSourceContext("A short reflection about a memorable story or personal discovery.");
    setTaskPrompt("Okuduğun bir hikayeden aklında kalan bölümü kendi cümlelerinle özetle.");
    setTargetWords([
      { word: "discover", meaning: "keşfetmek", example: "She began to discover new ideas in the library." },
      { word: "journey", meaning: "yolculuk", example: "Every small step made the journey meaningful." },
      { word: "curious", meaning: "meraklı", example: "He felt curious about the hidden room." },
      { word: "calm", meaning: "sakin", example: "The morning air felt calm and refreshing." },
      { word: "remember", meaning: "hatırlamak", example: "I still remember the ending of that story." },
    ]);
  }, []);

  const loadFromSpeaking = useCallback(() => {
    setSourceType("speaking");
    setSelectedWordPopup(null);
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("vocaship_active_writing_context");
      if (raw) {
        const ctx = JSON.parse(raw);
        if (ctx?.sourceType === "speaking") {
          setSourceTitle(ctx.title || "Konuşma Oturumu");
          setSourceContext(ctx.snippet || ctx.title || "");
          setTaskPrompt(
            ctx.title
              ? `"${ctx.title}" sohbetinde paylaştığın fikirleri kısa ve akıcı bir paragrafa dönüştür.`
              : "Son konuşma oturumundaki düşüncelerini kendi cümlelerinle yazıya dök."
          );
          const list: TargetWordInfo[] = (Array.isArray(ctx.full_vocabulary) ? ctx.full_vocabulary : [])
            .slice(0, 5)
            .map((v: any) => ({
              word: v.word,
              meaning: v.turkish_meaning || v.meaning || "",
              example: v.example_sentence || v.example || "",
            }));
          if (list.length > 0) {
            setTargetWords(list);
            return;
          }
        }
      }
    } catch {}

    setSourceTitle("Konuşma Pratiği Özeti");
    setSourceContext("Summarizing thoughts and opinions from a recent English speaking session.");
    setTaskPrompt("Son konuşma pratiğinde savunduğun fikri 3-4 cümleyle yazıya dök.");
    setTargetWords([
      { word: "opinion", meaning: "görüş, fikir", example: "In my opinion, daily practice builds fluency." },
      { word: "explain", meaning: "açıklamak", example: "Let me explain why I agree with this idea." },
      { word: "experience", meaning: "deneyim", example: "That experience taught me something valuable." },
      { word: "confident", meaning: "özgüvenli", example: "I feel more confident when speaking slowly." },
      { word: "improve", meaning: "geliştirmek", example: "Writing helps me improve my sentence flow." },
    ]);
  }, []);

  const loadDeckWords = useCallback(async (deckId: string) => {
    if (!deckId) return;
    try {
      const cards = await getActiveDeckCards(deckId);
      const mapped: TargetWordInfo[] = (cards || []).map((c: any) => ({
        word: c.word,
        meaning: c.meaning || "",
        phonetic: c.phonetic || "",
      }));
      setDeckAllCards(mapped);
      setTargetWords(mapped.slice(0, 5));
    } catch {
      setTargetWords([]);
    }
  }, []);

  const loadFromDeck = useCallback(async () => {
    setSourceType("deck");
    setSelectedWordPopup(null);
    setTaskPrompt("Destendeki seçili kelimeleri doğal bir paragraf içinde kullan.");
    try {
      const list = await fetchDecksList();
      const realDecks = (list || []).filter(
        (d: any) => d?.id && !String(d.id).startsWith("preset_") && !String(d.id).startsWith("guest_")
      );
      setDecks(realDecks);
      if (realDecks.length > 0) {
        const targetId = selectedDeckId && realDecks.some((d: any) => d.id === selectedDeckId)
          ? selectedDeckId
          : realDecks[0].id;
        setSelectedDeckId(targetId);
        const found = realDecks.find((d: any) => d.id === targetId);
        setSourceTitle(found?.title || "Kelime Destesi");
        setSourceContext(`Writing paragraph using vocabulary from deck: ${found?.title || "My Deck"}`);
        await loadDeckWords(targetId);
      } else {
        setTargetWords([]);
      }
    } catch {}
  }, [selectedDeckId, loadDeckWords]);

  useEffect(() => {
    if (initialSource === "speaking") {
      loadFromSpeaking();
    } else if (initialSource === "deck") {
      loadFromDeck();
    } else {
      loadFromStory();
    }
  }, [initialSource, loadFromStory, loadFromSpeaking, loadFromDeck]);

  const handleRefreshWords = () => {
    setSelectedWordPopup(null);
    if (sourceType === "deck" && deckAllCards.length > 5) {
      const shuffled = [...deckAllCards].sort(() => Math.random() - 0.5).slice(0, 5);
      setTargetWords(shuffled);
    } else {
      setTargetWords((prev) => [...prev].sort(() => Math.random() - 0.5));
    }
  };

  // Canlı yeşil kelime takibi
  const matchedWordsSet = useMemo(() => {
    const set = new Set<string>();
    for (const item of targetWords) {
      if (isWordUsedInText(text, item.word)) {
        set.add(item.word.toLowerCase());
      }
    }
    return set;
  }, [text, targetWords]);

  // Fısıltı Koçu: henüz kullanılmamış kelimelerden birine göre cümle başlatıcılar
  const sentenceStarters = useMemo(() => {
    const unused = targetWords.filter((w) => !matchedWordsSet.has(w.word.toLowerCase()));
    const focus = unused[0]?.word || targetWords[0]?.word || "idea";
    if (sourceType === "story") {
      return [
        `In my version of the story, the main character decided to ${focus}...`,
        `What stood out most to me was how ${focus} changed the situation...`,
        `Looking back at the ending, I would imagine that...`,
      ];
    }
    if (sourceType === "speaking") {
      return [
        `During our discussion, I wanted to emphasize ${focus} because...`,
        `From my perspective, ${focus} plays a key role when...`,
        `To put it simply, I believe that...`,
      ];
    }
    return [
      `In everyday life, ${focus} becomes especially important when...`,
      `I recently noticed that ${focus} can help people...`,
      `One clear example of this is when someone tries to...`,
    ];
  }, [sourceType, targetWords, matchedWordsSet]);

  const handleAppendStarter = (starter: string) => {
    setText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return starter + " ";
      return `${trimmed}\n${starter} `;
    });
    setShowStarters(false);
  };

  const handleAnalyze = async () => {
    if (!text.trim() || isAnalyzing) return;
    if (!isPro && dailyUsed >= FREE_DAILY_LIMIT) {
      setAnalyzeError(
        "Ücretsiz planda günlük 2 yazım analizi hakkınız doldu. Sınırsız analiz için PRO plana geçebilirsiniz."
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setHomeworkSent(false);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_BASE}/api/v1/writing/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          text: text.trim(),
          source_type: sourceType,
          source_context: sourceContext || sourceTitle,
          target_words: targetWords.map((w) => w.word),
          native_lang: language || "tr",
        }),
      });

      clearTimeout(timer);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Metin analiz edilirken bir hata oluştu.");
      }

      const data: WritingAnalysisResult = await res.json();
      setAnalysisResult(data);

      // Günlük sayaç güncelle
      if (!isPro && typeof window !== "undefined") {
        const today = new Date().toISOString().slice(0, 10);
        const next = dailyUsed + 1;
        setDailyUsed(next);
        try {
          localStorage.setItem(`vocaship_writing_daily_${today}`, String(next));
        } catch {}
      }

      // Yazım Arşivime kaydet
      const entry: WritingArchiveEntry = {
        id: `wr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        sourceType,
        sourceTitle: sourceTitle || "Writing Practice",
        text: text.trim(),
        cefrLevel: data.cefr_level,
        c1Version: data.c1_natural_version,
        usedWords: data.used_target_words || [],
      };
      setArchiveList((prev) => {
        const updated = [entry, ...prev].slice(0, 30);
        try {
          localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setAnalyzeError("Analiz isteği zaman aşımına uğradı (10s). Lütfen tekrar deneyin.");
      } else {
        setAnalyzeError(err?.message || "Analiz sırasında beklenmeyen bir hata oluştu.");
      }
    } finally {
      clearTimeout(timer);
      setIsAnalyzing(false);
    }
  };

  const handleSaveSuggestedWord = async (item: SuggestedWord) => {
    if (!user && isGuest) {
      openRegistrationGate("Yeni kelimeleri destene kaydetmek için ücretsiz hesabını oluştur.");
      return;
    }
    setSavingWordKey(item.word);
    try {
      let targetDeck = selectedDeckId;
      if (!targetDeck) {
        const list = await fetchDecksList();
        const real = (list || []).filter(
          (d: any) => d?.id && !String(d.id).startsWith("preset_") && !String(d.id).startsWith("guest_")
        );
        if (real.length > 0) {
          targetDeck = real[0].id;
        } else {
          const createRes = await fetch(`${API_BASE}/api/v1/decks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user?.id,
              title: "Writing Studio Kelimeleri",
              description: "Yazım analizlerinden kaydedilen kelimeler",
              target_lang: "en",
              native_lang: "tr",
            }),
          });
          if (createRes.ok) {
            const created = await createRes.json();
            targetDeck = created.id;
          }
        }
      }

      if (targetDeck) {
        const res = await fetch(`${API_BASE}/api/v1/decks/${encodeURIComponent(targetDeck)}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: item.word,
            phonetic: item.phonetic || "",
            meanings: [{ translation: item.meaning, definition: item.meaning }],
            example_sentences: analysisResult?.c1_natural_version
              ? [{ target: analysisResult.c1_natural_version, native: "" }]
              : [],
          }),
        });
        if (res.ok) {
          setSavedSuggestedWords((prev) => ({ ...prev, [item.word]: true }));
        }
      }
    } catch {} finally {
      setSavingWordKey(null);
    }
  };

  const handleSendHomeworkToClass = async () => {
    if (!activeClass || !analysisResult || sendingHomework) return;
    setSendingHomework(true);
    try {
      await fetch(`${API_BASE}/api/v1/classroom/send-material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: user?.id || userProfile?.id || "student",
          class_id: activeClass.classId,
          subject: `Writing Ödevi (${analysisResult.cefr_level}): ${sourceTitle}`,
          message_body: `Öğrenci Metni:\n${text.trim()}\n\nC1 Doğal Versiyon:\n${analysisResult.c1_natural_version}`,
        }),
      });
      setHomeworkSent(true);
    } catch {} finally {
      setSendingHomework(false);
    }
  };

  const speakPreview = (sentence: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(sentence);
      u.lang = "en-US";
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 bg-[#0B0F19] text-slate-100">
      {/* 1. ÜST KONTROL ŞERİDİ (TEK SATIR) */}
      <header className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 pr-2 mr-1 border-r border-slate-800">
            <PenTool className="w-4 h-4 text-indigo-400" />
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
              {t("nav_writing", "Writing Studio")}
            </h1>
          </div>

          <button
            type="button"
            onClick={loadFromStory}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              sourceType === "story"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-950/70 text-slate-300 border border-slate-800 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📖 Hikayeden</span>
          </button>

          <button
            type="button"
            onClick={loadFromSpeaking}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              sourceType === "speaking"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-950/70 text-slate-300 border border-slate-800 hover:text-white"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>🎙️ Konuşmamdan</span>
          </button>

          <button
            type="button"
            onClick={loadFromDeck}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              sourceType === "deck"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-950/70 text-slate-300 border border-slate-800 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🃏 Destemden</span>
          </button>
        </div>

        {/* Sağ: Bölünme Yönü Anahtarı */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSplitMode("side_by_side")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              splitMode === "side_by_side"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>◫ Yan Yana</span>
          </button>
          <button
            type="button"
            onClick={() => setSplitMode("top_bottom")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              splitMode === "top_bottom"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Rows2 className="w-3.5 h-3.5" />
            <span>⊟ Üst-Alt</span>
          </button>
        </div>
      </header>

      {/* 2. BÖLÜNEBİLİR ÇALIŞMA ALANI */}
      <div
        className={`grid gap-5 items-start ${
          splitMode === "side_by_side" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* SOL / ÜST PANEL: YAZIM MASASI */}
        <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
          {/* Deste Seçici (Yalnızca Destemden aktifken) */}
          {sourceType === "deck" && decks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Deste:</span>
              <select
                value={selectedDeckId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedDeckId(id);
                  const found = decks.find((d) => d.id === id);
                  setSourceTitle(found?.title || "Kelime Destesi");
                  loadDeckWords(id);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Görev & Canlı Yeşil Kelime Havuzu */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                {taskPrompt}
              </p>
              <button
                type="button"
                onClick={handleRefreshWords}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                title="Hedef kelimeleri yenile"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 relative">
              {targetWords.slice(0, 5).map((item) => {
                const isUsed = matchedWordsSet.has(item.word.toLowerCase());
                return (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() =>
                      setSelectedWordPopup((prev) =>
                        prev?.word === item.word ? null : item
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                      isUsed
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20"
                        : "bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500/50"
                    }`}
                  >
                    {isUsed && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{item.word}</span>
                  </button>
                );
              })}
            </div>

            {selectedWordPopup && (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs space-y-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300">{selectedWordPopup.word}</span>
                  <span className="text-emerald-400 font-semibold">
                    {selectedWordPopup.meaning || "Anlam için yazmaya devam edin"}
                  </span>
                </div>
                {selectedWordPopup.example && (
                  <p className="text-[11px] text-slate-400 italic">
                    &ldquo;{selectedWordPopup.example}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Ferah Editör */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="İngilizce cümlelerini buraya yaz... Hedef kelimeleri kullandıkça yukarıdaki etiketler yeşile dönecek."
            className="w-full min-h-[220px] rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-4 text-base sm:text-lg leading-relaxed text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
          />

          {/* Fısıltı Koçu Kalıpları */}
          {showStarters && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-in fade-in duration-150">
              <span className="text-[11px] font-bold text-amber-300 block">
                💡 Cümle Başlatıcılar (Tıklayınca editöre eklenir):
              </span>
              <div className="space-y-1.5">
                {sentenceStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendStarter(starter)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-xs text-slate-200 transition cursor-pointer"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {analyzeError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analyzeError}</span>
            </div>
          )}

          {/* Alt Aksiyon Barı */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowStarters((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>💡 Ne Yazabilirim?</span>
            </button>

            <div className="flex items-center gap-3">
              {!isPro && (
                <span className="text-[11px] font-mono text-slate-400">
                  Günlük: {dailyUsed}/{FREE_DAILY_LIMIT}
                </span>
              )}
              <button
                type="button"
                disabled={!text.trim() || isAnalyzing}
                onClick={handleAnalyze}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analiz Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>✨ Analiz Et</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* SAĞ / ALT PANEL: ANALİZ & KARNE */}
        <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
          {!analysisResult ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-white">Yazım Analizi & Karne</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                Metnini tamamlayıp <strong className="text-indigo-300">Analiz Et</strong>&apos;e bastığında yazım, gramer ve C1 akıcılık karnen burada açılacak.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* 1. CEFR Seviye Rozeti & Doğru Kullanılan Hedef Kelimeler */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black">
                    CEFR: {analysisResult.cefr_level}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(analysisResult.used_target_words || []).map((w) => (
                    <span
                      key={w}
                      className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold"
                    >
                      ✓ {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* 2. Yazım & Gramer Düzeltmeleri (Diff View) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Yazım & Gramer Düzeltmeleri
                </h3>
                {analysisResult.corrections.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                    Harika! Kritik bir yazım veya gramer hatası bulunmadı.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysisResult.corrections.map((corr, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 line-through">
                            {corr.original}
                          </span>
                          <span className="text-slate-500">→</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            {corr.corrected}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{corr.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Altın Versiyon (C1 Doğal Akış) & Önerilen Kelimeler */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-950/80 to-emerald-950/30 border border-indigo-500/35 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300">
                    ✨ Altın Versiyon (C1 Doğal Akış)
                  </span>
                  <button
                    type="button"
                    onClick={() => speakPreview(analysisResult.c1_natural_version)}
                    className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dinle</span>
                  </button>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed">
                  {analysisResult.c1_natural_version}
                </p>

                {analysisResult.suggested_words.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Desteye Eklenebilecek Yeni Kelimeler:
                    </span>
                    <div className="space-y-1.5">
                      {analysisResult.suggested_words.map((sw) => {
                        const isSaved = Boolean(savedSuggestedWords[sw.word]);
                        return (
                          <div
                            key={sw.word}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-white">{sw.word}</span>
                              {sw.phonetic && (
                                <span className="ml-1.5 text-[10px] font-mono text-indigo-300">
                                  {sw.phonetic}
                                </span>
                              )}
                              <span className="ml-2 text-emerald-300">— {sw.meaning}</span>
                            </div>
                            <button
                              type="button"
                              disabled={isSaved || savingWordKey === sw.word}
                              onClick={() => handleSaveSuggestedWord(sw)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shrink-0 flex items-center gap-1 cursor-pointer ${
                                isSaved
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
                              }`}
                            >
                              {isSaved ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Eklendi</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>Desteye Ekle</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Opsiyonel Sınıf Ödevi Teslimi */}
              {activeClass && (
                <button
                  type="button"
                  disabled={homeworkSent || sendingHomework}
                  onClick={handleSendHomeworkToClass}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {homeworkSent
                      ? `✓ Ödev ${activeClass.className} Sınıfına Gönderildi`
                      : `📤 Ödevi Sınıfa Gönder (${activeClass.className})`}
                  </span>
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* 3. AÇILIR/KAPANIR YAZIM ARŞİVİM ÇEKMECESİ */}
      <section className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setArchiveOpen((prev) => !prev)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-800/50 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-indigo-400" />
            <span>🗂️ Yazım Arşivim ({archiveList.length})</span>
          </span>
          {archiveOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {archiveOpen && (
          <div className="p-4 pt-0 space-y-2.5 border-t border-slate-800/80">
            {archiveList.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Henüz kaydedilmiş bir yazım çalışmanız bulunmuyor.
              </p>
            ) : (
              archiveList.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-indigo-300">{entry.sourceTitle}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono font-bold">
                      {entry.cefrLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2">{entry.text}</p>
                  <p className="text-[11px] text-emerald-300/90 italic line-clamp-2">
                    C1: {entry.c1Version}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default function WritingStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WritingStudioContent />
    </Suspense>
  );
}
