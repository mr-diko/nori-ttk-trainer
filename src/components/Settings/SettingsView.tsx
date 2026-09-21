import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ExcelImporter } from '../../services/excelImporter';
import { StorageService } from '../../services/storage';
import { 
  Settings, Sparkles, Upload, Download, RotateCcw, 
  Trash2, Search, Check, AlertCircle, FileSpreadsheet
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    ignoreDecor, setIgnoreDecor, 
    decorOverrides, toggleDecorOverride, isIngredientDecor,
    menuData, loadNewMenu, resetToDefaultMenu, resetProgress,
  } = useApp();

  const [decorSearch, setDecorSearch] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Collect all unique ingredients in the menu
  const allUniqueIngredients = useMemo(() => {
    const map = new Map<string, boolean>();
    menuData.dishes.forEach(d => {
      d.ingredients.forEach(i => {
        if (!map.has(i.name)) {
          map.set(i.name, isIngredientDecor(i));
        }
      });
    });
    return Array.from(map.entries())
      .map(([name, isDecor]) => ({ name, isDecor }))
      .sort((a, b) => (b.isDecor ? 1 : 0) - (a.isDecor ? 1 : 0) || a.name.localeCompare(b.name));
  }, [menuData, isIngredientDecor, decorOverrides]);

  const filteredIngredients = useMemo(() => {
    if (!decorSearch.trim()) return allUniqueIngredients;
    const q = decorSearch.toLowerCase().trim();
    return allUniqueIngredients.filter(item => item.name.toLowerCase().includes(q));
  }, [allUniqueIngredients, decorSearch]);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Зчитування та парсинг файлу Excel...');
      setImportError(null);
      const parsedMenu = await ExcelImporter.parseExcelFile(file);

      if (parsedMenu.dishes.length === 0) {
        throw new Error('У файлі не знайдено жодної страви. Перевірте назви аркушів!');
      }

      loadNewMenu(parsedMenu);
      setImportStatus(`Успішно імпортовано: ${parsedMenu.dishes.length} страв, ${parsedMenu.preps.length} заготовок, ${parsedMenu.sets.length} наборів!`);
    } catch (err: any) {
      setImportError(err.message || 'Помилка розбору Excel файлу');
      setImportStatus(null);
    } finally {
      e.target.value = '';
    }
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nori-ttk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = StorageService.importBackup(content);
      if (ok) {
        alert('Резервну копію успішно відновлено! Сторінка зараз оновиться.');
        window.location.reload();
      } else {
        alert('Помилка імпорту: пошкоджений файл резервної копії.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetProgressConfirm = () => {
    if (confirm('Ви впевнені, що хочете скинути весь прогрес вивчення карток та історію тестів?')) {
      resetProgress();
      alert('Прогрес успішно скинуто.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-sm dark:shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          Налаштування та керування ТТК
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Керування параметрами навчання, фільтрацією декору, імпортом файлів Excel та бекапом
        </p>
      </div>

      {/* 1. Global Decor Settings */}
      <div className="bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-3xl p-6 backdrop-blur-md shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Режим вивчення «Без декору»
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Автоматично виключає інгредієнти декору (соуси для поливу, кунжут, мікрогрін, нитки чилі тощо) з карток та тестів, фокусуючи увагу лише на базі (рис, норі, риба, сир, начинки).
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={ignoreDecor}
              onChange={e => setIgnoreDecor(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Decor Customizer Table */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Налаштування списку декору ({allUniqueIngredients.filter(i => i.isDecor).length} позначено як декор):
            </span>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={decorSearch}
                onChange={e => setDecorSearch(e.target.value)}
                placeholder="Пошук інгредієнта..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-750 rounded-2xl p-2 space-y-1">
            {filteredIngredients.map(item => (
              <div
                key={item.name}
                onClick={() => toggleDecorOverride(item.name)}
                className={`p-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${
                  item.isDecor
                    ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700/60 text-teal-900 dark:text-teal-200'
                    : 'bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    item.isDecor ? 'bg-teal-600 border-teal-500 text-white' : 'border-slate-400 dark:border-slate-600'
                  }`}>
                    {item.isDecor && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  item.isDecor 
                    ? 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700' 
                    : 'text-slate-400'
                }`}>
                  {item.isDecor ? 'ДЕКОР' : 'ОСНОВА'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Excel File Importer */}
      <div className="bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-3xl p-6 backdrop-blur-md shadow-sm dark:shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Оновлення меню через Excel (.xlsx)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Якщо заклад оновив меню чи грамовки, ви можете завантажити новий файл таблиці ТТК прямо тут. Додаток автоматично розпізнає категорії та оновиться.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <label className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95">
            <Upload className="w-4 h-4" />
            Завантажити новий Excel файл
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={resetToDefaultMenu}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-transparent"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Повернути заводські ТТК NORI
          </button>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500 dark:border-emerald-600 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {importError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-500 dark:border-rose-600 text-rose-900 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{importError}</span>
          </div>
        )}
      </div>

      {/* 3. Backup & Reset */}
      <div className="bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-3xl p-6 backdrop-blur-md shadow-sm dark:shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Резервне копіювання прогресу
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Збережіть файл прогресу, щоб перенести вивчені картки та створені колоди на інший телефон чи комп'ютер.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Експорт резервної копії (JSON)
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-300 dark:border-transparent">
            <Upload className="w-4 h-4" />
            Відновити з файлу
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleResetProgressConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-600/40 font-semibold text-xs flex items-center gap-2 transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Скинути прогрес карток
          </button>
        </div>
      </div>
    </div>
  );
};
