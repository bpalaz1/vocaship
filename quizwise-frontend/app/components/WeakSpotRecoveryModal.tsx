"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Check,
  RotateCw,
  Volume2,
  Trophy,
  Target,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Flame,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE } from "../config";

export interface WeakSpotCard {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{ definition?: string; translation?: string; part_of_speech?: string }>;
  example_sentences?: Array<{ en?: string; tr?: string; target?: string; native?: string }>;
  collocations?: string[];
  grammar_notes?: string;
  mistake_count?: number;
  consecutive_correct?: number;
  needs_review?: boolean;
}

interface WeakSpotRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMasteredWord?: (cardId: string) => void;
  onRefreshNeeded?: () => void;
  onAllWeakSpotsCleared?: () => void;
}

export default function WeakSpotRecoveryModal({
  isOpen,
  onClose,
  onMasteredWord,
  onRefreshNeeded,
  onAllWeakSpotsCleared,
}: WeakSpotRecoveryModalProps) {
  const { t } = useLanguage();
  const [cards, setCards] = useState<WeakSpotCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [clearedCount, setClearedCount] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [allClearedCelebration, setAllClearedCelebration] = useState(false);

  // 1. Zayıf kartları API'den çek
  useEffect(() => {
    if (!isOpen) return;

    const fetchWeakSpots = async () => {
      setLoading(true);
      setSessionFinished(false);
      setAllClearedCelebration(false);
      setCurrentIndex(0);
      setIsFlipped(false);
      setClearedCount(0);
      try {
        const res = await fetch(`${API_BASE}/cards/weak-spots?limit=50`);
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards || []);
        }
      } catch (err) {
        console.error("Zayıf noktalar çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeakSpots();
  }, [isOpen]);

  // 2. Klavye kısayolları
  useEffect(() => {
    if (!isOpen || sessionFinished || cards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleAnswer(false);
        } else if (e.key === "2" || e.key === "ArrowRight") {
          e.preventDefault();
          handleAnswer(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFlipped, currentIndex, cards.length, sessionFinished]);

  // 3. TTS Telaffuz
  const speakText = (text: string, langCode: string = "en", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === "tr" ? "tr-TR" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // 4. İkili Cevaplama (Biliyorum / Bilemedim)
  const handleAnswer = async (isCorrect: boolean) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      const res = await fetch(`${API_BASE}/cards/${currentCard.id}/review-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_correct: isCorrect }),
      });

      if (res.ok) {
        const updateData = await res.json();
        // Eğer kart kurtarıldıysa (consecutive_correct >= 2)
        if (!updateData.needs_review) {
          setClearedCount((prev) => prev + 1);
          if (onMasteredWord) onMasteredWord(currentCard.id);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Sıradaki karta geç
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((p) => p + 1), 120);
    } else {
      setSessionFinished(true);
      // Backend'deki güncel zayıf nokta sayısını kontrol et
      try {
        const checkRes = await fetch(`${API_BASE}/cards/weak-spots?limit=100`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          const remaining = checkData.total !== undefined ? checkData.total : (checkData.cards ? checkData.cards.length : 0);
          if (remaining === 0) {
            setAllClearedCelebration(true);
            if (onAllWeakSpotsCleared) {
              onAllWeakSpotsCleared();
            }
          }
        }
      } catch (err) {
        console.error("Zayıf nokta kontrol hatası:", err);
      }

      if (onRefreshNeeded) onRefreshNeeded();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/50 flex flex-col justify-between overflow-hidden">
        {/* Arka plan ışıltısı */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Üst Bar: Başlık ve Kapat Butonu */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shadow-inner">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {t("weak_spot_modal_title", "🎯 Zayıf Nokta Telafi Seansı")}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {cards.length > 0 && !sessionFinished
                  ? `${t("card_count_indicator", "Kart {cur} / {total}", { cur: currentIndex + 1, total: cards.length })} • ${t("weak_spot_auto_melt", "2 kez bilinenler otomatik eritilir")}`
                  : t("weak_spots_modal_desc", "Daha önce karıştırdığın kelimeler")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onRefreshNeeded) onRefreshNeeded();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="py-6 relative z-10">
          {loading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
              <RotateCw className="w-8 h-8 animate-spin text-rose-400" />
              <p className="text-xs text-slate-400">{t("scanning_weak_spots", "Zayıf noktaların taranıyor...")}</p>
            </div>
          ) : sessionFinished || cards.length === 0 ? (
            /* SEANS BİTİŞ EKRANI */
            <div className="py-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                {t("weak_spots_cleared", "Tebrikler! Seans Tamamlandı! 🎉")}
              </h3>

              {allClearedCelebration && (
                <div className="my-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 animate-bounce">
                  <span>{t("all_weak_spots_cleared", "🎉 Tüm zayıf noktalarını temizledin!")}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
                {allClearedCelebration
                  ? t("weak_spots_sealed", "Tüm zayıf noktalarını başarıyla temizleyip hafızana mühürledin! Harika bir çalışma.")
                  : clearedCount > 0
                  ? t("session_cleared_count", "Bu seansta {count} zayıf nokta başarıyla temizlendi!", { count: clearedCount })
                  : t("weak_spots_empty", "Şu anda hiç zayıf noktan yok! Harika gidiyorsun.")}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (onRefreshNeeded) onRefreshNeeded();
                  onClose();
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/30"
              >
                {t("btn_back_to_library", "Kütüphaneme Dön")}
              </button>
            </div>
          ) : (
            /* AKTİF FLASHCARD */
            <div className="space-y-4">
              {/* İlerleme Çubuğu */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.round(((currentIndex + 1) / cards.length) * 100)}%` }}
                />
              </div>

              {/* Tıklanabilir Çift Yüzlü Kart */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[260px] sm:min-h-[300px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-rose-500/30 hover:border-rose-400/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 shadow-xl relative group"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="uppercase tracking-wider font-bold text-rose-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    {isFlipped ? "TANIM & ANLAM" : t("label_target_word", "HEDEF KELİME")}
                  </span>
                  <span className="text-[11px] bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-400 font-medium">
                    {t("click_to_flip", "Çevirmek için tıkla / Boşluk")}
                  </span>
                </div>

                <div className="text-center py-6 flex flex-col items-center justify-center">
                  {!isFlipped ? (
                    <>
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          {currentCard.word}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => speakText(currentCard.word, "en", e)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-rose-300 hover:text-white transition shadow-sm"
                          title="Seslendir"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      {currentCard.phonetic && (
                        <span className="text-xs sm:text-sm font-mono text-rose-300/80">
                          {currentCard.phonetic}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3 max-w-md">
                      <div className="flex items-center justify-center space-x-3">
                        <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">
                          {currentCard.meanings?.[0]?.translation || currentCard.meanings?.[0]?.definition || "Tanım"}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) =>
                            speakText(currentCard.meanings?.[0]?.translation || "", "tr", e)
                          }
                          className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-emerald-300 hover:text-white transition"
                          title="Seslendir"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {currentCard.example_sentences && currentCard.example_sentences.length > 0 && (
                        <div className="pt-2 text-left bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                          <p className="text-xs text-slate-200 italic mb-0.5">
                            &quot;{currentCard.example_sentences[0].target || currentCard.example_sentences[0].en}&quot;
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {currentCard.example_sentences[0].native || currentCard.example_sentences[0].tr}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-slate-500">
                  {isFlipped ? t("evaluate_word", "Kelimeni değerlendir ↓") : t("flip_to_see_answer", "Cevabı görmek için kartı çevir")}
                </div>
              </div>

              {/* Butonlar */}
              {isFlipped ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAnswer(false)}
                    className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border-2 border-rose-500/50 text-rose-200 font-bold text-xs sm:text-sm transition active:scale-95 shadow-md cursor-pointer"
                  >
                    <X className="w-4 h-4 text-rose-400" />
                    <span>{t("btn_dont_know", "Bilemedim / Hatırlayamadım (✗)")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswer(true)}
                    className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border-2 border-emerald-500/50 text-emerald-200 font-bold text-xs sm:text-sm transition active:scale-95 shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{t("btn_i_know", "Biliyorum / Doğru (✓)")}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-rose-600/25 active:scale-95 cursor-pointer"
                >
                  {t("btn_show_answer_space", "Cevabı Göster (Boşluk)")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
