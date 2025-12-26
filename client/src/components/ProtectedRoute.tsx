import React from 'react';
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store.ts";
import LandingPage from "../pages/LandingPage.tsx";

interface ProtectedRouteProps {
    authorized: React.ReactNode;
    unauthorized?: React.ReactElement;
}

export default function ProtectedRoute({ authorized, unauthorized }: ProtectedRouteProps) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    // Check if auth is disabled (development mode)
    const env = import.meta.env.VITE_AUTH_ENABLED;
    if (env === 'false') {
        return <>{authorized}</>;
    }

    if (isAuthenticated) {
        // Authorized: Render the protected content
        return <>{authorized}</>;
    } else {
        // Unauthorized: Render fallback or default to LandingPage
        return unauthorized || <LandingPage />;
    }
}