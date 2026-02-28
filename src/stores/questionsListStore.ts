import { create } from 'zustand';

const DEFAULT_LIMIT = 20;

type QuestionsListState = {
  page: number;
  limit: number;
  category: number[];
  setPage: (page: number) => void;
  setCategory: (category: number[]) => void;
};

export const useQuestionsListStore = create<QuestionsListState>((set) => ({
  page: 1,
  limit: DEFAULT_LIMIT,
  category: [],
  setPage: (page) => set({ page }),
  setCategory: (category) => set({ category, page: 1 }),
}));
