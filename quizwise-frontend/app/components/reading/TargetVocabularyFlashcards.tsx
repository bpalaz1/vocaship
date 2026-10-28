"use client";

import React, { useState } from "react";
import {
  Volume2,
  PlusCircle,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Loader2,
  Layers,
} from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";
import { API_BASE } from "../../config";
import PronunciationCoach from "../PronunciationCoach";

export interface TargetVocabularyItem {
  word: string;
  phonetic?: string;
  meaning?: string;
  turkish_meaning?: string;
  translations?: Record<string, string>;
  context_sentence?: string;
  example?: string;
}

interface TargetVocabularyFlashcardsProps {
  vocabulary: TargetVocabularyItem[];
  decks?: Array<{ id: string; title: string }>;
  selectedDeckId?: string;
  onCardSaved?: (word: string) => void;
  className?: string;
}

interface SingleFlashcardProps {
  item: TargetVocabularyItem;
  decks?: Array<{ id: string; title: string }>;
  selectedDeckId?: string;
  forceRevealed?: boolean | null;
  onCardSaved?: (word: string) => void;
}

function SingleFlashcard({
  item,
  decks,
  selectedDeckId,
  forceRevealed = null,
  onCardSaved,
}: SingleFlashcardProps) {
  const { t, currentLang } = useTranslation();
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Parent "Reveal All / Hide All" override
  const displayedRevealed = forceRevealed !== null ? forceRevealed : isRevealed;

  const meaningText =
    (item.translations && item.translations[currentLang]) ||
    item.turkish_meaning ||
    item.meaning ||
    "";
  const exampleSentence = item.context_sentence || item.example || "";

  // Seçilen arayüz diline göre renkli anlam metni
  const getLanguageColorClass = () => {
    switch (currentLang) {
      case "en":
        return "text-sky-300 bg-sky-500/15 border-sky-500/30";
      case "de":
        return "text-amber-300 bg-amber-500/15 border-amber-500/30";
      case "es":
        return "text-rose-300 bg-rose-500/15 border-rose-500/30";
      case "fr":
        return "text-violet-300 bg-violet-500/15 border-violet-500/30";
      case "tr":
      default:
        return "text-emerald-300 bg-emerald-500/15 border-emerald-500/30";
    }
  };

  // 1. Telaffuz Çalma (Web Speech API) - Kartın açılmasını engeller (e.stopPropagation)
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.word);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 2. Desteye Kart Olarak Ekleme
  const handleAddToDeck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved || isSaving) return;

    const targetDeckId = selectedDeckId || (decks && decks.length > 0 ? decks[0].id : "");
    if (!targetDeckId) {
      alert(t("select_deck_warning", "Lütfen önce kelimelerin kaydedileceği bir deste seçin veya oluşturun."));
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/decks/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deck_id: targetDeckId,
          word: item.word,
          phonetic: item.phonetic || null,
          meanings: [
            {
              part_of_speech: "",
              translation: meaningText,
              definition: meaningText,
            },
          ],
          example_sentences: exampleSentence ? [{ en: exampleSentence, tr: "" }] : [],
          collocations: [],
        }),
      });

      if (res.ok) {
        setIsSaved(true);
        if (onCardSaved) onCardSaved(item.word);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Kelime kaydedilemedi.");
      }
    } catch (err) {
      console.error("Kelime ekleme hatası:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleReveal = () => {
    setIsRevealed((prev) => !prev);
  };

  return (
    <div
      onClick={toggleReveal}
      className={`group relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg select-none ${
        displayedRevealed
          ? "bg-slate-900/95 border-emerald-500/40 hover:border-emerald-500/60 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
          : "bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/95 hover:-translate-y-0.5"
      }`}
    >
      {/* Üst Kısım: Kelime, Fonetik, Telaffuz ve Desteye Ekle */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start justify-between gap-2">
          {/* Kelime & Fonetik & Ses Butonu */}
          <div className="flex items-center flex-wrap gap-2">
            <h4 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-200 transition tracking-wide">
              {item.word}
            </h4>

            {item.phonetic && (
              <span className="text-xs text-indigo-400/90 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                {item.phonetic}
              </span>
            )}

            <button
              type="button"
              onClick={handleSpeak}
              title={t("listen_pronunciation", "Telaffuzu Dinle")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-600/20 transition cursor-pointer active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* "+ Desteme Ekle" Butonu */}
          <button
            type="button"
            onClick={handleAddToDeck}
            disabled={isSaved || isSaving}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer active:scale-95 ${
              isSaved
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500/50 shadow-sm"
            }`}
            title={isSaved ? t("added_to_deck", "Desteye Eklendi") : t("add_to_deck", "+ Desteme Ekle")}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t("added_to_deck", "Destede")}</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
                <span>{t("add_to_deck", "+ Desteme Ekle")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alt Kısım: Gizli / Açılır Anlam & Örnek Cümle */}
      <div className="pt-2 border-t border-slate-800/80">
        {!displayedRevealed ? (
          /* GİZLİ CEVAP / ANLAMI GÖR BUTONU */
          <div className="w-full py-2.5 px-3 rounded-xl bg-slate-950/70 hover:bg-indigo-950/40 border border-indigo-500/25 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 shadow-inner group/btn">
            <Eye className="w-3.5 h-3.5 text-indigo-400 group-hover/btn:scale-110 transition" />
            <span>[ 👁️ {t("reveal_meaning", "Anlamı Gör")} ]</span>
          </div>
        ) : (
          /* AÇILMIŞ CEVAP: Renkli Anlam Metni & Örnek Cümle */
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs sm:text-sm font-bold border px-2.5 py-1 rounded-lg ${getLanguageColorClass()}`}>
                {meaningText || t("no_meaning", "Anlamı bulunamadı")}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRevealed(false);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition px-1.5 py-0.5 rounded hover:bg-slate-800"
                title={t("hide_meaning", "Anlamı Gizle")}
              >
                <EyeOff className="w-3 h-3" />
                <span>{t("hide_meaning", "Gizle")}</span>
              </button>
            </div>

            {exampleSentence && (
              <div className="pt-2 border-t border-slate-800/60 space-y-2">
                <p className="text-[11px] sm:text-xs text-slate-400 italic line-clamp-2 leading-relaxed">
                  &ldquo;{exampleSentence}&rdquo;
                </p>
                <div onClick={(e) => e.stopPropagation()}>
                  <PronunciationCoach targetSentence={exampleSentence} compact className="w-full" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TargetVocabularyFlashcards({
  vocabulary,
  decks,
  selectedDeckId,
  onCardSaved,
  className = "",
}: TargetVocabularyFlashcardsProps) {
  const { t } = useTranslation();
  const [globalReveal, setGlobalReveal] = useState<boolean | null>(null);

  if (!vocabulary || vocabulary.length === 0) return null;

  const handleToggleAll = () => {
    setGlobalReveal((prev) => (prev === true ? false : true));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Başlık ve Eylem Barı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{t("extracted_target_words", "Çıkartılan Hedef Kelimeler")}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {vocabulary.length} {t("words_label", "Kelime")}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {t(
                "flashcard_interactive_hint",
                "Kartlara tıklayarak anlamları test edin veya destenize kaydedin"
              )}
            </p>
          </div>
        </div>

        {/* Tümünü Aç / Gizle Butonu */}
        <button
          type="button"
          onClick={handleToggleAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          {globalReveal ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("hide_meaning", "Tümünü Gizle")}</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("reveal_meaning", "Tümünü Göster")}</span>
            </>
          )}
        </button>
      </div>

      {/* Flashcard Kartları Grid Yapısı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {vocabulary.map((item, idx) => (
          <SingleFlashcard
            key={`${item.word}-${idx}`}
            item={item}
            decks={decks}
            selectedDeckId={selectedDeckId}
            forceRevealed={globalReveal}
            onCardSaved={onCardSaved}
          />
        ))}
      </div>
    </div>
  );
}
