"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  BookOpen,
  Radio,
  Sparkles,
  Users,
  Volume2,
  CheckCircle2,
  HelpCircle,
  X,
  Eye,
  Eraser,
  Tv,
  ArrowRight,
  Maximize2,
} from "lucide-react";
import { useLiveReadingSync } from "../../hooks/useLiveReadingSync";
import { useLiveTranscription } from "../../hooks/useLiveTranscription";
import LiveSpeechToDeckPanel from "./LiveSpeechToDeckPanel";
const WordCardModal = dynamic(() => import("../reading/WordCardModal"), { ssr: false });

export interface LiveReadingRoomProps {
  sessionId?: string;
  isTeacher?: boolean;
  classCode?: string;
  className?: string;
  story?: {
    id?: string;
    title: string;
    level?: string;
    topic?: string;
    content: string;
    target_vocabulary?: Array<{
      word: string;
      phonetic?: string;
      turkish_meaning: string;
      context_sentence?: string;
    }>;
    comprehension_questions?: Array<{
      question: string;
      options: string[];
      correct_answer_index: number;
    }>;
  };
  onClose?: () => void;
}

const DEFAULT_LIVE_STORY = {
  id: "live-fidic-story",
  title: "FIDIC Red Book Clause 20.1 & Delay Claims",
  level: "C1 Advanced",
  topic: "Construction Law & Project Controls",
  content: `In modern engineering contracts, managing delay claims requires strict adherence to notification procedures. Under Clause 20.1 of the FIDIC Red Book, if the Contractor considers himself entitled to any extension of the Time for Completion or additional payment, he must give notice to the Engineer describing the event or circumstance giving rise to the claim.

The notice must be submitted as soon as practicable, and not later than 28 days after the Contractor became aware, or should have become aware, of the relevant event. Failure to give notice within this mandatory time bar results in the Employer being discharged from all liability in connection with the claim.

To successfully substantiate a delay claim, project managers must maintain contemporaneous records. Contemporaneous records include daily site diaries, correspondence, certified programmes, and inspection reports. Cultivating cognitive resilience against project disruptions ensures that delay claims are mitigated effectively before escalating into formal disputes before the Dispute Adjudication Board.`,
  target_vocabulary: [
    {
      word: "substantiate",
      phonetic: "/səbˈstæn.ʃi.eɪt/",
      turkish_meaning: "Somut delillerle ispatlamak, doğrulamak",
      context_sentence: "To successfully substantiate a delay claim, keep daily site records.",
    },
    {
      word: "mitigate",
      phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
      turkish_meaning: "Hafifletmek, etkisini azaltmak",
      context_sentence: "Delay disruptions must be mitigated before formal dispute.",
    },
    {
      word: "resilience",
      phonetic: "/rɪˈzɪl.jəns/",
      turkish_meaning: "Direnç, toparlanma kabiliyeti",
      context_sentence: "Cognitive resilience protects against critical burnout.",
    },
    {
      word: "contemporaneous",
      phonetic: "/kənˌtem.pəˈreɪ.ni.əs/",
      turkish_meaning: "Eşzamanlı tutulan, döneme ait",
      context_sentence: "Contemporaneous records are required under FIDIC Clause 20.1.",
    },
    {
      word: "mandatory",
      phonetic: "/ˈmæn.də.tər.i/",
      turkish_meaning: "Zorunlu, bağlayıcı",
      context_sentence: "Notice within 28 days is a mandatory condition precedent.",
    },
  ],
  comprehension_questions: [
    {
      question: "Under FIDIC Clause 20.1, what is the mandatory notice period for a claim?",
      options: ["14 days", "28 days", "60 days", "90 days"],
      correct_answer_index: 1,
    },
    {
      question: "What happens if the contractor fails to submit notice within 28 days?",
      options: [
        "The Employer is discharged from all liability",
        "The project deadline is automatically extended",
        "The Engineer pays a penalty",
        "The contract is immediately terminated",
      ],
      correct_answer_index: 0,
    },
  ],
};

function cleanToken(token: string): string {
  return token.replace(/^[“"'(]+|[.,;:!?)"']+$/g, "").trim();
}

export default function LiveReadingRoom({
  sessionId = "live-10a-0800",
  isTeacher = false,
  classCode = "VRG-2535",
  className = "10-A Sınıfı • C1 Project Controls",
  story = DEFAULT_LIVE_STORY,
  onClose,
}: LiveReadingRoomProps) {
  // Canlı Senkronizasyon Kancası
  const {
    activeWordIndex,
    activeWordText,
    isConnected,
    broadcastWordHighlight,
    clearHighlight,
  } = useLiveReadingSync({
    sessionId,
    isTeacher,
  });

  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [rightTab, setRightTab] = useState<"questions" | "whisper">("questions");
  const [selectedWordForModal, setSelectedWordForModal] = useState<{
    word: string;
    contextSentence: string;
  } | null>(null);

  // Canlı Ses Dinleme (Live Whisper to Deck) Hook'u
  const {
    isListening: isWhisperListening,
    isSupported: isWhisperSupported,
    errorMessage: whisperErrorMessage,
    capturedWords,
    startListening: startWhisperListening,
    stopListening: stopWhisperListening,
    removeWord: removeWhisperWord,
    clearWords: clearWhisperWords,
    simulateSpokenPhrase: simulateWhisperPhrase,
  } = useLiveTranscription({
    sessionId,
    classCode,
    isTeacher,
  });

  // Metni paragraflara ve kelime token'larına ayırarak sıralı global indeks ata
  const parsedParagraphs = useMemo(() => {
    let globalIndexCounter = 0;
    const paragraphs = (story.content || "").split(/\n\s*\n/);

    return paragraphs.map((pText, pIdx) => {
      // Cümleleri ve kelimeleri ayıkla
      const words = pText.trim().split(/\s+/);
      const tokenList = words.map((w) => {
        const curIndex = globalIndexCounter++;
        return {
          raw: w,
          clean: cleanToken(w),
          globalIndex: curIndex,
        };
      });

      return {
        paragraphIndex: pIdx,
        text: pText,
        tokens: tokenList,
      };
    });
  }, [story.content]);

  // Kelime Tıklama Olayı
  const handleWordClick = (
    raw: string,
    clean: string,
    globalIndex: number,
    paragraphText: string
  ) => {
    // 1. Yetki Kontrolü: Yalnızca öğretmen tıkladığında tüm sınıfın ekranına yayınlanır
    if (isTeacher) {
      broadcastWordHighlight(globalIndex, clean);
    }

    // 2. Kişisel Sözlük Modalı: Hem öğretmen hem de öğrenci için kelime kartı modalını açar
    if (clean) {
      setSelectedWordForModal({
        word: clean,
        contextSentence: paragraphText.slice(0, 160) + "...",
      });
    }
  };

  // Font boyutu sınıfı
  const fontSizeClass =
    fontSize === "base"
      ? "text-sm sm:text-base leading-relaxed"
      : fontSize === "xl"
      ? "text-lg sm:text-2xl leading-loose"
      : "text-base sm:text-lg leading-relaxed";

  return (
    <div className="w-full flex-1 flex flex-col bg-[#070B16] text-slate-100 relative overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. ÜST CANLI SENKRONİZASYON DURUM ÇUBUĞU                                   */}
      {/* ========================================================================= */}
      <header className="px-4 sm:px-6 py-3 border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {isTeacher
                  ? "🔴 Eşzamanlı Canlı Okuma • Öğretmen Yayını"
                  : "🟢 Canlı Senkronize • Öğretmeni Takip Ediyorsun"}
              </span>
            </span>
          </div>

          <span className="text-xs text-slate-400 hidden md:inline">
            Sınıf Kodu: <strong className="text-white font-mono">{classCode}</strong>
          </span>
        </div>

        {/* Orta & Sağ Kontroller */}
        <div className="flex items-center gap-3">
          {/* Aktif Vurgulanan Kelime Önizlemesi */}
          {activeWordText && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Odak Kelime: &ldquo;{activeWordText}&rdquo;</span>
            </div>
          )}

          {/* Öğretmen için: Vurguyu Temizle Butonu */}
          {isTeacher && activeWordIndex !== null && (
            <button
              type="button"
              onClick={clearHighlight}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Vurguyu Kaldır"
            >
              <Eraser className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Vurguyu Temizle</span>
            </button>
          )}

          {/* Yazı Boyutu Seçimi */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFontSize("base")}
              className={`px-2 py-1 rounded-lg transition ${
                fontSize === "base" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize("lg")}
              className={`px-2 py-1 rounded-lg transition ${
                fontSize === "lg" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize("xl")}
              className={`px-2 py-1 rounded-lg transition ${
                fontSize === "xl" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              A++
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
              title="Canlı Okuma Odasını Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. 3 SÜTUNLU AKILLI OKUMA ODASI DÜZENİ                                     */}
      {/* ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* SOL PANEL (3 Kolon): Hedef Kelimeler & Vaka Bilgisi */}
        <aside className="lg:col-span-3 border-r border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 overflow-y-auto hidden lg:flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                {story.level || "C1 Advanced"} • {story.topic || "Vaka Analizi"}
              </span>
              <h2 className="text-base font-black text-white leading-snug">
                {story.title}
              </h2>
            </div>

            {/* Pedagojik Canlı Okuma Bilgi Rozeti */}
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Eşzamanlı Canlı Yayın</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isTeacher
                  ? "Tıkladığınız kelime anında tüm öğrencilerin ekranında sarı-fosforlu parlar ve ilgili satıra otomatik odaklanır."
                  : "Öğretmeniniz metni okurken açıkladığı kelimeler ekranınızda canlı olarak parlar. Bir kelimeye tıklayarak kişisel sözlüğünüzü açabilirsiniz."}
              </p>
            </div>

            {/* Hedef Kelime Listesi */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🎯 Hedef Kelimeler ({story.target_vocabulary?.length || 5})
              </h3>
              <div className="space-y-2">
                {(story.target_vocabulary || []).map((tv, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group"
                    onClick={() => {
                      if (tv.word) {
                        setSelectedWordForModal({
                          word: tv.word,
                          contextSentence: tv.context_sentence || "",
                        });
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                        {tv.word}
                      </span>
                      {tv.phonetic && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {tv.phonetic}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate pt-0.5">
                      {tv.turkish_meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>Bağlantı: Aktif ✓</span>
            <span>Gecikme: ~0ms</span>
          </div>
        </aside>

        {/* ORTA PANEL (6 Kolon): Canlı Senkronize Hikaye Metni */}
        <main className="lg:col-span-6 p-5 sm:p-8 overflow-y-auto flex flex-col items-center bg-[#070B16] relative">
          <div className="max-w-2xl w-full space-y-6 pb-12">
            {parsedParagraphs.map((paragraph) => (
              <p
                key={paragraph.paragraphIndex}
                className={`${fontSizeClass} text-slate-300 font-sans tracking-normal`}
              >
                {paragraph.tokens.map((tokenObj) => {
                  const isHighlighted = activeWordIndex === tokenObj.globalIndex;
                  const isTargetVocab = (story.target_vocabulary || []).some(
                    (v) => v.word.toLowerCase() === tokenObj.clean.toLowerCase()
                  );

                  return (
                    <span
                      key={tokenObj.globalIndex}
                      data-word-index={tokenObj.globalIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWordClick(
                          tokenObj.raw,
                          tokenObj.clean,
                          tokenObj.globalIndex,
                          paragraph.text
                        );
                      }}
                      className={`cursor-pointer inline-block rounded px-1 py-0.5 transition-all duration-150 select-text ${
                        isHighlighted
                          ? "bg-amber-400/25 text-amber-200 ring-2 ring-amber-400/60 font-black shadow-md shadow-amber-500/20 scale-105"
                          : isTargetVocab
                          ? "bg-indigo-500/15 text-indigo-300 font-semibold border-b border-indigo-500/40 hover:bg-indigo-500/25"
                          : "hover:bg-slate-800/80 hover:text-white"
                      }`}
                      title={
                        isTeacher
                          ? `Tıkla: Sınıfa yayınla & sözlükte aç (${tokenObj.clean})`
                          : `Tıkla: Kişisel sözlüğü aç (${tokenObj.clean})`
                      }
                    >
                      {tokenObj.raw}{" "}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
        </main>

        {/* SAĞ PANEL (3 Kolon): Hızlı Anlama Soruları & Canlı Whisper Akışı */}
        <aside className="lg:col-span-3 border-l border-slate-800/80 bg-slate-950/95 overflow-hidden hidden lg:flex flex-col">
          {/* ÜST PANEL SEKME SEÇİCİSİ */}
          <div className="flex items-center border-b border-slate-800/90 bg-slate-900/80 p-1.5 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setRightTab("questions")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === "questions"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Anlama Soruları</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab("whisper")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === "whisper"
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Whisper</span>
              {capturedWords.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono animate-pulse">
                  {capturedWords.length}
                </span>
              )}
            </button>
          </div>

          {rightTab === "whisper" ? (
            <LiveSpeechToDeckPanel
              capturedWords={capturedWords}
              isListening={isWhisperListening}
              isSupported={isWhisperSupported}
              errorMessage={whisperErrorMessage}
              role={isTeacher ? "teacher" : "student"}
              classId={classCode}
              classCode={classCode}
              className={className}
              onRemoveWord={removeWhisperWord}
              onClearWords={clearWhisperWords}
              onSimulatePhrase={simulateWhisperPhrase}
              onToggleListening={
                isWhisperListening ? stopWhisperListening : startWhisperListening
              }
            />
          ) : (
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Anlama Soruları (Comprehension)</span>
                </div>

                <div className="space-y-3">
                  {(story.comprehension_questions || []).map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                    >
                      <p className="text-xs font-bold text-white leading-snug">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="p-2 rounded-xl bg-slate-950 text-[11px] text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition cursor-pointer flex items-center gap-2"
                          >
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-400 shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hızlı Öğrenci Sözlük Yönergesi */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-300 block">💡 İpucu:</span>
                <p className="text-[11px] leading-relaxed">
                  Metindeki herhangi bir kelimeye tıklayarak Türkçe karşılığını, telaffuzunu ve örnek cümlelerini anında açabilirsiniz.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 3. KİŞİSEL SÖZLÜK / KELİME KARTI MODALI (WordCardModal)                     */}
      {/* ========================================================================= */}
      {selectedWordForModal && (
        <WordCardModal
          word={selectedWordForModal.word}
          contextSentence={selectedWordForModal.contextSentence}
          decks={[{ id: "deck-live", title: "Canlı Ders Kelimeleri" }]}
          selectedDeckId="deck-live"
          onClose={() => setSelectedWordForModal(null)}
          onCardSaved={() => {
            setSelectedWordForModal(null);
          }}
        />
      )}
    </div>
  );
}

