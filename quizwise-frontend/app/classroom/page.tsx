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
import SendMaterialModal from "../components/classroom/SendMaterialModal";
import ProUpgradeModal from "../components/classroom/ProUpgradeModal";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
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
  const { userProfile, setIsSettingsModalOpen, setSettingsInitialTab } = useProfile();
  const { user } = useAuth();

  const currentUserId = userProfile?.id || "00000000-0000-0000-0000-000000000001";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // PRO Yetki Kontrolü
  const isUserPro =
    user?.planTier === "pro" ||
    userProfile?.planTier === "pro" ||
    userProfile?.plan_tier === "pro" ||
    Boolean(user?.isPro) ||
    Boolean(userProfile?.is_pro);

  const [showProModal, setShowProModal] = useState(false);

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
  const [assignmentModalClass, setAssignmentModalClass] = useState<ClassroomItem | null>(null);
  const [assignments, setAssignments] = useState<{ id: string; title: string; dueDate: string }[]>([
    { id: "as-1", title: "Haftalık Kelime Analizi", dueDate: "Cuma 17:00" },
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-white">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. ÜST BAR: BAŞLIK, SEKMELER VE AKSİYONLAR                                 */}
      {/* ========================================================================= */}
      <header className="border-b border-slate-800 bg-slate-900 text-white shadow-lg px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Sol: Başlık ve Sekmeler */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>🎓 Sınıflarım & Ders Konsolu</span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Saat Dilimi: <span className="text-indigo-300 font-mono">{getUserTimeZone()}</span>
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
                <span>🏫 Sınıflarım / Odalar</span>
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
                <span>📅 Takvim & Geçmiş Arşiv</span>
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
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>PIN ile Katıl</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateClass}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Sınıf Oluştur</span>
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
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    🎓 Sınıflarım
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Henüz aktif bir sınıfınız bulunmuyor. Derslerinizi yönetmek, materyal paylaşmak ve akıllı tahtayı kullanmak için ilk sınıfınızı oluşturun.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateClass}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-indigo-600/35 hover:scale-105 active:scale-95 transition cursor-pointer ring-4 ring-indigo-500/20 animate-pulse"
                >
                  <Plus className="w-5 h-5" />
                  <span>+ Yeni Sınıf Oluştur</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Kayıtlı Sınıflar & Odalar</span>
                      <span className="text-xs font-normal text-slate-600 dark:text-slate-400">
                        ({classrooms.length} Aktif Sınıf)
                      </span>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Branşsız evrensel akıllı tahtada ders başlatmak veya materyal göndermek için sınıf kartını kullanın.
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
                          const targetUrl =
                            isCurrentActive && activeSession?.sessionId
                              ? `/classroom/board?classId=${cls.id}&sessionId=${activeSession.sessionId}&className=${encodeURIComponent(
                                  cls.name
                                )}`
                              : `/classroom/board?classId=${cls.id}&className=${encodeURIComponent(cls.name)}`;
                          router.push(targetUrl);
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
                    className="p-6 rounded-3xl border-2 border-dashed border-indigo-300 dark:border-slate-800 hover:border-indigo-500 bg-white/70 hover:bg-white dark:bg-slate-900/40 dark:hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center gap-2 min-h-[160px] text-indigo-700 dark:text-slate-400 hover:text-indigo-900 dark:hover:text-white cursor-pointer group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 group-hover:bg-indigo-600/20 text-indigo-600 dark:text-slate-400 group-hover:text-indigo-400 flex items-center justify-center transition">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">+ Yeni Sınıf Ekle</span>
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>Ders Takvimi & Zaman Tüneli</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tüm saatler yerel saat diliminizde (<span className="text-indigo-400 font-mono">{getUserTimeZone()}</span>) otomatik olarak senkronize edilir.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ders, eğitmen veya öğrenci ara..."
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {timelineLoading ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 flex items-center justify-center gap-3 text-sm text-slate-400">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Ders takvimi senkronize ediliyor...</span>
              </div>
            ) : (
              <>
                {/* 1. YAKLAŞAN DERSLER (UPCOMING SESSIONS) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>🔜 Yaklaşan Dersler</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {upcomingSessions.length} Ders
                      </span>
                    </h3>
                  </div>

                  {upcomingSessions.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                      <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">Planlanmış Yaklaşan Ders Bulunmuyor</p>
                      <p className="text-xs text-slate-500">
                        Yeni bir sabit tarihli veya slotlu ders açtığınızda takviminizde burada listelenecektir.
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
                            className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-slate-700 shadow-sm dark:shadow-xl space-y-4 transition"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {isTeacher ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-500 dark:text-blue-400 text-[10px] font-bold">
                                      👨‍🏫 Eğitmen
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                      🎓 Katılımcı
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                    {session.duration_minutes || 60} dk
                                  </span>
                                </div>
                                <h4 className="text-base font-bold text-slate-800 dark:text-white pt-1">
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
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold transition cursor-pointer"
                                title="Takvimime Ekle (.ics)"
                              >
                                <Download className="w-3.5 h-3.5 text-indigo-400" />
                                <span>.ics İndir</span>
                              </button>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5">
                              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span>{formatLocalSessionTime(session.session_date_utc)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                {isTeacher ? (
                                  <span>
                                    {session.attendees_count || session.attendee_names?.length || 0} Kayıtlı Katılımcı
                                    {session.attendee_names && session.attendee_names.length > 0 && (
                                      <span className="text-slate-500 ml-1">
                                        ({session.attendee_names.slice(0, 3).join(", ")}
                                        {session.attendee_names.length > 3 ? "..." : ""})
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span>Eğitmen: {session.teacher_name || "Eğitmen"}</span>
                                )}
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-end">
                              {isTeacher ? (
                                <Link
                                  href={`/classroom/board?classId=${session.class_id}&sessionId=${session.session_id}&className=${encodeURIComponent(session.class_name)}`}
                                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition active:scale-95"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>🔴 Canlı Dersi Başlat</span>
                                </Link>
                              ) : (
                                <Link
                                  href={`/classroom/board?classId=${session.class_id}&sessionId=${session.session_id}&className=${encodeURIComponent(session.class_name)}`}
                                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition active:scale-95"
                                >
                                  <Tv className="w-4 h-4" />
                                  <span>Odaya Gir ➔</span>
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
                <section className="space-y-4 pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Archive className="w-4 h-4 text-indigo-400" />
                        <span>🗂️ Geçmiş Dersler Arşivi</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {completedSessions.length} Tamamlanan
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Tamamlanan dersler ve katılımcı kayıtları
                      </p>
                    </div>
                  </div>

                  {completedSessions.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                      <Archive className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">Henüz Tamamlanmış Bir Ders Bulunmuyor</p>
                      <p className="text-xs text-slate-500">
                        Tahtada dersi tamamladığınızda ders kaydı otomatik olarak buraya arşivlenir.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedSessions.map((session) => {
                        const isTeacher = session.role === "teacher";
                        return (
                          <div
                            key={session.session_id}
                            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-md space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                {formatLocalSessionTime(session.session_date_utc)}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Tamamlandı</span>
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white">
                                {session.class_name}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1">
                                {isTeacher ? (
                                  <span>
                                    Katılımcılar:{" "}
                                    <span className="text-slate-300 font-medium">
                                      {session.attendee_names && session.attendee_names.length > 0
                                        ? session.attendee_names.join(", ")
                                        : `${session.attendees_count || 0} Öğrenci`}
                                    </span>
                                  </span>
                                ) : (
                                  <span>
                                    Eğitmen: <span className="text-slate-300 font-medium">{session.teacher_name || "Eğitmen"}</span>
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
        reasonMessage="Sınıf oluşturmak, öğrenci bağlamak ve akıllı tahta seansları açmak için PRO üyelik gereklidir."
        onUpgraded={() => {
          setShowProModal(false);
          setShowCreateClassModal(true);
        }}
      />

      {/* A) Yeni Sınıf Aç Modalı */}
      <CreateClassModal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        onClassCreated={(newClass) => {
          const newCls: ClassroomItem = {
            id: newClass.id,
            name: newClass.name,
            code: newClass.invite_slug || newClass.code || generateClassPin(),
            student_count: 0,
            created_at: newClass.created_at || new Date().toISOString(),
          };
          const updated = [newCls, ...classrooms];
          setClassrooms(updated);
          try {
            localStorage.setItem("vocaship_classes", JSON.stringify(updated));
          } catch {}
          fetchTimeline();
        }}
        onOpenIbanSettings={() => {
          setShowCreateClassModal(false);
          setSettingsInitialTab("payout");
          setIsSettingsModalOpen(true);
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
                    {assignmentModalClass.name} • Ödevler
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Öğrenciler için ödev oluştur ve takip et
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
                placeholder="Yeni ödev başlığı..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newAssignmentTitle.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs transition cursor-pointer shrink-0"
              >
                + Ata
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
              Kapat
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
              <h3 className="text-base font-bold text-white">PIN Kodu ile Derse Katıl</h3>
              <p className="text-xs text-slate-400 pt-1">
                Öğretmeninizin tahtada paylaştığı 6 haneli kodu yazın
              </p>
            </div>

            <form onSubmit={handleStudentJoin} className="space-y-3">
              <input
                type="text"
                maxLength={8}
                placeholder="Örn: 7A2-5K9"
                value={studentPin}
                onChange={(e) => setStudentPin(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-center font-mono font-bold text-lg text-white uppercase placeholder-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                Derse Bağlan ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
