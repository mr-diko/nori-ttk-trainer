import { Dish } from '../types/ttk';

/**
 * High precision Unicode normalization for Ukrainian dish/roll matching
 */
export function normalizeRollName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ') // remove parentheses e.g. (90г), (50 г), (40 г)
    .replace(/\s*\d+\s*(?:г|шт|мл).*$/g, ' ') // remove trailing weights e.g. 290 г, 2 шт по 40 г
    .replace(/(?<![\p{L}\p{N}])свіж\p{L}*/gu, ' ') // optional adjective свіжий/свіжим
    .replace(/(?<![\p{L}\p{N}])(?:зі|із|з|в|у|та|і|по|на)(?![\p{L}\p{N}])/gu, ' ') // prepositions
    .replace(/(?<![\p{L}\p{N}])(?:рол|роли)(?![\p{L}\p{N}])/gu, ' ') // generic word "рол"
    .replace(/(?<![\p{L}\p{N}])хосомакі(?![\p{L}\p{N}])/gu, 'макі') // unify хосомакі and макі
    .replace(/(?<![\p{L}\p{N}])запечн\p{L}*/gu, 'запечен')
    .replace(/(?<![\p{L}\p{N}])креветк\p{L}*/gu, 'креветк')
    .replace(/[-–—]/g, ' ')
    .replace(/['’`ʼь]/g, '')
    .replace(/[ії]/g, 'и')
    .replace(/є/g, 'е')
    .replace(/ґ/g, 'г')
    .replace(/[^\w\u0400-\u04FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(str: string): string[] {
  return normalizeRollName(str).split(' ').filter(t => t.length > 0);
}

// Special alias overrides for irregular naming differences in sets
const RAW_ALIASES: { match: string; targetName: string }[] = [
  { match: 'филаделфия delux лососем', targetName: 'Філадельфія DeLux 300 г' },
  { match: 'филаделфия delux вугрем', targetName: 'Філадельфія DeLux 300 г' },
  { match: 'филаделфия икри креветк', targetName: 'Філадельфія в ікрі з креветками 280 г' },
  { match: 'филаделфия икри креветк манго', targetName: 'Філадельфія в ікрі з креветками та манго 280 г' },
  { match: 'филаделфия лососем манго икри', targetName: 'Філадельфія з лососем та манго в ікрі 280 г' },
  { match: 'филаделфия вугрем кунжути', targetName: 'Філадельфія з вугрем в кунжуті 280 г' },
  { match: 'сирний грушею', targetName: 'Філадельфія гриль з грушею 310 г' },
  { match: 'криспи копченим лососем', targetName: 'Кранч рол з копченим лососем 280 г' },
  { match: 'кори', targetName: 'Корі рол 345 г' },
  { match: 'монте маре', targetName: 'Чіз рол Монте-Маре 390 г' },
  { match: 'маки запеченим лососем', targetName: 'Хосомакі із запеченим лососем 150 г' },
  { match: 'маки темпура сниговим крабом', targetName: 'Хосомакі зі сніговим крабом' },
  { match: 'маки тунцем', targetName: 'Хосомакі з тунцем 150 г' },
  { match: 'калифорния икри класична', targetName: 'Каліфорнія в ікрі класична 260 г' },
  { match: 'темпура лососем гострою карамеллю', targetName: 'Темпура рол з лососем в унагі-чилі 350 г' },
  { match: 'авокадо креветк', targetName: 'Кранч рол з креветками 290 г' },
  { match: 'запечен миксом снигового краба', targetName: 'Запечений рол із міксом снігового краба 340 г' },
  { match: 'миксом лосося унаги чили', targetName: 'Темпура рол з лососем в унагі-чилі 350 г' },
  { match: 'миксом лосося унагичили', targetName: 'Темпура рол з лососем в унагі-чилі 350 г' },
  { match: 'кранч креветк темпура', targetName: 'Кранч рол з креветками 290 г' },
  { match: 'аляска', targetName: 'Аляска рол 270 г' },
  { match: 'мини суши бургер запечен лососем', targetName: 'Міні суші-бургер із запеченим лососем 285 г' },
  { match: 'мини суши бургер креветк', targetName: 'Міні суші-бургер з креветками темпура 290 г' },
  { match: 'мини суши бургер лососем сниговим крабом', targetName: 'Міні суші-бургер із лососем та сніговим крабом 270 г' },
  { match: 'мини суши бургер лососем унаги чили', targetName: 'Міні суші-бургер з лососем в унагі-чилі 285 г' },
  { match: 'мини суши бургер лососем унагичили', targetName: 'Міні суші-бургер з лососем в унагі-чилі 285 г' },
  { match: 'мини суши бургер вугрем', targetName: 'Міні суші-бургер із вугрем 295 г' },
];

const IRREGULAR_ALIASES = RAW_ALIASES.map(a => ({
  match: normalizeRollName(a.match),
  targetName: a.targetName,
}));

/**
 * Accurately finds the matching standalone Dish for a roll listed in a Set.
 */
export function findDishForRoll(rollName: string, dishes: Dish[]): Dish | undefined {
  if (!rollName || !dishes || dishes.length === 0) return undefined;
  const normRoll = normalizeRollName(rollName);
  if (!normRoll) return undefined;

  const isRollQueryBurger = normRoll.includes('бургер');
  const isRollQueryMini = normRoll.includes('мини') || normRoll.includes('міні');

  // 1. Check irregular aliases with exact equality
  for (const alias of IRREGULAR_ALIASES) {
    if (normRoll === alias.match) {
      const found = dishes.find(d => d.name === alias.targetName);
      if (found) return found;
    }
  }

  // Helper to check if a dish is a burger
  const isBurgerDish = (d: Dish) =>
    d.category.toLowerCase().includes('бургер') ||
    normalizeRollName(d.name).includes('бургер');

  // 2. Direct exact normalized match
  for (const dish of dishes) {
    const dishBurger = isBurgerDish(dish);
    if (!isRollQueryBurger && dishBurger) continue;
    if (isRollQueryBurger && !dishBurger) continue;

    if (normRoll === normalizeRollName(dish.name)) {
      return dish;
    }
  }

  // 3. Exact token bag match (independent of word order!)
  const rollTokens = getTokens(rollName).sort();
  const rollTokenStr = rollTokens.join(' ');
  for (const dish of dishes) {
    const dishBurger = isBurgerDish(dish);
    if (!isRollQueryBurger && dishBurger) continue;
    if (isRollQueryBurger && !dishBurger) continue;

    const dishTokens = getTokens(dish.name).sort();
    if (rollTokenStr === dishTokens.join(' ')) {
      return dish;
    }
  }

  // 4. Token-based smart score match
  const distinctiveKeys = [
    'лаит', 'делюкс', 'delux', 'груш', 'мигдал', 'манго', 'хияш',
    'вугр', 'креветк', 'тун', 'лосос', 'краб', 'курк', 'чеддер',
    'кунжут', 'икр', 'кранч', 'бонит', 'тартар', 'пандор', 'сакур',
    'кобе', 'идзум', 'футомак', 'огирк', 'авокадо', 'монте', 'чиз',
    'запечен', 'темпур', 'аляск'
  ];

  let bestDish: Dish | null = null;
  let bestScore = -100;

  for (const dish of dishes) {
    const dishBurger = isBurgerDish(dish);

    // Strict isolation: Never match a non-burger roll to a burger, and vice-versa
    if (!isRollQueryBurger && dishBurger) continue;
    if (isRollQueryBurger && !dishBurger) continue;

    const dishTokens = getTokens(dish.name);

    let penalty = 0;
    let bonus = 0;

    // Mini burger weighting
    if (isRollQueryBurger) {
      const isDishMini = dish.name.toLowerCase().includes('міні') || dish.category.toLowerCase().includes('mini');
      if (isRollQueryMini && isDishMini) bonus += 200;
      if (!isRollQueryMini && isDishMini) penalty += 200;
      if (isRollQueryMini && !isDishMini) penalty += 200;
    }

    // Caviar (ікра / масаго) strict matching
    const rollHasCaviar = rollTokens.some(t => t.includes('икр') || t.includes('масаг'));
    const dishHasCaviar = dishTokens.some(t => t.includes('икр') || t.includes('масаг')) ||
      dish.ingredients.some(i => i.name.toLowerCase().includes('ікр') || i.name.toLowerCase().includes('масаго'));
    if (rollHasCaviar && !dishHasCaviar) penalty += 300;
    if (!rollHasCaviar && dishHasCaviar) penalty += 150;

    // Sesame (кунжут) strict matching
    const rollHasSesame = rollTokens.some(t => t.includes('кунжут'));
    const dishHasSesame = dishTokens.some(t => t.includes('кунжут')) ||
      dish.ingredients.some(i => i.name.toLowerCase().includes('кунжут'));
    if (rollHasSesame && !dishHasSesame) penalty += 250;
    if (!rollHasSesame && dishHasSesame) penalty += 100;

    for (const dk of distinctiveKeys) {
      const inRoll = rollTokens.some(rt => rt.includes(dk) || dk.includes(rt));
      const inDish = dishTokens.some(dt => dt.includes(dk) || dk.includes(dt));
      if (inRoll && !inDish) penalty += 150;
      if (!inRoll && inDish) penalty += 80;
    }

    let matched = 0;
    for (const rt of rollTokens) {
      if (dishTokens.some(dt => dt === rt || (dt.length >= 4 && dt.startsWith(rt.slice(0, 4))))) {
        matched++;
      }
    }

    const score = (matched * 40) + bonus - penalty;
    if (score > bestScore) {
      bestScore = score;
      bestDish = dish;
    }
  }

  if (bestScore > 0 && bestDish) {
    return bestDish;
  }

  return undefined;
}
