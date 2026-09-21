import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultMenuData from '../data/nori-menu.json';
import { MenuData, Dish, Ingredient, CardProgress, CustomDeck, ExamHistoryItem } from '../types/ttk';
import { StorageService } from '../services/storage';

interface AppContextType {
  menuData: MenuData;
  ignoreDecor: boolean;
  setIgnoreDecor: (val: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  cardProgress: Record<string, CardProgress>;
  updateCardProgress: (dishId: string, isCorrect: boolean) => void;
  customDecks: CustomDeck[];
  createCustomDeck: (name: string, dishIds: string[], desc?: string, isSmart?: boolean) => CustomDeck;
  deleteCustomDeck: (id: string) => void;
  toggleDishInDeck: (deckId: string, dishId: string) => void;
  decorOverrides: Record<string, boolean>;
  toggleDecorOverride: (ingredientName: string) => void;
  isIngredientDecor: (ing: Ingredient) => boolean;
  getEffectiveIngredients: (dish: Dish) => Ingredient[];
  currentTab: 'catalog' | 'flashcards' | 'exam' | 'decks' | 'settings';
  setCurrentTab: (tab: 'catalog' | 'flashcards' | 'exam' | 'decks' | 'settings') => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  activeDeckId: string | null;
  setActiveDeckId: (id: string | null) => void;
  examHistory: ExamHistoryItem[];
  saveExamResult: (result: Omit<ExamHistoryItem, 'id'>) => ExamHistoryItem;
  resetProgress: () => void;
  loadNewMenu: (menu: MenuData) => void;
  resetToDefaultMenu: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuData, setMenuData] = useState<MenuData>(() => {
    return StorageService.getCustomMenu() || (defaultMenuData as unknown as MenuData);
  });

  const [ignoreDecor, setIgnoreDecorState] = useState<boolean>(() => StorageService.getIgnoreDecor());
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => StorageService.getTheme());
  const [cardProgress, setCardProgress] = useState<Record<string, CardProgress>>(() => StorageService.getCardProgress());
  const [customDecks, setCustomDecks] = useState<CustomDeck[]>(() => StorageService.getCustomDecks());
  const [decorOverrides, setDecorOverrides] = useState<Record<string, boolean>>(() => StorageService.getDecorOverrides());
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>(() => StorageService.getExamHistory());

  const [currentTab, setCurrentTab] = useState<'catalog' | 'flashcards' | 'exam' | 'decks' | 'settings'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setIgnoreDecor = (val: boolean) => {
    setIgnoreDecorState(val);
    StorageService.setIgnoreDecor(val);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    StorageService.setTheme(next);
  };

  const updateCardProgress = (dishId: string, isCorrect: boolean) => {
    const updated = StorageService.updateCard(dishId, isCorrect);
    setCardProgress(prev => ({ ...prev, [dishId]: updated }));
  };

  const createCustomDeck = (name: string, dishIds: string[], desc?: string, isSmart?: boolean): CustomDeck => {
    const newDeck = StorageService.addCustomDeck(name, dishIds, desc, isSmart);
    setCustomDecks(StorageService.getCustomDecks());
    return newDeck;
  };

  const deleteCustomDeck = (id: string) => {
    StorageService.deleteCustomDeck(id);
    setCustomDecks(StorageService.getCustomDecks());
    if (activeDeckId === id) {
      setActiveDeckId(null);
    }
  };

  const toggleDishInDeck = (deckId: string, dishId: string) => {
    StorageService.toggleDishInDeck(deckId, dishId);
    setCustomDecks(StorageService.getCustomDecks());
  };

  const toggleDecorOverride = (ingredientName: string) => {
    const current = { ...decorOverrides };
    if (current[ingredientName] !== undefined) {
      delete current[ingredientName];
    } else {
      // Find current status
      let defaultStatus = false;
      for (const d of menuData.dishes) {
        const found = d.ingredients.find(i => i.name === ingredientName);
        if (found) {
          defaultStatus = found.isDecor;
          break;
        }
      }
      current[ingredientName] = !defaultStatus;
    }
    setDecorOverrides(current);
    StorageService.saveDecorOverrides(current);
  };

  const isIngredientDecor = (ing: Ingredient): boolean => {
    if (decorOverrides[ing.name] !== undefined) {
      return decorOverrides[ing.name];
    }
    return ing.isDecor;
  };

  const getEffectiveIngredients = (dish: Dish): Ingredient[] => {
    if (!ignoreDecor) {
      return dish.ingredients;
    }
    return dish.ingredients.filter(i => !isIngredientDecor(i));
  };

  const saveExamResult = (result: Omit<ExamHistoryItem, 'id'>): ExamHistoryItem => {
    const saved = StorageService.addExamResult(result);
    setExamHistory(StorageService.getExamHistory());
    return saved;
  };

  const resetProgress = () => {
    StorageService.resetAllProgress();
    setCardProgress({});
    setExamHistory([]);
  };

  const loadNewMenu = (newMenu: MenuData) => {
    StorageService.saveCustomMenu(newMenu);
    setMenuData(newMenu);
  };

  const resetToDefaultMenu = () => {
    StorageService.clearCustomMenu();
    setMenuData(defaultMenuData as unknown as MenuData);
  };

  return (
    <AppContext.Provider
      value={{
        menuData,
        ignoreDecor,
        setIgnoreDecor,
        theme,
        toggleTheme,
        cardProgress,
        updateCardProgress,
        customDecks,
        createCustomDeck,
        deleteCustomDeck,
        toggleDishInDeck,
        decorOverrides,
        toggleDecorOverride,
        isIngredientDecor,
        getEffectiveIngredients,
        currentTab,
        setCurrentTab,
        selectedCategory,
        setSelectedCategory,
        activeDeckId,
        setActiveDeckId,
        examHistory,
        saveExamResult,
        resetProgress,
        loadNewMenu,
        resetToDefaultMenu,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
