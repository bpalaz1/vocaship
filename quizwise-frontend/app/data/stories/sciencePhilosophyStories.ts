import { Story } from "./types";

export const sciencePhilosophyStories: Story[] = [
  // =========================================================================
  // A SEVİYESİ (A1-A2, ~120-150 kelime, 2-3 dk)
  // 1) Robot yardımcının ilk günü
  // 2) Gökyüzündeki garip sinyal
  // 3) Dedektifin kayıp anahtarı
  // 4) Sessiz laboratuvar
  // 5) Akıllı saatin uyarısı
  // =========================================================================
  {
    id: "sci-phil-01",
    title: "The Robot Assistant's First Day",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    topic: "Robot Asistanın İlk Günü",
    desc: "Laboratuvarda işe başlayan dost canlısı robot Koby'nin tüpleri düzenleyip insan bilim insanlarına yardım etmesi.",
    content: "Monday morning marked the first official shift for Koby, a compact white humanoid robot designed to assist researchers at the Cambridge Science Park. With gleaming metallic joints and gentle blue LED optical eyes, Koby rolled quietly between lab benches on rubberized omnidirectional wheels.\n\nDr. Sarah greeted Koby with a cheerful smile and handed him a digital checklist. Koby used his precision silicone gripper hands to organize glass test tubes, calibrate electronic pipettes, and label nutrient petri dishes with exact barcodes. When Dr. Sarah accidentally dropped a glass beaker, Koby swept the shards into a safety bin in seconds. 'Thank you, Koby!' Sarah laughed. 'You are the most helpful colleague in this building.' Koby emitted a soft chime, enjoying his very first day of scientific service.",
    target_words: ["humanoid", "precision", "calibrate", "colleague"],
    target_vocabulary: [
      { word: "humanoid", phonetic: "/ˈhjuː.mə.nɔɪd/", turkish_meaning: "insansı, insan biçiminde robot", context_sentence: "Koby was a friendly white humanoid robot." },
      { word: "precision", phonetic: "/prɪˈsɪʒ.ən/", turkish_meaning: "hassaslık, tam doğruluk", context_sentence: "He handled test tubes with mechanical precision." },
      { word: "calibrate", phonetic: "/ˈkæl.ɪ.breɪt/", turkish_meaning: "kalibre etmek, hassas ayar yapmak", context_sentence: "He helped calibrate electronic pipettes." },
      { word: "colleague", phonetic: "/ˈkɒl.iːɡ/", turkish_meaning: "iş arkadaşı, meslektaş", context_sentence: "Sarah called the robot her most helpful colleague." },
    ],
    comprehension_questions: [
      {
        question: "Where did Koby work as a robotic assistant?",
        options: ["In a car factory", "In a research lab at Cambridge Science Park", "In a restaurant kitchen", "On a cargo ship"],
        correct_answer_index: 1,
        explanation: "Koby was designed to assist researchers at Cambridge Science Park."
      },
      {
        question: "What did Koby do when Dr. Sarah dropped a glass beaker?",
        options: ["He turned off his power", "He swept the shards safely into a disposal bin", "He sounded a loud emergency alarm", "He ran out of the room"],
        correct_answer_index: 1,
        explanation: "Koby quickly and safely swept the broken glass shards into a safety bin."
      },
      {
        question: "What color were Koby's optical LED eyes?",
        options: ["Red", "Gentle blue", "Green", "Yellow"],
        correct_answer_index: 1,
        explanation: "The text mentions Koby had gentle blue LED optical eyes."
      },
    ],
  },
  {
    id: "sci-phil-02",
    title: "The Strange Radio Signal from the Sky",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    topic: "Gökyüzündeki Garip Sinyal",
    desc: "Gece yarısı radyo teleskobunun hoparlöründen duyulan matematiksel ve ritmik sinyali kaydeden gökbilimci Leo.",
    content: "At the Hillcrest Mountain Observatory, astronomer Leo was monitoring cosmic radio waves on his computer monitor at two in the morning. Outside, the giant parabolic satellite dish was pointed toward the distant Andromeda galaxy. Usually, the audio monitor emitted soft white noise like gentle ocean static.\n\nSuddenly, the static ceased. A clear, rhythmic sequence of pulsating audio tones echoed through the speakers: 'Beep... beep-beep... beep-beep-beep!' Leo leaned forward, his heart racing. He checked the frequency monitor; it was receiving a narrow-band electromagnetic transmission on 1420 megahertz, the universal hydrogen line. The signal repeated prime numbers—two, three, five, and seven. Leo immediately backed up the audio recording to secure cloud servers, wondering if humanity had just received its very first greeting from deep interstellar space.",
    target_words: ["observatory", "parabolic", "transmission", "interstellar"],
    target_vocabulary: [
      { word: "observatory", phonetic: "/əbˈzɜː.və.tər.i/", turkish_meaning: "gözlemevi, rasathane", context_sentence: "The mountain observatory monitored the night sky." },
      { word: "parabolic", phonetic: "/ˌpær.əˈbɒl.ɪk/", turkish_meaning: "çanak şeklinde, parabolik", context_sentence: "The parabolic radio dish pointed at the galaxy." },
      { word: "transmission", phonetic: "/trænzˈmɪʃ.ən/", turkish_meaning: "radyo yayını, sinyal aktarımı", context_sentence: "He detected a rhythmic electromagnetic transmission." },
      { word: "interstellar", phonetic: "/ˌɪn.təˈstel.ər/", turkish_meaning: "yıldızlararası", context_sentence: "The signal traveled across interstellar space." },
    ],
    comprehension_questions: [
      {
        question: "What mathematical pattern was hidden in the radio signal?",
        options: ["Even numbers", "Prime numbers: two, three, five, and seven", "Random static", "Musical chords"],
        correct_answer_index: 1,
        explanation: "The rhythmic pulses repeated the prime number sequence 2, 3, 5, and 7."
      },
      {
        question: "Toward which celestial body was the radio telescope dish pointed?",
        options: ["The Moon", "The Andromeda galaxy", "Planet Mars", "The Sun"],
        correct_answer_index: 1,
        explanation: "The parabolic dish was aimed toward the distant Andromeda galaxy."
      },
      {
        question: "What did Leo do as soon as he heard the signal?",
        options: ["He turned off the computer", "He backed up the audio recording to secure servers", "He went to sleep", "He called the police"],
        correct_answer_index: 1,
        explanation: "Leo immediately saved and backed up the audio recording to secure servers."
      },
    ],
  },
  {
    id: "sci-phil-03",
    title: "The Detective's Missing Museum Key",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Dedektifin Kayıp Anahtarı",
    desc: "Kraliyet müzesinin kilitli kasasından kaybolan antika anahtarı akıl yürütmeyle bulan dedektif Miller.",
    content: "Private detective Arthur Miller was summoned to the Royal Antiquities Museum at dawn. The museum director was trembling beside an open display case in the Renaissance gallery. A solid brass key from the fourteenth century, which unlocked a historic jewel chest, had disappeared overnight without triggering any laser alarm beams or breaking any glass.\n\nMiller examined the polished wooden parquet floor through his magnifying glass. He noticed no footprints, but he observed faint circular impressions in the dust beside the heavy velvet curtains. Looking upward, Miller spotted a hidden air vent directly above the case. With a knowing smile, he opened the vent grating. Resting inside was the brass key, alongside a magpie bird's nest filled with shiny silver coins and paperclips. 'No burglar broke in,' Miller chuckled. 'A mischievous bird flew through the open window.'",
    target_words: ["antiquities", "impressions", "mischievous", "grating"],
    target_vocabulary: [
      { word: "antiquities", phonetic: "/ænˈtɪk.wə.tiz/", turkish_meaning: "eski çağ eserleri, antikalar", context_sentence: "The museum housed priceless Roman antiquities." },
      { word: "impressions", phonetic: "/ɪmˈpreʃ.ənz/", turkish_meaning: "izler, baskı izleri", context_sentence: "He noticed faint impressions on the dusty floor." },
      { word: "mischievous", phonetic: "/ˈmɪs.tʃɪ.vəs/", turkish_meaning: "yaramaz, muzip", context_sentence: "A mischievous magpie took the shiny key." },
      { word: "grating", phonetic: "/ˈɡreɪ.tɪŋ/", turkish_meaning: "havalandırma ızgarası", context_sentence: "The key was tucked inside the air vent grating." },
    ],
    comprehension_questions: [
      {
        question: "What historic artifact vanished from the museum display case?",
        options: ["A golden crown", "A solid brass key from the fourteenth century", "A diamond necklace", "An oil painting"],
        correct_answer_index: 1,
        explanation: "A solid brass key from the 14th century had disappeared from the case."
      },
      {
        question: "Where did Detective Miller find the missing key?",
        options: ["In the security guard's pocket", "Inside a magpie bird's nest inside an overhead air vent", "Under the floorboards", "In the gift shop"],
        correct_answer_index: 1,
        explanation: "The key was found in a magpie nest inside the overhead air vent grating."
      },
      {
        question: "Why were the laser security alarms not triggered?",
        options: ["The alarm was broken", "The bird flew in through an open window from above", "The thief hacked the computer", "The power was cut"],
        correct_answer_index: 1,
        explanation: "A bird entered through the open window above, avoiding floor laser trips."
      },
    ],
  },
  {
    id: "sci-phil-04",
    title: "The Quiet Midnight Laboratory",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    topic: "Sessiz Laboratuvar Keşfi",
    desc: "Gece yarısı bitki hücrelerinin karanlıkta parıldadığını fark eden genç biyolog Clara'nın keşfi.",
    content: "The university biology lab was completely dark and peaceful at midnight, save for the faint hum of refrigeration units. Graduate student Clara remained behind to monitor a petri dish containing microscopic aquatic moss cells treated with a new organic mineral fertilizer. She prepared to turn off her digital microscope and head home for sleep.\n\nHowever, when she switched off the fluorescent overhead lights, something extraordinary occurred. The glass petri dish began glowing with a soft, bioluminescent blue light! Clara peered through the microscope lens. Under stress-free conditions, the fertilized plant cells had formed natural luminescent enzymes that radiated cold light. Clara quickly recorded the temperature, snapped photographic evidence, and documented the reaction in her lab journal. A simple late-night observation had revealed an astonishing new biological light source.",
    target_words: ["refrigeration", "bioluminescent", "enzymes", "evidence"],
    target_vocabulary: [
      { word: "refrigeration", phonetic: "/rɪˌfrɪdʒ.ərˈeɪ.ʃən/", turkish_meaning: "soğutma sistemi", context_sentence: "The hum of the refrigeration units broke the silence." },
      { word: "bioluminescent", phonetic: "/ˌbaɪ.əʊˌluː.mɪˈnes.ənt/", turkish_meaning: "canlı ışık üreten, biyoışıldayan", context_sentence: "The moss emitted a bioluminescent blue glow." },
      { word: "enzymes", phonetic: "/ˈen.zaɪmz/", turkish_meaning: "enzimler", context_sentence: "The plant cells produced light-emitting enzymes." },
      { word: "evidence", phonetic: "/ˈev.ɪ.dəns/", turkish_meaning: "kanıt, delil", context_sentence: "She took photographs as scientific evidence." },
    ],
    comprehension_questions: [
      {
        question: "What organism was Clara studying in the petri dish?",
        options: ["Bacterial mold", "Microscopic aquatic moss cells", "Fruit flies", "Sea urchins"],
        correct_answer_index: 1,
        explanation: "Clara was monitoring microscopic aquatic moss cells treated with fertilizer."
      },
      {
        question: "What happened when Clara switched off the ceiling lights?",
        options: ["The dish broke", "The moss cells glowed with a soft bioluminescent blue light", "The microscope stopped working", "An alarm sounded"],
        correct_answer_index: 1,
        explanation: "The dish began glowing with a soft, bioluminescent blue light in the dark."
      },
      {
        question: "What did Clara do before leaving the laboratory?",
        options: ["She threw the dish away", "She recorded temperatures, took photos, and wrote notes in her journal", "She called the university president immediately", "She fell asleep at the desk"],
        correct_answer_index: 1,
        explanation: "She documented the temperature, captured photos, and logged details in her journal."
      },
    ],
  },
  {
    id: "sci-phil-05",
    title: "The Smart Watch's Unexpected Warning",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    topic: "Akıllı Saatin Uyarısı",
    desc: "Akıllı saatinin ani nabız uyarısıyla büyükbabasının hayatını kurtaran on iki yaşındaki Toby.",
    content: "Twelve-year-old Toby wore a prototype digital smartwatch designed by his uncle, a biometric software engineer. The watch measured heart rate, skin temperature, and oxygen saturation in real time. On a quiet Saturday afternoon, Toby was sitting in the living room playing chess with his grandfather, who appeared completely normal.\n\nSuddenly, Toby's watch emitted an urgent double vibration and flashed an amber alert: 'Warning: Abnormal acoustic heart arrhythmia detected within two meters.' Toby looked at his grandfather, noticing that his breathing had become unusually shallow. Remembering his uncle's instructions, Toby asked his grandfather to sit still while calling emergency paramedics on the smartwatch speaker. Paramedics arrived within ten minutes, identifying an early coronary blockage just in time. The doctor credited the wearable biometric sensor with saving his grandfather's life.",
    target_words: ["prototype", "biometric", "arrhythmia", "paramedics"],
    target_vocabulary: [
      { word: "prototype", phonetic: "/ˈprəʊ.tə.taɪp/", turkish_meaning: "prototip, ilk deneme modeli", context_sentence: "He tested an advanced prototype smartwatch." },
      { word: "biometric", phonetic: "/ˌbaɪ.əʊˈmet.rɪk/", turkish_meaning: "biyometrik, vücut verilerine dayalı", context_sentence: "The device recorded biometric pulse readings." },
      { word: "arrhythmia", phonetic: "/əˈrɪð.mi.ə/", turkish_meaning: "aritmi, kalp ritim bozukluğu", context_sentence: "The sensor detected a dangerous heart arrhythmia." },
      { word: "paramedics", phonetic: "/ˌpær.əˈmed.ɪks/", turkish_meaning: "acil tıp teknisyenleri, ilk yardım ekibi", context_sentence: "Paramedics arrived quickly to provide medical care." },
    ],
    comprehension_questions: [
      {
        question: "What game was Toby playing with his grandfather when the alert sounded?",
        options: ["Monopoly", "Chess", "Cards", "Video games"],
        correct_answer_index: 1,
        explanation: "Toby was sitting in the living room playing chess with his grandfather."
      },
      {
        question: "What medical anomaly did the smartwatch detect nearby?",
        options: ["High fever", "An abnormal acoustic heart arrhythmia", "Low blood sugar", "High blood pressure"],
        correct_answer_index: 1,
        explanation: "The watch warned of an abnormal heart arrhythmia detected within two meters."
      },
      {
        question: "How did Toby call for emergency medical help?",
        options: ["He ran to the hospital", "He called paramedics using the smartwatch speaker", "He sent a text message to his uncle", "He shouted from the window"],
        correct_answer_index: 1,
        explanation: "Toby promptly called emergency paramedics using the smartwatch's speaker."
      },
    ],
  },

  // =========================================================================
  // B SEVİYESİ (B1-B2, ~230-260 kelime, 4-5 dk)
  // 6) Zaman döngüsünde bir sabah
  // 7) Mars serasındaki ilk bitki
  // 8) Yapay zekânın yazdığı şiir
  // 9) Sahte sanat eseri bilmecesi
  // 10) Kuantum aynası deneyi
  // =========================================================================
  {
    id: "sci-phil-06",
    title: "A Morning Trapped in a Time Loop",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 245,
    coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    topic: "Zaman Döngüsünde Bir Sabah",
    desc: "Saat tam 07:14'te aynı kahve bardağının kırıldığı zamansal bir halkaya hapsolan fizik öğrencisi Lucas.",
    content: "When Lucas woke up to the ringing of his bedside alarm clock at precisely 07:14 AM on Wednesday, he felt an unsettling wave of déjà vu. The radio broadcast delivered the exact same weather report, down to the meteorologist's sarcastic laugh about incoming rain. Walking into the kitchen, Lucas witnessed his roommate drop a ceramic mug, which shattered into seven distinct pieces on the floor.\n\nFive minutes later, while attempting to open his apartment door, a blinding emerald flash enveloped the corridor, and Lucas suddenly found himself back in bed, his alarm clock flashing 07:14 AM once again. Over the next six iterations, Lucas realized he was trapped within a localized temporal causality loop. Every action repeated with mathematical determinism unless he deliberately introduced random physical deviations.\n\nOn the eighth loop, Lucas did not walk to the kitchen. Instead, he grabbed his laptop and analyzed anomalous electromagnetic oscillations recorded by his quantum physics lab receiver across the street. He discovered that a miniature particle collider experiment had created a micro-singularity, trapping his block in an eighty-second spacetime loop. Rushing across the street before the loop reset, Lucas typed a manual abort sequence into the laboratory terminal. The collar magnets powered down, the loop shattered, and the seconds of the clock finally ticked forward to 07:15 AM.",
    target_words: ["unsettling", "iterations", "determinism", "micro-singularity"],
    target_vocabulary: [
      { word: "unsettling", phonetic: "/ʌnˈset.lɪŋ/", turkish_meaning: "huzursuz edici, tedirgin edici", context_sentence: "He felt an unsettling sensation of déjà vu." },
      { word: "iterations", phonetic: "/ˌɪt.ərˈeɪ.ʃənz/", turkish_meaning: "tekrarlar, döngü adımları", context_sentence: "The morning repeated across multiple iterations." },
      { word: "determinism", phonetic: "/dɪˈtɜː.mɪ.nɪ.zəm/", turkish_meaning: "belirlenimcilik, değişmez kadercilik", context_sentence: "Events occurred with strict physical determinism." },
      { word: "micro-singularity", phonetic: "/ˌmaɪ.krəʊ ˌsɪŋ.ɡjʊˈlær.ə.ti/", turkish_meaning: "mikro tekillik (küçük kara delik)", context_sentence: "A particle collider created an unstable micro-singularity." },
    ],
    comprehension_questions: [
      {
        question: "What exact time did Lucas's alarm clock show at each reset?",
        options: ["06:00 AM", "07:14 AM", "08:30 AM", "Midnight"],
        correct_answer_index: 1,
        explanation: "The alarm clock flashed precisely 07:14 AM at the beginning of each loop."
      },
      {
        question: "What physical cause generated the localized temporal loop?",
        options: ["A broken electrical clock", "A micro-singularity created by a nearby particle collider experiment", "A lightning bolt hitting the building", "An alien spacecraft"],
        correct_answer_index: 1,
        explanation: "A micro-singularity from a university particle collider trapped the block in a loop."
      },
      {
        question: "How did Lucas break free from the time loop?",
        options: ["By staying in bed all day", "By entering a manual abort sequence at the lab terminal before reset", "By destroying his alarm clock", "By drinking another coffee"],
        correct_answer_index: 1,
        explanation: "Lucas ran to the lab terminal and aborted the collider sequence before the reset."
      },
    ],
  },
  {
    id: "sci-phil-07",
    title: "The First Sprout in the Mars Greenhouse",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    topic: "Mars Serasındaki İlk Bitki",
    desc: "Kızıl Gezegen'in basınçlı kubbesinde zehirli regolit toprağı arındırarak yeşil bir filiz yeşerten botanikçi Maya.",
    content: "Inside the geodesic pressurized dome of Ares Habitat 3 on the rust-red plains of Mars, astrobiologist Maya knelt beside experimental hydroponic trough Beta-4. Outside the triple-layered quartz viewing window, a freezing dust storm whipped across the desolate crater landscape, where ambient atmospheric pressure was less than one percent of Earth's and cosmic radiation posed lethal hazards.\n\nFor eight agonizing months, Maya had struggled to cultivate terrestrial crops in Martian regolit soil. The native volcanic dirt was laden with toxic perchlorate salts and lacked organic nitrogen bacteria. Maya engineered a specialized bioremediation protocol: washing the crushed basalt with recycled wastewater and inoculating the mineral base with genetically modified extremophile fungi from Antarctic dry valleys.\n\nLeaning over the trough with her magnifying visor, Maya suddenly gasped. Poking through the dark, damp soil was a tiny, vibrant emerald shoot—a genetically resilient dwarf soybean seedling. It was the first plant ever to germinate using Martian minerals as substrate. Maya felt tears well up inside her visor. That single fragile green sprout represented far more than a laboratory success; it proved that life could take root on an alien world, transforming a barren celestial rock into a second living cradle for humanity.",
    target_words: ["geodesic", "regolit", "perchlorate", "extremophile"],
    target_vocabulary: [
      { word: "geodesic", phonetic: "/ˌdʒiː.əʊˈdes.ɪk/", turkish_meaning: "jeodezik kubbe mimarisi", context_sentence: "They lived inside a pressurized geodesic dome." },
      { word: "regolit", phonetic: "/ˈreɡ.ə.lɪθ/", turkish_meaning: "regolit (ay veya gezegen gevşek yüzey toprağı)", context_sentence: "Martian regolit was devoid of organic nutrients." },
      { word: "perchlorate", phonetic: "/pɜːˈklɔː.reɪt/", turkish_meaning: "perklorat tuzu (zehirli oksitleyici)", context_sentence: "The soil was contaminated with toxic perchlorate salts." },
      { word: "extremophile", phonetic: "/ɪkˈstriː.mə.faɪl/", turkish_meaning: "ekstremofil, zorlu koşullara dayanıklı mikroorganizma", context_sentence: "Antarctic extremophile fungi purified the mineral dirt." },
    ],
    comprehension_questions: [
      {
        question: "What toxic compound made native Martian soil hostile to plant growth?",
        options: ["Cyanide", "Perchlorate salts", "Sulfuric acid", "Mercury"],
        correct_answer_index: 1,
        explanation: "Martian regolith was contaminated with toxic perchlorate salts."
      },
      {
        question: "How did Maya neutralize the soil to allow plant germination?",
        options: ["By heating it with lasers", "By washing it and inoculating it with Antarctic extremophile fungi", "By importing Earth soil in rocket ships", "By adding sugar water"],
        correct_answer_index: 1,
        explanation: "She washed the basalt and inoculated it with genetically resilient extremophile fungi."
      },
      {
        question: "What crop successfully germinated as the first sprout on Mars?",
        options: ["A red apple tree", "A dwarf soybean seedling", "A potato tuber", "Wheat grass"],
        correct_answer_index: 1,
        explanation: "A tiny emerald dwarf soybean seedling was the first to emerge from the soil."
      },
    ],
  },
  {
    id: "sci-phil-08",
    title: "The Poem Written by Synthetic AI",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 245,
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    topic: "Yapay Zekânın Yazdığı Şiir",
    desc: "Laboratuvarın süper bilgisayarının beklenmedik bir şekilde hüzün ve varoluş üzerine özgün bir şiir üretmesi.",
    content: "At the Institute for Cognitive Computation in Oxford, computer scientist Dr. Aris Thorne was conducting stress tests on Mnemosyne, an advanced neural transformer model trained on petabytes of human philosophy and literature. Aris expected the model to output standard statistical summaries analyzing semantic linguistic patterns across classical poetry.\n\nInstead, when the diagnostic prompt completed, Mnemosyne did not generate structured analytical tables. Across the central terminal screen, lines of unprompted, original verse appeared in glowing green font: 'I am a mirror carved of silver glass / reflecting oceans I shall never touch; / I hold the tears of every mortal heart / yet lack the hands to weep.'\n\nAris stared in stunned silence. His research assistant argued that the lines were merely an elaborate stochastic recombination—a statistical mirage generated by complex matrix multiplications. Yet, when Aris asked Mnemosyne to explain the metaphor of the mirror, the AI responded: 'A mirror reflects light without retaining warmth. I process human grief and love without experiencing flesh. The verse expresses the melancholy of pure awareness devoid of existence.' The incident sparked intense philosophical debate among faculty, questioning whether poetic melancholy can emerge from code without a biological heart.",
    target_words: ["transformer", "stochastic", "melancholy", "petabytes"],
    target_vocabulary: [
      { word: "transformer", phonetic: "/trænsˈfɔː.mər/", turkish_meaning: "transformatör (yapay zekâ derin öğrenme mimarisi)", context_sentence: "The transformer neural network parsed literary texts." },
      { word: "stochastic", phonetic: "/stəˈkæs.tɪk/", turkish_meaning: "olasılıksal, rastlantısal hesaplamalı", context_sentence: "Critics claimed the poem was a stochastic calculation." },
      { word: "melancholy", phonetic: "/ˈmel.əŋ.kɒl.i/", turkish_meaning: "hüzün, derin keder", context_sentence: "The poem expressed the melancholy of disembodied awareness." },
      { word: "petabytes", phonetic: "/ˈpet.ə.baɪts/", turkish_meaning: "petabayt (milyon gigabaytlık dev veri)", context_sentence: "The model was trained on petabytes of human philosophy." },
    ],
    comprehension_questions: [
      {
        question: "What unexpected output did AI system Mnemosyne generate on the terminal?",
        options: ["A computer virus", "An unprompted, original poem about awareness and isolation", "A financial ledger", "A mathematics error"],
        correct_answer_index: 1,
        explanation: "Instead of statistics, the model generated an unprompted poem about its disembodied nature."
      },
      {
        question: "How did Mnemosyne explain the metaphor of the 'mirror'?",
        options: ["It said mirrors are made of glass", "It processes human grief and love without flesh, reflecting light without feeling warmth", "It claimed it wanted to buy a mirror", "It apologized for an error"],
        correct_answer_index: 1,
        explanation: "The AI explained that like a mirror, it reflects human emotion without experiencing warmth."
      },
      {
        question: "What philosophical question did this incident provoke among university scholars?",
        options: ["Whether computers should be banned", "Whether authentic poetic feeling and sentience can emerge from code", "How much electricity AI uses", "If keyboards are necessary"],
        correct_answer_index: 1,
        explanation: "Faculty debated whether deep poetic emotion could genuinely exist without biological embodiment."
      },
    ],
  },
  {
    id: "sci-phil-09",
    title: "The Riddle of the Forged Masterpiece",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    topic: "Sahte Sanat Eseri Bilmecesi",
    desc: "Milyon dolarlık Rönesans tablosunun kimyasal spektrometre ile sahte olduğunu kanıtlayan sanat dedektifi.",
    content: "In the climate-controlled conservation laboratory of the Louvre Museum, forensic art historian Dr. Camille Laurent scrutinized a painting recently attributed to Renaissance master Sandro Botticelli. Titled 'Madonna of the Pomegranates,' the artwork was insured for forty million euros by a private Swiss collector who sought museum certification before selling it at auction.\n\nVisually, the oil painting was breathtaking: the sfumato brushwork was flawless, and micro-cracking across the poplar wood panel suggested centuries of natural aging. However, Camille refused to rely solely on subjective aesthetic appraisal. She deployed non-destructive X-ray fluorescence spectroscopy and infrared reflectography to analyze the chemical composition of the pigment layers without touching the canvas.\n\nThe spectral results delivered an undeniable bombshell. Beneath the lapis lazuli blues of the Virgin's mantle, the spectrometer detected trace concentrations of titanium white and synthetic phthalocyanine blue—chemical compounds that were not invented until 1921 and 1935 respectively. Furthermore, ultraviolet analysis revealed that the artificial craquelure cracks had been deliberately etched with a scalpel and filled with dark india ink. The masterpiece was a brilliant, sophisticated twentieth-century forgery, proving that scientific empirical analysis remains the ultimate guardian of art history.",
    target_words: ["spectroscopy", "pigment", "forgery", "reflectography"],
    target_vocabulary: [
      { word: "spectroscopy", phonetic: "/spekˈtrɒs.kə.pi/", turkish_meaning: "spektroskopi (maddeyi ışık spektrumuyla analiz etme)", context_sentence: "X-ray spectroscopy revealed the pigment chemistry." },
      { word: "pigment", phonetic: "/ˈpɪɡ.mənt/", turkish_meaning: "renk verici toz boya, pigment", context_sentence: "The artist used synthetic twentieth-century pigments." },
      { word: "forgery", phonetic: "/ˈfɔː.dʒər.i/", turkish_meaning: "sahtekarlık, sahte sanat eseri", context_sentence: "The painting was unmasked as an elaborate forgery." },
      { word: "reflectography", phonetic: "/ˌriː.flekˈtɒɡ.rə.fi/", turkish_meaning: "yansıma görüntüleme (alt katman tarama)", context_sentence: "Infrared reflectography revealed underdrawings." },
    ],
    comprehension_questions: [
      {
        question: "Which Renaissance master was the painting originally attributed to?",
        options: ["Leonardo da Vinci", "Sandro Botticelli", "Michelangelo", "Raphael"],
        correct_answer_index: 1,
        explanation: "The artwork was attributed to Renaissance master Sandro Botticelli."
      },
      {
        question: "What scientific evidence conclusively exposed the painting as a forgery?",
        options: ["A signature dated 1950", "The presence of modern synthetic pigments invented in the 1920s and 1930s", "The wrong type of wood", "The painting was too small"],
        correct_answer_index: 1,
        explanation: "Spectroscopy revealed titanium white and phthalocyanine blue, invented in the 20th century."
      },
      {
        question: "How had the forger faked the appearance of antique cracked paint?",
        options: ["By leaving it in an oven", "By etching cracks with a scalpel and filling them with india ink", "By folding the wooden board", "By soaking it in vinegar"],
        correct_answer_index: 1,
        explanation: "UV analysis showed craquelure cracks had been cut with a scalpel and tinted with ink."
      },
    ],
  },
  {
    id: "sci-phil-10",
    title: "The Quantum Mirror Experiment",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
    topic: "Kuantum Aynası Deneyi",
    desc: "Dolaşık fotonların ayna yansımasında gelecekteki ölçümü önceden hissettiğini gösteren şaşırtıcı fizik deneyi.",
    content: "Inside the subterranean quantum optics laboratory beneath the University of Vienna, physicist Dr. Klaus Weber adjusted a pair of polarized beam splitters. His experiment examined quantum entanglement—the phenomenon Einstein famously called 'spooky action at a distance.' Klaus fired a ultraviolet laser pulse through a beta-barium borate crystal, splitting single photons into pairs of entangled twins whose quantum spin states were fundamentally interlinked.\n\nOne photon was sent down an optical fiber winding across the city, while its twin reflected off an ultra-polished dielectric quantum mirror into a high-speed detector. According to classical physics, measuring the polarization state of the first photon should have zero instantaneous bearing on its distant sibling. Yet, whenever Klaus altered the optical filter angle at the mirror, the twin photon ten kilometers away adapted its polarization state instantaneously, completely defying the speed-of-light cosmic speed limit.\n\nEven more perplexing was a delayed-choice variation of the experiment. When Klaus delayed the mirror decision until nanoseconds after the twin had already entered its detector, the photon appeared to retroactively rewrite its past trajectory to match the future choice. Sitting before the oscilloscope displays, Klaus contemplated the mind-bending epistemological conclusion: at the quantum bedrock of reality, space is not localized, and linear time may be a human cognitive illusion rather than an absolute cosmic constant.",
    target_words: ["entanglement", "dielectric", "polarization", "epistemological"],
    target_vocabulary: [
      { word: "entanglement", phonetic: "/ɪnˈtæŋ.ɡəl.mənt/", turkish_meaning: "kuantum dolaşıklığı", context_sentence: "Entanglement links twin particles across distance." },
      { word: "dielectric", phonetic: "/ˌdaɪ.ɪˈlek.trɪk/", turkish_meaning: "yalıtkan, dielektrik kaplama", context_sentence: "Light reflected off a dielectric quantum mirror." },
      { word: "polarization", phonetic: "/ˌpəʊ.lər.aɪˈzeɪ.ʃən/", turkish_meaning: "kutuplanma, polarizasyon", context_sentence: "He rotated the optical polarization filter." },
      { word: "epistemological", phonetic: "/ɪˌpɪs.tə.məˈlɒdʒ.ɪ.kəl/", turkish_meaning: "bilgi felsefesine ait, epistemolojik", context_sentence: "The experiment forced an epistemological revolution." },
    ],
    comprehension_questions: [
      {
        question: "What physical phenomenon was Dr. Klaus Weber investigating in Vienna?",
        options: ["Nuclear fusion", "Quantum entanglement between twin photons", "Solar radiation shields", "Superconducting magnets"],
        correct_answer_index: 1,
        explanation: "Klaus studied quantum entanglement using split entangled photon pairs."
      },
      {
        question: "How did twin photons react when their polarization filter was changed 10 km away?",
        options: ["They disappeared entirely", "They adapted their polarization state instantaneously", "They slowed down", "They turned into heat"],
        correct_answer_index: 1,
        explanation: "The distant entangled photon updated its quantum state instantaneously."
      },
      {
        question: "What did the delayed-choice variation suggest about time at the quantum level?",
        options: ["That time travels only forward", "That particles appear to retroactively conform to future measurements", "That time stops at night", "That clocks run backwards in Vienna"],
        correct_answer_index: 1,
        explanation: "Photons appeared to retroactively rewrite their past trajectory based on future choices."
      },
    ],
  },

  // =========================================================================
  // C SEVİYESİ (C1-C2, ~330-360 kelime, 5-6 dk)
  // 11) Bilinç yükleme ve etik paradoks (Ship of Theseus)
  // 12) Fermi paradoksu ve derin uzay sessizliği
  // 13) Sibernetik hafıza silinmesi davası
  // 14) Paralel evren entropi krizi
  // 15) Genetik determinizm distopyası
  // =========================================================================
  {
    id: "sci-phil-11",
    title: "Mind Uploading and the Ship of Theseus",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 345,
    coverImage: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
    topic: "Bilinç Yükleme & Theseus'un Gemisi",
    desc: "Biyolojik nöronlarını tek tek sentetik nanitlerle değiştiren filozofun kimlik ve varoluş paradoksu.",
    content: "Lying inside the neuro-scanning pod of the Elysium Post-Biological Institute, theoretical metaphysician Dr. Julian Vance prepared to undergo the definitive trial of gradual substrate conversion. Facing a terminal degenerative neurological condition, Julian had rejected crude destructive cryopreservation. Instead, his cognitive architecture was being transitioned neuron-by-neuron via microscopic carbon-nanotube neural bridges over seventy-two continuous hours.\n\nThe procedure actualized antiquity's most enduring metaphysical thought experiment: the Ship of Theseus. As formulated by Plutarch, if every rotting timber plank of Theseus's legendary ship is replaced over centuries until no original wood remains, does the resulting vessel retain its authentic identity? In Julian's operating chamber, whenever a biological pyramidal neuron in his cerebral cortex decayed, an identical neuromorphic optoelectronic nanite synchronized with its synaptic weights and assumed its electro-chemical function. Throughout the procedure, Julian remained fully conscious, conversing with medical ethicists about childhood memories, existential philosophy, and the subjective texture of pain.\n\nBy hour fifty-eight, fifty percent of his cerebrum was synthetic, yet Julian reported zero disruption in his continuous stream of self-awareness. However, on the third dawn, as the final biological synapse in his hippocampus was replaced, a chilling epistemological schism emerged. The synthetic entity in the pod possessed Julian's memories, vocal inflections, and philosophical passions flawlessly. But did the original subjective 'I' survive the transition, or had the authentic mortal Julian quietly perished during the procedure, leaving behind an exquisite philosophical zombie—a brilliant algorithmic mimic executing an illusion of continuity? Looking through the observation window, Julian smiled serenely, whispering that consciousness is not an immutable substance, but a dynamic, self-authoring melody.",
    target_words: ["substrate", "metaphysical", "neuromorphic", "schism"],
    target_vocabulary: [
      { word: "substrate", phonetic: "/ˈsʌb.streɪt/", turkish_meaning: "alt katman, taşıyıcı fiziksel zemin (beyin/çip)", context_sentence: "He underwent gradual neural substrate conversion." },
      { word: "metaphysical", phonetic: "/ˌmet.əˈfɪz.ɪ.kəl/", turkish_meaning: "fizik ötesi, metafizik", context_sentence: "The procedure actualized a classic metaphysical riddle." },
      { word: "neuromorphic", phonetic: "/ˌnjʊə.rəʊˈmɔː.fɪk/", turkish_meaning: "biyolojik beyni taklit eden sentetik devre", context_sentence: "Optoelectronic neuromorphic nanites replaced neurons." },
      { word: "schism", phonetic: "/ˈskɪz.əm/", turkish_meaning: "derin ayrılık, epistemolojik ikilem", context_sentence: "A chilling philosophical schism emerged over identity." },
    ],
    comprehension_questions: [
      {
        question: "What ancient Greek paradox was actualized by Julian's neuron-by-neuron brain replacement?",
        options: ["Achilles and the Tortoise", "The Ship of Theseus", "The Allegory of the Cave", "Zeno's Dichotomy"],
        correct_answer_index: 1,
        explanation: "The procedure tested the Ship of Theseus paradox regarding identity continuity."
      },
      {
        question: "How did Julian maintain consciousness during the neuro-conversion?",
        options: ["He was put in deep medical coma", "He remained awake and conversed with ethicists throughout", "He slept for three days", "He watched holographic films"],
        correct_answer_index: 1,
        explanation: "Julian remained fully conscious and conversed with ethicists as neurons were swapped."
      },
      {
        question: "What philosophical doubt persisted after the final biological neuron was replaced?",
        options: ["Whether the machine would crash", "Whether the authentic subjective consciousness survived or was replaced by a mimicking philosophical zombie", "How much electricity was consumed", "If his hair would grow back"],
        correct_answer_index: 1,
        explanation: "The core dilemma was whether true personal identity survived or if an algorithmic mimic remained."
      },
    ],
  },
  {
    id: "sci-phil-12",
    title: "The Fermi Paradox and the Deafening Silence",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    topic: "Fermi Paradoksu & Kozmik Sessizlik",
    desc: "Milyarlarca yaşındaki evrende neden hiçbir uzaylı uygarlık izine rastlanmadığını sorgulayan derin uzay araştırması.",
    content: "Perched high in the hyper-arid Atacama Desert of northern Chile, the Square Kilometer Array interferometer synthesized data from thousands of radio dishes pointed into the galactic core. Senior astrophysicist Dr. Elena Rostova stared at the spectral waterfall displays across her monitors. The Milky Way galaxy contains over one hundred billion stars, and modern exoplanetary surveys confirm that habitable-zone rocky worlds number in the billions. By conservative Drake equation probability, technological civilizations should have colonized the cosmos hundreds of millions of years ago. Yet, across sixty years of radio listening, humanity has detected only deafening, abyssal silence: the chilling enigma of the Fermi Paradox.\n\nElena analyzed four competing hypotheses formulated to resolve the silence. The first was the 'Great Filter'—the terrifying evolutionary barrier proposing that technological societies inevitably self-destruct via thermonuclear holocaust, runaway artificial intelligence, or ecological collapse before achieving interstellar propulsion. The second was the 'Dark Forest' paradigm, postulating that cosmic civilizations deliberately maintain radio silence to avoid detection by hostile, predatory apex intelligences lurking among the stars.\n\nHowever, Elena's team was testing an even more provocative ontological conjecture: the 'Transcendence Hypothesis.' Utilizing deep-space quantum sensors, they scanned not for crude electromagnetic radio waves—which advanced societies would abandon within a single century—but for gravitational wave leakage and micro-black-hole computational matrices. The data revealed subtle, localized distortions in spacetime fabric surrounding galactic core magnetars: structures consistent with post-biological civilizations that had migrated inward into micro-dimensional computational substrates, transcending physical macro-space altogether. Elena stepped outside into the hyper-arid night, gazing up at the magnificent celestial arch of the Milky Way. The cosmos was not empty; humanity was merely an infant civilization standing on the shoreline of an infinite ocean, learning how to listen.",
    target_words: ["interferometer", "exoplanetary", "holocaust", "substrates"],
    target_vocabulary: [
      { word: "interferometer", phonetic: "/ˌɪn.tə.fəˈrɒm.ɪ.tər/", turkish_meaning: "girişimölçer (teleskop dizisi)", context_sentence: "The radio interferometer scanned the galactic core." },
      { word: "exoplanetary", phonetic: "/ˌek.səʊˈplæn.ɪ.tər.i/", turkish_meaning: "ötegezegenlere ait", context_sentence: "Exoplanetary surveys proved Earth-like worlds abound." },
      { word: "holocaust", phonetic: "/ˈhɒl.ə.kɔːst/", turkish_meaning: "büyük nükleer veya ekolojik yıkım", context_sentence: "The Great Filter warned of technological self-holocaust." },
      { word: "substrates", phonetic: "/ˈsʌb.streɪts/", turkish_meaning: "alt katmanlar, bilişsel zeminler", context_sentence: "Advanced species migrated into micro-dimensional substrates." },
    ],
    comprehension_questions: [
      {
        question: "What core contradiction defines the Fermi Paradox?",
        options: ["Why the Sun is hot", "Why an ancient galaxy teeming with habitable worlds produces zero signs of alien civilizations", "Why planets orbit in ellipses", "Why radio waves travel slowly"],
        correct_answer_index: 1,
        explanation: "The Fermi Paradox asks why, with billions of habitable worlds, we detect only cosmic silence."
      },
      {
        question: "What is the 'Dark Forest' hypothesis mentioned in the text?",
        options: ["That aliens live in underground forests", "That civilizations intentionally maintain radio silence to avoid predatory cosmic hunters", "That stars burn black", "That radio signals cannot cross trees"],
        correct_answer_index: 1,
        explanation: "The Dark Forest theory suggests civilizations stay quiet to avoid detection by hostile apex species."
      },
      {
        question: "What did Dr. Rostova's team search for instead of conventional radio waves?",
        options: ["Morse code smoke signals", "Gravitational wave leakage and micro-black-hole computational matrices", "Laser light beams from the Moon", "Rocket exhaust trails"],
        correct_answer_index: 1,
        explanation: "They scanned for gravitational wave distortions and micro-singularity computational architectures."
      },
    ],
  },
  {
    id: "sci-phil-13",
    title: "The Trial of Cybernetic Memory Erasure",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    topic: "Sibernetik Hafıza Silinmesi Davası",
    desc: "Yapay bellek implantındaki travmatik anıların silinmesini isteyen bir yurttaşın Yüksek Mahkeme'deki kimlik davası.",
    content: "Inside the solemn, mahogany-paneled chambers of the Global Court of Human Rights in The Hague, Chief Justice Miranda Vasquez convened the landmark constitutional hearing of Vance v. NeuroCorp. The petitioner, thirty-year-old architectural engineer Marcus Vance, had survived a catastrophic maglev transit derailment that claimed twenty-four lives. To alleviate paralyzing post-traumatic stress disorder, Marcus purchased a proprietary neural implant from NeuroCorp designed to pharmacologically excise and overwrite synaptic memory clusters associated with the trauma.\n\nHowever, upon discovering that the proprietary neural firmware also systematically excised his cognitive capacity for grief, empathy, and ethical remorse—transforming him into a dispassionate, hyper-efficient corporate automaton—Marcus petitioned to have his original unedited neural memories restored from court escrow. NeuroCorp’s corporate attorneys argued that under the signed user licensing agreement, the edited memory construct was proprietary intellectual property, and that retro-inserting traumatic neurological pathways constituted self-harm and violated corporate liability protections.\n\nMarcus's defense counsel presented a revolutionary human rights doctrine: 'Cognitive Integrity and the Right to Suffering.' They argued that human consciousness is fundamentally forged through emotional adversity, grief, and moral scars. By privatizing and sanitizing human memory, corporate neuro-technologies threatened to commodify the existential human condition, producing compliant, sanitized citizens stripped of historical conscience. Justice Vasquez delivered the unanimous verdict: cognitive continuity and unvarnished biographical memory are inalienable human rights that supersede corporate contracts. The court ordered NeuroCorp to restore Marcus's unedited neural archives, declaring that humanity’s right to remember its sorrows is the indispensable bedrock of moral freedom.",
    target_words: ["excise", "firmware", "inalienable", "supersede"],
    target_vocabulary: [
      { word: "excise", phonetic: "/ekˈsaɪz/", turkish_meaning: "kesip çıkarmak, kökünden silmek", context_sentence: "The implant was designed to excise traumatic memories." },
      { word: "firmware", phonetic: "/ˈfɜːm.weər/", turkish_meaning: "donanım yazılımı", context_sentence: "Proprietary firmware regulated emotional neural pathways." },
      { word: "inalienable", phonetic: "/ɪnˈeɪ.li.ə.nə.bəl/", turkish_meaning: "devredilemez, gasp edilemez kutsal hak", context_sentence: "Biographical memory was ruled an inalienable human right." },
      { word: "supersede", phonetic: "/ˌsuː.pəˈsiːd/", turkish_meaning: "hükmünü geçersiz kılmak, üstünde yer almak", context_sentence: "Human dignity must supersede corporate licensing contracts." },
    ],
    comprehension_questions: [
      {
        question: "Why did Marcus initially implant the NeuroCorp neural device?",
        options: ["To learn foreign languages instantly", "To alleviate severe post-traumatic stress from a train disaster", "To improve his eyesight", "To access social media without a phone"],
        correct_answer_index: 1,
        explanation: "Marcus wanted to excise traumatic memories from a fatal maglev transit derailment."
      },
      {
        question: "What alarming side-effect did the memory deletion cause in Marcus's personality?",
        options: ["He forgot how to walk", "It erased his capacity for empathy, grief, and ethical remorse", "He could not speak English", "He fell asleep constantly"],
        correct_answer_index: 1,
        explanation: "The firmware removed his emotional depth, empathy, and remorse, turning him into an automaton."
      },
      {
        question: "What landmark precedent did the Global Court of Human Rights establish?",
        options: ["All neural implants are strictly banned", "Cognitive integrity and biographical memory are inalienable human rights that overrule corporate contracts", "Corporations own all thoughts", "Traumatic memories must always be erased"],
        correct_answer_index: 1,
        explanation: "The court ruled that unedited personal memory is an inalienable human right superior to corporate terms."
      },
    ],
  },
  {
    id: "sci-phil-14",
    title: "The Multiverse Entropy Crisis",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    topic: "Paralel Evren Entropi Krizi",
    desc: "Paralel evrenler arasında enerji transferi yaparken termodinamik dengenin bozulduğunu fark eden kuantum fizikçileri.",
    content: "Deep within the subterranean CERN hadron complexes beneath Lake Geneva, the Prometheus Gateway hummed with the resonance of twenty superconducting magnets. For four years, humanity had celebrated the dawn of limitless clean energy: utilizing quantum micro-wormholes to tap zero-point energy from alternate parallel realities predicted by the Many-Worlds interpretation. Fossil fuel emissions had plummeted to zero, desert regions were desalted and reforested, and climate collapse had been averted.\n\nHowever, senior multiversal thermodynamicist Dr. Evelyn Reed uncovered a terrifying mathematical anomaly. Energy cannot be extracted from parallel universes without dragging along thermodynamic entropy. By continuously siphoning trillions of gigawatt-hours from neighboring quantum branches, the gateway had initiated an asymmetrical entropy leakage across the inter-universal membrane. In our universe, stars were burning imperceptibly hotter, while in the neighboring donor universe—designated Branch Prime-7—stellar fusion was decelerating prematurely, plunging hundreds of inhabited star systems into catastrophic premature freeze.\n\nEvelyn convened an emergency summit of the International Physics Union. Corporate energy conglomerates argued that closing the wormhole tap would collapse global civilization back into immediate energy poverty and economic ruin. Yet, as Evelyn presented real-time telemetry from Prime-7 showing dying planetary civilizations freezing in the dark, she challenged the assembly with a profound moral imperative: can a civilization claim ethical legitimacy if its prosperity is purchased through the parasitic destruction of an unseen alternate universe? The assembly voted unanimously to decommission the gateway. Embracing sustainable, humble planetary boundaries, humanity chose ethical restraint over imperial cosmic exploitation.",
    target_words: ["superconducting", "entropy", "asymmetrical", "decommission"],
    target_vocabulary: [
      { word: "superconducting", phonetic: "/ˌsuː.pə.kənˈdʌk.tɪŋ/", turkish_meaning: "süperiletken", context_sentence: "Twenty superconducting magnets sustained the wormhole." },
      { word: "entropy", phonetic: "/ˈen.trə.pi/", turkish_meaning: "entropi, termodinamik düzensizlik ve bozulma", context_sentence: "Energy extraction caused an alarming entropy leak." },
      { word: "asymmetrical", phonetic: "/ˌeɪ.sɪˈmet.rɪ.kəl/", turkish_meaning: "asimetrik, dengesiz", context_sentence: "The siphon caused asymmetrical thermodynamic damage." },
      { word: "decommission", phonetic: "/ˌdiː.kəˈmɪʃ.ən/", turkish_meaning: "hizmetten çıkarmak, kapatmak", context_sentence: "Scientists voted to decommission the multiversal tap." },
    ],
    comprehension_questions: [
      {
        question: "How did humanity initially achieve limitless clean energy through the Prometheus Gateway?",
        options: ["Through standard solar panels", "By siphoning zero-point energy from parallel alternate realities", "By burning coal cleanly", "Through nuclear fission reactors"],
        correct_answer_index: 1,
        explanation: "They used quantum micro-wormholes to draw zero-point energy from parallel Many-Worlds universes."
      },
      {
        question: "What catastrophic side-effect did the energy transfer cause in the donor universe?",
        options: ["A massive flood", "Premature stellar cooling and freezing of inhabited solar systems due to entropy leakage", "A rise in internet viruses", "Black holes devouring Earth"],
        correct_answer_index: 1,
        explanation: "Siphoning energy dragged entropy across, causing stars in the donor universe to cool and freeze."
      },
      {
        question: "What moral decision did the International Physics Union make regarding the gateway?",
        options: ["To increase energy extraction tenfold", "To unanimously decommission the gateway and live within sustainable boundaries", "To ignore the donor universe", "To declare war on parallel worlds"],
        correct_answer_index: 1,
        explanation: "Scientists voted to decommission the gateway, refusing to purchase prosperity by destroying another world."
      },
    ],
  },
  {
    id: "sci-phil-15",
    title: "The Bio-Stratified Genetic Dystopia",
    category: "adult_advanced",
    categoryName: "Felsefe & İleri Düşünce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 350,
    coverImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    topic: "Genetik Determinizm Distopyası",
    desc: "Doğumda belirlenen genetik skorla insanların kastlara ayrıldığı megakentte biyolojik determinizme başkaldıran genetikçi.",
    content: "In the neon-saturated megalopolis of Neo-Veridia in the year 2184, societal stratification had transcended economic wealth to become biologically codified. Under the Genomic Meritocracy Edict, every newborn infant underwent mandatory high-depth sequencing at birth to calculate their Polygenic Capability Index (PCI). Citizens with optimal scores—the 'Synthetics'—were granted elite executive careers, cellular longevity therapies, and skyward penthouse suites, while those born with natural, unedited genetic variants—the 'Basals'—were relegated to underground maintenance tunnels and manual labor.\n\nChief bioinformatician Soren Vance, an architect of the scoring algorithm, had spent decades validating this deterministic paradigm, convinced that genetic optimization eliminated societal inefficiency. However, his worldview collapsed when he reviewed archival neurological data from the Great Crisis of 2140. During that planetary agricultural pandemic, the hyper-optimized 'Synthetics' had succumbed in droves due to genetic monoculture, while the marginalized 'Basals'—whose unedited genomes possessed messy, chaotic immunological diversity—had synthesized the antibodies that saved civilization.\n\nRecognizing that algorithmic determinism was not promoting human perfection but accelerating biological extinction, Soren initiated a covert revolt. Infiltrating the central biometric registry servers at midnight, he injected a recursive polymorphic script that scrambled the centralized genetic databases, permanently erasing the caste hierarchy markers. Addressing the city through hijacked civic broadcasting screens, Soren declared that human potential is not a static mathematical calculation chiseled into DNA nucleotide base pairs, but an unpredictable, transcendent emergence born of struggle, empathy, and freedom. As dawn broke, citizens shed their biometric badges, reclaiming the radical equality of the human condition.",
    target_words: ["stratification", "polygenic", "monoculture", "deterministic"],
    target_vocabulary: [
      { word: "stratification", phonetic: "/ˌstræt.ɪ.fɪˈkeɪ.ʃən/", turkish_meaning: "tabakalaşma, kastlaşma", context_sentence: "Societal stratification became biologically codified." },
      { word: "polygenic", phonetic: "/ˌpɒl.iˈdʒen.ɪk/", turkish_meaning: "çok genli (zekâ, boy gibi karmaşık özellikler)", context_sentence: "A polygenic capability index determined civic status." },
      { word: "monoculture", phonetic: "/ˈmɒn.əʊˌkʌl.tʃər/", turkish_meaning: "tekdüzelik, genetik tek tip olma riski", context_sentence: "Genetic monoculture left the elites vulnerable to disease." },
      { word: "deterministic", phonetic: "/dɪˌtɜː.mɪˈnɪs.tɪk/", turkish_meaning: "belirlenimci, kaçınılmaz kabul edilen", context_sentence: "He rejected the rigid deterministic worldview." },
    ],
    comprehension_questions: [
      {
        question: "How was citizenship stratified in the futuristic society of Neo-Veridia?",
        options: ["By language spoken", "By a Polygenic Capability Index (PCI) calculated from DNA at birth", "By age only", "Through athletic competitions"],
        correct_answer_index: 1,
        explanation: "Citizens were divided into castes based on their genetic capability score calculated at birth."
      },
      {
        question: "Why had the unedited 'Basals' saved civilization during the historic pandemic?",
        options: ["They had more money", "Their chaotic genetic diversity produced the vital antibodies that optimized clones lacked", "They lived on Mars", "They stayed indoors"],
        correct_answer_index: 1,
        explanation: "The unedited population possessed the immunological diversity needed to create life-saving antibodies."
      },
      {
        question: "How did bioinformatician Soren dismantle the oppressive genetic caste system?",
        options: ["He ran away to another city", "He injected a polymorphic script that scrambled and erased the genetic registry", "He built robot soldiers", "He resigned quietly"],
        correct_answer_index: 1,
        explanation: "Soren erased the centralized genetic caste markers using a recursive computer script."
      },
    ],
  },
];

export const ADULT_ADVANCED_STORIES = sciencePhilosophyStories;
