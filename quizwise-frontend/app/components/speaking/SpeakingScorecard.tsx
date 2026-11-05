"use client";

import React from "react";
import {
  Award,
  Sparkles,
  FileCheck,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Star,
  CheckCircle2,
  Circle,
  Target,
  Zap,
  BookOpen,
} from "lucide-react";
import {
  calculateRelativeCEFRScore,
  calculateVocabularyDiversity,
  calculateKidsMetrics,
  KidsMetricsResult,
} from "../../utils/speakingMetrics";

export interface SpeakingScorecardProps {
  userName?: string;
  mascotImage?: string;
  mascotName?: string;
  isKidsMode?: boolean;
  targetLevel?: string;
  avatarState?: "idle" | "listening" | "speaking" | "thinking";
  activeMode: string;
  hasAnalyzed: boolean;
  scorecard: {
    fluency_score: number;
    vocabulary_highlight: string[];
    better_alternative: string;
    grammar_feedback?: string | null;
    improvement_suggestion?: string | null;
    improvement_original?: string | null;
    jargon_score?: number;
    idiomatic_phrase?: string;
  };
  metrics?: {
    spoken?: boolean;
    usedTargetWord?: boolean;
    sentenceComplete?: boolean;
  };
  scorecardTitle?: string;
  onAnalyze?: () => void;
  copiedAlt?: boolean;
  onCopyAlt?: () => void;
  t?: (key: string, fallback: string) => string;
}

export default function SpeakingScorecard({
  userName = "Öğrenci",
  mascotImage = "/avatars/sparky.png",
  mascotName = "Sparky",
  isKidsMode = false,
  targetLevel = "B2",
  avatarState = "idle",
  activeMode,
  hasAnalyzed,
  scorecard,
  scorecardTitle,
  onAnalyze,
  copiedAlt = false,
  onCopyAlt,
  t = (_key, fallback) => fallback,
  metrics,
}: SpeakingScorecardProps) {
  // 1. Dinamik Seviyeleme ve Metrik Hesaplamaları (Sıfır ek API maliyeti)
  const relativeScore = calculateRelativeCEFRScore(
    scorecard.fluency_score || 0,
    targetLevel
  );

  const vocabDiversity = calculateVocabularyDiversity(
    scorecard.vocabulary_highlight?.length || 0,
    targetLevel
  );

  const rawFluency = scorecard.fluency_score || 0;

  // Çocuk Modu Metrikleri
  const kidsMetrics: KidsMetricsResult = calculateKidsMetrics(
    metrics?.spoken,
    metrics?.usedTargetWord,
    metrics?.sentenceComplete,
    rawFluency,
    scorecard.vocabulary_highlight?.length || 0,
    hasAnalyzed
  );

  const dynamicTitle =
    scorecardTitle ||
    (isKidsMode
      ? "🌟 YILDIZLI GÖREV KARNESİ"
      : `${targetLevel.toUpperCase()} DEĞERLENDİRME KARNESİ`);

  const isLevelSuccess = relativeScore >= 70;

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. ÜST KART: KOMPAKT MASKOT VE KULLANICI PROFİL BAŞLIĞI                    */}
      {/* ========================================================================= */}
      <div
        data-testid="scorecard-mascot-user-header"
        className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-4 backdrop-blur-md flex items-center justify-between gap-3 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 min-w-0">
          {/* Dairesel, Zarif Maskot Avatarı */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500/40 p-1 bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
              <img
                src={mascotImage}
                alt={mascotName}
                className="w-full h-full rounded-full object-cover select-none"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/avatars/sparky.png";
                }}
              />
            </div>
            {/* Hafif yeşil 'Çevrim içi / Dinliyor' nabız göstergesi */}
            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
            </span>
          </div>

          {/* Kullanıcı Adı & Seviye Unvanı */}
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-white truncate">
                {userName}
              </h3>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                ({mascotName})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-indigo-300">
                {isKidsMode
                  ? "🌟 3 Yıldızlı Kaşif"
                  : `Seviye: ${targetLevel} • Akıcı İletişim`}
              </span>
            </div>
          </div>
        </div>

        {/* Dinleme / Konuşma Durum Rozeti */}
        <span
          className={`shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
            avatarState === "speaking"
              ? "bg-amber-500/15 border-amber-500/30 text-amber-300 animate-pulse"
              : avatarState === "listening"
              ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300 animate-pulse"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              avatarState === "speaking"
                ? "bg-amber-400"
                : avatarState === "listening"
                ? "bg-cyan-400"
                : "bg-emerald-400"
            }`}
          />
          <span>
            {avatarState === "speaking"
              ? "Konuşuyor"
              : avatarState === "listening"
              ? "Dinliyor"
              : "Çevrim içi"}
          </span>
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. PERFORMANS & SEVİYE DEĞERLENDİRME KARNESİ (ÇOCUK vs YETİŞKİN MODU)     */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 space-y-4 backdrop-blur-md">
        {/* Başlık Çubuğu */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            {isKidsMode ? (
              <Sparkles className="w-4 h-4 text-amber-400" />
            ) : (
              <Award
                className={`w-4 h-4 ${
                  !hasAnalyzed
                    ? "text-slate-500"
                    : activeMode === "casual"
                    ? "text-amber-400"
                    : activeMode === "problem_solving"
                    ? "text-rose-400"
                    : activeMode === "story_debate"
                    ? "text-indigo-400"
                    : "text-emerald-400"
                }`}
              />
            )}
            <span>{dynamicTitle}</span>
          </h2>
          {!hasAnalyzed && onAnalyze && (
            <button
              type="button"
              onClick={onAnalyze}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] transition cursor-pointer"
            >
              Analyze
            </button>
          )}
        </div>

        {/* ===================================================================== */}
        {/* ÇOCUK MODU: YILDIZLI GÖREV KARNESİ (STAR SCORECARD)                   */}
        {/* ===================================================================== */}
        {isKidsMode ? (
          <div className="space-y-4" data-testid="kids-star-scorecard">
            {/* 3 Parlak Altın Yıldız Görsel Alanı */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-slate-950/80 to-slate-950/90 border border-amber-500/30 relative overflow-hidden">
              <div className="flex items-center justify-center gap-4 py-2">
                {/* 1. Yıldız: Sesini Duyduk! */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`p-2.5 rounded-2xl transition-all duration-500 ${
                      kidsMetrics.spoken
                        ? "bg-amber-400/20 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-110"
                        : "bg-slate-900 border border-slate-800 opacity-40"
                    }`}
                  >
                    <Star
                      className={`w-8 h-8 transition-transform duration-500 ${
                        kidsMetrics.spoken
                          ? "text-amber-400 fill-amber-400 animate-pulse"
                          : "text-slate-600 fill-transparent"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">⭐ 1</span>
                </div>

                {/* 2. Yıldız: Hedef Kelime! */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`p-3.5 rounded-2xl transition-all duration-500 ${
                      kidsMetrics.usedTargetWord
                        ? "bg-amber-400/25 border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] scale-125"
                        : "bg-slate-900 border border-slate-800 opacity-40"
                    }`}
                  >
                    <Star
                      className={`w-10 h-10 transition-transform duration-500 ${
                        kidsMetrics.usedTargetWord
                          ? "text-amber-300 fill-amber-300 animate-bounce"
                          : "text-slate-600 fill-transparent"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">⭐⭐ 2</span>
                </div>

                {/* 3. Yıldız: Harika Cümle! */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`p-2.5 rounded-2xl transition-all duration-500 ${
                      kidsMetrics.sentenceComplete
                        ? "bg-amber-400/20 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-110"
                        : "bg-slate-900 border border-slate-800 opacity-40"
                    }`}
                  >
                    <Star
                      className={`w-8 h-8 transition-transform duration-500 ${
                        kidsMetrics.sentenceComplete
                          ? "text-amber-400 fill-amber-400 animate-pulse"
                          : "text-slate-600 fill-transparent"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">⭐⭐⭐ 3</span>
                </div>
              </div>

              {/* Çocuk Karnesi Başlığı & Yıldız Sayacı */}
              <div className="mt-2 text-center">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  {kidsMetrics.starsCount === 3
                    ? "🏆 3/3 Tam Puan! Muhteşem Başarı!"
                    : kidsMetrics.starsCount > 0
                    ? `🎉 ${kidsMetrics.starsCount}/3 Yıldız Toplandı!`
                    : "Konuş ve Yıldızları Topla!"}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {kidsMetrics.starsCount > 0
                    ? "Harika gidiyorsun, sesini duyurmaya devam et!"
                    : "Mikrofona dokun ve ilk yıldızını hemen kap!"}
                </p>
              </div>
            </div>

            {/* Görev Kontrol Listesi (Missions Checklist) */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Yıldız Görevleri</span>
              </h4>

              <div className="space-y-2 text-xs">
                {/* Görev 1 */}
                <div
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                    kidsMetrics.spoken
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {kidsMetrics.spoken ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className="font-semibold">⭐ Yıldız 1: Sesini Duyduk!</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      kidsMetrics.spoken
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {kidsMetrics.spoken ? "Tamamlandı" : "Bekleniyor"}
                  </span>
                </div>

                {/* Görev 2 */}
                <div
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                    kidsMetrics.usedTargetWord
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {kidsMetrics.usedTargetWord ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className="font-semibold">⭐⭐ Yıldız 2: Hedef Kelime</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      kidsMetrics.usedTargetWord
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {kidsMetrics.usedTargetWord ? "Harika!" : "Kullan"}
                  </span>
                </div>

                {/* Görev 3 */}
                <div
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                    kidsMetrics.sentenceComplete
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {kidsMetrics.sentenceComplete ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className="font-semibold">⭐⭐⭐ Yıldız 3: Harika Cümle</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      kidsMetrics.sentenceComplete
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {kidsMetrics.sentenceComplete ? "Başarıldı" : "Devam"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tebrik Rozeti & Mesajı: "🌟 Süper Kahraman Rozeti Kazandın! (+40 XP)" */}
            {kidsMetrics.starsCount > 0 && (
              <div
                data-testid="kids-superhero-badge"
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.25)] text-center space-y-1.5 animate-fadeIn"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>🌟 Süper Kahraman Rozeti Kazandın! (+40 XP)</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {kidsMetrics.starsCount === 3
                    ? "Bütün görevleri tamamladın! Sen gerçek bir İngilizce kahramanısın!"
                    : "Mükemmel başlangıç! Kalan yıldızları da alarak macerayı tamamla!"}
                </p>
              </div>
            )}

            {/* Sparky'nin Sihirli İpucu (Eğlenceli Cümle Önerisi) */}
            {hasAnalyzed && scorecard.better_alternative && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/35 space-y-2 shadow-md">
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider">
                    {mascotName}&apos;nin Sihirli İpucu
                  </h4>
                </div>
                <p className="text-xs text-indigo-100 font-semibold bg-slate-950/70 p-2.5 rounded-xl border border-indigo-500/20">
                  &quot;{scorecard.better_alternative}&quot;
                </p>
              </div>
            )}
          </div>
        ) : (
          /* =================================================================== */
          /* YETİŞKİN MODU: GÖRECELİ CEFR UYUM PUANI (RELATIVE CEFR ALIGNMENT)   */
          /* =================================================================== */
          <div className="space-y-4" data-testid="adult-cefr-scorecard">
            {/* Hedef Seviye Etiketi */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Hedef Seviye:</span>
                <span className="font-mono text-indigo-300 uppercase">
                  {targetLevel}
                </span>
              </div>
              <span
                data-testid="target-level-badge"
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  hasAnalyzed && isLevelSuccess
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : hasAnalyzed
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                {hasAnalyzed
                  ? isLevelSuccess
                    ? `🎯 ${targetLevel} Hedefinde Başarılı`
                    : `🎯 ${targetLevel} Yolunda İlerliyor`
                  : `🎯 ${targetLevel} Hedefli`}
              </span>
            </div>

            {/* Göreceli Skor Çemberi */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 relative">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ease-out ${
                      !hasAnalyzed
                        ? "stroke-slate-700"
                        : relativeScore >= 80
                        ? "stroke-emerald-400"
                        : relativeScore >= 60
                        ? "stroke-indigo-400"
                        : "stroke-amber-400"
                    }`}
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={
                      hasAnalyzed
                        ? 251.2 - (251.2 * relativeScore) / 100
                        : 251.2
                    }
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    data-testid="scorecard-percentage-value"
                    className={`text-2xl font-black tracking-tight ${
                      hasAnalyzed ? "text-white" : "text-slate-500"
                    }`}
                  >
                    %{hasAnalyzed ? relativeScore : 0}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">
                    {targetLevel} Uyumu
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                {hasAnalyzed ? (
                  <>
                    <span
                      className={`text-xs font-bold ${
                        relativeScore >= 80
                          ? "text-emerald-400"
                          : relativeScore >= 60
                          ? "text-indigo-400"
                          : "text-amber-400"
                      }`}
                    >
                      {relativeScore >= 80
                        ? `Mükemmel ${targetLevel} Hakimiyeti`
                        : relativeScore >= 60
                        ? `${targetLevel} Seviyesine Yüksek Uyum`
                        : `${targetLevel} Gelişim Aşamasında`}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Hedef katsayısına göre normalize edilmiştir
                    </p>
                  </>
                ) : (
                  <p
                    data-testid="scorecard-waiting-hint"
                    className="text-[11px] text-slate-400 leading-snug font-medium px-2"
                  >
                    Değerlendirme Bekleniyor • Konuşmayı bitirince &apos;Analyze&apos; butonuna basın
                  </p>
                )}
              </div>
            </div>

            {/* İlerleme Çubukları (Progress Bars) */}
            <div
              data-testid="cefr-progress-bars"
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3"
            >
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Seviye & Akıcılık Metrikleri</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {targetLevel} Normu
                </span>
              </h4>

              {/* Bar 1: Hedef Seviye Uyumu */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Hedef Seviye Uyumu</span>
                  <span className="text-indigo-300 font-mono font-bold">
                    %{hasAnalyzed ? relativeScore : 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-700 rounded-full"
                    style={{ width: `${hasAnalyzed ? relativeScore : 0}%` }}
                  />
                </div>
              </div>

              {/* Bar 2: Akıcılık */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Akıcılık</span>
                  <span className="text-emerald-300 font-mono font-bold">
                    %{hasAnalyzed ? rawFluency : 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                    style={{ width: `${hasAnalyzed ? rawFluency : 0}%` }}
                  />
                </div>
              </div>

              {/* Bar 3: Kelime Çeşitliliği */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Kelime Çeşitliliği</span>
                  <span className="text-amber-300 font-mono font-bold">
                    %{hasAnalyzed ? vocabDiversity : 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-700 rounded-full"
                    style={{ width: `${hasAnalyzed ? vocabDiversity : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Jargon / Hedef Kelimeler Kutusu */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileCheck
                    className={`w-3.5 h-3.5 ${
                      hasAnalyzed ? "text-emerald-400" : "text-slate-500"
                    }`}
                  />
                  <span>
                    {activeMode === "casual"
                      ? "Günlük Kalıplar & İfadeler"
                      : activeMode === "problem_solving"
                      ? "Kriz & Müdahale Terimleri"
                      : activeMode === "story_debate"
                      ? "Münazara ve Analiz Terimleri"
                      : t("speaking_jargon_precision", "Jargon Precision / Hedef Kelimeler")}
                  </span>
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {hasAnalyzed ? scorecard.vocabulary_highlight.length : 0} Tespit
                </span>
              </div>
              {hasAnalyzed && scorecard.vocabulary_highlight.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {scorecard.vocabulary_highlight.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold shadow-sm bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    >
                      [ {word} ]
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  Konuşma analiz edildiğinde öneriler burada listelenecektir
                </p>
              )}
            </div>

            {/* VOCASHIP DUAL-CARD FEEDBACK (1/2): How to say it better */}
            <div
              data-testid="vocaship-better-alternative-card"
              className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/35 space-y-2.5 shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>How to say it better (Daha Doğal Alternatif)</span>
                </h4>
                {hasAnalyzed && scorecard.better_alternative && onCopyAlt && (
                  <button
                    type="button"
                    onClick={onCopyAlt}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-semibold text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                    title="Alternatif Cümleyi Kopyala"
                  >
                    {copiedAlt ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>
                      {copiedAlt
                        ? t("speaking_copied", "Kopyalandı!")
                        : t("speaking_copy", "Kopyala")}
                    </span>
                  </button>
                )}
              </div>

              {hasAnalyzed && scorecard.better_alternative ? (
                <p className="text-xs text-slate-100 leading-relaxed font-semibold bg-slate-950/70 p-2.5 rounded-xl border border-indigo-500/20">
                  {scorecard.better_alternative}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                  Konuşma analiz edildiğinde öneriler burada listelenecektir
                </p>
              )}
            </div>

            {/* VOCASHIP DUAL-CARD FEEDBACK (2/2): Grammar Polish */}
            <div
              data-testid="vocaship-grammar-polish-card"
              className="p-3.5 rounded-2xl bg-slate-950/85 border border-emerald-500/30 space-y-2.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider">
                    Grammar Polish
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Vocaship AI
                </span>
              </div>

              {hasAnalyzed &&
              (scorecard.grammar_feedback || scorecard.improvement_suggestion) ? (
                <div className="space-y-2 text-xs">
                  {scorecard.improvement_original && (
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-rose-500/25 font-mono text-[11px]">
                      <span className="line-through text-rose-400">
                        &quot;{scorecard.improvement_original}&quot;
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px]">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                    <span className="text-emerald-400 font-bold leading-relaxed">
                      {scorecard.grammar_feedback ||
                        scorecard.improvement_suggestion}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  Konuşma analiz edildiğinde öneriler burada listelenecektir
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
