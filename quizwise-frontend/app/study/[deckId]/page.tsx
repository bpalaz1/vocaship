"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Volume2,
  RotateCcw,
  CheckCircle2,
  BrainCircuit,
  Edit3,
  Trash2,
  Target,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import AddWordModal, {
  DEFAULT_SUPPORTED_LANGUAGES,
  DeckItem as WordModalDeckItem,
  useAddWordController,
} from "../../components/AddWordModal";
import PronunciationCoach from "../../components/PronunciationCoach";
import MobileBottomTabbar from "../../components/layout/MobileBottomTabbar";
import { useLanguage } from "../../context/LanguageContext";
import { VocaShipMark } from "../../components/brand/VocaShipLogo";
import { API_BASE } from "../../config";
import { rewardSm2CardMastery } from "../../utils/rewardEngine";
import { saveArenaMistake, removeArenaMistake } from "../../utils/arenaMistakes";
import {
  PRESET_DECKS,
  PRESET_CARDS,
  toFlashcardItems,
  fetchDecksList,
} from "../../utils/activeDeckStore";

interface Card {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{
    definition: string;
    translation: string;
    part_of_speech?: string;
  }>;
  example_sentences?: Array<{
    en?: string;
    tr?: string;
    target?: string;
    native?: string;
    source?: string;
  }>;
  collocations?: string[];
  grammar_notes?: string;
  mistake_count?: number;
  consecutive_correct?: number;
  needs_review?: boolean;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  target_lang?: string;
  native_lang?: string;
}

export default function DeckStudyPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const { t, language } = useLanguage();

  const sm2Buttons = useMemo(() => {
    const isTr = language === "tr";
    return [
      {
        key: "1",
        rating: 1,
        isCorrect: false,
        label: t("study_rate_again"),
        hint: isTr ? "< 10 dk" : "< 10m",
        className:
          "bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-950 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:border-rose-500/35 dark:hover:border-rose-400 dark:text-rose-200",
        badgeClass: "bg-rose-600 text-white",
      },
      {
        key: "2",
        rating: 2,
        isCorrect: false,
        label: t("study_rate_hard"),
        hint: isTr ? "1 gün" : "1d",
        className:
          "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:border-amber-500/35 dark:hover:border-amber-400 dark:text-amber-200",
        badgeClass: "bg-amber-500 text-slate-950",
      },
      {
        key: "3",
        rating: 4,
        isCorrect: true,
        label: t("study_rate_good"),
        hint: isTr ? "3 gün" : "3d",
        className:
          "bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-950 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:border-emerald-500/35 dark:hover:border-emerald-400 dark:text-emerald-200",
        badgeClass: "bg-emerald-600 text-white",
      },
      {
        key: "4",
        rating: 5,
        isCorrect: true,
        label: t("study_rate_easy"),
        hint: isTr ? "7 gün" : "7d",
        className:
          "bg-indigo-100 hover:bg-indigo-200 border-indigo-300 text-indigo-950 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 dark:border-indigo-500/35 dark:hover:border-indigo-400 dark:text-indigo-200",
        badgeClass: "bg-indigo-600 text-white",
      },
    ];
  }, [t, language]);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [allDeckCards, setAllDeckCards] = useState<Card[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [struggledCards, setStruggledCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // Çalışma Durumu
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Kart Düzenleme Modalı
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    word: "",
    phonetic: "",
    translation: "",
    exampleEn: "",
    exampleTr: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isRemovingCard, setIsRemovingCard] = useState(false);
  const [allUserDecks, setAllUserDecks] = useState<WordModalDeckItem[]>([]);

  // Kelime Ekleme Modalı için Deste Listesi & Açık Deste Bağlamı
  const activeStudyDeckId =
    deck?.id && deck.id !== "quick" && !deck.id.startsWith("preset_")
      ? deck.id
      : deckId && deckId !== "quick" && !String(deckId).startsWith("preset_")
      ? String(deckId)
      : null;

  const availableModalDecks: WordModalDeckItem[] = React.useMemo(() => {
    const map = new Map<string, WordModalDeckItem>();
    allUserDecks
      .filter((d) => d.id && !String(d.id).startsWith("preset_"))
      .forEach((d) => map.set(d.id, d));
    if (activeStudyDeckId && deck && !map.has(activeStudyDeckId)) {
      map.set(activeStudyDeckId, {
        id: activeStudyDeckId,
        title: deck.title,
        card_count: allDeckCards.length,
      });
    }
    return Array.from(map.values());
  }, [allUserDecks, activeStudyDeckId, deck, allDeckCards.length]);

  const handleWordAddedToDeck = useCallback(
    async (savedDeckId: string) => {
      try {
        const cardsRes = await fetch(
          `${API_BASE}/api/v1/decks/${encodeURIComponent(savedDeckId)}/cards`
        );
        if (cardsRes.ok) {
          const cardsData: Card[] = await cardsRes.json();
          const list = Array.isArray(cardsData) ? cardsData : [];

          if (String(savedDeckId) === String(deckId)) {
            setAllDeckCards(list);
            setCards((prev) => {
              const existingIds = new Set(prev.map((c) => c.id));
              const newItems = list.filter((c) => !existingIds.has(c.id));
              return newItems.length > 0 ? [...prev, ...newItems] : list;
            });
            setSessionCompleted(false);
          } else if (String(deckId) === "quick" && list.length > 0) {
            const latest = list[list.length - 1];
            setAllDeckCards((prev) =>
              prev.some((c) => c.id === latest.id) ? prev : [...prev, latest]
            );
            setCards((prev) =>
              prev.some((c) => c.id === latest.id) ? prev : [...prev, latest]
            );
          }
        }
        const refreshedDecks = await fetchDecksList();
        setAllUserDecks(
          refreshedDecks.map((d) => ({
            id: d.id,
            title: d.title,
            card_count: d.card_count,
          }))
        );
      } catch (err) {
        console.warn("Eklenen kelime sonrası deste kartları yenilenemedi:", err);
      }
    },
    [deckId]
  );

  const addWordCtrl = useAddWordController({
    decks: availableModalDecks,
    onSaved: handleWordAddedToDeck,
  });

  const openAddWordForCurrentDeck = () => {
    addWordCtrl.openModal(
      activeStudyDeckId || availableModalDecks[0]?.id || ""
    );
  };

  // Kullanıcı destelerini modal seçicisi için arka planda hazırla
  useEffect(() => {
    fetchDecksList()
      .then((list) =>
        setAllUserDecks(
          list.map((d) => ({
            id: d.id,
            title: d.title,
            card_count: d.card_count,
          }))
        )
      )
      .catch(() => {});
  }, []);

  // 1. Deste ve Kartları Çek (Tek Deste + Çoklu Hızlı Çalışma + Hazır Desteler)
  useEffect(() => {
    if (!deckId) return;

    const loadDeckData = async () => {
      setLoading(true);
      setStruggledCards([]);

      if (String(deckId) === "quick") {
        try {
          const searchParams =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search)
              : null;
          const decksParam = searchParams?.get("decks") || "";
          const requestedIds = decksParam
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

          const mergedCards: Card[] = [];
          const seenKeys = new Set<string>();

          const appendCardUnique = (rawCard: any, sourceDeckId: string) => {
            const wordKey = String(rawCard?.word || "")
              .trim()
              .toLowerCase();
            const uniqueKey = rawCard?.id
              ? `${sourceDeckId}:${rawCard.id}`
              : `${sourceDeckId}:${wordKey}`;
            if (!wordKey || seenKeys.has(uniqueKey)) return;
            seenKeys.add(uniqueKey);
            mergedCards.push({
              id: String(rawCard.id || `${sourceDeckId}_${mergedCards.length}`),
              word: String(rawCard.word || ""),
              phonetic: rawCard.phonetic,
              meanings: Array.isArray(rawCard.meanings) ? rawCard.meanings : [],
              example_sentences: Array.isArray(rawCard.example_sentences)
                ? rawCard.example_sentences
                : [],
              collocations: Array.isArray(rawCard.collocations)
                ? rawCard.collocations
                : [],
              grammar_notes: rawCard.grammar_notes,
              mistake_count: rawCard.mistake_count,
              consecutive_correct: rawCard.consecutive_correct,
              needs_review: rawCard.needs_review,
            });
          };

          if (requestedIds.length > 0) {
            const backendIds: string[] = [];
            for (const id of requestedIds) {
              const presetCards = PRESET_CARDS[id];
              if (presetCards) {
                for (const item of toFlashcardItems(presetCards)) {
                  appendCardUnique(item, id);
                }
              } else {
                backendIds.push(id);
              }
            }

            if (backendIds.length > 0) {
              const results = await Promise.allSettled(
                backendIds.map(async (id) => {
                  const res = await fetch(
                    `${API_BASE}/api/v1/decks/${encodeURIComponent(id)}/cards`
                  );
                  if (!res.ok) return { id, cards: [] };
                  const data = await res.json();
                  return { id, cards: Array.isArray(data) ? data : [] };
                })
              );
              for (const r of results) {
                if (r.status === "fulfilled") {
                  for (const card of r.value.cards) {
                    appendCardUnique(card, r.value.id);
                  }
                }
              }
            }
          } else {
            const dueRes = await fetch(
              `${API_BASE}/api/v1/study/due-cards?limit=50`
            );
            if (dueRes.ok) {
              const dueData = await dueRes.json();
              if (Array.isArray(dueData)) {
                for (const card of dueData) {
                  appendCardUnique(card, String(card.deck_id || "due"));
                }
              }
            }
          }

          setDeck({
            id: "quick",
            title: "✨ Hızlı Çalışma Oturumu",
            description:
              requestedIds.length > 0
                ? `${requestedIds.length} seçili desteden birleştirilmiş çalışma seti`
                : "Günlük SM-2 tekrar ve karma kelime seti",
          });
          setAllDeckCards(mergedCards);
          setCards(mergedCards);
        } catch (err) {
          console.warn("Hızlı çalışma kartları yüklenemedi:", err);
          setDeck({
            id: "quick",
            title: "✨ Hızlı Çalışma Oturumu",
            description: "Karma kelime oturumu",
          });
          setAllDeckCards([]);
          setCards([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      const presetDeck = PRESET_DECKS.find((d) => d.id === String(deckId));
      const presetCards = PRESET_CARDS[String(deckId)];
      if (presetDeck && presetCards) {
        const items = toFlashcardItems(presetCards);
        setDeck({
          id: presetDeck.id,
          title: presetDeck.title,
          description: presetDeck.description || "",
        });
        setAllDeckCards(items);
        setCards(items);
        setLoading(false);
        return;
      }

      try {
        const [decksRes, cardsRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/decks`),
          fetch(`${API_BASE}/api/v1/decks/${encodeURIComponent(deckId)}/cards`),
        ]);

        if (decksRes.ok) {
          const allDecks: Deck[] = await decksRes.json();
          const currentDeck = allDecks.find(
            (d) => String(d.id) === String(deckId)
          );
          setDeck(currentDeck || null);
        } else {
          setDeck(null);
        }

        if (cardsRes.ok) {
          const cardsData: Card[] = await cardsRes.json();
          const list = Array.isArray(cardsData) ? cardsData : [];
          setAllDeckCards(list);
          setCards(list);
        } else {
          setAllDeckCards([]);
          setCards([]);
        }
      } catch (err) {
        console.warn("Deste bilgileri alınamadı:", err);
        setDeck(null);
        setAllDeckCards([]);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadDeckData();
  }, [deckId]);

  const speakText = (
    text: string,
    langCode: string = "en",
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: "en-US",
      tr: "tr-TR",
      de: "de-DE",
      es: "es-ES",
      fr: "fr-FR",
      it: "it-IT",
      ru: "ru-RU",
    };
    utterance.lang = langMap[langCode] || "en-US";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const triggerSessionEnd = useCallback(() => {
    setSessionCompleted(true);
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      triggerSessionEnd();
    }
  }, [currentIndex, cards.length, triggerSessionEnd]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // 2. 4'lü SM-2 Puanlama (1: Hatırlamadım, 2: Zorlandım, 3: İyi, 4: Çok Kolay)
  const handleSm2Review = useCallback(
    async (rating: number, isCorrect: boolean) => {
      const currentCard = cards[currentIndex];
      if (!currentCard) return;

      setReviewedCount((prev) => prev + 1);

      const cardMeaning =
        currentCard.meanings?.[0]?.translation ||
        currentCard.meanings?.[0]?.definition ||
        currentCard.word;

      if (isCorrect) {
        rewardSm2CardMastery(
          currentCard.id || currentCard.word,
          currentCard.word
        );
        removeArenaMistake(currentCard.word, { syncBackend: false });
      } else {
        setStruggledCards((prev) => {
          if (
            prev.some(
              (c) =>
                c.id === currentCard.id ||
                c.word.toLowerCase() === currentCard.word.toLowerCase()
            )
          ) {
            return prev;
          }
          return [...prev, currentCard];
        });
        saveArenaMistake({
          id: currentCard.id,
          word: currentCard.word,
          meaning: cardMeaning,
          phonetic: currentCard.phonetic,
          gameType: "flashcard",
        });
      }

      const targetKey =
        currentCard.id && !String(currentCard.id).startsWith("card_")
          ? currentCard.id
          : currentCard.word;

      try {
        const reviewRes = await fetch(
          `${API_BASE}/api/v1/cards/${encodeURIComponent(targetKey)}/review-result`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              is_correct: isCorrect,
              rating,
              meaning: cardMeaning !== currentCard.word ? cardMeaning : undefined,
            }),
          }
        );

        if (reviewRes.ok) {
          const updatedData = await reviewRes.json();
          setCards((prev) =>
            prev.map((c, i) =>
              i === currentIndex
                ? { ...c, needs_review: updatedData.needs_review }
                : c
            )
          );
        }
      } catch (e) {
        console.warn("SM-2 inceleme kaydı senkronize edilemedi:", e);
      }

      if (currentIndex + 1 < cards.length) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((p) => p + 1), 110);
      } else {
        triggerSessionEnd();
      }
    },
    [cards, currentIndex, triggerSessionEnd]
  );

  // 3. Klavye Kısayolları (Space: Çevir, 1-2-3-4: SM-2 Puanlama, Sol/Sağ: Gezinme)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditModalOpen || sessionCompleted || cards.length === 0) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (
        e.code === "Space" ||
        e.key === " " ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (isFlipped) {
        const btn = sm2Buttons.find((b) => b.key === e.key);
        if (btn) {
          e.preventDefault();
          handleSm2Review(btn.rating, btn.isCorrect);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditModalOpen,
    isFlipped,
    cards.length,
    sessionCompleted,
    handlePrev,
    handleNext,
    handleSm2Review,
    sm2Buttons,
  ]);

  // 4. Kart Düzenleme & Çıkarma
  const openEditCurrentCard = () => {
    const c = cards[currentIndex];
    if (!c) return;
    setEditForm({
      id: c.id,
      word: c.word || "",
      phonetic: c.phonetic || "",
      translation:
        c.meanings?.[0]?.translation || c.meanings?.[0]?.definition || "",
      exampleEn:
        c.example_sentences?.[0]?.target || c.example_sentences?.[0]?.en || "",
      exampleTr:
        c.example_sentences?.[0]?.native || c.example_sentences?.[0]?.tr || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.word.trim() || !editForm.translation.trim() || isSavingEdit) {
      return;
    }
    setIsSavingEdit(true);

    const updatedMeanings = [
      {
        part_of_speech:
          cards[currentIndex]?.meanings?.[0]?.part_of_speech || "",
        translation: editForm.translation.trim(),
        definition: editForm.translation.trim(),
      },
    ];
    const updatedExamples = editForm.exampleEn.trim()
      ? [
          {
            en: editForm.exampleEn.trim(),
            tr: editForm.exampleTr.trim(),
          },
        ]
      : [];

    const patchCardInList = (list: Card[]) =>
      list.map((c) =>
        c.id === editForm.id
          ? {
              ...c,
              word: editForm.word.trim(),
              phonetic: editForm.phonetic.trim(),
              meanings: updatedMeanings,
              example_sentences: updatedExamples,
            }
          : c
      );

    try {
      const isPersistentId =
        editForm.id &&
        !editForm.id.startsWith("card_") &&
        !editForm.id.startsWith("mistake_");

      if (isPersistentId) {
        await fetch(
          `${API_BASE}/api/v1/decks/cards/${encodeURIComponent(editForm.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              word: editForm.word.trim(),
              phonetic: editForm.phonetic.trim(),
              meanings: updatedMeanings,
              example_sentences: updatedExamples,
            }),
          }
        );
      }

      setCards(patchCardInList);
      setAllDeckCards(patchCardInList);
      setStruggledCards(patchCardInList);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Kart güncellenemedi:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleRemoveCurrentCard = async () => {
    const currentCard = cards[currentIndex];
    if (!currentCard || isRemovingCard) return;
    if (
      !window.confirm(
        `"${currentCard.word}" kartını bu çalışma destesinden çıkarmak istiyor musunuz?`
      )
    ) {
      return;
    }

    setIsRemovingCard(true);
    try {
      const isPersistentId =
        currentCard.id &&
        !currentCard.id.startsWith("card_") &&
        !currentCard.id.startsWith("mistake_");

      if (isPersistentId) {
        await fetch(
          `${API_BASE}/api/v1/decks/cards/${encodeURIComponent(currentCard.id)}`,
          { method: "DELETE" }
        );
      }

      const nextCards = cards.filter((_, idx) => idx !== currentIndex);
      setCards(nextCards);
      setAllDeckCards((prev) => prev.filter((c) => c.id !== currentCard.id));
      setStruggledCards((prev) => prev.filter((c) => c.id !== currentCard.id));
      setIsFlipped(false);

      if (nextCards.length === 0) {
        setCurrentIndex(0);
      } else if (currentIndex >= nextCards.length) {
        setCurrentIndex(nextCards.length - 1);
      }
    } catch (err) {
      console.error("Kart çıkarılamadı:", err);
    } finally {
      setIsRemovingCard(false);
    }
  };

  const restartFullDeck = () => {
    const resetList = allDeckCards.length > 0 ? allDeckCards : cards;
    setCards(resetList);
    setStruggledCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setReviewedCount(0);
  };

  const restartStruggledOnly = () => {
    if (struggledCards.length === 0) return;
    const focusList = [...struggledCards];
    setCards(focusList);
    setStruggledCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setReviewedCount(0);
  };

  const addWordModalNode = (
    <AddWordModal
      isOpen={addWordCtrl.isOpen}
      onClose={addWordCtrl.closeModal}
      decks={availableModalDecks}
      activeDeckId={activeStudyDeckId}
      selectedDeckForWord={addWordCtrl.selectedDeckForWord}
      setSelectedDeckForWord={addWordCtrl.setSelectedDeckForWord}
      termLang={addWordCtrl.termLang}
      setTermLang={addWordCtrl.setTermLang}
      defLang={addWordCtrl.defLang}
      setDefLang={addWordCtrl.setDefLang}
      supportedLanguages={DEFAULT_SUPPORTED_LANGUAGES}
      wordInput={addWordCtrl.wordInput}
      setWordInput={addWordCtrl.setWordInput}
      isAutoLookingUp={addWordCtrl.isAutoLookingUp}
      triggerAutoLookup={addWordCtrl.triggerAutoLookup}
      isEnriching={addWordCtrl.isEnriching}
      contextHint={addWordCtrl.contextHint}
      setContextHint={addWordCtrl.setContextHint}
      handleManualInputMode={addWordCtrl.handleManualInputMode}
      runFetchAi={addWordCtrl.runFetchAi}
      enrichedData={addWordCtrl.enrichedData}
      setEnrichedData={addWordCtrl.setEnrichedData}
      speakText={speakText}
      handleSaveCard={addWordCtrl.handleSaveCard}
      isSavingCard={addWordCtrl.isSavingCard}
      lastAutoWordRef={addWordCtrl.lastAutoWordRef}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <RotateCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium">{t("study_loading_cards")}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center px-4 py-20 text-center">
        <VocaShipMark size="lg" className="mx-auto mb-5" />
        <h2 className="text-xl font-bold text-white mb-2">
          {t("study_empty_deck_title")}
        </h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          {t("study_empty_deck_desc")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {availableModalDecks.length > 0 && (
            <button
              type="button"
              onClick={openAddWordForCurrentDeck}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ {t("lib_add_word")}</span>
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("nav_library", "Kelime Havuzu")}</span>
          </Link>
        </div>
        {addWordModalNode}
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  const cardWord = currentCard?.word || "";
  const cardPhonetic = currentCard?.phonetic || "";
  const cardMeaning =
    currentCard?.meanings?.[0]?.translation ||
    currentCard?.meanings?.[0]?.definition ||
    "-";
  const cardExEn =
    currentCard?.example_sentences?.[0]?.target ||
    currentCard?.example_sentences?.[0]?.en ||
    "";
  const cardExTr =
    currentCard?.example_sentences?.[0]?.native ||
    currentCard?.example_sentences?.[0]?.tr ||
    currentCard?.example_sentences?.[0]?.source ||
    "";

  return (
    <div className="min-h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] lg:overflow-hidden bg-[#0B0F19] text-slate-100 flex flex-col">
      <div className="w-full max-w-6xl mx-auto p-4 pb-24 lg:pb-4 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
        {/* ================================================================= */}
        {/* 1. SOL SÜTUN: Üst Kontrol Barı + Deste Kelime Listesi              */}
        {/* ================================================================= */}
        <aside className="flex flex-col h-full min-h-0 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
          {/* Üst Kontrol Bloğu */}
          <div className="space-y-3 pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold shadow-xs transition shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-300" />
                <span>{t("nav_library", "Kelime Havuzu")}</span>
              </Link>
              <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-lg shrink-0">
                {currentIndex + 1} / {cards.length}
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-sm font-black text-white truncate">
                {deck?.title || t("study_word_fallback")}
              </h1>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {!sessionCompleted && (
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={openAddWordForCurrentDeck}
                  disabled={availableModalDecks.length === 0}
                  className="px-2 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                  title={t("lib_add_word")}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t("lib_add_word")}</span>
                </button>
                <button
                  type="button"
                  onClick={openEditCurrentCard}
                  className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  title={t("study_edit_card")}
                >
                  <Edit3 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t("study_edit_short")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCurrentCard}
                  disabled={isRemovingCard}
                  className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-200 hover:text-rose-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                  title={t("study_remove_card")}
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t("study_remove_short")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Deste Kelime Listesi (Aktif kart çalışmasında mobilde gizlenir) */}
          <div
            className={`${
              !sessionCompleted ? "hidden lg:flex" : "flex"
            } items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 px-1 shrink-0`}
          >
            <span>{t("lib_word_unit")}</span>
            <span className="font-mono">{cards.length} {t("lib_view_card")}</span>
          </div>

          <div
            className={`${
              !sessionCompleted ? "hidden lg:block" : "block"
            } flex-1 min-h-0 max-h-[220px] lg:max-h-none overflow-y-auto space-y-1.5 pr-1`}
          >
            {cards.map((card, idx) => {
              const isActive = !sessionCompleted && idx === currentIndex;

              return (
                <button
                  key={`${card.id}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSessionCompleted(false);
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600/25 border-indigo-500 text-indigo-100 font-bold shadow-xs"
                      : "bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300"
                  }`}
                >
                  <span className="truncate">
                    <span className="font-mono text-[11px] text-slate-500 mr-1.5">
                      {idx + 1}.
                    </span>
                    <span>{card.word}</span>
                  </span>
                  {card.needs_review && (
                    <span
                      title={t("lib_weak_spot")}
                      className="text-[10px] shrink-0 text-rose-400"
                    >
                      🎯
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ================================================================= */}
        {/* 2. SAĞ SAHNE: 3D Flashcard & Alt Kontroller (Tek Ekrana Tam)      */}
        {/* ================================================================= */}
        <section className="flex flex-col items-center justify-center h-full min-h-0">
          {!sessionCompleted ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 min-h-0">
              {/* GENİŞ 3D FLASHCARD ALANI */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="max-w-2xl w-full flex-1 min-h-[280px] max-h-[380px] cursor-pointer select-none group"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="relative w-full h-full rounded-3xl transition-transform"
                  style={{
                    transformStyle: "preserve-3d",
                    transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* ÖN YÜZ: Kelime + Sesli Telaffuz */}
                  <div
                    className={`absolute inset-0 w-full h-full bg-slate-900 border-2 border-slate-800 hover:border-indigo-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all overflow-y-auto ${
                      isFlipped
                        ? "pointer-events-none z-0 opacity-0"
                        : "z-10 opacity-100"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="uppercase tracking-wider font-bold text-indigo-400">
                          {t("label_term_word")}
                        </span>
                        {currentCard.needs_review && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                            🎯 {t("lib_weak_spot")}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                        {t("study_space_flip")}
                      </span>
                    </div>

                    <div className="text-center py-4 flex flex-col items-center justify-center my-auto space-y-2">
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {cardWord}
                        </h2>
                        <button
                          type="button"
                          onClick={(e) =>
                            speakText(cardWord, deck?.target_lang || "en", e)
                          }
                          className="p-2.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition shadow-xs cursor-pointer"
                          title={t("btn_listen_tts")}
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                      {cardPhonetic && (
                        <span className="text-sm font-mono text-indigo-300 bg-indigo-500/15 px-3 py-0.5 rounded-full border border-indigo-500/30">
                          {cardPhonetic}
                        </span>
                      )}
                    </div>

                    <div className="hidden md:flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 shrink-0">
                      <span>{t("study_arrows_nav")}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {t("study_see_meaning_arrow")}
                      </span>
                    </div>
                  </div>

                  {/* ARKA YÜZ: Anlam + Fonetik + Örnek Cümle */}
                  <div
                    className={`absolute inset-0 w-full h-full bg-slate-900 text-white border-2 border-indigo-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto ${
                      isFlipped
                        ? "z-20 opacity-100"
                        : "pointer-events-none z-0 opacity-0"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="uppercase tracking-wider font-bold text-emerald-400">
                          {t("study_meaning_example")}
                        </span>
                        {cardPhonetic && (
                          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-500/30">
                            {cardPhonetic}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                        {cardWord}
                      </span>
                    </div>

                    <div className="text-center py-3 flex flex-col items-center justify-center my-auto w-full space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 break-words">
                          {cardMeaning}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) =>
                            speakText(cardMeaning, deck?.native_lang || "tr", e)
                          }
                          className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-slate-800 dark:text-emerald-300 transition cursor-pointer shrink-0"
                          title="Seslendir"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {cardExEn ? (
                        <div className="w-full max-w-lg text-left bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <div>
                            <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium italic">
                              &quot;
                              {(() => {
                                const trimmed = cardWord.trim();
                                if (!trimmed) return cardExEn;
                                const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                const regex = new RegExp(`(\\b${escaped}\\w*\\b)`, "gi");
                                return cardExEn.split(regex).map((part, idx) =>
                                  regex.test(part) ? (
                                    <span
                                      key={idx}
                                      className="font-bold text-indigo-700 dark:text-indigo-400 not-italic"
                                    >
                                      {part}
                                    </span>
                                  ) : (
                                    <React.Fragment key={idx}>{part}</React.Fragment>
                                  )
                                );
                              })()}
                              &quot;
                            </p>
                            {cardExTr && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {cardExTr}
                              </p>
                            )}
                          </div>
                          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800/80">
                            <PronunciationCoach
                              targetSentence={cardExEn}
                              lang={deck?.target_lang === "tr" ? "tr-TR" : "en-US"}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <PronunciationCoach
                            targetSentence={cardWord}
                            lang={deck?.target_lang === "tr" ? "tr-TR" : "en-US"}
                          />
                        </div>
                      )}
                    </div>

                    <div className="hidden md:flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 shrink-0">
                      <span>{t("study_shortcuts_hint")}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {t("study_rate_below")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ALT KONTROL & SM-2 BUTONLARI */}
              <div className="w-full max-w-2xl shrink-0">
                {!isFlipped ? (
                  <div className="w-full flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 disabled:opacity-35 transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{t("btn_prev")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFlipped(true)}
                      className="flex-1 max-w-xs py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>{t("study_flip_space_btn")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>{t("btn_next")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {sm2Buttons.map((btn) => (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => handleSm2Review(btn.rating, btn.isCorrect)}
                        className={`p-3 rounded-2xl border-2 text-center transition active:scale-95 cursor-pointer shadow-xs flex flex-col items-center gap-1 ${btn.className}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-5 h-5 rounded-md text-[10px] font-mono font-black flex items-center justify-center ${btn.badgeClass}`}
                          >
                            {btn.key}
                          </span>
                          <span className="text-xs sm:text-sm font-black">
                            {btn.label}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-75 font-medium">
                          {btn.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* OTURUM TAMAMLAMA EKRANI */
            <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                {t("study_done_title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                {t("study_done_desc", undefined, { count: reviewedCount > 0 ? reviewedCount : cards.length })}
              </p>

              <div className="w-full grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                    {t("study_stat_reviewed")}
                  </span>
                  <span className="text-xl font-black text-white">
                    {cards.length} {t("lib_view_card")}
                  </span>
                </div>
                <div className="bg-rose-500/15 p-3.5 rounded-2xl border border-rose-500/30">
                  <span className="text-[10px] text-rose-300 font-semibold block mb-1">
                    {t("study_stat_struggled")}
                  </span>
                  <span className="text-xl font-black text-rose-200">
                    {struggledCards.length} {t("lib_view_card")}
                  </span>
                </div>
              </div>

              <div className="w-full space-y-2.5">
                <button
                  type="button"
                  onClick={restartFullDeck}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs sm:text-sm text-white transition shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t("study_restart_deck")}</span>
                </button>

                {struggledCards.length > 0 && (
                  <button
                    type="button"
                    onClick={restartStruggledOnly}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 font-bold text-xs sm:text-sm text-white transition shadow-md shadow-rose-600/25 cursor-pointer active:scale-95"
                  >
                    <Target className="w-4 h-4" />
                    <span>
                      {t("study_struggled_only", undefined, { count: struggledCards.length })}
                    </span>
                  </button>
                )}

                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t("study_return_library")}</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* KART DÜZENLEME MODALI */}
      {isEditModalOpen && (
        <div
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">{t("study_edit_modal_title")}</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCard} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {t("words_label")}
                </label>
                <input
                  type="text"
                  required
                  value={editForm.word}
                  onChange={(e) =>
                    setEditForm({ ...editForm, word: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {t("study_meaning_label")}
                </label>
                <input
                  type="text"
                  required
                  value={editForm.translation}
                  onChange={(e) =>
                    setEditForm({ ...editForm, translation: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Phonetic
                </label>
                <input
                  type="text"
                  value={editForm.phonetic}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phonetic: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {t("study_example_label")}
                </label>
                <textarea
                  rows={2}
                  value={editForm.exampleEn}
                  onChange={(e) =>
                    setEditForm({ ...editForm, exampleEn: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {t("study_example_tr_label")}
                </label>
                <textarea
                  rows={2}
                  value={editForm.exampleTr}
                  onChange={(e) =>
                    setEditForm({ ...editForm, exampleTr: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {t("lib_cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? t("lib_saving") : t("lib_save")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addWordModalNode}

      <MobileBottomTabbar />
    </div>
  );
}
