import { create } from 'zustand';
import type { SortOrder } from '../types/post';

// Zustand: описываем форму стора через TypeScript интерфейс
// Стор содержит:
//   - state (данные)
//   - actions (функции для изменения state)
// Всё в одном объекте — в отличие от Redux (reducer + actions + dispatch)
interface UIState {
  // Только UI-состояние: порядок сортировки
  // Данные постов живут в TanStack Query (серверный кеш)
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
}

// create<T>((set) => {...}) — TypeScript generic указывает форму стора
// set() — единственный способ изменить state (Zustand гарантирует immutability)
export const useUIStore = create<UIState>((set) => ({
  sortOrder: 'newest',

  // Zustand: set() делает shallow merge, как setState в классовых компонентах
  // Можно писать: set({ sortOrder: order })
  // или полную форму: set((state) => ({ ...state, sortOrder: order }))
  setSortOrder: (sortOrder) => set({ sortOrder }),
}));
