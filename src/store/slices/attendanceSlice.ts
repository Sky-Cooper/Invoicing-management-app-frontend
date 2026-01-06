import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client';

// --- TYPES ---
export interface Attendance {
  id: number;
  date: string;
  present: boolean;
  hours_worked: string;
  employee: number | { id: number; user: { first_name: string; last_name: string } };
  chantier: number | { id: number; name: string };
}

// New Interface for Reports
export interface AttendanceReport {
  id: number;
  title: string;
  report_type: 'WEEKLY' | 'MONTHLY';
  start_date: string;
  end_date: string;
  file: string;
  file_url: string;
  created_at: string;
}

export interface AttendancePayload {
  date: string;
  present: boolean;
  hours_worked?: string;
  employee: number;
  chantier: number;
}

interface AttendanceState {
  items: Attendance[];
  reports: AttendanceReport[]; // <--- Added reports array
  isLoading: boolean;
  isReportsLoading: boolean;   // <--- Specific loading state for reports
  success: boolean;
  error: any | null;
}

const initialState: AttendanceState = {
  items: [],
  reports: [],
  isLoading: false,
  isReportsLoading: false,
  success: false,
  error: null,
};

// --- THUNKS ---

// 1. FETCH ATTENDANCE RECORDS (Grid)
export const fetchAttendances = createAsyncThunk(
  'attendances/fetchAll',
  async (dateFilter: string, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<Attendance[]>(`/attendances/?date=${dateFilter}`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement');
    }
  }
);

// 2. FETCH REPORTS (New Implementation)
// Pass 'ALL', 'WEEKLY', or 'MONTHLY' to target specific endpoints
export const fetchAttendanceReports = createAsyncThunk(
  'attendances/fetchReports',
  async (type: 'ALL' | 'WEEKLY' | 'MONTHLY' = 'ALL', { rejectWithValue }) => {
    try {
      let url = '/attendance-reports/';
      
      if (type === 'WEEKLY') {
        url = '/attendance-reports/weekly/';
      } else if (type === 'MONTHLY') {
        url = '/attendance-reports/monthly/';
      }

      const response = await safeApi.get<AttendanceReport[]>(url);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement des rapports');
    }
  }
);

// 3. MARK/UPDATE ATTENDANCE
export const markAttendance = createAsyncThunk(
  'attendances/mark',
  async ({ id, data }: { id?: number; data: AttendancePayload }, { rejectWithValue }) => {
    try {
      if (id) {
        // UPDATE existing attendance
        const response = await safeApi.patch<Attendance>(`/attendances/${id}/`, data);
        return response.data;
      } else {
        // CREATE new attendance
        const response = await safeApi.post<Attendance>('/attendances/', data);
        return response.data;
      }
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Attendance Error:", error.response?.data);
      return rejectWithValue(error.response?.data || 'Erreur de sauvegarde');
    }
  }
);

// 4. DELETE ATTENDANCE
export const deleteAttendance = createAsyncThunk(
  'attendances/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await safeApi.delete(`/attendances/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue('Erreur de suppression');
    }
  }
);

// --- SLICE ---
const attendanceSlice = createSlice({
  name: 'attendances',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch Records ---
      .addCase(fetchAttendances.pending, (state) => { 
        state.isLoading = true; 
        state.error = null; 
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- Fetch Reports (New) ---
      .addCase(fetchAttendanceReports.pending, (state) => {
        state.isReportsLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceReports.fulfilled, (state, action) => {
        state.isReportsLoading = false;
        state.reports = action.payload;
      })
      .addCase(fetchAttendanceReports.rejected, (state, action) => {
        state.isReportsLoading = false;
        state.error = action.payload;
      })

      // --- Mark (Create/Update) ---
      .addCase(markAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        
        const index = state.items.findIndex(i => i.id === action.payload.id);
        
        if (index !== -1) {
          state.items = state.items.map(item => 
            item.id === action.payload.id ? action.payload : item
          );
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        alert("Erreur lors du pointage.");
      })

      // --- Delete ---
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export default attendanceSlice.reducer;