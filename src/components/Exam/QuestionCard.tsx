import React, { useState } from 'react';
import { ExamQuestion } from '../../types/ttk';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelected: (isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSelected,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.correctAnswer;

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!isAnswered) return;
    onAnswerSelected(isCorrect);
    setSelectedOption(null);
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl dark:shadow-2xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          Запитання {questionNumber} з {totalQuestions}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-medium">
          {question.dish.category}
        </span>
      </div>

      {/* Question Prompt */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
          {question.question}
        </h2>
        {question.dish.totalWeight && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Вихід страви: <strong className="text-slate-800 dark:text-slate-200">{question.dish.totalWeight}</strong>
          </p>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => {
          let btnStyle = 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100';

          if (isAnswered) {
            if (option === question.correctAnswer) {
              btnStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold ring-1 ring-emerald-500';
            } else if (option === selectedOption) {
              btnStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200 font-bold ring-1 ring-rose-500';
            } else {
              btnStyle = 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(option)}
              className={`w-full p-4 rounded-2xl border text-left text-sm sm:text-base font-medium flex items-center justify-between transition-all duration-150 ${btnStyle}`}
            >
              <span>{option}</span>
              {isAnswered && option === question.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              )}
              {isAnswered && option === selectedOption && option !== question.correctAnswer && (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next button */}
      {isAnswered && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm">
            {isCorrect ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Чудово! Правильна відповідь.
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Помилка! Правильна відповідь: {question.correctAnswer}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all active:scale-95"
          >
            <span>{questionNumber === totalQuestions ? 'Завершити тест' : 'Наступне запитання'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
