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

export interface AttendanceReport {
  id: number;
  title: string;
  report_type: 'WEEKLY' | 'MONTHLY' | 'CUSTOM'; // Added CUSTOM
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

// Payload for the new endpoint
export interface GenerateReportPayload {
  start_date: string;
  end_date: string;
}

// Response from the new endpoint
export interface GenerateReportResponse {
    message: string;
    file_url: string;
}

interface AttendanceState {
  items: Attendance[];
  reports: AttendanceReport[];
  isLoading: boolean;
  isReportsLoading: boolean;
  isGeneratingReport: boolean; // <--- New state for the generation button
  success: boolean;
  error: any | null;
}

const initialState: AttendanceState = {
  items: [],
  reports: [],
  isLoading: false,
  isReportsLoading: false,
  isGeneratingReport: false,
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

// 2. FETCH REPORTS
export const fetchAttendanceReports = createAsyncThunk(
  'attendances/fetchReports',
  async (type: 'ALL' | 'WEEKLY' | 'MONTHLY' = 'ALL', { rejectWithValue }) => {
    try {
      let url = '/attendance-reports/';
      if (type === 'WEEKLY') url = '/attendance-reports/weekly/';
      else if (type === 'MONTHLY') url = '/attendance-reports/monthly/';

      const response = await safeApi.get<AttendanceReport[]>(url);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Erreur de chargement des rapports');
    }
  }
);

// 3. GENERATE NEW REPORT (New Endpoint Logic)
export const generateAttendanceReport = createAsyncThunk(
    'attendances/generateReport',
    async (data: GenerateReportPayload, { rejectWithValue }) => {
      try {
        // CALL THE NEW ENDPOINT
        const response = await safeApi.post<GenerateReportResponse>('/attendance-reports/generate/', data);
        
        // Return data
        return response.data;
      } catch (err) {
        const error = err as AxiosError<any>;
        return rejectWithValue(error.response?.data?.detail || 'Erreur lors de la génération du rapport');
      }
    }
  );

// 4. MARK/UPDATE ATTENDANCE
export const markAttendance = createAsyncThunk(
  'attendances/mark',
  async ({ id, data }: { id?: number; data: AttendancePayload }, { rejectWithValue }) => {
    try {
      if (id) {
        const response = await safeApi.patch<Attendance>(`/attendances/${id}/`, data);
        return response.data;
      } else {
        const response = await safeApi.post<Attendance>('/attendances/', data);
        return response.data;
      }
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data || 'Erreur de sauvegarde');
    }
  }
);

// 5. DELETE ATTENDANCE
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
      // ... existing reducers ...
      .addCase(fetchAttendances.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Reports List
      .addCase(fetchAttendanceReports.pending, (state) => { state.isReportsLoading = true; })
      .addCase(fetchAttendanceReports.fulfilled, (state, action) => {
        state.isReportsLoading = false;
        state.reports = action.payload;
      })
      .addCase(fetchAttendanceReports.rejected, (state, action) => {
        state.isReportsLoading = false;
        state.error = action.payload;
      })

      // --- GENERATE REPORT HANDLERS ---
      .addCase(generateAttendanceReport.pending, (state) => {
        state.isGeneratingReport = true;
        state.error = null;
      })
      .addCase(generateAttendanceReport.fulfilled, (state) => {
        state.isGeneratingReport = false;
        // Note: The new file URL is in action.payload.file_url if you need to use it directly
      })
      .addCase(generateAttendanceReport.rejected, (state, action) => {
        state.isGeneratingReport = false;
        state.error = action.payload;
      })

      // Mark Attendance
      .addCase(markAttendance.pending, (state) => { state.isLoading = true; })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        else state.items.push(action.payload);
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export default attendanceSlice.reducer;