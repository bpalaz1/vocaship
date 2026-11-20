"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Check,
  Loader2,
  Shield,
  User,
  Building2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE } from "../../config";

export function maskIban(rawIban?: string | null, fallbackText = "—"): string {
  if (!rawIban) return fallbackText;
  const clean = rawIban.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 4) return "****";
  const last4 = clean.slice(-4);
  const prefix = clean.startsWith("TR") ? "TR**" : "****";
  return `${prefix} **** **** **** ${last4}`;
}

export function maskIdentityNumber(rawId?: string | null): string {
  if (!rawId) return "***********";
  const clean = rawId.replace(/\D/g, "");
  if (clean.length <= 4) return "****";
  const last4 = clean.slice(-4);
  return `${"*".repeat(clean.length - 4)}${last4}`;
}

export interface PayoutSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (maskedSummary: {
    maskedIban: string;
    maskedIdentity: string;
  }) => void;
}

interface MaskedPayoutSummary {
  accountType: "individual" | "company";
  maskedIban: string;
  maskedIdentity: string;
}

export default function PayoutSetupModal({
  isOpen,
  onClose,
  onSaved,
}: PayoutSetupModalProps) {
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const { t } = useLanguage();

  const [accountType, setAccountType] = useState<"individual" | "company">(
    "individual"
  );
  const [legalFullName, setLegalFullName] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [iban, setIban] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMaskedSummary, setSavedMaskedSummary] =
    useState<MaskedPayoutSummary | null>(null);
  const [earningsData, setEarningsData] = useState<{
    total_gross_revenue: number;
    total_teacher_payout: number;
    currency: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const wipeSensitiveFields = useCallback(() => {
    setAccountType("individual");
    setLegalFullName("");
    setIdentityNumber("");
    setIban("");
  }, []);

  const handleClose = useCallback(() => {
    wipeSensitiveFields();
    setToast(null);
    onClose();
  }, [wipeSensitiveFields, onClose]);

  const formatIbanInput = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean.startsWith("TR") && clean.length > 0) {
      clean = "TR" + clean.replace(/^TR/g, "");
    }
    if (clean.length > 26) {
      clean = clean.slice(0, 26);
    }
    return clean.match(/.{1,4}/g)?.join(" ") || clean;
  };

  useEffect(() => {
    if (!isOpen) {
      wipeSensitiveFields();
      setSavedMaskedSummary(null);
      setEarningsData(null);
      setToast(null);
      return;
    }

    const userId =
      user?.id ||
      userProfile?.username ||
      "00000000-0000-0000-0000-000000000001";

    const loadMaskedSummary = async () => {
      setIsLoading(true);
      try {
        const [profileRes, earningsRes] = await Promise.all([
          fetch(
            `${API_BASE}/api/v1/payments/payout-profile?user_id=${encodeURIComponent(
              userId
            )}`
          ),
          fetch(
            `${API_BASE}/api/v1/payments/earnings?teacher_id=${encodeURIComponent(
              userId
            )}`
          ),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.has_profile && data.profile?.iban) {
            setSavedMaskedSummary({
              accountType: data.profile.account_type || "individual",
              maskedIban: maskIban(data.profile.iban),
              maskedIdentity: maskIdentityNumber(
                data.profile.identity_number || ""
              ),
            });
          } else {
            setSavedMaskedSummary(null);
          }
        }

        if (earningsRes.ok) {
          const eData = await earningsRes.json();
          setEarningsData({
            total_gross_revenue: eData.total_gross_revenue || 0,
            total_teacher_payout: eData.total_teacher_payout || 0,
            currency: eData.currency || "TRY",
          });
        }
      } catch (err) {
        console.warn("[PayoutSetupModal] Hakediş özeti yüklenemedi:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaskedSummary();
  }, [isOpen, user?.id, userProfile?.username, wipeSensitiveFields]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const cleanIban = iban.replace(/\s+/g, "").toUpperCase();
    if (!cleanIban.startsWith("TR") || cleanIban.length !== 26) {
      setToast({
        type: "error",
        text: t("cls_pay_err_iban", "Lütfen 26 haneli geçerli bir TR IBAN numarası girin (Örn: TR12 3456...)"),
      });
      return;
    }

    if (!legalFullName.trim()) {
      setToast({ type: "error", text: t("cls_pay_err_name", "Yasal Ad Soyad alanı zorunludur.") });
      return;
    }

    const cleanId = identityNumber.replace(/\D/g, "");
    if (accountType === "individual" && cleanId.length !== 11) {
      setToast({
        type: "error",
        text: t("cls_pay_err_tckn", "T.C. Kimlik Numarası 11 haneli olmalıdır."),
      });
      return;
    }
    if (accountType === "company" && cleanId.length !== 10) {
      setToast({
        type: "error",
        text: t("cls_pay_err_vkn", "Vergi Kimlik Numarası 10 haneli olmalıdır."),
      });
      return;
    }

    setIsSaving(true);
    const userId =
      user?.id ||
      userProfile?.username ||
      "00000000-0000-0000-0000-000000000001";

    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/payout-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          account_type: accountType,
          legal_full_name: legalFullName.trim(),
          identity_number: cleanId,
          iban: cleanIban,
        }),
      });

      if (res.ok) {
        const maskedSummary = {
          maskedIban: maskIban(cleanIban),
          maskedIdentity: maskIdentityNumber(cleanId),
        };
        setSavedMaskedSummary({
          accountType,
          ...maskedSummary,
        });
        // Kayıt sonrasında hassas alanları hemen bellekten temizle
        wipeSensitiveFields();
        setToast({
          type: "success",
          text: t("cls_pay_saved", "Hakediş profiliniz güvenli şekilde kaydedildi."),
        });
        onSaved?.(maskedSummary);
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({
          type: "error",
          text: err.detail || t("cls_pay_err_save", "Kaydedilirken bir hata oluştu."),
        });
      }
    } catch {
      setToast({
        type: "error",
        text: t("cls_pay_err_conn", "Sunucuya bağlanılamadı. Lütfen tekrar deneyin."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        data-testid="payout-setup-modal"
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Başlık */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                {t("cls_pay_title", "Korumalı Hakediş & IBAN Tanımlama")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t("cls_pay_sub", "Ücretli ders gelirleriniz için şifreli ödeme profili")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label={t("close", "Kapat")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="relative z-10 p-6 space-y-4">
          {isLoading ? (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>{t("cls_pay_checking", "Ödeme profili kontrol ediliyor...")}</span>
            </div>
          ) : (
            savedMaskedSummary && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t("cls_pay_masked_hdr", "Kayıtlı Korumalı Profil (Maskeli)")}</span>
                  </span>
                  {earningsData && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Net: {earningsData.total_teacher_payout}{" "}
                      {earningsData.currency}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      {t("cls_pay_active_iban", "Aktif IBAN")}
                    </span>
                    <span className="font-mono font-bold text-emerald-300 tracking-wider">
                      {savedMaskedSummary.maskedIban}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      {savedMaskedSummary.accountType === "individual"
                        ? t("cls_pay_tckn_saved", "Kayıtlı TCKN")
                        : t("cls_pay_vkn_saved", "Kayıtlı VKN")}
                    </span>
                    <span className="font-mono font-bold text-indigo-300 tracking-wider">
                      {savedMaskedSummary.maskedIdentity}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Hesap Türü */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("cls_pay_tax_type", "Vergi Mükellefiyeti / Hesap Türü")}</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAccountType("individual")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                  accountType === "individual"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/40"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold">{t("cls_pay_indiv_title", "Bireysel (TCKN)")}</div>
                  <div className="text-[10px] opacity-75">{t("cls_pay_indiv", "Şahıs Eğitmen")}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("company")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                  accountType === "company"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/40"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold">{t("cls_pay_corp", "Şirket (VKN)")}</div>
                  <div className="text-[10px] opacity-75">{t("cls_pay_corp_sub", "Tüzel Kişilik")}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Yasal Ad Soyad */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>
                {accountType === "individual"
                  ? t("cls_pay_legal_name", "Yasal Ad Soyad (Banka Hesabındaki Ad)")
                  : t("cls_pay_corp_name", "Şirket / Kurum Resmi Ünvanı")}
              </span>
              <span className="text-[10px] font-normal text-amber-400">
                {t("cls_pay_iban_match", "IBAN ile eşleşmelidir")}
              </span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              value={legalFullName}
              onChange={(e) => setLegalFullName(e.target.value)}
              placeholder={
                accountType === "individual"
                  ? t("cls_pay_name_ph", "Örn: Ahmet Yılmaz")
                  : t("cls_pay_corp_ph", "Örn: ABC Eğitim A.Ş.")
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* TCKN / VKN */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {accountType === "individual"
                ? t("cls_pay_tckn_lbl", "T.C. Kimlik Numarası (11 Hane)")
                : t("cls_pay_vkn_lbl", "Vergi Kimlik Numarası (10 Hane)")}
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              required
              maxLength={accountType === "individual" ? 11 : 10}
              value={identityNumber}
              onChange={(e) =>
                setIdentityNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder={
                accountType === "individual"
                  ? t("cls_pay_tckn_ph", "11 haneli TCKN giriniz")
                  : t("cls_pay_vkn_ph", "10 haneli VKN giriniz")
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tracking-wider"
            />
          </div>

          {/* IBAN */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>{t("cls_pay_iban_lbl", "Banka IBAN Numarası")}</span>
              <span className="text-[10px] font-normal text-slate-400">
                {t("cls_pay_iban_hint", "TR ile başlar (26 Karakter)")}
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                required
                value={iban}
                onChange={(e) => setIban(formatIbanInput(e.target.value))}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
              />
              {iban.replace(/\s+/g, "").length === 26 &&
                iban.startsWith("TR") && (
                  <span className="absolute right-3 top-2.5 text-emerald-400 flex items-center gap-1 text-[11px] font-bold font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t("cls_pay_valid", "Format Doğru")}</span>
                  </span>
                )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {t("cls_pay_privacy", "Kayıt sonrasında TCKN/VKN ve IBAN yalnızca maskeli son 4 hanesiyle gösterilir; form kapatıldığında hassas veriler bellekten temizlenir.")}
            </span>
          </div>

          {toast && (
            <div
              className={`p-3 rounded-xl text-xs font-bold animate-in fade-in flex items-center justify-center gap-2 ${
                toast.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{toast.text}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              {savedMaskedSummary ? t("close", "Kapat") : t("cancel", "Vazgeç")}
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                !iban.trim() ||
                !legalFullName.trim() ||
                !identityNumber.trim()
              }
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("saving", "Kaydediliyor...")}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {savedMaskedSummary
                      ? t("cls_pay_update_btn", "Bilgileri Güncelle")
                      : t("cls_pay_save_btn", "Hakediş Profilini Kaydet")}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
