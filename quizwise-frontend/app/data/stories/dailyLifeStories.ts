import { Story } from "./types";

export const dailyLifeStories: Story[] = [
  // =========================================================================
  // A SEVİYESİ (A1-A2, ~120-150 kelime, 2-3 dk)
  // 1) Kafe siparişi
  // 2) Market alışverişi
  // 3) Yeni komşu ile tanışma
  // 4) Tren yolculuğu
  // 5) Kütüphanede ders çalışma
  // =========================================================================
  {
    id: "daily-01",
    title: "Ordering at the Morning Coffee Shop",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    topic: "Kafe Siparişi",
    desc: "Sabah kahvesini sipariş ederken baristayla pratik İngilizce diyalog kuran David'in keyifli rutini.",
    content: "At eight in the morning, David walked into the cozy corner cafe near his office. The air smelled of freshly ground coffee and warm butter croissants. 'Good morning! What can I get for you today?' the barista asked with a warm smile.\n\n'Good morning,' David replied politely. 'Could I please have a medium latte with oat milk, and one blueberry pastry to go?'\n\n'Certainly,' said the barista, tapping the register screen. 'Would you like that sweetened with vanilla syrup?'\n\n'No, thank you, regular is perfect,' David smiled. He tapped his contactless card on the payment machine. The barista handed him his paper receipt and a stamped loyalty card. Minutes later, David received a steaming cup with a beautiful heart design on the milk foam, ready to start his workday with energy.",
    target_words: ["barista", "pastry", "takeaway", "receipt"],
    target_vocabulary: [
      { word: "barista", phonetic: "/bəˈriː.stə/", turkish_meaning: "kahve hazırlayan uzman", context_sentence: "The friendly barista prepared his morning latte." },
      { word: "pastry", phonetic: "/ˈpeɪ.stri/", turkish_meaning: "hamur tatlısı, çörek", context_sentence: "He ordered a fresh blueberry pastry." },
      { word: "takeaway", phonetic: "/ˈteɪk.ə.weɪ/", turkish_meaning: "paket, al-götür", context_sentence: "He ordered his hot coffee to take away." },
      { word: "receipt", phonetic: "/rɪˈsiːt/", turkish_meaning: "ödeme fişi, makbuz", context_sentence: "The machine printed a digital paper receipt." },
    ],
    comprehension_questions: [
      {
        question: "What milk option did David choose for his latte?",
        options: ["Whole milk", "Oat milk", "Almond milk", "Soy milk"],
        correct_answer_index: 1,
        explanation: "David explicitly asked for a medium latte with oat milk."
      },
      {
        question: "What bakery item did David order with his coffee?",
        options: ["A chocolate muffin", "A blueberry pastry", "An apple pie", "A cinnamon donut"],
        correct_answer_index: 1,
        explanation: "He ordered one blueberry pastry to go."
      },
      {
        question: "How did David pay for his morning order?",
        options: ["With cash coins", "With a contactless payment card", "With a paper check", "He received it for free"],
        correct_answer_index: 1,
        explanation: "The text mentions he tapped his contactless card on the payment machine."
      },
    ],
  },
  {
    id: "daily-02",
    title: "Grocery Shopping at the Supermarket",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    topic: "Süpermarket Alışverişi",
    desc: "Akşam yemeği malzemelerini sepete ekleyip kasada ödeme yapan Elena'nın organize market turu.",
    content: "After finishing her work at five o'clock, Elena stopped at the neighborhood supermarket with a handwritten shopping list. She took a green shopping basket from the entrance and walked straight to the fresh produce aisle. She selected four ripe red tomatoes, a crisp head of lettuce, and two yellow bell peppers for a salad.\n\nNext, she visited the bakery section to pick up a warm loaf of whole-grain bread. Elena carefully checked the expiration date on a carton of fresh eggs and placed it gently in her basket. At the checkout counter, the friendly cashier scanned each grocery item efficiently. 'Do you need a reusable shopping bag today?' the cashier asked. 'I brought my own canvas tote, thank you,' Elena replied, packing her healthy groceries neatly before heading home.",
    target_words: ["aisle", "cashier", "grocery", "expiration"],
    target_vocabulary: [
      { word: "aisle", phonetic: "/aɪl/", turkish_meaning: "market reyonu, koridor", context_sentence: "She walked down the fresh produce aisle." },
      { word: "cashier", phonetic: "/kæʃˈɪər/", turkish_meaning: "kasiyer", context_sentence: "The cashier scanned all the items quickly." },
      { word: "grocery", phonetic: "/ˈɡrəʊ.sər.i/", turkish_meaning: "bakkaliye, market alışverişi", context_sentence: "She packed her weekly grocery items in a bag." },
      { word: "expiration", phonetic: "/ˌek.spɪˈreɪ.ʃən/", turkish_meaning: "son kullanma tarihi", context_sentence: "She checked the expiration date on the dairy carton." },
    ],
    comprehension_questions: [
      {
        question: "What vegetables did Elena select for her dinner salad?",
        options: ["Cucumbers and onions", "Tomatoes, lettuce, and bell peppers", "Carrots and potatoes", "Broccoli and mushrooms"],
        correct_answer_index: 1,
        explanation: "She selected four ripe red tomatoes, lettuce, and two yellow bell peppers."
      },
      {
        question: "What did Elena check on the carton of eggs?",
        options: ["The price tag", "The expiration date", "The farm name", "The barcode"],
        correct_answer_index: 1,
        explanation: "The text states she carefully checked the expiration date on the eggs."
      },
      {
        question: "What did Elena use to pack her groceries at the checkout?",
        options: ["Plastic disposable bags", "Her own canvas tote bag", "A cardboard box", "A paper bag from the cashier"],
        correct_answer_index: 1,
        explanation: "Elena said she brought her own canvas tote bag from home."
      },
    ],
  },
  {
    id: "daily-03",
    title: "Welcoming the New Neighbor",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=800&q=80",
    topic: "Yeni Komşu ile Tanışma",
    desc: "Karşı daireye yeni taşınan komşusuna sıcak kurabiyelerle hoş geldin diyen Clara'nın samimi selamı.",
    content: "On Saturday afternoon, Clara heard cardboard boxes being stacked in the apartment corridor across the hall. Peeking out, she noticed a young woman carrying houseplants and framed artwork into Apartment 3B. Clara decided to offer a friendly neighborhood welcome.\n\nShe baked a quick batch of warm chocolate-chip cookies and arranged them on a decorative ceramic plate. Clara walked across the hall and tapped softly on the wooden door. The door opened, and the new resident greeted her with a polite smile. 'Hello! I am Clara from across the hall. Welcome to our building!'\n\n'Thank you so much! My name is Maya, and I just moved here from Bristol for a new graphic design job,' Maya said gratefully. They exchanged phone numbers and chatted about the best local bakeries, establishing an immediate and heartwarming neighborly connection.",
    target_words: ["corridor", "welcoming", "introduced", "neighborly"],
    target_vocabulary: [
      { word: "corridor", phonetic: "/ˈkɒr.ɪ.dɔːr/", turkish_meaning: "koridor, bina holü", context_sentence: "Boxes were stacked in the quiet apartment corridor." },
      { word: "welcoming", phonetic: "/ˈwel.kəm.ɪŋ/", turkish_meaning: "sıcak karşılayan, samimi", context_sentence: "Clara offered a warm welcoming smile." },
      { word: "introduced", phonetic: "/ˌɪn.trəˈdjuːst/", turkish_meaning: "tanıştırdı, kendini tanıttı", context_sentence: "She introduced herself as the resident of 3A." },
      { word: "neighborly", phonetic: "/ˈneɪ.bə.li/", turkish_meaning: "komşuca, dostane", context_sentence: "Sharing food was a kind neighborly gesture." },
    ],
    comprehension_questions: [
      {
        question: "What treat did Clara bring to welcome her new neighbor?",
        options: ["A fruit basket", "Warm chocolate-chip cookies on a plate", "A bottle of juice", "A homemade pie"],
        correct_answer_index: 1,
        explanation: "Clara baked a quick batch of warm chocolate-chip cookies on a ceramic plate."
      },
      {
        question: "Where did Maya move from and why?",
        options: ["From London for university", "From Bristol for a graphic design job", "From Manchester to retire", "From Oxford to open a shop"],
        correct_answer_index: 1,
        explanation: "Maya mentioned she just moved from Bristol for a new graphic design job."
      },
      {
        question: "What local information did the neighbors talk about?",
        options: ["Bus schedules", "The best local bakeries in the area", "Weather forecasts", "Rent prices"],
        correct_answer_index: 1,
        explanation: "They exchanged phone numbers and discussed the best local bakeries."
      },
    ],
  },
  {
    id: "daily-04",
    title: "The Commuter Train to the City",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 140,
    coverImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    topic: "Tren Yolculuğu & İşe Gidiş",
    desc: "Sabah peronda bekleyip cam kenarında gazetesini okuyan Marcus'un huzurlu banliyö yolculuğu.",
    content: "Marcus arrived at the suburban train station at seven-fifteen on a brisk Tuesday morning. The electronic departure board displayed the 7:22 express train to Central Station on Platform 2. Marcus scanned his digital QR transit pass at the automatic gates and walked down the covered stairway.\n\nWhen the silver commuter train pulled up, the automatic doors hissed open. Marcus stepped aboard and discovered an open seat next to the window. As the electric train accelerated quietly, green suburban gardens gave way to glistening rivers and autumn woodland. The uniformed conductor walked down the center aisle, cheerfully checking passenger tickets. Marcus opened his newspaper to read the morning headlines, enjoying the calm twenty-minute journey that prepared him mentally for a busy day at the architectural firm.",
    target_words: ["departure", "conductor", "commuter", "accelerated"],
    target_vocabulary: [
      { word: "departure", phonetic: "/dɪˈpɑː.tʃər/", turkish_meaning: "kalkış, hareket (tren/uçak)", context_sentence: "The departure screen showed the 7:22 train." },
      { word: "conductor", phonetic: "/kənˈdʌk.tər/", turkish_meaning: "kondüktör, bilet kontrolörü", context_sentence: "The friendly conductor checked tickets in the aisle." },
      { word: "commuter", phonetic: "/kəˈmjuː.tər/", turkish_meaning: "her gün işe gidip gelen yolcu", context_sentence: "Commuters filled the morning silver train." },
      { word: "accelerated", phonetic: "/əkˈsel.ə.reɪ.tɪd/", turkish_meaning: "hızlandı", context_sentence: "The train accelerated smoothly along the tracks." },
    ],
    comprehension_questions: [
      {
        question: "Which platform did Marcus's train depart from?",
        options: ["Platform 1", "Platform 2", "Platform 4", "Platform 5"],
        correct_answer_index: 1,
        explanation: "The electronic departure board showed Platform 2."
      },
      {
        question: "Who walked down the aisle to verify passenger tickets?",
        options: ["The train driver", "The uniformed conductor", "A station security guard", "A ticket vendor"],
        correct_answer_index: 1,
        explanation: "The text notes that the uniformed conductor walked down the aisle."
      },
      {
        question: "How long was the train ride to Central Station?",
        options: ["Five minutes", "Twenty minutes", "One hour", "Forty-five minutes"],
        correct_answer_index: 1,
        explanation: "Marcus enjoyed the calm twenty-minute journey to the city."
      },
    ],
  },
  {
    id: "daily-05",
    title: "Studying at the Central Library",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "A",
    cefr: "A1-A2",
    readTime: "2-3 dk",
    wordCount: 135,
    coverImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    topic: "Kütüphanede Çalışma",
    desc: "Sessiz çalışma masasında dizüstü bilgisayarıyla sınavlarına hazırlanan Liam'ın verimli kütüphane günü.",
    content: "On Thursday afternoon, university student Liam needed a quiet place to prepare for his final biology exam. He walked up the stone steps of the Grand Central Library, pushing open the heavy glass doors. The quiet study hall was serene, filled with long oak tables, green desk lamps, and high arched windows.\n\nLiam chose an empty desk near the natural history section. He plugged in his laptop, put on noise-cancelling headphones, and opened his digital anatomy flashcards. When he needed a reference manual, the helpful librarian guided him to the third-floor reserve shelves. By studying in a peaceful environment free from smartphone distractions and dormitory noise, Liam reviewed four entire chapters in just two productive hours, leaving the library feeling confident and accomplished.",
    target_words: ["serene", "librarian", "reference", "productive"],
    target_vocabulary: [
      { word: "serene", phonetic: "/səˈriːn/", turkish_meaning: "huzurlu, sakin", context_sentence: "The library study hall was serene and quiet." },
      { word: "librarian", phonetic: "/laɪˈbreə.ri.ən/", turkish_meaning: "kütüphaneci", context_sentence: "The librarian helped him locate the reference book." },
      { word: "reference", phonetic: "/ˈref.ər.əns/", turkish_meaning: "kaynak, başvuru eseri", context_sentence: "He consulted an anatomy reference manual." },
      { word: "productive", phonetic: "/prəˈdʌk.tɪv/", turkish_meaning: "verimli, üretken", context_sentence: "Liam spent two highly productive hours studying." },
    ],
    comprehension_questions: [
      {
        question: "What subject was Liam studying for at the library?",
        options: ["History", "Biology / Anatomy", "Mathematics", "Law"],
        correct_answer_index: 1,
        explanation: "Liam went to the library to prepare for his final biology exam."
      },
      {
        question: "Where did Liam find the reference manual he needed?",
        options: ["In the basement cafeteria", "On the third-floor reserve shelves with the librarian's help", "In the computer lab", "On an outdoor bench"],
        correct_answer_index: 1,
        explanation: "The librarian guided him to the third-floor reserve shelves."
      },
      {
        question: "How did Liam feel after studying for two hours?",
        options: ["Exhausted and confused", "Confident and accomplished", "Bored and sleepy", "Annoyed by noise"],
        correct_answer_index: 1,
        explanation: "Liam left the library feeling confident and accomplished."
      },
    ],
  },

  // =========================================================================
  // B SEVİYESİ (B1-B2, ~230-260 kelime, 4-5 dk)
  // 6) Havalimanında aktarma (Flight layover/transfer)
  // 7) Ev kiralama süreci (Apartment hunting/leasing)
  // 8) Kayıp eşya bürosu (Lost and found office)
  // 9) İş görüşmesi hazırlığı (Job interview preparation)
  // 10) Şehir festivali (City street festival)
  // =========================================================================
  {
    id: "daily-06",
    title: "Navigating a Tight Airport Layover",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 245,
    coverImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    topic: "Havalimanında Aktarma",
    desc: "Frankfurt Havalimanı'nda kısa süreli aktarma sırasında terminal kapısına yetişen Julian'ın stratejik yarışı.",
    content: "When Julian's feeder flight from Edinburgh touched down in Frankfurt twenty minutes behind schedule, he had barely forty-five minutes to catch his connecting transatlantic flight to Chicago. Disembarking into the sprawling concourse of Terminal 1, he immediately checked the electronic departures display and realized his departure gate, Z52, was situated across an entirely different terminal pier.\n\nTightening the straps of his carry-on backpack, Julian followed the overhead bright yellow transfer signage toward the automated Skyline transit train. He navigated the automated passport control e-gates swiftly by scanning his biometric passport, answering the border officer's concise inquiry with professional composure. As the monorail shuttled passengers between concourses, Julian verified his boarding pass on his smartphone wallet.\n\nArriving at Pier Z with fifteen minutes before gate closure, Julian faced a secondary security screening checkpoint. Remaining remarkably calm, he removed his laptop and liquids in advance, sliding his bins through the X-ray scanner without triggering alarms. Hustling down the wide terminal corridor, he reached Gate Z52 just as the final boarding call echoed over the intercom. The gate agent smiled, scanned his boarding pass with a reassuring beep, and welcomed him aboard, concluding a pulse-pounding airport transfer with textbook efficiency.",
    target_words: ["layover", "concourse", "biometric", "efficiency"],
    target_vocabulary: [
      { word: "layover", phonetic: "/ˈleɪˌəʊ.vər/", turkish_meaning: "aktarma, uçuşlar arası bekleme", context_sentence: "He had a tight forty-five-minute layover in Frankfurt." },
      { word: "concourse", phonetic: "/ˈkɒŋ.kɔːs/", turkish_meaning: "terminal ana holü / peronu", context_sentence: "He navigated the crowded airport concourse." },
      { word: "biometric", phonetic: "/ˌbaɪ.əʊˈmet.rɪk/", turkish_meaning: "biyometrik (pasaport/tarama)", context_sentence: "He scanned his biometric passport at the e-gate." },
      { word: "efficiency", phonetic: "/ɪˈfɪʃ.ən.si/", turkish_meaning: "verimlilik, dakiklik", context_sentence: "He cleared security with textbook efficiency." },
    ],
    comprehension_questions: [
      {
        question: "Why was Julian in a hurry during his Frankfurt layover?",
        options: ["He lost his wallet", "His inbound flight arrived late, leaving only 45 minutes for the connection", "He forgot his passport on the plane", "The airport was closing"],
        correct_answer_index: 1,
        explanation: "His initial flight was 20 minutes late, leaving him only 45 minutes to transfer."
      },
      {
        question: "How did Julian travel between airport concourses?",
        options: ["By taking an airport taxi", "Via the automated Skyline transit monorail", "By walking outside on the tarmac", "On an electric golf cart"],
        correct_answer_index: 1,
        explanation: "Julian boarded the automated Skyline transit train between terminal concourses."
      },
      {
        question: "What helped Julian pass through secondary security rapidly?",
        options: ["He skipped the queue", "He pre-emptively removed his laptop and liquids before screening", "He had no bags at all", "A flight captain escorted him"],
        correct_answer_index: 1,
        explanation: "Julian prepared his items in advance, sliding his bins through without triggering alarms."
      },
    ],
  },
  {
    id: "daily-07",
    title: "Apartment Hunting in the City",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    topic: "Ev Kiralama Süreci",
    desc: "Emlakçıyla birlikte daire gezen ve kira sözleşmesi şartlarını inceleyen Maya'nın yeni ev kararı.",
    content: "Finding an affordable yet well-maintained rental apartment in downtown Manchester was proving to be a formidable endeavor for Maya. After weeks of browsing digital property listings and encountering exorbitant deposits, she finally secured a viewing for a top-floor one-bedroom flat on Victoria Street through an independent estate agent named Greg.\n\nUpon entering the building, Maya assessed the communal areas: the hallways were clean, the secure intercom functioned properly, and a modern elevator eliminated the strain of climbing five flights of stairs. Inside the flat, floor-to-ceiling double-glazed windows flooded the living space with afternoon daylight while insulating the interior from traffic noise. Maya methodically inspected the water pressure in the shower, opened kitchen cabinets to check for moisture, and verified the functionality of the electric oven.\n\nSitting down at the breakfast bar, Greg presented the tenancy agreement details. The monthly rent included council maintenance and high-speed broadband, though utilities like heating and electricity were billed separately. The landlord requested a one-month security deposit protected by a certified government tenancy deposit scheme, alongside standard employment references. Confident in the property's condition and fair terms, Maya submitted her application dossier that very afternoon, securing her dream home.",
    target_words: ["tenancy", "exorbitant", "double-glazed", "references"],
    target_vocabulary: [
      { word: "tenancy", phonetic: "/ˈten.ən.si/", turkish_meaning: "kiracılık, kira sözleşmesi", context_sentence: "They reviewed the terms of the tenancy agreement." },
      { word: "exorbitant", phonetic: "/ɪɡˈzɔː.bɪ.tənt/", turkish_meaning: "aşırı fahiş, çok yüksek", context_sentence: "Other listings demanded exorbitant rental deposits." },
      { word: "double-glazed", phonetic: "/ˌdʌb.əl ˈɡleɪzd/", turkish_meaning: "çift camlı (ısı ve ses yalıtımlı)", context_sentence: "Double-glazed windows blocked out street noise." },
      { word: "references", phonetic: "/ˈref.ər.əns.ɪz/", turkish_meaning: "referans belgeleri (iş/kira)", context_sentence: "The landlord asked for verified employment references." },
    ],
    comprehension_questions: [
      {
        question: "What physical features impressed Maya during the flat inspection?",
        options: ["A swimming pool on the balcony", "Double-glazed soundproof windows and strong water pressure", "Free antique furniture", "A private rooftop helipad"],
        correct_answer_index: 1,
        explanation: "She appreciated the double-glazed windows that blocked street noise and inspected the water pressure."
      },
      {
        question: "What expenses were included within the monthly rent?",
        options: ["All grocery deliveries", "Building maintenance and high-speed broadband", "Electricity and heating", "Car insurance"],
        correct_answer_index: 1,
        explanation: "The tenancy agreement included council maintenance and broadband, with utilities billed separately."
      },
      {
        question: "How was the security deposit handled legally?",
        options: ["Paid in cash without receipts", "Protected through a certified government tenancy deposit scheme", "Held in the agent's personal account", "Replaced by personal jewelry"],
        correct_answer_index: 1,
        explanation: "The deposit was protected by a certified government tenancy deposit scheme."
      },
    ],
  },
  {
    id: "daily-08",
    title: "A Trip to the Lost and Found Office",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 240,
    coverImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    topic: "Kayıp Eşya Bürosu",
    desc: "Metroda unuttuğu deri sırt çantasını merkezi kayıp eşya ofisinden teslim alan Sophia'nın rahatlaması.",
    content: "During Monday's hectic morning commute on the Piccadilly underground line, Sophia inadvertently left her brown leather rucksack resting on an overhead luggage shelf. The bag contained her personal work laptop, wireless headphones, and a notebook containing irreplaceable design sketches. Frantic with worry, she immediately contacted the Transport for London customer support line.\n\nThe customer representative advised Sophia to log an online inquiry ticket with the Central Lost Property Office on Baker Street. Two days later, an automated email notification informed her that a matching item had been cataloged by a night maintenance crew at the Cockfosters rail depot. Overjoyed, Sophia traveled to the Baker Street office during her lunch break.\n\nInside the office, rows of numbered wooden lockers held thousands of misplaced umbrellas, keys, and coats. The attendant, Mr. Henderson, requested official identification and asked Sophia to provide specific identifying hallmarks of the bag's interior contents, including the serial number of the laptop and the color of her charging cables. After Sophia accurately verified every detail and signed the official property release ledger, Mr. Henderson retrieved her intact rucksack from a secure locker, restoring her peace of mind.",
    target_words: ["inadvertently", "hallmarks", "depot", "misplaced"],
    target_vocabulary: [
      { word: "inadvertently", phonetic: "/ˌɪn.ədˈvɜː.tənt.li/", turkish_meaning: "kazara, farkında olmadan", context_sentence: "She inadvertently left her rucksack on the train." },
      { word: "hallmarks", phonetic: "/ˈhɔːl.mɑːks/", turkish_meaning: "belirgin ayırt edici özellikler", context_sentence: "She described specific hallmarks of her laptop." },
      { word: "depot", phonetic: "/ˈdep.əʊ/", turkish_meaning: "tren hangarı, depo", context_sentence: "Night cleaners found the bag at the rail depot." },
      { word: "misplaced", phonetic: "/mɪsˈpleɪst/", turkish_meaning: "yanlış yere bırakılmış, unutulmuş", context_sentence: "The office stores thousands of misplaced items." },
    ],
    comprehension_questions: [
      {
        question: "Where did Sophia accidentally leave her brown leather rucksack?",
        options: ["In a coffee shop booth", "On an overhead luggage rack in an underground train", "In a university classroom", "On a park bench"],
        correct_answer_index: 1,
        explanation: "She inadvertently left her bag on an overhead shelf on the Piccadilly line."
      },
      {
        question: "How did the lost property attendant verify Sophia's ownership?",
        options: ["By asking for fifty pounds", "By checking identification and matching specific interior hallmarks and serial numbers", "By opening her email on a public phone", "By asking her friends"],
        correct_answer_index: 1,
        explanation: "The attendant checked her ID and verified specific internal details like serial numbers."
      },
      {
        question: "Who originally recovered Sophia's bag from the train?",
        options: ["Another passenger", "A night maintenance crew at the rail depot", "A police officer", "The train driver during lunch"],
        correct_answer_index: 1,
        explanation: "A night maintenance cleaning crew at the Cockfosters depot cataloged the bag."
      },
    ],
  },
  {
    id: "daily-09",
    title: "Preparing for the Final Job Interview",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 250,
    coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    topic: "İş Görüşmesi Hazırlığı",
    desc: "Kritik video mülakatı öncesinde teknik vaka sorularını ve STAR yöntemini gözden geçiren Marcus.",
    content: "Sitting at his desk on Thursday evening, Marcus conducted a thorough rehearsal for his upcoming final-round interview with an international renewable energy consultancy. Having advanced past the initial recruiter screening and technical test, this sixty-minute panel interview would determine whether he secured the senior project coordinator position.\n\nMarcus methodically reviewed the STAR technique—Situation, Task, Action, and Result—to structure his responses regarding past engineering challenges. On his whiteboard, he mapped out a concise case study detailing how he resolved a supply chain delay during a wind farm installation project in Scotland, highlighting how his collaborative negotiations saved the client twelve thousand pounds without compromising safety compliance.\n\nNext, he tested his technical setup: webcam angle at eye level, a neutral virtual background, and crisp audio through an external condenser microphone. He compiled three insightful, open-ended questions for the panel, focusing on the company's five-year expansion into offshore hydrogen infrastructure and their mentorship programs for junior engineers. Dressing in a sharp navy blazer and taking deep, measured breaths to center his thoughts, Marcus closed his laptop feeling thoroughly prepared to articulate his unique professional value.",
    target_words: ["screening", "collaborative", "compliance", "insightful"],
    target_vocabulary: [
      { word: "screening", phonetic: "/ˈskriː.nɪŋ/", turkish_meaning: "ön eleme mülakatı", context_sentence: "He passed the initial recruiter screening." },
      { word: "collaborative", phonetic: "/kəˈlæb.ər.ə.tɪv/", turkish_meaning: "iş birliğine dayalı, ortaklaşa", context_sentence: "He highlighted his collaborative negotiations." },
      { word: "compliance", phonetic: "/kəmˈplaɪ.əns/", turkish_meaning: "mevzuata ve kurallara uygunluk", context_sentence: "They maintained strict safety compliance." },
      { word: "insightful", phonetic: "/ˈɪn.saɪt.fəl/", turkish_meaning: "öngörülü, derin kavrayışlı", context_sentence: "He prepared insightful questions for the panel." },
    ],
    comprehension_questions: [
      {
        question: "What interview framework did Marcus use to structure his case study answers?",
        options: ["The SWOT matrix", "The STAR technique (Situation, Task, Action, Result)", "The Pareto 80/20 rule", "The Agile sprint method"],
        correct_answer_index: 1,
        explanation: "Marcus used the STAR method to structure his answers on past engineering challenges."
      },
      {
        question: "What specific project did Marcus map out on his whiteboard?",
        options: ["A software app development", "Resolving a supply chain delay on a Scottish wind farm project", "Building a bridge in London", "A solar roof marketing plan"],
        correct_answer_index: 1,
        explanation: "He mapped out how he negotiated supply chain issues on a wind farm in Scotland."
      },
      {
        question: "What topics did Marcus's prepared questions for the interviewers address?",
        options: ["Salary bonuses only", "Offshore hydrogen infrastructure expansion and mentorship programs", "Holiday allowances", "Remote office equipment"],
        correct_answer_index: 1,
        explanation: "His questions inquired about offshore hydrogen projects and mentorship opportunities."
      },
    ],
  },
  {
    id: "daily-10",
    title: "The Vibrant City Street Festival",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "B",
    cefr: "B1-B2",
    readTime: "4-5 dk",
    wordCount: 245,
    coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
    topic: "Şehir Festivali",
    desc: "Trafiğe kapatılan tarihi caddede sokak lezzetleri ve canlı müzikle bir araya gelen mahalle sakinleri.",
    content: "On the final Saturday of August, the city council pedestrianized four bustling blocks along Market Street to host the annual Riverside Cultural Festival. What was normally a congested vehicular thoroughfare transformed into a pedestrian carnival celebrating the rich multicultural tapestry of the metropolitan community.\n\nColorful decorative bunting fluttered between ornate Victorian streetlamps as thousands of residents strolled leisurely under the summer sunshine. The enticing aroma of global gastronomy filled the air: Mexican street tacos sizzling on flat-top grills, aromatic Vietnamese banh mi sandwiches with pickled carrots, and warm Spanish churros dusted in cinnamon sugar. Local artisans displayed handcrafted ceramics, silver jewelry, and reclaimed timber sculptures under striped canvas tents.\n\nAt the central amphitheater stage, an acoustic jazz ensemble performed energetic standards before yielding the spotlight to an energetic West African drumming troupe. Children danced with face paint beside bubble artists, while neighbors who rarely interacted during busy workweeks chatted over cups of craft ginger ale. The festival demonstrated how reclaiming public urban spaces from automotive traffic can revitalize neighborhood solidarity and communal joy.",
    target_words: ["pedestrianized", "thoroughfare", "gastronomy", "artisans"],
    target_vocabulary: [
      { word: "pedestrianized", phonetic: "/pəˈdes.tri.ə.naɪzd/", turkish_meaning: "yayalaştırılmış, araç trafiğine kapatılmış", context_sentence: "The avenue was pedestrianized for the weekend festival." },
      { word: "thoroughfare", phonetic: "/ˈθʌr.ə.feər/", turkish_meaning: "ana cadde, işlek geçit yolu", context_sentence: "The crowded thoroughfare turned into a carnival." },
      { word: "gastronomy", phonetic: "/ɡæsˈtrɒn.ə.mi/", turkish_meaning: "gastronomi, mutfak kültürü", context_sentence: "Stalls showcased mouth-watering global gastronomy." },
      { word: "artisans", phonetic: "/ˌɑː.tɪˈzænz/", turkish_meaning: "zanaatkarlar, el işi ustaları", context_sentence: "Local artisans exhibited ceramics and handmade jewelry." },
    ],
    comprehension_questions: [
      {
        question: "How did the city council prepare Market Street for the festival?",
        options: ["They added more parking meters", "They pedestrianized four blocks and closed them to vehicular traffic", "They repaved the asphalt during the day", "They built a new tram line"],
        correct_answer_index: 1,
        explanation: "The council pedestrianized four blocks of Market Street, banning automotive traffic."
      },
      {
        question: "What musical performances took place on the amphitheater stage?",
        options: ["Heavy metal and opera", "Acoustic jazz ensemble and West African drumming troupe", "Electronic techno DJ", "Classical piano solo"],
        correct_answer_index: 1,
        explanation: "An acoustic jazz ensemble and a West African drumming troupe performed."
      },
      {
        question: "What social benefit did the festival foster among local residents?",
        options: ["It encouraged people to stay indoors", "It revitalized community solidarity and interaction across public spaces", "It promoted shopping mall purchases", "It reduced city electricity consumption"],
        correct_answer_index: 1,
        explanation: "The festival revitalized neighborhood solidarity by bringing neighbors together in shared spaces."
      },
    ],
  },

  // =========================================================================
  // C SEVİYESİ (C1-C2, ~320-360 kelime, 5-6 dk)
  // 11) Kentsel dönüşüm tartışması (Urban regeneration/gentrification)
  // 12) Yerel konsey toplantısı (Municipal town hall/local council debate)
  // 13) Uzaktan çalışma dinamikleri (Remote work asynchronous collaboration)
  // 14) Kültürel uyum süreci (Cross-cultural adaptation & expatriate psychology)
  // 15) Topluluk dayanışma projesi (Grassroots community solidarity project)
  // =========================================================================
  {
    id: "daily-11",
    title: "The Great Urban Regeneration Debate",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 345,
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    topic: "Kentsel Dönüşüm Tartışması",
    desc: "Tarihi liman bölgesindeki soylulaştırma projesinde yerel esnaf ile kurumsal yatırımcılar arasındaki çelişki.",
    content: "Inside the packed auditorium of the historic Maritime Exchange, tensions ran palpably high as the municipal planning commission convened a public inquiry regarding the proposed docklands master plan. For over a century, the neighborhood had existed as a gritty industrial quarter characterized by maritime warehouses, multi-generational family workshops, and modest working-class tenements. However, a consortium of private property developers presented a two-billion-euro architectural blueprint designed to replace derelict wharves with high-density luxury residential towers, private marinas, and high-end retail plazas.\n\nProponents of the regeneration initiative argued that the capital injection would revitalize a neglected post-industrial brownfield site. They presented economic models forecasting thirty thousand construction jobs, increased municipal tax revenues, and state-of-the-art climate-resilient seawalls to protect against tidal flooding. Conversely, a coalition of long-standing community organizers, dockworkers, and urban sociologists articulated profound alarm regarding hyper-gentrification and displacement.\n\nThey cited empirical precedent showing that soaring commercial rents would inevitably bankrupt independent grocers, dry docks, and bohemian artist cooperatives, replacing authentic community heritage with sterile corporate monoculture. Senior urban planner Dr. Aris Thorne addressed the dais, advocating for an equitable compromise: an amended planning covenant mandating forty percent genuinely affordable civic housing, the historical preservation of nineteenth-century red-brick warehouse facades, and subsidized ground-floor retail leases reserved exclusively for indigenous businesses. The contentious session demonstrated that modern urbanism must rigorously balance economic modernization with social justice and cultural heritage.",
    target_words: ["consortium", "derelict", "hyper-gentrification", "covenant"],
    target_vocabulary: [
      { word: "consortium", phonetic: "/kənˈsɔː.ti.əm/", turkish_meaning: "konsorsiyum, yatırımcı ortaklığı", context_sentence: "A developer consortium proposed luxury waterfront towers." },
      { word: "derelict", phonetic: "/ˈder.ə.lɪkt/", turkish_meaning: "metruk, terk edilmiş, harap", context_sentence: "The project aimed to replace derelict industrial wharves." },
      { word: "hyper-gentrification", phonetic: "/ˌhaɪ.pə ˌdʒen.trɪ.fɪˈkeɪ.ʃən/", turkish_meaning: "aşırı soylulaştırma (yerel halkın kovulması)", context_sentence: "Community activists warned against hyper-gentrification." },
      { word: "covenant", phonetic: "/ˈkʌv.ən.ənt/", turkish_meaning: "bağlayıcı yasal taahhütname, sözleşme", context_sentence: "The council proposed an amended planning covenant." },
    ],
    comprehension_questions: [
      {
        question: "What main conflict emerged during the municipal docklands planning inquiry?",
        options: ["A dispute over airline flight paths", "The clash between corporate luxury redevelopment and working-class community displacement", "A strike by municipal sanitation workers", "Disagreement over building a sports stadium"],
        correct_answer_index: 1,
        explanation: "The debate pitted private developer regeneration against community fears of gentrification and displacement."
      },
      {
        question: "What benefits did the developer consortium promise in their economic proposal?",
        options: ["Free electricity for everyone", "Construction employment, increased tax revenues, and flood defense seawalls", "Demolishing all historic brick buildings", "Banning private vehicles completely"],
        correct_answer_index: 1,
        explanation: "They forecasted construction jobs, municipal tax gains, and climate-resilient seawalls."
      },
      {
        question: "What compromise did urban planner Dr. Thorne recommend to resolve the dispute?",
        options: ["Halting all construction forever", "A binding covenant mandating 40% affordable housing and preserving historic facades", "Building only luxury retail plazas", "Relocating the port to another city"],
        correct_answer_index: 1,
        explanation: "Dr. Thorne proposed a covenant mandating 40% affordable housing, facade preservation, and local business leases."
      },
    ],
  },
  {
    id: "daily-12",
    title: "Deliberations at the Municipal Town Hall",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 340,
    coverImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    topic: "Yerel Konsey Toplantısı",
    desc: "Şehir içi korumalı bisiklet yolları ve otopark dönüşümü üzerine yerel mecliste yaşanan hararetli demokratik müzakere.",
    content: "The monthly legislative session of the Bristol City Council convened amidst spirited public interest regarding Proposed Ordinance 42—a sweeping initiative to re-allocate two vehicle traffic lanes along the city's central arterial corridor into a permanently segregated cycle superhighway. Presided over by Council President Helena Vance, the chamber was filled with cycling advocates in yellow vests, downtown shopkeepers, school transport representatives, and environmental scientists.\n\nOpponents of the ordinance, led by the Downtown Merchants' Association, argued vehemently that removing curbside customer parking spaces would devastate foot traffic to independent storefronts during peak holiday shopping quarters. They presented logistical concerns regarding delivery vehicle access and argued that street narrowing would exacerbate vehicular congestion on adjacent residential side streets. Council member Bradley voiced reservations about emergency vehicle transit times during severe traffic jams.\n\nIn response, the Director of Municipal Public Health presented comprehensive statistical models from Copenhagen and Amsterdam demonstrating that separated micro-mobility infrastructure consistently yielded an eight percent uptick in retail consumer spending while decreasing urban asthma hospitalizations by fourteen percent. Environmental delegates highlighted that reducing private automobile commuting was indispensable to achieving municipal net-zero carbon mandates. After three hours of forensic debate, councilors adopted a constructive amendment: designating off-peak commercial loading zones and investing municipal funds into park-and-ride shuttles. The final vote passed nine to four, demonstrating how rigorous local democratic engagement synthesizes competing civic priorities into progress.",
    target_words: ["ordinance", "segregated", "exacerbate", "constituency"],
    target_vocabulary: [
      { word: "ordinance", phonetic: "/ˈɔː.dɪ.nəns/", turkish_meaning: "belediye kararnamesi, yerel yasa", context_sentence: "Councilors debated Proposed Ordinance 42." },
      { word: "segregated", phonetic: "/ˈseɡ.rɪ.ɡeɪ.tɪd/", turkish_meaning: "fiziksel olarak ayrılmış (bisiklet yolu)", context_sentence: "The plan featured a permanently segregated cycle lane." },
      { word: "exacerbate", phonetic: "/ɪɡˈzæs.ə.beɪt/", turkish_meaning: "kötüleştirmek, daha da tırmandırmak", context_sentence: "Merchants feared road narrowing would exacerbate gridlock." },
      { word: "constituency", phonetic: "/kənˈstɪtʃ.u.ən.si/", turkish_meaning: "seçmen kitlesi, temsil edilen halk", context_sentence: "Councilors spoke on behalf of their local constituency." },
    ],
    comprehension_questions: [
      {
        question: "What core policy change did Proposed Ordinance 42 introduce?",
        options: ["Banning all public transport", "Re-allocating two vehicle lanes into a segregated cycle superhighway", "Increasing highway speed limits", "Closing all downtown shops on weekends"],
        correct_answer_index: 1,
        explanation: "The ordinance proposed converting two vehicle lanes into a dedicated segregated cycle superhighway."
      },
      {
        question: "What primary objection was raised by the Downtown Merchants' Association?",
        options: ["High noise from bicycle bells", "Loss of curbside parking and disrupted delivery van access for shops", "Increased property taxes", "Bicycle lane color preferences"],
        correct_answer_index: 1,
        explanation: "They feared losing curbside parking spaces would harm customer foot traffic and deliveries."
      },
      {
        question: "What amendment helped the council pass the ordinance with a 9-4 vote?",
        options: ["Canceling the bike lanes completely", "Adding designated commercial delivery zones and park-and-ride shuttles", "Imposing tolls on cyclists", "Paving over sidewalks"],
        correct_answer_index: 1,
        explanation: "Councilors added off-peak loading zones and park-and-ride shuttle funding to accommodate merchants."
      },
    ],
  },
  {
    id: "daily-13",
    title: "The Dynamics of Asynchronous Remote Work",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 345,
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    topic: "Uzaktan Çalışma Dinamikleri",
    desc: "Farklı kıtalara yayılmış yazılım ekibinde asenkron iletişim, dijital tükenmişlik ve şeffaf belgeleme sanatı.",
    content: "Operating across twelve distinct time zones spanning Auckland, London, and San Francisco, CloudScale Engineering functioned without a physical corporate headquarters. Lead systems architect Miriam oversaw thirty-five engineers who collaborated asynchronously—a paradigm where operational progress relies not on real-time video teleconferences, but on meticulously documented code repositories, decision memos, and pull-request threads.\n\nWhile remote work provides unprecedented geographical autonomy, eliminating grueling daily commutes and corporate office politics, it introduces intricate psychological and operational hurdles. Early in the transition, the team fell prey to hyper-connectivity fatigue: engineers instinctively refreshed team chat applications during midnight hours, confusing instantaneous message responsiveness with genuine productivity. Misunderstandings frequently arose from uncalibrated written text lacking vocal cadence and facial nuance.\n\nTo remediate these dysfunctions, Miriam spearheaded an internal cultural protocol known as 'Deliberate Asynchrony.' Real-time video meetings were strictly capped at two hours per week, reserved exclusively for social cohesion and complex brainstorming. Crucially, organizational decisions were codified through open-source Requests for Comment (RFC) documents where colleagues had forty-eight hours to provide written annotations regardless of their time zone.\n\nFurthermore, leadership mandated a 'right to disconnect' policy, silencing notification servers between 19:00 and 08:00 local time. By replacing frantic digital immediacy with thoughtful written reflection and radical trust, the distributed workforce saw burn-out rates drop by forty percent while code deployment velocity surged. The experiment demonstrated that distributed teams thrive not by duplicating physical offices online, but by honoring cognitive autonomy.",
    target_words: ["asynchronously", "autonomy", "hyper-connectivity", "annotated"],
    target_vocabulary: [
      { word: "asynchronously", phonetic: "/eɪˈsɪŋ.krə.nəs.li/", turkish_meaning: "asenkron olarak, eşzamanlı olmadan", context_sentence: "The global team collaborated asynchronously across time zones." },
      { word: "autonomy", phonetic: "/ɔːˈtɒn.ə.mi/", turkish_meaning: "özerklik, bağımsız çalışma serbestliği", context_sentence: "Remote work grants immense personal autonomy." },
      { word: "hyper-connectivity", phonetic: "/ˌhaɪ.pə kəˌnekˈtɪv.ə.ti/", turkish_meaning: "aşırı bağlılık (sürekli online olma hali)", context_sentence: "Constant notifications caused hyper-connectivity fatigue." },
      { word: "annotated", phonetic: "/ˈæn.ə.teɪ.tɪd/", turkish_meaning: "açıklamalarla notlandırılmış", context_sentence: "Colleagues annotated the technical strategy documents." },
    ],
    comprehension_questions: [
      {
        question: "What fundamental operating principle enabled CloudScale to work across twelve time zones?",
        options: ["Requiring all staff to work on London time", "Asynchronous collaboration anchored by rigorous written documentation", "Daily eight-hour video meetings", "Using phone calls only"],
        correct_answer_index: 1,
        explanation: "They collaborated asynchronously using written pull requests, decision memos, and repositories."
      },
      {
        question: "What negative phenomenon initially damaged team morale in the remote environment?",
        options: ["Lack of computer hardware", "Hyper-connectivity fatigue and confusing instant replies with productivity", "Excessive office dress codes", "High train fare costs"],
        correct_answer_index: 1,
        explanation: "Engineers experienced burnout from constantly checking chat apps at midnight."
      },
      {
        question: "How did Miriam's 'Deliberate Asynchrony' policy solve communication issues?",
        options: ["By enforcing 24/7 chat availability", "By capping video meetings, using written 48-hour RFC docs, and silencing off-hours notifications", "By renting a private office in every city", "By banning email completely"],
        correct_answer_index: 1,
        explanation: "Meetings were capped, decisions documented in RFCs with 48-hour windows, and notifications silenced."
      },
    ],
  },
  {
    id: "daily-14",
    title: "The Psychology of Cross-Cultural Adaptation",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 345,
    coverImage: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
    topic: "Kültürel Uyum Süreci",
    desc: "Yeni bir ülkeye yerleşen yabancı uzmanın kültür şokundan entegrasyona uzanan içsel adaptasyon yolculuğu.",
    content: "When renewable energy researcher Kenji relocated from Kyoto to Copenhagen for a three-year international research fellowship, he assumed his extensive global traveling experience would insulate him against cultural disorientation. However, anthropological psychologists have long established that living as an expatriate differs fundamentally from transient tourism. It triggers a profound psychological trajectory known as the cultural adaptation curve.\n\nThe initial phase was an exhilarating honeymoon period: exploring pastel-hued canals on cycling lanes, savoring Danish pastries, and enjoying Scandinavian design minimalism. Yet, by the onset of the somber, rain-swept Scandinavian winter, the inevitable friction of cultural dissonance emerged. Kenji found the Nordic conversational norm of radical directness jarring compared to the nuanced, contextual politeness and indirect subtext customary in Japanese social discourse. Everyday administrative tasks—registering civil health cards, understanding municipal tax codes, and navigating supermarket labeling—consumed immense cognitive energy.\n\nRecognizing the onset of psychological acculturative stress, Kenji resisted the common temptation to retreat into isolated expatriate social bubbles. Instead, he embraced the anthropological principle of cultural humility. He enrolled in evening Danish language classes, joined a community sea-swimming club, and invited Danish colleagues to share traditional nabemono hot-pot dinners at his apartment, openly discussing linguistic nuances and cultural assumptions.\n\nGradually, emotional resilience replaced anxiety. Kenji developed bicultural competence: the cognitive dexterity to navigate two distinct socio-cultural systems without surrendering his innate identity. He recognized that true cross-cultural adaptation is not about passive assimilation, but about expanding the architecture of one's worldview through empathy and dialogue.",
    target_words: ["disorientation", "dissonance", "acculturative", "bicultural"],
    target_vocabulary: [
      { word: "disorientation", phonetic: "/dɪsˌɔː.ri.enˈteɪ.ʃən/", turkish_meaning: "yönünü/yolunu şaşırma, uyumsuzluk hissi", context_sentence: "He experienced cultural disorientation in the new city." },
      { word: "dissonance", phonetic: "/ˈdɪs.ə.nəns/", turkish_meaning: "uyumsuzluk, kültürel sürtüşme", context_sentence: "Communication differences created cognitive dissonance." },
      { word: "acculturative", phonetic: "/əˈkʌl.tʃər.ə.tɪv/", turkish_meaning: "kültürleşme sürecine ait (stres vb.)", context_sentence: "He overcame acculturative stress by joining local clubs." },
      { word: "bicultural", phonetic: "/baɪˈkʌl.tʃər.əl/", turkish_meaning: "iki kültürlü, her iki kültüre de hakim", context_sentence: "He developed versatile bicultural competence." },
    ],
    comprehension_questions: [
      {
        question: "What distinction did Kenji realize between tourism and long-term expatriate residency?",
        options: ["Tourism is more expensive than renting", "Expatriate living triggers an extensive psychological cultural adaptation curve", "Tourism requires learning languages faster", "There are no differences between them"],
        correct_answer_index: 1,
        explanation: "Living as an expat involves deep psychological friction and cultural adaptation beyond tourism."
      },
      {
        question: "What conversational contrast did Kenji find challenging between Kyoto and Copenhagen?",
        options: ["Danish spoken speed was too fast", "Nordic radical directness contrasted with Japanese contextual, indirect politeness", "Danish people refused to speak English", "Nobody talked in public"],
        correct_answer_index: 1,
        explanation: "Nordic direct communication differed sharply from subtle, indirect Japanese social etiquette."
      },
      {
        question: "How did Kenji constructively overcome his cultural acculturative stress?",
        options: ["By booking an immediate flight back home", "By staying inside his apartment and avoiding locals", "By taking language classes, joining a swimming club, and hosting cultural dinners", "By filing complaints with his university"],
        correct_answer_index: 2,
        explanation: "He enrolled in language lessons, joined local clubs, and shared hot-pot dinners with colleagues."
      },
    ],
  },
  {
    id: "daily-15",
    title: "The Grassroots Community Solidarity Project",
    category: "adult_basic",
    categoryName: "Günlük Yaşam & Temel İngilizce",
    level: "C",
    cefr: "C1-C2",
    readTime: "5-6 dk",
    wordCount: 345,
    coverImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
    topic: "Topluluk Dayanışma Projesi",
    desc: "Kış aylarında mahallede dayanışma mutfağı ve gıda paylaşım ağı kuran sakinlerin imece ruhu.",
    content: "When severe economic headwinds and soaring living costs threatened low-income households across the working-class borough of Saint-Denis, community organizer Amira refused to succumb to despair. Rather than relying solely on bureaucratic state welfare apparatuses that often moved with glacial inertia, she convened a meeting in the crypt of a deconsecrated parish church to inaugurate the 'Table Commune'—a grassroots mutual aid solidarity collective.\n\nThe project rejected paternalistic top-down charity in favor of non-hierarchical participatory democracy. Amira established partnerships with regional wholesale agricultural cooperatives, rescuing cosmetically imperfect organic vegetables and unsold bakery loaves that grocery monopolies routinely discarded into landfills. Every Wednesday and Saturday morning, over forty neighborhood volunteers transformed the church basement into a bustling cooperative processing hub.\n\nElderly pensioners, university students, and recent migrant families cooked nutritious stews together in fifty-liter stockpots, sharing heirloom culinary traditions while breaking through generational and ethnic isolation. Crucially, the initiative incorporated a dignity-preserving distribution model: meals and fresh produce hampers were offered on a voluntary 'pay-what-you-can' sliding scale, ensuring that impoverished recipients retained agency rather than experiencing stigmatizing shame.\n\nBeyond food security, the space evolved into a civic resource center: retired solicitors offered free legal clinics regarding landlord disputes, while bilingual teenagers assisted older residents with digital public service portals. In an individualized socio-economic landscape often fractured by alienation, the grassroots collective proved that neighborhood resilience and reciprocal solidarity constitute the ultimate bedrock of human civilization.",
    target_words: ["grassroots", "paternalistic", "stigma", "reciprocal"],
    target_vocabulary: [
      { word: "grassroots", phonetic: "/ˈɡrɑːs.ruːts/", turkish_meaning: "tabandan gelen, halk inisiyatifi", context_sentence: "They launched a grassroots mutual aid collective." },
      { word: "paternalistic", phonetic: "/pəˌtɜː.nəlˈɪs.tɪk/", turkish_meaning: "baskıcı ve korumacı, lütufkar", context_sentence: "The project rejected condescending paternalistic charity." },
      { word: "stigma", phonetic: "/ˈstɪɡ.mə/", turkish_meaning: "utanç lekesi, yaftalama", context_sentence: "The sliding scale prevented social stigma and shame." },
      { word: "reciprocal", phonetic: "/rɪˈsɪp.rə.kəl/", turkish_meaning: "karşılıklı, dengeli dayanışma", context_sentence: "Neighborhood survival relied on reciprocal solidarity." },
    ],
    comprehension_questions: [
      {
        question: "How did the 'Table Commune' project acquire fresh food for its solidarity kitchen?",
        options: ["By buying expensive luxury groceries", "By partnering with regional cooperatives to rescue unsold, cosmetically imperfect produce", "By importing frozen meals from abroad", "By asking the military for rations"],
        correct_answer_index: 1,
        explanation: "They rescued surplus, cosmetically imperfect produce and unsold bread from regional cooperatives."
      },
      {
        question: "What financial model was implemented to preserve the dignity of community recipients?",
        options: ["Fixed mandatory entrance fees", "A voluntary pay-what-you-can sliding scale", "Government voucher paperwork only", "Requiring work labor before eating"],
        correct_answer_index: 1,
        explanation: "A voluntary pay-what-you-can scale preserved agency and dignity without stigma."
      },
      {
        question: "What auxiliary services expanded out of the food solidarity project?",
        options: ["A car repair shop", "Free legal clinics for tenant disputes and digital service assistance", "A commercial nightclub", "A political campaign office"],
        correct_answer_index: 1,
        explanation: "Retired solicitors offered free legal aid and youth assisted elders with digital administrative portals."
      },
    ],
  },
];

export const ADULT_BASIC_STORIES = dailyLifeStories;
