import { api } from './apiManager';
import type {
  Question,
  CreateQuestionBody,
  UpdateQuestionBody,
  PaginatedResponse,
  PaginationParams,
  QuestionCategoryLabels,
} from './types';

export const questionsApi = {
  getCategories: () =>
    api.get<QuestionCategoryLabels>('/questions/categories').then((r) => r.data),

  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Question>>('/questions', { params }),

  getOne: (id: string) => api.get<Question>(`/questions/${id}`),

  create: (body: CreateQuestionBody) =>
    api.post<Question>('/questions', body),

  update: (id: string, body: UpdateQuestionBody) =>
    api.patch<Question>(`/questions/${id}`, body),

  delete: (id: string) =>
    api.delete(`/questions/${id}`),

  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ path: string }>('/questions/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
