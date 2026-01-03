import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';

// --- TYPES ---

// User detail inside the Employee object
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
}

// Employee object nested in the EOSB response
export interface NestedEmployee {
  id: number;
  user: NestedUser;
  cin: string;
  job_title: string;
  hire_date: string;
  created_at: string;
}

// The Main EOSB Object (GET Response)
export interface EOSB {
  id: number;
  last_job_title: string;
  last_salary: string;
  hire_date: string;
  exit_date: string;
  total_years_of_service: string;
  basic_end_of_service_payment: string;
  bonuses_paid: string;
  deductions: string;
  net_payment: string;
  eosb_pdf: string | null; // URL from backend
  notes: string;
  created_at: string;
  updated_at: string;
  employee: NestedEmployee; // Nested object
}

// Payload for Creating/Updating
export interface EOSBPayload {
  employee: number | string;
  last_job_title: string;
  last_salary: string | number;
  hire_date: string;
  exit_date: string;
  total_years_of_service: string | number;
  basic_end_of_service_payment: string | number;
  bonuses_paid: string | number;
  deductions: string | number;
  net_payment: string | number;
  notes: string;
  eosb_pdf?: File | null; // The file object
}

interface EOSBState {
  items: EOSB[];
  currentEOSB: EOSB | null;
  isLoading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: EOSBState = {
  items: [],
  currentEOSB: null,
  isLoading: false,
  success: false,
  error: null,
};

// --- HELPER: Convert Object to FormData (Essential for File Uploads) ---
const createFormData = (data: any) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
};

// --- THUNKS ---

// 1. Fetch All EOSB Records
export const fetchEOSB = createAsyncThunk(
  'eosb/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<EOSB[]>('/employee-eosb/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement des soldes de tout compte');
    }
  }
);

// 2. Create EOSB (POST with FormData)
export const createEOSB = createAsyncThunk(
  'eosb/create',
  async (data: EOSBPayload, { rejectWithValue }) => {
    try {
      const formData = createFormData(data);
      const response = await safeApi.post<EOSB>('/employee-eosb/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de la création du solde de tout compte');
    }
  }
);

// 3. Update EOSB (PATCH with FormData)
export const updateEOSB = createAsyncThunk(
  'eosb/update',
  async ({ id, data }: { id: number; data: Partial<EOSBPayload> }, { rejectWithValue }) => {
    try {
      const formData = createFormData(data);
      const response = await safeApi.patch<EOSB>(`/employee-eosb/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour');
    }
  }
);

// 4. Delete EOSB
export const deleteEOSB = createAsyncThunk(
  'eosb/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/employee-eosb/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  }
);

// --- SLICE ---

const eosbSlice = createSlice({
  name: 'eosb',
  initialState,
  reducers: {
    resetEOSBStatus: (state) => {
      state.success = false;
      state.error = null;
      state.isLoading = false;
    },
    setCurrentEOSB: (state, action: PayloadAction<EOSB | null>) => {
      state.currentEOSB = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchEOSB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEOSB.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchEOSB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- Create ---
      .addCase(createEOSB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEOSB.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.items.unshift(action.payload);
      })
      .addCase(createEOSB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as any;
      })

      // --- Update ---
      .addCase(updateEOSB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEOSB.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentEOSB?.id === action.payload.id) {
          state.currentEOSB = action.payload;
        }
      })
      .addCase(updateEOSB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as any;
      })

      // --- Delete ---
      .addCase(deleteEOSB.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  },
});

export const { resetEOSBStatus, setCurrentEOSB } = eosbSlice.actions;
export default eosbSlice.reducer;