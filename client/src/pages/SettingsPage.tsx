// filepath: /Users/ashish/Developer/Trackd/client/src/pages/SettingsPage.tsx
import { Bell, Lock, Eye, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function SettingsPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

                        <div className="space-y-6">
                            {/* Notifications */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Bell className="h-6 w-6 text-gray-700" />
                                    <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-gray-700">Email notifications</span>
                                        <input type="checkbox" className="toggle" />
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-gray-700">New releases from tracked shows</span>
                                        <input type="checkbox" className="toggle" />
                                    </label>
                                </div>
                            </div>

                            {/* Privacy */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Eye className="h-6 w-6 text-gray-700" />
                                    <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-gray-700">Make my list public</span>
                                        <input type="checkbox" className="toggle" />
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-gray-700">Show viewing activity</span>
                                        <input type="checkbox" className="toggle" />
                                    </label>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="h-6 w-6 text-gray-700" />
                                    <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                                </div>
                                <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    Change Password
                                </button>
                            </div>

                            {/* Preferences */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Globe className="h-6 w-6 text-gray-700" />
                                    <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 mb-2">Language</label>
                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Default view</label>
                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                            <option>Grid</option>
                                            <option>List</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                ⚙️ Settings
                            </h3>
                            <p className="text-blue-800">
                                These settings are placeholder UI. Functionality will be implemented in future updates to allow customization of your experience.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
//
// // filepath: /Users/ashish/Developer/Trackd/client/src/pages/ProfilePage.tsx
// import { User, Mail, Calendar } from 'lucide-react';
// import Navbar from '../components/Navbar';
// import { useSelector } from 'react-redux';
// import { RootState } from '../redux/store';
//
// export default function ProfilePage() {
//     const user = useSelector((state: RootState) => state.auth.user);
//
//     return (
//         <>
//             <Navbar />
//             <main className="min-h-screen bg-gray-50">
//                 <div className="container mx-auto px-4 py-8">
//                     <div className="max-w-4xl mx-auto">
//                         <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>
//
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
//                             {/* Profile Header */}
//                             <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
//                                 <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
//                                     {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
//                                 </div>
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-gray-900 mb-1">
//                                         {user?.name || 'User'}
//                                     </h2>
//                                     <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
//                                 </div>
//                             </div>
//
//                             {/* Profile Information */}
//                             <div className="space-y-6">
//                                 <div className="flex items-center gap-4">
//                                     <User className="h-5 w-5 text-gray-400" />
//                                     <div>
//                                         <p className="text-sm text-gray-600">Name</p>
//                                         <p className="font-medium text-gray-900">{user?.name || 'Not set'}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center gap-4">
//                                     <Mail className="h-5 w-5 text-gray-400" />
//                                     <div>
//                                         <p className="text-sm text-gray-600">Email</p>
//                                         <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center gap-4">
//                                     <Calendar className="h-5 w-5 text-gray-400" />
//                                     <div>
//                                         <p className="text-sm text-gray-600">Member Since</p>
//                                         <p className="font-medium text-gray-900">
//                                             {user?.createdAt
//                                                 ? new Date(user.createdAt).toLocaleDateString('en-US', {
//                                                     year: 'numeric',
//                                                     month: 'long',
//                                                     day: 'numeric'
//                                                 })
//                                                 : 'Unknown'
//                                             }
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//
//                             {/* Edit Button */}
//                             <div className="mt-8 pt-8 border-t border-gray-200">
//                                 <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
//                                     Edit Profile
//                                 </button>
//                             </div>
//                         </div>
//
//                         {/* Info Box */}
//                         <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
//                             <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                                 👤 Profile Management
//                             </h3>
//                             <p className="text-blue-800">
//                                 Profile editing functionality will be implemented soon. You'll be able to update your name, email, and other preferences.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </main>
//         </>
//     );
// }
//
