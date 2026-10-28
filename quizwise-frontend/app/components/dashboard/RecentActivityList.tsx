"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Folder,
  Play,
  Plus,
  Share2,
  Trash2,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export interface DeckItem {
  id: string;
  title: string;
  description: string;
  folder_id?: string | null;
  card_count?: number;
  target_lang?: string;
  native_lang?: string;
}

export interface FolderItem {
  id: string;
  name: string;
}

interface RecentActivityListProps {
  decks: DeckItem[];
  folders: FolderItem[];
  onStudyDeck: (deckId: string) => void;
  onAddWord: (deckId: string) => void;
  onShareDeck: (deck: DeckItem) => void;
  onDeleteDeck: (deckId: string) => void;
  onCreateDeck: () => void;
  currentFolderId?: string | null;
}

export default function RecentActivityList({
  decks,
  folders,
  onStudyDeck,
  onAddWord,
  onShareDeck,
  onDeleteDeck,
  onCreateDeck,
  currentFolderId,
}: RecentActivityListProps) {
  // Klasör haritası
  const folderMap = React.useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

  // Filtrelenmiş veya son eklenen/çalışılan desteler
  const displayedDecks = React.useMemo(() => {
    if (currentFolderId) {
      return decks.filter((d) => d.folder_id === currentFolderId);
    }
    return decks;
  }, [decks, currentFolderId]);

  return (
    <section className="space-y-4">
      {/* Başlık ve Hızlı Eylem */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Son Etkinlikler & Destelerim</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                {displayedDecks.length} deste
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Son çalışılan deste ve klasörlerinizin güncel listesi
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateDeck}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Yeni Deste</span>
        </button>
      </div>

      {/* Deste Listesi / Boş Durum */}
      {displayedDecks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 text-2xl">
            📚
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">
              Henüz kişisel deste bulunmuyor
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Kendi kelime destenizi oluşturabilir veya sol paneldeki mesleki C1 hazır destelerini kitaplığınıza ekleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateDeck}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>İlk Desteni Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {displayedDecks.map((deck) => {
            const folderName = deck.folder_id ? folderMap.get(deck.folder_id) : null;
            const count = deck.card_count ?? 0;

            return (
              <div
                key={deck.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-md"
              >
                {/* Sol Kısım: Simge & Bilgiler */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0 text-base group-hover:scale-105 transition-transform">
                    📖
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {deck.title}
                      </h3>
                      {folderName && (
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700 flex items-center gap-1">
                          <Folder className="w-2.5 h-2.5 text-indigo-400" />
                          <span>{folderName}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span>{count} kart</span>
                      </span>

                      {deck.target_lang && deck.native_lang && (
                        <span className="text-[11px] font-mono text-slate-400 uppercase">
                          {deck.target_lang} ➔ {deck.native_lang}
                        </span>
                      )}

                      {deck.description && (
                        <span className="truncate hidden md:inline max-w-xs text-slate-400 text-[11px]">
                          • {deck.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ Kısım: Aksiyon Butonları */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onAddWord(deck.id)}
                    title="Kelime Ekle"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onShareDeck(deck)}
                    title="Paylaş / Kod Al"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteDeck(deck.id)}
                    title="Desteyi Sil"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/30 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onStudyDeck(deck.id)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer ml-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Çalış</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
