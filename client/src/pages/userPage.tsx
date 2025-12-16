import {Calendar, UserCheck, UserPlus, UserMinus, X, Users, Film} from "lucide-react";
import {
    useFollowUserMutation,
    useGetUserByIdQuery,
    useUnfollowUserMutation,
    useCancelFollowRequestMutation,
    useAcceptFollowRequestMutation,
    useRejectFollowRequestMutation,
    useGetUserFriendListQuery,
    useGetUserMovieStatsQuery
} from "../redux/user/userApi.ts";
import {useParams, Link} from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import {useSelector} from "react-redux";
import type {RootState} from "../redux/store.ts";
import {useGetMovieByIdQuery} from "../redux/movie/movieApi.ts";
import {useState} from "react";

const UserPage = () => {
    const { username } = useParams();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [selectedTab, setSelectedTab] = useState<'watched' | 'planned'>('watched');
    const [showFriendsModal, setShowFriendsModal] = useState(false);

    const {data: user, isLoading, isError, error} = useGetUserByIdQuery(username as string, { skip: !username });
    const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
    const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation();
    const [cancelFollowRequest, { isLoading: isCancelLoading }] = useCancelFollowRequestMutation();
    const [acceptFollowRequest, { isLoading: isAcceptLoading }] = useAcceptFollowRequestMutation();
    const [rejectFollowRequest, { isLoading: isRejectLoading }] = useRejectFollowRequestMutation();

    // Only fetch friend list and movie stats if the user is a friend
    const isFriend = user?.relationshipStatus === 'FOLLOWING';
    const { data: friendList, isLoading: isFriendListLoading } = useGetUserFriendListQuery(user?.id || '', {
        skip: !user?.id || !isFriend || !showFriendsModal
    });
    const { data: movieStats, isLoading: isMovieStatsLoading } = useGetUserMovieStatsQuery(user?.id || '', {
        skip: !user?.id || !isFriend
    });

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
                                    <div className="shrink-0">
                                        {
                                            user?.avatar ? (
                                                <img src={user?.avatar} alt="Profile" className="rounded-full w-32 h-32 sm:w-40 sm:h-40" />
                                            ) : (
                                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
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
                                            {isFriend && (
                                                <button
                                                    onClick={() => setShowFriendsModal(true)}
                                                    className="text-center sm:text-left hover:opacity-80 transition-opacity"
                                                >
                                                    <span className="font-semibold text-gray-900">{user?.friendCount || 0}</span>
                                                    <span className="text-gray-600 ml-1 cursor-pointer">friends</span>
                                                </button>
                                            )}
                                            {!isFriend && (
                                                <div className="text-center sm:text-left">
                                                    <span className="font-semibold text-gray-900">{user?.friendCount || 0}</span>
                                                    <span className="text-gray-600 ml-1">friends</span>
                                                </div>
                                            )}
                                        </div>

                                        {
                                            <p>Mutual</p>

                                        }

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
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
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

                            {/* Friends Modal */}
                            {showFriendsModal && isFriend && (
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
                                                <div className="flex justify-center py-12">
                                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
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
                                                                <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
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
                                                    <p className="text-gray-500">No friends to show</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Movie Stats - Only visible if user is a friend */}
                            {isFriend && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Film className="h-5 w-5 text-gray-900" />
                                        <h2 className="text-lg font-semibold text-gray-900">Movie List</h2>
                                    </div>

                                    {isMovieStatsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                        </div>
                                    ) : movieStats ? (
                                        <>
                                            {/* Stats Summary */}
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                                                    <p className="text-2xl font-bold text-green-700">{movieStats.stats.watched}</p>
                                                    <p className="text-xs text-green-600 font-medium">Watched</p>
                                                </div>
                                                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                                                    <p className="text-2xl font-bold text-blue-700">{movieStats.stats.planned}</p>
                                                    <p className="text-xs text-blue-600 font-medium">Planned</p>
                                                </div>
                                                <div className="bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                                                    <p className="text-2xl font-bold text-purple-700">{movieStats.stats.total}</p>
                                                    <p className="text-xs text-purple-600 font-medium">Total</p>
                                                </div>
                                            </div>

                                            {/* Tab Navigation */}
                                            <div className="flex border-b border-gray-200 mb-4">
                                                <button
                                                    onClick={() => setSelectedTab('watched')}
                                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                                        selectedTab === 'watched'
                                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                                            : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                                >
                                                    Watched ({movieStats.stats.watched})
                                                </button>
                                                <button
                                                    onClick={() => setSelectedTab('planned')}
                                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                                        selectedTab === 'planned'
                                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                                            : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                                >
                                                    Plan to Watch ({movieStats.stats.planned})
                                                </button>
                                            </div>

                                            {/* Movie Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {selectedTab === 'watched' ? (
                                                    movieStats.watchedMovies.length > 0 ? (
                                                        movieStats.watchedMovies.map((entry) => (
                                                            <MoviePoster key={entry.id} movieId={entry.movie_id} />
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full text-center py-8 text-gray-500">
                                                            No watched movies yet
                                                        </div>
                                                    )
                                                ) : (
                                                    movieStats.plannedMovies.length > 0 ? (
                                                        movieStats.plannedMovies.map((entry) => (
                                                            <MoviePoster key={entry.id} movieId={entry.movie_id} />
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full text-center py-8 text-gray-500">
                                                            No planned movies yet
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No movie data available</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    );
};

// Helper component to fetch and display movie poster
const MoviePoster = ({ movieId }: { movieId: number }) => {
    const { data: movie, isLoading } = useGetMovieByIdQuery(movieId);

    if (isLoading) {
        return (
            <div className="aspect-2/3 bg-gray-200 rounded-lg animate-pulse"></div>
        );
    }

    if (!movie) {
        return (
            <div className="aspect-2/3 bg-gray-300 rounded-lg flex items-center justify-center">
                <Film className="h-8 w-8 text-gray-500" />
            </div>
        );
    }

    return (
        <div className="group cursor-pointer">
            <div className="aspect-2/3 bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                {movie.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <Film className="h-12 w-12 text-gray-500" />
                    </div>
                )}
            </div>
            <p className="mt-2 text-xs text-gray-700 font-medium truncate" title={movie.title}>
                {movie.title}
            </p>
        </div>
    );
};

export default UserPage;
