"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";

export interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  setFolderName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  folderName,
  setFolderName,
  onSubmit,
}: CreateFolderModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">
          {t("modal_new_folder_title", "Yeni Klasör Aç")}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t("label_folder_name", "Klasör Adı *")}
            </label>
            <input
              type="text"
              required
              placeholder={t("placeholder_folder_name", "Örn: YDS Hazırlık, Almanca A1")}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              {t("btn_cancel", "İptal")}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 rounded-xl text-slate-950 font-bold text-xs shadow-md shadow-amber-500/30 transition cursor-pointer"
            >
              {t("btn_create_folder", "Klasör Oluştur")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
