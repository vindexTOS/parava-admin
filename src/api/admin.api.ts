import { api } from './apiManager';
import type { AdminLoginBody, AdminAuthResponse } from './types';

export const adminApi = {
  login: (body: AdminLoginBody) =>
    api.post<AdminAuthResponse>('/admin/login', body),
};
