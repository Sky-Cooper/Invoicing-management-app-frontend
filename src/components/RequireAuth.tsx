import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const RequireAuth = () => {
    const token = useSelector((state: RootState) => state.auth.accessToken);
    const location = useLocation();

    // If there is no accessToken, redirect to login
    // We save the current location so we can send them back there after they login
    return (
        token 
            ? <Outlet /> 
            : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;