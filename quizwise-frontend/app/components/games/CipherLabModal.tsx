"use client";

import React from "react";
import { KeyRound, X, CheckCircle2, Check, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export interface AcademicWord {
  word: string;
  meaning: string;
  clue: string;
  sentence: string;
}

export interface CipherLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  cipherIndex: number;
  cipherInput: string;
  setCipherInput: (val: string) => void;
  cipherFeedback: "idle" | "correct" | "wrong";
  setCipherFeedback: (val: "idle" | "correct" | "wrong") => void;
  cipherScore: number;
  words: AcademicWord[];
  startCipherGame: () => void;
  handleCheckCipher: (e?: React.FormEvent) => void;
}

export default function CipherLabModal({
  isOpen,
  onClose,
  cipherIndex,
  cipherInput,
  setCipherInput,
  cipherFeedback,
  setCipherFeedback,
  cipherScore,
  words,
  startCipherGame,
  handleCheckCipher,
}: CipherLabModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t("cipher_lab_title", "Şifreli Kelime (Cipher Lab)")}</h3>
              <p className="text-xs text-slate-400">{t("cipher_lab_desc", "İpucu ve bağlam cümlesinden gizli kelimeyi çözün")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              {t("cipher_score", "Skor: {cur} / {total}", { cur: cipherScore, total: words.length })}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {cipherIndex >= words.length ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-white">Tüm Kelimeler Çözüldü!</h4>
            <p className="text-sm text-slate-300">
              Akademik kelime dağarcığınız mükemmel seviyede.
            </p>
            <button
              type="button"
              onClick={startCipherGame}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Tekrar Başlat
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* İpucu ve Cümle */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{t("label_turkish_meaning", "Anlamı:")}</span>
                <span className="text-emerald-300 font-bold">{words[cipherIndex]?.meaning}</span>
              </div>
              <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 leading-relaxed">
                <span className="text-slate-500 block mb-1 font-semibold uppercase text-[10px]">{t("label_context_sentence", "BAĞLAM CÜMLESİ:")}</span>
                <p className="italic text-slate-200">"{words[cipherIndex]?.sentence}"</p>
              </div>
            </div>

            {/* Maskelenmiş Kelime Görseli */}
            <div className="flex justify-center items-center gap-2 flex-wrap py-2">
              {words[cipherIndex]?.word.split("").map((letter, idx) => {
                const isRevealed = idx === 0 || idx === words[cipherIndex]?.word.length - 1 || idx % 3 === 0;
                return (
                  <div
                    key={idx}
                    className="w-10 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-base font-bold text-white shadow-inner"
                  >
                    {isRevealed ? letter.toUpperCase() : "_"}
                  </div>
                );
              })}
            </div>

            {/* Giriş Formu */}
            <form onSubmit={handleCheckCipher} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cipherInput}
                  onChange={(e) => {
                    setCipherInput(e.target.value);
                    setCipherFeedback("idle");
                  }}
                  placeholder={t("input_cipher_placeholder", "İngilizce kelimeyi buraya yazın...")}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  {t("btn_check_answer", "Kontrol Et")}
                </button>
              </div>

              {cipherFeedback === "correct" && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Harika! Doğru Kelime: {words[cipherIndex]?.word}</span>
                </div>
              )}

              {cipherFeedback === "wrong" && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Yanıt hatalı, ipucunu inceleyip tekrar deneyin.</span>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
