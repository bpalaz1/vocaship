"use client";

import React from "react";
import {
  Rocket,
  Sparkles,
  Star,
  Search,
  Compass,
  Key,
  Atom,
  Brain,
  Globe2,
  TrendingUp,
  Shield,
  Scale,
  Briefcase,
  HeartPulse,
  Stethoscope,
  Activity,
  Coffee,
  BookOpen,
  MapPin,
  Flame,
} from "lucide-react";

export interface StoryVectorCoverProps {
  category?: string;
  topic?: string;
  title?: string;
  level?: string;
  cefr?: string;
  isUserStory?: boolean;
  isCareerCase?: boolean;
  className?: string;
}

type CoverTheme =
  | "kids"
  | "mystery"
  | "science"
  | "business"
  | "legal"
  | "finance"
  | "medical"
  | "daily_life"
  | "custom";

interface ThemeConfig {
  gradientBg: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  defaultLevelText: string;
  defaultCategoryText: string;
  renderIllustration: () => React.ReactNode;
  renderSvgPattern: () => React.ReactNode;
}

/**
 * Başlık, kategori veya konudan en uygun vektör temasını çözer.
 */
function resolveTheme(props: StoryVectorCoverProps): CoverTheme {
  if (props.isUserStory) return "custom";

  const cat = (props.category || "").toLowerCase();
  const top = (props.topic || "").toLowerCase();
  const tit = (props.title || "").toLowerCase();
  const all = `${cat} ${top} ${tit}`;

  if (cat === "kids" || all.includes("masal") || all.includes("fairy") || all.includes("toby") || all.includes("sparky") || all.includes("luna") || all.includes("yavru") || all.includes("dragon")) {
    return "kids";
  }
  if (cat === "medical_clinical" || all.includes("tıp") || all.includes("klinik") || all.includes("medical") || all.includes("hospital") || all.includes("oet") || all.includes("triage")) {
    return "medical";
  }
  if (cat === "project_controls" || all.includes("proje") || all.includes("evm") || all.includes("schedule") || all.includes("p6") || all.includes("primavera") || all.includes("variance")) {
    return "business";
  }
  if (cat === "legal_contracts" || all.includes("hukuk") || all.includes("fidic") || all.includes("contract") || all.includes("clause") || all.includes("tahkim") || all.includes("arbitration")) {
    return "legal";
  }
  if (cat === "finance_accounting" || all.includes("finans") || all.includes("accounting") || all.includes("ifrs") || all.includes("bilanço") || all.includes("ebitda") || all.includes("capex")) {
    return "finance";
  }
  if (cat === "adult_advanced" || all.includes("felsefe") || all.includes("bilim") || all.includes("science") || all.includes("ai") || all.includes("yapay zeka") || all.includes("quantum") || all.includes("mind") || all.includes("ontoloji")) {
    return "science";
  }
  if (cat === "adult_intermediate" || all.includes("gizem") || all.includes("mystery") || all.includes("antik") || all.includes("fener") || all.includes("lighthouse") || all.includes("clock") || all.includes("alp") || all.includes("saat")) {
    return "mystery";
  }
  if (cat === "adult_basic" || all.includes("günlük") || all.includes("daily") || all.includes("routine") || all.includes("kafe") || all.includes("tren") || all.includes("coffee")) {
    return "daily_life";
  }

  return "daily_life";
}

const THEME_CONFIGS: Record<CoverTheme, ThemeConfig> = {
  // 1. ÇOCUK & MASALLAR (KIDS & TALES)
  kids: {
    gradientBg: "from-amber-600 via-orange-500 to-yellow-500",
    accentColor: "text-amber-200",
    badgeBg: "bg-amber-950/80",
    badgeBorder: "border-amber-400/50",
    badgeText: "text-amber-300",
    defaultLevelText: "🌟 A1 Masal & Macera",
    defaultCategoryText: "Kids & Tales",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="kids-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffb703" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="40%" r="90" fill="url(#kids-glow)" />
        <circle cx="15%" cy="25%" r="3" fill="#fff" opacity="0.8" />
        <circle cx="85%" cy="20%" r="4" fill="#fff" opacity="0.9" />
        <circle cx="75%" cy="70%" r="2" fill="#fff" opacity="0.7" />
        <circle cx="20%" cy="75%" r="3" fill="#fff" opacity="0.6" />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/30 backdrop-blur-md border border-amber-200/40 flex items-center justify-center shadow-lg shadow-orange-500/30 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Rocket className="w-9 h-9 text-white drop-shadow-md" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -left-2">
          <Star className="w-4 h-4 text-amber-200 fill-amber-300" />
        </div>
      </div>
    ),
  },

  // 2. DEDEKTİF & GİZEM (MYSTERY & EXPLORATION)
  mystery: {
    gradientBg: "from-slate-950 via-indigo-950 to-purple-950",
    accentColor: "text-indigo-300",
    badgeBg: "bg-indigo-950/80",
    badgeBorder: "border-indigo-400/40",
    badgeText: "text-indigo-200",
    defaultLevelText: "🟣 B1-B2 Gizem & Keşif",
    defaultCategoryText: "Mystery & Adventure",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50%" cy="45%" r="65" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="50%" cy="45%" r="105" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
        <line x1="50%" y1="10%" x2="50%" y2="80%" stroke="#818cf8" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.3" />
        <line x1="15%" y1="45%" x2="85%" y2="45%" stroke="#818cf8" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.3" />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-900/40 backdrop-blur-md border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-900/50 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
          <Search className="w-8 h-8 text-indigo-200 drop-shadow-md" />
        </div>
        <div className="absolute -top-1.5 -right-2">
          <Compass className="w-5 h-5 text-purple-300" />
        </div>
        <div className="absolute -bottom-1 -left-1.5">
          <Key className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
    ),
  },

  // 3. BİLİM & FELSEFE (SCIENCE & MIND)
  science: {
    gradientBg: "from-slate-950 via-cyan-950 to-emerald-950",
    accentColor: "text-cyan-300",
    badgeBg: "bg-cyan-950/80",
    badgeBorder: "border-cyan-400/40",
    badgeText: "text-cyan-200",
    defaultLevelText: "🔵 C1-C2 Felsefe & Bilim",
    defaultCategoryText: "Science & Philosophy",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50%" cy="45%" rx="75" ry="30" fill="none" stroke="#06b6d4" strokeWidth="1" transform="rotate(-25 150 90)" />
        <ellipse cx="50%" cy="45%" rx="75" ry="30" fill="none" stroke="#10b981" strokeWidth="1" transform="rotate(25 150 90)" />
        <circle cx="50%" cy="45%" r="4" fill="#67e8f9" />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 backdrop-blur-md border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-900/40 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Atom className="w-8 h-8 text-cyan-300 drop-shadow-md" />
        </div>
        <div className="absolute -top-2 -right-1.5">
          <Brain className="w-5 h-5 text-emerald-300" />
        </div>
        <div className="absolute -bottom-1.5 -left-1">
          <Globe2 className="w-4 h-4 text-teal-400" />
        </div>
      </div>
    ),
  },

  // 4. PROJE KONTROL & İŞ DÜNYASI (BUSINESS & EVM)
  business: {
    gradientBg: "from-slate-950 via-slate-900 to-amber-950/70",
    accentColor: "text-amber-300",
    badgeBg: "bg-slate-900/90",
    badgeBorder: "border-amber-500/40",
    badgeText: "text-amber-300",
    defaultLevelText: "💼 C1 Profesyonel & EVM",
    defaultCategoryText: "Project Controls & EPC",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 4" />
        <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 4" />
        <polyline points="20,80 80,60 140,70 200,40 260,30" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-950/50 transform group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300">
          <TrendingUp className="w-8 h-8 text-amber-300 drop-shadow-md" />
        </div>
        <div className="absolute -top-1.5 -right-2">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div className="absolute -bottom-1 -left-1.5">
          <Briefcase className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    ),
  },

  // 5. HUKUK & FIDIC SÖZLEŞMELERİ (LEGAL & CONTRACTS)
  legal: {
    gradientBg: "from-stone-950 via-slate-900 to-amber-950/60",
    accentColor: "text-amber-200",
    badgeBg: "bg-stone-900/90",
    badgeBorder: "border-amber-500/40",
    badgeText: "text-amber-200",
    defaultLevelText: "⚖️ C1 Hukuk & Sözleşme",
    defaultCategoryText: "FIDIC & Legal Claims",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25%" y="20%" width="50%" height="60%" fill="none" stroke="#d97706" strokeWidth="1" rx="4" />
        <line x1="32%" y1="35%" x2="68%" y2="35%" stroke="#d97706" strokeWidth="1" />
        <line x1="32%" y1="50%" x2="68%" y2="50%" stroke="#d97706" strokeWidth="1" />
        <line x1="32%" y1="65%" x2="55%" y2="65%" stroke="#d97706" strokeWidth="1" />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-900/70 backdrop-blur-md border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-950/50 transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
          <Scale className="w-8 h-8 text-amber-300 drop-shadow-md" />
        </div>
        <div className="absolute -top-1.5 -right-2">
          <Shield className="w-5 h-5 text-amber-200" />
        </div>
      </div>
    ),
  },

  // 6. FİNANS & MUHASEBE (FINANCE & ACCOUNTING)
  finance: {
    gradientBg: "from-slate-950 via-teal-950 to-emerald-950/80",
    accentColor: "text-teal-300",
    badgeBg: "bg-teal-950/90",
    badgeBorder: "border-teal-500/40",
    badgeText: "text-teal-200",
    defaultLevelText: "📈 C1 Finans & IFRS",
    defaultCategoryText: "Corporate Finance",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="55" width="16" height="35" fill="#14b8a6" rx="2" />
        <rect x="44" y="40" width="16" height="50" fill="#2dd4bf" rx="2" />
        <rect x="68" y="25" width="16" height="65" fill="#5eead4" rx="2" />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-950/70 backdrop-blur-md border border-teal-500/40 flex items-center justify-center shadow-lg shadow-teal-950/50 transform group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300">
          <TrendingUp className="w-8 h-8 text-teal-300 drop-shadow-md" />
        </div>
        <div className="absolute -top-1.5 -right-2">
          <Activity className="w-5 h-5 text-emerald-300" />
        </div>
      </div>
    ),
  },

  // 7. TIP & KLİNİK VAKA YÖNETİMİ (MEDICAL & OET)
  medical: {
    gradientBg: "from-teal-950 via-slate-900 to-rose-950/70",
    accentColor: "text-rose-300",
    badgeBg: "bg-rose-950/80",
    badgeBorder: "border-rose-400/40",
    badgeText: "text-rose-200",
    defaultLevelText: "🩺 C1 Klinik Vaka (OET)",
    defaultCategoryText: "Clinical Healthcare",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points="10,60 40,60 50,45 60,75 70,55 80,60 110,60 120,40 130,80 140,60 180,60"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="1.5"
        />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-900/40 transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
          <Stethoscope className="w-8 h-8 text-rose-300 drop-shadow-md" />
        </div>
        <div className="absolute -top-2 -right-1.5">
          <HeartPulse className="w-5 h-5 text-rose-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -left-1.5">
          <Activity className="w-4 h-4 text-teal-300" />
        </div>
      </div>
    ),
  },

  // 8. GÜNLÜK YAŞAM & TEMEL (DAILY LIFE & ROUTINES)
  daily_life: {
    gradientBg: "from-sky-950 via-blue-900 to-indigo-950",
    accentColor: "text-sky-300",
    badgeBg: "bg-sky-950/80",
    badgeBorder: "border-sky-400/40",
    badgeText: "text-sky-200",
    defaultLevelText: "🟢 A1-A2 Günlük Yaşam",
    defaultCategoryText: "Everyday Routines",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20%" cy="30%" r="35" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
        <circle cx="80%" cy="70%" r="45" fill="none" stroke="#60a5fa" strokeWidth="0.8" />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-900/40 backdrop-blur-md border border-sky-400/40 flex items-center justify-center shadow-lg shadow-sky-900/40 transform group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300">
          <Coffee className="w-8 h-8 text-sky-200 drop-shadow-md" />
        </div>
        <div className="absolute -top-1.5 -right-1.5">
          <BookOpen className="w-5 h-5 text-blue-300" />
        </div>
        <div className="absolute -bottom-1 -left-1">
          <MapPin className="w-4 h-4 text-indigo-300" />
        </div>
      </div>
    ),
  },

  // 9. KULLANICI ÖZEL & AI ÜRETİMİ (CUSTOM STORIES)
  custom: {
    gradientBg: "from-purple-950 via-indigo-950 to-amber-950/60",
    accentColor: "text-amber-300",
    badgeBg: "bg-purple-950/80",
    badgeBorder: "border-amber-400/50",
    badgeText: "text-amber-300",
    defaultLevelText: "✨ Özel AI Hikayesi",
    defaultCategoryText: "Custom Reading",
    renderSvgPattern: () => (
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50%" cy="40%" r="60" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5 5" />
      </svg>
    ),
    renderIllustration: () => (
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-900/50 backdrop-blur-md border border-amber-400/50 flex items-center justify-center shadow-lg shadow-purple-900/50 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Sparkles className="w-8 h-8 text-amber-300 drop-shadow-md" />
        </div>
        <div className="absolute -top-1.5 -right-1.5">
          <Star className="w-5 h-5 text-yellow-300 fill-yellow-400" />
        </div>
        <div className="absolute -bottom-1 -left-1.5">
          <Flame className="w-4 h-4 text-orange-400" />
        </div>
      </div>
    ),
  },
};

export default function StoryVectorCover(props: StoryVectorCoverProps) {
  const themeKey = resolveTheme(props);
  const theme = THEME_CONFIGS[themeKey];

  // Seviye metni: Props'tan gelen cefr / level varsa kullan, yoksa tema varsayılanı
  const levelLabel = props.cefr
    ? `${props.cefr}`
    : props.level
    ? `${props.level}`
    : theme.defaultLevelText;

  const topicLabel = props.topic || theme.defaultCategoryText;

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br ${theme.gradientBg} flex flex-col items-center justify-center p-3 select-none overflow-hidden ${
        props.className || ""
      }`}
    >
      {/* 1. Arka Plan Vektörel Motif / Izgara */}
      {theme.renderSvgPattern()}

      {/* 2. Ortam Parlaması (Ambient Glow) */}
      <div className="absolute w-28 h-28 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* 3. Ana Vektörel İllüstrasyon / İkon Rozeti */}
      <div className="z-10 mb-2">{theme.renderIllustration()}</div>

      {/* 4. Alt Bilgi Rozeti (Tematik Seviye Rozeti) */}
      <div className="z-10 flex items-center gap-1.5">
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${theme.badgeBg} border ${theme.badgeBorder} ${theme.badgeText} shadow-md backdrop-blur-md flex items-center gap-1`}
        >
          <span>{levelLabel}</span>
        </span>
      </div>

      {/* 5. Zarif Konu İpucu (Subtle Topic Label) */}
      <span className="z-10 text-[10px] text-white/70 font-medium mt-1 truncate max-w-[85%] text-center">
        {topicLabel}
      </span>
    </div>
  );
}

