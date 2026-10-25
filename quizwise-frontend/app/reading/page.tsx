"use client";

import React, { useState, useEffect } from "react";
import ReadingRoom from "../components/reading/ReadingRoom";
import ShareModal from "../components/ShareModal";
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { useExperience } from "../context/ExperienceContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles
} from "lucide-react";

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

export default function ReadingPage() {
  const { t, currentLang } = useLanguage();
  const router = useRouter();

  const [activeMainTab, setActiveMainTab] = useState<"library" | "custom">("library");
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickPasteText, setQuickPasteText] = useState("");
  const [quickPasteTitle, setQuickPasteTitle] = useState("");
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
        setDecks(data || []);
      }
    } catch (err) {
      console.error("Desteler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleLaunchCustomReader = (text?: string, title?: string) => {
    const finalContent = text || quickPasteText;
    const finalTitle = title || quickPasteTitle || t("tab_custom_analyzer", "Serbest Makale & Analiz");
    if (finalContent.trim() && typeof window !== "undefined") {
      sessionStorage.setItem("vocaship_pending_reading_text", finalContent.trim());
      sessionStorage.setItem("vocaship_pending_reading_title", finalTitle);
    }
    router.push("/reading/custom");
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* 1. SADE VE ŞIK SAYFA BAŞLIĞI */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <span>📖</span>
          <span>{t("reading_page_title", "Okuma Odası")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          {t(
            "reading_page_subtitle",
            "Seviyenize uygun metinleri keşfedin veya kendi makalenizi yapıştırarak kelimeleri bağlamında öğrenin."
          )}
        </p>
      </div>

      {/* 2. TEMİZ 2 SEKMELİ YAPI (TABS) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveMainTab("library")}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeMainTab === "library"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <span>📚</span>
          <span>{t("reading_tab_library", "Hazır Kütüphane")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMainTab("custom")}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeMainTab === "custom"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <span>✍️</span>
          <span>{t("reading_tab_analyze_text", "Kendi Metnini Çözümle")}</span>
        </button>
      </div>

      {/* 3. SEKME İÇERİKLERİ */}
      {activeMainTab === "library" ? (
        loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm font-medium">{t("nav_reading")}...</p>
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
        )
      ) : (
        /* Kendi Metnini Çözümle */
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <textarea
            rows={6}
            value={quickPasteText}
            onChange={(e) => {
              setQuickPasteText(e.target.value);
              setQuickPasteTitle("");
            }}
            placeholder={t(
              "reading_textarea_placeholder",
              "The Economist, BBC veya akademik makale metnini buraya yapıştırın..."
            )}
            className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500/60 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition resize-none leading-relaxed shadow-inner"
          />

          {/* Textarea Alt Barı: Sol Alt 3 Mini Örnek Hapı + Sağ Alt Tek Eylem Butonu */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_SNIPPETS.map((snippet) => {
                const isSelected = quickPasteText === snippet.text;
                return (
                  <button
                    key={snippet.label}
                    type="button"
                    onClick={() => {
                      setQuickPasteText(snippet.text);
                      setQuickPasteTitle(snippet.title);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center space-x-1 active:scale-95 ${
                      isSelected
                        ? "bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-sm"
                        : "bg-slate-900/90 hover:bg-indigo-600/10 border-slate-700 hover:border-indigo-500/40 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>{snippet.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleLaunchCustomReader(quickPasteText, quickPasteTitle)}
              disabled={!quickPasteText.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 whitespace-nowrap cursor-pointer sm:ml-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("reading_btn_analyze", "Metni Çözümle & Oku")}</span>
            </button>
          </div>
        </div>
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
