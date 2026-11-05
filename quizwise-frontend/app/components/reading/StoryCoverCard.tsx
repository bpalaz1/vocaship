"use client";

import React from "react";
import { CuratedStory } from "../../data/stories/types";
import StoryVectorCover from "./StoryVectorCover";
import { Clock, CheckCircle2, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export interface StoryCoverCardProps {
  story: CuratedStory | any;
  onSelect: (story: any) => void;
  isCompleted?: boolean;
  isInProgress?: boolean;
  progressPercent?: number;
  className?: string;
}

export default function StoryCoverCard({
  story,
  onSelect,
  isCompleted = false,
  isInProgress = false,
  progressPercent,
  className = "",
}: StoryCoverCardProps) {
  const { t } = useLanguage();

  const previewWords = (story.target_vocabulary || []).slice(0, 3);
  const targetWordsCount =
    story.target_vocabulary?.length ||
    story.target_words?.length ||
    0;

  return (
    <div
      onClick={() => onSelect(story)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(story);
        }
      }}
      className={`group relative w-[260px] sm:w-[280px] shrink-0 snap-start rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-indigo-400 select-none ${className}`}
    >
      {/* 16:9 Vektörel Kapak */}
      <div className="aspect-video relative overflow-hidden bg-slate-950">
        <StoryVectorCover
          category={story.category}
          topic={story.topic}
          title={story.title}
          level={story.level}
          cefr={story.cefr}
          isUserStory={story.isUserStory}
          isCareerCase={story.isCareerCase}
        />

        {/* Hafif degrade gölgelendirme */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Sol Üst: Seviye Rozeti */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md bg-slate-900/90 text-indigo-300 border border-indigo-500/30 shadow-sm flex items-center gap-1">
            {story.level?.startsWith("⭐") ? (
              <span>{story.level}</span>
            ) : (
              <span>{story.cefr || story.level || "B1"}</span>
            )}
          </span>
          {story.isCareerCase && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-600/90 text-white backdrop-blur-md shadow-sm">
              {t("badge_case", "Vaka")}
            </span>
          )}
        </div>

        {/* Sağ Üst: Okuma Süresi */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-md bg-black/60 text-slate-300 border border-white/10 flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{story.readTime || "2 dk"}</span>
          </span>
        </div>

        {/* Sol Alt / Sağ Alt Durum Rozetleri */}
        {isCompleted && (
          <div className="absolute bottom-2 right-2 z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 flex items-center gap-1 shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>{t("badge_read_done", "Okundu")}</span>
            </span>
          </div>
        )}

        {isInProgress && !isCompleted && (
          <div className="absolute bottom-2 right-2 z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 flex items-center gap-1 shadow-md shadow-amber-500/20">
              <span>⏳ {progressPercent ? `%${progressPercent}` : "Devam Ediyor"}</span>
            </span>
          </div>
        )}
      </div>

      {/* Kart İçerik Alanı */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate">{story.topic || story.categoryName || "İngilizce Okuma"}</span>
          </div>

          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {story.title}
          </h4>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {story.desc || story.content?.slice(0, 90) + "..."}
          </p>
        </div>

        {/* Hedef Kelimeler Önizleme */}
        {previewWords.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {previewWords.map((item: any, idx: number) => {
              const word = typeof item === "string" ? item : item.word;
              return (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-indigo-300 border border-slate-700/60 font-mono"
                >
                  {word}
                </span>
              );
            })}
            {targetWordsCount > previewWords.length && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 font-mono">
                +{targetWordsCount - previewWords.length}
              </span>
            )}
          </div>
        )}

        {/* Alt Bilgi Çubuğu: Kelime Sayısı & Oku Butonu */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono">
            {typeof story.wordCount === "number"
              ? `${story.wordCount} Kelime`
              : story.wordCount || "~100 Kelime"}
          </span>

          <span className="font-bold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all flex items-center gap-1">
            <span>{t("action_read_now", "Oku")}</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

