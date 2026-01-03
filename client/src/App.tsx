import './App.css'
import './styles/custom.css'
import { lazy, Suspense } from 'react';
import {Routes, Route} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import GuestRoute from "./components/GuestRoute.tsx";
import LoadingSpinner from "./components/LoadingSpinner.tsx";
import { useTokenRefreshOnLoad } from "./hooks/useTokenRefreshOnLoad.ts";
import {useDetectCountry} from "./hooks/useDetectCountry.ts";
import BottomNav from "./components/BottomNav.tsx";
import ToastListener from "./components/Toast/ToastListener.tsx";

// Lazy load all page components for code splitting
const SigninPage = lazy(() => import("./pages/SigninPage.tsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage.tsx"));
const MyListPage = lazy(() => import("./pages/MyListPage.tsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.tsx"));
const FindUsers = lazy(() => import("./pages/FindUsers.tsx"));
const UserPage = lazy(() => import("./pages/userPage.tsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const ChangeEmail = lazy(() => import("./components/ChangeEmail.tsx"));
const OauthSuccessPage = lazy(() => import("./pages/OauthSuccessPage.tsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.tsx"));

// Loading fallback component for lazy loaded routes
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
    <LoadingSpinner size="large" message="Loading..." />
  </div>
);

function App() {
  // Automatically refresh access token on page load/reload
  const isRefreshingToken = useTokenRefreshOnLoad();
  useDetectCountry();

  // Show loading state while attempting to refresh token on page load
  if (isRefreshingToken) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <LoadingSpinner size="large" message="Loading.." />
      </div>
    );
  }

  return (
      <>
      <Suspense fallback={<PageLoader />}>

          <main>
                <Routes>
                    <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/discover" element={<DiscoverPage />} />

                    <Route path="/my-list" element={<ProtectedRoute authorized={<MyListPage />} />} />
                    <Route path="/profile" element={<ProtectedRoute authorized={<ProfilePage />} />} />
                    <Route path="/settings" element={<ProtectedRoute authorized={<SettingsPage />} />} />
                    <Route path="/forget-password" element={<ForgetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/change/email" element={<ProtectedRoute authorized={<ChangeEmail />} />} />
                    <Route path="/oauth/success" element={<OauthSuccessPage />} />

                    <Route path="/find" element={<FindUsers />} />
                    <Route path="/users/:username" element={<UserPage />} />

                    <Route path="/signin" element={<GuestRoute><SigninPage /></GuestRoute>} />
                    <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
          </main>
      </Suspense>

          {/* Bottom Navigation - Mobile Only */}
          <BottomNav />

          {/* Global Toast Listener - Redux Connected */}
          <ToastListener />
      </>
  )
}

export default App;


// import './App.css'
// import './styles/custom.css'
// import SigninPage from "./pages/SigninPage.tsx";
// import SignupPage from "./pages/SignupPage.tsx";
// import {Routes, Route} from "react-router-dom";
// import Home from "./pages/Home.tsx";
// import DiscoverPage from "./pages/DiscoverPage.tsx";
// import MyListPage from "./pages/MyListPage.tsx";
// import ProfilePage from "./pages/ProfilePage.tsx";
// import SettingsPage from "./pages/SettingsPage.tsx";
// import ProtectedRoute from "./components/ProtectedRoute.tsx";
// import GuestRoute from "./components/GuestRoute.tsx";
// import LoadingSpinner from "./components/LoadingSpinner.tsx";
// import { useTokenRefreshOnLoad } from "./hooks/useTokenRefreshOnLoad.ts";
// import FindUsers from "./pages/FindUsers.tsx";
// import UserPage from "./pages/userPage.tsx";
// import NotFoundPage from "./pages/NotFoundPage.tsx";
// import ForgetPassword from "./pages/ForgetPassword.tsx";
// import ResetPassword from "./pages/ResetPassword.tsx";
// import ChangeEmail from "./components/ChangeEmail.tsx";
// import OauthSuccessPage from "./pages/OauthSuccessPage.tsx";
// import {useDetectCountry} from "./hooks/useDetectCountry.ts";
// import BottomNav from "./components/BottomNav.tsx";
// import LandingPage from "./pages/LandingPage.tsx";
// import ToastListener from "./components/Toast/ToastListener.tsx";
//
// function App() {
//     // Automatically refresh access token on page load/reload
//     const isRefreshingToken = useTokenRefreshOnLoad();
//     useDetectCountry();
//
//     // Show loading state while attempting to refresh token on page load
//     if (isRefreshingToken) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-slate-900">
//                 <LoadingSpinner size="large" message="Loading.." />
//             </div>
//         );
//     }
//
//     return (
//         <>
//             <main>
//                 <Routes>
//                     <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
//                     <Route path="/home" element={<Home />} />
//                     <Route path="/discover" element={<DiscoverPage />} />
//
//                     <Route path="/my-list" element={<ProtectedRoute authorized={<MyListPage />} />} />
//                     <Route path="/profile" element={<ProtectedRoute authorized={<ProfilePage />} />} />
//                     <Route path="/settings" element={<ProtectedRoute authorized={<SettingsPage />} />} />
//                     <Route path="/forget-password" element={<ForgetPassword />} />
//                     <Route path="/reset-password" element={<ResetPassword />} />
//                     <Route path="/change/email" element={<ProtectedRoute authorized={<ChangeEmail />} />} />
//                     <Route path="/oauth/success" element={<OauthSuccessPage />} />
//
//                     <Route path="/find" element={<FindUsers />} />
//                     <Route path="/users/:username" element={<UserPage />} />
//
//                     <Route path="/signin" element={<GuestRoute><SigninPage /></GuestRoute>} />
//                     <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
//
//                     <Route path="*" element={<NotFoundPage />} />
//                 </Routes>
//             </main>
//
//             {/* Bottom Navigation - Mobile Only */}
//             <BottomNav />
//
//             {/* Global Toast Listener - Redux Connected */}
//             <ToastListener />
//         </>
//     )
// }
//
// export default App
