import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { adminApi } from '../api';
import { useAuthStore } from '../stores/authStore';

export function useLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      adminApi.login(values).then((r) => r.data),
    onSuccess: (data) => {
      login(data.accessToken);
      message.success('Signed in');
      const redirect = searchParams.get('redirect') ?? '/';
      navigate(redirect, { replace: true });
    },
    onError: (err: { response?: { status: number }; message?: string }) => {
      const msg = err.response?.status === 401
        ? 'Invalid email or password'
        : err.message ?? 'Login failed';
      message.error(msg);
    },
  });
}
