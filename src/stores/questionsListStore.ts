import { create } from 'zustand';

const DEFAULT_LIMIT = 20;

type QuestionsListState = {
  page: number;
  limit: number;
  category: number[];
  subject: number | null;
  setPage: (page: number) => void;
  setCategory: (category: number[]) => void;
  setSubject: (subject: number | null) => void;
};

export const useQuestionsListStore = create<QuestionsListState>((set) => ({
  page: 1,
  limit: DEFAULT_LIMIT,
  category: [],
  subject: null,
  setPage: (page) => set({ page }),
  setCategory: (category) => set({ category, page: 1 }),
  setSubject: (subject) => set({ subject, page: 1 }),
}));
