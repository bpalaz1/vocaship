"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Play,
  Radio,
  Copy,
  Check,
  Send,
  Calendar,
  Clock,
  FileText,
  KeyRound,
  Sparkles,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import SendMaterialModal from "../../components/classroom/SendMaterialModal";
import { formatLocalSessionTime } from "../../utils/calendarUtils";

interface RoomClassInfo {
  id: string;
  name: string;
  code: string;
  invite_slug?: string;
  student_count: number;
  teacher_id?: string;
  created_at?: string;
}

interface RoomSession {
  session_id: string;
  class_id: string;
  class_name: string;
  session_date_utc?: string;
  duration_minutes?: number;
  status: string;
  role?: "teacher" | "attendee";
  teacher_name?: string;
}

export default function ClassroomRoomPage() {
  const params = useParams();
  const router = useRouter();
  const classId = String(params?.id || "");
  const { userProfile } = useProfile();
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const { t } = useLanguage();

  const currentUserId = user?.id || userProfile?.id || "00000000-0000-0000-0000-000000000001";
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

  const [classInfo, setClassInfo] = useState<RoomClassInfo | null>(null);
  const [sessions, setSessions] = useState<RoomSession[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStartingLive, setIsStartingLive] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSendMaterialOpen, setIsSendMaterialOpen] = useState<boolean>(false);

  const loadRoomData = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);

    let localMatch: RoomClassInfo | null = null;
    try {
      const saved = localStorage.getItem("vocaship_classes");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          localMatch = list.find((c: any) => c.id === classId) || null;
        }
      }
    } catch {}

    let resolvedClass: RoomClassInfo | null = localMatch;
    let ownerFlag = false;
    const matchedSessions: RoomSession[] = [];

    try {
      const [clsRes, tlRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/classroom/classes`).catch(() => null),
        fetch(`${apiUrl}/api/v1/classroom/timeline?user_id=${encodeURIComponent(currentUserId)}`).catch(() => null),
      ]);

      if (clsRes && clsRes.ok) {
        const clsList = await clsRes.json();
        if (Array.isArray(clsList)) {
          const found = clsList.find((c: any) => c.id === classId);
          if (found) {
            resolvedClass = {
              id: found.id,
              name: found.name,
              code: found.code || found.invite_slug || "VRG-2535",
              invite_slug: found.invite_slug,
              student_count: found.student_count ?? 0,
              teacher_id: found.teacher_id,
              created_at: found.created_at,
            };
          }
        }
      }

      if (tlRes && tlRes.ok) {
        const tlData = await tlRes.json();
        const teaching = Array.isArray(tlData.teaching_sessions) ? tlData.teaching_sessions : [];
        const attending = Array.isArray(tlData.attending_sessions) ? tlData.attending_sessions : [];

        for (const s of teaching) {
          if (s.class_id === classId) {
            matchedSessions.push({ ...s, role: "teacher" });
            ownerFlag = true;
          }
        }
        for (const s of attending) {
          if (s.class_id === classId) {
            matchedSessions.push({ ...s, role: "attendee" });
            if (!resolvedClass) {
              resolvedClass = {
                id: classId,
                name: s.class_name || t("cls_room_default_name", "Sınıf Odası"),
                code: s.invite_slug || "LIVE",
                invite_slug: s.invite_slug,
                student_count: s.attendees_count ?? 0,
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn("Room load error:", e);
    }

    if (resolvedClass?.teacher_id) {
      ownerFlag = resolvedClass.teacher_id === currentUserId;
    } else if (!ownerFlag && localMatch && matchedSessions.every((s) => s.role !== "attendee")) {
      ownerFlag = true;
    }

    // Aktif canlı oturum localStorage kontrolü
    try {
      const rawActive = localStorage.getItem("vocaship_active_class");
      if (rawActive) {
        const parsed = JSON.parse(rawActive);
        if (parsed?.classId === classId && !matchedSessions.some((s) => s.status === "live")) {
          matchedSessions.unshift({
            session_id: parsed.sessionId || `live-${classId}`,
            class_id: classId,
            class_name: resolvedClass?.name || parsed.className || t("cls_room_default_name", "Sınıf Odası"),
            session_date_utc: parsed.startedAt || new Date().toISOString(),
            status: "live",
          });
        }
      }
    } catch {}

    setClassInfo(
      resolvedClass || {
        id: classId,
        name: t("cls_room_default_name", "Sınıf Odası"),
        code: "VRG-2535",
        student_count: 0,
      }
    );
    setSessions(matchedSessions);
    setIsOwner(ownerFlag);
    setIsLoading(false);
  }, [classId, currentUserId, apiUrl, t]);

  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  const activeLiveSession = sessions.find((s) => s.status === "live") || null;
  const upcomingSessions = sessions.filter((s) => s.status !== "completed" && s.status !== "live");
  const pastSessions = sessions.filter((s) => s.status === "completed");

  const handleStartLesson = async () => {
    if (!classInfo || isStartingLive) return;
    setIsStartingLive(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/classroom/classes/${encodeURIComponent(classId)}/start-live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: currentUserId,
          class_name: classInfo.name,
        }),
      });
      const data = res.ok ? await res.json() : null;
      const targetUrl = data?.session_id
        ? `/classroom/board?classId=${encodeURIComponent(classId)}&sessionId=${encodeURIComponent(
            data.session_id
          )}&live=1&role=teacher&className=${encodeURIComponent(classInfo.name)}`
        : `/classroom/board?classId=${encodeURIComponent(classId)}&live=1&role=teacher&className=${encodeURIComponent(
            classInfo.name
          )}`;
      router.push(targetUrl);
    } catch {
      router.push(
        `/classroom/board?classId=${encodeURIComponent(classId)}&live=1&role=teacher&className=${encodeURIComponent(classInfo.name)}`
      );
    } finally {
      setIsStartingLive(false);
    }
  };

  const handleJoinLiveLesson = () => {
    if (!classInfo) return;
    const sessionQuery = activeLiveSession?.session_id
      ? `&sessionId=${encodeURIComponent(activeLiveSession.session_id)}`
      : "";
    router.push(
      `/classroom/board?classId=${encodeURIComponent(classId)}${sessionQuery}&live=1&role=student&className=${encodeURIComponent(
        classInfo.name
      )}`
    );
  };

  const handleCopyCode = () => {
    if (!classInfo?.code) return;
    navigator.clipboard.writeText(classInfo.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleCopyInviteLink = () => {
    if (!classInfo) return;
    const slugOrCode = classInfo.invite_slug || classInfo.code;
    const url = `${window.location.origin}/join/${encodeURIComponent(slugOrCode)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-[calc(100vh-4rem)] flex items-center justify-center ${
          isDark ? "bg-[#0B0F19] text-white" : "bg-[#dce3ec] text-slate-900"
        }`}
      >
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] w-full flex flex-col transition-colors duration-200 ${
        isDark ? "bg-[#0B0F19] text-slate-100" : "bg-[#dce3ec] text-slate-900"
      }`}
    >
      {/* ÜST BAŞLIK VE ROL BAZLI AKSİYON ALANI */}
      <header
        data-theme-preserve="dark"
        className="border-b border-slate-800 bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-20 shadow-lg"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/classroom"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("cls_room_back", "← Sınıflarım")}</span>
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                  {classInfo?.name}
                </h1>
                {activeLiveSession && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>{t("cls_room_live_badge", "Canlı Ders Aktif")}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {classInfo?.student_count ?? 0} {t("cls_room_participants", "Katılımcı")}
                  </span>
                </span>
                {isOwner && classInfo?.code && (
                  <span className="font-mono text-indigo-300">PIN: {classInfo.code}</span>
                )}
              </div>
            </div>
          </div>

          {/* ROL BAZLI ÜST AKSİYON BUTONU */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isOwner ? (
              <button
                type="button"
                onClick={handleStartLesson}
                disabled={isStartingLive}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isStartingLive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>{t("cls_room_start_lesson", "▶️ Dersi Başlat")}</span>
              </button>
            ) : activeLiveSession ? (
              <button
                type="button"
                onClick={handleJoinLiveLesson}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-rose-600/30 ring-2 ring-rose-400/40 animate-pulse transition active:scale-95 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>{t("cls_room_join_live", "🔴 Canlı Derse Katıl")}</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* EĞİTMEN YÖNETİM PANELİ: DAVET & MATERYAL */}
        {isOwner ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">{t("cls_room_invite_title", "Sınıf Davet & PIN Yönetimi")}</h2>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("cls_room_invite_desc", "Öğrencilerinizi PIN kodu veya davet bağlantısı ile odaya alın.")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isDark
                      ? "bg-slate-950 hover:bg-slate-800 border-slate-700 text-indigo-300"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-700"
                  }`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copiedCode
                      ? t("copied", "Kopyalandı")
                      : `${t("cls_room_copy_pin", "PIN Kopyala")}: ${classInfo?.code}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isDark
                      ? "bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? t("copied", "Kopyalandı") : t("cls_room_copy_link", "Davet Linkini Kopyala")}</span>
                </button>
              </div>
            </div>

            <div
              className={`p-6 rounded-3xl border space-y-4 flex flex-col justify-between ${
                isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">{t("cls_room_mat_title", "Materyal & Ders Notu Paylaş")}</h2>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("cls_room_mat_desc", "Sınıfınızdaki öğrencilere çalışma notu veya duyuru gönderin.")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSendMaterialOpen(true)}
                className="w-full sm:w-auto self-start px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/25"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t("cls_card_send_mat", "Materyal & Not Gönder")}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ÖĞRENCİ GÖRÜNÜMÜ: CANLI DURUM VEYA YAKLAŞAN DERS SAATİ */
          <div
            className={`p-6 rounded-3xl border space-y-3 ${
              activeLiveSession
                ? "bg-rose-500/10 border-rose-500/40"
                : isDark
                ? "bg-slate-900/90 border-slate-800"
                : "bg-white border-slate-300 shadow-sm"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${activeLiveSession ? "text-rose-400" : "text-indigo-400"}`} />
                  <span>
                    {activeLiveSession
                      ? t("cls_room_student_live_title", "Öğretmeniniz canlı dersi başlattı!")
                      : t("cls_room_student_wait_title", "Ders henüz başlamadı")}
                  </span>
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {activeLiveSession
                    ? t("cls_room_student_live_desc", "Aşağıdaki veya üstteki butona tıklayarak doğrudan canlı tahta odasına katılabilirsiniz.")
                    : upcomingSessions[0]?.session_date_utc
                    ? `${t("cls_room_next_lesson", "Yaklaşan Ders Saati")}: ${formatLocalSessionTime(
                        upcomingSessions[0].session_date_utc
                      )}`
                    : t("cls_room_student_wait_desc", "Öğretmeniniz dersi başlattığında burada canlı katılım butonu görünecektir.")}
                </p>
              </div>

              {activeLiveSession && (
                <button
                  type="button"
                  onClick={handleJoinLiveLesson}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Radio className="w-4 h-4" />
                  <span>{t("cls_room_join_live", "🔴 Canlı Derse Katıl")}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* DERS PROGRAMI & SINIF NOTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-300 shadow-sm"
            }`}
          >
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{t("cls_room_schedule_hdr", "Ders Programı & Oturumlar")}</span>
            </h3>
            {upcomingSessions.length === 0 && pastSessions.length === 0 ? (
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {t("cls_room_no_sessions", "Henüz planlanmış veya tamamlanmış oturum bulunmuyor.")}
              </p>
            ) : (
              <div className="space-y-2.5">
                {[...upcomingSessions, ...pastSessions].slice(0, 5).map((s) => (
                  <div
                    key={s.session_id}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-semibold">
                        {s.session_date_utc ? formatLocalSessionTime(s.session_date_utc) : s.class_name}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-indigo-500/15 text-indigo-400"
                      }`}
                    >
                      {s.status === "completed"
                        ? t("cls_status_completed", "Tamamlandı")
                        : t("cls_status_scheduled", "Planlandı")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-300 shadow-sm"
            }`}
          >
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{t("cls_room_notes_hdr", "Sınıf Notları & Materyaller")}</span>
            </h3>
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                isDark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                {t(
                  "cls_room_notes_empty",
                  "Öğretmeninizin paylaştığı ders notları ve çalışma materyalleri burada listelenir."
                )}
              </span>
            </div>
          </div>
        </div>
      </main>

      {isSendMaterialOpen && classInfo && (
        <SendMaterialModal
          isOpen={isSendMaterialOpen}
          onClose={() => setIsSendMaterialOpen(false)}
          classId={classInfo.id}
          className={classInfo.name}
          teacherId={currentUserId}
        />
      )}
    </div>
  );
}
