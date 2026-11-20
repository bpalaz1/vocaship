"use client";

import React from "react";
import { HelpCircle, Check, X, Trophy, Mic, CheckCircle, Lightbulb } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppTheme } from "../../context/ThemeContext";

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
  const { isDark } = useAppTheme();

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
    <div className={`pt-8 border-t space-y-5 ${isDark ? "border-slate-800" : "border-slate-300"} ${className}`}>
      {/* Başlık ve İlerleme Sayacı */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/25" : "bg-amber-100 text-amber-700 border-amber-300"}`}>
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              <span>{t("comprehension_questions_title", "Okuma Anlama Soruları")}</span>
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {t(
                "questions_instruction_hint",
                "Metni ne kadar anladığınızı test edin. Şıklardan birine tıklayarak cevabınızı verin."
              )}
            </p>
          </div>
        </div>
        <div className={`text-xs font-mono px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${isDark ? "bg-slate-800/80 text-slate-300 border-slate-700/80" : "bg-[#f8fafc] text-slate-800 border-slate-300"}`}>
          <span
            className={`w-2 h-2 rounded-full ${
              answeredCount > 0 ? "bg-emerald-500 animate-pulse" : isDark ? "bg-slate-500" : "bg-slate-400"
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
              className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${isDark ? "bg-slate-900/90 border-slate-800 shadow-inner" : "bg-[#f8fafc] border-slate-300 shadow-sm"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className={`text-sm sm:text-base font-semibold flex items-start gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  <span className={`font-bold font-mono shrink-0 ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>
                    {qIdx + 1}.
                  </span>
                  <span>{q.question}</span>
                </h4>
                {isAnswered && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 border ${
                      isQuestionCorrect
                        ? isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : isDark ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-rose-100 text-rose-800 border-rose-300"
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
                    containerStyle = isDark
                      ? "bg-slate-800/80 border-slate-700/60 text-slate-100 hover:border-blue-500 hover:bg-blue-500/15 hover:text-white cursor-pointer active:ring-2 active:ring-emerald-400 active:bg-emerald-500/20 transition-colors"
                      : "bg-slate-100 border-slate-300 text-slate-900 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer active:ring-2 active:ring-emerald-400 transition-colors";
                  } else {
                    if (isCorrectChoice) {
                      if (isSelected) {
                        containerStyle = isDark
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm pointer-events-none ring-1 ring-emerald-500/40"
                          : "border-emerald-500 bg-emerald-100 text-emerald-900 shadow-sm pointer-events-none ring-1 ring-emerald-500/40";
                      } else {
                        containerStyle = isDark
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 shadow-sm pointer-events-none ring-1 ring-emerald-500/30"
                          : "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm pointer-events-none ring-1 ring-emerald-500/30";
                      }
                    } else if (isSelected) {
                      containerStyle = isDark
                        ? "border-rose-600/60 bg-rose-950/40 text-rose-200 shadow-sm pointer-events-none"
                        : "border-rose-400 bg-rose-100 text-rose-900 shadow-sm pointer-events-none";
                    } else {
                      containerStyle = isDark
                        ? "border-slate-800/60 bg-slate-900/40 text-slate-500 opacity-60 pointer-events-none"
                        : "border-slate-200 bg-slate-100/60 text-slate-500 opacity-60 pointer-events-none";
                    }
                  }

                  const letterBadge = (
                    <span
                      className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${
                        !isAnswered
                          ? isDark
                            ? "bg-slate-800 text-slate-300 border border-slate-700 group-hover:bg-blue-500/20 group-hover:text-blue-300"
                            : "bg-white text-slate-800 border border-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-800"
                          : isCorrectChoice && isSelected
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : isCorrectChoice
                          ? isDark ? "bg-emerald-500/30 text-emerald-300 font-bold" : "bg-emerald-200 text-emerald-900 font-bold"
                          : isSelected
                          ? "bg-rose-500 text-white font-bold"
                          : isDark ? "bg-slate-800/50 text-slate-600" : "bg-slate-200 text-slate-500"
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
                        <span className={`flex items-center gap-1 shrink-0 font-bold text-xs px-2 py-0.5 rounded-md border ${isDark ? "text-emerald-300 bg-emerald-500/20 border-emerald-500/30" : "text-emerald-800 bg-emerald-100 border-emerald-300"}`}>
                          <Check className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {isSelected
                              ? t("badge_correct", "Doğru")
                              : t("badge_correct_answer", "Doğru Cevap")}
                          </span>
                        </span>
                      )}
                      {isAnswered && isSelected && !isCorrectChoice && (
                        <span className={`flex items-center gap-1 shrink-0 font-bold text-xs px-2 py-0.5 rounded-md border ${isDark ? "text-rose-300 bg-rose-500/20 border-rose-500/30" : "text-rose-800 bg-rose-100 border-rose-300"}`}>
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
                <div className={`mt-3.5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm ${isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-200" : "bg-amber-50 border-amber-300 text-amber-950"}`}>
                  <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                  <div className="space-y-0.5 min-w-0">
                    <p className={`font-semibold flex items-center gap-1.5 ${isDark ? "text-amber-300" : "text-amber-900"}`}>
                      <span>{t("why_wrong_title", "Neden Yanıldın?")}</span>
                      <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded font-mono ${isDark ? "bg-amber-400/20 text-amber-300" : "bg-amber-200 text-amber-900"}`}>
                        {t("smart_error_detector", "Akıllı Hata Dedektörü")}
                      </span>
                    </p>
                    <p className={`mt-0.5 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-800"}`}>
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
        <div
          data-theme-preserve="dark"
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-indigo-950 to-slate-900 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-400/30 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {correctCount === totalQuestions
                    ? t("read_quiz_perfect_title", "Tebrikler! {c}/{t} Doğru (+{xp} XP Kazandınız 🏆)", { c: totalQuestions, t: totalQuestions, xp: earnedXP })
                    : t("read_quiz_done_title", "Test Tamamlandı: {c}/{t} Doğru (+{xp} XP Kazandınız 🏆)", { c: correctCount, t: totalQuestions, xp: earnedXP })}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  {correctCount === totalQuestions
                    ? t("read_quiz_perfect_desc", "Harika bir okuma performansı! Tüm anlama sorularını doğru yanıtladınız.")
                    : t("read_quiz_done_desc", "{t} anlama sorusundan {c} tanesini doğru bildiniz.", { t: totalQuestions, c: correctCount })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onDebateStory && (
                <button
                  type="button"
                  onClick={onDebateStory}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition active:scale-95 cursor-pointer"
                  title={t("read_debate_title", "Bu hikayeyi AI Speaking Lounge'da sesli tartış")}
                >
                  <Mic className="w-4 h-4 text-violet-200" />
                  <span>🎙️ {t("read_quiz_debate_char", "Karakterle Tartış")}</span>
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
                    {isCompleted ? t("read_quiz_completed_btn", "Okuma Tamamlandı ✓") : t("read_quiz_complete_btn", "Okumayı Tamamla")}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>
                {t("read_quiz_success_rate", "Başarı Oranı: %{rate}", { rate: Math.round((correctCount / totalQuestions) * 100) })}
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

