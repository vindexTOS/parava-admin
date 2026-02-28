import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scraperApi } from '../api';

export function useScraperStatus() {
  return useQuery({
    queryKey: ['scraper-status'],
    queryFn: () => scraperApi.getStatus().then((r) => r.data),
    refetchInterval: 2000,
  });
}

export function useScraperStart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scraperApi.start(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scraper-status'] }),
  });
}

export function useScraperStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => scraperApi.stop(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scraper-status'] }),
  });
}
