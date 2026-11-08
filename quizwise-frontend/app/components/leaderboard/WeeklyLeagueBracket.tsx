"use client";

import React, { useMemo } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Shield,
  Clock,
  Flame,
} from "lucide-react";

export type LeagueTier = "Bronz" | "Gümüş" | "Altın" | "Elmas" | "Usta";

export interface BracketMember {
  rank: number;
  name: string;
  avatar: string;
  weeklyXp: number;
  totalXp: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface WeeklyLeagueBracketProps {
  currentUser: {
    name: string;
    avatar: string;
    weeklyXp: number;
    totalXp: number;
    league?: LeagueTier;
    rank?: number;
  };
  activityFilter?: "all" | "reading" | "games";
}

// 30 Kişilik Sabit/Dinamik Küme Üretici
const COHORT_NAMES = [
  "Selin Yılmaz", "Emre Aksoy", "Elif Demir", "Kaan Arslan", "Zeynep Kaya",
  "Mert Öztürk", "Ayşe Çelik", "Caner Aydın", "Deniz Kurt", "Büşra Koç",
  "Oğuzhan Tekin", "Gamze Şahin", "Tolga Erdem", "İrem Yıldız", "Hakan Özkan",
  "Melis Aktaş", "Barış Çetin", "Ceren Güneş", "Burak Vural", "Derya Tan",
  "Serkan Polat", "Ezgi Bulut", "Volkan Sezer", "Ece Acar", "Onur Can",
  "Pınar Yaman", "Gökhan Avcı", "Seda Eren", "Taylan Doğan", "Nazlı Sarı"
];

const COHORT_AVATARS = [
  "🦊", "🦁", "🦉", "🐼", "🐱", "🐻", "🐯", "🦅", "🦄", "🦫",
  "🐸", "🐿️", "🐢", "🐐", "🐪", "🗿", "🥷", "⚓", "🧙‍♂️", "🦾",
  "🤖", "👩‍🚀", "🛸", "👽", "💠", "⚡", "✨", "🐉", "🔥", "⚖️"
];

export default function WeeklyLeagueBracket({
  currentUser,
  activityFilter = "all",
}: WeeklyLeagueBracketProps) {
  const currentLeague: LeagueTier = currentUser.league || "Altın";

  // Çarpan (Filtreye göre puan ölçeklendirme)
  const filterMultiplier =
    activityFilter === "reading" ? 0.6 : activityFilter === "games" ? 0.4 : 1.0;

  // 30 Kişilik Küme Oluştur
  const bracketList: BracketMember[] = useMemo(() => {
    const list: BracketMember[] = [];
    const baseWeekly = Math.max(200, Math.round(currentUser.weeklyXp * filterMultiplier));

    // 29 bot üye + 1 kullanıcı
    for (let i = 0; i < 29; i++) {
      const rankScore = Math.max(
        60,
        Math.round((750 - i * 22 + (i % 3 === 0 ? 35 : -15)) * filterMultiplier)
      );
      list.push({
        rank: 0,
        name: COHORT_NAMES[i],
        avatar: COHORT_AVATARS[i],
        weeklyXp: rankScore,
        totalXp: rankScore * 4 + 800,
        level: Math.max(1, Math.floor(rankScore / 100)),
        isCurrentUser: false,
      });
    }

    // Kullanıcıyı ekle
    list.push({
      rank: 0,
      name: `${currentUser.name} (Sen)`,
      avatar: currentUser.avatar,
      weeklyXp: baseWeekly,
      totalXp: currentUser.totalXp,
      level: Math.max(1, Math.floor(currentUser.totalXp / 500)),
      isCurrentUser: true,
    });

    // Puana göre azalan sırala ve rank ata
    list.sort((a, b) => b.weeklyXp - a.weeklyXp);
    list.forEach((m, idx) => {
      m.rank = idx + 1;
    });

    return list;
  }, [currentUser, filterMultiplier]);

  const topThree = bracketList.slice(0, 3);
  const remainingMembers = bracketList.slice(3);

  const leagueBadges: Record<LeagueTier, { title: string; color: string; border: string; bg: string }> = {
    Bronz: {
      title: "🥉 Bronz Ligi",
      color: "text-amber-600",
      border: "border-amber-700/40",
      bg: "bg-amber-950/20",
    },
    Gümüş: {
      title: "🥈 Gümüş Ligi",
      color: "text-slate-300",
      border: "border-slate-500/40",
      bg: "bg-slate-800/30",
    },
    Altın: {
      title: "🥇 Altın Ligi",
      color: "text-amber-300",
      border: "border-amber-500/50",
      bg: "bg-amber-500/15",
    },
    Elmas: {
      title: "💎 Elmas Ligi",
      color: "text-cyan-300",
      border: "border-cyan-500/50",
      bg: "bg-cyan-950/30",
    },
    Usta: {
      title: "👑 Usta Ligi",
      color: "text-rose-300",
      border: "border-rose-500/50",
      bg: "bg-rose-950/30",
    },
  };

  return (
    <div className="space-y-6">
      {/* 1. KÜME BİLGİ KARTI: LİG ADI, KALAN SÜRE VE ÇİFT SAYAÇ BİLGİSİ */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
            🥇
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-black ${leagueBadges[currentLeague].color}`}>
                {leagueBadges[currentLeague].title}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-bold">
                30 Kişilik Küme (#14)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Haftalık lig Pazar 23:59'da sıfırlanır. İlk 5 kişi bir üst lige terfi eder.
            </p>
          </div>
        </div>

        {/* Çift Sayaç Puan Özeti */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Haftalık XP */}
          <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">
              🏆 Bu Hafta
            </span>
            <span className="text-sm font-black font-mono text-amber-300">
              {currentUser.weeklyXp} XP
            </span>
          </div>

          {/* Kalıcı Toplam XP */}
          <div className="px-3.5 py-2 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-center">
            <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono block">
              ⚡ Kalıcı Toplam
            </span>
            <span className="text-sm font-black font-mono text-indigo-300">
              {currentUser.totalXp} XP
            </span>
          </div>
        </div>
      </div>

      {/* 2. PODYUM VİTRİNİ: İLK 3 ŞAMPİYON */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-4 pb-2 max-w-xl mx-auto">
        {/* 2. SIRA (GÜMÜŞ) */}
        {topThree[1] && (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-3xl shadow-lg relative ${
                  topThree[1].isCurrentUser ? "ring-2 ring-indigo-400" : ""
                }`}
              >
                {topThree[1].avatar.startsWith("/") ? (
                  <img
                    src={topThree[1].avatar}
                    alt={topThree[1].name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span>{topThree[1].avatar}</span>
                )}
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow">
                2
              </span>
            </div>
            <div className="text-center w-full">
              <h4 className="text-xs font-bold text-white truncate px-1">
                {topThree[1].name}
              </h4>
              <span className="text-[11px] font-mono font-bold text-slate-300">
                {topThree[1].weeklyXp} XP
              </span>
            </div>
            <div className="w-full h-16 sm:h-20 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700/80 border-t-2 border-slate-400 flex items-center justify-center font-black text-slate-300 text-sm">
              🥈 2.
            </div>
          </div>
        )}

        {/* 1. SIRA (ALTIN ŞAMPİYON) */}
        {topThree[0] && (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20 relative ${
                  topThree[0].isCurrentUser ? "ring-4 ring-amber-400" : ""
                }`}
              >
                {topThree[0].avatar.startsWith("/") ? (
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <span>{topThree[0].avatar}</span>
                )}
              </div>
              <span className="absolute -top-2.5 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg">
                👑
              </span>
            </div>
            <div className="text-center w-full">
              <h4 className="text-xs sm:text-sm font-black text-amber-300 truncate px-1">
                {topThree[0].name}
              </h4>
              <span className="text-xs font-mono font-black text-amber-200">
                {topThree[0].weeklyXp} XP
              </span>
            </div>
            <div className="w-full h-24 sm:h-28 rounded-t-3xl bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-500 border-t-2 border-amber-300 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shadow-amber-500/20">
              🥇 1.
            </div>
          </div>
        )}

        {/* 3. SIRA (BRONZ) */}
        {topThree[2] && (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-amber-700/60 flex items-center justify-center text-3xl shadow-lg relative ${
                  topThree[2].isCurrentUser ? "ring-2 ring-indigo-400" : ""
                }`}
              >
                {topThree[2].avatar.startsWith("/") ? (
                  <img
                    src={topThree[2].avatar}
                    alt={topThree[2].name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span>{topThree[2].avatar}</span>
                )}
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow">
                3
              </span>
            </div>
            <div className="text-center w-full">
              <h4 className="text-xs font-bold text-white truncate px-1">
                {topThree[2].name}
              </h4>
              <span className="text-[11px] font-mono font-bold text-amber-400">
                {topThree[2].weeklyXp} XP
              </span>
            </div>
            <div className="w-full h-12 sm:h-14 rounded-t-2xl bg-gradient-to-t from-slate-800 to-amber-950/60 border-t-2 border-amber-700/60 flex items-center justify-center font-black text-amber-500 text-sm">
              🥉 3.
            </div>
          </div>
        )}
      </div>

      {/* 3. 30 KİŞİLİK TÜM SIRALAMA TABLOSU & BÖLGE AYRAÇLARI */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-slate-400">
          <span>SIRA & KULLANICI</span>
          <span>HAFTALIK PUAN</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {bracketList.map((member) => {
            const isPromotion = member.rank <= 5;
            const isDemotion = member.rank >= 26;

            return (
              <React.Fragment key={member.rank}>
                {/* Yükselme Hattı Ayracı (5. Sıradan sonra) */}
                {member.rank === 6 && (
                  <div className="px-4 py-2 bg-emerald-500/10 border-y border-emerald-500/30 flex items-center justify-between text-[11px] font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>⬆️ İlk 5 Kişi Bir Üst Lige Terfi Eder (Yükselme Hattı)</span>
                    </span>
                    <span className="font-mono text-[10px]">Terfi Bölgesi</span>
                  </div>
                )}

                {/* Düşme Hattı Ayracı (25. Sıradan sonra) */}
                {member.rank === 26 && (
                  <div className="px-4 py-2 bg-rose-500/10 border-y border-rose-500/30 flex items-center justify-between text-[11px] font-bold text-rose-400">
                    <span className="flex items-center gap-1.5">
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>⬇️ Son 5 Kişi Bir Alt Lige Düşer (Düşme Hattı)</span>
                    </span>
                    <span className="font-mono text-[10px]">Düşme Riski</span>
                  </div>
                )}

                {/* Satır */}
                <div
                  className={`px-4 py-3 flex items-center justify-between transition-all ${
                    member.isCurrentUser
                      ? "bg-indigo-950/70 border-y-2 border-indigo-500 ring-1 ring-indigo-400/50"
                      : isPromotion
                      ? "hover:bg-emerald-950/20"
                      : isDemotion
                      ? "hover:bg-rose-950/20"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Sıra Numarası ve İkon */}
                    <div className="w-7 text-center font-mono font-bold text-xs shrink-0">
                      {member.rank === 1 ? (
                        <span className="text-amber-400 text-sm">🥇</span>
                      ) : member.rank === 2 ? (
                        <span className="text-slate-300 text-sm">🥈</span>
                      ) : member.rank === 3 ? (
                        <span className="text-amber-600 text-sm">🥉</span>
                      ) : (
                        <span className={isPromotion ? "text-emerald-400" : isDemotion ? "text-rose-400" : "text-slate-400"}>
                          #{member.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {member.avatar.startsWith("/") ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{member.avatar}</span>
                      )}
                    </div>

                    {/* İsim & Seviye */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            member.isCurrentUser
                              ? "text-indigo-300 font-black"
                              : "text-white"
                          }`}
                        >
                          {member.name}
                        </span>
                        {member.isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono font-bold">
                            SEN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Lv.{member.level} Kaşif
                      </span>
                    </div>
                  </div>

                  {/* Puan ve Durum Rozeti */}
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono text-white block">
                      {member.weeklyXp} XP
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold ${
                        isPromotion
                          ? "text-emerald-400"
                          : isDemotion
                          ? "text-rose-400"
                          : "text-slate-500"
                      }`}
                    >
                      {isPromotion
                        ? "Terfi Bölgesi"
                        : isDemotion
                        ? "Düşme Riski"
                        : "Ligde Güvende"}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

