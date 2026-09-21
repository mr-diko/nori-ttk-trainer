import React, { useState } from 'react';
import { ExamQuestion } from '../../types/ttk';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, AlertTriangle, BookmarkPlus, Check, Sparkles, ArrowRight } from 'lucide-react';

interface ExamResultsProps {
  questions: ExamQuestion[];
  answers: boolean[];
  onRestart: () => void;
  onGoToDecks?: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  questions,
  answers,
  onRestart,
  onGoToDecks,
}) => {
  const { createCustomDeck, saveExamResult } = useApp();
  const [deckCreated, setDeckCreated] = useState(false);

  const total = questions.length;
  const correct = answers.filter(Boolean).length;
  const percentage = Math.round((correct / total) * 100);

  // Identify mistakes
  const mistakes = questions
    .map((q, idx) => ({ question: q, isCorrect: answers[idx] }))
    .filter(item => !item.isCorrect);

  const mistakeDishIds = Array.from(new Set(mistakes.map(m => m.question.dish.id)));

  React.useEffect(() => {
    // Save to exam history
    saveExamResult({
      date: Date.now(),
      totalQuestions: total,
      correctCount: correct,
      percentage,
      mistakeDishIds,
    });

    if (percentage >= 80) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, []);

  const handleCreateMistakesDeck = () => {
    if (mistakeDishIds.length === 0) return;
    const dateStr = new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    createCustomDeck(
      `Помилки в тесті (${dateStr})`,
      mistakeDishIds,
      `Колода для відпрацювання ${mistakeDishIds.length} помилок з тесту`,
      true
    );
    setDeckCreated(true);
  };

  let title = 'Потрібно повторити ТТК';
  let colorClass = 'text-rose-400';
  let badgeBg = 'bg-rose-500/20 border-rose-500/30';

  if (percentage >= 90) {
    title = 'Відмінно! Знання ТТК на рівні Шефа!';
    colorClass = 'text-emerald-400';
    badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
  } else if (percentage >= 70) {
    title = 'Хороший результат! Але є дрібні нюанси';
    colorClass = 'text-amber-400';
    badgeBg = 'bg-amber-500/20 border-amber-500/30';
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Result Card */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-10 text-center backdrop-blur-md shadow-2xl">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border ${badgeBg}`}>
          <Award className={`w-10 h-10 ${colorClass}`} />
        </div>

        <div className={`text-4xl sm:text-5xl font-black mb-1 ${colorClass}`}>
          {percentage}%
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mb-3">
          Правильно: <strong className="text-white">{correct}</strong> з {total} запитань
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
          {title}
        </h2>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Пройти тест ще раз
          </button>

          {mistakes.length > 0 && !deckCreated && (
            <button
              type="button"
              onClick={handleCreateMistakesDeck}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all active:scale-95 border border-rose-500/50"
            >
              <BookmarkPlus className="w-4 h-4" />
              Створити колоду з помилок ({mistakeDishIds.length})
            </button>
          )}

          {deckCreated && (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-600 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Колоду створено! Вона вже у розділі «Колоди»
            </div>
          )}
        </div>
      </div>

      {/* Review mistakes list */}
      {mistakes.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 backdrop-blur-md shadow-xl">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            Аналіз помилок ({mistakes.length}):
          </h3>

          <div className="space-y-3">
            {mistakes.map((m, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-750 text-xs sm:text-sm space-y-1"
              >
                <div className="font-semibold text-slate-200">
                  {m.question.question}
                </div>
                <div className="text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                  <span>Правильна відповідь:</span>
                  <span className="bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 font-mono">
                    {m.question.correctAnswer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
