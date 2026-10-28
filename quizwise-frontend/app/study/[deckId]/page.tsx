"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  RotateCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Share2,
  Volume2,
  Trophy,
  RotateCcw,
  Coins,
  CheckCircle2,
  BrainCircuit,
  Flame,
  Check,
  X,
  Target
} from "lucide-react";
import dynamic from "next/dynamic";
const ShareModal = dynamic(() => import("../../components/ShareModal"), { ssr: false });
import PronunciationCoach from "../../components/PronunciationCoach";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE } from "../../config";

interface Card {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{ definition: string; translation: string; part_of_speech?: string }>;
  example_sentences?: Array<{ en?: string; tr?: string; target?: string; native?: string }>;
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

export default function StudyRoomPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = (params?.deckId as string) || "";
  const { t } = useLanguage();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // Çalışma Durumu
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // 1. Deste ve Kartları Çek
  useEffect(() => {
    if (!deckId) return;

    const loadDeckData = async () => {
      setLoading(true);
      try {
        const [decksRes, cardsRes] = await Promise.all([
          fetch(`${API_BASE}/decks`),
          fetch(`${API_BASE}/decks/${deckId}/cards`),
        ]);

        if (decksRes.ok) {
          const allDecks: Deck[] = await decksRes.json();
          const currentDeck = allDecks.find((d) => String(d.id) === String(deckId));
          setDeck(currentDeck || null);
        } else {
          setDeck(null);
        }

        if (cardsRes.ok) {
          const cardsData: Card[] = await cardsRes.json();
          setCards(Array.isArray(cardsData) ? cardsData : []);
        } else {
          setCards([]);
        }
      } catch (err) {
        console.warn("Deste bilgileri alınamadı (sunucu kapalı veya ağ hatası):", err);
        setDeck(null);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadDeckData();
  }, [deckId]);

  // 2. Klavye Kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted || cards.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isFlipped) {
          handleBinaryReview(false);
        } else {
          handlePrev();
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isFlipped) {
          handleBinaryReview(true);
        } else {
          handleNext();
        }
      } else if (isFlipped) {
        if (e.key === "1") handleBinaryReview(false);
        else if (e.key === "2") handleBinaryReview(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentIndex, cards.length, sessionCompleted]);

  // 3. TTS Seslendirme
  const speakText = (text: string, langCode: string = "en", e?: React.MouseEvent) => {
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
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      triggerSessionEnd();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const triggerSessionEnd = () => {
    setSessionCompleted(true);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // 4. İkili SM-2 Değerlendirmesi ve Zayıf Nokta Avcısı
  const handleBinaryReview = async (isCorrect: boolean) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    setReviewedCount((prev) => prev + 1);

    try {
      // Backend Zayıf Nokta Avcısı ve SM-2 güncellemesi
      const reviewRes = await fetch(`${API_BASE}/cards/${currentCard.id}/review-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_correct: isCorrect }),
      });

      if (!reviewRes.ok) {
        // Geriye dönük uyumluluk yedek çağrısı
        await fetch(`${API_BASE}/study/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ card_id: currentCard.id, is_correct: isCorrect, rating: isCorrect ? 4 : 1 }),
        });
      } else {
        const updatedData = await reviewRes.json();
        // Kartın zayıf nokta durumunu yerel state'te güncelle
        setCards((prev) =>
          prev.map((c, i) => (i === currentIndex ? { ...c, needs_review: updatedData.needs_review } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }

    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((p) => p + 1), 120);
    } else {
      triggerSessionEnd();
    }
  };

  const restartStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setReviewedCount(0);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <RotateCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm">Kartlar yükleniyor...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Bu Destede Henüz Kart Yok</h2>
        <p className="text-sm text-slate-400 mb-6">
          Çalışmaya başlamak için ana sayfadan bu desteye kelime ekleyebilirsin.
        </p>
        <Link
          href="/"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Destelere Dön ve Kart Ekle</span>
        </Link>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* ÜST BİLGİ & GERİ DÖNÜŞ ÇUBUĞU */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>{t("btn_back_to_decks", "Destelere Dön")}</span>
          </Link>
          <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
            {deck?.title || "Deste"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-300 transition"
            title="Desteyi Sınıfla Paylaş"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{t("btn_share", "Paylaş")}</span>
          </button>
          <Link
            href={`/games/gold-quest?deckId=${deckId}`}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-xs font-bold text-amber-300 transition shadow-sm"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t("btn_top_treasure_raid", "Hazine Avı")}</span>
          </Link>
        </div>
      </div>

      {!sessionCompleted ? (
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* İLERLEME ÇUBUĞU */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>
              Kart {currentIndex + 1} / {cards.length}
            </span>
            <span className="font-semibold text-indigo-400">
              {t("progress_completed", "{pct}% Tamamlandı", { pct: progressPercent })}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-6 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* FLIP KART (ÖN / ARKA) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[320px] sm:min-h-[380px] bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 sm:p-10 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 shadow-2xl relative group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <span className="uppercase tracking-wider font-bold">
                  {isFlipped ? "TANIM & DETAY" : t("label_term_word", "TERİM / KELİME")}
                </span>
                {currentCard.needs_review && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                    🎯 {t("weak_spot_indicator", "Zayıf Nokta")}
                  </span>
                )}
              </div>
              <span className="text-[11px] bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-400 font-medium">
                {t("flip_hint_space", "Çevirmek için tıkla veya Boşluk / Space")}
              </span>
            </div>

            <div className="text-center py-6 flex flex-col items-center justify-center">
              {!isFlipped ? (
                <>
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                      {currentCard.word}
                    </h2>
                    <button
                      type="button"
                      onClick={(e) => speakText(currentCard.word, deck?.target_lang || "en", e)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-indigo-300 hover:text-white transition shadow-sm"
                      title="Seslendir"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  {currentCard.phonetic && (
                    <span className="text-sm font-mono text-indigo-400 mt-1">
                      {currentCard.phonetic}
                    </span>
                  )}
                </>
              ) : (
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center justify-center space-x-3">
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-emerald-400">
                      {currentCard.meanings?.[0]?.translation || currentCard.meanings?.[0]?.definition || "Tanım"}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) =>
                        speakText(
                          currentCard.meanings?.[0]?.translation || "",
                          deck?.native_lang || "tr",
                          e
                        )
                      }
                      className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-emerald-300 hover:text-white transition shadow-sm"
                      title="Seslendir"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {currentCard.example_sentences && currentCard.example_sentences.length > 0 ? (
                    <div className="pt-3 border-t border-slate-800 text-left bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-200 italic mb-1">
                          &quot;{currentCard.example_sentences[0].target || currentCard.example_sentences[0].en}&quot;
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-400">
                          {currentCard.example_sentences[0].native || currentCard.example_sentences[0].tr}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-center sm:justify-start">
                        <PronunciationCoach
                          targetSentence={
                            currentCard.example_sentences[0].target ||
                            currentCard.example_sentences[0].en ||
                            currentCard.word
                          }
                          lang={deck?.target_lang === "tr" ? "tr-TR" : "en-US"}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-800 flex justify-center">
                      <PronunciationCoach
                        targetSentence={currentCard.word}
                        lang={deck?.target_lang === "tr" ? "tr-TR" : "en-US"}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs text-slate-500">
              <span>{t("flip_nav_hint", "Sol / Sağ Ok tuşları ile gezinebilirsin")}</span>
              <span className="text-indigo-400 font-semibold">{isFlipped ? "Kelimeni Puanla ↓" : t("btn_flip_card", "Kartı Çevir")}</span>
            </div>
          </div>

          {/* İKİLİ ETKİLEŞİM BUTONLARI (KART ÇEVRİLDİĞİNDE) */}
          {isFlipped ? (
            <div className="w-full mt-6 space-y-2">
              <span className="text-xs text-slate-400 text-center block font-semibold">
                {t("binary_feedback_hint", "Bu kelimeyi hatırladın mı? (Klavye: 1 = Bilemedim, 2 = Biliyorum)")}
              </span>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleBinaryReview(false)}
                  className="flex items-center justify-center space-x-2 py-3.5 sm:py-4 px-4 rounded-2xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm transition text-center shadow-sm active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span>{t("btn_dont_know", "Bilemedim / Hatırlayamadım (✗)")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBinaryReview(true)}
                  className="flex items-center justify-center space-x-2 py-3.5 sm:py-4 px-4 rounded-2xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm transition text-center shadow-sm active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t("btn_i_know", "Biliyorum / Doğru (✓)")}</span>
                </button>
              </div>
            </div>
          ) : (
            /* ÖNCEKİ / SONRAKİ BUTONLARI */
            <div className="w-full flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t("btn_prev", "Önceki")}</span>
              </button>
              <button
                onClick={() => setIsFlipped(true)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/25"
              >
                {t("btn_show_answer", "Cevabı Göster")}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                <span>{t("btn_next", "Sonraki")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* SEANS TAMAMLANDI EKRANI */
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Tebrikler! Seans Tamamlandı</h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Bu destedeki tüm kartları başarıyla gözden geçirdin.
          </p>

          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Gözden Geçirilen</span>
              <span className="text-xl font-bold text-white">{cards.length} Kart</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-amber-400 font-bold block mb-1">Kazanılan XP</span>
              <span className="text-xl font-black text-amber-400">+{cards.length * 10} XP</span>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            <button
              onClick={restartStudy}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs sm:text-sm text-white transition shadow-md shadow-indigo-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tekrar Çalış</span>
            </button>
            <Link
              href={`/games/gold-quest?deckId=${deckId}`}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-md"
            >
              <Coins className="w-4 h-4" />
              <span>{t("btn_start_treasure_action", "Hazine Avını Başlat! 🏴‍☠️ →")}</span>
            </Link>
            <Link
              href="/"
              className="w-full block px-4 py-2.5 text-xs text-slate-400 hover:text-white transition"
            >
              Destelerim Sayfasına Dön
            </Link>
          </div>
        </div>
      )}

      {/* PAYLAŞIM MODALI */}
      {shareModalOpen && deck && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={deck.title}
          itemType="deck"
          itemId={deck.id}
          deck={deck}
          cards={cards}
        />
      )}
    </main>
  );
}
