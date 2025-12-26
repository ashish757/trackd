import {Lock, Eye, Globe} from 'lucide-react';
import Navbar from '../components/Navbar';
import ChangePassword from "../components/ChangePassword.tsx";
import {useGetUserQuery} from "../redux/user/userApi.ts";
import RequestChangeEmail from "../components/RequestChangeEmail.tsx";
import {useState} from "react";

export default function SettingsPage() {
    const {data: user} = useGetUserQuery();
    const [accountV, setAccountV] = useState<string>();


    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

                        <div className="space-y-6">

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