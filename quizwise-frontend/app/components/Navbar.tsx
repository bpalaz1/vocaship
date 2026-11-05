"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BrainCircuit,
  BookOpen,
  Gamepad2,
  Layers,
  GraduationCap,
  Trophy,
  ShoppingBag,
  KeyRound,
  Menu,
  X,
  Globe,
  Mic,
  Zap,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";
import { UserProfileData, DEFAULT_GUEST_PROFILE } from "./GamificationBadge";

const JoinCodeModal = dynamic(() => import("./JoinCodeModal"), { ssr: false });
const LeaderboardModal = dynamic(() => import("./LeaderboardModal"), { ssr: false });
const AuthModal = dynamic(() => import("./auth/AuthModal"), { ssr: false });
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout, isAuthModalOpen, setIsAuthModalOpen } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLiveClassActive, setIsLiveClassActive] = useState(true);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown dışına tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
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

  useEffect(() => {
    const syncLiveSession = () => {
      try {
        const saved = localStorage.getItem("vocaship_live_session");
        if (saved) {
          const parsed = JSON.parse(saved);
          setIsLiveClassActive(parsed?.isLive !== false);
        } else {
          setIsLiveClassActive(true);
        }
      } catch {
        setIsLiveClassActive(true);
      }
    };
    syncLiveSession();
    window.addEventListener("vocaship_live_session_updated", syncLiveSession);
    window.addEventListener("storage", syncLiveSession);
    return () => {
      window.removeEventListener("vocaship_live_session_updated", syncLiveSession);
      window.removeEventListener("storage", syncLiveSession);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/gamification/profile`);
      if (!res.ok) {
        console.warn(`[Navbar] Profil API yanıt vermedi (HTTP ${res.status}). Varsayılan profil kullanılıyor.`);
        setUserProfile(DEFAULT_GUEST_PROFILE);
        return;
      }

      const data = await res.json();
      if (data && typeof data === "object") {
        setUserProfile({
          ...DEFAULT_GUEST_PROFILE,
          ...data,
          total_xp: typeof data.total_xp === "number" ? data.total_xp : (data.xp ?? 2665),
          xp: typeof data.xp === "number" ? data.xp : (data.total_xp ?? 2665),
          coins: typeof data.coins === "number" ? data.coins : (data.total_gold ?? 275),
          level: typeof data.level === "number" ? data.level : 3,
          streak_days: typeof data.streak_days === "number" ? data.streak_days : (data.streak ?? 5),
          streak: typeof data.streak === "number" ? data.streak : (data.streak_days ?? 5),
          full_name: data.full_name || data.name || "Burak P.",
          name: data.name || data.full_name || "Burak P.",
        });
      } else {
        setUserProfile(DEFAULT_GUEST_PROFILE);
      }
    } catch (e) {
      console.warn("[Navbar] Kullanıcı profili yüklenirken ağ hatası oluştu, varsayılan değerler kullanılıyor:", e);
      setUserProfile(DEFAULT_GUEST_PROFILE);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // XP kazanıldığında Header'daki total_xp sayacını anında canlı artır ve profili yenile
    const handleFloatingXPEvent = (e: Event) => {
      const custom = e as CustomEvent<{ amount: number; label?: string }>;
      if (custom.detail?.amount) {
        setUserProfile((prev) => {
          const base = prev || DEFAULT_GUEST_PROFILE;
          const currentXp = base.total_xp ?? base.xp ?? 2665;
          return {
            ...base,
            total_xp: currentXp + custom.detail.amount,
            xp: currentXp + custom.detail.amount,
          };
        });
        setTimeout(fetchUserProfile, 1200);
      }
    };

    const handleCoinsEvent = () => {
      fetchUserProfile();
    };

    window.addEventListener("quizwise_floating_xp", handleFloatingXPEvent);
    window.addEventListener("quizwise_profile_update", handleCoinsEvent);
    return () => {
      window.removeEventListener("quizwise_floating_xp", handleFloatingXPEvent);
      window.removeEventListener("quizwise_profile_update", handleCoinsEvent);
    };
  }, []);

  // 5 Temel Menü Bağlantısı
  const navLinks = [
    {
      name: t("nav_decks", "Kütüphanem"),
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
      name: t("nav_speaking", "Speaking Lounge"),
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
      name: t("nav_classroom", "Sınıfım"),
      href: "/classroom",
      icon: GraduationCap,
      emoji: "🎓",
      isActive: pathname.startsWith("/classroom"),
    },
  ];

  const handleJoinSuccess = (shareData: any) => {
    if (shareData.item_type === "deck" && shareData.deck?.id) {
      router.push(`/study/${shareData.deck.id}`);
    } else if (shareData.item_type === "story") {
      router.push("/reading");
    } else {
      router.push("/");
    }
  };

  // Dinamik Kullanıcı Bilgisi
  const displayName = user?.fullName || user?.username || "Burak P.";
  const displayLevel = userProfile?.level ?? 3;
  const displayCoins = userProfile?.coins ?? 275;
  const displayXp = userProfile?.total_xp ?? userProfile?.xp ?? 2665;
  const displayStreak = userProfile?.streak_days ?? userProfile?.streak ?? 5;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-3 sm:gap-4">
            {/* SOL: LOGO & İSİM */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/"
                className="flex items-center space-x-2.5 group hover:scale-[1.02] active:scale-95 transition-all duration-150 shrink-0"
              >
                <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                      Vocaship
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      PRO
                    </span>
                  </div>
                  <span className="hidden xl:inline-block text-[10px] text-slate-400 font-medium leading-none">
                    {t("nav_subtitle")}
                  </span>
                </div>
              </Link>
            </div>

            {/* ORTA: 5 ANA BAĞLANTI (Kütüphanem, Okuma, Speaking, Oyun, Sınıfım) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {navLinks.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:scale-[1.02] active:scale-95 transition-all duration-150 ${
                      item.isActive
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10 font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                    }`}
                  >
                    <span className="text-sm leading-none">{item.emoji}</span>
                    <span>{item.name}</span>
                    {item.isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* SAĞ: SADE KONTROLLER (SERİ 🔥, ALTIN 🪙, XP ⚡, DİL VE KULLANICI PROFİL ROZETİ) */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Parlayan Yeşil Canlı Derse Katıl Menü Bildirim Butonu */}
              {isLiveClassActive && !pathname.startsWith("/classroom/live") && (
                <Link
                  href="/classroom/live?role=student"
                  className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-[11px] shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300/60 animate-pulse transition shrink-0"
                >
                  <span>🔴</span>
                  <span>CANLI DERSE KATIL</span>
                </Link>
              )}

              {/* 1. Seri Alevi (Streak 🔥) */}
              <div
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-orange-400 font-bold text-xs shrink-0 select-none shadow-sm"
                title={t("daily_streak", "Günlük Seri")}
              >
                <span className="text-sm leading-none">🔥</span>
                <span className="font-mono text-xs font-black">
                  {displayStreak}
                </span>
              </div>

              {/* 2. Altın Sayacı (🪙 275) */}
              <div
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-xs font-mono shadow-sm shrink-0 select-none"
                title="Mevcut Altın Bakiyesi"
              >
                <span className="text-xs leading-none">🪙</span>
                <span>{displayCoins}</span>
              </div>

              {/* 3. Şimşek / XP Sayacı (⚡ 2.665) */}
              <div
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-black text-xs font-mono shadow-sm shrink-0 select-none"
                title="Toplam Kazanılan XP"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>{displayXp.toLocaleString()}</span>
              </div>

              {/* 4. Dil Seçici (🇹🇷 TR) */}
              <LanguageSelector align="right" />

              {/* 5. KULLANICI PROFİL ROZETİ (USER PROFILE PILL) & KOMPAKT AÇILIR MENÜ */}
              <div className="relative shrink-0" ref={userDropdownRef}>
                <button
                  type="button"
                  data-testid="navbar-user-profile-pill"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer shadow-sm active:scale-95 select-none"
                  aria-expanded={isUserDropdownOpen}
                >
                  {/* Sol Taraf: Yuvarlak Avatar Çemberi */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-xs shadow-inner shrink-0 relative overflow-hidden">
                    <span className="text-sm">🦊</span>
                  </div>

                  {/* Orta Taraf: Kullanıcı Adı & Seviye Rozeti */}
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-white tracking-tight truncate max-w-[80px] sm:max-w-[110px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400/90">
                      Lv.{displayLevel}
                    </span>
                  </div>

                  {/* Sağ Taraf: Altın Sarısı Zarif PRO Rozeti */}
                  <div className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] sm:text-xs font-semibold flex items-center gap-1 shrink-0">
                    <span>👑 PRO</span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Sağa Yaslı Kompakt Açılır Menü (Dropdown Menu) */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {/* Kullanıcı Özeti Başlığı */}
                    <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-sm shrink-0">
                        🦊
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          Seviye {displayLevel} • PRO Üye
                        </p>
                      </div>
                    </div>

                    {/* 👤 Profilim & Ayarlar */}
                    <Link
                      href="/settings"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>👤 Profilim & Ayarlar</span>
                    </Link>

                    {/* 🎁 Sandık Mağazası */}
                    <Link
                      href="/shop"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>🎁 Sandık Mağazası</span>
                    </Link>

                    {/* 🚪 Çıkış Yap / Giriş Yap */}
                    <div className="pt-1 border-t border-slate-800/80">
                      {user ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left cursor-pointer flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>🚪 Çıkış Yap</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition text-left cursor-pointer flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>🔑 Giriş Yap / Kaydol</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobil Hamburger Butonu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-150 shrink-0 cursor-pointer"
                aria-label="Menüyü Aç"
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

            {/* İkincil Araçlar */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>🏆 Sınıf Liderlik Tablosu</span>
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>🎁 Sandık Mağazası</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsJoinModalOpen(true);
                }}
                className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-slate-900 text-left cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>🔑 Kod ile Katıl</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Modallar */}
      <JoinCodeModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinSuccess={handleJoinSuccess}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
