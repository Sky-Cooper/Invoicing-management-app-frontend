import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { safeApi } from '../../api/client'; 

// --- TYPES ---

export interface FixedChargeInput {
  chantier: number;
  title: string;
  category: 'MATERIAL' | 'TRANSPORT' | 'LABOR' | 'OTHER';
  amount: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface FixedCharge {
  id: number;
  chantier: number;
  chantier_name: string;
  created_by: number;
  created_by_name: string;
  title: string;
  category: 'MATERIAL' | 'TRANSPORT' | 'LABOR' | 'OTHER';
  amount: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface FixedChargeState {
  items: FixedCharge[];
  isLoading: boolean; // For fetching
  isDeleting: boolean; // <--- ADDED THIS
  success: boolean;
  error: any;
}

const initialState: FixedChargeState = {
  items: [],
  isLoading: false,
  isDeleting: false, // <--- ADDED THIS
  success: false,
  error: null,
};

// --- ASYNC THUNKS ---

export const fetchFixedCharges = createAsyncThunk(
  'fixedCharges/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get('/fixed-charges/');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

export const addFixedCharge = createAsyncThunk(
  'fixedCharges/add',
  async (data: FixedChargeInput, { rejectWithValue }) => {
    try {
      const response = await safeApi.post('/fixed-charges/', data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

export const updateFixedCharge = createAsyncThunk(
  'fixedCharges/update',
  async ({ id, data }: { id: number; data: FixedChargeInput }, { rejectWithValue }) => {
    try {
      const response = await safeApi.put(`/fixed-charges/${id}/`, data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

export const deleteFixedCharge = createAsyncThunk(
  'fixedCharges/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/fixed-charges/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

// --- SLICE ---
const fixedChargeSlice = createSlice({
  name: 'fixedCharges',
  initialState,
  reducers: {
    resetFixedChargeStatus: (state) => {
      state.success = false;
      state.error = null;
      state.isDeleting = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchFixedCharges.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFixedCharges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchFixedCharges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addFixedCharge.pending, (state) => { state.isLoading = true; })
      .addCase(addFixedCharge.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.items.unshift(action.payload);
      })
      .addCase(addFixedCharge.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateFixedCharge.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })

      // Delete
      .addCase(deleteFixedCharge.pending, (state) => { 
        state.isDeleting = true; // <--- ADDED
      })
      .addCase(deleteFixedCharge.fulfilled, (state, action) => {
        state.isDeleting = false; // <--- ADDED
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteFixedCharge.rejected, (state, action) => {
        state.isDeleting = false; // <--- ADDED
        state.error = action.payload;
      });
  },
});

export const { resetFixedChargeStatus } = fixedChargeSlice.actions;
export default fixedChargeSlice.reducer;