import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks/hooks';

const PublicOnlyRoute = () => {
  // Check if we have a token in memory
  const token = useAppSelector((state) => state.auth.accessToken);

  // If we have a token, user is already logged in. 
  // Redirect them to dashboard immediately.
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no token, allow them to see the Login/Register page
  return <Outlet />;
};

export default PublicOnlyRoute;