import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client'; // Ensure this path matches your project structure

// --- 1. Interfaces ---

export interface Department {
  id: string;
  name: string;
  description: string;
  created_at: string;
  company: string; // The company UUID
}

// Data needed to create a new department
export interface CreateDepartmentData {
  name: string;
  description: string;
}

// Data needed to update (ID + optional fields)
export interface UpdateDepartmentData {
  id: string;
  data: Partial<CreateDepartmentData>;
}

interface DepartmentState {
  items: Department[];
  isLoading: boolean;
  error: string | null;
  operationSuccess: boolean; // To trigger success toasts/redirects
}

const initialState: DepartmentState = {
  items: [],
  isLoading: false,
  error: null,
  operationSuccess: false,
};

// --- 2. Async Thunks ---

// GET: Fetch all departments
export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<Department[]>('/departments/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch departments');
    }
  }
);

// POST: Create a department
export const createDepartment = createAsyncThunk(
  'departments/create',
  async (data: CreateDepartmentData, { rejectWithValue }) => {
    try {
      const response = await safeApi.post<Department>('/departments/', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      // Handle Django field errors (e.g., name already exists)
      const errorData = error.response?.data;
      if (typeof errorData === 'object' && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const msg = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        return rejectWithValue(`${firstKey}: ${msg}`);
      }
      return rejectWithValue('Failed to create department');
    }
  }
);

// PATCH: Update a department
export const updateDepartment = createAsyncThunk(
  'departments/update',
  async ({ id, data }: UpdateDepartmentData, { rejectWithValue }) => {
    try {
      const response = await safeApi.patch<Department>(`/departments/${id}/`, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Failed to update department');
    }
  }
);

// DELETE: Remove a department
export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/departments/${id}/`);
      return id; // Return ID so we can remove it from the state
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete department');
    }
  }
);

// --- 3. The Slice ---

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    resetOperationSuccess: (state) => {
      state.operationSuccess = false;
    },
    clearDepartmentErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // --- FETCH ---
    builder.addCase(fetchDepartments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDepartments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchDepartments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // --- CREATE ---
    builder.addCase(createDepartment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.operationSuccess = false;
    });
    builder.addCase(createDepartment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items.push(action.payload); // Add new item to list
      state.operationSuccess = true;
    });
    builder.addCase(createDepartment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // --- UPDATE ---
    builder.addCase(updateDepartment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.operationSuccess = false;
    });
    builder.addCase(updateDepartment.fulfilled, (state, action) => {
      state.isLoading = false;
      // Find and update the item in the list
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.operationSuccess = true;
    });
    builder.addCase(updateDepartment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // --- DELETE ---
    builder.addCase(deleteDepartment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteDepartment.fulfilled, (state, action) => {
      state.isLoading = false;
      // Remove item from list
      state.items = state.items.filter(item => item.id !== action.payload);
    });
    builder.addCase(deleteDepartment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetOperationSuccess, clearDepartmentErrors } = departmentSlice.actions;
export default departmentSlice.reducer;