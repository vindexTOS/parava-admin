import { api } from './apiManager';
import type {
  Group,
  Round,
  RoundQuestion,
  CreateGroupBody,
  UpdateGroupBody,
  CreateRoundBody,
  UpdateRoundBody,
} from './types';

export const groupsApi = {
  getAll: () => api.get<Group[]>('/groups').then((r) => r.data),
  getOne: (id: string) => api.get<Group>(`/groups/${id}`).then((r) => r.data),
  create: (body: CreateGroupBody) =>
    api.post<Group>('/groups', body).then((r) => r.data),
  update: (id: string, body: UpdateGroupBody) =>
    api.patch<Group>(`/groups/${id}`, body).then((r) => r.data),
  delete: (id: string) => api.delete(`/groups/${id}`),
};

export const roundsApi = {
  getAll: (groupId?: string) =>
    api
      .get<Round[]>('/rounds', { params: groupId ? { groupId } : undefined })
      .then((r) => r.data),
  getOne: (id: string) => api.get<Round>(`/rounds/${id}`).then((r) => r.data),
  create: (body: CreateRoundBody) =>
    api.post<Round>('/rounds', body).then((r) => r.data),
  update: (id: string, body: UpdateRoundBody) =>
    api.patch<Round>(`/rounds/${id}`, body).then((r) => r.data),
  delete: (id: string) => api.delete(`/rounds/${id}`),
  getQuestions: (roundId: string) =>
    api
      .get<RoundQuestion[]>(`/rounds/${roundId}/questions`)
      .then((r) => r.data),
  addQuestion: (roundId: string, questionId: string, orderIndex?: number) =>
    api
      .post<RoundQuestion>(`/rounds/${roundId}/questions`, {
        questionId,
        orderIndex,
      })
      .then((r) => r.data),
  addQuestionsBulk: (roundId: string, questionIds: string[]) =>
    api
      .post<RoundQuestion[]>(`/rounds/${roundId}/questions/bulk`, { questionIds })
      .then((r) => r.data),
  removeQuestion: (roundId: string, roundQuestionId: string) =>
    api.delete(`/rounds/${roundId}/questions/${roundQuestionId}`),
  reorderQuestions: (roundId: string, roundQuestionIds: string[]) =>
    api
      .patch<RoundQuestion[]>(`/rounds/${roundId}/questions/reorder`, {
        roundQuestionIds,
      })
      .then((r) => r.data),
};
