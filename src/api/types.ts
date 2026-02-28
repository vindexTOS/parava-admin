// Shared
export interface LocalizedText {
  en: string;
  ru: string;
  ka: string;
}

export interface QuestionAnswer {
  text: LocalizedText;
  isCorrect: boolean;
}

// Admin auth
export interface AdminLoginBody {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  accessToken: string;
}

// Questions
export interface Question {
  id: string;
  externalId: number;
  questionText: LocalizedText;
  questionExplained: LocalizedText | null;
  answers: QuestionAnswer[];
  correctAnswer: number;
  imageUrl: string | null;
  subject: number;
  categories: number[];
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionBody {
  externalId: number;
  questionText: LocalizedText;
  questionExplained?: LocalizedText | null;
  answers: QuestionAnswer[];
  correctAnswer: number;
  imageUrl?: string | null;
  subject: number;
  categories: number[];
  audioUrl?: string | null;
}

export type UpdateQuestionBody = Partial<CreateQuestionBody>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  category?: number[];
}

export type QuestionCategoryLabels = Record<number, string>;

// Scraper
export interface ScraperStartResponse {
  inserted: number;
  updated: number;
}

export interface ScraperStatusResponse {
  isRunning: boolean;
}

// App
export interface HelloResponse {
  message?: string;
}
