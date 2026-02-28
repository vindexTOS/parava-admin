import { api } from './apiManager';
import type { ScraperStartResponse, ScraperStatusResponse } from './types';

export const scraperApi = {
  start: () => api.post<ScraperStartResponse>('/scraper/start'),
  stop: () => api.post('/scraper/stop'),
  getStatus: () => api.get<ScraperStatusResponse>('/scraper/status'),
};
