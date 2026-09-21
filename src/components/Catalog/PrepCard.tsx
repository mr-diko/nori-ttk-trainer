import React, { useState } from 'react';
import { PrepTech } from '../../types/ttk';
import { ChefHat, Clock, ChevronDown, ChevronUp, Scale } from 'lucide-react';

interface PrepCardProps {
  prep: PrepTech;
}

export const PrepCard: React.FC<PrepCardProps> = ({ prep }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg hover:border-amber-500/50 transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <ChefHat className="w-3 h-3" />
              Заготовка
            </span>
            {prep.outputWeight && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 flex items-center gap-1 border border-slate-600">
                <Scale className="w-3 h-3 text-emerald-400" />
                {prep.outputWeight}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            {prep.name}
          </h3>
        </div>
      </div>

      {/* Ingredients list */}
      {prep.ingredients.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Інгредієнти / Пропорції ({prep.ingredients.length}):
          </div>
          <div className="space-y-1">
            {prep.ingredients.map((ing, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <span className="text-slate-200">{ing.name}</span>
                <span className="font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  {ing.weight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tech instructions */}
      {prep.techProcess && (
        <div className="mt-4 pt-3 border-t border-slate-700/60">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center justify-between py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Технологія приготування & зберігання
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {prep.techProcess}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
