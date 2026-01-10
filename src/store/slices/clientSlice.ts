import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';

export interface Client {
  logo: string | undefined;
  contact_person: string;
  name: string;
  id?: number;
  company_name: string;
  contact_name: string;
  ice: string;
  rc: string;
  tax_id: string;
  phone: string;
  email: string;
  address: string;
  created_at?: string;
  company?: string | number;
}

interface ClientState {
  items: Client[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: any;
  success: boolean;
}

const initialState: ClientState = {
  items: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  success: false,
};

// --- 1. GET: Fetch all ---
export const fetchClients = createAsyncThunk(
  'clients/fetchAll', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<Client[]>('/clients/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement');
    }
  }
);

// --- 2. POST: Create ---
export const createClient = createAsyncThunk(
  'clients/create', 
  async (data: Client, { rejectWithValue }) => {
    try {
      const response = await safeApi.post<Client>('/clients/', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      // Returns backend validation object (e.g. { ice: ["Already exists"] })
      return rejectWithValue(error.response?.data || 'Erreur création');
    }
  }
);

// --- 3. PATCH : Mise à jour corrigée ---
export const updateClient = createAsyncThunk(
  'clients/update', 
  async ({ id, data }: { id: number; data: Partial<Client> }, { rejectWithValue }) => {
    try {
      // NETTOYAGE : On ne garde que les champs de saisie pour éviter le 500
      const cleanData = {
        company_name: data.company_name,
        contact_name: data.contact_name,
        ice: data.ice,
        rc: data.rc,
        tax_id: data.tax_id,
        phone: data.phone,
        email: data.email,
        address: data.address,
      };

      // SLASH FINAL : Obligatoire pour éviter le 401
      const response = await safeApi.patch<Client>(`/clients/${id}/`, cleanData);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur modification');
    }
  }
);

// --- 4. DELETE: Remove ---
export const deleteClient = createAsyncThunk(
  'clients/delete', 
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/clients/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur suppression');
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    resetClientStatus: (state) => {
      state.success = false;
      state.error = null;
      state.isCreating = false;
      state.isUpdating = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchClients.pending, (state) => { 
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // ✅ Capture Fetch Errors
      })

      // --- Create ---
      .addCase(createClient.pending, (state) => {
        state.isCreating = true;
        state.error = null; // Clear previous errors
        state.success = false;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.isCreating = false;
        state.items.unshift(action.payload);
        state.success = true;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload; // ✅ Capture Validation Errors
      })

      // --- Update ---
      .addCase(updateClient.pending, (state) => { 
        state.isUpdating = true; 
        state.error = null;
        state.success = false;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.success = true;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload; // ✅ Capture Validation Errors
      })

      // --- Delete ---
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.error = action.payload; // ✅ Capture Delete Errors
      });
  },
});

export const { resetClientStatus } = clientSlice.actions;
export default clientSlice.reducer;