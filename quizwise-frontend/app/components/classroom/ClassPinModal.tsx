"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

/**
 * 3 Karakter - 3 Karakter PIN üretici (Örn: 7A2-5K9)
 * Sadece rakamlar ve A, B, K, M, T karakterleri kullanılır.
 */
export function generateClassPin(): string {
  const chars = "0123456789ABKMT";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 3; i++) {
    part1 += chars[Math.floor(Math.random() * chars.length)];
    part2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${part1}-${part2}`;
}

export interface ClassPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  classCode: string | null;
  className?: string;
  onRegeneratePin?: (newPin: string) => void;
}

export default function ClassPinModal({
  isOpen,
  onClose,
  classCode,
  className,
  onRegeneratePin,
}: ClassPinModalProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [activePin, setActivePin] = useState<string>(classCode || "7A2-5K9");
  const [guestStudent, setGuestStudent] = useState<string | null>(
    "Caner T. (Misafir)"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (classCode) {
      setActivePin(classCode);
    }
  }, [classCode]);

  if (!isOpen) return null;

  const joinUrl = `${origin}/join?code=${encodeURIComponent(activePin)}`;

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(activePin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleRegenerate = () => {
    const newPin = generateClassPin();
    setActivePin(newPin);
    if (onRegeneratePin) {
      onRegeneratePin(newPin);
    }
  };

  // 3 Karakter - 3 Karakter ayrımı
  const formattedPin = activePin.includes("-")
    ? activePin.replace("-", " - ")
    : activePin.length === 6
    ? `${activePin.slice(0, 3)} - ${activePin.slice(3)}`
    : activePin;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden my-4"
      >
        {/* Dekoratif Glow Efektleri */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Katılım Kodu & Davetiye</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {className || "Sınıf Katılım Kodu"}
          </h2>
          <p className="text-xs text-slate-400">
            Kayıtlı öğrenciler doğrudan katılır. Misafir öğrenciler için öğretmen onayı gerekir.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* PIN KUTUSU & QR KOD                                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch pt-1">
          {/* PIN Kodu Alanı (Sol 7 Kolon) */}
          <div className="sm:col-span-7 p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-inner flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Ders Katılım PIN
                </span>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition cursor-pointer"
                  title="Yeni bir PIN kodu oluştur"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Yenile</span>
                </button>
              </div>

              <div className="mt-2.5 py-3 px-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white selection:bg-indigo-600 block truncate">
                  {formattedPin}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span className="text-emerald-100">PIN Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>PIN Kodunu Kopyala</span>
                </>
              )}
            </button>
          </div>

          {/* Dinamik QR Kod (Sağ 5 Kolon) */}
          <div className="sm:col-span-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-between text-center space-y-2">
            <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-200">
              <QRCodeSVG value={joinUrl} size={90} level="M" includeMargin={false} />
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-200 block">
                📷 Kamera ile Tara
              </span>
              <p className="text-[10px] text-slate-400">Doğrudan sınıfa bağlan</p>
            </div>
          </div>
        </div>

        {/* Misafir Öğrenci Katılım Onay Rozeti (Adım 1 - NEW 4) */}
        {guestStudent && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-left animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span>
                Misafir: <b className="text-white">{guestStudent}</b> onay bekliyor
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setGuestStudent(null)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                title="Sınıfa Al"
              >
                <UserCheck className="w-3 h-3" />
                <span>Kabul Et</span>
              </button>
              <button
                type="button"
                onClick={() => setGuestStudent(null)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                title="Reddet"
              >
                <UserX className="w-3 h-3" />
                <span>Reddet</span>
              </button>
            </div>
          </div>
        )}

        {/* Öğrenci Katılım Yönergesi */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-3 text-left">
          <span>
            Öğrenciler <b>vocaship.com/classroom</b> adresine bu 6 haneli kodu girerek anında bağlanır.
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            Canlı
          </span>
        </div>

        {/* Kapat Butonu */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
