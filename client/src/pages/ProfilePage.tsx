import {User, Mail, Calendar, Settings} from 'lucide-react';
import Navbar from '../components/Navbar';
import {useState} from "react";
import EditUserProfileModel from "../components/EditUserProfileModel.tsx";
import {useGetUserQuery} from "../redux/user/userApi.ts";
import {Link} from "react-router-dom";

export default function ProfilePage() {
    const {data: user, isLoading, isError} = useGetUserQuery();
    const [showModal, setShowModal] = useState(false);

    if(isError) return ("Error occurred");

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {/* Profile Header - Instagram Style */}
                            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
                                <div className="flex items-start gap-8 mb-6">
                                    {/* Profile Picture */}
                                    <div className="flex-shrink-0">
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    </div>

                                    {/* Profile Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-4 mb-4">
                                            <h1 className="text-2xl font-light text-gray-900">
                                                {user?.username || 'username'}
                                            </h1>
                                            <button
                                                onClick={() => setShowModal(true)}
                                                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-sm rounded-lg transition-colors"
                                            >
                                                Edit Profile
                                            </button>
                                            <Link to={'/settings'} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Settings className="h-5 w-5 text-gray-700" />
                                            </Link>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-10 mb-4">
                                            <div className="text-center sm:text-left">
                                                <span className="font-semibold text-gray-900">{user?.friendCount || 0}</span>
                                                <span className="text-gray-600 ml-1">friends</span>
                                            </div>
                                        </div>

                                        {/* Name and Bio */}
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">
                                                {user?.name || 'Name not set'}
                                            </p>
                                            {user?.bio && (
                                                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                                    {user.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <User className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500 mb-0.5">Name</p>
                                            <p className="font-medium text-gray-900 truncate">
                                                {user?.name || 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                            <p className="font-medium text-gray-900 truncate">
                                                {user?.email || 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Calendar className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500 mb-0.5">Member Since</p>
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
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Edit Profile Modal */}
            {showModal && (
                <EditUserProfileModel
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    user={{
                        name: user?.name,
                        username: user?.username,
                        bio: user?.bio
                    }}
                />
            )}
        </>
    );
}
