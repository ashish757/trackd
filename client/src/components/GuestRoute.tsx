import React from 'react';
import { useSelector } from "react-redux";
import { Navigate, useSearchParams } from "react-router-dom";
import type { RootState } from "../redux/store.ts";
import { getSafeRedirect } from "../utils/redirect.ts";


interface GuestRouteProps {
    children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [searchParams] = useSearchParams();

    // Check if auth is disabled (development mode)
    const env = import.meta.env.VITE_AUTH_ENABLED;
    if (env === 'false') {
        return <>{children}</>;
    }

    // If already authenticated, redirect to the redirect param or /home
    if (isAuthenticated) {
        const redirectTo = getSafeRedirect(searchParams.get('redirect'));
        return <Navigate to={redirectTo} replace />;
    }

    // Not authenticated - allow access to guest-only page
    return <>{children}</>;
}

