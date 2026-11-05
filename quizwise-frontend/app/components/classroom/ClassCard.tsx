"use client";

import React, { useState } from "react";
import {
  Users,
  Copy,
  Check,
  Tv,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  QrCode,
} from "lucide-react";

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
  isTeacher?: boolean;
  hasActiveSession?: boolean;
  activeAssignmentsCount?: number;
  onSelect: () => void;
  onAssignHomework?: () => void;
  onProjectToBoard?: () => void;
  onOpenLiveQR?: () => void;
  onJoinLiveSession?: () => void;
}

export default function ClassCard({
  classroom,
  isSelected = false,
  isTeacher = false,
  hasActiveSession = false,
  activeAssignmentsCount = 0,
  onSelect,
  onAssignHomework,
  onProjectToBoard,
  onOpenLiveQR,
  onJoinLiveSession,
}: ClassCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(classroom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onProjectToBoard) {
      onProjectToBoard();
    }
  };

  const handleAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAssignHomework) {
      onAssignHomework();
    }
  };

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 group ${
        isSelected
          ? "bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/50"
          : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Üst Kısım: Seviye Rozeti, Öğrenci Sayısı & Minimalist Öğretmen PIN Kopyalama İkonu */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {classroom.grade_level || "C1 Pro"}
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{classroom.student_count || 18} Öğrenci</span>
            </span>
          </div>

          {/* SADECE ÖĞRETMENE ÖZEL: Minimalist Köşe PIN Kopyalama & Tahtaya Yansıt İkonları */}
          {isTeacher && (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {/* Minimalist Kopyalama Butonu */}
              <button
                type="button"
                onClick={handleCopyCode}
                className={`p-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  copied
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
                title="Sınıf PIN Kodunu Kopyala"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold font-mono">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-medium hidden sm:inline text-slate-400">PIN</span>
                  </>
                )}
              </button>

              {/* Minimalist Tahtaya Yansıt İkonu */}
              {onProjectToBoard && (
                <button
                  type="button"
                  onClick={handleProject}
                  className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white transition cursor-pointer"
                  title="Akıllı Tahtaya Yansıt / PIN"
                >
                  <Tv className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Dev Dinamik QR İkonu */}
              {onOpenLiveQR && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLiveQR();
                  }}
                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 hover:text-white transition cursor-pointer"
                  title="Akıllı Tahta Dev QR Kodunu Yansıt"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Ferah Sınıf Gövdesi (Kaba PIN ortadan kaldırıldı) */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
            {classroom.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {hasActiveSession ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>🟢 Canlı Ders Yayında</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>Henüz aktif ders yok</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alt Eylemler & Durum Çubuğu */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-[11px]">
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span>{activeAssignmentsCount} Aktif Ödev</span>
        </span>

        {isTeacher ? (
          <div className="flex items-center gap-3">
            {onProjectToBoard && (
              <button
                type="button"
                onClick={handleProject}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-semibold hover:underline cursor-pointer"
              >
                <Tv className="w-3 h-3 text-indigo-400" />
                <span>Tahtaya Yansıt</span>
              </button>
            )}

            {onOpenLiveQR && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLiveQR();
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold hover:underline cursor-pointer"
              >
                <QrCode className="w-3 h-3 text-emerald-400" />
                <span>Canlı QR</span>
              </button>
            )}

            {onAssignHomework && (
              <button
                type="button"
                onClick={handleAssign}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>+ Ödev Ata</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div>
            {hasActiveSession ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onJoinLiveSession) onJoinLiveSession();
                }}
                className="py-1 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-[11px] shadow-md shadow-emerald-500/30 animate-pulse transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🟢</span>
                <span>Derse Katıl ➔</span>
              </button>
            ) : (
              <span className="text-[10px] font-mono text-slate-500">
                Ders saati bekleniyor
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

