"use client";

import React, { useState, useRef, useEffect } from "react";
import { Users, MoreVertical, KeyRound, DoorOpen, Trash2, ClipboardList, Send } from "lucide-react";
import { useAppTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export interface ClassroomItem {
  id: string;
  name: string;
  code: string;
  student_count: number;
  created_at?: string;
  teacher_id?: string;
}

export interface ClassCardProps {
  classroom: ClassroomItem;
  isActiveLesson?: boolean;
  onOpenPinModal: () => void;
  onOpenAssignments: () => void;
  onOpenBoard: () => void;
  onSendMaterial?: () => void;
  onDeleteClass?: () => void;
}

export default function ClassCard({
  classroom,
  isActiveLesson = false,
  onOpenPinModal,
  onOpenAssignments,
  onOpenBoard,
  onSendMaterial,
  onDeleteClass,
}: ClassCardProps) {
  const { isDark } = useAppTheme();
  const { t } = useLanguage();
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
      className={`p-6 rounded-3xl transition-all duration-200 flex flex-col justify-between min-h-[160px] relative group ${
        isDark
          ? isActiveLesson
            ? "bg-gradient-to-b from-emerald-950/30 to-slate-900/90 border-2 border-emerald-500/70 ring-2 ring-emerald-500/20 shadow-xl hover:shadow-2xl"
            : "bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 shadow-xl hover:shadow-2xl"
          : isActiveLesson
          ? "bg-gradient-to-b from-emerald-50 to-[#f8fafc] border-2 border-emerald-500 ring-2 ring-emerald-400/20 shadow-sm hover:shadow-md"
          : "bg-[#f8fafc] border border-slate-300 hover:border-indigo-400 shadow-sm hover:shadow-md"
      }`}
    >
      {/* 1. Üst Kısım: Sınıf Adı, Öğrenci Mevcudu ve Sağ Üst ••• Menüsü */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold transition truncate ${isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"}`}>
              {classroom.name}
            </h3>
            {isActiveLesson && (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${isDark ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-emerald-100 border-emerald-300 text-emerald-800"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t("cls_card_live", "Canlı Ders")}</span>
              </span>
            )}
          </div>
          <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{classroom.student_count || 0} {t("cls_students_unit", "Öğrenci")}</span>
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
            title={t("cls_card_options", "Sınıf Seçenekleri")}
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
                <span>{t("cls_card_pin_invite", "Katılım Kodu / Davetiye")}</span>
              </button>

              {onSendMaterial && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSendMaterial();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200 flex items-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t("cls_card_send_mat", "Materyal & Not Gönder")}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAssignments();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("cls_card_assignments", "Ödevler")}</span>
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
                  <span>{t("cls_card_delete", "Sınıfı Sil")}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Kartın Merkez Butonu: Sınıfa Gir */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onOpenBoard}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg ${
            isActiveLesson
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-emerald-500/30 ring-2 ring-emerald-400/50"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25"
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>{isActiveLesson ? t("cls_card_enter_live", "Sınıfa Gir (Canlı)") : t("cls_card_enter_class", "Sınıfa Gir")}</span>
        </button>
      </div>
    </div>
  );
}
