"use client";

import React, { useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  MessageSquare,
  Award,
  Calendar,
} from "lucide-react";
import { SpeakingArchiveItem } from "../../actions/speakingArchive";

export interface SpeakingArchiveDrawerProps {
  archives: SpeakingArchiveItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function SpeakingArchiveDrawer({
  archives,
  isLoading = false,
  onRefresh,
}: SpeakingArchiveDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 z-20">
      {/* Çekmece Başlık Barı (Tek Satırlık Minimal Buton) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/40 text-slate-300 hover:text-white transition shadow-lg backdrop-blur-md cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Archive className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            📁 Geçmiş Konuşmalarım
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {archives.length} Oturum
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-300 transition">
            {isOpen ? "Gizle" : "Görüntüle"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-indigo-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white" />
          )}
        </div>
      </button>

      {/* Akordiyon Çekmece İçeriği */}
      {isOpen && (
        <div className="mt-3 p-4 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[460px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Konuşma geçmişi yükleniyor...
            </div>
          ) : archives.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Archive className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Henüz arşivlenmiş konuşma oturumunuz bulunmuyor.
              </p>
              <p className="text-[11px] text-slate-500">
                Mikrofona dokunup konuştuktan sonra "Sohbeti Bitir" butonuna bastığınızda seansınız buraya kaydedilir.
              </p>
            </div>
          ) : (
            archives.map((item) => {
              const isExpanded = expandedId === item.id;
              const overall =
                item.metrics?.overall_score ||
                Math.round(
                  ((item.metrics?.fluency || 85) +
                    (item.metrics?.vocabulary || 80) +
                    (item.metrics?.grammar || 90)) /
                    3
                );
              const level = item.metrics?.level || "C1";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition overflow-hidden"
                >
                  {/* Özet Satırı */}
                  <div
                    onClick={() =>
                      setExpandedId((prev) => (prev === item.id ? null : item.id))
                    }
                    className="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.session_title || "Speaking Oturumu"}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(item.created_at)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-slate-500" />
                          <span>{item.transcript?.length || 0} Mesaj</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-emerald-400 block">
                          {overall} Puan
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          +{item.xp_awarded || 30} XP
                        </span>
                      </div>
                      <button
                        type="button"
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Genişletilmiş Transkript Dökümü */}
                  {isExpanded && item.transcript && (
                    <div className="border-t border-slate-850 p-3 sm:p-4 bg-slate-900/60 space-y-2.5 text-xs">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pb-1">
                        Diyalog Dökümü
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {item.transcript.map((turn, tIdx) => (
                          <div
                            key={tIdx}
                            className={`p-2.5 rounded-xl ${
                              turn.sender === "user"
                                ? "bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 ml-4"
                                : "bg-slate-950/80 border border-slate-800 text-slate-300 mr-4"
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70 mb-0.5">
                              {turn.sender === "user" ? "👤 Sen" : "🤖 AI Mentor"}
                            </span>
                            <p className="leading-relaxed">{turn.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

