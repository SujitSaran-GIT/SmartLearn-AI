import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import type { QuizState, Quiz, QuizSubmission, QuizSubmissionResponse, QuizAttempt, QuizAnalytics } from '../../types';

export const getUserQuizzes = createAsyncThunk(
  'quiz/getUserQuizzes',
  async (params: { page?: number; limit?: number; status?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserQuizzes(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch quizzes');
    }
  }
);

export const getQuiz = createAsyncThunk(
  'quiz/getQuiz',
  async (quizId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getQuiz(quizId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch quiz');
    }
  }
);

export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async ({ quizId, submission }: { quizId: string; submission: QuizSubmission }, { rejectWithValue }) => {
    try {
      const response = await apiService.submitQuiz(quizId, submission);
      return { quizId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit quiz');
    }
  }
);

export const getQuizResults = createAsyncThunk(
  'quiz/getQuizResults',
  async (quizId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getQuizResults(quizId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch quiz results');
    }
  }
);


export const getQuizAnalytics = createAsyncThunk(
  'quiz/getQuizAnalytics',
  async ({ days }: { days?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getQuizAnalytics(days);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (quizId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteQuiz(quizId);
      return quizId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete quiz');
    }
  }
);

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  currentAttempt: null,
  attempts: [],
  analytics: null,
  loading: false,
  error: null,
  pagination: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
    clearCurrentAttempt: (state) => {
      state.currentAttempt = null;
    },
    setCurrentAttempt: (state, action: PayloadAction<QuizAttempt>) => {
      state.currentAttempt = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get User Quizzes
    builder
      .addCase(getUserQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    .addCase(getUserQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload.data?.quizzes || [];
        state.pagination = action.payload.data?.pagination || null;
        state.error = null;
      })
      .addCase(getUserQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Quiz
    builder
      .addCase(getQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload.data?.quiz || null;
        state.error = null;
      })
      .addCase(getQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Submit Quiz
    builder
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = {
          id: action.payload.attemptId,
          quiz_id: action.payload.quizId,
          user_id: '', // Will be set by backend
          score: action.payload.score,
          correct_count: action.payload.correctCount,
          wrong_count: action.payload.totalCount - action.payload.correctCount,
          total_count: action.payload.totalCount,
          submitted_at: new Date().toISOString(),
        };
        state.error = null;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Quiz Results
    builder
      .addCase(getQuizResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuizResults.fulfilled, (state, action) => {
        state.loading = false;
        state.attempts = action.payload.data?.attempts || [];
        state.error = null;
      })
      .addCase(getQuizResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Quiz Analytics
    builder
      .addCase(getQuizAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuizAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.data;
        state.error = null;
      })
      .addCase(getQuizAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Quiz
    builder
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter(quiz => quiz.id !== action.payload);
        if (state.currentQuiz?.id === action.payload) {
          state.currentQuiz = null;
        }
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentQuiz, clearCurrentAttempt, setCurrentAttempt } = quizSlice.actions;
export default quizSlice.reducer;
