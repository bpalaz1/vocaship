"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Paperclip,
  Rocket,
  Loader2,
  BookOpen,
} from "lucide-react";
import { API_BASE } from "../../config";
import { getAuthToken } from "../../context/AuthContext";

export interface SharedMaterialPayload {
  materialId: string;
  title: string;
  note: string;
  filename: string | null;
  downloadUrl: string | null;
  sentAt: string;
}

export interface SharedDeckPayload {
  deckId: string;
  shareCode: string;
  title: string;
  cardCount: number;
  note: string;
  sentAt: string;
}

interface TeacherDeckOption {
  id: string;
  title: string;
  description?: string;
  card_count?: number;
}

interface SendMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  teacherId: string;
  activeBoardPdfName?: string | null;
  onMaterialShared?: (payload: SharedMaterialPayload) => void;
  onDeckShared?: (payload: SharedDeckPayload) => void;
}

export default function SendMaterialModal({
  isOpen,
  onClose,
  classId,
  className,
  activeBoardPdfName,
  onMaterialShared,
  onDeckShared,
}: SendMaterialModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasBoardPdf = Boolean(activeBoardPdfName);

  const [activeTab, setActiveTab] = useState<"file" | "deck">("file");

  // 1. PDF / Dosya Sekmesi State
  const [sourceMode, setSourceMode] = useState<"board_pdf" | "upload" | "note_only">(
    hasBoardPdf ? "board_pdf" : "upload"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Kelime Destesi Sekmesi State
  const [teacherDecks, setTeacherDecks] = useState<TeacherDeckOption[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [deckNote, setDeckNote] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("file");
      setSourceMode(activeBoardPdfName ? "board_pdf" : "upload");
      setSelectedFile(null);
      setTitle("");
      setNote("");
      setDeckNote("");
      setErrorMsg(null);
      setSentSuccess(null);
    }
  }, [isOpen, activeBoardPdfName]);

  // 📚 Kelime Destesi sekmesi açıldığında eğitmenin kendi destelerini yükle
  useEffect(() => {
    if (!isOpen || activeTab !== "deck") return;
    let active = true;
    const loadDecks = async () => {
      setIsLoadingDecks(true);
      setErrorMsg(null);
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/api/v1/decks`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          throw new Error("Desteleriniz yüklenemedi. Lütfen tekrar giriş yapın.");
        }
        const data = await res.json();
        if (!active) return;
        const list: TeacherDeckOption[] = Array.isArray(data)
          ? data.filter((d: any) => d?.id && !String(d.id).startsWith("preset_"))
          : [];
        setTeacherDecks(list);
        if (list.length > 0 && !selectedDeckId) {
          setSelectedDeckId(list[0].id);
        }
      } catch (err: any) {
        if (active) {
          setErrorMsg(err?.message || "Kelime desteleri alınamadı.");
        }
      } finally {
        if (active) setIsLoadingDecks(false);
      }
    };
    loadDecks();
    return () => {
      active = false;
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSubmitFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (sourceMode === "upload" && !selectedFile && !note.trim() && !title.trim()) {
      setErrorMsg("Lütfen cihazınızdan bir dosya seçin veya kısa bir ders notu yazın.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("note", note.trim());

      if (sourceMode === "board_pdf" && hasBoardPdf) {
        formData.append("use_active_board_pdf", "true");
      } else if (sourceMode === "upload" && selectedFile) {
        formData.append("file", selectedFile);
        formData.append("use_active_board_pdf", "false");
      } else {
        formData.append("use_active_board_pdf", "false");
      }

      const normClassId = (classId || "").trim().toLowerCase();
      const res = await fetch(
        `${API_BASE}/api/v1/classroom/classes/${encodeURIComponent(normClassId)}/materials`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Materyal paylaşılırken bir hata oluştu.");
      }

      const data = await res.json();
      const sharedPayload: SharedMaterialPayload = {
        materialId: data.material_id,
        title: data.title || title.trim() || "Ders Materyali",
        note: data.note || note.trim(),
        filename: data.filename || null,
        downloadUrl: data.download_url || null,
        sentAt: data.sent_at || new Date().toISOString(),
      };

      onMaterialShared?.(sharedPayload);
      setSentSuccess("Materyal sınıftaki tüm öğrencilere anlık olarak gönderildi!");
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err?.message || "Materyal gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDeck = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const chosen = teacherDecks.find((d) => d.id === selectedDeckId);
    if (!chosen) {
      setErrorMsg("Lütfen göndermek istediğiniz kelime destesini seçin.");
      return;
    }

    const shareCode = `VS-${chosen.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
    const payload: SharedDeckPayload = {
      deckId: chosen.id,
      shareCode,
      title: chosen.title,
      cardCount: chosen.card_count || 0,
      note: deckNote.trim(),
      sentAt: new Date().toISOString(),
    };

    onDeckShared?.(payload);
    setSentSuccess(`"${chosen.title}" destesi canlı sınıfa anlık olarak gönderildi!`);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] flex flex-col"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pr-8 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Canlı Derse Materyal Paylaş
            </h3>
            <p className="text-xs text-slate-400">
              Sınıf: <span className="text-indigo-300 font-semibold">{className}</span>
            </p>
          </div>
        </div>

        {/* Üst Sekmeler: PDF / Dosya & Kelime Destesi */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("file");
              setErrorMsg(null);
              setSentSuccess(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "file"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 PDF / Dosya</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("deck");
              setErrorMsg(null);
              setSentSuccess(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "deck"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📚 Kelime Destesi</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            if (f) {
              setSelectedFile(f);
              setSourceMode("upload");
              if (!title.trim()) {
                setTitle(f.name.replace(/\.[^.]+$/, ""));
              }
            }
          }}
        />

        {activeTab === "file" ? (
          <form onSubmit={handleSubmitFile} className="space-y-4 overflow-y-auto pr-0.5">
            {/* 1. Kaynak Seçimi (Harici URL alanı yok!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {hasBoardPdf && (
                <button
                  type="button"
                  onClick={() => {
                    setSourceMode("board_pdf");
                    setSelectedFile(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                    sourceMode === "board_pdf"
                      ? "bg-indigo-600/20 border-indigo-400 text-white ring-2 ring-indigo-500/30"
                      : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold">📄 Açık Olan Tahta PDF&apos;ini Gönder</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {activeBoardPdfName}
                    </div>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSourceMode("upload");
                  fileInputRef.current?.click();
                }}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  !hasBoardPdf ? "sm:col-span-2" : ""
                } ${
                  sourceMode === "upload"
                    ? "bg-indigo-600/20 border-indigo-400 text-white ring-2 ring-indigo-500/30"
                    : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <Paperclip className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-bold">📎 Cihazdan Dosya Seç</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {selectedFile ? selectedFile.name : "PDF, DOCX, PNG veya TXT seçin"}
                  </div>
                </div>
              </button>
            </div>

            {/* 2. İsteğe Bağlı Kısa Başlık & Ders Notu */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kısa Başlık (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Hafta 3 Okuma Metni & Alıştırmalar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ders Notu (İsteğe Bağlı)
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Öğrencilere anlık düşecek kısa açıklama veya ödev notu..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {sentSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{sentSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting || Boolean(sentSuccess)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>🚀 Derse Gönder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitDeck} className="space-y-4 overflow-y-auto pr-0.5 flex-1 min-h-0 flex flex-col">
            <div className="space-y-2 flex-1 min-h-0 flex flex-col">
              <label className="block text-xs font-semibold text-slate-300 shrink-0">
                Paylaşılacak Kelime Destesini Seçin
              </label>

              {isLoadingDecks ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>Kelime desteleriniz yükleniyor...</span>
                </div>
              ) : teacherDecks.length === 0 ? (
                <div className="p-5 rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 text-center text-xs text-slate-400">
                  Henüz paylaşabileceğiniz bir kelime desteniz bulunmuyor. Ana sayfadan yeni bir deste oluşturabilirsiniz.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {teacherDecks.map((d) => {
                    const isSelected = selectedDeckId === d.id;
                    const code = `VS-${d.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDeckId(d.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-400 text-white ring-2 ring-indigo-500/30"
                            : "bg-slate-950/75 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-300 shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{d.title}</div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {code}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono font-bold text-emerald-300 shrink-0">
                          {d.card_count || 0} Kelime
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kısa Ders Notu (İsteğe Bağlı)
              </label>
              <textarea
                rows={2}
                value={deckNote}
                onChange={(e) => setDeckNote(e.target.value)}
                placeholder="Örn: Haftaya kadar bu 20 kelimeyi SM-2 ile tekrar edelim..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 font-medium shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {sentSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs text-emerald-300 font-semibold shrink-0">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{sentSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={!selectedDeckId || Boolean(sentSuccess)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95"
              >
                <Rocket className="w-4 h-4" />
                <span>🚀 Desteyi Derse Gönder</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
