import React from 'react';
import { useApp } from './context/AppContext';

export default function App() {
  const { menuData, ignoreDecor, setIgnoreDecor, theme, toggleTheme } = useApp();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <h1 className="text-2xl font-bold text-emerald-400">NORI TTK Trainer</h1>
      <p className="text-slate-400 mt-2">
        Dishes: {menuData.dishes.length}, Preps: {menuData.preps.length}, Sets: {menuData.sets.length}
      </p>
      <div className="mt-4 flex gap-4">
        <button 
          onClick={() => setIgnoreDecor(!ignoreDecor)}
          className="px-4 py-2 bg-emerald-600 rounded-lg"
        >
          {ignoreDecor ? '🌿 Декор приховано' : 'Декор включено'}
        </button>
        <button 
          onClick={toggleTheme}
          className="px-4 py-2 bg-slate-700 rounded-lg"
        >
          Тема: {theme}
        </button>
      </div>
    </div>
  );
}
