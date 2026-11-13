"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import ClassroomPodiumModal from "../../components/games/ClassroomPodiumModal";
import LiveReadingRoom from "../../components/classroom/LiveReadingRoom";
import LiveSpeechToDeckPanel from "../../components/classroom/LiveSpeechToDeckPanel";
import { useLiveTranscription } from "../../hooks/useLiveTranscription";
import { API_BASE } from "../../config";

export interface ScheduledLiveClass {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  title: string;
  date: string;
  time: string;
  isLive: boolean;
  teacherName: string;
}

export const LIVE_SESSION_STORAGE_KEY = "vocaship_live_session";

export const DEFAULT_LIVE_SESSION: ScheduledLiveClass = {
  id: "live-10a-0800",
  classId: "cls-1",
  className: "10-A Sınıfı • C1 Project Controls",
  classCode: "VRG-2535",
  title: "Yarın 08:00 - Canlı Proje Vaka Analizi",
  date: new Date().toISOString().split("T")[0],
  time: "08:00",
  isLive: true,
  teacherName: "Eğitmen Stüdyosu",
};

interface LiveChatMessage {
  id: string;
  sender: string;
  role: "teacher" | "student" | "system";
  text: string;
  timestamp: string;
  isHandRaise?: boolean;
}

const INITIAL_MESSAGES: LiveChatMessage[] = [
  {
    id: "msg-1",
    sender: "Sistem",
    role: "system",
    text: "🔴 Canlı Sınıf Stüdyosu (Live Classroom Studio) bağlantısı kuruldu. Gecikmesiz WebRTC medya katmanı hazır.",
    timestamp: "08:00",
  },
  {
    id: "msg-2",
    sender: "Ahmet Yılmaz",
    role: "student",
    text: "Günaydın hocam, ses ve ekran görüntüsü çok net geliyor!",
    timestamp: "08:01",
  },
  {
    id: "msg-3",
    sender: "Zeynep Kaya",
    role: "student",
    text: "FIDIC Red Book Madde 20.1 vaka analizini bugün inceleyecek miyiz?",
    timestamp: "08:02",
  },
];

function ClassroomLiveStudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialRoleParam = searchParams.get("role");
  const [role, setRole] = useState<"teacher" | "student">(
    initialRoleParam === "student" ? "student" : "teacher"
  );

  const [liveSession, setLiveSession] = useState<ScheduledLiveClass>(DEFAULT_LIVE_SESSION);
  const [studentCount] = useState<number>(24);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Media States
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isCamOn, setIsCamOn] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [permissionNotice, setPermissionNotice] = useState<{
    type: "info" | "warning";
    message: string;
  } | null>(null);

  // Student States
  const [handRaised, setHandRaised] = useState<boolean>(false);
  const [raisedHandsQueue, setRaisedHandsQueue] = useState<string[]>(["Selin Demir"]);
  const [isPodiumOpen, setIsPodiumOpen] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<"stream" | "reading">("stream");
  const [rightPanelTab, setRightPanelTab] = useState<"chat" | "whisper">("whisper");

  // Canlı Ses Dinleme (Live Whisper to Deck) Hook'u
  const {
    isListening: isWhisperListening,
    isSupported: isWhisperSupported,
    errorMessage: whisperErrorMessage,
    capturedWords,
    startListening: startWhisperListening,
    stopListening: stopWhisperListening,
    removeWord: removeWhisperWord,
    clearWords: clearWhisperWords,
    simulateSpokenPhrase: simulateWhisperPhrase,
  } = useLiveTranscription({
    sessionId: liveSession.id,
    classCode: liveSession.classCode,
    isTeacher: role === "teacher",
  });

  // Chat States
  const [messages, setMessages] = useState<LiveChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState<string>("");

  // Video & Stream Refs
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const camVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "reading") {
      setActiveStage("reading");
    }

    const roleParam = searchParams.get("role");
    if (roleParam === "student" || roleParam === "teacher") {
      setRole(roleParam);
    }

    const codeParam = searchParams.get("code") || searchParams.get("classCode");
    if (codeParam) {
      setLiveSession((prev) => ({
        ...prev,
        classCode: codeParam,
      }));
    }

    const guestParam = searchParams.get("guestName");
    if (guestParam) {
      const joinMsg: LiveChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "Sistem",
        role: "system",
        text: `👋 ${guestParam} akıllı tahta QR koduyla derse katıldı!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, joinMsg]);
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIVE_SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title) {
          setLiveSession(parsed);
        }
      } else {
        localStorage.setItem(LIVE_SESSION_STORAGE_KEY, JSON.stringify(DEFAULT_LIVE_SESSION));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Live duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Re-attach streams when elements re-render or role switches
  useEffect(() => {
    if (screenVideoRef.current && screenStreamRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
    if (camVideoRef.current && camStreamRef.current) {
      camVideoRef.current.srcObject = camStreamRef.current;
    }
  }, [isScreenSharing, isCamOn, role]);

  // Cleanup all tracks on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      stopAllMediaStreams();
    };
  }, []);

  const stopAllMediaStreams = () => {
    if (screenStreamRef.current) {
      const tracks = screenStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (camStreamRef.current) {
      const tracks = camStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      camStreamRef.current = null;
    }
    if (micStreamRef.current) {
      const tracks = micStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      micStreamRef.current = null;
    }
  };

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const showNotice = (message: string, type: "info" | "warning" = "info") => {
    setPermissionNotice({ type, message });
    setTimeout(() => {
      setPermissionNotice((prev) => (prev?.message === message ? null : prev));
    }, 5500);
  };

  // Toggle Camera via navigator.mediaDevices.getUserMedia (SADECE video track)
  const handleToggleCamera = async () => {
    if (isCamOn) {
      if (camStreamRef.current) {
        const videoTracks = camStreamRef.current.getVideoTracks();
        videoTracks.forEach((track) => track.stop());
        camStreamRef.current = null;
      }
      if (camVideoRef.current) {
        camVideoRef.current.srcObject = null;
      }
      setIsCamOn(false);
      showNotice("📷 Kamera görüntüsü kapatıldı.", "info");
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotice(
          "Tarayıcınız kamera erişimini (getUserMedia) desteklemiyor. Lütfen güncel bir tarayıcı kullanın.",
          "warning"
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      camStreamRef.current = stream;

      if (camVideoRef.current) {
        camVideoRef.current.srcObject = stream;
      }
      setIsCamOn(true);
      showNotice("📷 Kamera görüntüsü canlı stüdyoya bağlandı.", "info");
    } catch {
      showNotice(
        "Kamera izni reddedildi. Canlı görüntü paylaşmak için tarayıcı adres çubuğundan kamera iznini etkinleştirebilirsiniz.",
        "warning"
      );
    }
  };

  // Toggle Microphone (SADECE audio track, kameradan tamamen bağımsız)
  const handleToggleMic = async () => {
    if (isMicOn) {
      if (micStreamRef.current) {
        const audioTracks = micStreamRef.current.getAudioTracks();
        audioTracks.forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      setIsMicOn(false);
      if (role === "teacher") stopWhisperListening();
      showNotice("🔇 Mikrofon sessize alındı.", "info");
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsMicOn(true);
        if (role === "teacher") startWhisperListening();
        showNotice("🎤 Mikrofon ve Live Whisper aktif edildi.", "info");
        return;
      }
      const audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      micStreamRef.current = audioStream;
      setIsMicOn(true);
      if (role === "teacher") startWhisperListening();
      showNotice("🎤 Mikrofon ve Live Whisper aktif edildi.", "info");
    } catch {
      setIsMicOn(true);
      if (role === "teacher") startWhisperListening();
      showNotice(
        "Mikrofon izni bekleniyor veya simülasyon modu hazır. Kelime yakalama paneli aktif.",
        "info"
      );
    }
  };

  // Toggle Screen Share via navigator.mediaDevices.getDisplayMedia
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        const tracks = screenStreamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
      showNotice("🖥️ Ekran paylaşımı durduruldu.", "info");
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        showNotice(
          "Tarayıcınız ekran paylaşımı özelliğini (getDisplayMedia) desteklemiyor.",
          "warning"
        );
        return;
      }
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = displayStream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = displayStream;
      }
      setIsScreenSharing(true);
      showNotice("🖥️ Masaüstü ekran paylaşımı gecikmesiz olarak canlı yayında!", "info");

      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
          if (screenStreamRef.current) {
            const tracks = screenStreamRef.current.getTracks();
            tracks.forEach((track) => track.stop());
            screenStreamRef.current = null;
          }
          setIsScreenSharing(false);
          showNotice("🖥️ Ekran paylaşımı sonlandırıldı.", "info");
        };
      }
    } catch {
      showNotice(
        "Ekran paylaşımı izni verilmedi veya pencere seçimi iptal edildi. İstediğiniz zaman tekrar 'Ekran Paylaşımını Başlat/Durdur' butonuna tıklayabilirsiniz.",
        "warning"
      );
    }
  };

  // End Live Stream
  const handleEndBroadcast = () => {
    stopAllMediaStreams();
    try {
      const updated = { ...liveSession, isLive: false };
      localStorage.setItem(LIVE_SESSION_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("vocaship_live_session_updated"));

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("class-live-status");
        channel.postMessage({ type: "LIVE_STATUS_CHANGE", isLive: false, session: null });
        channel.close();
      }

      fetch(`${API_BASE}/api/v1/classroom/live-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_code: liveSession.classCode || "VRG-2535", is_live: false }),
      }).catch(() => {});
    } catch {
      // ignore
    }
    router.push("/classroom");
  };

  // Send Live Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newMsg: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      sender: role === "teacher" ? "👨‍🏫 Öğretmen (Siz)" : "🎓 Öğrenci (Siz)",
      role,
      text: trimmed,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  // Student Raise Hand / Request Floor
  const handleRaiseHand = () => {
    const nextState = !handRaised;
    setHandRaised(nextState);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    if (nextState) {
      setRaisedHandsQueue((prev) =>
        prev.includes("Öğrenci (Siz)") ? prev : [...prev, "Öğrenci (Siz)"]
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `hand-${Date.now()}`,
          sender: "🎓 Öğrenci (Siz)",
          role: "student",
          text: "✋ Söz hakkı / soru sormak için el kaldırdı!",
          timestamp: timeStr,
          isHandRaise: true,
        },
      ]);
      showNotice("✋ Söz talebiniz iletildi! Öğretmen ekranında el kaldırma bildirimi görünüyor.", "info");
      setIsChatOpen(true);
    } else {
      setRaisedHandsQueue((prev) => prev.filter((name) => name !== "Öğrenci (Siz)"));
      showNotice("✋ Söz isteme / el kaldırma talebiniz geri çekildi.", "info");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#050811] text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* ÜST STÜDYO BARI */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/classroom"
            onClick={() => stopAllMediaStreams()}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5 shrink-0"
          >
            <span>←</span>
            <span className="hidden sm:inline">Sınıfa Dön</span>
          </Link>

          {/* Canlı Yayın Rozeti & Başlık */}
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-full min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-black tracking-wide text-rose-200 truncate">
              🔴 Canlı Yayın: 10-A Sınıfı
            </span>
            <span className="hidden md:inline-block text-xs text-slate-300 font-semibold truncate border-l border-rose-500/20 pl-2">
              {liveSession.title}
            </span>
          </div>

          {/* Süre Sayacı */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {formatDuration(elapsedSeconds)}
          </div>
        </div>

        {/* Sağ Kontroller: 2 Rol Destekli Görünüm Anahtarı & Katılımcı Sayacı */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sahne Modu Seçimi: Canlı Ekran vs Eşzamanlı Canlı Okuma */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveStage("stream")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeStage === "stream"
                  ? "bg-slate-800 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🖥️</span>
              <span className="hidden md:inline">Canlı Ekran</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStage("reading")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeStage === "reading"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow font-black"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <span>📖</span>
              <span>Canlı Okuma (Synced)</span>
            </button>
          </div>

          {/* 2 Rol Destekli Geçiş (A: Öğretmen Görünümü / B: Öğrenci Görünümü) */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                role === "teacher"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>👨‍🏫</span>
              <span className="hidden sm:inline">Öğretmen Görünümü</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                role === "student"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🎓</span>
              <span className="hidden sm:inline">Öğrenci Görünümü</span>
            </button>
          </div>

          {/* Katılımcı Sayacı */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
            <span>👥 {studentCount} Öğrenci Canlıda</span>
          </div>
        </div>
      </header>

      {/* KİBAR VE BİLGİLENDİRİCİ İZİN / DURUM UYARISI */}
      {permissionNotice && (
        <div
          className={`mx-4 mt-3 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xl backdrop-blur-md transition-all ${
            permissionNotice.type === "warning"
              ? "bg-amber-950/90 border-amber-500/50 text-amber-200"
              : "bg-slate-900/95 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">{permissionNotice.type === "warning" ? "ℹ️" : "✅"}</span>
            <span>{permissionNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setPermissionNotice(null)}
            className="text-xs px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-slate-300 cursor-pointer shrink-0"
          >
            Tamam
          </button>
        </div>
      )}

      {/* ANA ÇALIŞMA ALANI: VİDEO SAHNESİ VEYA EŞZAMANLI CANLI OKUMA ODASI */}
      {activeStage === "reading" ? (
        <LiveReadingRoom
          sessionId={liveSession.id || "live-10a-0800"}
          isTeacher={role === "teacher"}
          classCode={liveSession.classCode}
          className={liveSession.className}
          onClose={() => setActiveStage("stream")}
        />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* SOL / MERKEZ: 2 ROL DESTEKLİ VİDEO SAHNESİ */}
        <div className="flex-1 flex flex-col bg-[#070B16] relative overflow-hidden p-3 sm:p-5">
          {/* Üst Bilgi & El Kaldıran Öğrenci Bildirimi */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                PIN: {liveSession.classCode}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Saat {liveSession.time} • {liveSession.className}
              </span>
            </div>

            {raisedHandsQueue.length > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-bold animate-pulse">
                <span>✋ El Kaldıran Öğrenciler ({raisedHandsQueue.length}):</span>
                <span>{raisedHandsQueue.join(", ")}</span>
                {role === "teacher" && (
                  <button
                    type="button"
                    onClick={() => setRaisedHandsQueue([])}
                    className="ml-1.5 text-[11px] underline text-amber-300 hover:text-white cursor-pointer"
                  >
                    Söz Verildi ✓
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ANA VİDEO SAHNESİ KAPSAYICISI */}
          <div className="flex-1 relative rounded-2xl border border-slate-800/90 bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center min-h-[420px]">
            {/* ANA EKRAN: navigator.mediaDevices.getDisplayMedia ile ekran paylaşımı */}
            <video
              id="screen-share"
              ref={screenVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-contain rounded-2xl bg-slate-950 transition-opacity duration-300 ${
                isScreenSharing ? "opacity-100 z-10" : "opacity-0 pointer-events-none absolute inset-0"
              }`}
            />

            {/* Ekran paylaşımı henüz başlatılmadığında gösterilen profesyonel sahne karşılama ekranı */}
            {!isScreenSharing && (
              <div className="relative z-10 max-w-xl mx-auto text-center px-6 py-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-emerald-500/15 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl mb-5 shadow-inner">
                  🖥️
                </div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-widest mb-3">
                  {role === "teacher"
                    ? "Öğretmen Canlı Yayın Stüdyosu"
                    : "Öğrenci Tam Ekran İzleme Modu"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                  {liveSession.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  {role === "teacher"
                    ? "Alt stüdyo çubuğundaki [ 🖥️ Ekran Paylaşımını Başlat/Durdur ] butonuna tıklayarak masaüstü ekranınızı veya ders sunumunuzu gecikmesiz olarak sınıfa yansıtabilirsiniz."
                    : "Öğretmenin paylaştığı masaüstü ekranını ve sağ alt köşedeki kamera yayınını tam ekran izleme modunda gecikmesiz takip ediyorsunuz."}
                </p>

                {role === "teacher" && (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleScreenShare}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-950/60 transition cursor-pointer flex items-center gap-2"
                    >
                      <span>🖥️</span>
                      <span>Ekran Paylaşımını Başlat/Durdur</span>
                    </button>
                    {!isCamOn && (
                      <button
                        type="button"
                        onClick={handleToggleCamera}
                        className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2"
                      >
                        <span>📷</span>
                        <span>Kamera Aç/Kapat</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SAĞ ALT KÖŞE (PiP): Öğretmenin kamera görüntüsü + Öğrenci modunda [ ✋ Söz İste / El Kaldır ] butonu */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-3">
              {/* Öğrenci Görünümü: Sağ alt köşe butonu [ ✋ Söz İste / El Kaldır ] */}
              {role === "student" && (
                <button
                  type="button"
                  onClick={handleRaiseHand}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-2xl transition cursor-pointer flex items-center gap-2 border-2 ${
                    handRaised
                      ? "bg-amber-500 border-amber-300 text-slate-950 shadow-amber-500/30 animate-bounce"
                      : "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-emerald-950/60"
                  }`}
                >
                  <span>✋</span>
                  <span>{handRaised ? "Söz İsteği Gönderildi (Geri Çek)" : "Söz İste / El Kaldır"}</span>
                </button>
              )}

              {/* Öğretmenin Kamera Görüntüsü (PiP) */}
              <div className="relative w-48 h-36 rounded-xl overflow-hidden bg-slate-900/95 shadow-2xl">
                <video
                  id="camera-stream"
                  ref={camVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-48 h-36 rounded-xl border-2 border-emerald-400 shadow-2xl object-cover transition-opacity duration-300 ${
                    isCamOn ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
                  }`}
                />

                {!isCamOn && (
                  <div className="w-48 h-36 rounded-xl border-2 border-emerald-400/70 shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/50 p-3 text-center">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-base mb-1">
                      👨‍🏫
                    </div>
                    <p className="text-[11px] font-bold text-slate-200">Öğretmen Kamerası</p>
                    <p className="text-[10px] text-emerald-300/80">
                      {isMicOn ? "🎤 Ses Aktif" : "Kamera Beklemede"}
                    </p>
                  </div>
                )}

                {/* PiP Alt Etiket */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-sm text-[10px] font-semibold text-white pointer-events-none">
                  <span className="truncate">👨‍🏫 Eğitmen</span>
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isMicOn ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                      }`}
                    />
                    {isMicOn ? "Canlı" : "Sessiz"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ALT STÜDYO ÇUBUĞU */}
          {role === "teacher" ? (
            <div className="mt-4 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              {/* Katılımcı Sayacı */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-black text-emerald-300">
                <span>👥 {studentCount} Öğrenci Canlıda</span>
              </div>

              {/* Orta Medya Kontrolleri */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {/* [ 🎤 Mikrofon Aç/Kapat ] */}
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 border ${
                    isMicOn
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/30"
                      : "bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span>🎤</span>
                  <span>Mikrofon Aç/Kapat</span>
                </button>

                {/* [ 📷 Kamera Aç/Kapat ] */}
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 border ${
                    isCamOn
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200 hover:bg-indigo-500/30"
                      : "bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span>📷</span>
                  <span>Kamera Aç/Kapat</span>
                </button>

                {/* [ 🖥️ Ekran Paylaşımını Başlat/Durdur ] */}
                <button
                  type="button"
                  onClick={handleToggleScreenShare}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 border shadow-lg ${
                    isScreenSharing
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-200 hover:bg-amber-500/30"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white hover:from-indigo-500 hover:to-purple-500"
                  }`}
                >
                  <span>🖥️</span>
                  <span>Ekran Paylaşımını Başlat/Durdur</span>
                </button>
              </div>

              {/* Sağ: [ 🏆 Podyumu Aç ] ve [ 🔴 Yayını Bitir ] */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStage("reading")}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>📖</span>
                  <span>Canlı Okuma (Synced)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPodiumOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 fill-current" />
                  <span>🏆 Podyumu Aç</span>
                </button>

                <button
                  type="button"
                  onClick={handleEndBroadcast}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-950/50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔴</span>
                  <span>Yayını Bitir</span>
                </button>
              </div>
            </div>
          ) : (
            /* B) ÖĞRENCİ GÖRÜNÜMÜ ALT DURUM ÇUBUĞU */
            <div className="mt-4 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                  👥 {studentCount} Öğrenci Canlıda
                </span>
                <span className="hidden sm:inline text-slate-400">
                  Tam ekran izleme modu aktif • Öğretmenin ekranı ve kamerası gecikmesiz aktarılıyor.
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPodiumOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 fill-current" />
                  <span>🏆 Canlı Podyum</span>
                </button>

                <button
                  type="button"
                  onClick={handleRaiseHand}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                    handRaised
                      ? "bg-amber-500 text-slate-950"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  <span>✋</span>
                  <span>Söz İste / El Kaldır</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* YAN PANEL (CHAT & Q&A / LIVE WHISPER TO DECK) */}
        {isChatOpen && (
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800/90 bg-slate-950/95 flex flex-col h-[480px] lg:h-auto shrink-0 overflow-hidden">
            {/* ÜST PANEL SEKME SEÇİCİSİ */}
            <div className="flex items-center border-b border-slate-800/90 bg-slate-900/80 p-1.5 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setRightPanelTab("whisper")}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightPanelTab === "whisper"
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <span>🎙️ Whisper Kelimeleri</span>
                {capturedWords.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono animate-pulse">
                    {capturedWords.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab("chat")}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightPanelTab === "chat"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <span>💬 Soru & Sohbet</span>
                {raisedHandsQueue.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black font-mono">
                    {raisedHandsQueue.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: LIVE WHISPER TO DECK PANELİ */}
            {rightPanelTab === "whisper" ? (
              <LiveSpeechToDeckPanel
                capturedWords={capturedWords}
                isListening={isWhisperListening}
                isSupported={isWhisperSupported}
                errorMessage={whisperErrorMessage}
                role={role}
                classId={liveSession.classId}
                classCode={liveSession.classCode}
                className={liveSession.className}
                onRemoveWord={removeWhisperWord}
                onClearWords={clearWhisperWords}
                onSimulatePhrase={simulateWhisperPhrase}
                onToggleListening={
                  isWhisperListening ? stopWhisperListening : startWhisperListening
                }
              />
            ) : (
              /* TAB 2: CHAT & EL KALDIRMA AKIŞI */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>💬</span>
                      <span>Canlı Soru & El Kaldırma</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Öğrencilerin el kaldırma talepleri ve canlı Q&A
                    </p>
                  </div>
                  {role === "student" && (
                    <button
                      type="button"
                      onClick={handleRaiseHand}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        handRaised
                          ? "bg-amber-500 text-slate-950"
                          : "bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                      }`}
                    >
                      ✋ El Kaldır
                    </button>
                  )}
                </div>

                {/* El Kaldırma Talepleri Özeti */}
                {raisedHandsQueue.length > 0 && (
                  <div className="mx-3 mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>✋ Söz İsteyenler ({raisedHandsQueue.length})</span>
                      {role === "teacher" && (
                        <button
                          type="button"
                          onClick={() => setRaisedHandsQueue([])}
                          className="text-[10px] underline hover:text-white cursor-pointer"
                        >
                          Tümünü Temizle
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {raisedHandsQueue.map((student, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-100 text-[11px] font-semibold"
                        >
                          ✋ {student}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Canlı Soru & Sohbet Akışı */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                        msg.isHandRaise
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-100"
                          : msg.role === "teacher"
                          ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-100"
                          : msg.role === "system"
                          ? "bg-slate-900/90 border-slate-800 text-slate-400 text-[11px]"
                          : "bg-slate-900/70 border-slate-800/90 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[11px] text-white">{msg.sender}</span>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Soru / Mesaj Gönderme Formu */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-800/80 bg-slate-900/50 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      role === "teacher"
                        ? "Sınıfa duyuru veya yanıt yazın..."
                        : "Canlı derste soru sorun..."
                    }
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    Gönder
                  </button>
                </form>
              </div>
            )}
          </aside>
        )}
      </div>
      )}

      {/* CANLI YARIŞMA PODYUM VE ÖDÜL MODALI */}
      <ClassroomPodiumModal
        isOpen={isPodiumOpen}
        onClose={() => setIsPodiumOpen(false)}
        sessionId={liveSession.id || "live-session-1"}
        gameTitle={liveSession.title || "Canlı Sınıf Arenası"}
        currentUserRank={role === "teacher" ? 1 : 2}
        currentUserName={role === "teacher" ? "👨‍🏫 Öğretmen (Moderatör)" : "🎓 Sen (Öğrenci)"}
      />
    </div>
  );
}

export default function ClassroomLivePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050811] text-slate-200 flex items-center justify-center text-sm font-bold">
          🔴 Canlı Sınıf Stüdyosu Yükleniyor...
        </div>
      }
    >
      <ClassroomLiveStudioContent />
    </Suspense>
  );
}
