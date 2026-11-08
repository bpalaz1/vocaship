"use client";

import React, { useState } from "react";
import { Sparkles, X, Check, BookOpen, HelpCircle, Archive, Save } from "lucide-react";
import confetti from "canvas-confetti";

export interface BoardLessonSummaryData {
  id: string;
  className: string;
  lessonTitle: string;
  date: string;
  summaryPoints: string[];
  keyConcepts: string[];
  questions: { question: string }[];
}

export interface BoardSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  pdfFileName?: string | null;
  spokenTranscript?: string;
  onSavedToArchive?: (lesson: BoardLessonSummaryData) => void;
}

export default function BoardSummaryModal({
  isOpen,
  onClose,
  className = "10-A İngilizce",
  pdfFileName,
  spokenTranscript = "",
  onSavedToArchive,
}: BoardSummaryModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Akıllı Başlık ve Özet Türetimi
  const cleanPdfName = pdfFileName ? pdfFileName.replace(/\.pdf$/i, "").replace(/[_-]/g, " ") : "";
  const derivedTitle = cleanPdfName
    ? cleanPdfName.charAt(0).toUpperCase() + cleanPdfName.slice(1)
    : spokenTranscript.length > 30
    ? "İnteraktif Sınıf Dersi & Pratik Çalışması"
    : "Günün Canlı Dersi & Kavram Analizi";

  const summaryPoints = [
    cleanPdfName
      ? `'${derivedTitle}' ders materyali tahtada incelendi ve ana bölümler analiz edildi.`
      : "Ders boyunca işlenen temel konu başlıkları ve öğretmen açıklamaları pekiştirildi.",
    "Öğrencilerle etkileşimli soru-cevap ve rastgele söz hakkı turları tamamlandı.",
    "Önemli kavramlar, dil kalıpları ve dersin anahtar çıkarımları özetlendi.",
  ];

  const keyConcepts = cleanPdfName
    ? ["Ana Tema", "Kritik Çıkarımlar", "Kavram Analizi", "Soru Çözümü", "Uygulama"]
    : ["Temel Kavramlar", "Ders Akışı", "Örnek Olay", "Soru-Cevap", "Özet"];

  const questions = [
    { question: `Bugünkü '${derivedTitle}' konusunda en kritik çıkarım neydi?` },
    { question: "İşlenen temel kavramları kendi cümlelerinizle nasıl özetlersiniz?" },
    { question: "Bu derste öğrendiğiniz bilgileri günlük hayatta nerede kullanabilirsiniz?" },
  ];

  const handleSaveToArchive = () => {
    setIsSaving(true);
    const now = new Date();
    const formattedDate = `${now.getDate()} ${
      ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][
        now.getMonth()
      ]
    } ${now.getFullYear()} • ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newArchiveLesson: BoardLessonSummaryData = {
      id: `lesson_${Date.now()}`,
      className,
      lessonTitle: derivedTitle,
      date: formattedDate,
      summaryPoints,
      keyConcepts,
      questions,
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
      // Sınıf portalına yönlendir
      if (typeof window !== "undefined") {
        window.location.href = "/classroom?tab=archive";
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-200 my-auto">
        {/* Üst Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Ders Sonu AI Özeti & Çıkarımları
              </h3>
              <p className="text-xs text-slate-400">
                {className} • Otomatik pedagojik özet ve anlama soruları
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

        {/* 1. Otomatik Ders Başlığı */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
            Ders Başlığı
          </span>
          <h4 className="text-base font-bold text-white">{derivedTitle}</h4>
        </div>

        {/* 2. 3 Maddelik Ders Özeti */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>3 Maddelik Ders Özeti</span>
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {summaryPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. 5 Kilit Kavram */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 block">5 Kilit Kavram:</span>
          <div className="flex flex-wrap gap-2">
            {keyConcepts.map((kc, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
              >
                #{kc}
              </span>
            ))}
          </div>
        </div>

        {/* 4. 3 Anlama Sorusu */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>3 Anlama ve Pekiştirme Sorusu</span>
          </span>
          <div className="space-y-1.5 text-xs text-slate-300">
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl">
                <span className="font-bold text-amber-400 shrink-0">{i + 1}.</span>
                <span>{q.question}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kaydet ve Bitir Butonları */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            İptal
          </button>

          <button
            type="button"
            onClick={handleSaveToArchive}
            disabled={isSaving || savedSuccess}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Arşive Kaydedildi! Yönlendiriliyor...</span>
              </>
            ) : isSaving ? (
              <span>Kaydediliyor...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Ders Arşivine Kaydet & Bitir ➔</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

