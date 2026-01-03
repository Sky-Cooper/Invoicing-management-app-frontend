import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { safeApi } from '../../api/client';

// --- TYPES ---

// 1. INPUT: Matches your React Component State (keeps 'image')
export interface ExpenseInput {
  chantier: number;
  title: string;
  category: string;
  amount: string; 
  description: string;
  expense_date: string;
  image?: File | null; 
}

// 2. OUTPUT: Matches Django Response (uses 'document')
export interface Expense {
  id: number;
  title: string;
  category: string;
  amount: string;
  description: string;
  expense_date: string;
  document: string | null; // ✅ CHANGED: Matches backend model field
  created_at: string;
  chantier: any;
}

interface ExpensesState {
  expenses: Expense[];
  isLoading: boolean;
  success: boolean;
  error: any;
}

// --- HELPER: Convert Object to FormData ---
const createFormData = (data: any) => {
  const formData = new FormData();
  
  console.log("--- BUILDING FORM DATA ---");

  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    // Skip undefined or null values
    if (value === undefined || value === null) return;

    // 1. Handle File: Map 'image' to 'document'
    if (key === 'image') {
      if (value instanceof File) {
        console.log("📸 Mapping 'image' to 'document' for Backend:", value.name);
        // ✅ CRITICAL FIX: We send it as 'document' because that is what your Django model expects
        formData.append('document', value); 
      }
    } 
    // 2. Handle Amount (Decimal format)
    else if (key === 'amount') {
      const cleanAmount = String(value).replace(',', '.');
      formData.append(key, cleanAmount);
    }
    // 3. Handle all other fields
    else {
      formData.append(key, String(value));
    }
  });
  
  return formData;
};

// --- ASYNC THUNKS ---

// GET: Fetch Expenses
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get('/expenses/');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

// POST: Add Expense
export const addExpense = createAsyncThunk(
  'expenses/add',
  async (expenseData: ExpenseInput, { rejectWithValue }) => {
    try {
      const formData = createFormData(expenseData);

      const response = await safeApi.post('/expenses/', formData, {
        headers: {
          'Content-Type': undefined as any // Let browser set boundary
        }
      });
      
      return response.data;
    } catch (err: any) {
      console.error("Add Expense Error:", err.response?.data);
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

// PUT: Update Expense
export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, data }: { id: number; data: ExpenseInput }, { rejectWithValue }) => {
    try {
      const formData = createFormData(data);
      
      const response = await safeApi.put(`/expenses/${id}/`, formData, {
        headers: {
          'Content-Type': undefined as any
        }
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

// PATCH: Partial Update
export const patchExpense = createAsyncThunk(
  'expenses/patch',
  async ({ id, data }: { id: number; data: Partial<ExpenseInput> }, { rejectWithValue }) => {
    try {
      const formData = createFormData(data);
      
      const response = await safeApi.patch(`/expenses/${id}/`, formData, {
        headers: {
          'Content-Type': undefined as any
        }
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

// DELETE: Remove Expense
export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/expenses/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur serveur");
    }
  }
);

// --- SLICE ---
const expenseSlice = createSlice({
  name: 'expenses',
  initialState: { 
    expenses: [], 
    isLoading: false, 
    success: false, 
    error: null 
  } as ExpensesState,
  reducers: { 
    resetExpenseStatus: (state) => { 
        state.success = false; 
        state.error = null; 
    } 
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchExpenses.pending, (state) => { state.isLoading = true; })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addExpense.pending, (state) => { state.isLoading = true; })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.expenses.unshift(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) state.expenses[index] = action.payload;
      })

      // Patch
      .addCase(patchExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) state.expenses[index] = action.payload;
      })

      // Delete
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e.id !== action.payload);
      });
  }
});

export const { resetExpenseStatus } = expenseSlice.actions;
export default expenseSlice.reducer;