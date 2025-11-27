import {Calendar, User} from "lucide-react";
import {useGetUserByIdQuery} from "../redux/user/userApi.ts";
import {useParams} from "react-router-dom";
import Navbar from "../components/Navbar.tsx";

const UserPage = () => {
    const { username } = useParams();


    const {data: user, isLoading, isError, error} = useGetUserByIdQuery(username as string, { skip: !username });


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
                                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
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
                                        {/* Edit Button */}

                                        <div className="flex gap-3 mt-8 pt-8 border-t border-gray-200">
                                            <button className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-violet-800 transition-colors">
                                                Follow
                                            </button>
                                            <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                                View Lists
                                            </button>
                                        </div>
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