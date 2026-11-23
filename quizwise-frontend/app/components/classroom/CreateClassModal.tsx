"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  School,
  Globe,
  CreditCard,
  Loader2,
  CheckCircle2,
  Lock,
  Layers,
  Link as LinkIcon,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE } from "../../config";
import { maskIban } from "./PayoutSetupModal";

export interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated?: (createdClass: any) => void;
  onOpenIbanSettings?: () => void;
  onOpenPayoutModal?: () => void;
  payoutRefreshKey?: number;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onClassCreated,
  onOpenIbanSettings,
  onOpenPayoutModal,
  payoutRefreshKey = 0,
}: CreateClassModalProps) {
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const { t } = useLanguage();

  // Form Değerleri
  const [className, setClassName] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"fixed" | "slot_booking">("fixed");
  
  // Varsayılan tarih: Yarın saat 18:00
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getTomorrowDate());
  const [startTime, setStartTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);

  // Katılım Modeli (Ücretsiz vs Ücretli)
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(250);
  const [currency, setCurrency] = useState<"TRY" | "USD" | "EUR">("TRY");
  const [billingType, setBillingType] = useState<"one_time" | "monthly">("one_time");

  // Vitrin, Branş, Anlatım Dili & Açıklama
  const [visibility, setVisibility] = useState<"public" | "invite_only">("invite_only");
  const [category, setCategory] = useState<"speaking" | "exam" | "business" | "reading">("speaking");
  const [teachingLang, setTeachingLang] = useState<"TR" | "EN" | "DE" | "OTHER">("TR");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  // İhtiyaç Anında IBAN Kontrolü (Lazy Onboarding)
  const [hasIban, setHasIban] = useState<boolean | null>(null);
  const [maskedIban, setMaskedIban] = useState<string | null>(null);
  const [isCheckingIban, setIsCheckingIban] = useState<boolean>(false);
  const [hasAutoPromptedPayout, setHasAutoPromptedPayout] = useState<boolean>(false);

  // İşlem Durumları
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdClassData, setCreatedClassData] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Yerel Saat Dilimi Etiketi
  const userTimezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  // Modal sıfırlama
  useEffect(() => {
    if (isOpen) {
      setClassName("");
      setScheduleMode("fixed");
      setStartDate(getTomorrowDate());
      setStartTime("18:00");
      setDurationMinutes(60);
      setIsPaid(false);
      setPrice(250);
      setCurrency("TRY");
      setBillingType("one_time");
      setVisibility("invite_only");
      setCategory("speaking");
      setTeachingLang("TR");
      setDescription("");
      setTargetAudience("");
      setHasIban(null);
      setMaskedIban(null);
      setHasAutoPromptedPayout(false);
      setErrorMessage(null);
      setCreatedClassData(null);
      setIsCopied(false);
    }
  }, [isOpen]);

  // Bağımsız Korumalı Hakediş Penceresini Aç
  const handleOpenIbanModal = () => {
    if (onOpenPayoutModal) {
      onOpenPayoutModal();
    } else if (onOpenIbanSettings) {
      onOpenIbanSettings();
    }
  };

  // Ücretli seçildiğinde IBAN profilini arka planda sorgula
  const checkTeacherIban = async (autoPromptIfMissing: boolean = false) => {
    const userId = user?.id || userProfile?.username || "00000000-0000-0000-0000-000000000001";
    setIsCheckingIban(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/payout-profile?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        const valid = Boolean(data.has_profile && data.profile?.iban);
        setHasIban(valid);
        setMaskedIban(valid ? maskIban(data.profile.iban) : null);
        if (!valid && autoPromptIfMissing && !hasAutoPromptedPayout) {
          setHasAutoPromptedPayout(true);
          handleOpenIbanModal();
        }
      } else {
        setHasIban(false);
        setMaskedIban(null);
        if (autoPromptIfMissing && !hasAutoPromptedPayout) {
          setHasAutoPromptedPayout(true);
          handleOpenIbanModal();
        }
      }
    } catch {
      setHasIban(false);
      setMaskedIban(null);
      if (autoPromptIfMissing && !hasAutoPromptedPayout) {
        setHasAutoPromptedPayout(true);
        handleOpenIbanModal();
      }
    } finally {
      setIsCheckingIban(false);
    }
  };

  useEffect(() => {
    if (isPaid && hasIban === null) {
      checkTeacherIban(true);
    }
  }, [isPaid, hasIban]);

  useEffect(() => {
    if (isOpen && isPaid && payoutRefreshKey > 0) {
      checkTeacherIban(false);
    }
  }, [payoutRefreshKey]);

  if (!isOpen) return null;

  // Sınıfı Oluştur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    // Ücretli ise ve IBAN yoksa engelle
    if (isPaid && hasIban === false) {
      setErrorMessage(t("cls_cm_err_iban", "Ücretli ders açabilmek için önce IBAN bilgilerinizi tanımlamalısınız."));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const userId = user?.id || userProfile?.username || "00000000-0000-0000-0000-000000000001";

    // Tarihi UTC'ye çevir (.toISOString())
    let scheduledDatesUtc: string[] = [];
    if (scheduleMode === "fixed" && startDate && startTime) {
      try {
        const localDt = new Date(`${startDate}T${startTime}:00`);
        scheduledDatesUtc = [localDt.toISOString()];
      } catch {
        scheduledDatesUtc = [new Date().toISOString()];
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/classroom/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: userId,
          name: className.trim(),
          price: isPaid ? Number(price) : 0.0,
          currency: currency,
          billing_type: billingType,
          schedule_mode: scheduleMode,
          scheduled_dates_utc: scheduledDatesUtc,
          duration_minutes: Number(durationMinutes),
          monthly_credits: billingType === "monthly" ? 4 : 0,
          visibility,
          category,
          teaching_lang: teachingLang,
          description: description.trim() || null,
          target_audience: targetAudience.trim() || null,
        }),
      });

      if (res.status === 201 || res.ok) {
        const data = await res.json();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setCreatedClassData(data);
        onClassCreated?.(data);
      } else {
        const err = await res.json();
        if (err.detail === "IBAN_REQUIRED") {
          setHasIban(false);
          setErrorMessage(err.message || t("cls_cm_err_iban", "Ücretli ders açabilmek için önce IBAN bilgilerinizi tanımlamalısınız."));
        } else {
          setErrorMessage(err.detail || err.message || t("cls_cm_err_create", "Sınıf oluşturulurken bir hata oluştu."));
        }
      }
    } catch (err) {
      setErrorMessage(t("cls_cm_err_conn", "Sunucu bağlantısı sağlanamadı. Lütfen tekrar deneyin."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Davet Linkini Kopyala
  const handleCopyLink = () => {
    if (!createdClassData) return;
    const slug = createdClassData.invite_slug || createdClassData.code;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/join/${slug}`;
    navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 my-auto"
      >
        {/* Parıltı Efektleri */}
        <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Modal Üst Başlığı */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                {createdClassData
                  ? t("cls_cm_ready_title", "🎉 Sınıfınız Hazır!")
                  : t("cls_cm_new_title", "Yeni Sınıf / Ders Oluştur")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {createdClassData
                  ? t("cls_cm_ready_sub", "Davet linkinizi öğrencilerinizle hemen paylaşın")
                  : t("cls_cm_new_sub", "Birebir veya grup dersinizi dakikalar içinde başlatın")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* BAŞARILI DURUM: DAVET LİNKİ PAYLAŞIM KUTUSU                               */}
        {/* ========================================================================= */}
        {createdClassData ? (
          <div className="p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{createdClassData.name}</span>
              </div>

              <div className="text-2xl font-black font-mono tracking-widest text-white">
                {createdClassData.invite_slug || createdClassData.code}
              </div>

              <p className="text-xs text-slate-300">
                {createdClassData.price > 0
                  ? t("cls_cm_paid_badge", "💰 Ücretli Bilet: {price} {currency}")
                      .replace("{price}", String(createdClassData.price))
                      .replace("{currency}", String(createdClassData.currency))
                  : t("cls_cm_free_badge", "🟢 Ücretsiz Katılım")}
                {" • "}
                {scheduleMode === "fixed" ? `${startDate} ${startTime}` : t("cls_cm_flex_slot", "Esnek Slot Seçimi")}
              </p>
            </div>

            {/* Kopyalanabilir Davet Linki */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t("cls_cm_invite_lbl", "Öğrenci Davet Bağlantısı:")}</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/join/${
                    createdClassData.invite_slug || createdClassData.code
                  }`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 font-mono select-all focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isCopied
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t("cls_cm_copied", "Kopyalandı!")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t("copy", "Kopyala")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition cursor-pointer"
              >
                {t("cls_cm_back_classes", "Sınıflarıma Dön")}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* FORM DURUMU: SINIF DETAYLARI, ZAMANLAMA VE FİYATLANDIRMA                  */
          /* ========================================================================= */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* 1. Sınıf / Ders Adı */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {t("cls_cm_title_lbl", "Sınıf / Ders Başlığı")}
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder={t("cls_cm_title_ph", "Örn: IELTS Okuma & Kelime Grubu veya Ahmet ile Birebir")}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* 2. Zamanlama Tipi: Sabit Tarih vs Esnek Slot */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>{t("cls_cm_sched_model", "Zamanlama Modeli")}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {t("cls_cm_local_time", "Yerel Saat:")} {userTimezone}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleMode("fixed")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    scheduleMode === "fixed"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/40"
                      : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">{t("cls_cm_fixed_date", "Sabit Tarihli")}</div>
                    <div className="text-[10px] opacity-75">{t("cls_cm_fixed_sub", "Tek / Belirli Saat")}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleMode("slot_booking")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    scheduleMode === "slot_booking"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/40"
                      : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">{t("cls_cm_flex_slot", "Esnek Slot Seçimi")}</div>
                    <div className="text-[10px] opacity-75">{t("cls_cm_flex_slot_sub", "Öğrenci Müsaitlikten Seçer")}</div>
                  </div>
                </button>
              </div>

              {scheduleMode === "fixed" ? (
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-slate-400">{t("cls_cm_date_lbl", "Tarih")}</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-slate-400">{t("cls_cm_time_lbl", "Saat")}</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-slate-400">{t("cls_cm_duration", "Süre")}</label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value={30}>30 {t("cls_min_short", "dk")}</option>
                      <option value={45}>45 {t("cls_min_short", "dk")}</option>
                      <option value={60}>60 {t("cls_min_short", "dk")}</option>
                      <option value={90}>90 {t("cls_min_short", "dk")}</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-300">
                  {t("cls_cm_flex_note", "📅 Öğrencileriniz ders biletini aldıktan sonra takviminizdeki açık saatlerden uygun olanı seçecektir.")}
                </div>
              )}
            </div>

            {/* 2.5 Vitrin Görünürlüğü, Branş, Dil ve İçerik */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Görünürlük</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer text-xs font-bold ${
                      visibility === "public"
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🌍 Herkese Açık Vitrin Dersi
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("invite_only")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer text-xs font-bold ${
                      visibility === "invite_only"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/40"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🔒 Sadece Davet Linki
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Oda Kategorisi</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="speaking">Speaking Kulübü</option>
                    <option value="exam">YDS / IELTS / TOEFL</option>
                    <option value="business">İş İngilizcesi</option>
                    <option value="reading">Okuma & Kelime</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Dersin Anlatım Dili</label>
                  <select
                    value={teachingLang}
                    onChange={(e) => setTeachingLang(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TR">Türkçe (TR)</option>
                    <option value="EN">İngilizce (EN)</option>
                    <option value="DE">Almanca (DE)</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Kısa Ders İçeriği</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bu derste hangi konuları işleyeceksiniz?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Kimler Katılmalı</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: B1-B2 seviyesinde konuşma pratiği yapmak isteyenler"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 3. Katılım Modeli (Tek Karar Anahtarı: Ücretsiz vs Ücretli) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                {t("cls_cm_pricing_hdr", "Katılım & Fiyatlandırma Modeli")}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    !isPaid
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40"
                      : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">🟢</span>
                  <div>
                    <div className="text-xs font-bold">{t("cls_cm_free_class", "Ücretsiz Sınıf")}</div>
                    <div className="text-[10px] opacity-75">{t("cls_cm_free_sub", "Topluluk & Serbest Katılım")}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPaid(true);
                    if (hasIban === false) {
                      handleOpenIbanModal();
                    } else if (hasIban === null) {
                      checkTeacherIban(true);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    isPaid
                      ? "bg-amber-600/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40"
                      : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">💰</span>
                  <div>
                    <div className="text-xs font-bold">{t("cls_cm_paid_class", "Ücretli Ders")}</div>
                    <div className="text-[10px] opacity-75">{t("cls_cm_paid_sub", "Bilet / Abonelik Geliri")}</div>
                  </div>
                </button>
              </div>

              {/* Ücretli Seçildiğinde Tutar ve Ödeme Sıklığı */}
              {isPaid && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">{t("cls_cm_ticket_amount", "Bilet Tutarı")}</label>
                      <input
                        type="number"
                        min={1}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">{t("cls_cm_currency_lbl", "Para Birimi")}</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value="TRY">TRY (₺)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">{t("cls_cm_pay_model", "Ödeme Modeli")}</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setBillingType("one_time")}
                        className={`py-1.5 px-2.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                          billingType === "one_time"
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {t("cls_cm_one_time", "Tek Seferlik Bilet")}
                      </button>

                      <button
                        type="button"
                        onClick={() => setBillingType("monthly")}
                        className={`py-1.5 px-2.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                          billingType === "monthly"
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {t("cls_cm_monthly_sub", "Aylık Düzenli Abonelik")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* İHTİYAÇ ANINDA IBAN KAPISI (Lazy Onboarding Uyarısı) */}
            {isPaid && (
              isCheckingIban ? (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>{t("cls_cm_checking_iban", "IBAN profiliniz kontrol ediliyor...")}</span>
                </div>
              ) : hasIban === false ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {t("cls_cm_iban_warn", "Ücretli ders açabilmek ve hakedişinizin doğrudan hesabınıza yatması için önce IBAN bilginizi tanımlamalısınız.")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenIbanModal}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                    <span>{t("cls_cm_define_iban", "💳 Hemen IBAN Tanımla")}</span>
                  </button>
                </div>
              ) : hasIban === true ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      {t("cls_cm_iban_ready", "Hakediş IBAN tanımlı")}{" "}
                      {maskedIban ? (
                        <strong className="font-mono text-emerald-200">
                          ({maskedIban})
                        </strong>
                      ) : null}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenIbanModal}
                    className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-[10px] shrink-0 transition cursor-pointer"
                  >
                    {t("cls_cm_update", "Güncelle")}
                  </button>
                </div>
              ) : null
            )}

            {/* Hata Mesajı */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Alt Butonlar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                {t("cancel", "Vazgeç")}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !className.trim() || (isPaid && hasIban === false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("cls_cm_creating", "Oluşturuluyor...")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t("cls_cm_submit", "Sınıfı Oluştur & Link Al")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

