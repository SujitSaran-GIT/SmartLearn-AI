import type { DashboardStats, Question, QuizAttempt, User } from "../types";


// Mock data for development
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};

const mockStats: DashboardStats = {
    totalTests: 12,
    averageScore: 87.5,
    bestScore: 96,
    percentile: 89,
    recentTests: [
        { id: '1', title: 'Core Java - Module 1', questionCount: 50, status: 'completed', score: 85, createdAt: '2024-10-10' },
        { id: '2', title: 'Data Structures', questionCount: 30, status: 'completed', score: 92, createdAt: '2024-10-12' },
        { id: '3', title: 'Algorithms', questionCount: 20, status: 'in-progress', createdAt: '2024-10-14' },
    ],
    worstScore: 0
};

const generateMockQuestions = (count: number): Question[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `q${i + 1}`,
    question: `Which of the following best describes the concept being tested in question ${i + 1}?`,
    options: [
      'Option A - This is the first possible answer',
      'Option B - This is the second possible answer',
      'Option C - This is the third possible answer',
      'Option D - This is the fourth possible answer'
    ],
    correctOptionIndex: Math.floor(Math.random() * 4),
    explanation: 'This explanation provides detailed insight into why the correct answer is accurate and why other options are incorrect.',
    sourceSnippet: 'Relevant text from the source document that supports this question and provides additional context for understanding the concept.'
  }));
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
      await delay(1500);
      if (email && password) {
        return {
          user: { ...mockUser, email },
          token: 'mock-jwt-token'
        };
      }
      throw new Error('Invalid credentials');
    },
    
    signup: async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
      await delay(1500);
      if (name && email && password) {
        return {
          user: { id: '1', name, email },
          token: 'mock-jwt-token'
        };
      }
      throw new Error('Registration failed');
    }
  },

  files: {
    upload: async (file: File, moduleName: string): Promise<{ fileId: string; textSize: number }> => {
      await delay(3000);
      return {
        fileId: `file-${Date.now()}`,
        textSize: Math.floor(file.size / 1024) // Convert to KB
      };
    }
  },

  mcq: {
    generate: async (fileId: string, questionCount: number, prompt?: string): Promise<{ jobId: string }> => {
      await delay(2000);
      return { jobId: `job-${Date.now()}` };
    },
    
    getJob: async (jobId: string): Promise<{ status: 'processing' | 'done'; quizId?: string }> => {
      await delay(1000);
      // Simulate job completion
      return { 
        status: 'done', 
        quizId: `quiz-${Date.now()}` 
      };
    }
  },

  quiz: {
    get: async (quizId: string): Promise<{ id: string; title: string; questions: Question[] }> => {
      await delay(1000);
      const questionCount = quizId.includes('10') ? 10 : quizId.includes('20') ? 20 : 50;
      return {
        id: quizId,
        title: 'Core Java - Module 1',
        questions: generateMockQuestions(questionCount)
      };
    },
    
    submit: async (quizId: string, answers: Record<string, number>): Promise<{ resultId: string; score: number; correctCount: number; totalCount: number }> => {
      await delay(1000);
      
      // Calculate score based on answers
      const questions = generateMockQuestions(Object.keys(answers).length);
      let correctCount = 0;
      
      Object.entries(answers).forEach(([questionId, selectedIndex]) => {
        const question = questions.find(q => q.id === questionId);
        if (question && selectedIndex === question.correctOptionIndex) {
          correctCount++;
        }
      });
      
      const score = Math.round((correctCount / questions.length) * 100);
      
      return { 
        resultId: `result-${Date.now()}`,
        score,
        correctCount,
        totalCount: questions.length
      };
    }
  },

  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      await delay(800);
      return mockStats;
    },
    
    getRecentAttempts: async (): Promise<QuizAttempt[]> => {
      await delay(600);
      return [
        {
            id: '1',
            quizId: 'quiz1',
            answers: {},
            score: 85,
            submittedAt: new Date().toISOString(),
            userId: "",
            correctCount: 0,
            wrongCount: 0,
            startedAt: ""
        },
        {
            id: '2',
            quizId: 'quiz2',
            answers: {},
            score: 92,
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            userId: "",
            correctCount: 0,
            wrongCount: 0,
            startedAt: ""
        }
      ];
    }
  }
};