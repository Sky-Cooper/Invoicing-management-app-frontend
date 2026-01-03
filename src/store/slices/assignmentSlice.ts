import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';

export interface ChantierAssignment {
  chantier: any;
  id: number;
  employee: any; 
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface AssignmentState {
  items: ChantierAssignment[];
  isLoading: boolean;
  success: boolean;
  error: any;
}

const initialState: AssignmentState = {
  items: [],
  isLoading: false,
  success: false,
  error: null,
};

// --- ACTIONS ASYNCHRONES ---

export const createAssignment = createAsyncThunk(
  'assignments/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await safeApi.post<ChantierAssignment>('/chantiers-assignments/', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur d\'assignation');
    }
  }
);

// Action to Update Assignment
export const updateAssignment = createAsyncThunk(
  'assignments/update',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await safeApi.patch<ChantierAssignment>(`/chantiers-assignments/${id}/`, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur de modification');
    }
  }
);

// [NEW] Action to Delete Assignment
export const deleteAssignment = createAsyncThunk(
  'assignments/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/chantiers-assignments/${id}/`);
      return id; // Return the ID so we know what to remove from state
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur de suppression');
    }
  }
);

export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<ChantierAssignment[]>('/chantiers-assignments/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement');
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    resetAssignmentStatus: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createAssignment.pending, (state) => { state.isLoading = true; })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
        state.success = true;
      })
      
      // Update
      .addCase(updateAssignment.pending, (state) => { state.isLoading = true; })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // [NEW] Delete Logic
      .addCase(deleteAssignment.pending, (state) => { state.isLoading = true; })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true; // Optional: trigger success message
        // Remove the item from the array
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { resetAssignmentStatus } = assignmentSlice.actions;
export default assignmentSlice.reducer;