import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../api';
import { useQuestionsListStore } from '../stores/questionsListStore';

export function useQuestionsList() {
  const { page, limit, category } = useQuestionsListStore();
  return useQuery({
    queryKey: ['questions', page, limit, category],
    queryFn: () => questionsApi.getAll({ page, limit, category: category.length ? category : undefined }).then((r) => r.data),
  });
}

export function useQuestionCategories() {
  return useQuery({
    queryKey: ['questionCategories'],
    queryFn: () => questionsApi.getCategories(),
  });
}

export function useQuestionDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  });
}

export function useQuestionOne(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => questionsApi.getOne(id!).then((r) => r.data),
    enabled: enabled && Boolean(id),
  });
}
