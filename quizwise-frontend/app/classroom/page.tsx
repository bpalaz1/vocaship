"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Tv,
  KeyRound,
  Archive,
  Calendar,
  X,
  Trash2,
  Search,
  ClipboardList,
  Sparkles,
  Download,
  Users,
  Clock,
  CheckCircle2,
  Send,
  Video,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import ClassCard, { ClassroomItem } from "../components/classroom/ClassCard";
import ClassPinModal, { generateClassPin } from "../components/classroom/ClassPinModal";
import CreateClassModal from "../components/classroom/CreateClassModal";
import PayoutSetupModal from "../components/classroom/PayoutSetupModal";
import SendMaterialModal from "../components/classroom/SendMaterialModal";
import ProUpgradeModal from "../components/classroom/ProUpgradeModal";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { formatLocalSessionTime, downloadSessionIcs, getUserTimeZone } from "../utils/calendarUtils";

export interface TimelineSession {
  session_id: string;
  class_id: string;
  class_name: string;
  session_date_utc?: string;
  duration_minutes?: number;
  status: string;
  role: "teacher" | "attendee";
  price?: number;
  currency?: string;
  teacher_name?: string;
  attendee_names?: string[];
  attendees_count?: number;
  invite_slug?: string;
}

export default function ClassroomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClassroomContent />
    </Suspense>
  );
}

function ClassroomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useProfile();
  const { user } = useAuth();
  const { isDark } = useAppTheme();

  const currentUserId = userProfile?.id || "00000000-0000-0000-0000-000000000001";
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://vocaship-api.onrender.com").replace(/\/+$/, "");

  // PRO Yetki Kontrolü (Yalnızca ücretli PRO üyeler veya admin sınıf oluşturabilir)
  const isUserPro =
    user?.role === "admin" ||
    user?.planTier === "pro" ||
    userProfile?.planTier === "pro" ||
    userProfile?.plan_tier === "pro" ||
    Boolean(user?.isPro) ||
    (Boolean(userProfile?.is_pro) &&
      userProfile?.plan_tier !== "basic" &&
      userProfile?.planTier !== "basic");

  const [showProModal, setShowProModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutRefreshKey, setPayoutRefreshKey] = useState(0);

  const handleOpenCreateClass = () => {
    if (!isUserPro) {
      setShowProModal(true);
    } else {
      setShowCreateClassModal(true);
    }
  };

  // Aktif Sekme: 'classes' | 'calendar'
  const paramTab = searchParams.get("tab");
  const initialTab = paramTab === "calendar" || paramTab === "archive" ? "calendar" : "classes";
  const [activeTab, setActiveTab] = useState<"classes" | "calendar">(initialTab);

  // Sınıf Listesi
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Zaman Tüneli & Oturumlar
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [teachingSessions, setTeachingSessions] = useState<any[]>([]);
  const [attendingSessions, setAttendingSessions] = useState<any[]>([]);
  const [timelineSearch, setTimelineSearch] = useState("");

  // Modallar
  const [pinModalClass, setPinModalClass] = useState<ClassroomItem | null>(null);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [sendMaterialClass, setSendMaterialClass] = useState<ClassroomItem | null>(null);

  // Ödevler Modalı
  const { t } = useLanguage();
  const [assignmentModalClass, setAssignmentModalClass] = useState<ClassroomItem | null>(null);
  const [assignments, setAssignments] = useState<{ id: string; title: string; dueDate: string }[]>([
    { id: "as-1", title: t("cls_default_assign_title", "Haftalık Kelime Analizi"), dueDate: t("cls_default_assign_due", "Cuma 17:00") },
  ]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");

  // Hızlı Öğrenci PIN Girişi
  const [showJoinPinModal, setShowJoinPinModal] = useState(false);
  const [studentPin, setStudentPin] = useState("");

  // Devam Eden Aktif Oturum (Henüz Dersi Bitir yapılmamış sınıf)
  const [activeSession, setActiveSession] = useState<{
    classId: string;
    sessionId?: string;
    className: string;
  } | null>(null);

  useEffect(() => {
    const checkActiveSession = () => {
      try {
        const stored = localStorage.getItem("vocaship_active_class");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.classId) {
            setActiveSession(parsed);
            return;
          }
        }
      } catch {}
      setActiveSession(null);
    };

    checkActiveSession();
    window.addEventListener("storage", checkActiveSession);
    window.addEventListener("vocaship_active_class_change", checkActiveSession);
    return () => {
      window.removeEventListener("storage", checkActiveSession);
      window.removeEventListener("vocaship_active_class_change", checkActiveSession);
    };
  }, []);

  // 1. LocalStorage & Backend Sınıf / Zaman Tüneli Yükleme
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedClasses = localStorage.getItem("vocaship_classes");
        if (savedClasses) {
          const parsed = JSON.parse(savedClasses);
          if (Array.isArray(parsed)) {
            setClassrooms(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Timeline Verisini Çek
  const fetchTimeline = async () => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/classroom/timeline?user_id=${encodeURIComponent(currentUserId)}`);
      if (res.ok) {
        const data = await res.json();
        setTeachingSessions(data.teaching_sessions || []);
        setAttendingSessions(data.attending_sessions || []);
      }
    } catch (e) {
      console.warn("Timeline fetch error:", e);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [currentUserId]);

  // 2. Sınıf Silme
  const handleDeleteClass = (id: string) => {
    const updated = classrooms.filter((c) => c.id !== id);
    setClassrooms(updated);
    try {
      localStorage.setItem("vocaship_classes", JSON.stringify(updated));
    } catch {}
  };

  // 3. Öğrenci PIN ile Katılım
  const handleStudentJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = studentPin.trim().toUpperCase();
    if (!clean) return;
    router.push(`/reading?code=${encodeURIComponent(clean)}`);
  };

  // 4. Yeni Ödev Ekleme
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) return;
    setAssignments((prev) => [
      { id: `as-${Date.now()}`, title: newAssignmentTitle.trim(), dueDate: "Haftaya Pazartesi" },
      ...prev,
    ]);
    setNewAssignmentTitle("");
  };

  // Birleşik Zaman Tüneli Seansları (Upcoming vs Completed)
  const combinedSessions: TimelineSession[] = [
    ...teachingSessions.map((s) => ({ ...s, role: "teacher" as const })),
    ...attendingSessions.map((s) => ({ ...s, role: "attendee" as const })),
  ];

  const filteredCombined = combinedSessions.filter((s) => {
    if (!timelineSearch.trim()) return true;
    const query = timelineSearch.toLowerCase();
    return (
      s.class_name?.toLowerCase().includes(query) ||
      s.teacher_name?.toLowerCase().includes(query) ||
      s.attendee_names?.some((name) => name.toLowerCase().includes(query))
    );
  });

  const upcomingSessions = filteredCombined.filter((s) => s.status !== "completed");
  const completedSessions = filteredCombined.filter((s) => s.status === "completed");

  if (!isLoaded) {
    return (
      <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center ${isDark ? "bg-[#0B0F19] text-white" : "bg-[#dce3ec] text-slate-900"}`}>
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex-1 w-full min-h-[calc(100vh-4rem)] flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${isDark ? "bg-[#0B0F19] text-slate-100" : "bg-[#dce3ec] text-slate-900"}`}>
      {/* ========================================================================= */}
      {/* 1. ÜST BAR: BAŞLIK, SEKMELER VE AKSİYONLAR                                 */}
      {/* ========================================================================= */}
      <header data-theme-preserve="dark" className="border-b border-slate-800 bg-slate-900 text-white shadow-lg px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Sol: Başlık ve Sekmeler */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{t("cls_header_title", "🎓 Sınıflarım & Ders Konsolu")}</span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {t("cls_timezone_lbl", "Saat Dilimi:")} <span className="text-indigo-300 font-mono">{getUserTimeZone()}</span>
                </p>
              </div>
            </div>

            {/* İki Ana Görünüm Sekmesi */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("classes")}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "classes"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>{t("cls_tab_rooms", "🏫 Sınıflarım / Odalar")}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {classrooms.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("calendar");
                  fetchTimeline();
                }}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "calendar"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t("cls_tab_cal", "📅 Takvim & Geçmiş Arşiv")}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {upcomingSessions.length + completedSessions.length}
                </span>
              </button>
            </div>
          </div>

          {/* Sağ: Eylemler */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowJoinPinModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("cls_join_pin", "PIN ile Katıl")}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateClass}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t("cls_new_btn", "+ Yeni Sınıf Oluştur")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. ANA İÇERİK ALANI                                                       */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col justify-start">
        {/* ======================================================================= */}
        {/* TAB 1: SINIFLARIM / ODALAR                                              */}
        {/* ======================================================================= */}
        {activeTab === "classes" && (
          <>
            {classrooms.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-14 text-center max-w-lg mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 my-auto">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600/25 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center text-4xl shadow-2xl text-indigo-400 shadow-indigo-600/20">
                  🎓
                </div>

                <div className="space-y-2.5">
                  <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t("cls_empty_hdr", "🎓 Sınıflarım")}
                  </h2>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("cls_empty_zero_desc", "Henüz aktif bir sınıfınız yok. Yeni sınıf oluşturabilir veya PIN ile bir derse katılabilirsiniz.")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenCreateClass}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-indigo-600/35 hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{t("cls_new_btn", "+ Yeni Sınıf Oluştur")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowJoinPinModal(true)}
                    className={`px-5 py-3.5 rounded-2xl border font-bold text-sm flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer ${
                      isDark
                        ? "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
                        : "bg-white hover:bg-slate-50 border-slate-300 text-slate-800"
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span>{t("cls_join_pin", "PIN ile Katıl")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      <span>{t("cls_reg_hdr", "Kayıtlı Sınıflar & Odalar")}</span>
                      <span className={`text-xs font-normal ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {t("cls_active_cnt", "({count} Aktif Sınıf)", { count: classrooms.length })}
                      </span>
                    </h2>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("cls_reg_sub", "Branşsız evrensel akıllı tahtada ders başlatmak veya materyal göndermek için sınıf kartını kullanın.")}
                    </p>
                  </div>
                </div>

                {/* Sınıf Kartları Izgarası */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {classrooms.map((cls) => {
                    const isCurrentActive = activeSession?.classId === cls.id;
                    return (
                      <ClassCard
                        key={cls.id}
                        classroom={cls}
                        isActiveLesson={isCurrentActive}
                        onOpenPinModal={() => setPinModalClass(cls)}
                        onOpenAssignments={() => setAssignmentModalClass(cls)}
                        onOpenBoard={() => {
                          router.push(`/classroom/${cls.id}`);
                        }}
                        onSendMaterial={() => setSendMaterialClass(cls)}
                        onDeleteClass={() => handleDeleteClass(cls.id)}
                      />
                    );
                  })}

                  {/* Yeni Sınıf Ekleme Kesikli Butonu */}
                  <button
                    type="button"
                    onClick={handleOpenCreateClass}
                    className={`p-6 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 min-h-[160px] cursor-pointer group shadow-sm ${
                      isDark
                        ? "border-slate-800 hover:border-indigo-500 bg-slate-900/40 hover:bg-slate-900/80 text-slate-400 hover:text-white"
                        : "border-indigo-300 hover:border-indigo-500 bg-[#f8fafc] hover:bg-white text-indigo-700 hover:text-indigo-900"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${isDark ? "bg-slate-800 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400" : "bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600"}`}>
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">{t("cls_add_more", "+ Yeni Sınıf Ekle")}</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: BİRLEŞİK TAKVİM & GEÇMİŞ DERS ARŞİVİ                            */}
        {/* ======================================================================= */}
        {activeTab === "calendar" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Üst Bilgi ve Arama Barı */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl border ${isDark ? "bg-slate-900/90 border-slate-800 shadow-lg" : "bg-[#f8fafc] border-slate-300 shadow-sm"}`}>
              <div>
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                  <Calendar className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                  <span>{t("cls_cal_hdr", "Ders Takvimi & Zaman Tüneli")}</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {t("cls_cal_sub_1", "Tüm saatler yerel saat diliminizde (")}<span className={`font-mono ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>{getUserTimeZone()}</span>{t("cls_cal_sub_2", ") otomatik olarak senkronize edilir.")}
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t("cls_cal_search_ph", "Ders, eğitmen veya öğrenci ara...")}
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 ${isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
                />
              </div>
            </div>

            {timelineLoading ? (
              <div className={`p-12 rounded-3xl border flex items-center justify-center gap-3 text-sm ${isDark ? "bg-slate-900/40 border-slate-800 text-slate-400" : "bg-[#f8fafc] border-slate-300 text-slate-600"}`}>
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>{t("cls_cal_syncing", "Ders takvimi senkronize ediliyor...")}</span>
              </div>
            ) : (
              <>
                {/* 1. YAKLAŞAN DERSLER (UPCOMING SESSIONS) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      <span>{t("cls_upcoming_hdr", "🔜 Yaklaşan Dersler")}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${isDark ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-indigo-100 text-indigo-800 border-indigo-200"}`}>
                        {upcomingSessions.length} {t("cls_lessons_unit", "Ders")}
                      </span>
                    </h3>
                  </div>

                  {upcomingSessions.length === 0 ? (
                    <div className={`p-8 rounded-3xl border text-center space-y-2 shadow-sm ${isDark ? "bg-slate-900/40 border-slate-800/80" : "bg-[#f8fafc] border-slate-300"}`}>
                      <Clock className={`w-8 h-8 mx-auto ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                      <p className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-800"}`}>{t("cls_upcoming_empty_t", "Planlanmış Yaklaşan Ders Bulunmuyor")}</p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                        {t("cls_upcoming_empty_d", "Yeni bir sabit tarihli veya slotlu ders açtığınızda takviminizde burada listelenecektir.")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingSessions.map((session) => {
                        const isTeacher = session.role === "teacher";
                        const joinUrl = typeof window !== "undefined"
                          ? `${window.location.origin}/classroom/board?classId=${session.class_id}&sessionId=${session.session_id}&className=${encodeURIComponent(session.class_name)}`
                          : "";

                        return (
                          <div
                            key={session.session_id}
                            className={`p-5 rounded-3xl border space-y-4 transition ${isDark ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl" : "bg-[#f8fafc] border-slate-300 hover:border-indigo-400 shadow-sm"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {isTeacher ? (
                                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${isDark ? "bg-blue-500/15 border-blue-500/30 text-blue-400" : "bg-blue-100 border-blue-300 text-blue-800"}`}>
                                      {t("cls_role_teacher", "👨‍🏫 Eğitmen")}
                                    </span>
                                  ) : (
                                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${isDark ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-emerald-100 border-emerald-300 text-emerald-800"}`}>
                                      {t("cls_role_student", "🎓 Katılımcı")}
                                    </span>
                                  )}
                                  <span className={`text-[11px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    {session.duration_minutes || 60} {t("cls_min_short", "dk")}
                                  </span>
                                </div>
                                <h4 className={`text-base font-bold pt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                                  {session.class_name}
                                </h4>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  downloadSessionIcs(
                                    session.class_name,
                                    session.session_date_utc || new Date().toISOString(),
                                    session.duration_minutes || 60,
                                    joinUrl
                                  )
                                }
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${isDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-indigo-300" : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"}`}
                                title={t("cls_add_cal_tip", "Takvimime Ekle (.ics)")}
                              >
                                <Download className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                <span>{t("cls_ics_btn", ".ics İndir")}</span>
                              </button>
                            </div>

                            <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${isDark ? "bg-slate-950/70 border-slate-800/80" : "bg-slate-100 border-slate-300"}`}>
                              <div className={`flex items-center gap-2 font-medium ${isDark ? "text-indigo-300" : "text-indigo-800"}`}>
                                <Calendar className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                <span>{formatLocalSessionTime(session.session_date_utc)}</span>
                              </div>
                              <div className={`flex items-center gap-2 text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                {isTeacher ? (
                                  <span>
                                    {session.attendees_count || session.attendee_names?.length || 0} {t("cls_reg_participants", "Kayıtlı Katılımcı")}
                                    {session.attendee_names && session.attendee_names.length > 0 && (
                                      <span className="text-slate-500 ml-1">
                                        ({session.attendee_names.slice(0, 3).join(", ")}
                                        {session.attendee_names.length > 3 ? "..." : ""})
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span>{t("cls_teacher_lbl", "Eğitmen:")} {session.teacher_name || t("cls_teacher_default", "Eğitmen")}</span>
                                )}
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-end">
                              {isTeacher ? (
                                <Link
                                  href={`/classroom/board?classId=${session.class_id}&sessionId=${session.session_id}&live=1&className=${encodeURIComponent(session.class_name)}`}
                                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition active:scale-95"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>{t("cls_start_live", "🔴 Canlı Dersi Başlat")}</span>
                                </Link>
                              ) : (
                                <Link
                                  href={`/classroom/board?classId=${session.class_id}&sessionId=${session.session_id}&className=${encodeURIComponent(session.class_name)}`}
                                  className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                                    session.status === "live"
                                      ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/25"
                                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25"
                                  }`}
                                >
                                  <Tv className="w-4 h-4" />
                                  <span>
                                    {session.status === "live"
                                      ? t("cls_live_started_join", "🔴 Canlı Ders Başladı — Derse Gir")
                                      : t("cls_enter_room", "Odaya Gir ➔")}
                                  </span>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* 2. GEÇMİŞ DERSLER ARŞİVİ (COMPLETED SESSIONS) */}
                <section className={`space-y-4 pt-6 border-t ${isDark ? "border-slate-800" : "border-slate-300"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                        <Archive className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                        <span>{t("cls_past_hdr", "🗂️ Geçmiş Dersler Arşivi")}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-800"}`}>
                          {t("cls_past_cnt", "{count} Tamamlanan", { count: completedSessions.length })}
                        </span>
                      </h3>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {t("cls_past_sub", "Tamamlanan dersler ve katılımcı kayıtları")}
                      </p>
                    </div>
                  </div>

                  {completedSessions.length === 0 ? (
                    <div className={`p-8 rounded-3xl border text-center space-y-2 shadow-sm ${isDark ? "bg-slate-900/40 border-slate-800/80" : "bg-[#f8fafc] border-slate-300"}`}>
                      <Archive className={`w-8 h-8 mx-auto ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                      <p className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-800"}`}>{t("cls_past_empty_t", "Henüz Tamamlanmış Bir Ders Bulunmuyor")}</p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                        {t("cls_past_empty_d", "Tahtada dersi tamamladığınızda ders kaydı otomatik olarak buraya arşivlenir.")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedSessions.map((session) => {
                        const isTeacher = session.role === "teacher";
                        return (
                          <div
                            key={session.session_id}
                            className={`p-5 rounded-3xl border space-y-3 ${isDark ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md" : "bg-[#f8fafc] border-slate-300 hover:border-indigo-400 shadow-sm"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-800 border-slate-300"}`}>
                                {formatLocalSessionTime(session.session_date_utc)}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-100 text-emerald-800 border-emerald-300"}`}>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t("cls_status_done", "Tamamlandı")}</span>
                              </span>
                            </div>

                            <div>
                              <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {session.class_name}
                              </h4>
                              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                {isTeacher ? (
                                  <span>
                                    {t("cls_participants_lbl", "Katılımcılar:")}{" "}
                                    <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                                      {session.attendee_names && session.attendee_names.length > 0
                                        ? session.attendee_names.join(", ")
                                        : `${session.attendees_count || 0} ${t("cls_students_unit", "Öğrenci")}`}
                                    </span>
                                  </span>
                                ) : (
                                  <span>
                                    {t("cls_teacher_lbl", "Eğitmen:")} <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-800"}`}>{session.teacher_name || t("cls_teacher_default", "Eğitmen")}</span>
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. MODALLAR: YENİ SINIF, PIN GÖSTER, ÖDEVLER, MATERYAL GÖNDER             */}
      {/* ========================================================================= */}

      {/* PRO Yükseltme Modalı (Feature Gate) */}
      <ProUpgradeModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        reasonMessage={t(
          "cls_pro_create_reason",
          "Kendi sınıfınızı oluşturmak ve canlı ders başlatmak için PRO üyeliğe geçin."
        )}
        onUpgraded={() => {
          setShowProModal(false);
          setShowCreateClassModal(true);
        }}
      />

      {/* A) Yeni Sınıf Aç Modalı */}
      <CreateClassModal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        payoutRefreshKey={payoutRefreshKey}
        onClassCreated={(newClass) => {
          const newCls: ClassroomItem = {
            id: newClass.id,
            name: newClass.name,
            code: newClass.invite_slug || newClass.code || generateClassPin(),
            student_count: 0,
            teacher_id: newClass.teacher_id || currentUserId,
            created_at: newClass.created_at || new Date().toISOString(),
          };
          const updated = [newCls, ...classrooms];
          setClassrooms(updated);
          try {
            localStorage.setItem("vocaship_classes", JSON.stringify(updated));
          } catch {}
          fetchTimeline();
        }}
        onOpenPayoutModal={() => {
          setShowPayoutModal(true);
        }}
      />

      {/* A-2) Yalnızca Ücretli Sınıf Açılışında Tetiklenen Korumalı Hakediş / IBAN Penceresi */}
      <PayoutSetupModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSaved={() => {
          setPayoutRefreshKey((k) => k + 1);
        }}
      />

      {/* B) Katılım Kodu / Davetiye Modalı */}
      <ClassPinModal
        isOpen={Boolean(pinModalClass)}
        onClose={() => setPinModalClass(null)}
        classCode={pinModalClass?.code || null}
        className={pinModalClass?.name}
        onRegeneratePin={(newPin) => {
          if (pinModalClass) {
            const updated = classrooms.map((c) =>
              c.id === pinModalClass.id ? { ...c, code: newPin } : c
            );
            setClassrooms(updated);
            try {
              localStorage.setItem("vocaship_classes", JSON.stringify(updated));
            } catch {}
          }
        }}
      />

      {/* C) Manuel Materyal Gönder Modalı (Faz 4) */}
      {sendMaterialClass && (
        <SendMaterialModal
          isOpen={Boolean(sendMaterialClass)}
          onClose={() => setSendMaterialClass(null)}
          classId={sendMaterialClass.id}
          className={sendMaterialClass.name}
          teacherId={currentUserId}
        />
      )}

      {/* D) Ödevler Modalı */}
      {assignmentModalClass && (
        <div
          onClick={() => setAssignmentModalClass(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {t("cls_assign_hdr", "{name} • Ödevler", { name: assignmentModalClass.name })}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {t("cls_assign_sub", "Öğrenciler için ödev oluştur ve takip et")}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignmentModalClass(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Yeni Ödev Ekle */}
            <form onSubmit={handleAddAssignment} className="flex gap-2">
              <input
                type="text"
                value={newAssignmentTitle}
                onChange={(e) => setNewAssignmentTitle(e.target.value)}
                placeholder={t("cls_assign_ph", "Yeni ödev başlığı...")}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newAssignmentTitle.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs transition cursor-pointer shrink-0"
              >
                {t("cls_assign_btn", "+ Ata")}
              </button>
            </form>

            {/* Ödev Listesi */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {assignments.map((as) => (
                <div
                  key={as.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-200">{as.title}</span>
                  <span className="text-[11px] text-amber-400 font-mono">{as.dueDate}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAssignmentModalClass(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              {t("close", "Kapat")}
            </button>
          </div>
        </div>
      )}

      {/* E) Öğrenci Hızlı PIN Giriş Modalı */}
      {showJoinPinModal && (
        <div
          onClick={() => setShowJoinPinModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl">
              🔑
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t("cls_pin_title", "PIN Kodu ile Derse Katıl")}</h3>
              <p className="text-xs text-slate-400 pt-1">
                {t("cls_pin_desc", "Öğretmeninizin tahtada paylaştığı 6 haneli kodu yazın")}
              </p>
            </div>

            <form onSubmit={handleStudentJoin} className="space-y-3">
              <input
                type="text"
                maxLength={8}
                placeholder={t("cls_pin_ph", "Örn: 7A2-5K9")}
                value={studentPin}
                onChange={(e) => setStudentPin(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-center font-mono font-bold text-lg text-white uppercase placeholder-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                {t("cls_pin_connect", "Derse Bağlan ➔")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
