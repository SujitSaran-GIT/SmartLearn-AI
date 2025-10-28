import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import type { FileState, File, FilesResponse } from '../../types';

export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async (file: Blob, { rejectWithValue }) => {
    try {
      const response = await apiService.uploadFile(file);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'File upload failed');
    }
  }
);

export const getUserFiles = createAsyncThunk(
  'files/getUserFiles',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserFiles(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch files');
    }
  }
);

export const getFile = createAsyncThunk(
  'files/getFile',
  async (fileId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getFile(fileId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch file');
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteFile(fileId);
      return fileId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete file');
    }
  }
);

const initialState: FileState = {
  files: [],
  currentFile: null,
  uploadProgress: 0,
  loading: false,
  error: null,
  pagination: null,
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearCurrentFile: (state) => {
      state.currentFile = null;
    },
  },
  extraReducers: (builder) => {
    // Upload File
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadProgress = 100;
        state.files.unshift(action.payload.file);
        state.error = null;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      });

    // Get User Files
    builder
      .addCase(getUserFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload.data.files;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(getUserFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get File
    builder
      .addCase(getFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFile = action.payload.data.file;
        state.error = null;
      })
      .addCase(getFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete File
    builder
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(file => file.id !== action.payload);
        if (state.currentFile?.id === action.payload) {
          state.currentFile = null;
        }
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUploadProgress, clearCurrentFile } = filesSlice.actions;
export default filesSlice.reducer;
