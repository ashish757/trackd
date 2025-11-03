import { User, Mail, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
interface UserType {
    name?: string;
    email?: string;
    createdAt?: string;
}
export default function ProfilePage() {
    const user = useSelector((state: RootState) => state.auth.user) as UserType;
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {user?.name || 'User'}
                                    </h2>
                                    <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                                </div>
                            </div>
                            {/* Profile Information */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium text-gray-900">{user?.name || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Member Since</p>
                                        <p className="font-medium text-gray-900">
                                            {user?.createdAt 
                                                ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })
                                                : 'Unknown'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Edit Button */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                        {/* Info Box */}
                        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                👤 Profile Management
                            </h3>
                            <p className="text-blue-800">
                                Profile editing functionality will be implemented soon. You'll be able to update your name, email, and other preferences.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
