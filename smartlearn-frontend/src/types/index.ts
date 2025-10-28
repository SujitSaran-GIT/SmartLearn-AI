// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  last_login?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// File Types
export interface File {
  id: string;
  user_id: string;
  filename: string;
  storage_key: string;
  mime_type: string;
  size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  num_pages?: number;
  extracted_text?: string;
  created_at: string;
  updated_at: string;
}

export interface FileUploadResponse {
  file: File;
}

export interface FilesResponse {
  files: File[];
  pagination: Pagination;
}

// MCQ Generation Types
export interface MCQGenerationRequest {
  fileId: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  focusAreas?: string[];
}

export interface MCQJob {
  id: string;
  user_id: string;
  file_id: string;
  question_count: number;
  difficulty: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  quiz_id?: string;
  created_at: string;
  completed_at?: string;
  file?: {
    filename: string;
    size: number;
  };
  quiz?: {
    id: string;
    title: string;
  };
}

export interface MCQJobsResponse {
  jobs: MCQJob[];
  pagination: Pagination;
}

export interface JobStatusResponse {
  jobId: string;
  status: string;
  progress: number;
  quizId?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  file: {
    filename: string;
  };
  quiz?: {
    id: string;
    title: string;
    questionCount: number;
  };
}

// Quiz Types
export interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: string;
}

export interface SafeQuestion {
  id: string;
  questionText: string;
  options: string[];
  difficulty: string;
}

export interface Quiz {
  id: string;
  file_id: string;
  user_id: string;
  title: string;
  question_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  file?: {
    filename: string;
  };
  questions?: SafeQuestion[];
  _count?: {
    attempts: number;
    questions: number;
  };
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  correct_count: number;
  wrong_count: number;
  total_count: number;
  submitted_at: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  question_id: string;
  selected_index: number;
  is_correct: boolean;
  question?: {
    question_text: string;
    options: string[];
    correct_index: number;
    explanation: string;
  };
}

export interface QuizSubmission {
  answers: {
    questionId: string;
    selectedIndex: number;
  }[];
}

export interface QuizSubmissionResponse {
  attemptId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  percentage: number;
  answers: AnswerResult[];
}

export interface AnswerResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
}

export interface QuizAnalytics {
  overview: {
    totalQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    successRate: number;
  };
  recentQuizzes: RecentQuiz[];
  dailyProgress: DailyProgress[];
}

export interface RecentQuiz {
  id: string;
  title: string;
  created_at: string;
  latest_score: number | null;
  totalAttempts: number;
}

export interface DailyProgress {
  date: string;
  averageScore: number;
  attempts: number;
}

// Common Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Redux State Types
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface FileState {
  files: File[];
  currentFile: File | null;
  uploadProgress: number;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

export interface MCQState {
  jobs: MCQJob[];
  currentJob: JobStatusResponse | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

export interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentAttempt: QuizAttempt | null;
  attempts: QuizAttempt[];
  analytics: QuizAnalytics | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

export interface RootState {
  auth: AuthState;
  files: FileState;
  mcq: MCQState;
  quiz: QuizState;
}