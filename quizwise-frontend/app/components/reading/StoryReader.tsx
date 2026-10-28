"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
const WordCardModal = dynamic(() => import("./WordCardModal"), { ssr: false });
import TargetVocabularyFlashcards from "./TargetVocabularyFlashcards";
import { useLanguage, useTranslation } from "../../context/LanguageContext";
import { useUserStories } from "../../context/UserStoriesContext";
import { useRouter } from "next/navigation";
import {
    Volume2,
    Square,
    Sparkles,
    CheckCircle,
    ArrowLeft,
    BookmarkCheck,
    Share2,
    HelpCircle,
    Check,
    X,
    Trophy,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Moon,
    Coffee,
    Sun,
    Mic,
} from "lucide-react";
import { API_BASE } from "../../config";

export type ReaderViewMode = "book" | "focus";
export type ReaderTheme = "dark" | "sepia" | "light";
export type ReaderFontFamily = "sans" | "serif";
export type ReaderFontSize = "base" | "lg" | "xl";

interface StoryData {
    id?: string;
    title: string;
    level: string;
    topic?: string;
    content: string;
    target_vocabulary?: Array<{
        word: string;
        phonetic?: string;
        turkish_meaning: string;
        context_sentence?: string;
    }>;
    comprehension_questions?: Array<{
        question: string;
        options: string[];
        correct_answer_index: number;
    }>;
    coverImage?: string;
    wordCount?: number | string;
    isUserStory?: boolean;
}

interface StoryReaderProps {
    story: StoryData;
    decks: Array<{ id: string; title: string }>;
    selectedDeckId: string;
    onBackToLibrary?: () => void;
    onCompleteStory?: (storyId: string) => void;
    onShareStory?: (story: StoryData) => void;
}

interface SentenceItem {
    globalIndex: number;
    text: string;
    paragraphIndex: number;
    tokens: string[];
}

interface BookPage {
    pageIndex: number;
    sentences: SentenceItem[];
    wordCount: number;
}

interface CleanQuestion {
    question: string;
    options: string[];
    correct_answer_index: number;
}

export default function StoryReader({
    story,
    decks,
    selectedDeckId,
    onBackToLibrary,
    onCompleteStory,
    onShareStory,
}: StoryReaderProps) {
    const { t } = useLanguage();
    const router = useRouter();

    const handleDebateStory = () => {
        if (typeof window !== "undefined") {
            const vocabList = Array.isArray(story.target_vocabulary)
                ? story.target_vocabulary.map((v) =>
                      typeof v === "string" ? v : v.word
                  )
                : [];

            const payload = {
                id: story.id,
                title: story.title,
                level: story.level,
                topic: story.topic || "",
                content: story.content,
                target_vocabulary: vocabList,
                full_vocabulary: story.target_vocabulary || [],
            };
            sessionStorage.setItem(
                "vocaship_active_story_context",
                JSON.stringify(payload)
            );
            router.push("/speaking?mode=story_debate");
        }
    };

    // Kullanıcı Hikayeleri Kaydetme & Toast
    const { saveUserStory, isStorySaved } = useUserStories();
    const [showSaveToast, setShowSaveToast] = useState(false);
    const isSaved = isStorySaved(story.id || story.title);

    const handleSaveToLibrary = () => {
        saveUserStory({
            id: story.id,
            title: story.title,
            level: story.level,
            topic: story.topic || "Özel Okuma",
            content: story.content,
            coverImage: story.coverImage,
            wordCount: story.wordCount,
            target_vocabulary: story.target_vocabulary,
            comprehension_questions: story.comprehension_questions,
            isUserStory: true,
        });
        setShowSaveToast(true);
        setTimeout(() => {
            setShowSaveToast(false);
        }, 3200);
    };

    // 1. DUAL-READER GÖRÜNÜM STATE'İ VE ANAHTARI ('book' | 'focus')
    const [readerMode, setReaderMode] = useState<ReaderViewMode>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("vocaship_reader_mode") || localStorage.getItem("vocaship_reader_view");
            if (saved === "book" || saved === "focus") return saved;
        }
        return "book";
    });
    const readerView = readerMode;
    const setReaderView = setReaderMode;

    // 2. Apple Books Tipografi & Tema State'leri
    const [readerTheme, setReaderTheme] = useState<ReaderTheme>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("vocaship_reader_theme");
            if (saved === "dark" || saved === "sepia" || saved === "light") return saved;
        }
        return "dark";
    });

    const [fontFamily, setFontFamily] = useState<ReaderFontFamily>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("vocaship_reader_font");
            if (saved === "sans" || saved === "serif") return saved;
        }
        return "sans";
    });

    const [fontSize, setFontSize] = useState<ReaderFontSize>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("vocaship_reader_size");
            if (saved === "base" || saved === "lg" || saved === "xl") return saved;
        }
        return "lg";
    });

    const [isTypoMenuOpen, setIsTypoMenuOpen] = useState(false);
    const typoMenuRef = useRef<HTMLDivElement>(null);

    // 3. Kitap Sayfalama & Cümle Bazlı Ses Takibi (Read-Along) State'leri
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
    const [playbackRate, setPlaybackRate] = useState<number>(1.0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    // Refs for safe async speech synthesis callbacks
    const isPlayingRef = useRef<boolean>(false);
    isPlayingRef.current = isPlaying;

    const activeSentenceIdxRef = useRef<number>(activeSentenceIdx);
    activeSentenceIdxRef.current = activeSentenceIdx;

    const playbackRateRef = useRef<number>(playbackRate);
    playbackRateRef.current = playbackRate;

    // Etkileşim & İlerleme State'leri
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [activeSentence, setActiveSentence] = useState<string>("");
    const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
    const [lastReadParagraph, setLastReadParagraph] = useState<number>(0);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

    // Paragraf referansları (kaldığı yere scroll yapmak için)
    const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

    // Hikaye ID'si (yoksa başlıktan üretelim)
    const storyKey = story.id || `story_${story.title.toLowerCase().replace(/\s+/g, "_")}`;

    const paragraphs = useMemo(() => {
        return story.content.split("\n").filter((p) => p.trim().length > 0);
    }, [story.content]);

    // Tüm hikayeyi sıralı cümle havuzuna dönüştür
    const allSentences = useMemo<SentenceItem[]>(() => {
        const list: SentenceItem[] = [];
        let globalCounter = 0;

        paragraphs.forEach((para, pIdx) => {
            const raw = para
                .split(/(?<=[.!?…])\s+/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            raw.forEach((st) => {
                const tokens = st.split(/\s+/).filter((t) => t.length > 0);
                list.push({
                    globalIndex: globalCounter++,
                    text: st,
                    paragraphIndex: pIdx,
                    tokens,
                });
            });
        });

        return list;
    }, [paragraphs]);

    // Kitap Modu: Metni anlamlı 100-140 kelimelik sayfalara böl
    const pages = useMemo<BookPage[]>(() => {
        if (allSentences.length === 0) return [];
        const result: BookPage[] = [];
        let curSentences: SentenceItem[] = [];
        let curWordCount = 0;

        for (const sent of allSentences) {
            const sWords = sent.tokens.length;
            // 85 kelimeyi geçtiyse ve bu cümle eklenince 135 kelime aşılıyorsa yeni sayfaya geç
            if (curSentences.length > 0 && curWordCount >= 85 && curWordCount + sWords > 135) {
                result.push({
                    pageIndex: result.length,
                    sentences: curSentences,
                    wordCount: curWordCount,
                });
                curSentences = [sent];
                curWordCount = sWords;
            } else {
                curSentences.push(sent);
                curWordCount += sWords;
            }
        }

        if (curSentences.length > 0) {
            result.push({
                pageIndex: result.length,
                sentences: curSentences,
                wordCount: curWordCount,
            });
        }

        return result;
    }, [allSentences]);

    const totalPages = Math.max(1, pages.length);

    // Tipografi Dış Tıklama Dinleyicisi
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (typoMenuRef.current && !typoMenuRef.current.contains(e.target as Node)) {
                setIsTypoMenuOpen(false);
            }
        };
        if (isTypoMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isTypoMenuOpen]);

    // Sesli okuma sırasında kitap modu aktifse, okunan cümle diğer sayfaya geçtiğinde sayfayı otomatik çevir
    useEffect(() => {
        if (readerView === "book" && pages.length > 0) {
            const targetPage = pages.findIndex((p) =>
                p.sentences.some((s) => s.globalIndex === activeSentenceIdx)
            );
            if (targetPage !== -1 && targetPage !== currentPage) {
                setCurrentPage(targetPage);
            }
        }
    }, [activeSentenceIdx, readerView, pages, currentPage]);

    // Klavye ile sayfa çevirme (< ve > okları)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

            if (e.key === "ArrowLeft") {
                if (readerView === "book") {
                    setCurrentPage((p) => Math.max(0, p - 1));
                }
            } else if (e.key === "ArrowRight") {
                if (readerView === "book") {
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [readerView, totalPages]);

    // Web Speech API: Cümle Bazlı Seslendirme
    const speakSentence = useCallback(
        (index: number) => {
            if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
            if (index < 0 || index >= allSentences.length) {
                setIsPlaying(false);
                return;
            }

            window.speechSynthesis.cancel();

            const sentenceItem = allSentences[index];
            const utterance = new SpeechSynthesisUtterance(sentenceItem.text);
            utterance.lang = "en-US";
            utterance.rate = playbackRateRef.current;

            utterance.onend = () => {
                if (!isPlayingRef.current) return;
                const nextIdx = index + 1;
                if (nextIdx < allSentences.length) {
                    setActiveSentenceIdx(nextIdx);
                    speakSentence(nextIdx);
                } else {
                    setIsPlaying(false);
                    window.speechSynthesis.cancel();
                }
            };

            utterance.onerror = (e) => {
                if (e.error !== "interrupted" && e.error !== "canceled") {
                    setIsPlaying(false);
                }
            };

            window.speechSynthesis.speak(utterance);
        },
        [allSentences]
    );

    const togglePlayPause = () => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            speakSentence(activeSentenceIdx);
        }
    };

    const handlePrevSentence = () => {
        const nextIdx = Math.max(0, activeSentenceIdx - 1);
        setActiveSentenceIdx(nextIdx);
        if (isPlaying) {
            speakSentence(nextIdx);
        }
    };

    const handleNextSentence = () => {
        const nextIdx = Math.min(allSentences.length - 1, activeSentenceIdx + 1);
        setActiveSentenceIdx(nextIdx);
        if (isPlaying) {
            speakSentence(nextIdx);
        }
    };

    const handleSeekSentence = (targetIdx: number) => {
        const clamped = Math.max(0, Math.min(allSentences.length - 1, targetIdx));
        setActiveSentenceIdx(clamped);
        if (isPlaying) {
            speakSentence(clamped);
        }
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackRate(speed);
        playbackRateRef.current = speed;
        if (isPlaying) {
            speakSentence(activeSentenceIdx);
        }
    };

    // Temizleme (Unmount durumunda sesi kapat)
    useEffect(() => {
        return () => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Şık ve soru temizleme algoritmaları
    const cleanOptionText = (text: string): string => {
        if (!text) return "";
        return text
            .replace(/^([A-D]|[1-4])\s*[\.\)\:\-]?\s*/i, "")
            .replace(
                /\s*[\(\[\{](?:true statement|false statement|true|false|correct answer|correct|incorrect|right|wrong|distractor|accurate|inaccurate|doğru cevap|dogru cevap|doğru ifade|dogru ifade|doğru|dogru|yanlış|yanlis|key|answer)[^\)\]\}]*[\)\]\}]/gi,
                ""
            )
            .replace(
                /\s*[\*\-_~:]+\s*(?:correct answer|correct|doğru cevap|dogru cevap|doğru|dogru|true|yanlış|yanlis|false)[^\)]*/gi,
                ""
            )
            .trim();
    };

    const cleanQuestionText = (text: string): string => {
        if (!text) return "";
        return text
            .replace(
                /\s*[\(\[\{](?:true statement|false statement|true|false|correct answer|correct|doğru|dogru|yanlış|yanlis)[^\)\]\}]*[\)\]\}]/gi,
                ""
            )
            .trim();
    };

    const buildCleanQuestions = (rawQuestions: any[]): CleanQuestion[] => {
        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
            return [];
        }

        return rawQuestions.map((q) => {
            let origCorrectIdx = 0;
            if (typeof q.correct_answer_index === "number") {
                origCorrectIdx = q.correct_answer_index;
            } else if (typeof q.correct_answer_index === "string") {
                const num = parseInt(q.correct_answer_index, 10);
                if (!isNaN(num)) {
                    origCorrectIdx = num;
                } else {
                    const letter = q.correct_answer_index.trim().toUpperCase();
                    if (letter === "A") origCorrectIdx = 0;
                    else if (letter === "B") origCorrectIdx = 1;
                    else if (letter === "C") origCorrectIdx = 2;
                    else if (letter === "D") origCorrectIdx = 3;
                }
            } else {
                const foundIdx = (q.options || []).findIndex((opt: string) =>
                    /\b(?:correct|doğru|dogru|true statement)\b/i.test(opt)
                );
                if (foundIdx >= 0) origCorrectIdx = foundIdx;
            }

            const mapped = (q.options || []).map((opt: string, idx: number) => ({
                text: cleanOptionText(opt),
                isCorrect: idx === origCorrectIdx,
            }));

            const shuffled = [...mapped];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            const newCorrectIdx = shuffled.findIndex((item) => item.isCorrect);

            return {
                question: cleanQuestionText(q.question || ""),
                options: shuffled.map((item) => item.text),
                correct_answer_index: newCorrectIdx >= 0 ? newCorrectIdx : 0,
            };
        });
    };

    const [cleanQuestions, setCleanQuestions] = useState<CleanQuestion[]>(() =>
        buildCleanQuestions(story.comprehension_questions || [])
    );

    // Kaldığı Yeri ve İlerlemeyi Yükle
    useEffect(() => {
        setUserAnswers({});
        setCleanQuestions(buildCleanQuestions(story.comprehension_questions || []));
        try {
            const savedProgress = localStorage.getItem(`quizwise_progress_${storyKey}`);
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                if (typeof parsed.lastParagraph === "number") {
                    setLastReadParagraph(parsed.lastParagraph);
                }
                if (typeof parsed.lastPage === "number") {
                    setCurrentPage(parsed.lastPage);
                }
                if (parsed.status === "completed") {
                    setIsCompleted(true);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, [storyKey, story.title, story.content]);

    // Sayfa değiştiğinde sayfa bazlı ilerlemeyi otomatik kaydet
    useEffect(() => {
        if (totalPages > 0) {
            try {
                const existing = localStorage.getItem(`quizwise_progress_${storyKey}`);
                const data = existing ? JSON.parse(existing) : {};
                localStorage.setItem(
                    `quizwise_progress_${storyKey}`,
                    JSON.stringify({
                        ...data,
                        storyKey,
                        title: story.title,
                        level: story.level,
                        topic: story.topic || "Genel",
                        lastPage: currentPage,
                        totalPages: totalPages,
                        lastParagraph: lastReadParagraph,
                        status: data.status === "completed" ? "completed" : "in_progress",
                        updatedAt: Date.now(),
                    })
                );
            } catch (e) {
                console.error(e);
            }
        }
    }, [currentPage, totalPages, storyKey, story.title, story.level, story.topic, lastReadParagraph]);

    const handleParagraphClick = (pIdx: number) => {
        setLastReadParagraph(pIdx);
        try {
            const existing = localStorage.getItem(`quizwise_progress_${storyKey}`);
            const data = existing ? JSON.parse(existing) : {};
            localStorage.setItem(
                `quizwise_progress_${storyKey}`,
                JSON.stringify({
                    ...data,
                    storyKey,
                    title: story.title,
                    level: story.level,
                    topic: story.topic || "Genel",
                    lastParagraph: pIdx,
                    lastPage: currentPage,
                    totalPages: totalPages,
                    status: data.status === "completed" ? "completed" : "in_progress",
                    updatedAt: Date.now(),
                })
            );
        } catch (e) {
            console.error(e);
        }
    };

    const handleFinishStory = async () => {
        setIsCompleted(true);
        try {
            const existing = localStorage.getItem(`quizwise_progress_${storyKey}`);
            const data = existing ? JSON.parse(existing) : {};
            localStorage.setItem(
                `quizwise_progress_${storyKey}`,
                JSON.stringify({
                    ...data,
                    storyKey,
                    title: story.title,
                    level: story.level,
                    topic: story.topic || "Genel",
                    status: "completed",
                    updatedAt: Date.now(),
                })
            );
        } catch (e) {
            console.error(e);
        }

        if (onCompleteStory) {
            onCompleteStory(storyKey);
        }
    };

    const handleAnswerQuestion = async (qIdx: number, optIdx: number, correctIdx: number) => {
        if (userAnswers[qIdx] !== undefined) return;

        const isCorrect = optIdx === correctIdx;
        setUserAnswers((prev) => ({
            ...prev,
            [qIdx]: optIdx,
        }));

        if (!isCorrect) {
            try {
                const curQ = cleanQuestions[qIdx];
                const qText = (curQ?.question || "").toLowerCase();
                const optText = (curQ?.options?.[optIdx] || "").toLowerCase();
                const correctOptText = (curQ?.options?.[correctIdx] || "").toLowerCase();

                const wordsToReport: string[] = [];
                if (Array.isArray(story.target_vocabulary) && story.target_vocabulary.length > 0) {
                    for (const tv of story.target_vocabulary) {
                        const w = tv.word.trim();
                        const wLower = w.toLowerCase();
                        if (
                            qText.includes(wLower) ||
                            optText.includes(wLower) ||
                            correctOptText.includes(wLower)
                        ) {
                            wordsToReport.push(w);
                        }
                    }
                    if (wordsToReport.length === 0 && story.target_vocabulary[qIdx]) {
                        wordsToReport.push(story.target_vocabulary[qIdx].word.trim());
                    } else if (wordsToReport.length === 0 && story.target_vocabulary[0]) {
                        wordsToReport.push(story.target_vocabulary[0].word.trim());
                    }
                }

                for (const word of wordsToReport) {
                    await fetch(`${API_BASE}/cards/${encodeURIComponent(word)}/review-result`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ is_correct: false }),
                    });
                }
            } catch (e) {
                console.error("Zayıf nokta havuzuna aktarılamadı:", e);
            }
        }
    };

    const cleanWord = (w: string) =>
        w.replace(/^[.,/#!$%^&*;:{}=\-_`~()'"“”]+|[.,/#!$%^&*;:{}=\-_`~()'"“”]+$/g, "");

    const handleWordClick = (rawWord: string, sentenceText: string, pIdx: number) => {
        handleParagraphClick(pIdx);
        const cleaned = cleanWord(rawWord);
        if (!cleaned || cleaned.length < 2) return;
        setSelectedWord(cleaned);
        setActiveSentence(sentenceText);
    };

    // Tema Renk Paletleri (Dark, Sepia, Light)
    const themeStyles = useMemo(() => {
        switch (readerTheme) {
            case "sepia":
                return {
                    cardBg: "bg-[#fbf0d9] border-[#ecdcc0] text-[#382e25] shadow-2xl shadow-amber-900/10",
                    subText: "text-[#7d6b58]",
                    divider: "border-[#ecdcc0]",
                    activeSentenceHighlight:
                        "bg-amber-300/40 ring-1 ring-amber-500/50 text-[#241a12] shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-lg px-1",
                    hoverSentence: "hover:bg-[#f3e4c8]/60 rounded px-1",
                    wordSaved: "bg-emerald-600/20 text-emerald-800 border-b-2 border-emerald-600 font-semibold",
                    wordTarget:
                        "bg-amber-400/35 text-amber-950 border-b-2 border-amber-600 font-semibold shadow-[0_0_10px_rgba(217,119,6,0.25)] hover:bg-amber-400/50 transition-all duration-200",
                    wordHover: "hover:bg-amber-300/40 hover:text-amber-950",
                    navBtn: "bg-[#eddaba] text-[#382e25] hover:bg-[#e4cead] border-[#dac3a0]",
                    counterBadge: "bg-[#f3e3ca] text-[#5c4a38] border-[#dfccaF]",
                };
            case "light":
                return {
                    cardBg: "bg-white border-slate-200 text-slate-800 shadow-2xl shadow-slate-200/60",
                    subText: "text-slate-500",
                    divider: "border-slate-200",
                    activeSentenceHighlight:
                        "bg-blue-100/90 ring-1 ring-blue-400/60 text-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.2)] rounded-lg px-1",
                    hoverSentence: "hover:bg-slate-50 rounded px-1",
                    wordSaved: "bg-emerald-500/15 text-emerald-700 border-b-2 border-emerald-500 font-semibold",
                    wordTarget:
                        "bg-amber-400/25 text-amber-950 border-b-2 border-amber-500 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:bg-amber-400/40 transition-all duration-200",
                    wordHover: "hover:bg-indigo-50 hover:text-indigo-900",
                    navBtn: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300",
                    counterBadge: "bg-slate-100 text-slate-600 border-slate-200",
                };
            case "dark":
            default:
                return {
                    cardBg: "bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl",
                    subText: "text-slate-400",
                    divider: "border-slate-800",
                    activeSentenceHighlight:
                        "bg-indigo-500/25 ring-1 ring-indigo-400/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] rounded-lg px-1",
                    hoverSentence: "hover:bg-slate-800/40 rounded px-1",
                    wordSaved: "bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-400 font-semibold",
                    wordTarget:
                        "bg-amber-400/20 text-amber-200 border-b-2 border-amber-400 font-semibold shadow-[0_0_14px_rgba(251,191,36,0.35)] hover:bg-amber-400/35 transition-all duration-200",
                    wordHover: "hover:bg-indigo-500/20 hover:text-indigo-200",
                    navBtn: "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700",
                    counterBadge: "bg-slate-800/80 text-slate-300 border-slate-700/80",
                };
        }
    }, [readerTheme]);

    // Boyut ve Font Sınıfları
    const fontSizeClass = useMemo(() => {
        switch (fontSize) {
            case "base":
                return "text-base sm:text-base leading-relaxed";
            case "xl":
                return "text-xl sm:text-2xl leading-loose";
            case "lg":
            default:
                return "text-lg sm:text-xl leading-relaxed";
        }
    }, [fontSize]);

    const fontFamilyClass = fontFamily === "serif" ? "font-serif" : "font-sans";

    const progressPercent =
        allSentences.length > 0
            ? Math.round(((activeSentenceIdx + 1) / allSentences.length) * 100)
            : 0;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-28 animate-in fade-in duration-200 relative">
            {/* Yeşil Bildirim (Toast) */}
            {showSaveToast && (
                <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-950/60 border border-emerald-400/40 animate-in fade-in slide-in-from-top-4 duration-300 font-bold text-xs sm:text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-100 animate-pulse" />
                    <span>Hikaye Kütüphanenize Eklendi!</span>
                </div>
            )}

            {/* ÜST ARAÇ ÇUBUĞU (Segment Kontrolü & Apple [Aa] Menüsü) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-md shadow-xl">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {onBackToLibrary && (
                            <button
                                onClick={onBackToLibrary}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition mr-1 cursor-pointer"
                                title={t("btn_back_to_library", "Kitaplığa Geri Dön")}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {story.level}
                        </span>
                        {story.topic && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                {story.topic}
                            </span>
                        )}
                        {isCompleted && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <BookmarkCheck className="w-3.5 h-3.5" /> {t("reading_completed_badge", "Okundu")}
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{story.title}</h2>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>
                            {readerView === "book"
                                ? t("page_counter", "Sayfa {cur} / {total}", {
                                      cur: currentPage + 1,
                                      total: totalPages,
                                  })
                                : `${t("reading_paragraph", "Paragraf")}: ${lastReadParagraph + 1} / ${paragraphs.length}`}
                        </span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">
                            {t("label_auto_saved", "İlerleme otomatik kaydediliyor")}
                        </span>
                    </div>
                </div>

                {/* Sağ Taraf: Dual-Reader Segment Butonları & [Aa] Menüsü & Paylaşım */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                    {/* 1. DUAL-READER GEÇİŞ ANAHTARI (Kitap Modu vs Odak Modu) */}
                    <div className="flex items-center p-1 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-inner">
                        <button
                            type="button"
                            onClick={() => {
                                setReaderView("book");
                                localStorage.setItem("vocaship_reader_view", "book");
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                readerView === "book"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <span>📖</span>
                            <span className="hidden sm:inline">{t("mode_book", "Kitap Modu")}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setReaderView("focus");
                                localStorage.setItem("vocaship_reader_view", "focus");
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                readerView === "focus"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <span>📄</span>
                            <span className="hidden sm:inline">{t("mode_focus", "Odak Modu")}</span>
                        </button>
                    </div>

                    {/* 2. APPLE BOOKS STİLİ [Aa] TİPOGRAFİ VE TEMA MENÜSÜ */}
                    <div className="relative" ref={typoMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsTypoMenuOpen(!isTypoMenuOpen)}
                            title={t("reading_appearance", "Görünüm & Tipografi")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition shadow-sm cursor-pointer ${
                                isTypoMenuOpen
                                    ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                            }`}
                        >
                            <span className="font-serif font-black text-sm tracking-tight">Aa</span>
                        </button>

                        {isTypoMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl p-4 bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                                {/* Tema Seçimi (Dark, Sepia, Light) */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {t("theme_label", "Tema")}
                                    </span>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReaderTheme("dark");
                                                localStorage.setItem("vocaship_reader_theme", "dark");
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border transition text-xs font-semibold cursor-pointer ${
                                                readerTheme === "dark"
                                                    ? "bg-slate-950 text-white border-indigo-500 ring-2 ring-indigo-500/40"
                                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                                            }`}
                                        >
                                            <Moon className="w-4 h-4" />
                                            <span>{t("theme_dark", "Koyu")}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReaderTheme("sepia");
                                                localStorage.setItem("vocaship_reader_theme", "sepia");
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border transition text-xs font-semibold cursor-pointer ${
                                                readerTheme === "sepia"
                                                    ? "bg-[#fbf0d9] text-[#382e25] border-amber-600 ring-2 ring-amber-500/40 shadow-sm"
                                                    : "bg-[#fbf0d9]/80 text-[#382e25]/70 border-[#ecdcc0] hover:text-[#382e25]"
                                            }`}
                                        >
                                            <Coffee className="w-4 h-4 text-amber-800" />
                                            <span>{t("theme_sepia", "Krem / Sepia")}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReaderTheme("light");
                                                localStorage.setItem("vocaship_reader_theme", "light");
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border transition text-xs font-semibold cursor-pointer ${
                                                readerTheme === "light"
                                                    ? "bg-white text-slate-900 border-indigo-500 ring-2 ring-indigo-500/40 shadow-sm"
                                                    : "bg-white/80 text-slate-700 border-slate-300 hover:text-slate-950"
                                            }`}
                                        >
                                            <Sun className="w-4 h-4 text-amber-500" />
                                            <span>{t("theme_light", "Açık")}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Yazı Tipi (Font: Sans-Serif vs Serif) */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {t("font_family_label", "Yazı Tipi")}
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFontFamily("sans");
                                                localStorage.setItem("vocaship_reader_font", "sans");
                                            }}
                                            className={`py-2 px-3 rounded-xl border text-xs font-sans font-semibold transition cursor-pointer ${
                                                fontFamily === "sans"
                                                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                                            }`}
                                        >
                                            {t("font_sans", "Sans-Serif")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFontFamily("serif");
                                                localStorage.setItem("vocaship_reader_font", "serif");
                                            }}
                                            className={`py-2 px-3 rounded-xl border text-xs font-serif font-semibold transition cursor-pointer ${
                                                fontFamily === "serif"
                                                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                                            }`}
                                        >
                                            {t("font_serif", "Serif")}
                                        </button>
                                    </div>
                                </div>

                                {/* Yazı Boyutu (A- ve A+) */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {t("font_size_label", "Yazı Boyutu")}
                                    </span>
                                    <div className="flex items-center justify-between p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = fontSize === "xl" ? "lg" : "base";
                                                setFontSize(next);
                                                localStorage.setItem("vocaship_reader_size", next);
                                            }}
                                            disabled={fontSize === "base"}
                                            className="p-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                            title="Küçült (A-)"
                                        >
                                            A-
                                        </button>

                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`w-2 h-2 rounded-full ${
                                                    fontSize === "base" ? "bg-indigo-400 scale-125" : "bg-slate-600"
                                                }`}
                                            />
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full ${
                                                    fontSize === "lg" ? "bg-indigo-400 scale-125" : "bg-slate-600"
                                                }`}
                                            />
                                            <span
                                                className={`w-3 h-3 rounded-full ${
                                                    fontSize === "xl" ? "bg-indigo-400 scale-125" : "bg-slate-600"
                                                }`}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = fontSize === "base" ? "lg" : "xl";
                                                setFontSize(next);
                                                localStorage.setItem("vocaship_reader_size", next);
                                            }}
                                            disabled={fontSize === "xl"}
                                            className="p-2 rounded-lg text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                            title="Büyüt (A+)"
                                        >
                                            A+
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bu Hikayeyi Karakterle Tartış (Hızlı Erişim) */}
                    <button
                        type="button"
                        onClick={handleDebateStory}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition cursor-pointer"
                        title="Bu metni AI Speaking Lounge'da sesli tartış"
                    >
                        <Mic className="w-3.5 h-3.5 text-violet-200" />
                        <span className="hidden sm:inline">🎙️ Karakterle Tartış</span>
                    </button>

                    {/* [ 💾 Kütüphaneme Ekle ] Butonu */}
                    <button
                        type="button"
                        onClick={handleSaveToLibrary}
                        disabled={isSaved}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                            isSaved
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                                : "bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500/50 active:scale-95"
                        }`}
                        title={isSaved ? "Bu hikaye kütüphanenizde kayıtlı" : "Bu hikayeyi kütüphanenize kaydedin"}
                    >
                        <BookmarkCheck className={`w-3.5 h-3.5 ${isSaved ? "text-emerald-400" : "text-slate-400"}`} />
                        <span>{isSaved ? "Kütüphanemde Kayıtlı ✓" : "💾 Kütüphaneme Ekle"}</span>
                    </button>

                    {/* Paylaş Butonu */}
                    {onShareStory && (
                        <button
                            onClick={() => onShareStory(story)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 hover:border-indigo-500/40 transition shadow-sm cursor-pointer"
                            title={t("btn_share", "Paylaş")}
                        >
                            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="hidden sm:inline">{t("btn_share", "Paylaş")}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* OKUMA ALANI: KİTAP MODU VEYA ODAK MODU */}
            {readerView === "book" ? (
                /* ==================== 1. KİTAP MODU (BOOK VIEW) ==================== */
                <div className="space-y-4">
                    <div className="relative flex items-stretch gap-2 sm:gap-4">
                        {/* Sol Sayfa Çevirme Butonu (<) */}
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            aria-label={t("btn_prev_page", "Önceki Sayfa")}
                            title={t("btn_prev_page", "Önceki Sayfa")}
                            className={`hidden sm:flex items-center justify-center w-12 shrink-0 rounded-2xl border transition-all ${
                                currentPage === 0
                                    ? "opacity-20 cursor-not-allowed border-transparent text-slate-500"
                                    : `${themeStyles.navBtn} shadow-md active:scale-95 cursor-pointer`
                            }`}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Kitap Sayfası Kartı */}
                        <div
                            className={`flex-1 rounded-3xl p-6 sm:p-10 border transition-all duration-300 min-h-[420px] flex flex-col justify-between ${themeStyles.cardBg} ${fontFamilyClass}`}
                        >
                            {/* Sayfa İçi İçerik */}
                            <div className="space-y-5">
                                <div className={`flex items-center justify-between text-xs pb-3 border-b ${themeStyles.divider} ${themeStyles.subText}`}>
                                    <span className="font-semibold truncate max-w-[200px] sm:max-w-md">
                                        {story.title}
                                    </span>
                                    <span className="flex items-center gap-1 font-mono text-[11px]">
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>{story.level}</span>
                                    </span>
                                </div>

                                <div className={`${fontSizeClass} space-y-4`}>
                                    {pages[currentPage]?.sentences.map((sent) => {
                                        const isSpeaking = activeSentenceIdx === sent.globalIndex && isPlaying;
                                        return (
                                            <span
                                                key={sent.globalIndex}
                                                className={`transition-all duration-200 inline mr-1.5 ${
                                                    isSpeaking
                                                        ? themeStyles.activeSentenceHighlight
                                                        : themeStyles.hoverSentence
                                                }`}
                                            >
                                                {sent.tokens.map((token, wIdx) => {
                                                    const cleaned = cleanWord(token).toLowerCase();
                                                    const isSaved = savedWords.has(cleaned);
                                                    const isTargetVocab =
                                                        story.target_vocabulary?.some(
                                                            (v) => (typeof v === "string" ? v : v.word).toLowerCase() === cleaned
                                                        ) ||
                                                        (story as any).target_words?.some(
                                                            (tw: any) => (typeof tw === "string" ? tw : tw.word).toLowerCase() === cleaned
                                                        );

                                                    return (
                                                        <span
                                                            key={wIdx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleWordClick(token, sent.text, sent.paragraphIndex);
                                                            }}
                                                            className={`cursor-pointer inline-block rounded px-0.5 transition duration-150 ${
                                                                isSaved
                                                                    ? themeStyles.wordSaved
                                                                    : isTargetVocab
                                                                    ? themeStyles.wordTarget
                                                                    : themeStyles.wordHover
                                                            }`}
                                                        >
                                                            {token}{" "}
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sayfa Alt Göstergesi: Sayfa {cur} / {total} */}
                            <div
                                className={`pt-6 mt-6 border-t flex items-center justify-between text-xs font-semibold ${themeStyles.divider} ${themeStyles.subText}`}
                            >
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>{t("mode_book", "Kitap Modu")}</span>
                                </span>

                                {/* Ortada Sayaç */}
                                <div
                                    className={`px-3 py-1 rounded-full font-mono text-xs border ${themeStyles.counterBadge}`}
                                >
                                    {t("page_indicator", t("page_counter", "Sayfa {cur} / {total}", { cur: currentPage + 1, total: totalPages }), {
                                        cur: currentPage + 1,
                                        total: totalPages,
                                    })}
                                </div>

                                {/* Mobildeki mini < ve > okları */}
                                <div className="flex sm:hidden items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className="p-1.5 rounded-lg border disabled:opacity-30"
                                        aria-label={t("btn_prev_page", "Önceki Sayfa")}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className="p-1.5 rounded-lg border disabled:opacity-30"
                                        aria-label={t("btn_next_page", "Sonraki Sayfa")}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <span className="hidden sm:inline-block">
                                    ~{pages[currentPage]?.wordCount || 0} {t("word_cards_count", "Kelime")}
                                </span>
                            </div>
                        </div>

                        {/* Sağ Sayfa Çevirme Butonu (>) */}
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage >= totalPages - 1}
                            aria-label={t("btn_next_page", "Sonraki Sayfa")}
                            title={t("btn_next_page", "Sonraki Sayfa")}
                            className={`hidden sm:flex items-center justify-center w-12 shrink-0 rounded-2xl border transition-all ${
                                currentPage >= totalPages - 1
                                    ? "opacity-20 cursor-not-allowed border-transparent text-slate-500"
                                    : `${themeStyles.navBtn} shadow-md active:scale-95 cursor-pointer`
                            }`}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            ) : (
                /* ==================== 2. ODAK MODU (FOCUS VIEW) ==================== */
                <div
                    className={`rounded-3xl p-6 sm:p-10 border transition-all duration-300 ${themeStyles.cardBg} ${fontFamilyClass}`}
                >
                    <div className="max-w-2xl mx-auto space-y-6">
                        <p className={`text-xs flex items-center gap-1.5 pb-3 border-b ${themeStyles.divider} ${themeStyles.subText}`}>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>
                                {t(
                                    "focus_mode_tip",
                                    "Odak Modu: Dikkat dağıtmayan, akıcı dikey kaydırma düzeni. Kelimelere tıklayarak detay kartını açabilirsiniz."
                                )}
                            </span>
                        </p>

                        <div className="space-y-6">
                            {paragraphs.map((para, pIdx) => {
                                const paraSentences = allSentences.filter((s) => s.paragraphIndex === pIdx);
                                const isCurrentBookmark = lastReadParagraph === pIdx;

                                return (
                                    <p
                                        key={pIdx}
                                        ref={(el) => {
                                            paragraphRefs.current[pIdx] = el;
                                        }}
                                        onClick={() => handleParagraphClick(pIdx)}
                                        className={`${fontSizeClass} transition-all p-3 rounded-2xl cursor-pointer ${
                                            isCurrentBookmark
                                                ? "bg-indigo-950/20 border border-indigo-500/20 shadow-inner"
                                                : ""
                                        }`}
                                    >
                                        {paraSentences.map((sent) => {
                                            const isSpeaking = activeSentenceIdx === sent.globalIndex && isPlaying;
                                            return (
                                                <span
                                                    key={sent.globalIndex}
                                                    className={`transition-all duration-200 inline mr-1.5 ${
                                                        isSpeaking
                                                            ? themeStyles.activeSentenceHighlight
                                                            : themeStyles.hoverSentence
                                                    }`}
                                                >
                                                    {sent.tokens.map((token, wIdx) => {
                                                        const cleaned = cleanWord(token).toLowerCase();
                                                        const isSaved = savedWords.has(cleaned);
                                                        const isTargetVocab =
                                                            story.target_vocabulary?.some(
                                                                (v) => (typeof v === "string" ? v : v.word).toLowerCase() === cleaned
                                                            ) ||
                                                            (story as any).target_words?.some(
                                                                (tw: any) => (typeof tw === "string" ? tw : tw.word).toLowerCase() === cleaned
                                                            );

                                                        return (
                                                            <span
                                                                key={wIdx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleWordClick(token, sent.text, pIdx);
                                                                }}
                                                                className={`cursor-pointer inline-block rounded px-0.5 transition duration-150 ${
                                                                    isSaved
                                                                        ? themeStyles.wordSaved
                                                                        : isTargetVocab
                                                                        ? themeStyles.wordTarget
                                                                        : themeStyles.wordHover
                                                                }`}
                                                            >
                                                                {token}{" "}
                                                            </span>
                                                        );
                                                    })}
                                                </span>
                                            );
                                        })}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Çıkartılan Hedef Kelimeler (İnteraktif Flashcardlar) */}
            {Array.isArray(story.target_vocabulary) && story.target_vocabulary.length > 0 && (
                <div className="pt-6 border-t border-slate-800">
                    <TargetVocabularyFlashcards
                        vocabulary={story.target_vocabulary}
                        decks={decks}
                        selectedDeckId={selectedDeckId}
                        onCardSaved={(savedWord) => {
                            setSavedWords((prev) => new Set(prev).add(savedWord.toLowerCase()));
                        }}
                    />
                </div>
            )}

            {/* Hikaye Anlama Soruları (Comprehension Quiz) */}
            {cleanQuestions.length > 0 && (() => {
                const totalQuestions = cleanQuestions.length;
                const answeredCount = Object.keys(userAnswers).length;
                const correctCount = cleanQuestions.filter(
                    (q, idx) => userAnswers[idx] === q.correct_answer_index
                ).length;
                const isQuizComplete = totalQuestions > 0 && answeredCount === totalQuestions;
                const earnedXP = correctCount * 10;

                return (
                    <div className="pt-8 border-t border-slate-800 space-y-5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                                        <span>{t("comprehension_questions_title", "Okuma Anlama Soruları")}</span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {t(
                                            "questions_instruction_hint",
                                            "Metni ne kadar anladığınızı test edin. Şıklardan birine tıklayarak cevabınızı verin."
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/80 flex items-center gap-1.5">
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        answeredCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                                    }`}
                                ></span>
                                <span>
                                    {t(
                                        "questions_progress_counter",
                                        "{answered} / {total} Cevaplandı ({correct} Doğru)",
                                        {
                                            answered: answeredCount,
                                            total: totalQuestions,
                                            correct: correctCount,
                                        }
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Sorular Listesi */}
                        <div className="space-y-4">
                            {cleanQuestions.map((q, qIdx) => {
                                const selectedOpt = userAnswers[qIdx];
                                const isAnswered = selectedOpt !== undefined;
                                const correctIndex = q.correct_answer_index;
                                const isQuestionCorrect = isAnswered && selectedOpt === correctIndex;

                                return (
                                    <div
                                        key={qIdx}
                                        className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3.5 shadow-inner"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="text-sm sm:text-base font-semibold text-slate-100 flex items-start gap-2">
                                                <span className="text-indigo-400 font-bold font-mono shrink-0">
                                                    {qIdx + 1}.
                                                </span>
                                                <span>{q.question}</span>
                                            </h4>
                                            {isAnswered && (
                                                <span
                                                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                                                        isQuestionCorrect
                                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                    }`}
                                                >
                                                    {isQuestionCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                    {isQuestionCorrect ? t("badge_correct", "Doğru") : t("badge_incorrect", "Yanlış")}
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 ${
                                                isAnswered ? "pointer-events-none" : ""
                                            }`}
                                        >
                                            {q.options.map((opt, optIdx) => {
                                                const isSelected = isAnswered && selectedOpt === optIdx;
                                                const isCorrectChoice = optIdx === correctIndex;

                                                let containerStyle = "";
                                                if (!isAnswered) {
                                                    containerStyle =
                                                        "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200 cursor-pointer active:ring-2 active:ring-emerald-400 active:bg-emerald-500/20 transition-colors";
                                                } else {
                                                    if (isCorrectChoice) {
                                                        if (isSelected) {
                                                            containerStyle =
                                                                "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10 pointer-events-none";
                                                        } else {
                                                            containerStyle =
                                                                "border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-sm pointer-events-none";
                                                        }
                                                    } else if (isSelected) {
                                                        containerStyle =
                                                            "border-rose-500 bg-rose-500/20 text-rose-300 shadow-sm shadow-rose-500/10 pointer-events-none";
                                                    } else {
                                                        containerStyle =
                                                            "border-slate-800/60 bg-slate-900/40 text-slate-600 opacity-40 pointer-events-none";
                                                    }
                                                }

                                                const letterBadge = (
                                                    <span
                                                        className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${
                                                            !isAnswered
                                                                ? "bg-slate-800 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-300"
                                                                : isCorrectChoice && isSelected
                                                                ? "bg-emerald-500 text-slate-950 font-bold"
                                                                : isCorrectChoice
                                                                ? "bg-emerald-500/30 text-emerald-300 font-bold"
                                                                : isSelected
                                                                ? "bg-rose-500 text-white font-bold"
                                                                : "bg-slate-800/50 text-slate-600"
                                                        }`}
                                                    >
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </span>
                                                );

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        type="button"
                                                        disabled={isAnswered}
                                                        onClick={() =>
                                                            handleAnswerQuestion(qIdx, optIdx, correctIndex)
                                                        }
                                                        className={`group p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left flex items-center justify-between gap-3 shadow-sm ${containerStyle}`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <input
                                                                type="radio"
                                                                name={`reading_q_${qIdx}`}
                                                                checked={userAnswers[qIdx] === optIdx}
                                                                onChange={() => {}}
                                                                disabled={isAnswered}
                                                                className="accent-emerald-500 cursor-pointer shrink-0 pointer-events-none"
                                                            />
                                                            {letterBadge}
                                                            <span className="leading-snug break-words">{opt}</span>
                                                        </div>

                                                        {isAnswered && isCorrectChoice && (
                                                            <span className="flex items-center gap-1 text-emerald-300 shrink-0 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                                                <Check className="w-3 h-3" />
                                                                <span className="hidden sm:inline">
                                                                    {isSelected ? t("badge_correct", "Doğru") : t("badge_correct_answer", "Doğru Cevap")}
                                                                </span>
                                                            </span>
                                                        )}
                                                        {isAnswered && isSelected && !isCorrectChoice && (
                                                            <span className="flex items-center gap-1 text-rose-300 shrink-0 font-bold text-xs bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                                                                <X className="w-3 h-3" />
                                                                <span className="hidden sm:inline">{t("badge_incorrect", "Yanlış")}</span>
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Skor ve Ödül Kartı */}
                        {isQuizComplete && (
                            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-indigo-950/60 to-slate-900 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-400/30 shrink-0">
                                            <Trophy className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                                {correctCount === totalQuestions
                                                    ? `Tebrikler! ${totalQuestions}/${totalQuestions} Doğru (+${earnedXP} XP Kazandınız 🏆)`
                                                    : `Test Tamamlandı: ${correctCount}/${totalQuestions} Doğru (+${earnedXP} XP Kazandınız 🏆)`}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-slate-300">
                                                {correctCount === totalQuestions
                                                    ? "Harika bir okuma performansı! Tüm anlama sorularını doğru yanıtladınız."
                                                    : `${totalQuestions} anlama sorusundan ${correctCount} tanesini doğru bildiniz.`}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleFinishStory}
                                        disabled={isCompleted}
                                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition active:scale-95 shrink-0 ${
                                            isCompleted
                                                ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                                                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 cursor-pointer"
                                        }`}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>{isCompleted ? "Okuma Tamamlandı ✓" : "Okumayı Tamamla"}</span>
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                        <span>Başarı Oranı: %{Math.round((correctCount / totalQuestions) * 100)}</span>
                                        <span className="text-amber-400 font-bold">+{earnedXP} XP</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-700"
                                            style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Hikaye Sonu Aksiyon Butonu */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                    {isCompleted ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> Bu hikayeyi tamamladınız ve kitaplığınıza kaydedildi.
                        </span>
                    ) : (
                        <span>
                            {t(
                                "finish_story_notice",
                                "Metni bitirdiğinizde 'Hikayeyi Bitirdim' butonuna basarak arşive kaldırabilirsiniz."
                            )}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* [ 🎙️ Bu Hikayeyi Karakterle Tartış ] */}
                    <button
                        type="button"
                        onClick={handleDebateStory}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-95 cursor-pointer ring-1 ring-violet-400/40"
                        title="Bu metni ve temalarını AI Speaking Lounge'da sesli tartış"
                    >
                        <Mic className="w-4 h-4 text-violet-200" />
                        <span>🎙️ Bu Hikayeyi Karakterle Tartış</span>
                    </button>

                    {!isCompleted ? (
                        <button
                            onClick={handleFinishStory}
                            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>{t("btn_finish_story", "Hikayeyi Bitirdim (Tamamla)")}</span>
                        </button>
                    ) : (
                        <button
                            onClick={onBackToLibrary}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                            {t("btn_back_to_library", "Kitaplığa Dön")}
                        </button>
                    )}
                </div>
            </div>

            {/* ==================== 3. ALT SABİT SES OYNATICI (STICKY AUDIO PLAYER BAR) ==================== */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 sm:px-8 py-3 shadow-2xl transition-all">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Sol: Cümle Navigasyon & Oynat/Durdur */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-1.5">
                            {/* Önceki Cümle / Geri 5s (⏮) */}
                            <button
                                type="button"
                                onClick={handlePrevSentence}
                                disabled={activeSentenceIdx <= 0}
                                title="Geri 5s (Önceki Cümle)"
                                aria-label="Geri 5s"
                                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            >
                                <SkipBack className="w-4 h-4" />
                                <span className="hidden sm:inline">5s</span>
                            </button>

                            {/* Oynat / Durdur (⏯) */}
                            <button
                                type="button"
                                onClick={togglePlayPause}
                                title={isPlaying ? t("audio_pause", "Duraklat") : t("audio_play", "Oynat")}
                                aria-label={isPlaying ? t("audio_pause", "Duraklat") : t("audio_play", "Oynat")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                                    isPlaying
                                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                                }`}
                            >
                                {isPlaying ? (
                                    <>
                                        <Pause className="w-4 h-4 fill-current" />
                                        <span>{t("audio_pause", "Duraklat")}</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-current" />
                                        <span>{t("audio_play", "Oynat")}</span>
                                    </>
                                )}
                            </button>

                            {/* Sonraki Cümle / İleri 5s (⏭) */}
                            <button
                                type="button"
                                onClick={handleNextSentence}
                                disabled={activeSentenceIdx >= allSentences.length - 1}
                                title="İleri 5s (Sonraki Cümle)"
                                aria-label="İleri 5s"
                                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            >
                                <span className="hidden sm:inline">5s</span>
                                <SkipForward className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mobilde İlerleme Yüzdesi */}
                        <div className="sm:hidden text-xs font-mono text-indigo-400 font-bold">
                            %{progressPercent}
                        </div>
                    </div>

                    {/* Orta: Tıklanabilir İlerleme Kaydırıcısı (Slider) ve Cümle Sayacı */}
                    <div className="flex-1 w-full max-w-md flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <span>
                                {t("audio_sentence_progress", "Cümle {cur} / {total}", {
                                    cur: allSentences.length > 0 ? activeSentenceIdx + 1 : 0,
                                    total: allSentences.length,
                                })}
                            </span>
                            <span className="hidden sm:inline font-mono text-indigo-400 font-bold">
                                %{progressPercent}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={Math.max(0, allSentences.length - 1)}
                            value={activeSentenceIdx}
                            onChange={(e) => handleSeekSentence(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition"
                        />
                    </div>

                    {/* Sağ: Oynatma Hızı Seçicisi (0.75x | 1.0x | 1.25x) */}
                    <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shrink-0">
                        {[0.75, 1.0, 1.25].map((spd) => (
                                <button
                                    key={spd}
                                    type="button"
                                    onClick={() => handleSpeedChange(spd)}
                                    title={t("playback_speed", "Hız: {rate}x", { rate: spd })}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        playbackRate === spd
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "text-slate-400 hover:text-slate-200"
                                    }`}
                                >
                                    {spd}x
                                </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kelime Detay / Kart Popup Modalı */}
            {selectedWord && (
                <WordCardModal
                    word={selectedWord}
                    contextSentence={activeSentence}
                    decks={decks}
                    selectedDeckId={selectedDeckId}
                    initialTranslation={
                        story.target_vocabulary?.find(
                            (v) => cleanWord(v.word).toLowerCase() === cleanWord(selectedWord).toLowerCase()
                        )?.turkish_meaning
                    }
                    onClose={() => setSelectedWord(null)}
                    onCardSaved={(saved) => {
                        setSavedWords((prev) => new Set(prev).add(saved));
                    }}
                />
            )}
        </div>
    );
}