"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Archive,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Award,
  BookOpen,
  MessageSquare,
  Bot,
  User,
  Zap,
} from "lucide-react";
import {
  SpeakingArchiveItem,
  getSpeakingArchives,
} from "../../actions/speakingArchive";

export interface SpeakingArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSelectArchiveForReplay?: (archive: SpeakingArchiveItem) => void;
}

export default function SpeakingArchiveModal({
  isOpen,
  onClose,
  userId,
}: SpeakingArchiveModalProps) {
  const [archives, setArchives] = useState<SpeakingArchiveItem[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<SpeakingArchiveItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchList() {
      try {
        setLoading(true);
        setError(null);
        const list = await getSpeakingArchives(userId);
        setArchives(list);
        if (list.length > 0) {
          setSelectedArchive(list[0]);
        } else {
          setSelectedArchive(null);
        }
      } catch (err: any) {
        console.error("Arşivler yüklenemedi:", err);
        setError("Arşiv geçmişi yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    }

    fetchList();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      data-testid="speaking-archive-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        data-testid="speaking-archive-modal"
        className="w-full max-w-5xl h-[85vh] max-h-[820px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* =================================================================== */}
        {/* MODAL HEADER                                                        */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  🗂️ Konuşma Arşivim
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {archives.length} Oturum
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Geçmiş pratik diyaloglarınızı, karnelerinizi ve gelişim skorlarınızı inceleyin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =================================================================== */}
        {/* MODAL BODY (SPLIT VIEW)                                             */}
        {/* =================================================================== */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* 1. SOL PANEL: GEÇMİŞ OTURUMLAR LİSTESİ */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col min-h-0 bg-slate-950/40">
            <div className="p-3 border-b border-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Geçmiş Pratikler</span>
              <span className="text-[10px] text-slate-500 font-mono">Tarihe Göre</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
                  <p>Arşivler yükleniyor...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-xs text-rose-400 bg-rose-950/20 rounded-xl border border-rose-500/30">
                  {error}
                </div>
              ) : archives.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-semibold text-slate-300">Henüz arşivlenmiş oturum yok</p>
                  <p className="text-[11px]">
                    Speaking Lounge'da konuşma yaptıktan sonra <b>[ 🏁 Pratiği Bitir & Kaydet ]</b> butonuna basarak kaydedebilirsiniz.
                  </p>
                </div>
              ) : (
                archives.map((item) => {
                  const isSelected = selectedArchive?.id === item.id;
                  const metrics = item.metrics || ({} as any);
                  const score = metrics.overall_score || metrics.fluency || 85;
                  const level = metrics.level || "B2";

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedArchive(item)}
                      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40"
                          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-white truncate flex-1">
                          {item.session_title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                          {score} / 100 • {level}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(item.created_at)}</span>
                        </span>
                        <span className="text-slate-500">
                          {item.transcript?.length || 0} Mesaj
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. SAĞ PANEL: SEÇİLİ OTURUMUN DETAYI VE TRANSKRİPT AKIŞI */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50">
            {selectedArchive ? (
              <>
                {/* Oturum Başlık & Skor Özet Barı */}
                <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40 shrink-0 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                        <span>{selectedArchive.session_title}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatDate(selectedArchive.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>+{selectedArchive.xp_awarded || 30} XP Kazanıldı</span>
                    </div>
                  </div>

                  {/* 4'lü Metrik Kartları */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Akıcılık</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        %{selectedArchive.metrics?.fluency || 85}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Kelime/Jargon</span>
                      <span className="text-sm font-extrabold text-indigo-400 font-mono">
                        %{selectedArchive.metrics?.vocabulary || 80}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Gramer</span>
                      <span className="text-sm font-extrabold text-teal-400 font-mono">
                        %{selectedArchive.metrics?.grammar || 90}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Genel Puan</span>
                      <span className="text-sm font-extrabold text-amber-400 font-mono">
                        {selectedArchive.metrics?.overall_score || selectedArchive.metrics?.fluency || 88}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Salt Okunur Diyalog Balonları Akışı */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                  {selectedArchive.transcript && selectedArchive.transcript.length > 0 ? (
                    selectedArchive.transcript.map((turn, idx) => {
                      const isUser = turn.sender === "user";

                      return isUser ? (
                        // Kullanıcı Balonu (Sağa Yaslı, Indigo)
                        <div key={idx} className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] ml-auto space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 pr-1">
                            <span className="font-bold text-indigo-300">Sen</span>
                            {turn.timestamp && <span>• {turn.timestamp}</span>}
                          </div>
                          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md text-xs sm:text-sm leading-relaxed font-medium">
                            {turn.text.replace(/^User:\s*/i, "")}
                          </div>
                        </div>
                      ) : (
                        // AI Mentor Balonu (Sola Yaslı, Koyu Slate)
                        <div key={idx} className="flex flex-col items-start max-w-[85%] sm:max-w-[75%] mr-auto space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 pl-1">
                            <span className="font-bold text-emerald-400">AI Mentor</span>
                            {turn.timestamp && <span>• {turn.timestamp}</span>}
                          </div>
                          <div className="bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-2xl rounded-tl-none p-4 shadow-md text-xs sm:text-sm leading-relaxed font-medium">
                            <p>{turn.text.replace(/^AI Mentor:\s*/i, "")}</p>

                            {/* Varsa Alınan Alternatif Cümle */}
                            {turn.feedback?.better_alternative && (
                              <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded-xl">
                                <span className="font-bold text-emerald-400">💡 Daha Doğal Alternatif: </span>
                                <span>{turn.feedback.better_alternative}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Bu oturum için kayıtlı transkript metni bulunamadı.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <Archive className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">İncelemek istediğiniz bir oturumu seçin</p>
                <p className="text-xs max-w-sm">
                  Sol paneldeki pratik geçmişinizden bir seans seçerek konuşma dökümünü ve detaylı karne puanlarınızı görüntüleyin.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* MODAL FOOTER                                                        */}
        {/* =================================================================== */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Sıfır Depolama Maliyeti • Güvenli JSON Arşivi</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

