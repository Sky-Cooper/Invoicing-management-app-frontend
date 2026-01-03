import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { safeApi } from '../../api/client';

export interface Payment {
  id?: number;
  invoice: number;
  amount: string;
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD';
  payment_date: string;
  reference: string;
  notes: string;
}

export const addPayment = createAsyncThunk(
  'payments/add',
  async (paymentData: Payment, { rejectWithValue }) => {
    try {
      const response = await safeApi.post('payments/', paymentData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

// --- NOUVELLE ACTION: UPDATE ---
export const updatePayment = createAsyncThunk(
  'payments/update',
  async ({ id, data }: { id: number; data: Payment }, { rejectWithValue }) => {
    try {
      const response = await safeApi.patch(`payments/${id}/`, data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur lors de la modification");
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { 
    isLoading: false, 
    success: false,
    error: null as any 
  },
  reducers: { 
    resetPaymentStatus: (state) => { 
      state.success = false; 
      state.error = null;
    } 
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(addPayment.pending, (state) => { state.isLoading = true; })
      .addCase(addPayment.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updatePayment.pending, (state) => { state.isLoading = true; })
      .addCase(updatePayment.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { resetPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;