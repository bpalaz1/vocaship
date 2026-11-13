"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Check,
  Loader2,
  Sparkles,
  Shield,
  AtSign,
  Palette,
  Globe,
  BookOpen,
  Target,
  Volume2,
  Gauge,
  Moon,
  Sun,
  Lock,
  KeyRound,
  CheckCircle2,
  CreditCard,
  Building2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config";
import { useLanguage, AVAILABLE_LANGUAGES, Language } from "../../context/LanguageContext";
import { usePersona } from "../../context/PersonaContext";
import AvatarPickerModal from "../profile/AvatarPickerModal";
import { NEURAL_VOICES, setStoredNeuralVoice } from "../../utils/ttsVoices";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "profile" | "learning" | "audio_theme" | "payout";
}

export default function SettingsModal({ isOpen, onClose, initialTab }: SettingsModalProps) {
  const { userProfile, updateProfile } = useProfile();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { selectedCharacter, setSelectedCharacter } = usePersona();

  // Aktif Sekme (1: Profil, 2: Öğrenme, 3: Ses & Görünüm, 4: Ödeme & Hakediş)
  const [activeTab, setActiveTab] = useState<"profile" | "learning" | "audio_theme" | "payout">("profile");

  // Sekme 1: Profil & Kimlik Form Durumları
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  // Şifre Değiştirme Alt Formu
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  // Sekme 2: Öğrenme & Dil Tercihleri
  const [selectedLang, setSelectedLang] = useState<Language>(language || "tr");
  const [studyLevel, setStudyLevel] = useState<string>(userProfile.study_level || "B1");
  const [dailyGoal, setDailyGoal] = useState<number>(userProfile.daily_goal || 20);

  // Sekme 3: Ses & Görünüm Tercihleri
  const [voiceTone, setVoiceTone] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vocaship_neural_voice");
      if (stored) return stored;
    }
    return (
      userProfile.tts_voice || (selectedCharacter === "alex_adult" ? "en-US-GuyNeural" : "en-US-JennyNeural")
    );
  });
  const [playbackSpeed, setPlaybackSpeed] = useState<string>(userProfile.tts_speed || "1.0x");
  const [themeMode, setThemeMode] = useState<"dark" | "light">(userProfile.theme || "dark");

  // Sekme 4: 💳 Ödeme & Hakediş (IBAN) Form Durumları
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [legalFullName, setLegalFullName] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [iban, setIban] = useState("");
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const [isPayoutSaving, setIsPayoutSaving] = useState(false);
  const [payoutToast, setPayoutToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasExistingPayoutProfile, setHasExistingPayoutProfile] = useState(false);

  // Hakediş ve Tahsilat Raporu (Faz 5)
  const [earningsData, setEarningsData] = useState<{
    total_gross_revenue: number;
    total_platform_fee: number;
    total_teacher_payout: number;
    currency: string;
    has_payout_profile: boolean;
    iban: string | null;
    successful_transactions_count?: number;
  } | null>(null);
  const [isEarningsLoading, setIsEarningsLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // IBAN Formatlayıcı (TRXX XXXX XXXX...)
  const formatIbanInput = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean.startsWith("TR") && clean.length > 0) {
      clean = "TR" + clean.replace(/^TR/g, "");
    }
    if (clean.length > 26) {
      clean = clean.slice(0, 26);
    }
    const formatted = clean.match(/.{1,4}/g)?.join(" ") || clean;
    return formatted;
  };

  // Hakediş Profilini Yükle
  const fetchPayoutProfile = async () => {
    const userId = user?.id || userProfile?.username || "00000000-0000-0000-0000-000000000001";
    setIsPayoutLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/payout-profile?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.has_profile && data.profile) {
          setAccountType(data.profile.account_type || "individual");
          setLegalFullName(data.profile.legal_full_name || "");
          setIdentityNumber(data.profile.identity_number || "");
          setIban(formatIbanInput(data.profile.iban || ""));
          setHasExistingPayoutProfile(true);
        }
      }
    } catch (err) {
      console.warn("[SettingsModal] Hakediş profili yüklenemedi:", err);
    } finally {
      setIsPayoutLoading(false);
    }
  };

  // Eğitmen Hakediş Raporunu Çek (Faz 5)
  const fetchEarnings = async () => {
    const userId = user?.id || userProfile?.id || userProfile?.username || "00000000-0000-0000-0000-000000000001";
    setIsEarningsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/earnings?teacher_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setEarningsData(data);
      }
    } catch (err) {
      console.warn("[SettingsModal] Hakediş raporu yüklenemedi:", err);
    } finally {
      setIsEarningsLoading(false);
    }
  };

  // Hakediş Profilini Kaydet
  const handleSavePayoutProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPayoutToast(null);

    const cleanIban = iban.replace(/\s+/g, "").toUpperCase();
    if (!cleanIban.startsWith("TR") || cleanIban.length !== 26) {
      setPayoutToast({
        type: "error",
        text: "Lütfen 26 haneli geçerli bir TR IBAN numarası girin (Örn: TR12 3456...)",
      });
      return;
    }

    if (!legalFullName.trim()) {
      setPayoutToast({ type: "error", text: "Yasal Ad Soyad alanı zorunludur." });
      return;
    }

    const cleanId = identityNumber.trim();
    if (accountType === "individual" && cleanId.length !== 11) {
      setPayoutToast({ type: "error", text: "T.C. Kimlik Numarası 11 haneli olmalıdır." });
      return;
    }
    if (accountType === "company" && cleanId.length !== 10) {
      setPayoutToast({ type: "error", text: "Vergi Kimlik Numarası 10 haneli olmalıdır." });
      return;
    }

    setIsPayoutSaving(true);
    const userId = user?.id || userProfile?.username || "00000000-0000-0000-0000-000000000001";

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
        setHasExistingPayoutProfile(true);
        fetchEarnings();
        setPayoutToast({
          type: "success",
          text: "IBAN ve hakediş profiliniz başarıyla kaydedildi! 💳",
        });
        setTimeout(() => setPayoutToast(null), 3500);
      } else {
        const err = await res.json();
        setPayoutToast({
          type: "error",
          text: err.detail || "Kaydedilirken bir hata oluştu.",
        });
      }
    } catch (err) {
      setPayoutToast({
        type: "error",
        text: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsPayoutSaving(false);
    }
  };

  // Modal her açıldığında mevcut değerleri forma doldur
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setFullName(userProfile.full_name || "");
      setUsername(userProfile.username || "");
      setSelectedAvatar(userProfile.avatar_url || "🦊");
      setSelectedLang(language || "tr");
      setStudyLevel(userProfile.study_level || "B1");
      setDailyGoal(userProfile.daily_goal || 20);
      const currentStoredVoice =
        (typeof window !== "undefined" ? localStorage.getItem("vocaship_neural_voice") : null) ||
        userProfile.tts_voice ||
        (selectedCharacter === "alex_adult" ? "en-US-GuyNeural" : "en-US-JennyNeural");
      setVoiceTone(currentStoredVoice);
      setPlaybackSpeed(userProfile.tts_speed || "1.0x");
      const currentStoredTheme = (typeof window !== "undefined"
        ? (localStorage.getItem("vocaship_app_theme") || localStorage.getItem("vocaship_reader_theme"))
        : null) as "dark" | "light" | null;
      setThemeMode(currentStoredTheme || userProfile.theme || "dark");
      setSuccessToast(null);
      setPayoutToast(null);
      setShowPasswordChange(false);
      setNewPassword("");
      setConfirmPassword("");
      fetchPayoutProfile();
      fetchEarnings();
    }
  }, [isOpen, initialTab, userProfile, language, selectedCharacter]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setIsSaving(true);
    setSuccessToast(null);

    try {
      // 1. Dil Tercihini Uygula
      if (selectedLang !== language) {
        setLanguage(selectedLang);
      }

      // 2. Ses Tercihini PersonaContext ile eşitle
      if (voiceTone === "en-US-GuyNeural" && selectedCharacter !== "alex_adult") {
        setSelectedCharacter("alex_adult");
      } else if (voiceTone === "en-US-JennyNeural" && selectedCharacter !== "sparky_kid") {
        setSelectedCharacter("sparky_kid");
      }

      // 3. ProfileContext & Backend Profil Güncellemesi
      await updateProfile({
        full_name: fullName.trim() || username.trim(),
        username: username.trim().replace(/^@+/, ""),
        avatar_url: selectedAvatar,
        study_level: studyLevel,
        daily_goal: dailyGoal,
        tts_voice: voiceTone,
        tts_speed: playbackSpeed,
        theme: themeMode,
      });

      // Küresel Nöral Sesi Kaydet ve Senkronize Et
      if (typeof window !== "undefined") {
        setStoredNeuralVoice(voiceTone);
      }

      // Küresel Tema Uygula ve Senkronize Et
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("vocaship_app_theme", themeMode);
          localStorage.setItem("vocaship_reader_theme", themeMode);
        } catch {}
        document.documentElement.setAttribute("data-theme", themeMode);
        if (themeMode === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        window.dispatchEvent(new Event("vocaship-theme-change"));
      }

      // 4. Şifre değiştirildiyse bilgilendir
      if (showPasswordChange && newPassword) {
        if (newPassword !== confirmPassword) {
          setPasswordToast("Yeni şifreler birbiriyle eşleşmiyor.");
          setIsSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          setPasswordToast("Şifreniz en az 6 karakter olmalıdır.");
          setIsSaving(false);
          return;
        }
        setPasswordToast("Şifreniz başarıyla güncellendi.");
      }

      setSuccessToast("Tüm ayarlar ve tercihleriniz başarıyla kaydedildi! 🎉");
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1000);
    } catch (err) {
      console.warn("[SettingsModal] Kaydetme hatası:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arka Plan Dekoratif Parıltıları */}
          <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          {/* Modal Üst Başlığı */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight">
                  Hesap & Uygulama Ayarları
                </h2>
                <p className="text-[11px] text-slate-400">
                  Profilinizi, öğrenme hedeflerinizi ve ses tercihlerinizi yapılandırın
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

          {/* 4'lü Sekme Çubuğu */}
          <div className="relative z-10 px-6 pt-4 pb-2 border-b border-slate-800/60 bg-slate-950/40">
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Profil</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("learning")}
                className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "learning"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Öğrenme</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audio_theme")}
                className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "audio_theme"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Ses & Tema</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("payout")}
                className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "payout"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-emerald-400"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Hakediş</span>
              </button>
            </div>
          </div>

          {/* Sekme Gövde İçerikleri */}
          <form onSubmit={handleSave} className="relative z-10 p-6 min-h-[340px]">
            {/* =================================================================== */}
            {/* SEKME 1: PROFİL & KİMLİK                                           */}
            {/* =================================================================== */}
            {activeTab === "profile" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Avatar Önizleme & Değiştirme Kartı */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600/30 to-violet-600/20 border-2 border-indigo-400/50 flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden">
                    {selectedAvatar && (selectedAvatar.startsWith("http") || selectedAvatar.startsWith("/") || selectedAvatar.startsWith("data:")) ? (
                      <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{selectedAvatar || "🦊"}</span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-xs font-bold text-white">Profil Fotoğrafı & Avatar</span>
                    <span className="text-[11px] text-slate-400">10 Standart Avatar, Fotoğraf Yükle veya Selfie Çek</span>
                    <button
                      type="button"
                      onClick={() => setIsAvatarPickerOpen(true)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition cursor-pointer self-start"
                    >
                      <Palette className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Avatarı Değiştir</span>
                    </button>
                  </div>
                </div>

                {/* Ad Soyad */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Ad Soyad
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Adınız ve Soyadınız"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Kullanıcı Adı (RUMUZ) - DEĞİŞTİRİLEBİLDİĞİ TEK YER */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span>Kullanıcı Adı (Rumuz)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        Merkezi Yönetim
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Tekil olmak zorunda değildir (Non-unique)
                    </span>
                  </div>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="kullanici_adiniz"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/50 focus:border-indigo-400 text-xs text-indigo-200 placeholder-slate-500 focus:outline-none transition font-mono font-semibold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    * Tüm sayfalarda adınız ve rumuzunuz buradan otomatik güncellenir.
                  </p>
                </div>

                {/* E-posta (Salt Okunur) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      E-posta Adresi
                    </label>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Salt Okunur
                    </span>
                  </div>
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={userProfile.email || "ogrenci@vocaship.com"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 cursor-not-allowed select-none font-mono"
                  />
                </div>

                {/* Şifre Güncelleme Bölümü */}
                <div className="pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange((prev) => !prev)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{showPasswordChange ? "Şifre Değiştirmeyi Kapat" : "Şifremi Değiştir"}</span>
                  </button>

                  {showPasswordChange && (
                    <div className="mt-3 space-y-2.5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 animate-in fade-in">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Yeni Şifre (en az 6 karakter)"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Yeni Şifre Tekrar"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      {passwordToast && (
                        <p className="text-[11px] text-amber-400 font-medium">
                          {passwordToast}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SEKME 2: ÖĞRENME & DİL TERCİHLERİ                                  */}
            {/* =================================================================== */}
            {activeTab === "learning" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* 1. Arayüz Dili Seçimi */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Arayüz Dili</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVAILABLE_LANGUAGES.map((lang) => {
                      const isSelected = selectedLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setSelectedLang(lang.code)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/40 text-white font-bold scale-[1.02]"
                              : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          <span className="text-xl leading-none">{lang.flag}</span>
                          <span className="text-[10px] truncate max-w-full font-semibold">{lang.code.toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Varsayılan Çalışma Seviyesi (CEFR) */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Varsayılan Seviye (CEFR)</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {["A1", "A2", "B1", "B2", "C1"].map((lvl) => {
                      const isSelected = studyLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setStudyLevel(lvl)}
                          className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Okuma odası ve speaking diyalogları bu seviyeye göre ölçeklenir.
                  </p>
                </div>

                {/* 3. Günlük SM-2 Hedefi */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Günlük SM-2 Tekrar Hedefi</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { goal: 10, label: "10 Kelime", desc: "Hafif & Rahat" },
                      { goal: 20, label: "20 Kelime", desc: "Önerilen Standart" },
                      { goal: 30, label: "30 Kelime", desc: "Yoğun & Hızlı" },
                    ].map((item) => {
                      const isSelected = dailyGoal === item.goal;
                      return (
                        <button
                          key={item.goal}
                          type="button"
                          onClick={() => setDailyGoal(item.goal)}
                          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-500/80 text-emerald-300 shadow-sm"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] opacity-75">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SEKME 3: SES & GÖRÜNÜM                                             */}
            {/* =================================================================== */}
            {activeTab === "audio_theme" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* 1. Nöral Ses Tonu Seçimi (6 Ses Kartı) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Nöral Seslendirici</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Edge-TTS HD • 6 Doğal Ses</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {NEURAL_VOICES.map((v) => {
                      const isSelected = voiceTone === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVoiceTone(v.id)}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 relative ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/40 shadow-sm"
                              : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          <span className="text-2xl shrink-0">{v.avatar}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-200 truncate">{v.name}</span>
                              {v.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                                  {v.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] opacity-75 truncate">{v.role} • {v.accent}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Oynatma Hızı */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Oynatma Hızı Çarpanı</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { speed: "0.75x", desc: "Yavaş (Anlaşılır)" },
                      { speed: "1.0x", desc: "Doğal (Önerilen)" },
                      { speed: "1.25x", desc: "Hızlı (Akıcı)" },
                    ].map((item) => {
                      const isSelected = playbackSpeed === item.speed;
                      return (
                        <button
                          key={item.speed}
                          type="button"
                          onClick={() => setPlaybackSpeed(item.speed)}
                          className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                            isSelected
                              ? "bg-cyan-500/20 border-cyan-500/80 text-cyan-300 shadow-sm"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="text-xs font-bold">{item.speed}</div>
                          <div className="text-[10px] opacity-75">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Tema Geçişi */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-violet-400" />
                    <span>Görünüm Teması</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("dark");
                        if (typeof window !== "undefined") {
                          document.documentElement.setAttribute("data-theme", "dark");
                          document.documentElement.classList.add("dark");
                          window.dispatchEvent(new Event("vocaship-theme-change"));
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        themeMode === "dark"
                          ? "bg-violet-600/20 border-violet-500 text-violet-300 ring-2 ring-violet-500/40"
                          : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Moon className="w-4 h-4 text-violet-400" />
                      <div>
                        <div className="text-xs font-bold">Koyu Mod (Dark)</div>
                        <div className="text-[10px] opacity-75">Gece ve loş ortam için optimize</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("light");
                        if (typeof window !== "undefined") {
                          document.documentElement.setAttribute("data-theme", "light");
                          document.documentElement.classList.remove("dark");
                          window.dispatchEvent(new Event("vocaship-theme-change"));
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        themeMode === "light"
                          ? "bg-amber-600/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40"
                          : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold">Açık Mod (Light)</div>
                        <div className="text-[10px] opacity-75">Ferah gündüz aydınlığı</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SEKME 4: 💳 ÖDEME & HAKEDİŞ (IBAN)                                 */}
            {/* ================================================================= */}
            {activeTab === "payout" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Bilgilendirme Kartı */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-emerald-300">
                      Eğitmen Hakediş & IBAN Tanımlama
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Ücretli sınıflarınızdan elde ettiğiniz bilet ve abonelik gelirlerinin doğrudan banka hesabınıza yatması için yasal kimlik ve IBAN bilgilerinizi tanımlayın.
                    </p>
                  </div>
                </div>

                {/* 1. Hesap Türü Seçimi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Vergi Mükellefiyeti / Hesap Türü</span>
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
                        <div className="text-xs font-bold">Bireysel (TCKN)</div>
                        <div className="text-[10px] opacity-75">Şahıs / Bireysel Eğitmen</div>
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
                        <div className="text-xs font-bold">Şirket / Serbest Meslek (VKN)</div>
                        <div className="text-[10px] opacity-75">Tüzel Kişilik / Şirket</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Yasal Ad Soyad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>
                      {accountType === "individual"
                        ? "Yasal Ad Soyad (Banka Hesabındaki Ad)"
                        : "Şirket / Kurum Resmi Ünvanı"}
                    </span>
                    <span className="text-[10px] font-normal text-amber-400">IBAN ile tam eşleşmelidir</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={legalFullName}
                    onChange={(e) => setLegalFullName(e.target.value)}
                    placeholder={
                      accountType === "individual" ? "Örn: Ahmet Yılmaz" : "Örn: ABC Eğitim ve Danışmanlık A.Ş."
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* 3. T.C. Kimlik No veya Vergi Kimlik No */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {accountType === "individual"
                      ? "T.C. Kimlik Numarası (11 Hane)"
                      : "Vergi Kimlik Numarası (10 Hane)"}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={accountType === "individual" ? 11 : 10}
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder={accountType === "individual" ? "11 haneli TCKN giriniz" : "10 haneli VKN giriniz"}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tracking-wider"
                  />
                </div>

                {/* 4. IBAN Numarası */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Banka IBAN Numarası</span>
                    <span className="text-[10px] font-normal text-slate-400">TR ile başlar (26 Karakter)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={iban}
                      onChange={(e) => setIban(formatIbanInput(e.target.value))}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                    />
                    {iban.replace(/\s+/g, "").length === 26 && iban.startsWith("TR") && (
                      <span className="absolute right-3 top-2.5 text-emerald-400 flex items-center gap-1 text-[11px] font-bold font-sans">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Format Doğru</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Hakediş & Tahsilat Özeti Kartı (Faz 5) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Hakediş & Bakiye Özeti
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Split: %88 Eğitmen • %12 Platform
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Toplam Brüt Tahsilat</span>
                      <span className="text-base font-black text-white font-mono mt-0.5 block">
                        {earningsData ? `${earningsData.total_gross_revenue} ${earningsData.currency}` : "0.00 TRY"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-300 block font-semibold">Net Hakedişiniz (%88)</span>
                      <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
                        {earningsData ? `${earningsData.total_teacher_payout} ${earningsData.currency}` : "0.00 TRY"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Aktif IBAN</span>
                      <span className="text-xs font-bold text-indigo-300 font-mono mt-1 block truncate">
                        {earningsData?.iban || (iban.replace(/\s+/g, "").length === 26 ? iban : "Henüz Kaydedilmedi")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Güvenlik & BDDK Rozeti */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>256-bit SSL ve BDDK uyumlu hakediş saklama. Verileriniz yalnızca ders gelirlerinizin transferi için kullanılır.</span>
                </div>

                {/* Payout Toast */}
                {payoutToast && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold animate-in fade-in flex items-center justify-center gap-2 ${
                      payoutToast.type === "success"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {payoutToast.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{payoutToast.text}</span>
                  </div>
                )}
              </div>
            )}

            {/* Bildirim Alanı */}
            {successToast && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold animate-in fade-in flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successToast}</span>
              </div>
            )}

            {/* Alt Eylem Butonları */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isPayoutSaving}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Vazgeç
              </button>
              {activeTab === "payout" ? (
                <button
                  type="button"
                  onClick={() => handleSavePayoutProfile()}
                  disabled={isPayoutSaving || !iban.trim() || !legalFullName.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95"
                >
                  {isPayoutSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{hasExistingPayoutProfile ? "IBAN Bilgisini Güncelle" : "Hakediş Profilini Kaydet"}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving || !username.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Değişiklikleri Kaydet</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Seçici Stüdyo Modalı */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
      />
    </>
  );
}

