import { describe, it, expect, beforeEach } from 'vitest';
import { QuizGenerator } from '../src/services/quizGenerator';
import { StorageService } from '../src/services/storage';
import { Dish } from '../src/types/ttk';

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

const mockDishes: Dish[] = [
  {
    id: 'dish-1',
    name: 'Філадельфія з лососем 290 г',
    category: 'Філадельфія',
    totalWeight: '290 г',
    ingredients: [
      { name: 'Рис для суші н/ф', weight: '150 г', isDecor: false },
      { name: 'Норі', weight: '0.75 шт', isDecor: false },
      { name: 'Крем-сир', weight: '60 г', isDecor: false },
      { name: 'Огірок', weight: '40 г', isDecor: false },
      { name: 'Лосось слабосолений/копчений н/ф', weight: '60 г', isDecor: false },
      { name: 'Соус унагі', weight: '20 г', isDecor: true },
      { name: 'Кунжут білий', weight: '5 г', isDecor: true },
    ],
  },
  {
    id: 'dish-2',
    name: 'Каліфорнія в ікрі з лососем 270 г',
    category: 'Каліфорнія',
    totalWeight: '270 г',
    ingredients: [
      { name: 'Рис для суші н/ф', weight: '150 г', isDecor: false },
      { name: 'Норі', weight: '0.75 шт', isDecor: false },
      { name: 'Лосось слабосолений н/ф', weight: '50 г', isDecor: false },
      { name: 'Огірок', weight: '30 г', isDecor: false },
      { name: 'Авокадо', weight: '30 г', isDecor: false },
      { name: 'Ікра масаго', weight: '20 г', isDecor: true },
    ],
  },
];

describe('QuizGenerator', () => {
  it('generates questions respecting ignoreDecor flag', () => {
    const questions = QuizGenerator.generateExam(
      mockDishes,
      4,
      null,
      true, // ignoreDecor: true
      (i) => i.isDecor
    );

    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) {
      expect(q.question).toBeDefined();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctAnswer).toBeDefined();

      // Ensure decor items like "Соус унагі", "Кунжут білий" are never target ingredients
      if (q.targetIngredient) {
        expect(['Соус унагі', 'Кунжут білий', 'Ікра масаго']).not.toContain(q.targetIngredient);
      }
    }
  });

  it('generates questions for a specific category', () => {
    const questions = QuizGenerator.generateExam(
      mockDishes,
      2,
      'Каліфорнія',
      false,
      (i) => i.isDecor
    );

    expect(questions.length).toBeGreaterThan(0);
    questions.forEach(q => {
      expect(q.dish.category).toBe('Каліфорнія');
    });
  });
});

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages ignoreDecor preference with default true', () => {
    expect(StorageService.getIgnoreDecor()).toBe(true);
    StorageService.setIgnoreDecor(false);
    expect(StorageService.getIgnoreDecor()).toBe(false);
  });

  it('manages custom decks creation and deletion', () => {
    const deck = StorageService.addCustomDeck('Моя колода', ['dish-1']);
    expect(deck.name).toBe('Моя колода');
    expect(deck.dishIds).toContain('dish-1');

    let decks = StorageService.getCustomDecks();
    expect(decks.length).toBe(1);

    StorageService.toggleDishInDeck(deck.id, 'dish-2');
    decks = StorageService.getCustomDecks();
    expect(decks[0].dishIds).toContain('dish-2');

    StorageService.deleteCustomDeck(deck.id);
    decks = StorageService.getCustomDecks();
    expect(decks.length).toBe(0);
  });

  it('updates card mastery status on correct answers', () => {
    const first = StorageService.updateCard('dish-1', true);
    expect(first.timesReviewed).toBe(1);
    expect(first.timesCorrect).toBe(1);

    const second = StorageService.updateCard('dish-1', true);
    expect(second.timesReviewed).toBe(2);
    expect(second.status).toBe('mastered');
  });
});
