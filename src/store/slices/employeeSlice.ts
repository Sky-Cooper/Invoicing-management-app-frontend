import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';

// --- INTERFACES ---

export interface NestedUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department: number | null; 
  company: number;
  preferred_language: string;
  is_active: boolean;
  password?: string; 
}

export interface Employee {
  id: number;
  user: NestedUser;
  cin: string;
  job_title: string;
  hire_date: string;
  created_at: string;
}

interface EmployeeState {
  items: Employee[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | Record<string, any> | null; // Flexible type for Django errors
  success: boolean;
}

const initialState: EmployeeState = {
  items: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  success: false,
};

// --- THUNKS ---

// 1. Fetch All
export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<Employee[]>('/employees/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement');
    }
  }
);

// 2. Create (POST)
export const createEmployee = createAsyncThunk(
  'employees/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await safeApi.post<Employee>('/employees/', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      // Returns the field errors (e.g. { cin: ["This field is required"] })
      return rejectWithValue(error.response?.data || 'Erreur lors de la création');
    }
  }
);

// 3. Update (PATCH)
export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await safeApi.patch<Employee>(`/employees/${id}/`, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour');
    }
  }
);

// 4. Delete
export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/employees/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  }
);

// --- SLICE ---

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    resetEmployeeStatus: (state) => {
      state.success = false;
      state.error = null;
      state.isCreating = false;
      state.isUpdating = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as any;
      })

      // --- Create ---
      .addCase(createEmployee.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.isCreating = false;
        state.items.unshift(action.payload);
        state.success = true;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as any; // ✅ Captures Validation Errors
      })

      // --- Update ---
      .addCase(updateEmployee.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.items.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as any; // ✅ Captures Validation Errors
      })

      // --- Delete ---
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.items = state.items.filter(e => e.id !== action.payload);
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.error = action.payload as any; // ✅ Added this (was missing)
      });
  },
});

export const { resetEmployeeStatus } = employeeSlice.actions;
export default employeeSlice.reducer;