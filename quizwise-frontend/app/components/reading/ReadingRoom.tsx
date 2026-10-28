"use client";

import React, { useState, useEffect, useMemo } from "react";
import StoryReader from "./StoryReader";
import ShareModal from "../ShareModal";
import StoryCarouselGallery from "./StoryCarouselGallery";
import StoryGeneratorModal from "./StoryGeneratorModal";
import { CURATED_STORIES_CATALOG, getStoryById, CuratedStory } from "../../data/stories";
import { useUserStories } from "../../context/UserStoriesContext";
import { autoAssignCover } from "../../utils/autoCover";
import { useTranslation, useLanguage, Language } from "../../context/LanguageContext";
import { useExperience } from "../../context/ExperienceContext";
import { ALL_CAREER_HUBS } from "../../data/careerHubs";
import {
    BookOpen,
    Sparkles,
    Loader2,
    Clock,
    CheckCircle2,
    BookMarked,
    ArrowRight,
    Share2,
    X,
    FileText,
    Layers,
    Compass,
    Archive,
    Check,
    Play,
    RotateCw,
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

export interface ProgressItem {
    storyKey: string;
    title: string;
    level: string;
    topic: string;
    lastParagraph: number;
    lastPage?: number;
    totalPages?: number;
    status: "in_progress" | "completed";
    updatedAt: number;
    contentSnippet?: string;
}

export interface LibraryStoryItem {
    id: string;
    title: string;
    level: string;
    cefr?: string;
    topic: string;
    desc: string;
    wordCount: string;
    target_words: string[];
    content: string;
    coverImage?: string;
    isUserStory?: boolean;
    target_vocabulary: Array<{
        word: string;
        phonetic?: string;
        turkish_meaning: string;
        context_sentence?: string;
    }>;
    comprehension_questions: Array<{
        question: string;
        options: string[];
        correct_answer_index: number;
    }>;
    isCareerCase?: boolean;
}

// 15 ADET ÜCRETSİZ & KOTASIZ HAZIR HİKAYE
const FREE_LIBRARY_STORIES: LibraryStoryItem[] = [
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
            { word: "pocket", phonetic: "/ˈpɒk.ɪt/", turkish_meaning: "cep" },
        ],
        comprehension_questions: [
            { question: "Where did Leo go in the morning?", options: ["A) Supermarket", "B) The park", "C) School", "D) Train station"], correct_answer_index: 1 },
            { question: "What animal did the dog bark at?", options: ["A) Cat", "B) Duck", "C) Squirrel", "D) Rabbit"], correct_answer_index: 2 },
            { question: "What fruit did Leo eat?", options: ["A) Apple", "B) Banana", "C) Orange", "D) Peach"], correct_answer_index: 2 },
        ],
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
            { word: "crispy", phonetic: "/ˈkrɪs.pi/", turkish_meaning: "çıtır, gevrek" },
        ],
        comprehension_questions: [
            { question: "At what time does Thomas start baking?", options: ["A) 7:00 AM", "B) 5:00 AM", "C) 9:00 AM", "D) Midnight"], correct_answer_index: 1 },
            { question: "What is his secret ingredient?", options: ["A) Olive oil", "B) Mountain honey", "C) Cinnamon", "D) Chocolate"], correct_answer_index: 1 },
            { question: "Who buys the bread for her grandmother?", options: ["A) Sarah", "B) Thomas", "C) Maya", "D) Emily"], correct_answer_index: 2 },
        ],
    },
    {
        id: "elem-3",
        title: "The Lost Key in the Library",
        level: "Elementary",
        cefr: "A1 - A2",
        topic: "Mystery & Books",
        desc: "Kütüphanede astronomi kitapları ararken antik bir bronz anahtar bulan Sam.",
        wordCount: "~140 Kelime",
        target_words: ["library", "bookshelf", "bronze", "curious"],
        content: (
            "Sam loved visiting the quiet town library every Saturday afternoon. " +
            "He was looking for a book about planets and distant galaxies. " +
            "Between two thick history encyclopedias on the lowest bookshelf, something metallic sparkled. " +
            "It was a small, ornate bronze key tied to a weathered green velvet ribbon. " +
            "Curious and excited, Sam carried the mystery key directly to the librarian's desk."
        ),
        target_vocabulary: [
            { word: "library", phonetic: "/ˈlaɪ.brər.i/", turkish_meaning: "kütüphane" },
            { word: "bookshelf", phonetic: "/ˈbʊk.ʃelf/", turkish_meaning: "kitaplık rafı" },
            { word: "bronze", phonetic: "/brɒnz/", turkish_meaning: "bronz" },
            { word: "curious", phonetic: "/ˈkjʊə.ri.əs/", turkish_meaning: "meraklı" },
        ],
        comprehension_questions: [
            { question: "What topic was Sam looking for?", options: ["A) Cooking", "B) Planets and galaxies", "C) Cars", "D) Gardening"], correct_answer_index: 1 },
            { question: "Where was the bronze key hidden?", options: ["A) Under the desk", "B) In his pocket", "C) Between two encyclopedias", "D) Near the door"], correct_answer_index: 2 },
            { question: "What color was the velvet ribbon?", options: ["A) Red", "B) Green", "C) Blue", "D) Yellow"], correct_answer_index: 1 },
        ],
    },

    // ==================== INTERMEDIATE (B1 - B2) ====================
    {
        id: "inter-1",
        title: "The Antique Clockmaker's Secret",
        level: "Intermediate",
        cefr: "B1 - B2",
        topic: "Mystery & Craft",
        desc: "Büyükbabanın antika saatinin gece yarısı çalmasıyla çözülen şaşırtıcı aile gizemi.",
        wordCount: "~210 Kelime",
        target_words: ["intricate", "mechanism", "chime", "compartment"],
        content: (
            "Nestled in the cobbled alleyway of old Vienna, Julian worked tirelessly inside his late grandfather's horology workshop. " +
            "Among dozens of ticking grandfather clocks, one specific mahogany pendulum timepiece had remained silent for decades. " +
            "One stormy midnight, the silent clock suddenly released a resonant chime that echoed across the rafters. " +
            "Investigating the intricate brass mechanism, Julian discovered a concealed wooden compartment behind the escapement gear. " +
            "Inside lay a hand-drawn map of the Danube valley alongside a heartfelt letter dated October 1948."
        ),
        target_vocabulary: [
            { word: "intricate", phonetic: "/ˈɪn.trɪ.kət/", turkish_meaning: "karmaşık, girift" },
            { word: "mechanism", phonetic: "/ˈmek.ə.nɪ.zəm/", turkish_meaning: "mekanizma" },
            { word: "chime", phonetic: "/tʃaɪm/", turkish_meaning: "çan sesi, çalmak" },
            { word: "compartment", phonetic: "/kəmˈpɑːt.mənt/", turkish_meaning: "bölme, gizli göz" },
        ],
        comprehension_questions: [
            { question: "In which city is the workshop situated?", options: ["A) Berlin", "B) Vienna", "C) Zurich", "D) Prague"], correct_answer_index: 1 },
            { question: "What happened to the mahogany clock at midnight?", options: ["A) It broke into pieces", "B) It released a resonant chime", "C) It stopped completely", "D) It caught fire"], correct_answer_index: 1 },
            { question: "What was hidden behind the escapement gear?", options: ["A) Gold coins", "B) A hand-drawn map and letter", "C) An emerald necklace", "D) Spare clock parts"], correct_answer_index: 1 },
        ],
    },
    {
        id: "inter-2",
        title: "Graphene: The Superconductor Frontier",
        level: "Intermediate",
        cefr: "B1 - B2",
        topic: "Technology & Science",
        desc: "Mikroçiplerdeki aşırı ısınma problemini grafen mimarisiyle çözen genç mühendisin başarısı.",
        wordCount: "~220 Kelime",
        target_words: ["conductive", "dissipate", "nanoscale", "thermal"],
        content: (
            "Modern microprocessors generate immense thermal energy as transistors shrink to atomic scales. " +
            "Conventional copper interconnects struggle to dissipate heat efficiently, leading to thermal throttling and high failure rates. " +
            "Dr. Elena Vance proposed integrating single-atom-thick graphene layers as nanoscale thermal heat spreaders. " +
            "Because graphene possesses extraordinary electrical and conductive attributes, it reduced peak junction temperatures by eighteen percent. " +
            "This breakthrough opens new frontiers for quantum computing architecture and sustainable data center operations."
        ),
        target_vocabulary: [
            { word: "conductive", phonetic: "/kənˈdʌk.tɪv/", turkish_meaning: "iletken" },
            { word: "dissipate", phonetic: "/ˈdɪs.ɪ.peɪt/", turkish_meaning: "dağıtmak, yaymak" },
            { word: "nanoscale", phonetic: "/ˈnæn.əʊ.skeɪl/", turkish_meaning: "nano-ölçekli" },
            { word: "thermal", phonetic: "/ˈθɜː.məl/", turkish_meaning: "termal, ısısal" },
        ],
        comprehension_questions: [
            { question: "What major challenge do modern microprocessors face?", options: ["A) Low memory", "B) Immense thermal energy and heat", "C) Large physical size", "D) Lack of electricity"], correct_answer_index: 1 },
            { question: "What material did Dr. Elena Vance integrate?", options: ["A) Titanium", "B) Graphene layers", "C) Synthetic plastic", "D) Liquid nitrogen"], correct_answer_index: 1 },
            { question: "By what percentage did junction temperatures drop?", options: ["A) 5%", "B) 10%", "C) 18%", "D) 50%"], correct_answer_index: 2 },
        ],
    },

    // ==================== ADVANCED (C1 - C2) ====================
    {
        id: "adv-1",
        title: "The Epistemic Architecture of Machine Volition",
        level: "Advanced",
        cefr: "C1 - C2",
        topic: "Cognitive Science & AI",
        desc: "Yapay zekâ, bilinç, insan iradesi ve zihin felsefesi üzerine derin ve akademik bir okuma.",
        wordCount: "~280 Kelime",
        target_words: ["volition", "epistemic", "deterministic", "ubiquitous"],
        content: (
            "Philosophical investigations into artificial volition increasingly interrogate the boundaries between biological consciousness and algorithmic deterministic computation. " +
            "Contemporary neural architectures display emergent heuristics that mimic intentional decision-making paradigms. " +
            "Yet, critics argue that computational syntax alone cannot generate true epistemic comprehension or intrinsic subjective agency. " +
            "As autonomous agentic systems become ubiquitous across clinical and financial domains, resolving whether machine intentionality constitutes genuine volition or sophisticated mimicry remains paramount."
        ),
        target_vocabulary: [
            { word: "volition", phonetic: "/vəˈlɪʃ.ən/", turkish_meaning: "irade, bilinçli seçim" },
            { word: "epistemic", phonetic: "/ˌep.ɪˈstiː.mɪk/", turkish_meaning: "bilgisel, epistemik" },
            { word: "deterministic", phonetic: "/dɪˌtɜː.mɪˈnɪs.tɪk/", turkish_meaning: "belirlenimci, nedensel" },
            { word: "ubiquitous", phonetic: "/juːˈbɪk.wɪ.təs/", turkish_meaning: "her yerde bulunan, çok yaygın" },
        ],
        comprehension_questions: [
            { question: "What boundary does the text critically interrogate?", options: ["A) Hardware vs software speed", "B) Biological consciousness vs algorithmic computation", "C) Silicon costs vs copper", "D) Cloud servers vs edge devices"], correct_answer_index: 1 },
            { question: "What do critics contend regarding computational syntax?", options: ["A) It is too slow", "B) It cannot alone generate true epistemic comprehension", "C) It requires no electricity", "D) It is already sentient"], correct_answer_index: 1 },
            { question: "Why is resolving machine intentionality considered paramount?", options: ["A) Because autonomous systems are becoming ubiquitous", "B) To lower taxes", "C) To stop computing research", "D) Because robots build houses"], correct_answer_index: 0 },
        ],
    },
    {
        id: "adv-2",
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
            { word: "reverberate", phonetic: "/rɪˈvɜː.bər.eɪt/", turkish_meaning: "yankılanmak" },
        ],
        comprehension_questions: [
            { question: "What phrase did Einstein use?", options: ["A) Cosmic symmetry", "B) Spooky action at a distance", "C) Universal harmony", "D) Singularity"], correct_answer_index: 1 },
            { question: "What concept does entanglement challenge?", options: ["A) Thermodynamics", "B) Local realism and causality", "C) Charge", "D) Orbits"], correct_answer_index: 1 },
            { question: "What do modern experiments demonstrate?", options: ["A) Illusion", "B) Instantaneous correlation of paired states", "C) Variable light", "D) Zero energy"], correct_answer_index: 1 },
        ],
    },
];

// MESLEKİ VAKA ANALİZLERİNDEN ÜRETİLEN OKUMA METİNLERİ
const CAREER_CASE_STORIES: LibraryStoryItem[] = ALL_CAREER_HUBS.map((hub) => ({
    id: `case_${hub.key}`,
    title: hub.readingCase.title,
    level: "Advanced",
    cefr: "C1 Mesleki",
    topic: hub.titleDefault,
    desc: hub.readingCase.snippet,
    wordCount: `~${hub.readingCase.fullText.split(/\s+/).length} Kelime`,
    target_words: hub.cards.slice(0, 4).map((c) => c.word),
    content: hub.readingCase.fullText,
    isCareerCase: true,
    target_vocabulary: hub.cards.slice(0, 4).map((c) => ({
        word: c.word,
        phonetic: c.phonetic,
        turkish_meaning: c.meaning,
        context_sentence: c.exampleEn,
    })),
    comprehension_questions: [
        {
            question: `What is the core strategic focus of this case in ${hub.titleDefault}?`,
            options: [
                "A) Ad-hoc cost cutting without analysis",
                "B) Systematic evaluation, compliance and rigorous optimization",
                "C) Total reliance on intuition without documentation",
                "D) Postponing stakeholder review indefinitely",
            ],
            correct_answer_index: 1,
        },
        {
            question: "Which of the following principles is strongly emphasized in this case?",
            options: [
                "A) Ignoring contractual or operational variances",
                "B) Proactive risk mitigation and evidence-based decision making",
                "C) Discontinuing quality assurance processes",
                "D) Bypassing audit milestones",
            ],
            correct_answer_index: 1,
        },
        {
            question: "How does thorough terminological precision benefit professionals in this domain?",
            options: [
                "A) It creates unnecessary overhead",
                "B) It ensures unambiguous cross-border communication and technical clarity",
                "C) It replaces technical calculations",
                "D) It eliminates the need for contracts",
            ],
            correct_answer_index: 1,
        },
    ],
}));

// TÜM METİNLERİN BİRLEŞİMİ (Genel Hikayeler + Mesleki Vaka Analizleri)
const ALL_LIBRARY_ITEMS: LibraryStoryItem[] = [
    ...FREE_LIBRARY_STORIES,
    ...CAREER_CASE_STORIES,
];

const PRESET_SNIPPETS = [
    {
        label: "📰 The Economist",
        title: "The Architecture of Deep Focus (The Economist)",
        text: "In an era dominated by relentless digital interruptions, the ability to cultivate sustained focus has emerged as an indispensable cognitive asset. Knowledge workers worldwide struggle against fragmented attention spans, frequently falling prey to ephemeral notifications and shallow tasks. Cognitive researchers substantiate that deep focus requires deliberate friction against cognitive fatigue.",
    },
    {
        label: "🌍 BBC",
        title: "Global Supply Chains and Everyday Economy (BBC)",
        text: "Modern international trade is undergoing a profound structural transformation. Decades of prioritizing cost efficiency over systemic resilience exposed severe bottlenecks during global disruptions. Consequently, multinational corporations are actively diversifying supplier networks, transitioning from precarious single-source dependencies to robust regionalized ecosystems.",
    },
    {
        label: "🔬 Nature",
        title: "Neuroscience of Memory & Spaced Repetition (Nature)",
        text: "Human memory is not a static recording device; rather, it is a dynamic neural system governed by the Ebbinghaus forgetting curve. Without active reinforcement, our brains prune newly acquired vocabulary at an exponential rate within forty-eight hours. Spaced repetition algorithms strategically schedule flashcard reviews right at the critical juncture of forgetting.",
    },
];

export default function ReadingRoom({
    decks,
    selectedDeckId,
    initialStory,
    onBack,
    onShareStory,
    onCompleteStory,
}: ReadingRoomProps) {
    const { t, currentLang } = useTranslation();
    const { userStories } = useUserStories();

    // 1. KÜTÜPHANE 3 ANA SEKME STATE'İ: 'explore' | 'in_progress' | 'completed'
    const [activeTab, setActiveTab] = useState<"explore" | "in_progress" | "completed">("explore");


    // Okunan Hikaye State'i (null ise kütüphane gösterilir, dolu ise Dual-Reader açılır)
    const [story, setStory] = useState<any | null>(null);
    const [shareStoryModal, setShareStoryModal] = useState<any | null>(null);

    // Kendi Metnini Yapıştır Modalı State'i
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [pasteText, setPasteText] = useState("");
    const [pasteTitle, setPasteTitle] = useState("");

    // Yapay Zekâ ile Hikaye Üret Modalı State'i
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

    // İlerleme Listesi (localStorage: quizwise_progress_...)
    const [progressList, setProgressList] = useState<ProgressItem[]>([]);

    const loadSavedProgress = () => {
        try {
            const items: ProgressItem[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("quizwise_progress_")) {
                    const val = localStorage.getItem(key);
                    if (val) {
                        try {
                            items.push(JSON.parse(val));
                        } catch {}
                    }
                }
            }
            items.sort((a, b) => b.updatedAt - a.updatedAt);
            setProgressList(items);
        } catch (e) {
            console.error("Progress yüklenemedi:", e);
        }
    };

    useEffect(() => {
        loadSavedProgress();
    }, [story]);

    // Initial story veya session kontrolü
    useEffect(() => {
        if (initialStory) {
            setStory(initialStory);
            return;
        }

        if (typeof window !== "undefined") {
            const pendingText = sessionStorage.getItem("vocaship_pending_reading_text");
            const pendingTitle = sessionStorage.getItem("vocaship_pending_reading_title");
            if (pendingText) {
                sessionStorage.removeItem("vocaship_pending_reading_text");
                sessionStorage.removeItem("vocaship_pending_reading_title");
                handleLaunchCustomReader(pendingText, pendingTitle || "Özel Okuma Metni");
            }
        }
    }, [initialStory]);

    const inProgressStories = progressList.filter((p) => p.status === "in_progress");
    const completedStories = progressList.filter((p) => p.status === "completed");

    // Seçilen hikayeyi aç
    const handleSelectStory = (item: LibraryStoryItem) => {
        setStory({
            id: item.id,
            title: item.title,
            level: item.level,
            topic: item.topic,
            content: item.content,
            target_vocabulary: item.target_vocabulary,
            comprehension_questions: item.comprehension_questions,
        });
    };

    // Kaldığı yerden veya arşivden hikaye aç
    const handleOpenFromProgress = (pItem: ProgressItem) => {
        const foundCurated = getStoryById(pItem.storyKey);
        if (foundCurated) {
            handleSelectStory({
                id: foundCurated.id,
                title: foundCurated.title,
                level: foundCurated.level,
                cefr: foundCurated.cefr,
                topic: foundCurated.topic,
                desc: foundCurated.desc,
                wordCount: `${foundCurated.wordCount} Kelime`,
                target_words: foundCurated.target_words,
                content: foundCurated.content,
                target_vocabulary: foundCurated.target_vocabulary,
                comprehension_questions: foundCurated.comprehension_questions,
                isCareerCase: foundCurated.isCareerCase,
            });
            return;
        }

        const foundUserStory = userStories.find((s) => s.id === pItem.storyKey);
        if (foundUserStory) {
            handleSelectStory({
                id: foundUserStory.id,
                title: foundUserStory.title,
                level: foundUserStory.level,
                cefr: foundUserStory.cefr || foundUserStory.level || "B1",
                topic: foundUserStory.topic,
                desc: foundUserStory.desc || "",
                wordCount: typeof foundUserStory.wordCount === "number" ? `${foundUserStory.wordCount} Kelime` : foundUserStory.wordCount || "150 Kelime",
                target_words: foundUserStory.target_words || [],
                content: foundUserStory.content,
                coverImage: foundUserStory.coverImage,
                isUserStory: true,
                target_vocabulary: foundUserStory.target_vocabulary || [],
                comprehension_questions: (foundUserStory.comprehension_questions || []).map((q) => ({
                    question: q.question,
                    options: q.options,
                    correct_answer_index: q.correct_answer_index ?? q.correct_index ?? 0,
                })),
            });
            return;
        }

        const found = ALL_LIBRARY_ITEMS.find((s) => s.id === pItem.storyKey);
        if (found) {
            handleSelectStory(found);
        } else {
            // Serbest metin veya fallback
            handleLaunchCustomReader(pItem.contentSnippet || "Örnek metin", pItem.title);
        }
    };

    // Kendi metnini yapıştırıp açma
    const handleLaunchCustomReader = (text?: string, title?: string) => {
        const finalContent = (text || pasteText).trim();
        const finalTitle = (title || pasteTitle).trim() || "Özel Çözümlenen Metin";
        if (!finalContent) return;

        // Otomatik kelime çıkarma
        const sampleTokens = finalContent
            .split(/\s+/)
            .map((w) => w.replace(/[^a-zA-Z]/g, ""))
            .filter((w) => w.length >= 6)
            .slice(0, 4);

        const autoCoverImg = autoAssignCover({
            title: finalTitle,
            topic: "Özel Analiz",
            content: finalContent,
        });

        const customStory: LibraryStoryItem & { coverImage?: string; isUserStory?: boolean } = {
            id: `custom_${Date.now()}`,
            title: finalTitle,
            level: "Advanced",
            cefr: "C1 Serbest",
            topic: "Özel Analiz",
            desc: finalContent.slice(0, 120) + "...",
            wordCount: `~${finalContent.split(/\s+/).length} Kelime`,
            target_words: sampleTokens,
            content: finalContent,
            coverImage: autoCoverImg,
            isUserStory: true,
            target_vocabulary: sampleTokens.map((w) => ({
                word: w.toLowerCase(),
                phonetic: "",
                turkish_meaning: "Detay görmek için tıklayın",
            })),
            comprehension_questions: [
                {
                    question: "Bu metnin ana düşüncesi nedir?",
                    options: [
                        "A) Metinde aktarılan temel argüman ve çözümlemeler",
                        "B) Konuyla ilgisiz ikincil bir gözlem",
                        "C) Yalnızca teknik bir detay",
                        "D) Karşıt bir hipotez",
                    ],
                    correct_answer_index: 0,
                },
                {
                    question: "Metinde savunulan yaklaşımın temel gerekçesi nedir?",
                    options: [
                        "A) Kanıta dayalı ve analitik gerekçelendirme",
                        "B) Rastgele varsayımlar",
                        "C) Tarihsel bir yanılgı",
                        "D) Yetersiz veri",
                    ],
                    correct_answer_index: 0,
                },
            ],
        };

        setPasteText("");
        setPasteTitle("");
        setIsPasteModalOpen(false);
        setStory(customStory);
    };


    return (
        <div className="w-full space-y-6 animate-in fade-in duration-200 overflow-x-hidden">
            {!story ? (
                /* ========================================================================= */
                /* KÜTÜPHANE GÖRÜNÜMÜ                                                        */
                /* ========================================================================= */
                <div className="space-y-6">
                    {/* Üst Bar: Başlık + [ ✨ Yapay Zekâ ile Hikaye Üret ] + [ ✍️ Kendi Metnini Yapıştır ] */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                                <span>📖</span>
                                <span>{t("nav_reading", "Okuma Odası")}</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400">
                                {t("reading_subtitle", "Bağlamsal metin çözümleme, seviyeli okumalar ve mesleki vaka analizleri")}
                            </p>
                        </div>

                        {/* Aksiyon Butonları */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                            <button
                                type="button"
                                onClick={() => setIsGeneratorModalOpen(true)}
                                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer shrink-0"
                            >
                                <Sparkles className="w-4 h-4 text-amber-200" />
                                <span>{t("reading_generate_ai", "Yapay Zekâ ile Hikaye Üret")}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsPasteModalOpen(true)}
                                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer shrink-0"
                            >
                                <span>✍️</span>
                                <span>{t("reading_paste_text", "Metin Yapıştır")}</span>
                            </button>
                        </div>
                    </div>

                    {/* 1. KÜTÜPHANE 3 ANA SEKME DÜZENİ */}
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
                        <button
                            type="button"
                            onClick={() => setActiveTab("explore")}
                            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                                activeTab === "explore"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            }`}
                        >
                            <span>📚</span>
                            <span>{t("reading_tab_explore", "Keşfet")}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/60 text-slate-300 font-bold">
                                {CURATED_STORIES_CATALOG.length + userStories.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("in_progress")}
                            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                                activeTab === "in_progress"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            }`}
                        >
                            <span>⏳</span>
                            <span>{t("reading_tab_in_progress", "Devam Edenler")}</span>
                            {inProgressStories.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                                    {inProgressStories.length}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("completed")}
                            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                                activeTab === "completed"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            }`}
                        >
                            <span>✅</span>
                            <span>{t("reading_tab_completed", "Arşivim")}</span>
                            {completedStories.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                                    {completedStories.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ========================================================================= */}
                    {/* SEKME 1: [ 📚 KEŞFET ] - 120 Statik + Kullanıcı Özel Hikayeleri            */}
                    {/* ========================================================================= */}
                    {activeTab === "explore" && (
                        <StoryCarouselGallery
                            onSelectStory={(curated: CuratedStory | any) => {
                                handleSelectStory({
                                    id: curated.id,
                                    title: curated.title,
                                    level: curated.level,
                                    cefr: curated.cefr,
                                    topic: curated.topic,
                                    desc: curated.desc,
                                    wordCount: typeof curated.wordCount === "number" ? `${curated.wordCount} Kelime` : curated.wordCount || "150 Kelime",
                                    target_words: curated.target_words,
                                    content: curated.content,
                                    target_vocabulary: curated.target_vocabulary,
                                    comprehension_questions: curated.comprehension_questions,
                                    isCareerCase: curated.isCareerCase,
                                    coverImage: curated.coverImage,
                                    isUserStory: curated.isUserStory,
                                });
                            }}
                            completedStoryIds={completedStories.map((c) => c.storyKey)}
                            inProgressStoryIds={inProgressStories.map((p) => p.storyKey)}
                            onCreateNewStory={() => setIsGeneratorModalOpen(true)}
                        />
                    )}

                    {/* ========================================================================= */}
                    {/* SEKME 2: [ ⏳ DEVAM EDENLER ]                                             */}
                    {/* ========================================================================= */}
                    {activeTab === "in_progress" && (
                        <div className="space-y-4">
                            {inProgressStories.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
                                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-2xl">
                                        ⏳
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-200">
                                        Yarım kalan bir okumanız bulunmuyor
                                    </h3>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Keşfet sekmesinden yeni bir hikaye veya vaka analizine başlayarak okuma odasında ilerleyebilirsiniz.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("explore")}
                                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                                    >
                                        <span>Metinleri Keşfet</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {inProgressStories.map((item) => {
                                        const totalP = item.totalPages || 3;
                                        const currentP = (item.lastPage ?? item.lastParagraph ?? 0) + 1;
                                        const percent = Math.min(100, Math.round((currentP / totalP) * 100));

                                        return (
                                            <div
                                                key={item.storyKey}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition shadow-sm"
                                            >
                                                <div className="space-y-2 flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2.5">
                                                        <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold font-mono">
                                                            {item.level || "Orta"}
                                                        </span>
                                                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                                                            {item.title}
                                                        </h3>
                                                    </div>

                                                    {/* Sayfa Göstergesi & İlerleme Barı */}
                                                    <div className="space-y-1 max-w-md">
                                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                                            <span>Kaldığınız Yer: Sayfa {currentP} / {totalP}</span>
                                                            <span className="text-indigo-400 font-mono font-bold">%{percent}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenFromProgress(item)}
                                                    className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer shrink-0"
                                                >
                                                    <Play className="w-3.5 h-3.5 fill-current" />
                                                    <span>Okumaya Devam Et</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* SEKME 3: [ ✅ ARŞİVİM ]                                                   */}
                    {/* ========================================================================= */}
                    {activeTab === "completed" && (
                        <div className="space-y-4">
                            {completedStories.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
                                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-2xl">
                                        📚
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-200">
                                        Henüz tamamlanan bir metniniz yok
                                    </h3>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Bir okumayı bitirdiğinizde 'Hikayeyi Bitirdim' butonuna basarak arşive ekleyebilirsiniz.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("explore")}
                                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                                    >
                                        <span>Metinleri Keşfet</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {completedStories.map((item) => (
                                        <div
                                            key={item.storyKey}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition shadow-sm"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center space-x-2.5">
                                                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        <span>Tamamlandı</span>
                                                    </span>
                                                    <h3 className="text-sm sm:text-base font-bold text-white">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    Kategori: {item.topic || "Genel"} • Seviye: {item.level || "C1"}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleOpenFromProgress(item)}
                                                className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer shrink-0"
                                            >
                                                <RotateCw className="w-3.5 h-3.5" />
                                                <span>Yeniden Oku</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* ========================================================================= */
                /* DUAL-READER ÇALIŞMA ALANI (StoryReader)                                   */
                /* ========================================================================= */
                <StoryReader
                    key={story.id || story.title}
                    story={story}
                    decks={decks}
                    selectedDeckId={selectedDeckId}
                    onShareStory={(s) => (onShareStory ? onShareStory(s) : setShareStoryModal(s))}
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
            )}

            {/* ========================================================================= */}
            {/* KENDİ METNİNİ YAPIŞTIR MODALI                                             */}
            {/* ========================================================================= */}
            {isPasteModalOpen && (
                <div
                    onClick={() => setIsPasteModalOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 sm:p-7 shadow-2xl shadow-indigo-950/60 space-y-5 animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center space-x-2.5">
                                <span className="text-xl">✍️</span>
                                <div>
                                    <h3 className="text-base font-bold text-white">
                                        Kendi Metnini Yapıştır
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Makale, haber veya vaka metninizi Dual-Reader ile inceleyin
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPasteModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Metin Başlığı (İsteğe Bağlı)..."
                                value={pasteTitle}
                                onChange={(e) => setPasteTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />

                            <textarea
                                rows={8}
                                placeholder="İngilizce metninizi buraya yapıştırın..."
                                value={pasteText}
                                onChange={(e) => setPasteText(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                            />

                            {/* Örnek Parçacıklar */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-[11px] text-slate-400">Örnekler:</span>
                                {PRESET_SNIPPETS.map((snippet) => (
                                    <button
                                        key={snippet.label}
                                        type="button"
                                        onClick={() => {
                                            setPasteText(snippet.text);
                                            setPasteTitle(snippet.title);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                                    >
                                        {snippet.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsPasteModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                disabled={!pasteText.trim()}
                                onClick={() => handleLaunchCustomReader(pasteText, pasteTitle)}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
                            >
                                Metni Çözümle & Oku ➔
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* YAPAY ZEKÂ İLE ÖZGÜN HİKAYE ÜRET MODALI */}
            <StoryGeneratorModal
                isOpen={isGeneratorModalOpen}
                onClose={() => setIsGeneratorModalOpen(false)}
                onStoryGenerated={(newStory) => {
                    setStory(newStory);
                }}
                decks={decks}
            />

            {/* PAYLAŞIM MODALI */}
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