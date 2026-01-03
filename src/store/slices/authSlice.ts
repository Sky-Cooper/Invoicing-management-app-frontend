import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Définition des rôles pour FatouraLik
export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'COMPANY_ADMIN' 
  | 'INVOICING_ADMIN' 
  | 'HR_ADMIN' 
  | 'EMPLOYEE';

interface UserInfo {
  chantier: any;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  preferred_language: string;
  company_name?: string; 
  company?: string | number;   // Correspond à l'ID UUID de ton endpoint /profile/
  company_id?: string | number; // Fallback pour d'autres endpoints
}

interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
}

// Récupération sécurisée des données persistantes
const storedUser = localStorage.getItem('user_data');
const storedToken = localStorage.getItem('access_token');

const initialState: AuthState = {
  accessToken: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Action appelée lors d'une connexion réussie
     */
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user: UserInfo }>) => {
      const { accessToken, user } = action.payload;
      state.accessToken = accessToken;
      state.user = user;
      state.isAuthenticated = true;

      // 1. Persistance des données de base
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_data', JSON.stringify(user));
      localStorage.setItem('user_role', user.role); 
      
      // 2. EXTRACTION ET PERSISTANCE DES INFOS ENTREPRISE
      // On vérifie 'company' (clé de ton API Profile) ou 'company_id'
      const cid = user.company || user.company_id;
      
      if (cid) {
        localStorage.setItem('company_id', cid.toString());
      }
      
      if (user.company_name) {
        localStorage.setItem('company_name', user.company_name);
      }
    },

    /**
     * Action utilisée par l'intercepteur Axios pour rafraîchir le jeton
     */
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      localStorage.setItem('access_token', action.payload);
    },

    /**
     * Déconnexion totale
     */
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Nettoyage radical : vide TOUT le cache (tokens, company_id, company_name, etc.)
      localStorage.clear();
    },
  },
});

// Exportation des actions
export const { setCredentials, updateAccessToken, logout } = authSlice.actions;

export default authSlice.reducer;