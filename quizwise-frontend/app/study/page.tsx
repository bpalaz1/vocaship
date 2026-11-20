"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";
import PlatformStandardLayout, { PlatformGamificationPanel } from "../components/layout/PlatformStandardLayout";
import { useLanguage } from "../context/LanguageContext";
import { usePersona } from "../context/PersonaContext";
import { API_BASE } from "../config";

interface Deck {
  id: string;
  title: string;
  description: string;
  card_count?: number;
  target_lang?: string;
  native_lang?: string;
  category?: string;
}

const DEFAULT_DECKS: Deck[] = [
  {
    id: "deck_core_3000",
    title: "Oxford 3000 Temel Kelimeler",
    description: "Günlük hayatta en sık kullanılan A1-B2 seviye temel kelime dağarcığı",
    card_count: 85,
    category: "general",
  },
  {
    id: "deck_business_c1",
    title: "İş Dünyası & Müzakere C1",
    description: "Finans, yönetim ve kurumsal toplantılar için ileri düzey terminoloji",
    card_count: 64,
    category: "business",
  },
  {
    id: "deck_academic_ielts",
    title: "Akademik IELTS & TOEFL",
    description: "Yüksek skor hedefleyenler için tez, makale ve bilimsel vaka sözlüğü",
    card_count: 92,
    category: "academic",
  },
  {
    id: "deck_idioms_daily",
    title: "Günlük Deyimler & Phrasal Verbs",
    description: "Doğal akıcılık sağlayan en popüler deyim ve birleşik fiiller",
    card_count: 50,
    category: "idioms",
  },
];

export default function StudyCatalogPage() {
  const { t } = useLanguage();
  const { persona } = usePersona();

  const [decks, setDecks] = useState<Deck[]>(DEFAULT_DECKS);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const res = await fetch(`${API_BASE}/decks`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDecks(data);
          }
        }
      } catch (err) {
        console.warn("Deste listesi sunucudan alınamadı, varsayılan havuz kullanılıyor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  const filteredDecks = decks.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat =
      selectedCategory === "all" ||
      (d.category && d.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const totalCards = decks.reduce((acc, curr) => acc + (curr.card_count || 30), 0);
  const learnedEstimate = Math.round(totalCards * 0.42);

  // Sol Sütun: Klasörler, Kategori Filtreleri ve Arama
  const leftSidebar = (
    <div className="space-y-4">
      {/* Arama Kutusu */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2 text-slate-100">
        <label className="text-xs font-bold text-slate-200 block">{t("study_cat_search_lbl", "Deste Ara")}</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("study_cat_search_ph", "Deste veya kelime adı...")}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Kategori Filtresi */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2 text-slate-100">
        <span className="text-xs font-bold text-slate-200 block">{t("study_cat_folders_hdr", "Kategoriler & Klasörler")}</span>
        <div className="space-y-1">
          {[
            { id: "all", label: t("study_cat_all", "Tüm Desteler"), icon: "📚" },
            { id: "general", label: t("study_cat_general", "Genel İngilizce"), icon: "🌍" },
            { id: "business", label: t("study_cat_business", "İş Dünyası & Finans"), icon: "💼" },
            { id: "academic", label: t("study_cat_academic", "Akademik & Sınavlar"), icon: "🎓" },
            { id: "idioms", label: t("study_cat_idioms", "Deyimler & İfadeler"), icon: "⚡" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 font-bold shadow-xs"
                  : "bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              {selectedCategory === cat.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hızlı Bilgi Kartı */}
      <div className="p-4 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 shadow-xs space-y-2 text-slate-200">
        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t("study_sm2_memory", "SM-2 Akıllı Bellek")}</span>
        </span>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {t("study_sm2_memory_desc", "Algoritma zayıf kaldığınız kartları otomatik olarak sıklaştırır, ustalaştıklarınızı geniş aralıklara yayar.")}
        </p>
      </div>
    </div>
  );

  // Sağ Sütun: Standart Gamification & İlerleme Karnesi
  const rightSidebar = (
    <PlatformGamificationPanel
      title={t("study_card_report", "Genel Çalışma Karnesi")}
      streak={5}
      gold={280}
      xp={650}
      level={persona?.level || t("study_default_lvl", "Seviye 3 Kaşif")}
      mascotName={persona?.name || "Sparky"}
      mascotImage={persona?.image || "/avatars/sparky.png"}
      learnedCount={learnedEstimate}
      totalCount={totalCards}
      weakCount={14}
    />
  );

  return (
    <PlatformStandardLayout
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
      headerTitle={t("study_page_hdr", "📚 Akıllı Kelime Desteleri")}
      headerSubtitle={t("study_page_sub", "Spaced Repetition (SM-2) destekli 3D Flashcard çalışma alanı")}
    >
      <div className="space-y-6">
        {/* Karşılama Banner (Koyu Lacivert Vurgu) */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 z-10 max-w-lg">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
              {t("study_daily_review_tag", "Günlük Tekrar Zamanı")}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("continue_learning", "Öğrenmeye Devam Et")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t("study_waiting_desc", "Bugün hafızana yerleştirmek için 14 kelime seni bekliyor. Bir deste seçerek 3D kartlarla pratik yap.")}
            </p>
          </div>

          <Link
            href={`/study/${decks[0]?.id || "deck_core_3000"}`}
            className="z-10 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("study_start_quick", "Hızlı Çalışmayı Başlat")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Deste Listesi Başlığı */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-slate-200">
            {t("study_decks_listed", "{n} Deste Listeleniyor", { n: filteredDecks.length })}
          </span>
          <span className="text-[11px] text-slate-400">
            {t("study_click_3d_hint", "Tıklayarak 3D Flashcard moduna geçiş yapabilirsiniz")}
          </span>
        </div>

        {/* Deste Kartları Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => (
            <Link
              key={deck.id}
              href={`/study/${deck.id}`}
              className="p-5 rounded-3xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/60 shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 group-hover:text-indigo-300 transition">
                    {deck.card_count || 45} {t("words", "Kelime")}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {deck.description || t("study_preset_deck_desc", "Hazır kelime seti")}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t("study_sm2_ready", "SM-2 Hazır")}</span>
                </span>
                <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>{t("btn_study_arrow", "Çalış ➔")}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PlatformStandardLayout>
  );
}
