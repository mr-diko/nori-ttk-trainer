import { Dish } from '../types/ttk';

/**
 * High precision Unicode normalization for Ukrainian dish/roll matching
 */
export function normalizeRollName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ') // remove parentheses e.g. (90г), (50 г)
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
const IRREGULAR_ALIASES: { match: string; targetName: string }[] = [
  { match: 'филаделфия delux лососем', targetName: 'Філадельфія DeLux 300 г' },
  { match: 'филаделфия delux вугрем', targetName: 'Філадельфія DeLux 300 г' },
  { match: 'филаделфия икри креветк манго', targetName: 'Філадельфія з лососем та креветками 350 г' },
  { match: 'филаделфия икри креветк', targetName: 'Філадельфія з креветками 280 г' },
  { match: 'филаделфия вугрем кунжути', targetName: 'Філадельфія з вугрем 300 г' },
  { match: 'сирний грушею', targetName: 'Філадельфія гриль з грушею 310 г' },
  { match: 'криспи копченим лососем', targetName: 'Кранч рол з копченим лососем 280 г' },
  { match: 'кори', targetName: 'Кобе рол 345 г' },
  { match: 'монте маре', targetName: 'Чіз рол Монте-Маре 390 г' },
  { match: 'маки запеченим лососем', targetName: 'Хосомакі з лососем 150 г' },
  { match: 'маки темпура сниговим крабом', targetName: 'Хосомакі зі сніговим крабом' },
  { match: 'калифорния икри класична', targetName: 'Каліфорнія в кунжуті класична 260 г' },
  { match: 'темпура лососем гострою карамеллю', targetName: 'Темпура рол з лососем в унагі-чилі 350 г' },
  { match: 'авокадо креветк', targetName: 'Кранч рол з креветками 290 г' },
  { match: 'запечен миксом снигового краба', targetName: 'Темпура рол із сніговим крабом 360 г' },
  { match: 'миксом лосося унагичили', targetName: 'Темпура рол з лососем в унагі-чилі 350 г' },
  { match: 'кранч креветк темпура', targetName: 'Кранч рол з креветками 290 г' },
  { match: 'мини суши бургер запечен лососем', targetName: 'Суші бургер із запеченим лососем 420 г' },
  { match: 'мини суши бургер креветк', targetName: 'Суші бургер з креветками 400 г' },
  { match: 'мини суши бургер лососем сниговим крабом', targetName: 'Black Суші бургер з креветками та сніговим крабом 420 г' },
  { match: 'мини суши бургер лососем унагичили', targetName: 'Суші бургер з лососем в унагі-чилі 420 г' },
  { match: 'мини суши бургер вугрем', targetName: 'Суші бургер з вугрем 420 г' },
];

/**
 * Accurately finds the matching standalone Dish for a roll listed in a Set.
 */
export function findDishForRoll(rollName: string, dishes: Dish[]): Dish | undefined {
  if (!rollName || !dishes || dishes.length === 0) return undefined;
  const normRoll = normalizeRollName(rollName);
  if (!normRoll) return undefined;

  // 1. Check irregular aliases with exact equality
  for (const alias of IRREGULAR_ALIASES) {
    if (normRoll === alias.match) {
      const found = dishes.find(d => d.name === alias.targetName);
      if (found) return found;
    }
  }

  // 2. Direct exact normalized match
  for (const dish of dishes) {
    if (normRoll === normalizeRollName(dish.name)) {
      return dish;
    }
  }

  // 3. Exact token bag match (independent of word order!)
  const rollTokens = getTokens(rollName).sort();
  const rollTokenStr = rollTokens.join(' ');
  for (const dish of dishes) {
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
    'кобе', 'идзум', 'футомак', 'огирк', 'авокадо', 'монте', 'чиз'
  ];

  let bestDish: Dish | null = null;
  let bestScore = -100;

  for (const dish of dishes) {
    const dishTokens = getTokens(dish.name);

    let penalty = 0;
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

    const score = (matched * 40) - penalty;
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
