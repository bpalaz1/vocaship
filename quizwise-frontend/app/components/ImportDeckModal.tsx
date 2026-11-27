"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Search,
  BookOpen,
  Folder,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  LogIn,
} from "lucide-react";
import { API_BASE } from "../config";
import { useAuth, getAuthToken } from "../context/AuthContext";

interface PreviewWord {
  id?: string;
  word?: string;
  phonetic?: string;
  meanings?: Array<{
    translation?: string;
    definition?: string;
    meaning?: string;
    tr?: string;
  }>;
}

interface SharedDeckPreview {
  id: string;
  share_code: string;
  title: string;
  description?: string;
  card_count: number;
  preview_words: PreviewWord[];
}

interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  folders: Array<{ id: string; name: string }>;
  onImported: () => Promise<void> | void;
}

export const PENDING_IMPORT_DECK_KEY = "vocaship_pending_import_deck";

function extractCodeInput(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  try {
    if (trimmed.includes("importDeck=")) {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://vocaship.app/${trimmed.replace(/^\/+/, "")}`);
      const param = url.searchParams.get("importDeck");
      if (param) return param.trim();
    }
  } catch {}
  return trimmed;
}

function getWordMeaningPreview(item: PreviewWord): string {
  if (!Array.isArray(item.meanings) || item.meanings.length === 0) return "";
  const first = item.meanings[0];
  if (!first || typeof first !== "object") return "";
  return String(
    first.translation || first.meaning || first.tr || first.definition || ""
  ).trim();
}

export default function ImportDeckModal({
  isOpen,
  onClose,
  initialCode = "",
  folders,
  onImported,
}: ImportDeckModalProps) {
  const { user, openAuthModal } = useAuth();
  const [codeInput, setCodeInput] = useState(initialCode);
  const [preview, setPreview] = useState<SharedDeckPreview | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isRetryingClone, setIsRetryingClone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [clonedSuccess, setClonedSuccess] = useState(false);

  const lookupSharedDeck = useCallback(async (rawInput: string) => {
    const cleaned = extractCodeInput(rawInput);
    if (!cleaned) {
      setErrorMsg("Lütfen 6 haneli paylaşım kodunu (örn. VS-A1B2C3) veya linki girin.");
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);
    setClonedSuccess(false);
    try {
      const url = `${API_BASE}/api/v1/decks/shared/${encodeURIComponent(cleaned)}`;
      let res: Response;
      try {
        res = await fetch(url);
      } catch {
        // Sunucu uyku modundan uyanıyorsa 2 sn bekleyip 1 kez yeniden dene
        await new Promise((r) => setTimeout(r, 2000));
        res = await fetch(url);
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setPreview(null);
        setErrorMsg(
          err.detail || "Bu koda ait bir deste bulunamadı. Kodu kontrol edip tekrar deneyin."
        );
        return;
      }
      const data: SharedDeckPreview = await res.json();
      setPreview(data);
    } catch {
      setPreview(null);
      setErrorMsg("Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setClonedSuccess(false);
    setIsRetryingClone(false);
    if (folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(String(folders[0].id || "").trim());
    }
    if (initialCode && initialCode.trim()) {
      setCodeInput(initialCode.trim());
      lookupSharedDeck(initialCode.trim());
    } else {
      setCodeInput("");
      setPreview(null);
    }
  }, [isOpen, initialCode, lookupSharedDeck]);

  if (!isOpen) return null;

  const handleFindSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupSharedDeck(codeInput);
  };

  const handleClone = async () => {
    if (!preview || isCloning) return;
    const token = getAuthToken();

    if (!user || !token) {
      // Giriş sonrası importDeck parametresini koru
      try {
        sessionStorage.setItem(PENDING_IMPORT_DECK_KEY, preview.id);
        if (typeof window !== "undefined") {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set("importDeck", preview.id);
          window.history.replaceState({}, "", nextUrl.toString());
        }
      } catch {}
      openAuthModal("login");
      return;
    }

    setIsCloning(true);
    setIsRetryingClone(false);
    setErrorMsg(null);

    const cloneUrl = `${API_BASE}/api/v1/decks/shared/${encodeURIComponent(preview.id)}/clone`;
    const requestInit: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        folder_id: selectedFolderId.trim() || null,
      }),
    };

    try {
      let res: Response;
      try {
        res = await fetch(cloneUrl, requestInit);
      } catch (firstErr: any) {
        // Ağ hatası / Failed to fetch (sunucu uyanıyorsa) -> 2 sn bekleyip 1 kez otomatik yeniden dene
        setIsRetryingClone(true);
        await new Promise((r) => setTimeout(r, 2000));
        try {
          res = await fetch(cloneUrl, requestInit);
        } catch {
          throw new Error(
            "Sunucu yanıt vermiyor (ağ bağlantısı kurulamadı). Lütfen birkaç saniye sonra tekrar deneyin."
          );
        } finally {
          setIsRetryingClone(false);
        }
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.detail || `Deste kütüphanenize kopyalanamadı (Hata: ${res.status}).`
        );
      }

      try {
        sessionStorage.removeItem(PENDING_IMPORT_DECK_KEY);
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          if (url.searchParams.has("importDeck")) {
            url.searchParams.delete("importDeck");
            window.history.replaceState(
              {},
              "",
              url.pathname + (url.search ? url.search : "") + url.hash
            );
          }
        }
      } catch {}

      setClonedSuccess(true);
      await onImported();
      setTimeout(() => {
        onClose();
      }, 650);
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.toLowerCase().includes("failed to fetch")) {
        setErrorMsg(
          "Sunucuya ulaşılamadı (Failed to fetch). Lütfen bağlantınızı kontrol edip birkaç saniye sonra tekrar deneyin."
        );
      } else {
        setErrorMsg(msg || "Kopyalama sırasında bir hata oluştu.");
      }
    } finally {
      setIsRetryingClone(false);
      setIsCloning(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] flex flex-col"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Başlık */}
        <div className="flex items-center gap-3 pr-8 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Kodla Deste Al</h3>
            <p className="text-xs text-slate-400">
              Paylaşım kodunu (örn. VS-A1B2C3) veya deste linkini girerek kütüphanene kopyala.
            </p>
          </div>
        </div>

        {/* Kod Arama Formu */}
        <form onSubmit={handleFindSubmit} className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="VS-A1B2C3 veya paylaşım linki..."
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSearching || !codeInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Desteyi Bul</span>
          </button>
        </form>

        {/* Hata */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-300 font-medium shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Önizleme Alanı */}
        {preview && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-0">
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/35 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white truncate">
                      {preview.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {preview.share_code}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-300 font-semibold">
                        {preview.card_count} Kelime
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {preview.description && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  {preview.description}
                </p>
              )}

              {/* İlk Kelimeler Önizlemesi */}
              {preview.preview_words.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Önizleme ({Math.min(preview.preview_words.length, 8)} / {preview.card_count})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.preview_words.slice(0, 8).map((w, idx) => {
                      const meaning = getWordMeaningPreview(w);
                      return (
                        <span
                          key={w.id || `${w.word}-${idx}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 max-w-full truncate"
                        >
                          <strong className="text-white">{w.word}</strong>
                          {meaning ? (
                            <span className="text-slate-400"> • {meaning}</span>
                          ) : null}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Hedef Klasör Seçici */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Hedef Klasör (İsteğe Bağlı)</span>
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="">📚 Klasörsüz (Ana Kütüphane)</option>
                {folders.map((f) => {
                  const fid = String(f.id || "").trim();
                  return (
                    <option key={fid} value={fid}>
                      📁 {f.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {clonedSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Deste bağımsız bir kopya olarak kütüphanene eklendi!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isCloning}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleClone}
                disabled={isCloning || clonedSuccess}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95"
              >
                {isCloning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {isRetryingClone ? "Yeniden deneniyor..." : "Kopyalanıyor..."}
                    </span>
                  </>
                ) : !user ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Giriş Yap &amp; Kopyala</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>+ Kütüphaneme Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
