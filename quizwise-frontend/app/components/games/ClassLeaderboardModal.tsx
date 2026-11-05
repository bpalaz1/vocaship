"use client";

import React, { useState } from "react";
import {
  Trophy,
  X,
  Flame,
  Crown,
  KeyRound,
  Users,
  ChevronDown,
  Sparkles,
  Medal,
  Award,
  ArrowRight,
  Globe
} from "lucide-react";

export interface StudentLeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface ClassLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJoinCode?: () => void;
  userClassrooms?: Array<{ id: string; name: string }>;
  currentUserId?: string;
  userXP?: number;
}

const DEFAULT_GLOBAL_LEAGUE: StudentLeaderboardEntry[] = [
  { rank: 1, name: "Selin Yılmaz", avatar: "🦊", xp: 4820, level: 5 },
  { rank: 2, name: "Emre Aksoy", avatar: "🦁", xp: 4150, level: 4 },
  { rank: 3, name: "Elif Demir", avatar: "🐼", xp: 3720, level: 4 },
  { rank: 4, name: "Burak P. (Sen)", avatar: "🦊", xp: 2665, level: 3, isCurrentUser: true },
  { rank: 5, name: "Kaan Arslan", avatar: "🐯", xp: 2410, level: 3 },
];

const DEFAULT_CLASS_10A_WEEKLY: StudentLeaderboardEntry[] = [
  { rank: 1, name: "Zeynep Kaya", avatar: "🦉", xp: 1420, level: 4 },
  { rank: 2, name: "Mert Öztürk", avatar: "🐺", xp: 1290, level: 4 },
  { rank: 3, name: "Ayşe Çelik", avatar: "🦄", xp: 1150, level: 3 },
  { rank: 4, name: "Burak P. (Sen)", avatar: "🦊", xp: 940, level: 3, isCurrentUser: true },
  { rank: 5, name: "Caner Aydın", avatar: "🦅", xp: 820, level: 3 },
  { rank: 6, name: "Deniz Kurt", avatar: "🐻", xp: 710, level: 2 },
];

const DEFAULT_CLASS_10A_ALLTIME: StudentLeaderboardEntry[] = [
  { rank: 1, name: "Zeynep Kaya", avatar: "🦉", xp: 6850, level: 6 },
  { rank: 2, name: "Burak P. (Sen)", avatar: "🦊", xp: 5410, level: 5, isCurrentUser: true },
  { rank: 3, name: "Mert Öztürk", avatar: "🐺", xp: 4950, level: 5 },
  { rank: 4, name: "Ayşe Çelik", avatar: "🦄", xp: 4120, level: 4 },
  { rank: 5, name: "Caner Aydın", avatar: "🦅", xp: 3600, level: 4 },
];

const DEFAULT_CLASSES = [
  { id: "class_10a", name: "10-A İngilizce (İleri Düzey)" },
  { id: "class_weekend", name: "Hafta Sonu YDS / IELTS Kulübü" },
];

export default function ClassLeaderboardModal({
  isOpen,
  onClose,
  onOpenJoinCode,
  userClassrooms = DEFAULT_CLASSES,
  userXP = 2665,
}: ClassLeaderboardModalProps) {
  // Sınıf seçimi ve görünüm durumu
  const [selectedClassId, setSelectedClassId] = useState<string>(
    userClassrooms.length > 0 ? userClassrooms[0].id : ""
  );
  const [activeTab, setActiveTab] = useState<"weekly" | "all_time">("weekly");
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  // Kullanıcı sınıfları varsa Durum B, yoksa Durum A
  const hasClasses = userClassrooms && userClassrooms.length > 0;
  const currentClass = userClassrooms.find((c) => c.id === selectedClassId) || userClassrooms[0];

  if (!isOpen) return null;

  const currentList =
    activeTab === "weekly" ? DEFAULT_CLASS_10A_WEEKLY : DEFAULT_CLASS_10A_ALLTIME;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-xl">🥇</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return (
          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-mono text-xs font-bold flex items-center justify-center">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 2. Modal Gövdesi */}
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl shadow-indigo-950/60 z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Üst Başlık & Kapat Butonu */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Sınıf Liderlik Tablosu</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Canlı Podyum
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Arkadaşlarınla haftalık XP rekabeti ve şeref kürsüsü
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal İçeriği */}
        <div className="overflow-y-auto space-y-4 pt-4 pb-2 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          {!hasClasses ? (
            /* ========================================================================= */
            /* DURUM A: KULLANICININ SINIFI YOKSA                                        */
            /* ========================================================================= */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-3 shadow-inner">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white">
                    Henüz bir sınıfa dahil değilsin!
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Öğretmeninden aldığın 6 haneli sınıf kodu ile sınıfa katılabilir ve sınıf arkadaşlarınla puan yarışına başlayabilirsin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenJoinCode) onOpenJoinCode();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 mx-auto active:scale-95 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-indigo-200" />
                  <span>🔑 Sınıf Kodu Gir</span>
                </button>
              </div>

              {/* Genel Haftalık Lig Sıralaması (İlk 5 Öğrenci) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>🌍 Genel Haftalık Lig (Top 5)</span>
                  </span>
                  <span className="text-[10px] font-mono">Dinamik 7 Gün</span>
                </div>

                <div className="space-y-2">
                  {DEFAULT_GLOBAL_LEAGUE.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        entry.isCurrentUser
                          ? "bg-indigo-950/40 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30"
                          : "bg-slate-950/60 border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getRankBadge(entry.rank)}
                        <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm shadow-inner shrink-0">
                          {entry.avatar}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              entry.isCurrentUser ? "text-indigo-300" : "text-white"
                            }`}
                          >
                            {entry.name}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Lv.{entry.level} Kaşif
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black font-mono text-amber-300 block">
                          {entry.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* DURUM B: KULLANICININ SINIFI VARSA VEYA BİRDEN FAZLAYSA                   */
            /* ========================================================================= */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Sınıf Seçici Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  className="w-full p-3 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-left transition flex items-center justify-between gap-2 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                    <span className="text-xs font-bold text-white truncate">
                      {currentClass?.name || "10-A İngilizce"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isClassDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isClassDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-30 space-y-1">
                    {userClassrooms.map((cls) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setIsClassDropdownOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                          cls.id === selectedClassId
                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                            : "text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <span className="truncate">{cls.name}</span>
                        {cls.id === selectedClassId && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* İki Sekme: "🔥 Bu Haftanın Yarışı" ve "👑 Tüm Zamanlar" */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("weekly")}
                  className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "weekly"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>Bu Haftanın Yarışı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("all_time")}
                  className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "all_time"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                  <span>Tüm Zamanlar</span>
                </button>
              </div>

              {/* Podyum Listesi */}
              <div className="space-y-2">
                {currentList.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                      entry.isCurrentUser
                        ? "bg-indigo-950/40 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30"
                        : "bg-slate-950/60 border-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getRankBadge(entry.rank)}
                      <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm shadow-inner shrink-0">
                        {entry.avatar}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${
                            entry.isCurrentUser ? "text-indigo-300 font-extrabold" : "text-white"
                          }`}
                        >
                          {entry.name}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Lv.{entry.level} Seviye
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono text-amber-300 block">
                        {entry.xp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* En Altta Sabit "Sen: X. Sıra" Göstergesi (Durum B için) */}
        {hasClasses && (
          <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between px-2 bg-slate-950/80 p-3 rounded-2xl border shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base">🦊</span>
              <div>
                <span className="text-xs font-black text-white block">
                  Sen: {activeTab === "weekly" ? "4. Sıra" : "2. Sıra"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeTab === "weekly" ? "Haftalık: 940 XP" : "Toplam: 5,410 XP"}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black font-mono">
              🥈 Şeref Kürsüsü
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

