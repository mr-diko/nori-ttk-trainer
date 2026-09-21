import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { FlashcardItem } from './FlashcardItem';
import { DeckSelector } from './DeckSelector';
import { Dish } from '../../types/ttk';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Award, Layers, ChevronRight, ArrowLeft } from 'lucide-react';

interface FlashcardViewProps {
  initialDish?: Dish | null;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ initialDish }) => {
  const { menuData, cardProgress, updateCardProgress, customDecks, activeDeckId, setActiveDeckId } = useApp();

  const [selectedDeck, setSelectedDeck] = useState<string>(activeDeckId || 'all');
  const [queue, setQueue] = useState<Dish[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionRound, setSessionRound] = useState(1);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  // Synchronize with external activeDeckId
  useEffect(() => {
    if (activeDeckId) {
      setSelectedDeck(activeDeckId);
    }
  }, [activeDeckId]);

  // Compute eligible dishes for selected deck
  const deckDishes = useMemo(() => {
    if (initialDish) {
      return [initialDish];
    }

    if (selectedDeck === 'all') {
      return [...menuData.dishes];
    }

    if (selectedDeck === 'learning') {
      const learning = menuData.dishes.filter(
        d => cardProgress[d.id]?.status === 'learning'
      );
      // If none in learning, fallback to first 10
      return learning.length > 0 ? learning : menuData.dishes.slice(0, 10);
    }

    if (selectedDeck === 'mastered') {
      return menuData.dishes.filter(
        d => cardProgress[d.id]?.status === 'mastered'
      );
    }

    if (selectedDeck.startsWith('cat:')) {
      const cat = selectedDeck.replace('cat:', '');
      return menuData.dishes.filter(d => d.category === cat);
    }

    if (selectedDeck.startsWith('custom:')) {
      const customId = selectedDeck.replace('custom:', '');
      const custom = customDecks.find(d => d.id === customId);
      if (custom) {
        return menuData.dishes.filter(d => custom.dishIds.includes(d.id));
      }
    }

    return menuData.dishes;
  }, [selectedDeck, menuData.dishes, cardProgress, customDecks, initialDish]);

  // Initialize or restart session
  const startSession = useCallback((dishesList: Dish[]) => {
    // Shuffle dishes
    const shuffled = [...dishesList].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionTotal(shuffled.length);
    setSessionCorrectCount(0);
    setSessionRound(1);
    setIsSessionCompleted(false);
  }, []);

  useEffect(() => {
    if (deckDishes.length > 0) {
      startSession(deckDishes);
    } else {
      setQueue([]);
      setIsSessionCompleted(false);
    }
  }, [deckDishes, startSession]);

  const currentDish = queue[currentIndex];

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentDish) return;

    // Update global progress in storage
    updateCardProgress(currentDish.id, isCorrect);

    setIsFlipped(false);

    if (isCorrect) {
      setSessionCorrectCount(prev => prev + 1);

      // Remove from queue or advance
      const nextQueue = queue.filter((_, idx) => idx !== currentIndex);
      if (nextQueue.length === 0) {
        // Session complete!
        setIsSessionCompleted(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setQueue(nextQueue);
        setCurrentIndex(prev => (prev >= nextQueue.length ? 0 : prev));
      }
    } else {
      // Re-queue card to the end of the round
      const failedItem = queue[currentIndex];
      const remaining = queue.filter((_, idx) => idx !== currentIndex);
      const updatedQueue = [...remaining, failedItem];
      setQueue(updatedQueue);
      setCurrentIndex(prev => (prev >= updatedQueue.length ? 0 : prev));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.code === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        handleAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDish, queue, currentIndex, isFlipped]);

  const progressPercent = sessionTotal > 0 
    ? Math.round(((sessionTotal - queue.length) / sessionTotal) * 100) 
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Deck selector dropdown / pills */}
      <DeckSelector
        activeDeckId={selectedDeck}
        onSelectDeck={(deckId) => {
          setSelectedDeck(deckId);
          setActiveDeckId(deckId);
        }}
      />

      {/* Main card training view */}
      {queue.length === 0 && !isSessionCompleted ? (
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-12 text-center shadow-xl">
          <div className="text-4xl mb-3">🎴</div>
          <h3 className="text-lg font-bold text-white mb-1">
            У цій колоді немає карток
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Виберіть іншу колоду вище або додайте страви до власних наборів у каталозі ТТК.
          </p>
          <button
            type="button"
            onClick={() => setSelectedDeck('all')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Вчити всі страви меню
          </button>
        </div>
      ) : isSessionCompleted ? (
        /* Completion Screen */
        <div className="bg-slate-800/70 border-2 border-emerald-500/50 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 animate-bounce">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Чудова робота! Раунд завершено!
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            Ви успішно повторили всі <strong>{sessionTotal}</strong> карток з обраної колоди.
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => startSession(deckDishes)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Повторити колоду ще раз
            </button>
            <button
              type="button"
              onClick={() => setSelectedDeck('all')}
              className="px-6 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Layers className="w-4 h-4" />
              Вибрати іншу колоду
            </button>
          </div>
        </div>
      ) : (
        /* Active flashcard round */
        <div className="space-y-4">
          {/* Progress bar and counter */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Картка {sessionTotal - queue.length + 1} з {sessionTotal}
              </span>
              <span>Залишилось вивчити: <strong className="text-emerald-400">{queue.length}</strong></span>
            </div>
            {/* Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard Component */}
          {currentDish && (
            <FlashcardItem
              key={currentDish.id}
              dish={currentDish}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onAnswer={handleAnswer}
            />
          )}

          {/* Keyboard hints banner on desktop */}
          <div className="hidden sm:flex items-center justify-center gap-6 text-[11px] text-slate-500 pt-3">
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Space</kbd> Перевернути</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">←</kbd> або <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">1</kbd> Повторити</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">→</kbd> або <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">2</kbd> Знаю</span>
          </div>
        </div>
      )}
    </div>
  );
};
