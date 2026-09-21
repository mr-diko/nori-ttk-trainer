import { CardProgress, CustomDeck, ExamHistoryItem, MenuData, TabType } from '../types/ttk';

const STORAGE_KEYS = {
  IGNORE_DECOR: 'nori_ignore_decor',
  THEME: 'nori_theme',
  CARD_PROGRESS: 'nori_card_progress',
  CUSTOM_DECKS: 'nori_custom_decks',
  DECOR_OVERRIDES: 'nori_decor_overrides',
  CUSTOM_MENU_DATA: 'nori_custom_menu_data',
  EXAM_HISTORY: 'nori_exam_history',
  PINNED_DISHES: 'nori_pinned_dishes',
  RECENT_DISHES: 'nori_recent_dishes',
  RECENT_COLLAPSED: 'nori_recent_collapsed',
  WAKE_LOCK: 'nori_wake_lock_enabled',
  LAST_TAB: 'nori_last_tab',
};

export const StorageService = {
  getIgnoreDecor(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.IGNORE_DECOR);
    return val === null ? true : val === 'true';
  },

  setIgnoreDecor(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.IGNORE_DECOR, String(val));
  },

  getTheme(): 'dark' | 'light' {
    const val = localStorage.getItem(STORAGE_KEYS.THEME);
    return val === 'light' ? 'light' : 'dark';
  },

  setTheme(val: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, val);
  },

  getCardProgress(): Record<string, CardProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARD_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveCardProgress(progress: Record<string, CardProgress>): void {
    localStorage.setItem(STORAGE_KEYS.CARD_PROGRESS, JSON.stringify(progress));
  },

  updateCard(dishId: string, isCorrect: boolean): CardProgress {
    const all = this.getCardProgress();
    const existing = all[dishId] || {
      dishId,
      status: 'new',
      timesReviewed: 0,
      timesCorrect: 0,
    };

    const timesReviewed = existing.timesReviewed + 1;
    const timesCorrect = isCorrect ? existing.timesCorrect + 1 : existing.timesCorrect;
    
    // If correct at least 2 times with >66% accuracy -> mastered
    let status = existing.status;
    if (isCorrect && timesCorrect >= 2) {
      status = 'mastered';
    } else if (isCorrect) {
      status = 'learning';
    } else {
      status = 'learning';
    }

    const updated: CardProgress = {
      dishId,
      status,
      timesReviewed,
      timesCorrect,
      lastReviewed: Date.now(),
    };

    all[dishId] = updated;
    this.saveCardProgress(all);
    return updated;
  },

  getCustomDecks(): CustomDeck[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_DECKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomDecks(decks: CustomDeck[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(decks));
  },

  addCustomDeck(name: string, dishIds: string[], description?: string, isSmart?: boolean): CustomDeck {
    const decks = this.getCustomDecks();
    const newDeck: CustomDeck = {
      id: `deck-${Date.now()}`,
      name,
      dishIds,
      description,
      createdAt: Date.now(),
      isSmart,
    };
    decks.unshift(newDeck);
    this.saveCustomDecks(decks);
    return newDeck;
  },

  deleteCustomDeck(id: string): void {
    const decks = this.getCustomDecks().filter(d => d.id !== id);
    this.saveCustomDecks(decks);
  },

  toggleDishInDeck(deckId: string, dishId: string): void {
    const decks = this.getCustomDecks();
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      if (deck.dishIds.includes(dishId)) {
        deck.dishIds = deck.dishIds.filter(id => id !== dishId);
      } else {
        deck.dishIds.push(dishId);
      }
      this.saveCustomDecks(decks);
    }
  },

  getDecorOverrides(): Record<string, boolean> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DECOR_OVERRIDES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveDecorOverrides(overrides: Record<string, boolean>): void {
    localStorage.setItem(STORAGE_KEYS.DECOR_OVERRIDES, JSON.stringify(overrides));
  },

  getCustomMenu(): MenuData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_MENU_DATA);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCustomMenu(menu: MenuData): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MENU_DATA, JSON.stringify(menu));
  },

  clearCustomMenu(): void {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_MENU_DATA);
  },

  getExamHistory(): ExamHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addExamResult(item: Omit<ExamHistoryItem, 'id'>): ExamHistoryItem {
    const history = this.getExamHistory();
    const newItem: ExamHistoryItem = {
      ...item,
      id: `exam-${Date.now()}`,
    };
    history.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(history.slice(0, 50)));
    return newItem;
  },

  exportBackup(): string {
    return JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      ignoreDecor: this.getIgnoreDecor(),
      cardProgress: this.getCardProgress(),
      customDecks: this.getCustomDecks(),
      decorOverrides: this.getDecorOverrides(),
      examHistory: this.getExamHistory(),
    }, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.cardProgress) this.saveCardProgress(data.cardProgress);
      if (data.customDecks) this.saveCustomDecks(data.customDecks);
      if (data.decorOverrides) this.saveDecorOverrides(data.decorOverrides);
      if (typeof data.ignoreDecor === 'boolean') this.setIgnoreDecor(data.ignoreDecor);
      if (Array.isArray(data.examHistory)) localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(data.examHistory));
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  },

  getPinnedDishes(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PINNED_DISHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  togglePinnedDish(id: string): string[] {
    const list = this.getPinnedDishes();
    const updated = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
    localStorage.setItem(STORAGE_KEYS.PINNED_DISHES, JSON.stringify(updated));
    return updated;
  },

  getRecentDishes(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_DISHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addRecentDish(id: string): string[] {
    const list = this.getRecentDishes().filter(item => item !== id);
    const updated = [id, ...list].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.RECENT_DISHES, JSON.stringify(updated));
    return updated;
  },

  getRecentCollapsed(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.RECENT_COLLAPSED);
    return val === 'true';
  },

  setRecentCollapsed(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.RECENT_COLLAPSED, String(val));
  },

  getWakeLockPreference(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.WAKE_LOCK);
    return val === 'true';
  },

  setWakeLockPreference(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.WAKE_LOCK, String(val));
  },

  getLastTab(): TabType {
    const val = localStorage.getItem(STORAGE_KEYS.LAST_TAB);
    if (val && ['kitchen', 'catalog', 'flashcards', 'exam', 'decks', 'settings'].includes(val)) {
      return val as TabType;
    }
    return 'kitchen'; // Default is 'kitchen' as requested!
  },

  setLastTab(tab: TabType): void {
    localStorage.setItem(STORAGE_KEYS.LAST_TAB, tab);
  },

  resetAllProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.CARD_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.EXAM_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.PINNED_DISHES);
    localStorage.removeItem(STORAGE_KEYS.RECENT_DISHES);
  }
};
