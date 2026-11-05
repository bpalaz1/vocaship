"use client";

import React, { useState, useEffect } from "react";
import { X, User, Lock, BadgeCheck, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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

  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
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
      setErrorMsg("Lütfen Ad Soyad alanını doldurun.");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("Lütfen kullanıcı adınızı girin.");
      return;
    }
    if (!password || password.length < 3) {
      setErrorMsg("Şifreniz en az 3 karakter olmalıdır.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === "login") {
        await login(username, password);
      } else {
        await register(fullName, username, password);
      }
      setFullName("");
      setUsername("");
      setPassword("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "İşlem başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
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
                {activeTab === "login" ? "Hesabına Giriş Yap" : "Hızlı Hesap Oluştur"}
              </h2>
              <p className="text-[11px] text-slate-400">
                E-posta veya onay kodu gerekmeden anında başla
              </p>
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
              Giriş Yap
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
              Kayıt Ol
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
                <span>Ad Soyad</span>
              </label>
              <input
                type="text"
                data-testid="auth-input-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
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
              <span>Kullanıcı Adı</span>
            </label>
            <input
              type="text"
              data-testid="auth-input-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Örn: ahmetyilmaz"
              autoComplete="username"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Şifre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Şifre</span>
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
                <span>Giriş Yap ➔</span>
              ) : (
                <span>Hesabı Oluştur ve Başla ➔</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

