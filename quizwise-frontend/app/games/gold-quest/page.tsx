"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoldQuestGame, { FlashcardItem } from "../../components/games/GoldQuestGame";
import { triggerFloatingXP } from "../../components/FloatingXP";
import { API_BASE } from "../../config";
import { useLanguage } from "../../context/LanguageContext";
import { Loader2, Coins, ArrowLeft, Sparkles, Layers } from "lucide-react";

function GoldQuestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDeckId = searchParams.get("deckId");
  const { t } = useLanguage();

  const [decks, setDecks] = useState<{ id: string; title: string; card_count?: number }[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(initialDeckId || "");
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);

  // 1. Desteleri çek
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const res = await fetch(`${API_BASE}/decks`);
        if (res.ok) {
          const data = await res.json();
          setDecks(Array.isArray(data) ? data : []);
          if (!selectedDeckId && data && data.length > 0) {
            setSelectedDeckId(data[0].id);
          }
        } else {
          console.warn(`[fetchDecks] HTTP ${res.status}: Boş deste listesi kullanılıyor.`);
          setDecks([]);
        }
      } catch (err) {
        console.warn("Desteler yüklenemedi (sunucu kapalı veya ağ hatası), boş liste kullanılıyor:", err);
        setDecks([]);
      } finally {
        setLoadingDecks(false);
      }
    };
    fetchDecks();
  }, []);

  // 2. Seçili destenin kartlarını çek
  useEffect(() => {
    if (!selectedDeckId) return;

    const fetchCards = async () => {
      setLoadingCards(true);
      try {
        const res = await fetch(`${API_BASE}/decks/${selectedDeckId}/cards`);
        if (res.ok) {
          const data = await res.json();
          setCards(data || []);
        }
      } catch (err) {
        console.error("Kartlar yüklenemedi:", err);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCards();
  }, [selectedDeckId]);

  const activeDeckTitle = decks.find((d) => d.id === selectedDeckId)?.title || "Kelime Destesi";

  const handleAwardXP = async (amount: number, label: string) => {
    try {
      await fetch(`${API_BASE}/gamification/award-xp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "gold_quest_win",
          custom_xp: amount,
          description: `Gold Quest: ${label}`,
        }),
      });
      triggerFloatingXP(amount, label);
    } catch (e) {
      console.error(e);
    }
  };

  if (loadingDecks) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm font-semibold">Hazine Avı yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto">
      {/* Üst Deste Seçici Barı (Oyun Başlamadan Önce Değiştirme İmkanı) */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-md">
        <button
          onClick={() => router.push("/games")}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>{t("btn_back_to_arena", "Arenaya Dön")}</span>
        </button>

        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-medium">{t("label_target_deck", "Hedef Deste:")}</span>
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:border-amber-500 outline-none"
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.card_count || 0} kart)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingCards ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-sm">Destenin kelimeleri hazırlanıyor...</p>
        </div>
      ) : (
        <GoldQuestGame
          cards={cards}
          deckTitle={activeDeckTitle}
          onClose={() => router.push("/games")}
          onAwardXP={handleAwardXP}
        />
      )}
    </div>
  );
}

export default function GoldQuestPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    }>
      <GoldQuestContent />
    </Suspense>
  );
}
