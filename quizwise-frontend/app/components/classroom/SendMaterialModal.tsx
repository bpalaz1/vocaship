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
} from "lucide-react";
import { API_BASE } from "../../config";

export interface SharedMaterialPayload {
  materialId: string;
  title: string;
  note: string;
  filename: string | null;
  downloadUrl: string | null;
  sentAt: string;
}

interface SendMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  teacherId: string;
  activeBoardPdfName?: string | null;
  onMaterialShared?: (payload: SharedMaterialPayload) => void;
}

export default function SendMaterialModal({
  isOpen,
  onClose,
  classId,
  className,
  activeBoardPdfName,
  onMaterialShared,
}: SendMaterialModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasBoardPdf = Boolean(activeBoardPdfName);

  const [sourceMode, setSourceMode] = useState<"board_pdf" | "upload" | "note_only">(
    hasBoardPdf ? "board_pdf" : "upload"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSourceMode(activeBoardPdfName ? "board_pdf" : "upload");
      setSelectedFile(null);
      setTitle("");
      setNote("");
      setErrorMsg(null);
      setSentSuccess(false);
    }
  }, [isOpen, activeBoardPdfName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err?.message || "Materyal gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <span>Materyal sınıftaki tüm öğrencilere anlık olarak gönderildi!</span>
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
              disabled={isSubmitting || sentSuccess}
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
      </div>
    </div>
  );
}
