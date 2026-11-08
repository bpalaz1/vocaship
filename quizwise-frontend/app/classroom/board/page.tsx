"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  FileText,
  Upload,
  Timer,
  Shuffle,
  Sparkles,
  X,
  Volume2,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import BoardTimer from "./components/BoardTimer";
import BoardSummaryModal from "./components/BoardSummaryModal";

export interface BoardTerm {
  id: string;
  word: string;
  phonetic?: string;
  academic_definition?: string;
  turkish_meaning?: string;
  example?: string;
  category?: string;
}

const REGISTERED_STUDENTS = [
  "Ahmet Kaya",
  "Zeynep Başar",
  "Can Mert",
  "Selin Yılmaz",
  "Burak P.",
  "Elif Demir",
  "Mert Öztürk",
  "Ayşe Çelik",
  "Kaan Arslan",
  "Deniz Kurt",
];

function SmartBoardConsoleContent() {
  const searchParams = useSearchParams();
  const activeClassName = searchParams.get("className") || "10-A İngilizce";

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);

  // 3 Butonlu Kontroller
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // 🎯 Söz Hakkı (Cold-Call) State
  const [coldCallStudent, setColdCallStudent] = useState<string | null>(null);
  const [isColdCalling, setIsColdCalling] = useState(false);

  // Arka Plan Dinleme Tamponu (Web Speech API)
  const [spokenTranscript, setSpokenTranscript] = useState<string>("");
  const spokenBufferRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Arka Planda Sessiz Dinleme (Doğal Konuşma Algılama)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (e: any) => {
        let chunk = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            chunk += e.results[i][0].transcript + " ";
          }
        }
        if (chunk) {
          spokenBufferRef.current += chunk;
          setSpokenTranscript((prev) => prev + chunk);
        }
      };

      rec.onerror = () => {
        // Hata durumunda sessizce devam et
      };

      rec.onend = () => {
        // Oturumu sürekli arka planda tut
        try {
          rec.start();
        } catch {}
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.warn("Background speech recognition start error:", e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // 2. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  // 3. PDF Dosyası Yükleme Mekanizması
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPdfFileName(file.name);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearPdf = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfFile(null);
    setPdfUrl(null);
    setPdfFileName(null);
  };

  // 4. 🎯 Söz Hakkı (Rastgele Öğrenci Seçici)
  const handleTriggerColdCall = () => {
    if (isColdCalling) return;
    setIsColdCalling(true);
    setColdCallStudent(null);

    let count = 0;
    const maxRolls = 18;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * REGISTERED_STUDENTS.length);
      setColdCallStudent(REGISTERED_STUDENTS[randIdx]);
      count++;
      if (count >= maxRolls) {
        clearInterval(interval);
        const finalStudent = REGISTERED_STUDENTS[randIdx];
        setColdCallStudent(finalStudent);
        confetti({ particleCount: 50, spread: 70 });

        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(finalStudent);
          u.lang = "tr-TR";
          window.speechSynthesis.speak(u);
        }

        // 3 saniye sonra otomatik kaldır
        setTimeout(() => {
          setIsColdCalling(false);
          setColdCallStudent(null);
        }, 3200);
      }
    }, 80);
  };

  return (
    <div
      data-testid="smartboard-console"
      className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative"
    >
      {/* Gizli PDF Dosya Seçici Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfUpload}
      />

      {/* ========================================================================= */}
      {/* 1. ÜST KONSOL ŞERİDİ (YALIN & NÖTR)                                       */}
      {/* ========================================================================= */}
      <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 z-20">
        {/* Sol: Geri Dönüş & Akıllı Tahta Başlığı */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/classroom"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs font-bold text-slate-200 transition cursor-pointer active:scale-95"
            title="Sınıflarıma Dön"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Sınıflarım</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="text-xs font-black tracking-wider uppercase font-mono">
              Akıllı Tahta Konsolu • {activeClassName}
            </span>
          </div>
        </div>

        {/* Orta: Aktif Belge / Materyal Bilgisi */}
        <div className="flex items-center gap-3">
          {pdfFileName ? (
            <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 py-1.5 px-3.5 rounded-2xl text-xs">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white font-medium truncate max-w-[200px] sm:max-w-md">
                {pdfFileName}
              </span>
              <button
                type="button"
                onClick={handleClearPdf}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Materyali Kapat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTriggerFileInput}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ders Materyali / PDF Yükle</span>
            </button>
          )}
        </div>

        {/* Sağ: Tam Ekran Modu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekrana Geç"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. ANA ÇALIŞMA ALANI: PDF MATERYALİ (%75-%80) & SAĞ KONTROL (%20)          */}
      {/* ========================================================================= */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* SOL: DERS ÇALIŞMA ALANI / PDF SAHNESİ */}
        <section className="flex-1 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden p-2 sm:p-4">
          {pdfUrl ? (
            <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 relative">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title="Ders PDF Sunumu"
              />
            </div>
          ) : (
            <div
              onClick={handleTriggerFileInput}
              className="w-full h-full rounded-3xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-slate-900/50 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer group"
            >
              <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 group-hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-inner">
                <FileText className="w-10 h-10" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-indigo-300 transition">
                PDF veya Ders Materyali Yükle
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2">
                Bilgisayarınızdan bir ders sunumu, okuma parçası veya alıştırma kağıdı seçin. Tahtada otomatik olarak geniş ekrana yayılacaktır.
              </p>

              <button
                type="button"
                className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 pointer-events-none"
              >
                <Upload className="w-4 h-4" />
                <span>Dosya Seç ➔</span>
              </button>
            </div>
          )}

          {/* SÖZ HAKKI (COLD-CALL) OVERLAY FLASH */}
          {coldCallStudent && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-slate-950 shadow-2xl ring-8 ring-amber-400/40 text-center space-y-3 transform scale-105 transition-all">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 font-black text-xs uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🎯 Söz Hakkı Verildi</span>
                </div>
                <h3 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">
                  {coldCallStudent}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-900/80">
                  Soruyu cevaplama veya fikrini paylaşma sırası sende!
                </p>
              </div>
            </div>
          )}
        </section>

        {/* SAĞ: ÖĞRETMEN YALIN KONTROL KONSOLU (YALNIZCA 3 BUTON) */}
        <aside className="w-64 sm:w-72 bg-slate-900 border-l border-slate-800 p-4 sm:p-5 flex flex-col justify-between shrink-0 space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Ders İçi Eylemler
              </span>
              <h3 className="text-sm font-bold text-white">Tahta Yönetimi</h3>
            </div>

            {/* BUTON 1: SÜRE (TIMER) */}
            <button
              type="button"
              onClick={() => setIsTimerOpen(true)}
              className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-white font-bold text-xs sm:text-sm flex items-center justify-between transition group shadow-md active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Timer className="w-4 h-4" />
                </span>
                <span>⏱️ Süre</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-300">
                Aç / Başlat
              </span>
            </button>

            {/* BUTON 2: SÖZ HAKKI (COLD-CALL) */}
            <button
              type="button"
              disabled={isColdCalling}
              onClick={handleTriggerColdCall}
              className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-between transition group shadow-md active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  <Shuffle className="w-4 h-4" />
                </span>
                <span>🎯 Söz Hakkı</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-amber-300">
                Rastgele Seç
              </span>
            </button>

            {/* BUTON 3: DERSİ BİTİR (END LESSON) */}
            <button
              type="button"
              onClick={() => setIsSummaryModalOpen(true)}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-emerald-600/30 transition group active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-white/20 text-white group-hover:rotate-12 transition-transform">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </span>
                <span>Dersi Bitir</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-emerald-100">
                AI Özet
              </span>
            </button>
          </div>

          {/* Alt Durum Bilgisi */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Arka plan dinleme ve bağlam analizi aktif</span>
          </div>
        </aside>
      </main>

      {/* ========================================================================= */}
      {/* 3. MODALLAR: ESNEK SAYAÇ & DERS SONU ÖZETİ                                */}
      {/* ========================================================================= */}
      <BoardTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />

      <BoardSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        className={activeClassName}
        pdfFileName={pdfFileName}
        spokenTranscript={spokenTranscript}
      />
    </div>
  );
}

export default function SmartBoardConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SmartBoardConsoleContent />
    </Suspense>
  );
}
