import { Story } from "./types";

export const kidsStories: Story[] = [
  // =========================================================================
  // A SEVİYESİ (A1-A2, ~100 kelime, 2-3 dk)
  // =========================================================================
  {
    id: "kids-01",
    title: "Sparky and the Red Balloon",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 105,
    coverImage: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80",
    topic: "Macera & Dostluk",
    desc: "Neşeli tilki Sparky, rüzgarla uçan kırmızı bir balonu yakalamak için çiçekli tepede eğlenceli bir maceraya koşar.",
    content: "Sparky the friendly orange fox was playing in the sunny meadow. Suddenly, a bright red balloon floated across the blue sky. 'Look at that beautiful balloon!' shouted Sparky happily. A gentle summer wind carried the balloon toward the green hills. Sparky ran across the soft grass as fast as his little paws could go. Near the big oak tree, the balloon got caught on a low wooden branch. Sparky gently jumped up and untied the string. He smiled and shared the balloon with his rabbit friend Barnaby.",
    target_words: ["meadow", "gentle", "branch", "string"],
    target_vocabulary: [
      { word: "meadow", phonetic: "/ˈmed.əʊ/", turkish_meaning: "çayır, otlak", context_sentence: "Sparky ran across the green meadow." },
      { word: "gentle", phonetic: "/ˈdʒen.təl/", turkish_meaning: "nazik, ılık", context_sentence: "A gentle wind carried the balloon." },
      { word: "branch", phonetic: "/brɑːntʃ/", turkish_meaning: "ağaç dalı", context_sentence: "The balloon was stuck on a wooden branch." },
      { word: "string", phonetic: "/strɪŋ/", turkish_meaning: "ip, kordon", context_sentence: "Sparky carefully held the long string." },
    ],
    comprehension_questions: [
      {
        question: "What color was the balloon?",
        options: ["Blue", "Red", "Yellow", "Green"],
        correct_answer_index: 1,
        explanation: "The text states that a bright red balloon floated across the blue sky."
      },
      {
        question: "Where did the balloon get caught?",
        options: ["In a river", "On a car", "On a tree branch", "Under a rock"],
        correct_answer_index: 2,
        explanation: "The balloon got caught on a low wooden branch near the big oak tree."
      },
      {
        question: "Who did Sparky share the balloon with?",
        options: ["Barnaby the rabbit", "Oliver the owl", "Max the puppy", "Leo the lion"],
        correct_answer_index: 0,
        explanation: "Sparky smiled and shared the balloon with his rabbit friend Barnaby."
      },
    ],
  },
  {
    id: "kids-02",
    title: "Luna the Kitten's First Snow",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 108,
    coverImage: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80",
    topic: "Kış & Sevimli Keşif",
    desc: "Beyaz tüylü kedi Luna, bahçeye yağan ilk kar taneleriyle tanışır ve minik bir kızılgerdan kuşuyla arkadaş olur.",
    content: "Luna was a curious white kitten who loved sunny windows. One cold December morning, she opened her emerald eyes and looked outside. The green garden had vanished under a thick blanket of glittering white snow! Luna stepped out onto the porch cautiously. Her soft paws made tiny crunching sounds in the fresh snow. A friendly red-breasted robin perched on a wooden fence post and chirped cheerfully. Luna chased playful snowflakes dancing in the chilly breeze, discovering the pure wonder of her very first winter day.",
    target_words: ["curious", "vanished", "crunching", "perched"],
    target_vocabulary: [
      { word: "curious", phonetic: "/ˈkjʊə.ri.əs/", turkish_meaning: "meraklı", context_sentence: "Luna was a curious little kitten." },
      { word: "vanished", phonetic: "/ˈvæn.ɪʃt/", turkish_meaning: "gözden kayboldu", context_sentence: "The green grass vanished under the snow." },
      { word: "crunching", phonetic: "/ˈkrʌn.tʃɪŋ/", turkish_meaning: "çatırdayan, ezilme sesi çıkaran", context_sentence: "Her paws made crunching sounds in the snow." },
      { word: "perched", phonetic: "/pɜːtʃt/", turkish_meaning: "tünedi, kondu", context_sentence: "The little bird perched on the wooden fence." },
    ],
    comprehension_questions: [
      {
        question: "What color was Luna the kitten?",
        options: ["Black", "White", "Orange", "Spotted"],
        correct_answer_index: 1,
        explanation: "Luna was described as a curious white kitten."
      },
      {
        question: "What covered the garden in December?",
        options: ["Fallen leaves", "Glittering white snow", "Rain puddles", "Mud"],
        correct_answer_index: 1,
        explanation: "The garden was covered under a thick blanket of glittering white snow."
      },
      {
        question: "Which bird did Luna see on the fence post?",
        options: ["A red-breasted robin", "A black crow", "A blue jay", "An eagle"],
        correct_answer_index: 0,
        explanation: "A friendly red-breasted robin perched on the wooden fence post."
      },
    ],
  },
  {
    id: "kids-03",
    title: "The Magic Paintbrush",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 110,
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    topic: "Büyülü Sanat",
    desc: "Tavan arasında eski bir fırça bulan küçük Leo'nun kağıda çizdiği elmalar ve kelebekler canlanır.",
    content: "While exploring the wooden attic of his grandmother's house, young Leo found an antique silver paintbrush inside a velvet box. He took out a sheet of white paper and painted a bright red apple. To his amazement, the painted fruit popped off the paper into his hand—sweet, crisp, and real! Next, Leo carefully painted a fluttering golden butterfly. It fluttered its delicate wings and flew around the sunlit room before landing gently on his shoulder. Leo smiled warmly, realizing his kind paintbrush could bring happiness to everyone.",
    target_words: ["antique", "amazement", "fluttering", "delicate"],
    target_vocabulary: [
      { word: "antique", phonetic: "/ænˈtiːk/", turkish_meaning: "antika, eski ve değerli", context_sentence: "He found an antique paintbrush in the attic." },
      { word: "amazement", phonetic: "/əˈmeɪz.mənt/", turkish_meaning: "şaşkınlık, hayret", context_sentence: "To his amazement, the apple became real." },
      { word: "fluttering", phonetic: "/ˈflʌt.ər.ɪŋ/", turkish_meaning: "kanat çırpan", context_sentence: "A fluttering butterfly flew through the air." },
      { word: "delicate", phonetic: "/ˈdel.ɪ.kət/", turkish_meaning: "narin, hassas", context_sentence: "The butterfly had delicate golden wings." },
    ],
    comprehension_questions: [
      {
        question: "Where did Leo discover the silver paintbrush?",
        options: ["In his school bag", "In his grandmother's attic", "By the garden pond", "In a bookshop"],
        correct_answer_index: 1,
        explanation: "Leo found the paintbrush while exploring the wooden attic of his grandmother's house."
      },
      {
        question: "What was the first thing Leo painted?",
        options: ["A red apple", "A racing car", "A blue bird", "A sailboat"],
        correct_answer_index: 0,
        explanation: "He first painted a bright red apple that popped off the paper."
      },
      {
        question: "Where did the golden butterfly land?",
        options: ["On the window", "On Leo's shoulder", "In a glass cup", "On the roof"],
        correct_answer_index: 1,
        explanation: "The butterfly flew around the room and landed gently on his shoulder."
      },
    ],
  },
  {
    id: "kids-04",
    title: "Oliver the Owl Who Loved Day",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 112,
    coverImage: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=800&q=80",
    topic: "Gündüzü Seven Baykuş",
    desc: "Geceleri uyumayıp sabah güneşini ve rengarenk kelebekleri ilk kez gören sevimli yavru baykuş Oliver.",
    content: "All the owls in Whispering Wood slept during the sunny daytime and woke at dusk. But little Oliver was different. He was curious about what the world looked like when the sun was shining. One spring morning, Oliver refused to close his big round eyes. He sat on an oak branch and watched in awe as golden sunlight warmed the morning dew. Vibrant yellow daffodils blossomed across the grass, and honeybees hummed among wildflowers. 'Daytime is filled with magical colors!' hooted Oliver with great joy.",
    target_words: ["dusk", "refused", "daffodils", "vibrant"],
    target_vocabulary: [
      { word: "dusk", phonetic: "/dʌsk/", turkish_meaning: "alacakaranlık, gün batımı", context_sentence: "Owls usually wake up at dusk." },
      { word: "refused", phonetic: "/rɪˈfjuːzd/", turkish_meaning: "reddetti", context_sentence: "Oliver refused to sleep in the morning." },
      { word: "daffodils", phonetic: "/ˈdæf.ə.dɪlz/", turkish_meaning: "nergis çiçekleri", context_sentence: "Bright yellow daffodils grew in the meadow." },
      { word: "vibrant", phonetic: "/ˈvaɪ.brənt/", turkish_meaning: "canlı, parlak", context_sentence: "The meadow was filled with vibrant colors." },
    ],
    comprehension_questions: [
      {
        question: "When did other owls in the woods usually wake up?",
        options: ["At noon", "At dusk", "At sunrise", "At midnight"],
        correct_answer_index: 1,
        explanation: "The other owls in Whispering Wood slept during the day and woke at dusk."
      },
      {
        question: "What flower blossomed across the grass in the morning?",
        options: ["Red roses", "Yellow daffodils", "Blue waterlilies", "White daisies"],
        correct_answer_index: 1,
        explanation: "Vibrant yellow daffodils blossomed across the grass in the sunlight."
      },
      {
        question: "How did Oliver feel about daytime?",
        options: ["He thought it was scary", "He loved its magical colors", "He found it too hot", "He wished it was darker"],
        correct_answer_index: 1,
        explanation: "Oliver hooted happily that daytime was filled with magical colors."
      },
    ],
  },
  {
    id: "kids-05",
    title: "Barnaby's Golden Sunflower",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 110,
    coverImage: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80",
    topic: "Sabır & Çiçek Büyütmek",
    desc: "Tavşan Barnaby'nin sabırla suladığı minik tohumun gökyüzüne uzanan dev bir ayçiçeğine dönüşmesi.",
    content: "Barnaby the rabbit received a tiny striped black seed from his grandmother. He dug a small hole in the garden and placed the seed inside rich brown soil. Every morning after breakfast, Barnaby carried a blue watering can to shower the earth with clean water. Days passed, and a tiny green sprout emerged. Barnaby sang cheerful songs to encourage it. Soon, the plant grew taller than Barnaby, then taller than his wooden burrow! A magnificent golden sunflower opened its petals, smiling brightly at the warm sun.",
    target_words: ["striped", "sprout", "emerged", "magnificent"],
    target_vocabulary: [
      { word: "striped", phonetic: "/straɪpt/", turkish_meaning: "çizgili", context_sentence: "He held a tiny striped black seed." },
      { word: "sprout", phonetic: "/spraʊt/", turkish_meaning: "filiz, taze sürgün", context_sentence: "A green sprout poked through the soil." },
      { word: "emerged", phonetic: "/ɪˈmɜːdʒd/", turkish_meaning: "ortaya çıktı, belirdi", context_sentence: "The baby plant emerged after rain." },
      { word: "magnificent", phonetic: "/mæɡˈnɪf.ɪ.sənt/", turkish_meaning: "muhteşem, görkemli", context_sentence: "A magnificent sunflower smiled at the sun." },
    ],
    comprehension_questions: [
      {
        question: "Who gave Barnaby the seed?",
        options: ["Sparky the fox", "His grandmother", "A farmer", "The wind"],
        correct_answer_index: 1,
        explanation: "Barnaby received the tiny seed from his grandmother."
      },
      {
        question: "What color was Barnaby's watering can?",
        options: ["Red", "Blue", "Green", "Yellow"],
        correct_answer_index: 1,
        explanation: "The story mentions that Barnaby carried a blue watering can."
      },
      {
        question: "How tall did the sunflower eventually grow?",
        options: ["As tall as a blade of grass", "Taller than Barnaby and his burrow", "Only up to Barnaby's ears", "It never grew"],
        correct_answer_index: 1,
        explanation: "The sunflower grew taller than Barnaby and taller than his wooden burrow."
      },
    ],
  },

  // =========================================================================
  // B SEVİYESİ (B1-B2, ~200 kelime, 4-5 dk)
  // =========================================================================
  {
    id: "kids-06",
    title: "The Whispering Brook of Green Valley",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 215,
    coverImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    topic: "Orman ve Dayanışma",
    desc: "Neşeli dere aniden susunca iki meraklı ayı yavrusu dağa tırmanıp yaşlı kunduzun tıkalı kanalını temizler.",
    content: "Deep inside Green Valley, the crystal-clear brook was the heart of the woodland community. Every morning, deer drank from its pebbles, and silver trout leaped in the sun. But one Tuesday morning, the cheerful gurgling sound suddenly stopped. The stream bed turned to damp sand, leaving the woodland animals perplexed and thirsty.\n\nTwo energetic bear cubs, Koda and Maya, decided to investigate. Following the dry stones uphill toward Whispering Ridge, they discovered that a massive fallen hemlock tree had crashed across the narrow gorge, creating an accidental barrier that trapped the water in a stagnant pool. Beside the blockage sat Old Barnaby Beaver, clutching his swollen paw.\n\n'I tried to gnaw through the trunk alone, but a heavy bough slipped,' explained the elderly beaver weakly. Working cooperatively, Koda and Maya used their sturdy paws and thick branches as levers to dislodge the trapped timber, while Old Barnaby directed them from a safe rock. With a triumphant creak, the great log shifted aside. A torrent of sparkling water rushed forward once again, filling the riverbed with laughing ripples that echoed throughout the joyous valley.",
    target_words: ["perplexed", "stagnant", "dislodge", "cooperatively"],
    target_vocabulary: [
      { word: "perplexed", phonetic: "/pəˈplekst/", turkish_meaning: "şaşkın, aklı karışmış", context_sentence: "The thirsty animals were perplexed by the dry riverbed." },
      { word: "stagnant", phonetic: "/ˈstæɡ.nənt/", turkish_meaning: "durgun, akmayan", context_sentence: "The blocked water formed a stagnant pool." },
      { word: "dislodge", phonetic: "/dɪsˈlɒdʒ/", turkish_meaning: "yerinden oynatmak, sökmek", context_sentence: "They used levers to dislodge the heavy trunk." },
      { word: "cooperatively", phonetic: "/kəʊˈɒp.ər.ə.tɪv.li/", turkish_meaning: "dayanışma içinde, el birliğiyle", context_sentence: "The animals worked cooperatively to solve the problem." },
    ],
    comprehension_questions: [
      {
        question: "Why did the brook stop flowing in Green Valley?",
        options: ["A severe drought evaporated the river", "A fallen hemlock tree blocked the gorge", "The fish drank all the water", "Farmers built a concrete dam"],
        correct_answer_index: 1,
        explanation: "A massive fallen hemlock tree crashed across the narrow gorge, blocking the water."
      },
      {
        question: "Why was Old Barnaby Beaver unable to clear the log himself?",
        options: ["He was too sleepy", "His paw was injured when a heavy branch slipped", "He lost his wooden tools", "He preferred swimming in the pool"],
        correct_answer_index: 1,
        explanation: "The old beaver had injured his paw when a bough slipped while trying to gnaw the trunk."
      },
      {
        question: "How did Koda and Maya move the heavy timber?",
        options: ["By setting it on fire", "By using thick branches as levers", "By calling a helicopter", "By pulling with a rope"],
        correct_answer_index: 1,
        explanation: "The bear cubs used their paws and sturdy branches as levers to dislodge the log."
      },
    ],
  },
  {
    id: "kids-07",
    title: "The Little Clockmaker's Dragon",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 220,
    coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    topic: "Mekanik Ejderha & Dostluk",
    desc: "Pirinç dişliler ve yaylarla küçük bir saat kulesi ejderhası inşa eden çırak Felix'in sıcak hikayesi.",
    content: "In the Alpine village of Tick-Tock Hollow, every resident was a master craftsman of mechanical clocks. Twelve-year-old apprentice Felix, however, dreamed of inventing something beyond conventional pendulums. In his grandfather's attic workshop, he spent months assembling discarded brass gears, coiled copper springs, and miniature rubies to build Ignis, a clockwork dragon the size of a tea kettle.\n\nUnlike ordinary wind-up toys, Ignis possessed an ingenious escapement mechanism powered by thermal air drafts. When Felix wound the silver key beneath its wings, the dragon flapped its brass feathers, clicked its tiny cogwheels, and breathed harmless lavender-scented sparks. The skeptical town council declared the mechanical pet a frivolous waste of precious brass.\n\nHowever, during the fierce midwinter Blizzard of 1888, gale-force winds blew out the oil lamps inside the town's central clock tower, freezing the monumental gears that coordinated the valley train timetable. Felix carefully carried Ignis up the perilous icy stairwell. With gentle clicks, Ignis crawled between the frozen iron escapements, exhaling warm copper sparks that thawed the ice crystals and set the town's heartbeat ticking again. Felix was promptly awarded the master horologist medal.",
    target_words: ["escapement", "cogwheels", "frivolous", "horologist"],
    target_vocabulary: [
      { word: "escapement", phonetic: "/ɪˈskeɪp.mənt/", turkish_meaning: "saat maşası mekanizması", context_sentence: "The clockwork dragon had a delicate escapement." },
      { word: "cogwheels", phonetic: "/ˈkɒɡ.wiːlz/", turkish_meaning: "dişli çarklar", context_sentence: "Polished brass cogwheels clicked inside its chest." },
      { word: "frivolous", phonetic: "/ˈfrɪv.əl.əs/", turkish_meaning: "boş, lüzumsuz, ciddiyetsiz", context_sentence: "The elders dismissed the invention as frivolous." },
      { word: "horologist", phonetic: "/hɒˈrɒl.ə.dʒɪst/", turkish_meaning: "saat ustası, saat bilimci", context_sentence: "Felix was honored as the youngest master horologist." },
    ],
    comprehension_questions: [
      {
        question: "What material did Felix use to construct Ignis the dragon?",
        options: ["Carved pine wood and clay", "Discarded brass gears, copper springs, and rubies", "Plastic and steel wire", "Melted silver coins only"],
        correct_answer_index: 1,
        explanation: "Felix assembled discarded brass gears, coiled copper springs, and miniature rubies."
      },
      {
        question: "What emergency occurred during the midwinter blizzard?",
        options: ["The village bakery burned down", "Ice froze the central clock tower gears that controlled the trains", "The bridge collapsed into the snow", "Wolves entered the hollow"],
        correct_answer_index: 1,
        explanation: "Gale winds blew out the lamps and ice froze the monumental gears coordinating train timetables."
      },
      {
        question: "How did Ignis save the village clock tower?",
        options: ["By sounding a loud whistle", "By exhaling warm sparks that thawed the frozen gear wheels", "By pulling the clock hands manually", "By bringing oil from the attic"],
        correct_answer_index: 1,
        explanation: "Ignis crawled between the frozen iron gears and exhaled warm sparks that thawed the ice."
      },
    ],
  },
  {
    id: "kids-08",
    title: "The Lighthouse of Firefly Island",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 210,
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    topic: "Işık & Kurtarma",
    desc: "Deniz fenerinin dev lambası sönünce binlerce ateş böceğiyle cam kubbeyi aydınlatan ada çocukları.",
    content: "Perched upon a jagged granite bluff off the Cornish coastline, Beacon Rock guarded the treacherous reef where fishing cutters returned each twilight. Ten-year-old Toby and his sister Clara lived in the white keeper's cottage with their lighthouse keeper grandfather. One stormy autumn evening, a lightning bolt struck the copper lightning rod atop the lantern room, shattering the colossal Fresnel glass lens and extinguishing the main gas burner.\n\nThrough the gathering gale, Toby spotted three local sardine boats tossing dangerously close to the jagged reef, blinded by the impenetrable fog. With the backup oil reservoir compromised, traditional lighting was impossible. Clara suddenly remembered the tranquil marshland behind the cove, home to millions of luminous autumn fireflies.\n\nArmed with woven willow baskets, the siblings dashed into the reeds, singing the rhythmic island firefly lullaby. Attracted by their gentle voices, clouds of bioluminescent beetles swarmed into the baskets. Carrying the glowing insects up the three hundred spiral stone steps, Toby and Clara filled the giant lantern room dome with thousands of synchronized emerald flashes. Piercing the mist like a living emerald sun, the beacon guided every fisherman safely into the calm harbor.",
    target_words: ["treacherous", "shattering", "reservoir", "bioluminescent"],
    target_vocabulary: [
      { word: "treacherous", phonetic: "/ˈtretʃ.ər.əs/", turkish_meaning: "tehlikeli, aldatıcı", context_sentence: "The boats navigated around the treacherous reefs." },
      { word: "shattering", phonetic: "/ˈʃæt.ər.ɪŋ/", turkish_meaning: "tuzla buz eden, kırıcı", context_sentence: "Lightning struck the glass, shattering the lens." },
      { word: "reservoir", phonetic: "/ˈrez.ə.vwɑːr/", turkish_meaning: "depo, hazne", context_sentence: "The spare oil reservoir was compromised." },
      { word: "bioluminescent", phonetic: "/ˌbaɪ.əʊˌluː.mɪˈnes.ənt/", turkish_meaning: "biyoışıldayan, canlı ışık saçan", context_sentence: "Clouds of bioluminescent beetles lit the tower." },
    ],
    comprehension_questions: [
      {
        question: "What caused the lighthouse lamp to stop working?",
        options: ["They ran out of firewood", "A lightning bolt shattered the Fresnel lens and extinguished the burner", "The keeper fell asleep", "A seagull broke the door"],
        correct_answer_index: 1,
        explanation: "Lightning struck the lightning rod, shattering the glass lens and cutting out the burner."
      },
      {
        question: "What danger threatened the fishermen returning at sea?",
        options: ["A pirate ship", "Blindness in the fog near the treacherous reef", "A shark attack", "Running out of fuel"],
        correct_answer_index: 1,
        explanation: "The boats were tossing dangerously close to jagged reefs, blinded by thick fog without the light."
      },
      {
        question: "How did Toby and Clara illuminate the lantern room dome?",
        options: ["With electric flashlights", "By collecting thousands of glowing fireflies in willow baskets", "By burning old furniture", "With fireworks"],
        correct_answer_index: 1,
        explanation: "They filled the lantern dome with thousands of bioluminescent fireflies gathered from the marsh."
      },
    ],
  },
  {
    id: "kids-09",
    title: "Barnaby and the Lost Cloud",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 205,
    coverImage: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80",
    topic: "Gök Yüzü Dostluğu",
    desc: "Yeryüzüne düşen pamuk gibi bir yavru bulutu gökyüzüne geri zıplatmak için birleşen orman hayvanları.",
    content: "During a misty morning on the slopes of Bluebell Mountain, Barnaby the rabbit noticed something astonishing resting upon his clover patch. It looked like an enormous dollop of whipped cream, but it was cool, soft, and constantly shifting shape. It was Nimbus, a lost baby cumulus cloud that had drifted too low and snagged upon a prickly blackberry briar.\n\nNimbus whimpered with tiny mist droplets, desperate to rejoin its mother drifting across the high azure sky. Barnaby called for his woodland companions: Sparky the fox, Sammy the squirrel, and Oliver the owl. First, they tried blowing with all their breath, but Nimbus merely rolled across the grass like a cotton ball. Then, Sammy suggested a mechanical solution.\n\nGathering thousands of springy pine needles, dried birch bark, and elastic wild grapevines, the animals constructed a giant forest trampoline. Sparky, Barnaby, and Sammy climbed the tall branches of the grandmother spruce tree, holding Nimbus gently between their paws. With a collective countdown, they leaped onto the trampoline. The trampoline bent deeply and catapulted Nimbus high into the sky. Rejoicing, the little cloud formed a cheerful rainbow grin as it floated home.",
    target_words: ["cumulus", "briar", "elastic", "catapulted"],
    target_vocabulary: [
      { word: "cumulus", phonetic: "/ˈkjuː.mjʊ.ləs/", turkish_meaning: "kümülüs (beyaz kabarık bulut türü)", context_sentence: "Nimbus was a soft baby cumulus cloud." },
      { word: "briar", phonetic: "/ˈbraɪ.ər/", turkish_meaning: "dikenli çalı", context_sentence: "The cloud got tangled in a thorny briar." },
      { word: "elastic", phonetic: "/ɪˈlæs.tɪk/", turkish_meaning: "esnek, gerilebilir", context_sentence: "They tied the trampoline with elastic grapevines." },
      { word: "catapulted", phonetic: "/ˈkæt.ə.pʌl.tɪd/", turkish_meaning: "fırlattı, mancınık gibi attı", context_sentence: "The springy bed catapulted Nimbus into the sky." },
    ],
    comprehension_questions: [
      {
        question: "What did Barnaby find resting on his clover patch?",
        options: ["A sleeping polar bear", "A lost baby cumulus cloud named Nimbus", "A parachute", "A white sheep"],
        correct_answer_index: 1,
        explanation: "Barnaby found a soft, shape-shifting baby cumulus cloud named Nimbus."
      },
      {
        question: "What problem prevented Nimbus from floating back up?",
        options: ["It had become too heavy with rain", "It had snagged upon a prickly blackberry briar", "It lost its wings", "It fell asleep"],
        correct_answer_index: 1,
        explanation: "Nimbus had drifted too low and snagged its mist on a thorny blackberry briar."
      },
      {
        question: "How did the animals send Nimbus back to the azure sky?",
        options: ["They built a springy trampoline from vines and pine needles to launch it", "They tied balloons to it", "They used an airplane", "They climbed a mountain ladder"],
        correct_answer_index: 0,
        explanation: "They constructed a giant forest trampoline from flexible grapevines and catapulted the cloud."
      },
    ],
  },
  {
    id: "kids-10",
    title: "The Starlight Bakery",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 215,
    coverImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    topic: "Yıldız Tozu Pastanesi",
    desc: "Meşe ağacının kovuğunda ay ışığı mayası ve tarçınlı yıldız tozuyla hayvanlara tatlı rüyalar pişiren baykuş fırıncı.",
    content: "Deep within the silver birch groves of Whispering Wood, a warm cinnamon scent drifted every evening from the root hollow of the Great Oak. This was the Starlight Bakery, operated by Master Barnaby Owl, the forest's most imaginative baker. While town bakeries used common wheat and tap water, Master Barnaby kneaded dough using midnight dewdrops, sweet blackberry nectar, and a pinch of stardust caught in silk butterfly nets.\n\nHis specialty was 'Dream Buns'—delicate crescent rolls that glowed with a faint violet luminescence. When an anxious badger or restless hedgehog took a bite before sleep, their worries melted into peaceful visions of flowing rivers and gentle meadows. One Friday night, however, the North Wind blew fiercely, freezing the stardust gathering nets and threatening to leave the animals sleepless during winter solstice.\n\nYoung Pippin the bluebird flew down into the bakery cellar with a clever plan. She brought glowing amber resin from the southern pines and candied bee pollen. Combining these warmth-giving ingredients with Master Barnaby's stone oven embers, they invented 'Golden Dawn Muffins.' The rich pastries warmed the animals' hearts, spreading joyful tranquility throughout the frosty forest.",
    target_words: ["kneaded", "luminescence", "solstice", "tranquility"],
    target_vocabulary: [
      { word: "kneaded", phonetic: "/niː.dɪd/", turkish_meaning: "yoğurdu (hamur)", context_sentence: "Master Barnaby kneaded the sweet dough with care." },
      { word: "luminescence", phonetic: "/ˌluː.mɪˈnes.əns/", turkish_meaning: "soğuk ışıma, parıldama", context_sentence: "The dream buns radiated soft violet luminescence." },
      { word: "solstice", phonetic: "/ˈsɒl.stɪs/", turkish_meaning: "gündönümü", context_sentence: "Winter solstice brought freezing northern winds." },
      { word: "tranquility", phonetic: "/træŋˈkwɪl.ə.ti/", turkish_meaning: "huzur, sükunet", context_sentence: "The warm muffins spread tranquility through the woods." },
    ],
    comprehension_questions: [
      {
        question: "What unique ingredients did Master Barnaby use to bake Dream Buns?",
        options: ["Chocolate chips and sea salt", "Midnight dewdrops, blackberry nectar, and stardust", "Flour and tap water", "Corn syrup and chili peppers"],
        correct_answer_index: 1,
        explanation: "He kneaded dough using midnight dewdrops, blackberry nectar, and celestial stardust."
      },
      {
        question: "What effect did eating a Dream Bun have on forest animals?",
        options: ["It made them run fast", "Their worries dissolved into peaceful dreams", "It turned them invisible", "They started singing songs"],
        correct_answer_index: 1,
        explanation: "Eating the buns melted animals' anxieties and brought peaceful visions of meadows."
      },
      {
        question: "How did Pippin the bluebird solve the winter solstice shortage?",
        options: ["By buying sugar from the city", "By combining pine amber resin and bee pollen to make Golden Dawn Muffins", "By hibernating until spring", "By turning off the oven"],
        correct_answer_index: 1,
        explanation: "Pippin suggested using pine amber resin and candied pollen to bake Golden Dawn Muffins."
      },
    ],
  },

  // =========================================================================
  // C SEVİYESİ (Klasik Halk Masalları, ~320 kelime, 5-6 dk)
  // =========================================================================
  {
    id: "kids-11",
    title: "The Weaver of the Northern Winds",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 325,
    coverImage: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80",
    topic: "Kuzey Rüzgarları & Dokuma Masalı",
    desc: "Kuzey Kutbu'nda gökyüzü auroralarını ahşap tezgahında dokuyarak kış fırtınasını dindiren cesur kız Freya.",
    content: "Centuries ago, along the frozen tundra of the Scandinavian archipelago, the winters were dictated by Boreas, the merciless King of the Northern Gale. His frigid breath froze reindeer rivers into solid quartz and buried timber homesteads under relentless glacial avalanches. In a turf-roofed cabin beneath the shadow of the glaciers lived Freya, a humble twelve-year-old girl renowned for her uncanny mastery of the ancient pedal loom.\n\nFreya noticed that the luminous ribbons of the Aurora Borealis were not merely random celestial lights, but the frayed threads of the sky's celestial mantle. Gathering strands of coarse silver wool sheared from wild mountain hares and dyeing them in lichen oils, she sat before her spruce loom and began weaving an enchanted tapestry that mirrored the cosmic magnetic currents of the polar sky.\n\nWhen Boreas descended in a fury of howling blizzards to strip the last pine grove, Freya walked unflinchingly onto the frozen fjord and cast her magnificent woven shawl across the roaring squall. The intricate weave captured the biting vortex, transforming bitter frost into crystalline warmth and calming the ferocious gale into a gentle mountain breeze. Stunned by the mortal girl's artistic audacity and boundless compassion, Boreas bowed his frosty crown. He pledged that henceforth, whenever the emerald northern lights illuminated the zenith, his blizzards would yield to peaceful starry nights, preserving the hearth fires of humanity.",
    target_words: ["archipelago", "mantle", "unflinchingly", "zenith"],
    target_vocabulary: [
      { word: "archipelago", phonetic: "/ˌɑː.kɪˈpel.ə.ɡəʊ/", turkish_meaning: "takımadalar", context_sentence: "Her village lay in the remote Scandinavian archipelago." },
      { word: "mantle", phonetic: "/ˈmæn.təl/", turkish_meaning: "örtü, pelerin", context_sentence: "The auroras formed the glowing mantle of the sky." },
      { word: "unflinchingly", phonetic: "/ʌnˈflɪn.tʃɪŋ.li/", turkish_meaning: "gözünü kırpmadan, cesurca", context_sentence: "Freya walked unflinchingly toward the howling storm." },
      { word: "zenith", phonetic: "/ˈzen.ɪθ/", turkish_meaning: "göğün en tepe noktası, zirve", context_sentence: "Emerald ribbons flashed across the polar zenith." },
    ],
    comprehension_questions: [
      {
        question: "What natural phenomenon did Freya interpret as threads of a cosmic mantle?",
        options: ["Falling snowflakes", "The Aurora Borealis (Northern Lights)", "Ocean tides", "Lightning storms"],
        correct_answer_index: 1,
        explanation: "Freya realized that the luminous ribbons of the Aurora Borealis were threads of the sky's mantle."
      },
      {
        question: "How did Freya soothe the destructive fury of Boreas?",
        options: ["By offering him a chest of gold", "By casting an enchanted tapestry that transformed the gale into warmth", "By building a stone fortress", "By fleeing south"],
        correct_answer_index: 1,
        explanation: "She cast her woven shawl across the squall, converting bitter frost into crystalline warmth."
      },
      {
        question: "What solemn pledge did Boreas make after beholding Freya's tapestry?",
        options: ["He would never return to Scandinavia", "He would turn all rivers to gold", "His blizzards would yield whenever the northern lights shone", "He would destroy the spruce loom"],
        correct_answer_index: 2,
        explanation: "Boreas pledged that blizzards would yield to calm whenever auroras illuminated the zenith."
      },
    ],
  },
  {
    id: "kids-12",
    title: "The Clockwork Nightingale of the Jade Forest",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 320,
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    topic: "Bülbülün Şarkısı & Doğallık",
    desc: "Mücevherli mekanik bir oyuncağa aldanıp gerçek bülbülü unutan imparatorun bilgelik ve şifa dolu uyanışı.",
    content: "In the imperial porcelain palace of ancient Cathay, the Emperor was captivated by the exquisite song of a modest gray nightingale dwelling in the coastal bamboo groves. Her fluid cadences possessed such evocative purity that even the weary court ministers wept with wonder. However, on the Emperor's fiftieth birthday, an emissary from the distant Occident presented a mechanical artificial nightingale crafted from solid gold, lacquered ivory, and encrusted with Burmese sapphires.\n\nWound by a jewel-studded key, the mechanical marvel could repeat thirty-three waltzes with mechanical perfection, gleaming magnificently beneath crystal chandeliers. Enthralled by predictable splendor, the imperial court relegated the living gray songbird to obscurity, and she quietly departed back into the misty jade mountains. Years elapsed, until the delicate ruby escapement wheels inside the mechanical bird snapped under persistent friction, silencing its artificial melody forever.\n\nSoon afterward, the aging Emperor fell grievously ill with a melancholic fever that court physicians could not dispel. As Death sat upon the imperial silken bedclothes, a sudden crystalline trill echoed through the open lattice balcony. The true nightingale had returned. Perched upon a jasmine branch, she poured forth an unvarnished anthem of forgiveness, morning dew, and forest serenity. Her poignant song banished the shadowy specters from the chamber and revitalized the Emperor's failing pulse, proving that mechanical ostentation can never substitute for the authentic soul of nature.",
    target_words: ["cadences", "emissary", "relegated", "ostentation"],
    target_vocabulary: [
      { word: "cadences", phonetic: "/ˈkeɪ.dəns.ɪz/", turkish_meaning: "melodik ahenk, ses iniş çıkışları", context_sentence: "Her vocal cadences brought tears to the ministers." },
      { word: "emissary", phonetic: "/ˈem.ɪ.sər.i/", turkish_meaning: "özel elçi", context_sentence: "An emissary presented the jeweled mechanical bird." },
      { word: "relegated", phonetic: "/ˈrel.ɪ.ɡeɪ.tɪd/", turkish_meaning: "ikinci plana attı, sürgün etti", context_sentence: "The court relegated the living bird to obscurity." },
      { word: "ostentation", phonetic: "/ˌɒs.tenˈteɪ.ʃən/", turkish_meaning: "gösteriş, şatafat", context_sentence: "Mechanical ostentation could not match true nature." },
    ],
    comprehension_questions: [
      {
        question: "Why was the Emperor initially captivated by the living nightingale?",
        options: ["Because of her sparkling gold feathers", "Because of the profound emotional purity and melody of her song", "Because she could speak Chinese", "Because she did acrobatics"],
        correct_answer_index: 1,
        explanation: "Her fluid cadences possessed an evocative purity that moved listeners to tears."
      },
      {
        question: "What caused the mechanical nightingale to fall silent?",
        options: ["It fell into a water well", "Its delicate ruby escapement wheels snapped from friction", "A servant dropped it", "The gold melted"],
        correct_answer_index: 1,
        explanation: "The mechanical escapement gears broke under persistent friction over the years."
      },
      {
        question: "How did the authentic wild nightingale heal the dying Emperor?",
        options: ["She brought rare herbs from the mountains", "Her heartfelt song of forgiveness and nature revitalized his spirit", "She flew to get a European doctor", "She built a nest on his bed"],
        correct_answer_index: 1,
        explanation: "Her poignant song of nature and forgiveness chased away illness and revitalized his heart."
      },
    ],
  },
  {
    id: "kids-13",
    title: "The Selkie's Silver Sealcoat",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 330,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    topic: "Kelt Efsanesi & Selkie Fedakarlığı",
    desc: "İskoçya kıyılarında deniz kabilesiyle fırtınaya yakalanan balıkçıları kurtaran mühür kızı Mairead'in efsanesi.",
    content: "Upon the windswept crags of the Scottish Hebrides, ancient folklore recounts the benevolent maritime clan known as Selkies—mystical creatures who swim as sleek harbor seals through Atlantic swells but shed their lustrous pelts to dance in human form under the equinox moon. In a weather-beaten stone croft above the crashing surf lived Cormac, a solitary fisherman whose humble heart was committed to protecting coastal marine life from foreign trawlers.\n\nOne midsummer evening, Cormac discovered a luminous silver seal skin folded neatly upon a basalt sea cave ledge. Beside the foaming tide stood Mairead, a selkie maiden whose silver eyes mirrored the depths of the ocean abyss. Instead of stealing her pelt to force her into terrestrial marriage as wicked chieftains had done in folklore, Cormac reverently handed the pelt back to her, honoring her aquatic autonomy. Deeply moved by the mortal's integrity, Mairead promised an eternal bond of protection over his coastal village.\n\nTwo winters later, the monstrous tempest known as St. Jude's Gale battered the Hebridean coast, trapping seven fishing cobles amidst the jagged churning reefs of the Black Skerries. Understanding that human oars were powerless against the forty-foot Atlantic surges, Mairead embraced Cormac in farewell, slipped into her silver sealcoat, and plunged into the tumultuous abyss. Leading an allied pod of gray seals through blinding brine, she navigated the imperiled boats through the razor-sharp rocks to safety. Though she returned forever to the oceanic deep, fishermen say a gentle silver seal still surfaces beside Cormac's boat on starlit dawns.",
    target_words: ["equinox", "autonomy", "tempest", "tumultuous"],
    target_vocabulary: [
      { word: "equinox", phonetic: "/ˈek.wɪ.nɒks/", turkish_meaning: "ekinoks (gece-gündüz eşitliği)", context_sentence: "Selkies danced under the equinox moon." },
      { word: "autonomy", phonetic: "/ɔːˈtɒn.ə.mi/", turkish_meaning: "özgürlük, özerklik, bağımsız irade", context_sentence: "He respected her aquatic autonomy and freedom." },
      { word: "tempest", phonetic: "/ˈtem.pɪst/", turkish_meaning: "şiddetli fırtına", context_sentence: "A ferocious tempest trapped the fishing boats." },
      { word: "tumultuous", phonetic: "/tʃuːˈmʌl.tʃu.əs/", turkish_meaning: "çalkantılı, kargaşalı", context_sentence: "She dived into the tumultuous waves to save them." },
    ],
    comprehension_questions: [
      {
        question: "How did Cormac behave when he discovered Mairead's silver seal pelt?",
        options: ["He hid it under his mattress to trap her", "He returned it reverently to respect her autonomy", "He sold it to a merchant", "He threw it into the fireplace"],
        correct_answer_index: 1,
        explanation: "Cormac reverently handed the pelt back, honoring her freedom instead of stealing it."
      },
      {
        question: "What catastrophic event endangered the fishing village two years later?",
        options: ["A volcanic eruption", "A devastating hurricane (St. Jude's Gale) that trapped boats in reefs", "A severe drought", "An invasion of pirates"],
        correct_answer_index: 1,
        explanation: "A monstrous tempest trapped seven fishing cobles amidst the razor-sharp reefs."
      },
      {
        question: "How did Mairead guide the fishermen to safety?",
        options: ["By setting a bonfire on the cliff", "By putting on her sealcoat and leading them through the reefs with a pod of seals", "By building a wooden raft", "By whistling from the shore"],
        correct_answer_index: 1,
        explanation: "She put on her sealcoat, dived into the waves, and guided the trapped boats through the skerry rocks."
      },
    ],
  },
  {
    id: "kids-14",
    title: "The Garden of the Midnight Rainbow",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 325,
    coverImage: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
    topic: "Gece Gökkuşağı & Botanik Mucizesi",
    desc: "Köyü kuraklıktan kurtarmak için sadece ay ışığında açan ve gökyüzüne gece gökkuşağı çizen nadir orkidelerin sırrı.",
    content: "Nestled in an extinct volcanic caldera high above the mist-covered Andean plateaus, the mountain pueblo of San Lorenzo faced a ruinous summer drought. Mountain glaciers that historically replenished the terraced maize fields had receded prematurely, leaving irrigation canals parched and livestock languishing. Ten-year-old Paloma, the granddaughter of the village herbalist, remembered an ancient Quechua parchment describing the 'Arcoíris Nocturno'—a midnight rainbow said to precipitate revivifying moisture from dry air.\n\nAccording to the codex, this atmospheric miracle could only be triggered by the blooming of the Lunar Cattleya, an exceedingly elusive epiphyte that blossomed once every half-century upon the sheer basalt needles of Mount Illimani. Packing roasted maize, a woolen vicuña poncho, and her grandfather's brass magnifying loupe, Paloma embarked upon the perilous alpine ascent beneath a canopy of southern constellations.\n\nReaching the windswept summit at midnight on the lunar full phase, she discovered three dormant white buds clinging to the vertical granite cliff. As silver moonlight struck the crystalline dewdrops nestled inside the opening petals, the blossoms refracted the lunar luminescence through microscopic prism-like silica cells on their stems. Suddenly, an ethereal arch of iridescent indigo, silver, and violet light vaulted across the darkened valley. The celestial phenomenon ionized the high-altitude atmosphere, condensing moisture into sweet, abundant rainfall that filled the pueblo's reservoir and revived the sun-baked terraces.",
    target_words: ["caldera", "epiphyte", "refracted", "iridescent"],
    target_vocabulary: [
      { word: "caldera", phonetic: "/kælˈdeə.rə/", turkish_meaning: "kaldera, volkanik krater çöküntüsü", context_sentence: "The village sat inside an extinct volcanic caldera." },
      { word: "epiphyte", phonetic: "/ˈep.ɪ.faɪt/", turkish_meaning: "epifit (ağaç veya kaya üzerinde yaşayan bitki)", context_sentence: "The Lunar Cattleya was a rare mountain epiphyte." },
      { word: "refracted", phonetic: "/rɪˈfræk.tɪd/", turkish_meaning: "kırdı (ışığı prizma gibi)", context_sentence: "Petals refracted moonlight into radiant colors." },
      { word: "iridescent", phonetic: "/ˌɪr.ɪˈdes.ənt/", turkish_meaning: "yanardöner, gökkuşağı renkli", context_sentence: "An iridescent rainbow illuminated the night sky." },
    ],
    comprehension_questions: [
      {
        question: "What environmental crisis threatened the mountain village of San Lorenzo?",
        options: ["An avalanche of boulders", "A severe drought that dried the irrigation canals", "A massive flood", "A forest fire"],
        correct_answer_index: 1,
        explanation: "Mountain glaciers had receded, leaving irrigation canals parched and crops thirsty."
      },
      {
        question: "Where did the rare Lunar Cattleya flower grow?",
        options: ["In the village plaza fountain", "Upon the vertical granite cliffs of Mount Illimani", "Underground in a coal mine", "Inside a wooden greenhouse"],
        correct_answer_index: 1,
        explanation: "The epiphyte grew on the sheer basalt needles of Mount Illimani."
      },
      {
        question: "How did the blooming flowers cause rainfall in the valley?",
        options: ["By attracting giant thunderclouds", "By refracting moonlight into an iridescent rainbow that condensed air moisture", "By shooting seeds into the sky", "By melting ice with heat"],
        correct_answer_index: 1,
        explanation: "The flowers refracted lunar light, creating a midnight rainbow that ionized the air and catalyzed rain."
      },
    ],
  },
  {
    id: "kids-15",
    title: "The Firebird's Golden Feather",
    category: "kids",
    categoryName: "Kids & Masallar",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 330,
    coverImage: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    topic: "Ateş Kuşu & Alçakgönüllülük",
    desc: "Slav halk masalında parıldayan ateş kuşunun tüyünü bularak kibir yerine bilgeliği seçen genç İvan'ın sınavı.",
    content: "Deep within the primeval birch taiga of old Muscovy, folklore tells of the fabled Zhar-Ptitsa—the Firebird—whose plumage radiated a blinding incandescent brilliance that eclipsed the noon sun, with eyes resembling faceted garnets and tailfeathers that glowed like molten embers. While patrolling the royal apple orchard where golden apples mysteriously vanished each autumn, Prince Ivan, the youngest and most modest of the Tsar's three heirs, observed a dazzling flash of vermilion light streak across the canopy.\n\nCreeping beneath the fruiting branches, Ivan lunged and grasped a tailfeather as the magnificent celestial avian soared into the twilight heavens. Though the bird escaped, she left behind a single luminous feather that illuminated the dark orchard as brightly as a thousand beeswax tapers. Ivan's elder brothers immediately urged him to present the feather to their covetous father, warning that keeping such power secret would invite royal wrath. However, an elderly woodland hermit counseled Ivan that the feather's magic was a test of temperance rather than an instrument of sovereign greed.\n\nWhen the tyrant Tsar demanded that Ivan capture the living Firebird upon pain of exile, Ivan refused to trap the free creature. Instead, he carried the radiant feather back to the enchanted silver birch grove where the Firebird nested, placing it reverently upon an altar of wild cranberries. Moved by the prince's humility and refusal to hoard beauty for selfish dominion, the Firebird bestowed upon him an apple of everlasting harmony and healed the Tsar's bitter heart, proving that true nobility lies in liberating wonders rather than possessing them.",
    target_words: ["incandescent", "vermilion", "covetous", "temperance"],
    target_vocabulary: [
      { word: "incandescent", phonetic: "/ˌɪn.kænˈdes.ənt/", turkish_meaning: "akkor halinde, akkor parlaklıkta", context_sentence: "Her plumage radiated an incandescent brilliance." },
      { word: "vermilion", phonetic: "/vəˈmɪl.jən/", turkish_meaning: "parlak kızıl, alev kırmızısı", context_sentence: "A streak of vermilion light flashed across the canopy." },
      { word: "covetous", phonetic: "/ˈkʌv.ɪ.təs/", turkish_meaning: "açgözlü, başkasına ait olana tamah eden", context_sentence: "His brothers urged him to satisfy the covetous Tsar." },
      { word: "temperance", phonetic: "/ˈtem.pər.əns/", turkish_meaning: "ölçülülük, itidal, nefse hakimiyet", context_sentence: "The hermit noted that true magic tested human temperance." },
    ],
    comprehension_questions: [
      {
        question: "What mysterious creature did Prince Ivan encounter in the royal orchard?",
        options: ["A silver wolf", "The incandescent Firebird (Zhar-Ptitsa)", "A golden dragon", "An invisible gnome"],
        correct_answer_index: 1,
        explanation: "Ivan spotted the fabled Firebird whose feathers glowed like molten embers."
      },
      {
        question: "How bright was the single feather left behind by the Firebird?",
        options: ["Faint like a tiny glowworm", "As bright as a thousand beeswax tapers", "It had no light at all", "It only glowed under water"],
        correct_answer_index: 1,
        explanation: "The single feather illuminated the entire orchard as brightly as a thousand beeswax tapers."
      },
      {
        question: "What moral choice did Prince Ivan make regarding the Firebird?",
        options: ["He trapped her in an iron cage for the Tsar", "He returned the feather reverently instead of enslaving the bird", "He sold the feather for gold", "He destroyed the orchard"],
        correct_answer_index: 1,
        explanation: "Ivan refused to trap the bird and returned the feather, choosing humility over covetous dominion."
      },
    ],
  },
];

export const KIDS_STORIES = kidsStories;
