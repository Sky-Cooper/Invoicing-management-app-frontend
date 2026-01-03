import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { publicApi } from '../../api/client';
import { type UserRole, setCredentials } from '../slices/authSlice';
import { logout } from '../slices/userSlice';
import { useAppDispatch } from './hooks';


export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gestion des redirections selon le rôle de l'utilisateur
  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case 'SUPER_ADMIN': return '/super-admin/dashboard';
      case 'COMPANY_ADMIN': return '/admin/dashboard';
      case 'INVOICING_ADMIN': return '/billing/dashboard';
      case 'HR_ADMIN': return '/hr/dashboard';
      case 'EMPLOYEE': return '/app/home';
      default: return '/dashboard';
    }
  };

  const loginUser = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await publicApi.post('/token/', data);
      
      // 1. Extraction du Refresh Token ici (ajouté 'refresh')
      const { access, refresh, ...userData } = response.data;

      // 2. Mise à jour de Redux avec les DEUX tokens
      dispatch(setCredentials({ 
        accessToken: access, 
        user: userData 
      }));

      // Redirection vers le dashboard approprié
      navigate(getRedirectPath(userData.role));
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      setError(axiosError.response?.data?.detail || 'Échec de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * CETTE FONCTION TERMINE RÉELLEMENT LA SESSION
   * Elle vide Redux, le LocalStorage et force le rechargement du navigateur.
   */
  const logoutUser = () => {
    // 1. Nettoyer le store Redux
    dispatch(logout());

    // 2. Vider tout le cache physique par sécurité
    localStorage.clear();

    // 3. Supprimer les cookies de session éventuels
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 4. Force un "Hard Refresh". C'est crucial car cela vide la mémoire vive (RAM)
    // de l'application et empêche tout retour en arrière.
    window.location.href = '/login';
  };

  const registerCompany = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await publicApi.post('/register/company-owner', data);
      navigate('/login'); 
    } catch (err) {
      setError('Échec de l\'enregistrement de l\'entreprise.');
    } finally {
      setIsLoading(false);
    }
  };

  return { loginUser, logoutUser, registerCompany, isLoading, error };
};