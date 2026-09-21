import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Dish, PrepTech, SetMenu } from '../../types/ttk';
import { KitchenRecipeSheet } from './KitchenRecipeSheet';
import { searchAndRankItems } from '../../utils/searchMatcher';
import { Search, X, Star, Clock, Zap, Sun, Lightbulb, Sparkles, ChevronRight, Package, Utensils } from 'lucide-react';

export const KitchenView: React.FC = () => {
  const { 
    menuData, 
    pinnedDishes, 
    togglePinnedDish, 
    recentDishes, 
    addRecentDish, 
    wakeLockActive, 
    toggleWakeLock, 
    isWakeLockSupported,
    ignoreDecor,
    setIgnoreDecor
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Dish | PrepTech | SetMenu | null>(null);
  const [previousSet, setPreviousSet] = useState<SetMenu | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // All searchable items combined
  const allItems = useMemo(() => {
    return [
      ...menuData.dishes,
      ...menuData.sets,
      ...menuData.preps,
    ];
  }, [menuData]);

  // Filtered items based on search query and category with smart fallback
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      if (activeCategory) {
        return allItems.filter(item => item.category === activeCategory);
      }
      return allItems;
    }

    // When searching: if activeCategory is set, try it first
    if (activeCategory) {
      const inCat = searchAndRankItems(allItems, searchQuery, activeCategory);
      if (inCat.length > 0) {
        return inCat;
      }
      // If 0 results in selected category, automatically search across all categories!
    }

    return searchAndRankItems(allItems, searchQuery);
  }, [allItems, activeCategory, searchQuery]);

  // Pinned items resolved objects
  const pinnedList = useMemo(() => {
    return pinnedDishes
      .map(id => allItems.find(item => item.id === id))
      .filter((item): item is Dish | PrepTech | SetMenu => !!item);
  }, [pinnedDishes, allItems]);

  // Recent items resolved objects
  const recentList = useMemo(() => {
    return recentDishes
      .map(id => allItems.find(item => item.id === id))
      .filter((item): item is Dish | PrepTech | SetMenu => !!item);
  }, [recentDishes, allItems]);

  const handleSelectItem = (item: Dish | PrepTech | SetMenu) => {
    addRecentDish(item.id);
    setSelectedItem(item);
    setPreviousSet(null);
  };

  const handleSelectDishFromSet = (dish: Dish) => {
    if (selectedItem && 'rolls' in selectedItem) {
      setPreviousSet(selectedItem as SetMenu);
    }
    addRecentDish(dish.id);
    setSelectedItem(dish);
  };

  const handleBackToSet = () => {
    if (previousSet) {
      setSelectedItem(previousSet);
      setPreviousSet(null);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header & Status Bar */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
              Шпаргалка кухаря
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                На зміні ⚡️
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Миттєвий пошук рецептур і грамовок для роботи за баром
            </p>
          </div>
        </div>

        {/* Action Toggles: WakeLock & Decor */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Screen Wake Lock Button */}
          {isWakeLockSupported && (
            <button
              type="button"
              onClick={toggleWakeLock}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
                wakeLockActive
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-600'
                  : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="Запобігає вимиканню екрана телефону, коли він лежить на столі"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${wakeLockActive ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-slate-400'}`} />
              <span>{wakeLockActive ? '💡 Екран не гасне' : 'Екран звичайний'}</span>
            </button>
          )}

          {/* Ignore Decor Quick Toggle */}
          <button
            type="button"
            onClick={() => setIgnoreDecor(!ignoreDecor)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
              ignoreDecor
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600'
                : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{ignoreDecor ? '🌿 Без декору' : 'З декором'}</span>
          </button>
        </div>
      </div>

      {/* Large Instant Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Почніть вводити назву ролу, сету чи інгредієнта..."
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-500/40 focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium shadow-md focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="p-1.5 absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Pinned Items & Recent Lookups Bar (Speed-Dial) */}
      {(pinnedList.length > 0 || recentList.length > 0) && (
        <div className="space-y-2">
          {/* Pinned Dishes */}
          {pinnedList.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Закріплені ролі ({pinnedList.length}):
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {pinnedList.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-300/80 dark:border-amber-700/60 text-xs font-semibold text-amber-950 dark:text-amber-200 shadow-sm active:scale-95 transition-all"
                  >
                    <span>🍣</span>
                    <span className="whitespace-nowrap">{item.name}</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">
                      {'totalWeight' in item ? item.totalWeight : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Dishes */}
          {recentList.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Нещодавно переглянуті:
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {recentList.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="whitespace-nowrap">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Filter Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex-shrink-0 border ${
            activeCategory === null
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          Усі ({allItems.length})
        </button>
        {menuData.categories.map(cat => {
          const count = allItems.filter(i => i.category === cat).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex-shrink-0 border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Results Count & Quick Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Знайдено: <strong>{filteredItems.length}</strong> позицій</span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Скинути пошук
          </button>
        )}
      </div>

      {/* Compact High-Speed Line List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Нічого не знайдено за запитом «{searchQuery}»
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isPinned = pinnedDishes.includes(item.id);
            const isSet = 'rolls' in item;
            const isPrep = item.category === 'Заготовки';

            return (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.99]"
              >
                {/* Left: icon & title */}
                <div className="flex items-start gap-3 min-w-0 flex-1 mr-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSet
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : isPrep
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {isSet ? <Package className="w-5 h-5" /> : isPrep ? <Utensils className="w-5 h-5" /> : <span>🍣</span>}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white break-words leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-medium">{item.category}</span>
                      {item.isArchived && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60">
                          📦 Архів
                        </span>
                      )}
                      {'totalWeight' in item && item.totalWeight && (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-mono">
                          {item.totalWeight}
                        </span>
                      )}
                      {'outputWeight' in item && item.outputWeight && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 font-mono">
                          {item.outputWeight}
                        </span>
                      )}
                      {'pieces' in item && item.pieces && (
                        <span className="font-medium text-slate-400 dark:text-slate-500">• {item.pieces}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: pin button, open indicator */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 self-center">
                  {/* Pin toggle button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinnedDish(item.id);
                    }}
                    className={`p-2 sm:p-2.5 rounded-xl transition-all ${
                      isPinned 
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' 
                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400' : ''}`} />
                  </button>

                  <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Recipe Modal / Sheet */}
      <KitchenRecipeSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSelectDish={handleSelectDishFromSet}
        previousSet={previousSet}
        onBackToSet={handleBackToSet}
      />
    </div>
  );
};
