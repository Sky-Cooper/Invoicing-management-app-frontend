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

export interface AttendancePayload {
  date: string;
  present: boolean;
  hours_worked?: string;
  employee: number;
  chantier: number;
}

interface AttendanceState {
  items: Attendance[];
  isLoading: boolean;
  success: boolean;
  error: any | null;
}

const initialState: AttendanceState = {
  items: [],
  isLoading: false,
  success: false,
  error: null,
};

// --- THUNKS ---

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
      // --- Fetch ---
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
          // FIX: Use map to force React to detect the change instantly
          state.items = state.items.map(item => 
            item.id === action.payload.id ? action.payload : item
          );
        } else {
          // If it's new, push is fine
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