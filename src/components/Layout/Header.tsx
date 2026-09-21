import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Layers, HelpCircle, Settings, Sparkles, Moon, Sun } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentTab, setCurrentTab, 
    ignoreDecor, setIgnoreDecor,
    theme, toggleTheme 
  } = useApp();

  const navItems = [
    { id: 'catalog', label: 'Каталог ТТК', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Флеш-картки', icon: <span className="text-sm">🎴</span> },
    { id: 'exam', label: 'Екзаменатор', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'decks', label: 'Мої колоди', icon: <Layers className="w-4 h-4" /> },
    { id: 'settings', label: 'Налаштування', icon: <Settings className="w-4 h-4" /> },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('catalog')}
          className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-950 flex items-center justify-center">
            <img src="/sushi-icon.svg" alt="Sushi" className="w-full h-full rounded-[10px]" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white tracking-wider flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
              NORI <span className="text-emerald-400 font-extrabold text-xs px-1.5 py-0.5 bg-emerald-950/70 border border-emerald-800/60 rounded">ТТК</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Тренажер меню & рецептур
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Quick Toggle Decor & Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Toggle: Ignore Decor */}
          <button
            type="button"
            onClick={() => setIgnoreDecor(!ignoreDecor)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              ignoreDecor
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-sm shadow-emerald-950/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Перемикач: приховувати декор у картках і тестах"
          >
            <Sparkles className={`w-3.5 h-3.5 ${ignoreDecor ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Режим:</span>
            <span>{ignoreDecor ? '🌿 Без декору' : 'З декором'}</span>
          </button>

          {/* Theme button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition-colors"
            title="Перемкнути тему"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
