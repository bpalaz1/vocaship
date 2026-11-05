"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Check,
  BookOpen,
  Volume2,
  Trash2,
  Layers,
  Send,
  AlertCircle,
  HelpCircle,
  Mic,
  MicOff,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { LiveCapturedWord } from "../../hooks/useLiveTranscription";
import {
  createLiveVocabularyAssignment,
  CreateLiveAssignmentResult,
} from "../../actions/assignments";
import { API_BASE } from "../../config";

export interface LiveSpeechToDeckPanelProps {
  capturedWords: LiveCapturedWord[];
  isListening: boolean;
  isSupported: boolean;
  errorMessage?: string | null;
  role: "teacher" | "student";
  classId?: string;
  classCode?: string;
  className?: string;
  onRemoveWord?: (wordId: string) => void;
  onClearWords?: () => void;
  onSimulatePhrase?: (phrase: string) => void;
  onToggleListening?: () => void;
}

export default function LiveSpeechToDeckPanel({
  capturedWords = [],
  isListening = false,
  isSupported = true,
  errorMessage,
  role = "student",
  classId = "cls-1",
  classCode = "VRG-2535",
  className = "10-A Sınıfı • C1 Project Controls",
  onRemoveWord,
  onClearWords,
  onSimulatePhrase,
  onToggleListening,
}: LiveSpeechToDeckPanelProps) {
  // Öğrencinin eklediği kelimelerin ID'lerini tutan state
  const [addedWordIds, setAddedWordIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  // Öğretmenin ödev atama durumu
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignResult, setAssignResult] = useState<CreateLiveAssignmentResult | null>(null);

  // Öğrenci için hedef deste
  const [targetDeck, setTargetDeck] = useState<string>("live-deck");

  // Sesli telaffuz dinleme
  const playPronunciation = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  // 1. ÖĞRENCİ: TEK TIKLA DESTEYE EKLEME
  const handleAddToDeck = async (item: LiveCapturedWord) => {
    setAddingId(item.id);

    try {
      const payload = {
        deck_id: targetDeck,
        word: item.word,
        phonetic: item.phonetic || null,
        meanings: [
          {
            part_of_speech: "terim",
            translation: item.turkish_meaning || "Canlı ders terimi",
            definition: item.contextSentence || "",
          },
        ],
        example_sentences: item.contextSentence
          ? [{ en: item.contextSentence, tr: item.turkish_meaning || "" }]
          : [],
      };

      // Backend Flashcard API'ye kaydet
      const res = await fetch(`${API_BASE}/decks/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      // Başarılı / Yerel saklama
      if (typeof window !== "undefined") {
        try {
          const key = `deck_saved_${targetDeck}`;
          const current = JSON.parse(localStorage.getItem(key) || "[]");
          current.push(payload);
          localStorage.setItem(key, JSON.stringify(current));
        } catch {}
      }

      setAddedWordIds((prev) => new Set([...prev, item.id]));
    } catch (err) {
      console.warn("Desteye ekleme sırasında hata:", err);
      // Yerel olarak yine de eklenmiş işaretle
      setAddedWordIds((prev) => new Set([...prev, item.id]));
    } finally {
      setAddingId(null);
    }
  };

  // 2. ÖĞRETMEN: YAKALANAN KELİMELERİ SINIF ÖDEVİ YAP
  const handleAssignToClass = async () => {
    if (capturedWords.length === 0) return;
    setIsAssigning(true);
    setAssignResult(null);

    try {
      const res = await createLiveVocabularyAssignment({
        classId,
        classCode,
        className,
        capturedWords: capturedWords.map((w) => ({
          word: w.word,
          meaning: w.turkish_meaning,
          phonetic: w.phonetic,
          contextSentence: w.contextSentence,
        })),
        dueDate: "Gelecek Hafta, 18:00",
      });

      setAssignResult(res);
      setTimeout(() => {
        setAssignResult(null);
      }, 7000);
    } catch (err: any) {
      setAssignResult({
        success: false,
        message: err.message || "Ödev atanırken beklenmedik bir hata oluştu.",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Hazır test cümleleri
  const testPhrases = [
    "Under Clause 20.1, we must substantiate delay claims with contemporaneous records to mitigate liability.",
    "Cultivating cognitive resilience prevents superficial distractions during complex arbitration procedures.",
    "The contractor must comply with mandatory notice periods to avoid dispute escalation.",
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/95 overflow-hidden text-slate-100">
      {/* ============================================================== */}
      {/* 1. ÜST PANEL BAŞLIĞI VE CANLI DİNLEME DURUMU                    */}
      {/* ============================================================== */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">
                  Live Whisper to Deck
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  REALTIME
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {role === "teacher"
                  ? "Konuştuğunuz kritik kelimeler anında sınıfa akar"
                  : "Öğretmenin bahsettiği kelimeleri destene kaydet"}
              </p>
            </div>
          </div>

          {/* Dinleme Durum Rozeti */}
          <div className="flex items-center gap-1.5">
            {isListening ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px] font-extrabold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Canlı Dinliyor</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-semibold">
                <MicOff className="w-3 h-3 text-slate-500" />
                <span>Beklemede</span>
              </span>
            )}
          </div>
        </div>

        {/* Hata veya Tarayıcı Uyarısı */}
        {!isSupported && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Web Speech API desteği bulunamadı. Aşağıdaki test butonlarıyla kelime akışını deneyebilirsiniz.
            </span>
          </div>
        )}

        {errorMessage && isSupported && (
          <div className="mt-2 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px]">
            {errorMessage}
          </div>
        )}

        {/* Öğrenci Deste Seçicisi & Sayaç */}
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hedef Deste:</span>
            <select
              value={targetDeck}
              onChange={(e) => setTargetDeck(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5 text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="live-deck">🎙️ Canlı Ders Destem</option>
              <option value="c1-business">💼 C1 Business & FIDIC</option>
              <option value="daily-vocab">📚 Günlük Kelimelerim</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/70 text-slate-300 font-bold">
              {capturedWords.length} Kelime
            </span>
            {role === "teacher" && capturedWords.length > 0 && onClearWords && (
              <button
                type="button"
                onClick={onClearWords}
                className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                title="Tüm Listeyi Temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CANLI KELİME AKIŞI LİSTESİ (YUKARIDAN AŞAĞIYA)               */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {capturedWords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
              <Mic className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Henüz Canlı Kelime Yakalanmadı
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {role === "teacher"
                ? "Mikrofonunuz açıkken konuştuğunuzda FIDIC, mühendislik ve kritik seviye kelimeleri yapay zekâ tarafından anında sağ panele dökülür."
                : "Öğretmeniniz konuştukça vaka kelimeleri ve terimler buraya akacak. Tek tıkla destenize ekleyebilirsiniz."}
            </p>

            {/* Simülasyon / Test Cümleleri Butonları */}
            {onSimulatePhrase && (
              <div className="mt-5 w-full max-w-xs space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                  Hızlı Simülasyon Dene
                </span>
                <div className="flex flex-col gap-1.5">
                  {testPhrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSimulatePhrase(phrase)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 text-left transition truncate cursor-pointer"
                      title={phrase}
                    >
                      🗣️ &quot;{phrase.slice(0, 42)}...&quot;
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          capturedWords.map((item) => {
            const isAdded = addedWordIds.has(item.id);
            const isThisAdding = addingId === item.id;

            return (
              <div
                key={item.id}
                className="group relative p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-indigo-500/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-black text-white group-hover:text-indigo-300 transition-colors capitalize">
                        {item.word}
                      </span>
                      {item.phonetic && (
                        <span className="text-xs text-slate-400 font-mono">
                          {item.phonetic}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => playPronunciation(item.word)}
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition cursor-pointer"
                        title="Telaffuzu Dinle"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.turkish_meaning && (
                      <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                        {item.turkish_meaning}
                      </p>
                    )}

                    {item.contextSentence && (
                      <p className="text-[11px] text-slate-400 italic mt-1.5 line-clamp-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                        &quot;{item.contextSentence}&quot;
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{item.timestamp}</span>
                      {item.senderRole === "teacher" && (
                        <span className="text-indigo-400 font-bold">👨‍🏫 Eğitmenin Cümlesi</span>
                      )}
                    </div>
                  </div>

                  {/* Eylemler: Öğrenci [ + Desteye Ekle ] / Öğretmen [ ✕ Sil ] */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    {role === "student" ? (
                      <button
                        type="button"
                        onClick={() => handleAddToDeck(item)}
                        disabled={isAdded || isThisAdding}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                          isAdded
                            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                            : "bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-md shadow-indigo-600/30"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Eklendi</span>
                          </>
                        ) : isThisAdding ? (
                          <span>Kaydediliyor...</span>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Desteye Ekle</span>
                          </>
                        )}
                      </button>
                    ) : (
                      onRemoveWord && (
                        <button
                          type="button"
                          onClick={() => onRemoveWord(item.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Kelimeyi Listeden Kaldır"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. ÖĞRETMEN: TÜM LİSTEYİ SINIF ÖDEVİ OLARAK ATAMA PANELİ        */}
      {/* ============================================================== */}
      {role === "teacher" && (
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
          {assignResult && (
            <div
              className={`mb-3 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                assignResult.success
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                  : "bg-rose-950/60 border-rose-500/50 text-rose-200"
              }`}
            >
              {assignResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{assignResult.message}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAssignToClass}
            disabled={capturedWords.length === 0 || isAssigning}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
              capturedWords.length === 0
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                : isAssigning
                ? "bg-indigo-700 text-indigo-200 cursor-wait"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 ring-1 ring-white/20 active:scale-[0.98] cursor-pointer"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {isAssigning
                ? "Ödev Sınıfa Atanıyor..."
                : `📌 Yakalanan Kelimeleri Sınıfa Ödev Ata (${capturedWords.length})`}
            </span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Hedef Sınıf: <strong>{classCode}</strong> ({className}) • Otomatik Kelime Tekrar Ödevi
          </p>
        </div>
      )}
    </div>
  );
}

