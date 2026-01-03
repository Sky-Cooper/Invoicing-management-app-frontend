// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const ProtectedRoute = () => {
  // Select the authentication state from your authSlice
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // If not authenticated, redirect to Login page
  // We pass 'state={{ from: location }}' so we can redirect them back after they login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;