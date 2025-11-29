import {Calendar, User, UserCheck, UserPlus, UserMinus, X} from "lucide-react";
import {
    useFollowUserMutation,
    useGetUserByIdQuery,
    useUnfollowUserMutation,
    useCancelFollowRequestMutation,
    useAcceptFollowRequestMutation,
    useRejectFollowRequestMutation
} from "../redux/user/userApi.ts";
import {useParams} from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import {useSelector} from "react-redux";
import type {RootState} from "../redux/store.ts";

const UserPage = () => {
    const { username } = useParams();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const {data: user, isLoading, isError, error} = useGetUserByIdQuery(username as string, { skip: !username });
    const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
    const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation();
    const [cancelFollowRequest, { isLoading: isCancelLoading }] = useCancelFollowRequestMutation();
    const [acceptFollowRequest, { isLoading: isAcceptLoading }] = useAcceptFollowRequestMutation();
    const [rejectFollowRequest, { isLoading: isRejectLoading }] = useRejectFollowRequestMutation();

    const isAnyActionLoading = isFollowLoading || isUnfollowLoading || isCancelLoading || isAcceptLoading || isRejectLoading;

    const handleFollowUser = async (id: string | undefined) => {
        if (!id) return;
        try {
            console.log('Following user with id:', id, 'username:', username);
            await followUser({ id, username }).unwrap();
            console.log('Follow successful, cache should invalidate');
        } catch (error) {
            console.log('Follow error:', error);
        }
    }

    const handleUnfollowUser = async (userId: string | undefined) => {
        if (!userId) return;
        try {
            await unfollowUser({ userId, username }).unwrap();
        } catch (error) {
            console.log('Unfollow error:', error);
        }
    }

    const handleCancelRequest = async (receiverId: string | undefined) => {
        if (!receiverId) return;
        try {
            await cancelFollowRequest({ receiverId, username }).unwrap();
        } catch (error) {
            console.log('Cancel request error:', error);
        }
    }

    const handleAcceptRequest = async (requesterId: string | undefined) => {
        if (!requesterId) return;
        try {
            await acceptFollowRequest({ requesterId, username }).unwrap();
        } catch (error) {
            console.log('Accept request error:', error);
        }
    }

    const handleRejectRequest = async (requesterId: string | undefined) => {
        if (!requesterId) return;
        try {
            await rejectFollowRequest({ requesterId, username }).unwrap();
        } catch (error) {
            console.log('Reject request error:', error);
        }
    }

    const getFollowButtonContent = () => {
        const status = user?.relationshipStatus;

        if (isAnyActionLoading) {
            return {
                text: 'Loading...',
                icon: null,
                disabled: true,
                className: 'px-6 py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed',
                action: () => {},
                showSecondaryButton: false
            };
        }

        switch (status) {
            case 'FOLLOWING':
                return {
                    text: 'Unfollow',
                    icon: <UserMinus className="h-4 w-4" />,
                    disabled: false,
                    className: 'px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2',
                    action: () => handleUnfollowUser(user?.id),
                    showSecondaryButton: false
                };
            case 'REQUEST_SENT':
                return {
                    text: 'Cancel Request',
                    icon: <X className="h-4 w-4" />,
                    disabled: false,
                    className: 'px-6 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2',
                    action: () => handleCancelRequest(user?.id),
                    showSecondaryButton: false
                };
            case 'REQUEST_RECEIVED':
                return {
                    text: 'Accept Request',
                    icon: <UserCheck className="h-4 w-4" />,
                    disabled: false,
                    className: 'px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2',
                    action: () => handleAcceptRequest(user?.id),
                    showSecondaryButton: true,
                    secondaryButton: {
                        text: 'Reject',
                        icon: <X className="h-4 w-4" />,
                        className: 'px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2',
                        action: () => handleRejectRequest(user?.id)
                    }
                };
            case 'NONE':
            default:
                return {
                    text: 'Follow',
                    icon: <UserPlus className="h-4 w-4" />,
                    disabled: false,
                    className: 'px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-violet-800 transition-colors flex items-center gap-2',
                    action: () => handleFollowUser(user?.id),
                    showSecondaryButton: false
                };
        }
    };

    const followButtonContent = getFollowButtonContent();
    const isCurrentUser = currentUser?.id === user?.id;


    return (
        <>
            <Navbar/>
            <main className="min-h-screen bg-gray-50">

                <div className="container mx-auto px-4 py-8">

                    <div className="max-w-4xl mx-auto">

                        <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">

                            {isLoading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                        <p className="mt-4 text-gray-600">Loading user profile...</p>
                                    </div>
                                ) : isError ? (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                                            <User className="h-12 w-12 text-red-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
                                        <p className="text-gray-600 mb-6">
                                            {error && 'status' in error && error.status === 404
                                                ? `The user "${username}" does not exist.`
                                                : 'An error occurred while loading the user profile.'
                                            }
                                        </p>
                                        <a
                                            href="/"
                                            className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Go to Home
                                        </a>
                                    </div>
                                ) :
                                (
                                    <>
                                        {/*// Profile Header */}
                                        <div className="flex items-center justify-between mb-8 pr-10 pb-8 border-b border-gray-200">
                                            <div className="flex items-center gap-6">
                                                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                        {user?.name || 'User'}
                                                    </h2>
                                                    <div>
                                                        <p className="text-gray-600 inline">{user?.username || 'user@example.com'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <h1 className="text-xl">Friends {user?.friendCount}</h1>
                                            </div>

                                        </div>



                                        {/*// Profile Information */}
                                        <div className="space-y-6">
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
                                        {/* Action Buttons */}
                                        {!isCurrentUser && (
                                            <div className="flex gap-3 mt-8 pt-8 border-t border-gray-200">
                                                <button
                                                    onClick={followButtonContent.action}
                                                    className={followButtonContent.className}
                                                    disabled={followButtonContent.disabled}
                                                >
                                                    {followButtonContent.icon}
                                                    {followButtonContent.text}
                                                </button>
                                                {followButtonContent.showSecondaryButton && followButtonContent.secondaryButton && (
                                                    <button
                                                        onClick={followButtonContent.secondaryButton.action}
                                                        className={followButtonContent.secondaryButton.className}
                                                    >
                                                        {followButtonContent.secondaryButton.icon}
                                                        {followButtonContent.secondaryButton.text}
                                                    </button>
                                                )}
                                                <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                                    View Lists
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                        </div>

                    </div>

                </div>
            </main>
        </>
    );
};

export default UserPage;