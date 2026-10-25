"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Zap,
  Crown,
  Medal,
  Sparkles,
  RefreshCw,
  ChevronUp,
  UserCheck,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "../context/LanguageContext";
import { API_BASE } from "../config";
import { LeaderboardResponse, LeaderboardEntry } from "../components/LeaderboardModal";

export default function LeaderboardPage() {
  const { t } = useTranslation();
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
    fetchLeaderboard(timeframe);
  }, [timeframe]);

  const entries = data?.entries || [];
  const topThree = entries.slice(0, 3);
  const restEntries = entries.slice(3);

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ÜST BAŞLIK VE SEKME ÇUBUĞU */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("btn_home")}</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400 fill-amber-400/20" />
            <span>{t("heading_leaderboard")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t("desc_leaderboard")}
          </p>
        </div>

        {/* ZAMAN ARALIĞI SEÇİCİ */}
        <div className="flex items-center bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setTimeframe("weekly")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeframe === "weekly"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t("timeframe_weekly")}</span>
          </button>
          <button
            onClick={() => setTimeframe("all_time")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeframe === "all_time"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{t("timeframe_alltime")}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <p>Liderlik sıralaması hesaplanıyor...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. LİDERLİK PODYUMU (İLK 3) */}
          {topThree.length >= 3 && (
            <div className="relative pt-6 pb-2">
              <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-xl mx-auto">
                {/* 2. SIRA (GÜMÜŞ) */}
                <div className="flex flex-col items-center order-1">
                  <div className="relative mb-2 flex flex-col items-center">
                    <div className="text-xl sm:text-2xl mb-1">{topThree[1].avatar}</div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 border-2 border-slate-300 flex items-center justify-center font-black text-slate-900 text-base sm:text-xl shadow-lg shadow-slate-400/20">
                      2
                    </div>
                    <Medal className="w-5 h-5 text-slate-300 absolute -top-3" />
                  </div>
                  <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 text-center h-28 sm:h-32 flex flex-col justify-center">
                    <span className="text-xs sm:text-sm font-bold text-white truncate block">
                      {topThree[1].name}
                    </span>
                    <span className="text-[11px] text-amber-400 font-extrabold mt-1">
                      {topThree[1].total_xp.toLocaleString()} XP
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{topThree[1].title}</span>
                  </div>
                </div>

                {/* 1. SIRA (ALTIN ŞAMPİYON) */}
                <div className="flex flex-col items-center order-2 -mt-4">
                  <div className="relative mb-2 flex flex-col items-center">
                    <Crown className="w-7 h-7 text-amber-400 absolute -top-5 animate-bounce" />
                    <div className="text-2xl sm:text-3xl mb-1">{topThree[0].avatar}</div>
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-2 border-yellow-200 flex items-center justify-center font-black text-slate-950 text-xl sm:text-2xl shadow-xl shadow-amber-500/30">
                      1
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-400/70 rounded-2xl p-3.5 text-center h-36 sm:h-40 flex flex-col justify-center shadow-lg">
                    <span className="text-xs sm:text-base font-black text-amber-200 truncate block">
                      {topThree[0].name}
                    </span>
                    <span className="text-xs sm:text-sm text-amber-400 font-black mt-1">
                      {topThree[0].total_xp.toLocaleString()} XP
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-bold mt-0.5">
                      {topThree[0].title}
                    </span>
                  </div>
                </div>

                {/* 3. SIRA (BRONZ) */}
                <div className="flex flex-col items-center order-3">
                  <div className="relative mb-2 flex flex-col items-center">
                    <div className="text-xl sm:text-2xl mb-1">{topThree[2].avatar}</div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 border-2 border-amber-500 flex items-center justify-center font-black text-amber-100 text-base sm:text-xl shadow-lg shadow-amber-700/20">
                      3
                    </div>
                    <Medal className="w-5 h-5 text-amber-600 absolute -top-3" />
                  </div>
                  <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 text-center h-24 sm:h-28 flex flex-col justify-center">
                    <span className="text-xs sm:text-sm font-bold text-white truncate block">
                      {topThree[2].name}
                    </span>
                    <span className="text-[11px] text-amber-400 font-extrabold mt-1">
                      {topThree[2].total_xp.toLocaleString()} XP
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{topThree[2].title}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SIRALAMA LİSTESİ TABLOSU */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-md">
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all ${
                    entry.is_current_user
                      ? "bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-600/10"
                      : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <span className="w-7 text-center font-black text-sm text-slate-400">
                      #{entry.rank}
                    </span>
                    <span className="text-xl">{entry.avatar}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${entry.is_current_user ? "text-indigo-300" : "text-white"}`}>
                          {entry.name}
                        </span>
                        {entry.is_current_user && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500 text-white">
                            SEN
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{entry.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-amber-400 font-black">
                      {entry.total_xp.toLocaleString()} XP
                    </span>
                    <span className="text-xs text-slate-500">Lv.{entry.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
