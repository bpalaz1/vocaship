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

  // Sol Sütun: Klasörler, Kategori Filtreleri ve Arama (Dual-Tone Temiz Beyaz Kartlar)
  const leftSidebar = (
    <div className="space-y-4">
      {/* Arama Kutusu */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 text-slate-800">
        <label className="text-xs font-bold text-slate-800 block">Deste Ara</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Deste veya kelime adı..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Kategori Filtresi */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 text-slate-800">
        <span className="text-xs font-bold text-slate-800 block">Kategoriler & Klasörler</span>
        <div className="space-y-1">
          {[
            { id: "all", label: "Tüm Desteler", icon: "📚" },
            { id: "general", label: "Genel İngilizce", icon: "🌍" },
            { id: "business", label: "İş Dünyası & Finans", icon: "💼" },
            { id: "academic", label: "Akademik & Sınavlar", icon: "🎓" },
            { id: "idioms", label: "Deyimler & İfadeler", icon: "⚡" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold shadow-xs"
                  : "bg-slate-50/70 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/60"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              {selectedCategory === cat.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hızlı Bilgi Kartı */}
      <div className="p-4 rounded-3xl bg-indigo-50/70 border border-indigo-100 shadow-xs space-y-2 text-slate-800">
        <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
          <span>SM-2 Akıllı Bellek</span>
        </span>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Algoritma zayıf kaldığınız kartları otomatik olarak sıklaştırır, ustalaştıklarınızı geniş aralıklara yayar.
        </p>
      </div>
    </div>
  );

  // Sağ Sütun: Standart Gamification & İlerleme Karnesi
  const rightSidebar = (
    <PlatformGamificationPanel
      title="Genel Çalışma Karnesi"
      streak={5}
      gold={280}
      xp={650}
      level={persona?.level || "Seviye 3 Kaşif"}
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
      headerTitle="📚 Akıllı Kelime Desteleri"
      headerSubtitle="Spaced Repetition (SM-2) destekli 3D Flashcard çalışma alanı"
    >
      <div className="space-y-6">
        {/* Karşılama Banner (Dual-Tone Koyu Lacivert Vurgu) */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 z-10 max-w-lg">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
              Günlük Tekrar Zamanı
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Öğrenmeye Devam Et
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bugün hafızana yerleştirmek için 14 kelime seni bekliyor. Bir deste seçerek 3D kartlarla pratik yap.
            </p>
          </div>

          <Link
            href={`/study/${decks[0]?.id || "deck_core_3000"}`}
            className="z-10 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Hızlı Çalışmayı Başlat</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Deste Listesi Başlığı */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold text-slate-800">
            {filteredDecks.length} Deste Listeleniyor
          </span>
          <span className="text-[11px] text-slate-500">
            Tıklayarak 3D Flashcard moduna geçiş yapabilirsiniz
          </span>
        </div>

        {/* Deste Kartları Grid (Temiz Beyaz Kartlar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => (
            <Link
              key={deck.id}
              href={`/study/${deck.id}`}
              className="p-5 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600 group-hover:text-indigo-600 transition">
                    {deck.card_count || 45} Kelime
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {deck.description || "Hazır kelime seti"}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SM-2 Hazır</span>
                </span>
                <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>Çalış ➔</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PlatformStandardLayout>
  );
}
