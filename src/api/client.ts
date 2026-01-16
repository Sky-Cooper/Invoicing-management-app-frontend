import axios from 'axios';

// --- TYPES POUR L'INJECTION ---
interface MinimalStore {
  getState: () => any;
  dispatch: (action: any) => any;
}

let store: MinimalStore;

export const injectStore = (_store: MinimalStore) => {
  store = _store;
};

// 1. EXPORT THE ROOT URL (For Images)
export const API_ROOT = 'https://api.tourtra.ma'; 

// 2. DEFINE API URL (For Requests)
const BASE_URL = `${API_ROOT}/api`;

export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const safeApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// --- INTERCEPTEUR DE REQUÊTE ---
safeApi.interceptors.request.use(
  (config) => {
    const token = store?.getState()?.auth?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTEUR DE RÉPONSE ---
safeApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {}, { withCredentials: true });
        const newAccessToken = response.data.access;
        store.dispatch({ type: 'auth/updateAccessToken', payload: newAccessToken });
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return safeApi(originalRequest);
      } catch (refreshError) {
        store.dispatch({ type: 'auth/logout' });
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);