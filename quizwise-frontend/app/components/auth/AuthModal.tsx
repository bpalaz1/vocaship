"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  Lock,
  Mail,
  BadgeCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
}

type ModalStep = "form" | "verify" | "forgot_email" | "forgot_reset";

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
}: AuthModalProps) {
  const router = useRouter();
  const { login, register, verifyEmail, forgotPassword, resetPassword, openWelcomeModal, gateReason, setGateReason } =
    useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [step, setStep] = useState<ModalStep>("form");

  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetCode, setResetCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStep("form");
      setErrorMsg(null);
      setInfoMsg(null);
      setVerificationCode("");
      setDevCodeHint(null);
      setResetCode("");
      setNewPassword("");
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    setErrorMsg(null);
    if (step === "form") {
      // keep infoMsg only if returning from reset success
    } else {
      setInfoMsg(null);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const resetAllFields = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setPendingEmail("");
    setVerificationCode("");
    setDevCodeHint(null);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setInfoMsg(null);
    setErrorMsg(null);
    setStep("form");
  };

  const handleOpenForgotPassword = () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setResetCode("");
    setNewPassword("");
    const prefill = username.trim().includes("@")
      ? username.trim().toLowerCase()
      : email.trim().toLowerCase();
    setResetEmail(prefill);
    setStep("forgot_email");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (activeTab === "register") {
      if (!fullName.trim()) {
        setErrorMsg("Lütfen ad ve soyadınızı girin.");
        return;
      }
      if (!username.trim() || username.trim().length < 2) {
        setErrorMsg("Kullanıcı adı en az 2 karakter olmalıdır.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Lütfen geçerli bir e-posta adresi girin.");
        return;
      }
      if (!password || password.length < 3) {
        setErrorMsg("Şifre en az 3 karakter olmalıdır.");
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await register(fullName, username, password, email);
        if (res.requiresEmailVerification) {
          setPendingEmail(res.email);
          setDevCodeHint(res.devVerificationCode || null);
          setInfoMsg(
            res.message ||
              "Doğrulama kodu e-posta adresinize gönderildi. Lütfen 6 haneli kodu girin."
          );
          setStep("verify");
        } else {
          resetAllFields();
          onClose();
          router.push("/");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Kayıt işlemi başarısız oldu.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Giriş Yap sekmesi
    if (!username.trim()) {
      setErrorMsg("Lütfen e-posta adresinizi veya kullanıcı adınızı girin.");
      return;
    }
    if (!password || password.length < 3) {
      setErrorMsg("Şifre en az 3 karakter olmalıdır.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
      resetAllFields();
      onClose();
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err?.message || "E-posta/kullanıcı adı veya şifre hatalı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanCode = verificationCode.trim();
    if (cleanCode.length < 6) {
      setErrorMsg("Lütfen 6 haneli doğrulama kodunu eksiksiz girin.");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(pendingEmail, cleanCode);
      resetAllFields();
      onClose();
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err?.message || "Doğrulama kodu geçersiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    const clean = resetEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setErrorMsg("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(clean);
      setResetEmail(clean);
      setDevCodeHint(res.devCode || null);
      setInfoMsg(res.message);
      setStep("forgot_reset");
    } catch (err: any) {
      setErrorMsg(err?.message || "Sıfırlama kodu gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanCode = resetCode.trim();
    if (cleanCode.length < 6) {
      setErrorMsg("Lütfen e-postanıza gelen 6 haneli sıfırlama kodunu girin.");
      return;
    }
    if (!newPassword || newPassword.length < 3) {
      setErrorMsg("Yeni şifre en az 3 karakter olmalıdır.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(resetEmail, cleanCode, newPassword);
      setInfoMsg(
        res.message ||
          "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz."
      );
      setUsername(resetEmail);
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setActiveTab("login");
      setStep("form");
    } catch (err: any) {
      setErrorMsg(err?.message || "Şifre sıfırlama işlemi başarısız oldu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerTitle =
    step === "verify"
      ? "📩 E-postanı Doğrula"
      : step === "forgot_email" || step === "forgot_reset"
      ? "🔐 Şifre Sıfırlama"
      : activeTab === "login"
      ? "Giriş Yap"
      : "Kayıt Ol";

  const headerSubtitle =
    step === "verify"
      ? "6 haneli onay kodunu girerek yolculuğa başla"
      : step === "forgot_email"
      ? "Kayıtlı e-posta adresine sıfırlama kodu gönder"
      : step === "forgot_reset"
      ? "6 haneli kodu ve yeni şifreni belirle"
      : "VocaShip — Sail to Fluency.";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Dekoratif Parıltı */}
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Başlık ve Kapat Butonu */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              {step === "verify" || step === "forgot_email" ? (
                <Mail className="w-4 h-4" />
              ) : step === "forgot_reset" ? (
                <KeyRound className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                {headerTitle}
              </h2>
              <p className="text-[11px] text-slate-400">{headerSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "verify" ? (
          <form
            onSubmit={handleVerifySubmit}
            className="relative z-10 p-6 space-y-4"
            data-testid="auth-verify-form"
          >
            {errorMsg && (
              <div
                data-testid="auth-error-toast"
                className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/30 space-y-1.5">
              <p className="text-xs font-semibold text-sky-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {infoMsg || "Onay kodu e-posta adresinize gönderildi."}
                </span>
              </p>
              <p className="text-[11px] text-slate-300 font-mono break-all">
                {pendingEmail}
              </p>
              {devCodeHint && (
                <p className="text-[11px] text-amber-300 font-bold pt-1">
                  Test Onay Kodu:{" "}
                  <span className="font-mono tracking-widest">
                    {devCodeHint}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                <span>6 Haneli Doğrulama Kodu</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                data-testid="auth-input-verify-code"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-center text-xl font-black font-mono tracking-[0.45em] text-white placeholder-slate-600 outline-none transition"
              />
            </div>

            <button
              type="submit"
              data-testid="auth-verify-submit-btn"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <span>✅ E-postayı Doğrula ve Başla</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("form");
                setErrorMsg(null);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kayıt bilgilerine geri dön</span>
            </button>
          </form>
        ) : step === "forgot_email" ? (
          <form
            onSubmit={handleSendResetCode}
            className="relative z-10 p-6 space-y-4"
            data-testid="auth-forgot-email-form"
          >
            {errorMsg && (
              <div
                data-testid="auth-error-toast"
                className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed">
              Hesabına bağlı e-posta adresini gir. Sana 15 dakika geçerli 6 haneli tek kullanımlık bir sıfırlama kodu göndereceğiz.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>E-posta Adresi</span>
              </label>
              <input
                type="email"
                data-testid="auth-forgot-input-email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="ornek@eposta.com"
                autoComplete="email"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              data-testid="auth-forgot-send-btn"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-sky-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <span>📩 Sıfırlama Kodu Gönder</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("form");
                setActiveTab("login");
                setErrorMsg(null);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Giriş Yap ekranına dön</span>
            </button>
          </form>
        ) : step === "forgot_reset" ? (
          <form
            onSubmit={handleConfirmResetPassword}
            className="relative z-10 p-6 space-y-4"
            data-testid="auth-forgot-reset-form"
          >
            {errorMsg && (
              <div
                data-testid="auth-error-toast"
                className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-200 text-xs font-semibold space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{infoMsg}</span>
                </div>
                {devCodeHint && (
                  <p className="text-[11px] text-amber-300 font-bold pl-6">
                    Test Sıfırlama Kodu:{" "}
                    <span className="font-mono tracking-widest">
                      {devCodeHint}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>6 Haneli Sıfırlama Kodu</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                data-testid="auth-reset-input-code"
                value={resetCode}
                onChange={(e) =>
                  setResetCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center text-xl font-black font-mono tracking-[0.45em] text-white placeholder-slate-600 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Yeni Şifre</span>
              </label>
              <input
                type="password"
                data-testid="auth-reset-input-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              data-testid="auth-reset-submit-btn"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Güncelleniyor...</span>
                </>
              ) : (
                <span>🔒 Şifreyi Güncelle</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("forgot_email");
                setErrorMsg(null);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Farklı e-posta adresi dene</span>
            </button>
          </form>
        ) : (
          <>
            {/* İki Sekmeli Seçici: Giriş Yap / Kayıt Ol */}
            <div className="relative z-10 px-6 pt-5">
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  data-testid="auth-tab-login"
                  onClick={() => {
                    setInfoMsg(null);
                    setActiveTab("login");
                  }}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  data-testid="auth-tab-register"
                  onClick={() => {
                    setInfoMsg(null);
                    setActiveTab("register");
                  }}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === "register"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>
            </div>

            {/* Sade Form Alanı */}
            <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-4">
              {activeTab === "register" && gateReason && (
                <div
                  data-testid="auth-registration-gate-banner"
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 border border-amber-400/40 text-amber-200 text-xs font-semibold leading-relaxed"
                >
                  ✨ {gateReason}
                </div>
              )}

              {activeTab === "login" && (
                <div className="flex items-center justify-between -mt-1">
                  <button
                    type="button"
                    data-testid="auth-back-to-intro-btn"
                    onClick={openWelcomeModal}
                    className="text-[11px] font-semibold text-slate-400 hover:text-sky-300 transition cursor-pointer"
                  >
                    ← Tanıtımı Gör
                  </button>
                </div>
              )}

              {infoMsg && (
                <div
                  data-testid="auth-info-toast"
                  className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in duration-150"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div
                  data-testid="auth-error-toast"
                  className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in duration-150"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Ad Soyad (Sadece Kayıt) */}
              {activeTab === "register" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ad Soyad</span>
                  </label>
                  <input
                    type="text"
                    data-testid="auth-input-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adınız ve Soyadınız"
                    autoComplete="name"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              )}

              {/* 2. Kullanıcı Adı (Girişte E-posta veya Kullanıcı Adı) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {activeTab === "login"
                      ? "E-posta veya Kullanıcı Adı"
                      : "Kullanıcı Adı"}
                  </span>
                </label>
                <input
                  type="text"
                  data-testid="auth-input-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    activeTab === "login"
                      ? "ornek@eposta.com veya kullaniciadi"
                      : "Kullanıcı adınız"
                  }
                  autoComplete="username"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              {/* 3. E-posta Adresi (Sadece Kayıt) */}
              {activeTab === "register" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>E-posta Adresi</span>
                  </label>
                  <input
                    type="email"
                    data-testid="auth-input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    autoComplete="email"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              )}

              {/* 4. Şifre (+ Şifremi Unuttum?) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Şifre</span>
                  </label>
                  {activeTab === "login" && (
                    <button
                      type="button"
                      data-testid="auth-forgot-password-btn"
                      onClick={handleOpenForgotPassword}
                      className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline transition cursor-pointer"
                    >
                      Şifremi Unuttum?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  data-testid="auth-input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    activeTab === "login" ? "current-password" : "new-password"
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              {/* Gönder Butonu */}
              <div className="pt-2">
                <button
                  type="submit"
                  data-testid="auth-submit-btn"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>İşleniyor...</span>
                    </>
                  ) : activeTab === "login" ? (
                    <span>Giriş Yap</span>
                  ) : (
                    <span>Hesabı Oluştur</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
