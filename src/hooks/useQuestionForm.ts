import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { questionsApi } from '../api';
import type { CreateQuestionBody } from '../api';

export function useQuestionCreate(onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBody) => questionsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      onSuccess();
    },
    onError: (e: { message?: string }) => message.error(e?.message ?? 'Failed to create'),
  });
}

export function useQuestionUpdate(questionId: string | null, onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateQuestionBody }) =>
      questionsApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      if (questionId) queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      onSuccess();
    },
    onError: (e: { message?: string }) => message.error(e?.message ?? 'Failed to update'),
  });
}
