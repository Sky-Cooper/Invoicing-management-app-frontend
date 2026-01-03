import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { safeApi } from '../../api/client';

// --- TYPES ---

export interface DashboardBasic {
  summary: {
    total_revenue: number;
    total_collected: number;
    outstanding_balance: number;
    total_expenses: number;
    net_profit: number;
    invoice_count: number;
  };
  revenue_trend: { month: string; amount: number }[];
  expense_by_category: { category: string; total_amount: number }[];
  project_performance: { chantier_name: string; revenue: number; expenses: number; margin: number }[];
}

export interface DashboardExecutive {
  kpis: DashboardBasic['summary'];
  cash_flow: { revenue_trend: any[]; aging_report: any[] };
  market_share: {
    top_clients: { company: string; total_spent: number | null }[];
    expense_distribution: { category: string; total_amount: number }[];
  };
  project_health: DashboardBasic['project_performance'];
  tax_compliance: { tva_collected: number; tva_deductible: number; tva_to_pay: number; period: string };
}

export interface DashboardAdvanced {
  cash_flow_health: {
    aging_report: { current: number; "1_30_days": number; "31_60_days": number; "60_plus_days": number };
    dso_days: { dso: number };
  };
  workforce_productivity: {
    labor_metrics: { full_name: string; total_hours: number; total_presences: number }[];
    project_efficiency: { chantier_name: string; revenue_per_hour: number }[];
  };
  tax_planning: { collected_tva: number; estimated_recoverable_tva: number; net_tva_payable: number };
}

interface AnalyticsState {
  basic: DashboardBasic | null;
  executive: DashboardExecutive | null;
  advanced: DashboardAdvanced | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  basic: null,
  executive: null,
  advanced: null,
  isLoading: false,
  error: null,
};

// --- ASYNC ACTIONS ---

export const fetchBasicDashboard = createAsyncThunk('analytics/fetchBasic', async (_, { rejectWithValue }) => {
  try {
    const response = await safeApi.get('/dashboard/data');
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Error fetching summary dashboard");
  }
});

export const fetchExecutiveDashboard = createAsyncThunk('analytics/fetchExecutive', async (_, { rejectWithValue }) => {
  try {
    const response = await safeApi.get('/dashboard/executive');
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Error fetching executive dashboard");
  }
});

export const fetchAdvancedDashboard = createAsyncThunk('analytics/fetchAdvanced', async (_, { rejectWithValue }) => {
  try {
    const response = await safeApi.get('/dashboard/advanced');
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Error fetching advanced dashboard");
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // BASIC
      .addCase(fetchBasicDashboard.pending, (state) => { state.isLoading = true; })
      .addCase(fetchBasicDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.basic = action.payload;
      })
      // EXECUTIVE
      .addCase(fetchExecutiveDashboard.fulfilled, (state, action) => {
        state.executive = action.payload;
      })
      // ADVANCED
      .addCase(fetchAdvancedDashboard.fulfilled, (state, action) => {
        state.advanced = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export default analyticsSlice.reducer;