/**
 * Vocaship Otomatik Kapak Görseli ve Tema Belirleyici (Auto-Cover Selector)
 * Telifsiz, yüksek çözünürlüklü Unsplash görselleri ve CSS degrade fallback motoru.
 */

interface AutoCoverOptions {
  topic?: string;
  title?: string;
  category?: string;
  content?: string;
}

interface TopicTheme {
  keywords: string[];
  covers: string[];
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
    covers: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80", // Forest sunlight
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", // Mountain valley
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", // Woodland
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80", // Playful pet
    ],
    gradientFallback: "from-emerald-500 via-teal-600 to-green-700",
    categoryLabel: "Doğa & Macera",
  },
  mystery: {
    keywords: [
      "mystery", "antique", "clock", "watchmaker", "ancient", "manuscript",
      "lighthouse", "storm", "fog", "castle", "secret", "candle", "dungeon",
      "gizem", "antik", "saat", "fener", "fırtına", "el yazması", "şato", "sır", "tarih"
    ],
    covers: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80", // Vintage clockwork
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", // Solitary lighthouse
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80", // Antique library
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80", // Misty castle
    ],
    gradientFallback: "from-purple-800 via-indigo-900 to-slate-900",
    categoryLabel: "Gizem & Keşif",
  },
  science: {
    keywords: [
      "science", "technology", "space", "astronomy", "planet", "mars", "star",
      "galaxy", "universe", "ai", "artificial intelligence", "robot", "cyber",
      "code", "algorithm", "data", "consciousness", "bilim", "uzay", "yıldız",
      "yapay zeka", "robot", "teknoloji", "kod", "bilinç", "felsefe"
    ],
    covers: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Cosmic earth
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // Tech circuitry
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80", // AI robot
      "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80", // Deep space
    ],
    gradientFallback: "from-cyan-600 via-blue-700 to-indigo-900",
    categoryLabel: "Bilim & Teknoloji",
  },
  corporate_project: {
    keywords: [
      "project", "schedule", "variance", "critical path", "delay", "epc", "p6",
      "primavera", "evm", "milestone", "contractor", "baseline", "construction",
      "proje", "planlama", "gecikme", "inşaat", "müteahhit", "zaman", "şantiye"
    ],
    covers: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", // Modern corporate skyscraper
      "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80", // Architecture construction
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80", // Modern office workspace
    ],
    gradientFallback: "from-blue-600 via-cyan-700 to-slate-900",
    categoryLabel: "Proje & Yönetim",
  },
  legal: {
    keywords: [
      "legal", "contract", "fidic", "clause", "claim", "dispute", "arbitration",
      "arbitrator", "hearing", "demurrage", "liability", "lawyer", "hukuk",
      "sözleşme", "tahkim", "dava", "madde", "tazminat", "mahkeme"
    ],
    covers: [
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80", // Legal gavel and books
      "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=800&q=80", // Documents lens
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80", // Legal scale
    ],
    gradientFallback: "from-amber-700 via-stone-800 to-slate-950",
    categoryLabel: "Hukuk & Sözleşme",
  },
  finance: {
    keywords: [
      "finance", "accounting", "cash", "liquidity", "crisis", "balance sheet",
      "audit", "capex", "opex", "ifrs", "ebitda", "revenue", "budget", "finans",
      "muhasebe", "nakit", "bilanço", "denetim", "bütçe", "para", "gelir"
    ],
    covers: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80", // Financial analysis graphs
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80", // Stock trade graph
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", // Analytics data board
    ],
    gradientFallback: "from-teal-600 via-emerald-700 to-slate-900",
    categoryLabel: "Finans & Ekonomi",
  },
  medical: {
    keywords: [
      "medical", "clinic", "hospital", "doctor", "patient", "triage", "cardiac",
      "nurse", "emergency", "symptom", "diagnosis", "therapy", "tıp", "klinik",
      "doktor", "hasta", "acil", "triyaj", "tedavi", "teşhis", "sağlık"
    ],
    covers: [
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80", // Stethoscope and charts
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80", // Clinical laboratory
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80", // Hospital healthcare
    ],
    gradientFallback: "from-rose-500 via-red-600 to-pink-800",
    categoryLabel: "Tıp & Sağlık",
  },
  daily_life: {
    keywords: [
      "cafe", "coffee", "tea", "train", "commute", "station", "morning", "routine",
      "breakfast", "book", "reading", "travel", "city", "street", "shopping",
      "kafe", "kahve", "çay", "tren", "sabah", "günlük", "şehir", "sokak", "alışveriş"
    ],
    covers: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80", // Cozy coffee shop
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80", // Scenic train journey
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80", // Street walk
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80", // Coffee and books
    ],
    gradientFallback: "from-sky-500 via-blue-600 to-indigo-700",
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

  // Anahtar kelime eşleşme sayısı
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

  // Varsayılan tema (Genel Edebiyat & Kitap)
  if (!bestTheme || maxScore === 0) {
    return {
      keywords: [],
      covers: [
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80", // Open book
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80", // Library books
        "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80", // Book aesthetic
      ],
      gradientFallback: "from-indigo-600 via-purple-700 to-slate-900",
      categoryLabel: "Özel Okuma",
    };
  }

  return bestTheme;
}

/**
 * Konu veya başlığa göre en uygun telifsiz kapak görselini döndürür.
 */
export function autoAssignCover(options: AutoCoverOptions | string): string {
  const opts: AutoCoverOptions =
    typeof options === "string" ? { topic: options, title: options } : options;
  const theme = detectTheme(opts);

  // Başlığın karakter toplamına göre tutarlı bir kapak seçimi
  const seedString = (opts.title || opts.topic || "vocaship").toLowerCase();
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash + seedString.charCodeAt(i)) % theme.covers.length;
  }

  return theme.covers[hash] || theme.covers[0];
}

/**
 * Görsel yüklenemediğinde veya offline iken kullanılacak CSS degrade sınıfını döndürür.
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
