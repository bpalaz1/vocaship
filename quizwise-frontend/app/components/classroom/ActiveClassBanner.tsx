"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tv, ArrowRight } from "lucide-react";

export interface ActiveClassSession {
  classId: string;
  sessionId?: string;
  className: string;
  startedAt?: string;
}

export default function ActiveClassBanner() {
  const pathname = usePathname();
  const [activeSession, setActiveSession] = useState<ActiveClassSession | null>(null);

  const checkActiveSession = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("vocaship_active_class");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.classId) {
          setActiveSession(parsed);
          return;
        }
      }
      setActiveSession(null);
    } catch {
      setActiveSession(null);
    }
  };

  useEffect(() => {
    checkActiveSession();

    const handleStorageChange = () => checkActiveSession();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vocaship_active_class_change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vocaship_active_class_change", handleStorageChange);
    };
  }, []);

  // Sayfa yönlendirmelerinde de oturumu denetle
  useEffect(() => {
    checkActiveSession();
  }, [pathname]);

  // Kullanıcı zaten akıllı tahtadaysa veya aktif oturum yoksa şeridi gösterme
  if (!activeSession || pathname?.startsWith("/classroom/board")) {
    return null;
  }

  const boardUrl = `/classroom/board?classId=${encodeURIComponent(
    activeSession.classId
  )}${
    activeSession.sessionId
      ? `&sessionId=${encodeURIComponent(activeSession.sessionId)}`
      : ""
  }&className=${encodeURIComponent(activeSession.className)}`;

  return (
    <aside
      aria-label="Aktif Ders Bildirimi"
      className="sticky top-16 z-40 w-full bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 border-b border-emerald-500/50 shadow-md px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-white backdrop-blur-md animate-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-sm shadow-emerald-400" />
        <span className="text-xs sm:text-sm font-bold text-emerald-300 shrink-0">
          🟢 Aktif Dersiniz Devam Ediyor:
        </span>
        <span className="text-xs sm:text-sm font-black text-white truncate font-mono">
          {activeSession.className}
        </span>
      </div>

      <Link
        href={boardUrl}
        className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/30 active:scale-95 cursor-pointer group"
      >
        <Tv className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
        <span>🖥️ Sınıfa Geri Dön</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </aside>
  );
}

