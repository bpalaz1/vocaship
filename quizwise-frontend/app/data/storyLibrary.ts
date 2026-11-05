import { CuratedStory } from "./stories/types";
import {
  KIDS_STORIES,
  ADULT_BASIC_STORIES,
  ADULT_INTERMEDIATE_STORIES,
  ADULT_ADVANCED_STORIES,
  PROJECT_CONTROLS_STORIES,
  LEGAL_CONTRACTS_STORIES,
  MEDICAL_CLINICAL_STORIES,
  FINANCE_ACCOUNTING_STORIES,
  CURATED_STORIES_CATALOG,
} from "./stories";

export type ReadingShelfMode = "kids" | "academic" | "career";

export interface StoryShelf {
  id: string;
  mode: ReadingShelfMode;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  colorScheme: {
    badgeBg: string;
    badgeText: string;
    border: string;
    glow: string;
    gradient: string;
  };
  stories: CuratedStory[];
}

/**
 * Çocuk Modu için 15 hikayeyi kelime uzunluğu ve A1/A2/B1 dengi zorluğuna göre
 * 3 yıldızlı kademeye ayırır:
 * - 🌟 1 Yıldız: Sevimli Maceralar (80-110 kelime, A1 dengi)
 * - 🌟🌟 2 Yıldız: Cesur Kaşifler (100-130 kelime, A2 dengi)
 * - 🌟🌟🌟 3 Yıldız: Sözcük Sihirbazı (120-150 kelime, B1 dengi)
 */
export const KIDS_SHELVES: StoryShelf[] = [
  {
    id: "kids_star_1",
    mode: "kids",
    title: "1 Yıldız: Sevimli Maceralar",
    subtitle: "80-110 kelimelik neşeli ve akıcı başlangıç hikayeleri (A1 Seviyesi)",
    badge: "⭐ 1 Yıldız",
    icon: "🌟",
    colorScheme: {
      badgeBg: "bg-amber-500/20",
      badgeText: "text-amber-300",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/10",
      gradient: "from-amber-500/20 to-yellow-500/5",
    },
    stories: KIDS_STORIES.slice(0, 5).map((s) => ({
      ...s,
      level: "⭐ 1 Yıldız",
    })),
  },
  {
    id: "kids_star_2",
    mode: "kids",
    title: "2 Yıldız: Cesur Kaşifler",
    subtitle: "100-130 kelimelik merak uyandıran doğa ve macera öyküleri (A2 Seviyesi)",
    badge: "⭐⭐ 2 Yıldız",
    icon: "🌟🌟",
    colorScheme: {
      badgeBg: "bg-emerald-500/20",
      badgeText: "text-emerald-300",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/10",
      gradient: "from-emerald-500/20 to-teal-500/5",
    },
    stories: KIDS_STORIES.slice(5, 10).map((s) => ({
      ...s,
      level: "⭐⭐ 2 Yıldız",
    })),
  },
  {
    id: "kids_star_3",
    mode: "kids",
    title: "3 Yıldız: Sözcük Sihirbazı",
    subtitle: "Zengin betimlemeler ve yeni kelimelerle dolu ustalık hikayeleri (B1 Seviyesi)",
    badge: "⭐⭐⭐ 3 Yıldız",
    icon: "🌟🌟🌟",
    colorScheme: {
      badgeBg: "bg-purple-500/20",
      badgeText: "text-purple-300",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/10",
      gradient: "from-purple-500/20 to-pink-500/5",
    },
    stories: KIDS_STORIES.slice(10, 15).map((s) => ({
      ...s,
      level: "⭐⭐⭐ 3 Yıldız",
    })),
  },
];

/**
 * Genel / Akademik Mod için CEFR seviye şeritleri
 */
export const ACADEMIC_SHELVES: StoryShelf[] = [
  {
    id: "academic_elementary",
    mode: "academic",
    title: "Elementary (A1 - A2): Günlük Yaşam & Rutinler",
    subtitle: "Kafeler, tren yolculukları, şehir hayatı ve pratik diyaloglar",
    badge: "A1 - A2",
    icon: "🟢",
    colorScheme: {
      badgeBg: "bg-emerald-500/20",
      badgeText: "text-emerald-300",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/10",
      gradient: "from-emerald-500/20 to-teal-500/5",
    },
    stories: ADULT_BASIC_STORIES,
  },
  {
    id: "academic_intermediate",
    mode: "academic",
    title: "Intermediate (B1 - B2): Gizem, Macera & Keşif",
    subtitle: "Tarihi antik fenerler, saat kuleleri, seyahat ve sürükleyici kurgular",
    badge: "B1 - B2",
    icon: "🟡",
    colorScheme: {
      badgeBg: "bg-amber-500/20",
      badgeText: "text-amber-300",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/10",
      gradient: "from-amber-500/20 to-orange-500/5",
    },
    stories: ADULT_INTERMEDIATE_STORIES,
  },
  {
    id: "academic_advanced",
    mode: "academic",
    title: "Advanced (C1 - C2): Bilim, Felsefe & Analiz",
    subtitle: "Yapay zekâ ontolojisi, kuantum zihin, felsefi açmazlar ve akademik metinler",
    badge: "C1 - C2",
    icon: "🔴",
    colorScheme: {
      badgeBg: "bg-rose-500/20",
      badgeText: "text-rose-300",
      border: "border-rose-500/30",
      glow: "shadow-rose-500/10",
      gradient: "from-rose-500/20 to-purple-500/5",
    },
    stories: ADULT_ADVANCED_STORIES,
  },
];

/**
 * Mesleki Kulvar için Sektörel Vaka Şeritleri
 */
export const CAREER_SHELVES: StoryShelf[] = [
  {
    id: "career_project_controls",
    mode: "career",
    title: "Proje Kontrol & EVM Vakaları",
    subtitle: "Primavera P6, kritik yol gecikmeleri, SPI/CPI sapmaları ve float kurtarma",
    badge: "C1 Corporate",
    icon: "📊",
    colorScheme: {
      badgeBg: "bg-blue-500/20",
      badgeText: "text-blue-300",
      border: "border-blue-500/30",
      glow: "shadow-blue-500/10",
      gradient: "from-blue-500/20 to-indigo-500/5",
    },
    stories: PROJECT_CONTROLS_STORIES,
  },
  {
    id: "career_legal",
    mode: "career",
    title: "FIDIC & Sözleşme İhtilafları",
    subtitle: "Mücbir sebep, liquidated damages, hak talepleri ve uluslararası tahkim",
    badge: "C1 Legal",
    icon: "⚖️",
    colorScheme: {
      badgeBg: "bg-indigo-500/20",
      badgeText: "text-indigo-300",
      border: "border-indigo-500/30",
      glow: "shadow-indigo-500/10",
      gradient: "from-indigo-500/20 to-violet-500/5",
    },
    stories: LEGAL_CONTRACTS_STORIES,
  },
  {
    id: "career_medical",
    mode: "career",
    title: "Klinik Vaka Hikayeleri",
    subtitle: "Acil triyaj, ayırıcı tanı, farmakoloji ve OET tıp protokolleri",
    badge: "C1 Clinical",
    icon: "🩺",
    colorScheme: {
      badgeBg: "bg-cyan-500/20",
      badgeText: "text-cyan-300",
      border: "border-cyan-500/30",
      glow: "shadow-cyan-500/10",
      gradient: "from-cyan-500/20 to-blue-500/5",
    },
    stories: MEDICAL_CLINICAL_STORIES,
  },
  {
    id: "career_finance",
    mode: "career",
    title: "Finansal Kriz & Denetim Öyküleri",
    subtitle: "IFRS standartları, likidite sıkışması, forensic muhasebe ve EBITDA optimizasyonu",
    badge: "C1 Finance",
    icon: "📈",
    colorScheme: {
      badgeBg: "bg-emerald-500/20",
      badgeText: "text-emerald-300",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/10",
      gradient: "from-emerald-500/20 to-teal-500/5",
    },
    stories: FINANCE_ACCOUNTING_STORIES,
  },
];

/**
 * Kullanıcı profiline göre uygun şerit listesini döner
 */
export function getShelvesForMode(mode: ReadingShelfMode): StoryShelf[] {
  switch (mode) {
    case "kids":
      return KIDS_SHELVES;
    case "career":
      return CAREER_SHELVES;
    case "academic":
    default:
      return ACADEMIC_SHELVES;
  }
}

export { CURATED_STORIES_CATALOG };

