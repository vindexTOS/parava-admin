// Shared
export interface LocalizedText {
  en: string;
  ru: string;
  ka: string;
}

export function formatLocalized(lt: LocalizedText | null | undefined): string {
  if (!lt) return '';
  return lt.ka || lt.en || lt.ru || '';
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
  subject?: number;
}

export type QuestionCategoryLabels = Record<number, string>;

export interface QuestionSubject {
  id: string;
  code: number;
  name: LocalizedText;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionSubjectGrouped extends QuestionSubject {
  questionCount: number;
}

// Scraper
export interface ScraperStartResponse {
  inserted: number;
  updated: number;
}

export interface ScraperStatusResponse {
  isRunning: boolean;
}

// Groups & Rounds
export interface Group {
  id: string;
  name: LocalizedText;
  color: string;
  backgroundColor: string;
  description: LocalizedText | null;
  createdAt: string;
  updatedAt: string;
  rounds?: Round[];
}

export interface CreateGroupBody {
  name: LocalizedText;
  color: string;
  backgroundColor: string;
  description?: LocalizedText | null;
}

export type UpdateGroupBody = Partial<CreateGroupBody>;

export interface Round {
  id: string;
  title: LocalizedText;
  description: LocalizedText | null;
  xp: number;
  createdAt: string;
  updatedAt: string;
  group?: Group;
  roundQuestions?: RoundQuestion[];
}

export interface CreateRoundBody {
  groupId: string;
  title: LocalizedText;
  description?: LocalizedText | null;
  xp?: number;
}

export type UpdateRoundBody = Partial<Omit<CreateRoundBody, 'groupId'>>;

export interface RoundQuestion {
  id: string;
  orderIndex: number;
  question: Question;
}

// App
export interface HelloResponse {
  message?: string;
}
