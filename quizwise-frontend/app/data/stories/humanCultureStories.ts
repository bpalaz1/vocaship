import { Story } from "./types";

export const humanCultureStories: Story[] = [
  // ==========================================
  // LEVEL A (A1-A2, ~120-150 kelime, 2-3 dk)
  // ==========================================
  {
    id: "cult-01-kintsugi",
    title: "The Golden Seams of Kintsugi",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    topic: "Kintsugi Sanatı",
    desc: "Kırılan seramikleri altın tozu ve reçineyle onararak kusurları güzelliğe dönüştüren kadim Japon felsefesi.",
    content: "In a quiet ceramic studio in Kyoto, an artisan sits before a shattered porcelain teacup. Instead of sweeping the broken ceramic pieces into the trash bin, he carefully gathers each shard. He mixes natural tree lacquer with pure powdered gold, using a fine brush to bind the broken edges back together.\n\nThis traditional Japanese craft is called Kintsugi, meaning 'golden joinery.' Originating in the fifteenth century, it is guided by the philosophy of Wabi-Sabi, which finds true beauty in imperfection and impermanence. When the gold lacquer cures, the repaired teacup does not conceal its past trauma; rather, its glowing seams become the most precious, admired feature of the entire vessel.",
    target_words: ["shattered", "lacquer", "joinery", "imperfection"],
    target_vocabulary: [
      { word: "shattered", phonetic: "/ˈʃæt.əd/", turkish_meaning: "parçalanmış, kırılmış", context_sentence: "He collected the pieces of the shattered porcelain bowl." },
      { word: "lacquer", phonetic: "/ˈlæk.ər/", turkish_meaning: "vernik, doğal ağaç reçinesi", context_sentence: "Natural tree lacquer was dusted with gold powder." },
      { word: "joinery", phonetic: "/ˈdʒɔɪ.nər.i/", turkish_meaning: "birleştirme sanatı, doğrama", context_sentence: "Kintsugi translates literally as golden joinery." },
      { word: "imperfection", phonetic: "/ˌɪm.pəˈfek.ʃən/", turkish_meaning: "kusur, eksiklik", context_sentence: "Wabi-Sabi celebrates the beauty of natural imperfection." },
    ],
    comprehension_questions: [
      {
        question: "What precious material is mixed with tree lacquer in Kintsugi?",
        options: ["Crushed rubies", "Pure powdered gold", "Silver thread", "White pearl dust"],
        correct_answer_index: 1,
        explanation: "Kintsugi artisans mix natural urushi tree lacquer with powdered gold."
      },
      {
        question: "What does the Japanese philosophy of Wabi-Sabi celebrate?",
        options: ["Mechanical perfection and symmetry", "Finding beauty in imperfection, simplicity, and age", "Accumulating modern wealth", "Building colossal castles"],
        correct_answer_index: 1,
        explanation: "Wabi-Sabi finds beauty in natural impermanence, age, and imperfection."
      },
      {
        question: "How are the break lines treated on the repaired ceramic cup?",
        options: ["They are polished away to be invisible", "They are painted black", "They are highlighted with shining gold lines", "They are covered in fabric"],
        correct_answer_index: 2,
        explanation: "Rather than disguising fractures, Kintsugi illuminates them with radiant golden lines."
      },
    ],
  },
  {
    id: "cult-02-holi-festival",
    title: "Holi: The Joyous Festival of Colors",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
    topic: "Holi Renk Festivali",
    desc: "Baharın gelişini, dostluğu ve affetmeyi sokaklarda gökkuşağı renkli tozlarla kutlayan Hint bayramı.",
    content: "Every year in early spring, town squares across India explode with clouds of vibrant pink, turquoise, saffron, and emerald powders. This jubilant celebration is Holi, the ancient Hindu festival of colors and love. Marking the end of chilly winter, it welcomes the rebirth and blossoming of spring harvest.\n\nOn the morning of the festival, people of all ages fill the streets carrying bags of fragrant natural gulal powders made from dried flowers, turmeric, and herbs. Differences of social class, wealth, and age disappear as laughing neighbors throw colorful powders and splash water on each other. People embrace, forgive past disagreements, and share plates of sweet gujiya pastries in joyful harmony.",
    target_words: ["jubilant", "saffron", "fragrant", "disagreements"],
    target_vocabulary: [
      { word: "jubilant", phonetic: "/ˈdʒuː.bəl.ənt/", turkish_meaning: "coşkulu, sevinç dolu", context_sentence: "Jubilant crowds gathered in the city center for Holi." },
      { word: "saffron", phonetic: "/ˈsæf.rən/", turkish_meaning: "safran sarısı/turuncusu", context_sentence: "Puffs of bright saffron powder filled the air." },
      { word: "fragrant", phonetic: "/ˈfreɪ.ɡrənt/", turkish_meaning: "hoş kokulu", context_sentence: "They tossed fragrant herbal powders at each other." },
      { word: "disagreements", phonetic: "/ˌdɪs.əˈɡriː.mənts/", turkish_meaning: "anlaşmazlıklar, küslükler", context_sentence: "The festival offers a chance to forgive past disagreements." },
    ],
    comprehension_questions: [
      {
        question: "What season of the year does the Holi festival celebrate and welcome?",
        options: ["Cold mid-winter", "The arrival of spring and harvest rebirth", "The beginning of autumn", "The dry summer solstice"],
        correct_answer_index: 1,
        explanation: "Holi marks the departure of winter and welcomes the rebirth of spring."
      },
      {
        question: "What are the colorful 'gulal' powders traditionally made from?",
        options: ["Synthetic spray paint", "Dried flowers, turmeric, and natural herbs", "Ground colored glass", "Crushed sea corals"],
        correct_answer_index: 1,
        explanation: "Traditional gulal powders are crafted from dried blossoms, turmeric, and aromatic herbs."
      },
      {
        question: "What social barrier breaks down during the street celebrations of Holi?",
        options: ["Class, wealth, and age divisions disappear in unity", "People stop speaking to neighbors", "Only children are allowed outside", "Vehicles take over the sidewalks"],
        correct_answer_index: 0,
        explanation: "Social divisions of class, wealth, and age vanish as everyone celebrates together."
      },
    ],
  },
  {
    id: "cult-03-scottish-kilt",
    title: "The Tartan Weave: Scotland's Kilt Heritage",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    topic: "İskoç Kilt Geleneği",
    desc: "İskoç yaylalarında her klanın kendi renk ve çizgi desenini taşıyan yünlü kumaşı ve kilt geleneği.",
    content: "In the misty Scottish Highlands, bagpipes echo through mountain glens as men and women proudly wear traditional pleated kilts. The fabric of a kilt is made from heavy pure wool woven in crisscrossed horizontal and vertical bands of color, forming a distinctive checkered pattern called tartan.\n\nHistorically, each Scottish clan or family possessed its own unique tartan color combination, dyed with local heather, birch bark, and mosses. For mountain clansmen facing freezing drizzle and gale winds, the great kilt was an essential survival garment. By day, it provided durable weatherproof armor for trekking through peat bogs; by night, it was unbuckled and transformed into a warm woolen sleeping blanket by the campfire.",
    target_words: ["glens", "pleated", "checkered", "tartan"],
    target_vocabulary: [
      { word: "glens", phonetic: "/ɡlenz/", turkish_meaning: "dar dağ vadileri", context_sentence: "Bagpipe melodies echoed across the Scottish glens." },
      { word: "pleated", phonetic: "/ˈpliː.tɪd/", turkish_meaning: "plili, kıvrımlı", context_sentence: "The traditional kilt features neat pleated wool folds." },
      { word: "checkered", phonetic: "/ˈtʃek.əd/", turkish_meaning: "ekoseli, kareli", context_sentence: "Tartan is woven in distinctive checkered patterns." },
      { word: "tartan", phonetic: "/ˈtɑː.tən/", turkish_meaning: "tartan (İskoç klanlarına özgü ekoseli kumaş)", context_sentence: "Each clan is identified by its registered tartan weave." },
    ],
    comprehension_questions: [
      {
        question: "What is the woven checkered woolen pattern of a Scottish kilt called?",
        options: ["Batik", "Tartan", "Paisley", "Damask"],
        correct_answer_index: 1,
        explanation: "The iconic crisscrossed woolen fabric pattern is called tartan."
      },
      {
        question: "How did traditional clans dye the colors of their tartan yarns?",
        options: ["With imported chemical dyes", "With natural heather, birch bark, and local mosses", "With crushed sea snail shells", "With volcanic soot"],
        correct_answer_index: 1,
        explanation: "Highland clans utilized local plant matter like heather, birch bark, and moss for dyeing."
      },
      {
        question: "How did Highland warriors use the heavy kilt at night?",
        options: ["As a sailing flag", "As a warm woolen sleeping blanket by the campfire", "As a fishing net", "To build a temporary tent roof"],
        correct_answer_index: 1,
        explanation: "At night, clansmen unbuckled the thick wool garment to sleep wrapped in its warmth."
      },
    ],
  },
  {
    id: "cult-04-venice-carnival",
    title: "The Masquerade of Venice",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 142,
    coverImage: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80",
    topic: "Venedik Maskeli Karnavalı",
    desc: "Kanallar şehrinde aristokratlar ve halk arasındaki sınırları kaldıran gizemli porselen maskeler ve kostümler.",
    content: "During the cold days of February, the floating canal city of Venice transforms into an enchanting theatrical stage for the annual Carnival of Venice. Figures draped in luxurious silk capes, brocade jackets, and feathered tricorn hats glide silently across stone footbridges and board black gondolas.\n\nThe centerpiece of this historic festival is the Venetian mask. Centuries ago, rigid aristocratic social rules governed the Republic of Venice. Wearing masks like the white porcelain 'Bauta' or the golden 'Moretta' allowed citizens of all backgrounds to mingle in complete anonymity. Nobles and humble artisans could talk, dance, and share gossip without fear of social judgment, granting everyone absolute equality behind the mask.",
    target_words: ["theatrical", "brocade", "anonymity", "artisans"],
    target_vocabulary: [
      { word: "theatrical", phonetic: "/θiˈæt.rɪ.kəl/", turkish_meaning: "tiyatro gibi, dramatik", context_sentence: "Venice becomes a theatrical wonderland during Carnival." },
      { word: "brocade", phonetic: "/brəˈkeɪd/", turkish_meaning: "brokar (sırmalı ipek kumaş)", context_sentence: "Revelers dressed in opulent brocade gowns and capes." },
      { word: "anonymity", phonetic: "/ˌæn.əˈnɪm.ə.ti/", turkish_meaning: "isimsizlik, gizlilik", context_sentence: "Masks granted citizens total anonymity in public squares." },
      { word: "artisans", phonetic: "/ˈɑː.tɪ.zænz/", turkish_meaning: "zanaatkârlar, ustalar", context_sentence: "Nobles and humble artisans mingled freely as equals." },
    ],
    comprehension_questions: [
      {
        question: "In which Italian canal city does the famous historical masquerade carnival occur?",
        options: ["Rome", "Florence", "Venice", "Milan"],
        correct_answer_index: 2,
        explanation: "The historic masked carnival takes place throughout the canals and plazas of Venice."
      },
      {
        question: "Why did Venetians historically wear masks during the festival?",
        options: ["To protect their faces from mosquito bites", "To achieve complete anonymity and social equality", "To scare away sea creatures", "Because the law forbade showing hair"],
        correct_answer_index: 1,
        explanation: "Wearing masks granted anonymity, allowing citizens of different social ranks to interact equally."
      },
      {
        question: "What vehicle carries masked revelers across the water?",
        options: ["Submarines", "Black gondolas", "Steam locomotives", "Horse carriages"],
        correct_answer_index: 1,
        explanation: "Revelers in costume glide silently across the canals aboard traditional black gondolas."
      },
    ],
  },
  {
    id: "cult-05-tea-ceremony",
    title: "The Mindful Harmony of the Japanese Tea Ceremony",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    topic: "Japon Çay Seremonisi",
    desc: "Tatami odasında yeşil çay hazırlamanın her bir hareketinde sükunet, saygı ve anı yaşama sanatı (Chanoyu).",
    content: "Step through the sliding paper shoji screen of a traditional Japanese teahouse, and all the hurried noise of the modern world fades away. Guests sit gracefully on woven straw tatami mats while the tea master begins Chanoyu, the centuries-old 'Way of Tea'. Every movement—from boiling kettle water to wiping the bamboo scoop—is executed with mindful grace.\n\nThe master scoops vibrant emerald matcha tea powder into a ceramic bowl, pours steaming spring water from an iron kettle, and whisks it vigorously with a split bamboo chasen until a velvety froth forms. Guided by the principles of harmony, respect, purity, and tranquility, this quiet ritual reminds guests that every single encounter in life is unique and will never occur again.",
    target_words: ["tatami", "tranquility", "matcha", "froth"],
    target_vocabulary: [
      { word: "tatami", phonetic: "/təˈtɑː.mi/", turkish_meaning: "tatami (geleneksel Japon hasır minderi)", context_sentence: "Guests sat quietly upon woven tatami straw mats." },
      { word: "tranquility", phonetic: "/træŋˈkwɪl.ə.ti/", turkish_meaning: "sükunet, huzur", context_sentence: "The tea room radiated profound stillness and tranquility." },
      { word: "matcha", phonetic: "/ˈmætʃ.ə/", turkish_meaning: "maça (ince öğütülmüş yeşil çay tozu)", context_sentence: "He scooped bright green matcha into the ceramic bowl." },
      { word: "froth", phonetic: "/frɒθ/", turkish_meaning: "köpük", context_sentence: "He whisked the warm tea until a rich froth formed." },
    ],
    comprehension_questions: [
      {
        question: "What type of powdered green tea is prepared during the Chanoyu ceremony?",
        options: ["Oolong", "Matcha", "Chai", "Earl Grey"],
        correct_answer_index: 1,
        explanation: "Fine emerald matcha powder is whisked with hot spring water during Chanoyu."
      },
      {
        question: "What tool is used to whisk the tea into a velvety froth?",
        options: ["A silver metal fork", "A split bamboo whisk (chasen)", "A mechanical hand mixer", "A glass rod"],
        correct_answer_index: 1,
        explanation: "The master uses a handcrafted split bamboo whisk called a chasen."
      },
      {
        question: "What core philosophical ideals guide the Japanese tea ritual?",
        options: ["Speed, competition, and noise", "Harmony, respect, purity, and tranquility", "Secrecy, fear, and luxury", "Commerce, profit, and trade"],
        correct_answer_index: 1,
        explanation: "The ceremony is founded on four Zen principles: harmony, respect, purity, and tranquility."
      },
    ],
  },

  // ==========================================
  // LEVEL B (B1-B2, ~230-280 kelime, 4-5 dk)
  // ==========================================
  {
    id: "cult-06-silbo-gomero",
    title: "Silbo Gomero: The Whistled Language of the Ravines",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    topic: "La Gomera Islık Dili",
    desc: "Kanarya Adaları'nın derin vadilerinde sesin kilometrelerce yankılanmasını sağlayan UNESCO korumalı ıslık dili.",
    content: "The volcanic island of La Gomera, nestled in the Spanish Canary archipelago, is characterized by dramatic geological topography: steep basalt cliffs, dense cloud forests, and cavernous ravines called barrancos. For centuries before modern telecommunications, navigating these rugged canyons on foot took hours of exhausting climbing to deliver a simple verbal message to a neighbor on the opposite ridge.\n\nTo overcome these insurmountable geographic obstacles, the island's Guanche inhabitants and subsequent Spanish settlers created Silbo Gomero—a fully articulated whistled language. Silbo is not a simplistic set of pre-arranged signals; rather, it is a sophisticated phonetic transposition of spoken Spanish. Whistlers, known locally as silbadores, insert their fingers into their mouths and cup one hand to direct the pitch and resonance, transposing Spanish vowels into two whistling tones and twenty consonants into modulated frequencies.\n\nA skilled silbador can transmit complex sentences across mountain gorges over a distance of five kilometers. The piercing sound travels effortlessly above howling winds and rushing mountain torrents, carrying news of village celebrations, medical emergencies, or lost cattle. When cellular phones threatened the survival of this sonic heritage in the late twentieth century, the island community made Silbo Gomero mandatory in primary schools, earning recognition from UNESCO as an intangible cultural masterpiece.",
    target_words: ["topography", "insurmountable", "articulated", "transposition"],
    target_vocabulary: [
      { word: "topography", phonetic: "/təˈpɒɡ.rə.fi/", turkish_meaning: "topoğrafya, yüzey şekilleri", context_sentence: "The island's mountainous topography made foot travel arduous." },
      { word: "insurmountable", phonetic: "/ˌɪn.səˈmaʊn.tə.bəl/", turkish_meaning: "aşılamaz, başa çıkılamaz", context_sentence: "Deep ravines seemed insurmountable barriers for human voices." },
      { word: "articulated", phonetic: "/ɑːˈtɪk.jə.leɪ.tɪd/", turkish_meaning: "eklemli, açıkça ifade edilen", context_sentence: "Silbo is an articulated language expressing complete sentences." },
      { word: "transposition", phonetic: "/ˌtræn.spəˈzɪʃ.ən/", turkish_meaning: "aktarma, yer/biçim değiştirme", context_sentence: "It is a phonetic transposition of Spanish speech into whistle tones." },
    ],
    comprehension_questions: [
      {
        question: "Why was the whistled language of Silbo Gomero originally developed?",
        options: ["To mimic the songs of tropical parrots", "To communicate across steep volcanic ravines without walking for hours", "To hide secrets from invading pirate fleets", "As a religious chant for monks"],
        correct_answer_index: 1,
        explanation: "Deep ravines made traveling between ridges exhausting, prompting residents to whistle across canyons."
      },
      {
        question: "How far can a powerful whistle from a silbador carry across mountain gorges?",
        options: ["Only fifty meters", "Up to five kilometers", "Across the entire Atlantic Ocean", "Just two hundred meters"],
        correct_answer_index: 1,
        explanation: "High-frequency whistles can pierce through wind to travel up to five kilometers."
      },
      {
        question: "How did the island government prevent the language from going extinct in modern times?",
        options: ["By banning mobile phones entirely", "By making Silbo instruction mandatory in local primary schools", "By hiring actors to whistle on radio", "By keeping it in a museum book"],
        correct_answer_index: 1,
        explanation: "The island made learning Silbo Gomero compulsory in primary schools to preserve the cultural tradition."
      },
    ],
  },
  {
    id: "cult-07-dia-de-los-muertos",
    title: "Día de los Muertos: Welcoming the Ancestors",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80",
    topic: "Meksika Ölüler Günü",
    desc: "Ölümü yasla değil, kadife çiçekleri, şeker kurukafalar ve ofrenda sunaklarıyla kutlayan köklü Meksika bayramı.",
    content: "Every year on the first two days of November, households across Mexico transform into vibrant sanctuaries of love and remembrance during Día de los Muertos—the Day of the Dead. Far from a somber or frightening occasion, this indigenous Mesoamerican tradition, intertwined with Catholic All Saints' Day, views death not as an absolute end, but as a natural chapter in the cyclical continuum of life.\n\nFamilies construct elaborate home altars called ofrendas, draped in purple and orange papel picado (perforated paper banners). The altars are laden with framed portraits of deceased relatives, favorite dishes like rich mole negro, sweet pan de muerto bread, and glasses of water to quench the thirsty spirits after their long metaphysical journey. Paths of brilliant golden cempasúchil (marigold) petals are scattered from doorways to the altar; their pungent scent and radiant color guide wandering souls back home.\n\nIn public plazas and candlelit cemeteries, participants paint their faces into artistic calaveras (sugar skull motifs) resembling Catrina, a satirical skeleton lady created by illustrator José Guadalupe Posada. As musicians play acoustic brass and guitars, families sit beside ancestral graves sharing affectionate anecdotes, demonstrating that loved ones never truly perish as long as they are cherished in living memory.",
    target_words: ["continuum", "ofrendas", "cempasúchil", "satirical"],
    target_vocabulary: [
      { word: "continuum", phonetic: "/kənˈtɪn.ju.əm/", turkish_meaning: "süreklilik, kesintisiz döngü", context_sentence: "Death is viewed as part of life's endless cyclical continuum." },
      { word: "ofrendas", phonetic: "/ɒˈfren.dəz/", turkish_meaning: "ofrenda (hatıra ve adak sunakları)", context_sentence: "Family ofrendas are decorated with photos, candles, and food." },
      { word: "cempasúchil", phonetic: "/ˌsem.pəˈsuː.tʃɪl/", turkish_meaning: "kadife çiçeği (ölüler günü sarı çiçeği)", context_sentence: "Golden cempasúchil petals guide ancestral spirits back to their homes." },
      { word: "satirical", phonetic: "/səˈtɪr.ɪ.kəl/", turkish_meaning: "hicivsel, alaylı, yergili", context_sentence: "La Catrina was conceived as a satirical skeleton caricature." },
    ],
    comprehension_questions: [
      {
        question: "How do Mexican families perceive death during Día de los Muertos?",
        options: ["As a terrifying punishment", "As a natural, joyous continuation of life where spirits visit loved ones", "As an occasion to stay locked inside", "As an ancient military victory"],
        correct_answer_index: 1,
        explanation: "Death is perceived not with mournful dread, but as a cyclical continuum where ancestors return to visit."
      },
      {
        question: "Why are bright golden marigold petals (cempasúchil) scattered along doorways?",
        options: ["To feed birds", "To guide wandering ancestral souls with their vibrant color and scent", "To make perfume oil", "To prevent dust from entering"],
        correct_answer_index: 1,
        explanation: "The fragrant aroma and blazing hue of cempasúchil are believed to guide returning souls to altars."
      },
      {
        question: "Who was the satirical skeleton figure 'La Catrina' created by?",
        options: ["Frida Kahlo", "Illustrator José Guadalupe Posada", "Diego Rivera", "Hernán Cortés"],
        correct_answer_index: 1,
        explanation: "The iconic Catrina skeleton figure was created by Mexican illustrator José Guadalupe Posada."
      },
    ],
  },
  {
    id: "cult-08-living-root-bridges",
    title: "The Living Root Bridges of Meghalaya",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    topic: "Meghalaya Yaşayan Kök Köprüler",
    desc: "Hindistan'ın en yağışlı bölgesinde Khasi halkının Ficus ağacı köklerini örerek nesiller boyu inşa ettiği yaşayan köprüler.",
    content: "In the subtropical rainforests of Meghalaya in northeastern India—one of the wettest geographical locations on Earth—monsoon rains swell mountain streams into roaring, impassable torrents for months on end. Conventional timber bridges rot away in the oppressive humidity, while modern steel bridges rust rapidly. To maintain pedestrian trade routes between cliffside villages, the indigenous Khasi and Jaintia tribes developed an astonishing technique of living bio-engineering.\n\nKnown locally as Jingkieng Jri, these living root bridges are grown from the aerial roots of the Ficus elastica (Indian rubber fig tree). When a young sapling grows along a riverbank, villagers guide its flexible secondary roots through hollowed-out betel nut palm trunks positioned horizontally across the gorge. The hollow trunks shield the tender roots from torrential rains while steering their growth toward the opposing bank.\n\nUpon reaching the opposite shore, the roots anchor deeply into the soil and limestone crevices. Over decades of patient care, passing villagers continually intertwine and weave the growing roots together. Unlike inanimate bridges that weaken with age and load stress, a living root bridge grows stronger every year as the living wood thickens and anastomoses (grafts together). Some magnificent double-decker root bridges are over five hundred years old, capable of supporting fifty people simultaneously while thriving amid raging monsoon waters.",
    target_words: ["oppressive", "sapling", "intertwine", "anastomoses"],
    target_vocabulary: [
      { word: "oppressive", phonetic: "/əˈpres.ɪv/", turkish_meaning: "boğucu, bunaltıcı (nem/hava)", context_sentence: "Timber bridges quickly decayed under oppressive tropical humidity." },
      { word: "sapling", phonetic: "/ˈsæp.lɪŋ/", turkish_meaning: "fidan, genç ağaç", context_sentence: "The root bridge began beside a Ficus elastica sapling." },
      { word: "intertwine", phonetic: "/ˌɪn.təˈtwaɪn/", turkish_meaning: "birbirine sarmak, örmek", context_sentence: "Villagers intertwine living root tendrils across bamboo frames." },
      { word: "anastomoses", phonetic: "/əˌnæs.təˈməʊ.siːz/", turkish_meaning: "kaynaşma, birbirine aşılanarak birleşme", context_sentence: "The root tissues anastomose into a monolithic living bridge." },
    ],
    comprehension_questions: [
      {
        question: "What species of tree is trained to create the living root bridges of Meghalaya?",
        options: ["Giant California Redwood", "Indian rubber fig tree (Ficus elastica)", "Norway Spruce", "Weeping Willow"],
        correct_answer_index: 1,
        explanation: "Khasi tribes utilize the aerial root systems of the Ficus elastica (Indian rubber tree)."
      },
      {
        question: "Why do living root bridges outperform steel or timber structures in Meghalaya?",
        options: ["They are cheaper to import from overseas", "Timber rots and steel rusts in the extreme humidity, whereas living roots grow stronger", "They can be disassembled overnight", "They glow in the dark"],
        correct_answer_index: 1,
        explanation: "Extreme moisture destroys steel and timber, but living roots self-strengthen and thicken over centuries."
      },
      {
        question: "How long does it take for a newly guided root bridge to become fully functional?",
        options: ["Only two days", "Two to three weeks", "Several decades of continuous guidance and growth", "Over two thousand years"],
        correct_answer_index: 2,
        explanation: "Training and weaving aerial roots across a wide gorge requires decades of multi-generational care."
      },
    ],
  },
  {
    id: "cult-09-tuareg-blue-veil",
    title: "The Indigo Veil: Nomads of the Sahara",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    topic: "Tuareglerin Mavi Örtüsü",
    desc: "Büyük Sahra Çölü'nde kum fırtınalarına karşı çivit mavisi örtüleri ve matrilinear toplum yapısıyla 'Mavi İnsanlar'.",
    content: "Roaming the immense, windswept dunes of the Sahara Desert across Niger, Mali, and Algeria, the Tuareg people have preserved a nomadic lifestyle adapted to the harshest arid climate on Earth. Known historically as the 'Blue People of the Sahara,' their moniker originates from their distinctive tagelmust—an indigo-dyed cotton veil measuring up to fifteen meters in length, wound meticulously around the head and lower face.\n\nBecause desert water is precious and scarce, the indigo pigment is pounded dry into the woven cloth with heavy wooden mallets rather than boiled in vats. Over time, the loose indigo dye rubs onto the wearer's skin, leaving a permanent blue tint considered a mark of noble lineage. Functionally, the tagelmust is indispensable: it protects the eyes and respiratory system from blinding sandstorms, reflects intense solar ultraviolet rays, and retains exhaled moisture in dry desert winds.\n\nCulturally, Tuareg society stands out in the region for its matrilineal traditions and unique social etiquette. Unlike many neighboring conservative cultures where women are veiled, among the Tuareg, only adult men wear the veil in public. A man rarely removes his tagelmust even in front of intimate family members. Women hold land ownership, transmit clan heritage, manage household economics, and compose poetry, embodying a proud culture of desert autonomy.",
    target_words: ["moniker", "tagelmust", "matrilineal", "etiquette"],
    target_vocabulary: [
      { word: "moniker", phonetic: "/ˈmɒn.ɪ.kər/", turkish_meaning: "lakap, unvan", context_sentence: "Their moniker 'The Blue Men' reflects their indigo garments." },
      { word: "tagelmust", phonetic: "/tæɡˈəl.mʌst/", turkish_meaning: "tagelmust (Tuareg erkeklerinin çivit mavisi baş ve yüz örtüsü)", context_sentence: "He adjusted his linen tagelmust against the sandstorm." },
      { word: "matrilineal", phonetic: "/ˌmæt.rɪˈlɪn.i.əl/", turkish_meaning: "anaerkil, soyun anne üzerinden yürüdüğü", context_sentence: "Tuareg clans trace lineage and property through matrilineal lines." },
      { word: "etiquette", phonetic: "/ˈet.ɪ.ket/", turkish_meaning: "görgü kuralları, nezaket", context_sentence: "Nomadic etiquette dictates that adult men keep their face covered." },
    ],
    comprehension_questions: [
      {
        question: "Why does the skin of Tuareg men historically take on a bluish tint?",
        options: ["They drink blue cactus tea", "Dry indigo dye from their long tagelmust veils rubs into their skin", "They tattoo their entire bodies", "They bathe in blue river minerals"],
        correct_answer_index: 1,
        explanation: "Dry-pounded indigo dye from the cotton tagelmust rubs onto the skin, leaving a deep blue patina."
      },
      {
        question: "Who wears the iconic face veil (tagelmust) in Tuareg society?",
        options: ["Only newborn babies", "Adult men exclusively", "Only unmarried women", "Only elderly village chiefs"],
        correct_answer_index: 1,
        explanation: "In Tuareg culture, it is the adult men who wear the protective face veil in public."
      },
      {
        question: "What unique social structure characterizes Tuareg family organization?",
        options: ["Strict patriarchal military rule", "Matrilineal heritage where women own property and trace clan lineage", "Total isolation without community ties", "Monastic religious communes"],
        correct_answer_index: 1,
        explanation: "Tuareg society preserves matrilineal customs where women hold property and clan ancestry."
      },
    ],
  },
  {
    id: "cult-10-nordic-ice-bath",
    title: "The Frigid Plunge: The Nordic Winter Bathing Ritual",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Viking Buz Banyosu Geleneği",
    desc: "Karanlık İskandinav kışlarında saunadan çıkıp buzlu göllere dalanların zihinsel berraklık ve sisu felsefesi.",
    content: "In the snowbound winter landscapes of Finland, Sweden, and Norway, daylight dwindles to a meager few hours, with temperatures plunging far below freezing. Rather than retreating indoors behind sealed radiators, Nordic peoples embrace avanto—the ancient practice of cutting an open swimming hole into thick lake ice and plunging into water hovering at one degree Celsius.\n\nThis icy immersion is part of a therapeutic thermal contrast cycle deeply woven into Scandinavian cultural identity. Bathers first spend fifteen minutes inside a wood-burning sauna heated to ninety degrees Celsius, inhaling aromatic birch steam (löyly) while sweating out physical stress. Stepping out into the crisp arctic air, they walk calmly across the snow and lower themselves into the black freezing waters of the lake.\n\nThe instantaneous thermal shock triggers a massive surge of norepinephrine, dopamine, and endorphins, causing peripheral blood vessels to constrict and funnel warm oxygenated blood to core vital organs. Bathers emerge from the icy water with flushed skin, feeling an exhilarating euphoria and profound mental clarity. More than physical wellness, winter bathing reflects the Finnish philosophy of sisu—an indomitable mental resilience and stoic determination to confront adversity with calm fortitude.",
    target_words: ["avanto", "therapeutic", "norepinephrine", "indomitable"],
    target_vocabulary: [
      { word: "avanto", phonetic: "/əˈvæn.təʊ/", turkish_meaning: "avanto (buz tabakasında açılan yüzme deliği)", context_sentence: "He calmly submerged his shoulders into the dark avanto hole." },
      { word: "therapeutic", phonetic: "/ˌθer.əˈpjuː.tɪk/", turkish_meaning: "terapötik, tedavi edici", context_sentence: "The hot-cold contrast provides profound therapeutic recovery." },
      { word: "norepinephrine", phonetic: "/ˌnɔː.ep.ɪˈnef.rɪn/", turkish_meaning: "noradrenalin (dikkati ve dolaşımı artıran hormon)", context_sentence: "Ice immersion triggers a rush of norepinephrine through the brain." },
      { word: "indomitable", phonetic: "/ɪnˈdɒm.ɪ.tə.bəl/", turkish_meaning: "boyun eğmez, yılmaz", context_sentence: "The ritual embodies the indomitable Finnish spirit of sisu." },
    ],
    comprehension_questions: [
      {
        question: "What is an 'avanto' in Finnish winter culture?",
        options: ["A wooden skis manufacturer", "A swimming hole carved directly into thick lake ice", "A hot berry drink served after skiing", "A traditional knitted sweater"],
        correct_answer_index: 1,
        explanation: "Avanto refers to an open hole cut into frozen lake or sea ice for winter swimming."
      },
      {
        question: "What psychological state do bathers typically experience after emerging from ice water?",
        options: ["Immediate panic and shivering sleep", "Exhilarating mental euphoria, calm focus, and reduced stress", "Severe short-term memory loss", "Paralyzing fear of water"],
        correct_answer_index: 1,
        explanation: "The thermal contrast releases neurotransmitters like dopamine and endorphins, fostering euphoria and calm clarity."
      },
      {
        question: "What Finnish cultural concept describes stoic courage and resilience in the face of adversity?",
        options: ["Hygge", "Lagom", "Sisu", "Fika"],
        correct_answer_index: 2,
        explanation: "Sisu represents the indomitable Finnish ethos of grit, perseverance, and quiet inner resilience."
      },
    ],
  },

  // ==========================================
  // LEVEL C (C1-C2, ~330-380 kelime, 5-6 dk)
  // ==========================================
  {
    id: "cult-11-marathon-des-sables",
    title: "Marathon des Sables: The Crucible of Human Endurance",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    topic: "Sahra Çölü Maratonu ve İrade",
    desc: "Kavurucu Sahra sıcağında 250 kilometrelik çöl arazisini sırt çantasıyla aşan koşucuların zihinsel sınırları.",
    content: "Widely regarded by ultramarathoners as the most grueling footrace on Earth, the Marathon des Sables (MdS) subjects competitors to a multi-stage, two-hundred-and-fifty-kilometer pilgrimage across the scorched expanse of the Moroccan Sahara. Conceived in 1986 by French concert promoter Patrick Bauer—who had previously crossed three hundred and fifty kilometers of uninhabited desert solo—the race tests the absolute boundaries of human physiologic stamina and psychic fortitude under conditions that would break an unprepared mind.\n\nOver seven grueling days, competitors carry all their survival gear, freeze-dried rations, medical supplies, and sleeping bags within backpacks weighing up to twelve kilograms. Race organizers ration water at checkpoints, but participants must navigate shifting sand dunes (ergs), desiccated salt flats (chotts), and jagged rocky ridges (djebels) while ambient temperatures regularly surpass fifty degrees Celsius. A single disorientation amid a blinding sandstorm can prove lethal, as famously evidenced in 1994 when Italian runner Mauro Prosperi lost his way during an eight-hour storm and survived for nine days by drinking bat blood and morning dew before reaching an Algerian nomad outpost.\n\nYet, the essence of the Marathon des Sables transcends mere masochistic athletic exertion; it is a profound philosophical crucible. In the suffocating, solitary silence of the desert, runners experience complete psychological ego dissolution. Stripped of consumerist comforts and societal status symbols, participants confront their most vulnerable vulnerabilities. Deep bonds of unconditional camaraderie form among multinational tent-mates, who tenderly dress each other's blackened toenails and blistering foot ulcers every evening. MdS demonstrates that human endurance is fundamentally psychological rather than musculoskeletal—a testament to the sovereign power of the human will to transcend physical agony through shared communal empathy.",
    target_words: ["grueling", "psychic", "desiccated", "camaraderie"],
    target_vocabulary: [
      { word: "grueling", phonetic: "/ˈɡruː.ə.lɪŋ/", turkish_meaning: "aşırı yorucu, yıpratıcı", context_sentence: "The runners endured a grueling week in the Sahara dunes." },
      { word: "psychic", phonetic: "/ˈsaɪ.kɪk/", turkish_meaning: "ruhsal, zihinsel", context_sentence: "The race demanded immense psychic fortitude and resilience." },
      { word: "desiccated", phonetic: "/ˈdes.ɪ.keɪ.tɪd/", turkish_meaning: "kurutulmuş, nemsiz, çorak", context_sentence: "They marched across vast desiccated salt flats under midday sun." },
      { word: "camaraderie", phonetic: "/ˌkæm.əˈrɑː.dər.i/", turkish_meaning: "yoldaşlık, kardeşlik bağı", context_sentence: "Unconditional camaraderie sustained the runners in the camp." },
    ],
    comprehension_questions: [
      {
        question: "How much total distance do runners cover during the Marathon des Sables?",
        options: ["42 kilometers", "100 kilometers", "Approximately 250 kilometers over seven days", "1,000 miles"],
        correct_answer_index: 2,
        explanation: "Competitors cover approximately 250 kilometers (roughly 155 miles) across several desert stages."
      },
      {
        question: "What survival protocol makes the Marathon des Sables a self-sufficient race?",
        options: ["Runners stay in air-conditioned hotels each night", "Competitors must carry all their food, sleeping gear, and medical kits on their backs", "Support cars carry backpacks for everyone", "Runners only run after midnight"],
        correct_answer_index: 1,
        explanation: "Participants are self-sufficient, carrying their own freeze-dried food, bedding, and supplies in backpacks."
      },
      {
        question: "What core philosophical insight emerges from the extreme conditions of the race?",
        options: ["Athletes realize that money can buy anything", "Endurance is fundamentally psychological, sustained by will and communal camaraderie", "Solo competition is superior to teamwork", "Deserts are unlivable voids"],
        correct_answer_index: 1,
        explanation: "The text emphasizes that endurance is psychological and nurtured by selfless camaraderie and mental resolve."
      },
    ],
  },
  {
    id: "cult-12-bajau-sea-nomads",
    title: "The Sea Nomads: Physiological Adaptations of the Bajau",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    topic: "Bajau Deniz Göçebeleri",
    desc: "Güneydoğu Asya mercan denizlerinde yaşayan ve genetik olarak büyümüş dalaklarıyla 70 metreye dalan yerli halk.",
    content: "For over a thousand years, the Bajau Laut—an indigenous maritime people inhabiting the coral seas spanning Indonesia, Malaysia, and the Philippines—have spent their entire existence upon the ocean. Living aboard handcrafted wooden houseboats called lepa-lepa or within stilt villages erected over shallow coral reefs, many elderly Bajau report feeling 'land-sick' whenever they step ashore. Renowned as the world’s ultimate freedivers, Bajau spearfishers descend to depths exceeding seventy meters equipped only with handmade wooden goggles and lead weights, stalking reef fish for up to thirteen minutes on a single breath.\n\nIn 2018, an evolutionary genetics team led by Dr. Melissa Ilardo from the University of Copenhagen demonstrated that this aquatic lifestyle has induced genuine natural selection in the Bajau genome. Utilizing comparative ultrasound imaging, Ilardo discovered that the Bajau possess spleens that are fifty percent larger than those of neighboring terrestrial populations like the Saluan—even among Bajau individuals who have never freedived.\n\nWhen a human initiates a breath-hold dive into cold water, the mammalian dive reflex constricts peripheral blood vessels and triggers splenic contraction, squeezing oxygenated red blood cells stored within the spleen directly into the circulatory bloodstream. The Bajau’s genetically enlarged spleens act as biological scuba tanks, boosting circulating oxygen capacity by up to ten percent during deep descents.\n\nGenomic sequencing pinpointed mutations in the PDE10A gene, which regulates thyroid hormone production and determines spleen size. This marks the earliest documented example of natural selection adapting human physiology to deep marine diving—a stunning reminder that cultural immersion into maritime ecosystems can guide the trajectory of biological evolution.",
    target_words: ["maritime", "ultrasound", "mammalian", "genomic"],
    target_vocabulary: [
      { word: "maritime", phonetic: "/ˈmær.ɪ.taɪm/", turkish_meaning: "denizcilikle ilgili, bahri", context_sentence: "The Bajau maintain a maritime nomadic existence on the reefs." },
      { word: "ultrasound", phonetic: "/ˈʌl.trə.saʊnd/", turkish_meaning: "ultrason (ses dalgalarıyla iç organ görüntüleme)", context_sentence: "Ultrasound scans revealed extraordinarily enlarged internal spleens." },
      { word: "mammalian", phonetic: "/məˈmeɪ.li.ən/", turkish_meaning: "memelilere ait", context_sentence: "The mammalian dive reflex slows heartbeat and constricts vessels." },
      { word: "genomic", phonetic: "/dʒɪˈnəʊ.mɪk/", turkish_meaning: "genomik, genoma ait", context_sentence: "Genomic sequencing revealed positive natural selection in the PDE10A gene." },
    ],
    comprehension_questions: [
      {
        question: "What physical organ is genetically enlarged in Bajau freedivers compared to land-dwelling populations?",
        options: ["The lungs", "The spleen", "The heart", "The liver"],
        correct_answer_index: 1,
        explanation: "Ultrasound studies revealed that Bajau individuals possess spleens 50% larger than neighboring groups."
      },
      {
        question: "How does an enlarged spleen assist Bajau hunters during prolonged deep breath-hold dives?",
        options: ["It produces freshwater inside the stomach", "It contracts to inject an extra reserve of oxygen-rich red blood cells into circulation", "It changes their blood to blue", "It allows them to breathe through their ears"],
        correct_answer_index: 1,
        explanation: "Splenic contraction pumps a reservoir of oxygenated red blood cells into the blood during dives."
      },
      {
        question: "What gene was linked to larger spleen size and thyroid regulation in the Bajau genome?",
        options: ["BRCA1", "PDE10A", "FOXP2", "CRISPR-9"],
        correct_answer_index: 1,
        explanation: "Mutations in the PDE10A gene were shown to regulate thyroid hormones controlling spleen volume."
      },
    ],
  },
  {
    id: "cult-13-buddhist-sand-mandala",
    title: "The Ephemeral Mandalas: Impermanence and Sacred Tibetan Art",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
    topic: "Budist Kum Mandalasının Yok Edilişi",
    desc: "Haftalar süren sabırla renkli kum tanelerinden inşa edilen ve tamamlandığı an nehre süpürülen mandalanın felsefesi.",
    content: "Inside the incense-filled meditation halls of Tibetan Buddhist monasteries, monks dressed in saffron robes engage in one of the world's most painstakingly meticulous artistic rituals: the creation of the Dul-Tson-Kyil-Khor, or sand mandala. For several weeks, four monks sit hunched over a flat wooden platform, chanting sacred mantras while laying millions of grains of dyed mineral sand into an intricate geometric blueprint depicting the celestial palace of an enlightened deity.\n\nUtilizing a traditional narrow metal funnel called a chak-pur, the artist taps the ridged surface with a horn to release a controlled stream of microscopic sand grains. Layer upon layer, complex cosmological labyrinths, concentric gates, lotus wheels, and radiant guardian deities emerge with mathematical perfection. The creation requires absolute mindfulness, stillness, and breath control; a single sneeze or erratic twitch could ruin weeks of labor.\n\nHowever, the climax of the ritual occurs immediately upon its completion. After consecrating the pristine masterpiece with prayers, the senior lama takes a flat silk brush and systematically sweeps the exquisite mandala from the edges inward, instantly reducing the complex palace into a swirl of grey sand. There is no mourning or sorrow in this gesture.\n\nThe mixed sands are collected in a ceremonial porcelain urn and carried to a flowing river, where they are released into the current to disperse healing energies across the oceans. This deliberate dismantling embodies the core Buddhist doctrine of anicca—universal impermanence. It teaches that attachment to material forms inevitably breeds suffering, reminding observers that all composite things in existence, whether an artistic marvel or a human life, must peacefully dissolve.",
    target_words: ["meticulous", "chak-pur", "consecrating", "impermanence"],
    target_vocabulary: [
      { word: "meticulous", phonetic: "/məˈtɪk.jə.ləs/", turkish_meaning: "titiz, kılı kırk yaran", context_sentence: "Creating the sand mandala requires meticulous concentration." },
      { word: "chak-pur", phonetic: "/tʃækˈpʊər/", turkish_meaning: "çak-pur (kum mandalasında kullanılan yivli metal huni)", context_sentence: "The monk tapped the chak-pur to release tiny grains of sand." },
      { word: "consecrating", phonetic: "/ˈkɒn.sɪ.kreɪ.tɪŋ/", turkish_meaning: "kutsayarak adama", context_sentence: "Consecrating the mandala infused the space with healing prayers." },
      { word: "impermanence", phonetic: "/ɪmˈpɜː.mə.nəns/", turkish_meaning: "geçicilik, fânilik", context_sentence: "Sweeping away the sand symbolizes the universal truth of impermanence." },
    ],
    comprehension_questions: [
      {
        question: "What instrument is used by Tibetan monks to dispense grains of colored sand with precision?",
        options: ["A fine squirrel-hair brush", "A ridged metal funnel called a chak-pur", "A silver needle", "A bamboo straw"],
        correct_answer_index: 1,
        explanation: "Monks tap a traditional ridged funnel called a chak-pur to release precise sand streams."
      },
      {
        question: "What dramatic action occurs immediately after the mandala is completed?",
        options: ["It is framed behind glass and sold to museums", "The master sweeps the entire sand artwork into a pile with a brush", "It is set on fire", "It is left untouched for a thousand years"],
        correct_answer_index: 1,
        explanation: "The senior lama sweeps away the magnificent creation to illustrate the illusion of permanence."
      },
      {
        question: "Where are the collected sands finally taken?",
        options: ["Buried deep in the desert sands", "Scattered into a flowing river to bless oceanic currents", "Kept in golden urns inside the altar", "Given to visiting tourists"],
        correct_answer_index: 1,
        explanation: "The sand is released into a river, symbolizing the flow of life and sharing blessings."
      },
    ],
  },
  {
    id: "cult-14-tarahumara-runners",
    title: "The Born Runners: Kinetic Philosophy of the Rarámuri",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "B",
    cefr: "B1-B2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    topic: "Tarahumara Kabilesinin Ultra Koşusu",
    desc: "Meksika'nın Bakır Kanyonları'nda eski otomobil lastiğinden sandaletlerle yüzlerce kilometre koşan 'ayaklarıyla yürüyenler'.",
    content: "Deep within the inaccessible, labyrinthine ravines of the Copper Canyons (Barrancas del Cobre) in northwestern Mexico live the Rarámuri—commonly known to the outside world as the Tarahumara. Their native autonym translates poetically as 'those who walk well' or 'the light-footed ones.' In an environment where sheer vertical cliffs separate isolated homesteads, running is not an athletic pursuit or leisure hobby; it is the fundamental medium of communication, cultural cohesion, and spiritual prayer.\n\nRenowned for their supernatural aerobic stamina, Rarámuri runners routinely cover distances of two hundred kilometers over rugged boulder-strewn canyon trails in a single push—often lasting over thirty continuous hours. Astonishingly, they eschew high-tech cushioned athletic footwear, running instead in huaraches: simple flat sandals crafted from discarded automobile tire rubber strapped to the foot with leather thongs. Biomechanically, this minimalist footwear fosters a natural forefoot strike and upright posture, virtually eliminating the debilitating joint injuries common among modern Western marathoners.\n\nFueling these monumental distances is a remarkably humble traditional diet centered upon pinole (ground roasted corn mixed with water, chia seeds, and unrefined cane sugar) and home-brewed tesgüino corn beer. The communal race known as the rarajípari embodies their social ethos: teams of men run through the night kicking a wooden ball through mountain gorges, accompanied by singing women who hold flaming pine torches to illuminate the narrow cliff pathways.\n\nTo the Rarámuri, running is a form of kinetic meditation that honors the sacred reciprocity between humans and the natural earth. By rejecting competitive egoism and approaching movement with joyous communal serenity, they show that the human body evolved as an exquisite endurance instrument designed to find peace in continuous motion.",
    target_words: ["labyrinthine", "autonym", "huaraches", "reciprocity"],
    target_vocabulary: [
      { word: "labyrinthine", phonetic: "/ˌlæb.əˈrɪn.θaɪn/", turkish_meaning: "labirent gibi karmaşık", context_sentence: "They navigate the labyrinthine ravines of the Copper Canyons." },
      { word: "autonym", phonetic: "/ˈɔː.tə.nɪm/", turkish_meaning: "otonomi, bir topluluğun kendine verdiği ad", context_sentence: "Their native autonym Rarámuri means 'those who walk well'." },
      { word: "huaraches", phonetic: "/wəˈrɑː.tʃɪz/", turkish_meaning: "huaraches (lastik tabanlı geleneksel sandalet)", context_sentence: "They sprint hundreds of miles wearing minimalist huaraches." },
      { word: "reciprocity", phonetic: "/ˌres.ɪˈprɒs.ə.ti/", turkish_meaning: "karşılıklılık, mütekabiliyet", context_sentence: "Their running honors cosmic reciprocity with the earth." },
    ],
    comprehension_questions: [
      {
        question: "Where do the indigenous Rarámuri people live?",
        options: ["In the Amazon Rainforest", "In the rugged Copper Canyons of northwestern Mexico", "On high Andean mountain plateaus", "Along the Pacific coastline of Chile"],
        correct_answer_index: 1,
        explanation: "The Rarámuri inhabit the steep, secluded Copper Canyons (Barrancas del Cobre) in Chihuahua, Mexico."
      },
      {
        question: "What type of footwear do Rarámuri ultramarathoners wear during long mountain runs?",
        options: ["Thick gel-cushioned running sneakers", "Huaraches made from recycled tire tread and leather thongs", "Heavy steel-toed leather boots", "Woolen socks without soles"],
        correct_answer_index: 1,
        explanation: "They run in huaraches, simple minimalist sandals made from tire rubber and leather strips."
      },
      {
        question: "What is the staple energy food used by the runners to fuel multi-day journeys?",
        options: ["Synthetic energy gels", "Pinole (roasted ground corn meal with chia seeds)", "Raw beef jerky", "Canned chocolate drinks"],
        correct_answer_index: 1,
        explanation: "They consume pinole, a traditional drink made of roasted ground maize mixed with water and chia seeds."
      },
    ],
  },
  {
    id: "cult-15-whang-od-kalinga",
    title: "Whang-Od and the Living Tapestry of Kalinga Batok",
    category: "human_culture",
    categoryName: "İnsan & Kültür Mirası",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    topic: "Whang-Od ve Kalinga Dövme Sanatı",
    desc: "Filipinler'in dağ köyü Buscalan'da narenciye dikeni ve is kömürüyle bin yıllık batok dövme mirasını yaşatan son mambabatok.",
    content: "Perched high in the mist-shrouded Cordillera Central mountains of northern Luzon in the Philippines sits Buscalan, an isolated village accessible only after navigating winding roads and a grueling trek up steep terraced mountain trails. Here resides Maria Oggay, venerated universally by her tribal moniker Apo Whang-Od. Over a century old, Whang-Od is celebrated as the oldest surviving mambabatok—the traditional master tattoo practitioner of the indigenous Butbut Kalinga clan.\n\nFor over a thousand years, Kalinga batok was an indelible rite of passage, spiritual armor, and visual badge of honor. Historically, men received intricate geometric tattoos across their chests and arms only after proving valor as headhunting warriors defending their tribal territory. For women, elaborate lace-like geometric patterns across arms and necks served as expressions of maturity, fertility, and timeless beauty—designs believed to accompany the spirit into the afterlife when gold jewelry had to be left behind.\n\nWhang-Od practices the ancient manual hand-tapping technique unchanged by modernity. Her tools are remarkably elemental: a thorn harvested from a wild pomelo or calamansi citrus tree, attached to a flexible bamboo stick. Dipping the thorn into an organic ink mixture of soot scraped from cooking pots and water, she taps the pigment deep into the dermis by rhythmically striking the bamboo with a heavier stick at one hundred beats per minute, creating permanent sacred geometry.\n\nBecause Kalinga tradition mandates that the sacred lineage of batok can only be transmitted through bloodline descendants—lest the tattoos lose their spiritual efficacy and cause illness—Whang-Od has broken centuries of gender-exclusive customs by apprenticing her grandnieces Grace and Elyang. Through this transmission, she ensures that this ancient visual language of ancestral resilience and tribal identity will not vanish into the mists of time.",
    target_words: ["venerated", "indelible", "elemental", "efficacy"],
    target_vocabulary: [
      { word: "venerated", phonetic: "/ˈven.ər.eɪ.tɪd/", turkish_meaning: "büyük saygı duyulan, hürmet gören", context_sentence: "Apo Whang-Od is venerated across the Philippine archipelago." },
      { word: "indelible", phonetic: "/ɪnˈdel.ə.bəl/", turkish_meaning: "silinmez, kalıcı", context_sentence: "Batok tattoos represent an indelible testament to tribal courage." },
      { word: "elemental", phonetic: "/ˌel.ɪˈmen.təl/", turkish_meaning: "doğal, ilkel, temel", context_sentence: "Her tools are elemental: a citrus thorn, soot, and bamboo." },
      { word: "efficacy", phonetic: "/ˈef.ɪ.kə.si/", turkish_meaning: "etkinlik, manevi tesir gücü", context_sentence: "Bloodline transmission is believed to preserve spiritual efficacy." },
    ],
    comprehension_questions: [
      {
        question: "What traditional indigenous art form does Apo Whang-Od practice in Buscalan?",
        options: ["Bamboo flute carving", "Batok (traditional hand-tapped indigenous tattooing)", "Gold filigree jewelry making", "Stone sculpture carving"],
        correct_answer_index: 1,
        explanation: "Apo Whang-Od is the legendary master of traditional Kalinga hand-tapped batok tattooing."
      },
      {
        question: "What natural materials are used to apply the ink into the skin?",
        options: ["A steel needle and imported acrylic ink", "A wild citrus thorn on a bamboo stick with soot and water ink", "A bird feather with tree sap", "A copper blade with crushed berries"],
        correct_answer_index: 1,
        explanation: "The technique uses a wild calamansi/pomelo thorn fixed to bamboo, dipped in pot soot and water."
      },
      {
        question: "Why must the knowledge of Kalinga tattooing be passed down through biological bloodlines?",
        options: ["Because of government regulations", "Tradition dictates the spiritual efficacy and safety of the art are preserved only through bloodline", "Foreigners are forbidden from holding bamboo sticks", "Because the village chief collects a family fee"],
        correct_answer_index: 1,
        explanation: "Belief holds that passing the craft outside bloodlines destroys its spiritual potency and causes sickness."
      },
    ],
  },
];

export const HUMAN_CULTURE_STORIES = humanCultureStories;
