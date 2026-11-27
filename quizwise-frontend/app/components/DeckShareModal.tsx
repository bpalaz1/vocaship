"use client";

import React, { useState, useEffect } from "react";
import { Share2, Copy, Check, Link2, X, ShieldCheck } from "lucide-react";

export interface ShareableDeck {
  id: string;
  title: string;
  card_count?: number;
}

interface DeckShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: ShareableDeck | null;
}

export default function DeckShareModal({
  isOpen,
  onClose,
  deck,
}: DeckShareModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    setCopiedCode(false);
    setCopiedLink(false);
  }, [isOpen, deck?.id]);

  if (!isOpen || !deck) return null;

  const shareCode = `VS-${deck.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const shareLink = origin
    ? `${origin}/?importDeck=${encodeURIComponent(deck.id)}`
    : `/?importDeck=${encodeURIComponent(deck.id)}`;

  const copyText = async (text: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    if (kind === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-5"
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
        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white">Desteyi Paylaş</h3>
            <p className="text-xs text-slate-400 truncate">
              {deck.title}
              {typeof deck.card_count === "number" ? ` • ${deck.card_count} Kelime` : ""}
            </p>
          </div>
        </div>

        {/* 1. 6 Haneli Paylaşım Kodu */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            6 Haneli Paylaşım Kodu
          </label>
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="flex-1 text-center font-mono text-lg font-black tracking-widest text-indigo-300 select-all">
              {shareCode}
            </span>
            <button
              type="button"
              onClick={() => copyText(shareCode, "code")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0 ${
                copiedCode
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Doğrudan Paylaşım Bağlantısı */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Doğrudan Paylaşım Bağlantısı
          </label>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950 border border-slate-800">
            <Link2 className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
            <input
              type="text"
              readOnly
              value={shareLink}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 bg-transparent text-xs text-slate-300 font-mono focus:outline-none truncate"
            />
            <button
              type="button"
              onClick={() => copyText(shareLink, "link")}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0 ${
                copiedLink
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Linki Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Güvenlik / Orijinal Koruma Bilgi Notu */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-200/90 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            Bu kodu veya linki alan kişiler kelimeleri kendi hesaplarına kopyalayabilir; senin orijinal desten değişmez.
          </p>
        </div>
      </div>
    </div>
  );
}
