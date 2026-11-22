"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Check,
  Loader2,
  Sparkles,
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
} from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import { useAppTheme } from "../../context/ThemeContext";
import { useLanguage, AVAILABLE_LANGUAGES, Language } from "../../context/LanguageContext";
import { usePersona } from "../../context/PersonaContext";
import AvatarPickerModal from "../profile/AvatarPickerModal";
import { getInitials, isImageAvatarUrl } from "../../utils/avatarHelper";
import { NEURAL_VOICES, setStoredNeuralVoice, getLocalizedNeuralVoice } from "../../utils/ttsVoices";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "profile" | "learning" | "audio_theme";
}

export default function SettingsModal({ isOpen, onClose, initialTab }: SettingsModalProps) {
  const { userProfile, updateProfile } = useProfile();
  const { setAppTheme } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const { selectedCharacter, setSelectedCharacter } = usePersona();

  // Aktif Sekme (1: Profil, 2: Öğrenme, 3: Ses & Görünüm)
  const [activeTab, setActiveTab] = useState<"profile" | "learning" | "audio_theme">("profile");

  // Sekme 1: Profil & Kimlik Form Durumları
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("");
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

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modal her açıldığında mevcut değerleri forma doldur (localStorage + ProfileContext)
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      let storedProfile: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          const scopedKey = userProfile.id ? `vocaship_profile_${userProfile.id}` : null;
          const raw = (scopedKey ? localStorage.getItem(scopedKey) : null) || localStorage.getItem("vocaship_profile");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
              storedProfile = parsed;
            }
          }
        } catch {}
      }

      const resolvedFullName = storedProfile.full_name ?? userProfile.full_name ?? "";
      const resolvedUsername = (storedProfile.username ?? userProfile.username ?? "").replace(/^@+/, "");
      const resolvedEmail = storedProfile.email ?? userProfile.email ?? "";

      setFullName(resolvedFullName);
      setUsername(resolvedUsername);
      setEmail(resolvedEmail);
      setEmailError(null);
      setSelectedAvatar(userProfile.avatar_url || storedProfile.avatar_url || "");
      setSelectedLang(language || "tr");
      setStudyLevel(storedProfile.study_level || userProfile.study_level || "B1");
      setDailyGoal(storedProfile.daily_goal || userProfile.daily_goal || 20);
      const currentStoredVoice =
        (typeof window !== "undefined" ? localStorage.getItem("vocaship_neural_voice") : null) ||
        userProfile.tts_voice ||
        (selectedCharacter === "alex_adult" ? "en-US-GuyNeural" : "en-US-JennyNeural");
      setVoiceTone(currentStoredVoice);
      setPlaybackSpeed(storedProfile.tts_speed || userProfile.tts_speed || "1.0x");
      const currentStoredTheme = (typeof window !== "undefined"
        ? (localStorage.getItem("vocaship_app_theme") || localStorage.getItem("vocaship_reader_theme"))
        : null) as "dark" | "light" | null;
      setThemeMode(currentStoredTheme || storedProfile.theme || userProfile.theme || "dark");
      setSuccessToast(null);
      setShowPasswordChange(false);
      setNewPassword("");
      setConfirmPassword("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTab]);

  // Avatar seçiciden veya başka bir kaynaktan userProfile.avatar_url güncellendiğinde yerel state'i senkronize tut
  useEffect(() => {
    if (isOpen && userProfile.avatar_url) {
      setSelectedAvatar(userProfile.avatar_url);
    }
  }, [isOpen, userProfile.avatar_url]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setActiveTab("profile");
      setEmailError(t("settings_email_invalid", "Lütfen geçerli bir e-posta adresi girin."));
      return;
    }
    setEmailError(null);

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
        email: trimmedEmail || userProfile.email,
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
      setAppTheme(themeMode);

      // 4. Şifre değiştirildiyse bilgilendir
      if (showPasswordChange && newPassword) {
        if (newPassword !== confirmPassword) {
          setPasswordToast(t("settings_pw_mismatch"));
          setIsSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          setPasswordToast(t("settings_pw_short"));
          setIsSaving(false);
          return;
        }
        setPasswordToast(t("settings_pw_updated"));
      }

      setSuccessToast(t("settings_saved_toast"));
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
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          data-theme-preserve="dark"
          className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 my-auto"
          onMouseDown={(e) => e.stopPropagation()}
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
                  {t("settings_title")}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {t("settings_subtitle")}
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

          {/* 3'lü Sekme Çubuğu */}
          <div className="relative z-10 px-6 pt-4 pb-2 border-b border-slate-800/60 bg-slate-950/40">
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800">
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
                <span className="truncate">{t("settings_tab_profile")}</span>
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
                <span className="truncate">{t("settings_tab_learning")}</span>
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
                <span className="truncate">{t("settings_tab_audio_theme")}</span>
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 border-2 border-emerald-300/50 flex items-center justify-center text-xl font-black text-white shadow-inner shrink-0 overflow-hidden">
                    {isImageAvatarUrl(selectedAvatar) ? (
                      <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : selectedAvatar ? (
                      <span className="text-2xl leading-none">{selectedAvatar}</span>
                    ) : (
                      <span>{getInitials(fullName, username)}</span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-xs font-bold text-white">{t("settings_photo_avatar")}</span>
                    <span className="text-[11px] text-slate-400">{t("settings_avatar_sub")}</span>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAvatarPickerOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition cursor-pointer"
                      >
                        <Palette className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t("settings_change_avatar")}</span>
                      </button>
                      {selectedAvatar && (
                        <button
                          type="button"
                          onClick={() => setSelectedAvatar("")}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                        >
                          <span>Monograma Dön</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ad Soyad */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {t("settings_fullname")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("settings_fullname_ph")}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Kullanıcı Adı (RUMUZ) - DEĞİŞTİRİLEBİLDİĞİ TEK YER */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span>{t("settings_username")}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        {t("settings_central_mgmt")}
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {t("settings_non_unique")}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/^@+/, ""))}
                      placeholder={t("settings_username_ph")}
                      className="w-full pl-4 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/50 focus:border-indigo-400 text-xs text-indigo-200 placeholder-slate-500 focus:outline-none transition font-mono font-semibold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    {t("settings_username_hint")}
                  </p>
                </div>

                {/* E-posta Adresi */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      {t("settings_email")}
                    </label>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="ornek@mail.com"
                    className={`w-full pl-4 pr-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono ${
                      emailError
                        ? "border-rose-500 focus:border-rose-400"
                        : "border-slate-800 focus:border-indigo-500"
                    }`}
                  />
                  {emailError && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Şifre Güncelleme Bölümü */}
                <div className="pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange((prev) => !prev)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{showPasswordChange ? t("settings_close_pw") : t("settings_change_pw")}</span>
                  </button>

                  {showPasswordChange && (
                    <div className="mt-3 space-y-2.5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 animate-in fade-in">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("settings_new_pw_ph")}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("settings_confirm_pw_ph")}
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
                    <span>{t("ui_language")}</span>
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
                    <span>{t("settings_default_cefr")}</span>
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
                    {t("settings_cefr_hint")}
                  </p>
                </div>

                {/* 3. Günlük SM-2 Hedefi */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t("settings_daily_goal")}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { goal: 10, label: t("settings_goal_10"), desc: t("settings_goal_10_desc") },
                      { goal: 20, label: t("settings_goal_20"), desc: t("settings_goal_20_desc") },
                      { goal: 30, label: t("settings_goal_30"), desc: t("settings_goal_30_desc") },
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
                      <span>{t("settings_neural_voice")}</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">{t("settings_voices_sub")}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {NEURAL_VOICES.map((v) => {
                      const isSelected = voiceTone === v.id;
                      const locVoice = getLocalizedNeuralVoice(v, language);
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
                              <span className="text-xs font-bold text-slate-200 truncate">{locVoice.name}</span>
                              {locVoice.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                                  {locVoice.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] opacity-75 truncate">{locVoice.role} • {locVoice.accent}</div>
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
                    <span>{t("settings_playback_speed")}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { speed: "0.75x", desc: t("settings_speed_slow") },
                      { speed: "1.0x", desc: t("settings_speed_normal") },
                      { speed: "1.25x", desc: t("settings_speed_fast") },
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
                    <span>{t("settings_theme_label")}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("dark");
                        setAppTheme("dark");
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        themeMode === "dark"
                          ? "bg-violet-600/20 border-violet-500 text-violet-300 ring-2 ring-violet-500/40"
                          : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Moon className="w-4 h-4 text-violet-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">{t("settings_dark_mode")}</div>
                        <div className="text-[10px] opacity-80">{t("settings_dark_desc")}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("light");
                        setAppTheme("light");
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        themeMode === "light"
                          ? "bg-amber-600/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40"
                          : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">{t("settings_light_mode")}</div>
                        <div className="text-[10px] opacity-80">{t("settings_light_desc")}</div>
                      </div>
                    </button>
                  </div>
                </div>
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
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                {t("btn_cancel")}
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving || !username.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("settings_saving")}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t("settings_save_changes")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Seçici Stüdyo Modalı */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelectAvatar={(url) => setSelectedAvatar(url)}
      />
    </>
  );
}

