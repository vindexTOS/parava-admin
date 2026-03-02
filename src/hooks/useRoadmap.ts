import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi, roundsApi } from '../api';

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll(),
  });
}

export function useGroupOne(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getOne(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useGroupCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useGroupUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof groupsApi.update>[1] }) =>
      groupsApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useGroupDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useRounds(groupId?: string | null) {
  return useQuery({
    queryKey: ['rounds', groupId],
    queryFn: () => roundsApi.getAll(groupId ?? undefined),
    enabled: groupId !== undefined,
  });
}

export function useRoundOne(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['round', id],
    queryFn: () => roundsApi.getOne(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useRoundQuestions(roundId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['roundQuestions', roundId],
    queryFn: () => roundsApi.getQuestions(roundId!),
    enabled: enabled && Boolean(roundId),
  });
}

export function useRoundCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roundsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useRoundUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof roundsApi.update>[1] }) =>
      roundsApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useRoundDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roundsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useRoundAddQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roundId,
      questionId,
      orderIndex,
    }: {
      roundId: string;
      questionId: string;
      orderIndex?: number;
    }) => roundsApi.addQuestion(roundId, questionId, orderIndex),
    onSuccess: (_, { roundId }) => {
      queryClient.invalidateQueries({ queryKey: ['roundQuestions', roundId] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useRoundRemoveQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roundId,
      roundQuestionId,
    }: {
      roundId: string;
      roundQuestionId: string;
    }) => roundsApi.removeQuestion(roundId, roundQuestionId),
    onSuccess: (_, { roundId }) => {
      queryClient.invalidateQueries({ queryKey: ['roundQuestions', roundId] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useRoundReorderQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roundId,
      roundQuestionIds,
    }: {
      roundId: string;
      roundQuestionIds: string[];
    }) => roundsApi.reorderQuestions(roundId, roundQuestionIds),
    onSuccess: (_, { roundId }) => {
      queryClient.invalidateQueries({ queryKey: ['roundQuestions', roundId] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
