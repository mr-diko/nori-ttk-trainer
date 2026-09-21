import React from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, Sparkles, AlertCircle, CheckCircle2, Bookmark, ChefHat } from 'lucide-react';

interface DeckOption {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  description: string;
  badgeColor: string;
}

interface DeckSelectorProps {
  activeDeckId: string;
  onSelectDeck: (deckId: string) => void;
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({
  activeDeckId,
  onSelectDeck,
}) => {
  const { menuData, cardProgress, customDecks } = useApp();

  // Calculate deck counts
  const totalDishes = menuData.dishes.length;
  
  const learningCount = menuData.dishes.filter(
    d => cardProgress[d.id]?.status === 'learning'
  ).length;

  const masteredCount = menuData.dishes.filter(
    d => cardProgress[d.id]?.status === 'mastered'
  ).length;

  // Build standard decks
  const standardDecks: DeckOption[] = [
    {
      id: 'all',
      name: 'Усі страви меню',
      count: totalDishes,
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      description: 'Повне меню з усіх категорій',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'learning',
      name: 'Потребують повторення',
      count: learningCount,
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      description: 'Страви, де були допущені помилки',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'mastered',
      name: 'Засвоєні страви',
      count: masteredCount,
      icon: <CheckCircle2 className="w-4 h-4 text-sky-400" />,
      description: 'Страви, вивчені на відмінно',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
  ];

  // Category decks
  const categoryDecks: DeckOption[] = menuData.categories
    .filter(c => c !== 'Заготовки' && c !== 'Набори 2026')
    .map(cat => ({
      id: `cat:${cat}`,
      name: cat,
      count: menuData.dishes.filter(d => d.category === cat).length,
      icon: <Bookmark className="w-4 h-4 text-amber-400" />,
      description: `ТТК категорії «${cat}»`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    }));

  // Custom user decks
  const userDecks: DeckOption[] = customDecks.map(deck => ({
    id: `custom:${deck.id}`,
    name: deck.name,
    count: deck.dishIds.length,
    icon: <Layers className="w-4 h-4 text-purple-400" />,
    description: deck.description || 'Власна колода користувача',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  }));

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-5 h-5 text-emerald-400" />
        <h2 className="text-base sm:text-lg font-bold text-white">
          Оберіть колоду для навчання
        </h2>
      </div>

      <div className="space-y-4">
        {/* Main decks */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Основні колоди:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {standardDecks.map(deck => {
              const isSelected = activeDeckId === deck.id;
              return (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => onSelectDeck(deck.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {deck.icon}
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        {deck.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {deck.description}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${deck.badgeColor}`}>
                    {deck.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User decks if any */}
        {userDecks.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-2">
              Мої створені колоди:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {userDecks.map(deck => {
                const isSelected = activeDeckId === deck.id;
                return (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => onSelectDeck(deck.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {deck.icon}
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-white">
                          {deck.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {deck.description}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${deck.badgeColor}`}>
                      {deck.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Decks Horizontal Scroll */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            За категоріями страв:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryDecks.map(deck => {
              const isSelected = activeDeckId === deck.id;
              return (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => onSelectDeck(deck.id)}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap text-xs font-semibold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{deck.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-900/20 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'
                  }`}>
                    {deck.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
