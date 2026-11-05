"use client";

import React from "react";
import { HelpCircle, Check, X, Trophy, Mic, CheckCircle, Lightbulb } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export interface CleanQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
  distractor_reasons?: Record<number, string>;
}

export interface ComprehensionQuizProps {
  questions: CleanQuestion[];
  userAnswers: Record<number, number>;
  onAnswerQuestion: (qIdx: number, optIdx: number, correctIdx: number) => void;
  onFinishStory?: () => void;
  onDebateStory?: () => void;
  isCompleted?: boolean;
  className?: string;
}

export default function ComprehensionQuiz({
  questions,
  userAnswers,
  onAnswerQuestion,
  onFinishStory,
  onDebateStory,
  isCompleted = false,
  className = "",
}: ComprehensionQuizProps) {
  const { t } = useLanguage();

  if (!questions || questions.length === 0) {
    return null;
  }

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.filter(
    (q, idx) => userAnswers[idx] === q.correct_answer_index
  ).length;
  const isQuizComplete = totalQuestions > 0 && answeredCount === totalQuestions;
  const earnedXP = correctCount * 10;

  return (
    <div className={`pt-8 border-t border-slate-800 space-y-5 ${className}`}>
      {/* Başlık ve İlerleme Sayacı */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{t("comprehension_questions_title", "Okuma Anlama Soruları")}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {t(
                "questions_instruction_hint",
                "Metni ne kadar anladığınızı test edin. Şıklardan birine tıklayarak cevabınızı verin."
              )}
            </p>
          </div>
        </div>
        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/80 flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              answeredCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
            }`}
          />
          <span>
            {t(
              "questions_progress_counter",
              "{answered} / {total} Cevaplandı ({correct} Doğru)",
              {
                answered: answeredCount,
                total: totalQuestions,
                correct: correctCount,
              }
            )}
          </span>
        </div>
      </div>

      {/* Sorular Listesi */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const selectedOpt = userAnswers[qIdx];
          const isAnswered = selectedOpt !== undefined;
          const correctIndex = q.correct_answer_index;
          const isQuestionCorrect = isAnswered && selectedOpt === correctIndex;

          return (
            <div
              key={qIdx}
              className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3.5 shadow-inner"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm sm:text-base font-semibold text-slate-100 flex items-start gap-2">
                  <span className="text-indigo-400 font-bold font-mono shrink-0">
                    {qIdx + 1}.
                  </span>
                  <span>{q.question}</span>
                </h4>
                {isAnswered && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                      isQuestionCorrect
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {isQuestionCorrect ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {isQuestionCorrect
                      ? t("badge_correct", "Doğru")
                      : t("badge_incorrect", "Yanlış")}
                  </span>
                )}
              </div>

              {/* Şıklar Grid */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 ${
                  isAnswered ? "pointer-events-none" : ""
                }`}
              >
                {q.options.map((opt, optIdx) => {
                  const isSelected = isAnswered && selectedOpt === optIdx;
                  const isCorrectChoice = optIdx === correctIndex;

                  let containerStyle = "";
                  if (!isAnswered) {
                    containerStyle =
                      "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200 cursor-pointer active:ring-2 active:ring-emerald-400 active:bg-emerald-500/20 transition-colors";
                  } else {
                    if (isCorrectChoice) {
                      if (isSelected) {
                        containerStyle =
                          "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10 pointer-events-none ring-1 ring-emerald-500/40";
                      } else {
                        containerStyle =
                          "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 shadow-sm pointer-events-none ring-1 ring-emerald-500/30";
                      }
                    } else if (isSelected) {
                      containerStyle =
                        "border-rose-600/60 bg-rose-950/40 text-rose-200 shadow-sm shadow-rose-500/10 pointer-events-none";
                    } else {
                      containerStyle =
                        "border-slate-800/60 bg-slate-900/40 text-slate-600 opacity-40 pointer-events-none";
                    }
                  }

                  const letterBadge = (
                    <span
                      className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${
                        !isAnswered
                          ? "bg-slate-800 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-300"
                          : isCorrectChoice && isSelected
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : isCorrectChoice
                          ? "bg-emerald-500/30 text-emerald-300 font-bold"
                          : isSelected
                          ? "bg-rose-500 text-white font-bold"
                          : "bg-slate-800/50 text-slate-600"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                  );

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => onAnswerQuestion(qIdx, optIdx, correctIndex)}
                      className={`group p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left flex items-center justify-between gap-3 shadow-sm ${containerStyle}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="radio"
                          name={`reading_q_${qIdx}`}
                          checked={userAnswers[qIdx] === optIdx}
                          onChange={() => {}}
                          disabled={isAnswered}
                          className="accent-emerald-500 cursor-pointer shrink-0 pointer-events-none"
                        />
                        {letterBadge}
                        <span className="leading-snug break-words">{opt}</span>
                      </div>

                      {isAnswered && isCorrectChoice && (
                        <span className="flex items-center gap-1 text-emerald-300 shrink-0 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {isSelected
                              ? t("badge_correct", "Doğru")
                              : t("badge_correct_answer", "Doğru Cevap")}
                          </span>
                        </span>
                      )}
                      {isAnswered && isSelected && !isCorrectChoice && (
                        <span className="flex items-center gap-1 text-rose-300 shrink-0 font-bold text-xs bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                          <X className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {t("badge_incorrect", "Yanlış")}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Akıllı Hata Dedektörü (Neden Yanlış Yaptım?) Geri Bildirim Kutusu */}
              {isAnswered && !isQuestionCorrect && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm shadow-amber-500/5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <span>{t("why_wrong_title", "Neden Yanıldın?")}</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
                        {t("smart_error_detector", "Akıllı Hata Dedektörü")}
                      </span>
                    </p>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      {q.distractor_reasons?.[selectedOpt] ||
                        q.explanation ||
                        t(
                          "default_distractor_reason",
                          "Metindeki anahtar fiilin özneyle olan bağlamına ve cümledeki zaman belirteçlerine dikkat et."
                        )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Skor ve Ödül Kartı */}
      {isQuizComplete && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-indigo-950/60 to-slate-900 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-400/30 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {correctCount === totalQuestions
                    ? `Tebrikler! ${totalQuestions}/${totalQuestions} Doğru (+${earnedXP} XP Kazandınız 🏆)`
                    : `Test Tamamlandı: ${correctCount}/${totalQuestions} Doğru (+${earnedXP} XP Kazandınız 🏆)`}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  {correctCount === totalQuestions
                    ? "Harika bir okuma performansı! Tüm anlama sorularını doğru yanıtladınız."
                    : `${totalQuestions} anlama sorusundan ${correctCount} tanesini doğru bildiniz.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onDebateStory && (
                <button
                  type="button"
                  onClick={onDebateStory}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition active:scale-95 cursor-pointer"
                  title="Bu hikayeyi AI Speaking Lounge'da sesli tartış"
                >
                  <Mic className="w-4 h-4 text-violet-200" />
                  <span>🎙️ Karakterle Tartış</span>
                </button>
              )}

              {onFinishStory && (
                <button
                  onClick={onFinishStory}
                  disabled={isCompleted}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition active:scale-95 shrink-0 ${
                    isCompleted
                      ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 cursor-pointer"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isCompleted ? "Okuma Tamamlandı ✓" : "Okumayı Tamamla"}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>
                Başarı Oranı: %{Math.round((correctCount / totalQuestions) * 100)}
              </span>
              <span className="text-amber-400 font-bold">+{earnedXP} XP</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{
                  width: `${Math.round((correctCount / totalQuestions) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

