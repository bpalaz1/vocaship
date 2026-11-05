"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  Gamepad2,
  ArrowRight,
  Layers,
  FileCheck,
} from "lucide-react";
import { AssignmentItem } from "../../actions/assignments";

export interface StudentAssignmentsProps {
  assignments: AssignmentItem[];
  className?: string;
  classCode?: string;
  onStartAssignment?: (assignment: AssignmentItem) => void;
}

export default function StudentAssignments({
  assignments = [],
  className,
  classCode,
  onStartAssignment,
}: StudentAssignmentsProps) {
  // =========================================================================
  // BOŞ DURUM (EMPTY STATE) YÖNETİMİ
  // Öğrencinin kayıtlı olduğu bir sınıf yoksa veya sınıfında henüz ödev atanmamışsa
  // =========================================================================
  if (assignments.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-lg sm:text-xl font-black text-white">
            Tebrikler! Tüm Görevlerin Tamam
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Henüz bekleyen bir ödevin yok! Dinlen veya Oyun Arenası&apos;nda pratik yap.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/games"
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 fill-current" />
            <span>🎮 Oyun Arenası&apos;na Git</span>
          </Link>

          <Link
            href="/reading"
            className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>İnteraktif Okuma Odası</span>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // İZOLE EDİLMİŞ ÖĞRENCİ ÖDEV LİSTESİ
  // =========================================================================
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
      {/* Sınıf Bilgi Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold inline-flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Kayıtlı Sınıf Ödevlerin {classCode ? `(${classCode})` : ""}</span>
          </span>
          <h3 className="text-base sm:text-lg font-black text-white">
            {className || "Aktif Sınıfın Ödev Listesi"}
          </h3>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {assignments.length} Aktif Ödev Bulundu
        </span>
      </div>

      {/* Ödev Kartları */}
      <div className="space-y-3.5">
        {assignments.map((assign) => (
          <div
            key={assign.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono font-bold">
                  📖 Okuma & Anlama Görevi
                </span>
                {assign.due_date && (
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{assign.due_date}</span>
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition truncate">
                {assign.title}
              </h4>

              {assign.story_content && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {assign.story_content}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                  {assign.target_words?.length || 5} Hedef Kelime
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300">
                  {assign.questions?.length || 3} Test Sorusu
                </span>
                {typeof assign.completed_percent === "number" && (
                  <span className="text-emerald-400 font-bold">
                    %{assign.completed_percent} Teslim Edildi
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (onStartAssignment) {
                    onStartAssignment(assign);
                  }
                }}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                <span>Ödeve Başla</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

