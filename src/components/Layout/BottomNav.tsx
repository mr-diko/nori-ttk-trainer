import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Layers, HelpCircle, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab } = useApp();

  const navItems = [
    { id: 'catalog', label: 'Каталог', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'flashcards', label: 'Картки', icon: <span className="text-xl leading-none">🎴</span> },
    { id: 'exam', label: 'Тест', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'decks', label: 'Колоди', icon: <Layers className="w-5 h-5" /> },
    { id: 'settings', label: 'Опції', icon: <Settings className="w-5 h-5" /> },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
      {navItems.map(item => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="h-6 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
