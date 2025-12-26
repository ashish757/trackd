import React from 'react';
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../redux/store.ts";


interface GuestRouteProps {
    children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    // Check if auth is disabled (development mode)
    const env = import.meta.env.VITE_AUTH_ENABLED;
    if (env === 'false') {
        return <>{children}</>;
    }

    // If already authenticated, redirect to home
    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    // Not authenticated - allow access to guest-only page
    return <>{children}</>;
}

