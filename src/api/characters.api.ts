import { api } from './apiManager';
import type {
  Character,
  CharacterGif,
  CreateCharacterBody,
  UpdateCharacterBody,
} from './types';

export const charactersApi = {
  getAll: () => api.get<Character[]>('/characters').then((r) => r.data),
  getOne: (id: string) => api.get<Character>(`/characters/${id}`).then((r) => r.data),
  create: (body: CreateCharacterBody) =>
    api.post<Character>('/characters', body).then((r) => r.data),
  update: (id: string, body: UpdateCharacterBody) =>
    api.patch<Character>(`/characters/${id}`, body).then((r) => r.data),
  delete: (id: string) => api.delete(`/characters/${id}`),
  uploadGif: (characterId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<CharacterGif>(`/characters/${characterId}/gifs`, formData)
      .then((r) => r.data);
  },
  removeGif: (characterId: string, gifId: string) =>
    api.delete(`/characters/${characterId}/gifs/${gifId}`),
};
