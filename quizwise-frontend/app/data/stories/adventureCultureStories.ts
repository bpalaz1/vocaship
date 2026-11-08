import { Story } from "./types";

export const adventureCultureStories: Story[] = [
  // =========================================================================
  // A SEVİYESİ (A1-A2, ~120-150 kelime, 2-3 dk)
  // 1) Dağ yürüyüşü
  // 2) Gizemli harita
  // 3) Kamp ateşi
  // 4) Antik kale ziyareti
  // 5) Ada bisiklet turu
  // =========================================================================
  {
    id: "adv-cult-01",
    title: "Hiking the Alpine Pine Trail",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    topic: "Dağ Yürüyüşü",
    desc: "Güneşli bir sabah İsviçre Alpleri'nin çam kokulu patikasında zirveye doğru yürüyen Lucas.",
    content: "Early in the morning, Lucas laced his sturdy hiking boots and adjusted his backpack. The sun rose gently behind the snow-capped Alpine peaks, painting the sky in pastel shades of pink and gold. Lucas followed the winding dirt trail through a dense forest of evergreen pine trees. The crisp mountain air felt invigorating with every breath.\n\nAlong the rocky path, clear melting snow trickled into small, singing streams. Lucas stopped beside a wooden bench to drink cold water from his metal canteen and eat an energy bar. Above him, a graceful golden eagle circled lazily in the azure sky. When he finally reached the panoramic mountain lookout, a breathtaking green valley opened up below, rewarding his two-hour climb with unforgettable natural beauty.",
    target_words: ["hiking", "invigorating", "canteen", "panoramic"],
    target_vocabulary: [
      { word: "hiking", phonetic: "/ˈhaɪ.kɪŋ/", turkish_meaning: "doğa yürüyüşü", context_sentence: "He wore sturdy hiking boots on the trail." },
      { word: "invigorating", phonetic: "/ɪnˈvɪɡ.ər.eɪ.tɪŋ/", turkish_meaning: "canlandırıcı, ferahlatıcı", context_sentence: "The fresh mountain air was invigorating." },
      { word: "canteen", phonetic: "/kænˈtiːn/", turkish_meaning: "matara", context_sentence: "He took a sip of water from his metal canteen." },
      { word: "panoramic", phonetic: "/ˌpæn.ərˈæm.ɪk/", turkish_meaning: "geniş açılı, panoramik", context_sentence: "The lookout offered a panoramic view of the valley." },
    ],
    comprehension_questions: [
      {
        question: "Where did Lucas go for his morning hike?",
        options: ["Along a sandy ocean beach", "Through an Alpine pine forest trail", "Inside an urban park", "Through a hot desert valley"],
        correct_answer_index: 1,
        explanation: "Lucas hiked through an evergreen pine forest trail in the Alpine mountains."
      },
      {
        question: "What wild bird did Lucas spot in the sky?",
        options: ["A flock of seagulls", "A golden eagle", "A tiny hummingbird", "A snowy owl"],
        correct_answer_index: 1,
        explanation: "A graceful golden eagle was circling in the azure sky."
      },
      {
        question: "How long was the climb to the panoramic lookout?",
        options: ["Thirty minutes", "Two hours", "Five hours", "All day"],
        correct_answer_index: 1,
        explanation: "The text states the panoramic valley view rewarded his two-hour climb."
      },
    ],
  },
  {
    id: "adv-cult-02",
    title: "The Mysterious Attic Map",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1524654458049-e36be0721fa2?auto=format&fit=crop&w=800&q=80",
    topic: "Gizemli Harita",
    desc: "Tavan arasındaki eski denizci sandığında kıyı mağarasını işaret eden sararmış bir harita bulan Clara.",
    content: "While organizing dusty boxes in her grandfather's coastal cottage attic, Clara uncovered an antique brass-bound cedar chest. Inside, wrapped in protective oiled canvas, lay a yellowed parchment map dated 1842. The map depicted the rocky shoreline of Smuggler's Cove with intricate hand-drawn landmarks: a lone lighthouse, a jagged split boulder, and a red cross marked inside a hidden tidal cave.\n\nClara's heart raced with excitement. She grabbed her brass compass and a handheld flashlight, heading down to the pebbled beach at low tide. Walking along the cliffs, she identified the distinctive split boulder exactly as drawn on the parchment. Tucked behind thick kelp, a narrow cave entrance beckoned, beginning an adventure that connected her directly to her family's seafaring past.",
    target_words: ["parchment", "landmarks", "shoreline", "seafaring"],
    target_vocabulary: [
      { word: "parchment", phonetic: "/ˈpɑːtʃ.mənt/", turkish_meaning: "parşömen kağıdı", context_sentence: "She carefully unrolled the aged parchment map." },
      { word: "landmarks", phonetic: "/ˈlænd.mɑːks/", turkish_meaning: "belirgin coğrafi işaretler", context_sentence: "The map depicted clear coastal landmarks." },
      { word: "shoreline", phonetic: "/ˈʃɔː.laɪn/", turkish_meaning: "kıyı şeridi", context_sentence: "She explored the rocky shoreline at low tide." },
      { word: "seafaring", phonetic: "/ˈsiːˌfeə.rɪŋ/", turkish_meaning: "denizci, denizcilikle ilgili", context_sentence: "The discovery revealed her family's seafaring history." },
    ],
    comprehension_questions: [
      {
        question: "Where did Clara discover the antique map?",
        options: ["In a public library", "Inside a cedar chest in her grandfather's attic", "Buried in the sand", "In an old bookstore"],
        correct_answer_index: 1,
        explanation: "She found the brass-bound chest while cleaning her grandfather's attic."
      },
      {
        question: "What did the red cross mark on the map?",
        options: ["A buried pirate ship", "A hidden tidal cave", "A sunken submarine", "A gold mine"],
        correct_answer_index: 1,
        explanation: "The red cross was marked inside a hidden tidal cave at Smuggler's Cove."
      },
      {
        question: "At what time of day did Clara visit the beach?",
        options: ["During high midnight tide", "At low tide", "During a heavy rainstorm", "At sunrise"],
        correct_answer_index: 1,
        explanation: "She headed down to the pebbled beach at low tide when the cave was accessible."
      },
    ],
  },
  {
    id: "adv-cult-03",
    title: "Campfire Evening Under the Stars",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
    topic: "Kamp Ateşi & Yıldızlar",
    desc: "Göl kenarında çadır kurup kamp ateşi etrafında hikayeler paylaşan arkadaş grubunun huzurlu gecesi.",
    content: "As dusk settled over Mirror Lake, Liam and his friends finished pitching their green canvas tents on a grassy clearing. Liam gathered dry pine branches and birch bark to build a safe campfire inside a ring of smooth river stones. With a single match, golden flames danced upward, casting a comforting amber glow across the campsite.\n\nThe friends sat on wooden camp stools, roasting sweet marshmallows on whittled willow sticks until they turned gooey and golden brown. Above them, thousands of brilliant stars emerged across the ink-black sky, free from urban light pollution. The gentle lapping of lake water and the crackling of burning pine wood created a tranquil melody, reminding everyone how magical an outdoor evening with good friends can be.",
    target_words: ["clearing", "crackling", "marshmallows", "pollution"],
    target_vocabulary: [
      { word: "clearing", phonetic: "/ˈklɪə.rɪŋ/", turkish_meaning: "ormanda açıklık alan", context_sentence: "They pitched their tents in a grassy clearing." },
      { word: "crackling", phonetic: "/ˈkræk.lɪŋ/", turkish_meaning: "çıtırdayan (ateş sesi)", context_sentence: "The crackling fire warmed the cold night air." },
      { word: "marshmallows", phonetic: "/ˌmɑːʃˈmæl.əʊz/", turkish_meaning: "marshmallow tatlısı", context_sentence: "They roasted sweet marshmallows over the coals." },
      { word: "pollution", phonetic: "/pəˈluː.ʃən/", turkish_meaning: "kirlilik (ışık/hava)", context_sentence: "The night sky was free from light pollution." },
    ],
    comprehension_questions: [
      {
        question: "Where did Liam and his friends set up their campsite?",
        options: ["In a hotel backyard", "On a grassy clearing near Mirror Lake", "On top of a snowy peak", "In a city parking lot"],
        correct_answer_index: 1,
        explanation: "They pitched their green canvas tents on a clearing beside Mirror Lake."
      },
      {
        question: "What sweet treat did the friends roast over the fire?",
        options: ["Apples", "Marshmallows on willow sticks", "Cornbread", "Chocolate cookies"],
        correct_answer_index: 1,
        explanation: "They roasted sweet marshmallows on whittled willow sticks."
      },
      {
        question: "Why were the stars so clearly visible?",
        options: ["They used a giant telescope", "The sky was free from urban light pollution", "The moon was full", "A laser lit the sky"],
        correct_answer_index: 1,
        explanation: "Far from cities, the dark sky was free from light pollution, revealing thousands of stars."
      },
    ],
  },
  {
    id: "adv-cult-04",
    title: "Visiting the Ancient Castle",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=800&q=80",
    topic: "Antik Kale Ziyareti",
    desc: "İskoçya tepelerindeki taş burçları ve asırlık salonları keşfeden turist çiftin tarihi gezisi.",
    content: "Perched high on a rocky volcanic hill in Scotland, Stirling Castle stood proud against the morning mist. Emma and her brother Daniel crossed the historic wooden drawbridge spanning the deep stone moat. The monumental gray stone walls, built over five centuries ago, whispered echoes of medieval knights and royal banquets.\n\nA costumed museum guide in Renaissance attire led them through the Great Hall. Emma admired the enormous stone fireplace and the royal tapestries woven with colorful unicorns and golden lions. They climbed the spiral stairs of the lookout watchtower, peering out through narrow arrow slits at the battlefields where famous historical battles once took place. Standing upon the fortress ramparts, Emma felt as if she had stepped backward in time into the pages of a history book.",
    target_words: ["drawbridge", "moat", "medieval", "ramparts"],
    target_vocabulary: [
      { word: "drawbridge", phonetic: "/ˈdrɔː.brɪdʒ/", turkish_meaning: "açılır kapanır kale köprüsü", context_sentence: "They walked across the wooden drawbridge." },
      { word: "moat", phonetic: "/məʊt/", turkish_meaning: "kale hendeği", context_sentence: "A deep stone moat surrounded the castle walls." },
      { word: "medieval", phonetic: "/ˌmed.iˈiː.vəl/", turkish_meaning: "orta çağa ait", context_sentence: "The castle was built in the medieval era." },
      { word: "ramparts", phonetic: "/ˈræm.pɑːts/", turkish_meaning: "kale surları, burç siperi", context_sentence: "They enjoyed the view from the fortress ramparts." },
    ],
    comprehension_questions: [
      {
        question: "What historic structure did Emma and Daniel cross to enter the castle?",
        options: ["A steel tunnel", "A wooden drawbridge over a stone moat", "A rope bridge", "An underground metro"],
        correct_answer_index: 1,
        explanation: "They crossed the historic wooden drawbridge spanning the deep moat."
      },
      {
        question: "What figures were woven into the Great Hall's tapestries?",
        options: ["Dragons and snakes", "Unicorns and golden lions", "Ships and oceans", "Flowers only"],
        correct_answer_index: 1,
        explanation: "Emma admired royal tapestries woven with colorful unicorns and golden lions."
      },
      {
        question: "Where did Emma and Daniel look out at historic battlefields?",
        options: ["From the kitchen cellar", "From the watchtower and fortress ramparts", "From the castle stables", "From the gift shop"],
        correct_answer_index: 1,
        explanation: "They climbed the spiral watchtower stairs and looked through arrow slits on the ramparts."
      },
    ],
  },
  {
    id: "adv-cult-05",
    title: "Island Bicycle Tour",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    topic: "Ada Bisiklet Turu",
    desc: "Otomobilsiz adada mavi koylar ve zeytin ağaçları arasında pedal çeviren Elena'nın neşeli günü.",
    content: "On the Greek island of Hydra, where motor vehicles are completely forbidden, the best way to explore is on two wheels or on foot. Elena rented a lightweight city bicycle equipped with a wicker basket on the handlebars. She began her morning ride along the sun-drenched coastal path that hugs the sparkling turquoise sea.\n\nThe route wound through quiet groves of ancient olive trees and past whitewashed stone chapels with sky-blue domes. Elena stopped at a secluded rocky cove to swim in the cool, clear water. Afterward, she enjoyed sweet watermelon slices and fresh goat cheese at a seaside tavern. With the sea breeze blowing through her hair and donkeys resting under fig trees, the island bicycle tour felt like pure summer freedom.",
    target_words: ["forbidden", "secluded", "whitewashed", "breeze"],
    target_vocabulary: [
      { word: "forbidden", phonetic: "/fəˈbɪd.ən/", turkish_meaning: "yasaklanmış", context_sentence: "Motor cars are forbidden on the quiet island." },
      { word: "secluded", phonetic: "/sɪˈkluː.dɪd/", turkish_meaning: "gözlerden uzak, tenha koy", context_sentence: "She swam in a secluded rocky cove." },
      { word: "whitewashed", phonetic: "/ˈwaɪt.wɒʃt/", turkish_meaning: "kireçle badanalanmış (beyaz evler)", context_sentence: "They rode past whitewashed stone chapels." },
      { word: "breeze", phonetic: "/briːz/", turkish_meaning: "tatlı esinti, meltem", context_sentence: "A refreshing sea breeze blew from the water." },
    ],
    comprehension_questions: [
      {
        question: "What vehicle rule exists on the island of Hydra?",
        options: ["Only electric cars are allowed", "Motor vehicles are completely forbidden", "Bicycles are not permitted", "Only buses can operate"],
        correct_answer_index: 1,
        explanation: "The text states motor vehicles are completely forbidden on the island."
      },
      {
        question: "What did Elena carry on her rented bicycle?",
        options: ["A heavy metal trunk", "A wicker basket on the handlebars", "A surfboard", "A camping tent"],
        correct_answer_index: 1,
        explanation: "Her lightweight bicycle was equipped with a wicker basket on the handlebars."
      },
      {
        question: "What did Elena do when she reached the secluded cove?",
        options: ["She took a nap in the car", "She swam in the cool, clear water", "She repaired her tire", "She caught fish with a net"],
        correct_answer_index: 1,
        explanation: "She stopped at the secluded rocky cove to swim in the clear turquoise sea."
      },
    ],
  },

  // =========================================================================
  // B SEVİYESİ (B1-B2, ~230-260 kelime, 4-5 dk)
  // 6) İpek Yolu kervan rotası
  // 7) Amazon yağmur ormanı keşfi
  // 8) Kuzey ışıkları avı
  // 9) Volkan krateri tırmanışı
  // 10) Çöl vahası arayışı
  // =========================================================================
  {
    id: "adv-cult-06",
    title: "Caravans Across the Silk Road",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 245,
    coverImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    topic: "İpek Yolu Kervan Rotası",
    desc: "Dunhuang vahasından Semerkant'a baharat ve ipek taşıyan kadim kervanların çöl yolculuğu.",
    content: "For over a millennium, the Silk Road served as the commercial and cultural artery connecting the imperial courts of Chang'an with the Mediterranean bazaars of Antioch and Rome. Joining a historical reenactment expedition in the Hexi Corridor of western China, traveler Julian experienced firsthand the formidable geography traversed by ancient camel caravans.\n\nThe journey commenced at the desert oasis of Dunhuang, where towering crescent sand dunes—known as the Singing Sands—whistled under prevailing desert winds. Riding double-humped Bactrian camels well-adapted to surviving freezing night temperatures and blistering daytime heat, the expedition traced the northern fringe of the Taklamakan Desert. Every twenty-five kilometers, the caravan rested at a fortified caravanserai: thick mud-brick stations equipped with central water cisterns, shaded stables, and secure courtyards.\n\nSitting around communal charcoal hearths at night, expedition members examined replicas of goods historically bartered along the route: bolts of raw Chinese mulberry silk, cakes of fermented Yunnan tea, Persian lapis lazuli beads, and fragrant sacks of Indian saffron. Julian realized that the Silk Road was not merely a physical commercial corridor for commodities; it was the world's most transformative conduit of ideas, carrying Buddhist philosophy, mathematics, papermaking technology, and astronomy across borders, forever weaving disparate civilizations into a shared global destiny.",
    target_words: ["artery", "caravanserai", "bartered", "conduit"],
    target_vocabulary: [
      { word: "artery", phonetic: "/ˈɑː.tər.i/", turkish_meaning: "ana damar, can damarı (ticaret yolu)", context_sentence: "The route was a vital commercial artery." },
      { word: "caravanserai", phonetic: "/ˌkær.əˈvæn.sə.raɪ/", turkish_meaning: "kervansaray, korunaklı menzil konağı", context_sentence: "Caravans took shelter inside a stone caravanserai." },
      { word: "bartered", phonetic: "/ˈbɑː.təd/", turkish_meaning: "takas edilen, değiş tokuş yapılan", context_sentence: "Silk, tea, and spices were bartered along the path." },
      { word: "conduit", phonetic: "/ˈkɒn.dʒuː.ɪt/", turkish_meaning: "iletim kanalı, köprü yol", context_sentence: "The road was a conduit for philosophical ideas." },
    ],
    comprehension_questions: [
      {
        question: "What type of animal transported merchants through the Taklamakan Desert?",
        options: ["Arabian horses", "Double-humped Bactrian camels", "Mountain yaks", "Pack mules"],
        correct_answer_index: 1,
        explanation: "The expedition rode double-humped Bactrian camels suited for desert extremes."
      },
      {
        question: "What purpose did a caravanserai serve along the Silk Road?",
        options: ["It was a military prison", "A fortified desert lodge with water cisterns and stables for traders", "A currency exchange bank", "A royal palace for emperors"],
        correct_answer_index: 1,
        explanation: "Caravanserais were mud-brick road stations providing water, stables, and shelter."
      },
      {
        question: "Beyond trade commodities, what crucial exchange occurred along the Silk Road?",
        options: ["Only weapons and armor", "Philosophical concepts, paper technology, and scientific ideas", "Livestock diseases only", "Language elimination"],
        correct_answer_index: 1,
        explanation: "The route served as a conduit for ideas, philosophy, papermaking, and mathematics."
      },
    ],
  },
  {
    id: "adv-cult-07",
    title: "Expedition into the Amazon Canopy",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80",
    topic: "Amazon Yağmur Ormanı Keşfi",
    desc: "Peru yağmur ormanlarında asma köprülerle ağaç tepesi ekosistemini ve biyoçeşitliliği inceleyen biyolog Maya.",
    content: "Deep in the Madre de Dios basin of southeastern Peru, field biologist Maya clipped her safety carabiners onto the steel cable of the Tambopata Canopy Walkway. Suspended thirty-five meters above the forest floor, the suspension bridge swayed gently beneath her boots, offering an intimate perspective into the most biodiverse biological layer on planet Earth: the tropical rainforest canopy.\n\nWhile the dim understory below received barely two percent of sunlight, the canopy bathed in radiant tropical warmth. Massive emergent kapok trees stretched upward like colossal leafy umbrellas, their branches carpeted with thousands of epiphytic orchids, bromeliads, and hanging lianas. As Maya adjusted her digital telephoto camera, a pair of scarlet macaws squawked loudly, their sapphire, crimson, and yellow wing feathers flashing brilliantly as they soared across the misty green expanse.\n\nWith her local indigenous guide, Mateo, Maya cataloged canopy fauna for a regional conservation census. Mateo pointed out a three-toed sloth moving deliberately among trumpet tree leaves, its fur hosting microscopic green algae that provided natural camouflage. Further down the cable line, a troop of inquisitive squirrel monkeys bounded effortlessly through the branches, chattering as they foraging for wild figs. Looking out over the unbroken green ocean extending to the horizon, Maya felt humbled by the vital role this irreplaceable ecological sanctuary plays in regulating the planet's atmospheric balance.",
    target_words: ["canopy", "epiphytic", "biodiverse", "camouflage"],
    target_vocabulary: [
      { word: "canopy", phonetic: "/ˈkæn.ə.pi/", turkish_meaning: "ağaç tepesi katmanı, gölgelik örtü", context_sentence: "They walked across the high rainforest canopy." },
      { word: "epiphytic", phonetic: "/ˌep.ɪˈfɪt.ɪk/", turkish_meaning: "epifitik (başka bitki üzerinde yaşayan)", context_sentence: "Epiphytic orchids covered the kapok branches." },
      { word: "biodiverse", phonetic: "/ˌbaɪ.əʊ.daɪˈvɜːs/", turkish_meaning: "biyolojik olarak zengin, tür çeşitliliği yüksek", context_sentence: "The Amazon is the most biodiverse region on Earth." },
      { word: "camouflage", phonetic: "/ˈkæm.ə.flɑːʒ/", turkish_meaning: "kamuflaj, doğal gizlenme", context_sentence: "Algae in its fur provided natural camouflage for the sloth." },
    ],
    comprehension_questions: [
      {
        question: "How high was the suspension canopy walkway suspended above the ground?",
        options: ["Five meters", "Thirty-five meters", "One hundred meters", "Ten meters"],
        correct_answer_index: 1,
        explanation: "The walkway was suspended thirty-five meters above the forest floor."
      },
      {
        question: "What colorful birds flew across the canopy while Maya was filming?",
        options: ["Penguins", "Scarlet macaws with red, yellow, and blue feathers", "Bald eagles", "Pelicans"],
        correct_answer_index: 1,
        explanation: "A pair of scarlet macaws with crimson and sapphire wings flew across the canopy."
      },
      {
        question: "How did the three-toed sloth achieve natural camouflage?",
        options: ["By changing its skin color like an octopus", "Through microscopic green algae growing in its fur", "By hiding inside holes", "By covering itself in mud"],
        correct_answer_index: 1,
        explanation: "Microscopic green algae living in its fur gave the sloth natural camouflage."
      },
    ],
  },
  {
    id: "adv-cult-08",
    title: "Chasing the Northern Lights in Tromsø",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 245,
    coverImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
    topic: "Kuzey Işıkları Avı",
    desc: "Norveç fiyortlarında dondurucu soğukta yeşil ve menekşe rengi kutup ışıklarını görüntüleyen fotoğrafçılar.",
    content: "Two hundred miles north of the Arctic Circle, the Norwegian coastal city of Tromsø was enveloped in the quiet chill of the polar night. Bundled in heavy thermal parkas, insulated mittens, and spiked boots, photographer Sophia and her local Sami guide, Lars, drove a four-wheel-drive van away from city glare toward the dark, isolated fjords of Ersfjordbotn.\n\nAt minus fifteen degrees Celsius, the fjord water was as still as dark obsidian glass, reflecting snowy mountain peaks beneath a starry velvet sky. Sophia set up her carbon-fiber tripod and adjusted her manual camera settings: aperture wide open at f/2.8, ISO at 1600, and exposure timer set to eight seconds. For two patient hours, they huddled beside a small driftwood fire, sipping hot lingonberry juice from wooden kåsa cups.\n\nSuddenly, the southern horizon ignited. A faint milky vapor coalesced into an undulating ribbon of electric emerald light that began dancing across the zenith. The Aurora Borealis expanded violently across the heavens, its lower fringe pulsating with vibrant violet and magenta flares as solar electrons collided with atmospheric oxygen and nitrogen. Sophia clicked her remote shutter, capturing breathtaking celestial ribbons reflected upon the tranquil sea—a natural spectacle that left her trembling with reverence.",
    target_words: ["aurora", "undulating", "obsidian", "coalesced"],
    target_vocabulary: [
      { word: "aurora", phonetic: "/ɔːˈrɔː.rə/", turkish_meaning: "kutup ışığı, şafak parıltısı", context_sentence: "The Aurora Borealis lit up the arctic sky." },
      { word: "undulating", phonetic: "/ˈʌn.djʊ.leɪ.tɪŋ/", turkish_meaning: "dalgalanan, kıvrılan", context_sentence: "An undulating ribbon of green danced above." },
      { word: "obsidian", phonetic: "/əbˈsɪd.i.ən/", turkish_meaning: "obsidyen, parlak siyah volkanik cam", context_sentence: "The fjord was still as black obsidian glass." },
      { word: "coalesced", phonetic: "/ˌkəʊ.əˈlest/", turkish_meaning: "birleşti, kaynaştı", context_sentence: "Faint streaks coalesced into a blazing light show." },
    ],
    comprehension_questions: [
      {
        question: "Where did Sophia and Lars travel to observe the Northern Lights?",
        options: ["To a downtown cafe in Oslo", "To the dark fjords of Ersfjordbotn near Tromsø", "To the summit of Mount Everest", "To a beach in Spain"],
        correct_answer_index: 1,
        explanation: "They drove away from urban lights to the isolated fjords of Ersfjordbotn near Tromsø."
      },
      {
        question: "What warm drink did they share beside the driftwood fire?",
        options: ["Black tea", "Hot lingonberry juice", "Coffee with milk", "Hot chocolate"],
        correct_answer_index: 1,
        explanation: "They huddled beside the fire drinking hot lingonberry juice from wooden cups."
      },
      {
        question: "What physical process causes the vibrant colors of the aurora?",
        options: ["Reflection of city neon signs", "Solar electrons colliding with atmospheric oxygen and nitrogen atoms", "Moonlight shining on glaciers", "Volcanic ash in the clouds"],
        correct_answer_index: 1,
        explanation: "Solar electrons collide with atmospheric oxygen and nitrogen to generate the colors."
      },
    ],
  },
  {
    id: "adv-cult-09",
    title: "Ascending Mount Bromo's Crater",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=800&q=80",
    topic: "Volkan Krateri Tırmanışı",
    desc: "Endonezya'nın Doğu Cava adasında aktif yanardağ kraterinin kükürtlü dumanlarına tırmanan dağcılar.",
    content: "At three in the morning, the pre-dawn air across the Tengger caldera in East Java was bone-chillingly cold. Trekker Tariq adjusted his headlamp and pulled a woven bandana over his nose and mouth to filter out airborne volcanic ash. Along with his local guide, Wayan, Tariq set out across the 'Sea of Sand'—an eerie lunar expanse of black volcanic silt that surrounds the active cone of Mount Bromo.\n\nThe final ascent involved climbing a steep, narrow concrete stairway comprising two hundred and fifty ash-covered steps. With every step upward, a deep, rhythmic subterranean roar grew louder, vibrating through the soles of Tariq's boots like an angry locomotive trapped beneath the earth. Pungent yellow sulfur vapors swirled in the chilly wind, stinging the eyes.\n\nReaching the narrow crater rim just as dawn broke over the horizon, Tariq stared directly into the smoking caldera abyss. Boiling mud and volcanic gases hissed hundreds of meters below in the crater's molten belly. Behind them, the rising sun cast golden rays across neighboring volcanic cones, illuminating a surreal landscape resembling the dawn of creation. Wayan offered a small woven basket of fresh marigolds and rice into the crater, continuing the ancient Tenggerese tradition of honoring the volcano spirit with humble reverence.",
    target_words: ["caldera", "subterranean", "sulfur", "silt"],
    target_vocabulary: [
      { word: "caldera", phonetic: "/kælˈdeə.rə/", turkish_meaning: "yanardağ çöküntü krateri", context_sentence: "They crossed the vast volcanic caldera at night." },
      { word: "subterranean", phonetic: "/ˌsʌb.təˈreɪ.ni.ən/", turkish_meaning: "yer altı, yerin altındaki", context_sentence: "A deep subterranean roar shook the ground." },
      { word: "sulfur", phonetic: "/ˈsʌl.fər/", turkish_meaning: "kükürt (sarı gaz)", context_sentence: "Pungent sulfur vapors rose from the crater." },
      { word: "silt", phonetic: "/sɪlt/", turkish_meaning: "ince mil, volkanik kül kumu", context_sentence: "Fine black volcanic silt covered the plain." },
    ],
    comprehension_questions: [
      {
        question: "What island is Mount Bromo located on?",
        options: ["Bali", "East Java, Indonesia", "Sumatra", "Borneo"],
        correct_answer_index: 1,
        explanation: "Mount Bromo is located in the Tengger caldera of East Java, Indonesia."
      },
      {
        question: "How did Tariq reach the top of the volcano crater rim?",
        options: ["By taking a cable car", "By climbing a steep flight of 250 ash-covered concrete stairs", "On a motorized elevator", "In a helicopter"],
        correct_answer_index: 1,
        explanation: "The climb concluded with a steep stairway of 250 concrete steps."
      },
      {
        question: "What cultural ritual did guide Wayan perform at the crater rim?",
        options: ["He shouted a battle cry", "He offered a woven basket of marigolds and rice into the crater", "He planted a national flag", "He built a stone cairn"],
        correct_answer_index: 1,
        explanation: "Wayan offered marigolds and rice to honor the ancient Tenggerese volcano tradition."
      },
    ],
  },
  {
    id: "adv-cult-10",
    title: "Quest for the Desert Oasis",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80",
    topic: "Çöl Vahası Arayışı",
    desc: "Fas Sahrası'nda kum fırtınasının ardından hurma ağaçlarıyla çevrili gizli vaha havuzunu bulan kâşifler.",
    content: "Under the relentless midday glare of the Moroccan Sahara, the wind-sculpted sand dunes of Erg Chebbi stretched toward the horizon like frozen golden tidal waves. French geographer Claire and her Tuareg companion, Ibrahim, had traveled for three days on camelback across the stony hamada plateau in search of Ain Zerga, an ancient natural artesian oasis rumored to feed subterranean aquifers beneath the dunes.\n\nA sudden haboob dust storm had earlier forced them to take shelter behind their couched camels, wrapping their indigo tagelmust scarves tightly around their faces as blinding dust whipped across the dunes. When the gale finally subsided, the shifting sands had altered familiar landmarks, leaving only the position of the sun and Ibrahim's hereditary knowledge of desert vegetation to guide their footsteps.\n\nClimbing the ridge of a towering hundred-meter dune in late afternoon, Claire gasped in astonishment. Tucked within a deep depression between crimson sand ridges lay a lush emerald sanctuary. Towering date palms heavy with ripe amber fruit ringed a crystal-clear spring-fed pool of freshwater. Desert swallows dipped their wings in the glistening water, and the shade temperature was ten degrees cooler than the scorching open dunes. Scooping clean water into their leather waterskins, they rested beneath the palms, marveling at nature's miraculous resilience in the world's most unforgiving wilderness.",
    target_words: ["aquifers", "haboob", "depression", "waterskins"],
    target_vocabulary: [
      { word: "aquifers", phonetic: "/ˈæk.wɪ.fərz/", turkish_meaning: "yeraltı su havzaları, akiferler", context_sentence: "The natural oasis was fed by deep subterranean aquifers." },
      { word: "haboob", phonetic: "/həˈbuːb/", turkish_meaning: "şiddetli çöl kum fırtınası", context_sentence: "A blinding haboob storm swept over the dunes." },
      { word: "depression", phonetic: "/dɪˈpreʃ.ən/", turkish_meaning: "çöküntü alanı, çukur havza", context_sentence: "The oasis was nestled in a sheltered sand depression." },
      { word: "waterskins", phonetic: "/ˈwɔː.tə.skɪnz/", turkish_meaning: "deri su kırbaları", context_sentence: "They filled their leather waterskins with fresh spring water." },
    ],
    comprehension_questions: [
      {
        question: "What desert region were Claire and Ibrahim traversing?",
        options: ["The Gobi Desert", "The Erg Chebbi dunes in the Moroccan Sahara", "The Atacama Desert", "The Mojave Desert"],
        correct_answer_index: 1,
        explanation: "They were traveling across the Erg Chebbi dunes in the Moroccan Sahara."
      },
      {
        question: "How did the travelers protect themselves during the sudden sandstorm?",
        options: ["Inside a brick house", "By sheltering behind couched camels and wrapping indigo scarves over their faces", "Under an umbrella", "In a metal vehicle"],
        correct_answer_index: 1,
        explanation: "They sheltered behind their camels with indigo tagelmust scarves over their faces."
      },
      {
        question: "What vegetation surrounded the freshwater pool at the oasis?",
        options: ["Pine and oak trees", "Towering date palms bearing ripe fruit", "Cactus plants only", "Apple orchards"],
        correct_answer_index: 1,
        explanation: "The spring was ringed by towering date palms heavy with amber fruit."
      },
    ],
  },

  // =========================================================================
  // C SEVİYESİ (C1-C2, ~330-360 kelime, 5-6 dk)
  // 11) Kutup kâşiflerinin fırtına günlüğü
  // 12) Derin okyanus batığı dalışı
  // 13) Kayıp İnka şehri ekspedisyonu
  // 14) Himalaya geçitlerinde hayatta kalma
  // 15) Sahra yeraltı nehirleri araştırması
  // =========================================================================
  {
    id: "adv-cult-11",
    title: "The Polar Explorer's Blizzard Journal",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 345,
    coverImage: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80",
    topic: "Kutup Kâşiflerinin Günlüğü",
    desc: "Antarktika buz sahanlığında eksi elli derecede hayatta kalma mücadelesi veren kutup ekspedisyonunun dramatik seyir defteri.",
    content: "Trapped within a reinforced pyramidal canvas tent pitched upon the Ross Ice Shelf, expedition leader Captain Robert Evans recorded daily entries in his oilskin-bound navigational journal. Outside, a catabatic polar blizzard shrieked with hurricane-force velocity, hurling pulverized ice granules against the guy-ropes with deafening fury. The ambient temperature had plunged to minus fifty-two degrees Celsius, transforming the vast Antarctic wilderness into an impenetrable abyss of zero visibility where compass needles spun erratically against magnetic fluctuations.\n\nFor seventy-two consecutive hours, Evans and his two companions—meteorologist Dr. Campbell and navigator Henrik—had remained immobilized inside their down-insulated sleeping bags. Every physical exertion demanded perilous calculation: priming the paraffin Primus stove required warming the frozen brass burner with bare palms, and venturing outside for thirty seconds to check snow-anchor pickets risked instantaneous frostbite on exposed epidermis. Rations were carefully sequestered: four ounces of pemmican, two dry ship biscuits, and melted ice water per man daily.\n\nDespite the claustrophobic dread of physical entrapment, Evans maintained rigorous psychological equilibrium. In his journal, he dissected not despair, but the astonishing sublime grandeur of the Antarctic continent. He documented barometric pressure oscillations, atmospheric ice halos, and the acoustic peculiarities of wind vibrating through frozen glacier rifts. On the fourth dawn, the barometric pressure surged. The screaming gale abated into an unearthly, absolute stillness. Crawling through the tent sleeve into the blinding polar sun, the men stood before an infinite sea of pristine white sastrugi ridges under a cobalt sky. Evans closed his brass pocket chronometer, reaffirming in his logbook that the ultimate conquest of polar exploration is not planting flags upon geography, but fortifying the indomitable fortress of the human spirit.",
    target_words: ["catabatic", "pemmican", "sastrugi", "chronometer"],
    target_vocabulary: [
      { word: "catabatic", phonetic: "/ˌkæt.əˈbæt.ɪk/", turkish_meaning: "katabatik, yüksek buzullardan aşağı hücum eden fırtına", context_sentence: "A fierce catabatic blizzard struck the ice shelf." },
      { word: "pemmican", phonetic: "/ˈpem.ɪ.kən/", turkish_meaning: "pemikan (kurutulmuş et ve yağdan kutup azığı)", context_sentence: "They rationed daily ounces of pemmican." },
      { word: "sastrugi", phonetic: "/sæsˈtruː.ɡiː/", turkish_meaning: "sastrugi (rüzgarın karda oluşturduğu sert dalgalı sırtlar)", context_sentence: "Pristine white sastrugi ridges spanned the horizon." },
      { word: "chronometer", phonetic: "/krəˈnɒm.ɪ.tər/", turkish_meaning: "kronometre, hassas deniz saati", context_sentence: "He verified their location using a brass chronometer." },
    ],
    comprehension_questions: [
      {
        question: "What extreme weather event immobilized Captain Evans's expedition on the Ross Ice Shelf?",
        options: ["A volcanic ash cloud", "A catabatic hurricane-force blizzard at -52°C", "An earthquake", "An ice thaw flooding the plains"],
        correct_answer_index: 1,
        explanation: "A violent catabatic blizzard with -52°C temperatures trapped them for 72 hours."
      },
      {
        question: "What survival rations did the explorers consume daily?",
        options: ["Fresh fruit and canned soup", "Four ounces of pemmican, two ship biscuits, and melted snow water", "Dried fish and rice", "Warm stew from an electric cooker"],
        correct_answer_index: 1,
        explanation: "They strictly rationed four ounces of pemmican, two biscuits, and melted ice water per man."
      },
      {
        question: "What philosophical conclusion did Evans record in his journal after the storm passed?",
        options: ["That polar exploration was an utter waste of time", "That exploration is about fortifying the human spirit rather than merely claiming land", "That all team members should quit", "That they should sell the story to newspapers"],
        correct_answer_index: 1,
        explanation: "Evans wrote that exploration is fundamentally about the resilience of the human spirit."
      },
    ],
  },
  {
    id: "adv-cult-12",
    title: "Diving the Deep Ocean Galleon",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    topic: "Derin Okyanus Batığı Dalışı",
    desc: "Karayip Denizi'nin 120 metre derinliğinde yatan 17. yüzyıl İspanyol kalyonunu araştıran teknik dalış ekibi.",
    content: "Submerged one hundred and twenty meters beneath the turquoise swells of the Pedro Bank off Jamaica, technical marine archaeologist Elena hovered motionless in the silent bathypelagic gloom. Operating at depths far beyond the limits of recreational scuba, her survival depended entirely upon a closed-circuit rebreather apparatus circulating a customized Trimix gas blend of helium, oxygen, and nitrogen to prevent both oxygen toxicity and nitrogen narcosis. Twin high-intensity underwater umbilical floodlights pierced the obsidian abyss, illuminating the colossal wooden ribs of the Nuestra Señora del Carmen, a Spanish merchant galleon that foundered during a tropical hurricane in 1698.\n\nThe vessel lay half-entombed in coral-crusted maritime sediments. Bronze cannons covered in sea fans and crimson sponges pointed blindly into the darkness, their touchholes sealed by three centuries of marine calcification. Working with extreme precision to avoid stirring up blinding silt plumes, Elena deployed a gentle hydraulic water-induction dredge to uncover the stern cabin remnants. Amid shattered olive oil amphorae and lead musket balls, her gloved fingers brushed against a heavily oxidized wooden lockbox.\n\nPeering through the clear plexiglass visor of her helmet, Elena activated a macro-focus digital camera to document the artifact before extraction. The box held pewter navigational astrolabes, intact ceramic apothecary jars, and hundreds of silver cob coins minted in Potosí bearing the royal crest of King Charles II. However, Elena recognized that the true historical value lay not in the monetary worth of precious bullion, but in the micro-historical forensic context: maritime logbooks, shipboard medicinal practices, and nautical trade routes preserved in this deep aquatic time capsule. After completing their twenty-minute bottom runtime, the team commenced a four-hour staged decompression ascent, returning ancient history from the abyss to the living world.",
    target_words: ["bathypelagic", "rebreather", "calcification", "astrolabes"],
    target_vocabulary: [
      { word: "bathypelagic", phonetic: "/ˌbæθ.i.pəˈlædʒ.ɪk/", turkish_meaning: "derin deniz katmanına ait", context_sentence: "They hovered in the bathypelagic ocean gloom." },
      { word: "rebreather", phonetic: "/ˈriːˌbriː.ðər/", turkish_meaning: "kapalı devre dalış solunum aygıtı", context_sentence: "Her rebreather mixed helium and oxygen safely." },
      { word: "calcification", phonetic: "/ˌkæl.sɪ.fɪˈkeɪ.ʃən/", turkish_meaning: "kireçlenme, mineral kabuk bağlama", context_sentence: "Cannons were sealed by centuries of calcification." },
      { word: "astrolabes", phonetic: "/ˈæs.trə.leɪbz/", turkish_meaning: "usturlaplar (antik göksel navigasyon aleti)", context_sentence: "The lockbox contained rare pewter astrolabes." },
    ],
    comprehension_questions: [
      {
        question: "What specialized breathing equipment did Elena use at 120 meters depth?",
        options: ["A standard snorkel tube", "A closed-circuit rebreather with a Trimix gas blend", "A simple oxygen tank from a swimming pool", "No breathing equipment"],
        correct_answer_index: 1,
        explanation: "She used a closed-circuit rebreather with a Trimix helium-oxygen-nitrogen mixture."
      },
      {
        question: "What historic shipwreck did Elena explore off Jamaica?",
        options: ["The HMS Titanic", "The 1698 Spanish merchant galleon Nuestra Señora del Carmen", "A Viking longship", "A modern cargo vessel"],
        correct_answer_index: 1,
        explanation: "The wreck was the Nuestra Señora del Carmen, an armed galleon that sank in 1698."
      },
      {
        question: "Why was a four-hour decompression ascent necessary after twenty minutes of diving?",
        options: ["To watch tropical dolphins", "To safely eliminate dissolved inert gases from the bloodstream and prevent bends", "To recharge battery lights", "To wait for daytime"],
        correct_answer_index: 1,
        explanation: "Staged decompression allows dissolved nitrogen and helium to leave the body safely without decompression sickness."
      },
    ],
  },
  {
    id: "adv-cult-13",
    title: "Expedition to the Lost Incan Citadel",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80",
    topic: "Kayıp İnka Şehri Ekspedisyonu",
    desc: "Peru'nun Vilcabamba bulut ormanlarında LiDAR teknolojisiyle asırlardır gizlenen İnka tapınağını bulan arkeologlar.",
    content: "Hacking through dense tangled walls of bamboo, hanging strangler figs, and thorny bromeliads, archaeological expedition leader Dr. Mateo Alva surveyed the precipitous granite ridges of the Peruvian Vilcabamba cloud forest. For three arduous weeks, his multinational team had navigated terrain so vertical that a single misstep meant plunging hundreds of meters into the churning rapids of the Urubamba River canyon below. Guided by airborne LiDAR remote-sensing data that had detected geometric anomalies concealed beneath the unbroken jungle canopy, the team was searching for the fabled lost redoubt of Manco Inca.\n\nOn the twenty-second day, the expedition reached a high saddle shrouded in perpetual Andean mist at three thousand meters altitude. Clearing centuries of aggressive root systems with machetes and soft brushes, Mateo's team uncovered a colossal cyclopean retaining wall. The architecture was unmistakably imperial Incan: massive multi-ton blocks of pink granite carved with interlocking polygonal joints so tightly fitted together without mortar that a razor blade could not pass between the seams.\n\nAs the team systematically surveyed the site, a monumental ceremonial complex emerged from the jungle veil: agricultural terraces cascading down vertical ravines, ceremonial fountains fed by subterranean mountain springs, and an Intihuatana solar hitching post positioned precisely to capture equinox solar alignments. Unlike looted low-altitude settlements, the citadel was miraculously undisturbed. Mateo discovered intact polychrome ceramic vessels, bronze agricultural implements, and woven alpaca burial tapestries preserved by the cool high-altitude microclimate. Documenting the coordinates without disturbing sacred burial shrines, Mateo felt profound reverence. The citadel stood as an enduring monument to indigenous engineering genius, holding secrets of resilience against Spanish conquest.",
    target_words: ["precipitous", "LiDAR", "cyclopean", "polygonal"],
    target_vocabulary: [
      { word: "precipitous", phonetic: "/prɪˈsɪp.ɪ.təs/", turkish_meaning: "sarp, dik uçurumlu", context_sentence: "They climbed precipitous granite ridges in the cloud forest." },
      { word: "LiDAR", phonetic: "/ˈlaɪ.dɑːr/", turkish_meaning: "LiDAR (lazerle yüzey tarama teknolojisi)", context_sentence: "Airborne LiDAR lasers revealed hidden stone foundations." },
      { word: "cyclopean", phonetic: "/saɪˈklɒp.i.ən/", turkish_meaning: "kiklopik, harçsız devasa taş mimari", context_sentence: "They cleared roots off a cyclopean stone retaining wall." },
      { word: "polygonal", phonetic: "/pəˈlɪɡ.ən.əl/", turkish_meaning: "çokgen taş kesimli", context_sentence: "Polygonal granite blocks locked together seamlessly." },
    ],
    comprehension_questions: [
      {
        question: "What modern technological tool helped the archaeologists identify the hidden Incan ruins?",
        options: ["Metal detectors only", "Airborne LiDAR remote-sensing laser mapping", "Satellite television cameras", "Commercial drones with spotlights"],
        correct_answer_index: 1,
        explanation: "Airborne LiDAR scanned through the dense forest canopy to reveal geometric stone structures."
      },
      {
        question: "What architectural hallmark proved the ruins were Imperial Incan?",
        options: ["Wooden log cabins", "Mortarless cyclopean granite walls with interlocking polygonal joints", "Concrete columns with arches", "Brick towers with mortar"],
        correct_answer_index: 1,
        explanation: "Massive mortarless polygonal granite blocks fitted together so tightly that a blade could not pass."
      },
      {
        question: "Why were artifacts within the high-altitude citadel so exceptionally well-preserved?",
        options: ["They were kept in airtight glass cases", "The undisturbed location and cool mountain microclimate protected them", "They were made of modern stainless steel", "The Spanish garrison protected them"],
        correct_answer_index: 1,
        explanation: "The cool mountain microclimate and remote undisturbed location preserved ceramics and textiles."
      },
    ],
  },
  {
    id: "adv-cult-14",
    title: "Surviving the High Himalayan Pass",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 345,
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    topic: "Himalaya Geçitlerinde Hayatta Kalma",
    desc: "Thorong La geçidinde 5.416 metre yükseklikte ani kar fırtınasına yakalanıp hayatta kalan dağcıların nefes kesen mücadelesi.",
    content: "Ascending the Annapurna Circuit in the central Himalayas of Nepal, high-altitude mountaineer Julian and his Sherpa partner, Dawa, confronted the ultimate physical barrier: Thorong La Pass, standing at a staggering 5,416 meters above sea level. At this extreme altitude, atmospheric oxygen pressure drops to barely fifty percent of sea-level density, turning every forward pace into an agonizing battle against hypoxemia, pulmonary exhaustion, and cerebral fatigue.\n\nSetting out from High Camp at 04:00 under a crystal sky of frosted stars, conditions rapidly deteriorated into an unforeseen high-altitude squall. Gale-force katabatic winds howled across the barren scree slopes, whipping ice needles that stripped visibility to under three meters. As ambient temperatures plunged past minus twenty-five degrees, the exposed ridge transformed into a lethal labyrinth of sheer precipices and disorienting whiteout.\n\nRecognizing the immediate symptoms of acute mountain sickness threatening an Australian trekker stranded ahead of them, Dawa and Julian made an executive decision. Rather than rushing ahead to safety, they mobilized. Dawa administered supplemental emergency oxygen and dexamethasone, while Julian anchored the disoriented climber between their climbing harnesses using dynamic kernmantle rope. Moving in lockstep rhythm—inhale, plant trekking pole, exhale, step—they navigated the treacherous icy cornices by memory and dead-reckoning navigation.\n\nAfter five grueling hours of relentless exposure, the fluttering prayer flags of the Thorong La summit col emerged through the storm clouds. The wind subsided, revealing a staggering panorama of towering eight-thousand-meter giants—Dhaulagiri and Annapurna I—gleaming in blinding solar majesty. Descending toward the sacred sanctuary of Muktinath, Julian understood that in the high mountains, survival is never about conquering the peak; it is about selfless solidarity, humble endurance, and profound respect for the indifferent forces of nature.",
    target_words: ["hypoxemia", "katabatic", "dexamethasone", "kernmantle"],
    target_vocabulary: [
      { word: "hypoxemia", phonetic: "/ˌhaɪ.pɒkˈsiː.mi.ə/", turkish_meaning: "kanda oksijen yetersizliği", context_sentence: "Thin air caused agonizing physical hypoxemia." },
      { word: "katabatic", phonetic: "/ˌkæt.əˈbæt.ɪk/", turkish_meaning: "katabatik, dağ yamacından aşağı inen sert rüzgar", context_sentence: "Katabatic winds howled across the icy scree." },
      { word: "dexamethasone", phonetic: "/ˌdek.səˈmeθ.ə.səʊn/", turkish_meaning: "deksametazon (yükseklik hastalığı ilacı)", context_sentence: "Dawa administered emergency dexamethasone to the climber." },
      { word: "kernmantle", phonetic: "/ˈkɜːnˌmæn.təl/", turkish_meaning: "örgülü dağcılık güvenlik ipi", context_sentence: "They tied the climber into their kernmantle rope." },
    ],
    comprehension_questions: [
      {
        question: "What altitude did Julian and Dawa reach at the summit of Thorong La Pass?",
        options: ["2,500 meters", "5,416 meters above sea level", "8,848 meters", "4,000 meters"],
        correct_answer_index: 1,
        explanation: "Thorong La Pass stands at an elevation of 5,416 meters above sea level."
      },
      {
        question: "How did Julian and Dawa help the stranded Australian trekker during the blizzard?",
        options: ["They told him to wait alone", "They administered oxygen and dexamethasone, and roped him securely between them", "They carried him down in a motorized sled", "They called a helicopter immediately"],
        correct_answer_index: 1,
        explanation: "They provided emergency medication, supplemental oxygen, and harnessed him between them."
      },
      {
        question: "What lesson did Julian take away from surviving the pass?",
        options: ["Mountains should be climbed alone", "Survival relies on selfless solidarity, endurance, and respect for nature", "Speed is the only thing that matters in the Himalayas", "Always avoid trekking with guides"],
        correct_answer_index: 1,
        explanation: "Julian recognized that mountain survival is about mutual solidarity, endurance, and respecting nature."
      },
    ],
  },
  {
    id: "adv-cult-15",
    title: "Tracing the Sahara's Subterranean Rivers",
    category: "adult_intermediate",
    categoryName: "Macera & Kültür",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    topic: "Sahra Yeraltı Nehirleri Araştırması",
    desc: "Kavurucu Sahra Çölü'nün yüzlerce metre altında yatan fosil nehir yataklarını yer radarıyla haritalayan hidrojeologlar.",
    content: "Deploying ground-penetrating radar arrays and orbital synthetic aperture radar telemetry in the remote Tanezrouft basin of southern Algeria—a sun-baked desert region historically nicknamed the 'Land of Thirst'—hydrogeologist Dr. Leila Mansour led a pioneering geological mission. To the naked eye, the landscape was an unyielding expanse of hyper-arid stone reg and shifting sand dunes devoid of vegetation. However, radar frequencies tuned to penetrate dry surface sand revealed an astonishing paleogeological truth buried forty meters beneath the bedrock.\n\nBeneath the barren dunes lay the sprawling, dried-out channels of ancient mega-rivers—the Tamanrasset paleodrainage system—which flowed vigorously during the Green Sahara Holocene humid epoch six thousand years ago. In those fertile millennia, hippopotamuses, crocodiles, and pastoral human communities flourished where endless sand now reigns. More crucially for modern water security, Leila's geophysical survey aimed to map deep fossil aquifers trapped within porous Nubian sandstone formations.\n\nDrilling deep core test boreholes into the coordinates identified by radar, the expedition hit an artesian fossil reservoir two hundred and eighty meters down. When the pressure valve opened, sweet, clean water surged to the surface under natural artesian pressure, spilling across the cracked desert clay in glistening ribbons. Radiocarbon isotope analysis revealed that the pristine water had fell as tropical monsoon rain over twelve thousand years ago during the last glacial retreat.\n\nLeila understood the profound geopolitical and humanitarian implications of her discovery. By responsibly mapping these non-renewable fossil aquifers, arid North African nations could sustainably support green agriculture and village survival without exhausting vital resources. Packing up her telemetry consoles under a canopy of desert stars, Leila reflected that the greatest wonders of exploration are often those concealed beneath the surface of what seems desolate.",
    target_words: ["paleogeological", "aquifers", "artesian", "isotope"],
    target_vocabulary: [
      { word: "paleogeological", phonetic: "/ˌpeɪ.li.əʊˌdʒiː.əˈlɒdʒ.ɪ.kəl/", turkish_meaning: "eski jeolojik dönemlere ait", context_sentence: "Radar unmasked a hidden paleogeological river network." },
      { word: "aquifers", phonetic: "/ˈæk.wɪ.fərz/", turkish_meaning: "yeraltı su tutan kayaç katmanları, akiferler", context_sentence: "They mapped vast fossil aquifers trapped in sandstone." },
      { word: "artesian", phonetic: "/ɑːˈtiː.ʒən/", turkish_meaning: "artezyen (kendi doğal basıncıyla fışkıran)", context_sentence: "Pristine water erupted under natural artesian pressure." },
      { word: "isotope", phonetic: "/ˈaɪ.sə.təʊp/", turkish_meaning: "izotop (yaş tayini yapan atom çeşidi)", context_sentence: "Carbon isotope dating proved the water was 12,000 years old." },
    ],
    comprehension_questions: [
      {
        question: "What geological feature did radar telemetry discover beneath the Algerian desert sands?",
        options: ["An underground gold palace", "Ancient dried-out mega-river systems and fossil water aquifers", "A subterranean railway line", "Active volcanic lava tubes"],
        correct_answer_index: 1,
        explanation: "Radar revealed ancient mega-river channels from the Green Sahara epoch and fossil aquifers."
      },
      {
        question: "How old was the artesian fossil water discovered by the drilling borehole?",
        options: ["Fifty years old", "Over twelve thousand years old, dating back to the last glacial retreat", "Five hundred years old", "Two weeks old"],
        correct_answer_index: 1,
        explanation: "Isotope analysis confirmed the water fell as monsoon rain over twelve thousand years ago."
      },
      {
        question: "What humanitarian benefit does mapping fossil aquifers offer to arid nations?",
        options: ["Building luxury water parks", "Providing sustainable water security for agriculture and villages", "Selling bottled water to Europe", "Drying out the desert further"],
        correct_answer_index: 1,
        explanation: "Responsible mapping provides critical, sustainable water security for local agriculture and communities."
      },
    ],
  },
];

export const ADULT_INTERMEDIATE_STORIES = adventureCultureStories;
