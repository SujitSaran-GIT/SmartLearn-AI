import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import type { MCQState, MCQGenerationRequest, MCQJob, JobStatusResponse, MCQJobsResponse } from '../../types';

export const generateMCQ = createAsyncThunk(
  'mcq/generate',
  async (data: MCQGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.generateMCQ(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'MCQ generation failed');
    }
  }
);

export const getJobStatus = createAsyncThunk(
  'mcq/getJobStatus',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getJobStatus(jobId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch job status');
    }
  }
);

export const getUserJobs = createAsyncThunk(
  'mcq/getUserJobs',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserJobs(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch jobs');
    }
  }
);

// Poll job status (utility function)
export const pollJobStatus = createAsyncThunk(
  'mcq/pollJobStatus',
  async (jobId: string, { dispatch, rejectWithValue }) => {
    try {
      const poll = async (): Promise<JobStatusResponse> => {
        const response = await apiService.getJobStatus(jobId);

        if (response.data.status === 'completed' || response.data.status === 'failed') {
          return response.data;
        }

        // Continue polling every 3 seconds for pending/processing jobs
        await new Promise(resolve => setTimeout(resolve, 3000));
        return poll();
      };

      return await poll();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Job polling failed');
    }
  }
);

const initialState: MCQState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  pagination: null,
};

const mcqSlice = createSlice({
  name: 'mcq',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    updateJobProgress: (state, action: PayloadAction<{ jobId: string; progress: number; status: string }>) => {
      const job = state.jobs.find(j => j.id === action.payload.jobId);
      if (job) {
        job.progress = action.payload.progress;
        job.status = action.payload.status as any;
      }
      
      if (state.currentJob?.jobId === action.payload.jobId) {
        state.currentJob.progress = action.payload.progress;
        state.currentJob.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    // Generate MCQ
    builder
      .addCase(generateMCQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateMCQ.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // The job will be added when polling starts
      })
      .addCase(generateMCQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Job Status
    builder
      .addCase(getJobStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.data;
        state.error = null;
        
        // Update job in jobs list if it exists
        const jobIndex = state.jobs.findIndex(j => j.id === action.payload.data.jobId);
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = {
            ...state.jobs[jobIndex],
            status: action.payload.data.status as any,
            progress: action.payload.data.progress,
            quiz_id: action.payload.data.quizId,
            completed_at: action.payload.data.completedAt,
          };
        }
      })
      .addCase(getJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get User Jobs
    builder
      .addCase(getUserJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getUserJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Poll Job Status
    builder
      .addCase(pollJobStatus.fulfilled, (state, action) => {
        state.currentJob = action.payload;

        // Update or add job in jobs list
        const jobIndex = state.jobs.findIndex(j => j.id === action.payload.jobId);
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = {
            ...state.jobs[jobIndex],
            status: action.payload.status as any,
            progress: action.payload.progress,
            quiz_id: action.payload.quizId,
            completed_at: action.payload.completedAt,
          };
        } else {
          state.jobs.unshift({
            id: action.payload.jobId,
            user_id: '', // Will be set by backend
            file_id: '', // Will be set by backend
            question_count: 0, // Will be set by backend
            difficulty: 'medium',
            status: action.payload.status as any,
            progress: action.payload.progress,
            quiz_id: action.payload.quizId,
            created_at: action.payload.createdAt,
            completed_at: action.payload.completedAt,
            file: {
              filename: action.payload.file.filename,
              size: 0, // Size not available in job status, will be set when fetching all jobs
            },
            quiz: action.payload.quiz,
          });
        }
      })
      .addCase(pollJobStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentJob, updateJobProgress } = mcqSlice.actions;
export default mcqSlice.reducer;
