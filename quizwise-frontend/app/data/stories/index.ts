import { CuratedStory, StoryCategoryMeta } from "./types";
import { KIDS_STORIES } from "./kidsStories";
import { ADULT_BASIC_STORIES } from "./adultBasicStories";
import { ADULT_INTERMEDIATE_STORIES } from "./adultIntermediateStories";
import { ADULT_ADVANCED_STORIES } from "./adultAdvancedStories";
import { PROJECT_CONTROLS_STORIES } from "./projectControlsStories";
import { LEGAL_CONTRACTS_STORIES } from "./legalContractsStories";
import { MEDICAL_CLINICAL_STORIES } from "./medicalClinicalStories";
import { FINANCE_ACCOUNTING_STORIES } from "./financeAccountingStories";

export * from "./types";
export { KIDS_STORIES } from "./kidsStories";
export { ADULT_BASIC_STORIES } from "./adultBasicStories";
export { ADULT_INTERMEDIATE_STORIES } from "./adultIntermediateStories";
export { ADULT_ADVANCED_STORIES } from "./adultAdvancedStories";
export { PROJECT_CONTROLS_STORIES } from "./projectControlsStories";
export { LEGAL_CONTRACTS_STORIES } from "./legalContractsStories";
export { MEDICAL_CLINICAL_STORIES } from "./medicalClinicalStories";
export { FINANCE_ACCOUNTING_STORIES } from "./financeAccountingStories";

/**
 * 120 Statik ve Telifsiz Hikaye Kataloğu (0ms Yükleme, Sıfır API Maliyeti)
 * 8 Kategori x 15 Özgün Hikaye = Tam 120 Hikaye
 */
export const CURATED_STORIES_CATALOG: CuratedStory[] = [
  ...KIDS_STORIES,
  ...ADULT_BASIC_STORIES,
  ...ADULT_INTERMEDIATE_STORIES,
  ...ADULT_ADVANCED_STORIES,
  ...PROJECT_CONTROLS_STORIES,
  ...LEGAL_CONTRACTS_STORIES,
  ...MEDICAL_CLINICAL_STORIES,
  ...FINANCE_ACCOUNTING_STORIES,
];

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
      badgeBg: "bg-teal-100 dark:bg-teal-950/60",
      badgeText: "text-teal-800 dark:text-teal-300",
      border: "border-teal-200 dark:border-teal-800",
      gradientFallback: "from-emerald-700 via-teal-800 to-slate-900",
    },
  },
];

/**
 * Kategori ID'sine göre 15 hikayeyi döndürür.
 */
export function getStoriesByCategory(catId: string): CuratedStory[] {
  return CURATED_STORIES_CATALOG.filter((s) => s.category === catId);
}

/**
 * ID'ye göre tek hikaye bulur.
 */
export function getStoryById(id: string): CuratedStory | undefined {
  return CURATED_STORIES_CATALOG.find((s) => s.id === id);
}

/**
 * Başlık, konu ve hedef kelimelerde anlık filtreleme yapar.
 */
export function searchCuratedStories(query: string, categoryFilter?: string): CuratedStory[] {
  const q = query.trim().toLowerCase();
  let list = CURATED_STORIES_CATALOG;
  if (categoryFilter && categoryFilter !== "all") {
    list = list.filter((s) => s.category === categoryFilter);
  }
  if (!q) return list;

  return list.filter((story) => {
    const titleMatch = story.title.toLowerCase().includes(q);
    const topicMatch = story.topic.toLowerCase().includes(q);
    const descMatch = story.desc.toLowerCase().includes(q);
    const wordMatch = story.target_vocabulary?.some(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.turkish_meaning.toLowerCase().includes(q)
    );
    return titleMatch || topicMatch || descMatch || wordMatch;
  });
}
