import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { safeApi } from '../../api/client'; 

/**
 * IMPORTANT : Si tu as besoin d'utiliser RootState dans ce fichier (pour des sélecteurs par exemple),
 * utilise TOUJOURS "import type" pour éviter l'erreur :
 * "Cannot access 'profileReducer' before initialization"
 */
import type { RootState } from '../../store/store'; 

// --- 1. Interface du Profil Utilisateur ---
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  role_display: string;
  preferred_language: string;
  profile_image: string | null;
  department: string | null;
  company: string; // UUID de l'entreprise
  company_name: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

// --- 2. Interface de l'état (State) ---
interface ProfileState {
  data: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateSuccess: boolean; 
}

const initialState: ProfileState = {
  data: null,
  isLoading: false,
  error: null,
  updateSuccess: false,
};

// --- 3. Async Thunks ---

// GET : Récupérer le profil
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await safeApi.get<UserProfile>('/profile');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.detail || 'Échec de la récupération du profil');
    }
  }
);

// PATCH : Mettre à jour les champs (email, téléphone, etc.)
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (userData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await safeApi.patch<UserProfile>('/profile', userData);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      const errorData = error.response?.data;
      
      if (typeof errorData === 'object' && errorData !== null) {
          const firstKey = Object.keys(errorData)[0];
          const msg = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
          return rejectWithValue(`${firstKey}: ${msg}`);
      }
      return rejectWithValue('Échec de la mise à jour du profil');
    }
  }
);

// --- 4. Le Slice ---
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearProfile: (state) => {
        state.data = null;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      });
  },
});

export const { resetUpdateSuccess, clearProfile } = profileSlice.actions;

// --- 5. Sélecteurs (Optionnel mais recommandé) ---
export const selectProfile = (state: RootState) => state.profile.data;
export const selectCompanyId = (state: RootState) => state.profile.data?.company;

export default profileSlice.reducer;