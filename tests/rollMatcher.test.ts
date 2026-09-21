import { describe, it, expect } from 'vitest';
import { findDishForRoll } from '../src/utils/rollMatcher';
import menuJson from '../src/data/nori-menu.json';
import { Dish } from '../src/types/ttk';

const dishes = menuJson.dishes as Dish[];

describe('Roll to Dish Matcher (Set expansion)', () => {
  it('correctly matches "Філадельфія лайт" to "Філадельфія лайт 290 г" and NOT "Філадельфія з лососем"', () => {
    const matched = findDishForRoll('Філадельфія лайт', dishes);
    expect(matched).toBeDefined();
    expect(matched?.name).toBe('Філадельфія лайт 290 г');
    expect(matched?.id).toBe('dish-8');
  });

  it('correctly matches "Філадельфія зі свіжим лососем" to "Філадельфія з лососем 290 г"', () => {
    const matched = findDishForRoll('Філадельфія зі свіжим лососем', dishes);
    expect(matched).toBeDefined();
    expect(matched?.name).toBe('Філадельфія з лососем 290 г');
  });

  it('correctly matches "Філадельфія в кунжуті зі свіжим лососем" to "Філадельфія з лососем в кунжуті 280 г"', () => {
    const matched = findDishForRoll('Філадельфія в кунжуті зі свіжим лососем', dishes);
    expect(matched).toBeDefined();
    expect(matched?.name).toBe('Філадельфія з лососем в кунжуті 280 г');
  });

  it('correctly matches "Філадельфія гриль з грушею" to "Філадельфія гриль з грушею 310 г"', () => {
    const matched = findDishForRoll('Філадельфія гриль з грушею', dishes);
    expect(matched).toBeDefined();
    expect(matched?.name).toBe('Філадельфія гриль з грушею 310 г');
  });

  it('correctly matches all rolls in Philadelphia Set (Set 1)', () => {
    const set1 = menuJson.sets.find(s => s.name.includes('Філадельфія сет 1150 г'))!;
    expect(set1).toBeDefined();

    const expectedNames = [
      'Філадельфія з лососем 290 г',
      'Філадельфія лайт 290 г',
      'Філадельфія з лососем в кунжуті 280 г',
      'Філадельфія гриль з грушею 310 г',
    ];

    set1.rolls.forEach((roll, idx) => {
      const matched = findDishForRoll(roll, dishes);
      expect(matched).toBeDefined();
      expect(matched?.name).toBe(expectedNames[idx]);
    });
  });

  it('correctly matches rolls in Set Vulcan without confusing with Pandora roll', () => {
    const matched1 = findDishForRoll('Темпура рол з лососем', dishes);
    expect(matched1?.name).toBe('Темпура рол з лососем 360 г');

    const matched2 = findDishForRoll('Темпура рол зі сніговим крабом', dishes);
    expect(matched2?.name).toBe('Темпура рол із сніговим крабом 360 г');

    const matched3 = findDishForRoll('Запечений рол з креветками', dishes);
    expect(matched3?.name).toBe('Запечений рол з креветками 330 г');
  });

  it('correctly matches Maki to Hosomaki recipes', () => {
    expect(findDishForRoll('Макі з лососем', dishes)?.name).toBe('Хосомакі з лососем 150 г');
    expect(findDishForRoll('Макі з креветкою', dishes)?.name).toBe('Хосомакі з креветками 150 г');
    expect(findDishForRoll('Макі із огірком', dishes)?.name).toBe('Хосомакі з огірком 150 г');
    expect(findDishForRoll('Макі із авокадо', dishes)?.name).toBe('Хосомакі з авокадо 150 г');
    expect(findDishForRoll('Макі з тунцем(40 г)', dishes)?.name).toBe('Хосомакі з тунцем 150 г');
    expect(findDishForRoll('Макі із запеченим лососем (40 г)', dishes)?.name).toBe('Хосомакі із запеченим лососем 150 г');
  });

  it('correctly matches Cheese rolls including Monte-Mare', () => {
    expect(findDishForRoll('Чіз рол із запеченим лососем', dishes)?.name).toBe('Чіз рол із запеченим лососем 340 г');
    expect(findDishForRoll('Чіз рол з куркою', dishes)?.name).toBe('Чіз рол з куркою 340 г');
    expect(findDishForRoll('Монте маре', dishes)?.name).toBe('Чіз рол Монте-Маре 390 г');
  });

  it('correctly matches all rolls in new Set #1', () => {
    expect(findDishForRoll('Філадельфія з лососем', dishes)?.name).toBe('Філадельфія з лососем 290 г');
    expect(findDishForRoll('Філадельфія в кунжуті з креветками', dishes)?.name).toBe('Філадельфія з креветками в кунжуті 280 г');
    expect(findDishForRoll('Каліфорнія в ікрі класична', dishes)?.name).toBe('Каліфорнія в ікрі класична 260 г');
    expect(findDishForRoll('Сирний рол з грушею', dishes)?.name).toBe('Філадельфія гриль з грушею 310 г');
    expect(findDishForRoll('Запечений рол із міксом снігового краба', dishes)?.name).toBe('Запечений рол із міксом снігового краба 340 г');
  });

  it('correctly matches all rolls in new Set "Супер кілограм" (NEVER burger!)', () => {
    const matchedUnagi = findDishForRoll('Рол з міксом лосося в унагі-чилі', dishes);
    expect(matchedUnagi).toBeDefined();
    expect(matchedUnagi?.name).toBe('Темпура рол з лососем в унагі-чилі 350 г');
    expect(matchedUnagi?.category).not.toBe('Суші-бургери');

    expect(findDishForRoll('Філадельфія з лососем в кунжуті', dishes)?.name).toBe('Філадельфія з лососем в кунжуті 280 г');
    expect(findDishForRoll('Аляска рол', dishes)?.name).toBe('Аляска рол 270 г');
    expect(findDishForRoll('Кранч рол із креветками темпура', dishes)?.name).toBe('Кранч рол з креветками 290 г');
  });

  it('correctly matches mini burgers in mini burger sets to exact mini burger TTK recipes', () => {
    expect(findDishForRoll('Міні суші-бургер із запеченим лососем', dishes)?.name).toBe('Міні суші-бургер із запеченим лососем 285 г');
    expect(findDishForRoll('Міні суші-бургер з креветками', dishes)?.name).toBe('Міні суші-бургер з креветками темпура 290 г');
    expect(findDishForRoll('Міні суші-бургер з лососем та сніговим крабом', dishes)?.name).toBe('Міні суші-бургер із лососем та сніговим крабом 270 г');
    expect(findDishForRoll('Міні суші-бургер з лососем в унагі-чилі', dishes)?.name).toBe('Міні суші-бургер з лососем в унагі-чилі 285 г');
    expect(findDishForRoll('Міні суші-бургер з вугрем', dishes)?.name).toBe('Міні суші-бургер із вугрем 295 г');
  });

  it('verifies archive flags are set for archived dishes', () => {
    const rollDog = dishes.find(d => d.name.includes('Рол дог'));
    expect(rollDog?.isArchived).toBe(true);

    const pandora = dishes.find(d => d.name.includes('Рол Пандора'));
    expect(pandora?.isArchived).toBe(true);

    const activeDish = dishes.find(d => d.name === 'Філадельфія лайт 290 г');
    expect(activeDish?.isArchived).toBeFalsy();
  });
});
