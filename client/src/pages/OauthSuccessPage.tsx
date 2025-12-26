import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/auth/authSlice";
import { tokenManager } from "../utils/tokenManager";
import { useGetUserQuery } from "../redux/user/userApi";
import { getSafeRedirect } from "../utils/redirect";
import LoadingSpinner from "../components/LoadingSpinner";

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const hasRun = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const [shouldFetchUser, setShouldFetchUser] = useState(false);

    // Use RTK Query to fetch user data
    const { data: userData, error: userError, isSuccess, isError } = useGetUserQuery(undefined, {
        skip: !shouldFetchUser, // Only fetch when we're ready
    });

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const accessToken = searchParams.get("accessToken");

        if (!accessToken) {
            console.error("No access token received");
            navigate("/signin?error=no_token");
            return;
        }

        // 1. Store access token in memory
        tokenManager.setAccessToken(accessToken);

        // 2. Get redirect URL from state parameter if provided
        const redirectTo = searchParams.get("state") || null;
        if (redirectTo) {
            sessionStorage.setItem('oauth_redirect', redirectTo);
        }

        // 3. Clear URL parameters so token isn't visible in history
        window.history.replaceState({}, document.title, "/oauth/success");

        // 4. Trigger user data fetch via RTK Query
        setShouldFetchUser(true);
    }, [navigate, searchParams]);

    // Handle user data fetch results
    useEffect(() => {
        if (isSuccess && userData) {
            // Update Redux state with user data
            dispatch(setUser(userData));

            // Get safe redirect URL from sessionStorage or default to home
            const savedRedirect = sessionStorage.getItem('oauth_redirect');
            const redirectTo = getSafeRedirect(savedRedirect);
            sessionStorage.removeItem('oauth_redirect');

            // Redirect to intended destination
            navigate(redirectTo);
        }

        if (isError) {
            console.error("Failed to fetch user data:", userError);
            setError("Authentication failed. Please try again.");

            // Clear token and redirect to signin after 2 seconds
            tokenManager.clearAccessToken();
            setTimeout(() => {
                navigate("/signin");
            }, 2000);
        }
    }, [isSuccess, isError, userData, userError, dispatch, navigate]);

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="text-red-500 text-xl mb-4">{error}</div>
                <p className="text-gray-600">Redirecting to sign in...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen gap-4">
            <LoadingSpinner />
            <h2 className="text-xl text-gray-700">Completing sign in with Google...</h2>
        </div>
    );
};

export default OAuthSuccess;