"use client";

import React, { useState, useEffect, useRef } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import {
  X,
  Ticket,
  User,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Crown,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { API_BASE } from "../../config";
import {
  getOrInitPaddle,
  getPaddleEnvironment,
  createPaddleEventCallback,
} from "./PaddleCheckoutListener";

function extractTransactionId(data: any): string | null {
  const directId =
    typeof data?.transaction_id === "string" && data.transaction_id.trim()
      ? data.transaction_id.trim()
      : typeof data?.data?.id === "string" && data.data.id.trim()
      ? data.data.id.trim()
      : null;
  if (directId) return directId;

  const checkoutUrl = data?.checkout_url || data?.checkout?.url;
  if (typeof checkoutUrl === "string" && checkoutUrl.trim()) {
    try {
      const parsed = new URL(
        checkoutUrl,
        typeof window !== "undefined" ? window.location.origin : "https://vocaship.com"
      );
      const ptxn = parsed.searchParams.get("_ptxn");
      if (ptxn && ptxn.trim()) return ptxn.trim();
    } catch {
      const match = checkoutUrl.match(/[?&]_ptxn=([^&#]+)/);
      if (match?.[1]) return decodeURIComponent(match[1]);
    }
  }
  return null;
}

export interface ClassTicketCheckoutInfo {
  className: string;
  inviteSlug?: string;
  teacherName?: string;
  price: number;
  currency: string;
  billingType?: "one_time" | "monthly" | string;
  sessionSummary?: string | null;
}

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "class_ticket" | "pro_plan";
  classInfo?: ClassTicketCheckoutInfo | null;
  reasonMessage?: string | null;
  isProcessing?: boolean;
  onConfirmClassCheckout?: () => void | Promise<void>;
  onConfirmProCheckout?: (billingCycle: "monthly" | "yearly") => void | Promise<void>;
}

const PRO_PLAN_FEATURES = [
  "Sınırsız canlı sınıf oluşturma ve akıllı tahta oturumları",
  "AI ile metinlerden otomatik soru ve hedef kelime çıkarma",
  "Sınırsız Speaking Lounge ve özel kelime havuzları",
];

export default function CheckoutModal({
  isOpen,
  onClose,
  mode,
  classInfo,
  reasonMessage,
  isProcessing = false,
  onConfirmClassCheckout,
  onConfirmProCheckout,
}: CheckoutModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const paddleRef = useRef<Paddle | undefined>(undefined);
  const [proBillingCycle, setProBillingCycle] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);
  const [paddleError, setPaddleError] = useState<string | null>(null);
  const [internalProcessing, setInternalProcessing] = useState(false);

  const effectiveProcessing = isProcessing || internalProcessing;

  // Paddle.js ön-başlatma & ödeme tamamlandığında modalı kapatma
  useEffect(() => {
    let active = true;
    getOrInitPaddle().then((paddleInstance) => {
      if (active && paddleInstance) {
        paddleRef.current = paddleInstance;
      }
    });
    const handleCompletedClose = () => {
      onClose();
    };
    window.addEventListener(
      "vocaship_paddle_checkout_completed",
      handleCompletedClose
    );
    return () => {
      active = false;
      window.removeEventListener(
        "vocaship_paddle_checkout_completed",
        handleCompletedClose
      );
    };
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setProBillingCycle("yearly");
      setCardError(null);
      setPaddleError(null);
      setInternalProcessing(false);
    }
  }, [isOpen]);

  const handleFillTestCard = () => {
    setCardHolder("AYILMAZ DEMO");
    setCardNumber("4543 6000 1234 5678");
    setCardExpiry("12/28");
    setCardCvc("842");
    setCardError(null);
  };

  const validateCardFields = () => {
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (!cardHolder.trim() || cleanNum.length < 12 || !cardExpiry.trim() || cardCvc.trim().length < 3) {
      setCardError(
        t(
          "pay_card_validation",
          "Lütfen kart bilgilerini eksiksiz girin veya 'Test Kartı Bilgilerini Doldur' butonunu kullanın."
        )
      );
      return false;
    }
    setCardError(null);
    return true;
  };

  const handleCompleteProPayment = async () => {
    setPaddleError(null);
    setInternalProcessing(true);
    try {
      const uid =
        user?.id ||
        userProfile?.id ||
        userProfile?.user_id ||
        "00000000-0000-0000-0000-000000000001";
      const email = user?.email || userProfile?.email || undefined;

      const cleanedBase = (API_BASE || "").replace(/\/+$/, "");
      const paddleUrl = cleanedBase.endsWith("/api/v1")
        ? `${cleanedBase}/payments/paddle/checkout`
        : `${cleanedBase}/api/v1/payments/paddle/checkout`;

      const res = await fetch(paddleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uid,
          email,
          plan_period: proBillingCycle,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPaddleError(
          data?.detail ||
            "Paddle ödeme oturumu başlatılamadı. Lütfen daha sonra tekrar deneyin."
        );
        return;
      }

      const transactionId = extractTransactionId(data);

      if (!transactionId) {
        setPaddleError("Paddle işlem bilgisi (transaction_id) alınamadı.");
        return;
      }

      const paddleToken = (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "").trim();
      let paddle = paddleRef.current || (await getOrInitPaddle());
      if (!paddle && paddleToken) {
        paddle = await initializePaddle({
          environment: getPaddleEnvironment(),
          token: paddleToken,
          eventCallback: createPaddleEventCallback(),
        }).catch(() => undefined);
      }

      if (!paddle) {
        setPaddleError(
          "Paddle ödeme penceresi başlatılamadı. Lütfen NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ayarını kontrol edin."
        );
        return;
      }

      paddleRef.current = paddle;
      if (onConfirmProCheckout) {
        await onConfirmProCheckout(proBillingCycle);
      }
      onClose();
      paddle.Checkout.open({ transactionId });
    } catch (err: any) {
      setPaddleError(
        err?.message || "Paddle ödeme sunucusuna bağlanılamadı."
      );
    } finally {
      setInternalProcessing(false);
    }
  };

  const handleCompleteClassPayment = async () => {
    if (!validateCardFields()) return;
    if (onConfirmClassCheckout) {
      await onConfirmClassCheckout();
    }
  };

  const renderCardForm = () => (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t("pay_card_info_hdr", "Kart Bilgileri")}</span>
        </span>
        <button
          type="button"
          onClick={handleFillTestCard}
          className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 flex items-center gap-1 transition cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>{t("pay_fill_test_card", "Test Kartı Bilgilerini Doldur")}</span>
        </button>
      </div>

      <input
        type="text"
        value={cardHolder}
        onChange={(e) => setCardHolder(e.target.value)}
        placeholder={t("pay_card_holder_ph", "Kart Üzerindeki İsim")}
        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none"
      />

      <input
        type="text"
        maxLength={19}
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        placeholder="4543 6000 1234 5678"
        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
      />

      <div className="grid grid-cols-2 gap-2.5">
        <input
          type="text"
          maxLength={5}
          value={cardExpiry}
          onChange={(e) => setCardExpiry(e.target.value)}
          placeholder="AA/YY"
          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
        />
        <input
          type="text"
          maxLength={4}
          value={cardCvc}
          onChange={(e) => setCardCvc(e.target.value)}
          placeholder="CVC"
          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
        />
      </div>

      {cardError && (
        <p className="text-[11px] text-rose-400 font-medium">{cardError}</p>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        data-testid="checkout-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-5 text-slate-100 my-auto"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          aria-label={t("close", "Kapat")}
        >
          <X className="w-4 h-4" />
        </button>

        {mode === "class_ticket" && classInfo ? (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 pr-8">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                  {t("pay_ticket_hdr", "Bilet & Ödeme Ekranı")}
                </span>
              </div>
              {classInfo.inviteSlug && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {classInfo.inviteSlug}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                {classInfo.className}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {t("cls_teacher_lbl", "Eğitmen:")} {classInfo.teacherName || t("pay_default_teacher", "VocaShip Eğitmeni")}
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {t("pay_ticket_amount_lbl", "Ders Bilet Tutarı:")}
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {classInfo.price} {classInfo.currency}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">{t("pay_billing_freq", "Ödeme Sıklığı:")}</span>
                <span className="font-bold text-slate-200">
                  {classInfo.billingType === "monthly"
                    ? t("cls_cm_monthly_sub", "Aylık Düzenli Abonelik")
                    : t("cls_cm_one_time", "Tek Seferlik Bilet")}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">{t("pay_rev_split", "Hakediş Bölüşümü:")}</span>
                <span className="text-indigo-300 font-mono text-[11px]">
                  {t("cls_teacher_default", "Eğitmen")}: %88 ({(classInfo.price * 0.88).toFixed(2)}{" "}
                  {classInfo.currency}) • Platform: %12
                </span>
              </div>

              {classInfo.sessionSummary && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t("pay_session_time", "Oturum Zamanı:")}</span>
                  <span className="font-bold text-indigo-300">
                    {classInfo.sessionSummary}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {t("pay_feat1", "Akıllı tahtada canlı interaktif anlatım ve çizim katılımı")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t("pay_feat2", "Ders materyallerine ve notlara anında erişim")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t("pay_feat3", "256-bit SSL korumalı geçici ödeme oturumu")}</span>
              </div>
            </div>

            {renderCardForm()}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleCompleteClassPayment}
                disabled={effectiveProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {effectiveProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("pay_verifying", "Ödeme Doğrulanıyor ve Bilet Tanımlanıyor...")}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {t("pay_complete_secure", "🔒 Güvenli Ödemeyi Tamamla")} ({classInfo.price}{" "}
                      {classInfo.currency})
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>
                  {t("pay_privacy_note", "Ödeme bilgileriniz bu oturum dışında tarayıcıda saklanmaz.")}
                </span>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 pr-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("pay_pro_badge", "PRO ÖDEME PLANI")}</span>
              </div>
              <h2 className="text-xl font-black text-white">
                {t("pay_pro_title", "VocaShip PRO Planını Seçin")}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {reasonMessage ||
                  t("pay_pro_default_reason", "Seçtiğiniz kilitli PRO özelliğini etkinleştirmek için abonelik planınızı seçin.")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setProBillingCycle("monthly")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  proBillingCycle === "monthly"
                    ? "bg-indigo-600/20 border-indigo-400 text-white ring-2 ring-indigo-500/30"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-xs font-bold">{t("pay_monthly_pro", "Aylık PRO")}</div>
                <div className="text-lg font-black font-mono text-indigo-300 mt-1">
                  $7.99/{t("pay_per_month", "ay")}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProBillingCycle("yearly")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  proBillingCycle === "yearly"
                    ? "bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-500/30"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold">{t("pay_yearly_pro", "Yıllık PRO")}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold whitespace-nowrap">
                    %38 İndirim
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-amber-300 mt-1">
                  $59/{t("pay_per_year", "yıl")}
                </div>
              </button>
            </div>

            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              {[
                t("pay_pf1", PRO_PLAN_FEATURES[0]),
                t("pay_pf2", PRO_PLAN_FEATURES[1]),
                t("pay_pf3", PRO_PLAN_FEATURES[2]),
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Ödemeler global ödeme altyapısı <strong className="text-white">Paddle Billing</strong> güvencesiyle (Kart, Apple Pay, PayPal) 256-bit SSL üzerinden işlenir.
              </span>
            </div>

            {paddleError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                {paddleError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                disabled={effectiveProcessing}
                onClick={handleCompleteProPayment}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {effectiveProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Paddle Ödeme Sayfası Açılıyor...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>🔒 Paddle ile Güvenli Öde</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={effectiveProcessing}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                {t("cancel", "Vazgeç")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
