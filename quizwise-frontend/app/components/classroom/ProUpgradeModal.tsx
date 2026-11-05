"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Zap, Crown, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
  reasonMessage?: string | null;
}

const PRO_BENEFITS = [
  "Sınırsız sınıf oluşturma ve 6 haneli kodla öğrenci bağlama",
  "AI ile metinlerden otomatik soru ve hedef kelime çıkarma",
  "Canlı sınıf stüdyosu ve ekran paylaşımı",
  "Sınırsız Speaking Lounge ve kelime kapasitesi",
];

export default function ProUpgradeModal({
  isOpen,
  onClose,
  onUpgraded,
  reasonMessage,
}: ProUpgradeModalProps) {
  const { upgradeToPro } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestModeUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
      onUpgraded?.();
      onClose();
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        data-testid="pro-upgrade-modal"
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl shadow-amber-950/40 overflow-hidden text-slate-100 p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arka Plan Parıltısı */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer z-20"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Üst Rozet ve Başlık */}
        <div className="relative z-10 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>VOREGO PRO EĞİTMEN &amp; SINIRSIZ ERİŞİM</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            🎓 Vorego PRO Eğitmen Paketine Geçin
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {reasonMessage ||
              "Sınıf açmak, AI ile metinlerden otomatik ödev üretmek ve günlük kullanım sınırlarını kaldırmak için PRO Eğitmen paketini etkinleştirin."}
          </p>
        </div>

        {/* Avantaj Maddeleri */}
        <div className="relative z-10 space-y-2.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          {PRO_BENEFITS.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-semibold">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Aksiyon Butonları */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            data-testid="pro-upgrade-test-btn"
            disabled={isUpgrading}
            onClick={handleTestModeUpgrade}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>
              {isUpgrading
                ? "PRO Aktif Ediliyor..."
                : "[ ⚡ Şimdilik Beni PRO Yap (Test Modu) ]"}
            </span>
          </button>

          <button
            type="button"
            data-testid="pro-upgrade-cancel-btn"
            onClick={onClose}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            [ Vazgeç ]
          </button>
        </div>
      </div>
    </div>
  );
}

