import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuizGenerator } from '../../services/quizGenerator';
import { ExamQuestion } from '../../types/ttk';
import { QuestionCard } from './QuestionCard';
import { ExamResults } from './ExamResults';
import { HelpCircle, Play, History, CheckCircle2, Sliders } from 'lucide-react';

export const ExamView: React.FC = () => {
  const { menuData, ignoreDecor, isIngredientDecor, examHistory } = useApp();

  const [testState, setTestState] = useState<'config' | 'running' | 'results'>('config');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const handleStartExam = () => {
    const generated = QuizGenerator.generateExam(
      menuData.dishes,
      questionCount,
      selectedCategory === 'all' ? null : selectedCategory,
      ignoreDecor,
      isIngredientDecor
    );

    if (generated.length === 0) return;

    setQuestions(generated);
    setCurrentIndex(0);
    setAnswers([]);
    setTestState('running');
  };

  const handleAnswerSelected = (isCorrect: boolean) => {
    const nextAnswers = [...answers, isCorrect];
    setAnswers(nextAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setTestState('results');
    }
  };

  const handleRestart = () => {
    handleStartExam();
  };

  const handleBackToConfig = () => {
    setTestState('config');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {testState === 'config' && (
        <div className="space-y-6">
          {/* Intro & Setup */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 justify-center sm:justify-start">
                  <HelpCircle className="w-8 h-8 text-emerald-400" />
                  Екзаменатор ТТК
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Перевірте знання точного складу та грамовок інгредієнтів у меню
                </p>
              </div>

              {ignoreDecor && (
                <div className="text-xs px-3 py-1.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Режим «Без декору» активний
                </div>
              )}
            </div>

            {/* Config selectors */}
            <div className="space-y-5 pt-4 border-t border-slate-700/60">
              {/* Category picker */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Категорія для тестування:
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Всі категорії меню ({menuData.dishes.length} страв)</option>
                  {menuData.categories
                    .filter(c => c !== 'Заготовки' && c !== 'Набори 2026')
                    .map(cat => (
                      <option key={cat} value={cat}>
                        {cat} ({menuData.dishes.filter(d => d.category === cat).length} страв)
                      </option>
                    ))}
                </select>
              </div>

              {/* Number of questions */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Кількість запитань:
                </label>
                <div className="flex items-center gap-3">
                  {[5, 10, 15, 20].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                        questionCount === count
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {count} питань
                    </button>
                  ))}
                </div>
              </div>

              {/* Start button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/50 transition-all active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Розпочати тестування
                </button>
              </div>
            </div>
          </div>

          {/* Previous exam attempts history */}
          {examHistory.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-emerald-400" />
                Історія ваших тестів:
              </h3>
              <div className="space-y-2">
                {examHistory.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                  >
                    <div>
                      <span className="font-semibold text-white">
                        {item.percentage}% успішності
                      </span>
                      <span className="text-slate-400 ml-2">
                        ({item.correctCount}/{item.totalQuestions} правильних)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(item.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {testState === 'running' && questions[currentIndex] && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Питання {currentIndex + 1} з {questions.length}</span>
              <span>{Math.round(((currentIndex) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question card */}
          <QuestionCard
            question={questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onAnswerSelected={handleAnswerSelected}
          />
        </div>
      )}

      {testState === 'results' && (
        <ExamResults
          questions={questions}
          answers={answers}
          onRestart={handleRestart}
          onGoToDecks={handleBackToConfig}
        />
      )}
    </div>
  );
};
