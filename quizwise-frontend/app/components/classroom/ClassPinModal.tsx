"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Copy,
  Check,
  QrCode,
  Tv,
  Users,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Maximize2,
} from "lucide-react";

export interface ClassPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  classCode: string | null;
  className?: string;
  gradeLevel?: string;
  onOpenLiveQR?: () => void;
}

export default function ClassPinModal({
  isOpen,
  onClose,
  classCode,
  className,
  gradeLevel = "C1 Pro",
  onOpenLiveQR,
}: ClassPinModalProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!isOpen || !classCode) return null;

  const joinUrl = `${origin}/join?code=${encodeURIComponent(classCode)}&session=${encodeURIComponent(classCode)}`;

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Format code with clear spacing if wanted (e.g. "VRG - 2535")
  const formattedCode = classCode.includes("-")
    ? classCode.replace("-", " - ")
    : classCode.length === 6
    ? `${classCode.slice(0, 3)} ${classCode.slice(3)}`
    : classCode;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-indigo-500/50 p-6 sm:p-10 shadow-2xl shadow-indigo-950/60 text-center space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden my-4"
      >
        {/* Dekoratif Glow Efektleri */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık & Canlı Gösterge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>📺 Akıllı Tahta Katılım Modalı</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {className || "Sınıf Katılım Kodu"}
          </h2>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {gradeLevel}
            </span>
            <span className="text-xs text-slate-400">
              Öğrenciler cihazlarından bu PIN ile anında bağlanabilir
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DEVASE OKUNAKLI PIN KUTUSU & QR KOD ALANI (YAN YANA / MOBİLDE ALT ALTA)  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch pt-2">
          {/* PIN Kodu Alanı (Sol 7 Kolon) */}
          <div className="sm:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-indigo-500/40 shadow-xl shadow-indigo-950/40 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
                Katılım PIN Kodu
              </span>
              <div className="mt-3 py-3 px-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-white selection:bg-indigo-600 block truncate">
                  {formattedCode}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span className="text-emerald-100">PIN Panoya Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Tek Tıkla PIN'i Kopyala</span>
                </>
              )}
            </button>
          </div>

          {/* Dinamik Vektörel QR Kod Alanı (Sağ 5 Kolon) */}
          <div className="sm:col-span-5 p-5 rounded-3xl bg-slate-950/90 border border-indigo-500/30 flex flex-col items-center justify-between text-center space-y-3 relative group">
            <div className="p-2.5 bg-white rounded-2xl shadow-lg border border-slate-200">
              <QRCodeSVG
                value={joinUrl}
                size={96}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-200 block">
                📷 Kamera ile Tara & Katıl
              </span>
              <p className="text-[10px] text-slate-400 leading-tight">
                Şifresiz doğrudan derse giriş
              </p>
            </div>

            {onOpenLiveQR && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLiveQR();
                }}
                className="w-full py-1.5 px-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Dev QR Yansıt</span>
              </button>
            )}
          </div>
        </div>

        {/* Öğrenci Katılım Yönergesi */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <span>
              Öğrencileriniz <b>vocaship.com/classroom</b> adresine giderek bu kodu girdiğinde sınıfınıza anında bağlanır.
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold shrink-0">
            <ShieldCheck className="w-4 h-4" />
            Canlı Senkronize
          </span>
        </div>

        {/* Alt Eylemler */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            Tamam, Tahta Ekranını Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

