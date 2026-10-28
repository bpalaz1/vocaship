"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Play,
  Plus,
  BookOpen,
  Layers,
  CheckCircle2,
  X,
  Search,
  Folder,
} from "lucide-react";
import dynamic from "next/dynamic";

const WeakSpotRecoveryModal = dynamic(
  () => import("./components/WeakSpotRecoveryModal"),
  { ssr: false }
);
const CreateDeckModal = dynamic(
  () => import("./components/CreateDeckModal"),
  { ssr: false }
);

import { useTranslation } from "./context/LanguageContext";
import { API_BASE } from "./config";

interface Deck {
  id: string;
  title: string;
  description?: string;
  card_count?: number;
  folder_id?: string | null;
  target_lang?: string;
  native_lang?: string;
}

interface FolderOption {
  id: string;
  name: string;
}

export default function WorkstationPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // State
  const [decks, setDecks] = useState<Deck[]>([]);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [weakSpotCount, setWeakSpotCount] = useState<number>(0);
  const [isWeakSpotModalOpen, setIsWeakSpotModalOpen] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  // Tabs & Search State
  const [viewMode, setViewMode] = useState<"folders" | "all_decks">("folders");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Deck Modal State
  const [isCreateDeckModalOpen, setIsCreateDeckModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDeckFolderId, setNewDeckFolderId] = useState("");

  // Dismiss celebration banner automatically
  useEffect(() => {
    if (!celebrationBanner) return;
    const timer = setTimeout(() => {
      setCelebrationBanner(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [celebrationBanner]);

  // Fetch Decks
  const fetchDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/decks`);
      if (res.ok) {
        const data = await res.json();
        setDecks(Array.isArray(data) ? data : []);
      } else {
        setDecks([]);
      }
    } catch (e) {
      console.warn("Desteler alınamadı:", e);
      setDecks([]);
    }
  };

  // Fetch Folders
  const fetchFolders = async () => {
    try {
      const res = await fetch(`${API_BASE}/folders`);
      if (res.ok) {
        const data = await res.json();
        setFolders(Array.isArray(data) ? data : []);
      } else {
        setFolders([]);
      }
    } catch (e) {
      console.warn("Klasörler alınamadı:", e);
      setFolders([]);
    }
  };

  // Fetch Weak Spots Count
  const fetchWeakSpotsCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/cards/weak-spots?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const count =
          data?.total !== undefined
            ? data.total
            : data?.cards
            ? data.cards.length
            : 0;
        setWeakSpotCount(typeof count === "number" ? count : 0);
      } else {
        setWeakSpotCount(0);
      }
    } catch (e) {
      console.warn("Zayıf noktalar alınamadı:", e);
      setWeakSpotCount(0);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDecks(), fetchFolders(), fetchWeakSpotsCount()]);
      setLoading(false);
    };
    init();
  }, []);

  // Create Deck handler
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          folder_id: newDeckFolderId || null,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setNewDeckFolderId("");
        setIsCreateDeckModalOpen(false);
        await fetchDecks();
      }
    } catch (err) {
      console.error("Deste oluşturulamadı:", err);
    }
  };

  // SM-2 Review count (defaults to 7 if 0 as requested, or actual weakSpotCount)
  const dueCount = weakSpotCount > 0 ? weakSpotCount : 7;

  // Handle Review Click
  const handleStartReview = () => {
    setIsWeakSpotModalOpen(true);
  };

  // Folder Map for fast ID -> Name lookups
  const folderMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

  // Deck count per folder
  const deckCountByFolder = useMemo(() => {
    const counts: Record<string, number> = {};
    decks.forEach((d) => {
      if (d.folder_id) {
        counts[d.folder_id] = (counts[d.folder_id] || 0) + 1;
      }
    });
    return counts;
  }, [decks]);

  // Independent (folderless) decks
  const independentDecks = useMemo(() => {
    return decks.filter((d) => !d.folder_id);
  }, [decks]);

  // Search logic (live across all decks)
  const isSearching = searchQuery.trim().length > 0;
  const searchFilteredDecks = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.trim().toLowerCase();
    return decks.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [decks, searchQuery, isSearching]);

  // Selected folder data
  const activeFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  const activeFolderDecks = useMemo(() => {
    if (!selectedFolderId) return [];
    return decks.filter((d) => d.folder_id === selectedFolderId);
  }, [decks, selectedFolderId]);

  // Deck Card Renderer
  const renderDeckCard = (deck: Deck, showFolderBadge = true) => {
    const folderName = deck.folder_id ? folderMap.get(deck.folder_id) : null;
    return (
      <div
        key={deck.id}
        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-950/30 transition-all duration-200"
      >
        <div className="space-y-3">
          {/* Üst Bilgi: Deste İkonu & Klasör Rozeti & Kelime Sayısı */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              {showFolderBadge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 truncate max-w-[120px]">
                  {folderName ? `📁 ${folderName}` : t("folder_badge_general", "Genel")}
                </span>
              )}
            </div>

            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/50 shrink-0">
              {t("deck_cards_count", "{count} Kelime", {
                count: deck.card_count || 0,
              })}
            </span>
          </div>

          {/* Deste Adı */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
            {deck.title}
          </h3>

          {/* Deste Açıklaması */}
          {deck.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {deck.description}
            </p>
          )}
        </div>

        {/* Çalış Aksiyonu */}
        <div className="pt-5 mt-auto">
          <button
            type="button"
            onClick={() => router.push(`/study/${deck.id}`)}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.98] shadow-sm cursor-pointer group-hover:bg-indigo-600 group-hover:text-white"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t("btn_study", "Çalış")}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col justify-start">
      {/* SEANS BİTİMİ KUTLAMASI BİLDİRİMİ */}
      {celebrationBanner && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center justify-between gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-teal-950/95 border-2 border-emerald-500/70 shadow-2xl shadow-emerald-950/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{celebrationBanner}</span>
                </h4>
                <p className="text-[11px] text-emerald-300/90 font-medium">
                  {t(
                    "all_weak_spots_cleared_sub",
                    "Harika iş! Tüm zayıf kelimeleri başarıyla pekiştirdiniz."
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCelebrationBanner(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ANA ODAK ALANI: GOOGLE SADELİĞİNDE ÇALIŞMA İSTASYONU */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* ========================================================================= */}
        {/* 1. SADE HERO: HAFIZA TAZELEME WİDGET'I (Ebbinghaus SM-2)                   */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/40 border border-slate-800/90 hover:border-indigo-500/40 transition-all p-6 sm:p-8 shadow-xl shadow-slate-950/50 backdrop-blur-xl">
          {/* Arka Plan Ambient Parlaması */}
          <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative z-10 space-y-5">
            {/* Rozet */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
              <span>{t("ebbinghaus_badge", "🧠 Ebbinghaus Unutma Eğrisi")}</span>
            </div>

            {/* Ana Başlık */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                {t(
                  "ebbinghaus_hero_title",
                  "Bugün hafıza tazelemesi gereken {count} kelimeniz var",
                  { count: dueCount }
                )}
              </h1>

              {/* Alt Bilgi */}
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                {t(
                  "ebbinghaus_hero_subtitle",
                  "Aralıklı tekrar algoritması, kelimeleri unutma eşiğindeyken karşınıza çıkararak kalıcı hafızaya aktarır. (Önerilen süre: 2 dk)"
                )}
              </p>
            </div>

            {/* Aksiyon Butonu */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartReview}
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>
                  {t(
                    "ebbinghaus_hero_cta",
                    "⚡ Hafızayı Tazele ({count} Kelime)",
                    { count: dueCount }
                  )}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. KİŞİSEL DESTELERİM ALANI: "Kelimelerim & Destelerim"                     */}
        {/* ========================================================================= */}
        <section className="space-y-5">
          {/* Üst Satır: Başlık & Yeni Deste Aç Butonu */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {t("my_decks_title", "Kelimelerim & Destelerim")}
                </h2>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                  {decks.length}
                </span>
              </div>
            </div>

            {/* + Yeni Deste Aç Butonu */}
            <button
              type="button"
              onClick={() => {
                setNewDeckFolderId(selectedFolderId || "");
                setIsCreateDeckModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 active:scale-95 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t("create_new_deck", "Yeni Deste Aç")}</span>
            </button>
          </div>

          {/* İkinci Satır: Sekmeler [ Klasörler ] / [ Tüm Desteler ] ve Canlı Deste Arama */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            {/* Sekmeler (Tabs) */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => {
                  setViewMode("folders");
                  setSelectedFolderId(null);
                }}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "folders" && !isSearching
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("tab_folders", "Klasörler")}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-slate-300 font-mono">
                  {folders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("all_decks")}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "all_decks" && !isSearching
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t("tab_all_decks", "Tüm Desteler")}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-slate-300 font-mono">
                  {decks.length}
                </span>
              </button>
            </div>

            {/* Canlı Deste Arama Kutusu */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "search_decks_placeholder",
                  "Deste ara (örn: Test Deck, B2, Tıp...)"
                )}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/80 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title={t("clear_search", "Aramayı Temizle")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DURUM 1: CANLI ARAMA SONUÇLARI                                            */}
          {/* ========================================================================= */}
          {isSearching ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>{t("search_results_title", "Arama Sonuçları")}:</span>
                  <strong className="text-white font-mono">
                    {searchFilteredDecks.length}
                  </strong>
                  <span>{t("decks_count_suffix", "Deste")}</span>
                  <span className="text-indigo-400 font-medium italic truncate max-w-[200px]">
                    "{searchQuery}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                >
                  {t("clear_search", "Aramayı Temizle")}
                </button>
              </div>

              {searchFilteredDecks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {searchFilteredDecks.map((deck) => renderDeckCard(deck, true))}
                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 text-xl">
                    🔍
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-bold text-white">
                      {t(
                        "no_search_results_title",
                        "Aradığınız kriterde deste bulunamadı"
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        "no_search_results_desc",
                        "Farklı bir arama terimi deneyebilir veya yeni bir deste oluşturabilirsiniz."
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    {t("clear_search", "Aramayı Temizle")}
                  </button>
                </div>
              )}
            </div>
          ) : loading ? (
            /* Yükleniyor Durumu (Skeletons) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-800" />
                    <div className="w-16 h-5 rounded-full bg-slate-800" />
                  </div>
                  <div className="w-3/4 h-5 rounded bg-slate-800" />
                  <div className="w-full h-9 rounded-xl bg-slate-800/80 pt-4" />
                </div>
              ))}
            </div>
          ) : viewMode === "folders" ? (
            /* ========================================================================= */
            /* DURUM 2: KLASÖRLER MODU (Folder View)                                     */
            /* ========================================================================= */
            selectedFolderId ? (
              /* A) Seçili Klasör İçi Görünümü */
              <div className="space-y-4">
                {/* Breadcrumb Navigasyon Çubuğu */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedFolderId(null)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t("back_to_folders", "← Tüm Klasörlere Dön")}</span>
                    </button>
                    <span className="text-slate-600">/</span>
                    <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5 truncate">
                      <span>📁</span>
                      <span className="truncate">{activeFolder?.name}</span>
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0">
                      {activeFolderDecks.length} {t("decks_count_suffix", "Deste")}
                    </span>
                  </div>

                  {/* Bu Klasöre Yeni Deste Ekle Butonu */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewDeckFolderId(selectedFolderId);
                      setIsCreateDeckModalOpen(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("btn_new_deck", "Yeni Deste")}</span>
                  </button>
                </div>

                {/* Klasörün Desteleri */}
                {activeFolderDecks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {activeFolderDecks.map((deck) => renderDeckCard(deck, false))}
                  </div>
                ) : (
                  <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
                      📁
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="text-base font-bold text-white">
                        {t("empty_folder_title", "Bu Klasörde Deste Yok")}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t(
                          "empty_folder_desc",
                          "Bu klasöre yeni bir kelime destesi ekleyerek başlayabilirsiniz."
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewDeckFolderId(selectedFolderId);
                        setIsCreateDeckModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t("create_new_deck", "Yeni Deste Aç")}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* B) Ana Klasörler Listesi */
              <div className="space-y-6">
                {folders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {folders.map((folder) => {
                      const count = deckCountByFolder[folder.id] || 0;
                      return (
                        <div
                          key={folder.id}
                          onClick={() => setSelectedFolderId(folder.id)}
                          className="group relative flex items-center justify-between p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 shadow-lg hover:shadow-amber-950/20 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl group-hover:scale-105 transition-transform shrink-0">
                              📁
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                {folder.name}
                              </h3>
                              <p className="text-xs text-slate-400 font-mono">
                                {count} {t("decks_count_suffix", "Deste")}
                              </p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-slate-800/50 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 flex items-center justify-center transition shrink-0">
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 text-xs text-slate-400">
                    {t("no_folders_yet", "Henüz klasör oluşturulmadı.")}
                  </div>
                )}

                {/* Genel / Bağımsız Desteler (Klasörsüz) */}
                {independentDecks.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        {t("general_decks_title", "Genel / Bağımsız Desteler")}
                      </h3>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {independentDecks.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {independentDecks.map((deck) => renderDeckCard(deck, false))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* ========================================================================= */
            /* DURUM 3: TÜM DESTELER MODU (Flat All Decks View)                         */
            /* ========================================================================= */
            decks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {decks.map((deck) => renderDeckCard(deck, true))}
              </div>
            ) : (
              /* Boş Durum (Empty State) */
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl">
                  📚
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-lg font-bold text-white">
                    {t("empty_decks_title", "Henüz Bir Deste Bulunmuyor")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {t(
                      "empty_decks_desc",
                      "Kendi kelime destenizi açarak aralıklı tekrar ile kalıcı öğrenmeye başlayın."
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateDeckModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("create_new_deck", "Yeni Deste Aç")}</span>
                </button>
              </div>
            )
          )}
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 3. DİNAMİK MODALLAR                                                       */}
      {/* ========================================================================= */}
      <CreateDeckModal
        isOpen={isCreateDeckModalOpen}
        onClose={() => setIsCreateDeckModalOpen(false)}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newDescription={newDescription}
        setNewDescription={setNewDescription}
        newDeckFolderId={newDeckFolderId}
        setNewDeckFolderId={setNewDeckFolderId}
        folders={folders}
        onSubmit={handleCreateDeck}
      />

      <WeakSpotRecoveryModal
        isOpen={isWeakSpotModalOpen}
        onClose={() => setIsWeakSpotModalOpen(false)}
        onRefreshNeeded={() => fetchWeakSpotsCount()}
        onMasteredWord={() =>
          setWeakSpotCount((prev) => Math.max(0, prev - 1))
        }
        onAllWeakSpotsCleared={() => {
          setWeakSpotCount(0);
          setCelebrationBanner(t("all_weak_spots_cleared", "🎉 Tüm zayıf noktalarını temizledin!"));
          try {
            confetti({
              particleCount: 100,
              spread: 75,
              origin: { y: 0.35 },
            });
          } catch {}
        }}
      />
    </div>
  );
}