import {Calendar, UserCheck, UserPlus, UserMinus, X} from "lucide-react";
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
            await followUser({ id, username }).unwrap();
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
                className: 'px-6 py-1.5 bg-gray-300 text-gray-700 font-medium text-sm rounded-lg cursor-not-allowed',
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
                    className: 'px-6 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-sm rounded-lg transition-colors flex items-center gap-2',
                    action: () => handleUnfollowUser(user?.id),
                    showSecondaryButton: false
                };
            case 'REQUEST_SENT':
                return {
                    text: 'Requested',
                    icon: <UserCheck className="h-4 w-4" />,
                    disabled: false,
                    className: 'px-6 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-sm rounded-lg transition-colors flex items-center gap-2',
                    action: () => handleCancelRequest(user?.id),
                    showSecondaryButton: false
                };
            case 'REQUEST_RECEIVED':
                return {
                    text: 'Accept',
                    icon: <UserCheck className="h-4 w-4" />,
                    disabled: false,
                    className: 'px-6 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2',
                    action: () => handleAcceptRequest(user?.id),
                    showSecondaryButton: true,
                    secondaryButton: {
                        text: 'Reject',
                        icon: <X className="h-4 w-4" />,
                        className: 'px-6 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-sm rounded-lg transition-colors flex items-center gap-2',
                        action: () => handleRejectRequest(user?.id)
                    }
                };
            case 'NONE':
            default:
                return {
                    text: 'Follow',
                    icon: <UserPlus className="h-4 w-4" />,
                    disabled: false,
                    className: 'px-6 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2',
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
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                                <p className="text-gray-500">Loading profile...</p>
                            </div>
                        </div>
                    ) : isError ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                                    <X className="h-12 w-12 text-red-600" />
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
                        </div>
                    ) : (
                        <>
                            {/* Profile Header - Instagram Style */}
                            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
                                <div className="flex items-start gap-8 mb-6">
                                    {/* Profile Picture */}
                                    <div className="flex-shrink-0">
                                        {
                                            user?.avatar ? (
                                                <img src={user?.avatar} alt="Profile" className="rounded-full " />
                                            ) : (
                                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
                                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )
                                        }
                                    </div>

                                    {/* Profile Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-4 mb-4 flex-wrap">
                                            <h1 className="text-2xl font-light text-gray-900">
                                                {user?.username || 'username'}
                                            </h1>
                                            {!isCurrentUser && (
                                                <>
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
                                                </>
                                            )}
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
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                                <div className="space-y-4">
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
        </>
    );
};

export default UserPage;
