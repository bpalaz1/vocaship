"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import WordCardModal from "./WordCardModal";
import TargetVocabularyFlashcards from "./TargetVocabularyFlashcards";
import { useTranslation } from "../../context/LanguageContext";
import { Volume2, Square, Sparkles, CheckCircle, ArrowLeft, BookmarkCheck, Share2, HelpCircle, Check, X, Trophy } from "lucide-react";
import { API_BASE } from "../../config";

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
}

interface StoryReaderProps {
    story: StoryData;
    decks: Array<{ id: string; title: string }>;
    selectedDeckId: string;
    onBackToLibrary?: () => void;
    onCompleteStory?: (storyId: string) => void;
    onShareStory?: (story: StoryData) => void;
}

export default function StoryReader({
    story,
    decks,
    selectedDeckId,
    onBackToLibrary,
    onCompleteStory,
    onShareStory,
}: StoryReaderProps) {
    const { t } = useTranslation();
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [activeSentence, setActiveSentence] = useState<string>("");
    const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
    const [isPlaying, setIsPlaying] = useState(false);
    const [lastReadParagraph, setLastReadParagraph] = useState<number>(0);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

    // Paragraf referansları (kaldığı yere scroll yapmak için)
    const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

    // Hikaye ID'si (yoksa başlıktan üretelim)
    const storyKey = story.id || `story_${story.title.toLowerCase().replace(/\s+/g, "_")}`;

    const paragraphs = story.content.split("\n").filter((p) => p.trim().length > 0);

    // Şık metinlerindeki " (True statement)", "[Correct]", "(Doğru Cevap)" gibi yapay zekâ ipuçlarını ve baştaki "A) " önekini temizle
    const cleanOptionText = (text: string): string => {
        if (!text) return "";
        return text
            // Baştaki "A) ", "B. ", "1) ", "2 - " gibi şık harflerini/numaralarını temizle
            .replace(/^([A-D]|[1-4])\s*[\.\)\:\-]?\s*/i, "")
            // Parantez veya köşeli parantez içindeki ipuçlarını temizle
            .replace(/\s*[\(\[\{](?:true statement|false statement|true|false|correct answer|correct|incorrect|right|wrong|distractor|accurate|inaccurate|doğru cevap|dogru cevap|doğru ifade|dogru ifade|doğru|dogru|yanlış|yanlis|key|answer)[^\)\]\}]*[\)\]\}]/gi, "")
            // Yıldız, iki nokta veya tire ile eklenmiş ipuçlarını temizle (örn: - Correct, *Doğru*, : Correct)
            .replace(/\s*[\*\-_~:]+\s*(?:correct answer|correct|doğru cevap|dogru cevap|doğru|dogru|true|yanlış|yanlis|false)[^\)]*/gi, "")
            .trim();
    };

    const cleanQuestionText = (text: string): string => {
        if (!text) return "";
        return text
            .replace(/\s*[\(\[\{](?:true statement|false statement|true|false|correct answer|correct|doğru|dogru|yanlış|yanlis)[^\)\]\}]*[\)\]\}]/gi, "")
            .trim();
    };

    interface CleanQuestion {
        question: string;
        options: string[];
        correct_answer_index: number;
    }

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

            // Fisher-Yates shuffle ile seçenekleri karıştır (A, B, C, D arasında rastgele dağıt)
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

    // Soruların temizlenmiş ve karıştırılmış kararlı state'i
    const [cleanQuestions, setCleanQuestions] = useState<CleanQuestion[]>(() =>
        buildCleanQuestions(story.comprehension_questions || [])
    );

    // 1. Kaldığı Yeri ve Tamamlanma Durumunu Yükle
    useEffect(() => {
        // Yeni bir hikaye açıldığında tüm cevaplar baştan sıfırlanır (cevapsız ve nötr başlar)
        setUserAnswers({});
        setCleanQuestions(buildCleanQuestions(story.comprehension_questions || []));
        try {
            const savedProgress = localStorage.getItem(`quizwise_progress_${storyKey}`);
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                if (typeof parsed.lastParagraph === "number") {
                    setLastReadParagraph(parsed.lastParagraph);
                    // 300ms sonra kaldığı paragrafa yumuşakça kaydır
                    setTimeout(() => {
                        paragraphRefs.current[parsed.lastParagraph]?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }, 350);
                }
                if (parsed.status === "completed") {
                    setIsCompleted(true);
                }
            } else {
                // Yeni başlanan hikayeyi "in_progress" olarak kaydet
                localStorage.setItem(
                    `quizwise_progress_${storyKey}`,
                    JSON.stringify({
                        storyKey,
                        title: story.title,
                        level: story.level,
                        topic: story.topic || "Genel",
                        lastParagraph: 0,
                        status: "in_progress",
                        updatedAt: Date.now(),
                        contentSnippet: paragraphs[0] || "",
                    })
                );
            }
        } catch (e) {
            console.error(e);
        }
    }, [storyKey, story.title, story.content]);

    // 2. Paragrafa Tıklanınca veya Okundukça Kaldığı Yeri Güncelle
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
                    status: data.status === "completed" ? "completed" : "in_progress",
                    updatedAt: Date.now(),
                })
            );
        } catch (e) {
            console.error(e);
        }
    };

    // 3. Hikayeyi Tamamla
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

    // 4. Anlama Sorusu Yanıtlama
    const handleAnswerQuestion = async (qIdx: number, optIdx: number, correctIdx: number) => {
        if (userAnswers[qIdx] !== undefined) return; // Bir kez işaretlenen soru kilitlenir

        const isCorrect = optIdx === correctIdx;
        setUserAnswers((prev) => ({
            ...prev,
            [qIdx]: optIdx,
        }));

        if (isCorrect) {
            // Doğru cevap durumu
        } else {
            // Yanlış cevaplanan sorunun ait olduğu kelime(leri) Zayıf Nokta havuzuna aktar
            try {
                const curQ = cleanQuestions[qIdx];
                const qText = (curQ?.question || "").toLowerCase();
                const optText = (curQ?.options?.[optIdx] || "").toLowerCase();
                const correctOptText = (curQ?.options?.[correctIdx] || "").toLowerCase();

                // Hedef kelimeler arasında soru veya şıklarda geçen kelimeleri bul
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
                    // Eğer isim eşleşmesi yoksa soru indeksindeki hedef kelimeyi al
                    if (wordsToReport.length === 0 && story.target_vocabulary[qIdx]) {
                        wordsToReport.push(story.target_vocabulary[qIdx].word.trim());
                    } else if (wordsToReport.length === 0 && story.target_vocabulary[0]) {
                        wordsToReport.push(story.target_vocabulary[0].word.trim());
                    }
                }

                // Zayıf nokta havuzuna aktar (is_correct=false)
                for (const word of wordsToReport) {
                    await fetch(`${API_BASE}/cards/${encodeURIComponent(word)}/review-result`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ is_correct: false }),
                    });
                }
            } catch (e) {
                console.error("Zayıf nokta havuzuna okuma hatası aktarılamadı:", e);
            }
        }
    };

    const cleanWord = (w: string) =>
        w.replace(/^[.,/#!$%^&*;:{}=\-_`~()'"“”]+|[.,/#!$%^&*;:{}=\-_`~()'"“”]+$/g, "");

    const handleWordClick = (rawWord: string, sentence: string, pIdx: number) => {
        handleParagraphClick(pIdx);
        const cleaned = cleanWord(rawWord);
        if (!cleaned || cleaned.length < 2) return;
        setSelectedWord(cleaned);
        setActiveSentence(sentence);
    };

    const toggleTTS = () => {
        if (!("speechSynthesis" in window)) return;
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(story.content);
            utterance.lang = "en-US";
            utterance.rate = 0.9;
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Üst Başlık & Kontroller */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-md shadow-xl">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {onBackToLibrary && (
                            <button
                                onClick={onBackToLibrary}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition mr-1"
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
                        <span>{t("reading_paragraph", "Paragraf")}: {lastReadParagraph + 1} / {paragraphs.length}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{t("label_auto_saved", "İlerleme otomatik kaydediliyor")}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onShareStory && (
                        <button
                            onClick={() => onShareStory(story)}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 hover:border-indigo-500/40 transition shadow-sm cursor-pointer"
                            title={t("btn_share", "Paylaş")}
                        >
                            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{t("btn_share", "Paylaş")}</span>
                        </button>
                    )}

                    <button
                        onClick={toggleTTS}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${isPlaying
                                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                            }`}
                    >
                        {isPlaying ? (
                            <>
                                <Square className="w-3.5 h-3.5 fill-current" /> Durdur
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-3.5 h-3.5" /> {t("btn_listen_tts", "Sesli Dinle (TTS)")}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Hikaye Okuma Alanı */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl leading-relaxed text-slate-200 space-y-6">
                <p className="text-xs text-slate-400 flex items-center gap-1.5 pb-3 border-b border-slate-800/80">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    İpucu: Bilmediğiniz herhangi bir kelimeye tıklayarak Türkçe karşılığını görebilir ve tek tıkla destenize ekleyebilirsiniz.
                </p>

                <div className="space-y-5">
                    {paragraphs.map((para, pIdx) => {
                        const isCurrentBookmark = lastReadParagraph === pIdx;
                        return (
                            <p
                                key={pIdx}
                                ref={(el) => {
                                    paragraphRefs.current[pIdx] = el;
                                }}
                                onClick={() => handleParagraphClick(pIdx)}
                                className={`leading-8 text-base sm:text-lg transition-all p-3 rounded-2xl cursor-pointer ${isCurrentBookmark
                                        ? "bg-indigo-950/40 border border-indigo-500/30 text-white shadow-inner"
                                        : "hover:bg-slate-850/50"
                                    }`}
                            >
                                {para.split(" ").map((token, wIdx) => {
                                    const cleaned = cleanWord(token).toLowerCase();
                                    const isSaved = savedWords.has(cleaned);
                                    const isTargetVocab = story.target_vocabulary?.some(
                                        (v) => v.word.toLowerCase() === cleaned
                                    );

                                    return (
                                        <span
                                            key={wIdx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWordClick(token, para, pIdx);
                                            }}
                                            className={`cursor-pointer inline-block rounded px-1 transition duration-150 ${isSaved
                                                    ? "bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-400 font-semibold"
                                                    : isTargetVocab
                                                        ? "bg-amber-500/15 text-amber-300 border-b border-amber-400/80 hover:bg-amber-500/30"
                                                        : "hover:bg-indigo-500/20 hover:text-indigo-200"
                                                }`}
                                        >
                                            {token}{" "}
                                        </span>
                                    );
                                })}
                            </p>
                        );
                    })}
                </div>

                {/* Çıkartılan Hedef Kelimeler (İnteraktif Flashcardlar) */}
                {Array.isArray(story.target_vocabulary) && story.target_vocabulary.length > 0 && (
                    <div className="pt-8 border-t border-slate-800">
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
                                            <span>Okuma Anlama Soruları</span>
                                        </h3>
                                        <p className="text-xs text-slate-400">Metni ne kadar anladığınızı test edin. Şıklardan birine tıklayarak cevabınızı verin.</p>
                                    </div>
                                </div>
                                <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/80 flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${answeredCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}></span>
                                    <span>{answeredCount} / {totalQuestions} Cevaplandı ({correctCount} Doğru)</span>
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
                                                    <span className="text-indigo-400 font-bold font-mono shrink-0">{qIdx + 1}.</span>
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
                                                        {isQuestionCorrect ? "Doğru" : "Yanlış"}
                                                    </span>
                                                )}
                                            </div>

                                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 ${isAnswered ? "pointer-events-none" : ""}`}>
                                                {q.options.map((opt, optIdx) => {
                                                    const isSelected = isAnswered && selectedOpt === optIdx;
                                                    const isCorrectChoice = optIdx === correctIndex;

                                                    let containerStyle = "";
                                                    if (!isAnswered) {
                                                        // 1. Başlangıç Durumu (Initial): Nötr koyu gri, Hover: MAVİ
                                                        containerStyle =
                                                            "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200 cursor-pointer active:ring-2 active:ring-emerald-400 active:bg-emerald-500/20 transition-colors";
                                                    } else {
                                                        // 2. Değerlendirme / Sonuç Durumu
                                                        if (isCorrectChoice) {
                                                            if (isSelected) {
                                                                // Kullanıcının seçtiği şık DOĞRU ise: Kalıcı YEŞİL
                                                                containerStyle =
                                                                    "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10 pointer-events-none";
                                                            } else {
                                                                // Kullanıcının seçtiği şık YANLIŞ ise: Gerçek doğru cevap olan şık öğrenmesi için YEŞİL aydınlansın
                                                                containerStyle =
                                                                    "border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-sm pointer-events-none";
                                                            }
                                                        } else if (isSelected) {
                                                            // Kullanıcının seçtiği şık YANLIŞ ise: Tıklanan şık KIRMIZI
                                                            containerStyle =
                                                                "border-rose-500 bg-rose-500/20 text-rose-300 shadow-sm shadow-rose-500/10 pointer-events-none";
                                                        } else {
                                                            // Seçilmeyen diğer seçenekler: Sönük ve tıklamaya kapalı
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
                                                                    <span className="hidden sm:inline">{isSelected ? "Doğru" : "Doğru Cevap"}</span>
                                                                </span>
                                                            )}
                                                            {isAnswered && isSelected && !isCorrectChoice && (
                                                                <span className="flex items-center gap-1 text-rose-300 shrink-0 font-bold text-xs bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                                                                    <X className="w-3 h-3" />
                                                                    <span className="hidden sm:inline">Yanlış</span>
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

                            {/* Skor ve Ödül Kartı (3 soru da cevaplandığında altta mini sonuç paneli) */}
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

                                    {/* Başarı Çubuğu */}
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
                            <span>{t("finish_story_notice", "Metni bitirdiğinizde 'Hikayeyi Bitirdim' butonuna basarak arşive kaldırabilirsiniz.")}</span>
                        )}
                    </div>

                    {!isCompleted ? (
                        <button
                            onClick={handleFinishStory}
                            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>{t("btn_finish_story", "Hikayeyi Bitirdim (Tamamla)")}</span>
                        </button>
                    ) : (
                        <button
                            onClick={onBackToLibrary}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                            {t("btn_back_to_library", "Kitaplığa Dön")}
                        </button>
                    )}
                </div>
            </div>

            {/* Kelime Modal */}
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