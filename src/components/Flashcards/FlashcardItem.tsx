import React, { useState } from 'react';
import { Dish } from '../../types/ttk';
import { useApp } from '../../context/AppContext';
import { RotateCw, Check, X, Sparkles, Scale, Eye } from 'lucide-react';

interface FlashcardItemProps {
  dish: Dish;
  isFlipped: boolean;
  onFlip: () => void;
  onAnswer: (isCorrect: boolean) => void;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({
  dish,
  isFlipped,
  onFlip,
  onAnswer,
}) => {
  const { ignoreDecor, isIngredientDecor } = useApp();
  const [showDecorOnCard, setShowDecorOnCard] = useState(false);

  const baseIngredients = dish.ingredients.filter(i => !isIngredientDecor(i));
  const decorIngredients = dish.ingredients.filter(i => isIngredientDecor(i));

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 select-none">
      {/* 3D Flipping Card Container */}
      <div
        onClick={onFlip}
        className={`relative w-full min-h-[380px] sm:min-h-[420px] rounded-3xl cursor-pointer transition-transform duration-500 transform-style-3d shadow-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-emerald-950/30">
          {/* Top category & weight */}
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {dish.category}
            </span>
            {dish.totalWeight && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-700/80 text-slate-200 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                {dish.totalWeight}
              </span>
            )}
          </div>

          {/* Center Dish Name */}
          <div className="my-auto py-6">
            <span className="text-4xl mb-4 block">🍣</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-tight">
              {dish.name}
            </h2>
            {dish.pieces && (
              <p className="text-sm font-medium text-emerald-400 mt-2">
                {dish.pieces}
              </p>
            )}
          </div>

          {/* Bottom Flip Hint */}
          <div className="w-full pt-4 border-t border-slate-700/50 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <RotateCw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>Натисніть або пробіл, щоб перевернути</span>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/70">
              <div>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Рецептура ТТК
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                  {dish.name}
                </h3>
              </div>
              {dish.totalWeight && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {dish.totalWeight}
                </span>
              )}
            </div>

            {/* Base ingredients list */}
            <div className="space-y-1.5 mb-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Основний склад ({baseIngredients.length}):
              </div>
              {baseIngredients.map((ing, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between text-xs sm:text-sm py-1 px-2.5 rounded-lg bg-slate-800/80 border border-slate-750"
                >
                  <span className="text-slate-200 font-medium">{ing.name}</span>
                  <span className="font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 font-mono">
                    {ing.weight}
                  </span>
                </div>
              ))}
            </div>

            {/* Decor ingredients */}
            {decorIngredients.length > 0 && (
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Декор ({decorIngredients.length}):
                  </div>
                  {ignoreDecor && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowDecorOnCard(!showDecorOnCard); }}
                      className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      {showDecorOnCard ? 'Сховати' : 'Показати'}
                    </button>
                  )}
                </div>

                {(!ignoreDecor || showDecorOnCard) ? (
                  <div className="space-y-1">
                    {decorIngredients.map((ing, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-teal-950/30 border border-teal-800/40"
                      >
                        <span className="text-teal-200">{ing.name}</span>
                        <span className="font-bold text-teal-300 bg-teal-900/50 px-2 py-0.5 rounded border border-teal-700/50 font-mono">
                          {ing.weight}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 bg-slate-800/40 rounded p-1.5 text-center italic">
                    🌿 Декор приховано (режим «Без декору»)
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-2">
            Клікніть картку ще раз, щоб сховати відповідь
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (Always visible below the card) */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAnswer(false); }}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-950/40 active:scale-95 transition-all border border-rose-500/50"
        >
          <X className="w-5 h-5" />
          Повторити
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAnswer(true); }}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/40 active:scale-95 transition-all border border-emerald-500/50"
        >
          <Check className="w-5 h-5" />
          Знаю твердо
        </button>
      </div>
    </div>
  );
};
