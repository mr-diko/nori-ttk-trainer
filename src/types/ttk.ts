export interface Ingredient {
  name: string;
  weight: string;
  isDecor: boolean;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  totalWeight: string;
  pieces?: string;
  ingredients: Ingredient[];
  techProcess?: string;
  image?: string;
}

export interface PrepTech {
  id: string;
  name: string;
  category: 'Заготовки';
  techProcess: string;
  ingredients: { name: string; weight: string }[];
  outputWeight?: string;
}

export interface SetMenu {
  id: string;
  name: string;
  category: 'Набори 2026';
  totalWeight: string;
  pieces?: string;
  rolls: string[];
  image?: string;
}

export interface MenuData {
  categories: string[];
  dishCount: number;
  prepCount: number;
  setCount: number;
  dishes: Dish[];
  preps: PrepTech[];
  sets: SetMenu[];
}

export type CardMasteryStatus = 'new' | 'learning' | 'mastered';

export interface CardProgress {
  dishId: string;
  status: CardMasteryStatus;
  timesReviewed: number;
  timesCorrect: number;
  lastReviewed?: number;
}

export interface CustomDeck {
  id: string;
  name: string;
  description?: string;
  dishIds: string[];
  createdAt: number;
  isSmart?: boolean;
}

export interface ExamQuestion {
  id: string;
  dish: Dish;
  type: 'composition' | 'weight';
  question: string;
  targetIngredient?: string;
  options: string[];
  correctAnswer: string;
}

export interface ExamHistoryItem {
  id: string;
  date: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  mistakeDishIds: string[];
}
