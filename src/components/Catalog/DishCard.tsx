import React, { useState } from 'react';
import { Dish } from '../../types/ttk';
import { useApp } from '../../context/AppContext';
import { Sparkles, Star, Layers, CheckCircle2, CircleDot, Eye, EyeOff } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
  onStudyOnCard?: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onStudyOnCard }) => {
  const { ignoreDecor, isIngredientDecor, customDecks, toggleDishInDeck, cardProgress } = useApp();
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [showDecorAnyway, setShowDecorAnyway] = useState(false);

  const baseIngredients = dish.ingredients.filter(i => !isIngredientDecor(i));
  const decorIngredients = dish.ingredients.filter(i => isIngredientDecor(i));

  const progress = cardProgress[dish.id];
  const isMastered = progress?.status === 'mastered';
  const isLearning = progress?.status === 'learning';

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between backdrop-blur-sm">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                {dish.category}
              </span>
              {dish.totalWeight && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                  {dish.totalWeight}
                </span>
              )}
              {dish.pieces && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-sky-950/70 text-sky-400 border border-sky-800/50">
                  {dish.pieces}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide leading-snug">
              {dish.name}
            </h3>
          </div>

          {/* Mastery status badge */}
          <div>
            {isMastered ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Вивчено
              </span>
            ) : isLearning ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <CircleDot className="w-3.5 h-3.5" />
                Вчуся
              </span>
            ) : null}
          </div>
        </div>

        {/* Base ingredients */}
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Основний склад ({baseIngredients.length}):
          </div>
          <div className="space-y-1.5">
            {baseIngredients.map((ing, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between text-sm py-1 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <span className="text-slate-200 font-medium">{ing.name}</span>
                <span className="font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/40">
                  {ing.weight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Decor section */}
        {decorIngredients.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Декор та поливи ({decorIngredients.length}):
              </div>
              {ignoreDecor && (
                <button
                  type="button"
                  onClick={() => setShowDecorAnyway(!showDecorAnyway)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  {showDecorAnyway ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showDecorAnyway ? 'Сховати' : 'Показати'}
                </button>
              )}
            </div>

            {(!ignoreDecor || showDecorAnyway) ? (
              <div className="space-y-1.5">
                {decorIngredients.map((ing, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between text-sm py-1 px-2.5 rounded-lg bg-teal-950/30 border border-teal-800/40"
                  >
                    <span className="text-teal-200 flex items-center gap-1.5">
                      <span className="text-[10px] px-1 py-0.2 bg-teal-900/60 text-teal-300 rounded border border-teal-700/50 font-mono">
                        ДЕКОР
                      </span>
                      {ing.name}
                    </span>
                    <span className="font-semibold text-teal-300 bg-teal-900/50 px-2 py-0.5 rounded border border-teal-700/40">
                      {ing.weight}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-900/40 rounded-lg p-2 text-center border border-slate-800/60 italic">
                🌿 Приховано режимом «Без декору» ({decorIngredients.length} інгредієнти)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / actions */}
      <div className="mt-5 pt-3 border-t border-slate-700/70 flex items-center justify-between gap-2 relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDeckPicker(!showDeckPicker)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            У колоду
          </button>

          {/* Deck selector dropdown */}
          {showDeckPicker && (
            <div className="absolute left-0 bottom-full mb-2 w-56 bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-2xl z-30">
              <div className="text-xs font-semibold text-slate-300 px-2 py-1 mb-1 border-b border-slate-700 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Додати до колоди:
              </div>
              {customDecks.length === 0 ? (
                <div className="text-xs text-slate-400 p-2 text-center">
                  Ще немає власних колод. Створіть їх у розділі «Колоди»!
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {customDecks.map(deck => {
                    const inDeck = deck.dishIds.includes(dish.id);
                    return (
                      <button
                        key={deck.id}
                        type="button"
                        onClick={() => toggleDishInDeck(deck.id, dish.id)}
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          inDeck 
                            ? 'bg-emerald-950/70 text-emerald-300 font-medium' 
                            : 'hover:bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{deck.name}</span>
                        {inDeck && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {onStudyOnCard && (
          <button
            type="button"
            onClick={() => onStudyOnCard(dish)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Вчити на картці
          </button>
        )}
      </div>
    </div>
  );
};
