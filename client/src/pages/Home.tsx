// filepath: /Users/ashish/Developer/Trackd/client/src/pages/Home.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to discover page on initial load
        navigate('/discover');
    }, [navigate]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <p className="text-center text-gray-600">Redirecting to Discover...</p>
                </div>
            </main>
        </>
    );
}

