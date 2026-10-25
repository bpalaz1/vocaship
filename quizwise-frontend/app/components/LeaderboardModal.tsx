"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Flame, Zap, X, Crown, Medal, Sparkles, RefreshCw, ChevronUp, UserCheck } from "lucide-react";
import { API_BASE } from "../config";

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    name: string;
    avatar: string;
    total_xp: number;
    level: number;
    title: string;
    badge: string;
    streak_days: number;
    is_current_user: boolean;
}

export interface LeaderboardResponse {
    timeframe: string;
    current_user_rank: number;
    total_participants: number;
    entries: LeaderboardEntry[];
}

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
    const [timeframe, setTimeframe] = useState<"weekly" | "all_time">("weekly");
    const [data, setData] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchLeaderboard = async (tf: "weekly" | "all_time") => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/gamification/leaderboard?timeframe=${tf}`);
            if (res.ok) {
                const json: LeaderboardResponse = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("Liderlik tablosu yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLeaderboard(timeframe);
        }
    }, [isOpen, timeframe]);

    if (!isOpen) return null;

    const entries = data?.entries || [];
    const top1 = entries[0];
    const top2 = entries[1];
    const top3 = entries[2];
    const remainingEntries = entries.slice(3);
    const currentUser = entries.find((e) => e.is_current_user);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 select-none"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative"
            >
                {/* 1. Üst Başlık & Sekmeler */}
                <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 bg-gradient-to-b from-slate-850/80 to-transparent">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-md">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                    <span>Liderlik Sıralaması</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Kelime çalış, hikaye oku ve puan toplayarak zirveye çık!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => fetchLeaderboard(timeframe)}
                                disabled={loading}
                                title="Yenile"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Zaman Aralığı Sekmeleri */}
                    <div className="flex items-center justify-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 mt-4">
                        <button
                            onClick={() => setTimeframe("weekly")}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                                timeframe === "weekly"
                                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.01]"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span>Bu Hafta (Haftalık)</span>
                        </button>
                        <button
                            onClick={() => setTimeframe("all_time")}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                                timeframe === "all_time"
                                    ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-600/30 scale-[1.01]"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <Crown className="w-4 h-4 text-yellow-300" />
                            <span>Tüm Zamanlar</span>
                        </button>
                    </div>
                </div>

                {/* 2. Modal Gövdesi */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {loading && !data ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-3">
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                            <p className="text-xs text-slate-400 font-medium">Sıralama verileri yükleniyor...</p>
                        </div>
                    ) : (
                        <>
                            {/* Podyum Alanı (İlk 3 Yarışmacı) */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-5 pb-2 px-1">
                                {/* 2. Sıra (Gümüş 🥈) */}
                                {top2 && (
                                    <div
                                        className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                                            top2.is_current_user
                                                ? "bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-500/20"
                                                : "bg-slate-900/80 border-slate-800"
                                        }`}
                                    >
                                        <div className="relative mb-2">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-500 border-2 border-slate-300 flex items-center justify-center text-2xl shadow-md">
                                                {top2.avatar}
                                            </div>
                                            <div className="absolute -bottom-2 -right-1 px-2 py-0.5 bg-slate-300 text-slate-950 rounded-full font-black text-[11px] shadow">
                                                2.
                                            </div>
                                        </div>
                                        <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-full">
                                            {top2.name}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-full">
                                            {top2.title}
                                        </span>
                                        <div className="mt-2 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-black text-slate-200">
                                            {top2.total_xp.toLocaleString()} XP
                                        </div>
                                    </div>
                                )}

                                {/* 1. Sıra (Altın 🥇 - Yükseltilmiş Podyum) */}
                                {top1 && (
                                    <div
                                        className={`flex flex-col items-center p-3 sm:p-4 rounded-3xl border text-center relative -translate-y-2 transition-all ${
                                            top1.is_current_user
                                                ? "bg-gradient-to-b from-amber-500/20 via-yellow-600/10 to-slate-900 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.3)] ring-2 ring-yellow-400/50"
                                                : "bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/10"
                                        }`}
                                    >
                                        <div className="absolute -top-3.5 flex items-center justify-center">
                                            <Crown className="w-7 h-7 text-yellow-300 fill-yellow-400 drop-shadow-md animate-bounce" />
                                        </div>

                                        <div className="relative mb-2 mt-2">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-2 border-yellow-200 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                                                {top1.avatar}
                                            </div>
                                            <div className="absolute -bottom-2 -right-1 px-2.5 py-0.5 bg-yellow-400 text-slate-950 rounded-full font-black text-xs shadow-md">
                                                1. 👑
                                            </div>
                                        </div>

                                        <h4 className="text-xs sm:text-sm font-black text-yellow-200 truncate max-w-full">
                                            {top1.name}
                                        </h4>
                                        <span className="text-[10px] text-amber-300/80 font-bold truncate max-w-full">
                                            {top1.title} {top1.badge}
                                        </span>
                                        <div className="mt-2 px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-xs sm:text-sm font-black text-amber-300">
                                            {top1.total_xp.toLocaleString()} XP
                                        </div>
                                    </div>
                                )}

                                {/* 3. Sıra (Bronz 🥉) */}
                                {top3 && (
                                    <div
                                        className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                                            top3.is_current_user
                                                ? "bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-500/20"
                                                : "bg-slate-900/80 border-slate-800"
                                        }`}
                                    >
                                        <div className="relative mb-2">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-950 border-2 border-amber-700/80 flex items-center justify-center text-2xl shadow-md">
                                                {top3.avatar}
                                            </div>
                                            <div className="absolute -bottom-2 -right-1 px-2 py-0.5 bg-amber-700 text-white rounded-full font-black text-[11px] shadow">
                                                3.
                                            </div>
                                        </div>
                                        <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-full">
                                            {top3.name}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-full">
                                            {top3.title}
                                        </span>
                                        <div className="mt-2 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-black text-amber-200/90">
                                            {top3.total_xp.toLocaleString()} XP
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 4. ve Sonraki Sıralar Listesi */}
                            <div className="space-y-2 pt-2">
                                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider px-1">
                                    Diğer Sıralamalar
                                </h3>

                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    {remainingEntries.map((entry) => {
                                        const isYou = entry.is_current_user;

                                        return (
                                            <div
                                                key={entry.user_id}
                                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-150 ${
                                                    isYou
                                                        ? "bg-emerald-950/35 border-emerald-500/80 text-emerald-100 shadow-md ring-1 ring-emerald-500/30"
                                                        : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 text-slate-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span
                                                        className={`w-6 text-center font-mono font-bold text-xs ${
                                                            isYou ? "text-emerald-400" : "text-slate-400"
                                                        }`}
                                                    >
                                                        #{entry.rank}
                                                    </span>

                                                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-base shrink-0 border border-slate-700">
                                                        {entry.avatar}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <h5
                                                                className={`text-xs sm:text-sm font-bold truncate ${
                                                                    isYou ? "text-emerald-300" : "text-white"
                                                                }`}
                                                            >
                                                                {entry.name}
                                                            </h5>
                                                            {isYou && (
                                                                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                                    Sen
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 block truncate">
                                                            Lv.{entry.level} • {entry.title} {entry.badge}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-orange-400">
                                                        <Flame className="w-3.5 h-3.5 fill-current" />
                                                        <span>{entry.streak_days}</span>
                                                    </div>

                                                    <div
                                                        className={`px-3 py-1 rounded-xl text-xs font-mono font-black ${
                                                            isYou
                                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                                : "bg-slate-800/80 text-amber-400 border border-slate-700/60"
                                                        }`}
                                                    >
                                                        {entry.total_xp.toLocaleString()} XP
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Sabit Kullanıcı Sıralama Çubuğu (Kullanıcı İlk 3'te Değilse) */}
                {currentUser && currentUser.rank > 3 && (
                    <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <UserCheck className="w-4 h-4" />
                            </span>
                            <span className="text-slate-300 font-medium">
                                Senin Sıralaman:{" "}
                                <strong className="text-emerald-400 font-mono font-bold">
                                    #{currentUser.rank}
                                </strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Toplam:</span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-400 font-mono font-black">
                                {currentUser.total_xp.toLocaleString()} XP
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
