import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { safeApi } from '../../api/client';
import { AxiosError } from 'axios';

// --- Types ---

export type POStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface PurchaseOrderItem {
    id?: number;           
    item_code?: string | null;
    item_id?: number;      
    item_name: string;
    item_description: string;
    unit: string;
    quantity: number | string;
    unit_price: number | string;
    subtotal: number | string;
    tax_rate: number | string;
}

export interface CreatePOPayload {
    po_number: string;
    client: number;
    chantier: number;
    issued_date: string;
    expected_delivery_date: string;
    project_description: string;
    items: PurchaseOrderItem[];
    status?: POStatus;
    discount_percentage?: string;
    tax_rate?: string;
}

export type UpdatePOPayload = Partial<CreatePOPayload>;

export interface PurchaseOrder {
    id: number;
    po_number: string;
    client: number;
    client_name: string;
    chantier: number;
    created_by: number;
    status: POStatus;
    subtotal: string;
    discount_percentage: string | null;
    discount_amount: string | null;
    total_ht: string;
    tax_rate: string;
    tax_amount: string;
    total_ttc: string;
    amount_in_words: string;
    issued_date: string;
    expected_delivery_date: string;
    project_description: string;
    items: PurchaseOrderItem[];
    download_url: string | null;
    created_at: string;
    updated_at: string;
}

interface PurchaseOrderState {
    items: PurchaseOrder[];
    currentPO: PurchaseOrder | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: PurchaseOrderState = {
    items: [],
    currentPO: null,
    isLoading: false,
    error: null,
    successMessage: null,
};

// --- Async Thunks ---

export const fetchPurchaseOrders = createAsyncThunk<PurchaseOrder[]>(
    'purchaseOrders/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await safeApi.get('/po/');
            return response.data;
        } catch (err) {
            const error = err as AxiosError<any>;
            return rejectWithValue(error.response?.data || 'Failed to fetch purchase orders');
        }
    }
);

export const createPurchaseOrder = createAsyncThunk<PurchaseOrder, CreatePOPayload>(
    'purchaseOrders/create',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await safeApi.post('/po/', payload);
            return response.data;
        } catch (err) {
            const error = err as AxiosError<any>;
            return rejectWithValue(error.response?.data || 'Failed to create purchase order');
        }
    }
);

export const updatePurchaseOrder = createAsyncThunk<PurchaseOrder, { id: number; data: UpdatePOPayload }>(
    'purchaseOrders/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await safeApi.patch(`/po/${id}/`, data);
            return response.data;
        } catch (err) {
            const error = err as AxiosError<any>;
            return rejectWithValue(error.response?.data || 'Failed to update purchase order');
        }
    }
);

export const deletePurchaseOrder = createAsyncThunk<number, number>(
    'purchaseOrders/delete',
    async (id, { rejectWithValue }) => {
        try {
            await safeApi.delete(`/po/${id}/`);
            return id;
        } catch (err) {
            const error = err as AxiosError<any>;
            return rejectWithValue(error.response?.data || 'Failed to delete purchase order');
        }
    }
);

const purchaseOrderSlice = createSlice({
    name: 'purchaseOrders',
    initialState,
    reducers: {
        clearPOMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        resetCurrentPO: (state) => {
            state.currentPO = null;
        },
        setCurrentPOById: (state, action: PayloadAction<number>) => {
             state.currentPO = state.items.find(po => po.id === action.payload) || null;
        }
    },
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchPurchaseOrders.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchPurchaseOrders.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
            .addCase(fetchPurchaseOrders.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Create
        builder
            .addCase(createPurchaseOrder.pending, (state) => { state.isLoading = true; state.error = null; state.successMessage = null; })
            .addCase(createPurchaseOrder.fulfilled, (state, action) => { state.isLoading = false; state.successMessage = "Bon de commande créé avec succès !"; state.items.unshift(action.payload); })
            .addCase(createPurchaseOrder.rejected, (state, action) => { state.isLoading = false; state.error = typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload); });

        // Update
        builder
            .addCase(updatePurchaseOrder.pending, (state) => { state.isLoading = true; state.error = null; state.successMessage = null; })
            .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = "Bon de commande mis à jour !";
                
                // --- FIX: Force a new array reference so React detects the change ---
                state.items = state.items.map(po => 
                    po.id === action.payload.id ? action.payload : po
                );
                
                if (state.currentPO?.id === action.payload.id) {
                    state.currentPO = action.payload;
                }
            })
            .addCase(updatePurchaseOrder.rejected, (state, action) => { state.isLoading = false; state.error = typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload); });

        // Delete
        builder
            .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
                state.items = state.items.filter(po => po.id !== action.payload);
                if (state.currentPO?.id === action.payload) state.currentPO = null;
            });
    },
});

export const { clearPOMessages, resetCurrentPO, setCurrentPOById } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;