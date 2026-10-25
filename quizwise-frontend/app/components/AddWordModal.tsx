"use client";

import React from "react";
import { Sparkles, RotateCw, Volume2, Check, Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface DeckItem {
  id: string;
  title: string;
  card_count?: number;
}

export interface SupportedLanguageItem {
  code: string;
  label: string;
  flag: string;
}

export interface EnrichedData {
  word: string;
  phonetic: string;
  translation: string;
  exampleEn: string;
  exampleTr: string;
  source?: string;
}

export interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: DeckItem[];
  selectedDeckForWord: string;
  setSelectedDeckForWord: (id: string) => void;
  termLang: string;
  setTermLang: (lang: string) => void;
  defLang: string;
  setDefLang: (lang: string) => void;
  supportedLanguages: SupportedLanguageItem[];
  wordInput: string;
  setWordInput: (val: string) => void;
  isAutoLookingUp: boolean;
  triggerAutoLookup: (term: string) => void;
  isEnriching: boolean;
  contextHint: string;
  setContextHint: (val: string) => void;
  handleManualInputMode: () => void;
  runFetchAi: (word: string) => void;
  enrichedData: EnrichedData | null;
  setEnrichedData: (data: EnrichedData | null) => void;
  speakText?: (text: string, lang: string) => void;
  handleSaveCard?: () => void;
  isSavingCard?: boolean;
  lastAutoWordRef?: React.MutableRefObject<string>;
}

export default function AddWordModal({
  isOpen,
  onClose,
  decks,
  selectedDeckForWord,
  setSelectedDeckForWord,
  termLang,
  setTermLang,
  defLang,
  setDefLang,
  supportedLanguages,
  wordInput,
  setWordInput,
  isAutoLookingUp,
  triggerAutoLookup,
  isEnriching,
  contextHint,
  setContextHint,
  handleManualInputMode,
  runFetchAi,
  enrichedData,
  setEnrichedData,
  speakText,
  handleSaveCard,
  isSavingCard,
  lastAutoWordRef,
}: AddWordModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              {enrichedData
                ? t("modal_confirm_word_title", "Kelimeyi Onayla & Kaydet")
                : t("modal_add_word_title", "Kelime Ekle")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {!enrichedData ? (
          <div className="space-y-4">
            {/* Deste Seçici */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t("label_target_deck_select", "Hedef Deste *")}
              </label>
              <select
                value={selectedDeckForWord}
                onChange={(e) => setSelectedDeckForWord(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              >
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.card_count || 0} {t("label_card_count_suffix", "{count} kart", { count: d.card_count || 0 })})
                  </option>
                ))}
              </select>
            </div>

            {/* Dil Seçici */}
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs text-indigo-400 font-semibold mb-2">
                <Languages className="w-4 h-4" />
                <span>{t("section_lang_options", "DİL SEÇENEKLERİ")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {t("label_term_lang", "TERİM DİLİ")}
                  </label>
                  <select
                    value={termLang}
                    onChange={(e) => setTermLang(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-bold focus:border-indigo-500 outline-none"
                  >
                    {supportedLanguages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {t("label_def_lang", "TANIM DİLİ")}
                  </label>
                  <select
                    value={defLang}
                    onChange={(e) => setDefLang(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-bold focus:border-indigo-500 outline-none"
                  >
                    {supportedLanguages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Kelime Inputu (Canlı Arama İndikatörlü) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  {t("label_word_term_input", "Kelime / Terim ({lang}) *", {
                    lang: supportedLanguages.find((l) => l.code === termLang)?.label || "İngilizce",
                  })}
                </label>
                {isAutoLookingUp && (
                  <span className="flex items-center space-x-1 text-[11px] text-indigo-400 font-medium animate-pulse">
                    <RotateCw className="w-3 h-3 animate-spin" />
                    <span>{t("searching_memory", "Hafızada aranıyor...")}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={t("placeholder_word_input", "Örn: bullet, resilient, deliberate")}
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  onBlur={() => {
                    const trimmed = wordInput.trim().toLowerCase();
                    if (trimmed.length >= 2 && !enrichedData && !isAutoLookingUp && !isEnriching) {
                      triggerAutoLookup(trimmed);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white focus:border-indigo-500 outline-none font-semibold"
                />
                {isAutoLookingUp && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* İpucu */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t("label_hint_def_optional", "İpucu / Tanım (İsteğe bağlı)")}
              </label>
              <input
                type="text"
                placeholder={t("placeholder_hint_def", "Kendiniz yazacaksanız buraya doğrudan anlamı da yazabilirsiniz")}
                value={contextHint}
                onChange={(e) => setContextHint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Butonlar */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                {t("btn_cancel", "İptal")}
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleManualInputMode}
                  disabled={!wordInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                >
                  {t("btn_write_myself", "Kendim Yazacağım")} ✍️
                </button>
                <button
                  type="button"
                  onClick={() => runFetchAi(wordInput)}
                  disabled={isEnriching || !wordInput.trim()}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs transition disabled:opacity-40 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {isEnriching ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{t("btn_fetch_ai", "AI ile Getir")}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* DÜZENLEME & ONAYLAMA EKRANI */
          <div className="space-y-4">
            {enrichedData.source && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                {enrichedData.source === "common_vocab" ? (
                  <span className="text-emerald-400 font-semibold">⚡ Hızlı Sözlük Havuzundan Anında Getirildi (0ms)</span>
                ) : enrichedData.source === "database" ? (
                  <span className="text-indigo-300 font-semibold">💾 Deste Hafızasından Getirildi (0ms)</span>
                ) : (
                  <span className="text-purple-300 font-semibold">✨ Otomatik Tanımlandı</span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">
                    {t("label_term_field", "Terim")}
                  </label>
                  {speakText && (
                    <button
                      type="button"
                      onClick={() => speakText(enrichedData.word, termLang)}
                      className="text-indigo-400 hover:text-white transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={enrichedData.word}
                  onChange={(e) => setEnrichedData({ ...enrichedData, word: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t("label_phonetic_field", "Fonetik")}
                </label>
                <input
                  type="text"
                  value={enrichedData.phonetic}
                  onChange={(e) => setEnrichedData({ ...enrichedData, phonetic: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-indigo-400 focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">
                  {t("label_meaning_heading", "TANIM / ÇEVİRİ")} ({supportedLanguages.find((l) => l.code === defLang)?.label}) *
                </label>
                {speakText && (
                  <button
                    type="button"
                    onClick={() => speakText(enrichedData.translation, defLang)}
                    className="text-emerald-400 hover:text-white transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={enrichedData.translation}
                onChange={(e) => setEnrichedData({ ...enrichedData, translation: e.target.value })}
                className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t("label_example_field", "Örnek Cümle")}
              </label>
              <textarea
                rows={2}
                value={enrichedData.exampleEn}
                onChange={(e) => setEnrichedData({ ...enrichedData, exampleEn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 resize-none focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t("label_example_tr_field", "Cümlenin Çevirisi")}
              </label>
              <textarea
                rows={2}
                value={enrichedData.exampleTr}
                onChange={(e) => setEnrichedData({ ...enrichedData, exampleTr: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-400 resize-none focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEnrichedData(null);
                  if (lastAutoWordRef) {
                    lastAutoWordRef.current = "";
                  }
                }}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                {t("btn_search_diff_word", "← Farklı Kelime Ara")}
              </button>
              <button
                type="button"
                onClick={handleSaveCard}
                disabled={isSavingCard || !enrichedData.translation.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-medium text-sm disabled:opacity-40 transition cursor-pointer"
              >
                {isSavingCard ? <RotateCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{t("btn_save_to_deck", "Desteye Kaydet")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
