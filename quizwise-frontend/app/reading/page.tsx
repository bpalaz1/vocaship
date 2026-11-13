"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ReadingRoom from "../components/reading/ReadingRoom";
const ShareModal = dynamic(() => import("../components/ShareModal"), { ssr: false });
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import SettingsModal from "../components/settings/SettingsModal";
import { Loader2 } from "lucide-react";
import {
  fetchDecksList,
  getActiveDeckId,
  setActiveDeckId,
  subscribeToActiveDeck,
} from "../utils/activeDeckStore";

export default function ReadingPage() {
  const { t } = useLanguage();
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useProfile();
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
  const [activeDeckId, setActiveDeckIdState] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemType: "deck" | "story";
    itemId: string;
    story?: any;
  } | null>(null);

  useEffect(() => {
    async function loadDecks() {
      setLoading(true);
      const list = await fetchDecksList();
      setDecks(list);
      const currentId = getActiveDeckId() || list[0]?.id || "";
      setActiveDeckIdState(currentId);
      if (currentId && !getActiveDeckId()) {
        setActiveDeckId(currentId);
      }
      setLoading(false);
    }
    loadDecks();

    const unsubscribe = subscribeToActiveDeck((newId) => {
      setActiveDeckIdState(newId);
    });
    return () => unsubscribe();
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
          selectedDeckId={activeDeckId || decks[0]?.id || ""}
          initialStory={null}
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

      {/* Merkezi Hesap & Tercihler Modalı */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </main>
  );
}
