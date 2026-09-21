import * as XLSX from 'xlsx';
import { MenuData, Dish, PrepTech, SetMenu } from '../types/ttk';

const DECOR_KEYWORDS = [
  'мікрогрін', 'кунжут', 'нитки чилі', 'мигдальні пластівці', 
  'стружка тунця', 'боніто', 'ікра масаго', 'ікра імітована',
  'соус кунжутний', 'соус унагі', 'соус теріякі', 'соус світ чилі'
];

export const ExcelImporter = {
  async parseExcelFile(file: File): Promise<MenuData> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true });

    const dishSheets = [
      'Філадельфія', 'Уромаки', 'Фірмові роли', 'Каліфорнія', 
      'Футохосомакі', 'Суші-бургери', 'Теплі, запечені, чіз роли', 
      'Рол доги', 'Норі роли', 'Оніґірі', 'Суші та гункани', 'Вегетаріанське АРХІВ'
    ];

    const dishes: Dish[] = [];
    const preps: PrepTech[] = [];
    const sets: SetMenu[] = [];
    let dishIdCounter = 1;
    let prepIdCounter = 1;
    let setIdCounter = 1;

    // 1. Preps
    if (workbook.SheetNames.includes('Заготовки')) {
      const sheet = workbook.Sheets['Заготовки'];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      let currentPrep: PrepTech | null = null;

      for (const r of rows) {
        const val0 = r[0] ? String(r[0]).trim() : '';
        const val1 = r[1] ? String(r[1]).trim() : '';

        if (val1 === 'Технологія приготування' || (val0 && !val1 && val0.length < 50)) {
          if (currentPrep) preps.push(currentPrep);
          currentPrep = {
            id: `prep-${prepIdCounter++}`,
            name: val0,
            category: 'Заготовки',
            techProcess: '',
            ingredients: [],
          };
        } else if (currentPrep) {
          if (val0.includes('Підготовка') || val0.includes('Зберігання') || val0.length > 40) {
            currentPrep.techProcess += val0 + '\n';
          } else if (val0 === 'Вага готового продукту' && val1) {
            currentPrep.outputWeight = val1;
          } else if (val0 && val1) {
            currentPrep.ingredients.push({ name: val0, weight: val1 });
          }
        }
      }
      if (currentPrep) preps.push(currentPrep);
    }

    // 2. Sets
    if (workbook.SheetNames.includes('Набори 2026')) {
      const sheet = workbook.Sheets['Набори 2026'];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      let currentSet: SetMenu | null = null;

      for (const r of rows) {
        const val0 = r[0] ? String(r[0]).trim() : '';
        const val1 = r[1] ? String(r[1]).trim() : '';

        if (val0) {
          if (currentSet) sets.push(currentSet);
          const weightMatch = val0.match(/(\d+[\s]*г)/);
          const piecesMatch = val0.match(/\[(.*?)\]/);
          currentSet = {
            id: `set-${setIdCounter++}`,
            name: val0.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
            category: 'Набори 2026',
            totalWeight: weightMatch ? weightMatch[1] : '',
            pieces: piecesMatch ? piecesMatch[1] : '',
            rolls: [],
          };
        }
        if (val1 && currentSet) {
          currentSet.rolls.push(val1);
        }
      }
      if (currentSet) sets.push(currentSet);
    }

    // 3. Dishes
    for (const sname of dishSheets) {
      if (!workbook.SheetNames.includes(sname)) continue;
      const sheet = workbook.Sheets[sname];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      let currentDish: Dish | null = null;

      for (const r of rows) {
        const val0 = r[0] ? String(r[0]).trim() : '';
        const val1 = r[1] ? String(r[1]).trim() : '';
        const val2 = r[2] ? String(r[2]).trim() : '';

        if (val0) {
          if (currentDish && currentDish.ingredients.length > 0) {
            dishes.push(currentDish);
          }
          const weightMatch = val0.match(/(\d+[\s]*г)/);
          const piecesMatch = val0.match(/(\d+[\s]*шт)/);
          currentDish = {
            id: `dish-${dishIdCounter++}`,
            name: val0.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
            category: sname,
            totalWeight: weightMatch ? weightMatch[1] : '',
            pieces: piecesMatch ? piecesMatch[1] : '',
            ingredients: [],
          };
        }

        if (val1 && currentDish) {
          if (['Технологія приготування', 'Паніровка для ролів', 'Паніровка для бургерів'].includes(val1)) {
            continue;
          }
          const isDecor = DECOR_KEYWORDS.some(kw => val1.toLowerCase().includes(kw));
          currentDish.ingredients.push({
            name: val1,
            weight: val2 || '',
            isDecor,
          });
        }
      }

      if (currentDish && currentDish.ingredients.length > 0) {
        dishes.push(currentDish);
      }
    }

    const allCategories = dishSheets.filter(s => workbook.SheetNames.includes(s));
    if (preps.length > 0) allCategories.push('Заготовки');
    if (sets.length > 0) allCategories.push('Набори 2026');

    return {
      categories: allCategories,
      dishCount: dishes.length,
      prepCount: preps.length,
      setCount: sets.length,
      dishes,
      preps,
      sets,
    };
  },
};
