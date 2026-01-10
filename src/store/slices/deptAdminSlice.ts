import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';

// --- 1. Interface ---
export interface DeptAdmin {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone_number: string;
  role: 'HR_ADMIN' | 'INVOICING_ADMIN' | string;
  department: number; 
}

interface DeptAdminState {
  admins: DeptAdmin[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: any | null;
  success: boolean;
}

const initialState: DeptAdminState = {
  admins: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  success: false,
};

// --- 2. Thunks ---

export const fetchDeptAdmins = createAsyncThunk(
  'deptAdmins/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<DeptAdmin[]>('/departments-admins/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur de chargement');
    }
  }
);

export const createDeptAdmin = createAsyncThunk(
  'deptAdmins/create',
  async (newAdmin: DeptAdmin, { rejectWithValue }) => {
    try {
      const response = await safeApi.post<DeptAdmin>('/departments-admins/', newAdmin);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      // This sends the backend error object (e.g. {phone_number: "Invalid..."}) to Redux
      return rejectWithValue(error.response?.data || 'Erreur lors de la création');
    }
  }
);

export const updateDeptAdmin = createAsyncThunk(
  'deptAdmins/update',
  async ({ id, data }: { id: number; data: Partial<DeptAdmin> }, { rejectWithValue }) => {
    try {
      const response = await safeApi.patch<DeptAdmin>(`/departments-admins/${id}/`, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour');
    }
  }
);

export const deleteDeptAdmin = createAsyncThunk(
  'deptAdmins/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/departments-admins/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur suppression');
    }
  }
);

// --- 3. Slice ---

const deptAdminSlice = createSlice({
  name: 'deptAdmins',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.success = false;
      state.error = null;
      state.isCreating = false;
      state.isUpdating = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ---
      .addCase(fetchDeptAdmins.pending, (state) => { 
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(fetchDeptAdmins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = action.payload;
      })
      .addCase(fetchDeptAdmins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // ✅ Error captured
      })

      // --- CREATE ---
      .addCase(createDeptAdmin.pending, (state) => { 
        state.isCreating = true; 
        state.error = null;
      })
      .addCase(createDeptAdmin.fulfilled, (state, action) => {
        state.isCreating = false;
        state.admins.push(action.payload);
        state.success = true;
      })
      .addCase(createDeptAdmin.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload; // ✅ Error captured (e.g. Phone number invalid)
      })

      // --- UPDATE ---
      .addCase(updateDeptAdmin.pending, (state) => { 
        state.isUpdating = true; 
        state.error = null;
      })
      .addCase(updateDeptAdmin.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.admins.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.admins[index] = action.payload;
        state.success = true;
      })
      .addCase(updateDeptAdmin.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload; // ✅ Error captured
      })

      // --- DELETE ---
      .addCase(deleteDeptAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter(a => a.id !== action.payload);
      })
      .addCase(deleteDeptAdmin.rejected, (state, action) => {
        state.error = action.payload; // ✅ Error captured
      });
  },
});

export const { resetStatus } = deptAdminSlice.actions;
export default deptAdminSlice.reducer;