"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Mic,
  Brain,
  Layers,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Volume2,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Zap,
} from "lucide-react";
import {
  HubType,
  CareerHubKey,
  CareerHubItem,
  ACADEMIC_HUBS,
  PROFESSIONAL_HUBS,
  ALL_CAREER_HUBS,
} from "../data/careerHubs";
import { useTranslation } from "../context/LanguageContext";

interface CareerHubShowcaseProps {
  onStartStudy?: (hub: CareerHubItem) => void;
  speakText?: (text: string) => void;
}

export default function CareerHubShowcase({ onStartStudy, speakText }: CareerHubShowcaseProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<HubType>("professional");
  const [selectedHubKey, setSelectedHubKey] = useState<CareerHubKey>("project_controls");

  const currentHubList = activeTab === "academic" ? ACADEMIC_HUBS : PROFESSIONAL_HUBS;
  const activeHub =
    ALL_CAREER_HUBS.find((h) => h.key === selectedHubKey) || currentHubList[0];

  const handleTabChange = (tab: HubType) => {
    setActiveTab(tab);
    if (tab === "academic") {
      setSelectedHubKey("yds_yokdil");
    } else {
      setSelectedHubKey("project_controls");
    }
  };

  const handleLaunchCase = (hub: CareerHubItem) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vocaship_pending_reading_text", hub.readingCase.fullText);
      sessionStorage.setItem("vocaship_pending_reading_title", `${hub.icon} ${hub.titleDefault} — ${hub.readingCase.title}`);
    }
    router.push("/reading/custom");
  };

  const handleLaunchSpeaking = (hub: CareerHubItem) => {
    router.push(`/speaking?scenario=${hub.speakingScenarioId}`);
  };

  return (
    <section className="space-y-6">
      {/* SECTION HEADER & PRIMARY TABS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {t("career_hub_heading", "Mesleki & Akademik Kariyer Vitrini")}
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              11 Dikey Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {t(
              "career_hub_sub",
              "Sektörünüze özel hazır terimler, gerçek vaka okumaları ve C1 mülakat simülasyonları."
            )}
          </p>
        </div>

        {/* ACADEMIC / PROFESSIONAL SEGMENTED SWITCH */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange("academic")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "academic"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{t("hub_tab_academic", "🎓 Akademik Sınavlar")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("professional")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "professional"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{t("hub_tab_professional", "💼 Profesyonel Hub")}</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE CAREER PILLS */}
      <div className="relative">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {currentHubList.map((hub) => {
            const isSelected = hub.key === activeHub.key;
            return (
              <button
                key={hub.key}
                type="button"
                onClick={() => setSelectedHubKey(hub.key)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer border ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/30 scale-[1.02]"
                    : "bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span className="text-sm">{hub.icon}</span>
                <span>{t(hub.titleKey, hub.titleDefault)}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE CAREER HUB SPOTLIGHT CARD */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/30 border border-indigo-500/25 shadow-xl shadow-slate-950/60 backdrop-blur-md space-y-6">
        {/* TOP ROW: ICON, TITLE, LEVEL & BADGES */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-start space-x-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 shrink-0">
              {activeHub.icon}
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {t(activeHub.titleKey, activeHub.titleDefault)}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeHub.targetLevel}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {activeHub.cardCount}+ Terim
                </span>
              </div>
              <p className="text-xs text-indigo-300/90 font-medium mt-0.5">
                {t(activeHub.taglineKey, activeHub.taglineDefault)}
              </p>
            </div>
          </div>

          {/* BADGES / ACCREDITATIONS */}
          <div className="flex items-center flex-wrap gap-1.5">
            {activeHub.badges.map((b) => (
              <span
                key={b}
                className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/80 shadow-xs"
              >
                ✨ {b}
              </span>
            ))}
          </div>
        </div>

        {/* 3-PILLAR INTERACTIVE SHOWCASE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* PILLAR 1: SEKTÖREL TERİMLER & SM-2 FLASHCARD PREVIEW */}
          <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4 hover:border-slate-700 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <Layers className="w-3.5 h-3.5" />
                  {t("hub_section_vocab", "Sektörel Terimler & SM-2")}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeHub.cards.length} Önizleme
                </span>
              </div>

              {/* Sample Terms Pills */}
              <div className="flex flex-wrap gap-1">
                {activeHub.sampleWords.map((w) => (
                  <span
                    key={w}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {w}
                  </span>
                ))}
              </div>

              {/* Top Featured Card Preview */}
              {activeHub.cards[0] && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span className="text-sm font-extrabold text-indigo-300">
                      {activeHub.cards[0].word}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeHub.cards[0].phonetic}
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium text-[11px]">
                    {activeHub.cards[0].meaning}
                  </p>
                  <p className="text-[10px] text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-800/60">
                    "{activeHub.cards[0].exampleEn}"
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onStartStudy?.(activeHub)}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>{t("btn_study_hub_cards", "Desteyi Çalış (SM-2)")}</span>
            </button>
          </div>

          {/* PILLAR 2: MESLEKİ VAKA OKUMASI (READING CASE) */}
          <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4 hover:border-slate-700 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t("hub_section_case", "Vaka Analizi & Okuma")}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {activeHub.readingCase.level}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white line-clamp-1">
                {activeHub.readingCase.title}
              </h4>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed line-clamp-4 italic">
                "{activeHub.readingCase.snippet}"
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchCase(activeHub)}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-white font-bold text-xs active:scale-95 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("btn_open_hub_case", "Vakayı Oku & Çözümle")}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* PILLAR 3: UZMAN ROL YAPMA ODASI (SPEAKING LOUNGE) */}
          <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4 hover:border-slate-700 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  {t("hub_section_speaking", "Uzman Rol Yapma")}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  C1 Roleplay
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-wider">
                  Partner Rolü:
                </span>
                <p className="text-xs font-bold text-white">
                  {activeHub.titleDefault}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  Gerçekçi sektör mülakatı: AI uzman rol partnerinizle konuşun, anında gramer ve C1 alternatif geri bildirimi alın.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchSpeaking(activeHub)}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{t("btn_start_hub_speaking", "Rol Yapmaya Başla")}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
