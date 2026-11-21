"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  BookOpen,
  Gamepad2,
  Layers,
  GraduationCap,
  Trophy,
  Menu,
  X,
  Mic,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Volume2,
  Crown,
} from "lucide-react";
import dynamic from "next/dynamic";
import LanguageSelector from "./LanguageSelector";
import { VocaShipLogo } from "./brand/VocaShipLogo";
import { useTranslation } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

const AuthModal = dynamic(() => import("./auth/AuthModal"), { ssr: false });
const SettingsModal = dynamic(() => import("./auth/SettingsModal"), { ssr: false });
const CheckoutModal = dynamic(() => import("./payments/CheckoutModal"), { ssr: false });
const WelcomeVoyageModal = dynamic(() => import("./auth/WelcomeVoyageModal"), { ssr: false });

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const {
    user,
    isLoading: isAuthLoading,
    logout,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    openAuthModal,
    isWelcomeModalOpen,
    setIsWelcomeModalOpen,
  } = useAuth();
  const {
    userProfile,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settingsInitialTab,
    setSettingsInitialTab,
  } = useProfile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProCheckoutOpen, setIsProCheckoutOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown dışına tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // 5 Temel Menü Bağlantısı
  const navLinks = [
    {
      name: t("nav_library", "Kelime Havuzu"),
      href: "/",
      icon: Layers,
      emoji: "📚",
      isActive: pathname === "/" || pathname.startsWith("/study"),
    },
    {
      name: t("nav_reading", "Okuma Odası"),
      href: "/reading",
      icon: BookOpen,
      emoji: "📖",
      isActive: pathname.startsWith("/reading"),
    },
    {
      name: t("nav_speaking", "Konuşma Salonu"),
      href: "/speaking",
      icon: Mic,
      emoji: "🎙️",
      isActive: pathname.startsWith("/speaking"),
    },
    {
      name: t("nav_games", "Oyun Arenası"),
      href: "/games",
      icon: Gamepad2,
      emoji: "🎮",
      isActive: pathname.startsWith("/games"),
    },
    {
      name: t("nav_classroom", "Sınıflarım"),
      href: "/classroom",
      icon: GraduationCap,
      emoji: "🎓",
      isActive: pathname.startsWith("/classroom"),
    },
  ];

  const currentUsername = userProfile.username || user?.username || "ogrenci";
  const planTier: "basic" | "plus" | "pro" =
    user?.planTier ||
    userProfile.planTier ||
    userProfile.plan_tier ||
    (user?.isPro ? "pro" : "basic");
  const isPro = planTier === "pro";
  const avatarUrl = userProfile.avatar_url || "🦊";

  const rawSubscriptionStatus = (
    userProfile.subscription_status ||
    user?.subscriptionStatus ||
    ""
  )
    .toLowerCase()
    .trim();
  const trialEndsAt = userProfile.trial_ends_at || user?.trialEndsAt || null;
  const computedTrialDaysLeft: number | null = (() => {
    const serverDays =
      typeof userProfile.trial_days_left === "number"
        ? userProfile.trial_days_left
        : typeof user?.trialDaysLeft === "number"
        ? user.trialDaysLeft
        : null;
    if (serverDays !== null) return Math.max(0, serverDays);
    if (rawSubscriptionStatus === "trial" && trialEndsAt) {
      const diffMs = new Date(trialEndsAt).getTime() - Date.now();
      if (!isNaN(diffMs)) {
        return diffMs <= 0 ? 0 : Math.max(1, Math.ceil(diffMs / 86400000));
      }
    }
    return null;
  })();

  const isTrialActive =
    rawSubscriptionStatus === "trial" &&
    (computedTrialDaysLeft === null || computedTrialDaysLeft > 0);
  const isTrialExpired =
    rawSubscriptionStatus === "expired" ||
    (rawSubscriptionStatus === "trial" && computedTrialDaysLeft === 0);
  const showUpgradeCta = isTrialExpired || rawSubscriptionStatus === "canceled";

  // Akıllı tahta sayfasında genel site üst menüsünü (Navbar) gizle; yalnızca tahtanın kendi çubuğu görünsün
  if (pathname?.startsWith("/classroom/board")) {
    return (
      <>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          initialTab={settingsInitialTab}
        />
      </>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full overflow-visible">
          <div className="flex items-center justify-between h-full gap-3 sm:gap-4 overflow-visible">
            {/* SOL: LOGO & İSİM */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/"
                className="flex items-center group hover:scale-[1.02] active:scale-95 transition-all duration-150 shrink-0"
              >
                <VocaShipLogo
                  variant="horizontal"
                  className="[&>div>span:first-child]:text-white"
                />
              </Link>
            </div>

            {/* ORTA: 5 ANA BAĞLANTI (Kütüphanem, Okuma, Speaking, Oyun, Sınıfım) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {navLinks.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:scale-[1.02] active:scale-95 transition-all duration-150 whitespace-nowrap shrink-0 ${
                      item.isActive
                        ? "bg-gradient-to-r from-indigo-500/20 to-emerald-500/15 border border-emerald-500/30 text-white shadow-sm font-bold"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all border border-transparent"
                    }`}
                  >
                    <span className="text-sm leading-none">{item.emoji}</span>
                    <span>{item.name}</span>
                    {item.isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* SAĞ: DENEME ROZETİ, DİL SEÇİCİ & SADE KULLANICI KAPSÜLÜ */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 overflow-visible">
              {/* 30 Günlük PRO Deneme Sayacı, Aktif 👑 PRO Rozeti veya PRO'ya Geç Butonu */}
              {isTrialActive && (
                <button
                  type="button"
                  data-testid="navbar-trial-badge"
                  onClick={() => setIsProCheckoutOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-amber-500/20 hover:from-indigo-500/30 hover:to-amber-500/30 border border-amber-400/40 text-[11px] font-extrabold text-amber-200 shadow-sm transition cursor-pointer whitespace-nowrap"
                >
                  <span>🎁 {computedTrialDaysLeft ?? 30} Gün PRO Deneme</span>
                </button>
              )}

              {!isTrialActive && !showUpgradeCta && (rawSubscriptionStatus === "active" || isPro) && (
                <span
                  data-testid="navbar-pro-badge"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/15 border border-amber-400/50 text-[11px] font-black text-amber-300 shadow-sm whitespace-nowrap select-none"
                >
                  <span>👑 PRO</span>
                </span>
              )}

              {showUpgradeCta && (
                <button
                  type="button"
                  data-testid="navbar-upgrade-pro-btn"
                  onClick={() => setIsProCheckoutOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-[11px] font-black shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>PRO&apos;ya Geç</span>
                </button>
              )}

              {/* Dil Seçici (🇹🇷 TR, EN, DE, ES, FR, IT, RU) */}
              <LanguageSelector align="right" />

              {/* SADE KULLANICI KAPSÜLÜ (USER CAPSULE) */}
              <div className="relative shrink-0 overflow-visible" ref={userDropdownRef}>
                <button
                  type="button"
                  data-testid="navbar-user-capsule"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-1.5 py-1 sm:pr-3 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 hover:border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95 select-none"
                  aria-expanded={isUserDropdownOpen}
                  title={t("nav_account_menu")}
                >
                  {/* Seçili Avatar İkonu (36x36 yuvarlak portre) */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600/40 to-violet-600/30 border border-indigo-400/40 flex items-center justify-center text-base shadow-inner shrink-0 overflow-hidden">
                    {avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:")) ? (
                      <img
                        src={avatarUrl}
                        alt={currentUsername}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{avatarUrl || "🦊"}</span>
                    )}
                  </div>

                  {/* Yanında yalnızca username */}
                  <span className="text-xs font-bold text-slate-100 tracking-tight max-w-[140px] sm:max-w-[180px] truncate">
                    {currentUsername.replace(/^@+/, "")}
                  </span>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                      isUserDropdownOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {/* MİNİMAL DROPDOWN MENÜ */}
                {isUserDropdownOpen && (
                  <div
                    data-theme-preserve="dark"
                    className="absolute right-0 top-full mt-2 w-64 z-[9999] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 overflow-visible"
                  >
                    {/* Kullanıcı Özeti Başlığı */}
                    <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-sm shrink-0 overflow-hidden">
                        {avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:")) ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span>{avatarUrl || "🦊"}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-white truncate">
                            {userProfile.full_name || currentUsername}
                          </p>
                          {planTier === "pro" ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-[9px] leading-none shrink-0">
                              👑 PRO
                            </span>
                          ) : planTier === "plus" ? (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-extrabold text-[9px] leading-none shrink-0">
                              ⚡ PLUS
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-extrabold text-[9px] leading-none shrink-0">
                              BASIC
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate font-mono">
                          {currentUsername.replace(/^@+/, "")}
                        </p>
                      </div>
                    </div>

                    {/* Deneme Sayacı / PRO'ya Geç Aksiyonu (Dropdown İçi) */}
                    {isTrialActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setIsProCheckoutOpen(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-[11px] font-extrabold text-amber-200 transition flex items-center justify-between cursor-pointer"
                      >
                        <span>🎁 {computedTrialDaysLeft ?? 30} Gün PRO Deneme</span>
                        <span className="text-emerald-300 underline">PRO&apos;ya Geç</span>
                      </button>
                    ) : (
                      (showUpgradeCta || !isPro) && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            setIsProCheckoutOpen(true);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>PRO&apos;ya Geç</span>
                        </button>
                      )
                    )}

                    {/* 👤 Profil & Hesap Ayarları */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setSettingsInitialTab("profile");
                        setIsSettingsModalOpen(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center gap-2.5 cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>👤 {t("nav_profile_account")}</span>
                    </button>

                    {/* 📖 Öğrenme & Dil Tercihleri */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setSettingsInitialTab("learning");
                        setIsSettingsModalOpen(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center gap-2.5 cursor-pointer text-left"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>📖 {t("nav_learning_prefs")}</span>
                    </button>

                    {/* 🔊 Ses & Tema Ayarları */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setSettingsInitialTab("audio_theme");
                        setIsSettingsModalOpen(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center gap-2.5 cursor-pointer text-left"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>🔊 {t("nav_audio_theme")}</span>
                    </button>

                    {/* 🚪 Çıkış Yap (Oturum açıksa Log In / Sign Up kesinlikle gizlenir) */}
                    <div className="pt-1 border-t border-slate-800/80">
                      {user ? (
                        <button
                          type="button"
                          data-testid="navbar-logout-btn"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left cursor-pointer flex items-center gap-2.5"
                        >
                          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>🚪 {t("nav_logout", "Çıkış Yap")}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-testid="navbar-login-btn"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            openAuthModal("login");
                          }}
                          className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition text-left cursor-pointer flex items-center gap-2.5"
                        >
                          <User className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>🔑 {t("nav_login_register")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobil Hamburger Menü Butonu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-150 shrink-0 cursor-pointer"
                aria-label={t("nav_open_menu")}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBİL MENÜ AÇILIR PANEL */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/98 px-4 pt-3 pb-4 space-y-2 shadow-2xl">
            <div className="space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    item.isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>⚙️ {t("nav_account_settings")}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Modallar */}
      <WelcomeVoyageModal
        isOpen={!isAuthLoading && !user && isWelcomeModalOpen && !isAuthModalOpen}
        onSkip={() => {
          try {
            sessionStorage.setItem("vocaship_welcome_skipped", "1");
          } catch {}
          setIsWelcomeModalOpen(false);
        }}
        onOpenRegister={() => openAuthModal("register")}
        onOpenLogin={() => openAuthModal("login")}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsInitialTab}
      />

      <CheckoutModal
        isOpen={isProCheckoutOpen}
        onClose={() => setIsProCheckoutOpen(false)}
        mode="pro_plan"
        reasonMessage={
          isTrialExpired
            ? "30 günlük ücretsiz PRO deneme süreniz sona erdi. Sınırsız erişime devam etmek için PRO planınızı seçin."
            : isTrialActive
            ? `Ücretsiz PRO denemenizde ${computedTrialDaysLeft ?? 30} gün kaldı. Dilediğiniz zaman Paddle ile kesintisiz PRO aboneliğe geçebilirsiniz.`
            : undefined
        }
      />
    </>
  );
}
