"use client";

import React, { useState, useRef, useEffect } from "react";
import { Users, MoreVertical, KeyRound, Tv, Trash2, Edit2 } from "lucide-react";

export interface ClassroomItem {
  id: string;
  name: string;
  code: string;
  student_count: number;
  grade_level?: string;
  created_at?: string;
}

export interface ClassCardProps {
  classroom: ClassroomItem;
  isSelected?: boolean;
  onSelect: () => void;
  onOpenPinModal: () => void;
  onProjectToBoard: () => void;
  onDeleteClass?: () => void;
}

export default function ClassCard({
  classroom,
  isSelected = false,
  onSelect,
  onOpenPinModal,
  onProjectToBoard,
  onDeleteClass,
}: ClassCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMenuOpen]);

  return (
    <div
      onClick={onSelect}
      className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-visible flex flex-col justify-between min-h-[140px] group ${
        isSelected
          ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50"
          : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
      }`}
    >
      {/* Üst Kısım: Sınıf Adı ve Sağ Üst ••• Menüsü */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition truncate">
            {classroom.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{classroom.student_count || 0} Öğrenci</span>
          </div>
        </div>

        {/* Sağ Üst ••• Menüsü */}
        <div
          ref={menuRef}
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Sınıf Seçenekleri"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-30 w-56 rounded-2xl bg-slate-900 border border-slate-700/80 p-1.5 shadow-2xl backdrop-blur-xl space-y-1 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPinModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Katılım Kodu / Davetiye</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onProjectToBoard();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 text-emerald-400" />
                <span>Akıllı Tahtayı Başlat</span>
              </button>

              {onDeleteClass && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDeleteClass();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sınıfı Sil</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alt Durum: Yalın ve Temiz */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Aktif Sınıf Kaydı</span>
        </span>
        <span className="text-slate-500 group-hover:text-indigo-400 transition font-medium">
          Ders Detayı ➔
        </span>
      </div>
    </div>
  );
}
