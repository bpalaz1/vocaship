"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function GuestNudgeBanner() {
  const { user, isGuest, openAuthModal } = useAuth();

  if (user || !isGuest) return null;

  return (
    <div
      data-testid="guest-nudge-banner"
      className="w-full bg-gradient-to-r from-indigo-950/95 via-slate-900/95 to-emerald-950/95 border-b border-emerald-500/25 px-4 py-2 text-xs text-slate-200 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[11px] sm:text-xs font-medium text-center sm:text-left text-slate-200">
          🧭 Misafir modundasınız — İlerlemeniz yalnızca bu tarayıcıda geçici tutulur. Verilerinizi korumak ve AI özelliklerini açmak için ücretsiz hesap oluşturun.
        </p>
        <button
          type="button"
          data-testid="guest-banner-register-btn"
          onClick={() => openAuthModal("register")}
          className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 text-[11px] font-black shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
        >
          Hesap Oluştur
        </button>
      </div>
    </div>
  );
}
