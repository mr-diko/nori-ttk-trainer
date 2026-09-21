import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { searchAndRankItems } from '../../utils/searchMatcher';
import { Dish } from '../../types/ttk';
import { Layers, Plus, Trash2, Play, Check, Search, X, Sparkles } from 'lucide-react';

interface DecksManagerProps {
  onStudyDeck: (deckId: string) => void;
}

export const DecksManager: React.FC<DecksManagerProps> = ({ onStudyDeck }) => {
  const { customDecks, createCustomDeck, deleteCustomDeck, menuData } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filteredDishes = useMemo(() => {
    if (searchQuery.trim()) {
      if (selectedCat !== 'all') {
        const inCat = searchAndRankItems(menuData.dishes, searchQuery, selectedCat);
        if (inCat.length > 0) return inCat as Dish[];
      }
      return searchAndRankItems(menuData.dishes, searchQuery) as Dish[];
    }
    if (selectedCat !== 'all') {
      return menuData.dishes.filter(d => d.category === selectedCat);
    }
    return menuData.dishes;
  }, [menuData.dishes, searchQuery, selectedCat]);

  const handleToggleDish = (dishId: string) => {
    setSelectedDishIds(prev => 
      prev.includes(dishId) ? prev.filter(id => id !== dishId) : [...prev, dishId]
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredDishes.map(d => d.id);
    const allSelected = ids.every(id => selectedDishIds.includes(id));
    if (allSelected) {
      setSelectedDishIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedDishIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleSaveDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim() || selectedDishIds.length === 0) return;

    createCustomDeck(deckName.trim(), selectedDishIds, deckDesc.trim());
    setIsCreating(false);
    setDeckName('');
    setDeckDesc('');
    setSelectedDishIds([]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Мої персональні колоди
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Створюйте власні тематичні списки страв для заучування та повторення
          </p>
        </div>

        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-950/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Створити нову колоду
          </button>
        )}
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form onSubmit={handleSaveDeck} className="bg-white/95 dark:bg-slate-800/90 border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Конструктор нової колоди
            </h2>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Назва колоди: *
              </label>
              <input
                type="text"
                required
                value={deckName}
                onChange={e => setDeckName(e.target.value)}
                placeholder="наприклад: Складні роли з креветкою"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Опис / Нотатки (опціонально):
              </label>
              <input
                type="text"
                value={deckDesc}
                onChange={e => setDeckDesc(e.target.value)}
                placeholder="наприклад: Вивчити до наступної зміни"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Dish Picker */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Оберіть страви для колоди (Обрано: <span className="text-purple-600 dark:text-purple-400 font-black">{selectedDishIds.length}</span>):
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Вибрати / зняти всі знайдені
                </button>
              </div>
            </div>

            {/* Filter toolbar inside modal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Швидкий фільтр страв..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <select
                value={selectedCat}
                onChange={e => setSelectedCat(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">Всі категорії</option>
                {menuData.categories.filter(c => c !== 'Заготовки' && c !== 'Набори 2026').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Dishes multi-select box */}
            <div className="max-h-60 overflow-y-auto bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2 space-y-1">
              {filteredDishes.map(dish => {
                const isChecked = selectedDishIds.includes(dish.id);
                return (
                  <div
                    key={dish.id}
                    onClick={() => handleToggleDish(dish.id)}
                    className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isChecked 
                        ? 'bg-purple-100 dark:bg-purple-950/70 border border-purple-400 dark:border-purple-600/70 text-purple-950 dark:text-purple-200' 
                        : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-400 dark:border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="font-semibold">{dish.name}</span>
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">({dish.category})</span>
                      </div>
                    </div>
                    {dish.totalWeight && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                        {dish.totalWeight}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={selectedDishIds.length === 0 || !deckName.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-950/20 transition-all active:scale-95"
            >
              Зберегти колоду ({selectedDishIds.length} страв)
            </button>
          </div>
        </form>
      )}

      {/* List of custom decks */}
      {customDecks.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-12 text-center shadow-sm">
          <Layers className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            У вас поки немає створених колод
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            Створіть свою першу персональну колоду або пройдіть тест, і система сама запропонує колоду ваших помилок!
          </p>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Створити першу колоду
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customDecks.map(deck => (
            <div
              key={deck.id}
              className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm dark:shadow-lg flex flex-col justify-between hover:border-purple-500/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                    {deck.isSmart ? '🎯 Смарт-колода' : 'Власна колода'}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    {deck.dishIds.length} страв
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {deck.name}
                </h3>
                {deck.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {deck.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => deleteCustomDeck(deck.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Видалити колоду"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onStudyDeck(`custom:${deck.id}`)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/20 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Вчити картки
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
