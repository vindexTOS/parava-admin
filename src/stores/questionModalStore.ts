import { create } from 'zustand';

type QuestionModalState = {
  open: boolean;
  editingId: string | null;
  openCreate: () => void;
  openEdit: (id: string) => void;
  close: () => void;
};

export const useQuestionModalStore = create<QuestionModalState>((set) => ({
  open: false,
  editingId: null,

  openCreate: () => set({ open: true, editingId: null }),
  openEdit: (id) => set({ open: true, editingId: id }),
  close: () => set({ open: false, editingId: null }),
}));
