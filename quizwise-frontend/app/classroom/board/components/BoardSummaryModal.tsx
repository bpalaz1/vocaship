"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Check,
  BookOpen,
  HelpCircle,
  Archive,
  Save,
  Printer,
  Send,
  Loader2,
  Lock,
  Layers,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { API_BASE } from "../../../config";

export interface BoardKeyTerm {
  word: string;
  turkish: string;
  phonetic?: string;
  example?: string;
}

export interface BoardQuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface BoardLessonSummaryData {
  id: string;
  className: string;
  lessonTitle: string;
  date: string;
  summaryPoints: string[];
  keyConcepts: string[];
  keyTerms?: BoardKeyTerm[];
  questions: { question: string }[];
  quizQuestions?: BoardQuizQuestion[];
}

export interface BoardSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  classId?: string;
  pdfFileName?: string | null;
  pdfTextContext?: string;
  spokenTranscript?: string;
  highlightedWords?: string[];
  onSavedToArchive?: (lesson: BoardLessonSummaryData) => void;
}

export default function BoardSummaryModal({
  isOpen,
  onClose,
  className = "10-A İngilizce",
  classId = "cls-1",
  pdfFileName,
  pdfTextContext = "",
  spokenTranscript = "",
  highlightedWords = [],
  onSavedToArchive,
}: BoardSummaryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Analiz Edilen Veri Durumu
  const [lessonTitle, setLessonTitle] = useState("");
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [keyTerms, setKeyTerms] = useState<BoardKeyTerm[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<BoardQuizQuestion[]>([]);

  // Modal açıldığında AI Analizini çağır
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setAssignSuccess(false);
    setSavedSuccess(false);

    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/classroom/board-summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class_id: classId,
            transcript: spokenTranscript || "",
            pdf_text_context: pdfTextContext || pdfFileName || "",
            highlighted_words: highlightedWords,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setLessonTitle(data.title || "Akıllı Tahta İnteraktif Ders Özeti");
            setSummaryPoints(data.summary_points || []);
            setKeyTerms(data.key_terms || []);
            setQuizQuestions(data.quiz_questions || []);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Board summary fetch error, using local fallback:", err);
      }

      // Backend erişilemezse yerel akıllı türetim (Fallback)
      if (isMounted) {
        const cleanPdf = pdfFileName ? pdfFileName.replace(/\.pdf$/i, "").replace(/[_-]/g, " ") : "";
        const title = cleanPdf
          ? cleanPdf.charAt(0).toUpperCase() + cleanPdf.slice(1)
          : highlightedWords.length > 0
          ? `${highlightedWords[0].toUpperCase()} ve Temel Kavramlar`
          : "İnteraktif Sınıf Dersi & Kavram Analizi";

        setLessonTitle(title);
        setSummaryPoints([
          `'${title}' konusunda ders materyali ve öğretmen anlatımı interaktif tahtada işlendi.`,
          "Kritik terminoloji, soru-cevap ve rastgele söz hakkı turlarıyla öğrenciler tarafından pekiştirildi.",
          "Dersin kilit çıkarımları ve pratik uygulama alanları netleştirilerek kazanımlar tamamlandı.",
        ]);

        // Dinamik kelime çıkarımı (Mitochondria veya sabit biyoloji mock'u içermez)
        const extractedWords = [
          ...highlightedWords,
          ...cleanPdf.split(/\s+/).filter((w) => w.length >= 4),
          ...spokenTranscript.split(/\s+/).filter((w) => w.length >= 4),
        ];
        const uniqueWords = Array.from(new Set(extractedWords.map((w) => w.trim()))).filter(Boolean);
        const dynamicTerms: BoardKeyTerm[] = [];
        const fallbackConcepts = ["Kavram Analizi", "Temel İlke", "Uygulama Metodu", "Problem Çözümü", "Kritik Çıkarım"];

        for (let i = 0; i < 5; i++) {
          const w = uniqueWords[i] || fallbackConcepts[i];
          const capWord = w.charAt(0).toUpperCase() + w.slice(1);
          dynamicTerms.push({
            word: capWord,
            turkish: `${capWord} (Dersin anahtar kavramı)`,
            phonetic: "",
            example: `Öğretmen ve öğrenciler bu derste ${capWord} konusunu inceledi.`,
          });
        }
        setKeyTerms(dynamicTerms);

        setQuizQuestions([
          {
            question: `Bugünkü '${title}' dersinin en temel amacı nedir?`,
            options: [
              "Kilit kavramları pratik bağlamda içselleştirmek",
              "Sadece teorik tanımları ezberlemek",
              "Ders içi tartışmaları en aza indirmek",
              "Materyal dışına çıkmamak",
            ],
            correct_index: 0,
            explanation: "Kavramların pratik bağlamda kullanımı kalıcı öğrenmeyi sağlar.",
          },
          {
            question: "İşlenen kilit terimlerin uzun süreli hafızaya aktarılması için önerilen yöntem nedir?",
            options: [
              "SM-2 aralıklı tekrar sistemiyle periyodik pekiştirme",
              "Ders sonrası bir daha hiç tekrar etmemek",
              "Yalnızca sınav sabahı hızlıca göz gezdirmek",
              "Kelimeleri bağlamsız yazarak ezberlemek",
            ],
            correct_index: 0,
            explanation: "SM-2 algoritması unutma eğrisini kırarak bilgiyi pekiştirir.",
          },
          {
            question: "Derste işlenen ana fikir günlük hayatta nerede uygulanabilir?",
            options: [
              "Problem çözme ve analitik karar alma süreçlerinde",
              "Yalnızca kapalı laboratuvar ortamında",
              "Herhangi bir günlük karşılığı yoktur",
              "Sadece sınav kağıtlarında",
            ],
            correct_index: 0,
            explanation: "Ders kazanımları analitik düşünme yetisini güçlendirir.",
          },
        ]);
        setIsLoading(false);
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [isOpen, classId, pdfFileName, spokenTranscript, highlightedWords]);

  if (!isOpen) return null;

  // 1. SINIF SM-2 ÖDEV FIRLATMA
  const handleAssignToClass = async () => {
    setIsAssigning(true);
    try {
      // Backend SM-2 ve Assignment servisine fırlat
      await fetch(`${API_BASE}/api/v1/classroom/board-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          title: lessonTitle,
          summary_points: summaryPoints,
          key_terms: keyTerms,
          quiz_questions: quizQuestions,
        }),
      }).catch((e) => console.warn("Backend assign endpoint error:", e));

      // LocalStorage Senkronizasyonu (Öğrenci SM-2 kuyruğuna yaz)
      if (typeof window !== "undefined") {
        // A) Sınıf Ödevleri Listesi
        const existingAssignments = JSON.parse(
          localStorage.getItem("vocaship_assignments") || "[]"
        );
        const newAssignment = {
          id: `as_board_${Date.now()}`,
          class_id: classId,
          class_name: className,
          title: `⚡ Tahta Dersi Ödevi: ${lessonTitle}`,
          summary_points: summaryPoints,
          target_words: keyTerms,
          questions: quizQuestions,
          due_date: "Bu Hafta Sonu, 23:59",
          created_at: new Date().toISOString(),
        };
        existingAssignments.unshift(newAssignment);
        localStorage.setItem("vocaship_assignments", JSON.stringify(existingAssignments));

        // B) Öğrenci SM-2 Çalışma Kuyruğu (Spaced Repetition Queue)
        const existingSm2Queue = JSON.parse(
          localStorage.getItem("vocaship_student_sm2_queue") || "[]"
        );
        const newSm2Items = keyTerms.map((kt) => ({
          id: `sm2_${Date.now()}_${kt.word}`,
          word: kt.word,
          meaning: kt.turkish,
          phonetic: kt.phonetic || "",
          example: kt.example || "",
          due_date: new Date().toISOString(),
          interval_days: 1,
          repetitions: 0,
          ease_factor: 2.5,
          needs_review: true,
          mistake_count: 1,
          consecutive_correct: 0,
        }));
        localStorage.setItem(
          "vocaship_student_sm2_queue",
          JSON.stringify([...newSm2Items, ...existingSm2Queue])
        );
      }

      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
      setAssignSuccess(true);
    } catch (err) {
      console.error("Assign error:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  // 2. YAZDIRILABİLİR A4 CHEAT SHEET (PRINT)
  const handlePrintCheatSheet = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // 3. ARŞİVE KAYDET
  const handleSaveToArchive = () => {
    setIsSaving(true);
    const now = new Date();
    const formattedDate = `${now.getDate()} ${
      [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
      ][now.getMonth()]
    } ${now.getFullYear()} • ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newArchiveLesson: BoardLessonSummaryData = {
      id: `lesson_${Date.now()}`,
      className,
      lessonTitle,
      date: formattedDate,
      summaryPoints,
      keyConcepts: keyTerms.map((t) => t.word),
      keyTerms,
      questions: quizQuestions.map((q) => ({ question: q.question })),
      quizQuestions,
    };

    try {
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem("vocaship_board_archives");
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(newArchiveLesson);
        localStorage.setItem("vocaship_board_archives", JSON.stringify(list));
      }
    } catch (e) {
      console.warn("Archive localStorage save error:", e);
    }

    confetti({ particleCount: 70, spread: 70 });
    setIsSaving(false);
    setSavedSuccess(true);

    if (onSavedToArchive) {
      onSavedToArchive(newArchiveLesson);
    }

    setTimeout(() => {
      onClose();
      if (typeof window !== "undefined") {
        window.location.href = "/classroom?tab=archive";
      }
    }, 1500);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DOKUNMATİK EKRAN MODALI                                                */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none overflow-y-auto print:hidden">
        <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl text-slate-100 space-y-4 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
          {/* Üst Başlık & Rozet */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Ders Sonu AI Özeti & Çıkarımları
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                    <Lock className="w-3 h-3" />
                    <span>KVKK Sıfır Ses Kaydı</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {className} • Gemini 2.5 Flash Pedagojik Analiz ve SM-2 Dağıtım Motoru
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* İçerik Kaydırma Alanı */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <Sparkles className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-sm font-bold text-slate-200">
                  Gemini 2.5 Flash dersi analiz ediyor...
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Transkript ve tahta notlarından hap özet, 5 kritik kavram ve anlama soruları çıkarılıyor.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Ders Başlığı */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                      Analiz Edilen Ders Başlığı
                    </span>
                    <h4 className="text-base font-bold text-white">{lessonTitle}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300">
                    {className}
                  </span>
                </div>

                {/* 2. 3-4 Maddelik Hap Yönetici Özeti */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>📌 3-4 Maddelik Hap Yönetici Özeti</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {summaryPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-sm shadow-emerald-400" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Vurgulanan 5 Kritik Terim ve Türkçe Anlamları */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>🏷️ Vurgulanan 5 Kritik Terim & Türkçe Anlamları</span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">
                      SM-2 Tekrar Hazır
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {keyTerms.map((term, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/20 hover:border-indigo-500/50 transition space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-300">
                            {term.word}
                          </span>
                          {term.phonetic && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {term.phonetic}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 font-medium">{term.turkish}</p>
                        {term.example && (
                          <p className="text-[11px] text-slate-400 italic line-clamp-1">
                            "{term.example}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. 3 Hızlı Anlama Sorusu */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>🎯 3 Hızlı Anlama ve Pekiştirme Sorusu</span>
                  </span>
                  <div className="space-y-2 text-xs">
                    {quizQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-slate-100">{q.question}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-7">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-1.5 rounded-lg text-[11px] font-medium transition ${
                                optIdx === q.correct_index
                                  ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                                  : "bg-slate-950/60 border border-slate-800 text-slate-400"
                              }`}
                            >
                              <span className="font-mono font-bold mr-1.5 text-slate-400">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-[10px] text-emerald-400/90 pl-7 pt-0.5">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Alt Aksiyon Butonları */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* Sol: Yazdır & İptal */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCheatSheet}
                disabled={isLoading}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
                title="A4 Çalışma Kağıdı Olarak Yazdır / PDF İndir"
              >
                <Printer className="w-4 h-4 text-indigo-400" />
                <span>🖨️ Tek Sayfa Yazdır / PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
              >
                Kapat
              </button>
            </div>

            {/* Sağ: Sınıfa Ödev Fırlat & Arşive Kaydet */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAssignToClass}
                disabled={isAssigning || assignSuccess || isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95"
              >
                {assignSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>SM-2 Kuyruğuna Fırlatıldı! 🚀</span>
                  </>
                ) : isAssigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ödev Aktarılıyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>🚀 Sınıfa Ödev Olarak Fırlat</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveToArchive}
                disabled={isSaving || savedSuccess || isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Kaydedildi!</span>
                  </>
                ) : isSaving ? (
                  <span>Kaydediliyor...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>💾 Arşive Kaydet & Çık</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. YAZDIRILABİLİR A4 ÇALIŞMA KAĞIDI (PRINTABLE CHEAT SHEET)              */}
      {/* ========================================================================= */}
      <div id="printable-cheat-sheet" className="hidden print:block text-slate-900 bg-white font-sans p-6">
        {/* Antet */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
              Vocaship Akıllı Tahta • Ders Sonu Çalışma Kağıdı (Cheat Sheet)
            </span>
            <h1 className="text-xl font-black text-slate-950 mt-0.5">{lessonTitle}</h1>
            <p className="text-xs text-slate-600 font-medium">
              Sınıf: <strong>{className}</strong> • Tarih: {new Date().toLocaleDateString("tr-TR")}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <span className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-bold text-[10px]">
              🔒 KVKK Korumalı Asistan
            </span>
          </div>
        </div>

        {/* 1. Hap Yönetici Özeti */}
        <section className="mb-4 p-3 rounded-lg border border-slate-300 bg-slate-50">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-900 mb-2 flex items-center gap-1.5">
            <span>📌 3-4 Maddelik Hap Yönetici Özeti</span>
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-800">
            {summaryPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 2. 5 Kritik Terim Tablosu */}
        <section className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-900 mb-2">
            🏷️ Vurgulanan 5 Kritik Terim & Türkçe Anlamları
          </h2>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th className="border border-slate-300 p-2 text-left font-bold w-1/5">Kelime</th>
                <th className="border border-slate-300 p-2 text-left font-bold w-1/5">Okunuş (IPA)</th>
                <th className="border border-slate-300 p-2 text-left font-bold w-1/4">Türkçe Anlamı</th>
                <th className="border border-slate-300 p-2 text-left font-bold">Örnek Cümle</th>
              </tr>
            </thead>
            <tbody>
              {keyTerms.map((kt, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border border-slate-300 p-2 font-bold text-slate-900">{kt.word}</td>
                  <td className="border border-slate-300 p-2 font-mono text-slate-600">{kt.phonetic || "-"}</td>
                  <td className="border border-slate-300 p-2 text-slate-800">{kt.turkish}</td>
                  <td className="border border-slate-300 p-2 text-slate-700 italic">"{kt.example || "-"}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 3. 3 Hızlı Anlama Sorusu */}
        <section className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-900 mb-2">
            🎯 3 Hızlı Anlama & Pekiştirme Sorusu
          </h2>
          <div className="space-y-3">
            {quizQuestions.map((q, idx) => (
              <div key={idx} className="p-2.5 rounded border border-slate-300 bg-slate-50 text-xs">
                <p className="font-bold text-slate-900 mb-1.5">
                  {idx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-2 gap-2 pl-3">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0" />
                      <span>
                        <strong>{String.fromCharCode(65 + optIdx)})</strong> {opt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Alt İmza & Öğrenci Alanı */}
        <div className="border-t border-slate-300 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-600">
          <div>
            <span>Öğrenci Adı Soyadı: ___________________________</span>
          </div>
          <div>
            <span>Not / Değerlendirme: ________ / 100</span>
          </div>
          <div>
            <span>İmza: _______________</span>
          </div>
        </div>
      </div>

      {/* Global CSS for Print Optimization */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-cheat-sheet,
          #printable-cheat-sheet * {
            visibility: visible;
          }
          #printable-cheat-sheet {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
