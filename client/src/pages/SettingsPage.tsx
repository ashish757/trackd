import {Lock, Eye, Globe, Bell} from 'lucide-react';
import Navbar from '../components/Navbar';
import ChangePassword from "../components/ChangePassword.tsx";
import {useGetUserQuery} from "../redux/user/userApi.ts";
import RequestChangeEmail from "../components/RequestChangeEmail.tsx";
import {useState, useEffect} from "react";

export default function SettingsPage() {
    const {data: user} = useGetUserQuery();
    const [accountV, setAccountV] = useState<string>();
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);

    // Check notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const handleRequestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('Your browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            return; // Already granted
        }

        setIsRequestingPermission(true);
        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                // Show a test notification with enhanced options
                new Notification('Trackd', {
                    body: 'Notifications enabled! You will now receive real-time updates.',
                    icon: '/logo.svg',
                    badge: '/logo.svg', // Small badge in notification tray
                    tag: 'test-notification',
                    requireInteraction: false,
                    silent: false,
                });
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        } finally {
            setIsRequestingPermission(false);
        }
    };

    const getNotificationStatus = () => {
        if (!('Notification' in window)) {
            return { text: 'Not supported', color: 'text-gray-500' };
        }

        switch (notificationPermission) {
            case 'granted':
                return { text: 'Enabled', color: 'text-green-600' };
            case 'denied':
                return { text: 'Blocked', color: 'text-red-600' };
            default:
                return { text: 'Not enabled', color: 'text-yellow-600' };
        }
    };


    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-20 md:pb-8">
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
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-gray-700 font-medium">Browser Notifications</h3>
                                            <p className="text-sm text-gray-500">
                                                Get real-time notifications for friend requests and updates
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-medium ${getNotificationStatus().color}`}>
                                                {getNotificationStatus().text}
                                            </span>
                                        </div>
                                    </div>

                                    {notificationPermission !== 'granted' && (
                                        <button
                                            onClick={handleRequestNotificationPermission}
                                            disabled={isRequestingPermission || notificationPermission === 'denied'}
                                            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isRequestingPermission
                                                ? 'Requesting...'
                                                : notificationPermission === 'denied'
                                                    ? 'Blocked (Enable in browser settings)'
                                                    : 'Enable Notifications'}
                                        </button>
                                    )}

                                    {notificationPermission === 'granted' && (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Notifications are enabled
                                        </div>
                                    )}

                                    {notificationPermission === 'denied' && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-sm text-red-700">
                                                Notifications are blocked. To enable them:
                                            </p>
                                            <ol className="mt-2 ml-4 text-sm text-red-600 list-decimal space-y-1">
                                                <li>Click the lock icon in your browser's address bar</li>
                                                <li>Find "Notifications" in the permissions list</li>
                                                <li>Change the setting to "Allow"</li>
                                                <li>Refresh this page</li>
                                            </ol>
                                        </div>
                                    )}
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
                                        <select value={accountV} onChange={(e) => setAccountV(e.target.value)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                            <option value={"private"}>Private</option>
                                            <option value={"friendsOnly"}>Friends Only</option>
                                            <option value={"public"}>Public</option>
                                        </select>
                                    </label>

                                    {/*<label className="flex items-center justify-between cursor-pointer">*/}
                                    {/*    <span className="text-gray-700">Show viewing activity</span>*/}
                                    {/*    <input type="checkbox" className="toggle"/>*/}
                                    {/*</label>*/}
                                </div>
                            </div>

                            {/* Security */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="h-6 w-6 text-gray-700"/>
                                    <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                                </div>

                                <h2 className="text-2xl my-6 ">Change Email</h2>
                                <RequestChangeEmail oldEmail={user?.email} />

                                <h2 className="text-2xl my-6 ">Change Password</h2>
                                {user?.passwordChangedAt &&  <h3 className="text-sm text-gray-500"> Password was last changed on {user?.passwordChangedAt}</h3>}
                                <ChangePassword />

                            </div>

                            {/* Preferences */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                    <Globe className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
                                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">Preferences</h2>
                                </div>
                                <div className="space-y-3 md:space-y-4">
                                    <div>
                                        <label className="block text-sm md:text-base text-gray-700 mb-2">Language</label>
                                        <select className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm md:text-base text-gray-700 mb-2">Default view</label>
                                        <select className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                            <option>Grid</option>
                                            <option>List</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}