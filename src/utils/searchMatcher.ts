import { Dish, PrepTech, SetMenu } from '../types/ttk';

export type SearchableItem = Dish | PrepTech | SetMenu;

// QWERTY <-> ЙЦУКЕН keyboard slip mapping
const EN_TO_UA_LAYOUT: Record<string, string> = {
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ї',
  'a': 'ф', 's': 'і', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'є',
  'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
};

// Phonetic Latin to Ukrainian transliteration rules
const PHONETIC_RULES: [string, string][] = [
  ['shch', 'щ'], ['sh', 'ш'], ['ch', 'ч'], ['zh', 'ж'], ['kh', 'х'], ['ts', 'ц'],
  ['ya', 'я'], ['yu', 'ю'], ['ye', 'є'], ['yi', 'ї'], ['ph', 'ф'],
  ['ia', 'ія'], ['iya', 'ія'], ['ija', 'ія'],
  ['a', 'а'], ['b', 'б'], ['v', 'в'], ['w', 'в'], ['g', 'г'], ['d', 'д'], ['e', 'е'],
  ['z', 'з'], ['i', 'і'], ['j', 'й'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'],
  ['o', 'о'], ['p', 'п'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['f', 'ф'],
  ['h', 'х'], ['c', 'к'], ['y', 'и'], ['x', 'кс'],
];

/**
 * Normalizes text for loose Ukrainian search:
 * - lowercase
 * - removes apostrophes, soft signs, hyphens
 * - unifies vowel variations (і/ї/и -> и, е/є -> е, г/ґ -> г)
 */
export function normalizeUkrainian(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/['’`ʼ\-–—ь]/g, '')
    .replace(/[ії]/g, 'и')
    .replace(/є/g, 'е')
    .replace(/ґ/g, 'г')
    .trim();
}

/**
 * Converts keyboard layout slip (e.g. "ntvgehf" -> "темпура")
 */
export function convertLayoutEnToUa(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(ch => EN_TO_UA_LAYOUT[ch] || ch)
    .join('');
}

/**
 * Transliterates Latin text to Ukrainian Cyrillic (e.g. "tempura" -> "темпура")
 */
export function transliterateEnToUa(text: string): string {
  let res = text.toLowerCase();
  for (const [en, ua] of PHONETIC_RULES) {
    res = res.split(en).join(ua);
  }
  return res;
}

/**
 * Extracts normalized query tokens including layout and translit variants
 */
export function getQueryTokenVariants(token: string): string[] {
  const clean = token.trim();
  if (!clean) return [];

  const variants = new Set<string>();
  variants.add(normalizeUkrainian(clean));

  // Check if token contains Latin letters
  if (/[a-z]/i.test(clean)) {
    const layout = convertLayoutEnToUa(clean);
    variants.add(normalizeUkrainian(layout));

    const translit = transliterateEnToUa(clean);
    variants.add(normalizeUkrainian(translit));
  }

  return Array.from(variants).filter(Boolean);
}

/**
 * Gets the stem of a word (removes inflectional endings in Ukrainian)
 */
function getStem(word: string): string {
  if (word.length <= 3) return word;
  // Common Ukrainian noun/adjective endings: -ам, -ами, -ом, -ем, -ів, -ей, -их, -а, -у, -е, -и, -і, -я, -ю
  return word.replace(/(ами|ями|ом|ем|ям|ам|ів|ей|их|ій|ою|ею|я|а|у|е|и|і|ю)$/i, '');
}

/**
 * Checks if a target string matches any variant of a search word (using exact or stem match)
 */
function matchesWord(targetNorm: string, wordVariants: string[]): { matched: boolean; inName: boolean } {
  for (const v of wordVariants) {
    if (targetNorm.includes(v)) {
      return { matched: true, inName: true };
    }
    const stem = getStem(v);
    if (stem.length >= 3 && targetNorm.includes(stem)) {
      return { matched: true, inName: true };
    }
  }
  return { matched: false, inName: false };
}

export interface RankedItem<T> {
  item: T;
  score: number;
}

/**
 * Searches and ranks items with relevance scoring.
 * 
 * Score rules:
 * - Matches in item name receive the highest weight (+100 for exact phrase, +50 for prefix, +40 per token).
 * - Items where the searched word is in the title ALWAYS rank above items where it is only in ingredients.
 * - Multi-word queries work regardless of word order ("рол темпура" == "темпура рол").
 */
export function searchAndRankItems<T extends SearchableItem>(
  items: T[],
  query: string,
  categoryFilter?: string | null
): T[] {
  if (!items || items.length === 0) return [];
  const rawQuery = query ? query.trim() : '';

  // If no query, just filter by category if provided
  if (!rawQuery) {
    if (categoryFilter && categoryFilter !== 'all') {
      return items.filter(item => item.category === categoryFilter);
    }
    return items;
  }

  // Split query into distinct words
  const rawTokens = rawQuery.split(/\s+/).filter(Boolean);
  const tokenVariantsList = rawTokens.map(t => getQueryTokenVariants(t));

  const scoredList: RankedItem<T>[] = [];

  for (const item of items) {
    // If an explicit category filter is active (and not 'all'), respect it
    if (categoryFilter && categoryFilter !== 'all' && item.category !== categoryFilter) {
      continue;
    }

    const nameNorm = normalizeUkrainian(item.name);
    const catNorm = normalizeUkrainian(item.category || '');
    const ingredientsNorm = ('ingredients' in item && Array.isArray(item.ingredients))
      ? item.ingredients.map(i => normalizeUkrainian(i.name)).join(' ')
      : '';
    const rollsNorm = ('rolls' in item && Array.isArray(item.rolls))
      ? item.rolls.map(r => normalizeUkrainian(r)).join(' ')
      : '';
    const techNorm = ('techProcess' in item && item.techProcess)
      ? normalizeUkrainian(item.techProcess)
      : '';

    const fullBlobNorm = `${nameNorm} ${catNorm} ${ingredientsNorm} ${rollsNorm} ${techNorm}`;

    // 1. Check if EVERY query word matches somewhere in the item
    let allTokensMatched = true;
    for (const variants of tokenVariantsList) {
      const match = matchesWord(fullBlobNorm, variants);
      if (!match.matched) {
        allTokensMatched = false;
        break;
      }
    }

    if (!allTokensMatched) continue;

    // 2. Calculate relevance score
    let score = 0;

    // Highest priority: Exact full phrase match in dish name
    for (const v of getQueryTokenVariants(rawQuery)) {
      if (nameNorm.includes(v)) {
        score += 150;
        break;
      }
    }

    // Name starts with first query word (highest priority for line cook!)
    if (tokenVariantsList.length > 0) {
      for (const v of tokenVariantsList[0]) {
        if (nameNorm.startsWith(v) || nameNorm.startsWith(getStem(v))) {
          score += 120;
          break;
        }
      }
    }

    // Individual tokens matched in name
    let tokensInNameCount = 0;
    for (const variants of tokenVariantsList) {
      const nameMatch = matchesWord(nameNorm, variants);
      if (nameMatch.matched) {
        score += 40;
        tokensInNameCount++;
      }
    }

    // Huge bonus if ALL query words are present in the NAME!
    // (e.g. searching "рол темпура" will strongly prefer "Темпура рол" over "Рол Каноя")
    if (tokensInNameCount === tokenVariantsList.length && tokenVariantsList.length > 0) {
      score += 200;
    }

    // Category match
    for (const variants of tokenVariantsList) {
      if (matchesWord(catNorm, variants).matched) {
        score += 15;
      }
    }

    // Rolls in set match
    if (rollsNorm) {
      for (const variants of tokenVariantsList) {
        if (matchesWord(rollsNorm, variants).matched) {
          score += 25;
        }
      }
    }

    // Ingredients match gets lower score (+5) so name matches always stay on top
    score += 5;

    scoredList.push({ item, score });
  }

  // Sort by score descending
  scoredList.sort((a, b) => b.score - a.score);

  return scoredList.map(s => s.item);
}
