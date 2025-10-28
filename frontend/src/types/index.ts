// User types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  lastLogin?: string;
}

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  moduleName: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  uploadedAt: string;
  textSize?: number;
  s3Key?: string;
  numPages?: number;
}

// Quiz and Question types
export interface Quiz {
  id: string;
  title: string;
  questionCount: number;
  status: 'completed' | 'in-progress' | 'not-started';
  score?: number;
  createdAt: string;
  fileId?: string;
  userId?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  selectedOptionIndex?: number;
  explanation?: string;
  sourceSnippet?: string;
  quizId?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, number>;
  score: number;
  correctCount: number;
  wrongCount: number;
  startedAt: string;
  submittedAt: string;
  timeSpent?: number; // in seconds
}

// Dashboard and Analytics types
export interface DashboardStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  percentile: number;
  recentTests: Quiz[];
  totalQuestionsAnswered?: number;
  totalCorrectAnswers?: number;
}

export interface Analytics {
  userId: string;
  period: 'weekly' | 'monthly' | 'yearly';
  testsTaken: number;
  averageScore: number;
  improvement: number;
  weakAreas: string[];
  strongAreas: string[];
}

// MCQ Generation types
export interface MCQGenerationRequest {
  fileId: string;
  questionCount: 10 | 20 | 50;
  prompt?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  focusAreas?: string[];
}

export interface MCQGenerationJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  fileId: string;
  questionCount: number;
  progress?: number;
  result?: {
    quizId: string;
    questions: Question[];
  };
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Form and UI types
export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UploadState {
  file: File | null;
  progress: number;
  uploading: boolean;
  error: string | null;
  result: FileUpload | null;
}

export interface QuizState {
  currentQuestion: number;
  answers: Record<string, number>;
  timeRemaining: number;
  isSubmitted: boolean;
}

// Navigation types
export type PageType = 
  | 'login' 
  | 'signup' 
  | 'dashboard' 
  | 'upload' 
  | 'generate' 
  | 'quiz' 
  | 'results' 
  | 'review' 
  | 'profile' 
  | 'analytics';

export interface NavigationState {
  currentPage: PageType;
  previousPage?: PageType;
  params?: Record<string, any>;
}

// Chart and Visualization types
export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface TopicPerformance {
  topic: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  improvement?: number;
}

export interface ProgressData {
  date: string;
  score: number;
  testsTaken: number;
  averageTime: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'custom';
}

// Settings and Preferences types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    quizReminders: boolean;
  };
  quizSettings: {
    defaultQuestionCount: 10 | 20 | 50;
    showTimer: boolean;
    randomizeQuestions: boolean;
    instantFeedback: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
  };
}

// API Service types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

// Component Prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Hook return types
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export interface UseUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadFile: (file: File, moduleName: string) => Promise<{ fileId: string; textSize: number }>;
  reset: () => void;
}

export interface UseQuizReturn {
  loading: boolean;
  error: string | null;
  quiz: {
    id: string;
    title: string;
    questions: Question[];
  } | null;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  generateQuiz: (fileId: string, questionCount: number, prompt?: string) => Promise<void>;
  loadQuiz: (quizId: string) => Promise<void>;
  submitQuiz: (quizId: string) => Promise<{ resultId: string; score: number; correctCount: number; totalCount: number }>;
  selectAnswer: (questionId: string, optionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  resetQuiz: () => void;
  currentQuestion: Question | undefined;
  isLastQuestion: boolean;
  isFirstQuestion: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  progress: number;
}

// Event types
export interface QuizEvent {
  type: 'start' | 'answer' | 'submit' | 'timeout' | 'pause' | 'resume';
  timestamp: string;
  data?: any;
}

export interface UploadEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  timestamp: string;
  data?: any;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Enum-like types
export const QuestionDifficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export const QuizStatus = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  PAUSED: 'paused',
} as const;

export const FileStatus = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export type QuestionDifficultyType = typeof QuestionDifficulty[keyof typeof QuestionDifficulty];
export type QuizStatusType = typeof QuizStatus[keyof typeof QuizStatus];
export type FileStatusType = typeof FileStatus[keyof typeof FileStatus];

// API Endpoint types
export interface Endpoints {
  auth: {
    login: string;
    signup: string;
    logout: string;
    refresh: string;
    me: string;
  };
  files: {
    upload: string;
    list: string;
    get: string;
    delete: string;
  };
  mcq: {
    generate: string;
    jobs: string;
    jobStatus: (jobId: string) => string;
  };
  quiz: {
    create: string;
    get: (quizId: string) => string;
    submit: (quizId: string) => string;
    list: string;
  };
  results: {
    get: (resultId: string) => string;
    list: string;
    review: (resultId: string) => string;
  };
  analytics: {
    dashboard: string;
    progress: string;
    performance: string;
  };
  users: {
    profile: string;
    preferences: string;
    history: string;
  };
}
