"use client";

import React, { useState, useMemo } from "react";
import {
  CuratedStory,
  STORY_CATEGORIES,
  CURATED_STORIES_CATALOG,
  getStoriesByCategory,
} from "../../data/stories";
import { useLanguage } from "../../context/LanguageContext";
import { useUserStories, CustomStory } from "../../context/UserStoriesContext";
import { autoAssignCover, autoAssignGradient } from "../../utils/autoCover";
import {
  Search,
  X,
  ChevronDown,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  Trash2,
  Plus,
  BookOpen,
  Layers,
  Globe2,
  Briefcase,
} from "lucide-react";

interface StoryCarouselGalleryProps {
  onSelectStory: (story: CuratedStory | any) => void;
  completedStoryIds?: string[];
  inProgressStoryIds?: string[];
  className?: string;
  onCreateNewStory?: () => void;
}

interface StoryCardProps {
  story: CuratedStory | CustomStory | any;
  onSelect: (story: any) => void;
  isCompleted?: boolean;
  isInProgress?: boolean;
  gradientFallback: string;
  onDelete?: () => void;
  isUserStory?: boolean;
}

function StoryCard({
  story,
  onSelect,
  isCompleted,
  isInProgress,
  gradientFallback,
  onDelete,
  isUserStory,
}: StoryCardProps) {
  const { t } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);

  // İlk 2 hedef kelime
  const previewWords = (story.target_vocabulary || []).slice(0, 2);

  return (
    <div
      onClick={() => onSelect(story)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(story);
        }
      }}
      className={`group relative w-full rounded-2xl bg-slate-900/90 border shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
        isUserStory
          ? "border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10"
          : "border-slate-800 hover:border-indigo-500/70 hover:shadow-indigo-500/10"
      }`}
    >
      {/* 16:9 Kapak Görseli */}
      <div className="aspect-video relative overflow-hidden bg-slate-950">
        {!imageFailed && story.coverImage ? (
          <img
            src={story.coverImage}
            alt={story.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradientFallback} flex items-center justify-center p-4 text-center`}
          >
            <div className="space-y-1">
              <span className="text-3xl drop-shadow-md">
                {isUserStory ? "✨" : "📖"}
              </span>
              <p className="text-xs font-bold text-white/90 drop-shadow line-clamp-1">
                {story.topic || story.title}
              </p>
            </div>
          </div>
        )}

        {/* Görsel Üzeri Hafif Karartma */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Sol Üst: Seviye Rozeti */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm ${
              isUserStory
                ? "bg-amber-500/90 text-slate-950 border border-amber-300 font-bold"
                : "bg-slate-900/90 text-indigo-300 border border-slate-700/80"
            }`}
          >
            {story.cefr || story.level || "B1"}
          </span>
          {isUserStory && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600/90 text-white backdrop-blur-sm shadow-sm">
              ✨ {t("badge_custom", "Özel")}
            </span>
          )}
          {story.isCareerCase && !isUserStory && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-600/90 text-white backdrop-blur-sm shadow-sm">
              {t("badge_case", "Vaka")}
            </span>
          )}
        </div>

        {/* Sağ Üst: Süre veya Silme Butonu */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title={t("delete_story_tooltip", "Hikayeyi Kütüphanemden Sil")}
              className="p-1 rounded-md bg-slate-950/80 hover:bg-rose-600 text-slate-400 hover:text-white transition shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-sm text-[10px] font-medium shadow-sm">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>
              {story.readTime || "2 dk"} • {story.wordCount || 150}k
            </span>
          </div>
        </div>

        {/* Tamamlandı / Devam Ediyor Damgası */}
        {isCompleted && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/95 text-slate-950 text-[10px] font-bold shadow-md">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t("badge_read", "Okundu")}</span>
          </div>
        )}
        {!isCompleted && isInProgress && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/95 text-slate-950 text-[10px] font-bold shadow-md">
            <Bookmark className="w-3 h-3" />
            <span>{t("badge_bookmark", "Kaldığın Yer")}</span>
          </div>
        )}
      </div>

      {/* Alt Yarı: Başlık, Konu, Hedef Kelimeler */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider line-clamp-1 ${
              isUserStory ? "text-amber-400" : "text-indigo-400"
            }`}
          >
            {story.topic || story.categoryName || (isUserStory ? t("custom_story_label", "Özel Hikaye") : t("general_story_label", "Genel"))}
          </span>
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {story.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {story.desc || story.content?.slice(0, 100) + "..."}
          </p>
        </div>

        {/* Hedef Kelime Hapları (2 adet) */}
        {previewWords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {previewWords.map((v: any, idx: number) => {
              const wordText = typeof v === "string" ? v : v.word;
              const trMeaning = typeof v === "object" ? v.turkish_meaning : "";
              return (
                <span
                  key={idx}
                  title={trMeaning ? `${wordText}: ${trMeaning}` : wordText}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 group-hover:border-indigo-500/40 transition-colors"
                >
                  <strong className="text-indigo-300">{wordText}</strong>
                  {trMeaning && (
                    <>
                      : <span className="text-slate-400">{trMeaning}</span>
                    </>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Aksiyon Alt Çubuğu */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-300 transition-colors">
          <span className="text-[11px]">{isUserStory ? t("personal_library", "Kişisel Kütüphane") : t("instant_access", "Sıfır Bekleme (0ms)")}</span>
          <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>{t("btn_read_now", "Hemen Oku")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SidebarCategoryItem {
  id: string;
  icon: string;
  titleKey: string;
  titleDefault: string;
  subKey?: string;
  subDefault?: string;
  levelBadge?: string;
  count: number;
}

interface SidebarSection {
  titleKey: string;
  titleDefault: string;
  icon: React.ReactNode;
  items: SidebarCategoryItem[];
}

export default function StoryCarouselGallery({
  onSelectStory,
  completedStoryIds = [],
  inProgressStoryIds = [],
  className = "",
  onCreateNewStory,
}: StoryCarouselGalleryProps) {
  const { t } = useLanguage();
  const { userStories, deleteUserStory } = useUserStories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Kategoriye Göre Gruplanmış 120 Hikaye
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of STORY_CATEGORIES) {
      counts[cat.id] = getStoriesByCategory(cat.id).length;
    }
    return counts;
  }, []);

  // 3 BÖLÜMLÜ DİKEY KENAR ÇUBUĞU TANIMI
  const sidebarSections: SidebarSection[] = useMemo(() => {
    return [
      {
        titleKey: "reading_sidebar_collection",
        titleDefault: "GENEL KOLEKSİYON",
        icon: <Layers className="w-3.5 h-3.5 text-indigo-400" />,
        items: [
          {
            id: "all",
            icon: "📚",
            titleKey: "reading_sidebar_all_stories",
            titleDefault: "All Collection (Tüm Hikayeler)",
            subKey: "reading_sidebar_all_stories_sub",
            subDefault: "120 Telifsiz + Özel Metin",
            count: 120 + userStories.length,
          },
          {
            id: "user_custom",
            icon: "✨",
            titleKey: "reading_sidebar_my_stories",
            titleDefault: "My Stories (Benim Hikayelerim)",
            subKey: "reading_sidebar_my_stories_sub",
            subDefault: "Yapay zekâ ile üretilenler",
            count: userStories.length,
          },
        ],
      },
      {
        titleKey: "reading_sidebar_general_culture",
        titleDefault: "GENEL KÜLTÜR (General Culture)",
        icon: <Globe2 className="w-3.5 h-3.5 text-emerald-400" />,
        items: [
          {
            id: "kids",
            icon: "🦊",
            titleKey: "category_kids_title",
            titleDefault: "Kids & Masallar (Kids Stories)",
            subKey: "category_kids_sub",
            subDefault: "Kids Stories • A1",
            levelBadge: "A1",
            count: categoryCounts["kids"] || 15,
          },
          {
            id: "adult_basic",
            icon: "☕",
            titleKey: "category_adult_basic_title",
            titleDefault: "Günlük Yaşam & Temel İngilizce",
            subKey: "category_adult_basic_sub",
            subDefault: "Daily Life • A1/A2",
            levelBadge: "A1-A2",
            count: categoryCounts["adult_basic"] || 15,
          },
          {
            id: "adult_intermediate",
            icon: "🏔️",
            titleKey: "category_adult_intermediate_title",
            titleDefault: "Macera & Kültür (Adventure & Culture)",
            subKey: "category_adult_intermediate_sub",
            subDefault: "Adventure & Culture • B1/B2",
            levelBadge: "B1-B2",
            count: categoryCounts["adult_intermediate"] || 15,
          },
          {
            id: "adult_advanced",
            icon: "🔬",
            titleKey: "category_adult_advanced_title",
            titleDefault: "Bilim, Felsefe & Gizem (Science & Mystery)",
            subKey: "category_adult_advanced_sub",
            subDefault: "Science & Mystery • C1",
            levelBadge: "C1",
            count: categoryCounts["adult_advanced"] || 15,
          },
        ],
      },
      {
        titleKey: "reading_sidebar_prof_specialized",
        titleDefault: "MESLEKLER & SEKTÖREL (Professional & Specialized)",
        icon: <Briefcase className="w-3.5 h-3.5 text-cyan-400" />,
        items: [
          {
            id: "project_controls",
            icon: "📊",
            titleKey: "category_project_controls_title",
            titleDefault: "Proje Kontrol & Planlama (Project Controls / EVM)",
            subKey: "category_project_controls_sub",
            subDefault: "Project Controls / EVM • C1",
            levelBadge: "C1 Corporate",
            count: categoryCounts["project_controls"] || 15,
          },
          {
            id: "legal_contracts",
            icon: "⚖️",
            titleKey: "category_legal_contracts_title",
            titleDefault: "Hukuk & Sözleşmeler (Contract Claims & FIDIC)",
            subKey: "category_legal_contracts_sub",
            subDefault: "Contract Claims & FIDIC • C1",
            levelBadge: "C1 Legal",
            count: categoryCounts["legal_contracts"] || 15,
          },
          {
            id: "medical_clinical",
            icon: "🏥",
            titleKey: "category_medical_clinical_title",
            titleDefault: "Tıp & Sağlık Bilimleri (Medical & Healthcare)",
            subKey: "category_medical_clinical_sub",
            subDefault: "Medical & Healthcare • C1",
            levelBadge: "C1 Clinical",
            count: categoryCounts["medical_clinical"] || 15,
          },
          {
            id: "finance_accounting",
            icon: "📈",
            titleKey: "category_finance_accounting_title",
            titleDefault: "Kurumsal Finans & Ekonomi (Corporate Finance)",
            subKey: "category_finance_accounting_sub",
            subDefault: "Corporate Finance & Banking • C1",
            levelBadge: "C1 Finance",
            count: categoryCounts["finance_accounting"] || 15,
          },
        ],
      },
    ];
  }, [categoryCounts, userStories.length]);

  // Seçili kategori meta verisi
  const activeCategoryMeta = useMemo(() => {
    for (const section of sidebarSections) {
      for (const item of section.items) {
        if (item.id === selectedCategoryFilter) return item;
      }
    }
    return sidebarSections[0].items[0];
  }, [sidebarSections, selectedCategoryFilter]);

  // Aktif filtrelenmiş hikaye listesi
  const displayedStories = useMemo(() => {
    let list: Array<CuratedStory | CustomStory | any> = [];

    if (selectedCategoryFilter === "all") {
      list = [...userStories, ...CURATED_STORIES_CATALOG];
    } else if (selectedCategoryFilter === "user_custom") {
      list = [...userStories];
    } else {
      list = getStoriesByCategory(selectedCategoryFilter);
    }

    // Arama sorgusu varsa
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((s) => {
      const titleMatch = s.title?.toLowerCase().includes(q);
      const topicMatch = s.topic?.toLowerCase().includes(q);
      const descMatch = s.desc?.toLowerCase().includes(q);
      const contentMatch = typeof s.content === "string" && s.content.toLowerCase().includes(q);
      const vocabMatch = Array.isArray(s.target_vocabulary) && s.target_vocabulary.some((v: any) => {
        const wordStr = typeof v === "string" ? v : v.word || "";
        const trStr = typeof v === "object" ? v.turkish_meaning || "" : "";
        return wordStr.toLowerCase().includes(q) || trStr.toLowerCase().includes(q);
      });
      return titleMatch || topicMatch || descMatch || contentMatch || vocabMatch;
    });
  }, [selectedCategoryFilter, searchQuery, userStories]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className={`w-full overflow-x-hidden ${className}`}>
      {/* ========================================================================= */}
      {/* 2 SÜTUNLU MİZANPAJ: SOL SİDEBAR + SAĞ VİTRİN                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* ======================================================================= */}
        {/* SOL SÜTUN (lg:w-64 shrink-0 lg:sticky lg:top-20): DİKEY KATEGORİ MENÜSÜ  */}
        {/* ======================================================================= */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-20 z-10 space-y-4">
          {/* Mobil Cihazlar İçin Açılır/Kapanır Akordiyon Butonu (< lg) */}
          <div className="lg:hidden w-full">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-sm shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{activeCategoryMeta.icon}</span>
                <span className="truncate">{t(activeCategoryMeta.titleKey, activeCategoryMeta.titleDefault)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {displayedStories.length}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  mobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Dikey Sidebar Kartı (Masaüstünde her zaman açık, mobilde akordiyon açıkken görünür) */}
          <div
            className={`w-full p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-5 ${
              mobileMenuOpen ? "block" : "hidden lg:block"
            }`}
          >
            {sidebarSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                {/* Bölüm Başlığı */}
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.icon}
                  <span>{t(section.titleKey, section.titleDefault)}</span>
                </div>

                {/* Bölüm İtemleri */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isSelected = selectedCategoryFilter === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group ${
                          isSelected
                            ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg shrink-0 leading-none">{item.icon}</span>
                          <div className="truncate">
                            <div
                              className={`text-xs truncate ${
                                isSelected ? "font-bold text-white" : "font-medium text-slate-300 group-hover:text-white"
                              }`}
                            >
                              {t(item.titleKey, item.titleDefault)}
                            </div>
                            {item.subKey && (
                              <div
                                className={`text-[10px] truncate ${
                                  isSelected ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-400"
                                }`}
                              >
                                {t(item.subKey, item.subDefault || "")}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sayı / Seviye Rozeti */}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {item.levelBadge && !isSelected && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {item.levelBadge}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                              isSelected
                                ? "bg-indigo-700 text-white"
                                : "bg-slate-800/80 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300"
                            }`}
                          >
                            {item.count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* SAĞ SÜTUN (flex-1 min-w-0): ARAMA ÇUBUĞU VE HİKAYE KARTLARI IZGARASI    */}
        {/* ======================================================================= */}
        <section className="flex-1 min-w-0 space-y-6 w-full">
          {/* 1. GOOGLE-SADELİĞİNDE ARAMA ÇUBUĞU */}
          <div className="relative flex items-center w-full">
            <div className="absolute left-4 pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-indigo-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                "search_stories_placeholder",
                "Hikaye, konu veya anahtar kelime ara (örn: critical path, fener, train, coffee)..."
              )}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/60 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-sm text-white placeholder-slate-400 shadow-xl backdrop-blur-md transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label={t("clear_search", "Aramayı Temizle")}
                className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 2. AKTİF BAŞLIK & BİLGİ ŞERİDİ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-slate-800/80 leading-none">
                {activeCategoryMeta.icon}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {t(activeCategoryMeta.titleKey, activeCategoryMeta.titleDefault)}
                  </h2>
                  {activeCategoryMeta.levelBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {activeCategoryMeta.levelBadge}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">
                    ({displayedStories.length} {t("stories_count_suffix", "Hikaye")})
                  </span>
                </div>
                {activeCategoryMeta.subKey && (
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {t(activeCategoryMeta.subKey, activeCategoryMeta.subDefault || "")}
                  </p>
                )}
              </div>
            </div>

            {/* Sağ Taraf: Hızlı Aksiyon veya Arama Temizleme */}
            <div className="flex items-center gap-2">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                >
                  {t("clear_search", "Aramayı Temizle")}
                </button>
              ) : (
                onCreateNewStory && (
                  <button
                    type="button"
                    onClick={onCreateNewStory}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/40 text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t("reading_generate_ai", "Yeni Üret")}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* 3. HİKAYE KARTLARI IZGARASI (GRID - Responsive, Yatay Scroll Çubuğu Yok) */}
          {displayedStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* "+ Yeni Hikaye / Metin Ekle" Kartı (Benim Hikayelerim veya Tüm Koleksiyonda en başta) */}
              {(selectedCategoryFilter === "user_custom" || (selectedCategoryFilter === "all" && !searchQuery)) && (
                <div
                  onClick={onCreateNewStory}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (onCreateNewStory) onCreateNewStory();
                    }
                  }}
                  className="w-full rounded-2xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3 group min-h-[300px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 group-hover:from-indigo-500/30 group-hover:to-amber-500/30 text-amber-300 flex items-center justify-center transition shadow-inner">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition flex items-center justify-center gap-1.5">
                      <span>+ {t("reading_generate_ai", "Yapay Zekâ ile Hikaye Üret")}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      {t("generate_custom_story_desc", "Destelerinden veya unutma eğrindeki kelimelerden sana özel hikaye oluştur")}
                    </p>
                  </div>
                </div>
              )}

              {/* Hikaye Kartları */}
              {displayedStories.map((story) => {
                const isCustom = !!(story as any).isUserStory;
                const categoryMeta = STORY_CATEGORIES.find(
                  (c) => c.id === story.category
                );
                return (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onSelect={onSelectStory}
                    isCompleted={completedStoryIds.includes(story.id)}
                    isInProgress={inProgressStoryIds.includes(story.id)}
                    isUserStory={isCustom}
                    onDelete={
                      isCustom
                        ? () => {
                            if (confirm(`"${story.title}" kütüphanenizden silinsin mi?`)) {
                              deleteUserStory(story.id);
                            }
                          }
                        : undefined
                    }
                    gradientFallback={
                      isCustom
                        ? autoAssignGradient(story)
                        : categoryMeta?.colorScheme.gradientFallback ||
                          "from-indigo-600 to-purple-800"
                    }
                  />
                );
              })}
            </div>
          ) : (
            /* Sıfır Sonuç Boş Durumu */
            <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-2xl">
                🔍
              </div>
              <h3 className="text-base font-bold text-white">
                {t("no_stories_found", "Aramanıza Uygun Hikaye Bulunamadı")}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {t("no_stories_found_desc", "Farklı bir kelime deneyebilir veya diğer kategorilere göz atabilirsiniz.")}
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
              >
                {t("clear_search", "Aramayı Temizle")}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
