"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Flame,
  Zap,
  ArrowLeft,
  Users,
  Globe2,
  BookOpen,
  Gamepad2,
  Sparkles,
  School,
  KeyRound,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import { usePersona } from "../context/PersonaContext";
import WeeklyLeagueBracket, {
  LeagueTier,
} from "../components/leaderboard/WeeklyLeagueBracket";
import ClassroomLeaderboard, {
  ClassroomInfo,
} from "../components/leaderboard/ClassroomLeaderboard";
import JoinCodeModal from "../components/games/JoinCodeModal";

const DEFAULT_CLASSES: ClassroomInfo[] = [
  {
    id: "cls-1",
    name: "10-A İngilizce",
    code: "7A2-5K9",
    studentCount: 24,
  },
  {
    id: "cls-2",
    name: "Genel Pratik Grubu",
    code: "3M8-2B1",
    studentCount: 16,
  },
  {
    id: "cls-3",
    name: "9-B Dil Sınıfı",
    code: "9T4-6A0",
    studentCount: 19,
  },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { persona } = usePersona();

  // Ana Sekme Şalteri: "league" (30 Kişilik Lig Kümesi) vs "classroom" (Sınıf İçi Sıralamam)
  const [mainTab, setMainTab] = useState<"league" | "classroom">("league");

  // Aktivite Mikro-Filtreleri: "all" | "reading" | "games"
  const [activityFilter, setActivityFilter] = useState<"all" | "reading" | "games">("all");

  // Sınıf Bilgileri
  const [classes, setClasses] = useState<ClassroomInfo[]>(DEFAULT_CLASSES);
  const [activeClassId, setActiveClassId] = useState<string>("cls-1");
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);

  // Çift Sayaç Puanları (Dual-Ledger)
  const [userScore, setUserScore] = useState({
    totalXp: 2665,
    weeklyXp: 450,
    league: "Altın" as LeagueTier,
    rank: 3,
  });

  // LocalStorage'dan Sınıf ve Profil Verilerini Yükle
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // 1. Sınıfları Yükle
        const savedClasses = localStorage.getItem("vocaship_classes");
        if (savedClasses) {
          const parsed = JSON.parse(savedClasses);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setClasses(
              parsed.map((c: any) => ({
                id: c.id,
                name: c.name,
                code: c.code,
                studentCount: c.student_count || c.studentCount || 20,
              }))
            );
          }
        }

        const savedActiveId = localStorage.getItem("vocaship_active_class_id");
        if (savedActiveId) {
          setActiveClassId(savedActiveId);
        }

        // 2. Çift Sayaç (Dual Ledger) Puanlarını Yükle
        const savedProfile = localStorage.getItem("vocaship_user_profile");
        if (savedProfile) {
          const p = JSON.parse(savedProfile);
          setUserScore((prev) => ({
            ...prev,
            totalXp: p.total_xp || p.xp || prev.totalXp,
            weeklyXp: p.weekly_xp || prev.weeklyXp,
          }));
        }
      }
    } catch (e) {
      console.warn("Liderlik sayfası verileri yüklenirken hata:", e);
    }
  }, []);

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0] || null;

  // Aktif Kullanıcı Kimliği (Persona ile Senkronize)
  const currentUserData = {
    name: user?.fullName || persona?.name || "Ahmet Kaya",
    avatar: persona?.image || "/avatars/sparky.png",
    weeklyXp: userScore.weeklyXp,
    totalXp: userScore.totalXp,
    league: userScore.league,
    rank: userScore.rank,
    level: Math.max(1, Math.floor(userScore.totalXp / 500)),
  };

  // Yeni Sınıfa Katılma İşlemi
  const handleJoinClassSuccess = (code: string) => {
    setIsJoinCodeModalOpen(false);

    // Var olan sınıflarda kod eşleşiyor mu kontrol et
    const matched = classes.find((c) => c.code.toLowerCase() === code.toLowerCase());
    if (matched) {
      setActiveClassId(matched.id);
      localStorage.setItem("vocaship_active_class_id", matched.id);
    } else {
      // Yeni sanal sınıf kaydı oluştur
      const newClass: ClassroomInfo = {
        id: `cls-${Date.now()}`,
        name: `${code} İngilizce Grubu`,
        code: code,
        studentCount: 15,
      };
      const updated = [newClass, ...classes];
      setClasses(updated);
      setActiveClassId(newClass.id);
      localStorage.setItem("vocaship_classes", JSON.stringify(updated));
      localStorage.setItem("vocaship_active_class_id", newClass.id);
    }

    setMainTab("classroom");
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const handleSwitchClass = (classId: string) => {
    setActiveClassId(classId);
    try {
      localStorage.setItem("vocaship_active_class_id", classId);
    } catch {}
  };

  return (
    <div className="bg-[#0B0F19] min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* ÜST BAŞLIK & GERİ DÖNÜŞ VE ÇİFT SAYAÇ ROZETLERİ */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ana Sayfa</span>
              </Link>
              <span className="text-slate-600">•</span>
              <Link
                href="/games"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition font-medium"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Oyun Arenası</span>
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Trophy className="w-7 h-7 text-amber-400 fill-amber-400/20" />
              <span>Liderlik Tablosu & Lig Arenası</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              30 kişilik haftalık lig kümesinde yüksel veya sınıf arkadaşlarınla canlı podyumda yarış.
            </p>
          </div>

          {/* ÇİFT SAYAÇ MİMARİSİ (DUAL-LEDGER HEADER BADGES) */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Kalıcı XP (Asla Sıfırlanmaz) */}
            <div className="px-4 py-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 shadow-lg shadow-indigo-950/40 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Kalıcı Toplam
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-white">
                  ⚡ {currentUserData.totalXp.toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* Haftalık XP (Pazar Gecesi Sıfırlanır) */}
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 shadow-lg shadow-amber-500/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Bu Hafta
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-300">
                  🏆 {currentUserData.weeklyXp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* ANA KONTROL BARI: 2 ANA SEKME + AKTİVİTE MİKRO-FİLTRELERİ               */}
        {/* ======================================================================= */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
          {/* 1. İKİ SEKMELİ ŞALTER (LİG vs SINIF) */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMainTab("league")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mainTab === "league"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>🌍 Haftalık Ligim (30 Kişilik Küme)</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("classroom")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mainTab === "classroom"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 Sınıf İçi Sıralamam</span>
            </button>
          </div>

          {/* 2. AKTİVİTE / BECERİ MİKRO-FİLTRELERİ */}
          <div className="flex items-center gap-1.5 self-center sm:self-auto overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">
              Filtre:
            </span>
            <button
              type="button"
              onClick={() => setActivityFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activityFilter === "all"
                  ? "bg-slate-700 text-white border border-slate-600 shadow"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Tüm Aktiviteler
            </button>

            <button
              type="button"
              onClick={() => setActivityFilter("reading")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activityFilter === "reading"
                  ? "bg-indigo-600 text-white border border-indigo-500 shadow-md shadow-indigo-600/20"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <BookOpen className="w-3 h-3 text-indigo-300" />
              <span>Okuma Odası</span>
            </button>

            <button
              type="button"
              onClick={() => setActivityFilter("games")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activityFilter === "games"
                  ? "bg-amber-500 text-slate-950 border border-amber-400 shadow-md shadow-amber-500/20 font-black"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Gamepad2 className="w-3 h-3 text-amber-400" />
              <span>Oyun Arenası</span>
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* AKTİF İÇERİK: HAFTALIK LİG KÜMESİ VEYA SINIF İÇİ SIRALAMA               */}
        {/* ======================================================================= */}
        {mainTab === "league" ? (
          <WeeklyLeagueBracket
            currentUser={currentUserData}
            activityFilter={activityFilter}
          />
        ) : (
          <ClassroomLeaderboard
            classInfo={activeClass}
            currentUser={currentUserData}
            activityFilter={activityFilter}
            onOpenJoinCode={() => setIsJoinCodeModalOpen(true)}
            onSwitchClass={handleSwitchClass}
            availableClasses={classes}
          />
        )}
      </main>

      {/* Sınıf Katılım Modalı (JoinCodeModal) */}
      <JoinCodeModal
        isOpen={isJoinCodeModalOpen}
        onClose={() => setIsJoinCodeModalOpen(false)}
        onSuccess={handleJoinClassSuccess}
      />
    </div>
  );
}
