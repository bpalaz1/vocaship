/**
 * Vocaship Otomatik Tema ve Degrade Belirleyici (Auto-Theme & Gradient Selector)
 * Tamamen yerel, sıfır harici ağ bağımlılığı ve vektörel degrade motoru.
 */

export interface AutoCoverOptions {
  topic?: string;
  title?: string;
  category?: string;
  content?: string;
}

interface TopicTheme {
  keywords: string[];
  gradientFallback: string;
  categoryLabel: string;
}

const TOPIC_THEMES: Record<string, TopicTheme> = {
  nature: {
    keywords: [
      "nature", "forest", "mountain", "tree", "river", "lake", "park", "garden",
      "animal", "dog", "cat", "bird", "flower", "outdoor", "doğa", "orman", "dağ",
      "ağaç", "nehir", "göl", "hayvan", "köpek", "kedi", "çiçek", "bahçe", "luna", "sparky"
    ],
    gradientFallback: "from-amber-600 via-orange-500 to-yellow-500",
    categoryLabel: "Doğa & Macera",
  },
  mystery: {
    keywords: [
      "mystery", "antique", "clock", "watchmaker", "ancient", "manuscript",
      "lighthouse", "storm", "fog", "castle", "secret", "candle", "dungeon",
      "gizem", "antik", "saat", "fener", "fırtına", "el yazması", "şato", "sır", "tarih"
    ],
    gradientFallback: "from-slate-950 via-indigo-950 to-purple-950",
    categoryLabel: "Gizem & Keşif",
  },
  science: {
    keywords: [
      "science", "technology", "space", "astronomy", "planet", "mars", "star",
      "galaxy", "universe", "ai", "artificial intelligence", "robot", "cyber",
      "code", "algorithm", "data", "consciousness", "bilim", "uzay", "yıldız",
      "yapay zeka", "robot", "teknoloji", "kod", "bilinç", "felsefe"
    ],
    gradientFallback: "from-slate-950 via-cyan-950 to-emerald-950",
    categoryLabel: "Bilim & Teknoloji",
  },
  corporate_project: {
    keywords: [
      "project", "schedule", "variance", "critical path", "delay", "epc", "p6",
      "primavera", "evm", "milestone", "contractor", "baseline", "construction",
      "proje", "planlama", "gecikme", "inşaat", "müteahhit", "zaman", "şantiye"
    ],
    gradientFallback: "from-slate-950 via-slate-900 to-amber-950/70",
    categoryLabel: "Proje & Yönetim",
  },
  legal: {
    keywords: [
      "legal", "contract", "fidic", "clause", "claim", "dispute", "arbitration",
      "arbitrator", "hearing", "demurrage", "liability", "lawyer", "hukuk",
      "sözleşme", "tahkim", "dava", "madde", "tazminat", "mahkeme"
    ],
    gradientFallback: "from-stone-950 via-slate-900 to-amber-950/60",
    categoryLabel: "Hukuk & Sözleşme",
  },
  finance: {
    keywords: [
      "finance", "accounting", "cash", "liquidity", "crisis", "balance sheet",
      "audit", "capex", "opex", "ifrs", "ebitda", "revenue", "budget", "finans",
      "muhasebe", "nakit", "bilanço", "denetim", "bütçe", "para", "gelir"
    ],
    gradientFallback: "from-slate-950 via-teal-950 to-emerald-950/80",
    categoryLabel: "Finans & Ekonomi",
  },
  medical: {
    keywords: [
      "medical", "clinic", "hospital", "doctor", "patient", "triage", "cardiac",
      "nurse", "emergency", "symptom", "diagnosis", "therapy", "tıp", "klinik",
      "doktor", "hasta", "acil", "triyaj", "tedavi", "teşhis", "sağlık"
    ],
    gradientFallback: "from-teal-950 via-slate-900 to-rose-950/70",
    categoryLabel: "Tıp & Sağlık",
  },
  daily_life: {
    keywords: [
      "cafe", "coffee", "tea", "train", "commute", "station", "morning", "routine",
      "breakfast", "book", "reading", "travel", "city", "street", "shopping",
      "kafe", "kahve", "çay", "tren", "sabah", "günlük", "şehir", "sokak", "alışveriş"
    ],
    gradientFallback: "from-sky-950 via-blue-900 to-indigo-950",
    categoryLabel: "Günlük Yaşam",
  },
};

/**
 * Verilen metin veya konudan temayı belirler.
 */
function detectTheme(options: AutoCoverOptions): TopicTheme {
  const haystack = [
    options.category || "",
    options.topic || "",
    options.title || "",
    (options.content || "").slice(0, 300),
  ]
    .join(" ")
    .toLowerCase();

  let bestTheme: TopicTheme | null = null;
  let maxScore = 0;

  for (const themeKey of Object.keys(TOPIC_THEMES)) {
    const theme = TOPIC_THEMES[themeKey];
    let score = 0;
    for (const kw of theme.keywords) {
      if (haystack.includes(kw)) {
        score += kw.length > 5 ? 2 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestTheme = theme;
    }
  }

  // Varsayılan tema
  if (!bestTheme || maxScore === 0) {
    return {
      keywords: [],
      gradientFallback: "from-indigo-950 via-purple-950 to-slate-950",
      categoryLabel: "Özel Okuma",
    };
  }

  return bestTheme;
}

/**
 * Harici stok görseli KULLANILMAZ. Yerel vektör/SVG kapak motoru için boş dize döndürür.
 */
export function autoAssignCover(options: AutoCoverOptions | string): string {
  return "";
}

/**
 * CSS degrade sınıfını döndürür.
 */
export function autoAssignGradient(options: AutoCoverOptions | string): string {
  const opts: AutoCoverOptions =
    typeof options === "string" ? { topic: options, title: options } : options;
  const theme = detectTheme(opts);
  return theme.gradientFallback;
}

/**
 * Hikayenin tematik etiketini döndürür.
 */
export function autoAssignCategoryLabel(options: AutoCoverOptions | string): string {
  const opts: AutoCoverOptions =
    typeof options === "string" ? { topic: options, title: options } : options;
  const theme = detectTheme(opts);
  return theme.categoryLabel;
}
