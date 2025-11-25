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
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    this.baseURL = 'http://localhost:3000/api';
  }

  // Request deduplication to prevent multiple identical requests
  private getCacheKey(endpoint: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.data.accessToken;
    localStorage.setItem('accessToken', newAccessToken);
    return newAccessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint, options);

    // Request deduplication - return existing promise if same request is pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // Create new request promise
    const requestPromise = this.executeRequest<T>(url, endpoint, options, retryCount)
      .finally(() => {
        // Clean up pending request cache
        this.pendingRequests.delete(cacheKey);
      });

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  private async executeRequest<T>(
    url: string,
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    // Get and validate token
    let token = localStorage.getItem('accessToken');

    // Refresh token if it's expired or will expire within 2 minutes
    if (token && this.isTokenExpired(token)) {
      try {
        token = await this.refreshAccessToken();
      } catch (error) {
        // Token refresh failed, user needs to re-login
        window.location.href = '/login';
        throw error;
      }
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle token expiration with automatic refresh
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.code === 'TOKEN_EXPIRED' && errorData.requiresRefresh && retryCount === 0) {
          try {
            token = await this.refreshAccessToken();
            // Retry the original request with new token
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${token}`,
            };

            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              const retryErrorData = await retryResponse.json().catch(() => ({}));
              throw new Error(retryErrorData.message || `HTTP error! status: ${retryResponse.status}`);
            }

            return await retryResponse.json();
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw refreshError;
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle 429 Too Many Requests with improved backoff
        if (response.status === 429 && retryCount < 5) { // Increased retry count
          const retryAfter = errorData.retryAfter || Math.pow(2, retryCount) * 1000;
          console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
          return this.executeRequest(url, endpoint, options, retryCount + 1);
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

  // Payment endpoints
  async createPaymentOrder(planType: string, billingCycle: string): Promise<{
    success: boolean;
    data: {
      orderId: string;
      amount: number;
      currency: string;
      planType: string;
      billingCycle: string;
    };
  }> {
    return this.request('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ planType, billingCycle }),
    });
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planType: string;
    billingCycle: string;
  }): Promise<{
    success: boolean;
    data: {
      subscription: {
        id: string;
        planType: string;
        billingCycle: string;
        status: string;
        startedAt: string;
        expiresAt: string;
        amount: number;
      };
    };
  }> {
    return this.request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getUserSubscription(): Promise<{
    success: boolean;
    data: {
      subscription: {
        id: string;
        planType: string;
        billingCycle: string;
        status: string;
        startedAt: string;
        expiresAt: string;
        amount: number;
      } | null;
      planType: string;
    };
  }> {
    return this.request('/payment/subscription');
  }

  async cancelSubscription(): Promise<{
    success: boolean;
    data: {
      message: string;
      subscription: any;
    };
  }> {
    return this.request('/payment/cancel', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
