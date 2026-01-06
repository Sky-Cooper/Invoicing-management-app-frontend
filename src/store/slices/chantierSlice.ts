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

export interface ChantierDocument {
  id: number;
  document: string; // The URL to the PDF
  created_at?: string;
}

export interface Chantier {
  document: any;
  id: number;
  name: string;
  location: string;
  description: string;
  contract_number: string;
  contract_date: string;
  department: number; // ID of the department
  client: number;     // ID of the client
  
  // Visuals
  image?: string | null;
  
  // --- NEW: Multiple Documents ---
  documents?: ChantierDocument[]; 

  // SENDING TO BACKEND: Arrays of IDs
  responsible_ids?: number[]; 
  employee_ids?: number[];

  // RECEIVING FROM BACKEND: Detailed Arrays
  responsible?: Responsible[]; 
  employees?: any[]; // Full employee objects
  
  start_date: string;
  end_date: string;
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

// --- HELPER: Convert Object to FormData (Handles Arrays & Multiple Files) ---
const createFormData = (data: any) => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    // Skip null/undefined
    if (value === undefined || value === null) return;

    // 1. Handle Arrays (e.g., employee_ids: [1, 2], uploaded_documents: [File1, File2])
    if (Array.isArray(value)) {
        value.forEach((item) => {
            if (item instanceof File) {
                // If it's a file array (uploaded_documents), append the file directly
                formData.append(key, item);
            } else {
                // If it's an ID array (employee_ids), append as string
                formData.append(key, String(item));
            }
        });
    }
    // 2. Handle Single File object (e.g., image cover)
    else if (value instanceof File) {
      formData.append(key, value);
    } 
    // 3. Handle standard fields (strings, numbers, booleans)
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

// 2. Create Chantier (Handles Multiple Files & Arrays)
export const createChantier = createAsyncThunk(
  'chantiers/create',
  async (data: any, { rejectWithValue }) => {
    try {
      // Use helper to format responsible_ids, employee_ids and uploaded_documents correctly
      const formData = createFormData(data);

      const response = await safeApi.post<Chantier>('/chantiers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Explicitly cleaner, though axios often handles it
        }
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur lors de l\'ouverture du chantier');
    }
  }
);

// 3. Update Chantier (Handles Multiple Files & Arrays)
export const updateChantier = createAsyncThunk(
  'chantiers/update',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const formData = createFormData(data);

      const response = await safeApi.patch<Chantier>(`/chantiers/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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