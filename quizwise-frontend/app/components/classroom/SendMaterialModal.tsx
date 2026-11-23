"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, X, Download } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface SendMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  teacherId: string;
}

export default function SendMaterialModal({
  isOpen,
  onClose,
  classId,
  className,
  teacherId,
}: SendMaterialModalProps) {
  const { t } = useLanguage();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ sentCount: number } | null>(null);

  if (!isOpen) return null;

  const handleDownloadNote = () => {
    const title = subject.trim() || "ders-notu";
    const body = message.trim();
    const content = `Sınıf: ${className}\nKonu: ${title}\n\n${body}\n`;
    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      const lastSnap = sessionStorage.getItem("vocaship_last_board_snapshot");
      if (lastSnap) {
        const imgLink = document.createElement("a");
        imgLink.href = lastSnap;
        imgLink.download = "vocaship-board-snapshot.png";
        imgLink.click();
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg(t("cls_mat_err_subject", "Lütfen bir konu veya başlık girin."));
      return;
    }
    if (!message.trim()) {
      setErrorMsg(t("cls_mat_err_msg", "Lütfen öğrenci mesajı veya ödev notu girin."));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${apiUrl}/api/v1/classroom/send-material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacherId,
          class_id: classId,
          subject: subject.trim(),
          message_body: message.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Materyal gönderilirken bir hata oluştu.");
      }

      const data = await res.json();
      setSuccessInfo({ sentCount: data.sent_count ?? 0 });
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t("cls_mat_title", "Manuel Materyal & Not Gönder")}</h3>
            <p className="text-xs text-slate-400">
              {t("cls_mat_class_lbl", "Sınıf:")} <span className="text-indigo-400 font-medium">{className}</span>
            </p>
          </div>
        </div>

        {successInfo ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white">{t("cls_mat_sent_title", "Materyal Başarıyla Gönderildi!")}</h4>
              <p className="text-sm text-slate-300 mt-1">
                {t("cls_mat_sent_desc", "Bu sınıfa kayıtlı {count} öğrenciye e-posta ve bildirim ulaştırıldı.", { count: successInfo.sentCount })}
              </p>
            </div>
            <button
              onClick={() => {
                setSuccessInfo(null);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition"
            >
              {t("close", "Kapat")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("cls_mat_subject_lbl", "Konu / Başlık")} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("cls_mat_subject_ph", "Örn: Hafta 3 Ders Notları ve Okuma Parçası")}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message / Note <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("cls_mat_msg_ph", "Öğrencilerinize iletmek istediğiniz açıklama, ödev veya çalışma yönergeleri...")}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleDownloadNote}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>📥 Notu İndir</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("cls_mat_sending", "Gönderiliyor...")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t("cls_mat_send_btn", "📧 Sınıf Öğrencilerine Gönder")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

