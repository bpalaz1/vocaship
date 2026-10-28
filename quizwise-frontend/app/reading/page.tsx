"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ReadingRoom from "../components/reading/ReadingRoom";
const ShareModal = dynamic(() => import("../components/ShareModal"), { ssr: false });
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { Loader2 } from "lucide-react";

export default function ReadingPage() {
  const { t } = useLanguage();
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemType: "deck" | "story";
    itemId: string;
    story?: any;
  } | null>(null);

  const fetchDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/decks`);
      if (res.ok) {
        const data = await res.json();
        setDecks(Array.isArray(data) ? data : []);
      } else {
        console.warn(`[fetchDecks] HTTP ${res.status}: Boş deste listesi kullanılıyor.`);
        setDecks([]);
      }
    } catch (err) {
      console.warn("Desteler yüklenemedi (sunucu kapalı veya ağ hatası), boş liste kullanılıyor:", err);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <main className="flex-1 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-medium">{t("nav_reading", "Okuma Odası")}...</p>
        </div>
      ) : (
        <ReadingRoom
          decks={decks}
          selectedDeckId={decks[0]?.id || ""}
          onShareStory={(storyItem) => {
            setShareModalConfig({
              isOpen: true,
              title: storyItem.title,
              itemType: "story",
              itemId: storyItem.id || `story_${storyItem.title}`,
              story: storyItem,
            });
          }}
        />
      )}

      {shareModalConfig && (
        <ShareModal
          isOpen={shareModalConfig.isOpen}
          onClose={() => setShareModalConfig(null)}
          title={shareModalConfig.title}
          itemType={shareModalConfig.itemType}
          itemId={shareModalConfig.itemId}
          story={shareModalConfig.story}
        />
      )}
    </main>
  );
}

