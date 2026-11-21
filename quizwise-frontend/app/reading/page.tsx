"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ReadingRoom from "../components/reading/ReadingRoom";
const ShareModal = dynamic(() => import("../components/ShareModal"), { ssr: false });
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { useAppTheme } from "../context/ThemeContext";
import SettingsModal from "../components/settings/SettingsModal";
import { Loader2 } from "lucide-react";
import { ALL_STORIES } from "../data/stories";
import {
  fetchDecksList,
  getActiveDeckId,
  setActiveDeckId,
  subscribeToActiveDeck,
} from "../utils/activeDeckStore";

// Yerel Yedek Hikayeler (A1, B1, C1 Seviye Hazır Okuma Metinleri + Yerleşik Katalog)
export const LOCAL_FALLBACK_STORIES = [
  {
    id: "fallback_a1_morning_coffee",
    title: "A Sunny Morning by the Sea",
    level: "A1",
    cefr: "A1 Başlangıç",
    category: "adult_basic",
    topic: "Günlük Yaşam",
    readTime: "2 dk",
    wordCount: 110,
    coverImage:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    desc: "Selin wakes up early on a bright Saturday morning to walk along the coast and enjoy a warm cup of coffee.",
    content:
      "Every Saturday morning, Selin wakes up early when the sun rises over the calm blue sea.\nShe puts on her comfortable walking shoes and steps outside into the fresh morning air. A gentle breeze carries the smell of warm bread from the neighborhood bakery.\nSelin walks along the quiet seaside path and watches the seagulls fly above the waves. After her walk, she sits at a small wooden table in her favorite cafe and orders a hot cup of coffee. Starting the weekend slowly always makes her feel peaceful and happy.",
    target_words: ["gentle", "coast", "peaceful"],
    target_vocabulary: [
      {
        word: "gentle",
        phonetic: "/ˈdʒen.təl/",
        turkish_meaning: "Yumuşak, hafif, nazik",
        context_sentence: "A gentle breeze carries the smell of warm bread.",
      },
      {
        word: "peaceful",
        phonetic: "/ˈpiːs.fəl/",
        turkish_meaning: "Huzurlu, sakin",
        context_sentence: "Starting the weekend slowly always makes her feel peaceful.",
      },
      {
        word: "breeze",
        phonetic: "/briːz/",
        turkish_meaning: "Hafif esinti, meltem",
        context_sentence: "She enjoys the cool morning breeze by the sea.",
      },
    ],
    comprehension_questions: [
      {
        question: "What does Selin do every Saturday morning?",
        options: [
          "A) She walks by the sea and drinks coffee at her favorite cafe",
          "B) She stays at home and watches television all day",
          "C) She travels to another city by train",
          "D) She works late at her office",
        ],
        correct_answer_index: 0,
      },
    ],
  },
  {
    id: "fallback_b1_hidden_library",
    title: "The Secret Clockmaker of Prague",
    level: "B1",
    cefr: "B1 Orta",
    category: "adult_intermediate",
    topic: "Macera & Kültür",
    readTime: "4 dk",
    wordCount: 165,
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    desc: "While exploring an old bookstore in Prague, Lukas discovers an intricate brass compass that reveals a forgotten workshop.",
    content:
      "During a rainy autumn afternoon in Prague, a young historian named Lukas took shelter inside a dusty antique shop near the Old Town Square.\nWhile browsing the wooden shelves, he noticed a curious brass pocket watch hidden behind a row of leather-bound journals. Unlike ordinary timepieces, its dial was engraved with constellations instead of numbers.\nWhen Lukas gently wound the crown, a hidden compartment clicked open, revealing a folded parchment map. The map led him through narrow cobblestone alleys to an abandoned tower where a seventeenth-century astronomer had once built instruments to track the stars.",
    target_words: ["curious", "intricate", "discover"],
    target_vocabulary: [
      {
        word: "curious",
        phonetic: "/ˈkjʊə.ri.əs/",
        turkish_meaning: "Merak uyandıran, ilginç",
        context_sentence: "He noticed a curious brass pocket watch on the shelf.",
      },
      {
        word: "engraved",
        phonetic: "/ɪnˈɡreɪvd/",
        turkish_meaning: "Oyulmuş, işlenmiş, kazınmış",
        context_sentence: "Its dial was engraved with constellations.",
      },
      {
        word: "abandoned",
        phonetic: "/əˈbæn.dənd/",
        turkish_meaning: "Terk edilmiş",
        context_sentence: "The map led him to an abandoned tower.",
      },
    ],
    comprehension_questions: [
      {
        question: "What did Lukas find inside the hidden compartment of the pocket watch?",
        options: [
          "A) A folded parchment map leading to an old astronomer's tower",
          "B) A modern digital keycard",
          "C) A ticket for a train journey",
          "D) A collection of silver coins",
        ],
        correct_answer_index: 0,
      },
    ],
  },
  {
    id: "fallback_c1_cognitive_resilience",
    title: "The Architecture of Cognitive Resilience",
    level: "C1",
    cefr: "C1 İleri",
    category: "adult_advanced",
    topic: "Felsefe & İleri Düşünce",
    readTime: "5 dk",
    wordCount: 195,
    coverImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    desc: "An exploration of how deliberate mental stillness and deep reading counterbalance the fragmentation of modern digital attention.",
    content:
      "In an era characterized by relentless digital stimuli and algorithmic interruptions, the capacity to sustain undivided attention has become a rare cognitive advantage.\nNeuroscientists emphasize that deep reading—unlike rapid skimming across fragmented screens—activates intricate neural pathways responsible for critical synthesis, empathy, and long-term memory consolidation.\nBy cultivating deliberate intervals of solitude and intellectual focus, individuals can mitigate cognitive fatigue and rebuild the mental resilience required to navigate complex philosophical and professional challenges.",
    target_words: ["relentless", "mitigate", "resilience"],
    target_vocabulary: [
      {
        word: "relentless",
        phonetic: "/rɪˈlent.ləs/",
        turkish_meaning: "Durmak bilmeyen, aralıksız, amansız",
        context_sentence: "In an era characterized by relentless digital stimuli...",
      },
      {
        word: "mitigate",
        phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
        turkish_meaning: "Hafifletmek, etkisini azaltmak",
        context_sentence: "Individuals can mitigate cognitive fatigue through deep focus.",
      },
      {
        word: "resilience",
        phonetic: "/rɪˈzɪl.jəns/",
        turkish_meaning: "Direnç, esneklik, çabuk toparlanma gücü",
        context_sentence: "Deep reading helps rebuild mental resilience.",
      },
    ],
    comprehension_questions: [
      {
        question: "According to the passage, how does deep reading benefit the brain compared to rapid skimming?",
        options: [
          "A) It activates neural pathways for critical synthesis, empathy, and memory consolidation",
          "B) It increases the speed of social media notifications",
          "C) It eliminates the need for long-term memory",
          "D) It encourages multitasking across multiple screens",
        ],
        correct_answer_index: 0,
      },
    ],
  },
  ...ALL_STORIES,
];

export default function ReadingPage() {
  const { t } = useLanguage();
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useProfile();
  const { isDark } = useAppTheme();
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
  const [activeDeckId, setActiveDeckIdState] = useState<string>("");
  const [stories, setStories] = useState<any[]>(LOCAL_FALLBACK_STORIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemType: "deck" | "story";
    itemId: string;
    story?: any;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReadingRoomData() {
      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        // 1. Hikayeleri backend'den çekmeyi dene (3 saniye AbortController timeout ile)
        const storiesPromise = fetch(`${API_BASE}/api/v1/reading/stories`, {
          signal: controller.signal,
        })
          .then(async (res) => {
            if (!res.ok) return null;
            const data = await res.json();
            return Array.isArray(data) && data.length > 0 ? data : null;
          })
          .catch(() => null);

        // 2. Desteleri 3 saniye timeout korumalı çek (yalnızca kullanıcının gerçek desteleri)
        const decksPromise = fetchDecksList().catch(() => []);

        const [remoteStories, deckList] = await Promise.all([storiesPromise, decksPromise]);

        if (!isMounted) return;

        if (remoteStories && remoteStories.length > 0) {
          setStories([...remoteStories, ...LOCAL_FALLBACK_STORIES]);
        } else {
          setStories(LOCAL_FALLBACK_STORIES);
        }

        const finalDecks = Array.isArray(deckList) ? deckList : [];
        setDecks(finalDecks);

        const storedId = getActiveDeckId();
        const currentId =
          storedId && finalDecks.some((d) => d.id === storedId)
            ? storedId
            : finalDecks[0]?.id || "";
        setActiveDeckIdState(currentId);
        if (currentId && !storedId) {
          setActiveDeckId(currentId);
        }
      } catch (err) {
        console.warn("Okuma Odası backend bağlantısı zaman aşımına uğradı, yerel hikayeler yüklendi:", err);
        if (isMounted) {
          setStories(LOCAL_FALLBACK_STORIES);
          setDecks([]);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReadingRoomData();

    const unsubscribe = subscribeToActiveDeck((newId) => {
      setActiveDeckIdState(newId);
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] w-full transition-colors duration-200 ${
        isDark ? "bg-[#0B0F19] text-slate-100" : "bg-[#dce3ec] text-slate-900"
      }`}
    >
      <main className="flex-1 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
        {isLoading ? (
          <div className={`flex flex-col items-center justify-center py-24 space-y-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
            <p className="text-sm font-medium">{t("nav_reading", "Okuma Odası")}...</p>
          </div>
        ) : (
          <ReadingRoom
            decks={decks}
            selectedDeckId={activeDeckId || decks[0]?.id || ""}
            stories={stories}
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
    </div>
  );
}
