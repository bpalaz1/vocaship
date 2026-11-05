/**
 * Çok Dilli Karakter Veri Modeli ve Mağaza Tanımları
 * TR, EN ve DE dillerine duyarlı yerelleştirme ve Milestone Lock (Seviye/Başarı Kilidi) kuralları.
 */

export interface StoreCharacterLocale {
  name: string;
  title: string;
  bio: string;
  unlockQuote: string;
}

export interface StoreCharacter {
  id: string;
  priceGold: number;
  requiredLevel?: "A1" | "A2" | "B1" | "B2" | "C1";
  requiredStoriesCount?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: string;
  locales: {
    tr: StoreCharacterLocale;
    en: StoreCharacterLocale;
    de: StoreCharacterLocale;
  };
  avatarSvg: string; // Vektörel hafif SVG illüstrasyon
}

export const CEFR_LEVEL_RANK: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

/**
 * Karakterin Milestone (Seviye veya Tamamlanan Hikaye) kilidinin açık olup olmadığını kontrol eder.
 */
export function checkCharacterMilestone(
  char: StoreCharacter,
  userLevel: string = "A1",
  completedStoriesCount: number = 0
): { isUnlocked: boolean; missingReason: string } {
  const userRank = CEFR_LEVEL_RANK[userLevel.toUpperCase()] || 1;
  const reqRank = char.requiredLevel ? CEFR_LEVEL_RANK[char.requiredLevel.toUpperCase()] || 1 : 1;

  const levelMet = userRank >= reqRank;
  const storiesMet = !char.requiredStoriesCount || completedStoriesCount >= char.requiredStoriesCount;

  // İki koşuldan biri sağlanırsa (veya hiç koşul yoksa) kilit açılır
  if (levelMet || storiesMet) {
    return { isUnlocked: true, missingReason: "" };
  }

  const reqLevelStr = char.requiredLevel || "A1";
  const reqStories = char.requiredStoriesCount || 0;

  return {
    isUnlocked: false,
    missingReason: `${reqLevelStr} Seviyesi veya ${reqStories} Hikaye Tamamla (Mevcut: ${completedStoriesCount}/${reqStories})`,
  };
}

/**
 * Aktif dile göre karakterin yerelleştirilmiş metinlerini getirir (Fallback: EN).
 */
export function getCharacterLocale(
  char: StoreCharacter,
  lang: string = "tr"
): StoreCharacterLocale {
  const normalizedLang = (lang || "tr").toLowerCase() as "tr" | "en" | "de";
  return char.locales[normalizedLang] || char.locales.en || char.locales.tr;
}

export const STORE_CHARACTERS: StoreCharacter[] = [
  {
    id: "char_squire",
    priceGold: 100,
    requiredLevel: "A1",
    requiredStoriesCount: 0,
    rarity: "common",
    icon: "⚔️",
    locales: {
      tr: {
        name: "Acemi Şövalye",
        title: "Kraliyet Muhafız Adayı",
        bio: "Kraliyet kütüphanesinde ilk kelimelerini öğrenen cesur ve hevesli bir kılıç ustası.",
        unlockQuote: "Kılıcım kelimelerim kadar keskin olacak! Başlıyoruz!",
      },
      en: {
        name: "Novice Squire",
        title: "Royal Guard Aspirant",
        bio: "An enthusiastic swordsman taking his first steps into the world of words and wisdom.",
        unlockQuote: "My blade shall be as sharp as my vocabulary! Let us begin!",
      },
      de: {
        name: "Knappe",
        title: "Königlicher Wachanwärter",
        bio: "Ein enthusiastischer Schwertkämpfer, der seine ersten Schritte in die Welt der Wörter wagt.",
        unlockQuote: "Meine Klinge wird so scharf sein wie mein Wortschatz! Auf geht's!",
      },
    },
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#1E293B" stroke="#64748B" stroke-width="4"/>
      <path d="M50 20 L65 35 L60 65 L50 78 L40 65 L35 35 Z" fill="#3B82F6" stroke="#93C5FD" stroke-width="3"/>
      <path d="M47 30 L53 30 L51 60 L49 60 Z" fill="#FFFFFF"/>
      <circle cx="50" cy="65" r="4" fill="#FBBF24"/>
    </svg>`,
  },
  {
    id: "char_archer",
    priceGold: 250,
    requiredLevel: "A2",
    requiredStoriesCount: 3,
    rarity: "common",
    icon: "🏹",
    locales: {
      tr: {
        name: "Köy Okçusu",
        title: "Orman Gözcüsü",
        bio: "Hedefini 100 metreden ıskalamayan, doğru kelimeyi tam yerinde kullanan keskin gözlü avcı.",
        unlockQuote: "Hedefim daima mükemmel telaffuz ve tam isabet!",
      },
      en: {
        name: "Village Archer",
        title: "Forest Scout",
        bio: "A sharp-eyed tracker who never misses a target or misplaces an essential word.",
        unlockQuote: "My arrow always finds its mark, just like precise phrasing!",
      },
      de: {
        name: "Dorfschütze",
        title: "Waldläufer",
        bio: "Ein scharfsinniger Fährtenleser, der weder sein Ziel noch das richtige Wort verfehlt.",
        unlockQuote: "Mein Pfeil trifft immer ins Schwarze, genau wie das treffende Wort!",
      },
    },
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#064E3B" stroke="#10B981" stroke-width="4"/>
      <path d="M35 25 C55 25, 70 40, 70 65 C70 75, 60 75, 55 60 C50 50, 40 40, 35 25" stroke="#34D399" stroke-width="4" stroke-linecap="round"/>
      <line x1="28" y1="72" x2="68" y2="32" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
      <polygon points="68,32 60,35 65,40" fill="#F59E0B"/>
    </svg>`,
  },
  {
    id: "char_cadet",
    priceGold: 350,
    requiredLevel: "A2",
    requiredStoriesCount: 5,
    rarity: "rare",
    icon: "🛰️",
    locales: {
      tr: {
        name: "Kozmik Stajyer",
        title: "Yıldız Filosu Kaşifi",
        bio: "Evrenin derinliklerindeki yabancı dilleri ve sinyalleri deşifre eden genç astronom.",
        unlockQuote: "Frekanslar ayarlandı! Evrensel iletişim kanalı açıldı!",
      },
      en: {
        name: "Cosmic Cadet",
        title: "Starfleet Explorer",
        bio: "A young astronomer decoding alien frequencies and interplanetary languages across deep space.",
        unlockQuote: "Frequencies aligned! Universal transmission channel is open!",
      },
      de: {
        name: "Sternen-Kadett",
        title: "Sternenflotten-Forscher",
        bio: "Ein junger Astronom, der fremdartige Frequenzen und interplanetare Sprachen im All entschlüsselt.",
        unlockQuote: "Frequenzen kalibriert! Der interstellare Kommunikationskanal steht!",
      },
    },
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#1E1B4B" stroke="#6366F1" stroke-width="4"/>
      <ellipse cx="50" cy="50" rx="30" ry="12" stroke="#818CF8" stroke-width="3" transform="rotate(-25 50 50)"/>
      <circle cx="50" cy="50" r="16" fill="#4F46E5" stroke="#C7D2FE" stroke-width="2"/>
      <circle cx="45" cy="46" r="4" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: "char_alchemist",
    priceGold: 500,
    requiredLevel: "B1",
    requiredStoriesCount: 8,
    rarity: "rare",
    icon: "🧪",
    locales: {
      tr: {
        name: "Gizemli Simyacı",
        title: "Kelime İksiri Ustası",
        bio: "Nadir kelimeleri ve deyimleri sihirli iksirlere dönüştüren kadim kütüphane bilgesi.",
        unlockQuote: "Doğru kelimeleri birleştirdiğinde zihin saf altına dönüşür!",
      },
      en: {
        name: "Mystic Alchemist",
        title: "Master of Word Elixirs",
        bio: "An ancient library sage transmuting rare idioms and vocabulary into magical memory potions.",
        unlockQuote: "When the right words transmute together, intellect turns to pure gold!",
      },
      de: {
        name: "Mystischer Alchemist",
        title: "Meister der Wort-Elixiere",
        bio: "Ein weiser Gelehrter, der seltene Redewendungen in magische Gedächtnistränke verwandelt.",
        unlockQuote: "Wenn sich die richtigen Worte verbinden, wird Wissen zu reinem Gold!",
      },
    },
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#311042" stroke="#A855F7" stroke-width="4"/>
      <path d="M44 26 L56 26 L56 40 L68 68 C70 74, 66 80, 58 80 L42 80 C34 80, 30 74, 32 68 L44 40 Z" fill="#7E22CE" stroke="#C084FC" stroke-width="3"/>
      <circle cx="50" cy="66" r="6" fill="#F43F5E"/>
      <circle cx="44" cy="58" r="3" fill="#38BDF8"/>
    </svg>`,
  },
  {
    id: "char_paladin",
    priceGold: 700,
    requiredLevel: "B1",
    requiredStoriesCount: 10,
    rarity: "epic",
    icon: "🛡️",
    locales: {
      tr: {
        name: "Gümüş Şövalye",
        title: "Işık Muhafızı",
        bio: "Grameri ve akıcılığı sarsılmaz bir kalkan gibi taşıyan, zorlu münazaraların galibi.",
        unlockQuote: "Bilgi kalkanım, cesaret rehberimdir. Hiçbir sınav beni yıldıramaz!",
      },
      en: {
        name: "Silver Paladin",
        title: "Guardian of Radiance",
        bio: "A disciplined orator carrying grammar and eloquence like an impenetrable silver shield.",
        unlockQuote: "Knowledge is my aegis, truth is my light. No debate shall break my resolve!",
      },
      de: {
        name: "Silberner Paladin",
        title: "Wächter des Lichts",
        bio: "Ein ritterlicher Redner, der Eloquenz und Grammatik wie einen unüberwindbaren Schild trägt.",
        unlockQuote: "Wissen ist mein Schild, Klarheit mein Schwert. Keine Debatte wird mich brechen!",
      },
    },
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#0F172A" stroke="#94A3B8" stroke-width="4"/>
      <path d="M50 18 L76 28 C76 56, 64 74, 50 82 C36 74, 24 56, 24 28 Z" fill="#334155" stroke="#E2E8F0" stroke-width="3"/>
      <line x1="50" y1="28" x2="50" y2="72" stroke="#38BDF8" stroke-width="3"/>
      <line x1="36" y1="44" x2="64" y2="44" stroke="#38BDF8" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "char_cyber_ninja",
    priceGold: 950,
    requiredLevel: "B2",
    requiredStoriesCount: 15,
    rarity: "epic",
    icon: "🥷",
    locales: {
      tr: {
        name: "Siber Gölge",
        title: "Neon Ağ Suikastçısı",
        bio: "Saniyeler içinde yüzlerce kelimeyi tarayıp kriz anında en keskin argümanı fısıldayan gölge.",
        unlockQuote: "Sessizce öğrenir, kusursuzca konuşurum. Gölgeler benden yana!",
      },
      en: {
        name: "Cyber Ninja",
        title: "Neon Net Assassin",
        bio: "A digital stealth master scanning vast databases in milliseconds to deliver lethal precision in speech.",
        unlockQuote: "I learn in silence, I speak with zero latency. The shadows obey my code!",
      },
      de: {
        name: "Cyber-Ninja",
        title: "Neon-Netz-Attentäter",
        bio: "Ein Meister der digitalen Tarnung, der im Sekundentakt treffsichere Argumente liefert.",
        unlockQuote: "Ich lerne in der Stille und spreche ohne Latenz. Der Cyberspace folgt meinem Code!",
      },
    },
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#050505" stroke="#06B6D4" stroke-width="4"/>
      <path d="M28 42 L50 24 L72 42 L68 76 L32 76 Z" fill="#18181B" stroke="#22D3EE" stroke-width="2"/>
      <rect x="36" y="44" width="28" height="6" rx="3" fill="#06B6D4" stroke="#67E8F9" stroke-width="1.5"/>
      <circle cx="50" cy="47" r="2" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: "char_dragon_rider",
    priceGold: 2000,
    requiredLevel: "C1",
    requiredStoriesCount: 20,
    rarity: "legendary",
    icon: "🐉",
    locales: {
      tr: {
        name: "Ejderha Süvarisi",
        title: "C1 Zirve Efsanesi",
        bio: "Göklerin efendisi, ileri düzey İngilizce münazaralarında rakip tanımayan en üstün şampiyon.",
        unlockQuote: "Ejderhanın aleviyle konuşur, kelimelerimle gökleri fethederim! Zirve bizim!",
      },
      en: {
        name: "Dragon Rider",
        title: "C1 Pinnacle Legend",
        bio: "Sovereign of the skies, commanding complex nuances and unmatched executive fluency across any domain.",
        unlockQuote: "I speak with dragonfire and command the skies with words! The summit is ours!",
      },
      de: {
        name: "Drachenreiter",
        title: "C1-Gipfellegende",
        bio: "Herrscher der Lüfte, der selbst komplexeste akademische und berufliche Debatten meisterhaft beherrscht.",
        unlockQuote: "Ich spreche mit dem Feuer des Drachen und erobere den Himmel mit Worten!",
      },
    },
    avatarSvg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#450A0A" stroke="#EF4444" stroke-width="4"/>
      <path d="M50 16 L66 38 L84 46 L68 62 L70 82 L50 72 L30 82 L32 62 L16 46 L34 38 Z" fill="#B91C1C" stroke="#F87171" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="10" fill="#FBBF24" stroke="#FDE68A" stroke-width="2"/>
      <polygon points="50,44 54,54 46,54" fill="#DC2626"/>
    </svg>`,
  },
];

