"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Volume2,
  Check,
  ChevronRight,
  Loader2,
  BookOpen,
  Copy,
  RotateCcw,
  Award,
  Layers,
  Wand2
} from "lucide-react";
import confetti from "canvas-confetti";

export interface BoardStoryWeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWords: string[];
  activeBranch?: string;
  onStoryComplete?: (finalStory: string, usedWords: string[]) => void;
}

export interface StorySegmentItem {
  id: string;
  text: string;
  usedWords: string[];
  selectedChoiceTitle?: string;
}

export default function BoardStoryWeaveModal({
  isOpen,
  onClose,
  targetWords = [],
  activeBranch = "science",
  onStoryComplete,
}: BoardStoryWeaveModalProps) {
  // Varsayılan hedef kelimeler (eğer tahtadan hiç terim gelmediyse)
  const effectiveWords = targetWords.length > 0
    ? Array.from(new Set(targetWords))
    : ["Mitochondria", "Photosynthesis", "Osmosis", "Homeostasis", "Metabolism"];

  const [storySegments, setStorySegments] = useState<StorySegmentItem[]>([]);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [usedWordsPool, setUsedWordsPool] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [maxTurns] = useState(4);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const storyEndRef = useRef<HTMLDivElement | null>(null);

  // Seslendirme (Web Speech API)
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // ** işaretlerini kaldırıp temiz metin oku
      const clean = text.replace(/\*\*/g, "");
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  // Hikayeyi ilerleten ana motor çağrısı
  const fetchNextSegment = async (choice?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const previousTexts = storySegments.map((s) => s.text);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/classroom/story-weave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_words: effectiveWords,
          story_history: previousTexts,
          selected_choice: choice || null,
          grade_level: "B1-B2",
        }),
      });

      if (!response.ok) {
        throw new Error(`Sunucu yanıtı: ${response.status}`);
      }

      const data = await response.json();
      const newSegment: StorySegmentItem = {
        id: `seg_${Date.now()}`,
        text: data.next_segment,
        usedWords: data.used_words || [],
        selectedChoiceTitle: choice,
      };

      setStorySegments((prev) => [...prev, newSegment]);
      setCurrentChoices(data.choices || []);

      // Kullanılan kelimeler havuzunu güncelle
      const newUsed = Array.from(
        new Set([...usedWordsPool, ...(data.used_words || [])])
      );
      setUsedWordsPool(newUsed);

      // Konfeti patlat
      try {
        confetti({ particleCount: 35, spread: 60 });
      } catch (e) {}

      // Otomatik seslendir
      speakText(data.next_segment);

      if (turnCount >= maxTurns) {
        setIsCompleted(true);
        if (onStoryComplete) {
          const fullText = [...previousTexts, data.next_segment]
            .map((t) => t.replace(/\*\*/g, ""))
            .join("\n\n");
          onStoryComplete(fullText, newUsed);
        }
      } else {
        setTurnCount((prev) => prev + 1);
      }
    } catch (err: any) {
      console.warn("Story weave API failed, using client-side fallback:", err);
      // Client-Side procedural fallback
      const pickedWord = effectiveWords.find((w) => !usedWordsPool.includes(w)) || effectiveWords[0];
      const fallbackSegment = choice
        ? `The team opted to ${choice.toLowerCase().replace(/^[a-c]\)\s*/, "")}. As they stepped forward, mysterious biosensors registered a surge of **${pickedWord}** glowing brightly in the dark.`
        : `Deep within the secret laboratory, an ancient mechanical apparatus began humming with unexpected vitality, its core demonstrating active **${pickedWord}**.`;

      const newSegment: StorySegmentItem = {
        id: `seg_${Date.now()}`,
        text: fallbackSegment,
        usedWords: [pickedWord],
        selectedChoiceTitle: choice,
      };

      setStorySegments((prev) => [...prev, newSegment]);
      setUsedWordsPool((prev) => Array.from(new Set([...prev, pickedWord])));
      setCurrentChoices([
        "A) Advance toward the inner control vault to extract raw telemetry.",
        "B) Isolate the perimeter barrier before pressure differentials collapse.",
        "C) Transmit the biosensor readings to the central university satellite."
      ]);

      speakText(fallbackSegment);

      if (turnCount >= maxTurns) {
        setIsCompleted(true);
      } else {
        setTurnCount((prev) => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Modal ilk açıldığında ilk paragrafı otomatik üret
  useEffect(() => {
    if (isOpen && storySegments.length === 0) {
      fetchNextSegment();
    }
  }, [isOpen]);

  // Yeni paragraf eklendikçe en alta yumuşakça kaydır
  useEffect(() => {
    if (storyEndRef.current) {
      storyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [storySegments, isLoading]);

  // Seçenek Tıklandığında
  const handleSelectChoice = (choice: string) => {
    if (isLoading || isCompleted) return;
    fetchNextSegment(choice);
  };

  // Hikayeyi Baştan Başlat
  const handleRestart = () => {
    setStorySegments([]);
    setCurrentChoices([]);
    setUsedWordsPool([]);
    setTurnCount(1);
    setIsCompleted(false);
    fetchNextSegment();
  };

  // Hikayeyi Kopyala
  const handleCopyStory = () => {
    const fullStory = storySegments.map((s) => s.text.replace(/\*\*/g, "")).join("\n\n");
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Metin içindeki **bold** kelimeleri fosforlu parlayan rozet olarak render eden yardımcı
  const renderFormattedText = (rawText: string) => {
    const parts = rawText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const word = part.slice(2, -2);
        return (
          <span
            key={`highlight_${i}`}
            className="inline-block mx-1 px-2 py-0.5 rounded-lg bg-amber-400/25 border border-amber-400/50 text-amber-200 font-sans font-black shadow-sm shadow-amber-400/20 animate-pulse tracking-wide"
          >
            {word}
          </span>
        );
      }
      return <span key={`text_${i}`}>{part}</span>;
    });
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="story-weave-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none touch-manipulation"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-slate-950 border-2 border-indigo-500/50 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* ======================================================================= */}
        {/* 1. ÜST BAŞLIK BARI                                                      */}
        {/* ======================================================================= */}
        <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shadow-inner">
              <Wand2 className="w-5 h-5 text-indigo-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Sınıfça Kolektif Hikaye Sahnesi
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                  Crowdsourced Story Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Hedef kelimeler sınıfın ortak oylarıyla canlı bir maceraya dokunuyor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Tur Rozeti */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold flex items-center gap-1.5 text-amber-300">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Tur {Math.min(turnCount, maxTurns)} / {maxTurns}</span>
            </div>

            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ======================================================================= */}
        {/* 2. HEDEF KELİMELER ŞERİDİ (TARGET WORDS CHIPS)                          */}
        {/* ======================================================================= */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-5 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Hedef Terimler:</span>
          </span>

          <div className="flex items-center gap-1.5 flex-nowrap">
            {effectiveWords.map((word) => {
              const isUsed = usedWordsPool.some(
                (u) => u.toLowerCase() === word.toLowerCase()
              );
              return (
                <span
                  key={word}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                    isUsed
                      ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-emerald-500/20"
                      : "bg-slate-950/70 border border-slate-800 text-slate-400"
                  }`}
                >
                  {isUsed ? (
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                  <span>{word}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. ANA HİKAYE AKIŞ SAHNESİ (PARAGRAFLAR & OKUMA BÖLGESİ)                 */}
        {/* ======================================================================= */}
        <div className="flex-1 min-h-[220px] overflow-y-auto p-5 sm:p-7 space-y-4 font-serif text-slate-200 scrollbar-thin scrollbar-thumb-slate-800">
          {storySegments.map((segment, idx) => (
            <div
              key={segment.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-2.5 relative group animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Paragraf Başlığı & Önceki Hamle */}
              <div className="flex items-center justify-between text-xs font-sans pb-2 border-b border-slate-800/80 text-slate-400">
                <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bölüm #{idx + 1}</span>
                  {segment.selectedChoiceTitle && (
                    <span className="text-slate-400 font-normal italic truncate max-w-md">
                      — &ldquo;{segment.selectedChoiceTitle}&rdquo;
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => speakText(segment.text)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-sans font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Bu Paragrafı Seslendir"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dinlet</span>
                </button>
              </div>

              {/* Paragraf Metni (Geniş Tahta Yazı Boyutu) */}
              <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-slate-100 tracking-wide">
                {renderFormattedText(segment.text)}
              </p>
            </div>
          ))}

          {/* AI Yükleniyor Göstergesi */}
          {isLoading && (
            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-center gap-3 text-indigo-300 text-sm font-sans font-bold animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span>✨ Gemini 2.5 Flash yeni olay örgüsünü ve seçimleri dokuyor...</span>
            </div>
          )}

          <div ref={storyEndRef} />
        </div>

        {/* ======================================================================= */}
        {/* 4. ALT SEÇENEKLER & OYLAMA ALANI (3 BÜYÜK DOKUNMATİK SEÇENEK KARTI)       */}
        {/* ======================================================================= */}
        <footer className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 shrink-0 space-y-3">
          {!isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans text-slate-300 font-bold px-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Sıradaki Olay Ne Olsun? (Sınıfça Seçin):</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Bir seçeneğe dokunarak hikayeyi yönlendirin
                </span>
              </div>

              {/* 3 Büyük Dokunmatik Seçenek Kartı */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {currentChoices.map((choice, i) => (
                  <button
                    key={`choice_${i}`}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectChoice(choice)}
                    className={`min-h-[58px] p-3.5 rounded-2xl bg-slate-950/90 border-2 border-slate-800 hover:border-indigo-500 text-left text-xs sm:text-sm font-sans font-bold text-slate-200 hover:text-white flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer shadow-md select-none touch-manipulation active:scale-[0.98] group ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="flex-1 line-clamp-2 leading-snug">
                      {choice}
                    </span>
                    <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Hikaye Tamamlandı Başarı Ekranı */
            <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 font-black text-base">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Kolektif Hikaye Başarıyla Dokundu!</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Tüm hedef kelimeler kullanıldı ({usedWordsPool.length}/{effectiveWords.length}). Metin kaydedildi ve ödev havuzuna aktarılmaya hazır.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyStory}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Kopyalandı!" : "Metni Kopyala"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Yeniden Başlat</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold transition cursor-pointer active:scale-95 shadow-md shadow-indigo-600/30"
                >
                  Tamamla & Tahtaya Dön ➔
                </button>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

