import { describe, it, expect } from 'vitest';
import { searchAndRankItems, normalizeUkrainian, convertLayoutEnToUa, transliterateEnToUa } from '../src/utils/searchMatcher';
import menuData from '../src/data/nori-menu.json';
import { Dish } from '../src/types/ttk';

const allItems = [...menuData.dishes, ...menuData.sets, ...menuData.preps];

describe('Search and Ranking Engine', () => {
  it('normalizes Ukrainian text variations', () => {
    expect(normalizeUkrainian('Темпура')).toBe('темпура');
    expect(normalizeUkrainian('Оніґірі')).toBe('онигири');
    expect(normalizeUkrainian('М\'ята')).toBe('мята');
  });

  it('translates QWERTY layout slips to Ukrainian', () => {
    expect(convertLayoutEnToUa('ntvgehf')).toBe('темпура');
    expect(convertLayoutEnToUa('askf')).toBe('філа');
  });

  it('transliterates phonetic Latin to Ukrainian', () => {
    expect(transliterateEnToUa('tempura')).toBe('темпура');
    expect(transliterateEnToUa('california')).toBe('каліфорнія');
  });

  it('finds Tempura rolls with Cyrillic queries regardless of letter case', () => {
    const lowercase = searchAndRankItems(allItems, 'темпура');
    const capitalized = searchAndRankItems(allItems, 'Темпура');
    const uppercase = searchAndRankItems(allItems, 'ТЕМПУРА');

    expect(lowercase.length).toBeGreaterThan(10);
    expect(capitalized.length).toBe(lowercase.length);
    expect(uppercase.length).toBe(lowercase.length);

    // Verify top results are actual Tempura rolls (name match priority!)
    const topNames = lowercase.slice(0, 8).map(i => i.name);
    expect(topNames).toContain('Темпура рол з лососем 360 г');
    expect(topNames).toContain('Темпура рол із сніговим крабом 360 г');
    expect(topNames).toContain('Темпура рол з креветками та манго 350 г');
  });

  it('supports reversed word order like "рол темпура"', () => {
    const results = searchAndRankItems(allItems, 'рол темпура');
    expect(results.length).toBeGreaterThan(0);

    const firstItem = results[0];
    expect(firstItem.name).toContain('Темпура рол');
  });

  it('supports multi-word query with inflection like "темпура лосось"', () => {
    const results = searchAndRankItems(allItems, 'темпура лосось');
    expect(results.length).toBeGreaterThan(0);

    const firstItem = results[0];
    expect(firstItem.name).toBe('Темпура рол з лососем 360 г');
  });

  it('supports queries like "темпура креветка"', () => {
    const results = searchAndRankItems(allItems, 'темпура креветка');
    expect(results.length).toBeGreaterThan(0);

    const names = results.map(i => i.name);
    expect(names.some(n => n.includes('Темпура') && n.includes('креветка'))).toBe(true);
  });

  it('ranks items with query in title higher than items where it is only in ingredients', () => {
    const results = searchAndRankItems(menuData.dishes as Dish[], 'темпура');

    // Find index of first "Темпура рол..."
    const tempuraRollIndex = results.findIndex(d => d.name.startsWith('Темпура рол'));
    // Find index of "Філадельфія з лососем та креветками" (which only has tempura as ingredient)
    const philaIndex = results.findIndex(d => d.name.startsWith('Філадельфія'));

    expect(tempuraRollIndex).toBe(0); // must be at the very top!
    expect(philaIndex).toBeGreaterThan(tempuraRollIndex);
  });

  it('falls back across categories when searching', () => {
    // If user has 'Філадельфія' selected, but searches 'темпура',
    // passing no categoryFilter returns results across all categories
    const allResults = searchAndRankItems(allItems, 'темпура');
    expect(allResults.some(r => r.category === 'Теплі, запечені, чіз роли')).toBe(true);
  });
});
