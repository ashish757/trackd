import React from 'react';
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../redux/store.ts";

interface ProtectedRouteProps {
    authorized: React.ReactNode;
    unauthorized?: React.ReactElement;
    loadingFallback?: React.ReactNode;
}

export default function ProtectedRoute({ authorized, unauthorized, loadingFallback }: ProtectedRouteProps) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);
    const location = useLocation();

    // Check if auth is disabled (development mode)
    const env = import.meta.env.VITE_AUTH_ENABLED;
    if (env === 'false') {
        return <>{authorized}</>;
    }

    // While checking auth status, show loading fallback
    if (!isInitialized) {
        return <>{loadingFallback || authorized}</>;
    }

    if (isAuthenticated) {
        // Authorized: Render the protected content
        return <>{authorized}</>;
    } else {
        // Unauthorized: If custom fallback provided, use it
        // Otherwise, redirect to signin with current path as redirect parameter
        if (unauthorized) {
            return unauthorized;
        }

        // Encode the current path to use as redirect parameter
        const redirectPath = `${location.pathname}${location.search}`;
        return <Navigate to={`/signin?redirect=${encodeURIComponent(redirectPath)}`} replace />;
    }
}