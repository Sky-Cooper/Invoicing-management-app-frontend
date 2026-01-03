import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { updateAccessToken, logout } from '../store/slices/authSlice';
import { publicApi } from '../api/client';
import { useAppSelector, useAppDispatch } from '../store/hooks/hooks';

export const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const token = useAppSelector((state) => state.auth.accessToken);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        // Try to get a new access token using the HttpOnly cookie
        const { data } = await publicApi.post('/token/refresh/');
        dispatch(updateAccessToken(data.access));
      } catch (error) {
        // If fails, user is truly logged out
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };

    // Only run if we don't have a token (e.g., on page refresh)
    if (!token) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }
  }, [token, dispatch]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <Outlet />;
};