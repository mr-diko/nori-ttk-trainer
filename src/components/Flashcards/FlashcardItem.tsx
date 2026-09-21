import React, { useState, useEffect } from 'react';
import { Dish } from '../../types/ttk';
import { useApp } from '../../context/AppContext';
import { RotateCw, Check, X, Sparkles, Scale, Eye, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

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
  const [showPhoto, setShowPhoto] = useState(false);

  // Reset photo visibility whenever the dish changes
  useEffect(() => {
    setShowPhoto(false);
  }, [dish.id]);

  const baseIngredients = dish.ingredients.filter(i => !isIngredientDecor(i));
  const decorIngredients = dish.ingredients.filter(i => isIngredientDecor(i));

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 select-none">
      {/* 3D Flipping Card Container */}
      <div
        onClick={onFlip}
        className={`relative w-full min-h-[380px] sm:min-h-[420px] rounded-3xl cursor-pointer transition-transform duration-500 transform-style-3d shadow-xl dark:shadow-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-lg dark:shadow-emerald-950/30 overflow-y-auto">
          {/* Top category & weight */}
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
              {dish.category}
            </span>
            {dish.totalWeight && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 flex items-center gap-1 border border-slate-200 dark:border-transparent">
                <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {dish.totalWeight}
              </span>
            )}
          </div>

          {/* Center Dish Name & Optional Photo */}
          <div className="my-auto py-4 w-full flex flex-col items-center">
            <span className="text-4xl mb-3 block">🍣</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide leading-tight">
              {dish.name}
            </h2>
            {dish.pieces && (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                {dish.pieces}
              </p>
            )}

            {/* Collapsible photo toggle (hidden by default) */}
            {dish.image && (
              <div className="mt-4 w-full flex flex-col items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPhoto(!showPhoto);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600/50 shadow-sm transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{showPhoto ? 'Сховати фото' : 'Показати фото'}</span>
                  {showPhoto ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {showPhoto && (
                  <div className="mt-3 max-w-[260px] w-full overflow-hidden rounded-2xl border-2 border-emerald-500/40 shadow-lg transition-all duration-300">
                    <img
                      src={getImageUrl(dish.image)}
                      alt={dish.name}
                      className="w-full h-36 object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Flip Hint */}
          <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <RotateCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
            <span>Натисніть або пробіл, щоб перевернути</span>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto shadow-xl">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-700/70">
              <div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Рецептура ТТК
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                  {dish.name}
                </h3>
              </div>
              {dish.totalWeight && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                  {dish.totalWeight}
                </span>
              )}
            </div>

            {/* Collapsible photo on back side (hidden by default) */}
            {dish.image && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPhoto(!showPhoto);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{showPhoto ? 'Сховати фото' : 'Показати фото'}</span>
                  {showPhoto ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {showPhoto && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300">
                    <img
                      src={getImageUrl(dish.image)}
                      alt={dish.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Base ingredients list */}
            <div className="space-y-1.5 mb-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Основний склад ({baseIngredients.length}):
              </div>
              {baseIngredients.map((ing, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between text-xs sm:text-sm py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750"
                >
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{ing.name}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 font-mono">
                    {ing.weight}
                  </span>
                </div>
              ))}
            </div>

            {/* Decor ingredients */}
            {decorIngredients.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Декор ({decorIngredients.length}):
                  </div>
                  {ignoreDecor && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowDecorOnCard(!showDecorOnCard); }}
                      className="text-[11px] text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1"
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
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40"
                      >
                        <span className="text-teal-900 dark:text-teal-200">{ing.name}</span>
                        <span className="font-bold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-700/50 font-mono">
                          {ing.weight}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 rounded p-1.5 text-center italic">
                    🌿 Декор приховано (режим «Без декору»)
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center pt-2">
            Клікніть картку ще раз, щоб сховати відповідь
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (Always visible below the card) */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAnswer(false); }}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-950/20 active:scale-95 transition-all border border-rose-500/50"
        >
          <X className="w-5 h-5" />
          Повторити
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAnswer(true); }}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/20 active:scale-95 transition-all border border-emerald-500/50"
        >
          <Check className="w-5 h-5" />
          Знаю твердо
        </button>
      </div>
    </div>
  );
};
