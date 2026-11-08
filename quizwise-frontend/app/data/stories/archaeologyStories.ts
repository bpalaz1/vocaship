import { Story } from "./types";

export const archaeologyStories: Story[] = [
  // ==========================================
  // LEVEL A (A1-A2, ~120-150 kelime, 2-3 dk)
  // ==========================================
  {
    id: "arch-01-penicillin",
    title: "The Accidental Discovery of Penicillin",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 142,
    coverImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    topic: "Penisilinin Keşfi",
    desc: "1928 yılında Alexander Fleming'in açık unuttuğu cam petri kabında insanlık tarihini değiştiren küfün hikayesi.",
    content: "In September 1928, Scottish doctor Alexander Fleming returned to his London laboratory after a relaxing holiday. On his wooden workbench sat a forgotten pile of glass petri dishes containing bacterial cultures. To his surprise, he noticed something strange on one dish. A bluish-green mold called Penicillium was growing near the edge.\n\nAround this fuzzy mold was a clear circular zone where harmful bacteria had completely dissolved and disappeared. Instead of throwing the messy plate away, Fleming studied it closely under his microscope. He realized the humble mold produced a miraculous natural substance capable of killing dangerous microbes without harming human cells. This lucky accident led to modern antibiotics, saving millions of lives worldwide.",
    target_words: ["laboratory", "bacterial", "microscope", "antibiotics"],
    target_vocabulary: [
      { word: "laboratory", phonetic: "/ləˈbɒr.ə.tər.i/", turkish_meaning: "laboratuvar", context_sentence: "The scientist worked inside a busy research laboratory." },
      { word: "bacterial", phonetic: "/bækˈtɪə.ri.əl/", turkish_meaning: "bakteriyel, bakterilere ait", context_sentence: "He studied harmful bacterial infections on glass plates." },
      { word: "microscope", phonetic: "/ˈmaɪ.krə.skəʊp/", turkish_meaning: "mikroskop", context_sentence: "We inspected the tiny cells through a powerful microscope." },
      { word: "antibiotics", phonetic: "/ˌæn.ti.baɪˈɒt.ɪks/", turkish_meaning: "antibiyotikler", context_sentence: "Antibiotics cure infections and save patient lives." },
    ],
    comprehension_questions: [
      {
        question: "Where did Alexander Fleming discover the mold that kills bacteria?",
        options: ["In a damp garden cellar", "On a forgotten petri dish in his laboratory", "In an ancient medical book", "Inside a bottle of wine"],
        correct_answer_index: 1,
        explanation: "Fleming noticed the bluish mold on a forgotten petri dish after returning from holiday."
      },
      {
        question: "What happened to the bacteria directly around the mold spot?",
        options: ["They multiplied rapidly", "They completely dissolved and disappeared", "They turned bright red", "They froze into crystals"],
        correct_answer_index: 1,
        explanation: "Around the mold was a clear circular zone where bacteria had completely dissolved."
      },
      {
        question: "What modern medical treatment emerged from Fleming's accidental discovery?",
        options: ["X-ray imaging", "Modern antibiotics", "Vaccines for smallpox", "Painkiller aspirin"],
        correct_answer_index: 1,
        explanation: "The discovery of penicillin led directly to the development of modern antibiotics."
      },
    ],
  },
  {
    id: "arch-02-compass",
    title: "The Invention of the First Compass",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 138,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    topic: "İlk Pusulanın İcadı",
    desc: "Antik Çin'de manyetik lodestone taşından yapılan kaşık şeklindeki ilk yön bulma aletinin serüveni.",
    content: "More than two thousand years ago in ancient Han dynasty China, scholars discovered a curious black mineral known as lodestone. This natural iron ore possessed an invisible magnetic pull. Craftsmen carved the hard lodestone into the shape of a polished spoon with a balanced handle and set it upon a smooth bronze plate.\n\nWhenever someone spun the spoon, it spun freely and always stopped with its handle pointing exactly toward the southern horizon. At first, Chinese diviners used this miraculous tool to align temples and houses with cosmic energies. Later, sailors magnetized thin steel sewing needles, floated them in water bowls, and safely crossed open oceans on cloudy nights.",
    target_words: ["mineral", "lodestone", "magnetic", "align"],
    target_vocabulary: [
      { word: "mineral", phonetic: "/ˈmɪn.ər.əl/", turkish_meaning: "maden, mineral", context_sentence: "Lodestone is a magnetic natural mineral." },
      { word: "lodestone", phonetic: "/ˈləʊd.stəʊn/", turkish_meaning: "manyetit, doğal mıknatıs taşı", context_sentence: "Ancient craftsmen carved tools from raw lodestone." },
      { word: "magnetic", phonetic: "/mæɡˈnet.ɪk/", turkish_meaning: "manyetik, çekici", context_sentence: "The needle felt an invisible magnetic pull toward the poles." },
      { word: "align", phonetic: "/əˈlaɪn/", turkish_meaning: "aynı hizaya getirmek, yönlendirmek", context_sentence: "They used the device to align temple gates with the south." },
    ],
    comprehension_questions: [
      {
        question: "What natural mineral was used to carve the first Chinese compass?",
        options: ["Polished jade", "Magnetic lodestone", "Volcanic obsidian", "Clear quartz"],
        correct_answer_index: 1,
        explanation: "Ancient Han dynasty artisans carved the compass spoon from natural magnetic lodestone."
      },
      {
        question: "In which direction did the handle of the spoon always point when it stopped spinning?",
        options: ["North", "South", "East", "West"],
        correct_answer_index: 1,
        explanation: "The spoon always came to rest with its handle pointing directly toward the south."
      },
      {
        question: "How did sailors later adapt the compass for long ocean voyages?",
        options: ["By training homing pigeons", "By floating magnetized iron needles in bowls of water", "By lighting large mirror towers", "By looking at copper bells"],
        correct_answer_index: 1,
        explanation: "Sailors magnetized thin steel needles and floated them in water bowls to navigate open oceans."
      },
    ],
  },
  {
    id: "arch-03-newtons-apple",
    title: "Newton and the Whispering Apple Tree",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    topic: "Newton'un Elma Ağacı",
    desc: "1666 yılında Woolsthorpe bahçesinde dalından düşen bir elmanın genç Isaac Newton'a evrensel yerçekimini düşündürmesi.",
    content: "In the quiet autumn of 1666, young Isaac Newton sat reading under an apple tree in the garden of Woolsthorpe Manor. The university had temporarily closed because of the plague, so he spent long contemplative days in the English countryside. Suddenly, a ripe green apple snapped from its branch and dropped straight down to the grass with a soft thud.\n\nNewton asked himself a profound question: Why does the apple always fall perpendicular to the ground, rather than drifting sideways or floating upward into the sky? He deduced that an invisible attraction exists between all matter. This single falling fruit inspired his law of universal gravitation, demonstrating that the very force pulling apples also holds the moon in its orbit around Earth.",
    target_words: ["contemplative", "perpendicular", "deduced", "gravitation"],
    target_vocabulary: [
      { word: "contemplative", phonetic: "/kənˈtem.plə.tɪv/", turkish_meaning: "düşünceli, tefekküre dalmış", context_sentence: "He spent contemplative afternoons studying in the garden." },
      { word: "perpendicular", phonetic: "/ˌpɜː.pənˈdɪk.jʊ.lər/", turkish_meaning: "dik açılı, dikey", context_sentence: "The heavy stone fell perpendicular to the grass." },
      { word: "deduced", phonetic: "/dɪˈdjuːst/", turkish_meaning: "sonuç çıkardı, akıl yürüttü", context_sentence: "Newton deduced that Earth pulls objects toward its center." },
      { word: "gravitation", phonetic: "/ˌɡræv.ɪˈteɪ.ʃən/", turkish_meaning: "yerçekimi, kütle çekimi", context_sentence: "Universal gravitation governs both planets and falling fruit." },
    ],
    comprehension_questions: [
      {
        question: "Why was Isaac Newton staying in the countryside at Woolsthorpe Manor in 1666?",
        options: ["He was on vacation with friends", "His university was closed due to the plague", "He had retired from teaching", "He was building a telescope"],
        correct_answer_index: 1,
        explanation: "The university had closed temporarily because of the plague outbreak."
      },
      {
        question: "What observation caused Newton to contemplate the nature of gravity?",
        options: ["A comet passing through the night sky", "A ripe apple falling perpendicular to the ground", "A ship sailing past the horizon", "Lightning striking a church tower"],
        correct_answer_index: 1,
        explanation: "Seeing a ripe apple drop straight down to the grass sparked his curiosity."
      },
      {
        question: "What celestial body did Newton connect to the falling apple?",
        options: ["The sun's solar flares", "The moon orbiting the Earth", "The rings of Saturn", "Passing shooting stars"],
        correct_answer_index: 1,
        explanation: "Newton realized the same force pulling the apple also holds the moon in its orbit."
      },
    ],
  },
  {
    id: "arch-04-dinosaur-footprint",
    title: "The Dinosaur Footprint in Stone Creek",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Dinozor Ayak İzi",
    desc: "Nehir yatağındaki kireçtaşında yüz milyon yıldır bozulmadan kalan üç parmaklı dev fosil izinin bulunması.",
    content: "During a hot summer afternoon, two young paleontologists walked along a dry limestone riverbed in Texas. As sunlight hit the shallow water at an angle, they noticed deep three-toed depressions stamped into the solid grey stone. Kneeling down with soft bristle brushes, they gently cleared away river sand and pebbles.\n\nBefore their eyes was the unmistakable footprint of an Acrocanthosaurus, a massive carnivorous dinosaur that roamed the coastal wetlands over one hundred million years ago. The creature had stepped in soft tropical mud, which had baked in the sun and gradually turned into durable stone under immense geological pressure. That single preserved track provided clear evidence of how giant prehistoric predators walked, balanced, and hunted.",
    target_words: ["paleontologists", "depressions", "carnivorous", "preserved"],
    target_vocabulary: [
      { word: "paleontologists", phonetic: "/ˌpeɪ.li.ɒnˈtɒl.ə.dʒɪsts/", turkish_meaning: "paleontologlar, fosil bilimciler", context_sentence: "Paleontologists carefully uncovered the ancient fossil site." },
      { word: "depressions", phonetic: "/dɪˈpreʃ.ənz/", turkish_meaning: "çukurlar, oyuklar", context_sentence: "They found three-toed depressions in the hard riverbed." },
      { word: "carnivorous", phonetic: "/kɑːˈnɪv.ər.əs/", turkish_meaning: "etçil, etobur", context_sentence: "The footprint belonged to a carnivorous prehistoric dinosaur." },
      { word: "preserved", phonetic: "/prɪˈzɜːvd/", turkish_meaning: "korunmuş, günümüze kalmış", context_sentence: "The mud fossil had been preserved in rock for millions of years." },
    ],
    comprehension_questions: [
      {
        question: "Where did the scientists find the dinosaur footprints?",
        options: ["Deep inside an icy glacier", "Along a dry limestone riverbed in Texas", "On top of a dormant volcano", "Inside a coal mine"],
        correct_answer_index: 1,
        explanation: "They spotted the depressions along a dry limestone riverbed in Texas."
      },
      {
        question: "How did the dinosaur's track turn into solid rock over millions of years?",
        options: ["It was covered in molten lava", "Soft mud baked in the sun and hardened under geological pressure", "Aliens carved it into stone", "Ancient people painted it with sap"],
        correct_answer_index: 1,
        explanation: "The dinosaur stepped in soft mud, which baked in the sun and turned to stone under geological pressure."
      },
      {
        question: "What kind of creature made the three-toed impression?",
        options: ["A tiny prehistoric bird", "A massive carnivorous dinosaur", "A giant sea turtle", "A woolly mammoth"],
        correct_answer_index: 1,
        explanation: "The footprint was from an Acrocanthosaurus, a massive carnivorous predator."
      },
    ],
  },
  {
    id: "arch-05-papyrus-scrolls",
    title: "The Ancient Papyrus Scrolls of Elephantine",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Antik Papirüs Ruloları",
    desc: "Nil Nehri üzerindeki adada kuru çöl kumları sayesinde iki bin beş yüz yıl boyunca çürümeden saklanan mektuplar.",
    content: "Elephantine is a sun-drenched rocky island resting peacefully in the middle of the Nile River in southern Egypt. In the late nineteenth century, local excavators digging near ancient mud-brick ruins discovered wooden chests sealed with red wax. Inside lay rolls of fragile brown papyrus tied with papyrus cords and stamped with clay seals.\n\nBecause the desert climate was completely devoid of moisture, the organic plant fibers had survived in extraordinary condition for over two thousand four hundred years. Inscribed in black soot ink with ancient Aramaic and Egyptian script, these precious documents were legal contracts, wedding agreements, and private personal letters between soldiers and their families, giving us a personal window into everyday ancient life.",
    target_words: ["excavators", "fragile", "devoid", "inscribed"],
    target_vocabulary: [
      { word: "excavators", phonetic: "/ˈek.skə.veɪ.tərz/", turkish_meaning: "kazı yapanlar, arkeologlar", context_sentence: "Excavators uncovered sealed jars in the temple ruins." },
      { word: "fragile", phonetic: "/ˈfrædʒ.aɪl/", turkish_meaning: "kırılgan, hassas", context_sentence: "They handled the fragile papyrus scrolls with extreme care." },
      { word: "devoid", phonetic: "/dɪˈvɔɪd/", turkish_meaning: "yoksun, tamamen eksik", context_sentence: "The desert air was completely devoid of destructive moisture." },
      { word: "inscribed", phonetic: "/ɪnˈskraɪbd/", turkish_meaning: "yazılmış, kazınmış", context_sentence: "Letters were inscribed in dark black ink on dried reeds." },
    ],
    comprehension_questions: [
      {
        question: "Where were the papyrus scrolls discovered?",
        options: ["Under the Mediterranean Sea", "On Elephantine Island in the Nile River", "Inside a pyramid in Cairo", "In an abandoned fortress in Greece"],
        correct_answer_index: 1,
        explanation: "They were found on Elephantine Island, a rocky island in the Nile River."
      },
      {
        question: "Why did the organic papyrus survive for thousands of years without rotting?",
        options: ["It was soaked in honey", "The arid desert climate had virtually no moisture", "It was sealed inside an airtight steel box", "It was carved from granite"],
        correct_answer_index: 1,
        explanation: "The extremely dry desert air devoid of moisture protected the fragile plant fibers."
      },
      {
        question: "What kind of information was written on these ancient scrolls?",
        options: ["Mathematical astronomy formulas", "Legal contracts, wedding documents, and family letters", "Maps to hidden treasure caverns", "Magic spells to talk with animals"],
        correct_answer_index: 1,
        explanation: "The texts contained legal contracts, wedding agreements, and private letters between ancient people."
      },
    ],
  },

  // ==========================================
  // LEVEL B (B1-B2, ~230-280 kelime, 4-5 dk)
  // ==========================================
  {
    id: "arch-06-gobeklitepe",
    title: "The Monolithic Mystery of Göbeklitepe",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Göbeklitepe Megalitleri",
    desc: "Şanlıurfa yakınlarında tarımdan ve yerleşik hayattan önce inşa edilen dünyanın en eski anıtsal tapınak kompleksi.",
    content: "Perched upon a limestone ridge in southeastern Turkey near the historic city of Şanlıurfa, Göbeklitepe revolutionized modern archaeology and challenged conventional theories regarding human civilization. Before Professor Klaus Schmidt commenced systematic excavations in 1995, historians universally assumed that monumental architecture was only achievable after the emergence of agriculture and permanent farming villages.\n\nRadiocarbon dating demonstrated that these megalithic structures were carved around 9600 BCE—more than six thousand years older than Stonehenge or the Giza Pyramids. Hunter-gatherers quarried immense T-shaped limestone pillars weighing up to sixteen tons without metal tools or domesticated beasts of burden. Arranged in massive circular enclosures, the pillars are adorned with high-relief carvings of fierce wild boars, coiled serpents, roaring lions, and vultures.\n\nThe T-shape represents an abstract anthropomorphic silhouette, complete with delicately carved hands meeting above woven loincloth belts. Rather than a domestic settlement, Göbeklitepe served as a sacred regional gathering sanctuary where nomadic clans congregated for seasonal rituals, celestial observances, and cultural exchange. Mysteriously, around 8000 BCE, the ancient builders systematically backfilled the entire sacred complex with soil, preserving this stone masterpiece intact beneath a mound for millennia.",
    target_words: ["conventional", "megalithic", "anthropomorphic", "backfilled"],
    target_vocabulary: [
      { word: "conventional", phonetic: "/kənˈven.ʃən.əl/", turkish_meaning: "geleneksel, alışılagelmiş", context_sentence: "The discovery disproved conventional theories of ancient history." },
      { word: "megalithic", phonetic: "/ˌmeɡ.əˈlɪθ.ɪk/", turkish_meaning: "büyük taşlardan oluşan, megalitik", context_sentence: "Massive megalithic enclosures were carved from limestone bedrock." },
      { word: "anthropomorphic", phonetic: "/ˌæn.θrə.pəˈmɔː.fɪk/", turkish_meaning: "insan biçimli", context_sentence: "The T-pillars possess abstract anthropomorphic features like hands and belts." },
      { word: "backfilled", phonetic: "/ˈbæk.fɪld/", turkish_meaning: "kasıtlı olarak toprakla doldurulmuş", context_sentence: "Nomads backfilled the stone rings before abandoning the sacred sanctuary." },
    ],
    comprehension_questions: [
      {
        question: "Why did Göbeklitepe fundamentally change historical understanding of civilization?",
        options: ["It proved humans knew how to melt iron earlier", "It demonstrated hunter-gatherers built monumental temples before developing farming", "It contained the world's oldest written language", "It was built entirely under an ocean reef"],
        correct_answer_index: 1,
        explanation: "It proved that nomadic hunter-gatherers built monumental stone temples thousands of years before permanent agricultural villages emerged."
      },
      {
        question: "What distinct shape do the monolithic limestone pillars at Göbeklitepe have?",
        options: ["Square blocks", "T-shaped pillars representing human silhouettes", "Smooth spherical obelisks", "Pyramidal steps"],
        correct_answer_index: 1,
        explanation: "The monuments are colossal T-shaped pillars representing abstract anthropomorphic figures."
      },
      {
        question: "What did the ancient builders deliberately do to the complex around 8000 BCE?",
        options: ["They burned it to the ground with fire", "They deliberately backfilled the enclosures with soil and stones", "They dismantled the pillars to build houses", "They threw the statues into the Euphrates River"],
        correct_answer_index: 1,
        explanation: "The builders systematically backfilled the entire sacred site with earth, preserving it intact."
      },
    ],
  },
  {
    id: "arch-07-rosetta-stone",
    title: "The Rosetta Stone and Deciphering the Past",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Rosetta Taşı ve Hiyeroglifler",
    desc: "Mısır hiyerogliflerinin bin yıllık sessizliğini bozan üç dilli granodiyorit taş levhanın keşfi ve Champollion.",
    content: "In 1799, French soldiers fortifying an ancient garrison near the Nile Delta port town of Rashid—known to Europeans as Rosetta—unearthed a broken slab of dark granodiorite. Weighing over seven hundred kilograms, the stone displayed an official decree issued at Memphis in 196 BCE in three distinct scripts: sacred Egyptian hieroglyphs, everyday Egyptian Demotic script, and Ancient Greek.\n\nBecause scholars could readily read Ancient Greek, the stone held the potential to decipher the enigmatic hieroglyphs that had baffled linguists for fourteen centuries. The breakthrough arrived through the brilliant French polyglot Jean-François Champollion. Unlike previous researchers who believed hieroglyphs were purely symbolic or mystical pictograms, Champollion deduced that the characters operated simultaneously as phonetic symbols, ideograms, and determinatives.\n\nBy meticulously comparing royal cartouches—oval loops enclosing names of pharaohs—Champollion identified the phonetic spellings of Ptolemy and Cleopatra. In 1822, recognizing names of native Egyptian pharaohs like Ramesses, he famously sprinted into his brother’s office, shouted 'Je tiens mon affaire!' ('I have got it!'), and fainted from exhaustion. His discovery unlocked millennia of Egyptian history, transforming mute temple inscriptions into vibrant historical narratives.",
    target_words: ["granodiorite", "decipher", "cartouches", "determinatives"],
    target_vocabulary: [
      { word: "granodiorite", phonetic: "/ˌɡræn.əʊˈdaɪ.ə.raɪt/", turkish_meaning: "granodiyorit (volkanik sert taş türü)", context_sentence: "The decree was carved into a dense slab of granodiorite." },
      { word: "decipher", phonetic: "/dɪˈsaɪ.fər/", turkish_meaning: "şifresini çözmek, anlamını sökmek", context_sentence: "Linguists worked for decades to decipher the ancient inscription." },
      { word: "cartouches", phonetic: "/kɑːˈtuːʃ.ɪz/", turkish_meaning: "kartuşlar (firavun isimlerini saran oval çerçeveler)", context_sentence: "Royal cartouches highlighted the phonetic letters of kings." },
      { word: "determinatives", phonetic: "/dɪˈtɜː.mɪ.nə.tɪvz/", turkish_meaning: "belirteçler (anlamı netleştiren dilbilgisel işaretler)", context_sentence: "Hieroglyphs combined phonetic sounds with determinatives." },
    ],
    comprehension_questions: [
      {
        question: "How many different scripts were inscribed upon the Rosetta Stone?",
        options: ["One", "Two", "Three (Hieroglyphic, Demotic, and Ancient Greek)", "Four"],
        correct_answer_index: 2,
        explanation: "The decree was inscribed in three scripts: Egyptian hieroglyphs, Demotic, and Ancient Greek."
      },
      {
        question: "What key realization enabled Champollion to unlock the hieroglyphic system?",
        options: ["They were purely pictures with no sounds", "Hieroglyphs operated as a phonetic script representing sounds as well as concepts", "The language was identical to Latin", "The texts were secret magical spells"],
        correct_answer_index: 1,
        explanation: "Champollion proved that hieroglyphic signs represented spoken sounds (phonetic) as well as ideas."
      },
      {
        question: "What royal names inside oval cartouches provided the initial decipherment clue?",
        options: ["Alexander and Julius Caesar", "Ptolemy and Cleopatra", "Tutankhamun and Nefertiti", "Khufu and Hatshepsut"],
        correct_answer_index: 1,
        explanation: "By comparing the oval cartouches of Ptolemy and Cleopatra, he identified the shared phonetic values."
      },
    ],
  },
  {
    id: "arch-08-pompeii",
    title: "The Frozen Hours of Pompeii",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 255,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Pompeii Kül Altı Şehri",
    desc: "MS 79'da Vezüv Yanardağı'nın patlamasıyla zamanın donduğu Roma şehri ve Giuseppe Fiorelli'nin alçı kalıpları.",
    content: "On a serene late summer morning in 79 CE, the Roman resort town of Pompeii was bustling with commerce along the Bay of Naples. Merchants sold spiced wine and fresh garum from thermopolia stone counters, while children walked past marble fountains toward school. Suddenly, Mount Vesuvius erupted with apocalyptic fury, shooting a towering pine-tree-shaped plume of ash, pumice, and superheated gases thirty kilometers into the stratosphere.\n\nWithin hours, daylight vanished into pitch-black suffocating darkness. Pumice stones hailed upon rooftops, collapsing buildings. The following morning, catastrophic pyroclastic surges—rivers of glowing gas and volcanic ash moving at hurricane speeds—swept down the mountainside, burying the entire city beneath six meters of debris. Pompeii lay forgotten beneath vineyards for over sixteen centuries until accidental discoveries in the eighteenth century.\n\nIn 1863, archaeologist Giuseppe Fiorelli introduced an ingenious scientific technique. Excavators recognized that the decomposed bodies of victims had left hollow voids within the hardened volcanic ash. By carefully injecting liquid plaster into these subterranean cavities and allowing it to cure, excavators created poignant, three-dimensional casts of citizens in their final moments—capturing haunting expressions, folds of tunics, and desperate attempts to shield loved ones.",
    target_words: ["thermopolia", "stratosphere", "pyroclastic", "poignant"],
    target_vocabulary: [
      { word: "thermopolia", phonetic: "/ˌθɜː.məˈpəʊ.li.ə/", turkish_meaning: "termopolyum (antik Roma sıcak yemek ve şarap tezgahı)", context_sentence: "Citizens bought quick snacks from colorful thermopolia counters." },
      { word: "stratosphere", phonetic: "/ˈstræt.ə.sfɪər/", turkish_meaning: "stratosfer, üst atmosfer katmanı", context_sentence: "The volcanic plume pierced high into the earth's stratosphere." },
      { word: "pyroclastic", phonetic: "/ˌpaɪ.rəʊˈklæs.tɪk/", turkish_meaning: "piroklastik, kızgın gaz ve kül akıntısı", context_sentence: "Superheated pyroclastic surges wiped out everything in seconds." },
      { word: "poignant", phonetic: "/ˈpɔɪ.njənt/", turkish_meaning: "yürek burkan, dokunaklı", context_sentence: "The plaster casts offered a poignant snapshot of human tragedy." },
    ],
    comprehension_questions: [
      {
        question: "What volcano erupted in 79 CE to bury the city of Pompeii?",
        options: ["Mount Etna", "Mount Vesuvius", "Mount Olympus", "Krakatoa"],
        correct_answer_index: 1,
        explanation: "Mount Vesuvius erupted catastrophically, shooting ash and pumice across the Bay of Naples."
      },
      {
        question: "How deep was the volcanic ash layer that entombed Pompeii?",
        options: ["About half a meter", "Six meters of debris", "Over thirty meters", "Two centimeters"],
        correct_answer_index: 1,
        explanation: "The entire city was buried beneath approximately six meters of volcanic ash and pumice."
      },
      {
        question: "How did Giuseppe Fiorelli preserve the forms of citizens caught in the disaster?",
        options: ["By wrapping bones in linen cloth", "By injecting liquid plaster into hollow cavities left in hardened ash", "By freezing the bodies with dry ice", "By painting marble replicas"],
        correct_answer_index: 1,
        explanation: "Fiorelli pumped liquid plaster into the voids left by decomposed bodies in the ash."
      },
    ],
  },
  {
    id: "arch-09-curie-laboratory",
    title: "Marie Curie and the Glowing Test Tubes",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    topic: "Marie Curie'nin Laboratuvarı",
    desc: "Paris'te derme çatma bir kulübede tonlarca uranyum cevherini kaynatarak polonyum ve radyumu keşfeden iki Nobel ödüllü bilim insanı.",
    content: "In an abandoned, drafty wooden shed in Paris that had previously served as a medical dissection room, Polish-born physicist Marie Curie and her husband Pierre conducted some of the most groundbreaking scientific investigations in human history. With cracked skylights leaking rain and bitter winter drafts chilling the room, they worked for four grueling years processing several tons of pitchblende—a heavy black uranium ore.\n\nMarie spent dawn to dusk stirring boiling cauldrons of toxic minerals with heavy iron rods, inhaling sulfurous fumes to isolate fractional milligrams of unknown elements. Through relentless chemical precipitation and fractional crystallization, she discovered two previously unknown radioactive elements: polonium, which she named after her beloved homeland of Poland, and radium.\n\nAt night, Marie and Pierre would quietly return to their dark, ramshackle workshop. In the shadows, the tiny glass vials of purified radium salt glowed with an eerie, phosphorescent bluish light, which Marie poetically called 'faint fairy lights.' Her pioneering research coined the term 'radioactivity' and fundamentally reshaped atomic physics, earning her two Nobel Prizes in distinct scientific fields (Physics and Chemistry)—an achievement that remains unequaled.",
    target_words: ["dissection", "pitchblende", "crystallization", "phosphorescent"],
    target_vocabulary: [
      { word: "dissection", phonetic: "/daɪˈsek.ʃən/", turkish_meaning: "kadavra inceleme, diseksiyon", context_sentence: "The damp wooden shed was previously used for anatomy dissection." },
      { word: "pitchblende", phonetic: "/ˈpɪtʃ.blend/", turkish_meaning: "uranyum cevheri, peşblent", context_sentence: "They boiled tons of pitchblende ore to extract minute residues." },
      { word: "crystallization", phonetic: "/ˌkrɪs.təl.aɪˈzeɪ.ʃən/", turkish_meaning: "kristalleşme, kristalleştirme", context_sentence: "Fractional crystallization allowed her to separate radium salts." },
      { word: "phosphorescent", phonetic: "/ˌfɒs.fəˈres.ənt/", turkish_meaning: "fosforlu, karanlıkta parıldayan", context_sentence: "The purified radium emitted a soft phosphorescent blue glow." },
    ],
    comprehension_questions: [
      {
        question: "What two new chemical elements did Marie Curie discover from pitchblende ore?",
        options: ["Gold and Silver", "Polonium and Radium", "Uranium and Plutonium", "Helium and Argon"],
        correct_answer_index: 1,
        explanation: "Marie and Pierre Curie isolated polonium and radium from tons of pitchblende."
      },
      {
        question: "Why did Marie Curie name the first element 'Polonium'?",
        options: ["After the North Pole", "In honor of her homeland, Poland", "After a Greek philosopher", "Because it looked like polished silver"],
        correct_answer_index: 1,
        explanation: "She named polonium after Poland, her native country which was partitioned at the time."
      },
      {
        question: "What historic academic milestone did Marie Curie achieve with the Nobel Prizes?",
        options: ["She was the youngest recipient ever", "She won Nobel Prizes in two distinct sciences (Physics and Chemistry)", "She won three prizes in a single year", "She was the first to donate the prize money to the museum"],
        correct_answer_index: 1,
        explanation: "She remains the only person honored with Nobel Prizes in two separate scientific fields."
      },
    ],
  },
  {
    id: "arch-10-tutankhamun",
    title: "Inside King Tutankhamun's Golden Tomb",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 260,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Tutankhamun'un Mezar Odası",
    desc: "1922 yılında Krallar Vadisi'nde Howard Carter'ın açtığı bozulmamış kraliyet mezarı ve altın maskenin ihtişamı.",
    content: "In November 1922, British archaeologist Howard Carter stood in the sun-baked limestone Valley of the Kings across from Luxor, Egypt. After six frustrating seasons of fruitless digging financed by Lord Carnarvon, Carter’s workmen uncovered a flight of sixteen stone steps carved into the bedrock beneath the entrance to a neighboring tomb. At the bottom of the steps lay a sealed doorway bearing the royal stamp of the jackal necropolis.\n\nClearing the subterranean passage of rubble, Carter chiseled a tiny peephole through the second plaster door. Holding a flickering candle into the pitch-black chamber, hot air escaped from centuries of seclusion. When Carnarvon nervously asked, 'Can you see anything?', Carter famously uttered his immortal response: 'Yes, wonderful things!'\n\nThe antechamber was packed with an astonishing array of royal treasures untouched by tomb robbers for over three thousand years: gilded chariots, carved ivory thrones, alabaster perfume jars, and statues of walking pharaohs. Deep within the burial chamber rested a sarcophagus containing three nested coffins, the innermost hammered from one hundred and ten kilograms of solid gold, protecting the mummy of young King Tutankhamun and his iconic lapis lazuli funeral mask.",
    target_words: ["fruitless", "chiseled", "antechamber", "sarcophagus"],
    target_vocabulary: [
      { word: "fruitless", phonetic: "/ˈfruːt.ləs/", turkish_meaning: "sonuçsuz, verimsiz", context_sentence: "After years of fruitless searching, they were ready to give up." },
      { word: "chiseled", phonetic: "/ˈtʃɪz.əld/", turkish_meaning: "keskiyle oyulmuş, delinmiş", context_sentence: "Carter chiseled a small inspection hole in the plaster door." },
      { word: "antechamber", phonetic: "/ˈæn.tiˌtʃeɪm.bər/", turkish_meaning: "ön oda, bekleme odası", context_sentence: "The antechamber was overflowing with gilded furniture." },
      { word: "sarcophagus", phonetic: "/sɑːˈkɒf.ə.ɡəs/", turkish_meaning: "lahit, taş tabut", context_sentence: "The yellow quartzite sarcophagus contained nested golden coffins." },
    ],
    comprehension_questions: [
      {
        question: "Who financed Howard Carter's search for the tomb of Tutankhamun?",
        options: ["The British Museum", "Lord Carnarvon", "The Egyptian Government", "Napoleon Bonaparte"],
        correct_answer_index: 1,
        explanation: "Lord Carnarvon provided the funding for Howard Carter's archaeological excavations."
      },
      {
        question: "What did Carter say when asked if he could see anything through the tiny hole in the door?",
        options: ["'It is empty'", "'Only dust and stones'", "'Yes, wonderful things!'", "'We must leave immediately'"],
        correct_answer_index: 2,
        explanation: "Carter peered in with a candle and answered: 'Yes, wonderful things!'"
      },
      {
        question: "What material was used to hammer the innermost coffin containing the mummy?",
        options: ["Solid silver", "Pure lead", "Over one hundred kilograms of solid gold", "Carved cedarwood"],
        correct_answer_index: 2,
        explanation: "The innermost coffin was hammered from 110 kilograms of solid pure gold."
      },
    ],
  },

  // ==========================================
  // LEVEL C (C1-C2, ~330-380 kelime, 5-6 dk)
  // ==========================================
  {
    id: "arch-11-antikythera-mechanism",
    title: "The Antikythera Mechanism: Ancient Clockwork of the Cosmos",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    topic: "Antikythera Mekanizması",
    desc: "MÖ 2. yüzyılda inşa edilen, gezegen hareketlerini ve tutulmaları hesaplayan dünyanın ilk mekanik analog bilgisayarı.",
    content: "In the spring of 1900, Greek sponge divers sheltering from a storm off the barren Aegean island of Antikythera discovered the submerged wreckage of a Roman merchant galley resting fifty meters beneath the surface. Among bronze sculptures and amphorae salvaged from the seabed was a calcified, corroded lump of bronze and wood that initially appeared unremarkable. However, as the artifact dried, it fractured open, revealing intricate bronze gearwheels with triangular teeth and microscopic Greek inscriptions.\n\nDating to approximately 150–100 BCE, the Antikythera Mechanism represents humanity's earliest known mechanical analog computer—an engineering marvel whose sophisticated kinematics would not be equaled in Europe until the emergence of astronomical clockwork in fourteenth-century cathedrals. Using modern high-resolution microfocus X-ray computed tomography, international researchers decoded the internal gearing of more than thirty intermeshing bronze cogwheels packed within a shoe-box-sized wooden casing.\n\nTurned by a small hand crank, the device functioned as a predictive astronomical calculator. It accurately modeled the elliptical anomaly of the moon’s orbit using a sophisticated pin-and-slot epicyclic differential gear mechanism—predating Johannes Kepler's orbital geometry by seventeen centuries. The front dial tracked the synchronized motions of the sun, moon, and five known classical planets through the zodiac, displaying lunar phases via a miniature revolving two-tone sphere.\n\nFurthermore, the reverse dials incorporated two complex spirals: the Metonic cycle (a 235-month calendar matching lunar phases to solar years) and the Saros cycle, which precisely predicted upcoming solar and lunar eclipses, complete with the specific time, color, and atmospheric obscurity of the celestial event. The device proves that ancient Hellenistic natural philosophy was not merely speculative metaphysics, but supported by profound empirical craftsmanship and precision kinematic engineering.",
    target_words: ["salvaged", "kinematics", "epicyclic", "obscurity"],
    target_vocabulary: [
      { word: "salvaged", phonetic: "/ˈsæl.vɪdʒd/", turkish_meaning: "kurtarılmış, denizden çıkarılmış", context_sentence: "Bronze artifacts were salvaged from the ancient seabed wreckage." },
      { word: "kinematics", phonetic: "/ˌkɪn.əˈmæt.ɪks/", turkish_meaning: "kinematik, hareket mekaniği", context_sentence: "The device displayed sophisticated gear kinematics." },
      { word: "epicyclic", phonetic: "/ˌep.ɪˈsaɪ.klɪk/", turkish_meaning: "episiklik (dişlilerin birbiri etrafında dönmesi)", context_sentence: "Pin-and-slot epicyclic gearing modeled variable lunar velocity." },
      { word: "obscurity", phonetic: "/əbˈskjʊə.rə.ti/", turkish_meaning: "belirsizlik, karartı, örtülme derecesi", context_sentence: "Dial glyphs forecasted the expected obscuration and color of eclipses." },
    ],
    comprehension_questions: [
      {
        question: "When and where was the Antikythera Mechanism originally discovered?",
        options: ["In a sand cave near Cairo in 1922", "By Greek sponge divers off the island of Antikythera in 1900", "Inside an Italian monastery library in 1860", "On a ship wreck in the Atlantic Ocean in 1985"],
        correct_answer_index: 1,
        explanation: "Sponge divers sheltering off Antikythera island salvaged the calcified artifact from a sunken Roman galley in 1900."
      },
      {
        question: "How did the mechanism model the variable elliptical orbit of the moon?",
        options: ["Using magnetic iron springs", "Via a pin-and-slot epicyclic differential gear mechanism", "By burning oil to create steam pressure", "Through mercury balance weights"],
        correct_answer_index: 1,
        explanation: "The device used an innovative pin-and-slot epicyclic gear mechanism to reproduce Keplerian lunar anomalies."
      },
      {
        question: "What did the Saros cycle dial on the back of the device predict?",
        options: ["Tidal waves and sea storms", "The exact dates, times, and characteristics of solar and lunar eclipses", "The price of grain in Athens", "Volcanic eruptions around the Mediterranean"],
        correct_answer_index: 1,
        explanation: "The 223-month Saros cycle dial precisely calculated and predicted future solar and lunar eclipses."
      },
    ],
  },
  {
    id: "arch-12-alexandria-library",
    title: "The Epistemology of the Great Library of Alexandria",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "İskenderiye Kütüphanesi",
    desc: "Antik Akdeniz'in entelektüel merkezi olan kütüphanenin evrensel bilgi toplama vizyonu ve trajik çöküşü.",
    content: "Founded in the early third century BCE under the patronage of the Ptolemaic dynasty, the Great Library of Alexandria (part of the larger research institute known as the Mouseion) embodied antiquity's most audacious epistemological ambition: the universal collection, systematic classification, and critical commentary of all human knowledge. Situated at the maritime crossroads of Europe, Africa, and Asia, Alexandria was designed as an intellectual cosmos.\n\nPtolemaic decrees mandated that any ship entering Alexandria's harbor surrender every scroll or codex aboard. Scribes in royal workshops copied the manuscripts onto fine Egyptian papyrus, returning duplicates to the passengers while retaining the original codices for the library vaults. Through this aggressive acquisition protocol, the collection grew to encompass between four hundred thousand and seven hundred thousand papyrus rolls. Here, Eratosthenes calculated the circumference of the Earth with remarkable mathematical accuracy, Aristarchus of Samos proposed the first heliocentric model of the solar system, and Callimachus authored the Pinakes—the world's first comprehensive library catalogue.\n\nContrary to romantic popular mythology attributing the library's demise to a single cataclysmic inferno, historians now recognize that Alexandria's intellectual decline was an agonizing, centuries-long process of socio-political attrition. While Julius Caesar's fleet inadvertently ignited dockside warehouses in 48 BCE destroying tens of thousands of scrolls, the institution survived in diminished form. Subsequent imperial purges, intellectual censorship, administrative defunding, and civil wars culminating in Aurelian's sack of the Brouchion quarter and the patriarch Theophilus's destruction of the affiliated Serapeum in 391 CE completed the tragic dissolution.\n\nThe fall of the Library represents an enduring cautionary tale for civilization: that institutional knowledge is profoundly fragile, requiring constant societal stewardship, civic stability, and intellectual freedom to prevent the light of human inquiry from plunging into darkness.",
    target_words: ["epistemological", "audacious", "heliocentric", "attrition"],
    target_vocabulary: [
      { word: "epistemological", phonetic: "/ɪˌpɪs.tə.məˈlɒdʒ.ɪ.kəl/", turkish_meaning: "epistemolojik, bilgi felsefesine ait", context_sentence: "The archive embodied an audacious epistemological ambition." },
      { word: "audacious", phonetic: "/ɔːˈdeɪ.ʃəs/", turkish_meaning: "cüretkâr, cesur", context_sentence: "Collecting all human thought in one location was an audacious dream." },
      { word: "heliocentric", phonetic: "/ˌhiː.li.əʊˈsen.trɪk/", turkish_meaning: "günmerkezli (güneşi merkeze alan)", context_sentence: "Aristarchus formulated the heliocentric hypothesis at Alexandria." },
      { word: "attrition", phonetic: "/əˈtrɪʃ.ən/", turkish_meaning: "yıpranma, aşınma, tedrici tükeniş", context_sentence: "The library suffered a long, tragic process of political attrition." },
    ],
    comprehension_questions: [
      {
        question: "What aggressive policy did the Ptolemaic kings enforce on ships entering Alexandria?",
        options: ["They charged heavy gold taxes on foreign merchants", "They confiscated and copied all books aboard, returning only duplicates", "They burned non-Greek scrolls at the harbor entrance", "They forced foreign scholars to serve in the navy"],
        correct_answer_index: 1,
        explanation: "Ships had to surrender all scrolls to royal scribes, who kept the originals and returned copied duplicates."
      },
      {
        question: "What scientific breakthrough did Eratosthenes achieve while working at the Library?",
        options: ["He calculated the circumference of the Earth with remarkable accuracy", "He developed the theory of evolution", "He invented the optical telescope", "He split water into hydrogen and oxygen"],
        correct_answer_index: 0,
        explanation: "Eratosthenes calculated Earth's circumference using shadows cast in wells at Alexandria and Syene."
      },
      {
        question: "How do modern historians characterize the ultimate destruction of the Great Library?",
        options: ["A single intentional fire set by Alexander the Great", "A centuries-long process of political attrition, budget cuts, and civil conflict", "An earthquake that submerged the entire city into the sea", "A plague that wiped out all scribes in one month"],
        correct_answer_index: 1,
        explanation: "Scholars emphasize that the library decayed gradually through centuries of political turmoil, censorship, and defunding."
      },
    ],
  },
  {
    id: "arch-13-dead-sea-scrolls",
    title: "Palaeography of the Dead Sea Scrolls in the Qumran Caves",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Ölü Deniz Parşömenleri",
    desc: "1947'de Kumran mağaralarında bulunan, antik metinlerin el yazısı bilimi ve koruma serüveni.",
    content: "In the late winter of 1947, a young Bedouin shepherd of the Ta'amireh tribe pursued a stray goat along the sheer limestone cliffs above the northwest shore of the Dead Sea near Khirbet Qumran. Tossing a stone into an opening in the escarpment, he heard the distinctive sound of breaking earthenware. Clambering into the pitch-black cave, he discovered cylindrical terracotta jars containing ancient blackened leather scrolls wrapped in linen rags.\n\nThis chance discovery initiated the most consequential palaeographic breakthrough of the twentieth century. Between 1947 and 1956, archaeologists and Bedouin excavated eleven caves around Qumran, recovering more than twenty-five thousand parchment and papyrus fragments comprising over nine hundred distinct manuscripts. The collection included biblical manuscripts dating from the third century BCE to the first century CE—predating the oldest previously known Hebrew biblical codices by more than a thousand years.\n\nScholars generally attribute the scrolls to the Essenes, an ascetic, apocalyptic Jewish sect that retreated into the Judaean desert to escape Hellenistic corruption and preserve ritual purity. Beside sacred scriptural texts, the manuscripts preserved sectarian charters (like the Community Rule), liturgical hymns, and the enigmatic Copper Scroll, which had been incised directly onto sheets of oxidized metal rather than animal skin.\n\nPalaeographical analysis—the comparative scientific taxonomy of ancient scribal hands, script styles, and ink formulations—allowed linguists to trace the rapid evolution of square Aramaic scripts across centuries. Moreover, multispectral infrared imaging and DNA sequencing of the parchment fragments have enabled contemporary conservators to match scattered fragments like jigsaw puzzles, illuminating the complex textual fluidity and theological diversity of the Second Temple period.",
    target_words: ["palaeographic", "earthenware", "ascetic", "multispectral"],
    target_vocabulary: [
      { word: "palaeographic", phonetic: "/ˌpæl.i.əˈɡræf.ɪk/", turkish_meaning: "paleografik, eski yazı bilimine ait", context_sentence: "Palaeographic analysis revealed the historical date of the scrolls." },
      { word: "earthenware", phonetic: "/ˈɜː.θən.weər/", turkish_meaning: "pişmiş toprak, çömlek", context_sentence: "Jars of earthenware kept the dry scrolls safe from rot." },
      { word: "ascetic", phonetic: "/əˈset.ɪk/", turkish_meaning: "çileci, münzevi, sofu", context_sentence: "The Essenes led an austere, ascetic communal lifestyle." },
      { word: "multispectral", phonetic: "/ˌmʌl.tiˈspek.trəl/", turkish_meaning: "çok spektrumlu (farklı ışık dalgalarında)", context_sentence: "Multispectral imaging exposed faded ink invisible to the human eye." },
    ],
    comprehension_questions: [
      {
        question: "How were the first Dead Sea Scrolls discovered by a Bedouin shepherd in 1947?",
        options: ["He used a modern metal detector", "He heard pottery shatter after throwing a stone into a cave opening", "He was digging a well for water", "An ancient treasure map showed the cave entrance"],
        correct_answer_index: 1,
        explanation: "Tossing a pebble into an opening while seeking a goat, he heard the sound of breaking pottery jars."
      },
      {
        question: "Why were the Dead Sea Scrolls of supreme importance to biblical archaeology?",
        options: ["They were written in pure gold leaf", "They pushed back the earliest known Hebrew biblical texts by over a thousand years", "They proved Rome never controlled Judea", "They contained the original blueprint of the Great Pyramid"],
        correct_answer_index: 1,
        explanation: "They provided biblical manuscripts dating back to the third century BCE, more than 1,000 years older than previous codices."
      },
      {
        question: "What unique material was used for the enigmatic 'Copper Scroll'?",
        options: ["Papyrus reed", "Sheets of beaten metal (copper)", "Carved marble slabs", "Dried palm leaves"],
        correct_answer_index: 1,
        explanation: "The Copper Scroll was incised onto sheets of oxidized metal rather than leather parchment."
      },
    ],
  },
  {
    id: "arch-14-james-webb-telescope",
    title: "The James Webb Observatory: Peering into the Cosmic Dawn",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 360,
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    topic: "James Webb Teleskobu",
    desc: "1.5 milyon kilometre uzaktaki Lagrange noktasından evrenin ilk galaksilerini ve zamanın şafağını inceleyen uzay arkeolojisi.",
    content: "Launched on Christmas Day 2021 aboard an Ariane 5 rocket, the James Webb Space Telescope (JWST) functions as an astronomical time machine, executing cosmic archaeology on an unprecedented scale. Stationed at the second Sun-Earth Lagrange point (L2)—one and a half million kilometers from our planet—Webb operates beyond the atmospheric distortions, thermal noise, and light pollution that constrain terrestrial observatories.\n\nBecause the universe has been continuously expanding since the Big Bang, light emitted by the very first stars and primordial protogalaxies over thirteen billion years ago has undergone severe cosmological redshift. Its original ultraviolet and visible wavelengths have stretched into the invisible infrared spectrum. Webb’s primary mirror—a 6.5-meter hexagon of beryllium plated with a microscopic vapor coating of pure gold—acts as a photon bucket optimized specifically for mid- and near-infrared astronomy.\n\nTo detect these infinitesimal thermal signatures from the cosmic dawn, the telescope must maintain an ultra-frigid operational temperature below minus 233 degrees Celsius. This is achieved through a five-layer Kapton sunshield the size of a tennis court, which creates an astounding temperature gradient of more than three hundred degrees between its sun-facing and cold sides. Additionally, Webb's Mid-Infrared Instrument (MIRI) employs an active helium cryocooler to chill its detectors down to just seven Kelvin above absolute zero.\n\nIn its earliest operational deep fields, JWST shattered previous theoretical models of galaxy formation. It revealed luminous, fully structured galaxies existing merely three hundred million years after the Big Bang—far earlier and vastly more massive than standard cosmological models predicted. By conducting transmission spectroscopy on the atmospheres of distant exoplanets, detecting water vapor, carbon dioxide, and sulfur dioxide, Webb is unraveling the cosmic origins of matter and paving the pathway toward discovering potential biosignatures in alien worlds.",
    target_words: ["infinitesimal", "spectroscopy", "cryocooler", "biosignatures"],
    target_vocabulary: [
      { word: "infinitesimal", phonetic: "/ˌɪn.fɪ.nɪˈtes.ɪ.məl/", turkish_meaning: "sonsuz küçük, mikroskobik düzeyde", context_sentence: "Webb detects infinitesimal thermal emissions from deep space." },
      { word: "spectroscopy", phonetic: "/spekˈtrɒs.kə.pi/", turkish_meaning: "spektroskopi (ışık tayfı analizi)", context_sentence: "Transmission spectroscopy identifies chemical elements in exoplanet atmospheres." },
      { word: "cryocooler", phonetic: "/ˈkraɪ.əʊˌkuː.lər/", turkish_meaning: "kriyojenik soğutucu", context_sentence: "The helium cryocooler keeps sensors near absolute zero." },
      { word: "biosignatures", phonetic: "/ˈbaɪ.əʊˌsɪɡ.nə.tʃərz/", turkish_meaning: "biyo-imzalar (yaşam belirtisi gazlar)", context_sentence: "Atmospheric gases can serve as biosignatures of extraterrestrial biology." },
    ],
    comprehension_questions: [
      {
        question: "Why is the James Webb Space Telescope optimized for infrared rather than visible light?",
        options: ["Infrared light travels much faster through space", "Cosmological redshift has stretched ancient light into the infrared spectrum", "Infrared cameras are cheaper to manufacture", "Visible light is blocked by the moon"],
        correct_answer_index: 1,
        explanation: "Cosmic expansion stretches ancient light into the longer infrared wavelengths via cosmological redshift."
      },
      {
        question: "Where is the JWST stationed in space?",
        options: ["In low Earth orbit like Hubble", "On the surface of Mars", "At the second Sun-Earth Lagrange point (L2)", "In the asteroid belt"],
        correct_answer_index: 2,
        explanation: "JWST operates 1.5 million kilometers away at the second Lagrange point (L2)."
      },
      {
        question: "What surprising discovery did Webb reveal regarding the earliest galaxies?",
        options: ["No stars existed before five billion years ago", "Fully formed, highly luminous galaxies existed far earlier than standard models predicted", "All ancient galaxies were made of antimatter", "The universe was filled with cold water ice"],
        correct_answer_index: 1,
        explanation: "Webb discovered mature, luminous galaxies just 300 million years after the Big Bang, challenging earlier cosmological models."
      },
    ],
  },
  {
    id: "arch-15-photo-51-dna",
    title: "Photo 51 and the Molecular Architecture of the Double Helix",
    category: "archaeology",
    categoryName: "Arkeoloji & Antik Çağ",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 355,
    coverImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    topic: "DNA Foto-51 Keşfi",
    desc: "Rosalind Franklin'in X-ışını kırınımı fotoğrafı ve yaşamın genetik kodunun çift sarmal yapısının aydınlatılması.",
    content: "In May 1952, at King's College London, physical chemist Rosalind Franklin and her doctoral student Raymond Gosling obtained an image that would forever transform modern biological science: an X-ray diffraction pattern labeled 'Photo 51'. Utilizing an ultra-fine X-ray beam passed through a microscopic, hydrated fiber of deoxyribonucleic acid (DNA) inside a sealed hydrogen chamber, Franklin required more than one hundred hours of continuous exposure to capture this critical molecular portrait.\n\nThe photograph was neither an optical image nor a simple diagram; it was a complex reciprocal-space interference pattern produced by X-rays scattering off the atoms of a biological polymer. To a master crystallographer like Franklin, the stark dark 'X' pattern emblazoned across the photographic emulsion provided irrefutable mathematical evidence of a helical geometry. The missing layer lines demonstrated that two sugar-phosphate backbones intertwined in antiparallel orientation, with nitrogenous base pairs tucked inside the helix like spiral staircase treads.\n\nWithout Franklin's explicit knowledge or permission, her colleague Maurice Wilkins showed Photo 51 to James Watson and Francis Crick at Cambridge University in early 1953. Upon viewing the photograph, Watson famously recalled that his 'mouth fell open and pulse began to race.' The precise mathematical parameters in Franklin's accompanying institutional report—including the 3.4-angstrom rise between base pairs and the 34-angstrom repeat period—provided the decisive geometrical coordinates Crick and Watson needed to construct their iconic cardboard and wire model of the double helix.\n\nFranklin’s tragic death from ovarian cancer in 1958 at age thirty-seven precluded her from receiving the 1962 Nobel Prize, which cannot be awarded posthumously. Today, historical reappraisal rightly honors Franklin not as a footnote, but as the premier empirical investigator whose rigorous experimental mastery cracked open the genetic architecture of all terrestrial life.",
    target_words: ["crystallographer", "antiparallel", "emulsion", "precluded"],
    target_vocabulary: [
      { word: "crystallographer", phonetic: "/ˌkrɪs.təˈlɒɡ.rə.fər/", turkish_meaning: "kristalograf (X-ışını kristal uzmanı)", context_sentence: "Franklin was a world-class crystallographer with peerless technique." },
      { word: "antiparallel", phonetic: "/ˌæn.tiˈpær.ə.lel/", turkish_meaning: "ters paralel (zıt yönlü paralel zincirler)", context_sentence: "The two phosphate backbones ran in antiparallel directions." },
      { word: "emulsion", phonetic: "/ɪˈmʌl.ʃən/", turkish_meaning: "film emülsiyonu (ışığa duyarlı katman)", context_sentence: "Scattered X-ray rays darkened the photographic emulsion." },
      { word: "precluded", phonetic: "/prɪˈkluː.dɪd/", turkish_meaning: "engelledi, imkansız kıldı", context_sentence: "Her untimely death precluded her from receiving a posthumous Nobel Prize." },
    ],
    comprehension_questions: [
      {
        question: "What scientific technique did Rosalind Franklin use to produce Photo 51?",
        options: ["Electron scanning microscopy", "X-ray crystallography diffraction", "Infrared satellite photography", "Laser fluorescence spectrometry"],
        correct_answer_index: 1,
        explanation: "Franklin passed fine X-ray beams through hydrated DNA fibers to produce an X-ray diffraction pattern."
      },
      {
        question: "What geometric structure did the prominent 'X' pattern in Photo 51 demonstrate?",
        options: ["A flat triple-layer sheet", "A helical double-strand structure", "A hollow sphere", "A square lattice cube"],
        correct_answer_index: 1,
        explanation: "The stark 'X' pattern provided clear mathematical proof of a helical geometry with intertwined backbones."
      },
      {
        question: "Why was Rosalind Franklin not awarded the 1962 Nobel Prize alongside Watson, Crick, and Wilkins?",
        options: ["She refused the award", "She died in 1958 and the Nobel Prize is never awarded posthumously", "Her data was proven scientifically incorrect", "She was working on a different project"],
        correct_answer_index: 1,
        explanation: "Franklin passed away in 1958, and Nobel regulations strictly prohibit posthumous nominations."
      },
    ],
  },
];

export const ARCHAEOLOGY_STORIES = archaeologyStories;
