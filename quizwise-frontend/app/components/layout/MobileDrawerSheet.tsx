"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface MobileDrawerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxHeightClass?: string;
}

export default function MobileDrawerSheet({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxHeightClass = "max-h-[88vh]",
}: MobileDrawerSheetProps) {
  // ESC tuşu ile kapatma ve arka plan kaydırmasını kilitleme
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 1. Yarı saydam kararartma arka planı (Backdrop) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* 2. Alttan Açılan Dokunmatik Çekmece (Bottom Sheet) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col ${maxHeightClass} animate-in slide-in-from-bottom duration-300`}
      >
        {/* Dokunmatik Kaydırma Kulpu (Handle Pill) */}
        <div
          onClick={onClose}
          className="pt-3 pb-1 cursor-pointer flex justify-center items-center w-full"
        >
          <div className="w-12 h-1.5 bg-slate-700 hover:bg-slate-500 rounded-full transition-colors" />
        </div>

        {/* Başlık ve Kapat Butonu */}
        {(title || icon) && (
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {icon && <span className="text-indigo-400 shrink-0">{icon}</span>}
              <h3 className="text-sm font-bold text-white truncate">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Kaydırılabilir Çekmece İçeriği */}
        <div className="overflow-y-auto px-5 py-4 pb-10 space-y-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

