import { Story, CuratedStory, StoryCategoryMeta } from "./types";

import { kidsStories, KIDS_STORIES } from "./kidsStories";
import { dailyLifeStories, ADULT_BASIC_STORIES } from "./dailyLifeStories";
import { adventureCultureStories, ADULT_INTERMEDIATE_STORIES } from "./adventureCultureStories";
import { sciencePhilosophyStories, ADULT_ADVANCED_STORIES } from "./sciencePhilosophyStories";
import { mythologyStories, MYTHOLOGY_STORIES } from "./mythologyStories";
import { archaeologyStories, ARCHAEOLOGY_STORIES } from "./archaeologyStories";
import { natureMiraclesStories, NATURE_MIRACLES_STORIES } from "./natureMiraclesStories";
import { humanCultureStories, HUMAN_CULTURE_STORIES } from "./humanCultureStories";
import { projectControlsStories, PROJECT_CONTROLS_STORIES } from "./projectControlsStories";
import { legalStories, LEGAL_CONTRACTS_STORIES } from "./legalStories";
import { medicalStories, MEDICAL_CLINICAL_STORIES } from "./medicalStories";
import { corporateFinanceStories, FINANCE_ACCOUNTING_STORIES } from "./corporateFinanceStories";

export * from "./types";

// 12 Kategori Hikayelerinin Dışa Aktarımı (Exports)
export { kidsStories, KIDS_STORIES } from "./kidsStories";
export { dailyLifeStories, ADULT_BASIC_STORIES } from "./dailyLifeStories";
export { adventureCultureStories, ADULT_INTERMEDIATE_STORIES } from "./adventureCultureStories";
export { sciencePhilosophyStories, ADULT_ADVANCED_STORIES } from "./sciencePhilosophyStories";
export { mythologyStories, MYTHOLOGY_STORIES } from "./mythologyStories";
export { archaeologyStories, ARCHAEOLOGY_STORIES } from "./archaeologyStories";
export { natureMiraclesStories, NATURE_MIRACLES_STORIES } from "./natureMiraclesStories";
export { humanCultureStories, HUMAN_CULTURE_STORIES } from "./humanCultureStories";
export { projectControlsStories, PROJECT_CONTROLS_STORIES } from "./projectControlsStories";
export { legalStories, LEGAL_CONTRACTS_STORIES } from "./legalStories";
export { medicalStories, MEDICAL_CLINICAL_STORIES } from "./medicalStories";
export { corporateFinanceStories, FINANCE_ACCOUNTING_STORIES } from "./corporateFinanceStories";

/**
 * Vocaship 180 Hikayelik Modüler Katalog
 * 12 Kategori x 15 Hikaye Modüler Mimarisi
 */
export const ALL_STORIES: Story[] = [
  ...kidsStories,
  ...dailyLifeStories,
  ...adventureCultureStories,
  ...sciencePhilosophyStories,
  ...mythologyStories,
  ...archaeologyStories,
  ...natureMiraclesStories,
  ...humanCultureStories,
  ...projectControlsStories,
  ...legalStories,
  ...medicalStories,
  ...corporateFinanceStories,
];

// Geriye dönük uyumluluk takma adı (Backward compatibility)
export const CURATED_STORIES_CATALOG: Story[] = ALL_STORIES;

/**
 * ID ile hikaye getirme yardımcı fonksiyonu
 */
export function getStoryById(id: string): Story | undefined {
  if (!id) return undefined;
  return ALL_STORIES.find((s) => s.id === id);
}

/**
 * Kategori ID'sine göre hikayeleri döndürür.
 */
export function getStoriesByCategory(catId: string): Story[] {
  if (!catId || catId === "all") return ALL_STORIES;
  return ALL_STORIES.filter((s) => s.category === catId);
}

/**
 * Başlık, konu ve hedef kelimelerde anlık filtreleme yapar.
 */
export function searchCuratedStories(query: string, categoryFilter?: string): Story[] {
  const q = query.trim().toLowerCase();
  let list = ALL_STORIES;
  if (categoryFilter && categoryFilter !== "all") {
    list = list.filter((s) => s.category === categoryFilter);
  }
  if (!q) return list;

  return list.filter((story) => {
    const titleMatch = story.title.toLowerCase().includes(q);
    const topicMatch = story.topic ? story.topic.toLowerCase().includes(q) : false;
    const descMatch = story.desc.toLowerCase().includes(q);
    const wordMatch = story.target_vocabulary?.some(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        (v.turkish_meaning && v.turkish_meaning.toLowerCase().includes(q)) ||
        (v.meaning && v.meaning.toLowerCase().includes(q))
    );
    return titleMatch || topicMatch || descMatch || wordMatch;
  });
}

/**
 * 12 Kategori Meta Veri Listesi
 */
export const STORY_CATEGORIES: StoryCategoryMeta[] = [
  {
    id: "kids",
    title: "Kids & Masallar",
    titleKey: "category_kids",
    description: "Kedi Luna, tilki Sparky ve renkli park maceraları (A1 Seviyesi)",
    icon: "🦊",
    levelBadge: "A1",
    colorScheme: {
      badgeBg: "bg-amber-100 dark:bg-amber-950/60",
      badgeText: "text-amber-800 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      gradientFallback: "from-amber-400 via-orange-400 to-yellow-500",
    },
  },
  {
    id: "adult_basic",
    title: "Günlük Yaşam & Temel İngilizce",
    titleKey: "category_adult_basic",
    description: "Kafeler, tren yolculukları, kütüphane ve pratik rutinler (A1-A2 Seviyesi)",
    icon: "☕",
    levelBadge: "A1-A2",
    colorScheme: {
      badgeBg: "bg-blue-100 dark:bg-blue-950/60",
      badgeText: "text-blue-800 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      gradientFallback: "from-sky-500 via-blue-500 to-indigo-600",
    },
  },
  {
    id: "adult_intermediate",
    title: "Macera & Kültür",
    titleKey: "category_adult_intermediate",
    description: "Antik saatçiler, fırtınalı deniz fenerleri ve Alp keşifleri (B1-B2 Seviyesi)",
    icon: "🏔️",
    levelBadge: "B1-B2",
    colorScheme: {
      badgeBg: "bg-emerald-100 dark:bg-emerald-950/60",
      badgeText: "text-emerald-800 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      gradientFallback: "from-emerald-500 via-teal-600 to-cyan-700",
    },
  },
  {
    id: "adult_advanced",
    title: "Felsefe & İleri Düşünce",
    titleKey: "category_adult_advanced",
    description: "Yapay zekâ ontolojisi, biyoetik, megakentler ve insan bilinci (C1-C2 Seviyesi)",
    icon: "🧠",
    levelBadge: "C1-C2",
    colorScheme: {
      badgeBg: "bg-purple-100 dark:bg-purple-950/60",
      badgeText: "text-purple-800 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-800",
      gradientFallback: "from-purple-600 via-violet-600 to-indigo-700",
    },
  },
  {
    id: "mythology",
    title: "Mitoloji & Efsaneler",
    titleKey: "category_mythology",
    description: "Prometheus, İkarus, kadim tanrılar ve destansı kahramanlık hikayeleri (B1-B2 Seviyesi)",
    icon: "⚡",
    levelBadge: "B1-B2",
    colorScheme: {
      badgeBg: "bg-yellow-100 dark:bg-yellow-950/60",
      badgeText: "text-yellow-800 dark:text-yellow-300",
      border: "border-yellow-200 dark:border-yellow-800",
      gradientFallback: "from-amber-500 via-yellow-500 to-orange-600",
    },
  },
  {
    id: "archaeology",
    title: "Arkeoloji & Antik Çağ",
    titleKey: "category_archaeology",
    description: "Göbeklitepe, Rosetta Taşı, kayıp medeniyetler ve hiyerogliflerin gizemi (B1-B2 Seviyesi)",
    icon: "🏛️",
    levelBadge: "B1-B2",
    colorScheme: {
      badgeBg: "bg-orange-100 dark:bg-orange-950/60",
      badgeText: "text-orange-800 dark:text-orange-300",
      border: "border-orange-200 dark:border-orange-800",
      gradientFallback: "from-amber-600 via-orange-600 to-stone-700",
    },
  },
  {
    id: "nature_miracles",
    title: "Doğa Mucizeleri & Biyoloji",
    titleKey: "category_nature_miracles",
    description: "Kutup ışıkları, biyoışıma, okyanus derinlikleri ve ekosistem harikaları (B1-B2 Seviyesi)",
    icon: "🌿",
    levelBadge: "B1-B2",
    colorScheme: {
      badgeBg: "bg-teal-100 dark:bg-teal-950/60",
      badgeText: "text-teal-800 dark:text-teal-300",
      border: "border-teal-200 dark:border-teal-800",
      gradientFallback: "from-teal-500 via-emerald-600 to-green-700",
    },
  },
  {
    id: "human_culture",
    title: "İnsan & Kültür Mirası",
    titleKey: "category_human_culture",
    description: "İpek Yolu kervanları, Kyoto çay ritüelleri ve dünya gelenekleri (B1-B2 Seviyesi)",
    icon: "🏮",
    levelBadge: "B1-B2",
    colorScheme: {
      badgeBg: "bg-indigo-100 dark:bg-indigo-950/60",
      badgeText: "text-indigo-800 dark:text-indigo-300",
      border: "border-indigo-200 dark:border-indigo-800",
      gradientFallback: "from-indigo-500 via-blue-600 to-violet-700",
    },
  },
  {
    id: "project_controls",
    title: "Proje Kontrol & Planlama",
    titleKey: "category_project_controls",
    description: "Schedule Variance, Critical Path analizi, EVM SPI/CPI ve P6 gecikme yönetimi (C1 Corporate)",
    icon: "📊",
    levelBadge: "C1 Corporate",
    colorScheme: {
      badgeBg: "bg-cyan-100 dark:bg-cyan-950/60",
      badgeText: "text-cyan-800 dark:text-cyan-300",
      border: "border-cyan-200 dark:border-cyan-800",
      gradientFallback: "from-blue-600 via-cyan-600 to-slate-800",
    },
  },
  {
    id: "legal_contracts",
    title: "Hukuk & FIDIC Sözleşmeleri",
    titleKey: "category_legal_contracts",
    description: "FIDIC Clause 8.4 Extension of Time, Demurrage, tahkim oturumları ve tazminat talepleri (C1 Corporate)",
    icon: "⚖️",
    levelBadge: "C1 Corporate",
    colorScheme: {
      badgeBg: "bg-stone-200 dark:bg-stone-800/80",
      badgeText: "text-stone-800 dark:text-stone-200",
      border: "border-stone-300 dark:border-stone-700",
      gradientFallback: "from-amber-700 via-stone-700 to-slate-900",
    },
  },
  {
    id: "medical_clinical",
    title: "Tıp & Klinik Vaka Yönetimi",
    titleKey: "category_medical_clinical",
    description: "OET hasta anamnezi, acil servis triyaj protokolü, kardiyak kriz ve farmakoterapi (C1 Clinical)",
    icon: "🩺",
    levelBadge: "C1 Clinical",
    colorScheme: {
      badgeBg: "bg-rose-100 dark:bg-rose-950/60",
      badgeText: "text-rose-800 dark:text-rose-300",
      border: "border-rose-200 dark:border-rose-800",
      gradientFallback: "from-rose-500 via-red-600 to-pink-700",
    },
  },
  {
    id: "finance_accounting",
    title: "Finans & Kurumsal Muhasebe",
    titleKey: "category_finance_accounting",
    description: "Likidite krizi, CapEx/OpEx optimizasyonu, IFRS 16 denetimi ve bilanço savunması (C1 Finance)",
    icon: "📈",
    levelBadge: "C1 Finance",
    colorScheme: {
      badgeBg: "bg-emerald-100 dark:bg-emerald-950/60",
      badgeText: "text-emerald-800 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      gradientFallback: "from-emerald-600 via-teal-600 to-slate-900",
    },
  },
];
