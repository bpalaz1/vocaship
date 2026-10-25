"use client";

import React, { useState } from "react";
import { X, ArrowRight, Loader2, KeyRound, AlertCircle, Sparkles } from "lucide-react";

interface JoinCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoinSuccess: (shareData: any) => void;
}

export default function JoinCodeModal({ isOpen, onClose, onJoinSuccess }: JoinCodeModalProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        let val = e.target.value.toUpperCase();
        // If user enters 4 digits without prefix, we can let them type freely or auto-prefix
        setCode(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) {
            setError("Lütfen 6 haneli katılım kodunu girin.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`http://localhost:8000/api/v1/share/${encodeURIComponent(trimmed)}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Geçersiz veya süresi dolmuş katılım kodu.");
            }

            const data = await res.json();
            onJoinSuccess(data);
            setCode("");
            onClose();
        } catch (err: any) {
            setError(err.message || "Bağlantı sağlanamadı. Lütfen kodu kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200"
            >
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    title="Kapat"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3.5 pr-8">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl shrink-0">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white">Kod ile Katıl</h3>
                        <p className="text-xs text-slate-400">Öğretmeninizden aldığınız 6 haneli kodu yazın</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 block">
                            Katılım PIN Kodu
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                autoFocus
                                maxLength={10}
                                placeholder="Örn: QW-8492 veya 8492"
                                value={code}
                                onChange={handleCodeChange}
                                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-center font-mono text-xl sm:text-2xl font-bold tracking-widest text-white placeholder-slate-600 outline-none transition uppercase selection:bg-emerald-500 selection:text-slate-950"
                            />
                        </div>
                        <p className="text-[11px] text-slate-500 text-center">
                            "QW-" yazmadan yalnızca 4 haneli numarayı da girebilirsiniz.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-in fade-in duration-150">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !code.trim()}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>İçerik Yükleniyor...</span>
                            </>
                        ) : (
                            <>
                                <span>İçeriğe Katıl</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                        Kod doğrulandığında deste, kelime kartları ve okuma odasındaki hikaye anında ekranınızda açılacaktır.
                    </span>
                </div>
            </div>
        </div>
    );
}
