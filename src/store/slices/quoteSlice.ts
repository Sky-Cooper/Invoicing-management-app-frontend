import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { safeApi } from '../../api/client'; 
import { AxiosError } from 'axios';

// --- Types ---

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuoteItem {
    id?: number;           
    item_code?: string | null;
    item?: number;        
    item_name: string;
    item_description: string;
    unit: string;
    quantity: string | number;
    unit_price: string | number;
    subtotal: string | number;
    tax_rate: string | number;
}

// Payload for creating a quote (Full object)
export interface CreateQuotePayload {
    quote_number: string;
    client: number;
    chantier: number;
    issued_date: string;
    valid_until: string;
    project_description: string;
    items: QuoteItem[];
    status?: QuoteStatus;
    discount_percentage?: string;
    tax_rate?: string;
}

// Payload for PATCH updating a quote (Partial object)
// Allows sending just { status: "SENT" }
export type UpdateQuotePayload = Partial<CreateQuotePayload>;

export interface Quote {
    chantier_name: string;
    id: number;
    quote_number: string;
    client: number;
    client_name: string;
    chantier: number;
    status: QuoteStatus;
    subtotal: string;
    discount_percentage: string | null;
    discount_amount: string | null;
    total_ht: string;
    tax_rate: string;
    tax_amount: string;
    total_ttc: string;
    amount_in_words: string;
    issued_date: string;
    valid_until: string;
    project_description: string;
    items: QuoteItem[];
    download_url: string | null;
    created_at: string;
    updated_at: string;
    created_by: number;
}

interface QuoteState {
    items: Quote[];
    currentQuote: Quote | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: QuoteState = {
    items: [],
    currentQuote: null,
    isLoading: false,
    error: null,
    successMessage: null,
};

// --- Async Thunks ---

export const fetchQuotes = createAsyncThunk<Quote[]>(
    'quotes/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await safeApi.get('/quotes/');
            return response.data;
        } catch (err) {
            const error = err as AxiosError<any>;
            return rejectWithValue(error.response?.data || 'Failed to fetch quotes');
        }
    }
);

export const createQuote = createAsyncThunk<Quote, CreateQuotePayload>(
    'quotes/create',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await safeApi.post('/quotes/', payload);
            return response.data;
        } catch (err) {
            const error = err as AxiosError<any>;
            return rejectWithValue(error.response?.data || 'Failed to create quote');
        }
    }
);

// UPDATED: Uses PATCH and Partial Payload
export const updateQuote = createAsyncThunk<Quote, { id: number; data: UpdateQuotePayload }>(
    'quotes/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            // Using PATCH allows updating specific fields (status, valid_until, etc.)
            const response = await safeApi.patch(`/quotes/${id}/`, data);
            return response.data;
        } catch (err) {
            const error = err as AxiosError<any>;
            return rejectWithValue(error.response?.data || 'Failed to update quote');
        }
    }
);

const quoteSlice = createSlice({
    name: 'quotes',
    initialState,
    reducers: {
        clearQuoteMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        resetCurrentQuote: (state) => {
            state.currentQuote = null;
        },
        setCurrentQuoteById: (state, action: PayloadAction<number>) => {
             state.currentQuote = state.items.find(q => q.id === action.payload) || null;
        }
    },
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchQuotes.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchQuotes.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
            .addCase(fetchQuotes.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

        // Create
        builder
            .addCase(createQuote.pending, (state) => { state.isLoading = true; state.error = null; state.successMessage = null; })
            .addCase(createQuote.fulfilled, (state, action) => { state.isLoading = false; state.successMessage = "Devis créé avec succès !"; state.items.unshift(action.payload); })
            .addCase(createQuote.rejected, (state, action) => { state.isLoading = false; state.error = typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload); });

        // Update
        builder
            .addCase(updateQuote.pending, (state) => { state.isLoading = true; state.error = null; state.successMessage = null; })
            .addCase(updateQuote.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = "Devis mis à jour avec succès !";
                const index = state.items.findIndex(q => q.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
                if (state.currentQuote?.id === action.payload.id) state.currentQuote = action.payload;
            })
            .addCase(updateQuote.rejected, (state, action) => { state.isLoading = false; state.error = typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload); });
    },
});

export const { clearQuoteMessages, resetCurrentQuote, setCurrentQuoteById } = quoteSlice.actions;
export default quoteSlice.reducer;