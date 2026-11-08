import { Story } from "./types";

export const natureMiraclesStories: Story[] = [
  // ==========================================
  // LEVEL A (A1-A2, ~120-150 kelime, 2-3 dk)
  // ==========================================
  {
    id: "nature-01-fireflies",
    title: "The Fireflies of the Summer Forest",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    topic: "Yaz Gecesi Ateş Böcekleri",
    desc: "Yaz gecelerinde ormanı küçük fenerler gibi aydınlatan ateş böceklerinin soğuk ışık mucizesi.",
    content: "When warm summer dusk settles over the misty meadows, the forest edge begins to flicker with tiny yellow lights. These gentle sparks belong to fireflies, also called lightning bugs. Unlike human light bulbs that generate heat, fireflies produce what scientists call cold light through a natural chemical reaction in their abdomens.\n\nInside their luminous lanterns, a substance called luciferin mixes with oxygen, producing nearly one hundred percent light with zero wasted heat energy. Fireflies blink their glowing patterns to send friendly signals to each other and find mates in the dark. As hundreds of these beetles rise into the night air together, they turn the dark woods into a magical, twinkling universe.",
    target_words: ["meadows", "abdomens", "luminous", "reaction"],
    target_vocabulary: [
      { word: "meadows", phonetic: "/ˈmed.əʊz/", turkish_meaning: "çayırlar, otlaklar", context_sentence: "Fireflies danced across the dark grassy meadows." },
      { word: "abdomens", phonetic: "/ˈæb.də.mənz/", turkish_meaning: "karın kısımları", context_sentence: "Their abdomens glowed with soft yellow light." },
      { word: "luminous", phonetic: "/ˈluː.mɪ.nəs/", turkish_meaning: "ışıklı, parlak", context_sentence: "The luminous insects brightened the dark forest." },
      { word: "reaction", phonetic: "/riˈæk.ʃən/", turkish_meaning: "tepkime, reaksiyon", context_sentence: "A gentle chemical reaction produces cold light." },
    ],
    comprehension_questions: [
      {
        question: "Why is the light made by fireflies called 'cold light'?",
        options: ["It only appears during freezing winter", "It produces nearly all light with almost no wasted heat", "It is made of tiny ice crystals", "It freezes when touched"],
        correct_answer_index: 1,
        explanation: "Their bioluminescent reaction produces 100% light with virtually no thermal waste."
      },
      {
        question: "What substance inside the firefly's lantern reacts with oxygen?",
        options: ["Chlorophyll", "Luciferin", "Kerosene", "Sulfur"],
        correct_answer_index: 1,
        explanation: "Luciferin combines with oxygen inside the insect's abdomen to produce light."
      },
      {
        question: "Why do fireflies flash their glowing lights in the evening?",
        options: ["To frighten away large owls", "To communicate signals and locate mates in the dark", "To burn dry leaves", "To keep warm"],
        correct_answer_index: 1,
        explanation: "Flashing patterns are visual communication signals to locate mates."
      },
    ],
  },
  {
    id: "nature-02-whispering-birds",
    title: "The Secrets of the Whispering Birds",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80",
    topic: "Haberci Bülbüller",
    desc: "Şafak vaktinde ormanın sessizliğini bozan bülbüllerin zengin melodileri ve haberleşme sırları.",
    content: "Just before the morning sun crests the eastern horizon, the woods erupt in a rich musical chorus known as the dawn song. The sweetest voice in this choir belongs to the nightingale, a modest brown songbird with an astonishing vocal ability. Despite weighing only twenty grams, a male nightingale can produce more than two hundred distinct musical phrases.\n\nInside the bird's chest is a specialized vocal organ called the syrinx. It allows the nightingale to sing two different pitches simultaneously, harmonizing with itself in fluid melodies. Scientists have discovered that these songs are not random chirps; they mark territory boundaries, greet traveling companions, and warn fellow creatures when a hunting hawk appears in the sky.",
    target_words: ["chorus", "modest", "syrinx", "simultaneously"],
    target_vocabulary: [
      { word: "chorus", phonetic: "/ˈkɔː.rəs/", turkish_meaning: "koro, hep birlikte şarkı", context_sentence: "The morning forest greeted the sun with a joyous chorus." },
      { word: "modest", phonetic: "/ˈmɒd.ɪst/", turkish_meaning: "mütevazı, sade", context_sentence: "The small bird possessed a modest brown plumage." },
      { word: "syrinx", phonetic: "/ˈsɪr.ɪŋks/", turkish_meaning: "ses organı (kuşlara özgü)", context_sentence: "The syrinx enables complex acoustic harmonies." },
      { word: "simultaneously", phonetic: "/ˌsɪm.əlˈteɪ.ni.əs.li/", turkish_meaning: "aynı anda, eşzamanlı", context_sentence: "The nightingale sang two different musical notes simultaneously." },
    ],
    comprehension_questions: [
      {
        question: "What unique vocal organ allows songbirds to sing two notes at once?",
        options: ["The vocal cord", "The syrinx", "The beak", "The tracheal horn"],
        correct_answer_index: 1,
        explanation: "The syrinx is a specialized organ that produces two independent pitches simultaneously."
      },
      {
        question: "How many different song phrases can a single male nightingale produce?",
        options: ["Only two or three", "Around twenty", "More than two hundred", "Ten thousand"],
        correct_answer_index: 2,
        explanation: "A male nightingale can produce over two hundred distinct musical phrases."
      },
      {
        question: "What is one important purpose of bird songs in the forest?",
        options: ["To cause rain to fall", "To warn other birds about predators like hawks", "To help flowers open petals", "To put baby insects to sleep"],
        correct_answer_index: 1,
        explanation: "Their calls mark territories and warn neighbors of approaching predators."
      },
    ],
  },
  {
    id: "nature-03-chameleon",
    title: "The Chameleon's Color Symphony",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Bukalemunun Renk Oyunu",
    desc: "Kamuflaj ve duygu durumu için derisindeki mikroskobik kristal ızgaraları büken bukalemunun biyolojik sırrı.",
    content: "High in the leafy branches of Madagascar lives the panther chameleon, a slow-moving reptile famous for its kaleidoscopic transformations. Contrary to popular belief, chameleons do not change colors simply to match whatever background they touch. Instead, their skin shifts dramatically in response to temperature changes, sunlight intensity, and emotional states such as excitement or fear.\n\nBeneath their transparent outer skin lies a layer of microscopic guanine nanocrystals. By relaxing or tightening its dermal cells, the chameleon changes the spacing between these tiny crystal prisms. When the crystals are packed closely together, they reflect blue and green light; when stretched farther apart, they bounce back brilliant yellows, oranges, and fiery reds to intimidate rivals.",
    target_words: ["kaleidoscopic", "intensity", "nanocrystals", "intimidate"],
    target_vocabulary: [
      { word: "kaleidoscopic", phonetic: "/kəˌlaɪ.dəˈskɒp.ɪk/", turkish_meaning: "sürekli değişen, binbir renkli", context_sentence: "The reptile displayed kaleidoscopic flashes of turquoise and amber." },
      { word: "intensity", phonetic: "/ɪnˈten.sə.ti/", turkish_meaning: "yoğunluk, şiddet", context_sentence: "Skin tones shifted according to sunlight intensity." },
      { word: "nanocrystals", phonetic: "/ˈnæn.əʊˌkrɪs.təlz/", turkish_meaning: "nanokristaller (mikroskobik kristal parçacıklar)", context_sentence: "Guanine nanocrystals bend light rays like tiny mirrors." },
      { word: "intimidate", phonetic: "/ɪnˈtɪm.ɪ.deɪt/", turkish_meaning: "gözdağı vermek, korkutmak", context_sentence: "The lizard turned fiery red to intimidate its rival." },
    ],
    comprehension_questions: [
      {
        question: "What actually triggers color changes in chameleons?",
        options: ["Only the color of the paint on a wall", "Temperature, sunlight, and emotional states like excitement or anger", "What food they ate that morning", "The phase of the moon"],
        correct_answer_index: 1,
        explanation: "Color shifts respond to ambient temperature, light levels, and emotional excitement or fear."
      },
      {
        question: "What microscopic structures in the chameleon's skin manipulate light?",
        options: ["Tiny glass fibers", "Guanine nanocrystals", "Drops of colorful ink", "Magnetic sand grains"],
        correct_answer_index: 1,
        explanation: "Underneath its skin lies an array of guanine nanocrystals that alter their spacing."
      },
      {
        question: "What colors are reflected when the crystals are stretched farther apart?",
        options: ["Deep black and grey", "Dark navy blue and violet", "Brilliant yellows, oranges, and reds", "Pale white"],
        correct_answer_index: 2,
        explanation: "When crystal spacing widens, longer wavelengths like yellow, orange, and red are reflected."
      },
    ],
  },
  {
    id: "nature-04-honeybee-dance",
    title: "The Waggle Dance of the Honeybees",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 142,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Arıların Bal Dansı",
    desc: "Kovanın karanlığında açıları ve mesafeleri dans ritmiyle diğer arılara anlatan bal arılarının dili.",
    content: "Inside the humming darkness of a wooden beehive, worker bees perform an extraordinary communication ritual called the waggle dance. When a scout bee locates a rich field of lavender blossoms several kilometers away, she flies home to report her discovery. Stepping onto the vertical wax honeycomb, she begins to vibrate her abdomen and walk in a figure-eight pattern.\n\nThe angle of her dance relative to vertical gravity indicates the exact direction of the flowers in relation to the sun. Meanwhile, the duration of her buzzing waggle run tells the watching bees the precise distance to the nectar source—one second of dancing equals approximately one kilometer of flight. Intrigued hive mates feel her vibrations in the dark and fly straight to the blossoms.",
    target_words: ["ritual", "vibrate", "gravity", "duration"],
    target_vocabulary: [
      { word: "ritual", phonetic: "/ˈrɪtʃ.u.əl/", turkish_meaning: "ritüel, törensel davranış", context_sentence: "The scout performed an intricate waggle ritual on the wax." },
      { word: "vibrate", phonetic: "/vaɪˈbreɪt/", turkish_meaning: "titremek, titreşmek", context_sentence: "Her abdomen began to vibrate rapidly in the dark." },
      { word: "gravity", phonetic: "/ˈɡræv.ə.ti/", turkish_meaning: "yerçekimi", context_sentence: "She aligned her movement against the downward pull of gravity." },
      { word: "duration", phonetic: "/djʊəˈreɪ.ʃən/", turkish_meaning: "süre, zaman aralığı", context_sentence: "The duration of the buzz communicates the distance to fly." },
    ],
    comprehension_questions: [
      {
        question: "What geometric figure does a scout bee trace during her waggle dance?",
        options: ["A square box", "A figure-eight pattern", "A straight triangle", "A continuous straight line"],
        correct_answer_index: 1,
        explanation: "The bee moves across the honeycomb in a distinct figure-eight dance."
      },
      {
        question: "What does the angle of the dance communicate to the hive mates?",
        options: ["The sweetness of the flower nectar", "The exact direction of the flowers relative to the sun", "The speed of the wind", "The age of the queen bee"],
        correct_answer_index: 1,
        explanation: "The angle relative to gravity corresponds to the flight direction relative to the sun."
      },
      {
        question: "How does the dancing bee communicate the distance to the nectar field?",
        options: ["By changing her body temperature", "By the duration of her buzzing waggle run", "By bringing back flower petals", "By tapping her wings on the hive wall"],
        correct_answer_index: 1,
        explanation: "The length of time she waggles correlates directly with the flight distance."
      },
    ],
  },
  {
    id: "nature-05-desert-cactus",
    title: "The Blooming Cactus of the Sunlit Desert",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    topic: "Çölde Çiçek Açan Kaktüs",
    desc: "Kavurucu çöl sıcağında suyu sünger gibi gövdesine hapseden ve bir gecede göz alıcı taçyapraklar açan kaktüsler.",
    content: "The Sonoran Desert in Arizona is one of the driest places on Earth, where rain might not fall for ten straight months. Yet towering above the baked red gravel stands the mighty Saguaro cactus, a living botanical water reservoir. Instead of broad green leaves that lose moisture through evaporation, the cactus grows sharp thorns to deflect scorching wind and protect its precious fluid from thirsty animals.\n\nIts ribbed green stem expands like an accordion during rare desert rainstorms, absorbing up to three thousand liters of rainwater in a single week. Once a year under the cool night sky, magnificent white trumpet-shaped flowers burst open along the cactus crown. These fragrant blooms open for only twenty-four hours, attracting desert bats and honeybees before dropping seeds into the sand.",
    target_words: ["reservoir", "evaporation", "scorching", "fragrant"],
    target_vocabulary: [
      { word: "reservoir", phonetic: "/ˈrez.əv.wɑːr/", turkish_meaning: "su deposu, hazne", context_sentence: "The cactus serves as a living water reservoir in the desert." },
      { word: "evaporation", phonetic: "/ɪˌvæp.əˈreɪ.ʃən/", turkish_meaning: "buharlaşma", context_sentence: "Thorns prevent excessive moisture loss from evaporation." },
      { word: "scorching", phonetic: "/ˈskɔː.tʃɪŋ/", turkish_meaning: "kavurucu, yakıcı", context_sentence: "Desert plants endure scorching afternoon heat." },
      { word: "fragrant", phonetic: "/ˈfreɪ.ɡrənt/", turkish_meaning: "güzel kokulu, mis kokulu", context_sentence: "Fragrant white blossoms attracted nocturnal pollinators." },
    ],
    comprehension_questions: [
      {
        question: "Why does a cactus have sharp thorns instead of wide leaves?",
        options: ["To catch falling rain directly", "To minimize moisture loss from evaporation and deter animals", "To dig deeper into the earth", "To absorb sunlight faster"],
        correct_answer_index: 1,
        explanation: "Thorns deflect drying desert winds and prevent moisture loss while protecting water from animals."
      },
      {
        question: "How does the Saguaro stem absorb large amounts of rainwater quickly?",
        options: ["It shoots roots into the sky", "Its ribbed accordion-like trunk expands to hold thousands of liters", "It opens tiny mouths on its needles", "It digs into subterranean rivers"],
        correct_answer_index: 1,
        explanation: "Its pleated stem expands like an accordion to absorb and store massive volumes of rainwater."
      },
      {
        question: "How long do the magnificent nocturnal white cactus blossoms stay open?",
        options: ["For three whole weeks", "For only twenty-four hours", "Throughout the entire summer", "Just five minutes"],
        correct_answer_index: 1,
        explanation: "The fragrant blossoms open at night and last for only twenty-four hours."
      },
    ],
  },

  // ==========================================
  // LEVEL B (B1-B2, ~230-280 kelime, 4-5 dk)
  // ==========================================
  {
    id: "nature-06-wood-wide-web",
    title: "The Wood Wide Web: Mycelial Networks",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    topic: "Yeraltı Mantar Ağı (Mycelium)",
    desc: "Orman tabanının altında ağaçları birbirine bağlayan, besin ve tehlike sinyalleri taşıyan devasa mantar interneti.",
    content: "Beneath the fallen pine needles and mossy soil of temperate forests lies an intricate biological internet known to ecologists as the mycorrhizal network, or popular dubbed the 'Wood Wide Web'. This subterranean web consists of trillions of microscopic fungal filaments called hyphae, which wrap around and penetrate the delicate root tips of surrounding trees in a sophisticated symbiotic partnership.\n\nPlants and fungi have traded resources across this network for over four hundred million years. Trees synthesize surplus sugars through photosynthesis and deliver up to twenty percent of their carbon to the fungal web. In return, the mycelium—possessing vastly superior surface area—mines the soil for essential phosphorus, nitrogen, and deep moisture, pumping these vital minerals directly back into the host trees.\n\nMore astonishingly, forest ecologist Suzanne Simard discovered that the network operates as a decentralized mutual-aid cooperative. Mature 'mother trees' use mycelial channels to shuttle life-sustaining glucose to shaded young seedlings struggling to reach sunlight. Furthermore, when a Douglas fir is attacked by bark beetles, it sends chemical and electrical warning signals through the fungal network to neighboring birch trees, prompting them to synthesize protective tannins and defensive enzymes before the pests arrive.",
    target_words: ["filaments", "symbiotic", "decentralized", "tannins"],
    target_vocabulary: [
      { word: "filaments", phonetic: "/ˈfɪl.ə.mənts/", turkish_meaning: "iplikçikler, lifler", context_sentence: "Microscopic fungal filaments connect tree roots beneath the soil." },
      { word: "symbiotic", phonetic: "/ˌsɪm.baɪˈɒt.ɪk/", turkish_meaning: "ortakyaşar, simbiyotik", context_sentence: "Trees and fungi maintain a beneficial symbiotic relationship." },
      { word: "decentralized", phonetic: "/diːˈsen.trə.laɪzd/", turkish_meaning: "merkezi olmayan, dağıtık", context_sentence: "The forest operates as a decentralized nutrient distribution network." },
      { word: "tannins", phonetic: "/ˈtæn.ɪnz/", turkish_meaning: "tanenler (bitkisel savunma kimyasalları)", context_sentence: "Warned trees synthesize bitter tannins to repel insect pests." },
    ],
    comprehension_questions: [
      {
        question: "What do trees provide to the fungal mycelial network in exchange for minerals?",
        options: ["Oxygen gas", "Sugars and carbon produced through photosynthesis", "Dead bark wood", "Dry leaf litter"],
        correct_answer_index: 1,
        explanation: "Trees transfer up to 20% of their photosynthesized carbon sugars to the fungal filaments."
      },
      {
        question: "How do mature 'mother trees' support seedlings struggling in the forest understory?",
        options: ["By dropping their heavy branches", "By channeling glucose and nutrients through underground fungal threads", "By blocking all rain from reaching them", "By pulling them into the canopy"],
        correct_answer_index: 1,
        explanation: "Mother trees shuttle glucose to shaded seedlings through the mycorrhizal network."
      },
      {
        question: "What happens when a tree is attacked by insects according to Suzanne Simard's research?",
        options: ["It burns down surrounding vegetation", "It sends distress signals through fungi, prompting neighbors to produce defenses", "It immediately detaches from the soil", "It falls silent and dies quietly"],
        correct_answer_index: 1,
        explanation: "The attacked tree transmits chemical/electrical warnings, allowing neighboring trees to synthesize defensive enzymes."
      },
    ],
  },
  {
    id: "nature-07-unbreakable-tardigrade",
    title: "The Unbreakable Tardigrade",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Mikroskobik Su Ayısı Tardigrat",
    desc: "Uzay boşluğunda, mutlak sıfırda ve öldürücü radyasyonda hayatta kalabilen mikroskobik ekstremofil canlı.",
    content: "Measuring less than one millimeter in length, the tardigrade—commonly known as the water bear or moss piglet—ranks among the most resilient biological organisms ever discovered on Earth. These microscopic, eight-legged invertebrates thrive in commonplace environments like damp backyard moss and garden lichen, yet their physiological tolerance boundaries are nothing short of supernatural.\n\nWhen confronted with lethal environmental stress such as extreme desiccation, boiling heat, or toxic chemicals, tardigrades enter a dormant metabolic state known as cryptobiosis. The organism expels over ninety-five percent of the water from its body, retracts its stubby limbs, and curls into a dry, glass-like particle called a 'tun'. In this suspended state, its metabolic rate drops to less than 0.01 percent of normal levels, effectively pausing biological time.\n\nIn laboratory trials and spaceflight experiments, dehydrated tardigrade tuns have survived direct exposure to the vacuum of outer space, lethal ultraviolet solar radiation, temperatures plunging to minus 272 degrees Celsius (near absolute zero), and hydrostatic pressures six times greater than the deepest ocean trench. Once re-exposed to a single drop of clean water, the water bear rehydrates within hours, stretches its tiny legs, and resumes eating and reproducing as if nothing had occurred.",
    target_words: ["resilient", "desiccation", "cryptobiosis", "hydrostatic"],
    target_vocabulary: [
      { word: "resilient", phonetic: "/rɪˈzɪl.i.ənt/", turkish_meaning: "dayanıklı, zorluklara direnen", context_sentence: "Tardigrades are the most resilient creatures on Earth." },
      { word: "desiccation", phonetic: "/ˌdes.ɪˈkeɪ.ʃən/", turkish_meaning: "aşırı kuruma, susuz kalma", context_sentence: "They survive complete desiccation by curling into a tun." },
      { word: "cryptobiosis", phonetic: "/ˌkrɪp.təʊ.baɪˈəʊ.sɪs/", turkish_meaning: "kriptobiyoz (gizli yaşam / metabolik duraklama)", context_sentence: "During cryptobiosis, all metabolic processes almost completely halt." },
      { word: "hydrostatic", phonetic: "/ˌhaɪ.drəʊˈstæt.ɪk/", turkish_meaning: "hidrostatik, sıvı basıncına ait", context_sentence: "They endure extreme hydrostatic pressure in the deep ocean." },
    ],
    comprehension_questions: [
      {
        question: "What dormant metabolic state allows tardigrades to survive lethal environments?",
        options: ["Hibernation", "Cryptobiosis", "Metamorphosis", "Photosynthesis"],
        correct_answer_index: 1,
        explanation: "Tardigrades enter cryptobiosis, expelling water and halting metabolic activity."
      },
      {
        question: "What is the dry, curled state of a dormant tardigrade called?",
        options: ["A cocoon", "A chrysalis", "A tun", "A spore"],
        correct_answer_index: 2,
        explanation: "The dry, contracted ball form is scientifically known as a 'tun'."
      },
      {
        question: "How do dormant tardigrade tuns react when re-exposed to water?",
        options: ["They immediately dissolve", "They rehydrate within hours and resume normal life", "They transform into flying insects", "They remain frozen forever"],
        correct_answer_index: 1,
        explanation: "Upon adding water, tardigrades absorb moisture, unfurl their legs, and resume normal feeding."
      },
    ],
  },
  {
    id: "nature-08-monarch-migration",
    title: "The Continental Migration of Monarch Butterflies",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 265,
    coverImage: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80",
    topic: "Kral Kelebeklerinin Göçü",
    desc: "Kanada'dan Meksika'nın oyamel köknar ormanlarına uzanan 4500 kilometrelik çok kuşaklı mucizevi göç yolculuğu.",
    content: "Each autumn, as temperatures drop across North America, tens of millions of monarch butterflies embark upon an epic four-thousand-kilometer odyssey. Departing from breeding grounds in southern Canada and the northeastern United States, these delicate orange-and-black insects navigate across mountain ranges, prairies, and suburban highways to reach the high-altitude oyamel fir forests of central Mexico.\n\nWhat makes this aerial migration miraculous is that it is multigenerational. Individual adult monarchs during the summer live for only four to five weeks, breeding and laying eggs on toxic milkweed plants. However, the generation born in late August—known as the 'super generation'—undergoes reproductive diapause. This unique generation lives for eight to nine months, possessing the physiological stamina to fly thousands of miles southward.\n\nNavigating with uncanny precision, monarchs utilize an internal time-compensated sun compass located in their antennae, calibrated by circadian clock genes and cryptochrome light receptors that detect polarized light. When cloudy skies obscure the sun, their bodies rely on Earth's geomagnetic field to maintain course. In late November, millions congregate on the exact same sacred groves of Mexican fir trees that their great-great-grandparents visited the previous year, blanketing the branches in vibrant fluttering tapestries.",
    target_words: ["odyssey", "multigenerational", "diapause", "circadian"],
    target_vocabulary: [
      { word: "odyssey", phonetic: "/ˈɒd.ə.si/", turkish_meaning: "destansı uzun yolculuk, serüven", context_sentence: "The butterflies complete a harrowing continental odyssey." },
      { word: "multigenerational", phonetic: "/ˌmʌl.tiˌdʒen.əˈreɪ.ʃən.əl/", turkish_meaning: "çok kuşaklı, nesiller arası", context_sentence: "The round trip is completed across a multigenerational cycle." },
      { word: "diapause", phonetic: "/ˈdaɪ.ə.pɔːz/", turkish_meaning: "diyapoz (gelişimsel duraklama dönemi)", context_sentence: "The migratory generation enters reproductive diapause to conserve energy." },
      { word: "circadian", phonetic: "/sɜːˈkeɪ.di.ən/", turkish_meaning: "sirkadiyen (günlük 24 saatlik biyolojik ritim)", context_sentence: "Circadian clock genes calibrate their internal sun compass." },
    ],
    comprehension_questions: [
      {
        question: "How long does the autumn 'super generation' of monarch butterflies live compared to summer monarchs?",
        options: ["Only two days", "The same four to five weeks", "Eight to nine months", "Over five years"],
        correct_answer_index: 2,
        explanation: "The migratory 'super generation' lives for 8 to 9 months, allowing them to complete the southward flight and overwinter."
      },
      {
        question: "Where are the monarch butterfly's internal sun compass sensors located?",
        options: ["In its wing tips", "In its antennae", "Inside its abdominal muscles", "In its claws"],
        correct_answer_index: 1,
        explanation: "Their time-compensated sun compass sensors reside in their antennae."
      },
      {
        question: "Where do millions of monarchs spend the winter months in Mexico?",
        options: ["In desert cactus fields", "In high-altitude oyamel fir forests", "Inside limestone caves", "Along warm sandy beaches"],
        correct_answer_index: 1,
        explanation: "They gather in the microclimates of the high-altitude oyamel fir forests in central Mexico."
      },
    ],
  },
  {
    id: "nature-09-coral-symbiosis",
    title: "The Symbiotic Splendor of Coral Reefs",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    topic: "Mercan Resiflerinin Ortak Yaşamı",
    desc: "Tropikal sığ denizlerde kalsiyum karbonat iskeletleri inşa eden minik polipler ve zooxanthellae alglerinin işbirliği.",
    content: "Often referred to as the rainforests of the sea, coral reefs occupy less than one percent of the ocean floor, yet they harbor more than twenty-five percent of all marine species. These colossal underwater geological structures are not lifeless rocks, but vast colonies of soft-bodied invertebrate animals known as coral polyps. Working together over thousands of years, these tiny creatures secrete hard skeletons of calcium carbonate, creating towering subterranean ramparts.\n\nThe secret engine driving this marine wonder is an intimate endosymbiotic relationship between the polyp and microscopic single-celled dinoflagellate algae called zooxanthellae. Millions of these photosynthetic algae live safely nestled within the gastrodermal cells of the coral polyp. Through photosynthesis, zooxanthellae produce oxygen, glucose, glycerol, and amino acids, donating up to ninety percent of their energetic yield to the coral host. In return, the coral provides carbon dioxide, mineral nutrients, and sheltered exposure to tropical sunlight.\n\nTragically, when sea surface temperatures rise even one or two degrees Celsius above historical summer maximums, this delicate biochemical alliance collapses. Stressed by heat, zooxanthellae release toxic reactive oxygen species. To survive, the coral polyp must expel the algae, losing its vibrant coloration and exposing its stark white calcium skeleton—a devastating crisis known as coral bleaching.",
    target_words: ["endosymbiotic", "zooxanthellae", "photosynthesis", "bleaching"],
    target_vocabulary: [
      { word: "endosymbiotic", phonetic: "/ˌen.dəʊˌsɪm.baɪˈɒt.ɪk/", turkish_meaning: "hücre içi ortakyaşar", context_sentence: "Corals maintain an endosymbiotic partnership with algae." },
      { word: "zooxanthellae", phonetic: "/ˌzəʊ.ə.zænˈθel.iː/", turkish_meaning: "zooksantel (mercanlarda yaşayan mikroskobik fotosentetik alg)", context_sentence: "Zooxanthellae give corals their kaleidoscopic pigments." },
      { word: "photosynthesis", phonetic: "/ˌfəʊ.təʊˈsɪn.θə.sɪs/", turkish_meaning: "fotosentez", context_sentence: "Algae harness sunlight through aquatic photosynthesis." },
      { word: "bleaching", phonetic: "/ˈbliː.tʃɪŋ/", turkish_meaning: "ağarma, beyazlaşma (mercan ölümü)", context_sentence: "Elevated water temperatures trigger catastrophic coral bleaching." },
    ],
    comprehension_questions: [
      {
        question: "What percentage of marine species depend on coral reefs despite their small footprint?",
        options: ["Less than 1%", "About 5%", "More than 25%", "Nearly 90%"],
        correct_answer_index: 2,
        explanation: "Reefs cover under 1% of the seabed but support over 25% of all marine life."
      },
      {
        question: "What microscopic organism lives inside coral cells to provide nutrients through photosynthesis?",
        options: ["Bioluminescent bacteria", "Zooxanthellae algae", "Tiny sea sponges", "Planktonic shrimp"],
        correct_answer_index: 1,
        explanation: "Zooxanthellae are photosynthetic algae living within the polyp's cells."
      },
      {
        question: "Why do corals turn white during a 'bleaching' event?",
        options: ["They cover themselves in salt crystals", "Thermal stress forces polyps to expel their colorful symbiotic algae", "They freeze in cold ocean currents", "Predatory fish scrape away their skin"],
        correct_answer_index: 1,
        explanation: "When stressed by elevated temperatures, corals expel the colorful zooxanthellae, revealing the white skeleton."
      },
    ],
  },
  {
    id: "nature-10-venus-flytrap",
    title: "The Snap Trap: Hydraulic Physics of the Venus Flytrap",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Venüs Sinekkapanının Hidroliği",
    desc: "Kuzey Karolina bataklıklarında azot eksikliğini saniyenin onda birinde kapanan hidrolik tuzaklarla gideren etçil bitki.",
    content: "Native exclusively to a narrow seventy-five-mile coastal radius of nutrient-poor peat bogs in North and South Carolina, the Venus flytrap is one of nature’s most ingenious evolutionary marvels. Because waterlogged bog soils are severely deficient in bioavailable nitrogen and phosphorus, the plant evolved carnivorous adaptations to extract these essential fertilizers directly from digested insect prey.\n\nEach leaf trap consists of two hinged lobes fringed with interlocking marginal bristles. On the crimson interior of each lobe rest three sensitive, microscopic trigger hairs. To prevent wasting metabolic energy on false alarms like falling raindrops or windblown pine needles, the flytrap operates a biological memory counter: a single mechanical deflection of a trigger hair generates an action potential that primes the trap, but will not close it.\n\nOnly if a second hair is stimulated—or the same hair is struck a second time within twenty seconds—does the trap snap shut in one-tenth of a second. This lightning reflex does not rely on animal muscle fibers; rather, it is driven by an elastic instability and rapid hydraulic cell expansion. Cells on the outer surface pump hydrogen ions into their cell walls, causing them to rapidly absorb water and bow inward, snapping the curved leaves from convex to concave like a bistable hair clip, imprisoning the victim in an airtight digestive chamber.",
    target_words: ["carnivorous", "deflection", "potential", "bistable"],
    target_vocabulary: [
      { word: "carnivorous", phonetic: "/kɑːˈnɪv.ər.əs/", turkish_meaning: "etçil, böcek yiyen", context_sentence: "Carnivorous plants flourish in nitrogen-poor wetland bogs." },
      { word: "deflection", phonetic: "/dɪˈflek.ʃən/", turkish_meaning: "bükülme, yana eğilme", context_sentence: "A gentle deflection of the trigger hair generates an electrical signal." },
      { word: "potential", phonetic: "/pəˈten.ʃəl/", turkish_meaning: "potansiyel (biyoelektrik aksiyon potansiyeli)", context_sentence: "An action potential races through the plant tissues." },
      { word: "bistable", phonetic: "/baɪˈsteɪ.bəl/", turkish_meaning: "çift kararlı (iki stabil konum arasında hızla geçiş yapan)", context_sentence: "The leaf functions like a bistable spring mechanism." },
    ],
    comprehension_questions: [
      {
        question: "Why did the Venus flytrap evolve carnivorous habits in coastal bogs?",
        options: ["Because it receives no sunlight", "Because wetland peat soils lack essential nitrogen and phosphorus", "To protect itself from herbivore deer", "Because it cannot absorb ground water"],
        correct_answer_index: 1,
        explanation: "Bog soils are severely deficient in nitrogen, forcing the plant to obtain nutrients from animal prey."
      },
      {
        question: "How does the plant avoid snapping shut on raindrops or falling twigs?",
        options: ["It smells the difference", "It requires two trigger hair touches within twenty seconds before firing", "It only hunts during pitch-black nights", "It waits for buzzing sounds"],
        correct_answer_index: 1,
        explanation: "It counts electrical impulses: two hair touches within twenty seconds are required to trigger closure."
      },
      {
        question: "What physical mechanism allows the trap to snap shut in one-tenth of a second?",
        options: ["Muscle tissue contractions", "Rapid hydraulic cell expansion and elastic curvature snap", "Chemical glue melting", "Magnetic attraction"],
        correct_answer_index: 1,
        explanation: "Hydraulic cellular swelling rapidly flips the leaf curvature from convex to concave."
      },
    ],
  },

  // ==========================================
  // LEVEL C (C1-C2, ~330-380 kelime, 5-6 dk)
  // ==========================================
  {
    id: "nature-11-mariana-trench",
    title: "The Bioluminescent Mysteries of the Mariana Trench",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    topic: "Mariana Çukuru Biyolüminesansı",
    desc: "11.000 metre derinlikteki Challenger Çukuru'nda sıfır ışık, dondurucu soğuk ve devasa basınçta parıldayan hadal ekosistemler.",
    content: "Plunging nearly eleven kilometers into the oceanic lithosphere in the western Pacific Ocean, the Challenger Deep of the Mariana Trench marks the abyssal frontier of terrestrial biology—the hadal zone. Here, sunlight is extinguished entirely within the upper two hundred meters, consigning the canyon to perpetual pitch-black frigidity just above freezing. Moreover, hydrostatic pressure reaches an astounding one thousand one hundred atmospheres—equivalent to the weight of fifty jumbo jets stacked upon a human head.\n\nYet, contrary to nineteenth-century oceanographic assumptions that the hadal abyss was a sterile, lifeless wasteland, robotic submersibles like Nereus and deep-sea landers have revealed a vibrant, alien biosphere. Because ambient sunlight is absent, over ninety percent of abyssal creatures generate their own living light through specialized bioluminescent organs known as photophores. Luciferin-luciferase enzymatic pathways produce haunting blue and green photons that travel furthest through seawater.\n\nOrganisms utilize this living illumination for predatory deception, defense, and mating. The anglerfish dangles a glowing esca lantern packed with symbiotic Photobacterium ahead of needle-like jaws to lure curious amphipods. Hatchetfish utilize ventral photophore arrays for counterillumination: by matching the downwelling celestial glow from surface ripples, they render their silhouettes completely invisible to upward-looking predators below.\n\nAt the cellular level, life at hadal depths requires profound biochemical adaptations. Normal cell membranes would solidify into rigid paraffin under eleven hundred atmospheres. Abyssal fish synthesize high concentrations of trimethylamine N-oxide (TMAO) and piezolytes—specialized organic osmolytes that stabilize cell membranes and prevent water molecules from being forced inside protein structures, allowing delicate biological processes to flourish under crushing pressures that would pulverize surface fauna.",
    target_words: ["hydrostatic", "photophores", "counterillumination", "piezolytes"],
    target_vocabulary: [
      { word: "hydrostatic", phonetic: "/ˌhaɪ.drəʊˈstæt.ɪk/", turkish_meaning: "hidrostatik (derin su basıncına ait)", context_sentence: "Creatures withstand crushing hydrostatic pressure in the hadal zone." },
      { word: "photophores", phonetic: "/ˈfəʊ.tə.fɔːrz/", turkish_meaning: "fotoforlar (ışık üreten organlar)", context_sentence: "Ventral photophores emit soft blue bioluminescence." },
      { word: "counterillumination", phonetic: "/ˌkaʊn.tər.ɪˌluː.mɪˈneɪ.ʃən/", turkish_meaning: "karşı-aydınlatma (alt silueti gizleyen biyolojik kamuflaj)", context_sentence: "Hatchetfish use counterillumination to blend with surface glow." },
      { word: "piezolytes", phonetic: "/paɪˈez.əʊ.laɪts/", turkish_meaning: "piezolitler (yüksek basınca karşı hücresel koruyucu moleküller)", context_sentence: "Piezolytes protect vital proteins from conformational deformation." },
    ],
    comprehension_questions: [
      {
        question: "How much hydrostatic pressure exists at the bottom of the Mariana Trench?",
        options: ["One atmosphere", "Ten atmospheres", "Approximately 1,100 atmospheres", "One million atmospheres"],
        correct_answer_index: 2,
        explanation: "Hydrostatic pressure reaches approximately 1,100 atmospheres in the Challenger Deep."
      },
      {
        question: "What camouflage technique do hatchetfish employ with their belly photophores?",
        options: ["Blinding their enemies with a red flash", "Counterillumination matching downwelling surface light to erase their silhouette", "Pretending to be toxic jellyfish", "Heating the surrounding water"],
        correct_answer_index: 1,
        explanation: "They match the dim downwelling sunlight to erase their silhouette from predators hunting beneath them."
      },
      {
        question: "What biochemical compound prevents hadal fish proteins from warping under crushing pressures?",
        options: ["Sodium chloride", "Trimethylamine N-oxide (TMAO) and piezolytes", "High blood alcohol", "Solid paraffin"],
        correct_answer_index: 1,
        explanation: "TMAO and piezolytes stabilize cellular proteins and prevent water intrusion under extreme pressure."
      },
    ],
  },
  {
    id: "nature-12-acacia-chemical-defense",
    title: "Phytohormone Whispers: The Chemical Defense Networks of Acacias",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    topic: "Akasya Ağaçlarının Kimyasal İletişimi",
    desc: "Afrika savanasında zürafalar yaprakları kemirirken komşularına etilen gazıyla haber veren akasyaların savunma sistemi.",
    content: "Across the sun-baked plains of the East African savanna, the umbrella thorn acacia (Vachellia tortilis) appears as a passive, silent sentinel enduring grazing pressures from herds of impalas, elephants, and giraffes. However, pioneering field research by zoologist Wouter van Hoven demonstrated that these trees participate in sophisticated inter-organismal chemical communication—an airborne immune response orchestrated by volatile organic compounds.\n\nWhen a giraffe begins stripping thorny branches, the mechanical wounding of the leaves and contact with ruminant saliva triggers an immediate biochemical cascade. Within minutes, the targeted acacia synthesizes and pumps high concentrations of bitter polyphenolic tannins from its root reserves into its foliage. At high levels, these tannins bind to dietary proteins in the giraffe’s stomach, inhibiting digestive enzymes and rendering the leaves unpalatable and potentially toxic.\n\nSimultaneously, the damaged acacia synthesizes and releases ethylene gas—a volatile gaseous phytohormone—into the surrounding breeze. Drifting downwind over distances of up to forty meters, this gaseous signal is absorbed through the stomata of neighboring acacia trees. Upon detecting the airborne warning, the neighboring trees immediately begin flooding their own leaves with lethal tannins, preemptively arming themselves before the browsing herbivores arrive.\n\nIn response to this sophisticated floral defense, giraffes have co-evolved a counter-strategy: they only browse a single acacia tree for a few minutes before moving on, deliberately walking upwind rather than downwind, avoiding trees that have already received the chemical warning. This savanna dynamic illustrates how plant life engages in dynamic sensory warfare, shattering the outdated conception of vegetation as inert and defenseless.",
    target_words: ["polyphenolic", "unpalatable", "phytohormone", "stomata"],
    target_vocabulary: [
      { word: "polyphenolic", phonetic: "/ˌpɒl.i.fəˈnɒl.ɪk/", turkish_meaning: "polifenolik (acı koruyucu bitki kimyasalları)", context_sentence: "Acacias pump polyphenolic tannins into their leafy branches." },
      { word: "unpalatable", phonetic: "/ʌnˈpæl.ə.tə.bəl/", turkish_meaning: "yenilemez, tadı çok acı/kötü", context_sentence: "Tannins make the foliage unpalatable and toxic to grazers." },
      { word: "phytohormone", phonetic: "/ˌfaɪ.təʊˈhɔː.məʊn/", turkish_meaning: "bitki hormonu", context_sentence: "Ethylene is an airborne phytohormone mediating plant defense." },
      { word: "stomata", phonetic: "/ˈstəʊ.mə.tə/", turkish_meaning: "stomalar (yaprak gözenekleri)", context_sentence: "Neighboring leaves absorb the gaseous alarm through their stomata." },
    ],
    comprehension_questions: [
      {
        question: "What volatile gas does a wounded acacia tree release to warn downwind neighbors?",
        options: ["Carbon monoxide", "Pure methane", "Ethylene gas", "Sulfur dioxide"],
        correct_answer_index: 2,
        explanation: "Damaged foliage synthesizes and emits ethylene gas, an airborne phytohormone."
      },
      {
        question: "How do high tannin levels protect the acacia from being stripped by giraffes?",
        options: ["They produce sharp wooden spikes", "They bind to proteins and block digestive enzymes in the grazer's stomach", "They make the leaves smell like rotten meat", "They set fire to the branch"],
        correct_answer_index: 1,
        explanation: "Tannins bind to proteins, disrupting digestion and making the leaves bitter and toxic."
      },
      {
        question: "How have giraffes co-evolved their browsing behavior to counter this chemical alarm system?",
        options: ["They eat roots underground", "They only feed at night", "They deliberately walk upwind to feed on unwarned trees", "They drink seawater to neutralize tannins"],
        correct_answer_index: 2,
        explanation: "Giraffes feed briefly and walk upwind, avoiding downwind trees that detected the ethylene signal."
      },
    ],
  },
  {
    id: "nature-13-epigenetic-olfactory",
    title: "Olfactory Memory and Transgenerational Epigenetic Inheritance",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Koku Hafızası ve Epigenetik Aktarım",
    desc: "Travmatik kokusal deneyimlerin DNA dizilimini değiştirmeden kuşaklar boyu aktarıldığı epigenetik devrim.",
    content: "For over a century, classical Mendelian genetics rested upon the unshakeable dogma of August Weismann's 'germline barrier'—the principle that acquired somatic experiences, memories, or behavioral adaptations cannot be physically transmitted to future generations through biological reproduction. However, in 2013, neurobiologists Brian Dias and Kerry Ressler at Emory University conducted a landmark study that radically redefined our comprehension of hereditary memory through the lens of epigenetics.\n\nIn controlled experiments, male mice were conditioned to associate the sweet, almond-like scent of acetophenone with a mild electric foot shock. Over successive trials, the exposed mice developed an intense behavioral fear response, freezing whenever acetophenone molecules drifted into their enclosure. Remarkably, when these conditioned mice were bred with unexposed females, their offspring (F1 generation)—and subsequently their grandchildren (F2 generation)—demonstrated heightened behavioral sensitivity and acute startle responses to the specific acetophenone odor, despite having never experienced the mild shock nor had contact with their conditioned ancestors.\n\nNeuroanatomical dissection revealed that the offspring possessed significantly enlarged glomeruli—specialized neural structures in the olfactory bulb dedicated to processing acetophenone signals—as well as an increased density of M71 olfactory sensory neurons. The researchers discovered that the transmission was biological rather than cultural: the traumatized father’s sperm showed distinct hypomethylation (the removal of methyl chemical tags) on the promoter region of the Olfr151 gene, which codes for the acetophenone receptor.\n\nThis historic discovery demonstrated that environmental adversity, trauma, and survival memories can cast lasting transgenerational shadows. Epigenetic mechanisms, such as DNA methylation, histone acetylation, and non-coding microRNAs, allow an organism to pre-adapt its progeny to specific ecological perils without altering the underlying nucleotide sequences of the genome.",
    target_words: ["epigenetics", "acetophenone", "glomeruli", "hypomethylation"],
    target_vocabulary: [
      { word: "epigenetics", phonetic: "/ˌep.ɪ.dʒəˈnet.ɪks/", turkish_meaning: "epigenetik (DNA dizilimini değiştirmeden gen ifadesini inceleyen bilim)", context_sentence: "Epigenetics explains how ancestral trauma influences offspring." },
      { word: "acetophenone", phonetic: "/ˌæs.ɪ.təʊ.fɪˈnəʊn/", turkish_meaning: "asetofenon (badem kokulu organik bileşik)", context_sentence: "Mice were conditioned to fear the scent of acetophenone." },
      { word: "glomeruli", phonetic: "/ɡləˈmer.jʊ.laɪ/", turkish_meaning: "glomerüller (koku soğancığındaki sinir yumakları)", context_sentence: "The offspring developed enlarged olfactory glomeruli." },
      { word: "hypomethylation", phonetic: "/ˌhaɪ.pəʊˌmeθ.ɪˈleɪ.ʃən/", turkish_meaning: "hipometilasyon (metil gruplarının azalmasıyla genin açılması)", context_sentence: "DNA hypomethylation in sperm cells unlocked the receptor gene." },
    ],
    comprehension_questions: [
      {
        question: "What scented chemical compound was paired with a mild foot shock in the experiment?",
        options: ["Peppermint oil", "Acetophenone (cherry-almond aroma)", "Eucalyptus extract", "Rotten egg sulfur"],
        correct_answer_index: 1,
        explanation: "Mice were conditioned to associate the sweet aroma of acetophenone with a mild shock."
      },
      {
        question: "What physical alteration was observed in the olfactory brains of the unconditioned offspring?",
        options: ["They lost all sense of taste", "They developed enlarged glomeruli and denser sensory neurons for that specific odor", "Their brains shrank by half", "They became completely blind"],
        correct_answer_index: 1,
        explanation: "Offspring possessed structurally enlarged glomeruli dedicated to detecting acetophenone."
      },
      {
        question: "Through what biological mechanism was this traumatic association transmitted across generations?",
        options: ["Verbal communication in the nest", "Epigenetic hypomethylation on the receptor gene within sperm DNA", "Infections by brain parasites", "Random genetic mutations"],
        correct_answer_index: 1,
        explanation: "Hypomethylation (epigenetic mark changes) on the Olfr151 gene in sperm carried the adaptation."
      },
    ],
  },
  {
    id: "nature-14-hydrothermal-vents",
    title: "Chemosynthetic Eden: Hydrothermal Vents of the Abyssal Ridge",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Hidrotermal Bacalarda Kemosentez",
    desc: "Güneş ışığından bağımsız, sülfürü enerjiye dönüştüren derin deniz hidrotermal ekosistemleri ve yaşamın kökeni.",
    content: "In 1977, marine geologists aboard the research submersible Alvin explored the volcanic Galapagos Rift, two and a half kilometers beneath the Pacific Ocean surface. Expecting a monotonous, desolate expanse of basalt lava, the scientists were stunned to encounter towering mineral chimneys spewing black plumes of mineral-rich fluid at temperatures exceeding four hundred degrees Celsius. Even more shocking was the surrounding oasis of luxuriant life: two-meter-tall crimson tube worms, ghostly white crabs, and dense colonies of giant clams.\n\nThis paradigm-shifting discovery overturned the fundamental ecological dogma that all terrestrial life is inexorably tethered to solar photosynthesis. At hydrothermal vents—commonly called 'black smokers'—the entire trophic pyramid is anchored upon chemosynthesis. Seawater percolating deep into volcanic crust cracks is superheated by underlying magma chambers, leaching out dissolved hydrogen sulfide, methane, iron, and manganese.\n\nExtremophilic chemolithoautotrophic bacteria metabolize the toxic hydrogen sulfide through chemical oxidation, harnessing the energy liberated from breaking chemical bonds to fix inorganic carbon dioxide into nutritious glucose. The giant hydrothermal tube worm Riftia pachyptila has completely discarded its mouth, gut, and digestive tract; instead, it harbors billions of symbiotic sulfur-oxidizing bacteria within a specialized vascular organ known as a trophosome. The worm’s bright red plume contains a unique hemoglobin capable of simultaneously transporting both oxygen and toxic sulfide through its bloodstream without poisoning its tissues.\n\nThese subterranean hydrothermal chimneys provide compelling astrobiological analogs for how primordial life may have originated on early Archean Earth—and offer promising models for where extraterrestrial life might thrive today in the subsurface ice-covered oceans of Jupiter's moon Europa and Saturn's moon Enceladus.",
    target_words: ["chemosynthesis", "chemolithoautotrophic", "trophosome", "astrobiological"],
    target_vocabulary: [
      { word: "chemosynthesis", phonetic: "/ˌkiː.məʊˈsɪn.θə.sɪs/", turkish_meaning: "kemosentez (kimyasal tepkimelerle organik besin üretimi)", context_sentence: "Chemosynthesis powers deep-sea hydrothermal communities without sunlight." },
      { word: "chemolithoautotrophic", phonetic: "/ˌkiː.məʊˌlɪθ.əʊˌɔː.təˈtrɒf.ɪk/", turkish_meaning: "kemolitoototrof (inorganik minerallerle beslenen bakteri)", context_sentence: "Chemolithoautotrophic bacteria oxidize toxic hydrogen sulfide." },
      { word: "trophosome", phonetic: "/ˈtrəʊ.fə.səʊm/", turkish_meaning: "trofozom (tüp solucanında bakteri barındıran organ)", context_sentence: "The tube worm feeds via endosymbionts housed in its vascular trophosome." },
      { word: "astrobiological", phonetic: "/ˌæs.trəʊˌbaɪ.əˈlɒdʒ.ɪ.kəl/", turkish_meaning: "astro-biyolojik, uzay biyolojisine ait", context_sentence: "Black smokers serve as prime astrobiological models for alien ocean moons." },
    ],
    comprehension_questions: [
      {
        question: "What metabolic process forms the primary base of the food web at hydrothermal vents?",
        options: ["Solar photosynthesis", "Chemosynthesis driven by bacterial sulfide oxidation", "Nuclear fission", "Thermal digestion of floating seaweed"],
        correct_answer_index: 1,
        explanation: "Chemosynthetic bacteria oxidize toxic hydrogen sulfide, generating organic nutrients without sunlight."
      },
      {
        question: "How does the giant tube worm Riftia pachyptila obtain its nourishment?",
        options: ["It catches passing shrimp with tentacle nets", "It absorbs nutrients produced by symbiotic bacteria living in its trophosome", "It eats volcanic ash deposits", "It grazes on mineral chimney crystals"],
        correct_answer_index: 1,
        explanation: "Lacking a mouth and digestive tract, it relies entirely on symbiotic sulfur-oxidizing bacteria in its trophosome."
      },
      {
        question: "Why are hydrothermal vents of paramount interest to astrobiologists studying space?",
        options: ["They shoot lasers into space", "They demonstrate life can thrive in dark, ice-covered oceans like Europa and Enceladus", "They contain pieces of Mars meteorites", "They create artificial gravity"],
        correct_answer_index: 1,
        explanation: "They show that complex life can thrive without sunlight in subsurface oceans of icy moons."
      },
    ],
  },
  {
    id: "nature-15-quantum-avian-navigation",
    title: "Quantum Navigation: Cryptochromes and Avian Magnetoreception",
    category: "nature_miracles",
    categoryName: "Doğa Mucizeleri & Biyoloji",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80",
    topic: "Kuantum Biyolojisi ve Göçmen Kuşlar",
    desc: "Avrupa kızılgerdanının gözündeki kriptokrom proteinlerinde gerçekleşen kuantum dolanıklık ve manyetik yön bulma.",
    content: "For decades, naturalists marveled at how migratory birds, such as the European robin (Erithacus rubecula), navigate thousands of kilometers across featureless oceans and starless nights to pinpoint the exact wintering hedgerow with surgical precision. While classical biology proposed microscopic magnetite iron crystals in bird beaks as magnetic sensors, recent breakthroughs at the intersection of biophysics and quantum mechanics have unveiled a vastly more astonishing reality: birds literally visualize Earth’s invisible geomagnetic field lines through quantum entanglement.\n\nWithin the specialized UV-blue photoreceptor cells of the avian retina resides a light-sensitive flavoprotein named Cryptochrome-4 (Cry4). When a photon of blue ambient light enters the bird's eye, it strikes the flavin adenine dinucleotide (FAD) cofactor embedded inside the Cry4 molecule. This photon absorption triggers an ultra-fast cascade of electron transfers across a chain of four tryptophan amino acid residues, generating a spatially separated 'radical pair' of molecules, each bearing an unpaired electron.\n\nAccording to quantum mechanics, the spins of these two entangled electrons fluctuate synchronously between two configurations: the singlet state (antiparallel spins) and the triplet state (parallel spins). Because the interconversion rate between these quantum states is exquisitely sensitive to the orientation of Earth's extraordinarily weak geomagnetic field (roughly fifty microteslas), the chemical lifetime of the radical pair varies according to the angle of the bird's head relative to the planet's magnetic field lines.\n\nNeurobiologists hypothesize that this quantum chemical fluctuation is transduced by retinal ganglion cells into modulated visual patterns—manifesting as a subtle halo of light or shadow superimposed upon the bird’s normal eyesight. Consequently, migratory songbirds do not simply 'feel' magnetic north like a mechanical compass needle; they navigate by literally seeing the curvature of planetary magnetic fields painted across the sky.",
    target_words: ["magnetoreception", "cryptochrome", "entanglement", "transduced"],
    target_vocabulary: [
      { word: "magnetoreception", phonetic: "/ˌmæɡ.nɪ.təʊ.rɪˈsep.ʃən/", turkish_meaning: "manyetoresepsiyon (manyetik alanı hissetme duyusu)", context_sentence: "Avian magnetoreception relies on quantum photochemistry." },
      { word: "cryptochrome", phonetic: "/ˈkrɪp.tə.krəʊm/", turkish_meaning: "kriptokrom (mavi ışığa duyarlı göz proteini)", context_sentence: "Cryptochrome-4 proteins in the retina capture blue photons." },
      { word: "entanglement", phonetic: "/ɪnˈtæŋ.ɡəl.mənt/", turkish_meaning: "dolanıklık (kuantum fiziğinde parçacık eşleşmesi)", context_sentence: "Quantum entanglement governs the spin of the radical pair." },
      { word: "transduced", phonetic: "/trænzˈdjuːst/", turkish_meaning: "dönüştürülmüş (biyolojik sinyale çevrilmiş)", context_sentence: "Quantum states are transduced into neural visual perceptions." },
    ],
    comprehension_questions: [
      {
        question: "What specialized protein inside the avian eye enables quantum magnetoreception?",
        options: ["Hemoglobin", "Cryptochrome-4 (Cry4)", "Keratin", "Collagen"],
        correct_answer_index: 1,
        explanation: "Cryptochrome-4 is the blue-light sensitive flavoprotein in the retina responsible for quantum sensing."
      },
      {
        question: "What quantum phenomenon occurs when blue light strikes the Cryptochrome molecule?",
        options: ["Nuclear fusion", "Generation of an entangled electron radical pair whose spin states alter with magnetic angles", "Complete vaporization of retinal cells", "Conversion of light into radio waves"],
        correct_answer_index: 1,
        explanation: "Blue photons generate an entangled radical pair whose singlet-triplet transitions respond to geomagnetic fields."
      },
      {
        question: "How do scientists believe the bird experiences the magnetic field visually?",
        options: ["As a loud acoustic humming sound", "As a subtle modulated pattern of light or shadow overlaid on their eyesight", "As an electrical shock on their claws", "By smelling geomagnetic polarity"],
        correct_answer_index: 1,
        explanation: "The magnetic information is processed through visual pathways, likely perceived as light or dark patterns across their vision."
      },
    ],
  },
];

export const NATURE_MIRACLES_STORIES = natureMiraclesStories;
