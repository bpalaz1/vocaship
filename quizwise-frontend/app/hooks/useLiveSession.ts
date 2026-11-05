"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE } from "../config";

export interface LiveSessionData {
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
export const LIVE_SESSION_CHANNEL_NAME = "class-live-status";

export function useLiveSession(classCode: string = "VRG-2535") {
  const [liveSession, setLiveSession] = useState<LiveSessionData | null>(null);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Yerel depolamadan ve state'ten senkronize et
  const syncFromLocal = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LIVE_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.isLive === "boolean") {
          setLiveSession(parsed);
          setIsLiveActive(Boolean(parsed.isLive));
          return;
        }
      }
    } catch {}
    // Eğer hiçbir aktif yayın yoksa varsayılan olarak kapalıdır
    setIsLiveActive(false);
  }, []);

  // Sunucudan (Backend API) canlı durumu çek
  const fetchServerLiveStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/classroom/live-status?class_code=${encodeURIComponent(classCode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.is_live && data.session) {
          const s: LiveSessionData = {
            id: data.session.id || `live-${Date.now()}`,
            classId: data.session.classId || "cls-1",
            className: data.session.className || "10-A Sınıfı",
            classCode: data.session.classCode || classCode,
            title: data.session.title || "Canlı Ders Yayını",
            date: new Date().toISOString().split("T")[0],
            time: "08:00",
            isLive: true,
            teacherName: data.session.teacherName || "Eğitmen Stüdyosu",
          };
          setLiveSession(s);
          setIsLiveActive(true);
          try {
            localStorage.setItem(LIVE_SESSION_STORAGE_KEY, JSON.stringify(s));
          } catch {}
          return;
        } else {
          // Sunucuda aktif yayın yok
          setIsLiveActive(false);
          setLiveSession((prev) => (prev ? { ...prev, isLive: false } : null));
          try {
            const current = localStorage.getItem(LIVE_SESSION_STORAGE_KEY);
            if (current) {
              const parsed = JSON.parse(current);
              parsed.isLive = false;
              localStorage.setItem(LIVE_SESSION_STORAGE_KEY, JSON.stringify(parsed));
            }
          } catch {}
        }
      }
    } catch {
      // Backend erişilemezse yerel duruma güven
      syncFromLocal();
    } finally {
      setIsLoading(false);
    }
  }, [classCode, syncFromLocal]);

  // Öğretmen için: Canlı oturum başlat
  const startLive = useCallback(
    async (sessionData: Partial<LiveSessionData>) => {
      const fullSession: LiveSessionData = {
        id: sessionData.id || `live-${Date.now()}`,
        classId: sessionData.classId || "cls-1",
        className: sessionData.className || "10-A Sınıfı • C1 Project Controls",
        classCode: sessionData.classCode || classCode,
        title: sessionData.title || "Canlı Proje Vaka Analizi",
        date: sessionData.date || new Date().toISOString().split("T")[0],
        time: sessionData.time || "08:00",
        isLive: true,
        teacherName: sessionData.teacherName || "Eğitmen Stüdyosu",
      };

      setLiveSession(fullSession);
      setIsLiveActive(true);

      // 1. Yerel Depolama & Custom Event
      try {
        localStorage.setItem(LIVE_SESSION_STORAGE_KEY, JSON.stringify(fullSession));
        window.dispatchEvent(new Event("vocaship_live_session_updated"));
      } catch {}

      // 2. Realtime BroadcastChannel (0ms Sekmeler Arası İletişim)
      try {
        if (channelRef.current) {
          channelRef.current.postMessage({
            type: "LIVE_STATUS_CHANGE",
            isLive: true,
            session: fullSession,
          });
        }
      } catch {}

      // 3. Backend Sunucu Güncellemesi
      try {
        await fetch(`${API_BASE}/api/v1/classroom/live-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class_code: fullSession.classCode,
            class_id: fullSession.classId,
            class_name: fullSession.className,
            title: fullSession.title,
            is_live: true,
            session_id: fullSession.id,
            teacher_name: fullSession.teacherName,
          }),
        });
      } catch {}
    },
    [classCode]
  );

  // Öğretmen için: Canlı oturumu sonlandır
  const endLive = useCallback(async () => {
    setIsLiveActive(false);
    setLiveSession((prev) => (prev ? { ...prev, isLive: false } : null));

    // 1. Yerel Depolama
    try {
      const current = localStorage.getItem(LIVE_SESSION_STORAGE_KEY);
      const updated = current ? { ...JSON.parse(current), isLive: false } : { isLive: false };
      localStorage.setItem(LIVE_SESSION_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("vocaship_live_session_updated"));
    } catch {}

    // 2. Realtime BroadcastChannel
    try {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "LIVE_STATUS_CHANGE",
          isLive: false,
          session: null,
        });
      }
    } catch {}

    // 3. Backend Sunucu Güncellemesi
    try {
      await fetch(`${API_BASE}/api/v1/classroom/live-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_code: classCode,
          is_live: false,
        }),
      });
    } catch {}
  }, [classCode]);

  useEffect(() => {
    syncFromLocal();
    fetchServerLiveStatus();

    // 1. BroadcastChannel Aboneliği (Gerçek Zamanlı Realtime Sync)
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel(LIVE_SESSION_CHANNEL_NAME);
        channelRef.current = channel;
        channel.onmessage = (event) => {
          if (event.data?.type === "LIVE_STATUS_CHANGE") {
            const { isLive, session } = event.data;
            setIsLiveActive(Boolean(isLive));
            if (session) {
              setLiveSession(session);
            } else if (!isLive) {
              setLiveSession((prev) => (prev ? { ...prev, isLive: false } : null));
            }
          }
        };
      } catch {}
    }

    // 2. Window Custom Event & Cross-Tab Storage Dinleyicisi
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LIVE_SESSION_STORAGE_KEY) {
        syncFromLocal();
      }
    };

    const handleCustomUpdate = () => {
      syncFromLocal();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vocaship_live_session_updated", handleCustomUpdate);

    // 3. Periyodik Polling (5 saniyede bir arka plan senkronizasyonu)
    const interval = setInterval(() => {
      fetchServerLiveStatus();
    }, 5000);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vocaship_live_session_updated", handleCustomUpdate);
      clearInterval(interval);
    };
  }, [syncFromLocal, fetchServerLiveStatus]);

  return {
    isLiveActive,
    liveSession,
    isLoading,
    startLive,
    endLive,
    refreshStatus: fetchServerLiveStatus,
  };
}

