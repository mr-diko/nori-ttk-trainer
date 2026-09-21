import React, { useState } from 'react';
import { SetMenu } from '../../types/ttk';
import { Package, Utensils, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

interface SetCardProps {
  set: SetMenu;
}

export const SetCard: React.FC<SetCardProps> = ({ set }) => {
  const [showPhoto, setShowPhoto] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-5 shadow-sm dark:shadow-lg hover:border-purple-500/50 transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 flex items-center gap-1">
              <Package className="w-3 h-3" />
              Сет
            </span>
            {set.totalWeight && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                {set.totalWeight}
              </span>
            )}
            {set.pieces && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                {set.pieces}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-wide">
            {set.name}
          </h3>
        </div>
      </div>

      {/* Photo toggle button & collapsible photo (hidden by default) */}
      {set.image && (
        <div className="mt-1 mb-3">
          <button
            type="button"
            onClick={() => setShowPhoto(!showPhoto)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/80 dark:border-slate-600/50"
          >
            <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{showPhoto ? 'Сховати фото' : 'Показати фото'}</span>
            {showPhoto ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {showPhoto && (
            <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm transition-all duration-300">
              <img
                src={getImageUrl(set.image)}
                alt={set.name}
                loading="lazy"
                className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          Роли у складі сету ({set.rolls.length}):
        </div>
        <div className="space-y-1">
          {set.rolls.map((roll, idx) => (
            <div 
              key={idx} 
              className="text-xs py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
              <span>{roll}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
