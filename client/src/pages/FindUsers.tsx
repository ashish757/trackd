import Navbar from "../components/Navbar.tsx";
import {Search} from "lucide-react";
import {useEffect, useState} from "react";
import {useLazySearchUsersQuery} from "../redux/user/userApi.ts";
import {Link} from "react-router-dom";
import { useDebounce } from '../hooks/useDebounce';
import { SEARCH_CONFIG } from '../constants/search';
import MutualFriendsCount from '../components/MutualFriendsCount.tsx';
// import { UserCardSkeleton } from '../components/skeletons';

const FindUsers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [triggerSearch, {isLoading, isFetching, data}] = useLazySearchUsersQuery();

    // Custom hook for debouncing
    const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_CONFIG.DEBOUNCE_DELAY);

    // Trigger API search when debounced query changes
    useEffect(() => {
        if (debouncedSearchQuery) {
            triggerSearch(debouncedSearchQuery).unwrap();
        }
    }, [debouncedSearchQuery, triggerSearch]);


    const users = data || [];
    const isSearching = isLoading || isFetching;
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">

                    {/* Hero Section with Search */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                Discover People
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Or find people you already know
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 text-lg border-1 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors shadow-xm"
                                        autoComplete="off"
                                    />

                                </div>
                        </div>


                        {/*search results*/}
                        <div className="flex flex-wrap gap-8 mt-10">
                            {isSearching ? (
                                <div className="w-full">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <div key={index} className="flex gap-3 border-1 border-gray-200 p-4 rounded-sm animate-pulse">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                                :  users.length > 0 ? users.map(user => (
                                    <Link to={"/users/" + user.username} key={user.id}>
                                        <div className="flex gap-3 border-1 border-gray-300 p-4 rounded-sm hover:shadow-sm">
                                            <div>
                                                {
                                                    user.avatar ? (
                                                        <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">{user.name[0].toUpperCase()}</span>
                                                    )
                                                }

                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 text-md">{user.username}</p>
                                                <p className="text-gray-500 text-sm leading-3">{user.name}</p>
                                                {/* Show mutual friends count if any */}
                                                <MutualFriendsCount targetUserId={user.id} className="mt-1" />
                                            </div>
                                        </div>
                                    </Link>

                            )) : searchQuery.length > 0 &&  (
                                <p className="text-sm text-gray-900">No users found.</p>
                                )
                            }
                        </div>

                    </div>
                </div>

            </main>

        </>
    );
};

export default FindUsers;