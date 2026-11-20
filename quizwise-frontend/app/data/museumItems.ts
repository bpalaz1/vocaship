/**
 * Sandık Mağazası Karakter & Eser Havuzu ve Pasif Güç Tanımları
 */

export type MuseumSalonId = 1 | 2 | 3 | 4;
export type MuseumCategory = "heroes" | "creatures" | "relics" | "monuments";
export type MuseumRarity = "common" | "rare" | "epic" | "legendary";
export type MuseumBuffType = "boss_crit" | "extra_time" | "extra_life" | "bonus_gold";

export interface MuseumPassiveBuff {
  type: MuseumBuffType;
  label: string;
  icon: string;
}

export interface MuseumItem {
  id: string;
  salonId: MuseumSalonId;
  title: string;
  category: MuseumCategory;
  rarity: MuseumRarity;
  description: string;
  storyLore: string;
  avatarIcon: string;
  passiveBuff?: MuseumPassiveBuff;
}

export const BUFF_DEFINITIONS: Record<MuseumBuffType, MuseumPassiveBuff> = {
  boss_crit: {
    type: "boss_crit",
    icon: "⚔️",
    label: "⚔️ Ejderha Baskını'nda +%15 Kritik Hasar",
  },
  extra_time: {
    type: "extra_time",
    icon: "⏳",
    label: "⏳ Süreli oyunlarda +2 Saniye Ek Süre",
  },
  extra_life: {
    type: "extra_life",
    icon: "🛡️",
    label: "🛡️ Oyunlara +1 Ekstra Kalkan (Can) ile Başlama",
  },
  bonus_gold: {
    type: "bonus_gold",
    icon: "🪙",
    label: "🪙 Tüm oyunlarda +%15 Bonus Altın",
  },
};

export function getMuseumItemBuff(item: MuseumItem): MuseumPassiveBuff {
  if (item.passiveBuff) return item.passiveBuff;

  const t = (item.title || "").toLowerCase();
  if (
    t.includes("okçu") ||
    t.includes("savaşçı") ||
    t.includes("kılıç") ||
    t.includes("samuray") ||
    t.includes("gladyatör") ||
    t.includes("mızrak") ||
    t.includes("ejderha") ||
    t.includes("hançer") ||
    t.includes("balta")
  ) {
    return BUFF_DEFINITIONS.boss_crit;
  }
  if (
    t.includes("büyücü") ||
    t.includes("saat") ||
    t.includes("zaman") ||
    t.includes("kozmik") ||
    t.includes("astronot") ||
    t.includes("kahin") ||
    t.includes("yıldız") ||
    t.includes("ay") ||
    t.includes("gök")
  ) {
    return BUFF_DEFINITIONS.extra_time;
  }
  if (
    t.includes("paladin") ||
    t.includes("kalkan") ||
    t.includes("kale") ||
    t.includes("muhafız") ||
    t.includes("şövalye") ||
    t.includes("zırh") ||
    t.includes("golem") ||
    t.includes("hisar") ||
    t.includes("sur")
  ) {
    return BUFF_DEFINITIONS.extra_life;
  }
  if (
    t.includes("bilge") ||
    t.includes("kalem") ||
    t.includes("parşömen") ||
    t.includes("kitap") ||
    t.includes("kütüphane") ||
    t.includes("simya") ||
    t.includes("pusula") ||
    t.includes("altın") ||
    t.includes("taç")
  ) {
    return BUFF_DEFINITIONS.bonus_gold;
  }

  // Kategoriye göre dengeli dağılım
  const numMatch = item.id.match(/(\d+)/);
  const num = numMatch ? parseInt(numMatch[1], 10) : 1;
  if (item.category === "heroes") {
    return num % 2 === 0 ? BUFF_DEFINITIONS.extra_life : BUFF_DEFINITIONS.boss_crit;
  }
  if (item.category === "creatures") {
    return num % 2 === 0 ? BUFF_DEFINITIONS.extra_time : BUFF_DEFINITIONS.boss_crit;
  }
  if (item.category === "relics") {
    return num % 2 === 0 ? BUFF_DEFINITIONS.bonus_gold : BUFF_DEFINITIONS.boss_crit;
  }
  return num % 2 === 0 ? BUFF_DEFINITIONS.extra_life : BUFF_DEFINITIONS.bonus_gold;
}

export function getEquippedMuseumBuff(): MuseumPassiveBuff | null {
  if (typeof window === "undefined") return null;
  try {
    const rawBuff = localStorage.getItem("vocaship_equipped_buff");
    if (rawBuff) {
      const parsed = JSON.parse(rawBuff);
      if (parsed?.type && BUFF_DEFINITIONS[parsed.type as MuseumBuffType]) {
        return BUFF_DEFINITIONS[parsed.type as MuseumBuffType];
      }
    }
  } catch {}
  return null;
}

export interface MuseumSalonConfig {
  id: MuseumSalonId;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  chestCostGold: number;
  requiredPrevPercentage: number; // Örn %60
  requiredLearnedWords: number;
  themeGradient: string;
}

export const MUSEUM_SALONS: MuseumSalonConfig[] = [
  {
    id: 1,
    title: "Kahramanlar & Muhafızlar",
    subtitle: "VocaShip evreninin cesur savaşçıları ve bilge rehberleri",
    icon: "⚔️",
    badge: "Salon 1",
    chestCostGold: 100,
    requiredPrevPercentage: 0,
    requiredLearnedWords: 0,
    themeGradient: "from-blue-600 via-indigo-700 to-slate-950",
  },
  {
    id: 2,
    title: "Ejderhalar & Efsanevi Yaratıklar",
    subtitle: "Kadim göklerin ve gizemli diyarların mitolojik sakinleri",
    icon: "🐉",
    badge: "Salon 2",
    chestCostGold: 250,
    requiredPrevPercentage: 60,
    requiredLearnedWords: 100,
    themeGradient: "from-rose-600 via-amber-700 to-slate-950",
  },
  {
    id: 3,
    title: "Kadim Silahlar & Zırhlar",
    subtitle: "Efsanevi demircilerin kelime gücüyle dövdüğü kutsal teçhizatlar",
    icon: "🗡️",
    badge: "Salon 3",
    chestCostGold: 500,
    requiredPrevPercentage: 60,
    requiredLearnedWords: 300,
    themeGradient: "from-purple-600 via-fuchsia-700 to-slate-950",
  },
  {
    id: 4,
    title: "Kaleler & Bilgelik Anıtları",
    subtitle: "1000 kelimelik hafıza medeniyetinin ebedi kütüphane kaleleri",
    icon: "🏰",
    badge: "Salon 4",
    chestCostGold: 1000,
    requiredPrevPercentage: 60,
    requiredLearnedWords: 600,
    themeGradient: "from-amber-500 via-yellow-600 to-slate-950",
  },
];

export const MUSEUM_ITEMS: MuseumItem[] = [
  // ===========================================================================
  // SALON 1: KAHRAMANLAR & MUHAFIZLAR (25 Eser: hero_01 .. hero_25)
  // ===========================================================================
  {
    id: "hero_01",
    salonId: 1,
    title: "Tilki Sparky",
    category: "heroes",
    rarity: "common",
    description: "Maceraya ilk adımı atan sevimli ve meraklı tilki.",
    storyLore: "Kelime dağarcığının ilk tohumlarını eken, her yeni öğrenciye cesaret fısıldayan sadık keşif dostu.",
    avatarIcon: "🦊",
  },
  {
    id: "hero_02",
    salonId: 1,
    title: "Taş Kale Muhafızı",
    category: "heroes",
    rarity: "common",
    description: "Sarsılmaz iradesiyle kelime kalesini koruyan granit zırhlı nöbetçi.",
    storyLore: "Temel dilbilgisi kurallarını bir granit blok gibi korur, unutkanlığın içeri sızmasına asla izin vermez.",
    avatarIcon: "🛡️",
  },
  {
    id: "hero_03",
    salonId: 1,
    title: "Gölge Okçusu",
    category: "heroes",
    rarity: "rare",
    description: "Hedefi 12'den vuran sessiz orman nişancısı.",
    storyLore: "Yayından fırlayan her ok, en karmaşık eşanlamlı kelimeleri dahi tam kalbinden yakalar.",
    avatarIcon: "🏹",
  },
  {
    id: "hero_04",
    salonId: 1,
    title: "Buzul Şövalyesi",
    category: "heroes",
    rarity: "rare",
    description: "Kuzey buzullarının soğukkanlı savunucusu.",
    storyLore: "Sınav stresini donduran çelik kalkanıyla her zorlu metinde sükuneti sağlar.",
    avatarIcon: "❄️",
  },
  {
    id: "hero_05",
    salonId: 1,
    title: "Siber Samuray",
    category: "heroes",
    rarity: "epic",
    description: "Neon kılıcıyla dijital dünyada kelime avlayan fütüristik savaşçı.",
    storyLore: "Hızlı refleksleri sayesinde zaman sınırlı Speed Recall oyunlarının mutlak efendisidir.",
    avatarIcon: "⚡",
  },
  {
    id: "hero_06",
    salonId: 1,
    title: "Kozmik Astronot",
    category: "heroes",
    rarity: "epic",
    description: "Yıldızlararası sözlüklerde bilinmeyen terimlerin peşinde koşan kaşif.",
    storyLore: "Yerçekimsiz uzayda yeni deyimler keşfeder, galaktik hafıza haritaları çizer.",
    avatarIcon: "🧑‍🚀",
  },
  {
    id: "hero_07",
    salonId: 1,
    title: "Zaman Lordu Chronos",
    category: "heroes",
    rarity: "legendary",
    description: "SM-2 aralıklı tekrar eğrilerini büken kadim zaman efendisi.",
    storyLore: "Unutulmaya yüz tutmuş bir kelimeyi tam zamanında bilince geri çağırarak hafızayı ölümsüz kılar.",
    avatarIcon: "⏳",
  },
  {
    id: "hero_08",
    salonId: 1,
    title: "Altın Gladyatör",
    category: "heroes",
    rarity: "rare",
    description: "Arena kumlarında hiç yenilmemiş cesur şampiyon.",
    storyLore: "1v1 düellolarda ve kelime arenasında sergilediği kombolarla tribünleri ayağa kaldırır.",
    avatarIcon: "⚔️",
  },
  {
    id: "hero_09",
    salonId: 1,
    title: "Orman Kolcusu",
    category: "heroes",
    rarity: "common",
    description: "Doğanın fısıltılarını İngilizceye tercüme eden iz sürücü.",
    storyLore: "En gizli kök kelimeleri ve etimolojik izleri ormanın derinliklerinde takip eder.",
    avatarIcon: "🍃",
  },
  {
    id: "hero_10",
    salonId: 1,
    title: "Çöl Büyücüsü",
    category: "heroes",
    rarity: "rare",
    description: "Kum fırtınalarının ardındaki kadim metinleri çözen gizemli simyacı.",
    storyLore: "Serap sanılan kelimeleri gerçeğe dönüştürür, parşömenlere altın mürekkeple yazar.",
    avatarIcon: "🔮",
  },
  {
    id: "hero_11",
    salonId: 1,
    title: "Fırtına Paladini",
    category: "heroes",
    rarity: "epic",
    description: "Gök gürültüsünü çekicinde toplayan erdem savaşçısı.",
    storyLore: "Doğru telaffuzun gücünü şimşek hızında yayar, yanlış vurguları tek darbede siler.",
    avatarIcon: "🌩️",
  },
  {
    id: "hero_12",
    salonId: 1,
    title: "Lav Savaşçısı",
    category: "heroes",
    rarity: "rare",
    description: "Volkanın bağrında dövülmüş alevli zırhın taşıyıcısı.",
    storyLore: "Akıcı konuşmanın sıcaklığını ruhunda taşır; tereddütleri eriten bir tutkuyla konuşur.",
    avatarIcon: "🔥",
  },
  {
    id: "hero_13",
    salonId: 1,
    title: "Deniz Kaptanı Nautilus",
    category: "heroes",
    rarity: "rare",
    description: "Okyanusların derinliklerindeki hazineleri çıkaran tecrübeli denizci.",
    storyLore: "Hazine Avı oyunlarında korsan sandıklarının yerini şaşmaz pusulasıyla tayin eder.",
    avatarIcon: "🧭",
  },
  {
    id: "hero_14",
    salonId: 1,
    title: "Gök Savaşçısı Zephyr",
    category: "heroes",
    rarity: "rare",
    description: "Rüzgarın kanatlarında süzülen hafif ve çevik hava muhafızı.",
    storyLore: "Kelime eşleştirmelerinde kartların arasından bir rüzgar gibi süzülür.",
    avatarIcon: "🪽",
  },
  {
    id: "hero_15",
    salonId: 1,
    title: "Gece Gözcüsü",
    category: "heroes",
    rarity: "common",
    description: "Karanlık bastığında öğrencilerin gece tekrarlarına eşlik eden fenerli bekçi.",
    storyLore: "Yatmadan önceki son 5 kelimelik tekrarın zihne mühürlenmesini sağlar.",
    avatarIcon: "🌙",
  },
  {
    id: "hero_16",
    salonId: 1,
    title: "Antik Bilge Albus",
    category: "heroes",
    rarity: "epic",
    description: "Bin yıllık kütüphanelerin sırlarını taşıyan ak sakallı üstat.",
    storyLore: "C1 ve C2 düzeyindeki akademik kavramları bir çocuk masalı gibi berrak anlatır.",
    avatarIcon: "📜",
  },
  {
    id: "hero_17",
    salonId: 1,
    title: "Çelik Zırhlı Şövalye",
    category: "heroes",
    rarity: "common",
    description: "Kusursuz disipliniyle çalışan sadık alıştırma şövalyesi.",
    storyLore: "Günlük hedefini aksatmayan kaşiflere her gün yeni bir onur nişanı takar.",
    avatarIcon: "🦾",
  },
  {
    id: "hero_18",
    salonId: 1,
    title: "Manyetik Mühendis",
    category: "heroes",
    rarity: "rare",
    description: "Zıt anlamlı kelimeleri manyetik kutuplarla birbirine çeken mucit.",
    storyLore: "Karmaşık cümle yapılarını dişli çarklar gibi pürüzsüzce birbirine kenetler.",
    avatarIcon: "🧲",
  },
  {
    id: "hero_19",
    salonId: 1,
    title: "Kristal Muhafız",
    category: "heroes",
    rarity: "rare",
    description: "Işığı prizma gibi yansıtarak kelimelerin inceliklerini aydınlatan nöbetçi.",
    storyLore: "Fonetik transkripsiyon sembollerini gökkuşağı renkleriyle parıldatır.",
    avatarIcon: "💎",
  },
  {
    id: "hero_20",
    salonId: 1,
    title: "Güneş Rahibi",
    category: "heroes",
    rarity: "epic",
    description: "Güneşin doğuşuyla birlikte erken kalkan çalışkan zihinleri kutsayan rahip.",
    storyLore: "Sabah saatlerinde yapılan konuşma pratiklerine %20 fazladan zindelik bahşeder.",
    avatarIcon: "☀️",
  },
  {
    id: "hero_21",
    salonId: 1,
    title: "Ay Avcısı Selina",
    category: "heroes",
    rarity: "rare",
    description: "Gümüş oklarıyla gecenin sessizliğinde zorlu gramer kalıplarını yakalayan avcı.",
    storyLore: "Karanlıkta parlayan yay ipi, devrik cümleleri kusursuz nizama sokar.",
    avatarIcon: "🏹",
  },
  {
    id: "hero_22",
    salonId: 1,
    title: "Rünik Glif Ustası",
    category: "heroes",
    rarity: "epic",
    description: "Kelimelerin köklerindeki antik sembolleri kazıyan usta nakkaş.",
    storyLore: "Her harfin bir ruhu olduğuna inanır ve sözcükleri birer sanat eseri gibi zihne oyar.",
    avatarIcon: "✒️",
  },
  {
    id: "hero_23",
    salonId: 1,
    title: "Volkanik Berserker",
    category: "heroes",
    rarity: "rare",
    description: "Ejderha baskınlarında ön safta savaşan yılmaz güç abidesi.",
    storyLore: "Hata yapmaktan korkmaz; her yanlış cevabı daha güçlü bir doğruyla telafi eder.",
    avatarIcon: "🌋",
  },
  {
    id: "hero_24",
    salonId: 1,
    title: "Sonsuzluk Gezgini",
    category: "heroes",
    rarity: "epic",
    description: "Boyutlar arası kapılardan geçerek tüm dünya dillerini gezen gezgin.",
    storyLore: "Farklı aksanların melodisini çözer, yabancı hissettiren kelimeleri evine kavuşturur.",
    avatarIcon: "🌌",
  },
  {
    id: "hero_25",
    salonId: 1,
    title: "Grandmaster Şampiyonu",
    category: "heroes",
    rarity: "legendary",
    description: "1000 kelimelik zirveye tırmanan öğrencilerin altın sureti.",
    storyLore: "Salon 1'in en büyük onur tacıdır; İngilizceyi bir anahtar gibi kullanarak tüm kapıları açar.",
    avatarIcon: "👑",
  },

  // ===========================================================================
  // SALON 2: EJDERHALAR & EFSANEVİ YARATIKLAR (25 Eser: creature_01 .. creature_25)
  // ===========================================================================
  {
    id: "creature_01",
    salonId: 2,
    title: "Bilge Orman Baykuşu",
    category: "creatures",
    rarity: "common",
    description: "Geceleri parıldayan gözleriyle kitap sayfalarını tarayan antik baykuş.",
    storyLore: "Okunan her cümlenin ana fikrini bir bakışta süzer ve hafıza yuvasına taşır.",
    avatarIcon: "🦉",
  },
  {
    id: "creature_02",
    salonId: 2,
    title: "Kanatlı Pegasus",
    category: "creatures",
    rarity: "rare",
    description: "Beyaz tüyleriyle gökyüzünde süzülen mitolojik asil at.",
    storyLore: "Zorlu okuma parçalarında okuyucuyu sırtına alır, paragrafın doruk noktasına ulaştırır.",
    avatarIcon: "🦄",
  },
  {
    id: "creature_03",
    salonId: 2,
    title: "Antik Taş Golem",
    category: "creatures",
    rarity: "common",
    description: "Toprağın ve kayaların kadim enerjisiyle canlanan dev koruyucu.",
    storyLore: "Kalıcı hafızanın simgesidir; bir kez öğrendiği kelimeyi bin yıl boyunca unutmaz.",
    avatarIcon: "🗿",
  },
  {
    id: "creature_04",
    salonId: 2,
    title: "Kızıl Lav Ejderhası Ignis",
    category: "creatures",
    rarity: "legendary",
    description: "Volkanik dağların zirvesinde yaşayan, kelimeleri alevle test eden ulu ejderha.",
    storyLore: "Ejderha Baskını arenasında meydan okuyan öğrencilerin cesaretini takdir eder.",
    avatarIcon: "🐉",
  },
  {
    id: "creature_05",
    salonId: 2,
    title: "Altın Anka Kuşu",
    category: "creatures",
    rarity: "legendary",
    description: "Kendi küllerinden yeniden doğan ebedi zarafet simgesi.",
    storyLore: "Sıfır Eleme (Respawn) anında gökten inerek öğrenciye yeni bir can ve umut üfler.",
    avatarIcon: "🪶",
  },
  {
    id: "creature_06",
    salonId: 2,
    title: "Kozmik Nebula Ejderhası",
    category: "creatures",
    rarity: "epic",
    description: "Gövdesi yıldız tozlarıyla parlayan uzay ejderhası.",
    storyLore: "Samanyolu'nun ötesindeki bilinmeyen kelime galaksilerini korur.",
    avatarIcon: "✨",
  },
  {
    id: "creature_07",
    salonId: 2,
    title: "Buz Nefesli Wyrm",
    category: "creatures",
    rarity: "rare",
    description: "Kutupların buz sarkıtları arasında uyuyan mavi ejderha.",
    storyLore: "Nefesiyle heyecanı yatıştırır, sınav esnasında zihne buz gibi bir odaklanma sağlar.",
    avatarIcon: "🧊",
  },
  {
    id: "creature_08",
    salonId: 2,
    title: "Okyanus Leviathanı",
    category: "creatures",
    rarity: "epic",
    description: "Dip akıntılarının en derininde yatan kadim deniz devi.",
    storyLore: "Akademik metinlerin derin sularında boğulmadan yüzmenin sırrını öğretir.",
    avatarIcon: "🐋",
  },
  {
    id: "creature_09",
    salonId: 2,
    title: "Fırtına Kartalı Aquila",
    category: "creatures",
    rarity: "rare",
    description: "Şimşek bulutlarının üzerinde yuva yapan altın gözlü yırtıcı.",
    storyLore: "Metin içindeki anahtar kelimeleri gökyüzünden bir şimşek hızıyla tespit eder.",
    avatarIcon: "🦅",
  },
  {
    id: "creature_10",
    salonId: 2,
    title: "Kristal Kaplumbağa",
    category: "creatures",
    rarity: "common",
    description: "Kabuğu zümrüt ve elmas kristallerinden oluşan sabır timsali.",
    storyLore: "Yavaş ama kararlı adımlarla her gün 20 kelime öğrenmenin büyük zaferini fısıldar.",
    avatarIcon: "🐢",
  },
  {
    id: "creature_11",
    salonId: 2,
    title: "Zümrüt Orman Kertenkelesi",
    category: "creatures",
    rarity: "common",
    description: "Bulunduğu ortamın diline anında uyum sağlayan renk değiştiren dost.",
    storyLore: "Farklı konuşma ortamlarında doğru tonlamayı ve kelime seçimini hızla benimser.",
    avatarIcon: "🦎",
  },
  {
    id: "creature_12",
    salonId: 2,
    title: "Gece Kurdu Fenrir",
    category: "creatures",
    rarity: "rare",
    description: "Dolunayın altında sürü halinde kelime avlayan gümüş tüylü kurt.",
    storyLore: "Sınıfça yapılan Co-op baskınlarda birlik olmanın sarsılmaz gücünü temsil eder.",
    avatarIcon: "🐺",
  },
  {
    id: "creature_13",
    salonId: 2,
    title: "Güneş Aslanı Solarius",
    category: "creatures",
    rarity: "epic",
    description: "Yelesi saf güneş ışığından örülmüş heybetli ormanlar kralı.",
    storyLore: "Özgüvenle konuşmanın asaletini aşılar; kekelemeyi ve çekingenliği kükreyerek dağıtır.",
    avatarIcon: "🦁",
  },
  {
    id: "creature_14",
    salonId: 2,
    title: "Zehirli Basilisk",
    category: "creatures",
    rarity: "rare",
    description: "Gözleriyle yanıltıcı seçenekleri taşlaştıran efsanevi sürüngen.",
    storyLore: "Çoktan seçmeli testlerdeki çeldiricileri tek bakışta etkisiz hale getirir.",
    avatarIcon: "🐍",
  },
  {
    id: "creature_15",
    salonId: 2,
    title: "Antik Buzul Mamutu",
    category: "creatures",
    rarity: "common",
    description: "Buzul çağının fırtınalarına göğüs germiş devasa yürüyen anıt.",
    storyLore: "Geniş sırtında koca kütüphaneleri taşır, ağır tempolu ama sarsılmaz hafıza inşa eder.",
    avatarIcon: "🦣",
  },
  {
    id: "creature_16",
    salonId: 2,
    title: "Ateş Semenderi",
    category: "creatures",
    rarity: "common",
    description: "Közlerin arasında dans eden minik ve neşeli lav yaratığı.",
    storyLore: "Öğrenme kıvılcımını hiç söndürmez; en sıkıcı konuları bile eğlenceli hale getirir.",
    avatarIcon: "🔥",
  },
  {
    id: "creature_17",
    salonId: 2,
    title: "Gök Gürültüsü Ejderhası",
    category: "creatures",
    rarity: "epic",
    description: "Kanatlarını çırptığında fırtınalar koparan elektrik mavisi ejderha.",
    storyLore: "Speed Recall oyunlarında ardı ardına gelen 10 kombo serisinde gökyüzünde belirir.",
    avatarIcon: "⚡",
  },
  {
    id: "creature_18",
    salonId: 2,
    title: "Gölge Panteri",
    category: "creatures",
    rarity: "rare",
    description: "Gecenin örtüsü altında sessiz adımlarla avlanan göz kamaştırıcı avcı.",
    storyLore: "Listening dinleme çalışmalarında aradaki en kısık sesli detayları dahi yakalar.",
    avatarIcon: "🐆",
  },
  {
    id: "creature_19",
    salonId: 2,
    title: "Safir Gökyüzü Balinası",
    category: "creatures",
    rarity: "epic",
    description: "Bulutların arasında yüzen devasa masmavi gök memelisi.",
    storyLore: "Yankılanan şarkısıyla binlerce yeni kelimeyi gökyüzüne bir melodi gibi yayar.",
    avatarIcon: "🐳",
  },
  {
    id: "creature_20",
    salonId: 2,
    title: "Magma Boğası",
    category: "creatures",
    rarity: "rare",
    description: "Boynuzlarından lavlar damlayan durdurulamaz yer altı devi.",
    storyLore: "Zorluklar karşısında asla geri adım atmaz; önündeki tüm engelleri yıkar geçer.",
    avatarIcon: "🐂",
  },
  {
    id: "creature_21",
    salonId: 2,
    title: "Rüzgar Grifonu",
    category: "creatures",
    rarity: "rare",
    description: "Aslan gövdesi ve kartal başıyla dağ geçitlerini koruyan asil bekçi.",
    storyLore: "Hem cesaretin hem de keskin aklın birleşimini sembolize eder.",
    avatarIcon: "🦅",
  },
  {
    id: "creature_22",
    salonId: 2,
    title: "Karanlık Hydra",
    category: "creatures",
    rarity: "epic",
    description: "Bir başı kesildiğinde iki başı birden çıkan çok başlı antik efsane.",
    storyLore: "Her çözülen problemin ardından zihnin kapasitesini iki katına çıkarır.",
    avatarIcon: "🐉",
  },
  {
    id: "creature_23",
    salonId: 2,
    title: "Ay Güvesi Selene",
    category: "creatures",
    rarity: "rare",
    description: "Gümüşi kanatlarıyla gecenin rüyalarını kelimelerle süsleyen peri güvesi.",
    storyLore: "Uykuda gerçekleşen hafıza pekiştirme süreçlerinin koruyucu meleğidir.",
    avatarIcon: "🦋",
  },
  {
    id: "creature_24",
    salonId: 2,
    title: "Astral Mantar Ruhu",
    category: "creatures",
    rarity: "rare",
    description: "Büyülü ormanın derinliklerinde parıldayan psişik doğa ruhu.",
    storyLore: "Kelimeler arasında hiç tahmin edilmeyen sezgisel bağlar kurar.",
    avatarIcon: "🍄",
  },
  {
    id: "creature_25",
    salonId: 2,
    title: "Kadim Titan Ejderhası",
    category: "creatures",
    rarity: "legendary",
    description: "Evrenin doğumundan beri göklerde uyuyan en yüce yaratık.",
    storyLore: "Salon 2'nin taç mücevheridir; yalnızca 100 kelime barajını aşan gerçek kaşiflere uyanır.",
    avatarIcon: "👑",
  },

  // ===========================================================================
  // SALON 3: KADİM SİLAHLAR & ZIRHLAR (25 Eser: relic_01 .. relic_25)
  // ===========================================================================
  {
    id: "relic_01",
    salonId: 3,
    title: "Bronz Keşif Kılıcı",
    category: "relics",
    rarity: "common",
    description: "İlk kelime savaşlarına katılan acemilerin güvenilir kılıcı.",
    storyLore: "Hafif ve dengelidir; A1 seviyesindeki ilk cümleleri cesaretle kurmayı sağlar.",
    avatarIcon: "🗡️",
  },
  {
    id: "relic_02",
    salonId: 3,
    title: "Alevli Sözlük Kılıcı",
    category: "relics",
    rarity: "rare",
    description: "Namusunda parlayan alevlerle yanlış harfleri yakan büyülü kılıç.",
    storyLore: "Word Scramble oyunlarında harfleri doğru sıraya dizmek için harika bir kılavuzdur.",
    avatarIcon: "🔥",
  },
  {
    id: "relic_03",
    salonId: 3,
    title: "Kristal Kalkan",
    category: "relics",
    rarity: "rare",
    description: "Sınav kaygılarını ve kafa karışıklıklarını geri püskürten saydam kalkan.",
    storyLore: "Çeldirici seçeneklerin zihni bulandırmasına karşı zırh gibi korur.",
    avatarIcon: "🛡️",
  },
  {
    id: "relic_04",
    salonId: 3,
    title: "Lazer Plazma Kılıcı",
    category: "relics",
    rarity: "epic",
    description: "Geleceğin teknolojisiyle ışık saçan yüksek enerjili kılıç.",
    storyLore: "Tek darbede en karmaşık bileşik kelimeleri kök ve eklerine ayırır.",
    avatarIcon: "⚡",
  },
  {
    id: "relic_05",
    salonId: 3,
    title: "Efsanevi Altın Kılıç Excalibur",
    category: "relics",
    rarity: "legendary",
    description: "Taşa saplanmış kadim kelime kılıcı; sadece gerçek galipler çekebilir.",
    storyLore: "Her doğru telaffuzda göğe altın ışık huzmeleri saçar, konuşmayı akıcı kılar.",
    avatarIcon: "✨",
  },
  {
    id: "relic_06",
    salonId: 3,
    title: "Grandmaster Altın Tacı",
    category: "relics",
    rarity: "legendary",
    description: "300+ kelime barajını aşarak Salon 3'e hükmeden liderlerin tacı.",
    storyLore: "Kuşanan oyuncunun profilinde saf altın bir parıltıyla ışıldar.",
    avatarIcon: "👑",
  },
  {
    id: "relic_07",
    salonId: 3,
    title: "Rünik Titanyum Zırh",
    category: "relics",
    rarity: "epic",
    description: "Üzerine koruyucu gramer rünleri işlenmiş kırılmaz göğüslük.",
    storyLore: "Zorlu paragraf sorularında öğrencinin odağını hiçbir şeyin bozamamasını sağlar.",
    avatarIcon: "🦺",
  },
  {
    id: "relic_08",
    salonId: 3,
    title: "Buzul Kargısı",
    category: "relics",
    rarity: "rare",
    description: "Kutup fırtınalarının keskinliğiyle bilenmiş donmuş mızrak.",
    storyLore: "Uzak hedeflerdeki anlam nüanslarını tek bir hamleyle yakalar.",
    avatarIcon: "🔱",
  },
  {
    id: "relic_09",
    salonId: 3,
    title: "Sonsuzluk Miğferi",
    category: "relics",
    rarity: "epic",
    description: "Zihni dış gürültülerden arındıran parıltılı miğfer.",
    storyLore: "Kulaklıktan gelen telaffuz seslerini stüdyo netliğinde zihne aktarır.",
    avatarIcon: "🪖",
  },
  {
    id: "relic_10",
    salonId: 3,
    title: "Göktaşı Çekici",
    category: "relics",
    rarity: "rare",
    description: "Uzaydan düşen bir göktaşının çekirdeğinden dövülmüş ağır balyoz.",
    storyLore: "Yerçekimi Savunması oyununda düşen asteroidleri parçalamak için birebirdir.",
    avatarIcon: "🔨",
  },
  {
    id: "relic_11",
    salonId: 3,
    title: "Yıldırım Yayı",
    category: "relics",
    rarity: "rare",
    description: "Gerdikçe kıvılcımlar saçan elektrik yüklü kombo yayı.",
    storyLore: "Seri kombolarda atılan her ok için +%50 daha fazla skor üretir.",
    avatarIcon: "🏹",
  },
  {
    id: "relic_12",
    salonId: 3,
    title: "Gölge Hançeri",
    category: "relics",
    rarity: "common",
    description: "Sessizce hareket eden hızlı refleks hançeri.",
    storyLore: "Kart Eşleştirme tablosunda çiftleri saniyeler içinde çözüp kaybettirir.",
    avatarIcon: "🗡️",
  },
  {
    id: "relic_13",
    salonId: 3,
    title: "Ejderha Pulu Pelerin",
    category: "relics",
    rarity: "epic",
    description: "Ignis'in dökülen pullarından dikilmiş yanmaz zarafet örtüsü.",
    storyLore: "Kritik darbelerden hasar almayı önler, kullanıcıya asil bir duruş katar.",
    avatarIcon: "🧣",
  },
  {
    id: "relic_14",
    salonId: 3,
    title: "Kadim Savaş Baltası",
    category: "relics",
    rarity: "rare",
    description: "İki ağızlı ağır çelik savaş baltası.",
    storyLore: "Uzun ve karmaşık cümleleri mantıksal parçalara ayırmakta ustadır.",
    avatarIcon: "🪓",
  },
  {
    id: "relic_15",
    salonId: 3,
    title: "Ruh Koruma Tılsımı",
    category: "relics",
    rarity: "rare",
    description: "Mavi bir safir taşının etrafına sarılmış gümüş kolye.",
    storyLore: "Unutma riskine giren kelimeleri hemen uyararak İntikam Arenası'na taşır.",
    avatarIcon: "🧿",
  },
  {
    id: "relic_16",
    salonId: 3,
    title: "Manyetik Güç Eldiveni",
    category: "relics",
    rarity: "rare",
    description: "Kelimeleri havadan çekip parmak uçlarında tutan eldiven.",
    storyLore: "Doğru şıkkı sezgisel olarak kendine doğru çeker.",
    avatarIcon: "🧤",
  },
  {
    id: "relic_17",
    salonId: 3,
    title: "Kozmik Halka Yüzük",
    category: "relics",
    rarity: "epic",
    description: "İçinde bir galaksinin döndüğü parıldayan altın halka.",
    storyLore: "Kullanıcının kelime peteğindeki tüm hücrelere kozmik ışık yayar.",
    avatarIcon: "💍",
  },
  {
    id: "relic_18",
    salonId: 3,
    title: "Zümrüt Aegis Kalkanı",
    category: "relics",
    rarity: "rare",
    description: "Yeşil orman zümrütleriyle kaplı efsanevi savunma diski.",
    storyLore: "Yanlış telaffuz edilen kelimeleri şefkatle düzeltir, telafi altını kazandırır.",
    avatarIcon: "🛡️",
  },
  {
    id: "relic_19",
    salonId: 3,
    title: "Güneş Mızrağı",
    category: "relics",
    rarity: "epic",
    description: "Ucu saf gün ışığından yapılmış aydınlatıcı mızrak.",
    storyLore: "Karanlık ve anlaşılmaz akademik paragrafları gün ışığı gibi aydınlatır.",
    avatarIcon: "🔱",
  },
  {
    id: "relic_20",
    salonId: 3,
    title: "Ay Işığı Palası",
    category: "relics",
    rarity: "rare",
    description: "Hilal şeklinde kıvrık, gümüş ışıltılı zarif pala.",
    storyLore: "Hafıza eğrisinde gece tekrarlarını pürüzsüz hale getirir.",
    avatarIcon: "🌙",
  },
  {
    id: "relic_21",
    salonId: 3,
    title: "Kemik Zırh",
    category: "relics",
    rarity: "common",
    description: "Tarih öncesi yaratıkların fosillerinden yapılmış hafif zırh.",
    storyLore: "Eski kelime kökenlerini ve etimolojiyi koruyan antik bir mirastır.",
    avatarIcon: "🦴",
  },
  {
    id: "relic_22",
    salonId: 3,
    title: "Plazma Enerji Kalkanı",
    category: "relics",
    rarity: "epic",
    description: "Dokunulduğunda mavi kıvılcımlar çıkaran enerji kubbesi.",
    storyLore: "Hata yapma korkusunu tamamen yok eden modern bir kalkan jeneratörüdür.",
    avatarIcon: "🌐",
  },
  {
    id: "relic_23",
    salonId: 3,
    title: "Zaman Bükücü Kum Saati",
    category: "relics",
    rarity: "legendary",
    description: "Kumları yukarı doğru akan efsanevi kronometre.",
    storyLore: "Speed Recall oyunlarında süreyi 3 saniye genişleterek rahat düşünme sağlar.",
    avatarIcon: "⏳",
  },
  {
    id: "relic_24",
    salonId: 3,
    title: "Yeraltı Altın Tırpanı",
    category: "relics",
    rarity: "rare",
    description: "Hazine madenlerinde altın damarlarını biçen parlak tırpan.",
    storyLore: "Hazine Avı oyunlarında her sandıktan ekstradan +10 altın çıkarır.",
    avatarIcon: "⛏️",
  },
  {
    id: "relic_25",
    salonId: 3,
    title: "Hükümdar Asası Scepter",
    category: "relics",
    rarity: "legendary",
    description: "Tüm dil kurallarına hükmeden imparatorluk asası.",
    storyLore: "Salon 3'ün zirve eseri; kuşanıldığında dil öğrenimindeki mutlak otoriteyi simgeler.",
    avatarIcon: "🪄",
  },

  // ===========================================================================
  // SALON 4: KALELER & BİLGELİK ANITLARI (25 Eser: monument_01 .. monument_25)
  // ===========================================================================
  {
    id: "monument_01",
    salonId: 4,
    title: "Antik Taş Kule",
    category: "monuments",
    rarity: "common",
    description: "Temel kelime taşlarının üst üste dizilmesiyle yükselen gözetleme kulesi.",
    storyLore: "İlk 50 kelimenin sağlam temelini temsil eder; ufuktaki yeni hedefleri gösterir.",
    avatarIcon: "🗼",
  },
  {
    id: "monument_02",
    salonId: 4,
    title: "Buzul Kristal Kalesi",
    category: "monuments",
    rarity: "rare",
    description: "Kutup dağlarının tepesinde yükselen masmavi şeffaf kale.",
    storyLore: "Soğuk ve berrak bir mantıkla kurulan kusursuz gramer yapılarını simgeler.",
    avatarIcon: "🏰",
  },
  {
    id: "monument_03",
    salonId: 4,
    title: "Gökyüzü Yıldız Kalesi",
    category: "monuments",
    rarity: "epic",
    description: "Bulutların üzerinde süzülen yerçekimsiz büyü kalesi.",
    storyLore: "Öğrenilen yüzlerce kelimenin gökyüzünde birer yıldız gibi parıldadığı kutsal sığınak.",
    avatarIcon: "⭐",
  },
  {
    id: "monument_04",
    salonId: 4,
    title: "Göklerin Ejderha Kalesi",
    category: "monuments",
    rarity: "legendary",
    description: "Ejderhaların koruması altındaki lav ve altınla bezeli efsanevi kale.",
    storyLore: "600+ kelime barajını aşan öğrencilerin adının altın harflerle yazıldığı salon başyapıtı.",
    avatarIcon: "🏯",
  },
  {
    id: "monument_05",
    salonId: 4,
    title: "Ebedi Altın Kalem",
    category: "monuments",
    rarity: "rare",
    description: "Mürekkebi hiç bitmeyen, kelimeleri altın yaldızla yazan anıt kalem.",
    storyLore: "Okuma Odası'nda yapay zekâ ile üretilen tüm epik hikayelerin yaratıcı kaynağıdır.",
    avatarIcon: "✒️",
  },
  {
    id: "monument_06",
    salonId: 4,
    title: "Kadim Kaptan Pusulası",
    category: "monuments",
    rarity: "rare",
    description: "Kuzeyi değil, öğrencinin bir sonraki öğrenmesi gereken kelimeyi gösteren pusula.",
    storyLore: "SM-2 algoritmasının kalbindeki en doğru rota rehberidir.",
    avatarIcon: "🧭",
  },
  {
    id: "monument_07",
    salonId: 4,
    title: "Sonsuz Bilgi Sihirli Sözlüğü",
    category: "monuments",
    rarity: "legendary",
    description: "Sayfaları sonsuzluğa uzanan, her açıldığında yeni bir terim öğreten kutsal kitap.",
    storyLore: "VocaShip platformunun kalbidir; tüm kütüphaneler bu kitaptan beslenir.",
    avatarIcon: "📖",
  },
  {
    id: "monument_08",
    salonId: 4,
    title: "İskenderiye Feneri Kulesi",
    category: "monuments",
    rarity: "epic",
    description: "Karanlık denizlerdeki gemilere kelime ışığı tutan dev deniz feneri.",
    storyLore: "Bilinmeyen kavramların yarattığı sis bulutunu tek bir ışık demetiyle dağıtır.",
    avatarIcon: "🏮",
  },
  {
    id: "monument_09",
    salonId: 4,
    title: "Güneş Tapınağı Piramidi",
    category: "monuments",
    rarity: "epic",
    description: "Her basamağı bir CEFR seviyesini (A1'den C2'ye) temsil eden devasa piramit.",
    storyLore: "Zirveye ulaşanlar güneşe el uzatır ve dili akıcı bir sanat gibi konuşur.",
    avatarIcon: "🏛️",
  },
  {
    id: "monument_10",
    salonId: 4,
    title: "Kozmik Gözlemevi Kulesi",
    category: "monuments",
    rarity: "rare",
    description: "Uzak galaksilerdeki yeni deyimleri inceleyen teleskoplu anıt.",
    storyLore: "Dil öğreniminin sınırlarının evren kadar sonsuz olduğunu hatırlatır.",
    avatarIcon: "🔭",
  },
  {
    id: "monument_11",
    salonId: 4,
    title: "Zümrüt Şehir Kapısı",
    category: "monuments",
    rarity: "common",
    description: "İngilizce konuşulan büyük medeniyetin giriş kapısı.",
    storyLore: "Eşiklerinden geçen her öğrenciye bir dünya vatandaşı olma müjdesi verir.",
    avatarIcon: "🚪",
  },
  {
    id: "monument_12",
    salonId: 4,
    title: "Fırtına Deniz Feneri",
    category: "monuments",
    rarity: "common",
    description: "En azgın dalgalara bile direnen granit kayalık feneri.",
    storyLore: "Sınav günlerinde sarsılmaz bir dinginlik feneri gibi yol gösterir.",
    avatarIcon: "🌊",
  },
  {
    id: "monument_13",
    salonId: 4,
    title: "Çöl Vahası Çeşmesi",
    category: "monuments",
    rarity: "common",
    description: "Kızgın kumlarda susamış zihinlere bilgi suyu sunan büyülü çeşme.",
    storyLore: "Yorulan öğrencilerin motivasyonunu tek yudumda yeniler.",
    avatarIcon: "⛲",
  },
  {
    id: "monument_14",
    salonId: 4,
    title: "Lav Dökümhanesi Anıtı",
    category: "monuments",
    rarity: "rare",
    description: "Altın madalyaların ve zafer kupalarının döküldüğü devasa ateş ocağı.",
    storyLore: "Oyun Arenası'nda kazanılan her başarının burada ebedi bir kupaya dönüştüğüne inanılır.",
    avatarIcon: "🌋",
  },
  {
    id: "monument_15",
    salonId: 4,
    title: "Rünik Stonehenge Çemberi",
    category: "monuments",
    rarity: "rare",
    description: "Gündönümlerinde güneş ışığını kelime peteklerine odaklayan monolitler.",
    storyLore: "Doğanın döngüleriyle hafızanın biyolojik ritmini senkronize eder.",
    avatarIcon: "🗿",
  },
  {
    id: "monument_16",
    salonId: 4,
    title: "Sualtı Atlantis Mabedi",
    category: "monuments",
    rarity: "epic",
    description: "Okyanusun dibinde batmadan ışıldayan kadim bilgelik tapınağı.",
    storyLore: "Kaybolduğu sanılan en derin ve nadir kelimeleri sütunlarında saklar.",
    avatarIcon: "🏛️",
  },
  {
    id: "monument_17",
    salonId: 4,
    title: "Uçan Ada Laputa",
    category: "monuments",
    rarity: "epic",
    description: "Manyetik mineraller sayesinde gökyüzünde süzülen antik şehir.",
    storyLore: "Sadece zihinsel olarak özgürleşen ve önyargıları yıkan kaşiflerin görebildiği ada.",
    avatarIcon: "🏝️",
  },
  {
    id: "monument_18",
    salonId: 4,
    title: "Bilgelik Çınarı Anıtı",
    category: "monuments",
    rarity: "rare",
    description: "Kökleri kütüphanelerin altına inen bin yıllık ulu çınar ağacı.",
    storyLore: "Öğrenilen her 10 kelime için dallarında altın bir yaprak filizlendirir.",
    avatarIcon: "🌳",
  },
  {
    id: "monument_19",
    salonId: 4,
    title: "Zaman Kulesi Çanı",
    category: "monuments",
    rarity: "rare",
    description: "Her saat başı akıcı bir İngilizce kelime tınısıyla çalan bronz çan.",
    storyLore: "Düzenli çalışma disiplinini zarafetle hatırlatan zamansız bir ses.",
    avatarIcon: "🔔",
  },
  {
    id: "monument_20",
    salonId: 4,
    title: "Kristal Mağara Mabedi",
    category: "monuments",
    rarity: "rare",
    description: "Yeraltında milyonlarca yılda oluşmuş ametist ve zümrüt tapınak.",
    storyLore: "Speaking Lounge sohbetlerinin akustiğini mükemmelleştiren yankı odası.",
    avatarIcon: "💎",
  },
  {
    id: "monument_21",
    salonId: 4,
    title: "Demir Kale Hisarı",
    category: "monuments",
    rarity: "common",
    description: "Geçilmez surlarıyla unutkanlık ordularını püskürten çelik kale.",
    storyLore: "Öğrencinin azmini ve pes etmeyen iradesini çelikten bir anıta dönüştürür.",
    avatarIcon: "🧱",
  },
  {
    id: "monument_22",
    salonId: 4,
    title: "Manyetik Boyut Portalı",
    category: "monuments",
    rarity: "epic",
    description: "İçinden geçenleri doğrudan yabancı bir kültürün kalbine ışınlayan portal.",
    storyLore: "Dili sadece kitaptan değil, hayatın tam içinden yaşayarak öğrenmeyi sağlar.",
    avatarIcon: "🌀",
  },
  {
    id: "monument_23",
    salonId: 4,
    title: "Gökkuşağı Köprüsü Bifrost",
    category: "monuments",
    rarity: "epic",
    description: "Farklı seviyedeki öğrencileri birbirine bağlayan ışık köprüsü.",
    storyLore: "Sınıf içi dayanışmanın ve birlikte öğrenmenin aydınlık köprüsüdür.",
    avatarIcon: "🌈",
  },
  {
    id: "monument_24",
    salonId: 4,
    title: "Kadim Bilgelik Küresi",
    category: "monuments",
    rarity: "rare",
    description: "İçinde tüm dünya dillerinin ses dalgalarını barındıran plazma küre.",
    storyLore: "Dokunan kişiye anında kusursuz bir fonetik telaffuz hissi bahşeder.",
    avatarIcon: "🔮",
  },
  {
    id: "monument_25",
    salonId: 4,
    title: "VocaShip Grand Panteon",
    category: "monuments",
    rarity: "legendary",
    description: "100 eserin tamamını toplayan ulu kaşiflerin ebedi zafer tapınağı.",
    storyLore: "Müzenin en yüce kubbesidir; buraya ulaşan her öğrenci kendi dil zaferinin mimarıdır.",
    avatarIcon: "👑",
  },
];

/**
 * Kullanıcının açtığı müze eserlerini yerel hafızadan okur.
 */
export function getUnlockedMuseumItemIds(): string[] {
  if (typeof window === "undefined") return ["hero_01"];
  try {
    const raw = localStorage.getItem("vocaship_unlocked_museum_items");
    if (!raw) {
      // Varsayılan olarak hero_01 (Tilki Sparky) açık
      const initial = ["hero_01"];
      localStorage.setItem("vocaship_unlocked_museum_items", JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["hero_01"];
  } catch {
    return ["hero_01"];
  }
}

/**
 * Yeni bir eserin kilidini açar ve kaydeder.
 */
export function unlockMuseumItem(itemId: string): string[] {
  if (typeof window === "undefined") return [itemId];
  try {
    const current = getUnlockedMuseumItemIds();
    if (!current.includes(itemId)) {
      const updated = [...current, itemId];
      localStorage.setItem("vocaship_unlocked_museum_items", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("vocaship_museum_unlocked", { detail: { itemId, unlocked: updated } })
      );
      return updated;
    }
    return current;
  } catch {
    return [itemId];
  }
}

