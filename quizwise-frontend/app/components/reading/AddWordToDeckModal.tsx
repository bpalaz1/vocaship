"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Folder, Layers, Plus, Check, Loader2 } from "lucide-react";
import { API_BASE } from "../../config";
import { useTranslation } from "../../context/LanguageContext";
import { fetchDecksList, fetchFoldersList, DeckItem, FolderItem } from "../../utils/activeDeckStore";
import { rewardReadingWordAdded } from "../../utils/rewardEngine";

export interface WordToDeckPayload {
  word: string;
  phonetic?: string;
  translation: string;
  exampleSentence?: string;
}

export interface AddWordToDeckModalProps {
  isOpen: boolean;
  wordItem: WordToDeckPayload | null;
  initialDeckId?: string;
  onClose: () => void;
  onSuccess: (word: string, deckId: string) => void;
}

export default function AddWordToDeckModal({
  isOpen,
  wordItem,
  initialDeckId,
  onClose,
  onSuccess,
}: AddWordToDeckModalProps) {
  const { t, currentLang } = useTranslation();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [selectedDeckId, setSelectedDeckId] = useState<string>(initialDeckId || "");

  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [creatingDeckLoading, setCreatingDeckLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setErrorMsg(null);
    setIsCreatingDeck(false);
    setNewDeckTitle("");

    const loadData = async () => {
      try {
        const [fRes, dRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/folders`).catch(() => null),
          fetch(`${API_BASE}/api/v1/decks`).catch(() => null),
        ]);

        let folderList: FolderItem[] = [];
        let deckList: DeckItem[] = [];

        if (fRes && fRes.ok) {
          const fj = await fRes.json();
          if (Array.isArray(fj)) folderList = fj;
        }
        if (dRes && dRes.ok) {
          const dj = await dRes.json();
          if (Array.isArray(dj)) deckList = dj;
        }

        if (folderList.length === 0) {
          folderList = await fetchFoldersList().catch(() => []);
        }
        if (deckList.length === 0) {
          deckList = await fetchDecksList().catch(() => []);
        }

        if (cancelled) return;
        setFolders(folderList);
        setDecks(deckList);

        if (initialDeckId && deckList.some((d) => d.id === initialDeckId)) {
          setSelectedDeckId(initialDeckId);
        } else if (deckList.length > 0) {
          setSelectedDeckId(deckList[0].id);
        } else {
          setSelectedDeckId("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [isOpen, initialDeckId]);

  const folderNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const f of folders) {
      map[f.id] = f.name;
    }
    return map;
  }, [folders]);

  const filteredDecks = useMemo(() => {
    if (selectedFolderId === "all") return decks;
    if (selectedFolderId === "none") return decks.filter((d) => !d.folder_id);
    return decks.filter((d) => d.folder_id === selectedFolderId);
  }, [decks, selectedFolderId]);

  useEffect(() => {
    if (filteredDecks.length === 0) {
      setSelectedDeckId("");
      return;
    }
    if (!filteredDecks.some((d) => d.id === selectedDeckId)) {
      setSelectedDeckId(filteredDecks[0].id);
    }
  }, [filteredDecks, selectedDeckId]);

  if (!isOpen || !wordItem) return null;

  const handleCreateQuickDeck = async () => {
    const cleanTitle = newDeckTitle.trim();
    if (!cleanTitle || creatingDeckLoading) return;
    setCreatingDeckLoading(true);
    setErrorMsg(null);
    try {
      const targetFolder =
        selectedFolderId !== "all" && selectedFolderId !== "none" ? selectedFolderId : null;
      const res = await fetch(`${API_BASE}/api/v1/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          folder_id: targetFolder,
          target_lang: "en",
          native_lang: currentLang || "tr",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err?.detail || t("deck_create_failed", "Deste oluşturulamadı."));
        return;
      }
      const created: DeckItem = await res.json();
      setDecks((prev) => [created, ...prev]);
      setSelectedDeckId(created.id);
      setNewDeckTitle("");
      setIsCreatingDeck(false);
      window.dispatchEvent(new CustomEvent("vocaship:deck-updated", { detail: { deckId: created.id } }));
    } catch {
      setErrorMsg(t("read_server_conn_err", "Sunucuya bağlanılamadı."));
    } finally {
      setCreatingDeckLoading(false);
    }
  };

  const handleSaveToDeck = async () => {
    if (!selectedDeckId || saving) {
      setErrorMsg(t("select_deck_warning", "Lütfen önce kelimelerin kaydedileceği bir deste seçin veya oluşturun."));
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      const meaningVal = wordItem.translation.trim() || wordItem.word.trim();
      const res = await fetch(`${API_BASE}/api/v1/decks/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deck_id: selectedDeckId,
          word: wordItem.word.trim(),
          phonetic: wordItem.phonetic || null,
          target_lang: "en",
          native_lang: currentLang || "tr",
          meanings: [
            {
              part_of_speech: "",
              translation: meaningVal,
              definition: meaningVal,
              target_lang: "en",
              native_lang: currentLang || "tr",
            },
          ],
          example_sentences: wordItem.exampleSentence
            ? [
                {
                  en: wordItem.exampleSentence.trim(),
                  tr: "",
                  target: wordItem.exampleSentence.trim(),
                  native: "",
                },
              ]
            : [],
          collocations: [],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err?.detail || t("read_card_add_failed", "Kart eklenemedi."));
        return;
      }

      rewardReadingWordAdded(wordItem.word.trim());
      window.dispatchEvent(
        new CustomEvent("vocaship:deck-updated", { detail: { deckId: selectedDeckId } })
      );
      onSuccess(wordItem.word, selectedDeckId);
    } catch {
      setErrorMsg(t("read_server_conn_err", "Sunucuya bağlanılamadı."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-5 text-slate-100"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div>
            <h3 className="text-base font-black text-white">
              {t("read_add_deck_modal_title", "Kelimeyi Desteye Ekle")}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="font-bold text-indigo-300">{wordItem.word}</span>
              {wordItem.translation ? ` — ${wordItem.translation}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label={t("close", "Kapat")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Klasör Seçimi (Opsiyonel Filtre) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("read_folder_filter_lbl", "1. Klasör Seçimi (Opsiyonel Filtre)")}</span>
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 focus:outline-none"
              >
                <option value="all">{t("read_all_folders_opt", "Tüm Klasörler / Genel")}</option>
                <option value="none">{t("read_general_no_folder", "Genel (Klasörsüz)")}</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Hedef Deste Seçimi + Mini Yeni Deste */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t("read_target_deck_lbl", "2. Hedef Deste Seçimi")}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingDeck((prev) => !prev)}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t("read_quick_new_deck", "+ Yeni Deste")}</span>
                </button>
              </div>

              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 focus:outline-none"
              >
                {filteredDecks.length === 0 ? (
                  <option value="">
                    {t("read_no_decks_in_folder", "Bu klasörde deste bulunamadı")}
                  </option>
                ) : (
                  filteredDecks.map((d) => {
                    const folderLabel =
                      d.folder_id && folderNameById[d.folder_id]
                        ? `📁 ${folderNameById[d.folder_id]}`
                        : t("read_general_badge", "Genel");
                    return (
                      <option key={d.id} value={d.id}>
                        {d.title} ({folderLabel})
                      </option>
                    );
                  })
                )}
              </select>

              {isCreatingDeck && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newDeckTitle}
                    onChange={(e) => setNewDeckTitle(e.target.value)}
                    placeholder={t("read_new_deck_name_ph", "Yeni deste adı...")}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/40 focus:border-emerald-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!newDeckTitle.trim() || creatingDeckLoading}
                    onClick={handleCreateQuickDeck}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    {creatingDeckLoading ? "..." : t("create", "Oluştur")}
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            disabled={saving || loading || !selectedDeckId}
            onClick={handleSaveToDeck}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{t("read_save_to_selected_deck", "✓ Seçili Desteye Kaydet")}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            {t("cancel", "Vazgeç")}
          </button>
        </div>
      </div>
    </div>
  );
}
