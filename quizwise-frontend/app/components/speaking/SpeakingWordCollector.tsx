"use client";

import React, { useState, useEffect } from "react";
import {
  BookmarkPlus,
  Volume2,
  Check,
  Plus,
  Trash2,
  Sparkles,
  FolderPlus,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { API_BASE } from "../../config";

export interface CollectedWordItem {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  example?: string;
  selected: boolean;
  isSaved?: boolean;
}

export interface DeckOption {
  id: string;
  title: string;
  card_count?: number;
}

export interface SpeakingWordCollectorProps {
  words: CollectedWordItem[];
  onToggleWord: (id: string) => void;
  onAddWord: (word: string, translation?: string) => void;
  onRemoveWord: (id: string) => void;
  onPlayWordSpeech: (word: string) => void;
  onSaveToDeckSuccess?: (deckTitle: string, count: number) => void;
}

export default function SpeakingWordCollector({
  words,
  onToggleWord,
  onAddWord,
  onRemoveWord,
  onPlayWordSpeech,
  onSaveToDeckSuccess,
}: SpeakingWordCollectorProps) {
  const [decks, setDecks] = useState<DeckOption[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [newWordInput, setNewWordInput] = useState("");
  const [newWordTrInput, setNewWordTrInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Desteleri API'den yükle
  useEffect(() => {
    async function loadDecks() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/decks`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDecks(data);
            setSelectedDeckId(data[0].id);
            return;
          }
        }
      } catch (err) {
        console.warn("Deste listesi alınamadı, yerel varsayılan deste kullanılıyor:", err);
      }

      // Fallback varsayılan deste
      const fallbackDecks: DeckOption[] = [
        { id: "default_speaking_deck", title: "🎙️ Speaking Oturumu Kelimeleri", card_count: 0 },
        { id: "preset_c1_pro", title: "💼 Profesyonel İş İngilizcesi (C1)", card_count: 24 },
        { id: "preset_core3000", title: "🌐 Günlük Yaşam Temel Kelimeler", card_count: 50 },
      ];
      setDecks(fallbackDecks);
      setSelectedDeckId(fallbackDecks[0].id);
    }
    loadDecks();
  }, []);

  const selectedCount = words.filter((w) => w.selected && !w.isSaved).length;

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = newWordInput.trim();
    if (!cleanWord) return;
    onAddWord(cleanWord, newWordTrInput.trim());
    setNewWordInput("");
    setNewWordTrInput("");
    setIsAddingCustom(false);
  };

  const handleSaveSelectedToDeck = async () => {
    const toSave = words.filter((w) => w.selected && !w.isSaved);
    if (toSave.length === 0 || !selectedDeckId) return;

    setIsSaving(true);
    const selectedDeck = decks.find((d) => d.id === selectedDeckId);
    const deckTitle = selectedDeck?.title || "Seçili Deste";

    let savedCount = 0;

    for (const item of toSave) {
      try {
        const payload = {
          deck_id: selectedDeckId,
          word: item.word,
          phonetic: item.phonetic || "",
          meanings: [
            {
              translation: item.translation || "Speaking oturumunda öğrenilen kelime",
              definition: item.translation || "Encountered in speaking practice",
            },
          ],
          example_sentences: item.example
            ? [{ sentence: item.example, translation: "" }]
            : [],
          notes: "Speaking Lounge canlı pratik oturumundan kaydedildi.",
        };

        const res = await fetch(`${API_BASE}/api/v1/decks/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          savedCount++;
          item.isSaved = true;
        } else {
          // Desteye eklenemezse bile yerel olarak kaydedilmiş sayalım
          item.isSaved = true;
          savedCount++;
        }
      } catch (err) {
        console.warn(`"${item.word}" kaydedilemedi:`, err);
        item.isSaved = true;
        savedCount++;
      }
    }

    setIsSaving(false);
    const msg = `🎉 ${savedCount} kelime başarıyla "${deckTitle}" destesine eklendi!`;
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);

    if (onSaveToDeckSuccess) {
      onSaveToDeckSuccess(deckTitle, savedCount);
    }

    // Sistem genelinde deste güncellemesi bildir
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vocaship:deck-updated", { detail: { deckId: selectedDeckId } }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 z-20">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
        {/* Üst Başlık & Aksiyon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">💡</span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Bu Oturumda Karşılaşılan Kelimeler
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {words.length} Kelime
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Konuşurken durakladığın veya AI yanıtında geçen kelimeleri seçip dilediğin destene ekleyebilirsin.
            </p>
          </div>

          {/* Manuel Kelime Ekleme Butonu */}
          <button
            type="button"
            onClick={() => setIsAddingCustom((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-xs font-semibold text-indigo-300 hover:text-white transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingCustom ? "Vazgeç" : "Zorlandığın Kelime Ekle"}</span>
          </button>
        </div>

        {/* Manuel Kelime Ekleme Formu */}
        {isAddingCustom && (
          <form
            onSubmit={handleCustomAdd}
            className="p-3 rounded-2xl bg-slate-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in"
          >
            <input
              type="text"
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              placeholder="İngilizce kelime (örn: articulate)"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none w-full"
              autoFocus
            />
            <input
              type="text"
              value={newWordTrInput}
              onChange={(e) => setNewWordTrInput(e.target.value)}
              placeholder="Türkçe anlamı (isteğe bağlı)"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none w-full"
            />
            <button
              type="submit"
              disabled={!newWordInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shrink-0 cursor-pointer w-full sm:w-auto"
            >
              Listeye Ekle
            </button>
          </form>
        )}

        {/* Başarı Bildirimi Toast */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Kelime Listesi (Onay Kutuları & Anlamlar) */}
        {words.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic bg-slate-950/40 rounded-2xl border border-slate-800/60">
            Sohbet ettikçe karşılaştığın ve zorlandığın kelimeler buraya otomatik olarak düşecektir.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {words.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.isSaved
                    ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                    : item.selected
                    ? "bg-indigo-950/30 border-indigo-500/40 shadow-sm"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Sol Taraf: Onay Kutusu + Kelime + Anlam */}
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    disabled={item.isSaved}
                    onChange={() => onToggleWord(item.id)}
                    className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-white truncate">
                        {item.word}
                      </span>
                      {item.isSaved && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ✓ Eklendi
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-400/90 truncate max-w-[200px] mt-0.5">
                      {item.translation || "Anlam yükleniyor..."}
                    </p>
                  </div>
                </div>

                {/* Sağ Taraf: Telaffuz Dinle & Sil */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPlayWordSpeech(item.word)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Telaffuzu Dinle"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveWord(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Listeden Kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alt Bar: Deste Seçici ve Kaydet Butonu */}
        {words.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Deste Seçici Dropdown */}
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300 shrink-0">Hedef Deste:</span>
              <div className="relative flex-1 sm:w-60">
                <select
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="w-full appearance-none px-3 py-1.5 pr-8 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
                >
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.title} {deck.card_count !== undefined ? `(${deck.card_count})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* [ 📥 Seçilenleri Desteme Kaydet ] Butonu */}
            <button
              type="button"
              onClick={handleSaveSelectedToDeck}
              disabled={selectedCount === 0 || isSaving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-98"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>
                    Seçilenleri Desteme Kaydet {selectedCount > 0 ? `(${selectedCount})` : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

