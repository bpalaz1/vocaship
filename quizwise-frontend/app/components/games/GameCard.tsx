"use client";

import React from "react";
import { Play } from "lucide-react";

export interface GameCardItem {
  id: string;
  mode: string;
  title: string;
  badge: string;
  tag: string;
  description: string;
  bgGradient: string;
  icon: React.ReactNode;
  featurePills: Array<{ label: string; icon?: React.ReactNode }>;
  actionText?: string;
  actionBg?: string;
}

export interface GameCardProps {
  game: GameCardItem;
  onClick: () => void;
}

export default function GameCard({ game, onClick }: GameCardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/30 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer h-64 sm:h-68 select-none"
    >
      {/* Vektörel & Gradyanlı Üst Kapak */}
      <div
        className={`h-24 sm:h-28 relative overflow-hidden bg-gradient-to-br ${game.bgGradient} flex items-center justify-center shrink-0`}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="40" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="85%" cy="30%" r="3" fill="#fff" />
          <circle cx="15%" cy="70%" r="2" fill="#fff" />
        </svg>

        <div className="relative z-10 w-11 h-11 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          {game.icon}
        </div>

        {/* Sol Üst Rozet */}
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white border border-white/20 backdrop-blur-md">
            {game.badge}
          </span>
        </div>

        {/* Sağ Üst Etiket */}
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/60 text-amber-300 border border-amber-500/30 backdrop-blur-md">
            {game.tag}
          </span>
        </div>
      </div>

      {/* Kompakt İçerik & Aksiyon */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2 bg-slate-900">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-black text-white group-hover:text-indigo-300 transition-colors truncate">
            {game.title}
          </h3>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Özellik Hapları */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 overflow-hidden">
          {game.featurePills.map((pill, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-1 shrink-0"
            >
              {pill.icon}
              <span className="truncate max-w-[100px]">{pill.label}</span>
            </span>
          ))}
        </div>

        {/* Eylem Butonu */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition active:scale-95 cursor-pointer ${
            game.actionBg || "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{game.actionText || "Oyna ➔"}</span>
        </button>
      </div>
    </div>
  );
}

