import {User, Mail, Calendar, Settings, Users, X, UserPlus, LogOut} from 'lucide-react';
import Navbar from '../components/Navbar';
import {useState} from "react";
import EditUserProfileModel from "../components/EditUserProfileModel.tsx";
import {useGetUserQuery} from "../redux/user/userApi.ts";
import {Link, useNavigate} from "react-router-dom";
import {useGetMyFriendsQuery} from "../redux/friend/friendApi.ts";
import { ProfileHeaderSkeleton } from '../components/skeletons';
import { useLogoutMutation } from '../redux/auth/authApi';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../redux/auth/authSlice';
import Notifications from '../components/Notifications';

export default function ProfilePage() {
    const {data: user, isLoading, isError} = useGetUserQuery();
    const [showModal, setShowModal] = useState(false);
    const [showFriendsModal, setShowFriendsModal] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

    // Fetch friends list only when modal is open
    const { data: friendList, isLoading: isFriendListLoading } = useGetMyFriendsQuery(undefined, {
        skip: !showFriendsModal
    });

    const handleLogout = async () => {
        try {
            await logout({}).unwrap();
            dispatch(logoutAction());
            navigate('/signin');
        } catch (error) {
            console.error('Logout error:', error);
            dispatch(logoutAction());
            navigate('/signin');
        }
    };

    if(isError) return ("Error occurred");

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {isLoading ? (
                        <>
                            <ProfileHeaderSkeleton />
                            <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Mobile Top Bar - Only visible on mobile */}
                            <div className="md:hidden bg-white border-b border-gray-200 p-3 mb-0">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-lg font-semibold text-gray-900">{user?.username}</h1>
                                    <div className="flex items-center gap-1">
                                        <Notifications />
                                        <Link to={'/settings'} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Settings className="h-5 w-5 text-gray-700" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Header - Instagram Style */}
                            <div className="bg-white md:rounded-lg md:border md:border-gray-200 p-4 md:p-8 mb-4 md:mb-6">
                                {/* Mobile Layout */}
                                <div className="md:hidden">
                                    {/* Top Section: Avatar, Stats, and Buttons in Row */}
                                    <div className="flex items-start gap-4 mb-4">
                                        {/* Profile Picture */}
                                        {user?.avatar ? (
                                            <img src={user?.avatar} alt="Profile" className="rounded-full w-20 h-20 border border-gray-200" />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm border border-gray-200">
                                                {user?.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}

                                        {/* Stats and Username */}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                                                {user?.username}
                                            </h2>

                                            {/* Friends Count */}
                                            <button
                                                onClick={() => setShowFriendsModal(true)}
                                                className="text-sm hover:opacity-80 transition-opacity"
                                            >
                                                <span className="font-semibold text-gray-900">{user?.friendCount || 0}</span>
                                                <span className="text-gray-600 ml-1">friends</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Name and Bio */}
                                    <div className="mb-4">
                                        <p className="font-semibold text-gray-900 text-sm mb-1">
                                            {user?.name || 'Name not set'}
                                        </p>
                                        {user?.bio && (
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                                {user.bio}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold text-sm rounded-lg transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                        <Link
                                            to="/find"
                                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold text-sm rounded-lg transition-colors"
                                        >
                                            <UserPlus className="h-3.5 w-3.5" />
                                            Find Friends
                                        </Link>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden md:flex items-start gap-8 mb-6">
                                    {/* Profile Picture */}
                                    <div className="shrink-0">
                                        {user?.avatar ? (
                                            <img src={user?.avatar} alt="Profile" className="rounded-full w-32 h-32 sm:w-40 sm:h-40" />
                                        ) : (
                                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
                                                {user?.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
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
                                            <Notifications />
                                            <Link to={'/settings'} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Settings className="h-5 w-5 text-gray-700" />
                                            </Link>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-10 mb-4">
                                            <button
                                                onClick={() => setShowFriendsModal(true)}
                                                className="text-center sm:text-left hover:opacity-80 transition-opacity"
                                            >
                                                <span className="font-semibold text-gray-900">{user?.friendCount || 0}</span>
                                                <span className="text-gray-600 ml-1 cursor-pointer">friends</span>
                                            </button>
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

                            {/* Mobile Logout Button - Only visible on mobile */}
                            <div className="md:hidden bg-white p-3 mb-4">
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </div>

                            {/* Additional Info Card */}
                            <div className="bg-white md:rounded-lg md:border md:border-gray-200 p-4 md:p-6">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Account Information</h2>
                                <div className="space-y-3 md:space-y-4">
                                    <div className="flex items-center gap-3 md:gap-4 pb-3 md:pb-4 border-b border-gray-100">
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <User className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500 mb-0.5">Name</p>
                                            <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                                                {user?.name || 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-4 pb-3 md:pb-4 border-b border-gray-100">
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <Mail className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                            <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                                                {user?.email || 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500 mb-0.5">Member Since</p>
                                            <p className="text-sm md:text-base font-medium text-gray-900">
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

            {/* Friends Modal */}
            {showFriendsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFriendsModal(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-900" />
                                <h2 className="text-xl font-semibold text-gray-900">Friends</h2>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {friendList?.length || 0}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowFriendsModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
                            {isFriendListLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="flex flex-col items-center p-4 rounded-lg border border-gray-100 animate-pulse">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mb-3"></div>
                                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : friendList && friendList.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {friendList.map((friend) => (
                                        <Link
                                            key={friend.id}
                                            to={`/users/${friend.username}`}
                                            onClick={() => setShowFriendsModal(false)}
                                            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                        >
                                            {friend.avatar ? (
                                                <img
                                                    src={friend.avatar}
                                                    alt={friend.name}
                                                    className="w-20 h-20 rounded-full mb-3"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                                                    {friend.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                                                {friend.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate w-full text-center">
                                                @{friend.username}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No friends yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
