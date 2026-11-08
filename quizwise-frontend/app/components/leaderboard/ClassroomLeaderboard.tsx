"use client";

import React, { useMemo } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Users,
  KeyRound,
  Sparkles,
  Zap,
  ArrowRight,
  School,
  Flame,
  CheckCircle2,
} from "lucide-react";

export interface ClassmateMember {
  rank: number;
  name: string;
  avatar: string;
  weeklyXp: number;
  totalXp: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface ClassroomInfo {
  id: string;
  name: string;
  code: string;
  studentCount?: number;
}

export interface ClassroomLeaderboardProps {
  classInfo?: ClassroomInfo | null;
  currentUser: {
    name: string;
    avatar: string;
    weeklyXp: number;
    totalXp: number;
    level?: number;
  };
  activityFilter?: "all" | "reading" | "games";
  onOpenJoinCode?: () => void;
  onSwitchClass?: (classId: string) => void;
  availableClasses?: ClassroomInfo[];
}

const DEFAULT_CLASSMATES = [
  { name: "Selin Yılmaz", avatar: "🦊", baseWeekly: 680, baseTotal: 3400 },
  { name: "Kaan Arslan", avatar: "🦁", baseWeekly: 620, baseTotal: 3100 },
  { name: "Elif Demir", avatar: "🦉", baseWeekly: 580, baseTotal: 2950 },
  { name: "Mert Öztürk", avatar: "🐼", baseWeekly: 510, baseTotal: 2600 },
  { name: "Zeynep Kaya", avatar: "🐱", baseWeekly: 490, baseTotal: 2450 },
  { name: "Caner Aydın", avatar: "🐻", baseWeekly: 440, baseTotal: 2200 },
  { name: "Deniz Kurt", avatar: "🐯", baseWeekly: 410, baseTotal: 2050 },
  { name: "Ayşe Çelik", avatar: "🦅", baseWeekly: 380, baseTotal: 1900 },
  { name: "Büşra Koç", avatar: "🦫", baseWeekly: 350, baseTotal: 1750 },
  { name: "Oğuzhan Tekin", avatar: "🐸", baseWeekly: 320, baseTotal: 1600 },
  { name: "İrem Yıldız", avatar: "🦄", baseWeekly: 290, baseTotal: 1450 },
  { name: "Tolga Erdem", avatar: "🥷", baseWeekly: 260, baseTotal: 1300 },
  { name: "Melis Aktaş", avatar: "🧙‍♂️", baseWeekly: 230, baseTotal: 1150 },
  { name: "Barış Çetin", avatar: "🤖", baseWeekly: 200, baseTotal: 1000 },
  { name: "Ceren Güneş", avatar: "👩‍🚀", baseWeekly: 170, baseTotal: 850 },
];

export default function ClassroomLeaderboard({
  classInfo,
  currentUser,
  activityFilter = "all",
  onOpenJoinCode,
  onSwitchClass,
  availableClasses = [],
}: ClassroomLeaderboardProps) {
  const filterMultiplier =
    activityFilter === "reading" ? 0.6 : activityFilter === "games" ? 0.4 : 1.0;

  // Sıralanmış Sınıf Listesi
  const classmateList: ClassmateMember[] = useMemo(() => {
    if (!classInfo) return [];

    const baseWeekly = Math.max(
      150,
      Math.round(currentUser.weeklyXp * filterMultiplier)
    );

    const list: ClassmateMember[] = DEFAULT_CLASSMATES.map((cm) => {
      const weekly = Math.round(cm.baseWeekly * filterMultiplier);
      const total = Math.round(cm.baseTotal * filterMultiplier);
      return {
        rank: 0,
        name: cm.name,
        avatar: cm.avatar,
        weeklyXp: weekly,
        totalXp: total,
        level: Math.max(1, Math.floor(total / 400)),
        isCurrentUser: false,
      };
    });

    // Kullanıcıyı ekle
    list.push({
      rank: 0,
      name: `${currentUser.name} (Sen)`,
      avatar: currentUser.avatar,
      weeklyXp: baseWeekly,
      totalXp: currentUser.totalXp,
      level:
        currentUser.level || Math.max(1, Math.floor(currentUser.totalXp / 500)),
      isCurrentUser: true,
    });

    // Haftalık puana göre azalan sırala
    list.sort((a, b) => b.weeklyXp - a.weeklyXp);

    // Sıralama numaralarını ver
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [classInfo, currentUser, filterMultiplier]);

  // İlk 3 Podyumu
  const top1 = classmateList[0];
  const top2 = classmateList[1];
  const top3 = classmateList[2];

  // Kullanıcının Mevcut Sıralaması
  const userRankIndex = classmateList.findIndex((m) => m.isCurrentUser);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  const renderAvatar = (avatar: string, name: string) => {
    if (avatar && (avatar.startsWith("/") || avatar.startsWith("data:") || avatar.startsWith("http"))) {
      return (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover rounded-xl"
        />
      );
    }
    return <span>{avatar || "👤"}</span>;
  };

  // =======================================================================
  // DURUM 1: KULLANICI HENÜZ BİR SINIFTA DEĞİL (EMPTY STATE)
  // =======================================================================
  if (!classInfo) {
    return (
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-12 text-center backdrop-blur-md shadow-2xl space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <School className="w-10 h-10 text-indigo-400" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Henüz Bir Sınıfta Değilsin!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Öğretmeninin veya okulunun verdiği 6 haneli sınıf PIN kodunu girerek
            sınıf arkadaşlarınla izole akran yarışına katıl ve haftalık podyumda yerini al.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenJoinCode}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>🔑 Sınıf Kodu Gir & Katıl</span>
          </button>
        </div>

        {/* Özellikler Önizleme Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 max-w-2xl mx-auto text-left">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Sınıf Podyumu</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Yalnızca kendi sınıf arkadaşlarınla haftalık kupa mücadelesi ver.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Adil Akran Kümeleri</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Milyonlarca yabancı yerine sadece tanıdığın arkadaşlarınla yarış.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Çift Sayaç Puanı</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Kalıcı XP ile seviye atla, haftalık puanla sınıf birinciliğini kap.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================================
  // DURUM 2: KULLANICI BİR SINIFTA -> AKRAN TABLOSU & PODYUM
  // =======================================================================
  return (
    <div className="w-full space-y-6">
      {/* 1. Sınıf Başlık ve Bilgi Çubuğu */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <School className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white">
                {classInfo.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                PIN: {classInfo.code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{classmateList.length} Öğrenci</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Haftalık sınıf içi yarış • Sıfırlanma: Pazar 23:59
            </p>
          </div>
        </div>

        {/* Sağ: Sınıf Değiştir / Kod Gir Butonu */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {availableClasses.length > 1 && onSwitchClass && (
            <select
              value={classInfo.id}
              onChange={(e) => onSwitchClass(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-indigo-500"
            >
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={onOpenJoinCode}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Yeni Sınıfa Katıl</span>
            <span className="sm:hidden">Sınıf Kodu</span>
          </button>
        </div>
      </div>

      {/* 2. İlk 3 Podyum Sahnesi (Podium) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2 px-1">
        {/* 2. SIRA (GÜMÜŞ KUPA) */}
        {top2 && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-400/60 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-slate-500/10 overflow-hidden">
                {renderAvatar(top2.avatar, top2.name)}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                2
              </div>
            </div>
            <span className="text-xs font-bold text-white text-center truncate max-w-[90px] sm:max-w-[120px]">
              {top2.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {top2.weeklyXp.toLocaleString()} XP
            </span>

            {/* Podyum Bloğu */}
            <div className="w-full h-20 sm:h-24 mt-2 rounded-t-2xl bg-gradient-to-t from-slate-900 to-slate-800/80 border-t-2 border-x border-slate-400/40 flex flex-col items-center justify-center">
              <span className="text-lg sm:text-xl">🥈</span>
              <span className="text-[10px] font-bold text-slate-300">2. Gümüş</span>
            </div>
          </div>
        )}

        {/* 1. SIRA (ALTIN KUPA & TAÇ) */}
        {top1 && (
          <div className="flex flex-col items-center">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 animate-bounce mb-1 drop-shadow-md" />
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border-2 border-amber-400 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-500/20 ring-4 ring-amber-400/20 overflow-hidden">
                {renderAvatar(top1.avatar, top1.name)}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                1
              </div>
            </div>
            <span className="text-xs sm:text-sm font-black text-white text-center truncate max-w-[100px] sm:max-w-[130px]">
              {top1.name}
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-400">
              {top1.weeklyXp.toLocaleString()} XP
            </span>

            {/* Podyum Bloğu */}
            <div className="w-full h-28 sm:h-32 mt-2 rounded-t-2xl bg-gradient-to-t from-amber-950/40 via-slate-900 to-slate-800 border-t-2 border-x border-amber-400/60 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
              <span className="text-2xl sm:text-3xl">🥇</span>
              <span className="text-[10px] font-black text-amber-300 tracking-wide">
                1. Şampiyon
              </span>
            </div>
          </div>
        )}

        {/* 3. SIRA (BRONZ KUPA) */}
        {top3 && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-900/40 to-slate-900 border-2 border-amber-600/60 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-amber-700/10 overflow-hidden">
                {renderAvatar(top3.avatar, top3.name)}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                3
              </div>
            </div>
            <span className="text-xs font-bold text-white text-center truncate max-w-[90px] sm:max-w-[120px]">
              {top3.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {top3.weeklyXp.toLocaleString()} XP
            </span>

            {/* Podyum Bloğu */}
            <div className="w-full h-16 sm:h-20 mt-2 rounded-t-2xl bg-gradient-to-t from-slate-900 to-slate-800/80 border-t-2 border-x border-amber-600/40 flex flex-col items-center justify-center">
              <span className="text-lg sm:text-xl">🥉</span>
              <span className="text-[10px] font-bold text-amber-400">3. Bronz</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sınıf Sıralama Tablosu */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">Sıra</span>
            <span>Öğrenci</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Kalıcı Toplam</span>
            <span>Bu Hafta</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {classmateList.map((member) => {
            const isMe = member.isCurrentUser;
            const isPodium = member.rank <= 3;

            return (
              <div
                key={member.name}
                className={`flex items-center justify-between px-4 py-3 transition-colors ${
                  isMe
                    ? "bg-amber-500/15 border-y-2 border-amber-500/50 shadow-inner shadow-amber-500/10"
                    : "hover:bg-slate-800/40"
                }`}
              >
                {/* Sol: Sıra, Avatar, İsim & Seviye */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 text-center flex items-center justify-center font-bold">
                    {member.rank === 1 ? (
                      <span className="text-base">🥇</span>
                    ) : member.rank === 2 ? (
                      <span className="text-base">🥈</span>
                    ) : member.rank === 3 ? (
                      <span className="text-base">🥉</span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400">
                        #{member.rank}
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden ${
                      isMe
                        ? "bg-amber-500/20 border-2 border-amber-400 shadow-md shadow-amber-500/20"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    {renderAvatar(member.avatar, member.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isMe ? "text-amber-300 font-black" : "text-white"
                        }`}
                      >
                        {member.name}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                          Sen
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Lv.{member.level}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-orange-400" />
                        <span>Sınıf İçi</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sağ: Kalıcı XP & Haftalık XP */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-400" />
                      <span>{member.totalXp.toLocaleString()} XP</span>
                    </span>
                    <span className="text-[9px] text-slate-500">Kalıcı</span>
                  </div>

                  <div className="flex flex-col items-end min-w-[75px]">
                    <span
                      className={`text-xs sm:text-sm font-mono font-black ${
                        isMe
                          ? "text-amber-300"
                          : isPodium
                          ? "text-white"
                          : "text-slate-300"
                      }`}
                    >
                      {member.weeklyXp.toLocaleString()} XP
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-400">
                      Bu Hafta
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
