import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { safeApi } from '../../api/client';

// --- TYPES & INTERFACES ---

export interface InvoiceItem {
  id?: number;              // Row ID (for updating existing lines)
  item_id?: number | null;  // CATALOG ID (e.g., 3 or 4). Null if custom.
  item_code?: string | null;
  item_name: string;
  item_description?: string | null;
  unit: string;
  quantity: string | number;
  unit_price: string | number;
  subtotal?: string;
  tax_rate: string | number;
}

export interface Invoice {
  remaining_balance: any;
  id: number;
  invoice_items: InvoiceItem[]; // Frontend state usually keeps this name
  client_name: string;
  invoice_number: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  Subject: string | null; 
  subtotal: string;
  discount_percentage: string;
  discount_amount: string;
  total_ht: string;
  tax_rate: string;
  tax_amount: string;
  total_ttc: string;
  amount_in_words: string | null;
  issued_date: string;
  due_date: string;
  payment_method: string | null;
  payment_date: string | null;
  payment_reference: string | null;
  project_description: string;
  contract_number: string;
  created_at: string;
  updated_at: string;
  client: number; 
  chantier: number;
  created_by: number;
  download_url: string;
}

// Helper Type for Input
export interface InvoicePayload extends Partial<Omit<Invoice, 'invoice_items'>> {
    // Backend expects 'items', frontend might have 'invoice_items'. We allow both here.
    items?: InvoiceItem[];
    invoice_items?: InvoiceItem[];
}

interface InvoiceState {
  invoices: Invoice[];
  isLoading: boolean;
  error: any;
}

const initialState: InvoiceState = {
  invoices: [],
  isLoading: false,
  error: null,
};

// --- HELPER: DATA SANITIZATION ---
const sanitizeInvoiceData = (data: InvoicePayload) => {
    // 1. Grab items from either key (prioritize invoice_items if both exist)
    const sourceItems = data.invoice_items || data.items || [];

    return {
        ...data,
        // Ensure top-level numbers are correct
        discount_percentage: Number(data.discount_percentage || 0),
        tax_rate: Number(data.tax_rate || 0),
        client: Number(data.client),
        chantier: Number(data.chantier),

        // 2. RENAME to "items" for the Backend
        items: sourceItems.map((item) => {
            const cleanItem: any = {
                item_name: item.item_name,
                unit: item.unit,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                tax_rate: Number(item.tax_rate || 0),
                item_description: item.item_description || "",
            };

            // LOGIC: Existing Row ID (for updates)
            if (item.id && typeof item.id === 'number') {
                cleanItem.id = item.id;
            }

            // LOGIC: Catalog Item vs Hardcoded
            // If it has a catalog ID (item_id), send it. 
            // If NOT, do not send the key at all (so backend sees it as new/custom).
            if (item.item_id) {
                cleanItem.item_id = Number(item.item_id);
            } 
            
            return cleanItem;
        }),

        // 3. Remove the old frontend key to avoid confusion
        invoice_items: undefined 
    };
};

// --- ACTIONS ASYNCHRONES (THUNKS) ---

// 1. Fetch All
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get('/invoices');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur lors du chargement");
    }
  }
);

// 2. Create Invoice (POST)
export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (invoiceData: InvoicePayload, { rejectWithValue }) => {
    try {
      // FIX: Sanitize and rename 'invoice_items' -> 'items'
      const sanitizedData = sanitizeInvoiceData(invoiceData);
      
      console.log("Payload sending to backend:", sanitizedData); // Debug log

      const response = await safeApi.post('/invoices', sanitizedData);
      return response.data;
    } catch (err: any) {
      console.error("Create Invoice Error:", err.response?.data);
      return rejectWithValue(err.response?.data || "Erreur lors de la création");
    }
  }
);

// 3. Update Invoice (PATCH)
export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, data }: { id: number; data: InvoicePayload }, { rejectWithValue }) => {
    try {
      // FIX: Sanitize and rename 'invoice_items' -> 'items'
      const sanitizedData = sanitizeInvoiceData(data);

      const response = await safeApi.patch(`/invoices/${id}/`, sanitizedData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur lors de la mise à jour");
    }
  }
);

// 4. Delete Invoice
export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/invoices/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Erreur lors de la suppression");
    }
  }
);

// --- SLICE ---

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload); 
        state.error = null;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Invoice
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        state.invoices = state.invoices.map((inv) =>
          inv.id === action.payload.id ? action.payload : inv
        );
        state.error = null;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteInvoice.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.invoices = state.invoices.filter((inv) => inv.id !== action.payload);
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInvoiceError } = invoiceSlice.actions;
export default invoiceSlice.reducer;