"use client";

import React, { useState, useEffect, useMemo } from "react";
import StoryReader from "./StoryReader";
import ShareModal from "../ShareModal";
import StoryGeneratorModal from "./StoryGeneratorModal";
import StoryVectorCover from "./StoryVectorCover";
import {
  ALL_STORIES,
  STORY_CATEGORIES,
  getStoryById,
  Story,
} from "../../data/stories";
import { useUserStories } from "../../context/UserStoriesContext";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { autoAssignCover, autoAssignGradient } from "../../utils/autoCover";
import { useTranslation, useLanguage } from "../../context/LanguageContext";
import {
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  X,
  Play,
  RotateCw,
  Search,
  Check,
  Trash2,
  Layers,
  Filter,
} from "lucide-react";

interface Deck {
  id: string;
  title: string;
}

interface ReadingRoomProps {
  decks: Deck[];
  selectedDeckId: string;
  initialStory?: any;
  onBack?: () => void;
  onShareStory?: (story: any) => void;
  onCompleteStory?: (storyId: string) => void;
}

export interface ProgressItem {
  storyKey: string;
  title: string;
  level: string;
  topic: string;
  lastParagraph: number;
  lastPage?: number;
  totalPages?: number;
  status: "in_progress" | "completed";
  updatedAt: number;
  contentSnippet?: string;
}

// 12 Kategori İçin Yüksek Çözünürlüklü Telifsiz Tematik Kapak Görselleri
const CATEGORY_DEFAULT_COVERS: Record<string, string> = {
  kids: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80",
  adult_basic: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
  adult_intermediate: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  adult_advanced: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  mythology: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  archaeology: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80",
  nature_miracles: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
  human_culture: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  project_controls: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
  legal_contracts: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
  medical_clinical: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  finance_accounting: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  user_custom: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
};

/**
 * Seviye kademesini ("A" | "B" | "C") çözer
 */
export function getStoryTier(story: any): "A" | "B" | "C" {
  const lvl = String(story?.level || "").toUpperCase();
  const cefr = String(story?.cefr || "").toUpperCase();

  if (
    lvl === "A" ||
    cefr.startsWith("A") ||
    lvl.startsWith("A1") ||
    lvl.startsWith("A2") ||
    lvl.includes("KIDS") ||
    lvl.includes("ELEMENTARY") ||
    lvl.includes("BASIC")
  ) {
    return "A";
  }

  if (
    lvl === "C" ||
    cefr.startsWith("C") ||
    lvl.startsWith("C1") ||
    lvl.startsWith("C2") ||
    lvl.includes("ADVANCED") ||
    lvl.includes("CORPORATE") ||
    lvl.includes("LEGAL") ||
    lvl.includes("CLINICAL") ||
    lvl.includes("FINANCE")
  ) {
    return "C";
  }

  return "B";
}

/**
 * Okuma süresi göstergesi
 */
export function getStoryReadTime(story: any, tier: "A" | "B" | "C"): string {
  if (story?.readTime && typeof story.readTime === "string" && story.readTime.trim()) {
    return story.readTime;
  }
  if (tier === "A") return "2-3 dk";
  if (tier === "B") return "4-5 dk";
  return "5-6 dk";
}

/**
 * Hikayenin kapak görseli URL'ini çözer (kesintisiz görsel garantisi)
 */
export function getStoryCover(story: any): string {
  if (story?.coverImage && typeof story.coverImage === "string" && story.coverImage.startsWith("http")) {
    return story.coverImage;
  }
  const cat = String(story?.category || "").toLowerCase();
  return CATEGORY_DEFAULT_COVERS[cat] || CATEGORY_DEFAULT_COVERS.adult_basic;
}

/**
 * Kategori eşleme kontrolü (eşanlamlı ve sektör takma adları destekli)
 */
export function isStoryInCategory(story: any, catId: string): boolean {
  if (catId === "all") return true;
  if (catId === "user_custom") return !!story.isUserStory;

  const sCat = String(story.category || "").toLowerCase();
  const target = catId.toLowerCase();

  if (sCat === target) return true;
  if (target === "project_controls" && (sCat === "projectcontrols" || sCat === "project_controls")) return true;
  if (target === "legal_contracts" && (sCat === "legal" || sCat === "legal_contracts")) return true;
  if (target === "medical_clinical" && (sCat === "medical" || sCat === "medical_clinical")) return true;
  if (target === "finance_accounting" && (sCat === "corporate_finance" || sCat === "finance" || sCat === "corporatefinance" || sCat === "finance_accounting")) return true;

  return false;
}

export const GENERAL_CULTURE_ITEMS = [
  { id: "kids", label: "Kids & Masallar", icon: "🦊" },
  { id: "adult_basic", label: "Günlük Yaşam", icon: "☕" },
  { id: "adult_intermediate", label: "Macera & Kültür", icon: "🏔️" },
  { id: "adult_advanced", label: "Felsefe & İleri Düşünce", icon: "🧠" },
  { id: "mythology", label: "Mitoloji & Efsaneler", icon: "⚡" },
  { id: "archaeology", label: "Arkeoloji & Bilim Tarihi", icon: "🏛️" },
  { id: "nature_miracles", label: "Doğa & Biyoloji Mucizeleri", icon: "🌿" },
  { id: "human_culture", label: "Kültür & Sıradışı İnsanlar", icon: "🏮" },
];

export const PROFESSIONAL_ITEMS = [
  { id: "project_controls", label: "Proje Kontrol & Planlama", icon: "📊" },
  { id: "legal_contracts", label: "Hukuk & Sözleşmeler", icon: "⚖️" },
  { id: "medical_clinical", label: "Tıp & Sağlık Bilimleri", icon: "🩺" },
  { id: "finance_accounting", label: "Kurumsal Finans & Ekonomi", icon: "📈" },
];

const PRESET_SNIPPETS = [
  {
    label: "📰 The Economist",
    title: "The Architecture of Deep Focus (The Economist)",
    text: "In an era dominated by relentless digital interruptions, the ability to cultivate sustained focus has emerged as an indispensable cognitive asset. Knowledge workers worldwide struggle against fragmented attention spans, frequently falling prey to ephemeral notifications and shallow tasks. Cognitive researchers substantiate that deep focus requires deliberate friction against cognitive fatigue.",
  },
  {
    label: "🌍 BBC",
    title: "Global Supply Chains and Everyday Economy (BBC)",
    text: "Modern international trade is undergoing a profound structural transformation. Decades of prioritizing cost efficiency over systemic resilience exposed severe bottlenecks during global disruptions. Consequently, multinational corporations are actively diversifying supplier networks, transitioning from precarious single-source dependencies to robust regionalized ecosystems.",
  },
  {
    label: "🔬 Nature",
    title: "Neuroscience of Memory & Spaced Repetition (Nature)",
    text: "Human memory is not a static recording device; rather, it is a dynamic neural system governed by the Ebbinghaus forgetting curve. Without active reinforcement, our brains prune newly acquired vocabulary at an exponential rate within forty-eight hours. Spaced repetition algorithms strategically schedule flashcard reviews right at the critical juncture of forgetting.",
  },
];

/**
 * 16:9 Kapak Görselli, Rozetli ve Hedef Kelimeli Vitrin Kartı
 */
interface StoryCardProps {
  story: any;
  onSelect: (story: any) => void;
  isCompleted?: boolean;
  isInProgress?: boolean;
  onDelete?: () => void;
  isUserStory?: boolean;
}

function StoryCardItem({
  story,
  onSelect,
  isCompleted,
  isInProgress,
  onDelete,
  isUserStory,
}: StoryCardProps) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const tier = getStoryTier(story);
  const readTime = getStoryReadTime(story, tier);
  const coverUrl = getStoryCover(story);

  // İlk 3 hedef kelime
  const previewWords = (story.target_vocabulary || story.target_words || []).slice(0, 3);

  // Seviye Rozet Stili
  const tierBadgeConfig = {
    A: {
      label: "A Seviyesi (2-3 dk)",
      badgeBg: "bg-emerald-500/90 text-white border-emerald-400/40",
      dot: "🟢",
    },
    B: {
      label: "B Seviyesi (4-5 dk)",
      badgeBg: "bg-sky-500/90 text-white border-sky-400/40",
      dot: "🔵",
    },
    C: {
      label: "C Seviyesi (5-6 dk)",
      badgeBg: "bg-purple-600/90 text-white border-purple-400/40",
      dot: "🟣",
    },
  }[tier];

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
      className={`group relative w-full rounded-2xl bg-white dark:bg-slate-900/90 border shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
        isUserStory
          ? "border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10"
          : "border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/70 hover:shadow-indigo-500/15"
      }`}
    >
      {/* 16:9 Kapak Görseli Katmanı (aspect-video) */}
      <div className="aspect-video relative overflow-hidden bg-slate-950">
        {!imgError && coverUrl ? (
          <img
            src={coverUrl}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <StoryVectorCover
            category={story.category}
            topic={story.topic}
            title={story.title}
            level={story.level}
            cefr={story.cefr}
            isUserStory={isUserStory}
            isCareerCase={story.isCareerCase}
          />
        )}

        {/* Görsel Üzeri Hafif Karartma */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30 pointer-events-none" />

        {/* Sol Üst: Seviye Rozeti */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
          <span
            className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-md border flex items-center gap-1.5 ${tierBadgeConfig.badgeBg}`}
          >
            <span>{tierBadgeConfig.dot}</span>
            <span>{story.cefr || tierBadgeConfig.label}</span>
          </span>

          {isUserStory && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500 text-slate-950 backdrop-blur-md shadow-md">
              ✨ {t("badge_custom", "Özel")}
            </span>
          )}

          {story.isCareerCase && !isUserStory && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-cyan-600/90 text-white backdrop-blur-md shadow-md border border-cyan-400/30">
              💼 {t("badge_case", "Vaka")}
            </span>
          )}
        </div>

        {/* Sağ Üst: Süre ve Kelime Sayısı */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title={t("delete_story_tooltip", "Hikayeyi Sil")}
              className="p-1 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-slate-400 hover:text-white transition shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/85 text-slate-200 border border-slate-700/80 backdrop-blur-md text-[10px] sm:text-[11px] font-medium shadow-md">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{readTime}</span>
            {story.wordCount && (
              <span className="text-slate-400 font-mono">• {story.wordCount}k</span>
            )}
          </div>
        </div>

        {/* Sol Alt: Tamamlandı / Devam Ediyor Damgası */}
        {isCompleted && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/95 text-slate-950 text-[10px] font-bold shadow-md z-20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t("badge_read", "Okundu")}</span>
          </div>
        )}
        {!isCompleted && isInProgress && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/95 text-slate-950 text-[10px] font-bold shadow-md z-20">
            <Bookmark className="w-3.5 h-3.5" />
            <span>{t("badge_bookmark", "Kaldığın Yer")}</span>
          </div>
        )}
      </div>

      {/* Kart Gövdesi: Başlık, Açıklama, Hedef Kelimeler */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider line-clamp-1 ${
              isUserStory ? "text-amber-400" : "text-indigo-400"
            }`}
          >
            {story.topic || story.categoryName || (isUserStory ? "Özel Hikaye" : "Genel Okuma")}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
            {story.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {story.desc || (story.content ? story.content.slice(0, 110) + "..." : "")}
          </p>
        </div>

        {/* Hedef Kelime Etiketleri */}
        {previewWords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {previewWords.map((v: any, idx: number) => {
              const wordText = typeof v === "string" ? v : v.word;
              const trMeaning = typeof v === "object" ? v.turkish_meaning : "";
              return (
                <span
                  key={idx}
                  title={trMeaning ? `${wordText}: ${trMeaning}` : wordText}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 group-hover:border-indigo-400 dark:group-hover:border-indigo-500/40 transition-colors"
                >
                  <strong className="text-indigo-600 dark:text-indigo-300">{wordText}</strong>
                  {trMeaning && (
                    <span className="text-slate-500 dark:text-slate-400"> • {trMeaning}</span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Aksiyon Alt Çubuğu */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
          <span className="text-[11px] text-slate-500 dark:text-slate-500">
            {isUserStory ? "Kişisel Kütüphane" : "Sıfır Bekleme (0ms)"}
          </span>
          <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>{t("btn_read_now", "Hemen Oku")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReadingRoom({
  decks,
  selectedDeckId,
  initialStory,
  onBack,
  onShareStory,
  onCompleteStory,
}: ReadingRoomProps) {
  const { t } = useTranslation();
  const { userStories, deleteUserStory } = useUserStories();
  const { user } = useAuth();
  const { userProfile } = useProfile();

  const planTier: "basic" | "plus" | "pro" =
    user?.planTier ||
    userProfile?.planTier ||
    userProfile?.plan_tier ||
    (user?.isPro ? "pro" : "basic");

  // 1. KÜTÜPHANE 3 ANA SEKME STATE'İ: 'explore' | 'in_progress' | 'completed'
  const [activeTab, setActiveTab] = useState<"explore" | "in_progress" | "completed">("explore");

  // Filtreler: Seviye ve Kategori
  const [selectedLevel, setSelectedLevel] = useState<"all" | "A" | "B" | "C">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Okunan Hikaye State'i (null ise Katalog Vitrini gösterilir, dolu ise Dual-Reader açılır)
  const [story, setStory] = useState<any | null>(null);
  const [shareStoryModal, setShareStoryModal] = useState<any | null>(null);

  // Kendi Metnini Yapıştır Modalı State'i
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteTitle, setPasteTitle] = useState("");

  // Yapay Zekâ ile Hikaye Üret Modalı State'i
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

  // İlerleme Listesi (localStorage: quizwise_progress_...)
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);

  const loadSavedProgress = () => {
    try {
      const items: ProgressItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("quizwise_progress_")) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              items.push(JSON.parse(val));
            } catch {}
          }
        }
      }
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      setProgressList(items);
    } catch (e) {
      console.error("Progress yüklenemedi:", e);
    }
  };

  useEffect(() => {
    loadSavedProgress();
  }, [story]);

  // Initial story veya session kontrolü (Açılışta her zaman vitrin standardı)
  useEffect(() => {
    if (initialStory) {
      setStory(initialStory);
      return;
    }

    if (typeof window !== "undefined") {
      const pendingText = sessionStorage.getItem("vocaship_pending_reading_text");
      const pendingTitle = sessionStorage.getItem("vocaship_pending_reading_title");
      if (pendingText) {
        sessionStorage.removeItem("vocaship_pending_reading_text");
        sessionStorage.removeItem("vocaship_pending_reading_title");
        handleLaunchCustomReader(pendingText, pendingTitle || "Özel Okuma Metni");
      }
    }
  }, [initialStory]);

  const inProgressStories = progressList.filter((p) => p.status === "in_progress");
  const completedStories = progressList.filter((p) => p.status === "completed");

  // Kullanıcı hikayelerini de içeren birleşik koleksiyon
  const allAvailableStories = useMemo(() => {
    const formattedUserStories = (userStories || []).map((us) => ({
      ...us,
      isUserStory: true,
      category: "user_custom",
      categoryName: "Özel Kütüphane",
      level: us.level || "B1",
      cefr: us.cefr || "B1",
      readTime: us.readTime || "2 dk",
      wordCount: typeof us.wordCount === "number" ? us.wordCount : parseInt(String(us.wordCount || "150"), 10) || 150,
      topic: us.topic || "Özel Metin",
      desc: us.desc || (us.content ? us.content.slice(0, 110) + "..." : ""),
    }));

    return [...formattedUserStories, ...ALL_STORIES];
  }, [userStories]);

  // Filtrelenmiş hikayeler
  const filteredStories = useMemo(() => {
    let list = allAvailableStories;

    // Kategori Filtresi
    if (selectedCategory !== "all") {
      list = list.filter((s) => isStoryInCategory(s, selectedCategory));
    }

    // Seviye Filtresi ("A" | "B" | "C")
    if (selectedLevel !== "all") {
      list = list.filter((s) => getStoryTier(s) === selectedLevel);
    }

    // Arama Sorgusu
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((s) => {
      const titleMatch = (s.title || "").toLowerCase().includes(q);
      const topicMatch = (s.topic || "").toLowerCase().includes(q);
      const descMatch = (s.desc || "").toLowerCase().includes(q);
      const contentMatch = typeof s.content === "string" && s.content.toLowerCase().includes(q);
      const vocabMatch =
        Array.isArray(s.target_vocabulary) &&
        s.target_vocabulary.some((v: any) => {
          const wordStr = typeof v === "string" ? v : v.word || "";
          const trStr = typeof v === "object" ? v.turkish_meaning || "" : "";
          return wordStr.toLowerCase().includes(q) || trStr.toLowerCase().includes(q);
        });
      const wordsMatch =
        Array.isArray(s.target_words) &&
        s.target_words.some((w: string) => w.toLowerCase().includes(q));

      return titleMatch || topicMatch || descMatch || contentMatch || vocabMatch || wordsMatch;
    });
  }, [allAvailableStories, selectedCategory, selectedLevel, searchQuery]);

  const handleSelectStory = (item: any) => {
    setStory({
      id: item.id,
      title: item.title,
      level: item.level,
      topic: item.topic,
      cefr: item.cefr,
      desc: item.desc,
      wordCount: typeof item.wordCount === "number" ? `${item.wordCount} Kelime` : item.wordCount,
      target_words: item.target_words || [],
      isCareerCase: item.isCareerCase,
      coverImage: getStoryCover(item),
      isUserStory: item.isUserStory,
      content: item.content,
      target_vocabulary: item.target_vocabulary,
      comprehension_questions: item.comprehension_questions,
    });
  };

  const handleOpenFromProgress = (pItem: ProgressItem) => {
    const foundCurated = getStoryById(pItem.storyKey);
    if (foundCurated) {
      handleSelectStory(foundCurated);
      return;
    }

    const foundUserStory = userStories.find((s) => s.id === pItem.storyKey);
    if (foundUserStory) {
      handleSelectStory(foundUserStory);
      return;
    }

    const foundInAll = ALL_STORIES.find((s) => s.id === pItem.storyKey);
    if (foundInAll) {
      handleSelectStory(foundInAll);
    } else {
      handleLaunchCustomReader(pItem.contentSnippet || "Örnek metin", pItem.title);
    }
  };

  // Kendi metnini yapıştırıp açma
  const handleLaunchCustomReader = (text?: string, title?: string) => {
    const finalContent = (text || pasteText).trim();
    const finalTitle = (title || pasteTitle).trim() || "Özel Çözümlenen Metin";
    if (!finalContent) return;

    const sampleTokens = finalContent
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z]/g, ""))
      .filter((w) => w.length >= 6)
      .slice(0, 4);

    const autoCoverImg = autoAssignCover({
      title: finalTitle,
      topic: "Özel Analiz",
      content: finalContent,
    });

    const customStory = {
      id: `custom_${Date.now()}`,
      title: finalTitle,
      level: "Advanced",
      cefr: "C1 Serbest",
      topic: "Özel Analiz",
      desc: finalContent.slice(0, 120) + "...",
      wordCount: `~${finalContent.split(/\s+/).length} Kelime`,
      target_words: sampleTokens,
      content: finalContent,
      coverImage: autoCoverImg || CATEGORY_DEFAULT_COVERS.user_custom,
      isUserStory: true,
      target_vocabulary: sampleTokens.map((w) => ({
        word: w.toLowerCase(),
        phonetic: "",
        turkish_meaning: "Detay görmek için tıklayın",
      })),
      comprehension_questions: [
        {
          question: "Bu metnin ana düşüncesi nedir?",
          options: [
            "A) Metinde aktarılan temel argüman ve çözümlemeler",
            "B) Konuyla ilgisiz ikincil bir gözlem",
            "C) Yalnızca teknik bir detay",
            "D) Karşıt bir hipotez",
          ],
          correct_answer_index: 0,
        },
      ],
    };

    setPasteText("");
    setPasteTitle("");
    setIsPasteModalOpen(false);
    setStory(customStory);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedLevel("all");
    setSelectedCategory("all");
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 overflow-x-hidden">
      {!story ? (
        /* ========================================================================= */
        /* KATALOG VİTRİNİ GÖRÜNÜMÜ                                                  */
        /* ========================================================================= */
        <div className="space-y-4">
          {/* 1. KOMPAKT VE TEK SATIRLIK ÜST ŞERİT (TOP BAR) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            {/* Sol: Başlık + Toplam Hikaye Rozeti + Günlük AI Hikaye Kotası */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">📖</span>
                <span>{t("nav_reading", "Okuma Odası")}</span>
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {allAvailableStories.length} Hikaye
              </span>
              {planTier === "pro" ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-[11px] flex items-center gap-1 shadow-sm">
                  👑 PRO • Sınırsız AI
                </span>
              ) : planTier === "plus" ? (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-extrabold text-[11px] flex items-center gap-1 shadow-sm">
                  ⚡ Plus • Günlük 5/5 AI
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[11px] flex items-center gap-1 shadow-sm">
                  🆓 Basic • Günlük 1/1 AI
                </span>
              )}
            </div>

            {/* Orta/Sağ: Arama + Seviye Filtre Hapları + Eylem Butonları */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap flex-1 justify-end">
              {/* Hızlı Arama Kutusu */}
              <div className="relative flex-1 sm:flex-none sm:w-52 lg:w-60 min-w-[170px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hikaye ara..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Seviye Filtre Hapları: [ Tümü ] [ A (2-3 dk) ] [ B (4-5 dk) ] [ C (5-6 dk) ] */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedLevel("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedLevel === "all"
                      ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel("A")}
                  title="A Seviyesi (2-3 dk)"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedLevel === "A"
                      ? "bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400/40"
                      : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/50"
                  }`}
                >
                  <span>🟢</span>
                  <span className="hidden xl:inline">A (2-3 dk)</span>
                  <span className="xl:hidden">A</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel("B")}
                  title="B Seviyesi (4-5 dk)"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedLevel === "B"
                      ? "bg-sky-600 text-white shadow-md ring-1 ring-sky-400/40"
                      : "text-sky-400 hover:text-sky-300 hover:bg-slate-800/50"
                  }`}
                >
                  <span>🔵</span>
                  <span className="hidden xl:inline">B (4-5 dk)</span>
                  <span className="xl:hidden">B</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLevel("C")}
                  title="C Seviyesi (5-6 dk)"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedLevel === "C"
                      ? "bg-purple-600 text-white shadow-md ring-1 ring-purple-400/40"
                      : "text-purple-400 hover:text-purple-300 hover:bg-slate-800/50"
                  }`}
                >
                  <span>🟣</span>
                  <span className="hidden xl:inline">C (5-6 dk)</span>
                  <span className="xl:hidden">C</span>
                </button>
              </div>

              {/* Eylem Butonları */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsGeneratorModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden sm:inline">{t("reading_generate_ai", "Yapay Zekâ ile Üret")}</span>
                  <span className="sm:hidden">Üret</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition active:scale-95 cursor-pointer shrink-0"
                >
                  <span>📋</span>
                  <span className="hidden sm:inline">{t("reading_paste_text", "Metin Yapıştır")}</span>
                  <span className="sm:hidden">Yapıştır</span>
                </button>
              </div>
            </div>
          </div>

          {/* MOBİL YATAY KATEGORİ MENÜSÜ (lg:hidden) */}
          <div className="lg:hidden w-full overflow-x-auto pb-1 scrollbar-none flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("explore");
                setSelectedCategory("all");
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === "explore" && selectedCategory === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-900 border border-slate-800 text-slate-300"
              }`}
            >
              <span>🌟</span>
              <span>Keşfet ({allAvailableStories.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("in_progress")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === "in_progress"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-900 border border-slate-800 text-slate-300"
              }`}
            >
              <span>⏳</span>
              <span>Devam Edenler ({inProgressStories.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === "completed"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-900 border border-slate-800 text-slate-300"
              }`}
            >
              <span>✅</span>
              <span>Arşivim ({completedStories.length})</span>
            </button>
            {userStories.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("explore");
                  setSelectedCategory("user_custom");
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === "explore" && selectedCategory === "user_custom"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                    : "bg-slate-900 border border-amber-500/30 text-amber-300"
                }`}
              >
                <span>✨</span>
                <span>Benim Hikayelerim ({userStories.length})</span>
              </button>
            )}
            {GENERAL_CULTURE_ITEMS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveTab("explore");
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  activeTab === "explore" && selectedCategory === cat.id
                    ? "bg-indigo-600 text-white font-bold shadow-md"
                    : "bg-slate-900 border border-slate-800 text-slate-300"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
            {PROFESSIONAL_ITEMS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveTab("explore");
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  activeTab === "explore" && selectedCategory === cat.id
                    ? "bg-indigo-600 text-white font-bold shadow-md"
                    : "bg-slate-900 border border-slate-800 text-slate-300"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* 2 SÜTUNLU MİZANPAJ: SOL DİKEY SIDEBAR + SAĞ GENİŞ VİTRİN */}
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* SOL DİKEY KATEGORİ MENÜSÜ (SIDEBAR) */}
            <aside className="hidden lg:block w-64 lg:w-72 shrink-0 sticky top-20 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {/* A) ANA RAF SEÇİCİ */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ana Raf
                </div>
                {/* 🌟 Keşfet (Tümü) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("explore");
                    setSelectedCategory("all");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === "explore" && selectedCategory === "all"
                      ? "bg-indigo-600/90 text-white font-bold shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>🌟</span>
                    <span>Keşfet (Tümü)</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-950/60 text-slate-300">
                    {allAvailableStories.length}
                  </span>
                </button>

                {/* ⏳ Devam Edenler */}
                <button
                  type="button"
                  onClick={() => setActiveTab("in_progress")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === "in_progress"
                      ? "bg-indigo-600/90 text-white font-bold shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>⏳</span>
                    <span>Devam Edenler</span>
                  </div>
                  {inProgressStories.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      {inProgressStories.length}
                    </span>
                  )}
                </button>

                {/* ✅ Arşivim */}
                <button
                  type="button"
                  onClick={() => setActiveTab("completed")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === "completed"
                      ? "bg-indigo-600/90 text-white font-bold shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Arşivim</span>
                  </div>
                  {completedStories.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {completedStories.length}
                    </span>
                  )}
                </button>

                {/* ✨ Benim Hikayelerim */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("explore");
                    setSelectedCategory("user_custom");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === "explore" && selectedCategory === "user_custom"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-300"
                      : "text-amber-400/80 hover:text-amber-300 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>✨</span>
                    <span>Benim Hikayelerim</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-950/60 text-amber-300">
                    {userStories.length}
                  </span>
                </button>
              </div>

              {/* B) 🌍 GENEL KÜLTÜR */}
              <div className="space-y-1 pt-3 border-t border-slate-800/80">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>🌍</span>
                  <span>Genel Kültür</span>
                </div>
                {GENERAL_CULTURE_ITEMS.map((cat) => {
                  const isSelected = activeTab === "explore" && selectedCategory === cat.id;
                  const count = allAvailableStories.filter((s) => isStoryInCategory(s, cat.id)).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveTab("explore");
                        setSelectedCategory(cat.id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/90 text-white font-semibold shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-950/60 text-slate-400 shrink-0 ml-1">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* C) 💼 MESLEKİ & SEKTÖREL */}
              <div className="space-y-1 pt-3 border-t border-slate-800/80">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>💼</span>
                  <span>Mesleki & Sektörel</span>
                </div>
                {PROFESSIONAL_ITEMS.map((cat) => {
                  const isSelected = activeTab === "explore" && selectedCategory === cat.id;
                  const count = allAvailableStories.filter((s) => isStoryInCategory(s, cat.id)).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveTab("explore");
                        setSelectedCategory(cat.id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/90 text-white font-semibold shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-950/60 text-slate-400 shrink-0 ml-1">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* SAĞ TARAF - FERAH HİKAYE VİTRİNİ */}
            <main className="flex-1 min-w-0 w-full space-y-4">
              {/* ========================================================================= */}
              {/* SEKME 1: [ 📚 KEŞFET ] - HİKAYE VİTRİNİ & GRID                             */}
              {/* ========================================================================= */}
              {activeTab === "explore" && (
                <div className="space-y-4">
                  {/* Aktif Kategori / Arama Bilgisi Çubuğu */}
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <span className="text-indigo-400">
                        {selectedCategory === "all"
                          ? "🌟 Tüm Kategoriler"
                          : selectedCategory === "user_custom"
                          ? "✨ Benim Hikayelerim"
                          : (GENERAL_CULTURE_ITEMS.find((c) => c.id === selectedCategory) ||
                             PROFESSIONAL_ITEMS.find((c) => c.id === selectedCategory))?.label || selectedCategory}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-normal">
                        {filteredStories.length} {filteredStories.length === 1 ? "hikaye" : "hikaye"}
                        {selectedLevel !== "all" && ` (${selectedLevel} Seviyesi)`}
                      </span>
                    </div>

                    {(selectedCategory !== "all" || selectedLevel !== "all" || searchQuery) && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                      >
                        Filtreleri Temizle
                      </button>
                    )}
                  </div>

                  {/* HİKAYE KARTLARI IZGARASI */}
                  {filteredStories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {/* Hikaye Kartları */}
                      {filteredStories.map((storyItem, index) => {
                        const isCustom = !!storyItem.isUserStory;
                        return (
                          <StoryCardItem
                            key={`${storyItem.id}-${storyItem.isUserStory ? 'custom' : 'default'}-${index}`}
                            story={storyItem}
                            onSelect={handleSelectStory}
                            isCompleted={completedStories.some((c) => c.storyKey === storyItem.id)}
                            isInProgress={inProgressStories.some((p) => p.storyKey === storyItem.id)}
                            isUserStory={isCustom}
                            onDelete={
                              isCustom
                                ? () => {
                                    if (confirm(`"${storyItem.title}" kütüphanenizden silinsin mi?`)) {
                                      deleteUserStory(storyItem.id);
                                    }
                                  }
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  ) : (
                    /* Boş Durum: Arama / Filtreleme Sonucu Yok */
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-2xl">
                        🔍
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {t("no_stories_found", "Aramanıza veya Filtreye Uygun Hikaye Bulunamadı")}
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Seçili seviye veya kategoride eşleşen metin bulunamadı. Filtreleri temizleyerek tüm kataloğu görüntüleyebilirsiniz.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* SEKME 2: [ ⏳ DEVAM EDENLER ]                                             */}
              {/* ========================================================================= */}
              {activeTab === "in_progress" && (
                <div className="space-y-4">
                  {inProgressStories.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-2xl">
                        ⏳
                      </div>
                      <h3 className="text-sm font-semibold text-slate-200">
                        Yarım kalan bir okumanız bulunmuyor
                      </h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Keşfet sekmesinden yeni bir hikaye veya vaka analizine başlayarak okuma odasında ilerleyebilirsiniz.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("explore");
                          setSelectedCategory("all");
                        }}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                      >
                        <span>Metinleri Keşfet</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {inProgressStories.map((item, index) => {
                        const totalP = item.totalPages || 3;
                        const currentP = (item.lastPage ?? item.lastParagraph ?? 0) + 1;
                        const percent = Math.min(100, Math.round((currentP / totalP) * 100));

                        return (
                          <div
                            key={`${item.storyKey}-${index}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition shadow-sm"
                          >
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center space-x-2.5">
                                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold font-mono">
                                  {item.level || "Orta"}
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                                  {item.title}
                                </h3>
                              </div>

                              <div className="space-y-1 max-w-md">
                                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                  <span>Kaldığınız Yer: Sayfa {currentP} / {totalP}</span>
                                  <span className="text-indigo-400 font-mono font-bold">%{percent}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenFromProgress(item)}
                              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer shrink-0"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Okumaya Devam Et</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* SEKME 3: [ ✅ ARŞİVİM ]                                                   */}
              {/* ========================================================================= */}
              {activeTab === "completed" && (
                <div className="space-y-4">
                  {completedStories.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-2xl">
                        📚
                      </div>
                      <h3 className="text-sm font-semibold text-slate-200">
                        Henüz tamamlanan bir metniniz yok
                      </h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Bir okumayı bitirdiğinizde &apos;Hikayeyi Bitirdim&apos; butonuna basarak arşive ekleyebilirsiniz.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("explore");
                          setSelectedCategory("all");
                        }}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                      >
                        <span>Metinleri Keşfet</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {completedStories.map((item, index) => (
                        <div
                          key={`${item.storyKey}-${index}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition shadow-sm"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Tamamlandı</span>
                              </span>
                              <h3 className="text-sm sm:text-base font-bold text-white">
                                {item.title}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-400">
                              Kategori: {item.topic || "Genel"} • Seviye: {item.level || "C1"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenFromProgress(item)}
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer shrink-0"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Yeniden Oku</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* DUAL-READER ÇALIŞMA ALANI (StoryReader)                                   */
        /* ========================================================================= */
        <StoryReader
          key={story.id || story.title}
          story={story}
          decks={decks}
          selectedDeckId={selectedDeckId}
          onShareStory={(s) => (onShareStory ? onShareStory(s) : setShareStoryModal(s))}
          onBackToLibrary={() => {
            setStory(null);
            loadSavedProgress();
            if (onBack) onBack();
          }}
          onCompleteStory={(sKey) => {
            loadSavedProgress();
            if (onCompleteStory) onCompleteStory(sKey);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* KENDİ METNİNİ YAPIŞTIR MODALI                                             */}
      {/* ========================================================================= */}
      {isPasteModalOpen && (
        <div
          onClick={() => setIsPasteModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 sm:p-7 shadow-2xl shadow-indigo-950/60 space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">✍️</span>
                <div>
                  <h3 className="text-base font-bold text-white">Kendi Metnini Yapıştır</h3>
                  <p className="text-xs text-slate-400">
                    Makale, haber veya vaka metninizi Dual-Reader ile inceleyin
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Metin Başlığı (İsteğe Bağlı)..."
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <textarea
                rows={8}
                placeholder="İngilizce metninizi buraya yapıştırın..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
              />

              {/* Örnek Parçacıklar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Örnekler:</span>
                {PRESET_SNIPPETS.map((snippet) => (
                  <button
                    key={snippet.label}
                    type="button"
                    onClick={() => {
                      setPasteText(snippet.text);
                      setPasteTitle(snippet.title);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                  >
                    {snippet.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={!pasteText.trim()}
                onClick={() => handleLaunchCustomReader(pasteText, pasteTitle)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                Metni Çözümle & Oku ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YAPAY ZEKÂ İLE ÖZGÜN HİKAYE ÜRET MODALI */}
      <StoryGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onStoryGenerated={(newStory) => {
          setStory(newStory);
        }}
        decks={decks}
      />

      {/* PAYLAŞIM MODALI */}
      {shareStoryModal && (
        <ShareModal
          isOpen={!!shareStoryModal}
          onClose={() => setShareStoryModal(null)}
          title={shareStoryModal.title}
          itemType="story"
          itemId={shareStoryModal.id || `story_${shareStoryModal.title}`}
          story={shareStoryModal}
        />
      )}
    </div>
  );
}
