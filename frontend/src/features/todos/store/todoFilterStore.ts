import { create } from "zustand";
import type { TodoFilters } from "../types";

type TodoFilterState = {
  filters: TodoFilters;
  setFilter: <K extends keyof TodoFilters>(key: K, value: TodoFilters[K]) => void;
  setFilters: (filters: TodoFilters) => void;
  resetFilters: () => void;
};

function cleanFilters(filters: TodoFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)
  ) as TodoFilters;
}

export const useTodoFilterStore = create<TodoFilterState>()((set) => ({
  filters: {},
  setFilter: (key, value) =>
    set((state) => ({
      filters: cleanFilters({
        ...state.filters,
        [key]: value
      })
    })),
  setFilters: (filters) => set({ filters: cleanFilters(filters) }),
  resetFilters: () => set({ filters: {} })
}));
