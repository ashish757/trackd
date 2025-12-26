import './App.css'
import './styles/custom.css'
import SigninPage from "./pages/SigninPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import {Routes, Route} from "react-router-dom";
import Home from "./pages/Home.tsx";
import DiscoverPage from "./pages/DiscoverPage.tsx";
import MyListPage from "./pages/MyListPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import LoadingSpinner from "./components/LoadingSpinner.tsx";
import { useTokenRefreshOnLoad } from "./hooks/useTokenRefreshOnLoad.ts";
import FindUsers from "./pages/FindUsers.tsx";
import UserPage from "./pages/userPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import ForgetPassword from "./pages/ForgetPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ChangeEmail from "./components/ChangeEmail.tsx";
import OauthSuccessPage from "./pages/OauthSuccessPage.tsx";
import {useDetectCountry} from "./hooks/useDetectCountry.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import BottomNav from "./components/BottomNav.tsx";

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
          <main>
              <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/discover" element={<DiscoverPage />} />

                  <Route path="/my-list" element={<ProtectedRoute authorized={<MyListPage />} />} />
                  <Route path="/profile" element={<ProtectedRoute authorized={<ProfilePage />} />} />
                  <Route path="/settings" element={<ProtectedRoute authorized={<SettingsPage />} />} />
                  <Route path="/forget-password" element={<ProtectedRoute authorized={<ForgetPassword />} />} />
                  <Route path="/reset-password" element={<ProtectedRoute authorized={<ResetPassword />} />}/>
                  <Route path="/change/email" element={<ProtectedRoute authorized={<ChangeEmail />} />} />
                  <Route path="/oauth/success" element={<ProtectedRoute authorized={<OauthSuccessPage />} />} />

                  <Route path="/find" element={<FindUsers />} />
                  <Route path="/users/:username" element={<UserPage />} />

                  <Route path="/signin" element={<SigninPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  <Route path="*" element={<NotFoundPage />} />
              </Routes>
          </main>

          {/* Bottom Navigation - Mobile Only */}
          <BottomNav />
      </>

  )
}

export default App
