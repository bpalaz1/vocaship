"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, Share2, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    itemType: "story" | "deck";
    itemId?: string;
    deck?: any;
    cards?: any[];
    story?: any;
    data?: any;
}

export default function ShareModal({
    isOpen,
    onClose,
    title,
    itemType,
    itemId,
    deck,
    cards,
    story,
    data,
}: ShareModalProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [shareData, setShareData] = useState<{ pin: string; share_url: string } | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedPin, setCopiedPin] = useState(false);
    const [autoCopiedNotice, setAutoCopiedNotice] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setShareData(null);
            setCopiedLink(false);
            setCopiedPin(false);
            setAutoCopiedNotice(false);
            return;
        }

        let isMounted = true;

        async function createCode() {
            setLoading(true);
            try {
                const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

                const payload = {
                    item_type: itemType,
                    item_id: itemId || deck?.id || story?.id || "",
                    title: title || deck?.title || story?.title || "Paylaşılan İçerik",
                    deck: deck || null,
                    cards: cards || null,
                    story: story || null,
                    data: data || null,
                };

                const res = await fetch("http://localhost:8000/api/v1/share/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (res.ok && isMounted) {
                    const json = await res.json();
                    const liveShareUrl = `${origin}/?join=${json.pin}`;
                    setShareData({
                        pin: json.pin,
                        share_url: liveShareUrl,
                    });

                    // Panoya otomatik kopyalama (Copy to clipboard on generate)
                    if (navigator.clipboard) {
                        try {
                            await navigator.clipboard.writeText(liveShareUrl);
                            setAutoCopiedNotice(true);
                            setTimeout(() => {
                                if (isMounted) setAutoCopiedNotice(false);
                            }, 3500);
                        } catch (err) {
                            console.warn("Otomatik kopyalama engellendi:", err);
                        }
                    }
                }
            } catch (err) {
                console.error("Paylaşım linki oluşturulurken hata:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        createCode();

        return () => {
            isMounted = false;
        };
    }, [isOpen, itemId, itemType, title, deck, cards, story]);

    if (!isOpen) return null;

    const copyShareUrl = () => {
        if (!shareData) return;
        navigator.clipboard.writeText(shareData.share_url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const copyPinOnly = () => {
        if (!shareData) return;
        navigator.clipboard.writeText(shareData.pin);
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200"
            >
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    title="Kapat"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3.5 pr-8">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl shrink-0">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-white">{t("modal_share_title", "Sınıfla Paylaş")}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                                {itemType === "deck" ? t("tab_flashcards", "Kelime Destesi") : t("badge_reading_story", "OKUMA HİKAYESİ")}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{title}</p>
                    </div>
                </div>

                {autoCopiedNotice && (
                    <div className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in slide-in-from-top-2 duration-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">{t("link_copied_toast", "Bağlantı panoya kopyalandı! Öğrencilerinizle hemen paylaşabilirsiniz.")}</span>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-10 space-y-3">
                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-slate-400">{t("generating_share_code", "Benzersiz katılım kodu ve bağlantı üretiliyor...")}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* 6 Haneli Katılım PIN Kodu */}
                        <div className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl text-center relative group">
                            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                                {t("code_board_title", "AKILLI TAHTA & ÖĞRENCİ KATILIM KODU")}
                            </span>
                            <div className="flex items-center justify-center gap-3 my-2">
                                <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">
                                    {shareData?.pin || "QW-...."}
                                </span>
                                <button
                                    onClick={copyPinOnly}
                                    title={t("btn_copy_code_only", "Sadece Kodu Kopyala")}
                                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-white transition"
                                >
                                    {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                {t("code_board_desc", "Öğrenciler ana sayfadaki \"Kod ile Katıl\" butonuna bu 6 haneli kodu yazarak anında içeriğe ulaşabilir.")}
                            </p>
                        </div>

                        {/* Doğrudan Paylaşım Linki */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-slate-300 font-bold flex items-center justify-between">
                                <span>{t("label_direct_link", "Doğrudan Kopyalanabilir Bağlantı:")}</span>
                                {copiedLink && <span className="text-emerald-400 text-[11px] font-semibold">{t("copied_toast", "Panoya Kopyalandı!")}</span>}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareData?.share_url || ""}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono select-all outline-none"
                                />
                                <button
                                    onClick={copyShareUrl}
                                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer"
                                >
                                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                                    <span>{copiedLink ? t("copied", "Kopyalandı!") : t("btn_copy", "Kopyala")}</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-start gap-2.5">
                            <Users className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                            <span>
                                {t("share_reading_hint", "Bu linke tıklayan öğrenciler doğrudan bu desteyi ve okuma odasındaki hikayeyi otomatik olarak açacaktır.")}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
