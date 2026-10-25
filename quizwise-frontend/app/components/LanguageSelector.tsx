"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation, Language } from "../context/LanguageContext";
import { ChevronDown, Check, Globe } from "lucide-react";

interface LanguageSelectorProps {
  align?: "left" | "right";
  className?: string;
}

export default function LanguageSelector({ align = "right", className = "" }: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={`relative shrink-0 ${className}`} ref={containerRef}>
      {/* Tetikleyici Buton (Visible, stylish trigger) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/60 text-slate-100 font-bold text-xs transition-all duration-150 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-indigo-500/10 group cursor-pointer shrink-0"
        title="Arayüz Dilini Değiştir / Change UI Language"
        aria-label="Dil Seçici"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base leading-none filter drop-shadow-sm">
          {currentLang.flag}
        </span>
        <span className="font-mono text-xs uppercase tracking-tight text-slate-200 group-hover:text-white font-black">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-400" : ""
          }`}
        />
      </button>

      {/* Açılır Menü (Dropdown) */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "left" ? "left-0" : "right-0"
          } top-full mt-2 w-52 bg-slate-900/98 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/10`}
          role="menu"
        >
          {/* Menü Başlığı */}
          <div className="px-3 py-1.5 mb-1 border-b border-slate-800 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("ui_language") || "Arayüz Dili"}</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono font-semibold">5 Dil</span>
          </div>

          {/* 5 Dil Listesi */}
          <div className="space-y-0.5">
            {availableLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 font-bold shadow-sm shadow-indigo-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent"
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg leading-none filter drop-shadow-sm">{lang.flag}</span>
                    <span className="font-mono text-xs font-black uppercase text-slate-100">
                      {lang.code.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      ({lang.label})
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
