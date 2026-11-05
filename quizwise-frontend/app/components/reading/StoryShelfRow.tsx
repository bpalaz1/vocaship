"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import StoryCoverCard from "./StoryCoverCard";
import { StoryShelf } from "../../data/storyLibrary";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

export interface StoryShelfRowProps {
  shelf: StoryShelf;
  onSelectStory: (story: any) => void;
  completedStoryIds?: string[];
  inProgressStoryIds?: string[];
  className?: string;
}

export default function StoryShelfRow({
  shelf,
  onSelectStory,
  completedStoryIds = [],
  inProgressStoryIds = [],
  className = "",
}: StoryShelfRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, shelf.stories]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!shelf.stories || shelf.stories.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-3.5 ${className}`}>
      {/* Şerit Üst Başlık & Kontroller */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg shrink-0">{shelf.icon}</span>
            <h3 className="text-base sm:text-lg font-bold text-white truncate">
              {shelf.title}
            </h3>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${shelf.colorScheme.badgeBg} ${shelf.colorScheme.badgeText} ${shelf.colorScheme.border} shrink-0`}
            >
              {shelf.badge}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60 shrink-0">
              {shelf.stories.length} Hikaye
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-1">
            {shelf.subtitle}
          </p>
        </div>

        {/* Sağ/Sol Kaydırma Ok Butonları */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Sola kaydır"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              canScrollLeft
                ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm active:scale-95"
                : "bg-slate-900/50 text-slate-600 border-slate-800/60 opacity-40 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Sağa kaydır"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              canScrollRight
                ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm active:scale-95"
                : "bg-slate-900/50 text-slate-600 border-slate-800/60 opacity-40 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Yatay Kayan Hikaye Kartları Şeridi */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-none flex gap-4 pb-3 pt-1 scroll-smooth snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {shelf.stories.map((story) => {
          const isCompleted = completedStoryIds.includes(story.id);
          const isInProgress = inProgressStoryIds.includes(story.id);

          return (
            <StoryCoverCard
              key={story.id}
              story={story}
              onSelect={onSelectStory}
              isCompleted={isCompleted}
              isInProgress={isInProgress}
            />
          );
        })}
      </div>
    </section>
  );
}

