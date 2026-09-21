import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storage';
import { isWakeLockSupported } from '../src/utils/wakeLock';
import menuData from '../src/data/nori-menu.json';

// Mock localStorage for node test environment
const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  length: 0,
  key: () => null,
} as any;

describe('Kitchen Storage & Features', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to kitchen as lastTab', () => {
    expect(StorageService.getLastTab()).toBe('kitchen');
    StorageService.setLastTab('catalog');
    expect(StorageService.getLastTab()).toBe('catalog');
  });

  it('manages pinned dishes list', () => {
    expect(StorageService.getPinnedDishes()).toEqual([]);

    const pinned = StorageService.togglePinnedDish('dish-1');
    expect(pinned).toContain('dish-1');
    expect(StorageService.getPinnedDishes()).toEqual(['dish-1']);

    const unpinned = StorageService.togglePinnedDish('dish-1');
    expect(unpinned).not.toContain('dish-1');
    expect(StorageService.getPinnedDishes()).toEqual([]);
  });

  it('manages recent dishes list with deduplication and order', () => {
    expect(StorageService.getRecentDishes()).toEqual([]);

    StorageService.addRecentDish('dish-1');
    StorageService.addRecentDish('dish-2');
    StorageService.addRecentDish('dish-1'); // should move to top

    const recent = StorageService.getRecentDishes();
    expect(recent[0]).toBe('dish-1');
    expect(recent[1]).toBe('dish-2');
    expect(recent.length).toBe(2);
  });

  it('manages wake lock preference', () => {
    expect(StorageService.getWakeLockPreference()).toBe(false);
    StorageService.setWakeLockPreference(true);
    expect(StorageService.getWakeLockPreference()).toBe(true);
  });

  it('detects wakeLock API support safely in node', () => {
    expect(typeof isWakeLockSupported()).toBe('boolean');
  });

  it('validates interactive set rolls link to real dishes', () => {
    // Check that rolls inside sets can be matched to dishes
    const sets = menuData.sets;
    const dishes = menuData.dishes;

    expect(sets.length).toBeGreaterThanOrEqual(23);

    // Pick a well-known set: "Філадельфія сет 1150 г"
    const philaSet = sets.find(s => s.name.includes('Філадельфія сет'));
    expect(philaSet).toBeDefined();

    // Check rolls in set
    if (philaSet) {
      for (const rollName of philaSet.rolls) {
        const found = dishes.some(d => {
          const dClean = d.name.toLowerCase();
          const rClean = rollName.toLowerCase();
          return dClean.includes(rClean) || rClean.includes(dClean.split(' ')[0]);
        });
        expect(found).toBe(true);
      }
    }
  });

  it('supports kitchen fast search by ingredient name', () => {
    const dishes = menuData.dishes;

    // Search for "вугор"
    const eelDishes = dishes.filter(d => 
      d.ingredients.some(i => i.name.toLowerCase().includes('вугор'))
    );
    expect(eelDishes.length).toBeGreaterThan(0);

    // Search for "манго"
    const mangoDishes = dishes.filter(d => 
      d.ingredients.some(i => i.name.toLowerCase().includes('манго'))
    );
    expect(mangoDishes.length).toBeGreaterThan(0);
  });
});
