import { Dish, ExamQuestion, Ingredient } from '../types/ttk';

export const QuizGenerator = {
  generateExam(
    dishes: Dish[],
    questionCount = 10,
    category: string | null = null,
    ignoreDecor = true,
    isIngredientDecor: (i: Ingredient) => boolean = (i) => i.isDecor
  ): ExamQuestion[] {
    // Filter dishes by category if specified
    let pool = dishes.filter(d => d.ingredients.length > 0);
    if (category && category !== 'all') {
      pool = pool.filter(d => d.category === category);
    }

    if (pool.length === 0) {
      pool = dishes;
    }

    // Collect all unique base ingredient names across the menu for distractors
    const allIngredientsPool: string[] = [];
    dishes.forEach(d => {
      d.ingredients.forEach(i => {
        if (!ignoreDecor || !isIngredientDecor(i)) {
          if (!allIngredientsPool.includes(i.name)) {
            allIngredientsPool.push(i.name);
          }
        }
      });
    });

    const shuffledDishes = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min(questionCount, shuffledDishes.length);
    const questions: ExamQuestion[] = [];

    for (let idx = 0; idx < count; idx++) {
      const dish = shuffledDishes[idx % shuffledDishes.length];
      const effectiveIngredients = dish.ingredients.filter(
        i => !ignoreDecor || !isIngredientDecor(i)
      );

      if (effectiveIngredients.length === 0) continue;

      // Randomly alternate between composition (50%) and weight (50%)
      const isWeight = Math.random() > 0.5;

      if (isWeight) {
        // Pick an ingredient with a distinct weight (e.g. "60 г", "150 г", "0.75 шт")
        const targetIng = effectiveIngredients[Math.floor(Math.random() * effectiveIngredients.length)];
        const correctWeight = targetIng.weight.trim();

        // Generate 3 distractors
        const distractors = new Set<string>();
        
        // Typical weights in sushi
        const candidateWeights = ['10 г', '15 г', '20 г', '30 г', '40 г', '50 г', '60 г', '70 г', '80 г', '100 г', '150 г', '160 г', '0.5 шт', '0.75 шт', '1 шт'];
        
        for (const w of candidateWeights.sort(() => Math.random() - 0.5)) {
          if (w !== correctWeight && distractors.size < 3) {
            distractors.add(w);
          }
        }

        const options = [correctWeight, ...Array.from(distractors)].sort(() => Math.random() - 0.5);

        questions.push({
          id: `q-weight-${idx}-${dish.id}`,
          dish,
          type: 'weight',
          targetIngredient: targetIng.name,
          question: `Скільки «${targetIng.name}» потрібно для приготування ролу «${dish.name}»?`,
          options,
          correctAnswer: correctWeight,
        });
      } else {
        // Composition question: Which ingredient is in this dish?
        const targetIng = effectiveIngredients[Math.floor(Math.random() * effectiveIngredients.length)];
        const currentIngNames = new Set(dish.ingredients.map(i => i.name));

        // Find 3 distractors not present in this dish
        const distractors = new Set<string>();
        for (const candidate of allIngredientsPool.sort(() => Math.random() - 0.5)) {
          if (!currentIngNames.has(candidate) && distractors.size < 3) {
            distractors.add(candidate);
          }
        }

        const options = [targetIng.name, ...Array.from(distractors)].sort(() => Math.random() - 0.5);

        questions.push({
          id: `q-comp-${idx}-${dish.id}`,
          dish,
          type: 'composition',
          targetIngredient: targetIng.name,
          question: `Який із наведених інгредієнтів входить до складу ролу «${dish.name}»?`,
          options,
          correctAnswer: targetIng.name,
        });
      }
    }

    return questions;
  },
};
