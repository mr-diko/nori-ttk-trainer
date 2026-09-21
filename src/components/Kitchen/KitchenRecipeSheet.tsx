import React, { useState } from 'react';
import { Dish, PrepTech, SetMenu } from '../../types/ttk';
import { useApp } from '../../context/AppContext';
import { X, Star, Camera, ChevronDown, ChevronUp, Sparkles, ArrowLeft, Layers, Utensils } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

interface KitchenRecipeSheetProps {
  item: Dish | PrepTech | SetMenu | null;
  onClose: () => void;
  onSelectDish: (dish: Dish) => void;
  previousSet?: SetMenu | null;
  onBackToSet?: () => void;
}

export const KitchenRecipeSheet: React.FC<KitchenRecipeSheetProps> = ({
  item,
  onClose,
  onSelectDish,
  previousSet,
  onBackToSet,
}) => {
  const { menuData, ignoreDecor, isIngredientDecor, pinnedDishes, togglePinnedDish } = useApp();
  const [showPhoto, setShowPhoto] = useState(false);
  const [showDecorAnyway, setShowDecorAnyway] = useState(false);

  if (!item) return null;

  const isDish = 'ingredients' in item && 'category' in item && item.category !== 'Заготовки';
  const isSet = 'rolls' in item;
  const isPrep = item.category === 'Заготовки';

  const isPinned = pinnedDishes.includes(item.id);

  // Helper to find dish by roll name in sets
  const findDishByName = (rollName: string): Dish | undefined => {
    const clean = rollName.trim().toLowerCase();
    return menuData.dishes.find(d => {
      const dClean = d.name.toLowerCase();
      return dClean.includes(clean) || clean.includes(dClean.split(' ')[0]);
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            {previousSet && (
              <button
                type="button"
                onClick={onBackToSet}
                className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-xs font-semibold mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Сет</span>
              </button>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
              {item.category}
            </span>
            {'totalWeight' in item && item.totalWeight && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {item.totalWeight}
              </span>
            )}
            {'pieces' in item && item.pieces && (
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                {item.pieces}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Pin / Favorite button */}
            <button
              type="button"
              onClick={() => togglePinnedDish(item.id)}
              className={`p-2 rounded-xl transition-all ${
                isPinned
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-500 border border-amber-300 dark:border-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500'
              }`}
              title={isPinned ? 'Відкріпити' : 'Закріпити в швидкому доступі'}
            >
              <Star className={`w-5 h-5 ${isPinned ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Dish / Set Title */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {item.name}
            </h2>
          </div>

          {/* Photo toggle button & photo (Hidden by default) */}
          {'image' in item && item.image && (
            <div>
              <button
                type="button"
                onClick={() => setShowPhoto(!showPhoto)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
              >
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{showPhoto ? 'Сховати фото' : 'Показати фото'}</span>
                {showPhoto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showPhoto && (
                <div className="mt-2.5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-750 shadow-md">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-full max-h-56 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* DISH RECIPE */}
          {isDish && (
            <div className="space-y-4">
              {/* Base ingredients - HIGH CONTRAST & LARGE NUMBERS FOR LINE COOK */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Основні інгредієнти:
                </div>
                <div className="space-y-2">
                  {(item as Dish).ingredients
                    .filter(ing => !isIngredientDecor(ing))
                    .map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-750 shadow-sm"
                      >
                        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {ing.name}
                        </span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800/60 font-mono flex-shrink-0">
                          {ing.weight}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Decor ingredients */}
              {(item as Dish).ingredients.some(ing => isIngredientDecor(ing)) && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Декор та поливи:
                    </div>
                    {ignoreDecor && (
                      <button
                        type="button"
                        onClick={() => setShowDecorAnyway(!showDecorAnyway)}
                        className="text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1"
                      >
                        {showDecorAnyway ? 'Сховати' : 'Показати'}
                      </button>
                    )}
                  </div>

                  {(!ignoreDecor || showDecorAnyway) ? (
                    <div className="space-y-1.5">
                      {(item as Dish).ingredients
                        .filter(ing => isIngredientDecor(ing))
                        .map((ing, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40"
                          >
                            <span className="text-sm font-medium text-teal-900 dark:text-teal-200">
                              {ing.name}
                            </span>
                            <span className="text-base font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-lg font-mono">
                              {ing.weight}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 rounded-xl p-2.5 text-center italic">
                      🌿 Декор приховано режимом «Без декору»
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SET MENU (CLICKABLE ROLLS!) */}
          {isSet && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                Склад сету (натисніть рол для перегляду рецепта):
              </div>
              <div className="space-y-2">
                {(item as SetMenu).rolls.map((rollName, idx) => {
                  const matchedDish = findDishByName(rollName);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!matchedDish}
                      onClick={() => matchedDish && onSelectDish(matchedDish)}
                      className={`w-full text-left flex items-center justify-between py-2.5 px-3.5 rounded-xl border transition-all ${
                        matchedDish
                          ? 'bg-purple-50/70 hover:bg-purple-100/90 dark:bg-purple-950/20 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-800/50 cursor-pointer shadow-sm active:scale-[0.99]'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                          {rollName}
                        </span>
                      </div>
                      {matchedDish ? (
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          ТТК →
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PREP TECH */}
          {isPrep && (
            <div className="space-y-4">
              {'outputWeight' in item && item.outputWeight && (
                <div className="text-sm font-semibold p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  Вихід готового продукту: <span className="font-bold">{item.outputWeight}</span>
                </div>
              )}

              {(item as PrepTech).ingredients && (item as PrepTech).ingredients.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Інгредієнти заготовки:
                  </div>
                  <div className="space-y-1.5">
                    {(item as PrepTech).ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{ing.name}</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">{ing.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(item as PrepTech).techProcess && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Технологія приготування та зберігання:
                  </div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 whitespace-pre-line leading-relaxed">
                    {(item as PrepTech).techProcess}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.99]"
          >
            Зрозуміло (Закрити)
          </button>
        </div>
      </div>
    </div>
  );
};
