"use client";

import React, { useState, useEffect, useMemo } from "react";
import StoryReader from "./StoryReader";
import ShareModal from "../ShareModal";
import { useTranslation, useLanguage, Language } from "../../context/LanguageContext";
import { useExperience } from "../../context/ExperienceContext";
import {
    BookOpen,
    Sparkles,
    Wand2,
    Loader2,
    Clock,
    CheckCircle2,
    BookMarked,
    Library,
    ArrowRight,
    ChevronRight,
    Share2,
    GraduationCap,
    Trophy,
    Coins,
    Zap
} from "lucide-react";

interface Deck {
    id: string;
    title: string;
}

interface ReadingRoomProps {
    decks: Deck[];
    selectedDeckId: string;
    initialStory?: any;
    onBack?: () => void;
    onShareStory?: (story: any) => void;
    onCompleteStory?: (storyId: string) => void;
}

interface ProgressItem {
    storyKey: string;
    title: string;
    level: string;
    topic: string;
    lastParagraph: number;
    status: "in_progress" | "completed";
    updatedAt: number;
    contentSnippet?: string;
}

// 15 ADET ÜCRETSİZ & KOTASIZ HAZIR HİKAYE (İçerikler, Hedef Kelimeler ve Sorular Doğrudan Dahildir)
const FREE_LIBRARY_STORIES = [
    // ==================== ELEMENTARY (A1 - A2) ====================
    {
        id: "elem-1",
        title: "A Sunny Day in the Park",
        level: "Elementary",
        cefr: "A1 - A2",
        topic: "Daily Life",
        desc: "Güneşli bir sabah parkta köpeğiyle yürüyüşe çıkan Leo'nun huzurlu hikayesi.",
        wordCount: "~150 Kelime",
        target_words: ["sunny", "bench", "squirrel", "pocket"],
        content: (
            "It was a warm and sunny morning in the city. Leo decided to take his small dog for a walk in the park. " +
            "The green grass was shining with morning dew. Children were laughing and running near the colorful playground. " +
            "Leo sat on a wooden bench and opened his favorite book. Suddenly, his dog began to bark happily at a tiny squirrel. " +
            "The squirrel quickly climbed up an old oak tree. Leo smiled, closed his book, and took an orange from his pocket to eat."
        ),
        target_vocabulary: [
            { word: "sunny", phonetic: "/ˈsʌn.i/", turkish_meaning: "güneşli" },
            { word: "bench", phonetic: "/bentʃ/", turkish_meaning: "bank, oturak" },
            { word: "squirrel", phonetic: "/ˈskwɪr.əl/", turkish_meaning: "sincap" },
            { word: "pocket", phonetic: "/ˈpɒk.ɪt/", turkish_meaning: "cep" }
        ],
        comprehension_questions: [
            { question: "Where did Leo go in the morning?", options: ["A) Supermarket", "B) The park", "C) School", "D) Train station"], correct_answer_index: 1 },
            { question: "What animal did the dog bark at?", options: ["A) Cat", "B) Duck", "C) Squirrel", "D) Rabbit"], correct_answer_index: 2 },
            { question: "What fruit did Leo eat?", options: ["A) Apple", "B) Banana", "C) Orange", "D) Peach"], correct_answer_index: 2 }
        ]
    },
    {
        id: "elem-2",
        title: "The Baker's Secret Bread",
        level: "Elementary",
        cefr: "A1 - A2",
        topic: "Food & Life",
        desc: "Kasabanın sevilen fırıncısı Thomas'ın dağ balıyla yaptığı enfes ekmek ve küçük Maya.",
        wordCount: "~130 Kelime",
        target_words: ["bakery", "flour", "honey", "crispy"],
        content: (
            "Every morning at five o'clock, Thomas starts baking fresh bread in his quiet bakery. " +
            "The warm smell of flour and butter fills the narrow street. Neighbors line up early outside the shop. " +
            "His secret ingredient is a tiny spoon of organic honey from mountain bees. " +
            "A little girl named Maya always visits to buy a warm crispy loaf for her grandmother."
        ),
        target_vocabulary: [
            { word: "bakery", phonetic: "/ˈbeɪ.kər.i/", turkish_meaning: "fırın" },
            { word: "flour", phonetic: "/flaʊər/", turkish_meaning: "un" },
            { word: "honey", phonetic: "/ˈhʌn.i/", turkish_meaning: "bal" },
            { word: "crispy", phonetic: "/ˈkrɪs.pi/", turkish_meaning: "çıtır, gevrek" }
        ],
        comprehension_questions: [
            { question: "What time does Thomas begin baking?", options: ["A) 5:00 AM", "B) 7:00 AM", "C) 12:00 PM", "D) 8:00 PM"], correct_answer_index: 0 },
            { question: "What is the secret ingredient?", options: ["A) Sugar", "B) Honey", "C) Vanilla", "D) Milk"], correct_answer_index: 1 },
            { question: "Who does Maya buy bread for?", options: ["A) Brother", "B) Mother", "C) Grandmother", "D) Neighbor"], correct_answer_index: 2 }
        ]
    },
    {
        id: "elem-3",
        title: "Lost in the Big Library",
        level: "Elementary",
        cefr: "A1 - A2",
        topic: "School & Books",
        desc: "Uzay kitapları ararken kütüphanede çıkış kapısını kaybeden Sam'in sevimli macerası.",
        wordCount: "~140 Kelime",
        target_words: ["shelf", "exit", "librarian", "guide"],
        content: (
            "Sam wanted to find an interesting story about space exploration. The city library had three floors and thousands of tall wooden shelves. " +
            "He walked quietly through the science section but soon realized he could not find the main exit door. " +
            "A kind librarian noticed his worried face and offered to guide him. " +
            "She showed him the computer catalog and handed him a colorful illustrated astronomy book."
        ),
        target_vocabulary: [
            { word: "shelf", phonetic: "/ʃelf/", turkish_meaning: "raf" },
            { word: "exit", phonetic: "/ˈek.sɪt/", turkish_meaning: "çıkış kapısı" },
            { word: "librarian", phonetic: "/laɪˈbreə.ri.ən/", turkish_meaning: "kütüphaneci" },
            { word: "guide", phonetic: "/ɡaɪd/", turkish_meaning: "yol göstermek" }
        ],
        comprehension_questions: [
            { question: "What topic was Sam looking for?", options: ["A) Cooking", "B) Space exploration", "C) Sports", "D) History"], correct_answer_index: 1 },
            { question: "Why was Sam worried?", options: ["A) Lost wallet", "B) Could not find exit", "C) Late", "D) Broke shelf"], correct_answer_index: 1 },
            { question: "Who helped Sam?", options: ["A) Teacher", "B) Librarian", "C) Police officer", "D) Mother"], correct_answer_index: 1 }
        ]
    },
    {
        id: "elem-4",
        title: "The Friendly Stray Cat",
        level: "Elementary",
        cefr: "A1 - A2",
        topic: "Animals",
        desc: "Pencere önündeki temkinli sarman kediyi sabırla ve sütle evcilleştiren Emma.",
        wordCount: "~135 Kelime",
        target_words: ["ginger", "saucer", "cautious", "purr"],
        content: (
            "Outside Emma's apartment window, a small ginger cat was sitting peacefully on the stone wall. " +
            "It had bright green eyes and a tiny white patch under its chin. Emma brought out a saucer of fresh milk and a few pieces of boiled chicken. " +
            "At first, the cat was hesitant and maintained a cautious distance. " +
            "Within minutes, hearing her soft voice, the friendly feline walked forward and began to purr gently against her shoes."
        ),
        target_vocabulary: [
            { word: "ginger", phonetic: "/ˈdʒɪn.dʒər/", turkish_meaning: "turuncu-kızıl kedi" },
            { word: "saucer", phonetic: "/ˈsɔː.sər/", turkish_meaning: "mama tabağı" },
            { word: "cautious", phonetic: "/ˈkɔː.ʃəs/", turkish_meaning: "temkinli" },
            { word: "purr", phonetic: "/pɜːr/", turkish_meaning: "mırlamak" }
        ],
        comprehension_questions: [
            { question: "What color was the cat?", options: ["A) Black", "B) Ginger", "C) Grey", "D) White"], correct_answer_index: 1 },
            { question: "What did Emma offer the cat?", options: ["A) Fish", "B) Milk and chicken", "C) Bread", "D) Dry food"], correct_answer_index: 1 },
            { question: "How did the cat react in the end?", options: ["A) Ran away", "B) Purred gently", "C) Climbed tree", "D) Slept"], correct_answer_index: 1 }
        ]
    },
    {
        id: "elem-5",
        title: "A Weekend Train Journey",
        level: "Elementary",
        cefr: "A1 - A2",
        topic: "Travel",
        desc: "Ayçiçeği tarlalarından sahil kasabasına uzanan ferahlatıcı bir tren yolculuğu.",
        wordCount: "~145 Kelime",
        target_words: ["platform", "scenery", "sunflower", "destination"],
        content: (
            "On Saturday afternoon, Clara bought a second-class ticket to visit her cousins in the seaside village. " +
            "The vintage train departed smoothly from platform four precisely on schedule. Clara sat next to the clear window to observe the scenery. " +
            "She saw endless yellow sunflower fields, rolling hills, and farmers waving cheerfully at the locomotive. " +
            "Two hours later, the refreshing scent of salty sea breeze signaled that she had reached her peaceful destination."
        ),
        target_vocabulary: [
            { word: "platform", phonetic: "/ˈplæt.fɔːm/", turkish_meaning: "peron" },
            { word: "scenery", phonetic: "/ˈsiː.nər.i/", turkish_meaning: "manzara" },
            { word: "sunflower", phonetic: "/ˈsʌnˌflaʊ.ər/", turkish_meaning: "ayçiçeği" },
            { word: "destination", phonetic: "/ˌdes.tɪˈneɪ.ʃən/", turkish_meaning: "varış noktası" }
        ],
        comprehension_questions: [
            { question: "Where was Clara traveling to?", options: ["A) Big city", "B) Seaside village", "C) Mountain", "D) Ski resort"], correct_answer_index: 1 },
            { question: "What flowers did she see?", options: ["A) Roses", "B) Sunflowers", "C) Tulips", "D) Daisies"], correct_answer_index: 1 },
            { question: "How long was the trip?", options: ["A) One hour", "B) Two hours", "C) Five hours", "D) Overnight"], correct_answer_index: 1 }
        ]
    },

    // ==================== INTERMEDIATE (B1 - B2) ====================
    {
        id: "inter-1",
        title: "The Mystery of the Antique Clock",
        level: "Intermediate",
        cefr: "B1 - B2",
        topic: "Mystery",
        desc: "Büyükbabanın antik saatinin gece yarısı çalmasıyla çözülen şaşırtıcı aile gizemi.",
        wordCount: "~260 Kelime",
        target_words: ["inherit", "craftsman", "mechanism", "deliberately"],
        content: (
            "Elena inherited an old wooden clock from her grandfather, a well-known craftsman in town. " +
            "For years, the clock had remained completely silent on the living room wall. However, exactly at midnight " +
            "on a stormy night, it chimed twelve times with a deep, resonant echo. Puzzled, Elena examined the brass mechanism closely. " +
            "Inside the delicate gears, she discovered a tiny silver key wrapped in yellowed parchment. " +
            "The note contained handwritten coordinates leading to a hidden compartment in the family library. " +
            "Elena realized that her grandfather had deliberately concealed an astonishing family secret before his departure."
        ),
        target_vocabulary: [
            { word: "inherit", phonetic: "/ɪnˈher.ɪt/", turkish_meaning: "miras almak" },
            { word: "craftsman", phonetic: "/ˈkrɑːfts.mən/", turkish_meaning: "zanaatkar, usta" },
            { word: "mechanism", phonetic: "/ˈmek.ə.nɪ.zəm/", turkish_meaning: "mekanizma, düzenek" },
            { word: "deliberately", phonetic: "/dɪˈlɪb.ər.ət.li/", turkish_meaning: "kasten, bilerek" }
        ],
        comprehension_questions: [
            { question: "When did the clock chime?", options: ["A) Midday", "B) Midnight", "C) Morning", "D) Never"], correct_answer_index: 1 },
            { question: "What object was hidden in the gears?", options: ["A) Gold coin", "B) Photo", "C) Silver key", "D) Diamond"], correct_answer_index: 2 },
            { question: "Where did coordinates lead?", options: ["A) Basement", "B) Garden", "C) Library compartment", "D) Attic"], correct_answer_index: 2 }
        ]
    },
    {
        id: "inter-2",
        title: "The Whispering Lighthouse",
        level: "Intermediate",
        cefr: "B1 - B2",
        topic: "Adventure",
        desc: "Sarp kayalıklardaki terk edilmiş deniz fenerinin efsanevi gizemini aydınlatan araştırmacı.",
        wordCount: "~220 Kelime",
        target_words: ["rugged", "illuminate", "folklore", "embedded"],
        content: (
            "Perched on a rugged coastal cliff, the abandoned lighthouse had stood through centuries of violent storms. " +
            "Local sailors claimed that on foggy evenings, the revolving beacon would faintly illuminate the horizon on its own. " +
            "Curious about the folklore, Julian, an ambitious maritime researcher, ventured inside during autumn. " +
            "He ascended the spiral iron staircase, noticing antique navigation maps pinned to the granite walls. " +
            "Near the observation deck, he discovered that the mysterious light was simply a reflection caused by natural crystals embedded in the rocks."
        ),
        target_vocabulary: [
            { word: "rugged", phonetic: "/ˈrʌɡ.ɪd/", turkish_meaning: "engebeli, sarp" },
            { word: "illuminate", phonetic: "/ɪˈluː.mɪ.neɪt/", turkish_meaning: "aydınlatmak" },
            { word: "folklore", phonetic: "/ˈfəʊk.lɔːr/", turkish_meaning: "halk efsanesi" },
            { word: "embedded", phonetic: "/ɪmˈbed.ɪd/", turkish_meaning: "gömülü, yerleşik" }
        ],
        comprehension_questions: [
            { question: "Where was the lighthouse located?", options: ["A) Valley", "B) Rugged coastal cliff", "C) Town center", "D) Lake island"], correct_answer_index: 1 },
            { question: "What was Julian's occupation?", options: ["A) Maritime researcher", "B) Clockmaker", "C) Fisherman", "D) Painter"], correct_answer_index: 0 },
            { question: "What created the glow?", options: ["A) Ghost lantern", "B) Electricity", "C) Reflection from crystals", "D) A ship"], correct_answer_index: 2 }
        ]
    },
    {
        id: "inter-3",
        title: "Echoes in the Mountain Pass",
        level: "Intermediate",
        cefr: "B1 - B2",
        topic: "Nature & Survival",
        desc: "Alplerde ani bir kar fırtınasında mahsur kalan iki dağcının soğukkanlı hayatta kalma mücadelesi.",
        wordCount: "~240 Kelime",
        target_words: ["blizzard", "diminish", "composure", "distress"],
        content: (
            "A sudden blizzard trapped two experienced mountaineers just below the jagged alpine summit. " +
            "With daylight diminishing rapidly, their primary objective was to construct a temporary snow shelter. " +
            "Marcus used his titanium shovel to carve a trench while Sarah consolidated their thermal supplies and emergency rations. " +
            "Despite freezing gusts of wind, their calculated composure prevented panic. " +
            "By dawn, rescue helicopters spotted their orange distress flag fluttering bravely above the immaculate snowdrifts."
        ),
        target_vocabulary: [
            { word: "blizzard", phonetic: "/ˈblɪz.əd/", turkish_meaning: "kar fırtınası, tipi" },
            { word: "diminish", phonetic: "/dɪˈmɪn.ɪʃ/", turkish_meaning: "azalmak, tükenmek" },
            { word: "composure", phonetic: "/kəmˈpəʊ.ʒər/", turkish_meaning: "soğukkanlılık" },
            { word: "distress", phonetic: "/dɪˈstres/", turkish_meaning: "tehlike, imdat" }
        ],
        comprehension_questions: [
            { question: "What weather event trapped climbers?", options: ["A) Rain", "B) Sudden blizzard", "C) Avalanche", "D) Dense fog"], correct_answer_index: 1 },
            { question: "What was their primary goal?", options: ["A) Climb down", "B) Build snow shelter", "C) Campfire", "D) Call radio"], correct_answer_index: 1 },
            { question: "How did rescue locate them?", options: ["A) Whistle", "B) Orange distress flag", "C) GPS", "D) Footprints"], correct_answer_index: 1 }
        ]
    },
    {
        id: "inter-4",
        title: "The Culinary Apprentice",
        level: "Intermediate",
        cefr: "B1 - B2",
        topic: "Career & Gastronomy",
        desc: "Michelin yıldızlı bir mutfakta usta şefin zorlu sınavını aşan azimli bir çırak.",
        wordCount: "~250 Kelime",
        target_words: ["relentless", "volatile", "harmonious", "rigorous"],
        content: (
            "Working in a Michelin-starred kitchen demanded relentless precision and stamina. " +
            "Lucas, an ambitious apprentice, spent fourteen hours a day preparing aromatic reductions and filleting fresh sea bass. " +
            "The head chef possessed a notoriously volatile temperament, accepting nothing short of perfection on each plate. " +
            "During a critical evening review, the critic commended Lucas's delicate saffron sauce for its harmonious balance of acidity. " +
            "That solitary compliment validated every sacrifice Lucas had made throughout his rigorous training."
        ),
        target_vocabulary: [
            { word: "relentless", phonetic: "/rɪˈlent.ləs/", turkish_meaning: "amansız, durmaksızın" },
            { word: "volatile", phonetic: "/ˈvɒl.ə.taɪl/", turkish_meaning: "patlamaya hazır, değişken" },
            { word: "harmonious", phonetic: "/hɑːˈməʊ.ni.əs/", turkish_meaning: "ahenkli, dengeli" },
            { word: "rigorous", phonetic: "/ˈrɪɡ.ər.əs/", turkish_meaning: "sıkı, titiz, zorlu" }
        ],
        comprehension_questions: [
            { question: "What dish was praised?", options: ["A) Roast beef", "B) Saffron sauce", "C) Chocolate dessert", "D) Soup"], correct_answer_index: 1 },
            { question: "How was chef's temperament?", options: ["A) Calm", "B) Volatile and demanding", "C) Lazy", "D) Uninterested"], correct_answer_index: 1 },
            { question: "What was Lucas's role?", options: ["A) Dishwasher", "B) Head chef", "C) Apprentice", "D) Waiter"], correct_answer_index: 2 }
        ]
    },
    {
        id: "inter-5",
        title: "The Silicon Breakthrough",
        level: "Intermediate",
        cefr: "B1 - B2",
        topic: "Technology",
        desc: "Mikroçiplerdeki aşırı ısınma problemini grafen mimarisiyle çözen genç bir mühendisin başarısı.",
        wordCount: "~230 Kelime",
        target_words: ["dissipation", "inadequate", "unprecedented", "jeopardize"],
        content: (
            "Inside an underground lab in Cambridge, a startup team wrestled with heat dissipation in quantum semiconductor microchips. " +
            "Conventional copper heat sinks were simply inadequate for handling the concentrated thermal output. " +
            "A young engineer proposed incorporating synthetic graphene lattices into the chip architecture. " +
            "When the thermal monitors displayed a forty percent drop in operational temperatures, the team cheered with relief. " +
            "This innovative technique unlocked unprecedented computing speeds without jeopardizing hardware durability."
        ),
        target_vocabulary: [
            { word: "dissipation", phonetic: "/ˌdɪs.ɪˈpeɪ.ʃən/", turkish_meaning: "yayılma, dağılma (ısı)" },
            { word: "inadequate", phonetic: "/ɪnˈæd.ɪ.kwət/", turkish_meaning: "yetersiz, kifayetsiz" },
            { word: "unprecedented", phonetic: "/ʌnˈpres.ɪ.den.tɪd/", turkish_meaning: "görülmemiş, emsalsiz" },
            { word: "jeopardize", phonetic: "/ˈdʒep.ə.daɪz/", turkish_meaning: "tehlikeye atmak" }
        ],
        comprehension_questions: [
            { question: "What problem was solved?", options: ["A) Software bugs", "B) Heat dissipation", "C) High cost", "D) Battery"], correct_answer_index: 1 },
            { question: "What material was proposed?", options: ["A) Plastic", "B) Synthetic graphene", "C) Silver", "D) Ceramic"], correct_answer_index: 1 },
            { question: "By what percentage did temp drop?", options: ["A) 10%", "B) 25%", "C) 40%", "D) 80%"], correct_answer_index: 2 }
        ]
    },

    // ==================== ADVANCED (C1 - C2) ====================
    {
        id: "adv-1",
        title: "The Philosophical Echo of Artificial Minds",
        level: "Advanced",
        cefr: "C1 - C2",
        topic: "Science & Philosophy",
        desc: "Yapay zekâ, bilinç, insan iradesi ve zihin felsefesi üzerine derin ve akademik bir okuma.",
        wordCount: "~320 Kelime",
        target_words: ["proliferation", "sentience", "mitigate", "ephemeral"],
        content: (
            "The proliferation of cognitive architectures has reignited classical debates regarding the ontological status of consciousness. " +
            "Epistemologists argue whether artificial models merely simulate semantic comprehension through combinatorial statistics, " +
            "or whether subjective sentience can emerge from sufficiently complex neural networks. As algorithms mitigate intricate problems, " +
            "society grapples with an existential paradox. The distinction between authentic human introspection and sophisticated mimicry " +
            "has grown remarkably ephemeral, prompting scholars to reconsider the very essence of volition and moral agency."
        ),
        target_vocabulary: [
            { word: "proliferation", phonetic: "/prəˌlɪf.ərˈeɪ.ʃən/", turkish_meaning: "hızlı artış, yayılma" },
            { word: "sentience", phonetic: "/ˈsen.ti.əns/", turkish_meaning: "duyarlılık, hissetme yetisi" },
            { word: "mitigate", phonetic: "/ˈmɪt.ɪ.ɡeɪt/", turkish_meaning: "hafifletmek, azaltmak" },
            { word: "ephemeral", phonetic: "/ɪˈfem.ər.əl/", turkish_meaning: "kısa ömürlü, geçici, belirsiz" }
        ],
        comprehension_questions: [
            { question: "What is central philosophical dispute?", options: ["A) Cost", "B) Ontological consciousness of AI", "C) Chip history", "D) Energy"], correct_answer_index: 1 },
            { question: "How is boundary described?", options: ["A) Permanent", "B) Rigid", "C) Ephemeral", "D) Unchanged"], correct_answer_index: 2 },
            { question: "Which verb means to alleviate?", options: ["A) Grapple", "B) Mitigate", "C) Simulate", "D) Reconsider"], correct_answer_index: 1 }
        ]
    },
    {
        id: "adv-2",
        title: "The Resurgence of Forgotten Manuscripts",
        level: "Advanced",
        cefr: "C1 - C2",
        topic: "Literature & History",
        desc: "Orta çağ el yazmalarının altındaki silinmiş antik felsefi metinlerin modern teknolojiyle keşfi.",
        wordCount: "~280 Kelime",
        target_words: ["subterranean", "historiography", "obfuscated", "mutable"],
        content: (
            "In subterranean archives across Western Europe, paleographers have unveiled palimpsests that challenge established historiography. " +
            "These ancient parchments, scraped clean and overwritten by medieval scribes, harbor erased classical treatises beneath ecclesiastical hymns. " +
            "Through multispectral imaging, scholars deciphered previously obfuscated philosophical dialogues. " +
            "The revelation underscores how historical narratives are perpetually mutable, contingent upon technological breakthroughs that resurrect lost intellectual legacies."
        ),
        target_vocabulary: [
            { word: "subterranean", phonetic: "/ˌsʌb.təˈreɪ.ni.ən/", turkish_meaning: "yer altı, gizli" },
            { word: "historiography", phonetic: "/hɪˌstɒr.iˈɒɡ.rə.fi/", turkish_meaning: "tarih yazımı" },
            { word: "obfuscated", phonetic: "/ˈɒb.fʌs.keɪ.tɪd/", turkish_meaning: "karartılmış, anlaşılmaz" },
            { word: "mutable", phonetic: "/ˈmjuː.tə.bəl/", turkish_meaning: "değişken, dönüştürülebilir" }
        ],
        comprehension_questions: [
            { question: "What method recovered erased text?", options: ["A) Solvents", "B) Multispectral imaging", "C) Scraping", "D) Carbon dating"], correct_answer_index: 1 },
            { question: "What was written over the original?", options: ["A) Laws", "B) Ecclesiastical hymns", "C) Ledgers", "D) Decrees"], correct_answer_index: 1 },
            { question: "What lesson does this illustrate?", options: ["A) Parchment is fragile", "B) History is mutable", "C) Scribes kept all", "D) Digital is bad"], correct_answer_index: 1 }
        ]
    },
    {
        id: "adv-3",
        title: "Architectures of Megacities",
        level: "Advanced",
        cefr: "C1 - C2",
        topic: "Urban Sociology",
        desc: "Modern metropollerdeki mekansal ayrışma, soylulaştırma ve mimari tabakalaşma analizi.",
        wordCount: "~310 Kelime",
        target_words: ["bifurcation", "disenfranchised", "ostentation", "stratification"],
        content: (
            "The exponential demographic influx into contemporary metropolises has instigated an unprecedented spatial bifurcation. " +
            "Urban theorists scrutinize how hyper-gentrification alienates vulnerable demographics, relegating them to peripheral, disenfranchised enclaves. " +
            "Concurrently, opulent skyscrapers equipped with privatized biophilic atriums exemplify architectonic ostentation. " +
            "Unless municipalities enact egalitarian zoning ordinances, civic cohesion will disintegrate under escalating socioeconomic stratification."
        ),
        target_vocabulary: [
            { word: "bifurcation", phonetic: "/ˌbaɪ.fəˈkeɪ.ʃən/", turkish_meaning: "ikiye bölünme" },
            { word: "disenfranchised", phonetic: "/ˌdɪs.ɪnˈfræn.tʃaɪzd/", turkish_meaning: "haksızlığa uğramış" },
            { word: "ostentation", phonetic: "/ˌɒs.tenˈteɪ.ʃən/", turkish_meaning: "gösteriş, şatafat" },
            { word: "stratification", phonetic: "/ˌstræt.ɪ.fɪˈkeɪ.ʃən/", turkish_meaning: "tabakalaşma" }
        ],
        comprehension_questions: [
            { question: "What threatens modern megacities?", options: ["A) Depopulation", "B) Disintegration of civic cohesion", "C) Transit", "D) Farming"], correct_answer_index: 1 },
            { question: "Where are marginalized displaced?", options: ["A) Downtown", "B) Peripheral enclaves", "C) Subterranean", "D) Farms"], correct_answer_index: 1 },
            { question: "What measure is recommended?", options: ["A) Luxury towers", "B) Egalitarian zoning ordinances", "C) Demolishing transit", "D) Higher rent"], correct_answer_index: 1 }
        ]
    },
    {
        id: "adv-4",
        title: "The Quantum Entanglement Paradox",
        level: "Advanced",
        cefr: "C1 - C2",
        topic: "Theoretical Physics",
        desc: "Einstein'ın 'uzaktan hayaletimsi etki' dediği kuantum dolanıklığının gerçekliği ve nedensellik algısı.",
        wordCount: "~290 Kelime",
        target_words: ["repudiate", "substantiate", "causality", "reverberate"],
        content: (
            "Einstein famously repudiated non-local physical interactions, disparaging quantum entanglement as 'spooky action at a distance'. " +
            "Nevertheless, rigorous contemporary experiments consistently substantiate the instantaneous correlation of paired quantum states. " +
            "This phenomenon dismantles classical assumptions of macroscopic local realism and deterministic causality. " +
            "The epistemological repercussions reverberate beyond theoretical physics, compelling philosophers to radically interrogate our intuitive apprehension of spacetime."
        ),
        target_vocabulary: [
            { word: "repudiate", phonetic: "/rɪˈpjuː.di.eɪt/", turkish_meaning: "reddetmek, tanımamak" },
            { word: "substantiate", phonetic: "/səbˈstæn.ʃi.eɪt/", turkish_meaning: "kanıtlamak, doğrulamak" },
            { word: "causality", phonetic: "/kɔːˈzæl.ə.ti/", turkish_meaning: "nedensellik" },
            { word: "reverberate", phonetic: "/rɪˈvɜː.bər.eɪt/", turkish_meaning: "yankılanmak" }
        ],
        comprehension_questions: [
            { question: "What phrase did Einstein use?", options: ["A) Cosmic symmetry", "B) Spooky action at a distance", "C) Universal harmony", "D) Singularity"], correct_answer_index: 1 },
            { question: "What concept does entanglement challenge?", options: ["A) Thermodynamics", "B) Local realism and causality", "C) Charge", "D) Orbits"], correct_answer_index: 1 },
            { question: "What do modern experiments demonstrate?", options: ["A) Illusion", "B) Instantaneous correlation of paired states", "C) Variable light", "D) Zero energy"], correct_answer_index: 1 }
        ]
    },
    {
        id: "adv-5",
        title: "The Aesthetic Evolution of Dissonance",
        level: "Advanced",
        cefr: "C1 - C2",
        topic: "Musicology & Art",
        desc: "20. yüzyıl modernizminde atonalite, uyumsuzluğun özgürleşmesi ve müzik estetiğindeki devrim.",
        wordCount: "~300 Kelime",
        target_words: ["emancipation", "cacophonous", "subversive", "presage"],
        content: (
            "Throughout early twentieth-century modernism, avant-garde composers deliberately dismantled traditional diatonic tonality. " +
            "The emancipation of dissonance, pioneered by the Second Viennese School, replaced triadic consonances with twelve-tone serialism. " +
            "Initial bourgeois audiences denounced this sonic rupture as cacophonous and subversive to aesthetic harmony. " +
            "Yet, this radical acoustic subversion presaged the fragmented existential condition of an industrialized world reeling from cataclysmic conflict."
        ),
        target_vocabulary: [
            { word: "emancipation", phonetic: "/iˌmæn.sɪˈpeɪ.ʃən/", turkish_meaning: "özgürleşme" },
            { word: "cacophonous", phonetic: "/kəˈkɒf.ə.nəs/", turkish_meaning: "kulak tırmalayıcı" },
            { word: "subversive", phonetic: "/səbˈvɜː.sɪv/", turkish_meaning: "yıkıcı, altüst edici" },
            { word: "presage", phonetic: "/ˈpres.ɪdʒ/", turkish_meaning: "önceden haber vermek" }
        ],
        comprehension_questions: [
            { question: "Which movement pioneered twelve-tone serialism?", options: ["A) Italian Opera", "B) Second Viennese School", "C) Baroque", "D) Renaissance"], correct_answer_index: 1 },
            { question: "How did early audiences react?", options: ["A) Praised it", "B) Denounced as cacophonous", "C) Slept", "D) Ignored"], correct_answer_index: 1 },
            { question: "What did music foreshadow?", options: ["A) Prosperity", "B) Fragmented condition of era of conflicts", "C) Radio", "D) Classicism"], correct_answer_index: 1 }
        ]
    }
];

const STORY_DESCRIPTIONS: Record<string, Partial<Record<Language, string>>> = {
    "elem-1": {
        tr: "Güneşli bir sabah parkta köpeğiyle yürüyüşe çıkan Leo'nun huzurlu hikayesi.",
        en: "A peaceful morning story of Leo walking his small dog in the sunny park.",
        de: "Eine friedliche Geschichte über Leo, der an einem sonnigen Morgen mit seinem Hund im Park spazieren geht.",
        es: "Una tranquila historia de Leo paseando a su perro en el parque una mañana soleada.",
        fr: "Une histoire paisible de Leo promenant son petit chien dans le parc par un matin ensoleillé."
    },
    "elem-2": {
        tr: "Kasabanın sevilen fırıncısı Thomas'ın dağ balıyla yaptığı enfes ekmek ve küçük Maya.",
        en: "Beloved town baker Thomas bakes delicious bread with mountain honey for little Maya.",
        de: "Der beliebte Bäcker Thomas backt köstliches Brot mit Berghonig für die kleine Maya.",
        es: "El querido panadero Thomas hornea un delicioso pan con miel de montaña para la pequeña Maya.",
        fr: "Le boulanger aimé Thomas prépare un délicieux pain au miel de montagne pour la petite Maya."
    },
    "elem-3": {
        tr: "Uzay kitapları ararken kütüphanede çıkış kapısını kaybeden Sam'in sevimli macerası.",
        en: "Sam's sweet adventure looking for astronomy books and losing the exit door in the grand library.",
        de: "Sams liebenswürdiges Abenteuer auf der Suche nach Astronomiebüchern in der großen Bibliothek.",
        es: "La tierna aventura de Sam buscando libros de astronomía y perdiendo la salida en la gran biblioteca.",
        fr: "La tendre aventure de Sam cherchant des livres d'astronomie dans la grande bibliothèque."
    },
    "elem-4": {
        tr: "Pencere önündeki temkinli sarman kediyi sabırla ve sütle evcilleştiren Emma.",
        en: "Emma patiently befriends a cautious ginger cat outside her window with fresh milk.",
        de: "Emma freundet sich geduldig mit frischer Milch mit einer vorsichtigen roten Katze an.",
        es: "Emma se gana con paciencia y leche la confianza de un gato pelirrojo frente a su ventana.",
        fr: "Emma apprivoise patiemment un chat roux prudent avec du lait frais devant sa fenêtre."
    },
    "elem-5": {
        tr: "Ayçiçeği tarlalarından sahil kasabasına uzanan ferahlatıcı bir tren yolculuğu.",
        en: "A refreshing train ride through blooming sunflower fields to a quiet seaside village.",
        de: "Eine erfrischende Zugfahrt durch blühende Sonnenblumenfelder zu einem ruhigen Küstendorf.",
        es: "Un refrescante viaje en tren por campos de girasoles hacia un pueblo costero.",
        fr: "Un voyage en train revigorant à travers les champs de tournesols vers un village côtier."
    },
    "inter-1": {
        tr: "Büyükbabanın antik saatinin gece yarısı çalmasıyla çözülen şaşırtıcı aile gizemi.",
        en: "A surprising family mystery unraveled when grandfather's antique clock chimes at midnight.",
        de: "Ein überraschendes Familiengeheimnis wird gelüftet, als die Standuhr um Mitternacht schlägt.",
        es: "Un sorprendente misterio familiar se resuelve cuando el reloj antiguo suena a medianoche.",
        fr: "Un surprenant mystère familial révélé lorsque la pendule ancienne sonne à minuit."
    },
    "inter-2": {
        tr: "Sarp kayalıklardaki terk edilmiş deniz fenerinin efsanevi gizemini aydınlatan araştırmacı.",
        en: "An ambitious researcher uncovers the legendary secret of an abandoned coastal lighthouse.",
        de: "Ein Forscher lüftet das legendäre Geheimnis eines verlassenen Leuchtturms auf den Klippen.",
        es: "Un investigador descubre el legendario secreto de un faro abandonado en los acantilados.",
        fr: "Un chercheur découvre le secret légendaire d'un phare abandonné sur les falaises."
    },
    "inter-3": {
        tr: "Alplerde ani bir kar fırtınasında mahsur kalan iki dağcının soğukkanlı hayatta kalma mücadelesi.",
        en: "The calm survival struggle of two mountaineers trapped by a sudden alpine blizzard.",
        de: "Der besonnene Überlebenskampf zweier Bergsteiger in einem plötzlichen Schneesturm in den Alpen.",
        es: "La tranquila lucha por sobrevivir de dos montañeros atrapados en una repentina ventisca alpina.",
        fr: "La lutte courageuse pour la survie de deux alpinistes pris dans un blizzard alpin soudain."
    },
    "inter-4": {
        tr: "Michelin yıldızlı bir mutfakta usta şefin zorlu sınavını aşan azimli bir çırak.",
        en: "An ambitious apprentice rises to the rigorous demands of a Michelin-starred kitchen.",
        de: "Ein ehrgeiziger Lehrling meistert die strengen Prüfungen in einer Michelin-Küche.",
        es: "Un aprendiz ambicioso supera las exigentes pruebas de una cocina con estrella Michelin.",
        fr: "Un apprenti ambitieux relève les défis exigeants d'une cuisine étoilée au guide Michelin."
    },
    "inter-5": {
        tr: "Mikroçiplerdeki aşırı ısınma problemini grafen mimarisiyle çözen genç bir mühendisin başarısı.",
        en: "A young engineer resolves microchip overheating through innovative graphene architecture.",
        de: "Ein junger Ingenieur löst die Überhitzung von Mikrochips mit Graphen-Architektur.",
        es: "Un joven ingeniero resuelve el sobrecalentamiento de microchips con arquitectura de grafeno.",
        fr: "Un jeune ingénieur résout la surchauffe des puces électroniques grâce au graphène."
    },
    "adv-1": {
        tr: "Yapay zekâ, bilinç, insan iradesi ve zihin felsefesi üzerine derin ve akademik bir okuma.",
        en: "A profound philosophical inquiry into machine consciousness, volition, and cognitive architecture.",
        de: "Eine tiefgründige philosophische Betrachtung über künstliches Bewusstsein und menschlichen Willen.",
        es: "Una profunda indagación filosófica sobre la conciencia de las máquinas y la voluntad humana.",
        fr: "Une profonde réflexion philosophique sur la conscience artificielle et le libre arbitre."
    },
    "adv-2": {
        tr: "Orta çağ el yazmalarının altındaki silinmiş antik felsefi metinlerin modern teknolojiyle keşfi.",
        en: "Paleographers reveal erased classical philosophical treatises hidden beneath medieval palimpsests.",
        de: "Paläographen entdecken gelöschte antike philosophische Texte unter mittelalterlichen Palimpsesten.",
        es: "Paleógrafos descubren antiguos tratados filosóficos borrados bajo palimpsestos medievales.",
        fr: "Les paléographes découvrent des traités antiques effacés sous des palimpsestes médiévaux."
    },
    "adv-3": {
        tr: "Modern metropollerdeki mekansal ayrışma, soylulaştırma ve mimari tabakalaşma analizi.",
        en: "An analysis of spatial bifurcation, hyper-gentrification, and socio-economic stratification in megacities.",
        de: "Eine Analyse der räumlichen Segregation und Gentrifizierung in modernen Megastädten.",
        es: "Un análisis de la bifurcación espacial, gentrificación y estratificación en megaciudades.",
        fr: "Une analyse de la ségrégation spatiale, de la gentrification et de la stratification urbaine."
    },
    "adv-4": {
        tr: "Einstein'ın 'uzaktan hayaletimsi etki' dediği kuantum dolanıklığının gerçekliği ve nedensellik algısı.",
        en: "The reality of quantum entanglement and its challenge to macroscopic local realism and causality.",
        de: "Die Realität der Quantenverschränkung und die Infragestellung von Lokalität und Kausalität.",
        es: "La realidad del entrelazamiento cuántico y su desafío al realismo local y la causalidad.",
        fr: "La réalité de l'intrication quantique et sa remise en question du réalisme local et de la causalité."
    },
    "adv-5": {
        tr: "20. yüzyıl modernizminde atonalite, uyumsuzluğun özgürleşmesi ve müzik estetiğindeki devrim.",
        en: "The emancipation of dissonance, atonality, and aesthetic revolution in 20th-century modernist music.",
        de: "Die Emanzipation der Dissonanz, Atonalität und ästhetische Revolution der Musik des 20. Jahrhunderts.",
        es: "La emancipación de la disonancia, la atonalidad y la revolución estética en la música del siglo XX.",
        fr: "L'émancipation de la dissonance, l'atonalité et la révolution esthétique de la musique du XXe siècle."
    }
};

function getStoryDescription(storyId: string, lang: Language, fallback: string): string {
    const localized = STORY_DESCRIPTIONS[storyId]?.[lang];
    if (localized) return localized;
    const en = STORY_DESCRIPTIONS[storyId]?.["en"];
    if (lang !== "tr" && en) return en;
    return fallback;
}

export default function ReadingRoom({
    decks,
    selectedDeckId,
    initialStory,
    onBack,
    onShareStory,
    onCompleteStory,
}: ReadingRoomProps) {
    const { t, currentLang } = useTranslation();
    const [level, setLevel] = useState("Intermediate");
    const [topic, setTopic] = useState("Mystery");
    const [customTopic, setCustomTopic] = useState("");
    const [targetWordsInput, setTargetWordsInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [story, setStory] = useState<any | null>(null);
    const [shareStoryModal, setShareStoryModal] = useState<any | null>(null);

    // Initial story listener
    useEffect(() => {
        if (initialStory) {
            setStory(initialStory);
        }
    }, [initialStory]);

    // Vitrin filtreleme: "ALL" | "Elementary" | "Intermediate" | "Advanced"
    const [vitrinFilter, setVitrinFilter] = useState<string>("ALL");

    // Sekmeler
    const [activeTab, setActiveTab] = useState<"explore" | "in_progress" | "completed">("explore");
    const [progressList, setProgressList] = useState<ProgressItem[]>([]);

    const loadSavedProgress = () => {
        try {
            const items: ProgressItem[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("quizwise_progress_")) {
                    const val = localStorage.getItem(key);
                    if (val) items.push(JSON.parse(val));
                }
            }
            items.sort((a, b) => b.updatedAt - a.updatedAt);
            setProgressList(items);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadSavedProgress();
    }, [story]);

    const inProgressStories = progressList.filter((p) => p.status === "in_progress");
    const completedStories = progressList.filter((p) => p.status === "completed");

    const predefinedTopics = [
        "Mystery", "Daily Life", "Science Fiction", "Travel & Adventure", "Technology", "History"
    ];

    // 1. HAZIR HİKAYELER İÇİN: Backend'i beklemeden doğrudan anında açar (Sıfır Gecikme, Sıfır Hata)
    const handleSelectFreeStory = (storyItem: typeof FREE_LIBRARY_STORIES[0]) => {
        setStory({
            id: storyItem.id,
            title: storyItem.title,
            level: storyItem.level,
            topic: storyItem.topic,
            content: storyItem.content,
            target_vocabulary: storyItem.target_vocabulary,
            comprehension_questions: storyItem.comprehension_questions,
        });
    };

    // 2. YAPAY ZEKÂ İLE ÖZEL HİKAYE ÜRETİMİ
    const handleGenerateStory = async () => {
        setLoading(true);
        try {
            const targetWords = targetWordsInput
                .split(",")
                .map((w) => w.trim())
                .filter((w) => w.length > 0);

            const res = await fetch("http://localhost:8000/api/v1/reading/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level,
                    topic: customTopic.trim() || topic,
                    target_words: targetWords.length > 0 ? targetWords : null,
                    length_words: 250,
                }),
            });

            if (!res.ok) throw new Error("Hikaye yüklenemedi");
            const data = await res.json();
            setStory(data);
        } catch (err: any) {
            alert("Hata: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenArchivedStory = (item: ProgressItem) => {
        // Önce hazır kütüphanede varsa doğrudan aç
        const foundInLibrary = FREE_LIBRARY_STORIES.find((s) => s.id === item.storyKey);
        if (foundInLibrary) {
            handleSelectFreeStory(foundInLibrary);
        } else {
            // Bulunamazsa seviyeye göre ilk hazır hikayeyi aç
            const fallback = FREE_LIBRARY_STORIES.find((s) => s.level.toLowerCase() === (item.level || "").toLowerCase()) || FREE_LIBRARY_STORIES[0];
            handleSelectFreeStory(fallback);
        }
    };

    const { mode } = useExperience();

    // Mod bazlı sıralama:
    // - academic: C1-C2 (Advanced) ve B1-B2 (Intermediate) akademik/bilimsel metinler en başta
    // - arcade: A1-A2 (Elementary) ve B1-B2 (Intermediate) sürükleyici hikayeler en başta
    const sortedStories = useMemo(() => {
        const stories = [...FREE_LIBRARY_STORIES];
        if (mode === "academic") {
            const levelOrder: Record<string, number> = {
                "advanced": 1,
                "intermediate": 2,
                "elementary": 3,
            };
            return stories.sort((a, b) => {
                const aRank = levelOrder[a.level.toLowerCase()] || 99;
                const bRank = levelOrder[b.level.toLowerCase()] || 99;
                return aRank - bRank;
            });
        } else {
            const levelOrder: Record<string, number> = {
                "elementary": 1,
                "intermediate": 2,
                "advanced": 3,
            };
            return stories.sort((a, b) => {
                const aRank = levelOrder[a.level.toLowerCase()] || 99;
                const bRank = levelOrder[b.level.toLowerCase()] || 99;
                return aRank - bRank;
            });
        }
    }, [mode]);

    const visibleStories = vitrinFilter === "ALL"
        ? sortedStories
        : sortedStories.filter(s => s.level.toLowerCase() === vitrinFilter.toLowerCase());

    const filterOptions = [
        { id: "ALL", label: t("filter_all", "Tümü") },
        { id: "Elementary", label: "A1-A2" },
        { id: "Intermediate", label: "B1-B2" },
        { id: "Advanced", label: "C1-C2" },
    ];

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-200">
            {!story ? (
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Sadece Seviye Filtre Hapları: [ Tümü ] [ A1-A2 ] [ B1-B2 ] [ C1-C2 ] */}
                    <div className="flex flex-wrap items-center gap-2 pb-1">
                        {filterOptions.map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setVitrinFilter(btn.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                                    vitrinFilter === btn.id
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* 15 Hikayelik Izgara (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {visibleStories.map((item) => {
                            const isCompleted = completedStories.some((c) => c.storyKey === item.id);
                            return (
                                <div
                                    key={item.id}
                                    className="bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/50 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between shadow-lg relative group hover:-translate-y-0.5"
                                >
                                    <div className="space-y-3">
                                        {/* Seviye Hapı & Kelime Sayısı */}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                                                    item.level === "Elementary"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                        : item.level === "Intermediate"
                                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                        : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                                }`}
                                            >
                                                {item.level === "Elementary"
                                                    ? "A1 - A2"
                                                    : item.level === "Intermediate"
                                                    ? "B1 - B2"
                                                    : "C1 - C2"}
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-mono">
                                                {item.wordCount.replace("Kelime", t("words_label", "Kelime"))}
                                            </span>
                                        </div>

                                        {/* Başlık ve Kısa Açıklama */}
                                        <div>
                                            <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                                {getStoryDescription(item.id, currentLang as Language, item.desc)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Eylem Butonları */}
                                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2">
                                        <button
                                            onClick={() => handleSelectFreeStory(item)}
                                            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-95 transition-all duration-150 cursor-pointer"
                                        >
                                            <span>{isCompleted ? t("btn_read_again", "Tekrar Oku") : t("btn_read_now", "Hemen Oku")}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onShareStory) {
                                                    onShareStory(item);
                                                } else {
                                                    setShareStoryModal(item);
                                                }
                                            }}
                                            title={t("btn_share", "Paylaş")}
                                            className="py-2.5 px-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 border border-slate-700/60 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-300 text-xs flex items-center justify-center transition cursor-pointer"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* BÖLÜM 2: YAPAY ZEKÂ İLE ÖZEL HİKAYE ÜRETİCİ */}
                            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                                    <Wand2 className="w-5 h-5 text-indigo-400" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{t("ai_story_title", "Yapay Zekâ ile Özgün Hikaye Üret")}</h3>
                                        <p className="text-xs text-slate-400">{t("ai_story_desc", "15 hazır hikayenin haricinde, dilediğiniz konuda sınırsız yeni hikayeler üretebilirsiniz.")}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                                            {t("step_cefr", "1. CEFR SEVİYESİ")}
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            {[
                                                { id: "Elementary", label: "Elementary", sub: "A1 - A2" },
                                                { id: "Intermediate", label: "Intermediate", sub: "B1 - B2" },
                                                { id: "Advanced", label: "Advanced", sub: "C1 - C2" },
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setLevel(item.id)}
                                                    className={`p-3 rounded-2xl border text-center transition ${level === item.id
                                                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30"
                                                            : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                                                        }`}
                                                >
                                                    <div className="font-bold text-sm text-white">{item.label}</div>
                                                    <div className="text-[11px] text-slate-400">{item.sub}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                                            {t("step_theme", "2. HİKAYE TEMASI")}
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {predefinedTopics.map((top) => (
                                                <button
                                                    key={top}
                                                    type="button"
                                                    onClick={() => {
                                                        setTopic(top);
                                                        setCustomTopic("");
                                                    }}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${topic === top && !customTopic
                                                            ? "bg-indigo-600 text-white border-indigo-500"
                                                            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                                        }`}
                                                >
                                                    {top}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={t("theme_placeholder", "Veya dilediğin özel konuyu yaz (Örn: Mars keşfi, Dedektif öyküsü)...")}
                                            value={customTopic}
                                            onChange={(e) => setCustomTopic(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            {t("step_words", "3. HİKAYEDE GEÇMESİNİ İSTEDİĞİN KELİMELER (İSTEĞE BAĞLI)")}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t("words_placeholder", "Örn: mitigate, resilient, allocate (Virgülle ayırın)")}
                                            value={targetWordsInput}
                                            onChange={(e) => setTargetWordsInput(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGenerateStory}
                                    disabled={loading}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition disabled:opacity-50 active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> {t("loading", "Yükleniyor...")}
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5" /> {t("btn_generate_story", "Özel Hikaye Oluştur")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
            ) : (
                <div className="space-y-4">
                    <StoryReader
                        key={story.id || story.title}
                        story={story}
                        decks={decks}
                        selectedDeckId={selectedDeckId}
                        onShareStory={(s) => onShareStory ? onShareStory(s) : setShareStoryModal(s)}
                        onBackToLibrary={() => {
                            setStory(null);
                            loadSavedProgress();
                            if (onBack) onBack();
                        }}
                        onCompleteStory={(sKey) => {
                            loadSavedProgress();
                            if (onCompleteStory) onCompleteStory(sKey);
                        }}
                    />
                </div>
            )}

            {shareStoryModal && (
                <ShareModal
                    isOpen={!!shareStoryModal}
                    onClose={() => setShareStoryModal(null)}
                    title={shareStoryModal.title}
                    itemType="story"
                    itemId={shareStoryModal.id || `story_${shareStoryModal.title}`}
                    story={shareStoryModal}
                />
            )}
        </div>
    );
}