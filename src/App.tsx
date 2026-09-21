import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { BottomNav } from './components/Layout/BottomNav';
import { KitchenView } from './components/Kitchen/KitchenView';
import { CatalogView } from './components/Catalog/CatalogView';
import { FlashcardView } from './components/Flashcards/FlashcardView';
import { ExamView } from './components/Exam/ExamView';
import { DecksManager } from './components/Decks/DecksManager';
import { SettingsView } from './components/Settings/SettingsView';
import { Dish } from './types/ttk';

export default function App() {
  const { currentTab, setCurrentTab, setActiveDeckId } = useApp();
  const [studyDish, setStudyDish] = useState<Dish | null>(null);

  const handleStudyDish = (dish: Dish) => {
    setStudyDish(dish);
    setCurrentTab('flashcards');
  };

  const handleStudyDeck = (deckId: string) => {
    setStudyDish(null);
    setActiveDeckId(deckId);
    setCurrentTab('flashcards');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {currentTab === 'kitchen' && (
          <KitchenView />
        )}

        {currentTab === 'catalog' && (
          <CatalogView onStudyDish={handleStudyDish} />
        )}

        {currentTab === 'flashcards' && (
          <FlashcardView initialDish={studyDish} />
        )}

        {currentTab === 'exam' && (
          <ExamView />
        )}

        {currentTab === 'decks' && (
          <DecksManager onStudyDeck={handleStudyDeck} />
        )}

        {currentTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
