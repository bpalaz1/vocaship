"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Zap, Crown, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import CheckoutModal from "../payments/CheckoutModal";

export interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
  reasonMessage?: string | null;
}

export default function ProUpgradeModal({
  isOpen,
  onClose,
  onUpgraded,
  reasonMessage,
}: ProUpgradeModalProps) {
  const { upgradeToPro } = useAuth();
  const { isDark } = useAppTheme();
  const { t } = useLanguage();
  const proBenefits = [
    t("cls_pro_b1", "Sınırsız sınıf oluşturma ve 6 haneli kodla öğrenci bağlama"),
    t("cls_pro_b2", "AI ile metinlerden otomatik soru ve hedef kelime çıkarma"),
    t("cls_pro_b3", "Canlı sınıf stüdyosu ve ekran paylaşımı"),
    t("cls_pro_b4", "Sınırsız Speaking Lounge ve kelime kapasitesi"),
  ];
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setShowCheckoutModal(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestModeUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
      setShowCheckoutModal(false);
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
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 ${
          isDark
            ? "bg-slate-900 border-amber-500/40 shadow-amber-950/40 text-slate-100"
            : "bg-[#f8fafc] border-amber-300 shadow-slate-900/20 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arka Plan Parıltısı */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition cursor-pointer z-20 ${
            isDark
              ? "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white"
              : "bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900"
          }`}
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Üst Rozet ve Başlık */}
        <div className="relative z-10 space-y-3 text-center sm:text-left">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-extrabold ${isDark ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "bg-amber-100 border-amber-300 text-amber-900"}`}>
            <Crown className={`w-3.5 h-3.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
            <span>{t("cls_pro_badge", "VOCASHIP PRO EĞİTMEN & SINIRSIZ ERİŞİM")}</span>
          </div>

          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {t("cls_pro_title", "🎓 VocaShip PRO Eğitmen Paketine Geçin")}
          </h2>

          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {reasonMessage ||
              t("cls_pro_default_reason", "Sınıf açmak, AI ile metinlerden otomatik ödev üretmek ve günlük kullanım sınırlarını kaldırmak için PRO Eğitmen paketini etkinleştirin.")}
          </p>
        </div>

        {/* Avantaj Maddeleri */}
        <div className={`relative z-10 space-y-2.5 p-4 rounded-2xl border ${isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-100 border-slate-300"}`}>
          {proBenefits.map((benefit, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 text-xs sm:text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <span className="font-semibold">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Aksiyon Butonları */}
        <div className="relative z-10 flex flex-col gap-2.5 pt-1">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={isUpgrading}
              onClick={() => setShowCheckoutModal(true)}
              className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t("cls_pro_select_plan", "PRO Ödeme Planını Seç & Geç")}</span>
            </button>

            <button
              type="button"
              data-testid="pro-upgrade-cancel-btn"
              onClick={onClose}
              className={`w-full sm:w-auto py-3.5 px-5 rounded-2xl border font-bold text-xs sm:text-sm transition cursor-pointer ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
                  : "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800 hover:text-slate-950"
              }`}
            >
              {t("cancel", "Vazgeç")}
            </button>
          </div>

          <button
            type="button"
            data-testid="pro-upgrade-test-btn"
            disabled={isUpgrading}
            onClick={handleTestModeUpgrade}
            className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 ${
              isDark
                ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300"
                : "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>
              {isUpgrading
                ? "..."
                : t("cls_pro_test_btn", "Şimdilik Beni PRO Yap (Test Modu)")}
            </span>
          </button>
        </div>
      </div>

      {/* Yalnızca Kilitli PRO Özelliğe Geçiş Anında Açılan Ödeme Planı Modalı */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        mode="pro_plan"
        reasonMessage={reasonMessage}
        isProcessing={isUpgrading}
        onConfirmProCheckout={handleTestModeUpgrade}
      />
    </div>
  );
}

