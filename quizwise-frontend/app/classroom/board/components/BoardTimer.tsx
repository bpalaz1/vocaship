"use client";

import React, { useState, useEffect, useRef } from "react";
import { Timer, Plus, X, Play, Pause, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

export interface BoardTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoardTimer({ isOpen, onClose }: BoardTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [overtimeSeconds, setOvertimeSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev > 0) {
            if (prev === 1) {
              confetti({ particleCount: 25, spread: 60 });
            }
            return prev - 1;
          } else {
            // Süre doldu (00:00): Sayfa KAPANMAZ! Yukarı doğru ek süre sayılır.
            setOvertimeSeconds((over) => over + 1);
            return 0;
          }
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  if (!isOpen) return null;

  const handleStartPreset = (secs: number) => {
    setIsRunning(false);
    setSelectedPreset(secs);
    setSecondsRemaining(secs);
    setOvertimeSeconds(0);
    setTimeout(() => setIsRunning(true), 50);
  };

  const handleAddOneMinute = () => {
    if (overtimeSeconds > 0) {
      // Ek süre modundaysa 60 saniye normale döndür
      const remainingAfterOffset = 60 - overtimeSeconds;
      if (remainingAfterOffset > 0) {
        setSecondsRemaining(remainingAfterOffset);
        setOvertimeSeconds(0);
      } else {
        setOvertimeSeconds((prev) => Math.max(0, prev - 60));
      }
    } else {
      setSecondsRemaining((prev) => prev + 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(selectedPreset);
    setOvertimeSeconds(0);
  };

  const isOvertime = secondsRemaining === 0 && overtimeSeconds > 0;

  const formatDisplayTime = () => {
    if (isOvertime) {
      const mins = Math.floor(overtimeSeconds / 60);
      const secs = overtimeSeconds % 60;
      return `+${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
      <div
        className={`rounded-3xl border-2 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 w-80 select-none ${
          isOvertime
            ? "bg-rose-950/90 border-rose-500 shadow-rose-950/60"
            : "bg-slate-900/95 border-slate-700 shadow-slate-950/80"
        }`}
      >
        {/* Üst Bar: Başlık & Kapatma Butonu (✕) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Timer
              className={`w-4 h-4 ${
                isOvertime ? "text-rose-400 animate-spin" : "text-amber-400"
              }`}
            />
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isOvertime ? "text-rose-300" : "text-white"
              }`}
            >
              {isOvertime ? "Ek Süre Sayılıyor" : "Akıllı Sayaç"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Büyük Zaman Göstergesi */}
        <div className="py-4 text-center">
          <span
            className={`text-5xl font-black font-mono tracking-wider transition-colors ${
              isOvertime
                ? "text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse"
                : secondsRemaining <= 10 && secondsRemaining > 0
                ? "text-amber-400 animate-pulse"
                : "text-white"
            }`}
          >
            {formatDisplayTime()}
          </span>
          {isOvertime && (
            <p className="text-[11px] text-rose-300 font-semibold mt-1">
              Süre doldu, ek süre devam ediyor
            </p>
          )}
        </div>

        {/* 30s / 1dk / 3dk Seçenekleri */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "30s", val: 30 },
            { label: "1 dk", val: 60 },
            { label: "3 dk", val: 180 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => handleStartPreset(preset.val)}
              className={`py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                selectedPreset === preset.val && !isOvertime
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Aksiyon Butonları: [ +1 Dk ] ve [ Başlat/Durdur / Sıfırla ] */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleAddOneMinute}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 transition cursor-pointer"
            title="1 Dakika Ek Süre Ver"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+1 Dk</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md ${
              isRunning
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? "Durdur" : "Başlat"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

