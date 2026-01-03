import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';

export interface Item {
  id?: number;
  code: string;
  name: string;
  description: string;
  unit_price: string;
  unit: string;
  tax_rate: string;
  created_at?: string;
  company?: number;
}

interface ItemState {
  items: Item[];
  isLoading: boolean;
  success: boolean;
  error: any | null;
}

const initialState: ItemState = {
  items: [],
  isLoading: false,
  success: false,
  error: null,
};

// --- ACTIONS ASYNCHRONES ---

export const fetchItems = createAsyncThunk(
  'items/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<Item[]>('/items/');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur catalogue');
    }
  }
);

export const createItem = createAsyncThunk(
  'items/create',
  async (data: Item, { rejectWithValue }) => {
    try {
      const response = await safeApi.post<Item>('/items/', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur création item');
    }
  }
);

export const updateItem = createAsyncThunk(
  'items/update',
  async ({ id, data }: { id: number; data: Partial<Item> }, { rejectWithValue }) => {
    try {
      const response = await safeApi.patch<Item>(`/items/${id}/`, data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur mise à jour');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'items/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/items/${id}/`);
      return id;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur suppression');
    }
  }
);

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    resetItemStatus: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => { state.isLoading = true; })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.success = true;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.success = true;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export const { resetItemStatus } = itemSlice.actions;
export default itemSlice.reducer;