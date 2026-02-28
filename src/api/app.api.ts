import { api } from './apiManager';
import type { HelloResponse } from './types';

export const appApi = {
  hello: () => api.get<HelloResponse>('/'),
};
