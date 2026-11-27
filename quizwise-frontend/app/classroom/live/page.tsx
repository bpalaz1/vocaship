"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ClassroomLiveRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let resolvedClassId =
      searchParams.get("classId") ||
      searchParams.get("class_id") ||
      searchParams.get("code") ||
      "";

    if (!resolvedClassId && typeof window !== "undefined") {
      try {
        const rawActive = localStorage.getItem("vocaship_active_class");
        if (rawActive) {
          const parsed = JSON.parse(rawActive);
          if (parsed?.classId) {
            resolvedClassId = String(parsed.classId);
          }
        }
      } catch {}
    }

    if (!resolvedClassId) {
      resolvedClassId = "cls-1";
    }

    const sessionId =
      searchParams.get("sessionId") ||
      searchParams.get("session_id") ||
      searchParams.get("session") ||
      "";
    const role = searchParams.get("role") || "student";
    const className =
      searchParams.get("className") || searchParams.get("class_name") || "";

    const nextParams = new URLSearchParams();
    nextParams.set("classId", resolvedClassId);
    if (sessionId) nextParams.set("sessionId", sessionId);
    if (role) nextParams.set("role", role);
    if (className) nextParams.set("className", className);

    router.replace(`/classroom/board?${nextParams.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3 p-4">
      <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs sm:text-sm text-slate-300 font-medium">
        Canlı sınıfa yönlendiriliyor...
      </p>
    </div>
  );
}

export default function ClassroomLiveRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClassroomLiveRedirectContent />
    </Suspense>
  );
}
