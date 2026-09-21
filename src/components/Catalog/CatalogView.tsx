import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DishCard } from './DishCard';
import { PrepCard } from './PrepCard';
import { SetCard } from './SetCard';
import { Dish, PrepTech, SetMenu } from '../../types/ttk';
import { searchAndRankItems } from '../../utils/searchMatcher';
import { Search, SlidersHorizontal, BookOpen, ChefHat, Package, Sparkles } from 'lucide-react';

interface CatalogViewProps {
  onStudyDish?: (dish: Dish) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ onStudyDish }) => {
  const { menuData, selectedCategory, setSelectedCategory, cardProgress } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');

  // Filtered dishes with relevance ranking and smart fallback
  const filteredDishes = useMemo(() => {
    let dishes = menuData.dishes;

    // Status filter
    if (statusFilter !== 'all') {
      dishes = dishes.filter(dish => {
        const prog = cardProgress[dish.id];
        const status = prog?.status || 'new';
        return status === statusFilter;
      });
    }

    if (searchQuery.trim()) {
      // If category is selected, try within category first
      if (selectedCategory && selectedCategory !== 'all') {
        const inCat = searchAndRankItems(dishes, searchQuery, selectedCategory);
        if (inCat.length > 0) {
          return inCat as Dish[];
        }
        // Fallback: search across all categories so matching dishes are never hidden!
      }
      return searchAndRankItems(dishes, searchQuery) as Dish[];
    }

    if (selectedCategory && selectedCategory !== 'all') {
      dishes = dishes.filter(dish => dish.category === selectedCategory);
    }

    return dishes;
  }, [menuData.dishes, selectedCategory, statusFilter, searchQuery, cardProgress]);

  // Filtered preps
  const filteredPreps = useMemo(() => {
    if (!searchQuery.trim() && selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'Заготовки') {
      return [];
    }
    if (searchQuery.trim()) {
      return searchAndRankItems(menuData.preps, searchQuery) as PrepTech[];
    }
    return menuData.preps;
  }, [menuData.preps, selectedCategory, searchQuery]);

  // Filtered sets
  const filteredSets = useMemo(() => {
    if (!searchQuery.trim() && selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'Набори 2026') {
      return [];
    }
    if (searchQuery.trim()) {
      return searchAndRankItems(menuData.sets, searchQuery) as SetMenu[];
    }
    return menuData.sets;
  }, [menuData.sets, selectedCategory, searchQuery]);

  const totalResults = filteredDishes.length + filteredPreps.length + filteredSets.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with Search and Stats */}
      <div className="bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-sm dark:shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Каталог ТТК NORI
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {menuData.dishes.length} страв • {menuData.preps.length} заготовок • {menuData.sets.length} наборів
            </p>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Пошук страви або інгредієнта (напр. лосось)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-0.5 rounded"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category horizontal pills */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              !selectedCategory || selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Всі позиції
          </button>

          {menuData.categories.map(cat => {
            const isSelected = selectedCategory === cat;
            const isPreps = cat === 'Заготовки';
            const isSets = cat === 'Набори 2026';
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? isPreps 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : isSets 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {isPreps && <ChefHat className="w-3.5 h-3.5" />}
                {isSets && <Package className="w-3.5 h-3.5" />}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Status filters */}
        {(!selectedCategory || (selectedCategory !== 'Заготовки' && selectedCategory !== 'Набори 2026')) && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Статус вивчення:
            </span>
            {(['all', 'new', 'learning', 'mastered'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/40'
                }`}
              >
                {st === 'all' && 'Всі'}
                {st === 'new' && 'Нові'}
                {st === 'learning' && 'В процесі'}
                {st === 'mastered' && 'Вивчені'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Знайдено записів: <strong className="text-white">{totalResults}</strong></span>
        {searchQuery && (
          <span>Фільтр за пошуком: «<span className="text-emerald-400">{searchQuery}</span>»</span>
        )}
      </div>

      {/* Grid of items */}
      {totalResults === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center">
          <p className="text-slate-300 font-medium">Нічого не знайдено за вашим запитом</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setStatusFilter('all'); }}
            className="mt-3 text-xs text-emerald-400 hover:underline"
          >
            Скинути всі фільтри
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Dishes */}
          {filteredDishes.map(dish => (
            <DishCard key={dish.id} dish={dish} onStudyOnCard={onStudyDish} />
          ))}

          {/* Preps */}
          {filteredPreps.map(prep => (
            <PrepCard key={prep.id} prep={prep} />
          ))}

          {/* Sets */}
          {filteredSets.map(set => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
};
