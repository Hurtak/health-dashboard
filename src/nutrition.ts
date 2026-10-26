export const dailyProteinTarget = 140;

export const meals = [
  { name: "250 g plain skyr", note: "Your first serving, whenever it fits.", protein: 30, estimated: false },
  { name: "Lunch with meat", note: "A quesadilla, bún bò nam bộ, or your usual.", protein: 40, estimated: true },
  { name: "250 g plain skyr", note: "A second serving during the day.", protein: 30, estimated: false },
  { name: "Dinner with meat", note: "A regular meal with a good meat portion.", protein: 40, estimated: true },
];

export const dailyProteinTotal = meals.reduce((total, meal) => total + meal.protein, 0);
