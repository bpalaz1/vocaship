"use client";

import React, { useState, useEffect } from "react";
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
  Mic
} from "lucide-react";
import dynamic from "next/dynamic";
import GamificationBadge, { UserProfileData, DEFAULT_GUEST_PROFILE } from "./GamificationBadge";

const JoinCodeModal = dynamic(() => import("./JoinCodeModal"), { ssr: false });
const LeaderboardModal = dynamic(() => import("./LeaderboardModal"), { ssr: false });
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "../context/LanguageContext";
import { API_BASE } from "../config";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/gamification/profile`);
      if (!res.ok) {
        console.warn(`[Navbar] Profil API yanıt vermedi (HTTP ${res.status}). Misafir profili kullanılıyor.`);
        setUserProfile(DEFAULT_GUEST_PROFILE);
        return;
      }

      const data = await res.json();
      if (data && typeof data === "object") {
        setUserProfile({
          ...DEFAULT_GUEST_PROFILE,
          ...data,
          total_xp: typeof data.total_xp === "number" ? data.total_xp : (data.xp ?? 0),
          xp: typeof data.xp === "number" ? data.xp : (data.total_xp ?? 0),
          level: typeof data.level === "number" ? data.level : 1,
          streak_days: typeof data.streak_days === "number" ? data.streak_days : (data.streak ?? 0),
          streak: typeof data.streak === "number" ? data.streak : (data.streak_days ?? 0),
          full_name: data.full_name || data.name || "Guest",
          name: data.name || data.full_name || "Guest",
        });
      } else {
        setUserProfile(DEFAULT_GUEST_PROFILE);
      }
    } catch (e) {
      // Backend kapalıysa (Failed to fetch) veya ağ kesildiyse uygulamanın çökmesini engelle
      console.warn("[Navbar] Kullanıcı profili yüklenirken ağ/bağlantı hatası oluştu, misafir profiline geçiliyor:", e);
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
          const currentXp = base.total_xp ?? base.xp ?? 0;
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
                const Icon = item.icon;
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

            {/* SAĞ: SADE KONTROLLER (SERİ 🔥, DİL SEÇİCİ, PROFİL AÇILIR PANELİ) */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Seri (Streak 🔥) */}
              <div
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-orange-400 font-bold text-xs shrink-0 select-none shadow-sm"
                title={t("daily_streak", "Günlük Seri")}
              >
                <span className="text-sm leading-none">🔥</span>
                <span className="font-mono text-xs font-black">
                  {userProfile?.streak_days ?? userProfile?.streak ?? 0}
                </span>
              </div>

              {/* Dil Seçici (🇹🇷 TR) */}
              <LanguageSelector align="right" />

              {/* ⭐ Profil / Gelişim Karnesi Açılır Paneli */}
              <div className="shrink-0">
                <GamificationBadge
                  profile={userProfile}
                  onRefresh={fetchUserProfile}
                  onOpenJoinModal={() => setIsJoinModalOpen(true)}
                />
              </div>

              {/* Mobil Menü Butonu */}
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
    </>
  );
}
