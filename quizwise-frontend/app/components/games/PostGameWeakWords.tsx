"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Volume2,
  BookmarkPlus,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { saveArenaMistake } from "../../utils/arenaMistakes";

export interface WeakWordItem {
  word: string;
  failRate: number; // Örn: 68 -> %68
  meaning: string;
  phonetic?: string;
  exampleEn?: string;
  exampleTr?: string;
  partOfSpeech?: string;
  wrongCount?: number;
}

export interface PostGameWeakWordsProps {
  weakWords?: WeakWordItem[];
  className?: string;
  isHost?: boolean;
}

const DEFAULT_WEAK_WORDS: WeakWordItem[] = [
  {
    word: "mitigate",
    failRate: 68,
    meaning: "Hafifletmek, etkisini azaltmak, yatıştırmak",
    phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
    partOfSpeech: "verb",
    exampleEn: "We implemented new safety measures to mitigate project risks.",
    exampleTr: "Proje risklerini hafifletmek için yeni güvenlik önlemleri uyguladık.",
    wrongCount: 17,
  },
  {
    word: "allocate",
    failRate: 54,
    meaning: "Tahsis etmek, paylaştırmak, bütçelendirmek",
    phonetic: "/ˈæl.ə.keɪt/",
    partOfSpeech: "verb",
    exampleEn: "The committee decided to allocate additional resources to the lab.",
    exampleTr: "Komite, laboratuvara ek kaynaklar tahsis etmeye karar verdi.",
    wrongCount: 13,
  },
  {
    word: "variance",
    failRate: 47,
    meaning: "Farklılık, sapma, ayrılık, değişkenlik",
    phonetic: "/ˈveə.ri.əns/",
    partOfSpeech: "noun",
    exampleEn: "There was a significant variance between estimated and actual costs.",
    exampleTr: "Tahmini maliyetler ile gerçekleşen maliyetler arasında belirgin bir sapma vardı.",
    wrongCount: 11,
  },
];

export default function PostGameWeakWords({
  weakWords = DEFAULT_WEAK_WORDS,
  className = "10-A İngilizce",
  isHost = false,
}: PostGameWeakWordsProps) {
  const [expandedWord, setExpandedWord] = useState<string | null>(weakWords[0]?.word || null);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  // Web Speech API Sesli Telaffuz (Akıllı Tahta ve Öğrenci İçin Sıfır Gecikme)
  const speakWord = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.85; // Net duyulması için hafif yavaşlatılmış
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Telaffuz hatası:", e);
    }
  };

  // İntikam Arenası / Unutma Destesine Kaydetme
  const handleSaveToMistakes = (item: WeakWordItem) => {
    saveArenaMistake({
      word: item.word,
      meaning: item.meaning,
      phonetic: item.phonetic,
      example: item.exampleEn,
      gameType: "class_coop_weak_word",
    });

    setSavedWords((prev) => ({ ...prev, [item.word]: true }));
  };

  return (
    <div className="w-full bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
      {/* ÜST BAŞLIK: SINIF RÖNTGENİ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>📊 Bu Oyunda Sınıfın En Çok Zorlandığı 3 Kelime</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Sınıf Röntgeni
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {className} • Bu kelimeler öğrencilerin %40'ından fazlası tarafından yanlış yapıldı.
            </p>
          </div>
        </div>

        {isHost && (
          <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>1 Dakikalık Telafi Dersi Modu</span>
          </span>
        )}
      </div>

      {/* 3 KELİMELİK LİSTE */}
      <div className="space-y-3">
        {weakWords.map((item, index) => {
          const isExpanded = expandedWord === item.word;
          const isSaved = savedWords[item.word];

          return (
            <div
              key={item.word}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? "bg-slate-950/90 border-amber-500/60 shadow-lg shadow-amber-500/10"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* SATIR KARTI */}
              <div
                onClick={() => setExpandedWord(isExpanded ? null : item.word)}
                className="p-4 sm:p-4.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-xs flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-black text-white tracking-wide">
                        {item.word}
                      </span>
                      {item.phonetic && (
                        <span className="text-xs font-mono text-slate-400">
                          {item.phonetic}
                        </span>
                      )}
                      {item.partOfSpeech && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.partOfSpeech}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-amber-200 font-medium truncate max-w-sm sm:max-w-md mt-0.5">
                      {item.meaning}
                    </p>
                  </div>
                </div>

                {/* SAĞ: HATA YÜZDESİ VE BUTON */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black font-mono text-rose-400 flex items-center gap-1">
                      <span>%{item.failRate}</span>
                      <span className="text-[10px] text-rose-300/80 font-normal">Hata Oranı</span>
                    </span>
                    {item.wrongCount && (
                      <span className="text-[10px] text-slate-500">
                        {item.wrongCount} öğrenci takıldı
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isExpanded
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "bg-slate-800 hover:bg-slate-750 text-slate-200"
                    }`}
                  >
                    <span>{isExpanded ? "Kapat" : "🔍 Anlatımı Aç"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* GENİŞLETİLMİŞ TELAFİ KUTUSU (1 DAKİKALIK DERS EKRANI) */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900/90 to-slate-950 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                  {/* TELAFİ İÇERİĞİ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sol: Tanım ve Fonetik */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          Türkçe Karşılık & Fonetik
                        </span>
                        <button
                          type="button"
                          onClick={() => speakWord(item.word)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Sesli Dinlet</span>
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white">{item.meaning}</p>
                      <p className="text-xs text-slate-400 font-mono">{item.phonetic}</p>
                    </div>

                    {/* Sağ: Örnek Cümle */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                        Cümle İçi Kullanım
                      </span>
                      {item.exampleEn && (
                        <p className="text-xs sm:text-sm text-slate-200 italic font-serif">
                          "{item.exampleEn}"
                        </p>
                      )}
                      {item.exampleTr && (
                        <p className="text-[11px] text-slate-400">
                          → {item.exampleTr}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* AKSIYON BUTONLARI: İNTİKAM ARENASINA AKTARIM */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bu kelime dersten sonra bireysel testlerde tekrar sorulacaktır.</span>
                    </p>

                    <button
                      type="button"
                      onClick={() => handleSaveToMistakes(item)}
                      disabled={isSaved}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                        isSaved
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/20"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>İntikam Arenasına Eklendi!</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>🎯 İntikam Arenasına / Desteye Ekle</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

