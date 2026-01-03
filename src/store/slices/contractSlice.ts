import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';


export interface NestedUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department: number;
  company: number;
  preferred_language: string;
  is_active: boolean;
}

// Employee object nested in the contract response
export interface NestedEmployee {
  id: number;
  user: NestedUser;
  cin: string;
  job_title: string;
  hire_date: string;
  created_at: string;
}

// The Main Contract Object (GET Response)
export interface WorkingContract {
  id: number;
  contract_number: string;
  contract_start_date: string;
  contract_end_date: string;
  job_title: string;
  salary: string;
  bonus: string;
  allowances: string;
  contract_pdf: string | null; // URL from backend
  notes: string;
  created_at: string;
  updated_at: string;
  employee: NestedEmployee; // Nested object
}

// Payload for Creating/Updating (sending ID for employee, File for pdf)
export interface ContractPayload {
  employee: number | string;
  contract_number: string;
  contract_start_date: string;
  contract_end_date: string;
  job_title: string;
  salary: string | number;
  bonus: string | number;
  allowances: string | number;
  notes: string;
  contract_pdf?: File | null; // The file object
}

interface ContractState {
  items: WorkingContract[];
  currentContract: WorkingContract | null;
  isLoading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ContractState = {
  items: [],
  currentContract: null,
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

// 1. Fetch All Contracts
export const fetchContracts = createAsyncThunk(
  'contracts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<WorkingContract[]>('/employee-working-contract/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement des contrats');
    }
  }
);

// 2. Create Contract (POST with FormData)
export const createContract = createAsyncThunk(
  'contracts/create',
  async (data: ContractPayload, { rejectWithValue }) => {
    try {
      const formData = createFormData(data);
      const response = await safeApi.post<WorkingContract>('/employee-working-contract/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Explicitly set for file upload
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de la création du contrat');
    }
  }
);

// 3. Update Contract (PATCH with FormData)
export const updateContract = createAsyncThunk(
  'contracts/update',
  async ({ id, data }: { id: number; data: Partial<ContractPayload> }, { rejectWithValue }) => {
    try {
      const formData = createFormData(data);
      const response = await safeApi.patch<WorkingContract>(`/employee-working-contract/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour du contrat');
    }
  }
);

// 4. Delete Contract
export const deleteContract = createAsyncThunk(
  'contracts/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/employee-working-contract/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  }
);

// --- SLICE ---

const contractSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    resetContractStatus: (state) => {
      state.success = false;
      state.error = null;
      state.isLoading = false;
    },
    setCurrentContract: (state, action: PayloadAction<WorkingContract | null>) => {
      state.currentContract = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchContracts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- Create ---
      .addCase(createContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.items.unshift(action.payload); // Add to top of list
      })
      .addCase(createContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as any;
      })

      // --- Update ---
      .addCase(updateContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Update item in list directly to avoid refresh
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update current contract if selected
        if (state.currentContract?.id === action.payload.id) {
          state.currentContract = action.payload;
        }
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as any;
      })

      // --- Delete ---
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { resetContractStatus, setCurrentContract } = contractSlice.actions;
export default contractSlice.reducer;