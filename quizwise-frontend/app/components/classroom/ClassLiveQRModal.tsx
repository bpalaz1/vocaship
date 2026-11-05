"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Radio,
  Tv,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export interface ClassLiveQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  classCode: string | null;
  className?: string;
  gradeLevel?: string;
  activeSessionId?: string;
}

export default function ClassLiveQRModal({
  isOpen,
  onClose,
  classCode,
  className = "Canlı Ders Sınıfı",
  gradeLevel = "C1 Pro",
  activeSessionId = "live-session-1",
}: ClassLiveQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (!isOpen || !classCode) return null;

  // Format code with prominent letter spacing e.g. "VRG - 8 4 9 2"
  const cleanCode = classCode.replace("-", "").toUpperCase();
  const formattedCode =
    cleanCode.length >= 7
      ? `${cleanCode.slice(0, 3)} - ${cleanCode.slice(3).split("").join(" ")}`
      : cleanCode.length === 6
      ? `${cleanCode.slice(0, 3)} - ${cleanCode.slice(3).split("").join(" ")}`
      : classCode.replace("-", " - ");

  // Quick join URL
  const joinUrl = `${origin}/join?code=${encodeURIComponent(classCode)}&session=${encodeURIComponent(activeSessionId)}`;

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-4 sm:p-8 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      {/* ========================================================================= */}
      {/* 1. ÜST BAR: KONTROLLER & CANLI YAYIN ROZETİ                               */}
      {/* ========================================================================= */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl flex items-center justify-between gap-4 pb-4 border-b border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold text-xs tracking-wider uppercase animate-pulse">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>🔴 Akıllı Tahta Canlı QR Modu</span>
          </div>

          <span className="hidden sm:inline-flex text-xs text-slate-400 font-medium">
            Öğrenciler doğrudan kamera ile bağlanır
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tam Ekran Geçiş Butonu */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-bold cursor-pointer"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tahtada Tam Ekran Yap"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Küçült</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline">Tam Ekran</span>
              </>
            )}
          </button>

          {/* Kapat Butonu */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-600/20 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ORTA HERO ALANI: DEVASE QR KOD VE ARALIKLI PIN KODU                    */}
      {/* ========================================================================= */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-auto py-6 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl w-full"
      >
        {/* Sınıf Bilgisi */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {gradeLevel}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Sınıf Katılım Ekranı
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {className}
          </h1>
        </div>

        {/* ===================================================================== */}
        {/* YÜKSEK KONTRASTLI DEV QR KOD (EN AZ 300x300px SAF VEKTÖREL SVG)        */}
        {/* ===================================================================== */}
        <div className="relative group">
          {/* Arkadaki degrade ışıltı */}
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-500 pointer-events-none" />

          {/* Beyaz Optik Kontrast Kutusu */}
          <div className="relative p-6 sm:p-7 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center border-4 border-slate-100">
            <QRCodeSVG
              value={joinUrl}
              size={290}
              level="H"
              includeMargin={false}
              className="w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]"
            />
          </div>
        </div>

        {/* ===================================================================== */}
        {/* QR ALTINDA DEV PUNTOLU ARALIKLI 6 HANELİ KATILIM KODU                 */}
        {/* ===================================================================== */}
        <div className="space-y-3 w-full max-w-lg">
          <div className="py-3 px-6 rounded-2xl bg-slate-900 border-2 border-indigo-500/40 shadow-inner flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold font-mono tracking-widest uppercase text-indigo-300">
              Alternatif 6 Haneli Katılım Kodu
            </span>
            <span className="text-3xl sm:text-5xl font-mono font-black tracking-[0.2em] text-white pt-1 selection:bg-indigo-600">
              {formattedCode}
            </span>
          </div>

          {/* Pedagojik Yönlendirme Metni */}
          <div className="space-y-1 text-center">
            <p className="text-sm sm:text-base font-extrabold text-slate-200 flex items-center justify-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Kameranızı tahtaya tutun ve anında derse katılın</span>
            </p>
            <p className="text-xs text-slate-400">
              Şifresiz ve hızlı eşleşme • Cihazınız doğrudan etkileşimli canlı derse bağlanacaktır.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ALT BİLGİ VE DOĞRUDAN BAĞLANTI KOPYALAMA ÇUBUĞU                        */}
      {/* ========================================================================= */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl"
      >
        <div className="flex items-center gap-2.5 text-xs text-slate-300 truncate max-w-full">
          <span className="text-indigo-400 font-mono font-bold shrink-0">🔗 Doğrudan Link:</span>
          <span className="font-mono text-slate-400 truncate text-[11px] select-all">
            {joinUrl}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Linki Kopyala</span>
              </>
            )}
          </button>

          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            title="Öğrenci Girişini Yeni Sekmede Test Et"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Test Et</span>
          </a>
        </div>
      </div>
    </div>
  );
}

