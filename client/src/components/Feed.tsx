import {LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EmptyState from './EmptyState';
import type { RootState } from '../redux/store';
import FriendRecommendations from "./FriendRecommendations.tsx";

export default function Feed() {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);


    // If user is not logged in, show login prompt
    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto">
                <EmptyState
                    icon={LogIn}
                    title="Login Required"
                    description="Please sign in to view your personalized feed and see what your friends are watching"
                    action={{
                        label: "Sign In",
                        onClick: () => navigate('/signin')
                    }}
                />
            </div>
        );
    }

    // Show "coming soon" message for authenticated users
    // This will be replaced with actual feed data once backend is implemented
    return (
        <div className="max-w-2xl">
            <FriendRecommendations />
        </div>
    );

}

