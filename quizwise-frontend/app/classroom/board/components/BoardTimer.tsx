"use client";

import React, { useState, useEffect, useRef } from "react";
import { Timer, Plus, X, Play, Pause, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "../../../context/LanguageContext";

export interface BoardTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoardTimer({ isOpen, onClose }: BoardTimerProps) {
  const { t } = useLanguage();
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
    <div className="fixed bottom-20 right-6 z-40 animate-in slide-in-from-bottom-3 duration-200 max-w-[calc(100vw-2rem)]">
      <div
        className={`px-3.5 py-2 rounded-2xl border shadow-xl backdrop-blur-md flex flex-wrap items-center gap-2.5 select-none transition-colors ${
          isOvertime
            ? "bg-rose-950/95 border-rose-500/70"
            : "bg-slate-900/95 border-slate-700/80"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Timer
            className={`w-4 h-4 shrink-0 ${
              isOvertime ? "text-rose-400 animate-spin" : "text-amber-400"
            }`}
          />
          <span
            className={`text-lg font-mono font-bold tracking-tight ${
              isOvertime
                ? "text-rose-300 animate-pulse"
                : secondsRemaining <= 10 && secondsRemaining > 0
                ? "text-amber-400 animate-pulse"
                : "text-white"
            }`}
          >
            {formatDisplayTime()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { label: "30s", val: 30 },
            { label: "1m", val: 60 },
            { label: "3m", val: 180 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => handleStartPreset(preset.val)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition cursor-pointer ${
                selectedPreset === preset.val && !isOvertime
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800/90 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleAddOneMinute}
            className="px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-emerald-300 text-[11px] font-bold font-mono transition cursor-pointer"
            title={t("brd_timer_add1m_tip", "1 Dakika Ek Süre Ver")}
          >
            +1m
          </button>
        </div>

        <div className="flex items-center gap-1 pl-1 border-l border-slate-700/80">
          <button
            type="button"
            onClick={() => setIsRunning((prev) => !prev)}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
            title={isRunning ? t("brd_timer_pause", "Durdur") : t("brd_timer_start", "Başlat")}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={t("brd_timer_reset", "Sıfırla")}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={t("close", "Kapat")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

