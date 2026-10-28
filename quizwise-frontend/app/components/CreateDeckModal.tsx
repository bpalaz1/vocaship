"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";

export interface FolderOption {
  id: string;
  name: string;
}

export interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newDescription: string;
  setNewDescription: (val: string) => void;
  newDeckFolderId: string;
  setNewDeckFolderId: (val: string) => void;
  folders: FolderOption[];
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreateDeckModal({
  isOpen,
  onClose,
  newTitle,
  setNewTitle,
  newDescription,
  setNewDescription,
  newDeckFolderId,
  setNewDeckFolderId,
  folders,
  onSubmit,
}: CreateDeckModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">
          {t("modal_create_deck_title", "Yeni Deste Oluştur")}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t("label_deck_title_input", "Deste Başlığı *")}
            </label>
            <input
              type="text"
              required
              placeholder={t("placeholder_deck_title", "Örn: B2 Akademik Kelimeler")}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t("label_deck_desc_input", "Açıklama")}
            </label>
            <textarea
              rows={2}
              placeholder={t("placeholder_deck_desc", "Destenin içeriği hakkında kısa bilgi...")}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t("label_folder_optional", "Klasör (İsteğe Bağlı)")}
            </label>
            <select
              value={newDeckFolderId}
              onChange={(e) => setNewDeckFolderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            >
              <option value="">{t("option_no_folder", "Klasörsüz (Genel)")}</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              {t("btn_create_submit", "Oluştur")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
