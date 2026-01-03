import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';

// --- TYPES ---

export interface Responsible {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  department?: any;
  company?: any;
}

export interface Chantier {
  id: number;
  name: string;
  location: string;
  description: string;
  contract_number: string;
  contract_date: string;
  department: number;
  client: number;
  
  // Visuals
  image?: string | null;
  
  // PDF Document URL
  document?: string | null;

  // SENDING TO BACKEND: Array of IDs (e.g. [4, 5])
  responsible_ids?: number[]; 
  
  // RECEIVING FROM BACKEND: Array of Objects
  responsible?: Responsible[]; 
  
  start_date: string;
  end_date: string;
  employees: any[]; 
  created_at: string;
}

interface ChantierState {
  items: Chantier[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | Record<string, any> | null;
  success: boolean;
}

const initialState: ChantierState = {
  items: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  success: false,
};

// --- HELPER: Convert Object to FormData (Handles Arrays & Files) ---
const createFormData = (data: any) => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    // Skip null/undefined
    if (value === undefined || value === null) return;

    // 1. Handle Arrays (e.g. responsible_ids: [4, 5, 6])
    // Result in FormData: responsible_ids=4, responsible_ids=5, etc.
    if (Array.isArray(value)) {
        value.forEach((item) => {
            formData.append(key, String(item));
        });
    }
    // 2. Handle File objects (image or document PDF)
    else if (value instanceof File) {
      formData.append(key, value);
    } 
    // 3. Handle standard fields
    else {
      formData.append(key, String(value));
    }
  });
  
  return formData;
};

// --- ACTIONS ASYNCHRONES (THUNKS) ---

// 1. Fetch All
export const fetchChantiers = createAsyncThunk(
  'chantiers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<Chantier[]>('/chantiers/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement');
    }
  }
);

// 2. Create Chantier (Handles Files & Arrays)
export const createChantier = createAsyncThunk(
  'chantiers/create',
  async (data: any, { rejectWithValue }) => {
    try {
      // Use helper to format responsible_ids and files correctly
      const formData = createFormData(data);

      const response = await safeApi.post<Chantier>('/chantiers/', formData, {
        headers: {
          'Content-Type': undefined as any // Let browser set boundary
        }
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de l\'ouverture du chantier');
    }
  }
);

// 3. Update Chantier (Handles Files & Arrays)
export const updateChantier = createAsyncThunk(
  'chantiers/update',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const formData = createFormData(data);

      const response = await safeApi.patch<Chantier>(`/chantiers/${id}/`, formData, {
        headers: {
          'Content-Type': undefined as any
        }
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de la mise à jour');
    }
  }
);

// 4. Delete Chantier
export const deleteChantier = createAsyncThunk(
  'chantiers/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/chantiers/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  }
);

// --- SLICE ---

const chantierSlice = createSlice({
  name: 'chantiers',
  initialState,
  reducers: {
    resetChantierStatus: (state) => {
      state.success = false;
      state.error = null;
      state.isCreating = false;
      state.isUpdating = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchChantiers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChantiers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchChantiers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // CREATE
      .addCase(createChantier.pending, (state) => {
        state.isCreating = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createChantier.fulfilled, (state, action) => {
        state.isCreating = false;
        state.items.unshift(action.payload);
        state.success = true;
      })
      .addCase(createChantier.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as any;
      })

      // UPDATE
      .addCase(updateChantier.pending, (state) => {
        state.isUpdating = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateChantier.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateChantier.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as any;
      })

      // DELETE
      .addCase(deleteChantier.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      });
  },
});

export const { resetChantierStatus } = chantierSlice.actions;
export default chantierSlice.reducer;