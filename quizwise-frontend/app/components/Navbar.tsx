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
  Globe
} from "lucide-react";
import GamificationBadge, { UserProfileData } from "./GamificationBadge";
import JoinCodeModal from "./JoinCodeModal";
import LeaderboardModal from "./LeaderboardModal";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "../context/LanguageContext";
import { useExperience } from "../context/ExperienceContext";
import { API_BASE } from "../config";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { mode, toggleMode } = useExperience();

  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/gamification/profile`);
      if (res.ok) {
        const data: UserProfileData = await res.json();
        setUserProfile(data);
      }
    } catch (e) {
      console.error("Kullanıcı profili yüklenemedi:", e);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // XP kazanıldığında Header'daki total_xp sayacını anında canlı artır ve profili yenile
    const handleFloatingXPEvent = (e: Event) => {
      const custom = e as CustomEvent<{ amount: number; label?: string }>;
      if (custom.detail?.amount) {
        setUserProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            total_xp: prev.total_xp + custom.detail.amount,
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

  // YALNIZCA 3 ANA KATEGORİ: Kütüphanem, Okuma Odası, Oyun Arenası
  const navLinks = [
    {
      name: t("nav_decks") || "Kütüphanem",
      href: "/",
      icon: Layers,
      isActive: pathname === "/" || pathname.startsWith("/study"),
      badge: null,
    },
    {
      name: t("nav_reading") || "Okuma Odası",
      href: "/reading",
      icon: BookOpen,
      isActive: pathname.startsWith("/reading"),
      badge: null,
    },
    {
      name: t("nav_games") || "Oyun Arenası",
      href: "/games",
      icon: Gamepad2,
      isActive: pathname.startsWith("/games"),
      badge: null,
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
      <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* SOL: LOGO & İSİM */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/"
                className="flex items-center space-x-2.5 group hover:scale-[1.02] active:scale-95 transition-all duration-150 shrink-0"
              >
                <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
                  <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
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

            {/* ORTA: YALNIZCA 3 ANA BAĞLANTI (FERAH & MİNİMALİST) */}
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold hover:scale-[1.02] active:scale-95 transition-all duration-150 ${
                      item.isActive
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                        : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                    {item.isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* SAĞ: KONTROLLER (KOMPAKT MOD, DİL SEÇİCİ, ÖĞRETMEN İKONU, XP/ALTIN SAYACI) */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Kompakt Mod Rozeti (🎓 / 🎮) */}
              <button
                type="button"
                onClick={toggleMode}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-2xl border transition-all duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0 ${
                  mode === "academic"
                    ? "bg-indigo-600/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/25"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                }`}
                title={
                  mode === "academic"
                    ? "🎓 Akademik Mod Seçili (Tıkla ve Oyun Moduna Geç)"
                    : "🎮 Oyun Modu Seçili (Tıkla ve Akademik Moda Geç)"
                }
                aria-label="Deneyim Modunu Değiştir"
              >
                <span className="text-sm leading-none">{mode === "academic" ? "🎓" : "🎮"}</span>
                <span className="hidden sm:inline font-mono text-xs font-bold">
                  {mode === "academic" ? t("mode_academic", "Akademik") : t("mode_arcade", "Oyun")}
                </span>
              </button>

              {/* Dil Seçici (🇹🇷 TR) */}
              <LanguageSelector align="right" />

              {/* Sınıfım / Öğretmen Paneli Zarif Tek İkon (🎓) */}
              <Link
                href="/classroom"
                className="hidden sm:flex items-center justify-center p-2 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-indigo-500/50 text-slate-400 hover:text-white transition shadow-sm active:scale-95 shrink-0"
                title="🎓 Sınıfım & Öğretmen Paneli"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </Link>

              {/* ⭐ XP & Altın Sayacı & Profil / Gelişim Karnesi Açılır Paneli */}
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
                className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-150 shrink-0"
                aria-label="Menüyü Aç"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBİL MENÜ AÇILIR PANEL */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/98 px-4 pt-3 pb-4 space-y-2">
            {/* Mobil Mod Değiştirme */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <span>{mode === "academic" ? "🎓" : "🎮"}</span>
                <span>{mode === "academic" ? t("mode_academic", "Akademik") : t("mode_arcade", "Oyun & Sınıf")}</span>
              </div>
              <button
                type="button"
                onClick={toggleMode}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  mode === "academic"
                    ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                    : "bg-amber-600/30 text-amber-300 border-amber-500/40"
                }`}
              >
                Değiştir
              </button>
            </div>

            {/* 3 Ana Navigasyon Bağlantısı */}
            <div className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      item.isActive
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                        : "text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* İkincil Araçlar */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <Link
                href="/classroom"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>🎓 Sınıfım & Öğretmen Paneli</span>
              </Link>
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
