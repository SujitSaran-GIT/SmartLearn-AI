import type { 
  SignupData, 
  User, 
  AuthTokens,
  File,
  FilesResponse,
  MCQGenerationRequest,
  MCQJobsResponse,
  JobStatusResponse,
  Quiz,
  QuizSubmission,
  QuizSubmissionResponse,
  QuizAttempt,
  QuizAnalytics,
  LoginCredentials,
  Pagination
} from '../types';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:3000/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const token = localStorage.getItem('accessToken');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

  
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle 429 Too Many Requests with exponential backoff retry
        if (response.status === 429 && retryCount < 3) {
          const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.request(endpoint, options, retryCount + 1);
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  }

  async signup(userData: SignupData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.request<any>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await this.request<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  // File endpoints
  async uploadFile(file: Blob): Promise<{ file: File }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/files/upload`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  }

  async getUserFiles(params?: { page?: number; limit?: number; status?: string }): Promise<{ success: boolean; data: FilesResponse }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/files${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getFile(fileId: string): Promise<{ success: boolean; data: { file: File } }> {
    return this.request(`/files/${fileId}`);
  }

  async getFileDownloadUrl(fileId: string): Promise<{ downloadUrl: string; expiresIn: number; filename: string }> {
    return this.request(`/files/${fileId}/download`);
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // MCQ endpoints
  async generateMCQ(data: MCQGenerationRequest): Promise<{
    success: boolean;
    message: string;
    data: {
      jobId: string;
      status: string;
      progress: number;
      estimatedTime: string;
      polling: {
        endpoint: string;
        interval: string;
      };
      nextSteps: string[];
    };
  }> {
    return this.request('/mcq/generate', {
      method: 'POST',
      body: JSON.stringify({
        fileId: data.fileId,
        questionCount: data.questionCount,
        difficulty: data.difficulty,
        focusAreas: data.focusAreas
      }),
    });
  }

  async getJobStatus(jobId: string): Promise<{ success: boolean; data: JobStatusResponse }> {
    return this.request(`/mcq/jobs/${jobId}`);
  }

  async getUserJobs(params?: { page?: number; limit?: number; status?: string }): Promise<MCQJobsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/mcq/jobs${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // Quiz endpoints
  async getUserQuizzes(params?: { page?: number; limit?: number; status?: string }): Promise<{ success: boolean; data: { quizzes: Quiz[]; pagination: Pagination } }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/quiz${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getQuiz(quizId: string): Promise<{ success: boolean; data: { quiz: Quiz } }> {
    return this.request(`/quiz/${quizId}`);
  }

  async submitQuiz(quizId: string, submission: QuizSubmission): Promise<QuizSubmissionResponse> {
    return this.request(`/quiz/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  async getQuizResults(quizId: string): Promise<{
    success: boolean;
    data: {
      quiz: Quiz;
      attempts: QuizAttempt[];
      statistics: any
    };
  }> {
    return this.request(`/quiz/${quizId}/results`);
  }

  async getQuizAnalytics(days?: number): Promise<{ data: QuizAnalytics }> {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days.toString());

    const queryString = queryParams.toString();
    const endpoint = `/quiz/analytics${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async deleteQuiz(quizId: string): Promise<{ message: string }> {
    return this.request(`/quiz/${quizId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
