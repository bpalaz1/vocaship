"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Lock,
  BadgeCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  Check,
} from "lucide-react";
import { useAuth, PlanTier } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
}: AuthModalProps) {
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("basic");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === "register" && !fullName.trim()) {
      setErrorMsg(t("auth_err_fullname"));
      return;
    }
    if (!username.trim()) {
      setErrorMsg(t("auth_err_username"));
      return;
    }
    if (!password || password.length < 3) {
      setErrorMsg(t("auth_err_password_min"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === "login") {
        await login(username, password);
      } else {
        await register(fullName, username, password, undefined, selectedPlan);
      }
      setFullName("");
      setUsername("");
      setPassword("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || t("auth_err_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
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
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                {activeTab === "login" ? t("auth_login_heading") : t("auth_register_heading")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t("auth_instant_subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label={t("auth_close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* İki Sekmeli Seçici: Giriş Yap / Kayıt Ol */}
        <div className="relative z-10 px-6 pt-5">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              data-testid="auth-tab-login"
              onClick={() => setActiveTab("login")}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "login"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("auth_tab_login")}
            </button>
            <button
              type="button"
              data-testid="auth-tab-register"
              onClick={() => setActiveTab("register")}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "register"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("auth_tab_register")}
            </button>
          </div>
        </div>

        {/* Form Alanı */}
        <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-4">
          {/* Kırmızı Uyarı Toast'u */}
          {errorMsg && (
            <div
              data-testid="auth-error-toast"
              className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Kayıt Ol Sekmesinde: Sadece Ad Soyad + Kullanıcı Adı + Şifre */}
          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t("auth_fullname_label")}</span>
              </label>
              <input
                type="text"
                data-testid="auth-input-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("auth_fullname_ph")}
                autoComplete="name"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          )}

          {/* Kullanıcı Adı */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("auth_username_label")}</span>
            </label>
            <input
              type="text"
              data-testid="auth-input-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("auth_username_ph")}
              autoComplete="username"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Şifre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("auth_password_label")}</span>
            </label>
            <input
              type="password"
              data-testid="auth-input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={activeTab === "login" ? "current-password" : "new-password"}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Plan Seçimi (Sadece Kayıt Ol Sekmesinde) */}
          {activeTab === "register" && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t("auth_select_plan")}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {t("auth_plan_changeable")}
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Basic Card */}
                <button
                  type="button"
                  data-testid="plan-select-basic"
                  onClick={() => setSelectedPlan("basic")}
                  className={`relative p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPlan === "basic"
                      ? "bg-slate-800/90 border-slate-400 shadow-md ring-1 ring-slate-400"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-200">🆓 Basic</span>
                      {selectedPlan === "basic" && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{t("auth_plan_free")}</div>
                    <p className="text-[9px] text-slate-400 leading-tight mt-1 line-clamp-2">
                      {t("auth_plan_basic_desc")}
                    </p>
                  </div>
                </button>

                {/* Plus Card */}
                <button
                  type="button"
                  data-testid="plan-select-plus"
                  onClick={() => setSelectedPlan("plus")}
                  className={`relative p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPlan === "plus"
                      ? "bg-indigo-950/60 border-indigo-400 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400"
                      : "bg-slate-950/60 border-slate-800 hover:border-indigo-800/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-300 flex items-center gap-0.5">
                        <Zap className="w-3 h-3 text-indigo-400" /> Plus
                      </span>
                      {selectedPlan === "plus" && <Check className="w-3 h-3 text-indigo-400" />}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-400 mt-0.5">{t("auth_plan_student")}</div>
                    <p className="text-[9px] text-indigo-200/80 leading-tight mt-1 line-clamp-2">
                      {t("auth_plan_plus_desc")}
                    </p>
                  </div>
                </button>

                {/* PRO Card */}
                <button
                  type="button"
                  data-testid="plan-select-pro"
                  onClick={() => setSelectedPlan("pro")}
                  className={`relative p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPlan === "pro"
                      ? "bg-amber-950/60 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400"
                      : "bg-slate-950/60 border-slate-800 hover:border-amber-800/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[8px] font-black text-slate-950 uppercase tracking-wider shadow">
                    PRO
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-0.5">
                        <Crown className="w-3 h-3 text-amber-400" /> PRO
                      </span>
                      {selectedPlan === "pro" && <Check className="w-3 h-3 text-amber-400" />}
                    </div>
                    <div className="text-[10px] font-bold text-amber-400 mt-0.5">{t("auth_plan_instructor")}</div>
                    <p className="text-[9px] text-amber-200/80 leading-tight mt-1 line-clamp-2">
                      {t("auth_plan_pro_desc")}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

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
                  <span>{t("auth_processing")}</span>
                </>
              ) : activeTab === "login" ? (
                <span>{t("auth_submit_login")}</span>
              ) : (
                <span>{t("auth_submit_register")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

