"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  Layers,
  Check,
  Globe2,
  Briefcase,
  Lightbulb,
  Archive,
  ChevronRight,
  Mic,
  X,
} from "lucide-react";
import { SpeakingCategory } from "../../data/speakingCategories";

export interface DeckItem {
  id: string;
  title: string;
  description?: string;
  card_count?: number;
}

export interface DeckQuestionItem {
  question: string;
  target_word_hint: string;
}

export interface StoryDebateQuestionItem {
  question: string;
  theme_hint?: string;
}

export interface ActiveStoryContext {
  storyId?: string;
  id?: string;
  title: string;
  snippet?: string;
  content?: string;
  targetWords?: string[];
  target_vocabulary?: string[];
  level?: string;
  topic?: string;
}

export interface SpeakingSidebarProps {
  decks: DeckItem[];
  selectedDeck: DeckItem | null;
  deckWords: string[];
  deckQuestions: DeckQuestionItem[];
  loadingDecks: boolean;
  generatingQuestions: boolean;
  activeQuestionText: string | null;
  answeredQuestions: string[];
  onSelectDeck: (deck: DeckItem) => void;
  onSelectDeckQuestion: (question: string, targetWordHint: string) => void;
  onRefreshDeckQuestions: () => void;
  // Story-to-Speaking Bridge (Okuma Odası Bağlamı)
  activeStoryContext?: ActiveStoryContext | null;
  storyDebateQuestions?: StoryDebateQuestionItem[];
  onSelectStoryQuestion?: (question: string) => void;
  onClearStoryContext?: () => void;
  // Kategori & Genel Klasör Yapısı
  generalCultureCats: SpeakingCategory[];
  professionalCats: SpeakingCategory[];
  openCategoryId: string | null;
  activeCategory: SpeakingCategory;
  categoryActiveQuestions: Record<string, string[]>;
  onToggleCategory: (cat: SpeakingCategory) => void;
  onSelectCategoryQuestion: (qText: string, cat: SpeakingCategory, slotIndex: number) => void;
  onGenerateCustomTopic: (cat: SpeakingCategory) => void;
  categoryCustomInputs: Record<string, string>;
  onCustomInputChange: (catId: string, val: string) => void;
  isGeneratingTopic: boolean;
  children?: React.ReactNode;
  onOpenArchive?: () => void;
  t?: (key: string, fallback: string) => string;
}

export default function SpeakingSidebar({
  decks,
  selectedDeck,
  deckWords,
  deckQuestions,
  loadingDecks,
  generatingQuestions,
  activeQuestionText,
  answeredQuestions,
  onSelectDeck,
  onSelectDeckQuestion,
  onRefreshDeckQuestions,
  activeStoryContext,
  storyDebateQuestions = [],
  onSelectStoryQuestion,
  onClearStoryContext,
  generalCultureCats,
  professionalCats,
  openCategoryId,
  activeCategory,
  categoryActiveQuestions,
  onToggleCategory,
  onSelectCategoryQuestion,
  onGenerateCustomTopic,
  categoryCustomInputs,
  onCustomInputChange,
  isGeneratingTopic,
  children,
  onOpenArchive,
  t = (_k, fallback) => fallback,
}: SpeakingSidebarProps) {
  const [isStoryAccordionOpen, setIsStoryAccordionOpen] = useState(true);
  const [isDeckAccordionOpen, setIsDeckAccordionOpen] = useState(true);
  const [isDeckDropdownOpen, setIsDeckDropdownOpen] = useState(false);

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
      {/* ========================================================================= */}
      {/* 0. OKUMA ODASI HİKAYE TARTIŞMASI AKORDİYONU (STORY-TO-SPEAKING BRIDGE)     */}
      {/* ========================================================================= */}
      {activeStoryContext && (
        <div
          data-testid="story-debate-accordion-card"
          className="p-3.5 rounded-3xl bg-gradient-to-br from-violet-950/70 via-slate-900/95 to-indigo-950/60 border border-violet-500/40 shadow-xl shadow-indigo-500/10 backdrop-blur-md space-y-3 relative overflow-hidden"
        >
          {/* Üst Başlık & Akordiyon Tetikleyici */}
          <div className="flex items-center justify-between pb-2.5 border-b border-violet-500/20 gap-2">
            <button
              type="button"
              onClick={() => setIsStoryAccordionOpen(!isStoryAccordionOpen)}
              className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-violet-400/40 text-violet-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition">
                <Mic className="w-4 h-4 text-violet-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-white truncate">
                    📖 {activeStoryContext.title} Tartışması
                  </h2>
                </div>
                <p className="text-[11px] font-medium text-violet-300 truncate">
                  {(activeStoryContext.targetWords || activeStoryContext.target_vocabulary || []).length} Hedef Kelime{" "}
                  <span className="text-slate-400 font-mono">
                    • {activeStoryContext.level || "B1"}
                  </span>
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsStoryAccordionOpen(!isStoryAccordionOpen)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={isStoryAccordionOpen ? "Daralt" : "Genişlet"}
              >
                {isStoryAccordionOpen ? (
                  <ChevronUp className="w-4 h-4 text-violet-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {onClearStoryContext && (
                <button
                  type="button"
                  onClick={onClearStoryContext}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Hikaye Bağlamını Kapat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Akordiyon İçeriği: 3-4 Açık Uçlu Analitik Tartışma Sorusu */}
          {isStoryAccordionOpen && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-violet-300/80 px-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span>Karakter & Olay Tartışma Soruları</span>
                </span>
                <span className="text-slate-500 font-mono">
                  {storyDebateQuestions.length || 4} Soru
                </span>
              </div>

              <div className="space-y-2">
                {(storyDebateQuestions.length > 0
                  ? storyDebateQuestions
                  : [
                      {
                        question: `What was the most critical decision in '${activeStoryContext.title}', and how did it shape the outcome?`,
                        theme_hint: "Dönüm Noktası & Karar",
                      },
                      {
                        question: `If you were placed in the protagonist's shoes during this conflict, what would you have done differently?`,
                        theme_hint: "Empati & Ahlaki İkilem",
                      },
                      {
                        question: `Which character's actions surprised you the most, and why do you think they reacted that way?`,
                        theme_hint: "Karakter Motivasyonu",
                      },
                      {
                        question: `How does the central theme of '${activeStoryContext.title}' reflect challenges or ethical decisions in modern life?`,
                        theme_hint: "Tematik Bağlantı",
                      },
                    ]
                ).map((qItem, idx) => {
                  const isActive = activeQuestionText === qItem.question;
                  const isAnswered = answeredQuestions.includes(qItem.question);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectStoryQuestion && onSelectStoryQuestion(qItem.question)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer group relative ${
                        isActive
                          ? "bg-violet-950/80 border-violet-400 shadow-md shadow-violet-500/20 text-white ring-1 ring-violet-400/50"
                          : isAnswered
                          ? "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-violet-500/30"
                          : "bg-slate-950/70 border-slate-800/90 hover:border-violet-500/40 text-slate-200 hover:text-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 inline-flex items-center gap-1">
                          <span>Soru {idx + 1}</span>
                          {qItem.theme_hint && <span>• {qItem.theme_hint}</span>}
                        </span>

                        {isAnswered && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>Cevaplandı</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold leading-snug group-hover:text-violet-200 transition">
                        {qItem.question}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {/* ========================================================================= */}
      {/* 1. AKTİF DESTEMDEN SORULAR (ÖZEL HEDEF KELİME KLASÖR ENTEGRASYONU)         */}
      {/* ========================================================================= */}
      <div
        data-testid="active-deck-folder-card"
        className="p-3.5 rounded-3xl bg-slate-900/95 border border-emerald-500/40 shadow-xl shadow-emerald-500/5 backdrop-blur-md space-y-3 relative overflow-visible"
      >
        {/* Üst Başlık & Akordiyon Tetikleyici */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/90 gap-2">
          <button
            type="button"
            onClick={() => setIsDeckAccordionOpen(!isDeckAccordionOpen)}
            className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black uppercase tracking-wider text-white truncate">
                  📚 Aktif Destemden Sorular
                </h2>
              </div>
              <p className="text-[11px] font-medium text-emerald-300 truncate">
                {selectedDeck?.title || "Deste Seçili Değil"}{" "}
                <span className="text-slate-400 font-mono">
                  ({deckWords.length} Kelime)
                </span>
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            {/* Deste Değiştir Dropdown Butonu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDeckDropdownOpen(!isDeckDropdownOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
                title="Çalışılacak Desteyi Değiştir"
              >
                <Layers className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Deste Değiştir</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {/* Deste Seçim Menüsü (Dropdown) */}
              {isDeckDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setIsDeckDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>Destelerim</span>
                    {loadingDecks && <span className="animate-spin text-emerald-400">⏳</span>}
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {decks.map((d) => {
                      const isSelected = selectedDeck?.id === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            onSelectDeck(d);
                            setIsDeckDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                              : "hover:bg-slate-800 text-slate-300"
                            }`}
                        >
                          <span className="truncate pr-2">{d.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Yenile Butonu */}
            <button
              type="button"
              onClick={onRefreshDeckQuestions}
              disabled={generatingQuestions}
              className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-300 transition cursor-pointer ${generatingQuestions ? "opacity-50 animate-spin" : ""
                }`}
              title="Yeni Sorular Üret"
            >
              <RefreshCw className="w-3 h-3" />
            </button>

            {/* Akordiyon Aç/Kapat */}
            <button
              type="button"
              onClick={() => setIsDeckAccordionOpen(!isDeckAccordionOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              {isDeckAccordionOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Akordiyon Gövdesi (Soru Listesi) */}
        {isDeckAccordionOpen && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-200">
            {generatingQuestions ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-300">
                  🎯 Hedef kelimelerinizle özel sorular üretiliyor...
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1 max-w-xs mx-auto">
                  {deckWords.slice(0, 5).map((w, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            ) : deckQuestions.length > 0 ? (
              <div className="space-y-2">
                {deckQuestions.map((item, idx) => {
                  const isSelected = activeQuestionText === item.question;
                  const isAnswered = answeredQuestions.includes(item.question);

                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectDeckQuestion(item.question, item.target_word_hint)}
                      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer group text-left ${isSelected
                          ? "bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40"
                          : isAnswered
                            ? "bg-slate-950/40 border-slate-800 text-slate-400 opacity-80"
                            : "bg-slate-950/60 border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900/90"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-400 transition">
                          Soru {idx + 1}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <span>🎯 Hedef:</span>
                          <span className="underline decoration-amber-400 font-extrabold">
                            {item.target_word_hint}
                          </span>
                        </span>
                      </div>

                      <p
                        className={`text-xs leading-relaxed font-medium transition ${isSelected
                            ? "text-white font-semibold"
                            : isAnswered
                              ? "text-slate-400 line-through"
                              : "text-slate-200 group-hover:text-white"
                          }`}
                      >
                        {item.question}
                      </p>

                      {isAnswered && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Cevaplandı</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                Bu destede kayıtlı kelime bulunamadı veya henüz soru üretilmedi.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🗂️ KONUŞMA ARŞİVİM HIZLI ERİŞİM BUTONU                                    */}
      {/* ========================================================================= */}
      {onOpenArchive && (
        <button
          type="button"
          data-testid="speaking-archive-open-btn"
          onClick={onOpenArchive}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 hover:from-indigo-950/60 hover:to-indigo-950/60 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 hover:text-white font-bold text-xs transition-all duration-200 cursor-pointer shadow-lg group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Archive className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black tracking-wide text-white">🗂️ Konuşma Arşivim</span>
              <span className="block text-[10px] text-slate-400 font-normal">Geçmiş diyalog ve karneleri incele</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
        </button>
      )}

      {/* ========================================================================= */}
      {/* 2. GENEL KATEGORİ & TEMATİK ÖNERİ HAPLARI (EXPLORER LIST)                   */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        {/* Üst Başlık & Rozet */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                {t("speaking_explorer_title", "Sohbet Açıcı Öneri Hapları")}
              </h2>
              <p className="text-[10px] text-slate-400">
                Esnek fikirler • Sınırsız & doğal sohbet
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            ∞ Akış
          </span>
        </div>

        {/* Kategori Grupları */}
        <div className="space-y-4">
          {/* BÖLÜM 1: 🌍 GENERAL CULTURE */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t("speaking_cat_general_culture", "🌍 GENERAL CULTURE")}</span>
            </div>

            <div className="space-y-2">
              {generalCultureCats.map((cat) => {
                const isOpen = openCategoryId === cat.id;
                const isCatActive = activeCategory.id === cat.id;
                const activeQuestions =
                  categoryActiveQuestions[cat.id] || cat.questionPool.slice(0, 4);

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isCatActive
                        ? "border-emerald-500/70 bg-slate-950/90 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                        : isOpen
                          ? "border-slate-700/80 bg-slate-950/70"
                          : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-700/60"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleCategory(cat)}
                      className="w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          {cat.icon}
                        </span>
                        <div className="min-w-0">
                          <h3
                            className={`text-xs font-bold truncate transition-colors ${isCatActive
                                ? "text-emerald-300"
                                : "text-white group-hover:text-emerald-300"
                              }`}
                          >
                            {cat.title}
                          </h3>
                          <p className="text-[10px] text-slate-400 truncate">
                            {cat.subTitle}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? "rotate-180 text-emerald-400" : ""
                          }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
                        <div className="space-y-1.5 pt-2">
                          {activeQuestions.map((qText, sIdx) => {
                            const isSelected = activeQuestionText === qText;
                            const isAnswered = answeredQuestions.includes(qText);

                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => onSelectCategoryQuestion(qText, cat, sIdx)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-start justify-between gap-2 ${isSelected
                                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/60 font-semibold shadow-sm"
                                    : isAnswered
                                      ? "bg-slate-900/50 text-slate-400 border-slate-800/60 line-through"
                                      : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700"
                                  }`}
                              >
                                <span className="flex-1 leading-snug">{qText}</span>
                                {isAnswered && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BÖLÜM 2: 💼 PROFESSIONAL & CAREER */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("speaking_cat_professional", "💼 PROFESSIONAL & CAREER")}</span>
            </div>

            <div className="space-y-2">
              {professionalCats.map((cat) => {
                const isOpen = openCategoryId === cat.id;
                const isCatActive = activeCategory.id === cat.id;
                const activeQuestions =
                  categoryActiveQuestions[cat.id] || cat.questionPool.slice(0, 4);

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isCatActive
                        ? "border-indigo-500/70 bg-slate-950/90 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                        : isOpen
                          ? "border-slate-700/80 bg-slate-950/70"
                          : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-700/60"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleCategory(cat)}
                      className="w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          {cat.icon}
                        </span>
                        <div className="min-w-0">
                          <h3
                            className={`text-xs font-bold truncate transition-colors ${isCatActive
                                ? "text-indigo-300"
                                : "text-white group-hover:text-indigo-300"
                              }`}
                          >
                            {cat.title}
                          </h3>
                          <p className="text-[10px] text-slate-400 truncate">
                            {cat.subTitle}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? "rotate-180 text-indigo-400" : ""
                          }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
                        <div className="space-y-1.5 pt-2">
                          {activeQuestions.map((qText, sIdx) => {
                            const isSelected = activeQuestionText === qText;
                            const isAnswered = answeredQuestions.includes(qText);

                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => onSelectCategoryQuestion(qText, cat, sIdx)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-start justify-between gap-2 ${isSelected
                                    ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/60 font-semibold shadow-sm"
                                    : isAnswered
                                      ? "bg-slate-900/50 text-slate-400 border-slate-800/60 line-through"
                                      : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700"
                                  }`}
                              >
                                <span className="flex-1 leading-snug">{qText}</span>
                                {isAnswered && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {children}
    </aside>
  );
}
