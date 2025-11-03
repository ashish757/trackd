// src/components/ProtectedRoute.tsx
import React from 'react';
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store.ts";
import LandingPage from "../pages/LandingPage.tsx"; // The default unauthorized fallback

// Define the props, including the optional 'fallback' element
interface ProtectedRouteProps {
    authorized: React.ReactNode;
    // 🚀 The new optional prop for a custom unauthorized component 🚀
    unauthorized?: React.ReactElement;
}



export default function ProtectedRoute({ authorized, unauthorized }: ProtectedRouteProps) {

    // 1. Authorization Check
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    // 2. Decide which component to render upon unauthorized access
    let FallbackComponent: React.ReactElement;

    const env = import.meta.env.VITE_AUTH_ENABLED;
    if (env === 'false') {
        return <>{authorized}</>;
    }

    if (isAuthenticated) {
        // A. Authorized: Render the protected content (children)
        return <>{authorized}</>;
    } else {
        // B. Unauthorized:
        // If an optional unauthorizedComponent is passed, use it.
        if (unauthorized) {
            FallbackComponent = unauthorized;
        } else {
            // Otherwise, fall back to the default LandingPage component.
            FallbackComponent = <LandingPage />;
        }

        return FallbackComponent;
    }
}