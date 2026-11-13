/**
 * 50 Parçalık Zengin Koleksiyon Veri Havuzu (30 Maskot Avatarı + 20 Efsanevi Ekipman)
 * 4 Kademeli Baraj Eşiği (20 / 100 / 300 / 500 Kelime)
 * Çifte Kilit Doğrulaması & Sihirli Toz (Dust Crafting) Altyapısı
 */

export type ItemType = "avatar" | "equipment";
export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export interface ChestItem {
  id: string;
  name: {
    tr: string;
    en: string;
    de: string;
  };
  type: ItemType;
  rarity: ItemRarity;
  chestTier: 1 | 2 | 3 | 4;
  icon: string;
  image: string; // Vektörel SVG veya /avatars/... görseli
  description: {
    tr: string;
    en: string;
  };
  bonusEffect?: {
    tr: string;
    en: string;
  };
}

export interface ChestDefinition {
  id: string;
  tier: 1 | 2 | 3 | 4;
  name: {
    tr: string;
    en: string;
  };
  icon: string;
  requiredWords: number; // 20, 100, 300, 500
  costGold: number; // 100, 250, 500, 1000
  themeColor: string;
  accentGradient: string;
  badge: string;
  description: string;
  itemIds: string[];
}

// =============================================================================
// SİHİRLİ TOZ (DUST) DÖNÜŞÜM & SENTEZ DEĞERLERİ
// =============================================================================
export const DUST_REWARDS: Record<ItemRarity, number> = {
  common: 15,
  rare: 30,
  epic: 60,
  legendary: 150,
};

export const DUST_CRAFT_COST = 100; // 100 Toz ile istenen eksik kart sentezlenir

// =============================================================================
// 4 KADEMELİ TEMATİK SANDIK TANIMLARI
// =============================================================================
export const CHESTS: ChestDefinition[] = [
  {
    id: "chest_tier_1",
    tier: 1,
    name: {
      tr: "🌳 Doğa & Keşif Sandığı",
      en: "🌳 Nature & Discovery Chest",
    },
    icon: "🌳",
    requiredWords: 20,
    costGold: 100,
    themeColor: "emerald",
    accentGradient: "from-emerald-600 via-teal-600 to-green-700",
    badge: "20 Kelime Barajı",
    description: "Ormanın neşeli sakinleri ve temel keşif ekipmanları.",
    itemIds: [
      "fox_sparky",
      "chicken_chuck",
      "river_beaver",
      "forest_frog",
      "night_owl",
      "baby_panda",
      "apprentice_cat",
      "cheerful_squirrel",
      "wise_turtle",
      "mountain_goat",
      "wooden_dict_pen",
      "bronze_dagger",
      "apprentice_notebook",
      "nature_compass",
      "leaf_amulet",
    ],
  },
  {
    id: "chest_tier_2",
    tier: 2,
    name: {
      tr: "⚔️ Kahramanlar & Macera Sandığı",
      en: "⚔️ Heroes & Adventure Chest",
    },
    icon: "⚔️",
    requiredWords: 100,
    costGold: 250,
    themeColor: "amber",
    accentGradient: "from-amber-500 via-orange-600 to-yellow-600",
    badge: "100 Kelime Barajı",
    description: "Cesur şövalyeler, efsunlu silahlar ve kadim parşömenler.",
    itemIds: [
      "knight_leo",
      "village_archer",
      "desert_nomad_alex",
      "stone_golem",
      "shadow_thief",
      "sailor_captain",
      "night_mage",
      "winged_pegasus",
      "armored_bear",
      "cave_troll",
      "silver_quill",
      "knight_steel_shield",
      "flaming_dict_sword",
      "wind_boots",
      "ancient_scroll",
    ],
  },
  {
    id: "chest_tier_3",
    tier: 3,
    name: {
      tr: "🚀 Kozmik & Gelecek Sandığı",
      en: "🚀 Cosmic & Future Chest",
    },
    icon: "🚀",
    requiredWords: 300,
    costGold: 500,
    themeColor: "indigo",
    accentGradient: "from-indigo-600 via-purple-600 to-violet-800",
    badge: "300 Kelime Barajı",
    description: "Siborglar, nebula muhafızları ve kuantum aygıtları.",
    itemIds: [
      "cyber_cat",
      "cyborg_robot",
      "nebula_guardian_evelyn",
      "galaxy_pilot",
      "plasma_alien",
      "hologram_sage",
      "quantum_agent_sarah",
      "star_angel",
      "laser_pen",
      "gravity_belt",
      "quantum_visor",
      "cosmic_compass",
    ],
  },
  {
    id: "chest_tier_4",
    tier: 4,
    name: {
      tr: "👑 Efsaneler & Kadim Sandık",
      en: "👑 Legends & Ancient Chest",
    },
    icon: "👑",
    requiredWords: 500,
    costGold: 1000,
    themeColor: "rose",
    accentGradient: "from-rose-600 via-red-700 to-amber-700",
    badge: "500-1000 Kelime Barajı",
    description: "Antik lav ejderhaları, anka kuşları ve evrensel altın kalem.",
    itemIds: [
      "ancient_lava_dragon_ignis",
      "golden_phoenix",
      "judge_harrison",
      "cosmic_dragon_bahamut",
      "infinity_lord",
      "cosmic_gold_pen",
      "ancient_wisdom_shield",
      "volcanic_dragon_staff",
    ],
  },
];

// =============================================================================
// 50 PARÇALIK TAM KOLEKSİYON HAVUZU (30 MASKOT + 20 EKİPMAN)
// =============================================================================
export const CHEST_ITEMS: ChestItem[] = [
  // ---------------------------------------------------------------------------
  // TIER 1: DOĞA & KEŞİF SANDIĞI (15 Parça: 10 Maskot + 5 Ekipman)
  // ---------------------------------------------------------------------------
  {
    id: "fox_sparky",
    name: { tr: "Tilki Sparky", en: "Sparky the Fox", de: "Fuchs Sparky" },
    type: "avatar",
    rarity: "common",
    chestTier: 1,
    icon: "🦊",
    image: "svg",
    description: {
      tr: "Neşeli, meraklı ve gözlüklü akıllı tilki.",
      en: "Cheerful, curious smart fox with glasses.",
    },
    bonusEffect: { tr: "+%5 Günlük Seri Bonusu", en: "+5% Daily Streak Bonus" },
  },
  {
    id: "chicken_chuck",
    name: { tr: "Tavuk Chuck", en: "Chuck the Chicken", de: "Huhn Chuck" },
    type: "avatar",
    rarity: "common",
    chestTier: 1,
    icon: "🐔",
    image: "svg",
    description: {
      tr: "Enerjik, eğlenceli ve komik çiftlik kaşifi.",
      en: "Energetic and funny farm explorer.",
    },
    bonusEffect: { tr: "+5 Altın / Oyun Başına", en: "+5 Gold per Game" },
  },
  {
    id: "river_beaver",
    name: { tr: "Nehir Kunduzu", en: "River Beaver", de: "Flussbiber" },
    type: "avatar",
    rarity: "common",
    chestTier: 1,
    icon: "🦫",
    image: "svg",
    description: {
      tr: "Azimli kelime barajı ustası.",
      en: "Persistent builder of word dams.",
    },
  },
  {
    id: "forest_frog",
    name: { tr: "Orman Kurbağası", en: "Forest Frog", de: "Wald Frosch" },
    type: "avatar",
    rarity: "common",
    chestTier: 1,
    icon: "🐸",
    image: "svg",
    description: {
      tr: "Kelimeler arasında hızla zıplayan çevik dost.",
      en: "Agile friend jumping between words.",
    },
  },
  {
    id: "night_owl",
    name: { tr: "Gece Baykuşu", en: "Night Owl", de: "Nachteule" },
    type: "avatar",
    rarity: "rare",
    chestTier: 1,
    icon: "🦉",
    image: "svg",
    description: {
      tr: "Gece çalışma seanslarının bilge gözlemcisi.",
      en: "Wise observer of late study sessions.",
    },
    bonusEffect: { tr: "+%10 Gece XP Bonusu", en: "+10% Night XP Bonus" },
  },
  {
    id: "baby_panda",
    name: { tr: "Yavru Panda", en: "Baby Panda", de: "Baby Panda" },
    type: "avatar",
    rarity: "rare",
    chestTier: 1,
    icon: "🐼",
    image: "svg",
    description: {
      tr: "Bambu ormanlarının sevimli öğrencisi.",
      en: "Adorable student of the bamboo groves.",
    },
  },
  {
    id: "apprentice_cat",
    name: { tr: "Çırak Kedi", en: "Apprentice Cat", de: "Lehrlingskatze" },
    type: "avatar",
    rarity: "common",
    chestTier: 1,
    icon: "🐱",
    image: "svg",
    description: {
      tr: "Patisini sözlük sayfalarından ayırmayan sevimli çırak.",
      en: "Cute apprentice with paws on dictionary pages.",
    },
  },
  {
    id: "cheerful_squirrel",
    name: { tr: "Neşeli Sincap", en: "Cheerful Squirrel", de: "Fröhliches Hörnchen" },
    type: "avatar",
    rarity: "common",
    chestTier: 1,
    icon: "🐿️",
    image: "svg",
    description: {
      tr: "Kelimeleri meşe palamudu gibi toplayan çalışkan dost.",
      en: "Collects vocabulary like acorns.",
    },
  },
  {
    id: "wise_turtle",
    name: { tr: "Bilge Kaplumbağa", en: "Wise Turtle", de: "Weise Schildkröte" },
    type: "avatar",
    rarity: "rare",
    chestTier: 1,
    icon: "🐢",
    image: "svg",
    description: {
      tr: "Ağır adımlarla sağlam öğrenen kadim doğa filozofu.",
      en: "Steady and deep learner of nature.",
    },
  },
  {
    id: "mountain_goat",
    name: { tr: "Dağ Keçisi", en: "Mountain Goat", de: "Bergziege" },
    type: "avatar",
    rarity: "common",
    chestTier: 1,
    icon: "🐐",
    image: "svg",
    description: {
      tr: "Zorlu kelime zirvelerine korkusuzca tırmanan kaşif.",
      en: "Fearlessly climbs difficult vocabulary peaks.",
    },
  },
  // Ekipmanlar (Tier 1)
  {
    id: "wooden_dict_pen",
    name: { tr: "Tahta Sözlük Kalemi", en: "Wooden Dictionary Pen", de: "Holz-Wörterbuchstift" },
    type: "equipment",
    rarity: "common",
    chestTier: 1,
    icon: "✏️",
    image: "pen_wooden",
    description: {
      tr: "Yeni başlayan dil kaşiflerinin ilk not aracı.",
      en: "First note tool of beginning explorers.",
    },
    bonusEffect: { tr: "+5 XP / Kart Tekrarı", en: "+5 XP per Card Review" },
  },
  {
    id: "bronze_dagger",
    name: { tr: "Bronz Hançer", en: "Bronze Dagger", de: "Bronzedolch" },
    type: "equipment",
    rarity: "common",
    chestTier: 1,
    icon: "🗡️",
    image: "dagger_bronze",
    description: {
      tr: "Arcade arenasında ilk darbeleri vurmak için dövüldü.",
      en: "Forged to strike the first hits in the arena.",
    },
  },
  {
    id: "apprentice_notebook",
    name: { tr: "Çırak Not Defteri", en: "Apprentice Notebook", de: "Lehrlingsnotizbuch" },
    type: "equipment",
    rarity: "common",
    chestTier: 1,
    icon: "📓",
    image: "notebook_apprentice",
    description: {
      tr: "Yeni öğrenilen ilk 20 kelimenin özenle kaydedildiği defter.",
      en: "Where the first 20 words are neatly recorded.",
    },
  },
  {
    id: "nature_compass",
    name: { tr: "Doğa Pusulası", en: "Nature Compass", de: "Naturkompass" },
    type: "equipment",
    rarity: "rare",
    chestTier: 1,
    icon: "🧭",
    image: "compass_nature",
    description: {
      tr: "Doğru anlamı her zaman kuzey gibi gösteren sihirli alet.",
      en: "Points straight to the correct definition.",
    },
  },
  {
    id: "leaf_amulet",
    name: { tr: "Yaprak Tılsımı", en: "Leaf Amulet", de: "Blatt-Amulett" },
    type: "equipment",
    rarity: "rare",
    chestTier: 1,
    icon: "🍃",
    image: "amulet_leaf",
    description: {
      tr: "Hatalı bir yanıtta seriyi bir kerelik koruyan doğa gücü.",
      en: "Protects your streak once on a mistake.",
    },
    bonusEffect: { tr: "Seri Kalkanı (Günde 1 kez)", en: "Streak Shield (1x daily)" },
  },

  // ---------------------------------------------------------------------------
  // TIER 2: KAHRAMANLAR & MACERA SANDIĞI (15 Parça: 10 Maskot + 5 Ekipman)
  // ---------------------------------------------------------------------------
  {
    id: "knight_leo",
    name: { tr: "Kale Şövalyesi Leo", en: "Leo the Castle Knight", de: "Ritter Leo" },
    type: "avatar",
    rarity: "rare",
    chestTier: 2,
    icon: "🦁",
    image: "svg",
    description: {
      tr: "Cesur aslan yürekli kale muhafızı.",
      en: "Brave lion-hearted castle defender.",
    },
    bonusEffect: { tr: "+%10 Boss Darbe Hasarı", en: "+10% Boss Strike Damage" },
  },
  {
    id: "village_archer",
    name: { tr: "Köy Okçusu", en: "Village Archer", de: "Dorfbogenschütze" },
    type: "avatar",
    rarity: "common",
    chestTier: 2,
    icon: "🏹",
    image: "svg",
    description: {
      tr: "Hedefi 12'den vuran keskin gözlü nişancı.",
      en: "Sharp-eyed marksman who hits the bullseye.",
    },
  },
  {
    id: "desert_nomad_alex",
    name: { tr: "Çöl Göçebesi Alex", en: "Alex the Desert Nomad", de: "Nomade Alex" },
    type: "avatar",
    rarity: "rare",
    chestTier: 2,
    icon: "🐪",
    image: "svg",
    description: {
      tr: "Kum fırtınalarına göğüs geren dayanıklı vaha yolcusu.",
      en: "Enduring oasis traveler facing sandstorms.",
    },
  },
  {
    id: "stone_golem",
    name: { tr: "Taş Golem", en: "Stone Golem", de: "Steingolem" },
    type: "avatar",
    rarity: "epic",
    chestTier: 2,
    icon: "🗿",
    image: "svg",
    description: {
      tr: "Kadim dağ taşlarından canlanmış sarsılmaz dev.",
      en: "Unshakeable giant formed from mountain stone.",
    },
  },
  {
    id: "shadow_thief",
    name: { tr: "Gölge Hırsızı", en: "Shadow Thief", de: "Schattendieb" },
    type: "avatar",
    rarity: "rare",
    chestTier: 2,
    icon: "🥷",
    image: "svg",
    description: {
      tr: "Karanlıkta fısıldanan kelimeleri sinsice yakalayan avcı.",
      en: "Swiftly captures words whispered in shadows.",
    },
  },
  {
    id: "sailor_captain",
    name: { tr: "Denizci Kaptan", en: "Sailor Captain", de: "Seemanns-Kapitän" },
    type: "avatar",
    rarity: "rare",
    chestTier: 2,
    icon: "⚓",
    image: "svg",
    description: {
      tr: "Fırtınalı denizlerde sözlük rotası çizen usta kaptan.",
      en: "Master captain charting word courses on stormy seas.",
    },
  },
  {
    id: "night_mage",
    name: { tr: "Gece Büyücüsü", en: "Night Mage", de: "Nachtmagier" },
    type: "avatar",
    rarity: "epic",
    chestTier: 2,
    icon: "🧙‍♂️",
    image: "svg",
    description: {
      tr: "Yıldız tozuyla antik parşömenleri aydınlatan büyücü.",
      en: "Illuminates ancient scrolls with stardust.",
    },
  },
  {
    id: "winged_pegasus",
    name: { tr: "Kanatlı Pegasus", en: "Winged Pegasus", de: "Geflügelter Pegasus" },
    type: "avatar",
    rarity: "epic",
    chestTier: 2,
    icon: "🦄",
    image: "svg",
    description: {
      tr: "Bulutların üzerinde kelime avlayan efsanevi kanatlı at.",
      en: "Legendary winged steed soaring above clouds.",
    },
  },
  {
    id: "armored_bear",
    name: { tr: "Zırhlı Ayı", en: "Armored Bear", de: "Gepanzerter Bär" },
    type: "avatar",
    rarity: "rare",
    chestTier: 2,
    icon: "🐻",
    image: "svg",
    description: {
      tr: "Kutup zırhıyla kuşanmış heybetli savaşçı.",
      en: "Mighty warrior clad in arctic armor.",
    },
  },
  {
    id: "cave_troll",
    name: { tr: "Mağara Trollü", en: "Cave Troll", de: "Höhlentroll" },
    type: "avatar",
    rarity: "common",
    chestTier: 2,
    icon: "🧌",
    image: "svg",
    description: {
      tr: "Karanlık mağaraları koruyan kaba ama sadık koruyucu.",
      en: "Gruff yet loyal guardian of deep caverns.",
    },
  },
  // Ekipmanlar (Tier 2)
  {
    id: "silver_quill",
    name: { tr: "Gümüş Tüy Kalem", en: "Silver Quill", de: "Silberne Schreibfeder" },
    type: "equipment",
    rarity: "rare",
    chestTier: 2,
    icon: "🪶",
    image: "quill_silver",
    description: {
      tr: "Akıcı kelime yazımı sağlayan ince işlenmiş gümüş tüy.",
      en: "Finely crafted silver quill for fluent writing.",
    },
    bonusEffect: { tr: "+%10 Hızlı Kombo Puanı", en: "+10% Speed Recall Points" },
  },
  {
    id: "knight_steel_shield",
    name: { tr: "Şövalye Çelik Kalkanı", en: "Knight's Steel Shield", de: "Stahlschild des Ritters" },
    type: "equipment",
    rarity: "rare",
    chestTier: 2,
    icon: "🛡️",
    image: "shield_knight",
    description: {
      tr: "Boss saldırılarına karşı darbe sönümleyici çelik zırh.",
      en: "Deflects boss counter-attacks in battle.",
    },
  },
  {
    id: "flaming_dict_sword",
    name: { tr: "Alevli Sözlük Kılıcı", en: "Flaming Dictionary Sword", de: "Flammendes Schwert" },
    type: "equipment",
    rarity: "epic",
    chestTier: 2,
    icon: "⚔️",
    image: "sword_flame",
    description: {
      tr: "Doğru cevaplarda kritik hasar çarpanını tetikleyen alevli kılıç.",
      en: "Triggers critical damage multipliers on correct hits.",
    },
    bonusEffect: { tr: "+50 Kritik Darbe Gücü", en: "+50 Critical Strike Power" },
  },
  {
    id: "wind_boots",
    name: { tr: "Rüzgar Çizmeleri", en: "Boots of Wind", de: "Stiefel des Windes" },
    type: "equipment",
    rarity: "rare",
    chestTier: 2,
    icon: "👢",
    image: "boots_wind",
    description: {
      tr: "Zamana karşı yarış oyunlarında ekstra süre tanır.",
      en: "Grants bonus seconds in time-attack modes.",
    },
  },
  {
    id: "ancient_scroll",
    name: { tr: "Kadim Parşömen", en: "Ancient Scroll", de: "Uralte Schriftrolle" },
    type: "equipment",
    rarity: "epic",
    chestTier: 2,
    icon: "📜",
    image: "scroll_ancient",
    description: {
      tr: "100 kelimeyi tamamlayan maceracıların onur nişanı.",
      en: "Mark of honor for completing 100 words.",
    },
  },

  // ---------------------------------------------------------------------------
  // TIER 3: KOZMİK & GELECEK SANDIĞI (12 Parça: 8 Maskot + 4 Ekipman)
  // ---------------------------------------------------------------------------
  {
    id: "cyber_cat",
    name: { tr: "Siber Kedi", en: "Cyber Cat", de: "Cyber-Katze" },
    type: "avatar",
    rarity: "rare",
    chestTier: 3,
    icon: "🦾",
    image: "svg",
    description: {
      tr: "Sibernetik reflekslerle saniyede binlerce harf tarayan kedi.",
      en: "Scans thousands of letters per second with cybernetics.",
    },
  },
  {
    id: "cyborg_robot",
    name: { tr: "Siborg Robot", en: "Cyborg Unit", de: "Cyborg-Einheit" },
    type: "avatar",
    rarity: "rare",
    chestTier: 3,
    icon: "🤖",
    image: "svg",
    description: {
      tr: "Hatasız kelime analizi için programlanmış yapay zeka birimi.",
      en: "AI unit programmed for error-free word analysis.",
    },
  },
  {
    id: "nebula_guardian_evelyn",
    name: { tr: "Nebula Muhafızı Dr. Evelyn", en: "Nebula Guardian Evelyn", de: "Nebula-Wächterin" },
    type: "avatar",
    rarity: "epic",
    chestTier: 3,
    icon: "👩‍🚀",
    image: "svg",
    description: {
      tr: "Yıldızlararası diller araştırma enstitüsü lideri.",
      en: "Leader of interstellar linguistics research.",
    },
  },
  {
    id: "galaxy_pilot",
    name: { tr: "Galaksi Pilotu", en: "Galaxy Pilot", de: "Galaxie-Pilot" },
    type: "avatar",
    rarity: "epic",
    chestTier: 3,
    icon: "🛸",
    image: "svg",
    description: {
      tr: "Yerçekimi savunmasında düşen meteorları avlayan usta pilot.",
      en: "Ace pilot shooting down meteors in Gravity defense.",
    },
  },
  {
    id: "plasma_alien",
    name: { tr: "Plazma Uzaylısı", en: "Plasma Alien", de: "Plasma-Alien" },
    type: "avatar",
    rarity: "rare",
    chestTier: 3,
    icon: "👽",
    image: "svg",
    description: {
      tr: "Telepatik dille anında iletişim kuran enerji varlığı.",
      en: "Energy being communicating through telepathic language.",
    },
  },
  {
    id: "hologram_sage",
    name: { tr: "Hologram Bilge", en: "Hologram Sage", de: "Hologramm-Weiser" },
    type: "avatar",
    rarity: "epic",
    chestTier: 3,
    icon: "💠",
    image: "svg",
    description: {
      tr: "Dijital kütüphanelerin sonsuz hafızası.",
      en: "The boundless memory of digital archives.",
    },
  },
  {
    id: "quantum_agent_sarah",
    name: { tr: "Kuantum Ajanı Sarah", en: "Quantum Agent Sarah", de: "Quanten-Agentin Sarah" },
    type: "avatar",
    rarity: "legendary",
    chestTier: 3,
    icon: "⚡",
    image: "svg",
    description: {
      tr: "Kuantum boyutlarında aynı anda birden fazla kelimeyi çözen ajan.",
      en: "Decodes multiple words simultaneously across dimensions.",
    },
    bonusEffect: { tr: "+%20 Genel XP Çarpanı", en: "+20% Overall XP Multiplier" },
  },
  {
    id: "star_angel",
    name: { tr: "Yıldız Meleği", en: "Star Angel", de: "Sternenengel" },
    type: "avatar",
    rarity: "epic",
    chestTier: 3,
    icon: "✨",
    image: "svg",
    description: {
      tr: "Galaktik fırtınalarda öğrenenleri koruyan ışık rehberi.",
      en: "Guiding light protecting learners in cosmic storms.",
    },
  },
  // Ekipmanlar (Tier 3)
  {
    id: "laser_pen",
    name: { tr: "Lazer Kalem", en: "Laser Pen", de: "Laser-Stift" },
    type: "equipment",
    rarity: "rare",
    chestTier: 3,
    icon: "🖊️",
    image: "pen_laser",
    description: {
      tr: "Kelimeleri dijital parşömenlere saniyede işleyen lazer ışın.",
      en: "Engraves words on digital scrolls at light speed.",
    },
  },
  {
    id: "gravity_belt",
    name: { tr: "Yerçekimi Kemeri", en: "Anti-Gravity Belt", de: "Anti-Schwerkraft-Gürtel" },
    type: "equipment",
    rarity: "epic",
    chestTier: 3,
    icon: "🧲",
    image: "belt_gravity",
    description: {
      tr: "Yerçekimi oyununda meteorların düşüş hızını yavaşlatır.",
      en: "Slows down falling meteors in Gravity mode.",
    },
    bonusEffect: { tr: "Düşen Taş Hızı -%15", en: "Falling Asteroid Speed -15%" },
  },
  {
    id: "quantum_visor",
    name: { tr: "Kuantum Vizörü", en: "Quantum Visor", de: "Quanten-Visier" },
    type: "equipment",
    rarity: "epic",
    chestTier: 3,
    icon: "🥽",
    image: "visor_quantum",
    description: {
      tr: "Yanlış şıkları anında eleyen kuantum tarama gözlüğü.",
      en: "Scans and eliminates false options in questions.",
    },
  },
  {
    id: "cosmic_compass",
    name: { tr: "Kozmik Pusula", en: "Cosmic Compass", de: "Kosmischer Kompass" },
    type: "equipment",
    rarity: "legendary",
    chestTier: 3,
    icon: "🧭",
    image: "compass_cosmic",
    description: {
      tr: "300 kelimeyi aşan zihinlerin galaktik koordinat rehberi.",
      en: "Galactic coordinate guide for 300+ word masters.",
    },
  },

  // ---------------------------------------------------------------------------
  // TIER 4: EFSANELER & KADİM SANDIK (8 Parça: 5 Efsanevi Maskot + 3 Ekipman)
  // ---------------------------------------------------------------------------
  {
    id: "ancient_lava_dragon_ignis",
    name: { tr: "Antik Lav Ejderhası Ignis", en: "Ancient Lava Dragon Ignis", de: "Uralter Lavadrache Ignis" },
    type: "avatar",
    rarity: "legendary",
    chestTier: 4,
    icon: "🐉",
    image: "svg",
    description: {
      tr: "Volkanın bağrından doğan efsanevi alevlerin kadim efendisi.",
      en: "Ancient lord of flames born from the volcanic core.",
    },
    bonusEffect: { tr: "+50 Altın / Her Zaferde & Boss Hasarı x2", en: "+50 Gold per Win & 2x Boss Dmg" },
  },
  {
    id: "golden_phoenix",
    name: { tr: "Altın Anka Kuşu", en: "Golden Phoenix", de: "Goldener Phönix" },
    type: "avatar",
    rarity: "legendary",
    chestTier: 4,
    icon: "🔥",
    image: "svg",
    description: {
      tr: "Küllerinden yeniden doğarak seriyi asla kaybettirmeyen ilahi kuş.",
      en: "Divine bird that preserves your streak forever.",
    },
    bonusEffect: { tr: "Sonsuz Seri Koruma", en: "Permanent Streak Shield" },
  },
  {
    id: "judge_harrison",
    name: { tr: "Baş Yargıç Harrison", en: "Chief Justice Harrison", de: "Oberrichter Harrison" },
    type: "avatar",
    rarity: "legendary",
    chestTier: 4,
    icon: "⚖️",
    image: "svg",
    description: {
      tr: "Uluslararası sözleşmeler ve C2 hukuki dilinin en yüksek mertebesi.",
      en: "Highest authority of international contracts and legal C2.",
    },
    bonusEffect: { tr: "+%25 C1-C2 Terim Puanı", en: "+25% C1-C2 Term Points" },
  },
  {
    id: "cosmic_dragon_bahamut",
    name: { tr: "Kozmik Ejderha Bahamut", en: "Cosmic Dragon Bahamut", de: "Kosmischer Drache Bahamut" },
    type: "avatar",
    rarity: "legendary",
    chestTier: 4,
    icon: "🌌",
    image: "svg",
    description: {
      tr: "Yıldız sistemlerini yutan sonsuz bilgelik ejderhası.",
      en: "Infinite wisdom dragon consuming star systems.",
    },
  },
  {
    id: "infinity_lord",
    name: { tr: "Sonsuzluk Lordu", en: "Infinity Lord", de: "Unendlichkeits-Lord" },
    type: "avatar",
    rarity: "legendary",
    chestTier: 4,
    icon: "👑",
    image: "svg",
    description: {
      tr: "1000 kelimelik maratonu fetheden yüce şampiyon tacı.",
      en: "The crown of the champion conquering 1000 words.",
    },
    bonusEffect: { tr: "Kalıcı %30 XP & Altın Çarpanı", en: "Permanent 30% XP & Gold" },
  },
  // Efsanevi Ekipmanlar (Tier 4)
  {
    id: "cosmic_gold_pen",
    name: { tr: "Kozmik Altın Kalem (Grandmaster)", en: "Cosmic Gold Pen", de: "Kosmischer Goldstift" },
    type: "equipment",
    rarity: "legendary",
    chestTier: 4,
    icon: "🖋️",
    image: "pen_cosmic_gold",
    description: {
      tr: "Kelimeleri altın tozuyla yazan usta yazar kalemi.",
      en: "Writes words with gold stardust.",
    },
    bonusEffect: { tr: "Her Doğru Kelimede +2 Altın", en: "+2 Gold on Every Correct Word" },
  },
  {
    id: "ancient_wisdom_shield",
    name: { tr: "Kadim Bilgelik Kalkanı", en: "Shield of Ancient Wisdom", de: "Schild der uralten Weisheit" },
    type: "equipment",
    rarity: "legendary",
    chestTier: 4,
    icon: "🛡️",
    image: "shield_ancient_wisdom",
    description: {
      tr: "Zihni tüm dikkat dağıtıcı unsurlardan koruyan efsanevi kalkan.",
      en: "Legendary shield shielding mind from all distraction.",
    },
  },
  {
    id: "volcanic_dragon_staff",
    name: { tr: "Volkanik Ejderha Asası", en: "Volcanic Dragon Staff", de: "Vulkanischer Drachenstab" },
    type: "equipment",
    rarity: "legendary",
    chestTier: 4,
    icon: "🪄",
    image: "staff_dragon",
    description: {
      tr: "Ignis'in kalbinden çıkan volkanik cevherle süslenmiş asa.",
      en: "Staff adorned with volcanic ore from Ignis's core.",
    },
    bonusEffect: { tr: "Boss Baskınlarında x3 Kritik", en: "3x Criticals in Boss Raid" },
  },
];

// =============================================================================
// ÇİFTE KİLİT KONTROL ALGORİTMASI (DUAL-GATE ALGORITHM)
// =============================================================================
export function checkChestAccess(
  chest: ChestDefinition,
  userLearnedWords: number = 0,
  userGold: number = 0
): {
  canOpen: boolean;
  wordLock: boolean;
  goldLock: boolean;
  message: string;
} {
  const wordLock = userLearnedWords < chest.requiredWords;
  const goldLock = userGold < chest.costGold;

  if (wordLock) {
    return {
      canOpen: false,
      wordLock: true,
      goldLock,
      message: `🔒 ${chest.requiredWords} Kelime Öğrenince Açılır (${userLearnedWords}/${chest.requiredWords})`,
    };
  }

  if (goldLock) {
    return {
      canOpen: false,
      wordLock: false,
      goldLock: true,
      message: `🪙 ${chest.costGold - userGold} Altın Daha Gerekli (${userGold}/${chest.costGold})`,
    };
  }

  return {
    canOpen: true,
    wordLock: false,
    goldLock: false,
    message: `Açmaya Hazır! (${chest.costGold} 🪙)`,
  };
}

/**
 * Sandıktan rastgele eşya çekme fonksiyonu
 */
export function drawItemFromChest(chest: ChestDefinition): ChestItem {
  const candidateItems = CHEST_ITEMS.filter((item) =>
    chest.itemIds.includes(item.id)
  );

  if (candidateItems.length === 0) {
    return CHEST_ITEMS[0];
  }

  // Nadirlik Ağırlıkları
  const weights: Record<ItemRarity, number> = {
    common: 50,
    rare: 30,
    epic: 15,
    legendary: 5,
  };

  const pool: ChestItem[] = [];
  candidateItems.forEach((item) => {
    const count = weights[item.rarity] || 10;
    for (let i = 0; i < count; i++) {
      pool.push(item);
    }
  });

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

