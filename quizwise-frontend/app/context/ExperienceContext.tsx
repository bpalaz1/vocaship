"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GraduationCap, Gamepad2, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export type ExperienceMode = "academic" | "arcade";

interface ExperienceContextType {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  toggleMode: () => void;
  isWelcomeModalOpen: boolean;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
}

const ExperienceContext = createContext<ExperienceContextType>({
  mode: "academic",
  setMode: () => {},
  toggleMode: () => {},
  isWelcomeModalOpen: false,
  openWelcomeModal: () => {},
  closeWelcomeModal: () => {},
});

export const ExperienceProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ExperienceMode>("academic");
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedMode = (localStorage.getItem("vocaship_persona_mode") ||
        localStorage.getItem("quizwise_persona_mode")) as ExperienceMode | null;
      if (savedMode === "academic" || savedMode === "arcade") {
        setModeState(savedMode);
      } else {
        // İlk kez gelen kullanıcı: varsayılan academic yap ve hoş geldin modalını aç
        setModeState("academic");
        setIsWelcomeModalOpen(true);
      }
    } catch (e) {
      // localStorage erişilemezse varsayılan 'academic' kalır
    }
  }, []);

  const setMode = (newMode: ExperienceMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem("vocaship_persona_mode", newMode);
    } catch (e) {
      console.error("localStorage kaydedilemedi:", e);
    }
  };

  const toggleMode = () => {
    const nextMode: ExperienceMode = mode === "academic" ? "arcade" : "academic";
    setMode(nextMode);
  };

  const openWelcomeModal = () => setIsWelcomeModalOpen(true);
  const closeWelcomeModal = () => setIsWelcomeModalOpen(false);

  const selectInitialMode = (chosenMode: ExperienceMode) => {
    setMode(chosenMode);
    setIsWelcomeModalOpen(false);
  };

  return (
    <ExperienceContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isWelcomeModalOpen,
        openWelcomeModal,
        closeWelcomeModal,
      }}
    >
      {children}

      {/* İLK GİRİŞ HOŞ GELDİNİZ (DUAL-PERSONA) KARŞILAMA MODALI */}
      {mounted && isWelcomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
            {/* Arka plan ışıltısı */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Başlık */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Vocaship Kişiselleştirme</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Vocaship&apos;i nasıl kullanmak istersiniz?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Vocaship hem ciddi akademik sınavlar ve kariyer hedefleri için hem de sınıf içi etkileşimli oyunlar için özel optimize edilmiştir.
              </p>
            </div>

            {/* 2 Seçenek Kartı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* 1. SEÇENEK: AKADEMİK */}
              <button
                type="button"
                onClick={() => selectInitialMode("academic")}
                className="group relative flex flex-col items-start p-5 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-900 border-2 border-indigo-500/40 hover:border-indigo-400 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 active:scale-95 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-1 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Yetişkin & Sınav</span>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-200">
                    Sınav & Profesyonel Odak
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    YDS, YÖKDİL, IELTS, serbest makale okuyucu ve bilimsel Ebbinghaus SM-2 aralıklı tekrar.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                  <span>Bu Modu Seç</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 2. SEÇENEK: ARCADE & SINIF */}
              <button
                type="button"
                onClick={() => selectInitialMode("arcade")}
                className="group relative flex flex-col items-start p-5 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-900 border-2 border-amber-500/30 hover:border-amber-400 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-3 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div className="space-y-1 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Genç & Sınıf</span>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-200">
                    Oyun & Sınıf Modu
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hazine Avı, Boss Fight canavar savaşı, sınıf içi canlı yarışma ve gizemli sandıklar.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <span>Bu Modu Seç</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Alt Bilgi */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                İstediğiniz zaman üst bardan tek tıkla değiştirebilirsiniz.
              </span>
              <button
                type="button"
                onClick={() => selectInitialMode("academic")}
                className="text-slate-400 hover:text-white underline underline-offset-2 cursor-pointer"
              >
                Atla
              </button>
            </div>
          </div>
        </div>
      )}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => useContext(ExperienceContext);
